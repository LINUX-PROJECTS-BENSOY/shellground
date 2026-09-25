# SHELLGROUND — Database and Content Schema Specification

> **Document:** Database and Content Schema Specification  
> **Project:** SHELLGROUND  
> **Sequence:** 7 of 13  
> **Depends on:** `SHELLGROUND_REQUIREMENTS.md`, `SHELLGROUND_FEATURE_SCOPE.md`, `SHELLGROUND_FULL_ARCHITECTURE.md`, `SHELLGROUND_COMMAND_SUPPORT_MATRIX.md`, `SHELLGROUND_CURRICULUM.md`, `SHELLGROUND_REPOSITORY_STRUCTURE.md`  
> **Status:** Draft Data Baseline  
> **Persistence Model:** Local-first IndexedDB via Dexie  
> **Content Model:** Versioned declarative YAML/JSON validated with Zod

---

# 1. Purpose

This document defines two separate data domains:

```text
A. Mutable learner/application state
B. Immutable/versioned training content
```

Application state lives in IndexedDB. Training content remains version-controlled in the repository.

The design must support:

- local progress persistence;
- session history;
- concept mastery;
- command statistics;
- application settings;
- content/version compatibility;
- declarative packs, labs, fixtures, concepts, validators, and fidelity metadata;
- deterministic lab reconstruction;
- future migrations without silently destroying learner progress.

---

# 2. Data Principles

## DP-001 — Local First

The MVP shall not require a server database.

## DP-002 — Declarative Content

Scenario files are data and must never execute arbitrary JavaScript.

## DP-003 — Stable IDs

Canonical IDs must not depend on filenames.

## DP-004 — Explicit Versioning

Version:

```text
database schema
content schema
packs
labs
fixtures
runtime fidelity
runtime package set
```

## DP-005 — Determinism

A deterministic lab version must always reconstruct the same initial fixture.

## DP-006 — Data Minimization

Persist only data required for training, diagnostics, or settings.

## DP-007 — No Real Secrets

Official content may contain synthetic credentials only.

## DP-008 — Validate Boundaries

All parsed YAML/JSON must be schema-validated before becoming trusted application state.

---

# 3. Persistence Technology

Recommended:

```text
IndexedDB
+
Dexie
```

Rationale:

- native browser database;
- indexed records;
- transactional updates;
- migrations;
- local-first compatibility;
- more appropriate than `localStorage` for long-term progress data.

Recommended database name:

```text
shellground
```

Initial schema version:

```text
1
```

---

# 4. MVP Tables

```text
settings
labProgress
sessions
mastery
commandStats
contentVersions
appMetadata
```

Future optional tables:

```text
recommendations
achievements
examAttempts
importedPacks
syncQueue
```

---

# 5. `settings`

```ts
export interface SettingRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}
```

Primary key:

```text
key
```

Recommended namespaced keys:

```text
ui.theme
ui.fontSize
ui.reducedMotion
terminal.fontSize
terminal.scrollback
training.defaultMode
training.showFidelityBadges
training.confirmReset
diagnostics.verbose
```

Known settings should be validated by typed schemas.

---

# 6. `labProgress`

```ts
export interface LabProgressRecord {
  labKey: string;

  labId: string;
  labVersion: number;
  packId: string;
  packVersion: string;

  status:
    | "not-started"
    | "in-progress"
    | "completed";

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
```

Recommended composite key:

```text
<packId>::<labId>::v<labVersion>
```

Example:

```text
linux-foundations::filesystem.hidden-files::v1
```

A materially changed lab should increment its lab version and receive a new progress key.

---

# 7. Training Modes

```ts
export type TrainingMode =
  | "guided"
  | "hinted"
  | "blind"
  | "playground"
  | "incident"
  | "exam";
```

Not every mode needs to ship in MVP, but the schema should remain forward-compatible.

---

# 8. `sessions`

```ts
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

  outcome:
    | "active"
    | "passed"
    | "failed"
    | "abandoned"
    | "runtime-error";

  attempts: number;
  hintsUsed: number;
  score?: number;

  validationSummary?: PersistedValidationSummary;

  runtimeFingerprint: RuntimeFingerprint;
  contentFingerprint: ContentFingerprint;
}
```

`sessionId` should be generated client-side, preferably UUID v4.

Do not persist full terminal transcripts by default.

