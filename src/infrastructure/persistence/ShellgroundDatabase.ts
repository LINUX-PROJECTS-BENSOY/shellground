/**
 * ShellgroundDatabase - Client-Side IndexedDB Storage via Dexie
 * Specified in Sub-Phase 7.1 & Sections 4-14 of DATABASE_CONTENT_SCHEMA.md
 */

import Dexie, { type Table, type DexieOptions } from 'dexie';
import type {
  LabProgressRecord,
  CommandHistoryRecord,
  ConceptMasteryRecord,
  SettingRecord,
  SessionRecord,
} from '../../domain/persistence/models';

export class ShellgroundDatabase extends Dexie {
  public labProgress!: Table<LabProgressRecord, string>;
  public commandHistory!: Table<CommandHistoryRecord, number>;
  public conceptMastery!: Table<ConceptMasteryRecord, string>;
  public settings!: Table<SettingRecord, string>;
  public sessions!: Table<SessionRecord, number>;

  constructor(dbName = 'shellground', options?: DexieOptions) {
    super(dbName, options);

    this.version(1).stores({
      labProgress: 'labKey, labId, packId, status, lastCompletedAt',
      commandHistory: '++id, labId, timestamp',
      conceptMastery: 'conceptId, state, score, lastPracticedAt',
      settings: 'key',
      sessions: '++id, sessionId, labId, packId, startedAt, outcome',
    });
  }
}

/**
 * Singleton database instance for application lifecycle
 */
let dbInstance: ShellgroundDatabase | null = null;

export function getDatabase(dbName = 'shellground', options?: DexieOptions): ShellgroundDatabase {
  if (!dbInstance) {
    dbInstance = new ShellgroundDatabase(dbName, options);
  }
  return dbInstance;
}

export function resetDatabaseInstance(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
