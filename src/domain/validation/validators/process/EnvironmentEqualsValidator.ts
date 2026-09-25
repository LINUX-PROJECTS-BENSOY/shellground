/**
 * EnvironmentEqualsValidator - Verifies environment variable value
 * Supports types: 'environmentEquals' | 'envVarEquals'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface EnvironmentEqualsConfig {
  id?: string;
  type: 'environmentEquals' | 'envVarEquals';
  name: string;
  value: string;
  description?: string;
}

export class EnvironmentEqualsValidator implements Validator<EnvironmentEqualsConfig> {
  public readonly type = 'environmentEquals';

  public async validate(config: EnvironmentEqualsConfig, context: ValidatorContext): Promise<ValidationResult> {
    const actual = await context.getEnv(config.name);

    if (actual === null) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Environment variable "${config.name}" is not set.`,
        expected: config.value,
        actual: null,
        code: 'ENV_NOT_SET',
      };
    }

    if (actual !== config.value) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message:
          config.description ||
          `Expected environment variable "${config.name}" to be "${config.value}", but got "${actual}".`,
        expected: config.value,
        actual,
        code: 'ENV_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Environment variable "${config.name}" has expected value.`,
      expected: config.value,
      actual,
    };
  }
}
