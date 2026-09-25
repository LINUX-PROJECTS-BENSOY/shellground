import { describe, it, expect } from 'vitest';
import { PackRegistry } from '@infrastructure/content/PackRegistry';
import type { PackDefinition, LabDefinition, FixtureDefinition } from '@domain/content/schemas';

describe('PackRegistry Unit Tests', () => {
  const samplePack: PackDefinition = {
    schemaVersion: 1,
    id: 'pack-1',
    version: '1.0.0',
    name: 'Pack One',
    description: 'First test pack',
    labs: ['lab-1', 'lab-2', 'lab-3'],
  };

  const sampleLab1: LabDefinition = {
    schemaVersion: 1,
    id: 'lab-1',
    version: 1,
    packId: 'pack-1',
    title: 'Lab 1',
    difficulty: 'beginner',
    mission: { objective: 'Do step 1' },
    concepts: ['filesystem.cwd'],
    fixture: { id: 'fix-1', version: 1 },
    validators: [],
  };

  const sampleLab2: LabDefinition = {
    schemaVersion: 1,
    id: 'lab-2',
    version: 1,
    packId: 'pack-1',
    title: 'Lab 2',
    difficulty: 'beginner',
    mission: { objective: 'Do step 2' },
    concepts: ['filesystem.cwd'],
    fixture: { id: 'fix-1', version: 1 },
    validators: [],
  };

  const sampleFix: FixtureDefinition = {
    schemaVersion: 1,
    id: 'fix-1',
    version: 1,
    files: [
      {
        path: '/workspace/inline.txt',
        source: { type: 'inline', content: 'hello inline' },
      },
      {
        path: '/workspace/asset.txt',
        source: { type: 'asset', path: 'files/asset.txt' },
      },
    ],
  };

  it('registers and retrieves packs and labs', () => {
    const registry = new PackRegistry();
    registry.registerPack(samplePack);
    registry.registerLab(sampleLab1);
    registry.registerLab(sampleLab2);
    registry.registerFixture(sampleFix);

    expect(registry.getPack('pack-1')?.name).toBe('Pack One');
    expect(registry.getLab('pack-1', 'lab-1')?.title).toBe('Lab 1');
    expect(registry.listPacks().length).toBe(1);
    expect(registry.listLabs('pack-1').length).toBe(2);
  });

  it('determines next and previous labs in sequence', () => {
    const registry = new PackRegistry();
    registry.registerPack(samplePack);
    registry.registerLab(sampleLab1);
    registry.registerLab(sampleLab2);

    expect(registry.getNextLab('pack-1', 'lab-1')?.id).toBe('lab-2');
    expect(registry.getNextLab('pack-1', 'lab-2')?.id).toBeUndefined(); // lab-3 not registered
    expect(registry.getPreviousLab('pack-1', 'lab-2')?.id).toBe('lab-1');
    expect(registry.getPreviousLab('pack-1', 'lab-1')).toBeUndefined();
  });

  it('hydrates fixture files with asset resolver support', () => {
    const registry = new PackRegistry();
    const resolver = (p: string) => `content for ${p}`;

    const files = registry.buildFixtureFiles(sampleFix, resolver);
    expect(files['/workspace/inline.txt']).toBe('hello inline');
    expect(files['/workspace/asset.txt']).toBe('content for files/asset.txt');
  });

  it('detects dangling references in validateIntegrity', () => {
    const registry = new PackRegistry();
    registry.registerPack(samplePack); // references lab-1, lab-2, lab-3
    registry.registerLab(sampleLab1); // references fix-1, but fix-1 not registered yet

    const result1 = registry.validateIntegrity();
    expect(result1.valid).toBe(false);
    expect(result1.errors).toContain('Pack "pack-1" references missing lab "lab-2"');
    expect(result1.errors).toContain('Pack "pack-1" references missing lab "lab-3"');
    expect(result1.errors).toContain('Lab "lab-1" in pack "pack-1" references missing fixture "fix-1"');
  });
});
