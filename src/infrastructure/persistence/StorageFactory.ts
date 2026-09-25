/**
 * StorageFactory - Factory for Repository Subsystem with Safe In-Memory Fallback
 * Specified in Sub-Phase 7.5 of Issue #13
 */

import type { DexieOptions } from 'dexie';
import type {
  LabProgressRepository,
  CommandHistoryRepository,
  ConceptMasteryRepository,
  SettingsRepository,
} from '../../domain/persistence/repositories';
import { ShellgroundDatabase, getDatabase } from './ShellgroundDatabase';
import { DexieLabProgressRepository } from './repositories/dexie/DexieLabProgressRepository';
import { DexieCommandHistoryRepository } from './repositories/dexie/DexieCommandHistoryRepository';
import { DexieConceptMasteryRepository } from './repositories/dexie/DexieConceptMasteryRepository';
import { DexieSettingsRepository } from './repositories/dexie/DexieSettingsRepository';
import {
  InMemoryLabProgressRepository,
  InMemoryCommandHistoryRepository,
  InMemoryConceptMasteryRepository,
  InMemorySettingsRepository,
} from './repositories/memory/InMemoryRepositories';

export interface RepositoryBundle {
  labProgress: LabProgressRepository;
  commandHistory: CommandHistoryRepository;
  conceptMastery: ConceptMasteryRepository;
  settings: SettingsRepository;
  isFallback: boolean;
  database?: ShellgroundDatabase;
}

export interface StorageFactoryOptions {
  dbName?: string;
  forceMemory?: boolean;
  dexieOptions?: DexieOptions;
}

/**
 * Checks whether IndexedDB is available and functional in the current environment
 */
export async function isIndexedDbAvailable(): Promise<boolean> {
  if (typeof indexedDB === 'undefined') {
    return false;
  }
  try {
    const testDbName = `__shellground_test_${Date.now()}__`;
    const req = indexedDB.open(testDbName);
    return await new Promise<boolean>((resolve) => {
      req.onsuccess = () => {
        try {
          req.result.close();
          indexedDB.deleteDatabase(testDbName);
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      req.onerror = () => resolve(false);
      req.onblocked = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Creates the active repository bundle, automatically selecting Dexie IndexedDB
 * or falling back to in-memory repositories if IndexedDB is disabled or unavailable.
 */
export async function createRepositories(
  options: StorageFactoryOptions = {}
): Promise<RepositoryBundle> {
  if (options.forceMemory) {
    return {
      labProgress: new InMemoryLabProgressRepository(),
      commandHistory: new InMemoryCommandHistoryRepository(),
      conceptMastery: new InMemoryConceptMasteryRepository(),
      settings: new InMemorySettingsRepository(),
      isFallback: true,
    };
  }

  const idbAvailable = options.dexieOptions?.indexedDB ? true : await isIndexedDbAvailable();

  if (!idbAvailable) {
    return {
      labProgress: new InMemoryLabProgressRepository(),
      commandHistory: new InMemoryCommandHistoryRepository(),
      conceptMastery: new InMemoryConceptMasteryRepository(),
      settings: new InMemorySettingsRepository(),
      isFallback: true,
    };
  }

  const db = getDatabase(options.dbName ?? 'shellground', options.dexieOptions);

  return {
    labProgress: new DexieLabProgressRepository(db),
    commandHistory: new DexieCommandHistoryRepository(db),
    conceptMastery: new DexieConceptMasteryRepository(db),
    settings: new DexieSettingsRepository(db),
    isFallback: false,
    database: db,
  };
}
