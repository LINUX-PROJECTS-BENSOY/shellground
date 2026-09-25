import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 2 Terminal Architectural Conformance', () => {
  const terminalDir = path.resolve(__dirname, '../../../src/terminal');

  function getAllFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  it('guarantees ZERO imports of @wasmer/sdk in src/terminal', () => {
    const files = getAllFiles(terminalDir);
    expect(files.length).toBeGreaterThan(0);

    const violations: { file: string; line: number; content: string }[] = [];

    const importRegex = /(?:import\s+(?:[\w*\s{},]*\s+from\s+)?|require\s*\(\s*)['"](?:@wasmer\/sdk|@runtime(?:\/.*)?)['"]/;

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (importRegex.test(line)) {
          violations.push({
            file: path.relative(terminalDir, file),
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('exports all expected public symbols from @terminal index barrel', async () => {
    const terminalModule = await import('@terminal/index');

    expect(terminalModule.TerminalController).toBeDefined();
    expect(terminalModule.TerminalView).toBeDefined();
    expect(terminalModule.useTerminal).toBeDefined();
    expect(terminalModule.TerminalAddonManager).toBeDefined();
    expect(terminalModule.MockTerminalProcess).toBeDefined();
    expect(terminalModule.terminalDarkTheme).toBeDefined();
    expect(terminalModule.SHELLGROUND_DARK_THEME).toBeDefined();
    expect(terminalModule.DEFAULT_TERMINAL_CONFIG).toBeDefined();
  });
});
