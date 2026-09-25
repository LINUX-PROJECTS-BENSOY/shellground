import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 6 Deterministic Sandbox Reset Conformance', () => {
  const resetModulePath = path.resolve(__dirname, '../../../src/runtime/wasmer/sandbox-reset.ts');
  const serviceModulePath = path.resolve(__dirname, '../../../src/application/labs/LabResetService.ts');

  it('guarantees ZERO eval, new Function, or vm in reset modules', () => {
    const files = [resetModulePath, serviceModulePath];
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

  it('exports all expected reset methods and classes', async () => {
    const resetModule = await import('../../../src/runtime/wasmer/sandbox-reset');
    const serviceModule = await import('../../../src/application/labs/LabResetService');

    expect(resetModule.resetSandbox).toBeDefined();
    expect(resetModule.verifyFixtureIntegrity).toBeDefined();
    expect(resetModule.calculateSha256).toBeDefined();
    expect(serviceModule.LabResetService).toBeDefined();
  });
});