---

# 9. Runtime Fingerprint

```ts
export interface RuntimeFingerprint {
  runtimeAdapter: string;
  sdkVersion: string;
  shellPackage: string;
  shellPackageVersion: string;
  fidelityRegistryVersion: string;
}
```

This makes historical session results interpretable after runtime upgrades.

---

# 10. Content Fingerprint

```ts
export interface ContentFingerprint {
  schemaVersion: number;
  packId: string;
  packVersion: string;
  labId: string;
  labVersion: number;
  fixtureId: string;
  fixtureVersion: number;
}
```

---

# 11. `mastery`

```ts
export interface MasteryRecord {
  conceptId: string;

  state:
    | "unseen"
    | "introduced"
    | "practicing"
    | "competent"
    | "proficient"
    | "mastered"
    | "stale";

  score: number;

  encounters: number;
  successes: number;
  failures: number;

  guidedSuccesses: number;
  blindSuccesses: number;
  mixedSuccesses: number;

  hintsUsed: number;

  averageDurationMs?: number;

  firstSeenAt?: string;
  lastPracticedAt?: string;
  lastSuccessfulAt?: string;

  updatedAt: string;
}
```

Persisted mastery score:

```text
0.0 – 1.0
```

The mastery formula belongs to the domain layer, not the database.

---

# 12. `commandStats`

```ts
export interface CommandStatRecord {
  command: string;

  observedUses: number;
  sessionsObserved: number;

  successfulSessions: number;
  failedSessions: number;

  firstObservedAt?: string;
  lastObservedAt?: string;
}
```

Command statistics are learning telemetry only.

They are not a security boundary and do not determine whether a lab passes.

---

# 13. `contentVersions`

```ts
export interface ContentVersionRecord {
  packId: string;

  packVersion: string;
  schemaVersion: number;

  contentHash?: string;

  installedAt: string;
  lastSeenAt: string;
}
```

If multiple pack versions are retained simultaneously, use a composite key such as:

```text
<packId>::<packVersion>
```

---

# 14. `appMetadata`

```ts
export interface AppMetadataRecord {
  key: string;
  value: string | number | boolean;
  updatedAt: string;
}
```

Potential keys:

```text
db.createdAt
db.lastMigrationAt
app.lastVersion
content.lastValidationAt
```

---

# 15. Initial Dexie Schema

Conceptual:

```ts
db.version(1).stores({
  settings: "&key, updatedAt",

  labProgress:
    "&labKey, labId, packId, status, lastAttemptAt, lastCompletedAt",

  sessions:
    "++id, &sessionId, labId, packId, outcome, startedAt, endedAt",

  mastery:
    "&conceptId, state, score, lastPracticedAt, updatedAt",

  commandStats:
    "&command, observedUses, lastObservedAt",

  contentVersions:
    "&packId, packVersion, schemaVersion, lastSeenAt",

  appMetadata:
    "&key, updatedAt"
});
```

Indexes should correspond to real query patterns only.

Expected queries:

```text
recent sessions
completed labs
weak mastery concepts
mastery by state
pack progress
recent attempts
```

---

# 16. Migration Rules

Every incompatible persistence change shall:

1. increment the database version;
2. provide a deterministic migration;
3. preserve learner progress where practical;
4. include automated migration tests;
5. document irreversible changes.

Example:

```text
v1 mastery.score
↓
v2 mastery.score + mastery.state
```

The migration may derive `state` from the existing score instead of deleting data.

---

# 17. Progress Reset Semantics

Application-level reset actions must remain distinct.

## Reset Current Lab

Affects:

```text
runtime/sandbox state only
```

## Reset Training Progress

May clear:

```text
labProgress
sessions
mastery
commandStats
```

## Full Local Reset

May additionally clear:

```text
settings
appMetadata
```

Runtime package caches are separate from SHELLGROUND learner data.

---

# 18. Future Export Format

Future progress export may resemble:

```json
{
  "format": "shellground-progress",
  "version": 1,
  "exportedAt": "2026-09-25T00:00:00Z",
  "appVersion": "0.1.0",
  "progress": [],
  "mastery": []
}
```

Imported progress must be validated before persistence.

---

# 19. Content Model

Canonical content types:

