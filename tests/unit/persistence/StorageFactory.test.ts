import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import {
  createRepositories,
  isIndexedDbAvailable,
} from '../../../src/infrastructure/persistence/StorageFactory';

describe('StorageFactory', () => {
  it('correctly detects IndexedDB availability', async () => {
    const available = await isIndexedDbAvailable();
    expect(available).toBe(true);
  });

  it('creates Dexie repositories when IndexedDB is supported', async () => {
    const bundle = await createRepositories({
      dbName: `test_factory_${Date.now()}`,
    });

    expect(bundle.isFallback).toBe(false);
    expect(bundle.database).toBeDefined();
    expect(bundle.labProgress).toBeDefined();

    if (bundle.database) {
      await bundle.database.delete();
    }
  });

  it('falls back to in-memory repositories when forceMemory=true', async () => {
    const bundle = await createRepositories({
      forceMemory: true,
    });

    expect(bundle.isFallback).toBe(true);
    expect(bundle.database).toBeUndefined();
    expect(bundle.labProgress).toBeDefined();
  });
});
