/**
 * Pack Definition Zod Schema
 * Specified in Sections 24 & 25 of DATABASE_CONTENT_SCHEMA.md
 */

import { z } from 'zod';

export const PackSchema = z.object({
  schemaVersion: z.union([z.number(), z.string()]).default(1).optional(),
  id: z.string().min(1),
  version: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['draft', 'experimental', 'stable', 'deprecated']).default('stable').optional(),
  author: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  curriculumTrack: z.string().optional(),
  labs: z.array(z.string().min(1)).min(1, 'Pack must contain at least one lab'),
  conceptCoverage: z.array(z.string()).default([]).optional(),
  minimumAppVersion: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}).optional(),
});

export type PackDefinition = z.infer<typeof PackSchema>;
