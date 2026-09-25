/**
 * Repository Port Interfaces for Persistence Subsystem
 * Specified in Sub-Phase 7.2 of Issue #13
 */

import type {
  LabProgressRecord,
  CommandHistoryRecord,
  ConceptMasteryRecord,
  TrainingMode,
} from './models';

export interface RecordAttemptOptions {
  labId: string;
  labVersion: number;
  packId: string;
  packVersion: string;
  mode?: TrainingMode;
}

export interface RecordCompletionOptions {
  score?: number;
  durationMs?: number;
  hintsUsed?: number;
}

export interface LabProgressRepository {
  get(labKey: string): Promise<LabProgressRecord | undefined>;
  getAll(): Promise<LabProgressRecord[]>;
  getByPack(packId: string): Promise<LabProgressRecord[]>;
  save(record: LabProgressRecord): Promise<void>;
  recordAttempt(labKey: string, options: RecordAttemptOptions): Promise<LabProgressRecord>;
  recordCompletion(labKey: string, options: RecordCompletionOptions): Promise<LabProgressRecord>;
}

export interface CommandHistoryRepository {
  add(record: Omit<CommandHistoryRecord, 'id'>): Promise<number>;
  getByLab(labId: string): Promise<CommandHistoryRecord[]>;
  getRecent(limit?: number): Promise<CommandHistoryRecord[]>;
  clear(): Promise<void>;
}

export interface ConceptMasteryRepository {
  get(conceptId: string): Promise<ConceptMasteryRecord | undefined>;
  getAll(): Promise<ConceptMasteryRecord[]>;
  save(record: ConceptMasteryRecord): Promise<void>;
}

export interface SettingsRepository {
  get<T>(key: string, defaultValue?: T): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  getAll(): Promise<Record<string, unknown>>;
  delete(key: string): Promise<void>;
}
