/**
 * ShellRuntime Port Specification
 * Specified according to Sections 15 & 16 of FULL_ARCHITECTURE.md
 */

export type RuntimeStatus =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'executing'
  | 'terminating'
  | 'error';

export interface RuntimeExecutionOptions {
  readonly cwd?: string;
  readonly env?: Record<string, string>;
  readonly timeoutMs?: number;
}

export interface ExecutionResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export interface OpenTerminalOptions {
  readonly columns: number;
  readonly rows: number;
  readonly command?: string;
}

export interface ShellRuntime {
  readonly status: RuntimeStatus;

  initialize(): Promise<void>;
  execute(commandLine: string, options?: RuntimeExecutionOptions): Promise<ExecutionResult>;
  interrupt(): Promise<void>;
  openTerminal?(options?: OpenTerminalOptions): Promise<string>;
  writeInput(data: string): void;
  onOutput(callback: (data: string) => void): () => void;
  onError(callback: (error: string) => void): () => void;
  onStatusChange?(callback: (status: RuntimeStatus) => void): () => void;
  resize(cols: number, rows: number): void;
  reset(files?: Record<string, string>): Promise<void>;
  terminate(): Promise<void>;
}
