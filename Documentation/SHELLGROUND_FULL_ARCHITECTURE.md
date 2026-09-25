# SHELLGROUND — Full Architecture Specification

> **Document:** Full Architecture Specification  
> **Project:** SHELLGROUND  
> **Sequence:** 3 of 13  
> **Depends on:** `SHELLGROUND_REQUIREMENTS.md`, `SHELLGROUND_FEATURE_SCOPE.md`  
> **Status:** Draft Architecture Baseline  
> **Architecture Style:** Local-first modular frontend with browser-side WASIX sandbox  
> **Primary Runtime Boundary:** Web Worker + Wasmer/WASIX  
> **Purpose:** Define how SHELLGROUND is structurally designed before command-support, curriculum, repository layout, schemas, UI specification, and implementation planning are finalized.

---

# 1. Architecture Objective

SHELLGROUND must provide a Linux command training environment without requiring a separately installed Linux operating system, WSL, Docker, VirtualBox, VMware, or a remote SSH training host.

The architecture must therefore provide:

```text
Browser UI
+
Terminal frontend
+
Browser-side shell runtime
+
Virtual filesystem
+
Scenario engine
+
Validation engine
+
Local persistence
+
Training analytics
+
Explicit runtime fidelity
```

The architecture must remain:

- local-first;
- modular;
- testable;
- deterministic;
- capability-restricted;
- transparent about runtime differences;
- extensible without introducing unnecessary backend infrastructure.

---

# 2. Architectural Drivers

The architecture is driven by the following approved requirements.

## 2.1 Functional Drivers

```text
FR-001  Capability detection
FR-002  Browser-side runtime
FR-003  Terminal interaction
FR-004  Virtual filesystem
FR-006  Structured labs
FR-007  Deterministic initialization
FR-008  Reset
FR-009  Validation
FR-019  Progress tracking
FR-021  Concept mastery
FR-026  Diagnostics
FR-027  Runtime fidelity
```

---

## 2.2 Security Drivers

```text
SR-001  Host filesystem isolation
SR-003  Network default deny
SR-004  No inbound exposure
SR-005  No raw sockets
SR-006  No arbitrary package sources
SR-008  Scenario data cannot execute arbitrary JavaScript
SR-009  Trusted validator implementations only
SR-010  Validated runtime messages
SR-014  Browser permission minimization
SR-015  Runtime cleanup
```

---

## 2.3 Quality Drivers

```text
NFR-001  Responsive UI
NFR-002  Maintainability
NFR-003  Extensibility
NFR-004  Testability
NFR-005  Determinism
NFR-006  Recoverability
NFR-009  Transparency
NFR-010  Local-first operation
NFR-011  Versionability
```

---

# 3. Architecture Principles

## AP-001 — Local First

Core training functionality shall execute locally in the browser.

The MVP shall not require an application backend for:

- shell execution;
- lab state;
- validation;
- progress;
- mastery;
- user settings.

---

## AP-002 — Dependency Inversion Around the Runtime

Application features shall depend on an abstract shell runtime interface.

They shall not depend directly on Wasmer-specific APIs.

Conceptually:

```text
Training Application
        ↓
ShellRuntime Port
        ↓
Wasmer Adapter
        ↓
Wasmer SDK / WASIX
```

This permits later replacement or addition of:

- another browser WASM runtime;
- a local native runtime;
- an isolated remote lab runtime;

without redesigning the training domain.

---

## AP-003 — Terminal Renderer Is Not the Shell

The architecture shall treat xterm.js as:

```text
Terminal Presentation
```

and not as:

```text
Command Runtime
```

Input/output wiring must remain explicit.

---

## AP-004 — Default Deny Capabilities

Runtime capabilities not required by the current training objective shall remain unavailable.

In particular:

```text
host filesystem       denied
arbitrary networking  denied
camera                 denied
microphone             denied
geolocation            denied
raw sockets            denied
```

---

## AP-005 — Scenarios Are Data

Training content shall remain declarative.

Content may describe:

- files;
- directories;
- missions;
- hints;
- validator types;
- validator parameters;
- scoring parameters.

Content shall not inject executable application code.

---

## AP-006 — Validation Measures Outcomes

Scenario validation should inspect observable outcomes instead of enforcing a single shell command sequence.

---

## AP-007 — Deterministic Reset Over Incremental Undo

When rollback correctness cannot be guaranteed, the architecture shall recreate the training sandbox instead of attempting to reverse arbitrary learner actions.

---

## AP-008 — Runtime Fidelity Must Be Explicit

The architecture shall make it possible to identify features as:

```text
native-wasix
simulated
unsupported
```

No subsystem may silently promote simulated behavior to native behavior.

---

## AP-009 — No Backend Until There Is a Backend Requirement

A backend shall not be added merely for architectural convention.

Future cloud synchronization can be introduced behind application interfaces later.

---

# 4. System Context

```text
┌──────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                                                              │
│ Keyboard / Mouse / Browser                                   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    SHELLGROUND WEB APP                       │
│                                                              │
│ React UI                                                     │
│ Training Domain                                              │
│ Terminal Frontend                                            │
│ Scenario Engine                                              │
│ Persistence                                                  │
│ Diagnostics                                                  │
└───────────────┬───────────────────────────┬──────────────────┘
                │                           │
                │                           │
                ▼                           ▼
┌──────────────────────────┐   ┌───────────────────────────────┐
│ Browser Runtime Sandbox  │   │ Browser Storage               │
│                          │   │                               │
│ Wasmer / WASIX           │   │ IndexedDB                     │
│ Virtual FS               │   │ Runtime package cache         │
│ Shell Process            │   │ Static application cache      │
└──────────────────────────┘   └───────────────────────────────┘
```

External runtime package resolution may occur during runtime initialization, depending on the final packaging strategy.

Arbitrary learner-controlled external networking is outside the MVP.

---

