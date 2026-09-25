/**
 * FileContentContainsValidator - Verifies file content contains expected substring
 * Supports types: 'fileContentContains'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface FileContentContainsConfig {
  id?: string;
  type: 'fileContentContains';
  path: string;
  value: string;
  caseSensitive?: boolean;
  description?: string;
}

export class FileContentContainsValidator implements Validator<FileContentContainsConfig> {
  public readonly type = 'fileContentContains';

  public async validate(config: FileContentContainsConfig, context: ValidatorContext): Promise<ValidationResult> {
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

    const caseSensitive = config.caseSensitive ?? true;
    const haystack = caseSensitive ? rawContent : rawContent.toLowerCase();
    const needle = caseSensitive ? config.value : config.value.toLowerCase();

    if (!haystack.includes(needle)) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `File "${config.path}" does not contain expected substring "${config.value}".`,
        expected: config.value,
        actual: rawContent,
        code: 'SUBSTRING_NOT_FOUND',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `File "${config.path}" contains expected substring.`,
      expected: config.value,
      actual: rawContent,
    };
  }
}
