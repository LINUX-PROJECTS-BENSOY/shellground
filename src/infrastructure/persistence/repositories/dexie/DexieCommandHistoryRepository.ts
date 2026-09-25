/**
 * DexieCommandHistoryRepository - IndexedDB Implementation of CommandHistoryRepository
 */

import type { ShellgroundDatabase } from '../../ShellgroundDatabase';
import type { CommandHistoryRepository } from '@domain/persistence';
import type { CommandHistoryRecord } from '@domain/persistence';

export class DexieCommandHistoryRepository implements CommandHistoryRepository {
  constructor(private readonly db: ShellgroundDatabase) {}

  public async add(record: Omit<CommandHistoryRecord, 'id'>): Promise<number> {
    const id = await this.db.commandHistory.add(record as CommandHistoryRecord);
    return id as number;
  }

  public async getByLab(labId: string): Promise<CommandHistoryRecord[]> {
    return this.db.commandHistory.where('labId').equals(labId).toArray();
  }

  public async getRecent(limit = 100): Promise<CommandHistoryRecord[]> {
    return this.db.commandHistory.reverse().limit(limit).toArray();
  }

  public async clear(): Promise<void> {
    await this.db.commandHistory.clear();
  }
}