# 5. High-Level Container Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │                    Presentation Layer                        │ │
│ │                                                              │ │
│ │ Dashboard                                                    │ │
│ │ Lab Catalog                                                  │ │
│ │ Training Workspace                                           │ │
│ │ Playground                                                   │ │
│ │ Mastery                                                      │ │
│ │ Diagnostics                                                  │ │
│ │ Settings                                                     │ │
│ └───────────────────────────────┬──────────────────────────────┘ │
│                                 │                                │
│ ┌───────────────────────────────▼──────────────────────────────┐ │
│ │                    Application Layer                         │ │
│ │                                                              │ │
│ │ LabSessionService                                            │ │
│ │ ProgressService                                              │ │
│ │ MasteryService                                               │ │
│ │ DiagnosticsService                                           │ │
│ │ TrainingRecommendationService                                │ │
│ └─────────────┬─────────────────┬───────────────────┬─────────┘ │
│               │                 │                   │           │
│ ┌─────────────▼───────┐ ┌───────▼────────┐ ┌────────▼────────┐ │
│ │ Scenario Domain     │ │ Runtime Domain │ │ Persistence     │ │
│ │                     │ │                │ │                 │ │
│ │ Loader              │ │ ShellRuntime   │ │ Repositories    │ │
│ │ State Machine       │ │ Capabilities   │ │ IndexedDB       │ │
│ │ Validators          │ │ Fidelity       │ │ Migrations      │ │
│ │ Scoring             │ │ Snapshots      │ │                 │ │
│ └──────────┬──────────┘ └───────┬────────┘ └─────────────────┘ │
│            │                    │                               │
│            │            ┌───────▼─────────────────────────────┐ │
│            │            │ Runtime Adapter                     │ │
│            │            │                                     │ │
│            │            │ WasmerShellRuntime                  │ │
│            │            │ WorkerClient                        │ │
│            │            └───────┬─────────────────────────────┘ │
│            │                    │                               │
│ ┌──────────▼──────────┐ ┌───────▼─────────────────────────────┐ │
│ │ Content Packs       │ │ Dedicated Runtime Worker            │ │
│ │                     │ │                                     │ │
│ │ Labs                │ │ Wasmer SDK                          │ │
│ │ Fixtures            │ │ WASIX Sandbox                       │ │
│ │ Concepts            │ │ Shell Process                       │ │
│ │ Fidelity Metadata   │ │ Virtual Filesystem                  │ │
│ └─────────────────────┘ └─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

# 6. Layered Architecture

SHELLGROUND is divided into six logical layers.

```text
1. Presentation
2. Application
3. Domain
4. Ports
5. Infrastructure
6. Runtime Sandbox
```

---

# 7. Presentation Layer

## 7.1 Responsibilities

The presentation layer is responsible for:

- application routing;
- rendering;
- user input;
- navigation;
- terminal container lifecycle;
- displaying mission state;
- displaying validation results;
- displaying progress;
- accessibility;
- responsive layout.

---

## 7.2 Presentation Layer Must Not

The UI must not:

- create Wasmer sandboxes directly;
- query IndexedDB directly;
- execute validators directly;
- interpret scenario YAML directly;
- manipulate training filesystem state directly;
- infer runtime fidelity independently.

---

## 7.3 Primary Screens

The architecture anticipates:

```text
Dashboard
Lab Catalog
Training Workspace
Playground
Mastery
Diagnostics
Settings
```

Detailed UI behavior belongs to the later UI Design document.

---

# 8. Application Layer

The application layer coordinates user workflows.

It should contain use-case-oriented services rather than framework-specific components.

---

## 8.1 `LabSessionService`

Responsibilities:

```text
load lab
validate lab prerequisites
initialize runtime
seed fixture
start session
request validation
request hint
reset session
complete session
persist results
dispose runtime
```

Representative contract:

```ts
interface LabSessionService {
  prepare(labId: string): Promise<PreparedLabSession>;
  start(labId: string): Promise<ActiveLabSession>;
  validate(): Promise<LabValidationSummary>;
  requestHint(): Promise<HintResult>;
  reset(): Promise<void>;
  complete(): Promise<CompletedLabSession>;
  abandon(): Promise<void>;
}
```

---

## 8.2 `ProgressService`

Responsibilities:

- retrieve lab progress;
- record attempts;
- record completion;
- update best result;
- provide recent session history.

---

## 8.3 `MasteryService`

Responsibilities:

- update concept statistics;
- calculate mastery;
- identify low-confidence concepts;
- expose mastery summaries.

It must not contain UI-specific formatting.

---

## 8.4 `DiagnosticsService`

Responsibilities:

- browser capability check;
- cross-origin isolation check;
- storage availability;
- runtime availability;
- runtime version information;
- current content version;
- worker status.

---

## 8.5 `FidelityService`

Responsibilities:

- retrieve command/feature fidelity classifications;
- validate that lab requirements match runtime capability;
- prevent unsupported labs from launching;
- expose explanatory metadata.

---

# 9. Domain Layer

The domain layer contains SHELLGROUND-specific concepts independent of React, Wasmer, and IndexedDB.

---

## 9.1 Core Domain Entities

Representative entities:

```text
LabDefinition
LabSession
Mission
Hint
Concept
ValidatorDefinition
ValidationResult
LabScore
MasteryRecord
CommandFidelity
RuntimeCapability
ContentPack
```

---

## 9.2 Domain Invariants

Examples:

### Lab identity

```text
Lab ID must be globally unique within installed official content.
```

### Completed session

```text
A session cannot become COMPLETED unless all required validators pass.
```

### Unsupported capability

```text
A lab cannot start if it declares a capability that the runtime marks unsupported.
```

### Hint order

```text
Hints must be exposed according to configured progression.
```

### Scoring

```text
A score must remain within the configured minimum and maximum.
```

---

# 10. Port Interfaces

Ports separate business logic from infrastructure.

The following ports form the core architecture boundary.

---

# 11. Shell Runtime Port

## 11.1 Purpose

The rest of the application shall communicate with the guest execution environment only through an abstract runtime port.

---

## 11.2 Proposed Interface

```ts
export interface ShellRuntime {
  initialize(config: RuntimeInitialization): Promise<RuntimeHandle>;

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

  snapshot(
    request: SnapshotRequest
  ): Promise<RuntimeSnapshot>;

  terminateProcess(
    processId: string
  ): Promise<void>;

  reset(
    fixture: RuntimeFixture
  ): Promise<void>;

  dispose(): Promise<void>;
}
```

This is intentionally conceptual.

The final implementation shall adjust method boundaries after the runtime feasibility spike.

---

# 12. Terminal Process Handle

The shell runtime should expose a process-level handle rather than leaking SDK process objects.

```ts
interface TerminalProcessHandle {
  id: string;

  stdout: AsyncIterable<Uint8Array>;
  stderr: AsyncIterable<Uint8Array>;

  wait(): Promise<ProcessExit>;
}
```

Input and resize operations remain on the runtime port.

---

# 13. Runtime Event Model

Runtime lifecycle events may include:

```ts
type RuntimeEvent =
  | { type: "runtime.initializing" }
  | { type: "runtime.ready" }
  | { type: "process.started"; processId: string }
  | { type: "process.stdout"; processId: string; data: Uint8Array }
  | { type: "process.stderr"; processId: string; data: Uint8Array }
  | { type: "process.exited"; processId: string; exitCode: number }
  | { type: "runtime.resetting" }
  | { type: "runtime.disposed" }
  | { type: "runtime.error"; error: RuntimeErrorDTO };
```

---

# 14. Why Runtime APIs Are Wrapped

Direct use of Wasmer SDK objects from feature code would create:

- vendor coupling;
- difficult testing;
- lifecycle leaks;
- inability to introduce alternative runtimes;
- inconsistent error handling.

The adapter architecture ensures that Wasmer-specific behavior is confined to infrastructure.

---

# 15. Wasmer Runtime Adapter

## 15.1 Responsibilities

`WasmerShellRuntime` shall:

- initialize `@wasmer/sdk/browser`;
- create a sandbox;
- resolve only approved package identifiers;
- initialize files;
- start the interactive shell;
- stream process output;
- accept stdin;
- resize terminal processes;
- expose filesystem snapshots;
- terminate processes;
- close sandbox resources.

---

## 15.2 Browser Runtime Assumptions

The current browser SDK supports:

- browser-side sandbox creation;
- explicit package composition;
- files in the sandbox;
- sandbox filesystem operations;
- long-running interactive processes using `spawn()`;
- stdin/stdout/stderr streaming;
- terminal resizing;
- network-disabled operation by default.

These assumptions must be revalidated during the runtime spike before production implementation is locked.

---

# 16. Runtime Worker Boundary

## 16.1 Architectural Decision

The Wasmer integration shall execute behind a dedicated application worker boundary whenever technically supported by the current SDK architecture.

The browser SDK itself may internally use workers, but SHELLGROUND should still avoid coupling heavy orchestration directly to React.

---

## 16.2 Benefits

The worker boundary provides:

- main-thread responsiveness;
- explicit message contracts;
- runtime isolation;
- controlled cleanup;
- easier timeout handling;
- easier fault recovery.

---

## 16.3 Worker Responsibilities

The runtime worker may own:

```text
Wasmer client
sandbox handle
shell process handle
filesystem operations
runtime snapshot extraction
runtime lifecycle
```

---

## 16.4 Main Thread Responsibilities

The main thread shall own:

```text
React
xterm renderer
application state
scenario state
validation orchestration
IndexedDB
navigation
```

---

# 17. Worker Protocol

## 17.1 Request Envelope

```ts
interface WorkerRequestEnvelope<T> {
  id: string;
  type: string;
  payload: T;
}
```

---

## 17.2 Response Envelope

```ts
interface WorkerResponseEnvelope<T> {
  requestId?: string;
  type: string;
  payload?: T;
  error?: RuntimeErrorDTO;
}
```

---

## 17.3 Example Requests

```ts
type RuntimeWorkerRequest =
  | {
      id: string;
      type: "runtime.initialize";
      payload: RuntimeInitialization;
    }
  | {
      id: string;
      type: "terminal.open";
      payload: OpenTerminalRequest;
    }
  | {
      id: string;
      type: "terminal.stdin";
      payload: {
        processId: string;
        data: Uint8Array;
      };
    }
  | {
      id: string;
      type: "terminal.resize";
      payload: {
        processId: string;
        columns: number;
        rows: number;
      };
    }
  | {
      id: string;
      type: "runtime.snapshot";
      payload: SnapshotRequest;
    }
  | {
      id: string;
      type: "runtime.reset";
      payload: RuntimeFixture;
    }
  | {
      id: string;
      type: "runtime.dispose";
      payload: {};
    };
```

---

## 17.4 Validation of Messages

Every worker request must be runtime-validated before processing.

Malformed messages shall:

- be rejected;
- not execute;
- return a structured protocol error where possible.

---

# 18. Terminal Architecture

```text
Keyboard
  │
  ▼
xterm.js
  │ onData()
  ▼
TerminalController
  │
  ▼
RuntimeClient.write()
  │
  ▼
Worker
  │
  ▼
Shell stdin


Shell stdout/stderr
  │
  ▼
Worker
  │
  ▼
RuntimeClient event
  │
  ▼
TerminalController
  │
  ▼
xterm.write()
```

---

# 19. `TerminalView`

`TerminalView` is a React integration shell around xterm.js.

Responsibilities:

- DOM mount point;
- lifecycle;
- dimensions;
- accessible label;
- focus state.

It shall not contain runtime orchestration.

---

# 20. `TerminalController`

Responsibilities:

- construct xterm instance;
- wire `onData`;
- consume output events;
- resize;
- dispose addons;
- maintain terminal presentation state;
- expose high-level terminal commands to React.

Representative API:

```ts
interface TerminalController {
  mount(element: HTMLElement): void;
  connect(process: TerminalProcessPort): Promise<void>;
  focus(): void;
  fit(): void;
  clear(): void;
  dispose(): void;
}
```

---

# 21. Terminal Addons

Potentially allowed:

```text
FitAddon
Unicode support
Search addon
Accessibility-related options
```

Web-link behavior should be conservative because clickable external links are unnecessary for the MVP terminal.

---

# 22. Terminal Security Boundary

Terminal input is untrusted learner input.

However:

```text
learner input
must only reach
guest shell stdin
```

It shall not be interpolated into:

- host browser JavaScript;
- Node shell commands;
- deployment shell commands;
- URL fetch operations;
- package identifiers.

---

# 23. Scenario Engine Architecture

```text
Content Pack
   │
   ▼
Content Loader
   │
   ▼
Schema Validator
   │
   ▼
LabDefinition
   │
   ▼
Scenario Engine
   │
   ├── Mission State
   ├── Hints
   ├── Capabilities
   ├── Fixture
   ├── Validators
   └── Scoring
```

---

# 24. Content Loader

Responsibilities:

- resolve official content;
- parse YAML/JSON;
- validate schema;
- reject invalid references;
- produce typed domain objects.

---

# 25. Content Trust Model

MVP content sources:

```text
Bundled official content
```

Potential future sources:

```text
Imported local pack
Verified community pack
Remote signed pack
```

Only bundled official content is required for the MVP.

---

# 26. Scenario State Machine

```text
UNLOADED
   │
   ▼
LOADING
   │
   ▼
READY
   │
   ▼
ACTIVE
   │
   ├──────────► VALIDATING
   │                │
   │                ├──► ACTIVE
   │                │     failed
   │                │
   │                └──► COMPLETED
   │
   ├──────────► RESETTING
   │                │
   │                └──► ACTIVE
   │
   └──────────► ABANDONED
```

Failure path:

```text
LOADING
ACTIVE
VALIDATING
RESETTING
   │
   ▼
ERROR
```

---

# 27. Lab Session State

Representative model:

```ts
interface LabSession {
  id: string;
  labId: string;

  status:
    | "preparing"
    | "active"
    | "validating"
    | "completed"
    | "abandoned"
    | "error";

  startedAt: string;
  completedAt?: string;

  attempts: number;
  hintsUsed: number;

  latestValidation?: LabValidationSummary;
}
```

---

# 28. Fixture Architecture

A fixture represents the deterministic initial runtime environment.

Conceptual structure:

```ts
interface RuntimeFixture {
  id: string;
  version: number;
  files: FixtureFile[];
  directories: FixtureDirectory[];
  environment?: Record<string, string>;
  metadata?: FixtureMetadata;
}
```

---

# 29. Fixture Safety Rules

Fixture paths must:

- be normalized;
- remain inside guest filesystem scope;
- reject path traversal outside allowed roots;
- reject ambiguous unsafe host mapping syntax;
- never reference host paths.

Examples to reject at content-validation time:

```text
../../host
C:\Users\...
file:///etc/passwd
```

The guest may legitimately contain Linux-like absolute paths if represented safely by the sandbox model.