```text
PackDefinition
LabDefinition
FixtureDefinition
ConceptDefinition
ValidatorDefinition
CommandFidelityDefinition
ShellFeatureFidelityDefinition
CurriculumDefinition
ReferenceSolutionDefinition
```

Preferred authoring format:

```text
YAML
```

Generated/tooling formats may use JSON.

---

# 20. Validation Pipeline

```text
YAML
  ↓
safe YAML parser
  ↓
unknown object
  ↓
Zod structural validation
  ↓
typed DTO
  ↓
semantic cross-reference validation
  ↓
trusted domain object
```

Both structural and semantic validation are required.

---

# 21. Structural Validation

Examples:

```text
required field exists
string is string
version is integer
enum value valid
array contains correct types
unknown keys rejected
```

---

# 22. Semantic Validation

Examples:

```text
concept ID exists
fixture reference exists
validator type registered
command dependency exists
lab ID unique
pack ID unique
stable lab does not depend on unsupported command
curriculum references valid labs
reference solution targets valid version
```

---

# 23. Content Schema Version

Initial:

```yaml
schemaVersion: 1
```

Strict validation is preferred for official content.

A typo such as:

```yaml
dificulty: beginner
```

must fail rather than be silently ignored.

---

# 24. Pack Schema

```ts
export interface PackDefinition {
  schemaVersion: 1;

  id: string;
  version: string;

  name: string;
  description: string;

  status:
    | "draft"
    | "stable"
    | "deprecated";

  curriculumTrack: string;

  labs: string[];
  conceptCoverage: string[];

  minimumAppVersion?: string;

  metadata?: PackMetadata;
}
```

Pack IDs:

```text
lowercase
kebab-case
stable
globally unique
```

Example:

```text
linux-foundations
```

Use semantic versioning where practical.

---

# 25. Pack Example

```yaml
schemaVersion: 1

id: linux-foundations
version: 0.1.0

name: Linux Foundations

description: >
  Core Linux shell, filesystem, search, streams,
  text-processing, and introductory troubleshooting labs.

status: stable

curriculumTrack: linux-fundamentals

labs:
  - terminal.where-am-i
  - filesystem.absolute-vs-relative
  - filesystem.hidden-files

conceptCoverage:
  - filesystem.cwd
  - filesystem.absolute-path
  - filesystem.relative-path
  - filesystem.hidden-files
```

---

# 26. Lab Schema

```ts
export interface LabDefinition {
  schemaVersion: 1;

  id: string;
  version: number;
  packId: string;

  title: string;

  difficulty:
    | "beginner"
    | "intermediate"
    | "advanced";

  status:
    | "draft"
    | "experimental"
    | "stable"
    | "deprecated";

  modeSupport: TrainingMode[];

  mission: MissionDefinition;

  concepts: string[];
  prerequisites?: string[];

  fixture: FixtureReference;

  capabilities: LabCapabilities;

  validators: ValidatorDefinition[];

  hints?: HintDefinition[];

  protectedPaths?: string[];

  scoring?: ScoringDefinition;

  metadata: LabMetadata;
}
```

Recommended lab ID:

```text
filesystem.hidden-files
```

Canonical identity:

```text
packId + labId + labVersion
```

---

# 27. Mission Schema

```ts
export interface MissionDefinition {
  objective: string;
  context?: string;
  constraints?: string[];
  successDescription?: string;
}
```

Example:

```yaml
mission:
  context: >
    A hidden evidence file exists somewhere under /opt/archive.

  objective: >
    Locate the file containing ACCESS_GRANTED and print its absolute path.

  constraints:
    - Do not modify the evidence file.

  successDescription: >
    The absolute path of the matching file is printed.
```

---

# 28. Concepts and Prerequisites

Example:

```yaml
concepts:
  - filesystem.hidden-files
  - text.search
  - filesystem.absolute-path

prerequisites:
  - filesystem.cwd
  - filesystem.relative-path
```

Rules:

- concept IDs must exist;
- duplicate IDs rejected;
- at least one concept required;
- prerequisites are soft by default unless curriculum explicitly says otherwise.

---

# 29. Fixture Reference

```ts
export interface FixtureReference {
  id: string;
  version: number;
}
```

Example:

```yaml
fixture:
  id: hidden-evidence
  version: 1
```

---

# 30. Lab Capabilities

