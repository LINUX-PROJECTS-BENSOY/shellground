/**
 * ValidatorRegistry - Outcome Validator Registration & Lookup
 * Specified in Sub-Phase 5.5 & Section 56 of DATABASE_CONTENT_SCHEMA.md
 */

import type { Validator } from '../Validator';
import { PathExistsValidator } from '../validators/filesystem/PathExistsValidator';
import { PathMissingValidator } from '../validators/filesystem/PathMissingValidator';
import { CwdEqualsValidator } from '../validators/filesystem/CwdEqualsValidator';
import { DirectoryContainsValidator } from '../validators/filesystem/DirectoryContainsValidator';
import { SymlinkTargetEqualsValidator } from '../validators/filesystem/SymlinkTargetEqualsValidator';

import { FileContentEqualsValidator } from '../validators/content/FileContentEqualsValidator';
import { FileContentContainsValidator } from '../validators/content/FileContentContainsValidator';
import { FileContentRegexValidator } from '../validators/content/FileContentRegexValidator';
import { FileModeEqualsValidator } from '../validators/content/FileModeEqualsValidator';
import { HashEqualsValidator } from '../validators/content/HashEqualsValidator';

import { StdoutContainsValidator } from '../validators/process/StdoutContainsValidator';
import { StdoutRegexValidator } from '../validators/process/StdoutRegexValidator';
import { StderrEmptyValidator } from '../validators/process/StderrEmptyValidator';
import { CommandExitCodeValidator } from '../validators/process/CommandExitCodeValidator';
import { EnvironmentEqualsValidator } from '../validators/process/EnvironmentEqualsValidator';

export class ValidatorRegistry {
  private readonly validators = new Map<string, Validator>();

  /**
   * Registers a validator under one or more type names/aliases
   */
  public register(validator: Validator, aliases: string[] = []): this {
    this.validators.set(this.normalizeKey(validator.type), validator);
    for (const alias of aliases) {
      this.validators.set(this.normalizeKey(alias), validator);
    }
    return this;
  }

  /**
   * Retrieves a validator instance by type name (supports camelCase, kebab-case, and registered aliases)
   */
  public get(type: string): Validator | undefined {
    return this.validators.get(this.normalizeKey(type));
  }

  /**
   * Checks whether a validator is registered for the specified type name
   */
  public has(type: string): boolean {
    return this.validators.has(this.normalizeKey(type));
  }

  /**
   * Normalizes a lookup key (lowercase, removes hyphens and underscores)
   */
  private normalizeKey(key: string): string {
    return key.toLowerCase().replace(/[-_]/g, '');
  }

  /**
   * Creates a default registry pre-loaded with all standard outcome validators
   */
  public static createDefault(): ValidatorRegistry {
    const registry = new ValidatorRegistry();

    // Filesystem validators
    registry.register(new PathExistsValidator(), ['fileExists', 'path-exists', 'file-exists']);
    registry.register(new PathMissingValidator(), ['fileNotExists', 'path-missing', 'file-not-exists']);
    registry.register(new CwdEqualsValidator(), ['cwd-equals']);
    registry.register(new DirectoryContainsValidator(), ['directory-contains']);
    registry.register(new SymlinkTargetEqualsValidator(), ['symlink-target-equals']);

    // Content validators
    registry.register(new FileContentEqualsValidator(), ['file-content-equals']);
    registry.register(new FileContentContainsValidator(), ['file-content-contains']);
    registry.register(new FileContentRegexValidator(), ['file-content-regex']);
    registry.register(new FileModeEqualsValidator(), ['file-mode-equals']);
    registry.register(new HashEqualsValidator(), ['hash-equals']);

    // Process & stream validators
    registry.register(new StdoutContainsValidator(), ['commandOutputContains', 'stdout-contains', 'command-output-contains']);
    registry.register(new StdoutRegexValidator(), ['commandOutputRegex', 'stdout-regex']);
    registry.register(new StderrEmptyValidator(), ['stderr-empty']);
    registry.register(new CommandExitCodeValidator(), ['exitCodeEquals', 'command-exit-code', 'exit-code-equals']);
    registry.register(new EnvironmentEqualsValidator(), ['envVarEquals', 'environment-equals', 'env-var-equals']);

    return registry;
  }
}
