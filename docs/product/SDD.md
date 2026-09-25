# SHELLGROUND — Software Design Description (SDD)

> **Document:** Software Design Description  
> **Project:** SHELLGROUND  
> **Sequence:** 10C of 13  
> **Document Type:** SDD  
> **Status:** Reconciled Design Baseline  
> **Primary Release:** v0.1.0 MVP  
>
> **Depends on:**  
> - `SHELLGROUND_REQUIREMENTS.md`  
> - `SHELLGROUND_FEATURE_SCOPE.md`  
> - `SHELLGROUND_FULL_ARCHITECTURE.md`  
> - `SHELLGROUND_COMMAND_SUPPORT_MATRIX.md`  
> - `SHELLGROUND_CURRICULUM.md`  
> - `SHELLGROUND_REPOSITORY_STRUCTURE.md`  
> - `SHELLGROUND_DATABASE_CONTENT_SCHEMA.md`  
> - `SHELLGROUND_UI_DESIGN.md`  
> - `SHELLGROUND_MVP_PHASES.md`  
> - `SHELLGROUND_SPMP.md`  
> - `SHELLGROUND_SRS.md`


> **Reconciliation Note:** This revision was cross-checked against the finalized `SHELLGROUND_SRS.md`. The earlier provisional `FR-001…FR-020` traceability numbering has been replaced by the finalized grouped SRS identifiers (`FR-A-*` through `FR-J-*`). Design coverage was also expanded for `SR-013…SR-015`, `NFR-013…NFR-014`, and `UR-001…UR-007`.


---

# 1. Purpose

This Software Design Description defines how SHELLGROUND shall be implemented to satisfy the Software Requirements Specification.

This document answers:

> **How shall the system be structured and implemented?**

It defines:

```text
module decomposition
component responsibilities
interfaces
runtime integration
worker protocol
state machines
content loading
validation
reset behavior
persistence
mastery
error handling
deployment
test seams
```

It does not define the exact implementation task sequence. That belongs to the Implementation Plan.

---

# 2. Architectural Style

SHELLGROUND uses a:

```text
local-first
layered
modular
port-and-adapter
browser application architecture
```

Core principles:

```text
React does not own runtime logic
UI does not import Wasmer directly
domain does not depend on infrastructure
content is declarative data
runtime is abstracted behind ports
persistence is abstracted behind repositories
simulation is explicit
```

---

# 3. Top-Level System Decomposition

```text
SHELLGROUND
├── Presentation
├── Application Services
├── Domain
├── Runtime
├── Terminal
├── Infrastructure
├── Content
└── Deployment
```

---

# 4. Component Overview

```text
┌─────────────────────────────────────────────────────────────┐
│ Presentation                                               │
│ React pages / components / routing                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Application Services                                       │
│ LabSession / Progress / Mastery / Diagnostics / Fidelity   │
└──────────────┬───────────────────┬──────────────────────────┘
               │                   │
               ▼                   ▼
┌──────────────────────┐   ┌─────────────────────────────┐
│ Domain               │   │ Ports                       │
│ Lab / Validation     │   │ ShellRuntime / Repositories │
│ Mastery / Progress   │   └────────────┬────────────────┘
└──────────────────────┘                │
                                        ▼
                           ┌──────────────────────────────┐
                           │ Infrastructure               │
                           │ Wasmer / Dexie / Content IO  │
                           └──────────────────────────────┘
```

---

# 5. Source Module Design

Recommended implementation:

```text
src/
├── app/
├── application/
├── domain/
├── features/
├── infrastructure/
├── runtime/
├── terminal/
├── shared/
└── styles/
```

---

# 6. `src/app`

Responsibilities:

```text
application bootstrap
dependency wiring
routing
global providers
environment/config parsing
startup capability gate
```

Key files:

```text
App.tsx
main.tsx
providers/
router/
startup/
config/
```

---

# 7. `src/application`

Contains use-case orchestration.

Primary services:

```text
LabSessionService
LabLaunchService
LabResetService
LabCompletionService
ProgressService
MasteryService
DiagnosticsService
FidelityService
```

Application services coordinate domain and infrastructure but do not directly render UI.

---

# 8. `src/domain`

Contains business rules and types.

Primary modules:

```text
labs
concepts
validation
mastery
progress
fidelity
runtime
errors
```

This layer must remain framework-agnostic.

---

# 9. `src/features`

Contains user-facing feature composition:

```text
dashboard
labs
training
playground
mastery
diagnostics
settings
```

Features may call application services and consume domain objects.

They shall not import Wasmer or Dexie directly.

---

# 10. `src/runtime`

Contains runtime abstractions and Wasmer implementation.

Submodules:

```text
ports/
client/
worker/
wasmer/
capabilities/
fidelity/
manifest/
```

---

# 11. `src/terminal`

Owns xterm.js.

Contains:

```text
TerminalView
TerminalController
addons
themes
terminal types
```

---

# 12. `src/infrastructure`

Contains browser/infrastructure implementations:

```text
persistence
content
diagnostics
```

---

# 13. `src/shared`

Contains cross-cutting generic utilities only.

Examples:

```text
logger
Result type
generic errors
date utilities
generic UI primitives
```

---

# 14. Dependency Direction

Approved:

```text
features
↓
application
↓
domain / ports

infrastructure
↑
ports

runtime implementations
↑
runtime ports
```

Forbidden:

```text
domain → React
domain → Dexie
domain → Wasmer
features → Wasmer
features → Dexie
```

---

# 15. Dependency Injection

MVP may use simple manual dependency composition.

Example:

```ts
const progressRepository =
  new DexieLabProgressRepository(db);

const runtime =
  new RuntimeClient(worker);

const labSessionService =
  new LabSessionService({
    runtime,
    progressRepository,
    masteryRepository,
    contentRepository,
    validatorRegistry,
  });
```

A DI framework is not required.

---

# 16. Runtime Port

