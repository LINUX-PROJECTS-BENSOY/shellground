/**
 * PathExistsValidator - Verifies target path exists
 * Supports types: 'pathExists' | 'fileExists'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface PathExistsConfig {
  id?: string;
  type: 'pathExists' | 'fileExists';
  path: string;
  kind?: 'file' | 'directory' | 'symlink';
  description?: string;
}

export class PathExistsValidator implements Validator<PathExistsConfig> {
  public readonly type = 'pathExists';

  public async validate(config: PathExistsConfig, context: ValidatorContext): Promise<ValidationResult> {
    const exists = await context.fileExists(config.path);

    if (!exists) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Expected path "${config.path}" to exist, but it was not found.`,
        expected: true,
        actual: false,
        code: 'PATH_NOT_FOUND',
      };
    }

    if (config.kind === 'symlink' && context.getSymlinkTarget) {
      const target = await context.getSymlinkTarget(config.path);
      if (target === null || target === '') {
        return {
          validatorId: config.id,
          type: config.type,
          status: 'fail',
          message: config.description || `Expected path "${config.path}" to be a symlink.`,
          expected: 'symlink',
          actual: 'not a symlink',
          code: 'KIND_MISMATCH',
        };
      }
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Path "${config.path}" exists as expected.`,
      expected: true,
      actual: true,
    };
  }
}
