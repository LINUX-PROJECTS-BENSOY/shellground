import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 8 Concept Mastery & Progress Analytics Conformance', () => {
  const targetDirs = [
    path.resolve(__dirname, '../../../src/domain/mastery'),
    path.resolve(__dirname, '../../../src/application/mastery'),
    path.resolve(__dirname, '../../../src/application/recommendations'),
    path.resolve(__dirname, '../../../src/application/diagnostics'),
  ];

  it('guarantees ZERO executable eval, new Function, or vm in mastery & analytics modules', () => {
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

    const files = targetDirs.flatMap((dir) => getAllTsFiles(dir));
    expect(files.length).toBeGreaterThan(0);

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

  it('exports all expected mastery and analytics symbols from domain and application barrels', async () => {
    const domainMastery = await import('../../../src/domain/mastery');
    const appMastery = await import('../../../src/application/mastery');
    const appRecommendations = await import('../../../src/application/recommendations');
    const appDiagnostics = await import('../../../src/application/diagnostics');

    expect(domainMastery.calculateSessionScore).toBeDefined();
    expect(domainMastery.evaluateMasteryTransition).toBeDefined();
    expect(domainMastery.updateConceptMastery).toBeDefined();
    expect(domainMastery.calculateConceptDecay).toBeDefined();
    expect(domainMastery.calculateReviewUrgency).toBeDefined();

    expect(appMastery.MasteryService).toBeDefined();
    expect(appRecommendations.RecommendationService).toBeDefined();
    expect(appDiagnostics.FidelityTelemetryService).toBeDefined();
  });
});
