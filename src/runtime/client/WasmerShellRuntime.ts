/**
 * WasmerShellRuntime - Production Implementation of ShellRuntime Port
 * Specified in Sections 15 & 16 of FULL_ARCHITECTURE.md and Issue #9 (Phase 3)
 */

import type {
  ShellRuntime,
  RuntimeStatus,
  RuntimeExecutionOptions,
  ExecutionResult,
  OpenTerminalOptions,
} from '../ports/ShellRuntime';
import type {
  RuntimeWorkerEvent,
  RuntimeInitialization,
} from '../worker/worker-messages';

export interface WasmerShellRuntimeOptions {
  readonly shellPackage?: string;
  readonly packages?: readonly string[];
  readonly workerUrl?: string | URL;
  readonly worker?: Worker;
  readonly networkMode?: 'disabled' | 'host' | 'http' | 'wisp';
  readonly defaultTimeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

export class WasmerShellRuntime implements ShellRuntime {
  private _status: RuntimeStatus = 'uninitialized';
  private worker: Worker | null = null;
  private inProcessManager: unknown = null;
  private readonly options: WasmerShellRuntimeOptions;

  private outputCallbacks = new Set<(data: string) => void>();
  private errorCallbacks = new Set<(error: string) => void>();
  private statusCallbacks = new Set<(status: RuntimeStatus) => void>();

