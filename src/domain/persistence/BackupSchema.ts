/**
 * Backup Zod Schema & Types
 * Specified in Sub-Phase 7.4 of Issue #13
 */

import { z } from 'zod';


export const TrainingModeSchema = z.enum([
  'guided',
  'hinted',
  'blind',
  'playground',
  'incident',
  'exam',
]);

export const LabProgressRecordSchema = z.object({
  labKey: z.string().min(1),
  labId: z.string().min(1),
  labVersion: z.number(),
  packId: z.string().min(1),
  packVersion: z.string(),
  status: z.enum(['not-started', 'in-progress', 'completed']),
  attempts: z.number().int().nonnegative(),
  completions: z.number().int().nonnegative(),
  bestScore: z.number().optional(),
  bestDurationMs: z.number().optional(),
  lowestHintsUsed: z.number().optional(),
  firstAttemptAt: z.string().optional(),
  lastAttemptAt: z.string().optional(),
  firstCompletedAt: z.string().optional(),
  lastCompletedAt: z.string().optional(),
  lastMode: TrainingModeSchema.optional(),
});

export const CommandHistoryRecordSchema = z.object({
  id: z.number().optional(),
  labId: z.string().optional(),
  commandLine: z.string(),
  timestamp: z.string(),
  exitCode: z.number().optional(),
  durationMs: z.number().optional(),
});

export const ConceptMasteryRecordSchema = z.object({
  conceptId: z.string().min(1),
  state: z.enum(['unseen', 'introduced', 'practicing', 'competent', 'proficient', 'mastered', 'stale']),
  score: z.number().min(0).max(1),
  encounters: z.number().int().nonnegative(),
  successes: z.number().int().nonnegative(),
  failures: z.number().int().nonnegative(),
  guidedSuccesses: z.number().int().nonnegative().default(0),
  blindSuccesses: z.number().int().nonnegative().default(0),
  hintsUsed: z.number().int().nonnegative().default(0),
  firstSeenAt: z.string().optional(),
  lastPracticedAt: z.string().optional(),
  lastSuccessfulAt: z.string().optional(),
  updatedAt: z.string(),
});

export const SettingRecordSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  updatedAt: z.string(),
});

export const SessionRecordSchema = z.object({
  id: z.number().optional(),
  sessionId: z.string().min(1),
  labId: z.string().min(1),
  labVersion: z.number().default(1),
  packId: z.string().min(1),
  packVersion: z.string().default('0.1.0'),
  mode: TrainingModeSchema.default('guided'),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  durationMs: z.number().optional(),
  outcome: z.enum(['active', 'passed', 'failed', 'abandoned', 'runtime-error']).default('active'),
  attempts: z.number().default(1),
  hintsUsed: z.number().default(0),
  score: z.number().optional(),
  validationSummary: z.unknown().optional(),
});

export const BackupSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  app: z.literal('shellground'),
  tables: z.object({
    labProgress: z.array(LabProgressRecordSchema).default([]),
    commandHistory: z.array(CommandHistoryRecordSchema).default([]),
    conceptMastery: z.array(ConceptMasteryRecordSchema).default([]),
    settings: z.array(SettingRecordSchema).default([]),
    sessions: z.array(SessionRecordSchema).default([]),
  }),
});

export type ShellgroundBackup = z.infer<typeof BackupSchema>;

