/**
 * Lab Definition Zod Schema
 * Specified in Sections 26-34 of DATABASE_CONTENT_SCHEMA.md
 */

import { z } from 'zod';
import { ValidatorSchema } from './validator.schema';

export const MissionSchema = z.object({
  objective: z.string().min(1),
  context: z.string().optional(),
  instructions: z.union([z.string(), z.array(z.string())]).optional(),
  constraints: z.array(z.string()).default([]).optional(),
  successDescription: z.string().optional(),
});

export const HintSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  text: z.string().min(1),
  penalty: z.number().nonnegative().default(0).optional(),
  category: z.enum(['conceptual', 'directional', 'specific']).optional(),
});

export const FixtureReferenceSchema = z.object({
  id: z.string().min(1),
  version: z.union([z.number(), z.string()]).default(1).optional(),
});

export const ReferenceSolutionStepSchema = z.object({
  command: z.string().min(1),
  description: z.string().optional(),
});

export const ReferenceSolutionSchema = z.union([
  z.array(z.string().min(1)),
  z.array(ReferenceSolutionStepSchema),
]);

export const LabSchema = z.object({
  schemaVersion: z.union([z.number(), z.string()]).default(1).optional(),
  id: z.string().min(1),
  version: z.union([z.number(), z.string()]).default(1),
  packId: z.string().min(1),
  title: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedMinutes: z.number().positive().optional(),
  initialPrompt: z.string().optional(),
  mission: MissionSchema,
  concepts: z.array(z.string().min(1)).min(1, 'At least one concept is required'),
  prerequisites: z.array(z.string()).default([]).optional(),
  fixture: FixtureReferenceSchema,
  validators: z.array(ValidatorSchema).default([]),
  hints: z.array(HintSchema).default([]).optional(),
  referenceSolution: ReferenceSolutionSchema.optional(),
  protectedPaths: z.array(z.string()).default([]).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}).optional(),
});

export type MissionDefinition = z.infer<typeof MissionSchema>;
export type HintDefinition = z.infer<typeof HintSchema>;
export type FixtureReference = z.infer<typeof FixtureReferenceSchema>;
export type LabDefinition = z.infer<typeof LabSchema>;
