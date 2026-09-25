/**
 * Concept Definition Zod Schema
 * Specified in Section 28 of DATABASE_CONTENT_SCHEMA.md
 */

import { z } from 'zod';

export const ConceptSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().optional(),
  relatedCommands: z.array(z.string()).default([]).optional(),
  prerequisites: z.array(z.string()).default([]).optional(),
});

export type ConceptDefinition = z.infer<typeof ConceptSchema>;
