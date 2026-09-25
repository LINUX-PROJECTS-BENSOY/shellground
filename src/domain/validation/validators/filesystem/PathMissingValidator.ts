/**
 * PathMissingValidator - Verifies target path does NOT exist (e.g. deleted/removed)
 * Supports types: 'pathMissing' | 'fileNotExists'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface PathMissingConfig {
  id?: string;
  type: 'pathMissing' | 'fileNotExists';
  path: string;
  description?: string;
}

export class PathMissingValidator implements Validator<PathMissingConfig> {
  public readonly type = 'pathMissing';

  public async validate(config: PathMissingConfig, context: ValidatorContext): Promise<ValidationResult> {
    const exists = await context.fileExists(config.path);

    if (exists) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Expected path "${config.path}" to be absent or deleted, but it still exists.`,
        expected: false,
        actual: true,
        code: 'PATH_STILL_EXISTS',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Path "${config.path}" is absent as expected.`,
      expected: false,
      actual: false,
    };
  }
}
