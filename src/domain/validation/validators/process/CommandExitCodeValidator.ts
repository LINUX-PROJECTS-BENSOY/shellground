/**
 * CommandExitCodeValidator - Verifies process exit code
 * Supports types: 'commandExitCode' | 'exitCodeEquals'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface CommandExitCodeConfig {
  id?: string;
  type: 'commandExitCode' | 'exitCodeEquals';
  command?: string;
  expectedCode?: number;
  description?: string;
}

export class CommandExitCodeValidator implements Validator<CommandExitCodeConfig> {
  public readonly type = 'commandExitCode';

  public async validate(config: CommandExitCodeConfig, context: ValidatorContext): Promise<ValidationResult> {
    const expected = config.expectedCode ?? 0;
    let actual = context.lastExitCode;

    if (config.command && context.runtime) {
      try {
        const res = await context.runtime.execute(config.command);
        actual = res.exitCode;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          validatorId: config.id,
          type: config.type,
          status: 'fail',
          message: `Failed to execute validation command "${config.command}": ${msg}`,
          expected,
          actual: null,
          code: 'COMMAND_EXECUTION_FAILED',
        };
      }
    }

    if (actual === undefined) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || 'No command execution exit code was available to validate.',
        expected,
        actual: undefined,
        code: 'NO_EXIT_CODE',
      };
    }

    if (actual !== expected) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Expected command to exit with code ${expected}, but got ${actual}.`,
        expected,
        actual,
        code: 'EXIT_CODE_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Command exited with expected code ${expected}.`,
      expected,
      actual,
    };
  }
}