```ts
export interface LabCapabilities {
  network: false;
  hostFilesystem: false;

  requiredCommands: string[];

  requiredShellFeatures?: string[];

  requiredFidelity?: Record<
    string,
    "native-wasix" | "simulated"
  >;
}
```

Example:

```yaml
capabilities:
  network: false
  hostFilesystem: false

  requiredCommands:
    - find
    - grep

  requiredShellFeatures:
    - shell.pipe

  requiredFidelity:
    find: native-wasix
    grep: native-wasix
```

Stable content must not require unsupported capabilities.

---

# 31. Hint Schema

```ts
export interface HintDefinition {
  id: string;
  order: number;
  text: string;
  penalty?: number;

  category?:
    | "conceptual"
    | "directional"
    | "specific";
}
```

Example:

```yaml
hints:
  - id: hidden-file
    order: 1
    category: conceptual
    text: Hidden filenames begin with a dot.
    penalty: 5

  - id: recursive-search
    order: 2
    category: directional
    text: Search tools can traverse directory trees.
    penalty: 10
```

Validation rules:

```text
unique ID
unique order
nonnegative penalty
nonempty text
```

---

# 32. Protected Paths

Example:

```yaml
protectedPaths:
  - /opt/archive/.evidence
  - /var/log/original
```

Protected paths are scenario metadata.

Exact enforcement semantics belong to the runtime/scenario implementation.

---

# 33. Scoring Schema

```ts
export interface ScoringDefinition {
  maxScore: number;
  hintPenalty?: number;
  retryPenalty?: number;
  timeBonus?: TimeBonusDefinition;
  minimumPassingScore?: number;
}
```

If scoring is absent:

```text
lab completion is pass/fail
```

Avoid unnecessary scoring complexity in MVP.

---

# 34. Lab Metadata

```ts
export interface LabMetadata {
  estimatedMinutes?: number;
  tags?: string[];
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  runtimeNotes?: string[];
}
```

Dates use ISO 8601.

---

# 35. Fixture Schema

```ts
export interface FixtureDefinition {
  schemaVersion: 1;

  id: string;
  version: number;

  root?: string;

  directories?: FixtureDirectory[];
  files?: FixtureFile[];
  symlinks?: FixtureSymlink[];

  environment?: Record<string, string>;

  cwd?: string;

  metadata?: FixtureMetadata;
}
```

---

# 36. Fixture Directory

```ts
export interface FixtureDirectory {
  path: string;
  mode?: string;
}
```

---

# 37. Fixture File

```ts
export interface FixtureFile {
  path: string;

  source:
    | {
        type: "inline";
        content: string;
      }
    | {
        type: "asset";
        path: string;
      };

  encoding?:
    | "utf-8"
    | "base64";

  mode?: string;

  immutable?: boolean;
}
```

---

# 38. Inline File Example

```yaml
files:
  - path: /workspace/notes.txt
    source:
      type: inline
      content: |
        alpha
        beta
        gamma
```

---

# 39. Asset File Example

```yaml
files:
  - path: /var/log/auth.log
    source:
      type: asset
      path: files/var/log/auth.log
```

Asset paths are repository-relative fixture asset paths, not guest absolute paths.

---

# 40. Symlink Schema

Conditional on runtime fidelity:

```ts
export interface FixtureSymlink {
  path: string;
  target: string;
}
```

---

# 41. Fixture Environment

Example:

```yaml
environment:
  SHELLGROUND_TOKEN: SG-TRAINING-4821
  PROJECT_ENV: training
```

All official fixture secrets must be synthetic.

---

# 42. Fixture CWD

Example:

```yaml
cwd: /home/student
```

The target directory must exist.

---

# 43. Fixture Path Safety

Guest target paths:

- POSIX-style;
- normalized;
- absolute;
- no path traversal.

Reject examples:

```text
../../host
Windows host paths
file:// URLs
```

Repository asset paths must remain inside their fixture asset directory.

---

# 44. Fixture Size Guardrails

Suggested starting limits:

```text
single inline file <= 256 KiB
single asset <= 2 MiB
fixture total <= 10 MiB
```

These are implementation guardrails, not curriculum requirements.

---

# 45. Concept Schema

```ts
export interface ConceptDefinition {
  schemaVersion: 1;

  id: string;
  name: string;
  domain: string;
  description: string;

  prerequisites?: string[];
  relatedCommands?: string[];
  relatedConcepts?: string[];

  fidelityNotes?: string[];

  metadata?: ConceptMetadata;
}
```

