/**
 * FileContentEqualsValidator - Verifies exact file content matches expected value
 * Supports types: 'fileContentEquals'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface FileContentEqualsConfig {
  id?: string;
  type: 'fileContentEquals';
  path: string;
  value: string;
  normalizeNewlines?: boolean;
  trimTrailingWhitespace?: boolean;
  description?: string;
}

export class FileContentEqualsValidator implements Validator<FileContentEqualsConfig> {
  public readonly type = 'fileContentEquals';

  private normalize(text: string, normalizeNewlines: boolean, trimTrailing: boolean): string {
    let result = text;
    if (normalizeNewlines) {
      result = result.replace(/\r\n/g, '\n');
    }
    if (trimTrailing) {
      result = result.replace(/[ \t]+$/gm, '').replace(/\n+$/, '');
    }
    return result;
  }

  public async validate(config: FileContentEqualsConfig, context: ValidatorContext): Promise<ValidationResult> {
    const rawContent = await context.readFile(config.path);

    if (rawContent === null) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `File "${config.path}" could not be read or does not exist.`,
        expected: config.value,
        actual: null,
        code: 'FILE_NOT_FOUND',
      };
    }

    const normalizeNewlines = config.normalizeNewlines ?? true;
    const trimTrailing = config.trimTrailingWhitespace ?? true;

    const actual = this.normalize(rawContent, normalizeNewlines, trimTrailing);
    const expected = this.normalize(config.value, normalizeNewlines, trimTrailing);

    if (actual !== expected) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Content of "${config.path}" does not match expected content.`,
        expected,
        actual,
        code: 'CONTENT_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Content of "${config.path}" matches expected value.`,
      expected,
      actual,
    };
  }
}
