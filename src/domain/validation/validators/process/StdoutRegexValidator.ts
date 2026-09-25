/**
 * StdoutRegexValidator - Verifies stdout matches regular expression pattern
 * Supports types: 'stdoutRegex' | 'commandOutputRegex'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface StdoutRegexConfig {
  id?: string;
  type: 'stdoutRegex' | 'commandOutputRegex';
  pattern: string;
  flags?: string;
  command?: string;
  description?: string;
}

export class StdoutRegexValidator implements Validator<StdoutRegexConfig> {
  public readonly type = 'stdoutRegex';

  public async validate(config: StdoutRegexConfig, context: ValidatorContext): Promise<ValidationResult> {
    let stdout = context.lastStdout ?? '';

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

    let regex: RegExp;
    try {
      regex = new RegExp(config.pattern, config.flags);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: `Invalid regex pattern "${config.pattern}": ${msg}`,
        expected: config.pattern,
        actual: null,
        code: 'INVALID_REGEX',
      };
    }

    if (!regex.test(stdout)) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Output did not match pattern /${config.pattern}/${config.flags || ''}.`,
        expected: config.pattern,
        actual: stdout,
        code: 'OUTPUT_PATTERN_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Output matches pattern /${config.pattern}/ as expected.`,
      expected: config.pattern,
      actual: stdout,
    };
  }
}
