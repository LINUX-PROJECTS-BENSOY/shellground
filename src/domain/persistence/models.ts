/**
 * Persistence Domain Entities & Types
 * Specified in Sections 4-14 of DATABASE_CONTENT_SCHEMA.md
 */

export type TrainingMode =
  | 'guided'
  | 'hinted'
  | 'blind'
  | 'playground'
  | 'incident'
  | 'exam';

export type LabStatus = 'not-started' | 'in-progress' | 'completed';

export interface LabProgressRecord {
  /** Composite key: `<packId>::<labId>::v<labVersion>` */
  labKey: string;

  labId: string;
  labVersion: number;
  packId: string;
  packVersion: string;

  status: LabStatus;

  attempts: number;
  completions: number;

  bestScore?: number;
  bestDurationMs?: number;
  lowestHintsUsed?: number;

  firstAttemptAt?: string;
  lastAttemptAt?: string;
  firstCompletedAt?: string;
  lastCompletedAt?: string;

  lastMode?: TrainingMode;
}

export interface CommandHistoryRecord {
  id?: number;
  labId?: string;
  commandLine: string;
  timestamp: string;
  exitCode?: number;
  durationMs?: number;
}

export type MasteryState =
  | 'unseen'
  | 'introduced'
  | 'practicing'
  | 'competent'
  | 'proficient'
  | 'mastered'
  | 'stale';

export interface ConceptMasteryRecord {
  conceptId: string;
  state: MasteryState;
  score: number; // 0.0 – 1.0

  encounters: number;
  successes: number;
  failures: number;

  guidedSuccesses: number;
  blindSuccesses: number;
  hintsUsed: number;

  firstSeenAt?: string;
  lastPracticedAt?: string;
  lastSuccessfulAt?: string;
  updatedAt: string;
}

export interface SettingRecord {
  key: string;
  value?: unknown;
  updatedAt: string;
}

export type SessionOutcome =
  | 'active'
  | 'passed'
  | 'failed'
  | 'abandoned'
  | 'runtime-error';

export interface SessionRecord {
  id?: number;
  sessionId: string;

  labId: string;
  labVersion: number;
  packId: string;
  packVersion: string;

  mode: TrainingMode;

  startedAt: string;
  endedAt?: string;
  durationMs?: number;

  outcome: SessionOutcome;

  attempts: number;
  hintsUsed: number;
  score?: number;

  validationSummary?: unknown;
}
