/**
 * Worker Messages and RPC Protocol DTOs
 * Specified in Sub-Phase 3.1 of Issue #9
 */

export interface RuntimeErrorDTO {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
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

export interface TerminalInterruptRequest {
  readonly processId?: string;
}

// Request Messages
export interface InitMessage {
  readonly id: string;
  readonly type: 'runtime.initialize';
  readonly payload: RuntimeInitialization;
}

export interface OpenTerminalMessage {
  readonly id: string;
  readonly type: 'terminal.open';
  readonly payload: OpenTerminalRequest;
}

export interface WriteInputMessage {
  readonly id: string;
  readonly type: 'terminal.stdin';
  readonly payload: TerminalStdinRequest;
}

export interface ResizeMessage {
  readonly id: string;
  readonly type: 'terminal.resize';
  readonly payload: TerminalResizeRequest;
}

export interface InterruptMessage {
  readonly id: string;
  readonly type: 'terminal.interrupt';
  readonly payload?: TerminalInterruptRequest;
}

export interface ExecMessage {
  readonly id: string;
  readonly type: 'command.execute';
  readonly payload: CommandExecuteRequest;
}

export interface ResetMessage {
  readonly id: string;
  readonly type: 'runtime.reset';
  readonly payload?: RuntimeResetRequest;
}

export interface TerminateMessage {
  readonly id: string;
  readonly type: 'runtime.dispose';
  readonly payload?: Record<string, never>;
}

export type RuntimeWorkerRequest =
  | InitMessage
  | OpenTerminalMessage
  | WriteInputMessage
  | ResizeMessage
  | InterruptMessage
  | ExecMessage
  | ResetMessage
  | TerminateMessage;

// Response Messages / Events
export interface StdoutResponse {
  readonly requestId?: string;
  readonly type: 'terminal.output';
  readonly payload: { readonly processId?: string; readonly data: string };
}

export interface StderrResponse {
  readonly requestId?: string;
  readonly type: 'terminal.error_output';
  readonly payload: { readonly processId?: string; readonly data: string };
}

export interface ExitResponse {
  readonly requestId?: string;
  readonly type: 'command.result';
  readonly payload: {
    readonly exitCode: number;
    readonly stdout: string;
    readonly stderr: string;
  };
}

export interface ErrorResponse {
  readonly requestId?: string;
  readonly type: 'runtime.error';
  readonly error: RuntimeErrorDTO;
}

export interface InitializingResponse {
  readonly requestId?: string;
  readonly type: 'runtime.initializing';
}

export interface ReadyResponse {
  readonly requestId?: string;
  readonly type: 'runtime.ready';
}

export interface OpenedResponse {
  readonly requestId?: string;
  readonly type: 'terminal.opened';
  readonly payload: { readonly processId: string };
}

export interface ResetResponse {
  readonly requestId?: string;
  readonly type: 'runtime.reset';
}

export interface DisposedResponse {
  readonly requestId?: string;
  readonly type: 'runtime.disposed';
}

export type RuntimeWorkerEvent =
  | InitializingResponse
  | ReadyResponse
  | OpenedResponse
  | StdoutResponse
  | StderrResponse
  | ExitResponse
  | ResetResponse
  | DisposedResponse
  | ErrorResponse;
