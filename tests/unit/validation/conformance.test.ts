import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 5 Outcome Validation Engine Architectural Conformance', () => {
  const domainDir = path.resolve(__dirname, '../../../src/domain/validation');
  const appDir = path.resolve(__dirname, '../../../src/application/labs');

  it('guarantees ZERO executable eval, new Function, or vm in validation engine', () => {
    function getAllTsFiles(dir: string): string[] {
      if (!fs.existsSync(dir)) return [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getAllTsFiles(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const files = [...getAllTsFiles(domainDir), ...getAllTsFiles(appDir)];
    const forbiddenPatterns = [/\beval\s*\(/, /\bnew\s+Function\s*\(/, /\bvm\b/];
    const violations: { file: string; line: number; content: string }[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        for (const pattern of forbiddenPatterns) {
          if (pattern.test(line)) {
            violations.push({
              file: path.basename(file),
              line: index + 1,
              content: line.trim(),
            });
          }
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('exports all expected validation symbols from src/domain/validation/index.ts', async () => {
    const validationModule = await import('../../../src/domain/validation');

    expect(validationModule.ValidatorRegistry).toBeDefined();
    expect(validationModule.RuntimeValidatorContext).toBeDefined();

    // Filesystem validators
    expect(validationModule.PathExistsValidator).toBeDefined();
    expect(validationModule.PathMissingValidator).toBeDefined();
    expect(validationModule.CwdEqualsValidator).toBeDefined();
    expect(validationModule.DirectoryContainsValidator).toBeDefined();
    expect(validationModule.SymlinkTargetEqualsValidator).toBeDefined();

    // Content validators
    expect(validationModule.FileContentEqualsValidator).toBeDefined();
    expect(validationModule.FileContentContainsValidator).toBeDefined();
    expect(validationModule.FileContentRegexValidator).toBeDefined();
    expect(validationModule.FileModeEqualsValidator).toBeDefined();
    expect(validationModule.HashEqualsValidator).toBeDefined();

    // Process validators
    expect(validationModule.StdoutContainsValidator).toBeDefined();
    expect(validationModule.StdoutRegexValidator).toBeDefined();
    expect(validationModule.StderrEmptyValidator).toBeDefined();
    expect(validationModule.CommandExitCodeValidator).toBeDefined();
    expect(validationModule.EnvironmentEqualsValidator).toBeDefined();
  });
});