Example:

```yaml
schemaVersion: 1

id: streams.pipe

name: Pipe

domain: streams

description: >
  Send standard output from one command to
  standard input of another command.

prerequisites:
  - streams.stdout
  - streams.stdin

relatedCommands:
  - grep
  - sort
  - wc

relatedConcepts:
  - streams.redirect
```

---

# 46. Concept IDs

Recommended format:

```text
domain.name
```

Examples:

```text
filesystem.cwd
text.search
streams.pipe
shell.variables
logs.aggregate
```

Canonical domains:

```text
terminal
filesystem
text
streams
shell
permissions
processes
archives
integrity
logs
networking
administration
troubleshooting
security
forensics
```

---

# 47. Command Fidelity Schema

```ts
export interface CommandFidelityDefinition {
  schemaVersion: 1;

  command: string;

  classification:
    | "native-wasix"
    | "simulated"
    | "unsupported"
    | "unverified";

  productPriority:
    | "P0"
    | "P1"
    | "P2"
    | "P3"
    | "PX";

  source?: RuntimeCommandSource;

  capabilities?: CommandCapabilitySet;

  verifiedTests?: string[];

  knownDifferences?: string[];

  verifiedAt?: string;

  runtimeFingerprint?: RuntimeFingerprint;
}
```

---

# 48. Runtime Command Source

```ts
export interface RuntimeCommandSource {
  kind:
    | "shell-builtin"
    | "package"
    | "simulation";

  package?: string;
  packageVersion?: string;
  binaryPath?: string;
}
```

---

# 49. Command Capabilities

```ts
export interface CommandCapabilitySet {
  stdin?: boolean;
  stdout?: boolean;
  stderr?: boolean;
  filesystem?: boolean;
  recursive?: boolean;
  tty?: boolean;
  processControl?: boolean;
  networking?: boolean;
}
```

---

# 50. Shell Feature Fidelity

Track shell features separately from commands:

```text
shell.pipe
shell.redirect.stdout
shell.redirect.stderr
shell.redirect.append
shell.variables
shell.command-substitution
shell.globbing
shell.exit-status
shell.ctrl-c
```

They use fidelity metadata equivalent to command records.

---

# 51. Validator Schema

Use a discriminated union:

```ts
type ValidatorDefinition =
  | StdoutContainsValidator
  | StdoutRegexValidator
  | PathExistsValidator
  | PathMissingValidator
  | FileContentEqualsValidator
  | FileContentContainsValidator
  | FileContentRegexValidator
  | FileModeEqualsValidator
  | SymlinkTargetEqualsValidator
  | DirectoryContainsValidator
  | CwdEqualsValidator
  | EnvironmentEqualsValidator
  | HashEqualsValidator;
```

Base:

```ts
interface BaseValidator {
  id: string;
  required?: boolean;
  learnerFeedback?: string;
}
```

Default:

```text
required = true
```

---

# 52. Output Validators

```ts
interface StdoutContainsValidator extends BaseValidator {
  type: "stdoutContains";
  value: string;
  caseSensitive?: boolean;
}

interface StdoutRegexValidator extends BaseValidator {
  type: "stdoutRegex";
  pattern: string;
  flags?: string;
}
```

Regex evaluation must use bounded output.

---

# 53. Path Validators

```ts
interface PathExistsValidator extends BaseValidator {
  type: "pathExists";

  path: string;

  kind?:
    | "file"
    | "directory"
    | "symlink";
}

interface PathMissingValidator extends BaseValidator {
  type: "pathMissing";
  path: string;
}
```

---

# 54. Content Validators

```ts
interface FileContentEqualsValidator extends BaseValidator {
  type: "fileContentEquals";
  path: string;
  value: string;
  normalizeNewlines?: boolean;
  trimTrailingWhitespace?: boolean;
}

interface FileContentContainsValidator extends BaseValidator {
  type: "fileContentContains";
  path: string;
  value: string;
  caseSensitive?: boolean;
}

interface FileContentRegexValidator extends BaseValidator {
  type: "fileContentRegex";
  path: string;
  pattern: string;
  flags?: string;
}
```

---

# 55. Metadata/State Validators

