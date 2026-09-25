import { describe, it, expect, vi } from 'vitest';
import type { ValidatorContext } from '../../../src/domain/validation/Validator';
import type { ShellRuntime } from '../../../src/runtime/ports/ShellRuntime';
import { StdoutContainsValidator } from '../../../src/domain/validation/validators/process/StdoutContainsValidator';
import { StdoutRegexValidator } from '../../../src/domain/validation/validators/process/StdoutRegexValidator';
import { StderrEmptyValidator } from '../../../src/domain/validation/validators/process/StderrEmptyValidator';
import { CommandExitCodeValidator } from '../../../src/domain/validation/validators/process/CommandExitCodeValidator';
import { EnvironmentEqualsValidator } from '../../../src/domain/validation/validators/process/EnvironmentEqualsValidator';

function createMockContext(overrides: Partial<ValidatorContext> = {}): ValidatorContext {
  return {
    readFile: vi.fn().mockResolvedValue(null),
    fileExists: vi.fn().mockResolvedValue(false),
    readDir: vi.fn().mockResolvedValue(null),
    getCwd: vi.fn().mockResolvedValue('/workspace'),
    getEnv: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('Process & Stream Validators', () => {
  describe('StdoutContainsValidator', () => {
    const validator = new StdoutContainsValidator();

    it('passes when lastStdout contains expected string', async () => {
      const ctx = createMockContext({
        lastStdout: '/workspace/project\n',
      });

      const res = await validator.validate(
        { id: 'v1', type: 'stdoutContains', value: 'project' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when lastStdout does not contain expected string', async () => {
      const ctx = createMockContext({
        lastStdout: '/home/user\n',
      });

      const res = await validator.validate(
        { id: 'v1', type: 'stdoutContains', value: 'project' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('OUTPUT_MISMATCH');
    });

    it('executes command when specified and captures its stdout', async () => {
      const mockRuntime: Partial<ShellRuntime> = {
        execute: vi.fn().mockResolvedValue({ exitCode: 0, stdout: '/var/log', stderr: '' }),
      };

      const ctx = createMockContext({
        runtime: mockRuntime as ShellRuntime,
      });

      const res = await validator.validate(
        { id: 'v1', type: 'stdoutContains', command: 'pwd', value: '/var/log' },
        ctx
      );

      expect(res.status).toBe('pass');
      expect(mockRuntime.execute).toHaveBeenCalledWith('pwd');
    });
  });

  describe('StdoutRegexValidator', () => {
    const validator = new StdoutRegexValidator();

    it('passes when output matches regex pattern', async () => {
      const ctx = createMockContext({
        lastStdout: 'User: root (UID: 0)',
      });

      const res = await validator.validate(
        { id: 'v1', type: 'stdoutRegex', pattern: 'UID:\\s*0' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when output does not match regex pattern', async () => {
      const ctx = createMockContext({
        lastStdout: 'User: guest (UID: 1000)',
      });

      const res = await validator.validate(
        { id: 'v1', type: 'stdoutRegex', pattern: 'UID:\\s*0' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('OUTPUT_PATTERN_MISMATCH');
    });
  });

  describe('StderrEmptyValidator', () => {
    const validator = new StderrEmptyValidator();

    it('passes when stderr is completely empty', async () => {
      const ctx = createMockContext({
        lastStderr: '',
      });

      const res = await validator.validate({ id: 'v1', type: 'stderrEmpty' }, ctx);

      expect(res.status).toBe('pass');
    });

    it('fails when stderr contains error messages', async () => {
      const ctx = createMockContext({
        lastStderr: 'command not found: foo\n',
      });

      const res = await validator.validate({ id: 'v1', type: 'stderrEmpty' }, ctx);

      expect(res.status).toBe('fail');
      expect(res.code).toBe('STDERR_NOT_EMPTY');
    });
  });

  describe('CommandExitCodeValidator', () => {
    const validator = new CommandExitCodeValidator();

    it('passes when lastExitCode matches expectedCode', async () => {
      const ctx = createMockContext({
        lastExitCode: 0,
      });

      const res = await validator.validate(
        { id: 'v1', type: 'commandExitCode', expectedCode: 0 },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when lastExitCode differs from expectedCode', async () => {
      const ctx = createMockContext({
        lastExitCode: 127,
      });

      const res = await validator.validate(
        { id: 'v1', type: 'commandExitCode', expectedCode: 0 },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('EXIT_CODE_MISMATCH');
    });
  });

  describe('EnvironmentEqualsValidator', () => {
    const validator = new EnvironmentEqualsValidator();

    it('passes when environment variable matches value', async () => {
      const ctx = createMockContext({
        getEnv: vi.fn().mockResolvedValue('production'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'environmentEquals', name: 'NODE_ENV', value: 'production' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when environment variable is missing', async () => {
      const ctx = createMockContext({
        getEnv: vi.fn().mockResolvedValue(null),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'environmentEquals', name: 'API_KEY', value: 'secret' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('ENV_NOT_SET');
    });
  });
});
