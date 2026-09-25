/**
 * ProgressService - Application Service for Learner Progress & History
 * Specified in Sub-Phase 7.3 of Issue #13
 */

import type { LabDefinition } from '../../domain/content/schemas';
import type {
  LabProgressRepository,
  CommandHistoryRepository,
  ConceptMasteryRepository,
} from '../../domain/persistence/repositories';
import type {
  LabProgressRecord,
  TrainingMode,
} from '../../domain/persistence/models';

export interface ProgressSummary {
  totalLabsStarted: number;
  totalLabsCompleted: number;
  completionRate: number;
  totalAttempts: number;
  completedLabKeys: string[];
}

export interface PackProgressSummary {
  packId: string;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
}

export class ProgressService {
  constructor(
    private readonly labProgressRepo: LabProgressRepository,
    private readonly commandHistoryRepo?: CommandHistoryRepository,
    private readonly conceptMasteryRepo?: ConceptMasteryRepository
  ) {}

  public getConceptMasteryRepository(): ConceptMasteryRepository | undefined {
    return this.conceptMasteryRepo;
  }

  /**
   * Generates the canonical composite key for a lab record
   * Format: `<packId>::<labId>::v<labVersion>`
   */
  public getLabKey(lab: LabDefinition): string {
    const version = lab.version ?? 1;
    return `${lab.packId}::${lab.id}::v${version}`;
  }

  /**
   * Records a learner launching/starting a lab
   */
  public async startLab(lab: LabDefinition, mode?: TrainingMode): Promise<LabProgressRecord> {
    const labKey = this.getLabKey(lab);
    return this.labProgressRepo.recordAttempt(labKey, {
      labId: lab.id,
      labVersion: Number(lab.version ?? 1),
      packId: lab.packId,
      packVersion: '0.1.0',
      mode,
    });
  }

  /**
   * Records successful completion of a lab
   */
  public async completeLab(
    lab: LabDefinition,
    metrics: { score?: number; durationMs?: number; hintsUsed?: number } = {}
  ): Promise<LabProgressRecord> {
    const labKey = this.getLabKey(lab);
    return this.labProgressRepo.recordCompletion(labKey, metrics);
  }

  /**
   * Retrieves progress record for a specific lab
   */
  public async getLabProgress(lab: LabDefinition): Promise<LabProgressRecord | undefined> {
    const labKey = this.getLabKey(lab);
    return this.labProgressRepo.get(labKey);
  }

  /**
   * Logs a learner terminal command for session auditing
   */
  public async logCommand(
    commandLine: string,
    labId?: string,
    exitCode?: number,
    durationMs?: number
  ): Promise<void> {
    if (!this.commandHistoryRepo) return;
    await this.commandHistoryRepo.add({
      commandLine,
      labId,
      exitCode,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Calculates overall learner progress summary
   */
  public async getOverallSummary(): Promise<ProgressSummary> {
    const all = await this.labProgressRepo.getAll();
    const completed = all.filter((r) => r.status === 'completed');
    const totalAttempts = all.reduce((sum, r) => sum + r.attempts, 0);

    return {
      totalLabsStarted: all.length,
      totalLabsCompleted: completed.length,
      completionRate: all.length > 0 ? Number((completed.length / all.length).toFixed(2)) : 0,
      totalAttempts,
      completedLabKeys: completed.map((r) => r.labKey),
    };
  }

  /**
   * Calculates progress summary for a specific training pack
   */
  public async getPackProgress(packId: string): Promise<PackProgressSummary> {
    const records = await this.labProgressRepo.getByPack(packId);
    const completed = records.filter((r) => r.status === 'completed');

    return {
      packId,
      totalStarted: records.length,
      totalCompleted: completed.length,
      completionRate: records.length > 0 ? Number((completed.length / records.length).toFixed(2)) : 0,
    };
  }
}