```ts
interface FileModeEqualsValidator extends BaseValidator {
  type: "fileModeEquals";
  path: string;
  mode: string;
}

interface SymlinkTargetEqualsValidator extends BaseValidator {
  type: "symlinkTargetEquals";
  path: string;
  target: string;
}

interface DirectoryContainsValidator extends BaseValidator {
  type: "directoryContains";
  path: string;
  entries: string[];
  exact?: boolean;
}

interface CwdEqualsValidator extends BaseValidator {
  type: "cwdEquals";
  path: string;
}

interface EnvironmentEqualsValidator extends BaseValidator {
  type: "environmentEquals";
  name: string;
  value: string;
}

interface HashEqualsValidator extends BaseValidator {
  type: "hashEquals";
  path: string;
  algorithm: "sha256";
  value: string;
}
```

Permission, symlink, and environment validators must be enabled only when corresponding runtime fidelity is adequate.

---

# 56. Validator Safety

Scenario validators may specify data only.

Forbidden:

```text
JavaScript callbacks
module imports
eval strings
host commands
dynamic code
```

Concrete validators are trusted application implementations selected by `type`.

---

# 57. Persisted Validation Summary

```ts
export interface PersistedValidationSummary {
  passed: boolean;

  results: Array<{
    validatorId: string;
    passed: boolean;
    code: string;
  }>;
}
```

Do not persist arbitrary inspected file contents in session history.

---

# 58. Reference Solution Schema

```ts
export interface ReferenceSolutionDefinition {
  schemaVersion: 1;

  labId: string;
  labVersion: number;

  steps: ReferenceSolutionStep[];

  expectedValidation: "pass";
}

type ReferenceSolutionStep =
  | {
      type: "shell";
      input: string;
    }
  | {
      type: "meta";
      action: string;
    };
```

Reference solutions are test artifacts.

They are not necessarily shipped to learner-facing production bundles.

---

# 59. Curriculum Schema

```ts
export interface CurriculumDefinition {
  schemaVersion: 1;

  id: string;
  version: string;

  tracks: CurriculumTrack[];
}

export interface CurriculumTrack {
  id: string;
  name: string;
  stages: CurriculumStage[];
}

export interface CurriculumStage {
  id: string;
  name: string;
  labIds: string[];
  recommendedPrerequisites?: string[];
}
```

Pack and curriculum are intentionally separate:

```text
Pack = available content
Curriculum = recommended sequence
```

---

# 60. Content Hashing

A pack may expose a generated SHA-256 content hash.

Use cases:

- diagnostics;
- cache verification;
- historical fingerprints.

Hash only semantically relevant normalized content.

Generated timestamps should not modify the semantic hash.

---

# 61. Schema Source of Truth

Recommended:

```text
TypeScript + Zod
```

Generate JSON Schema where useful for:

- editor integration;
- YAML validation;
- external tooling.

Avoid manually maintaining two incompatible schema definitions.

---

# 62. Safe YAML Requirements

Use a parser configuration that does not support arbitrary executable constructors or code tags.

Content remains plain declarative data.

---

# 63. Semantic Validation Rules

Content validation must enforce:

```text
pack IDs unique
lab IDs unique within pack
concept IDs globally unique
fixture references valid
validator IDs unique per lab
hint IDs unique per lab
required commands registered
shell features registered
stable labs do not require unsupported commands
prerequisite concepts exist
curriculum references valid labs
reference solutions target valid versions
fixture target paths safe
asset paths contained
```

---

# 64. Stable vs Experimental Content

Stable labs may not depend on:

```text
unsupported
unverified P0 capabilities
```

Experimental labs may reference unverified behavior during development but must not be promoted until runtime evidence exists.

---

# 65. Content Versioning Rules

## Pack

Semantic version:

```text
0.1.0
1.0.0
```

## Lab

Integer:

```text
1
2
3
```

## Fixture

Integer.

## Schema

Integer.

## Fidelity Registry

Explicit version tied to verification state.

---

# 66. Historical Integrity

Session records preserve:

```text
pack version
lab version
fixture version
runtime fingerprint
content fingerprint
```

This allows later interpretation of a historical completion even after the project evolves.

---

# 67. Session Semantics

Outcomes:

```text
passed
failed
abandoned
runtime-error
```

A runtime crash is never counted as learner failure.

One session may contain multiple validation attempts.

A new lab launch generally creates a new session.

---

# 68. Completion Semantics

