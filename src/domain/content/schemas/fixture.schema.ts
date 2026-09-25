/**
 * Fixture Definition Zod Schema
 * Specified in Sections 35-43 of DATABASE_CONTENT_SCHEMA.md
 */

import { z } from 'zod';

export const FixtureDirectorySchema = z.object({
  path: z.string().min(1),
  mode: z.string().optional(),
});

export const FixtureFileSourceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('inline'),
    content: z.string(),
  }),
  z.object({
    type: z.literal('asset'),
    path: z.string().min(1),
  }),
]);

export const FixtureFileSchema = z.object({
  path: z.string().min(1),
  source: FixtureFileSourceSchema,
  encoding: z.enum(['utf-8', 'base64']).default('utf-8').optional(),
  mode: z.string().optional(),
  immutable: z.boolean().default(false).optional(),
});

export const FixtureSymlinkSchema = z.object({
  path: z.string().min(1),
  target: z.string().min(1),
});

export const FixtureSchema = z.object({
  schemaVersion: z.union([z.number(), z.string()]).default(1).optional(),
  id: z.string().min(1),
  version: z.union([z.number(), z.string()]).default(1),
  root: z.string().default('/workspace').optional(),
  cwd: z.string().default('/workspace').optional(),
  directories: z.array(FixtureDirectorySchema).default([]).optional(),
  files: z.array(FixtureFileSchema).default([]).optional(),
  symlinks: z.array(FixtureSymlinkSchema).default([]).optional(),
  environment: z.record(z.string(), z.string()).default({}).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type FixtureDirectory = z.infer<typeof FixtureDirectorySchema>;
export type FixtureFile = z.infer<typeof FixtureFileSchema>;
export type FixtureSymlink = z.infer<typeof FixtureSymlinkSchema>;
export type FixtureDefinition = z.infer<typeof FixtureSchema>;
