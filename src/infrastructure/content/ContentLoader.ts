/**
 * ContentLoader - Safe Declarative YAML/JSON Parser & Validator
 * Specified in Sub-Phase 4.2 of Issue #10
 * 
 * Safety Rule: Pure declarative data parsing. Arbitrary code execution is strictly forbidden.
 */

import yaml from 'js-yaml';
import type { ZodType, ZodIssue } from 'zod';
import {
  LabSchema,
  FixtureSchema,
  PackSchema,
  ConceptSchema,
  type LabDefinition,
  type FixtureDefinition,
  type PackDefinition,
  type ConceptDefinition,
} from '../../domain/content/schemas';

export class ContentValidationError extends Error {
  public readonly issues: ZodIssue[];
  public readonly sourceName?: string;

  constructor(message: string, issues: ZodIssue[] = [], sourceName?: string) {
    super(message);
    this.name = 'ContentValidationError';
    this.issues = issues;
    this.sourceName = sourceName;
  }
}

export class ContentLoader {
  /**
   * Safely parses YAML string without evaluating arbitrary code,
   * then validates the resulting object against the provided Zod schema.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static parseYaml<T>(yamlText: string, schema: ZodType<T, any, any>, sourceName?: string): T {
    let parsed: unknown;

    try {
      // js-yaml load uses default safe schema preventing any code execution
      parsed = yaml.load(yamlText, { json: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ContentValidationError(
        `Failed to parse YAML${sourceName ? ` in "${sourceName}"` : ''}: ${msg}`,
        [],
        sourceName
      );
    }

    if (parsed === null || parsed === undefined || typeof parsed !== 'object') {
      throw new ContentValidationError(
        `Parsed YAML${sourceName ? ` in "${sourceName}"` : ''} must be an object, received ${typeof parsed}`,
        [],
        sourceName
      );
    }

    const result = schema.safeParse(parsed);

    if (!result.success) {
      const formattedIssues = result.error.issues
        .map((issue) => `  - [${issue.path.join('.') || 'root'}]: ${issue.message}`)
        .join('\n');

      const message = `Validation error${sourceName ? ` in "${sourceName}"` : ''}:\n${formattedIssues}`;
      throw new ContentValidationError(message, result.error.issues, sourceName);
    }

    return result.data;
  }

  /**
   * Parses and validates a Lab YAML document
   */
  public static loadLab(yamlText: string, sourceName?: string): LabDefinition {
    return this.parseYaml(yamlText, LabSchema, sourceName);
  }

  /**
   * Parses and validates a Fixture YAML document
   */
  public static loadFixture(yamlText: string, sourceName?: string): FixtureDefinition {
    return this.parseYaml(yamlText, FixtureSchema, sourceName);
  }

  /**
   * Parses and validates a Pack YAML document
   */
  public static loadPack(yamlText: string, sourceName?: string): PackDefinition {
    return this.parseYaml(yamlText, PackSchema, sourceName);
  }

  /**
   * Parses and validates a Concept YAML document
   */
  public static loadConcept(yamlText: string, sourceName?: string): ConceptDefinition {
    return this.parseYaml(yamlText, ConceptSchema, sourceName);
  }
}