---

# 30. Reset Architecture

Two strategies are available.

## Strategy A — In-place Reconstruction

```text
stop shell
clear mutable training paths
reseed fixture
restart shell
```

Potential advantage:

- faster.

Risk:

- residual hidden state.

---

## Strategy B — Sandbox Recreation

```text
terminate process
close sandbox
create new sandbox
seed fixture
start shell
```

Advantages:

- stronger determinism;
- simpler state guarantees;
- fewer rollback assumptions.

---

## Architecture Decision

Prefer:

```text
Sandbox Recreation
```

for graded labs unless runtime testing demonstrates a reliable, cheaper equivalent.

Playground may use lighter reset semantics.

---

# 31. Validation Architecture

```text
User requests validation
        │
        ▼
LabSessionService
        │
        ▼
RuntimeSnapshotProvider
        │
        ▼
RuntimeSnapshot
        │
        ▼
ValidatorRegistry
        │
        ├── Validator A
        ├── Validator B
        └── Validator N
        │
        ▼
ValidationSummary
        │
        ├── pass
        ├── retry
        └── error
```

---

# 32. Runtime Snapshot

The validation layer shall not receive the entire runtime implementation.

It receives a deliberately bounded snapshot.

Conceptual model:

```ts
interface RuntimeSnapshot {
  stdoutTail?: string;
  stderrTail?: string;
  cwd?: string;

  files?: Record<string, FileSnapshot>;

  environment?: Record<string, string>;

  metadata: {
    capturedAt: string;
    runtimeVersion: string;
  };
}
```

The exact snapshot shape will be constrained after the runtime spike.

---

# 33. Snapshot Minimization

Validators should request only the state they require.

Example:

```text
pathExists("/opt/archive/.evidence")
```

should not require serializing the entire virtual filesystem when the runtime can query one path directly.

A future optimized architecture may replace broad snapshots with a validation query port.

---

# 34. Validator Registry

```text
ValidatorDefinition
      │
      ▼
ValidatorRegistry
      │
      ├── stdoutContains
      ├── stdoutRegex
      ├── pathExists
      ├── pathMissing
      ├── fileContentEquals
      ├── fileContentContains
      ├── cwdEquals
      └── hashEquals
```

Each validator implementation is trusted application code.

---

# 35. Validator Contract

```ts
interface Validator<
  TDefinition extends ValidatorDefinition = ValidatorDefinition
> {
  readonly type: TDefinition["type"];

  validate(
    definition: TDefinition,
    context: ValidationContext
  ): Promise<ValidationResult>;
}
```

---

# 36. Validation Result

```ts
interface ValidationResult {
  validatorId: string;
  passed: boolean;
  code: string;

  feedback?: {
    learnerMessage?: string;
    internalMessage?: string;
  };
}
```

Normal learner failure is not an exception.

---

# 37. Validation Summary

```ts
interface LabValidationSummary {
  passed: boolean;
  results: ValidationResult[];
  validatedAt: string;
}
```

---

# 38. Validation Security

Scenario content may contain:

```text
validator type
parameters
expected values
```

Scenario content may not contain:

```text
JavaScript functions
eval code
dynamic imports
shell commands to execute as validator logic
```

---

# 39. Hint Architecture

```text
LabDefinition
   │
   └── ordered hints
           │
           ▼
      HintService
           │
           ├── eligibility
           ├── next hint
           └── hint usage event
```

Hints remain domain content.

They are not generated dynamically in the MVP.

---

# 40. Scoring Architecture

Scoring belongs to the training domain, not the UI.

Inputs may include:

```text
completion status
attempt count
hints used
time
lab-specific scoring configuration
```

Exact scoring formulas will be finalized with the content/database schema.

---

# 41. Progress Architecture

```text
Lab Session
    │
    ▼
ProgressService
    │
    ▼
LabProgressRepository
    │
    ▼
IndexedDB
```

The application layer should not know Dexie query syntax.

---

# 42. Persistence Ports

Representative repositories:

```ts
interface LabProgressRepository {
  get(labId: string): Promise<LabProgress | null>;
  save(progress: LabProgress): Promise<void>;
  list(): Promise<LabProgress[]>;
}

interface SessionRepository {
  save(session: TrainingSessionRecord): Promise<void>;
  recent(limit: number): Promise<TrainingSessionRecord[]>;
}

interface MasteryRepository {
  get(conceptId: string): Promise<MasteryRecord | null>;
  save(record: MasteryRecord): Promise<void>;
  list(): Promise<MasteryRecord[]>;
}

interface SettingsRepository {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}
```

---

# 43. Persistence Infrastructure

IndexedDB is the MVP persistence technology.

Dexie may provide the implementation abstraction.

The architecture shall isolate Dexie-specific code inside:

```text
persistence/
```

---

# 44. Persistence Failure Policy

Progress persistence failure must not automatically terminate a running shell lab.

Instead:

```text
runtime continues
UI warns
progress marked unsaved
retry offered when appropriate
```

For exam-like future modes, stricter behavior may be introduced.

---

# 45. Local Data Categories

MVP local data:

```text
settings
lab progress
session history
concept mastery
command statistics
content versions
diagnostic preferences
```

Not stored:

```text
real passwords
API keys
private user files
host shell history
external credentials
```

---

# 46. Mastery Architecture

```text
Completed/Failed Session
         │
         ▼
MasteryService
         │
         ▼
MasteryCalculator
         │
         ▼
MasteryRepository
```

The calculator shall be deterministic.

---

# 47. Mastery Inputs

Potential inputs:

```text
success rate
attempt count
hints used
recency
completion duration
difficulty
```

No machine learning dependency is required.

---

# 48. Command Telemetry Architecture

Command telemetry is optional and must be treated carefully.

Potential flow:

```text
terminal input
   │
   ▼
CommandObservationService
   │
   ▼
best-effort parser
   │
   ▼
training statistics
```

It must not:

- decide whether a command is safe;
- decide whether a lab passes;
- act as a sandbox boundary.

---

# 49. Fidelity Architecture

```text
Runtime Spike Results
       │
       ▼
Fidelity Registry
       │
       ├── native-wasix
       ├── simulated
       └── unsupported
       │
       ▼
Lab Capability Resolver
       │
       ▼
Lab Launch Decision
```

---

# 50. Fidelity Registry Responsibilities

The registry shall store:

```text
command/feature ID
classification
verified runtime version
notes
known deviations
last verification date
```

Detailed entries belong to the next Command-Support Matrix document.

---

# 51. Capability Resolver

Before launching a lab:

```text
lab requirements
       │
       ▼
Capability Resolver
       │
       ├── runtime capabilities
       └── fidelity registry
       │
       ▼
launchable?
```

Possible outcomes:

```text
SUPPORTED
SUPPORTED_WITH_SIMULATION
BLOCKED
```

---

# 52. Simulation Architecture

Simulated behavior must not be inserted inside the real shell runtime invisibly.

