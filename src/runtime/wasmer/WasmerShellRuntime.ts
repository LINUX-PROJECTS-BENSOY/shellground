/**
 * WasmerShellRuntime - Production Implementation of ShellRuntime Port
 * Specified in Section 15 of FULL_ARCHITECTURE.md
 */

import type {
  ShellRuntime,
  RuntimeStatus,
  RuntimeExecutionOptions,
  ExecutionResult,
} from '@runtime/ports/ShellRuntime';
import type {
  RuntimeWorkerEvent,
  RuntimeInitialization,
} from '@runtime/worker/worker-protocol';

export interface WasmerShellRuntimeOptions {
  readonly shellPackage?: string;
  readonly packages?: readonly string[];
  readonly workerUrl?: string | URL;
  readonly worker?: Worker;
  readonly networkMode?: 'disabled' | 'host' | 'http' | 'wisp';
}

export class WasmerShellRuntime implements ShellRuntime {
  private _status: RuntimeStatus = 'uninitialized';
  private worker: Worker | null = null;
  private inProcessManager: unknown = null;
  private readonly options: WasmerShellRuntimeOptions;

  private outputCallbacks = new Set<(data: string) => void>();
  private errorCallbacks = new Set<(error: string) => void>();
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: unknown) => void;
    }
  >();
  private activeProcessId: string | null = null;
  private requestIdCounter = 0;

  constructor(options: WasmerShellRuntimeOptions = {}) {
    this.options = {
      shellPackage: options.shellPackage ?? 'wasmer/bash@1.0.25',
      packages: options.packages ?? ['wasmer/grep@3.12.0', 'wasmer/find@4.10.0'],
      networkMode: options.networkMode ?? 'disabled',
      ...options,
    };
  }

  public get status(): RuntimeStatus {
    return this._status;
  }

  private nextId(): string {
    this.requestIdCounter += 1;
    return `req_${Date.now()}_${this.requestIdCounter}`;
  }

  public async initialize(): Promise<void> {
    if (this._status === 'ready') return;
    this._status = 'initializing';

    const initPayload: RuntimeInitialization = {
      shellPackage: this.options.shellPackage,
      packages: this.options.packages,
      networkMode: this.options.networkMode,
    };

    if (typeof Worker !== 'undefined' && (this.options.worker || this.options.workerUrl)) {
      // Browser Web Worker execution
      try {
        if (this.options.worker) {
          this.worker = this.options.worker;
        } else if (this.options.workerUrl) {
          this.worker = new Worker(this.options.workerUrl, { type: 'module' });
        }
        this.setupWorkerListeners(this.worker!);

        const reqId = this.nextId();
        await this.sendWorkerRequest(reqId, 'runtime.initialize', initPayload);
        this._status = 'ready';
        return;
      } catch (err) {
        this._status = 'error';
        const msg = err instanceof Error ? err.message : String(err);
        this.emitError(msg);
        throw err;
      }
    }

    // Direct / In-thread execution (Node.js test environments or direct fallback)
    try {
      const { WorkerRuntimeManager } = await import('@runtime/worker/runtime-worker');
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
      this._status = 'ready';
    } catch (err) {
      this._status = 'error';
      const msg = err instanceof Error ? err.message : String(err);
      this.emitError(msg);
      throw err;
    }
  }

  public async execute(
    commandLine: string,
    options?: RuntimeExecutionOptions
  ): Promise<ExecutionResult> {
    if (this._status !== 'ready') {
      throw new Error(`Cannot execute command in state: ${this._status}`);
    }

    this._status = 'executing';
    const reqId = this.nextId();

    try {
      let result: ExecutionResult;
      if (this.worker) {
        result = (await this.sendWorkerRequest(reqId, 'command.execute', {
          commandLine,
          cwd: options?.cwd,
          env: options?.env,
          timeoutMs: options?.timeoutMs,
        })) as ExecutionResult;
      } else if (this.inProcessManager) {
        type ManagerWithExec = {
          executeCommand(id: string, payload: unknown): Promise<void>;
        };
        const manager = this.inProcessManager as ManagerWithExec;

        const execPromise = new Promise<ExecutionResult>((resolve, reject) => {
          this.pendingRequests.set(reqId, {
            resolve: (val) => resolve(val as ExecutionResult),
            reject,
          });
        });

        await manager.executeCommand(reqId, {
          commandLine,
          cwd: options?.cwd,
          env: options?.env,
          timeoutMs: options?.timeoutMs,
        });
        result = await execPromise;
      } else {
        throw new Error('Runtime manager not initialized');
      }

      this._status = 'ready';
      return result;
    } catch (err) {
      this._status = 'ready';
      throw err;
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
      (this.inProcessManager as ManagerWithStdin).writeStdin(reqId, {
        processId: this.activeProcessId,
        data,
      }).catch((e) => this.emitError(String(e)));
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

  public async reset(): Promise<void> {
    const reqId = this.nextId();
    if (this.worker) {
      await this.sendWorkerRequest(reqId, 'runtime.reset', {});
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
      await (this.inProcessManager as ManagerWithReset).reset(reqId, {});
      await resetPromise;
    }
    this._status = 'ready';
  }

  public async terminate(): Promise<void> {
    this._status = 'terminating';
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
      this._status = 'uninitialized';
      this.outputCallbacks.clear();
      this.errorCallbacks.clear();
      this.pendingRequests.clear();
    }
  }

  private setupWorkerListeners(worker: Worker): void {
    worker.onmessage = (event: MessageEvent<RuntimeWorkerEvent>) => {
      this.handleWorkerMessage(event);
    };

    worker.onerror = (err: ErrorEvent) => {
      this._status = 'error';
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

  private emitOutput(data: string): void {
    for (const cb of this.outputCallbacks) {
      try {
        cb(data);
      } catch (err) {
        console.error('Error in output callback:', err);
      }
    }
  }

  private emitError(err: string): void {
    for (const cb of this.errorCallbacks) {
      try {
        cb(err);
      } catch (err2) {
        console.error('Error in error callback:', err2);
      }
    }
  }
}
