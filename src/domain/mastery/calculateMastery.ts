/**
 * Pure Domain Mastery Calculation Algorithm
 * Specified in Sub-Phase 8.1 of Issue #14 and Sections 6-8 of CURRICULUM.md
 *
 * Purity Rule: Free from UI, storage, side-effects, and external dependencies.
 */

import type { TrainingMode } from '../persistence/models';
import type { MasteryRecord, MasteryState, SessionScoreBreakdown } from './MasteryRecord';

export interface SessionMasteryInput {
  completed: boolean;
  hintsUsed: number;
  attempts: number;
  errorCount?: number;
  mode?: TrainingMode;
  durationMs?: number;
}

/**
 * Calculates deterministic session-level score breakdown (0 - 100 and normalized 0.0 - 1.0)
 *
 * Weightings:
 * - Base completion: 40% (40 pts)
 * - Hint penalty factor: -10% per hint, capped at -25 pts
 * - Attempt & retry efficiency: 30% (30 pts on attempt 1, decaying on retries)
 * - Error rate & execution fluency: 30% (30 pts on 0 errors, decaying on errors)
 * - Blind mode bonus: +5 pts
 */
export function calculateSessionScore(input: SessionMasteryInput): SessionScoreBreakdown {
  // 1. Base completion weight (40%)
  const completionScore = input.completed ? 40 : 0;

  // 2. Hint penalty factor (-10% to -25% per unlocked hint)
  const hintPenalty = Math.min(25, Math.max(0, input.hintsUsed * 10));

  // 3. Attempt count & retry efficiency factor (30%)
  let attemptScore = 0;
  if (input.completed) {
    if (input.attempts <= 1) {
      attemptScore = 30;
    } else if (input.attempts === 2) {
      attemptScore = 22;
    } else if (input.attempts === 3) {
      attemptScore = 15;
    } else {
      attemptScore = Math.max(5, 30 - (input.attempts - 1) * 8);
    }
  } else {
    attemptScore = Math.max(0, 10 - input.attempts * 2);
  }

  // 4. Error rate & execution fluency factor (30%)
  const errors = Math.max(0, input.errorCount ?? 0);
  let fluencyScore = 0;
  if (errors === 0) {
    fluencyScore = 30;
  } else if (errors === 1) {
    fluencyScore = 22;
  } else if (errors === 2) {
    fluencyScore = 15;
  } else {
    fluencyScore = Math.max(0, 30 - errors * 6);
  }

  // 5. Training mode adjustment (+5 bonus for blind independent solve)
  const modeBonus = input.completed && input.mode === 'blind' ? 5 : 0;

  // 6. Aggregate and clamp score to [0, 100]
  const rawTotal = completionScore - hintPenalty + attemptScore + fluencyScore + modeBonus;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));
  const normalizedScore = Number((totalScore / 100).toFixed(4));

  return {
    completionScore,
    hintPenalty,
    attemptScore,
    fluencyScore,
    modeBonus,
    totalScore,
    normalizedScore,
  };
}

/**
 * Evaluates state transition according to CURRICULUM.md Section 7 rules
 */
export function evaluateMasteryTransition(
  encounters: number,
  successes: number,
  blindSuccesses: number,
  score: number,
  currentState: MasteryState
): MasteryState {
  if (currentState === 'stale') {
    // If practicing while stale and succeeding, return to practicing or competent
    if (score >= 0.65 && encounters >= 3 && successes / encounters >= 0.7) {
      return 'competent';
    }
    return 'practicing';
  }

  if (encounters === 0) {
    return 'unseen';
  }

  if (encounters === 1 && successes === 0) {
    return 'introduced';
  }

  const successRate = encounters > 0 ? successes / encounters : 0;

  // Mastered gate: >= 8 encounters, score >= 0.90, success rate >= 0.85, blindSuccesses >= 2
  if (encounters >= 8 && score >= 0.90 && successRate >= 0.85 && blindSuccesses >= 2) {
    return 'mastered';
  }

  // Proficient gate: >= 5 encounters, score >= 0.80, success rate >= 0.80, blindSuccesses >= 1
  if (encounters >= 5 && score >= 0.80 && successRate >= 0.80 && blindSuccesses >= 1) {
    return 'proficient';
  }

  // Competent gate: >= 3 encounters, score >= 0.65, success rate >= 0.70
  if (encounters >= 3 && score >= 0.65 && successRate >= 0.70) {
    return 'competent';
  }

  // Default active training state
  return 'practicing';
}

/**
 * Updates a concept mastery record given a new session outcome
 */
export function updateConceptMastery(
  current: MasteryRecord | undefined,
  conceptId: string,
  session: SessionMasteryInput,
  timestamp: string = new Date().toISOString()
): MasteryRecord {
  const existing: MasteryRecord = current ?? {
    conceptId,
    state: 'unseen',
    score: 0.0,
    encounters: 0,
    successes: 0,
    failures: 0,
    guidedSuccesses: 0,
    blindSuccesses: 0,
    hintsUsed: 0,
    firstSeenAt: timestamp,
    updatedAt: timestamp,
  };

  const sessionScore = calculateSessionScore(session);
  const encounters = existing.encounters + 1;
  const successes = existing.successes + (session.completed ? 1 : 0);
  const failures = existing.failures + (session.completed ? 0 : 1);
  const guidedSuccesses =
    existing.guidedSuccesses + (session.completed && session.mode === 'guided' ? 1 : 0);
  const blindSuccesses =
    existing.blindSuccesses + (session.completed && session.mode === 'blind' ? 1 : 0);
  const hintsUsed = existing.hintsUsed + session.hintsUsed;

  // Score accumulation:
  // First encounter takes session score directly.
  // Subsequent encounters use exponential smoothing (70% previous mastery + 30% recent session performance).
  let newScore: number;
  if (existing.encounters === 0) {
    newScore = sessionScore.normalizedScore;
  } else {
    newScore = Number((existing.score * 0.7 + sessionScore.normalizedScore * 0.3).toFixed(4));
  }
  newScore = Math.max(0.0, Math.min(1.0, newScore));

  const newState = evaluateMasteryTransition(
    encounters,
    successes,
    blindSuccesses,
    newScore,
    existing.state
  );

  return {
    conceptId,
    state: newState,
    score: newScore,
    encounters,
    successes,
    failures,
    guidedSuccesses,
    blindSuccesses,
    hintsUsed,
    firstSeenAt: existing.firstSeenAt ?? timestamp,
    lastPracticedAt: timestamp,
    lastSuccessfulAt: session.completed ? timestamp : existing.lastSuccessfulAt,
    updatedAt: timestamp,
  };
}
