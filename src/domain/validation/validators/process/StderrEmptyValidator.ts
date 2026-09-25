/**
 * StderrEmptyValidator - Verifies command produced zero error output
 * Supports types: 'stderrEmpty'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface StderrEmptyConfig {
  id?: string;
  type: 'stderrEmpty';
  command?: string;
  description?: string;
}

export class StderrEmptyValidator implements Validator<StderrEmptyConfig> {
  public readonly type = 'stderrEmpty';

  public async validate(config: StderrEmptyConfig, context: ValidatorContext): Promise<ValidationResult> {
    let stderr = context.lastStderr ?? '';

    if (config.command && context.runtime) {
      try {
        const res = await context.runtime.execute(config.command);
        stderr = res.stderr;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          validatorId: config.id,
          type: config.type,
          status: 'fail',
          message: `Failed to execute validation command "${config.command}": ${msg}`,
          code: 'COMMAND_EXECUTION_FAILED',
        };
      }
    }

    const trimmed = stderr.trim();

    if (trimmed.length > 0) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Expected stderr to be empty, but received: "${trimmed}".`,
        expected: '',
        actual: trimmed,
        code: 'STDERR_NOT_EMPTY',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || 'Standard error was empty as expected.',
      expected: '',
      actual: '',
    };
  }
}
