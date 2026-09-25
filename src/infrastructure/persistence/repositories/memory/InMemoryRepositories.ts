/**
 * In-Memory Fallback Repositories
 * Used when IndexedDB is unavailable (e.g. browser incognito / private mode)
 * Specified in Sub-Phase 7.5 of Issue #13
 */

import type {
  LabProgressRepository,
  CommandHistoryRepository,
  ConceptMasteryRepository,
  SettingsRepository,
  RecordAttemptOptions,
  RecordCompletionOptions,
  LabProgressRecord,
  CommandHistoryRecord,
  ConceptMasteryRecord,
} from '@domain/persistence';

export class InMemoryLabProgressRepository implements LabProgressRepository {
  private records = new Map<string, LabProgressRecord>();

  public async get(labKey: string): Promise<LabProgressRecord | undefined> {
    return this.records.get(labKey);
  }

  public async getAll(): Promise<LabProgressRecord[]> {
    return Array.from(this.records.values());
  }

  public async getByPack(packId: string): Promise<LabProgressRecord[]> {
    return Array.from(this.records.values()).filter((r) => r.packId === packId);
  }

  public async save(record: LabProgressRecord): Promise<void> {
    this.records.set(record.labKey, { ...record });
  }

  public async recordAttempt(
    labKey: string,
    options: RecordAttemptOptions
  ): Promise<LabProgressRecord> {
    const existing = this.records.get(labKey);
    const now = new Date().toISOString();

    if (!existing) {
      const newRecord: LabProgressRecord = {
        labKey,
        labId: options.labId,
        labVersion: options.labVersion,
        packId: options.packId,
        packVersion: options.packVersion,
        status: 'in-progress',
        attempts: 1,
        completions: 0,
        firstAttemptAt: now,
        lastAttemptAt: now,
        lastMode: options.mode,
      };
      this.records.set(labKey, newRecord);
      return newRecord;
    }

    const updated: LabProgressRecord = {
      ...existing,
      status: existing.status === 'completed' ? 'completed' : 'in-progress',
      attempts: existing.attempts + 1,
      lastAttemptAt: now,
      lastMode: options.mode ?? existing.lastMode,
    };
    this.records.set(labKey, updated);
    return updated;
  }

  public async recordCompletion(
    labKey: string,
    options: RecordCompletionOptions
  ): Promise<LabProgressRecord> {
    const existing = this.records.get(labKey);
    const now = new Date().toISOString();

    if (!existing) {
      throw new Error(`Cannot record completion for unstarted lab "${labKey}"`);
    }

    const bestScore =
      options.score !== undefined
        ? Math.max(existing.bestScore ?? 0, options.score)
        : existing.bestScore;

    const bestDurationMs =
      options.durationMs !== undefined
        ? existing.bestDurationMs !== undefined
          ? Math.min(existing.bestDurationMs, options.durationMs)
          : options.durationMs
        : existing.bestDurationMs;

    const lowestHintsUsed =
      options.hintsUsed !== undefined
        ? existing.lowestHintsUsed !== undefined
          ? Math.min(existing.lowestHintsUsed, options.hintsUsed)
          : options.hintsUsed
        : existing.lowestHintsUsed;

    const updated: LabProgressRecord = {
      ...existing,
      status: 'completed',
      completions: existing.completions + 1,
      bestScore,
      bestDurationMs,
      lowestHintsUsed,
      firstCompletedAt: existing.firstCompletedAt ?? now,
      lastCompletedAt: now,
    };

    this.records.set(labKey, updated);
    return updated;
  }
}

export class InMemoryCommandHistoryRepository implements CommandHistoryRepository {
  private history: CommandHistoryRecord[] = [];
  private nextId = 1;

  public async add(record: Omit<CommandHistoryRecord, 'id'>): Promise<number> {
    const id = this.nextId++;
    const item: CommandHistoryRecord = { ...record, id };
    this.history.push(item);
    return id;
  }

  public async getByLab(labId: string): Promise<CommandHistoryRecord[]> {
    return this.history.filter((h) => h.labId === labId);
  }

  public async getRecent(limit = 100): Promise<CommandHistoryRecord[]> {
    return [...this.history].reverse().slice(0, limit);
  }

  public async clear(): Promise<void> {
    this.history = [];
  }
}

export class InMemoryConceptMasteryRepository implements ConceptMasteryRepository {
  private mastery = new Map<string, ConceptMasteryRecord>();

  public async get(conceptId: string): Promise<ConceptMasteryRecord | undefined> {
    return this.mastery.get(conceptId);
  }

  public async getAll(): Promise<ConceptMasteryRecord[]> {
    return Array.from(this.mastery.values());
  }

  public async save(record: ConceptMasteryRecord): Promise<void> {
    this.mastery.set(record.conceptId, { ...record });
  }
}

export class InMemorySettingsRepository implements SettingsRepository {
  private settings = new Map<string, unknown>();

  public async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const val = this.settings.get(key);
    return val !== undefined ? (val as T) : defaultValue;
  }

  public async set<T>(key: string, value: T): Promise<void> {
    this.settings.set(key, value);
  }

  public async getAll(): Promise<Record<string, unknown>> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this.settings.entries()) {
      obj[k] = v;
    }
    return obj;
  }

  public async delete(key: string): Promise<void> {
    this.settings.delete(key);
  }
}
