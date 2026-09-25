/**
 * Validation Domain Contracts & DTOs
 * Specified in Section 51-57 of DATABASE_CONTENT_SCHEMA.md and Issue #11
 * 
 * Philosophy: Validate outcomes, not keystrokes.
 * Invariant: Non-destructive inspection; zero dynamic code execution (eval, Function).
 */

import type { ShellRuntime } from '../../runtime/ports/ShellRuntime';

export interface ValidatorContext {
  /** The ShellRuntime sandbox under inspection */
  readonly runtime?: ShellRuntime;

  /** The last interactive command executed by the learner (if available) */
  readonly lastCommand?: string;

  /** Captured stdout from the last command */
  readonly lastStdout?: string;

  /** Captured stderr from the last command */
  readonly lastStderr?: string;

  /** Captured exit code from the last command */
  readonly lastExitCode?: number;

  /** Non-destructive filesystem query helpers */
  readFile(path: string): Promise<string | null>;
  fileExists(path: string): Promise<boolean>;
  readDir(path: string): Promise<string[] | null>;
  getCwd(): Promise<string>;
  getEnv(name: string): Promise<string | null>;
  getFileMode?(path: string): Promise<string | null>;
  getSymlinkTarget?(path: string): Promise<string | null>;
  getFileHash?(path: string, algorithm?: 'sha256'): Promise<string | null>;
}

export interface ValidationResult {
  validatorId?: string;
  type: string;
  status: 'pass' | 'fail';
  message: string;
  expected?: unknown;
  actual?: unknown;
  code?: string;
}

export interface ValidationSummary {
  passed: boolean;
  passedCount: number;
  failedCount: number;
  totalCount: number;
  results: ValidationResult[];
  durationMs?: number;
}

export interface PersistedValidationResult {
  validatorId: string;
  passed: boolean;
  code: string;
}

export interface PersistedValidationSummary {
  passed: boolean;
  results: PersistedValidationResult[];
}

export interface Validator<TConfig = unknown> {
  readonly type: string;
  validate(config: TConfig, context: ValidatorContext): Promise<ValidationResult>;
}
