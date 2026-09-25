import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 7 Local-First Persistence Subsystem Conformance', () => {
  const infraDir = path.resolve(__dirname, '../../../src/infrastructure/persistence');
  const domainDir = path.resolve(__dirname, '../../../src/domain/persistence');
  const appDir = path.resolve(__dirname, '../../../src/application/progress');

  it('guarantees ZERO executable eval, new Function, or vm in persistence modules', () => {
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

    const files = [
      ...getAllTsFiles(infraDir),
      ...getAllTsFiles(domainDir),
      ...getAllTsFiles(appDir),
    ];

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

  it('exports all expected persistence symbols from barrel exports', async () => {
    const infraModule = await import('../../../src/infrastructure/persistence');
    const domainModule = await import('../../../src/domain/persistence');

    expect(infraModule.ShellgroundDatabase).toBeDefined();
    expect(infraModule.createRepositories).toBeDefined();
    expect(infraModule.DexieLabProgressRepository).toBeDefined();
    expect(infraModule.InMemoryLabProgressRepository).toBeDefined();
    expect(infraModule.BackupService).toBeDefined();

    expect(domainModule.BackupSchema).toBeDefined();
  });
});
