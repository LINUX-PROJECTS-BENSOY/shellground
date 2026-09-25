/**
 * ValidationService - Application Service for Lab Validation
 * Specified in Sub-Phase 5.6 of Issue #11
 */

import type { LabDefinition, ValidatorDefinition } from '../../domain/content/schemas';
import type {
  ValidatorContext,
  ValidationResult,
  ValidationSummary,
  PersistedValidationSummary,
} from '../../domain/validation';
import { ValidatorRegistry } from '../../domain/validation/registry/ValidatorRegistry';

export interface ValidationServiceOptions {
  registry?: ValidatorRegistry;
  timeoutMs?: number;
}

export class ValidationService {
  private readonly registry: ValidatorRegistry;
  private readonly defaultTimeoutMs: number;

  constructor(options: ValidationServiceOptions = {}) {
    this.registry = options.registry ?? ValidatorRegistry.createDefault();
    this.defaultTimeoutMs = options.timeoutMs ?? 5000;
  }

  /**
   * Executes validation for an entire lab definition against a ValidatorContext
   */
  public async validateLab(lab: LabDefinition, context: ValidatorContext): Promise<ValidationSummary> {
    const startTime = performance.now();
    const results: ValidationResult[] = [];

    const validators = lab.validators ?? [];

    for (const def of validators) {
      const result = await this.executeSingleValidator(def, context);
      results.push(result);
    }

    const passedCount = results.filter((r) => r.status === 'pass').length;
    const failedCount = results.length - passedCount;
    const passed = results.length === 0 || failedCount === 0;
    const durationMs = Math.round(performance.now() - startTime);

    return {
      passed,
      passedCount,
      failedCount,
      totalCount: results.length,
      results,
      durationMs,
    };
  }

  /**
   * Executes a single validator with timeout protection and error handling
   */
  public async executeSingleValidator(
    def: ValidatorDefinition,
    context: ValidatorContext
  ): Promise<ValidationResult> {
    const validator = this.registry.get(def.type);

    if (!validator) {
      return {
        validatorId: def.id,
        type: def.type,
        status: 'fail',
        message: `Unknown validator type "${def.type}". No registered validator implementation found.`,
        code: 'UNKNOWN_VALIDATOR_TYPE',
      };
    }

    try {
      return await this.withTimeout(
        validator.validate(def, context),
        this.defaultTimeoutMs,
        def
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        validatorId: def.id,
        type: def.type,
        status: 'fail',
        message: `Validator execution encountered an error: ${msg}`,
        code: 'VALIDATOR_ERROR',
      };
    }
  }

  /**
   * Wraps a validation promise with a timeout
   */
  private async withTimeout(
    promise: Promise<ValidationResult>,
    timeoutMs: number,
    def: ValidatorDefinition
  ): Promise<ValidationResult> {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<ValidationResult>((resolve) => {
      timer = setTimeout(() => {
        resolve({
          validatorId: def.id,
          type: def.type,
          status: 'fail',
          message: `Validation timed out after ${timeoutMs}ms.`,
          code: 'VALIDATOR_TIMEOUT',
        });
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  /**
   * Formats a ValidationSummary into PersistedValidationSummary for IndexedDB persistence
   * (DATABASE_CONTENT_SCHEMA.md Section 57)
   */
  public toPersistedSummary(summary: ValidationSummary): PersistedValidationSummary {
    return {
      passed: summary.passed,
      results: summary.results.map((r, index) => ({
        validatorId: r.validatorId || `validator-${index + 1}`,
        passed: r.status === 'pass',
        code: r.code || (r.status === 'pass' ? 'PASS' : 'FAIL'),
      })),
    };
  }
}