Canonical conceptual interface:

```ts
export interface ShellRuntime {
  initialize(
    config: RuntimeInitialization
  ): Promise<RuntimeHandle>;

  openTerminal(
    request: OpenTerminalRequest
  ): Promise<TerminalProcessHandle>;

  write(
    processId: string,
    input: Uint8Array
  ): Promise<void>;

  resize(
    processId: string,
    columns: number,
    rows: number
  ): Promise<void>;

  createFixture(
    fixture: RuntimeFixture
  ): Promise<void>;

  query(
    request: RuntimeQuery
  ): Promise<RuntimeQueryResult>;

  terminateProcess(
    processId: string
  ): Promise<void>;

  reset(
    fixture: RuntimeFixture
  ): Promise<void>;

  dispose(): Promise<void>;
}
```

Exact signatures may be refined after Phase 0.

---

# 17. Runtime Initialization Model

```ts
interface RuntimeInitialization {
  packageManifestVersion: string;
  shellPackageId: string;
  shellPackageVersion: string;
  networkEnabled: false;
}
```

Network remains explicitly disabled for MVP.

---

# 18. Runtime Handle

```ts
interface RuntimeHandle {
  runtimeId: string;
  version: string;
  startedAt: string;
}
```

Avoid exposing Wasmer SDK objects outside adapter boundary.

---

# 19. Terminal Process Handle

```ts
interface TerminalProcessHandle {
  id: string;

  stdout: AsyncIterable<Uint8Array>;
  stderr: AsyncIterable<Uint8Array>;

  wait(): Promise<ProcessExit>;
}
```

---

# 20. Process Exit

```ts
interface ProcessExit {
  exitCode: number;
  exitedAt: string;
}
```

---

# 21. Runtime Query Design

Rather than serializing the entire filesystem, validation should request targeted state.

Example:

```ts
type RuntimeQuery =
  | { type: "cwd" }
  | { type: "pathExists"; path: string }
  | { type: "readFile"; path: string; maxBytes: number }
  | { type: "fileMode"; path: string }
  | { type: "symlinkTarget"; path: string }
  | { type: "environment"; name: string }
  | { type: "hash"; path: string; algorithm: "sha256" };
```

This reduces memory and security exposure.

---

# 22. Runtime Worker Design

The runtime worker owns:

```text
Wasmer client
sandbox
shell process
filesystem access
runtime query execution
resource cleanup
```

The main thread owns:

```text
React
xterm
lab session state
validation orchestration
persistence
```

---

# 23. Worker Request Envelope

```ts
interface WorkerRequestEnvelope<T> {
  id: string;
  type: string;
  payload: T;
}
```

---

# 24. Worker Response Envelope

```ts
interface WorkerResponseEnvelope<T> {
  requestId?: string;
  type: string;
  payload?: T;
  error?: RuntimeErrorDTO;
}
```

---

# 25. Worker Request Types

```ts
type RuntimeWorkerRequest =
  | InitializeRuntimeRequest
  | OpenTerminalRequestMessage
  | TerminalInputRequest
  | TerminalResizeRequest
  | RuntimeQueryRequest
  | RuntimeResetRequest
  | TerminateProcessRequest
  | DisposeRuntimeRequest;
```

---

# 26. Runtime Worker Events

```ts
type RuntimeWorkerEvent =
  | RuntimeInitializingEvent
  | RuntimeReadyEvent
  | ProcessStartedEvent
  | StdoutEvent
  | StderrEvent
  | ProcessExitedEvent
  | RuntimeResettingEvent
  | RuntimeDisposedEvent
  | RuntimeErrorEvent;
```

---

# 27. Worker Validation

Every request must be validated with runtime schemas before processing.

Unknown message type:

```text
reject
```

Malformed payload:

```text
reject
```

No implicit coercion of dangerous fields.

---

# 28. Runtime State Machine

```text
IDLE
 ↓
INITIALIZING
 ↓
READY
 ↓
PROCESS_RUNNING
 ├── RESETTING → READY
 ├── PROCESS_EXITED → READY
 ├── DISPOSING → DISPOSED
 └── ERROR
```

---

# 29. Runtime Error Recovery

If worker state becomes unknown:

```text
dispose worker
create new worker
create new sandbox
reseed fixture
```

Do not attempt partial recovery of corrupt runtime state.

---

# 30. Runtime Timeout Design

Timeout categories:

```text
initialization
terminal start
query
reset
termination
dispose
```

Each timeout maps to a typed runtime error.

---

# 31. Wasmer Adapter

`WasmerShellRuntime` responsibilities:

```text
initialize Wasmer
resolve trusted packages
create sandbox
seed filesystem
start shell
stream stdio
resize TTY
query filesystem
terminate process
close sandbox
```

Only this boundary may use Wasmer-specific APIs.

---

# 32. Trusted Runtime Manifest

Conceptual:

```ts
interface TrustedRuntimeManifest {
  version: string;

  packages: Array<{
    id: string;
    reference: string;
    exactVersion: string;
    role: "shell" | "utility";
    enabled: boolean;
  }>;
}
```

---

# 33. Package Resolution

Runtime package identifiers shall come only from the trusted manifest.

Forbidden:

```text
user-supplied registry URL
user-supplied package ID
user-supplied package version
```

---

# 34. PATH Construction

The runtime adapter may construct a predictable PATH from approved package binaries.

Example concept:

```text
/bin
/usr/bin
/opt/shellground/bin
```

Actual paths depend on runtime package structure.

---

# 35. Terminal Design

Flow:

```text
Keyboard
↓
xterm
↓
TerminalController
↓
RuntimeClient
↓
Worker
↓
Shell stdin
```

Output:

```text
Shell stdout/stderr
↓
Worker
↓
RuntimeClient
↓
TerminalController
↓
xterm.write()
```

---

# 36. TerminalController

Responsibilities:

