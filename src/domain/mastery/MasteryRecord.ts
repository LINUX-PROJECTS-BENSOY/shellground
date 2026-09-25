/**
 * Concept Mastery Record Domain Types
 * Specified in Section 11 of DATABASE_CONTENT_SCHEMA.md and Sub-Phase 8.1 of Issue #14
 */

import type { ConceptMasteryRecord, MasteryState } from '../persistence/models';

export type { MasteryState };
export type MasteryRecord = ConceptMasteryRecord;

export interface SessionScoreBreakdown {
  completionScore: number; // 0 or 40
  hintPenalty: number;     // 0 to 25
  attemptScore: number;    // 0 to 30
  fluencyScore: number;    // 0 to 30
  modeBonus: number;       // e.g. +5 for blind mode
  totalScore: number;      // clamped 0 to 100
  normalizedScore: number; // clamped 0.0 to 1.0
}
