/**
 * Recommendation Application Service
 * Specified in Sub-Phase 8.3 of Issue #14 and Section 80 of CURRICULUM.md
 */

import type { LabProgressRepository, ConceptMasteryRepository } from '../../domain/persistence/repositories';
import type { LabDefinition } from '../../domain/content/schemas';
import { calculateReviewUrgency } from '../../domain/mastery';

export type RecommendationReason = 'weak-concept' | 'stale-review' | 'curriculum-next';

export interface LabRecommendation {
  labId: string;
  labTitle: string;
  packId: string;
  reason: RecommendationReason;
  rationale: string;
  targetConceptId?: string;
  priorityScore: number;
}

export class RecommendationService {
  constructor(
    private readonly labProgressRepo: LabProgressRepository,
    private readonly conceptMasteryRepo: ConceptMasteryRepository,
    private readonly labs: LabDefinition[]
  ) {}

  /**
   * Generates prioritized lab recommendations based on learner competency and progress
   */
  public async getRecommendations(limit: number = 3): Promise<LabRecommendation[]> {
    // 1. Fetch progress and mastery datasets
    const [progressRecords, masteryRecords] = await Promise.all([
      this.labProgressRepo.getAll(),
      this.conceptMasteryRepo.getAll(),
    ]);

    const completedLabIds = new Set(
      progressRecords
        .filter((p) => p.status === 'completed')
        .map((p) => p.labId)
    );

    const masteryMap = new Map(masteryRecords.map((m) => [m.conceptId, m]));

    const candidates: LabRecommendation[] = [];

    for (const lab of this.labs) {
      // 2. Prerequisite check: All prerequisites must be completed
      const prereqs = lab.prerequisites ?? [];
      const prerequisitesMet = prereqs.every((reqId) => completedLabIds.has(reqId));
      if (!prerequisitesMet) {
        continue;
      }

      const isCompleted = completedLabIds.has(lab.id);

      if (isCompleted) {
        // Completed labs are only eligible for spaced repetition / stale review
        let highestUrgency = 0;
        let staleConceptId: string | undefined;

        for (const conceptId of lab.concepts) {
          const mastery = masteryMap.get(conceptId);
          if (mastery && (mastery.state === 'stale' || mastery.score < 0.60)) {
            const urgency = calculateReviewUrgency(mastery);
            if (urgency > highestUrgency) {
              highestUrgency = urgency;
              staleConceptId = conceptId;
            }
          }
        }

        if (staleConceptId && highestUrgency > 0.3) {
          candidates.push({
            labId: lab.id,
            labTitle: lab.title,
            packId: lab.packId,
            reason: 'stale-review',
            targetConceptId: staleConceptId,
            priorityScore: 50 + highestUrgency * 30,
            rationale: `Review recommended: Concept '${staleConceptId}' is decaying or stale.`,
          });
        }
      } else {
        // Uncompleted labs
        let weakestScore = 1.0;
        let weakConceptId: string | undefined;

        for (const conceptId of lab.concepts) {
          const mastery = masteryMap.get(conceptId);
          if (mastery && mastery.score < 0.75) {
            if (mastery.score < weakestScore) {
              weakestScore = mastery.score;
              weakConceptId = conceptId;
            }
          }
        }

        if (weakConceptId) {
          // Priority 1: Uncompleted lab targeting weak concept
          candidates.push({
            labId: lab.id,
            labTitle: lab.title,
            packId: lab.packId,
            reason: 'weak-concept',
            targetConceptId: weakConceptId,
            priorityScore: 100 + (1.0 - weakestScore) * 50,
            rationale: `Targeted practice: Strengthens competency in '${weakConceptId}' (currently ${Math.round(
              weakestScore * 100
            )}%).`,
          });
        } else {
          // Priority 2: Next curriculum lab
          candidates.push({
            labId: lab.id,
            labTitle: lab.title,
            packId: lab.packId,
            reason: 'curriculum-next',
            priorityScore: 70,
            rationale: 'Next recommended lab in curriculum progression.',
          });
        }
      }
    }

    // Sort descending by priorityScore
    candidates.sort((a, b) => b.priorityScore - a.priorityScore);

    return candidates.slice(0, limit);
  }
}