```text
construct xterm
bind keyboard input
bind runtime output
fit terminal
resize runtime
focus
clear presentation
dispose addons/listeners
```

It shall not:

```text
load labs
persist progress
run validators
```

---

# 37. Terminal Lifecycle

```text
create
↓
mount
↓
connect
↓
active
↓
disconnect
↓
dispose
```

Every mount must have a matching dispose path.

---

# 38. Terminal Resize

Use browser layout observation.

Concept:

```text
ResizeObserver
↓
xterm FitAddon
↓
cols/rows
↓
runtime.resize()
```

---

# 39. Terminal Scrollback

Use bounded xterm scrollback.

Do not maintain an unbounded duplicate transcript in React state.

---

# 40. Terminal Input Security

Input bytes may only flow to guest stdin.

Never interpolate terminal input into:

```text
JavaScript
URLs
package IDs
host commands
build commands
```

---

# 41. Application Service — LabSessionService

Primary orchestration service.

Conceptual constructor:

```ts
interface LabSessionDependencies {
  runtime: ShellRuntime;
  contentRepository: ContentRepository;
  validatorRegistry: ValidatorRegistry;
  progressRepository: LabProgressRepository;
  sessionRepository: SessionRepository;
  masteryRepository: MasteryRepository;
  fidelityService: FidelityService;
}
```

---

# 42. LabSessionService Operations

```ts
prepare(labId)
start(labId, mode)
requestHint()
validate()
reset()
complete()
abandon()
dispose()
```

---

# 43. Lab Session State Machine

```text
UNLOADED
 ↓
PREPARING
 ↓
READY
 ↓
ACTIVE
 ├── VALIDATING
 │    ├── ACTIVE
 │    └── COMPLETED
 ├── RESETTING
 │    └── ACTIVE
 ├── ABANDONED
 └── ERROR
```

---

# 44. Session Entity

```ts
interface LabSession {
  sessionId: string;
  labId: string;
  labVersion: number;
  mode: TrainingMode;

  status:
    | "preparing"
    | "ready"
    | "active"
    | "validating"
    | "resetting"
    | "completed"
    | "abandoned"
    | "error";

  startedAt?: string;
  completedAt?: string;

  validationAttempts: number;
  hintsUsed: number;
}
```

---

# 45. Lab Start Sequence

```text
load lab
↓
validate content
↓
resolve fidelity requirements
↓
load fixture
↓
initialize runtime
↓
seed fixture
↓
open shell
↓
connect terminal
↓
mark ACTIVE
```

---

# 46. Fidelity Gate

Before runtime launch:

```text
required commands
+
required shell features
↓
FidelityService
↓
SUPPORTED / SIMULATED / BLOCKED
```

Blocked stable lab:

```text
must not launch
```

---

# 47. Content Repository

Interface:

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

---

# 48. Content Loader

Implementation flow:

```text
static content source
↓
safe YAML parse
↓
Zod validation
↓
semantic validation
↓
typed object
```

---

# 49. Content Index

At build time, generate a lab/pack index.

Conceptual:

```ts
interface GeneratedContentIndex {
  packs: PackIndexEntry[];
  labs: LabIndexEntry[];
  concepts: ConceptIndexEntry[];
}
```

This avoids manual imports.

---

# 50. Content Semantic Validator

Checks:

```text
duplicate IDs
missing concepts
missing fixture
missing validators
missing command fidelity entry
unsupported stable dependency
unsafe paths
invalid reference solution
```

---

# 51. Fixture Compiler

Transforms `FixtureDefinition` into runtime operations.

Concept:

```text
FixtureDefinition
↓
validate paths
↓
normalize directories
↓
normalize files
↓
resolve assets
↓
RuntimeFixture
```

---

# 52. Runtime Fixture

```ts
interface RuntimeFixture {
  id: string;
  version: number;

  directories: RuntimeFixtureDirectory[];
  files: RuntimeFixtureFile[];

  environment: Record<string, string>;
  cwd: string;
}
```

---

# 53. Fixture Path Safety

Normalize guest paths.

Reject:

```text
path traversal
host path syntax
URL-like host mappings
```

Allow valid guest paths such as:

```text
/home/student
/opt/archive
/var/log
```

---

# 54. Fixture Seeding Order

Recommended:

```text
create parent directories
↓
create explicit directories
↓
write files
↓
create symlinks if supported
↓
apply metadata if supported
↓
configure environment
↓
set cwd
```

---

# 55. Validation Design

Architecture:

```text
LabSessionService
↓
ValidatorRegistry
↓
Validator
↓
Runtime Query Port
↓
ValidationResult
```

---

# 56. Validator Registry

```ts
interface ValidatorRegistry {
  get(
    type: ValidatorDefinition["type"]
  ): Validator;
}
```

Unknown validator type is a content/system error.

---

# 57. Validator Interface

```ts
interface Validator<T extends ValidatorDefinition> {
  readonly type: T["type"];

  validate(
    definition: T,
    context: ValidationContext
  ): Promise<ValidationResult>;
}
```

---

# 58. Validation Context

```ts
interface ValidationContext {
  runtime: RuntimeQueryPort;
  stdoutBuffer: ReadonlyTextBuffer;
  stderrBuffer: ReadonlyTextBuffer;
  lab: LabDefinition;
}
```

---

# 59. Output Buffer

Maintain a bounded output buffer specifically for validators.

Do not use full xterm scrollback as the validation API.

Recommended concept:

```text
last N bytes
or
session output bounded by limit
```

---

# 60. Validation Result

```ts
interface ValidationResult {
  validatorId: string;
  passed: boolean;
  code: string;
  learnerMessage?: string;
  internalMessage?: string;
}
```

---

# 61. Validation Summary

```ts
interface ValidationSummary {
  passed: boolean;
  results: ValidationResult[];
  validatedAt: string;
}
```

---

# 62. Validation Rules

Required validators must all pass.

