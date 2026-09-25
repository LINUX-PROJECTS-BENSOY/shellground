/**
 * Concept Decay & Spaced Repetition Engine
 * Specified in Sub-Phase 8.2 of Issue #14 and CURRICULUM.md Section 7
 */

import type { MasteryRecord } from './MasteryRecord';

export interface DecayConfig {
  /** Decay rate per 7 days of inactivity (default: 0.05 = 5%/week) */
  decayPerWeek: number;
  /** Days of inactivity after which an active concept becomes stale (default: 30 days) */
  staleInactivityDays: number;
  /** Minimum score below which decaying proficiency degrades state */
  staleScoreThreshold: number;
}

export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  decayPerWeek: 0.05,
  staleInactivityDays: 30,
  staleScoreThreshold: 0.60,
};

/**
 * Calculates time decay for a concept mastery record based on time elapsed since last activity
 */
export function calculateConceptDecay(
  record: MasteryRecord,
  referenceDate: Date = new Date(),
  config: Partial<DecayConfig> = {}
): MasteryRecord {
  // If never practiced or unseen, decay does not apply
  if (!record.lastPracticedAt || record.state === 'unseen') {
    return record;
  }

  const { decayPerWeek, staleInactivityDays } = {
    ...DEFAULT_DECAY_CONFIG,
    ...config,
  };

  const lastPracticeTime = new Date(record.lastPracticedAt).getTime();
  const currentTime = referenceDate.getTime();
  const elapsedMs = Math.max(0, currentTime - lastPracticeTime);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const elapsedDays = elapsedMs / MS_PER_DAY;
  const elapsedWeeks = elapsedDays / 7;

  // Exponential decay over time: score * (1 - decayPerWeek)^weeks
  const decayMultiplier = Math.pow(1 - decayPerWeek, elapsedWeeks);
  const decayedScore = Number(Math.max(0.0, Math.min(1.0, record.score * decayMultiplier)).toFixed(4));

  // Determine state transitions due to decay
  let newState = record.state;
  if (elapsedDays >= staleInactivityDays && record.state !== 'introduced') {
    newState = 'stale';
  }

  return {
    ...record,
    score: decayedScore,
    state: newState,
    updatedAt: referenceDate.toISOString(),
  };
}

/**
 * Computes a spaced repetition review urgency metric (0.0 to 1.0)
 * Higher urgency indicates the concept is at risk of being forgotten.
 */
export function calculateReviewUrgency(
  record: MasteryRecord,
  referenceDate: Date = new Date()
): number {
  if (!record.lastPracticedAt || record.state === 'unseen' || record.state === 'introduced') {
    return 0.0;
  }

  const lastPracticeTime = new Date(record.lastPracticedAt).getTime();
  const elapsedMs = Math.max(0, referenceDate.getTime() - lastPracticeTime);
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  // Concepts with higher previous mastery that are decaying have higher urgency to preserve
  const decayWeight = Math.min(1.0, elapsedDays / 30);
  const scoreGap = 1.0 - record.score;

  // Stale concepts receive an urgency boost
  const staleBonus = record.state === 'stale' ? 0.3 : 0.0;

  const rawUrgency = decayWeight * 0.4 + scoreGap * 0.3 + staleBonus;
  return Number(Math.max(0.0, Math.min(1.0, rawUrgency)).toFixed(4));
}
