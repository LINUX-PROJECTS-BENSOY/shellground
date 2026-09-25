/**
 * Worker Protocol Definitions for SHELLGROUND Runtime
 * Specified according to Section 17 of FULL_ARCHITECTURE.md
 */

export interface RuntimeErrorDTO {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

export interface WorkerRequestEnvelope<T = unknown> {
  readonly id: string;
  readonly type: string;
  readonly payload: T;
}

export interface WorkerResponseEnvelope<T = unknown> {
  readonly requestId?: string;
  readonly type: string;
  readonly payload?: T;
  readonly error?: RuntimeErrorDTO;
}

export interface RuntimeInitialization {
  readonly shellPackage?: string;
  readonly packages?: readonly string[];
  readonly cwd?: string;
  readonly env?: Record<string, string>;
  readonly networkMode?: 'disabled' | 'host' | 'http' | 'wisp';
}

export interface OpenTerminalRequest {
  readonly columns: number;
  readonly rows: number;
  readonly command?: string;
}

export interface TerminalStdinRequest {
  readonly processId: string;
  readonly data: string | Uint8Array;
}

export interface TerminalResizeRequest {
  readonly processId: string;
  readonly columns: number;
  readonly rows: number;
}

export interface CommandExecuteRequest {
  readonly commandLine: string;
  readonly cwd?: string;
  readonly env?: Record<string, string>;
  readonly timeoutMs?: number;
}

export interface RuntimeResetRequest {
  readonly files?: Record<string, string>;
  readonly cwd?: string;
}

export type RuntimeWorkerRequest =
  | { readonly id: string; readonly type: 'runtime.initialize'; readonly payload: RuntimeInitialization }
  | { readonly id: string; readonly type: 'terminal.open'; readonly payload: OpenTerminalRequest }
  | { readonly id: string; readonly type: 'terminal.stdin'; readonly payload: TerminalStdinRequest }
  | { readonly id: string; readonly type: 'terminal.resize'; readonly payload: TerminalResizeRequest }
  | { readonly id: string; readonly type: 'command.execute'; readonly payload: CommandExecuteRequest }
  | { readonly id: string; readonly type: 'runtime.reset'; readonly payload?: RuntimeResetRequest }
  | { readonly id: string; readonly type: 'runtime.dispose'; readonly payload?: Record<string, never> };

export type RuntimeWorkerEvent =
  | { readonly requestId?: string; readonly type: 'runtime.initializing' }
  | { readonly requestId?: string; readonly type: 'runtime.ready' }
  | { readonly requestId?: string; readonly type: 'terminal.opened'; readonly payload: { processId: string } }
  | { readonly requestId?: string; readonly type: 'terminal.output'; readonly payload: { processId?: string; data: string } }
  | { readonly requestId?: string; readonly type: 'command.result'; readonly payload: { exitCode: number; stdout: string; stderr: string } }
  | { readonly requestId?: string; readonly type: 'runtime.reset' }
  | { readonly requestId?: string; readonly type: 'runtime.disposed' }
  | { readonly requestId?: string; readonly type: 'runtime.error'; readonly error: RuntimeErrorDTO };