Preferred design:

```text
simulation-aware lab
      │
      ▼
SimulationService
      │
      ▼
synthetic system data
```

If simulated commands are exposed through the terminal, they must be deliberately packaged and visibly classified.

---

# 53. Networking Architecture

## MVP Decision

```text
Guest arbitrary networking = disabled
```

No WISP endpoint shall be configured for ordinary training sessions.

---

## 53.1 Why Networking Is Disabled

The MVP curriculum does not require unrestricted guest networking.

Disabling it:

- reduces attack surface;
- improves determinism;
- prevents scanning external systems;
- avoids environment-dependent labs;
- simplifies testing.

---

## 53.2 Future Networking

Future controlled networking could use:

```text
fixture-bound simulation
or
explicit isolated lab backend
```

This must be designed separately.

---

# 54. Browser Capability Architecture

```text
Application Boot
      │
      ▼
CapabilityDetector
      │
      ├── WebAssembly
      ├── Worker
      ├── SharedArrayBuffer
      ├── crossOriginIsolated
      └── IndexedDB
      │
      ▼
CapabilityReport
```

---

# 55. Capability Report

```ts
interface CapabilityReport {
  webAssembly: CapabilityState;
  worker: CapabilityState;
  sharedArrayBuffer: CapabilityState;
  crossOriginIsolation: CapabilityState;
  indexedDb: CapabilityState;
}

type CapabilityState =
  | { available: true }
  | {
      available: false;
      reason: string;
      blocking: boolean;
    };
```

---

# 56. Boot Sequence

```text
Browser loads app
      │
      ▼
Render shell UI
      │
      ▼
Check static application version
      │
      ▼
Capability detection
      │
      ├── blocked
      │      ↓
      │   diagnostics UI
      │
      └── supported
             ↓
      show dashboard

Runtime itself remains lazy
until the user opens
a lab or playground.
```

---

# 57. Lazy Runtime Initialization

Wasmer must not initialize during every dashboard visit.

Reasons:

- package resolution cost;
- WebAssembly startup cost;
- memory;
- unnecessary worker creation.

Runtime initialization occurs when:

```text
lab starts
or
playground starts
```

---

# 58. Lab Launch Sequence

```text
User selects lab
      │
      ▼
Load LabDefinition
      │
      ▼
Validate content schema
      │
      ▼
Resolve required fidelity/capabilities
      │
      ├── blocked ──► explanation
      │
      ▼
Create LabSession
      │
      ▼
Initialize runtime worker
      │
      ▼
Create sandbox
      │
      ▼
Seed fixture
      │
      ▼
Start shell process
      │
      ▼
Connect terminal
      │
      ▼
ACTIVE
```

---

# 59. Command Input Sequence

```text
keyboard event
      │
      ▼
xterm
      │
      ▼
TerminalController
      │
      ▼
RuntimeClient
      │
      ▼
worker message
      │
      ▼
shell stdin
```

No command parser is required in the main application execution path.

---

# 60. Output Sequence

```text
shell stdout/stderr
      │
      ▼
Wasmer process streams
      │
      ▼
runtime worker
      │
      ▼
RuntimeClient
      │
      ▼
TerminalController
      │
      ▼
xterm
```

Optional training telemetry may observe output through a separate read-only path.

---

# 61. Validation Sequence

```text
User selects Validate
      │
      ▼
LabSessionService
      │
      ▼
Set state = VALIDATING
      │
      ▼
Collect required runtime state
      │
      ▼
Run validators
      │
      ├── fail
      │      ↓
      │   record attempt
      │   feedback
      │   state = ACTIVE
      │
      └── pass
             ↓
          calculate score
             ↓
          update progress
             ↓
          update mastery
             ↓
          persist session
             ↓
          state = COMPLETED
```

---

# 62. Reset Sequence

```text
User selects Reset
      │
      ▼
state = RESETTING
      │
      ▼
disconnect terminal
      │
      ▼
terminate shell
      │
      ▼
dispose sandbox
      │
      ▼
create fresh sandbox
      │
      ▼
seed original fixture
      │
      ▼
start new shell
      │
      ▼
connect terminal
      │
      ▼
state = ACTIVE
```

---

# 63. Shutdown Sequence

When leaving a lab:

```text
stop accepting terminal input
      │
      ▼
terminate process
      │
      ▼
close sandbox
      │
      ▼
close runtime client if unused
      │
      ▼
terminate worker
      │
      ▼
dispose xterm
      │
      ▼
release listeners/observers
```

---

# 64. Resource Ownership

Ownership must be explicit.

| Resource | Owner |
|---|---|
| React route | Router |
| Training session | LabSessionService |
| xterm instance | TerminalController |
| Runtime worker | RuntimeClient |
| Wasmer client | Runtime worker |
| Sandbox | Runtime worker |
| Shell process | Runtime worker |
| IndexedDB connection | Persistence infrastructure |

The resource owner is responsible for cleanup.

---

# 65. Error Architecture

Errors are divided into categories.

```text
Capability
Content
Runtime
Process
Validation
Persistence
Protocol
Application
```

---

# 66. Error Types

Representative domain/application errors:

```text
CapabilityUnavailableError
ContentLoadError
ScenarioSchemaError
FixtureInitializationError
RuntimeInitializationError
RuntimeProcessError
RuntimeTimeoutError
RuntimeProtocolError
ValidationInfrastructureError
PersistenceUnavailableError
PersistenceWriteError
UnsupportedLabCapabilityError
```

---

# 67. Error Handling Principle

Expected learner failure:

```text
not exceptional
```

Examples:

- wrong file;
- missing output;
- incorrect result.

These return validation failure results.

Infrastructure failure:

```text
exceptional
```

Examples:

- worker crash;
- invalid content schema;
- sandbox cannot initialize;
- IndexedDB transaction failure.

---

# 68. Runtime Crash Recovery

If the runtime worker terminates unexpectedly:

```text
mark lab runtime error
      │
      ▼
disconnect terminal
      │
      ▼
preserve session metadata
      │
      ▼
offer clean restart
      │
      ▼
recreate sandbox
```

Do not attempt to reuse an unknown corrupt runtime state.

---

# 69. Timeout Architecture

Potential timeouts:

```text
runtime initialization timeout
shell startup timeout
snapshot timeout
reset timeout
process termination timeout
```

Timeouts should produce typed errors and trigger cleanup.

---

# 70. Logging Architecture

MVP logging:

```text
development structured console logs
local diagnostic report
```

No mandatory external telemetry.

---

# 71. Logger Contract

```ts
interface AppLogger {
  debug(event: string, context?: Record<string, unknown>): void;
  info(event: string, context?: Record<string, unknown>): void;
  warn(event: string, context?: Record<string, unknown>): void;
  error(event: string, context?: Record<string, unknown>): void;
}
```

Production should suppress noisy debug logs.

---

# 72. Sensitive Logging Rules

Never log:

```text
real user credentials
clipboard contents
external tokens
complete arbitrary file content
```