Optional validators may provide extra feedback or scoring.

---

# 63. Validation Failure

A normal failure:

```text
does not throw
```

It returns:

```ts
{
  passed: false
}
```

---

# 64. Validation Infrastructure Error

Examples:

```text
runtime query timeout
file read failure caused by runtime
unknown validator
```

These produce typed system errors.

---

# 65. Reset Design

Preferred algorithm:

```text
mark RESETTING
↓
disconnect terminal
↓
terminate process
↓
dispose sandbox
↓
create new sandbox
↓
seed original fixture
↓
start new shell
↓
connect terminal
↓
mark ACTIVE
```

---

# 66. Reset Determinism

Create a fixture baseline signature from:

```text
paths
file contents
environment
metadata where relevant
```

Reset tests compare against the baseline.

---

# 67. Reset Failure

If reset fails:

```text
mark ERROR
offer Restart Lab
```

Do not resume a partially reset sandbox.

---

# 68. Persistence Design

Use:

```text
IndexedDB
+
Dexie
```

Database infrastructure implements repository ports.

---

# 69. Database Class

Conceptual:

```ts
class ShellgroundDatabase extends Dexie {
  settings!: Table<SettingRecord, string>;
  labProgress!: Table<LabProgressRecord, string>;
  sessions!: Table<SessionRecord, number>;
  mastery!: Table<MasteryRecord, string>;
  commandStats!: Table<CommandStatRecord, string>;
  contentVersions!: Table<ContentVersionRecord, string>;
  appMetadata!: Table<AppMetadataRecord, string>;
}
```

---

# 70. Repository Pattern

Application uses:

```text
LabProgressRepository
SessionRepository
MasteryRepository
SettingsRepository
```

Concrete Dexie classes stay inside infrastructure.

---

# 71. Completion Transaction

On successful completion:

```text
save session
update lab progress
update mastery
update command stats
```

Prefer a single IndexedDB transaction where practical.

---

# 72. Storage Failure Behavior

If persistence fails after a successful lab:

```text
show result
mark progress unsaved
allow retry
do not classify learner attempt as failed
```

---

# 73. Database Migrations

Migrations live under:

```text
src/infrastructure/persistence/migrations/
```

Each migration:

```text
versioned
tested
documented
deterministic
```

---

# 74. Mastery Design

Mastery is computed from session outcomes.

Conceptual algorithm inputs:

```text
success ratio
independence
blind success
mixed success
recency
efficiency
```

---

# 75. Mastery Formula

Initial deterministic example:

```text
mastery =
  0.45 * successFactor
+ 0.20 * independenceFactor
+ 0.20 * recencyFactor
+ 0.15 * efficiencyFactor
```

Clamp:

```text
0.0–1.0
```

The exact coefficients may be tuned before implementation freeze.

---

# 76. Success Factor

Possible:

```text
recent successful encounters / recent encounters
```

Use bounded windows rather than lifetime-only averages if necessary.

---

# 77. Independence Factor

Higher when:

```text
blind successes
low hint use
```

Lower when:

```text
heavy hint use
```

---

# 78. Recency Factor

Higher for recent practice.

May decay gradually.

Exact decay formula belongs to implementation.

---

# 79. Efficiency Factor

May consider successful duration relative to personal or lab baseline.

Do not over-reward fast guessing.

---

# 80. Mastery State Mapping

Example:

```text
0.00–0.19  Introduced
0.20–0.39  Practicing
0.40–0.59  Competent
0.60–0.79  Proficient
0.80–1.00  Mastered
```

`Unseen` is no encounters.

`Stale` overrides when recency threshold is exceeded.

These thresholds are configurable domain constants, not content-defined.

---

# 81. Weakness Detection

Weakness candidate if:

```text
low mastery
or
repeated failures
or
high hint dependence
or
stale proficiency
```

Return explainable reason.

Example:

```text
stderr redirection — 3 failed attempts, 2 hints used
```

---

# 82. Command Observation

Optional best-effort service:

```text
terminal input
↓
shell-token parser
↓
observed command names
↓
CommandStatsRepository
```

This service shall not:

```text
block commands
validate labs
enforce security
```

---

# 83. Fidelity Service

Inputs:

```text
command fidelity registry
shell feature registry
runtime version
lab requirements
```

Outputs:

```text
SUPPORTED
SUPPORTED_WITH_SIMULATION
BLOCKED
```

---

# 84. Fidelity Record

```ts
interface FidelityRecord {
  id: string;

  classification:
    | "native-wasix"
    | "simulated"
    | "unsupported"
    | "unverified";

  verifiedRuntimeVersion?: string;
  notes?: string[];
}
```

---

# 85. Simulation Design

Simulation must live in an explicit module.

Example:

```text
src/runtime/simulation/
```

Future simulated services may model:

```text
network interfaces
service manager
disk capacity
users/groups
```

Simulation must never be mixed invisibly into the Wasmer adapter.

---

# 86. Diagnostics Design

DiagnosticsService aggregates:

```text
browser capabilities
storage capabilities
runtime state
runtime version
package versions
content version
fidelity registry version
security capability state
```

---

# 87. Browser Capability Detector

Checks:

```ts
{
  webAssembly,
  worker,
  sharedArrayBuffer,
  crossOriginIsolated,
  indexedDb
}
```

---

# 88. Blocking Capability Policy

Blocking:

```text
WebAssembly unavailable
worker unavailable
required SharedArrayBuffer unavailable
crossOrigin isolation unavailable
```

IndexedDB may be non-blocking if training can continue without persistence.

---

# 89. UI State Stores

Recommended:

```text
training-session.store.ts
ui-preferences.store.ts
runtime-status.store.ts
```

Do not create one monolithic global store.

---

# 90. Active Session State

Source of truth:

```text
application service/store
```

Do not duplicate active lab status across:

```text
React local state
Zustand
IndexedDB
worker
```

---

