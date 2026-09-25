/**
 * FileModeEqualsValidator - Verifies POSIX file permissions mode
 * Supports types: 'fileModeEquals'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface FileModeEqualsConfig {
  id?: string;
  type: 'fileModeEquals';
  path: string;
  mode: string;
  description?: string;
}

export class FileModeEqualsValidator implements Validator<FileModeEqualsConfig> {
  public readonly type = 'fileModeEquals';

  private normalizeMode(mode: string): string {
    // Strip leading zeroes if length > 3, e.g. '0644' -> '644'
    return mode.trim().replace(/^0+/, '').padStart(3, '0');
  }

  public async validate(config: FileModeEqualsConfig, context: ValidatorContext): Promise<ValidationResult> {
    if (!context.getFileMode) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: 'File mode validation is not supported in this runtime context.',
        code: 'UNSUPPORTED_OPERATION',
      };
    }

    const actualMode = await context.getFileMode(config.path);

    if (actualMode === null) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Could not inspect mode of file "${config.path}". File may not exist.`,
        expected: config.mode,
        actual: null,
        code: 'FILE_NOT_FOUND',
      };
    }

    const expected = this.normalizeMode(config.mode);
    const actual = this.normalizeMode(actualMode);

    if (actual !== expected) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Expected file "${config.path}" to have mode "${expected}", but found "${actual}".`,
        expected,
        actual,
        code: 'MODE_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `File "${config.path}" has expected mode "${expected}".`,
      expected,
      actual,
    };
  }
}
