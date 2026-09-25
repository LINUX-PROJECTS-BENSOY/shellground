/**
 * DexieSettingsRepository - IndexedDB Implementation of SettingsRepository
 */

import type { ShellgroundDatabase } from '../../ShellgroundDatabase';
import type { SettingsRepository, SettingRecord } from '@domain/persistence';

export class DexieSettingsRepository implements SettingsRepository {
  constructor(private readonly db: ShellgroundDatabase) {}

  public async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const record = await this.db.settings.get(key);
    if (!record) {
      return defaultValue;
    }
    return record.value as T;
  }

  public async set<T>(key: string, value: T): Promise<void> {
    const record: SettingRecord = {
      key,
      value,
      updatedAt: new Date().toISOString(),
    };
    await this.db.settings.put(record);
  }

  public async getAll(): Promise<Record<string, unknown>> {
    const records = await this.db.settings.toArray();
    const map: Record<string, unknown> = {};
    for (const r of records) {
      map[r.key] = r.value;
    }
    return map;
  }

  public async delete(key: string): Promise<void> {
    await this.db.settings.delete(key);
  }
}
