import { describe, it, expect, vi } from 'vitest';
import type { LabDefinition, ValidatorDefinition } from '../../../src/domain/content/schemas';
import type { ValidatorContext } from '../../../src/domain/validation/Validator';
import { ValidationService } from '../../../src/application/labs/ValidationService';

function createMockContext(overrides: Partial<ValidatorContext> = {}): ValidatorContext {
  return {
    readFile: vi.fn().mockResolvedValue(null),
    fileExists: vi.fn().mockResolvedValue(true),
    readDir: vi.fn().mockResolvedValue([]),
    getCwd: vi.fn().mockResolvedValue('/workspace'),
    getEnv: vi.fn().mockResolvedValue(null),
    lastExitCode: 0,
    lastStdout: '/workspace\n',
    ...overrides,
  };
}

describe('ValidationService', () => {
  const service = new ValidationService();

  const sampleLab: LabDefinition = {
    schemaVersion: 1,
    id: 'lab.test.001',
    version: 1,
    packId: 'pack.test',
    title: 'Test Lab',
    difficulty: 'beginner',
    mission: {
      objective: 'Run pwd to verify current working directory',
    },
    concepts: ['concept.filesystem.cwd'],
    fixture: {
      id: 'fixture.test.default',
      version: 1,
    },
    validators: [
      {
        id: 'v-cwd',
        type: 'cwdEquals',
        path: '/workspace',
      },
      {
        id: 'v-exit',
        type: 'commandExitCode',
        expectedCode: 0,
      },
    ],
  };

  it('evaluates lab validators successfully when all conditions are satisfied', async () => {
    const ctx = createMockContext({
      getCwd: vi.fn().mockResolvedValue('/workspace'),
      lastExitCode: 0,
    });

    const summary = await service.validateLab(sampleLab, ctx);

    expect(summary.passed).toBe(true);
    expect(summary.passedCount).toBe(2);
    expect(summary.failedCount).toBe(0);
    expect(summary.totalCount).toBe(2);
    expect(summary.results.every((r) => r.status === 'pass')).toBe(true);
  });

  it('evaluates lab as failed when at least one validator fails', async () => {
    const ctx = createMockContext({
      getCwd: vi.fn().mockResolvedValue('/wrong/path'),
      lastExitCode: 0,
    });

    const summary = await service.validateLab(sampleLab, ctx);

    expect(summary.passed).toBe(false);
    expect(summary.passedCount).toBe(1);
    expect(summary.failedCount).toBe(1);
    expect(summary.results[0]?.status).toBe('fail');
    expect(summary.results[0]?.code).toBe('CWD_MISMATCH');
    expect(summary.results[1]?.status).toBe('pass');
  });

  it('handles unknown validator types gracefully without crashing', async () => {
    const labWithUnknownValidator: LabDefinition = {
      ...sampleLab,
      validators: [{ id: 'v-unknown', type: 'unknownType' } as unknown as ValidatorDefinition],
    };

    const ctx = createMockContext();
    const summary = await service.validateLab(labWithUnknownValidator, ctx);

    expect(summary.passed).toBe(false);
    expect(summary.results[0]?.code).toBe('UNKNOWN_VALIDATOR_TYPE');
  });

  it('converts validation summary to persisted format matching DATABASE_CONTENT_SCHEMA Section 57', async () => {
    const ctx = createMockContext({
      getCwd: vi.fn().mockResolvedValue('/workspace'),
      lastExitCode: 0,
    });

    const summary = await service.validateLab(sampleLab, ctx);
    const persisted = service.toPersistedSummary(summary);

    expect(persisted.passed).toBe(true);
    expect(persisted.results).toEqual([
      { validatorId: 'v-cwd', passed: true, code: 'PASS' },
      { validatorId: 'v-exit', passed: true, code: 'PASS' },
    ]);
  });
});