# 91. Runtime State Ownership

Source of truth:

```text
runtime worker
```

for:

```text
sandbox
process
guest filesystem
guest env
```

---

# 92. Terminal State Ownership

Source of truth:

```text
TerminalController
```

for:

```text
xterm instance
dimensions
addons
focus state
```

---

# 93. Persistent State Ownership

Source of truth:

```text
IndexedDB
```

for:

```text
progress
mastery
settings
sessions
```

---

# 94. Content State Ownership

Source of truth:

```text
version-controlled content files
```

---

# 95. Error Model

Error hierarchy:

```text
AppError
├── CapabilityError
├── ContentError
├── RuntimeError
├── ProtocolError
├── ValidationInfrastructureError
├── PersistenceError
└── ConfigurationError
```

---

# 96. AppError

Conceptual:

```ts
abstract class AppError extends Error {
  readonly code: string;
  readonly recoverable: boolean;
  readonly context?: Record<string, unknown>;
}
```

---

# 97. Runtime Error Codes

Examples:

```text
SG-RUNTIME-001 initialization failed
SG-RUNTIME-002 shell start failed
SG-RUNTIME-003 query timeout
SG-RUNTIME-004 reset failed
SG-RUNTIME-005 worker terminated
```

---

# 98. Content Error Codes

Examples:

```text
SG-CONTENT-001 schema invalid
SG-CONTENT-002 missing reference
SG-CONTENT-003 unsupported dependency
SG-CONTENT-004 unsafe path
```

---

# 99. Persistence Error Codes

Examples:

```text
SG-STORAGE-001 unavailable
SG-STORAGE-002 read failed
SG-STORAGE-003 write failed
SG-STORAGE-004 migration failed
```

---

# 100. Error Presentation

System errors become user-facing messages through an error mapper.

Do not render raw exception objects.

---

# 101. Logger Design

Interface:

```ts
interface AppLogger {
  debug(
    event: string,
    context?: Record<string, unknown>
  ): void;

  info(
    event: string,
    context?: Record<string, unknown>
  ): void;

  warn(
    event: string,
    context?: Record<string, unknown>
  ): void;

  error(
    event: string,
    context?: Record<string, unknown>
  ): void;
}
```

---

# 102. Logging Restrictions

Do not log:

```text
real secrets
clipboard contents
complete arbitrary learner files
full terminal transcripts
```

---

# 103. Security Design — Runtime

Controls:

```text
trusted package manifest
no host filesystem mapping
network disabled
worker isolation
runtime message validation
resource cleanup
bounded runtime queries
```

---

# 104. Security Design — Content

Controls:

```text
safe YAML parser
strict Zod schemas
no executable content
path normalization
content size limits
trusted validators only
```

---

# 105. Security Design — UI

Controls:

```text
sanitized Markdown if enabled
no arbitrary HTML
no automatic terminal URL opening
no silent clipboard reads
no unnecessary browser permissions
```

---

# 106. Security Design — Deployment

Headers:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP added after verified runtime requirements.

---

# 107. Deployment Topology

```text
GitHub Repository
↓
GitHub Actions
↓
Static Build
↓
Cloudflare Pages
↓
HTTPS + isolation headers
↓
Browser
```

No application backend in MVP.

---

# 108. Build-Time Content Flow

```text
content YAML
↓
content validation
↓
generated indexes/schemas
↓
Vite build
↓
static assets
```

---

# 109. Runtime Package Flow

```text
trusted manifest
↓
approved package references
↓
Wasmer initialization
↓
browser runtime cache
```

---

# 110. Application Boot Sequence

```text
load static app
↓
parse app config
↓
initialize logger
↓
open IndexedDB
↓
detect browser capabilities
↓
load content index
↓
render dashboard
```

WASIX runtime remains lazy.

---

# 111. Lab Boot Sequence

```text
user opens lab
↓
load lab
↓
check content compatibility
↓
resolve fidelity
↓
load fixture
↓
initialize runtime
↓
seed fixture
↓
launch shell
↓
connect terminal
↓
ACTIVE
```

---

# 112. Playground Boot Sequence

```text
open playground
↓
initialize runtime
↓
seed default playground fixture
↓
launch shell
↓
connect terminal
```

No scoring/progress requirement.

---

# 113. Validation Sequence

```text
Validate pressed
↓
session → VALIDATING
↓
collect required output/runtime queries
↓
run validators
↓
aggregate results
↓
if fail:
  attempts++
  ACTIVE
↓
if pass:
  calculate score
  persist session/progress
  update mastery
  COMPLETED
```

---

# 114. Hint Sequence

```text
request hint
↓
find next unrevealed hint
↓
mark revealed
↓
increment hint count
↓
apply score penalty if configured
```

---

# 115. Completion Sequence

```text
validation passes
↓
compute score
↓
compute concept outcomes
↓
transaction:
  session
  progress
  mastery
  command stats
↓
show results
```

---

# 116. Abandon Sequence

```text
user leaves active lab
↓
confirm
↓
mark session abandoned
↓
persist session summary
↓
dispose runtime
↓
dispose terminal
```

---

# 117. Runtime Cleanup Sequence

```text
stop input
↓
terminate process
↓
close sandbox
↓
terminate worker
↓
dispose terminal bindings
```

---

# 118. Concurrency Model

MVP supports:

```text
one active interactive runtime per tab
```

Multiple simultaneous terminals are not required.

---

# 119. Multi-Tab Persistence

If two tabs write progress concurrently:

```text
last successful write wins
```

Future BroadcastChannel coordination may be added later.

---

# 120. Performance Design

Primary performance risks:

```text
runtime download
WASM startup
sandbox creation
large fixture
terminal output
filesystem query
```

Mitigations:

```text
lazy runtime loading
runtime cache
bounded buffers
targeted queries
small fixtures
worker isolation
```

---

# 121. Output Buffer Limits

Application-side validation output buffer must be bounded.

