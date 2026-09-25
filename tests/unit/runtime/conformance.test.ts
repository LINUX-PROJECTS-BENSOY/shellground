import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 3 Runtime Architectural Conformance', () => {
  const srcDir = path.resolve(__dirname, '../../../src');
  const runtimeDir = path.resolve(srcDir, 'runtime');

  function getAllSourceFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllSourceFiles(fullPath));
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }

  it('guarantees ZERO imports of @wasmer/sdk outside src/runtime/', () => {
    const allFiles = getAllSourceFiles(srcDir);
    const nonRuntimeFiles = allFiles.filter((f) => !f.startsWith(runtimeDir));

    expect(nonRuntimeFiles.length).toBeGreaterThan(0);

    const violations: { file: string; line: number; content: string }[] = [];
    const wasmerImportRegex = /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|require\s*\(\s*)['"]@wasmer\/sdk['"]/;

    for (const file of nonRuntimeFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (wasmerImportRegex.test(line)) {
          violations.push({
            file: path.relative(srcDir, file),
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('exports all expected public symbols from @runtime index barrel', async () => {
    const runtimeModule = await import('@runtime/index');

    expect(runtimeModule.WasmerShellRuntime).toBeDefined();
  });
});
