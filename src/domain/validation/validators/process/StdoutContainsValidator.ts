/**
 * StdoutContainsValidator - Verifies stdout stream contains expected substring
 * Supports types: 'stdoutContains' | 'commandOutputContains'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface StdoutContainsConfig {
  id?: string;
  type: 'stdoutContains' | 'commandOutputContains';
  value: string;
  command?: string;
  caseSensitive?: boolean;
  description?: string;
}

export class StdoutContainsValidator implements Validator<StdoutContainsConfig> {
  public readonly type = 'stdoutContains';

  public async validate(config: StdoutContainsConfig, context: ValidatorContext): Promise<ValidationResult> {
    let stdout = context.lastStdout ?? '';

    // If a specific command is defined and runtime is available, run it to capture output
    if (config.command && context.runtime) {
      try {
        const res = await context.runtime.execute(config.command);
        stdout = res.stdout;
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

    const caseSensitive = config.caseSensitive ?? true;
    const haystack = caseSensitive ? stdout : stdout.toLowerCase();
    const needle = caseSensitive ? config.value : config.value.toLowerCase();

    if (!haystack.includes(needle)) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Output did not contain expected text "${config.value}".`,
        expected: config.value,
        actual: stdout,
        code: 'OUTPUT_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Output contained expected text "${config.value}".`,
      expected: config.value,
      actual: stdout,
    };
  }
}