Conceptual default:

```text
1–4 MiB
```

Exact limit to be benchmarked.

---

# 122. File Query Limits

Validators reading file content should request bounded size.

If a file exceeds allowed validation limit:

```text
typed validation infrastructure error
or
streamed comparison
```

depending implementation.

---

# 123. Fixture Limits

Initial guardrails:

```text
inline file <= 256 KiB
asset <= 2 MiB
fixture total <= 10 MiB
```

---

# 124. Accessibility Design

UI components shall provide:

```text
semantic buttons
visible focus
keyboard navigation
ARIA live status
text fidelity labels
reduced motion
adequate contrast
```

---

# 125. Terminal Accessibility

xterm accessibility capabilities should be enabled/configured where practical.

Do not announce every terminal byte through a custom live region.

---

# 126. UI Component Design

Primary components:

```text
AppShell
DashboardPage
LabCatalogPage
TrainingPage
PlaygroundPage
MasteryPage
DiagnosticsPage
SettingsPage
TerminalView
MissionPanel
HintPanel
ValidationPanel
ResultsPanel
FidelityBadge
RuntimeStatusStrip
```

---

# 127. TrainingPage Composition

```text
TrainingPage
├── TrainingHeader
├── MissionPanel
├── TerminalView
├── RuntimeStatusStrip
└── Validation/Results Panel
```

---

# 128. Training Page Data Flow

```text
route params
↓
TrainingPage
↓
useTrainingSession
↓
LabSessionService
↓
domain state/store
↓
render
```

---

# 129. Settings Design

Settings stored via `SettingsRepository`.

UI changes may update:

```text
theme
terminal font
reduced motion
training preferences
```

---

# 130. Diagnostics Design

Diagnostics should not require an active runtime for browser checks.

Runtime-specific checks can show:

```text
Not Started
```

until runtime has initialized.

---

# 131. Content Schema Implementation

Recommended source:

```text
Zod
```

Example module structure:

```text
src/infrastructure/content/schema/
├── lab.schema.ts
├── fixture.schema.ts
├── concept.schema.ts
├── pack.schema.ts
└── fidelity.schema.ts
```

---

# 132. Generated JSON Schema

Optional build step:

```text
Zod
↓
JSON Schema
↓
content/schema/*.schema.json
```

---

# 133. Import Boundary Enforcement

Automated verification should fail when:

```text
features import @wasmer/sdk
domain imports react
domain imports dexie
terminal code imported into domain
runtime imports feature modules
```

---

# 134. Runtime Conformance Test Design

Test suite:

```text
shell-start
stdio
filesystem
pipes
redirection
environment
scripts
reset
network-denied
dispose
```

---

# 135. Validator Test Design

Each validator gets:

```text
pass
fail
invalid definition
runtime query failure
boundary-size case
```

---

# 136. Persistence Test Design

Tests:

```text
create DB
CRUD
query indexes
transaction
migration
reset
failure handling
```

Use isolated test database names.

---

# 137. Content Test Design

Data-driven checks across all official content:

```text
schema valid
semantic references valid
fidelity valid
fixture safe
reference solution exists
reference solution passes
```

---

# 138. E2E Test Design

Primary flows:

```text
startup
diagnostics
open playground
open first lab
terminal input
hint
validation fail
validation pass
reset
progress persists
mastery visible
```

---

# 139. Test Double Design

Provide:

```text
FakeShellRuntime
InMemoryProgressRepository
InMemoryMasteryRepository
FakeContentRepository
```

for fast application/domain tests.

---

# 140. FakeShellRuntime

Should model only the ShellRuntime contract needed by tests.

It shall not attempt to reproduce full shell behavior.

---

# 141. Design for Replaceable Runtime

Future runtime option:

```text
RemoteIsolatedRuntime
```

may implement the same port.

This permits later full-Linux labs without changing training-domain architecture.

Not part of MVP.

---

# 142. Design for Future Backend

Future cloud sync may introduce:

```text
ProgressSyncPort
RemoteProgressAdapter
```

without replacing local repositories.

Not part of MVP.

---

# 143. Design for Future Content Packs

Additional packs should require:

```text
new content files
```

not application architecture changes.

Only new validator/capability types should require code.

---

# 144. Design for Simulation Packs

Future simulated system/network labs may declare:

```text
requiredFidelity: simulated
```

and use simulation adapters.

This must remain explicit in diagnostics and UI.

---

# 144A. SRS Reconciliation — Additional Design Commitments

The finalized SRS introduced or clarified several requirements that were already directionally present in the design but required explicit implementation commitments.

## 144A.1 First-Run / No-Account Design

To satisfy `UR-001` and `UR-002`, the application shall not require authentication or profile creation.

First-run flow:

```text
Application Start
↓
Capability Check
↓
Dashboard / Welcome
↓
Start Linux Foundations
or
Open Playground
```

No account gate shall be inserted into the MVP boot path.

---

## 144A.2 Clear vs Reset Semantics

To satisfy `UR-005`, three actions shall remain technically and visually distinct:

```text
Clear Terminal View
  → clears terminal presentation only

Reset Current Lab
  → destroys/recreates the ephemeral training sandbox

Reset Training Progress
  → clears persisted learner progress according to data-management rules
```

These actions must never share ambiguous labels such as `Reset` without context.

---

## 144A.3 Mobile Advisory

To satisfy `UR-007`, narrow/mobile layouts may continue to expose training, but should present a non-blocking advisory that terminal practice is optimized for larger displays and physical keyboards.

The advisory shall not falsely claim that mobile is unsupported if the runtime is technically usable.

---

## 144A.4 Build Reproducibility

To satisfy `NFR-013`, implementation shall include:

```text
package-lock.json
documented Node version
exact runtime-package pins where supported
CI using npm ci
recorded runtime fingerprints
```

Major runtime/dependency upgrades require the conformance suite before merge.

---