Synthetic lab content may still be omitted unless needed for diagnostics.

---

# 73. Diagnostic Export

A future local diagnostic export may include:

```text
app version
browser name/version
capability report
runtime version
content version
active lab ID
error codes
fidelity registry version
```

It should exclude unnecessary learner command content by default.

---

# 74. State Management Architecture

State is separated by concern.

---

## 74.1 UI State

Examples:

```text
sidebar open
selected tab
terminal dimensions
theme
dialog visibility
```

May use local component state or a lightweight store.

---

## 74.2 Application Session State

Examples:

```text
current lab
session status
hints
attempt count
validation state
runtime status
```

May use Zustand or an explicit service/store.

---

## 74.3 Persistent State

Examples:

```text
progress
mastery
settings
session history
```

Stored in IndexedDB through repositories.

---

## 74.4 Runtime State

Examples:

```text
sandbox
process
guest filesystem
cwd
guest env
```

Owned by the runtime worker.

React must not mirror the entire runtime state.

---

# 75. Avoiding State Duplication

Do not simultaneously treat:

```text
React state
Zustand
IndexedDB
runtime worker
```

as authoritative for the same piece of data.

Each domain must have a single source of truth.

---

# 76. Suggested Authority Map

| Data | Source of Truth |
|---|---|
| Active runtime process | runtime worker |
| Guest filesystem | sandbox |
| Active lab workflow | lab session store/service |
| Terminal presentation | TerminalController |
| Persistent progress | IndexedDB |
| Content definition | bundled content |
| Fidelity classification | fidelity registry |
| Browser capabilities | DiagnosticsService |

---

# 77. Package Resolution Architecture

The runtime must only resolve approved package identifiers.

Recommended architecture:

```text
TrustedRuntimeManifest
      │
      ▼
RuntimePackageResolver
      │
      ▼
Wasmer sandbox package list
```

User shell input must never become a package ID.

---

# 78. Trusted Runtime Manifest

Conceptual example:

```ts
interface TrustedRuntimePackage {
  id: string;
  packageRef: string;
  expectedRole: "shell" | "utilities";
  enabled: boolean;
}
```

Exact package identifiers belong to the runtime spike and command-support work.

---

# 79. Version Pinning

Runtime registry packages should be exactly pinned where the registry supports deterministic version references.

The architecture shall persist or expose the resolved runtime package version in diagnostics.

---

# 80. Browser Storage Architecture

There may be two distinct browser storage concerns.

```text
Application Data
  → IndexedDB managed by SHELLGROUND

Runtime Cache
  → browser storage managed by Wasmer SDK
```

These must not be conflated.

---

# 81. Cache Failure Behavior

If the Wasmer runtime cache is cleared:

```text
user progress must remain intact
```

If SHELLGROUND IndexedDB is cleared:

```text
runtime package cache may remain
```

The two data domains are independent.

---

# 82. Deployment Architecture

```text
GitHub Repository
      │
      ▼
GitHub Actions
      │
      ├── lint
      ├── typecheck
      ├── unit tests
      ├── content tests
      └── build
      │
      ▼
Static Build Artifact
      │
      ▼
Cloudflare Pages
      │
      ▼
HTTPS + required headers
      │
      ▼
Browser
```

---

# 83. Why Static Hosting Fits the MVP

The application has no required backend.

Therefore the production artifact can remain:

```text
HTML
CSS
JavaScript
WASM/runtime assets
content files
```

This reduces operational complexity.

---

# 84. Cross-Origin Isolation

The browser runtime requires cross-origin isolation for `SharedArrayBuffer`.

Production must return:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

The application must verify:

```js
window.crossOriginIsolated === true
```

before runtime creation.

---

# 85. Additional Security Headers

Target baseline:

```http
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

A strict CSP shall be designed after verifying:

- Wasmer worker loading;
- WebAssembly loading;
- asset origins;
- package resolution behavior.

Do not guess a CSP and break the runtime.

---

# 86. Cloudflare Pages Header Strategy

For static Pages deployment:

```text
public/_headers
```

can configure static response headers.

If Pages Functions are later introduced, response headers for those function-generated responses must be configured in the function path itself.

---

# 87. Environment Configuration

Build-time configuration should remain minimal.

Potential environment values:

```text
APP_VERSION
CONTENT_VERSION
RUNTIME_CHANNEL
ENABLE_DIAGNOSTICS
```

Do not place secrets in frontend environment variables.

---

# 88. Secrets Architecture

MVP should require no application secret.

Any value shipped in frontend JavaScript must be treated as public.

---

# 89. Content Delivery Architecture

MVP content can be bundled with the application build.

```text
source content
      │
      ▼
build validation
      │
      ▼
compiled/static content
      │
      ▼
browser loader
```

This provides deterministic versioning.

---

# 90. Content Build Validation

Before build success:

```text
parse all labs
validate all schemas
validate IDs
validate fixture references
validate concept references
validate validator types
validate capability references
```

Invalid official content fails CI.

---

# 91. Content Runtime Validation

Even bundled content should be validated again at runtime boundaries where practical.

Reason:

- corrupted cache;
- incompatible version;
- development content;
- future imported packs.

---

# 92. Version Compatibility

The architecture shall distinguish:

```text
application version
content schema version
content pack version
persistence schema version
runtime package version
fidelity registry version
```

---

# 93. Compatibility Check

On application load:

```text
content schema
     │
     ▼
supported by app?
```

If not:

```text
do not execute content
show compatibility error
```

---

# 94. Persistence Migration Architecture

IndexedDB migrations shall be explicit.

Conceptual:

```text
v1
  ↓
v2 migration
  ↓
