/**
 * BackupService - Client-Side State Export & Restore Engine
 * Specified in Sub-Phase 7.4 of Issue #13
 */

import type { ShellgroundDatabase } from '../ShellgroundDatabase';
import { BackupSchema, type ShellgroundBackup } from '../../../domain/persistence/BackupSchema';
import type {
  LabProgressRecord,
  CommandHistoryRecord,
  ConceptMasteryRecord,
  SettingRecord,
  SessionRecord,
} from '../../../domain/persistence/models';

export interface RestoreResult {
  success: boolean;
  importedRecords: number;
  error?: string;
}

export class BackupService {
  constructor(private readonly db: ShellgroundDatabase) {}

  /**
   * Exports all client-side IndexedDB tables into a validated backup JSON object
   */
  public async exportBackup(): Promise<ShellgroundBackup> {
    const [labProgress, commandHistory, conceptMastery, settings, sessions] = await Promise.all([
      this.db.labProgress.toArray(),
      this.db.commandHistory.toArray(),
      this.db.conceptMastery.toArray(),
      this.db.settings.toArray(),
      this.db.sessions.toArray(),
    ]);

    const backup: ShellgroundBackup = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      app: 'shellground',
      tables: {
        labProgress,
        commandHistory,
        conceptMastery,
        settings,
        sessions,
      },
    };

    return BackupSchema.parse(backup);
  }

  /**
   * Restores tables from a backup object or JSON string after validating schema integrity
   */
  public async restoreBackup(rawBackup: unknown): Promise<RestoreResult> {
    let parsed: unknown = rawBackup;

    if (typeof rawBackup === 'string') {
      try {
        parsed = JSON.parse(rawBackup);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          importedRecords: 0,
          error: `Failed to parse backup JSON string: ${msg}`,
        };
      }
    }

    const validation = BackupSchema.safeParse(parsed);
    if (!validation.success) {
      const issueSummary = validation.error.issues
        .map((i) => `${i.path.join('.') || 'root'}: ${i.message}`)
        .join('; ');
      return {
        success: false,
        importedRecords: 0,
        error: `Backup validation failed: ${issueSummary}`,
      };
    }

    const data = validation.data;
    let totalImported = 0;

    try {
      await this.db.transaction(
        'rw',
        [
          this.db.labProgress,
          this.db.commandHistory,
          this.db.conceptMastery,
          this.db.settings,
          this.db.sessions,
        ],
        async () => {
          // 1. Clear existing tables
          await Promise.all([
            this.db.labProgress.clear(),
            this.db.commandHistory.clear(),
            this.db.conceptMastery.clear(),
            this.db.settings.clear(),
            this.db.sessions.clear(),
          ]);

          // 2. Populate from validated backup
          if (data.tables.labProgress.length > 0) {
            await this.db.labProgress.bulkAdd(data.tables.labProgress as unknown as LabProgressRecord[]);
            totalImported += data.tables.labProgress.length;
          }

          if (data.tables.commandHistory.length > 0) {
            await this.db.commandHistory.bulkAdd(data.tables.commandHistory as unknown as CommandHistoryRecord[]);
            totalImported += data.tables.commandHistory.length;
          }

          if (data.tables.conceptMastery.length > 0) {
            await this.db.conceptMastery.bulkAdd(data.tables.conceptMastery as unknown as ConceptMasteryRecord[]);
            totalImported += data.tables.conceptMastery.length;
          }

          if (data.tables.settings.length > 0) {
            await this.db.settings.bulkAdd(data.tables.settings as unknown as SettingRecord[]);
            totalImported += data.tables.settings.length;
          }

          if (data.tables.sessions.length > 0) {
            await this.db.sessions.bulkAdd(data.tables.sessions as unknown as SessionRecord[]);
            totalImported += data.tables.sessions.length;
          }
        }
      );

      return {
        success: true,
        importedRecords: totalImported,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        importedRecords: 0,
        error: `Database transaction failed during restore: ${msg}`,
      };
    }
  }
}