## 144A.5 Documentation Integrity

To satisfy `NFR-014`, changes to architecture-significant behavior must update the corresponding baseline document in the same change set where practical.

Examples:

```text
runtime package change
→ COMMAND_FIDELITY / KNOWN_LIMITATIONS

content schema change
→ DATABASE_CONTENT_SCHEMA

architecture boundary change
→ SDD / ADR

deployment isolation change
→ DEPLOYMENT / SECURITY_MODEL
```

---

## 144A.6 Production Security Headers

To explicitly satisfy `SR-013`, the production deployment design requires the verified header baseline:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

A Content Security Policy shall be added only after confirming actual Wasmer/Web Worker/asset requirements.

---

## 144A.7 Terminal Link Safety

To satisfy `SR-014`, terminal output shall not automatically open arbitrary URLs emitted by guest programs or escape sequences.

If link support is ever enabled:

```text
user gesture required
scheme allowlist required
safe external-navigation handling required
```

---

## 144A.8 Clipboard Safety

To satisfy `SR-015`, normal user-initiated copy/paste may be supported, but the application shall not silently read clipboard contents.

Clipboard access beyond ordinary browser terminal paste requires explicit user gesture and a separately reviewed requirement.

---

## 144A.9 Initial Curriculum Integration

To explicitly satisfy `FR-D-009`, the first stable content pack shall contain at least 20 official labs.

The content loader itself remains count-agnostic; release validation enforces the minimum stable-lab count.

---

## 144A.10 Runtime Fidelity Release Gate

To satisfy `FR-B-008`, `FR-H-005`, `FR-H-006`, `FR-H-007`, and `FR-H-008`:

```text
UNVERIFIED
  ↓ Phase 0 evidence
native-wasix / simulated / unsupported
  ↓ stable release mapping
REAL / SIMULATED / NOT AVAILABLE
```

Stable content may not require `unsupported` behavior and may not present `unverified` behavior as stable support.

---


# 145. ADR Alignment

The SDD implements the following decisions:

```text
ADR-001 Browser-local execution
ADR-002 Wasmer/WASIX runtime
ADR-003 xterm terminal
ADR-004 No backend
ADR-005 Network default deny
ADR-006 Scenario-as-data
ADR-007 IndexedDB
ADR-008 Sandbox recreation reset
ADR-009 Fidelity registry
ADR-010 Static hosting
```

---

# 146. Functional Requirement Traceability

| SRS Requirement(s) | Design Component / Control |
|---|---|
| FR-A-001 | `CapabilityDetector`, `CapabilityReport` |
| FR-A-002 | startup capability gate, diagnostics error state |
| FR-A-003 | storage diagnostics + degraded unsaved-training mode |
| FR-B-001 | `WasmerShellRuntime` behind `ShellRuntime` |
| FR-B-002 | sandbox-only runtime, no host FS mapping |
| FR-B-003 | xterm → `TerminalController` → runtime stdin |
| FR-B-004 | runtime stdout/stderr streams → `TerminalController` |
| FR-B-005 | `ResizeObserver`/FitAddon → runtime resize |
| FR-B-006 | runtime conformance suite for shell features |
| FR-B-007 | trusted package manifest + command fidelity registry |
| FR-B-008 | `FidelityService` + stable-lab launch gate |
| FR-B-009 | `ShellRuntime` lifecycle contract |
| FR-B-010 | typed runtime errors + clean worker/sandbox recreation |
| FR-C-001 | WASIX guest filesystem |
| FR-C-002 | `FixtureCompiler` + deterministic seed sequence |
| FR-C-003 | Linux-like guest directory layout |
| FR-C-004 | synthetic fixture files under guest paths |
| FR-C-005 | protected-path metadata + scenario enforcement policy |
| FR-D-001 | YAML/JSON declarative content model |
| FR-D-002 | strict `LabDefinition` schema |
| FR-D-003 | ordered `HintDefinition` + hint service |
| FR-D-004 | concept prerequisite metadata |
| FR-D-005 | `TrainingMode` model |
| FR-D-006 | guided-mode UI/content presentation |
| FR-D-007 | blind-mode presentation with reduced guidance |
| FR-D-008 | `PlaygroundPage` + ungraded runtime session |
| FR-D-009 | release gate enforcing ≥20 stable official labs |
| FR-D-010 | reference-solution content + content test harness |
| FR-D-011 | outcome-based validators, no required exact command history |
| FR-E-001 | `ValidatorRegistry` + targeted runtime queries |
| FR-E-002 | initial validator implementations |
| FR-E-003 | conditional validator registry entries gated by fidelity |
| FR-E-004 | `ValidationResult` normal-failure semantics |
| FR-E-005 | typed `ValidationInfrastructureError` |
| FR-E-006 | `LabSession.validationAttempts` |
| FR-E-007 | `LabResetService` |
| FR-E-008 | sandbox recreation + fixture baseline comparison |
| FR-E-009 | reset design defaults to sandbox recreation |
| FR-F-001 | ordered hint service |
| FR-F-002 | session `hintsUsed` accounting |
| FR-F-003 | `ScoringDefinition`/scoring service |
| FR-F-004 | validator feedback mapper |
| FR-F-005 | `ResultsPanel` / completion summary |
| FR-F-006 | optional post-completion reference explanation |
| FR-G-001 | IndexedDB/Dexie repositories |
| FR-G-002 | `LabProgressRecord` |
| FR-G-003 | `SessionRecord` |
| FR-G-004 | persistence policy excluding full transcript |
| FR-G-005 | `MasteryService` / `MasteryRecord` |
| FR-G-006 | `MasteryState` enum |
| FR-G-007 | deterministic mastery calculator |
| FR-G-008 | weakness detector |
| FR-G-009 | separate progress/mastery UI and aggregates |
| FR-G-010 | session repository recent-query + dashboard list |
| FR-H-001 | `DiagnosticsPage` / `DiagnosticsService` |
| FR-H-002 | browser capability detector |
| FR-H-003 | runtime diagnostics adapter/fingerprint |
| FR-H-004 | security-boundary diagnostics |
| FR-H-005 | internal fidelity registry |
| FR-H-006 | public fidelity-label mapper |
| FR-H-007 | known-differences metadata/docs |
| FR-H-008 | fidelity-based lab launch decision |
| FR-I-001 | theme/high-contrast settings |
| FR-I-002 | terminal settings repository/UI |
| FR-I-003 | training settings repository/UI |
| FR-I-004 | training-progress reset service |
| FR-I-005 | full-local-data reset service |
| FR-I-006 | destructive confirmation components |
| FR-J-001 | static Vite build deployment |
| FR-J-002 | COOP/COEP hosting configuration |
| FR-J-003 | production startup isolation check |
| FR-J-004 | GitHub Actions CI |
| FR-J-005 | package scripts/quality-gate workflow |
| FR-J-006 | production error mapper + diagnostic detail separation |