v3 migration
```

Do not silently delete user progress on normal upgrades.

---

# 95. Content Migration Policy

Official content should be immutable per version where possible.

When a lab changes materially:

```text
increment lab/content version
```

rather than silently changing historical scoring semantics.

---

# 96. Performance Architecture

Primary performance risks:

```text
runtime package download
WebAssembly startup
sandbox initialization
large fixtures
terminal rendering
filesystem snapshots
```

---

# 97. Performance Strategy

Use:

- lazy runtime loading;
- lazy lab loading where practical;
- bounded output buffers;
- targeted validation queries;
- runtime asset caching;
- worker isolation;
- fixture size limits.

---

# 98. Terminal Output Limits

Long-running commands could generate excessive output.

The application should:

- let xterm manage visible scrollback;
- bound application-side transcript buffers;
- avoid retaining unlimited stdout copies.

---

# 99. Snapshot Limits

Never serialize an unbounded virtual filesystem during validation.

Possible safeguards:

```text
path allowlist
max files
max bytes
specific validator queries
```

---

# 100. Resource Quotas

The MVP should prepare for logical resource limits such as:

```text
max fixture file size
max fixture total size
max captured stdout
max validation read size
max process startup time
max reset duration
```

Exact limits belong to implementation tuning.

---

# 101. Concurrency Model

MVP supports:

```text
one active interactive lab runtime per browser tab
```

Multiple simultaneous shells are not required.

---

# 102. Multiple Browser Tabs

Two tabs may independently run SHELLGROUND.

Persistent progress writes may conflict.

MVP policy:

```text
last successful write wins
```

Future versions may add BroadcastChannel coordination if needed.

---

# 103. Offline Architecture

Offline/PWA is not an MVP blocker.

However, the architecture avoids backend dependency so that future offline support remains possible.

Potential future offline layers:

```text
app shell cache
content cache
runtime package cache
```

---

# 104. PWA Boundary

PWA behavior must not own core application state.

It is deployment/application-shell infrastructure only.

---

# 105. Accessibility Architecture

Core architecture must permit:

- keyboard-first navigation;
- visible focus;
- screen reader labels;
- configurable terminal contrast;
- reduced motion.

Terminal accessibility settings should be delegated to xterm capabilities where available.

---

# 106. Security Threat Model Summary

Primary threats include:

```text
T1 malicious learner terminal input
T2 malformed content
T3 unsafe package resolution
T4 worker protocol injection
T5 path traversal in fixtures
T6 runaway runtime process
T7 excessive resource consumption
T8 accidental network enablement
T9 host filesystem exposure
T10 stale/incompatible content
```

---

# 107. Threat Mitigations

## T1 — Malicious terminal input

Mitigation:

```text
input only reaches guest stdin
```

---

## T2 — Malformed content

Mitigation:

```text
schema validation
content build tests
runtime validation
```

---

## T3 — Unsafe package resolution

Mitigation:

```text
trusted pinned runtime manifest
no user package URLs
```

---

## T4 — Worker protocol injection

Mitigation:

```text
discriminated message schema
runtime validation
unknown message rejection
```

---

## T5 — Path traversal

Mitigation:

```text
fixture path normalization
guest-only path policy
content validation
```

---

## T6 — Runaway process

Mitigation:

```text
termination API
worker lifecycle
timeouts
sandbox recreation
```

---

## T7 — Resource exhaustion

Mitigation:

```text
bounded logs
bounded fixtures
bounded snapshots
timeouts
```

---

## T8 — Network accidentally enabled

Mitigation:

```text
omit network capability configuration
integration test expected network denial
```

---

## T9 — Host filesystem exposure

Mitigation:

```text
do not map host filesystem
browser sandbox only
```

---

## T10 — Stale content

Mitigation:

```text
schema versioning
content versioning
compatibility gates
```

---

# 108. Security Trust Boundaries

```text
┌───────────────────────────────┐
│ Trusted Application Code      │
│                               │
│ UI / Domain / Validators      │
└──────────────┬────────────────┘
               │ validated protocol
===============┼========================
               │
┌──────────────▼────────────────┐
│ Guest Runtime Boundary        │
│                               │
│ WASIX shell + learner input   │
└───────────────────────────────┘
```

Another trust boundary:

```text
Official content
      │
      ▼
schema validator
===============
trusted typed domain object
```

---

# 109. Backend Architecture — Explicit Non-MVP

There is no MVP application server.

Therefore there is no:

```text
REST API
GraphQL API
server database
server session
server authentication
cloud user profile
```

---

# 110. Future Backend Compatibility

If cloud sync is later introduced, use ports such as:

```ts
interface ProgressSyncPort {
  push(changes: ProgressChangeSet): Promise<void>;
  pull(since?: string): Promise<ProgressChangeSet>;
}
```

The current local repository remains the source of truth until sync semantics are deliberately designed.

---

# 111. Future Remote Lab Compatibility

If future networking/security labs require full Linux isolation:

```text
ShellRuntime
   ├── WasmerBrowserRuntime
   └── RemoteIsolatedRuntime
```

This is the main reason for runtime abstraction.

No remote runtime is required now.

---

# 112. Architecture Decision Records

The project should record major architecture decisions.

Recommended ADRs:

```text
ADR-001 Browser-local execution
ADR-002 Wasmer/WASIX runtime adapter
ADR-003 xterm.js terminal frontend
ADR-004 No backend for MVP
ADR-005 Network default deny
ADR-006 Scenario-as-data model
ADR-007 IndexedDB local persistence
ADR-008 Sandbox recreation reset strategy
ADR-009 Explicit command fidelity registry
ADR-010 Static hosting with cross-origin isolation
```

---

# 113. ADR-001 — Browser-Local Execution

## Decision

Execute core shell training locally in the browser.

## Reason

Matches product constraint:

```text
no Linux install
no VM
no WSL
no remote training server
```

## Consequence

Kernel-dependent behavior cannot be assumed.

---

# 114. ADR-002 — Wasmer/WASIX Runtime Adapter

## Decision

Use Wasmer browser SDK as the initial execution backend, behind a port.

## Reason

Current SDK provides:

- browser-local WASIX;
- package-based sandboxes;
- files;
- interactive process streaming;
- terminal resizing;
- capability-based network access.

## Consequence

Exact shell command coverage must be verified before curriculum finalization.

---

# 115. ADR-003 — xterm.js Terminal Frontend

## Decision

Use xterm.js only for terminal presentation.

## Consequence

Runtime process and terminal UI remain independently testable.

---

# 116. ADR-004 — No Backend

## Decision

No application backend in MVP.

## Consequence

No account/cloud sync initially.

---

# 117. ADR-005 — Network Default Deny

## Decision

Do not configure guest network capability.

## Consequence

Networking exercises must initially use simulation or fixtures.

---

# 118. ADR-006 — Scenario-as-Data

## Decision

Labs are declarative structured content.

## Consequence

Adding official labs does not require new application code unless a new validator/capability is needed.

---

# 119. ADR-007 — IndexedDB

## Decision

Use IndexedDB for local persistence, likely through Dexie.

## Consequence

Browser-local progress persists without a backend.

---

# 120. ADR-008 — Sandbox Recreation Reset

## Decision

Prefer recreating the sandbox for deterministic graded-lab reset.

## Consequence

Potential reset latency is accepted in exchange for correctness.

---

# 121. ADR-009 — Fidelity Registry

## Decision

Maintain explicit command/feature fidelity metadata.

## Consequence

Labs can be blocked when current runtime support is insufficient.

---

# 122. ADR-010 — Static Hosting

## Decision

Deploy the MVP as a static web application on a host supporting custom headers.

Cloudflare Pages is the preferred baseline.

## Consequence

Cross-origin isolation must be configured at the hosting layer.

---

# 123. Testing Architecture

Testing is divided into five layers.

```text
Unit
Domain
Integration
Content
E2E
```

---

# 124. Unit Tests

Target:

```text
pure utilities
state transitions
scoring
mastery calculations
protocol schemas
```

---

# 125. Domain Tests

Target:

```text
lab session rules
validator orchestration
hint sequencing
capability resolution
```

---

# 126. Infrastructure Integration Tests

Target:

```text
IndexedDB repositories
Wasmer adapter
worker protocol
fixture creation
runtime reset
```

---

# 127. Content Tests

Every official lab shall be checked for:

```text
valid schema
unique ID
valid concepts
valid fixture
valid validators
supported capabilities
reference solution
```

---

# 128. End-to-End Tests

Representative flow:

```text
load app
capability check
open lab
runtime initializes
terminal accepts input
solve known lab
validate
complete
reload
progress persists
```

---

# 129. Runtime Contract Testing

Because the browser runtime is a critical external dependency, maintain a runtime conformance suite.

Examples:

```text
can start sandbox
can start shell
stdin works
stdout works
stderr works
resize works
file creation works
file read works
reset works
network remains unavailable
```

---

# 130. Architecture Fitness Functions

The architecture should include automated checks where practical.

Examples:

```text
UI cannot import Wasmer adapter directly
scenario files cannot contain JS
unsupported validator types fail build
runtime package refs are pinned
network config absent in MVP runtime
content IDs unique
```

---

# 131. Import Boundary Rules

Recommended dependency direction:

```text
features
  ↓
