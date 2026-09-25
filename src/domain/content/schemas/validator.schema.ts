/**
 * Declarative Validator Zod Schemas
 * Specified in Section 54-56 of DATABASE_CONTENT_SCHEMA.md
 */

import { z } from 'zod';

export const BaseValidatorSchema = z.object({
  id: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const FileContentEqualsValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('fileContentEquals'),
  path: z.string().min(1),
  value: z.string(),
  normalizeNewlines: z.boolean().default(true).optional(),
  trimTrailingWhitespace: z.boolean().default(true).optional(),
});

export const FileContentContainsValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('fileContentContains'),
  path: z.string().min(1),
  value: z.string(),
  caseSensitive: z.boolean().default(true).optional(),
});

export const FileContentRegexValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('fileContentRegex'),
  path: z.string().min(1),
  pattern: z.string().min(1),
  flags: z.string().optional(),
});

export const FileExistsValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('fileExists'),
  path: z.string().min(1),
});

export const FileNotExistsValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('fileNotExists'),
  path: z.string().min(1),
});

export const FileModeEqualsValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('fileModeEquals'),
  path: z.string().min(1),
  mode: z.string().min(1),
});

export const DirectoryContainsValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('directoryContains'),
  path: z.string().min(1),
  entries: z.array(z.string()),
  exact: z.boolean().default(false).optional(),
});

export const CwdEqualsValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('cwdEquals'),
  path: z.string().min(1),
});

export const EnvironmentEqualsValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('environmentEquals'),
  name: z.string().min(1),
  value: z.string(),
});

export const CommandExitCodeValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('commandExitCode'),
  expectedCode: z.number().int().default(0),
});

export const CommandOutputContainsValidatorSchema = BaseValidatorSchema.extend({
  type: z.literal('commandOutputContains'),
  value: z.string(),
  caseSensitive: z.boolean().default(true).optional(),
});

export const ValidatorSchema = z.discriminatedUnion('type', [
  FileContentEqualsValidatorSchema,
  FileContentContainsValidatorSchema,
  FileContentRegexValidatorSchema,
  FileExistsValidatorSchema,
  FileNotExistsValidatorSchema,
  FileModeEqualsValidatorSchema,
  DirectoryContainsValidatorSchema,
  CwdEqualsValidatorSchema,
  EnvironmentEqualsValidatorSchema,
  CommandExitCodeValidatorSchema,
  CommandOutputContainsValidatorSchema,
]);

export type ValidatorDefinition = z.infer<typeof ValidatorSchema>;
export type FileContentEqualsValidator = z.infer<typeof FileContentEqualsValidatorSchema>;
export type FileContentContainsValidator = z.infer<typeof FileContentContainsValidatorSchema>;
export type FileContentRegexValidator = z.infer<typeof FileContentRegexValidatorSchema>;
export type FileExistsValidator = z.infer<typeof FileExistsValidatorSchema>;
export type DirectoryContainsValidator = z.infer<typeof DirectoryContainsValidatorSchema>;
export type CwdEqualsValidator = z.infer<typeof CwdEqualsValidatorSchema>;
