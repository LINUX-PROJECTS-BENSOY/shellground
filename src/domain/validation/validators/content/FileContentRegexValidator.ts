/**
 * FileContentRegexValidator - Verifies file content matches regular expression
 * Supports types: 'fileContentRegex'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface FileContentRegexConfig {
  id?: string;
  type: 'fileContentRegex';
  path: string;
  pattern: string;
  flags?: string;
  description?: string;
}

export class FileContentRegexValidator implements Validator<FileContentRegexConfig> {
  public readonly type = 'fileContentRegex';

  public async validate(config: FileContentRegexConfig, context: ValidatorContext): Promise<ValidationResult> {
    const rawContent = await context.readFile(config.path);

    if (rawContent === null) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `File "${config.path}" could not be read or does not exist.`,
        expected: config.pattern,
        actual: null,
        code: 'FILE_NOT_FOUND',
      };
    }

    let regex: RegExp;
    try {
      regex = new RegExp(config.pattern, config.flags);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: `Invalid regex pattern "${config.pattern}": ${msg}`,
        expected: config.pattern,
        actual: null,
        code: 'INVALID_REGEX',
      };
    }

    const matches = regex.test(rawContent);

    if (!matches) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `File "${config.path}" does not match pattern /${config.pattern}/${config.flags || ''}.`,
        expected: config.pattern,
        actual: rawContent,
        code: 'PATTERN_MISMATCH',
      };
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `File "${config.path}" matches expected pattern.`,
      expected: config.pattern,
      actual: rawContent,
    };
  }
}
