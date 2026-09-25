/**
 * Mastery Application Service
 * Specified in Sub-Phase 8.1 & 8.2 of Issue #14 and Section 46 of FULL_ARCHITECTURE.md
 */

import type { ConceptMasteryRepository } from '../../domain/persistence/repositories';
import type {
  MasteryRecord,
  MasteryState,
  SessionMasteryInput,
} from '../../domain/mastery';
import { updateConceptMastery, calculateConceptDecay } from '../../domain/mastery';

export interface MasteryOverview {
  totalTracked: number;
  byState: Record<MasteryState, number>;
  averageScore: number;
  weakestConcepts: MasteryRecord[];
  strongestConcepts: MasteryRecord[];
}

export class MasteryService {
  constructor(private readonly masteryRepo: ConceptMasteryRepository) {}

  /**
   * Records a completed or attempted lab session across all concepts associated with that lab
   */
  public async recordLabOutcome(
    conceptIds: string[],
    session: SessionMasteryInput,
    timestamp: string = new Date().toISOString()
  ): Promise<MasteryRecord[]> {
    const updatedRecords: MasteryRecord[] = [];

    for (const conceptId of conceptIds) {
      const existing = await this.masteryRepo.get(conceptId);
      const updated = updateConceptMastery(existing ?? undefined, conceptId, session, timestamp);
      await this.masteryRepo.save(updated);
      updatedRecords.push(updated);
    }

    return updatedRecords;
  }

  /**
   * Applies time decay across all stored concept mastery records
   */
  public async applyDecay(referenceDate: Date = new Date()): Promise<MasteryRecord[]> {
    const records = await this.masteryRepo.getAll();
    const updatedRecords: MasteryRecord[] = [];

    for (const record of records) {
      const decayed = calculateConceptDecay(record, referenceDate);
      if (decayed.score !== record.score || decayed.state !== record.state) {
        await this.masteryRepo.save(decayed);
      }
      updatedRecords.push(decayed);
    }

    return updatedRecords;
  }

  /**
   * Generates a high-level mastery overview and competency breakdown
   */
  public async getMasteryOverview(): Promise<MasteryOverview> {
    const records = await this.masteryRepo.getAll();

    const byState: Record<MasteryState, number> = {
      unseen: 0,
      introduced: 0,
      practicing: 0,
      competent: 0,
      proficient: 0,
      mastered: 0,
      stale: 0,
    };

    let totalScore = 0;
    for (const record of records) {
      const st = record.state as MasteryState;
      if (st in byState) {
        byState[st] = (byState[st] ?? 0) + 1;
      }
      totalScore += record.score;
    }

    const totalTracked = records.length;
    const averageScore =
      totalTracked > 0 ? Number((totalScore / totalTracked).toFixed(4)) : 0.0;

    // Sort by score ascending for weakest
    const sorted = [...records].sort((a, b) => a.score - b.score);
    const weakestConcepts = sorted.slice(0, 3);
    const strongestConcepts = [...sorted].reverse().slice(0, 3);

    return {
      totalTracked,
      byState,
      averageScore,
      weakestConcepts,
      strongestConcepts,
    };
  }
}