  private pendingRequests = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: unknown) => void;
      timer?: ReturnType<typeof setTimeout>;
    }
  >();

  private activeProcessId: string | null = null;
  private activeExecRequestId: string | null = null;
  private requestIdCounter = 0;

  constructor(options: WasmerShellRuntimeOptions = {}) {
    this.options = {
      shellPackage: options.shellPackage ?? 'wasmer/bash@1.0.25',
      packages: options.packages ?? ['wasmer/grep@3.12.0', 'wasmer/find@4.10.0'],
      networkMode: options.networkMode ?? 'disabled',
      defaultTimeoutMs: options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS,
      ...options,
    };
  }

  public get status(): RuntimeStatus {
    return this._status;
  }

  public get activeProcess(): string | null {
    return this.activeProcessId;
  }

  private setStatus(newStatus: RuntimeStatus): void {
    if (this._status === newStatus) return;
    this._status = newStatus;
    for (const cb of this.statusCallbacks) {
      try {
        cb(newStatus);
      } catch (err) {
        console.error('[WasmerShellRuntime] Error in status callback:', err);
      }
    }
  }

  private nextId(): string {
    this.requestIdCounter += 1;
    return `req_${Date.now()}_${this.requestIdCounter}`;
  }

  public onStatusChange(callback: (status: RuntimeStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  public async initialize(): Promise<void> {
    if (this._status === 'ready') return;
    this.setStatus('initializing');

    const initPayload: RuntimeInitialization = {
      shellPackage: this.options.shellPackage,
      packages: this.options.packages,
      networkMode: this.options.networkMode,
    };

    const hasWorkerSupport = typeof Worker !== 'undefined';
    const shouldUseWorker =
      Boolean(this.options.worker) ||
      (hasWorkerSupport &&
        Boolean(
          this.options.workerUrl ||
            (typeof window !== 'undefined' && !('Deno' in window))
        ));

    if (shouldUseWorker) {
      try {
        if (this.options.worker) {
          this.worker = this.options.worker;
        } else {
          const url =
            this.options.workerUrl ??
            new URL('../worker/shell-worker.ts', import.meta.url);
          this.worker = new Worker(url, { type: 'module' });
        }
        this.setupWorkerListeners(this.worker);

        const reqId = this.nextId();
        await this.sendWorkerRequest(reqId, 'runtime.initialize', initPayload);
        this.setStatus('ready');
        return;
      } catch (err) {
        this.setStatus('error');
        const msg = err instanceof Error ? err.message : String(err);
        this.emitError(msg);
        throw err;
      }
    }

    // Direct / In-thread execution (Node.js test environments or direct fallback)
    try {
      const { WorkerRuntimeManager } = await import('../worker/runtime-worker');
      const manager = new WorkerRuntimeManager();
      manager.setEventCallback((msg: RuntimeWorkerEvent) => {
        this.handleWorkerMessage({ data: msg } as MessageEvent<RuntimeWorkerEvent>);
      });
      this.inProcessManager = manager;

      const reqId = this.nextId();
      const initPromise = new Promise<void>((resolve, reject) => {
        this.pendingRequests.set(reqId, {
          resolve: () => resolve(),
          reject,
        });
      });

      await manager.initialize(reqId, initPayload);
      await initPromise;
      this.setStatus('ready');
    } catch (err) {
      this.setStatus('error');
      const msg = err instanceof Error ? err.message : String(err);
      this.emitError(msg);
      throw err;
    }
  }

  public async openTerminal(options: OpenTerminalOptions = { columns: 80, rows: 24 }): Promise<string> {
    if (this._status !== 'ready') {
      throw new Error(`Cannot open terminal in state: ${this._status}`);
    }

    const reqId = this.nextId();
    const payload = {
      columns: options.columns,
      rows: options.rows,
      command: options.command ?? 'bash',
    };

    if (this.worker) {
      const response = (await this.sendWorkerRequest(reqId, 'terminal.open', payload)) as {
        payload: { processId: string };
      };
      this.activeProcessId = response.payload.processId;
      return this.activeProcessId;
    }

    if (this.inProcessManager) {
      type ManagerWithOpenTerm = {
        openTerminal(id: string, payload: unknown): Promise<void>;
      };
      const openPromise = new Promise<string>((resolve, reject) => {
        this.pendingRequests.set(reqId, {
          resolve: (val) => {
            const res = val as { payload: { processId: string } };
            resolve(res.payload.processId);
          },
          reject,
        });
      });

      await (this.inProcessManager as ManagerWithOpenTerm).openTerminal(reqId, payload);
      const procId = await openPromise;
      this.activeProcessId = procId;
      return procId;
    }

    throw new Error('Runtime manager not initialized');
  }

  public async execute(
    commandLine: string,
    options?: RuntimeExecutionOptions
  ): Promise<ExecutionResult> {
    if (this._status === 'executing') {
      throw new Error('Runtime is already executing a command');
    }
    if (this._status !== 'ready') {
      throw new Error(`Cannot execute command in state: ${this._status}`);
    }

    this.setStatus('executing');
    const reqId = this.nextId();
    this.activeExecRequestId = reqId;

    const timeoutMs = options?.timeoutMs ?? this.options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;

    try {
      let result: ExecutionResult;

      if (this.worker) {
        result = (await this.sendWorkerRequestWithTimeout(
          reqId,
          'command.execute',
          {
            commandLine,
            cwd: options?.cwd,
            env: options?.env,
            timeoutMs,
          },
          timeoutMs
        )) as ExecutionResult;
      } else if (this.inProcessManager) {
        type ManagerWithExec = {
          executeCommand(id: string, payload: unknown): Promise<void>;
        };
        const manager = this.inProcessManager as ManagerWithExec;

        const execPromise = new Promise<ExecutionResult>((resolve, reject) => {
          const timer = setTimeout(() => {
            if (this.pendingRequests.has(reqId)) {
              this.pendingRequests.delete(reqId);
              this.interrupt().catch(() => {});
              this.setStatus('ready');
              reject(new Error(`Command execution timed out after ${timeoutMs}ms`));
            }
          }, timeoutMs);

          this.pendingRequests.set(reqId, {
            resolve: (val) => {
              clearTimeout(timer);
              resolve(val as ExecutionResult);
            },
            reject: (err) => {
              clearTimeout(timer);
              reject(err);
            },
            timer,
          });
        });

        await manager.executeCommand(reqId, {
          commandLine,
          cwd: options?.cwd,
          env: options?.env,
          timeoutMs,
        });
        result = await execPromise;
      } else {
        throw new Error('Runtime manager not initialized');
      }

      this.setStatus('ready');
      return result;
    } catch (err) {
      this.setStatus('ready');
      throw err;
    } finally {
      if (this.activeExecRequestId === reqId) {
        this.activeExecRequestId = null;
      }
    }
  }

  public async interrupt(): Promise<void> {
    const reqId = this.nextId();

    // If a command execution is active, reject it cleanly
    if (this.activeExecRequestId && this.pendingRequests.has(this.activeExecRequestId)) {
      const activePending = this.pendingRequests.get(this.activeExecRequestId)!;
      if (activePending.timer) clearTimeout(activePending.timer);
      this.pendingRequests.delete(this.activeExecRequestId);
      this.activeExecRequestId = null;
      activePending.reject(new Error('Command execution interrupted by user (SIGINT)'));
      this.setStatus('ready');
    }

    if (this.worker) {
      this.worker.postMessage({
        id: reqId,
        type: 'terminal.interrupt',
        payload: { processId: this.activeProcessId ?? undefined },
      });
      return;
    }

    if (this.inProcessManager) {
      type ManagerWithInterrupt = {
        interrupt(id: string): Promise<void>;
      };
      await (this.inProcessManager as ManagerWithInterrupt).interrupt(reqId).catch(() => {});
    }
  }

  public writeInput(data: string): void {
    if (!this.activeProcessId) return;
    const reqId = this.nextId();
    if (this.worker) {
      this.worker.postMessage({
        id: reqId,
        type: 'terminal.stdin',
        payload: { processId: this.activeProcessId, data },
      });
    } else if (this.inProcessManager) {
      type ManagerWithStdin = {
        writeStdin(id: string, payload: unknown): Promise<void>;
      };
      (this.inProcessManager as ManagerWithStdin)
        .writeStdin(reqId, {
          processId: this.activeProcessId,
          data,
        })
        .catch((e) => this.emitError(String(e)));
    }
  }

  public resize(cols: number, rows: number): void {
    if (!this.activeProcessId) return;
    const reqId = this.nextId();
    if (this.worker) {
      this.worker.postMessage({
        id: reqId,
        type: 'terminal.resize',
        payload: { processId: this.activeProcessId, columns: cols, rows },
      });
    } else if (this.inProcessManager) {
      type ManagerWithResize = {
        resizeTerminal(id: string, payload: unknown): void;
      };
      (this.inProcessManager as ManagerWithResize).resizeTerminal(reqId, {
        processId: this.activeProcessId,
        columns: cols,
        rows,
      });
    }
  }

  public onOutput(callback: (data: string) => void): () => void {
    this.outputCallbacks.add(callback);
    return () => this.outputCallbacks.delete(callback);
  }

  public onError(callback: (error: string) => void): () => void {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  public async reset(files?: Record<string, string>): Promise<void> {
    const reqId = this.nextId();
    const payload = files ? { files } : {};

    if (this.worker) {
      await this.sendWorkerRequest(reqId, 'runtime.reset', payload);
    } else if (this.inProcessManager) {
      type ManagerWithReset = {
        reset(id: string, payload?: unknown): Promise<void>;
      };
      const resetPromise = new Promise<void>((resolve, reject) => {
        this.pendingRequests.set(reqId, {
          resolve: () => resolve(),
          reject,
        });
      });
      await (this.inProcessManager as ManagerWithReset).reset(reqId, payload);
      await resetPromise;
    }
    this.setStatus('ready');
  }

  public async terminate(): Promise<void> {
    this.setStatus('terminating');
    const reqId = this.nextId();

    try {
      if (this.worker) {
        await this.sendWorkerRequest(reqId, 'runtime.dispose', {});
        this.worker.terminate();
        this.worker = null;
      } else if (this.inProcessManager) {
        type ManagerWithDispose = {
          dispose(id: string): Promise<void>;
        };
        const disposePromise = new Promise<void>((resolve, reject) => {
          this.pendingRequests.set(reqId, {
            resolve: () => resolve(),
            reject,
          });
        });
        await (this.inProcessManager as ManagerWithDispose).dispose(reqId);
        await disposePromise;
        this.inProcessManager = null;
      }
    } finally {
      this.setStatus('uninitialized');
      this.outputCallbacks.clear();
      this.errorCallbacks.clear();
      this.statusCallbacks.clear();
      this.pendingRequests.forEach((req) => {
        if (req.timer) clearTimeout(req.timer);
      });
      this.pendingRequests.clear();
      this.activeProcessId = null;
      this.activeExecRequestId = null;
    }
  }

  private setupWorkerListeners(worker: Worker): void {
    worker.onmessage = (event: MessageEvent<RuntimeWorkerEvent>) => {
      this.handleWorkerMessage(event);
    };

    worker.onerror = (err: ErrorEvent) => {
      this.setStatus('error');
      this.emitError(err.message);
    };
  }

  private handleWorkerMessage(event: MessageEvent<RuntimeWorkerEvent>): void {
    const msg = event.data;
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'terminal.output') {
      const payload = msg.payload as { data: string };
      this.emitOutput(payload.data);
      return;
    }

    if (msg.type === 'terminal.opened') {
      const payload = msg.payload as { processId: string };
      this.activeProcessId = payload.processId;
    }

    if (msg.requestId && this.pendingRequests.has(msg.requestId)) {
      const pending = this.pendingRequests.get(msg.requestId)!;
      if (pending.timer) clearTimeout(pending.timer);
      this.pendingRequests.delete(msg.requestId);

      if (msg.type === 'runtime.error') {
        pending.reject(new Error(msg.error.message));
      } else if (msg.type === 'command.result') {
        pending.resolve(msg.payload);
      } else {
        pending.resolve(msg);
      }
    }
  }

  private sendWorkerRequest(id: string, type: string, payload: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker!.postMessage({ id, type, payload });
    });
  }

  private sendWorkerRequestWithTimeout(
    id: string,
    type: string,
    payload: unknown,
    timeoutMs: number
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          this.interrupt().catch(() => {});
          this.setStatus('ready');
          reject(new Error(`Command execution timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      this.pendingRequests.set(id, {
        resolve: (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
        timer,
      });

      this.worker!.postMessage({ id, type, payload });
    });
  }

  private emitOutput(data: string): void {
    for (const cb of this.outputCallbacks) {
      try {
        cb(data);
      } catch (err) {
        console.error('[WasmerShellRuntime] Error in output callback:', err);
      }
    }
  }

  private emitError(err: string): void {
    for (const cb of this.errorCallbacks) {
      try {
        cb(err);
      } catch (err2) {
        console.error('[WasmerShellRuntime] Error in error callback:', err2);
      }
    }
  }
}
