import { describe, it, expect, vi } from 'vitest';
import type { ValidatorContext } from '../../../src/domain/validation/Validator';
import { PathExistsValidator } from '../../../src/domain/validation/validators/filesystem/PathExistsValidator';
import { PathMissingValidator } from '../../../src/domain/validation/validators/filesystem/PathMissingValidator';
import { CwdEqualsValidator } from '../../../src/domain/validation/validators/filesystem/CwdEqualsValidator';
import { DirectoryContainsValidator } from '../../../src/domain/validation/validators/filesystem/DirectoryContainsValidator';
import { SymlinkTargetEqualsValidator } from '../../../src/domain/validation/validators/filesystem/SymlinkTargetEqualsValidator';

function createMockContext(overrides: Partial<ValidatorContext> = {}): ValidatorContext {
  return {
    readFile: vi.fn().mockResolvedValue(null),
    fileExists: vi.fn().mockResolvedValue(false),
    readDir: vi.fn().mockResolvedValue(null),
    getCwd: vi.fn().mockResolvedValue('/workspace'),
    getEnv: vi.fn().mockResolvedValue(null),
    getFileMode: vi.fn().mockResolvedValue(null),
    getSymlinkTarget: vi.fn().mockResolvedValue(null),
    getFileHash: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('Filesystem Validators', () => {
  describe('PathExistsValidator', () => {
    const validator = new PathExistsValidator();

    it('passes when target path exists', async () => {
      const ctx = createMockContext({
        fileExists: vi.fn().mockResolvedValue(true),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'pathExists', path: '/workspace/file.txt' },
        ctx
      );

      expect(res.status).toBe('pass');
      expect(ctx.fileExists).toHaveBeenCalledWith('/workspace/file.txt');
    });

    it('fails when target path does not exist', async () => {
      const ctx = createMockContext({
        fileExists: vi.fn().mockResolvedValue(false),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'pathExists', path: '/workspace/missing.txt' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('PATH_NOT_FOUND');
    });

    it('validates symlink kind when specified', async () => {
      const ctx = createMockContext({
        fileExists: vi.fn().mockResolvedValue(true),
        getSymlinkTarget: vi.fn().mockResolvedValue('/target'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'pathExists', path: '/workspace/link', kind: 'symlink' },
        ctx
      );

      expect(res.status).toBe('pass');
    });
  });

  describe('PathMissingValidator', () => {
    const validator = new PathMissingValidator();

    it('passes when target path does not exist', async () => {
      const ctx = createMockContext({
        fileExists: vi.fn().mockResolvedValue(false),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'pathMissing', path: '/workspace/deleted.txt' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when target path still exists', async () => {
      const ctx = createMockContext({
        fileExists: vi.fn().mockResolvedValue(true),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'pathMissing', path: '/workspace/undeleted.txt' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('PATH_STILL_EXISTS');
    });
  });

  describe('CwdEqualsValidator', () => {
    const validator = new CwdEqualsValidator();

    it('passes when cwd matches target path', async () => {
      const ctx = createMockContext({
        getCwd: vi.fn().mockResolvedValue('/workspace/project'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'cwdEquals', path: '/workspace/project' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('normalizes trailing slashes for directory matching', async () => {
      const ctx = createMockContext({
        getCwd: vi.fn().mockResolvedValue('/workspace/project/'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'cwdEquals', path: '/workspace/project' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when cwd does not match', async () => {
      const ctx = createMockContext({
        getCwd: vi.fn().mockResolvedValue('/root'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'cwdEquals', path: '/workspace' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('CWD_MISMATCH');
    });
  });

  describe('DirectoryContainsValidator', () => {
    const validator = new DirectoryContainsValidator();

    it('passes when all specified entries exist in directory', async () => {
      const ctx = createMockContext({
        readDir: vi.fn().mockResolvedValue(['file1.txt', 'file2.txt', 'subdir']),
      });

      const res = await validator.validate(
        {
          id: 'v1',
          type: 'directoryContains',
          path: '/workspace',
          entries: ['file1.txt', 'file2.txt'],
        },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when entries are missing', async () => {
      const ctx = createMockContext({
        readDir: vi.fn().mockResolvedValue(['file1.txt']),
      });

      const res = await validator.validate(
        {
          id: 'v1',
          type: 'directoryContains',
          path: '/workspace',
          entries: ['file1.txt', 'file2.txt'],
        },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('MISSING_ENTRIES');
    });

    it('enforces exact entries when exact=true', async () => {
      const ctx = createMockContext({
        readDir: vi.fn().mockResolvedValue(['file1.txt', 'extra.txt']),
      });

      const res = await validator.validate(
        {
          id: 'v1',
          type: 'directoryContains',
          path: '/workspace',
          entries: ['file1.txt'],
          exact: true,
        },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('EXTRA_ENTRIES');
    });
  });

  describe('SymlinkTargetEqualsValidator', () => {
    const validator = new SymlinkTargetEqualsValidator();

    it('passes when symlink points to expected target', async () => {
      const ctx = createMockContext({
        getSymlinkTarget: vi.fn().mockResolvedValue('/etc/config.json'),
      });

      const res = await validator.validate(
        {
          id: 'v1',
          type: 'symlinkTargetEquals',
          path: '/workspace/link.json',
          target: '/etc/config.json',
        },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when symlink points to wrong target', async () => {
      const ctx = createMockContext({
        getSymlinkTarget: vi.fn().mockResolvedValue('/etc/wrong.json'),
      });

      const res = await validator.validate(
        {
          id: 'v1',
          type: 'symlinkTargetEquals',
          path: '/workspace/link.json',
          target: '/etc/config.json',
        },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('TARGET_MISMATCH');
    });
  });
});
