/**
 * CwdEqualsValidator - Verifies current working directory matches target
 * Supports types: 'cwdEquals'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface CwdEqualsConfig {
  id?: string;
  type: 'cwdEquals';
  path: string;
  description?: string;
}

export class CwdEqualsValidator implements Validator<CwdEqualsConfig> {
  public readonly type = 'cwdEquals';

  private normalize(path: string): string {
    const trimmed = path.trim().replace(/\/+$/, '');
    return trimmed === '' ? '/' : trimmed;
  }

  public async validate(config: CwdEqualsConfig, context: ValidatorContext): Promise<ValidationResult> {
    const actualCwd = await context.getCwd();
    const expected = this.normalize(config.path);
    const actual = this.normalize(actualCwd);

    if (actual !== expected) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Expected working directory "${expected}", but found "${actual}".`,
        expected,
        actual,
        code: 'CWD_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Current working directory is "${expected}" as expected.`,
      expected,
      actual,
    };
  }
}
