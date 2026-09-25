import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ContentLoader, ContentValidationError } from '@infrastructure/content/ContentLoader';
import { PackRegistry } from '@infrastructure/content/PackRegistry';

describe('Declarative Content Schema Engine', () => {
  const contentDir = path.resolve(__dirname, '../../content');
  const packsDir = path.join(contentDir, 'packs');
  const conceptsDir = path.join(contentDir, 'concepts');

  it('validates all pack.yaml manifests in content/packs', () => {
    const packDirs = fs.readdirSync(packsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    expect(packDirs.length).toBeGreaterThan(0);

    for (const packName of packDirs) {
      const packFile = path.join(packsDir, packName, 'pack.yaml');
      if (fs.existsSync(packFile)) {
        const text = fs.readFileSync(packFile, 'utf-8');
        const pack = ContentLoader.loadPack(text, packFile);
        expect(pack).toBeDefined();
        expect(pack.id).toBe(packName);
        expect(pack.labs.length).toBeGreaterThan(0);
      }
    }
  });

  it('validates all lab YAML files in content/packs/*/labs', () => {
    const packDirs = fs.readdirSync(packsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    let labCount = 0;

    for (const packName of packDirs) {
      const labsDir = path.join(packsDir, packName, 'labs');
      if (!fs.existsSync(labsDir)) continue;

      const labFiles = fs.readdirSync(labsDir)
        .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

      for (const labFile of labFiles) {
        const fullPath = path.join(labsDir, labFile);
        const text = fs.readFileSync(fullPath, 'utf-8');
        const lab = ContentLoader.loadLab(text, fullPath);

        expect(lab).toBeDefined();
        expect(lab.id).toBeDefined();
        expect(lab.packId).toBe(packName);
        expect(lab.mission.objective).toBeDefined();
        labCount++;
      }
    }

    expect(labCount).toBeGreaterThan(0);
  });

  it('validates all fixture YAML files in content/packs/*/fixtures', () => {
    const packDirs = fs.readdirSync(packsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    let fixtureCount = 0;

    for (const packName of packDirs) {
      const fixturesDir = path.join(packsDir, packName, 'fixtures');
      if (!fs.existsSync(fixturesDir)) continue;

      const fixtureFiles = fs.readdirSync(fixturesDir)
        .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

      for (const fixFile of fixtureFiles) {
        const fullPath = path.join(fixturesDir, fixFile);
        const text = fs.readFileSync(fullPath, 'utf-8');
        const fixture = ContentLoader.loadFixture(text, fullPath);

        expect(fixture).toBeDefined();
        expect(fixture.id).toBeDefined();
        fixtureCount++;
      }
    }

    expect(fixtureCount).toBeGreaterThan(0);
  });

  it('validates all concept YAML files in content/concepts/**', () => {
    function getConceptFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getConceptFiles(full));
        } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
          files.push(full);
        }
      }
      return files;
    }

    const conceptFiles = getConceptFiles(conceptsDir);
    expect(conceptFiles.length).toBeGreaterThan(0);

    for (const cf of conceptFiles) {
      const text = fs.readFileSync(cf, 'utf-8');
      const concept = ContentLoader.loadConcept(text, cf);
      expect(concept).toBeDefined();
      expect(concept.id).toBeDefined();
      expect(concept.category).toBeDefined();
    }
  });

  it('rejects malformed YAML or non-object content with ContentValidationError', () => {
    expect(() => ContentLoader.loadLab('not: [valid: yaml: text')).toThrow(ContentValidationError);
    expect(() => ContentLoader.loadLab('"just a string"')).toThrow(ContentValidationError);
    expect(() => ContentLoader.loadLab('null')).toThrow(ContentValidationError);
  });

  it('rejects lab with missing required fields or empty concepts', () => {
    const invalidLab = `
id: test-lab
title: Missing Mission
`;
    expect(() => ContentLoader.loadLab(invalidLab)).toThrow(ContentValidationError);

    const emptyConceptsLab = `
id: test-lab
version: 1
packId: linux-foundations
title: Test
difficulty: beginner
mission:
  objective: Test objective
fixture:
  id: test-fixture
concepts: []
`;
    expect(() => ContentLoader.loadLab(emptyConceptsLab)).toThrow(ContentValidationError);
  });

  it('rejects unknown validator types with descriptive error', () => {
    const invalidValidatorLab = `
id: test-lab
version: 1
packId: linux-foundations
title: Unknown Validator Test
difficulty: beginner
mission:
  objective: Test
concepts:
  - filesystem.cwd
fixture:
  id: default-workspace
validators:
  - id: bad-val
    type: arbitraryCodeExecution
    code: alert(1)
`;
    expect(() => ContentLoader.loadLab(invalidValidatorLab)).toThrow(ContentValidationError);
  });

  it('loads and registers pack, lab, and fixture into PackRegistry with full integrity', () => {
    const registry = new PackRegistry();

    const packFile = path.join(packsDir, 'linux-foundations', 'pack.yaml');
    const pack = ContentLoader.loadPack(fs.readFileSync(packFile, 'utf-8'));
    registry.registerPack(pack);

    const fixFile = path.join(packsDir, 'linux-foundations', 'fixtures', 'default-workspace.yaml');
    const fix = ContentLoader.loadFixture(fs.readFileSync(fixFile, 'utf-8'));
    registry.registerFixture(fix);

    const labFile = path.join(packsDir, 'linux-foundations', 'labs', '001-where-am-i.yaml');
    const lab = ContentLoader.loadLab(fs.readFileSync(labFile, 'utf-8'));
    registry.registerLab(lab);

    expect(registry.getPack('linux-foundations')).toBeDefined();
    expect(registry.getLab('linux-foundations', '001-where-am-i')).toBeDefined();
    expect(registry.getFixture('default-workspace')).toBeDefined();

    // Verify fixture file builder
    const files = registry.buildFixtureFiles(fix);
    expect(files['/workspace/welcome.txt']).toContain('Welcome to SHELLGROUND');
  });
});
