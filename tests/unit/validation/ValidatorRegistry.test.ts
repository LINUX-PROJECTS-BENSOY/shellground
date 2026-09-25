import { describe, it, expect } from 'vitest';
import { ValidatorRegistry } from '../../../src/domain/validation/registry/ValidatorRegistry';

describe('ValidatorRegistry', () => {
  it('instantiates default registry with all expected outcome validators', () => {
    const registry = ValidatorRegistry.createDefault();

    // Filesystem validators
    expect(registry.has('pathExists')).toBe(true);
    expect(registry.has('pathMissing')).toBe(true);
    expect(registry.has('cwdEquals')).toBe(true);
    expect(registry.has('directoryContains')).toBe(true);
    expect(registry.has('symlinkTargetEquals')).toBe(true);

    // Content validators
    expect(registry.has('fileContentEquals')).toBe(true);
    expect(registry.has('fileContentContains')).toBe(true);
    expect(registry.has('fileContentRegex')).toBe(true);
    expect(registry.has('fileModeEquals')).toBe(true);
    expect(registry.has('hashEquals')).toBe(true);

    // Process & stream validators
    expect(registry.has('stdoutContains')).toBe(true);
    expect(registry.has('stdoutRegex')).toBe(true);
    expect(registry.has('stderrEmpty')).toBe(true);
    expect(registry.has('commandExitCode')).toBe(true);
    expect(registry.has('environmentEquals')).toBe(true);
  });

  it('supports aliases and case normalization', () => {
    const registry = ValidatorRegistry.createDefault();

    expect(registry.get('file-exists')).toBeDefined();
    expect(registry.get('fileExists')).toBeDefined();
    expect(registry.get('fileNotExists')).toBeDefined();
    expect(registry.get('file-not-exists')).toBeDefined();
    expect(registry.get('cwd-equals')).toBeDefined();
    expect(registry.get('commandOutputContains')).toBeDefined();
    expect(registry.get('command-exit-code')).toBeDefined();
    expect(registry.get('exitCodeEquals')).toBeDefined();
    expect(registry.get('envVarEquals')).toBeDefined();
  });

  it('returns undefined for unregistered validator types', () => {
    const registry = ValidatorRegistry.createDefault();

    expect(registry.get('nonExistentValidator')).toBeUndefined();
    expect(registry.has('nonExistentValidator')).toBe(false);
  });
});
