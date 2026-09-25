import { describe, it, expect, vi } from 'vitest';
import type { ValidatorContext } from '../../../src/domain/validation/Validator';
import { FileContentEqualsValidator } from '../../../src/domain/validation/validators/content/FileContentEqualsValidator';
import { FileContentContainsValidator } from '../../../src/domain/validation/validators/content/FileContentContainsValidator';
import { FileContentRegexValidator } from '../../../src/domain/validation/validators/content/FileContentRegexValidator';
import { FileModeEqualsValidator } from '../../../src/domain/validation/validators/content/FileModeEqualsValidator';
import { HashEqualsValidator } from '../../../src/domain/validation/validators/content/HashEqualsValidator';

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

describe('File Content & Integrity Validators', () => {
  describe('FileContentEqualsValidator', () => {
    const validator = new FileContentEqualsValidator();

    it('passes on exact content match', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue('Hello, World!\n'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileContentEquals', path: '/file.txt', value: 'Hello, World!\n' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('normalizes CRLF newlines and trims trailing whitespace by default', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue('Hello, World!  \r\n'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileContentEquals', path: '/file.txt', value: 'Hello, World!' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when content differs', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue('Wrong content'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileContentEquals', path: '/file.txt', value: 'Expected' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('CONTENT_MISMATCH');
    });

    it('fails when file cannot be read', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue(null),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileContentEquals', path: '/missing.txt', value: 'Expected' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('FILE_NOT_FOUND');
    });
  });

  describe('FileContentContainsValidator', () => {
    const validator = new FileContentContainsValidator();

    it('passes when file contains target substring', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue('The quick brown fox jumps over the lazy dog'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileContentContains', path: '/file.txt', value: 'brown fox' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('supports case-insensitive matching when caseSensitive=false', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue('PORT=8080'),
      });

      const res = await validator.validate(
        {
          id: 'v1',
          type: 'fileContentContains',
          path: '/file.txt',
          value: 'port=8080',
          caseSensitive: false,
        },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when substring is missing', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue('PORT=8080'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileContentContains', path: '/file.txt', value: 'HOST=' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('SUBSTRING_NOT_FOUND');
    });
  });

  describe('FileContentRegexValidator', () => {
    const validator = new FileContentRegexValidator();

    it('passes when content matches regex pattern', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue('IP: 192.168.1.10\n'),
      });

      const res = await validator.validate(
        {
          id: 'v1',
          type: 'fileContentRegex',
          path: '/file.txt',
          pattern: '^IP:\\s+\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
        },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails on regex mismatch', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue('Status: ERROR'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileContentRegex', path: '/file.txt', pattern: 'Status: OK' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('PATTERN_MISMATCH');
    });

    it('handles malformed regex pattern gracefully', async () => {
      const ctx = createMockContext({
        readFile: vi.fn().mockResolvedValue('Test'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileContentRegex', path: '/file.txt', pattern: '[unclosed' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('INVALID_REGEX');
    });
  });

  describe('FileModeEqualsValidator', () => {
    const validator = new FileModeEqualsValidator();

    it('passes when octal mode matches', async () => {
      const ctx = createMockContext({
        getFileMode: vi.fn().mockResolvedValue('644'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileModeEquals', path: '/script.sh', mode: '0644' },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when mode does not match', async () => {
      const ctx = createMockContext({
        getFileMode: vi.fn().mockResolvedValue('644'),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'fileModeEquals', path: '/script.sh', mode: '0755' },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('MODE_MISMATCH');
    });
  });

  describe('HashEqualsValidator', () => {
    const validator = new HashEqualsValidator();

    it('passes when SHA-256 hash matches', async () => {
      const hash = '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae';
      const ctx = createMockContext({
        getFileHash: vi.fn().mockResolvedValue(hash),
      });

      const res = await validator.validate(
        { id: 'v1', type: 'hashEquals', path: '/data.bin', value: hash },
        ctx
      );

      expect(res.status).toBe('pass');
    });

    it('fails when hash does not match', async () => {
      const ctx = createMockContext({
        getFileHash: vi.fn().mockResolvedValue('1111111111111111111111111111111111111111111111111111111111111111'),
      });

      const res = await validator.validate(
        {
          id: 'v1',
          type: 'hashEquals',
          path: '/data.bin',
          value: '2222222222222222222222222222222222222222222222222222222222222222',
        },
        ctx
      );

      expect(res.status).toBe('fail');
      expect(res.code).toBe('HASH_MISMATCH');
    });
  });
});