A graded lab completes only when all required validators pass.

A shell exiting is not equivalent to completing the mission.

---

# 69. Best Result Rules

Update:

```text
bestScore
```

only if new successful score is higher.

Compare:

```text
bestDurationMs
lowestHintsUsed
```

only across successful completions.

---

# 70. Transaction Boundary

On successful completion, persistence should atomically update when practical:

```text
session
labProgress
mastery
commandStats
```

If a storage failure occurs, do not falsely claim progress is saved.

---

# 71. Repository Interfaces

Recommended:

```ts
interface SettingsRepository {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

interface LabProgressRepository {
  get(labKey: string): Promise<LabProgressRecord | null>;
  save(record: LabProgressRecord): Promise<void>;
  listByPack(packId: string): Promise<LabProgressRecord[]>;
}

interface SessionRepository {
  save(record: SessionRecord): Promise<void>;
  recent(limit: number): Promise<SessionRecord[]>;
  listByLab(labId: string): Promise<SessionRecord[]>;
}

interface MasteryRepository {
  get(conceptId: string): Promise<MasteryRecord | null>;
  save(record: MasteryRecord): Promise<void>;
  weakest(limit: number): Promise<MasteryRecord[]>;
}

interface CommandStatsRepository {
  get(command: string): Promise<CommandStatRecord | null>;
  save(record: CommandStatRecord): Promise<void>;
}

interface ContentVersionRepository {
  get(packId: string): Promise<ContentVersionRecord | null>;
  save(record: ContentVersionRecord): Promise<void>;
}
```

---

# 72. Persistence Errors

Use typed errors such as:

```text
PersistenceUnavailableError
PersistenceReadError
PersistenceWriteError
MigrationError
```

Persistence failure should not automatically destroy an active shell session.

---

# 73. Content Repository Interface

```ts
interface ContentRepository {
  getPack(packId: string): Promise<PackDefinition>;

  getLab(
    packId: string,
    labId: string
  ): Promise<LabDefinition>;

  getFixture(
    packId: string,
    fixtureId: string,
    version: number
  ): Promise<FixtureDefinition>;

  getConcept(
    conceptId: string
  ): Promise<ConceptDefinition>;
}
```

Official content is read-only at runtime.

---

# 74. Content Authoring Workflow

```text
author YAML
↓
parse
↓
structural validation
↓
semantic validation
↓
reference-solution verification
↓
review
↓
merge
↓
static build
```

---

# 75. CI Content Gate

A content PR must fail when:

- YAML invalid;
- schema invalid;
- ID duplicate;
- fixture missing;
- concept missing;
- command dependency unknown;
- stable lab requires unsupported functionality;
- unsafe fixture path exists;
- reference solution fails.

---

# 76. Database Test Categories

```text
CRUD
indexes
transactions
migration
reset
corruption recovery
progress aggregation
mastery persistence
```

Migration test pattern:

```text
create old DB
insert representative data
upgrade
verify learner state preserved
verify new fields valid
```

---

# 77. Privacy and Retention

MVP should not require or store:

```text
name
email
account ID
precise location
real shell history
real secrets
host files
```

Local learner state remains until:

```text
browser clears storage
or
user explicitly resets it
```

---

# 78. Runtime Cache Separation

Wasmer/runtime package cache is not learner progress.

Clearing one must not implicitly clear the other.

---

# 79. Content Determinism

Stable fixtures must not depend on:

```text
current time
browser locale
network responses
unseeded randomness
```

Randomized labs can later use explicit seeds.

MVP should prefer static fixtures.

---

# 80. Full Lab Example

