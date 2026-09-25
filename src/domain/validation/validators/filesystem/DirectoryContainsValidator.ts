/**
 * DirectoryContainsValidator - Verifies directory contains specified entries
 * Supports types: 'directoryContains'
 */

import type { Validator, ValidatorContext, ValidationResult } from '../../Validator';

export interface DirectoryContainsConfig {
  id?: string;
  type: 'directoryContains';
  path: string;
  entries: string[];
  exact?: boolean;
  description?: string;
}

export class DirectoryContainsValidator implements Validator<DirectoryContainsConfig> {
  public readonly type = 'directoryContains';

  public async validate(config: DirectoryContainsConfig, context: ValidatorContext): Promise<ValidationResult> {
    const actualEntries = await context.readDir(config.path);

    if (actualEntries === null) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message: config.description || `Directory "${config.path}" could not be read or does not exist.`,
        expected: config.entries,
        actual: null,
        code: 'DIRECTORY_READ_FAILED',
      };
    }

    const missingEntries = config.entries.filter((expected) => !actualEntries.includes(expected));

    if (missingEntries.length > 0) {
      return {
        validatorId: config.id,
        type: config.type,
        status: 'fail',
        message:
          config.description ||
          `Directory "${config.path}" is missing expected entries: ${missingEntries.join(', ')}.`,
        expected: config.entries,
        actual: actualEntries,
        code: 'MISSING_ENTRIES',
      };
    }

    if (config.exact) {
      const extraEntries = actualEntries.filter((actual) => !config.entries.includes(actual));
      if (extraEntries.length > 0) {
        return {
          validatorId: config.id,
          type: config.type,
          status: 'fail',
          message:
            config.description ||
            `Directory "${config.path}" contains unexpected extra entries: ${extraEntries.join(', ')}.`,
          expected: config.entries,
          actual: actualEntries,
          code: 'EXTRA_ENTRIES',
        };
      }
    }

    return {
      validatorId: config.id,
      type: config.type,
      status: 'pass',
      message: config.description || `Directory "${config.path}" contains expected entries.`,
      expected: config.entries,
      actual: actualEntries,
    };
  }
}
