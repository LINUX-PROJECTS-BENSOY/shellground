/**
 * Dedicated Web Worker for SHELLGROUND Wasmer Runtime Sandboxing
 * Specified according to Sections 15, 16, 17 of FULL_ARCHITECTURE.md
 */

import { Wasmer, type Sandbox, type Process } from '@wasmer/sdk';
import type {
  RuntimeWorkerRequest,
  RuntimeWorkerEvent,
  RuntimeInitialization,
  CommandExecuteRequest,
  TerminalStdinRequest,
  TerminalResizeRequest,
  OpenTerminalRequest,
  RuntimeResetRequest,
} from './worker-protocol';

const DEFAULT_SHELL_PACKAGE = 'wasmer/bash@1.0.25';
const DEFAULT_AUX_PACKAGES = ['wasmer/grep@3.12.0', 'wasmer/find@4.10.0'];

class WorkerRuntimeManager {
  private wasmer: Wasmer | null = null;
  private sandbox: Sandbox | null = null;
  private activeProcess: Process | null = null;
  private currentInit: RuntimeInitialization | null = null;
  private isDisposed = false;
  private eventCallback: ((msg: RuntimeWorkerEvent) => void) | null = null;

  public setEventCallback(cb: (msg: RuntimeWorkerEvent) => void): void {
    this.eventCallback = cb;
  }

