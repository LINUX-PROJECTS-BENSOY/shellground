import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 4 Content Schema Architectural Conformance', () => {
  const contentDir = path.resolve(__dirname, '../../../content');
  const infraContentDir = path.resolve(__dirname, '../../../src/infrastructure/content');

  it('guarantees ZERO executable code or eval in content loading infrastructure', () => {
    const files = [
      ...fs.readdirSync(infraContentDir).map((f) => path.join(infraContentDir, f)),
    ].filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

    const violations: { file: string; line: number; content: string }[] = [];
    const forbiddenPatterns = [/\beval\s*\(/, /\bnew\s+Function\s*\(/, /\bvm\b/];

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

  it('exports all expected schema definitions and types from @domain/content/schemas', async () => {
    const schemasModule = await import('@domain/content/schemas');

    expect(schemasModule.LabSchema).toBeDefined();
    expect(schemasModule.FixtureSchema).toBeDefined();
    expect(schemasModule.PackSchema).toBeDefined();
    expect(schemasModule.ConceptSchema).toBeDefined();
    expect(schemasModule.ValidatorSchema).toBeDefined();
  });

  it('ensures content/ directory contains only declarative data formats', () => {
    function scanDirectory(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const nonDataFiles: string[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          nonDataFiles.push(...scanDirectory(fullPath));
        } else if (
          entry.isFile() &&
          !entry.name.endsWith('.yaml') &&
          !entry.name.endsWith('.yml') &&
          !entry.name.endsWith('.json') &&
          !entry.name.endsWith('.md') &&
          !entry.name.endsWith('.gitkeep') &&
          !entry.name.endsWith('.txt')
        ) {
          nonDataFiles.push(entry.name);
        }
      }
      return nonDataFiles;
    }

    const unexpectedFiles = scanDirectory(contentDir);
    expect(unexpectedFiles).toEqual([]);
  });
});