application/domain
  ↓
ports

infrastructure
  ↓
ports/domain
```

Forbidden pattern:

```text
domain
  → React
domain
  → Dexie
domain
  → Wasmer
```

---

# 132. Build Architecture

Conceptual build:

```text
TypeScript source
React source
Content files
        │
        ▼
Validation / Typecheck
        │
        ▼
Vite Build
        │
        ▼
Static output
```

Official content validation must run before or during CI build.

---

# 133. CI Architecture

```text
Pull Request
    │
    ▼
npm ci
    │
    ├── lint
    ├── typecheck
    ├── unit tests
    ├── content tests
    └── build
```

Optional supported-browser integration/E2E stage:

```text
build
  ↓
serve with required headers
  ↓
Playwright
```

---

# 134. Deployment Promotion

Recommended:

```text
feature branch
   ↓
pull request
   ↓
CI
   ↓
preview
   ↓
merge main
   ↓
production deployment
```

No automatic production deployment from untrusted fork code.

---

# 135. Runtime Development Environment

Local development must also provide cross-origin isolation.

Development server configuration shall send:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Localhost satisfies secure-context requirements where browser rules allow.

---

# 136. Runtime Compatibility Gate

The runtime spike must answer:

```text
Which shell package?
Which exact version?
Which commands?
Which shell operators?
Which filesystem semantics?
Which process semantics?
How does reset behave?
How much memory?
How long is cold start?
```

No curriculum assumption shall override measured runtime behavior.

---

# 137. Architecture Deliverables Before Implementation

The architecture phase is complete when the project has approved:

```text
runtime boundary
terminal boundary
worker protocol concept
scenario engine boundary
validator boundary
persistence boundary
mastery boundary
security boundary
deployment topology
error model
reset strategy
fidelity model
testing layers
```

---

# 138. Architecture Non-Goals

This document intentionally does not finalize:

- exact command support;
- final curriculum sequence;
- repository directory names;
- exact Dexie table schemas;
- final UI visuals;
- project milestones;
- SPMP;
- SRS;
- SDD;
- implementation task breakdown;
- coding-agent prompt.

Those belong to subsequent documents.

---

# 139. End-to-End Architectural View

```text
                             ┌───────────────────┐
                             │       User        │
                             └─────────┬─────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         React Presentation                          │
│                                                                     │
│ Dashboard | Catalog | Training | Playground | Mastery | Diagnostics │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Application Services                        │
│                                                                     │
│ LabSession | Progress | Mastery | Fidelity | Diagnostics            │
└──────────────┬────────────────────────┬─────────────────────┬───────┘
               │                        │                     │
               ▼                        ▼                     ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────┐
│ Scenario Domain      │   │ Runtime Port         │   │ Repositories │
│                      │   │                      │   │              │
│ Content              │   │ ShellRuntime         │   │ IndexedDB    │
│ Validators           │   │ RuntimeSnapshot      │   │              │
│ Scoring              │   │ CapabilityResolver   │   │              │
└──────────┬───────────┘   └────────────┬─────────┘   └──────────────┘
           │                            │
           │                            ▼
           │                 ┌──────────────────────┐
           │                 │ Wasmer Adapter       │
           │                 └──────────┬───────────┘
           │                            │
           │                            ▼
           │                 ┌──────────────────────┐
           │                 │ Runtime Worker       │
           │                 └──────────┬───────────┘
           │                            │
           │                            ▼
           │                 ┌──────────────────────┐
           │                 │ WASIX Sandbox        │
           │                 │                      │
           │                 │ Shell                │
           │                 │ Virtual FS           │
           │                 │ Guest Processes      │
           │                 └──────────────────────┘
           │
           ▼
┌──────────────────────────┐
│ Bundled Training Content │
│                          │
│ Labs                     │
│ Fixtures                 │
│ Concepts                 │
│ Fidelity metadata        │
└──────────────────────────┘
```

---

# 140. Architecture Baseline

The approved baseline architecture is:

```text
Local-first browser application
        +
React presentation
        +
xterm.js terminal frontend
        +
application/domain service layer
        +
abstract ShellRuntime port
        +
Wasmer browser adapter
        +
runtime worker boundary
        +
WASIX sandbox
        +
declarative scenario engine
        +
trusted validator registry
        +
IndexedDB persistence
        +
explicit fidelity registry
        +
static deployment with cross-origin isolation
```

This architecture preserves the central SHELLGROUND goal:

> **Train real Linux command-line thinking without requiring a full Linux operating system, while remaining explicit about the limitations of the browser runtime.**

---

# 141. Verified Technical Basis

The architecture should be revalidated during implementation, but as of the architecture drafting date the selected technologies document the following relevant capabilities:

## Wasmer JavaScript SDK

The current JavaScript SDK documents:

- browser execution through `@wasmer/sdk/browser`;
- local browser sandboxes;
- package composition;
- sandbox filesystem operations;
- interactive process spawning;
- live stdin/stdout/stderr;
- terminal resizing;
- network access disabled unless a network capability is configured;
- browser use of Web Workers and `SharedArrayBuffer`;
- requirement for cross-origin isolation.

Reference:

```text
https://docs.wasmer.io/runtime/js/
https://docs.wasmer.io/runtime/
```

## xterm.js

The xterm.js project documents that it is a browser terminal frontend and is not itself Bash or a shell runtime.

Reference:

```text
https://github.com/xtermjs/xterm.js
```

## Cloudflare Pages

Cloudflare Pages supports custom response headers using a `_headers` file for static asset responses.

Reference:

```text
https://developers.cloudflare.com/pages/configuration/headers/
```

---

# 142. Next Document

With the architecture baseline established, the next document in sequence is:

```text
4. COMMAND-SUPPORT MATRIX
```

That document will determine, command by command:

```text
what must be real
what may be simulated
what is unsupported
what the runtime spike must verify
which curriculum stages depend on each command
```

No command shall be marked as truly supported solely because it is architecturally desirable.