  private post(msg: RuntimeWorkerEvent): void {
    if (this.eventCallback) {
      this.eventCallback(msg);
      return;
    }
    if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
      self.postMessage(msg);
    }
  }

  public async initialize(reqId: string, initConfig: RuntimeInitialization): Promise<void> {
    this.post({ requestId: reqId, type: 'runtime.initializing' });
    try {
      this.currentInit = initConfig;
      this.wasmer = new Wasmer();
      await this.wasmer.ready();

      const shellPkg = initConfig.shellPackage ?? DEFAULT_SHELL_PACKAGE;
      const extraPkgs = initConfig.packages ?? DEFAULT_AUX_PACKAGES;
      const allPkgs = Array.from(new Set([shellPkg, ...extraPkgs]));

      this.sandbox = await this.wasmer.sandboxes.create({
        packages: allPkgs,
        shell: 'bash',
        network: { mode: (initConfig.networkMode ?? 'disabled') as 'disabled' },
      });

      this.post({ requestId: reqId, type: 'runtime.ready' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: {
          code: 'INITIALIZATION_FAILED',
          message: errorMsg,
        },
      });
    }
  }

  public async openTerminal(reqId: string, req: OpenTerminalRequest): Promise<void> {
    if (!this.sandbox) {
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: { code: 'NOT_INITIALIZED', message: 'Sandbox not initialized' },
      });
      return;
    }

    try {
      const cmd = this.sandbox.shell(req.command ?? 'bash');
      const proc = await cmd.spawn({
        terminal: {
          columns: req.columns,
          rows: req.rows,
        },
      });

      this.activeProcess = proc;
      const procId = String(proc.id);

      this.post({
        requestId: reqId,
        type: 'terminal.opened',
        payload: { processId: procId },
      });

      if (proc.stdout) {
        (async () => {
          try {
            const decoder = new TextDecoder();
            for await (const chunk of proc.stdout!) {
              const text = decoder.decode(chunk);
              this.post({
                type: 'terminal.output',
                payload: { processId: procId, data: text },
              });
            }
          } catch {
            // Stream closed or error
          }
        })();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: { code: 'TERMINAL_OPEN_FAILED', message: errorMsg },
      });
    }
  }

  public async writeStdin(reqId: string, req: TerminalStdinRequest): Promise<void> {
    if (!this.activeProcess || !this.activeProcess.stdin) {
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: { code: 'NO_ACTIVE_STDIN', message: 'No active process stdin available' },
      });
      return;
    }

    try {
      await this.activeProcess.stdin.write(req.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: { code: 'STDIN_WRITE_FAILED', message: errorMsg },
      });
    }
  }

  public resizeTerminal(reqId: string, req: TerminalResizeRequest): void {
    if (!this.activeProcess) {
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: { code: 'NO_ACTIVE_PROCESS', message: 'No active process to resize' },
      });
      return;
    }

    try {
      this.activeProcess.resizeTerminal(req.columns, req.rows);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: { code: 'RESIZE_FAILED', message: errorMsg },
      });
    }
  }

  public async executeCommand(reqId: string, req: CommandExecuteRequest): Promise<void> {
    if (!this.sandbox) {
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: { code: 'NOT_INITIALIZED', message: 'Sandbox not initialized' },
      });
      return;
    }

    try {
      const cmd = this.sandbox.shell(req.commandLine, {
        cwd: req.cwd,
        env: req.env,
      });

      const output = await cmd.run({
        timeoutMs: req.timeoutMs,
        check: false,
      });

      this.post({
        requestId: reqId,
        type: 'command.result',
        payload: {
          exitCode: output.exitCode,
          stdout: output.stdout.text(),
          stderr: output.stderr.text(),
        },
      });
    } catch (err: unknown) {
      // Catch ProcessExitError if check was true or execution error
      const anyErr = err as { output?: { exitCode: number; stdout: { text(): string }; stderr: { text(): string } } };
      if (anyErr.output) {
        this.post({
          requestId: reqId,
          type: 'command.result',
          payload: {
            exitCode: anyErr.output.exitCode,
            stdout: anyErr.output.stdout.text(),
            stderr: anyErr.output.stderr.text(),
          },
        });
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.post({
          requestId: reqId,
          type: 'runtime.error',
          error: { code: 'EXECUTION_FAILED', message: errorMsg },
        });
      }
    }
  }

  public async reset(reqId: string, req?: RuntimeResetRequest): Promise<void> {
    try {
      if (this.activeProcess) {
        try {
          await this.activeProcess.kill();
        } catch {
          // ignore kill error
        }
        this.activeProcess = null;
      }

      if (this.sandbox) {
        try {
          await this.sandbox.close();
        } catch {
          // ignore close error
        }
        this.sandbox = null;
      }

      if (!this.wasmer) {
        this.wasmer = new Wasmer();
        await this.wasmer.ready();
      }

      const shellPkg = this.currentInit?.shellPackage ?? DEFAULT_SHELL_PACKAGE;
      const extraPkgs = this.currentInit?.packages ?? DEFAULT_AUX_PACKAGES;
      const allPkgs = Array.from(new Set([shellPkg, ...extraPkgs]));

      this.sandbox = await this.wasmer.sandboxes.create({
        packages: allPkgs,
        shell: 'bash',
        network: { mode: (this.currentInit?.networkMode ?? 'disabled') as 'disabled' },
      });

      if (req?.files && this.sandbox.fs) {
        for (const [filePath, content] of Object.entries(req.files)) {
          await this.sandbox.fs.writeText(filePath, content);
        }
      }

      this.post({ requestId: reqId, type: 'runtime.reset' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: { code: 'RESET_FAILED', message: errorMsg },
      });
    }
  }

  public async dispose(reqId: string): Promise<void> {
    if (this.isDisposed) return;
    this.isDisposed = true;

    try {
      if (this.activeProcess) {
        await this.activeProcess.kill().catch(() => {});
        this.activeProcess = null;
      }
      if (this.sandbox) {
        await this.sandbox.close().catch(() => {});
        this.sandbox = null;
      }
      if (this.wasmer) {
        await this.wasmer.close().catch(() => {});
        this.wasmer = null;
      }

      this.post({ requestId: reqId, type: 'runtime.disposed' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.post({
        requestId: reqId,
        type: 'runtime.error',
        error: { code: 'DISPOSE_FAILED', message: errorMsg },
      });
    }
  }
}

const manager = new WorkerRuntimeManager();

if (typeof self !== 'undefined') {
  self.onmessage = async (event: MessageEvent<unknown>) => {
    const data = event.data as RuntimeWorkerRequest;
    if (!data || typeof data !== 'object' || !('type' in data) || !('id' in data)) {
      if (typeof self.postMessage === 'function') {
        self.postMessage({
          type: 'runtime.error',
          error: {
            code: 'MALFORMED_REQUEST',
            message: 'Worker received a malformed or invalid request envelope.',
          },
        });
      }
      return;
    }

    switch (data.type) {
      case 'runtime.initialize':
        await manager.initialize(data.id, data.payload);
        break;
      case 'terminal.open':
        await manager.openTerminal(data.id, data.payload);
        break;
      case 'terminal.stdin':
        await manager.writeStdin(data.id, data.payload);
        break;
      case 'terminal.resize':
        manager.resizeTerminal(data.id, data.payload);
        break;
      case 'command.execute':
        await manager.executeCommand(data.id, data.payload);
        break;
      case 'runtime.reset':
        await manager.reset(data.id, data.payload);
        break;
      case 'runtime.dispose':
        await manager.dispose(data.id);
        break;
      default:
        self.postMessage({
          requestId: (data as { id?: string }).id,
          type: 'runtime.error',
          error: {
            code: 'UNKNOWN_REQUEST_TYPE',
            message: `Unsupported request type: ${(data as { type: string }).type}`,
          },
        });
    }
  };
}

export { WorkerRuntimeManager };