---

# 147. Security Requirement Traceability

| SRS Requirement | Design Control |
|---|---|
| SR-001 | no host-filesystem mapping |
| SR-002 | learner commands routed only to sandbox stdin |
| SR-003 | runtime created without guest network capability |
| SR-004 | no raw socket/host interface exposure; unsupported feature policy |
| SR-005 | trusted exact runtime manifest |
| SR-006 | scenario-as-data + safe YAML + strict schemas |
| SR-007 | application-owned validator implementations |
| SR-008 | worker discriminated unions + runtime schema validation |
| SR-009 | guest-path normalization and asset containment |
| SR-010 | synthetic fixture/content policy |
| SR-011 | no unrelated permission requests |
| SR-012 | explicit process/sandbox/worker/terminal cleanup |
| SR-013 | production security-header configuration |
| SR-014 | no automatic arbitrary terminal URL opening |
| SR-015 | no silent clipboard reads; user-gesture-based paste/copy only |

---

# 148. Non-Functional and Usability Traceability

## 148.1 Non-Functional Requirements

| SRS Requirement | Design Control |
|---|---|
| NFR-001 | worker boundary and controlled React updates |
| NFR-002 | lazy Wasmer/runtime initialization |
| NFR-003 | fixture determinism + reset conformance |
| NFR-004 | persistence errors isolated from active shell |
| NFR-005 | clean runtime restart path |
| NFR-006 | layered modules + import boundaries |
| NFR-007 | ports, repositories, fakes/test doubles |
| NFR-008 | keyboard/focus/live-region/contrast design |
| NFR-009 | fidelity registry and diagnostics |
| NFR-010 | local runtime and IndexedDB; no backend requirement |
| NFR-011 | schema/pack/lab/fixture/runtime version fields |
| NFR-012 | bounded output, file-query, fixture, and diagnostic buffers |
| NFR-013 | lockfile, Node version, exact runtime pins, `npm ci` |
| NFR-014 | documentation synchronization and ADR policy |

## 148.2 Usability Requirements

| SRS Requirement | Design Control |
|---|---|
| UR-001 | no authentication/profile dependency in app bootstrap |
| UR-002 | first-run `Start Linux Foundations` action |
| UR-003 | terminal-dominant `TrainingPage` composition |
| UR-004 | structured validation feedback panel |
| UR-005 | distinct clear-terminal, reset-lab, reset-progress actions |
| UR-006 | visible fidelity/simulation banner/badges |
| UR-007 | narrow-screen terminal advisory without false blocking |

---

# 149. Design Acceptance Criteria

The design is acceptable when it provides clear implementation answers for:

1. where runtime logic lives;
2. how UI communicates with runtime;
3. how content is loaded;
4. how labs are initialized;
5. how validation occurs;
6. how reset works;
7. how progress persists;
8. how mastery is computed;
9. how fidelity is represented;
10. how simulation remains explicit;
11. how errors are categorized;
12. how security boundaries are maintained;
13. how deployment supports WASIX;
14. how each subsystem is testable;
15. how future runtime/backend extensions can be added without breaking core domain logic.
16. every finalized SRS functional requirement group has an identified design owner;
17. all 15 SRS security requirements have explicit controls;
18. all 14 non-functional requirements and 7 usability requirements have design traceability.

---

# 150. Final Design Baseline

The approved SHELLGROUND implementation design is:

```text
React Presentation
        ↓
Application Services
        ↓
Domain + Ports
        ↓
────────────────────────────
Runtime Infrastructure
  Web Worker
  Wasmer/WASIX
  Virtual FS
────────────────────────────
Persistence Infrastructure
  IndexedDB
  Dexie
────────────────────────────
Content Infrastructure
  YAML
  Zod
  Static Packs
```

Terminal path:

```text
xterm.js
↓
TerminalController
↓
RuntimeClient
↓
Worker
↓
WasmerShellRuntime
```

Training path:

```text
LabDefinition
↓
FixtureCompiler
↓
Runtime
↓
Learner Action
↓
ValidatorRegistry
↓
Progress
↓
Mastery
```

The central design rule is:

> **SHELLGROUND must use real sandboxed shell behavior where verified, explicit simulation where necessary, and clean architectural boundaries everywhere.**

---

# 151. Reconciliation Outcome and Next Document

This SDD has now been reconciled against the finalized SRS.

Reconciliation result:

```text
Functional requirement groups: covered
Security requirements SR-001…SR-015: covered
Non-functional requirements NFR-001…NFR-014: covered
Usability requirements UR-001…UR-007: covered
Legacy provisional FR numbering: removed from traceability
```

The existing Implementation Plan remains structurally compatible with this reconciled design baseline.

The next and final project artifact in the planned sequence is:

```text
12. SINGLE CODING-AGENT PROMPT
```

That prompt shall treat this reconciled SDD and the finalized SRS as authoritative.
