/**
 * HashEqualsValidator - Verifies SHA-256 hash of file content
 * Supports types: 'hashEquals'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface HashEqualsConfig {
  id?: string;
  type: 'hashEquals';
  path: string;
  algorithm?: 'sha256';
  value: string;
  description?: string;
}

export class HashEqualsValidator implements Validator<HashEqualsConfig> {
  public readonly type = 'hashEquals';

  public async validate(config: HashEqualsConfig, context: ValidatorContext): Promise<ValidationResult> {
    if (!context.getFileHash) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: 'File hash validation is not supported in this runtime context.',
        code: 'UNSUPPORTED_OPERATION',
      };
    }

    const actualHash = await context.getFileHash(config.path, config.algorithm || 'sha256');

    if (actualHash === null) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Could not calculate hash for "${config.path}". File may not exist.`,
        expected: config.value.toLowerCase(),
        actual: null,
        code: 'FILE_NOT_FOUND',
      };
    }

    const expected = config.value.toLowerCase().trim();
    const actual = actualHash.toLowerCase().trim();

    if (actual !== expected) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `File "${config.path}" hash "${actual}" did not match expected hash "${expected}".`,
        expected,
        actual,
        code: 'HASH_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `File "${config.path}" matches expected SHA-256 hash.`,
      expected,
      actual,
    };
  }
}
