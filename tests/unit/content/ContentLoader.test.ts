import { describe, it, expect } from 'vitest';
import { ContentLoader, ContentValidationError } from '@infrastructure/content/ContentLoader';
import { z } from 'zod';

describe('ContentLoader Unit Tests', () => {
  it('parses valid YAML according to arbitrary schema', () => {
    const yaml = `
name: Shellground
count: 42
tags:
  - linux
  - wasm
`;
    const schema = z.object({
      name: z.string(),
      count: z.number(),
      tags: z.array(z.string()),
    });

    const parsed = ContentLoader.parseYaml(yaml, schema);
    expect(parsed.name).toBe('Shellground');
    expect(parsed.count).toBe(42);
    expect(parsed.tags).toEqual(['linux', 'wasm']);
  });

  it('rejects YAML when schema validation fails with descriptive path in issues', () => {
    const yaml = `
name: Shellground
count: "not-a-number"
`;
    const schema = z.object({
      name: z.string(),
      count: z.number(),
    });

    try {
      ContentLoader.parseYaml(yaml, schema, 'test.yaml');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ContentValidationError);
      const valErr = err as ContentValidationError;
      expect(valErr.issues.length).toBeGreaterThan(0);
      expect(valErr.message).toContain('count');
      expect(valErr.sourceName).toBe('test.yaml');
    }
  });

  it('safely handles multiline strings and YAML blocks', () => {
    const yaml = `
id: sample-fix
version: 1
files:
  - path: /workspace/script.sh
    source:
      type: inline
      content: |
        #!/bin/bash
        echo "Hello, world!"
        exit 0
`;
    const fixture = ContentLoader.loadFixture(yaml);
    expect(fixture.files?.[0]?.source.type).toBe('inline');
    if (fixture.files?.[0]?.source.type === 'inline') {
      expect(fixture.files[0].source.content).toContain('#!/bin/bash');
    }
  });
});