```yaml
schemaVersion: 1

id: text.hidden-evidence
version: 1
packId: linux-foundations

title: Hidden Evidence
difficulty: intermediate
status: stable

modeSupport:
  - guided
  - hinted
  - blind

mission:
  context: >
    A hidden evidence file exists somewhere under /opt/archive.

  objective: >
    Locate the file containing ACCESS_GRANTED and print its absolute path.

  constraints:
    - Do not modify evidence files.

concepts:
  - filesystem.hidden-files
  - text.search
  - filesystem.absolute-path

prerequisites:
  - filesystem.cwd
  - filesystem.relative-path

fixture:
  id: hidden-evidence
  version: 1

capabilities:
  network: false
  hostFilesystem: false

  requiredCommands:
    - find
    - grep

  requiredShellFeatures:
    - shell.pipe

  requiredFidelity:
    find: native-wasix
    grep: native-wasix

validators:
  - id: answer-path
    type: stdoutRegex
    pattern: '^/opt/archive/.+$'

  - id: evidence-content
    type: fileContentContains
    path: /opt/archive/.evidence
    value: ACCESS_GRANTED

hints:
  - id: hidden-file
    order: 1
    category: conceptual
    text: Hidden filenames begin with a dot.
    penalty: 5

  - id: recursive-search
    order: 2
    category: directional
    text: Search tools can traverse directory trees.
    penalty: 10

protectedPaths:
  - /opt/archive/.evidence

scoring:
  maxScore: 100
  hintPenalty: 5
  retryPenalty: 5

metadata:
  estimatedMinutes: 5

  tags:
    - filesystem
    - search
```

---

# 81. Full Fixture Example

```yaml
schemaVersion: 1

id: hidden-evidence
version: 1

cwd: /home/student

directories:
  - path: /home/student
  - path: /opt/archive

files:
  - path: /home/student/readme.txt
    source:
      type: inline
      content: |
        Search carefully.

  - path: /opt/archive/.evidence
    source:
      type: inline
      content: |
        ACCESS_GRANTED

  - path: /opt/archive/notes.txt
    source:
      type: inline
      content: |
        Nothing useful here.

environment:
  TRAINING_MODE: shellground
```

---

# 82. Content Pack Layout

```text
content/packs/linux-foundations/
├── pack.yaml
├── labs/
│   ├── 001-where-am-i.yaml
│   └── ...
├── fixtures/
│   ├── 001-where-am-i/
│   │   ├── fixture.yaml
│   │   └── files/
│   └── ...
└── references/
    ├── 001-where-am-i.solution.yaml
    └── ...
```

---

# 83. Content Build Scripts

Recommended future scripts:

```bash
npm run content:validate
npm run content:references
npm run content:fidelity
npm run test:content
```

---

# 84. MVP Database Baseline

```text
settings
labProgress
sessions
mastery
commandStats
contentVersions
appMetadata
```

---

# 85. MVP Content Baseline

```text
PackDefinition
LabDefinition
FixtureDefinition
ConceptDefinition
ValidatorDefinition
CommandFidelityDefinition
ShellFeatureFidelityDefinition
CurriculumDefinition
ReferenceSolutionDefinition
```

---

# 86. Guardrails

Do not:

```text
store canonical labs in IndexedDB
execute YAML as code
persist complete sandbox state after every command
persist full transcripts by default
store real secrets
allow scenario-defined JavaScript validators
use filenames as canonical IDs
silently accept incompatible schemas
silently mutate released graded content
```

---

# 87. Acceptance Criteria

This design is accepted when it can represent and validate:

1. learner settings;
2. aggregate progress;
3. individual sessions;
4. mastery;
5. command statistics;
6. content versions;
7. packs;
8. labs;
9. deterministic fixtures;
10. concepts;
11. hints;
12. validators;
13. required runtime capabilities;
14. command fidelity;
15. shell-feature fidelity;
16. reference solutions;
17. curriculum ordering;
18. historical runtime/content fingerprints;
19. safe database migration;
20. content-schema compatibility.

---

# 88. Final Data Architecture Decision

SHELLGROUND shall use:

```text
IndexedDB + Dexie
for mutable local learner state

YAML + Zod
for authored training content

Generated JSON Schema
for tooling where useful

Stable IDs + explicit versions
for compatibility

Runtime/content fingerprints
for historical integrity

Declarative trusted validator types
for safe outcome evaluation
```

The three data domains remain separate:

```text
IndexedDB
  = persistent learner state

Repository content
  = versioned curriculum

WASIX sandbox
  = ephemeral execution state
```

---

# 89. Next Document

The next document in sequence is:

```text
8. UI DESIGN
```

It will define:

- information architecture;
- navigation;
- dashboard;
- lab catalog;
- training workspace;
- terminal layout;
- mission and hint presentation;
- validation/results;
- mastery views;
- diagnostics;
- settings;
- responsive behavior;
- keyboard workflows;
- accessibility;
- component inventory;
- loading, empty, error, and unsupported-runtime states.

It will consume this data model without redefining persistence or content semantics.
