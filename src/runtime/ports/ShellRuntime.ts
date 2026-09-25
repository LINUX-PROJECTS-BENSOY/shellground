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

export interface ShellRuntime {
  readonly status: RuntimeStatus;
  
  initialize(): Promise<void>;
  execute(commandLine: string, options?: RuntimeExecutionOptions): Promise<ExecutionResult>;
  writeInput(data: string): void;
  onOutput(callback: (data: string) => void): () => void;
  onError(callback: (error: string) => void): () => void;
  resize(cols: number, rows: number): void;
  reset(): Promise<void>;
  terminate(): Promise<void>;
}
