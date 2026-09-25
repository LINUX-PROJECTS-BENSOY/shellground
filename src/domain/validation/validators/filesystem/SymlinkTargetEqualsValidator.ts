/**
 * SymlinkTargetEqualsValidator - Verifies symlink points to expected target
 * Supports types: 'symlinkTargetEquals'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface SymlinkTargetEqualsConfig {
  id?: string;
  type: 'symlinkTargetEquals';
  path: string;
  target: string;
  description?: string;
}

export class SymlinkTargetEqualsValidator implements Validator<SymlinkTargetEqualsConfig> {
  public readonly type = 'symlinkTargetEquals';

  public async validate(config: SymlinkTargetEqualsConfig, context: ValidatorContext): Promise<ValidationResult> {
    if (!context.getSymlinkTarget) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: 'Symlink validation is not supported in this runtime context.',
        code: 'UNSUPPORTED_OPERATION',
      };
    }

    const actualTarget = await context.getSymlinkTarget(config.path);

    if (actualTarget === null || actualTarget === '') {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Symlink at "${config.path}" does not exist or is not a valid symlink.`,
        expected: config.target,
        actual: null,
        code: 'SYMLINK_NOT_FOUND',
      };
    }

    if (actualTarget !== config.target) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message:
          config.description ||
          `Expected symlink "${config.path}" to point to "${config.target}", but points to "${actualTarget}".`,
        expected: config.target,
        actual: actualTarget,
        code: 'TARGET_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Symlink "${config.path}" correctly points to "${config.target}".`,
      expected: config.target,
      actual: actualTarget,
    };
  }
}
