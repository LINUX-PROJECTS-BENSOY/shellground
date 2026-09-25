/**
 * DexieLabProgressRepository - IndexedDB Implementation of LabProgressRepository
 */

import type { ShellgroundDatabase } from '../../ShellgroundDatabase';
import type {
  LabProgressRepository,
  RecordAttemptOptions,
  RecordCompletionOptions,
  LabProgressRecord,
} from '@domain/persistence';

export class DexieLabProgressRepository implements LabProgressRepository {
  constructor(private readonly db: ShellgroundDatabase) {}

  public async get(labKey: string): Promise<LabProgressRecord | undefined> {
    return this.db.labProgress.get(labKey);
  }

  public async getAll(): Promise<LabProgressRecord[]> {
    return this.db.labProgress.toArray();
  }

  public async getByPack(packId: string): Promise<LabProgressRecord[]> {
    return this.db.labProgress.where('packId').equals(packId).toArray();
  }

  public async save(record: LabProgressRecord): Promise<void> {
    await this.db.labProgress.put(record);
  }

  public async recordAttempt(
    labKey: string,
    options: RecordAttemptOptions
  ): Promise<LabProgressRecord> {
    const existing = await this.get(labKey);
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
      await this.save(newRecord);
      return newRecord;
    }

    const updated: LabProgressRecord = {
      ...existing,
      status: existing.status === 'completed' ? 'completed' : 'in-progress',
      attempts: existing.attempts + 1,
      lastAttemptAt: now,
      lastMode: options.mode ?? existing.lastMode,
    };
    await this.save(updated);
    return updated;
  }

  public async recordCompletion(
    labKey: string,
    options: RecordCompletionOptions
  ): Promise<LabProgressRecord> {
    const existing = await this.get(labKey);
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

    await this.save(updated);
    return updated;
  }
}
