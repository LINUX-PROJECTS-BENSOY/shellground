# SHELLGROUND — Implementation Plan

> **Document:** Implementation Plan  
> **Project:** SHELLGROUND  
> **Sequence:** 11 of 13  
> **Status:** Execution Baseline  
> **Primary Release:** v0.1.0 MVP  
> **Implementation Style:** Incremental, bounded branches, one major concern per PR  
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
> - `SHELLGROUND_SDD.md`

---

# 1. Purpose

This document converts the approved SHELLGROUND design into an executable implementation sequence.

It defines:

```text
branch order
task order
dependency order
file/module targets
tests
acceptance criteria
PR boundaries
documentation updates
completion evidence
```

The goal is to let a developer or coding agent implement the project without making major architecture decisions ad hoc.

---

# 2. Execution Rule

Implementation shall follow this rule:

> **Do not move to a downstream phase until the upstream technical gate is satisfied.**

The most important gate is Phase 0.

If the browser runtime cannot support the required shell model, downstream work must not proceed as though it can.

---

# 3. Global Branch Order

Recommended sequence:

```text
main

feat/runtime-spike
feat/foundation
feat/terminal
feat/wasix-runtime
feat/scenario-engine
feat/validation
feat/deterministic-reset
feat/persistence
feat/mastery
feat/core-curriculum
feat/product-ux
chore/deployment-hardening
release/0.1.0
```

Each branch should be created from the latest approved `main`.

---

# 4. Global Quality Gates

Every implementation branch must pass relevant subsets of:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:content
npm run build
npm run test:e2e
```

No branch should intentionally merge with known failing required checks.

---

# 5. Step 0 — Create Repository

## Branch

```text
main
```

## Goal

Create the GitHub repository and establish the project baseline.

## Tasks

1. Create repository:
   ```text
   ben-bacs/SHELLGROUND
   ```
2. Initialize:
   ```text
   README.md
   LICENSE
   .gitignore
   docs/
   ```
3. Add planning documents under:
   ```text
   docs/
   ```
4. Protect `main` where practical.
5. Enable GitHub Actions.
6. Create initial milestone:
   ```text
   v0.1.0 MVP
   ```

## Acceptance

Repository exists and `main` contains documentation baseline only.

---

# 6. Step 1 — Runtime Feasibility Spike

## Branch

```text
feat/runtime-spike
```

## Goal

Prove the browser runtime before building the product.

## Files / Areas

```text
experiments/runtime-spike/
docs/runtime/
package.json
vite.config.ts
public/_headers
```

## Tasks

### 1.1 Minimal Vite/TypeScript Prototype

Create the smallest browser app possible.

Do not build full React product UI yet.

### 1.2 Cross-Origin Isolation

Configure development headers:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Verify:

```js
window.crossOriginIsolated === true
```

### 1.3 Wasmer SDK

Install current compatible browser SDK.

Use the documented browser entry point.

### 1.4 Shell Package

Use an exact pinned shell package version.

Do not use an unpinned `latest` reference in final spike results.

### 1.5 STDIO

Verify:

```text
stdin
stdout
stderr
```

### 1.6 Terminal Behavior

Verify:

```text
interactive process
resize
Ctrl+C if supported
Ctrl+D if supported
```

### 1.7 Filesystem

Test:

```text
create file
read file
create directory
relative path
absolute path
hidden file
```

### 1.8 Core Commands

Verify at minimum:

```text
pwd
cd
ls
echo
printf
mkdir
touch
cat
cp
mv
rm
grep
find
sort
wc
env
test
```

### 1.9 Shell Features

Verify:

```text
|
>
>>
<
2>
&&
||
;
$VAR
${VAR}
$()
globbing
quoting
exit status
simple script execution
```

### 1.10 Extended Candidates

Attempt:

```text
head
tail
uniq
cut
tr
sed
awk
tee
basename
dirname
readlink
ln
sha256sum
tar
gzip
chmod
stat
du
sleep
ps
kill
```

### 1.11 Networking

Ensure arbitrary networking is not enabled.

### 1.12 Reset

Test complete sandbox teardown/recreation.

### 1.13 Record Results

Create:

```text
docs/runtime/RUNTIME_SPIKE_RESULTS.md
docs/runtime/COMMAND_FIDELITY.md
docs/runtime/KNOWN_LIMITATIONS.md
```

## Required Tests

Create runtime conformance tests for:

```text
boot
stdio
filesystem
pipes
redirection
environment
scripts
reset
network denial
dispose
```

## Exit Gate

Proceed only if the runtime reliably supports the command core required by the MVP.

## PR Scope

Only runtime feasibility work and documentation.

Do not include dashboard, persistence, mastery, or 20-lab content.

---

# 7. Step 2 — Repository Foundation

## Branch

```text
feat/foundation
```

## Goal

Create production repository structure.

## Tasks

### 2.1 Create React/Vite App

Use:

```text
React
TypeScript
Vite
```

### 2.2 Strict TypeScript

Configure strict compiler settings.

### 2.3 ESLint

Add consistent lint configuration.

### 2.4 Vitest

Add unit test framework.

### 2.5 Playwright

Add E2E framework.

### 2.6 Project Structure

Create:

```text
src/app
src/application
src/domain
src/features
src/infrastructure
src/runtime
src/terminal
src/shared
src/styles

content/
docs/
scripts/
tests/
```

### 2.7 Path Aliases

Recommended:

```text
@app/*
@application/*
@domain/*
@features/*
@infrastructure/*
@runtime/*
@terminal/*
@shared/*
```

### 2.8 Import Boundary Verification

Create script or lint rules preventing architecture violations.

### 2.9 CI

Add `.github/workflows/ci.yml`.

Required:

```text
npm ci
lint
typecheck
unit tests
build
```

## Exit Gate

A clean clone passes all baseline commands.

---

# 8. Step 3 — Terminal Subsystem

## Branch

```text
feat/terminal
```

## Goal

Build terminal presentation independent of real runtime.

## Target Files

```text
src/terminal/
├── TerminalView.tsx
├── TerminalController.ts
├── terminal.types.ts
├── addons/
├── themes/
└── hooks/
```

## Tasks

### 3.1 xterm Installation

Install the current supported xterm package.

### 3.2 TerminalView

Mount the terminal DOM container.

### 3.3 TerminalController

Own:

```text
xterm instance
input callback
output writes
fit
resize
focus
dispose
```

### 3.4 Fit Addon

Integrate viewport resizing.

### 3.5 Mock Process Port

Create a fake terminal backend.

### 3.6 Lifecycle

Test mount/unmount repeatedly.

### 3.7 Accessibility

Add accessible terminal label and focus behavior.

## Tests

```text
mount
input forwarding
stdout display
stderr display
resize
focus
dispose
listener cleanup
```

## Exit Gate

Terminal works against a fake runtime without importing Wasmer.

---

# 9. Step 4 — Runtime Productionization

## Branch

```text
feat/wasix-runtime
```

## Goal

Convert spike into production runtime architecture.

## Target Files

```text
src/runtime/
├── ports/
├── client/
├── worker/
├── wasmer/
├── capabilities/
├── fidelity/
└── manifest/
```

## Tasks

### 4.1 ShellRuntime Port

Implement interface.

### 4.2 RuntimeClient

Main-thread runtime client.

### 4.3 Worker Protocol

Create typed request/response/event unions.

### 4.4 Zod/Runtime Validation

Validate worker messages.

### 4.5 WasmerShellRuntime

Move Wasmer-specific logic here.

### 4.6 Trusted Runtime Manifest

Pin approved runtime packages.

### 4.7 Runtime Package Resolver

Only permit known manifest entries.

### 4.8 STDIO Bridge

Connect runtime streams to TerminalController.

### 4.9 Resize

Propagate terminal dimensions.

### 4.10 Runtime Query API

Support targeted queries:

```text
cwd
pathExists
readFile
fileMode
symlink target
environment
hash
```

as runtime allows.

### 4.11 Timeouts

Implement typed timeouts.

### 4.12 Cleanup

Dispose process/sandbox/worker.

## Security Tests

```text
unknown package rejected
network absent
invalid worker message rejected
host filesystem unavailable
```

## Exit Gate

Real shell works through the complete production abstraction.

---

# 10. Step 5 — Content Schema and Scenario Engine

## Branch

```text
feat/scenario-engine
```

## Goal

Load declarative labs.

## Target Areas

```text
content/
src/infrastructure/content/
src/domain/labs/
src/domain/concepts/
tests/content/
```

## Tasks

### 5.1 YAML Parser

Use a safe YAML parser.

### 5.2 Zod Schemas

Implement:

```text
PackDefinition
LabDefinition
FixtureDefinition
ConceptDefinition
FidelityDefinition
CurriculumDefinition
ReferenceSolutionDefinition
```

### 5.3 Content Repository

Implement read-only official content loader.

### 5.4 Semantic Validation

Check:

```text
IDs
references
concepts
fixtures
commands
shell features
fidelity
paths
```

### 5.5 Fixture Compiler

Convert authoring format into RuntimeFixture.

### 5.6 Initial Concepts

Create foundational concepts.

### 5.7 Proof Labs

Implement 3–5 labs only:

```text
Where Am I?
Hidden Files
Safe Copy
Find the Needle
Pipeline Basics
```

## Tests

```text
valid content
invalid YAML
unknown field
duplicate IDs
missing fixture
unknown concept
unknown command
unsafe path
```

## Exit Gate

Proof labs load and seed correctly.

---

# 11. Step 6 — Validation Engine

## Branch

```text
feat/validation
```

## Goal

Determine training success from outcomes.

## Target Files

```text
src/domain/validation/
src/application/validation/
```

## Implement Initial Validators

```text
stdoutContains
stdoutRegex
pathExists
pathMissing
fileContentEquals
fileContentContains
cwdEquals
hashEquals
```

Conditional later:

```text
fileModeEquals
symlinkTargetEquals
environmentEquals
```

## Tasks

### 6.1 ValidatorRegistry

Map validator type to implementation.

### 6.2 Runtime Query Integration

Validators query runtime through a narrow port.

### 6.3 Bounded Output Buffer

Keep only bounded validator output.

### 6.4 Structured Feedback

Return:

```text
passed
code
learner message
internal message
```

### 6.5 Validation Summary

Aggregate required validators.

### 6.6 Alternative Solutions

Ensure at least one proof lab accepts multiple valid command sequences.

## Tests

For every validator:

```text
pass
fail
invalid config
runtime query failure
```

## Exit Gate

Proof labs can be solved and correctly validated.

---

# 12. Step 7 — Deterministic Reset

## Branch

```text
feat/deterministic-reset
```

## Goal

Guarantee clean reproducible lab reset.

## Tasks

### 7.1 Baseline Signature

Create fixture baseline representation/hash.

### 7.2 Reset Service

Implement:

```text
disconnect terminal
terminate process
dispose sandbox
create new sandbox
seed original fixture
start shell
reconnect terminal
```

### 7.3 Lab State Reset

Reset:

```text
validation state
current hint display state as defined
runtime state
```

Do not erase historical attempts already persisted unless specification requires.

### 7.4 Reset Stress Tests

Run repeated cycles.

Recommended:

```text
100 cycles
```

against representative fixtures.

## Exit Gate

No residual learner mutation survives reset.

---

# 13. Step 8 — Persistence Layer

## Branch

```text
feat/persistence
```

## Goal

Store learner state locally.

## Target Areas

```text
src/infrastructure/persistence/
src/domain/progress/
tests/integration/persistence/
```

## Tasks

### 8.1 Dexie Database

Create `ShellgroundDatabase`.

### 8.2 Tables

Implement:

```text
settings
labProgress
sessions
mastery
commandStats
contentVersions
appMetadata
```

### 8.3 Repository Interfaces

Implement domain/application ports.

### 8.4 Concrete Repositories

Create Dexie implementations.

### 8.5 Database Version 1

Define indexes.

### 8.6 Migration Test Infrastructure

Prepare future migration tests.

### 8.7 Storage Diagnostics

Detect IndexedDB availability.

### 8.8 Progress Reset

Implement clear-progress flow.

## Tests

```text
CRUD
reload
indexes
transaction
reset
storage failure
```

## Exit Gate

Complete lab → reload browser → progress remains.

---

# 14. Step 9 — Mastery and Weakness Detection

## Branch

```text
feat/mastery
```

## Goal

Turn sessions into useful learning metrics.

## Target Areas

```text
src/domain/mastery/
src/application/mastery/
src/application/recommendations/
```

## Tasks

### 9.1 Mastery Model

Implement states:

```text
unseen
introduced
practicing
competent
proficient
mastered
stale
```

### 9.2 Mastery Calculator

Use deterministic factors.

### 9.3 Weakness Detector

Identify weak concepts.

### 9.4 Progress Summary

Compute:

```text
pack completion
recent sessions
concept mastery
```

### 9.5 Command Stats

Optional if parsing is reliable.

## Tests

```text
first encounter
success
failure
hint-heavy success
blind success
repeated success
staleness
weakness ranking
```

## Exit Gate

Known synthetic session histories produce expected mastery states.

---

# 15. Step 10 — Full Linux Foundations Content

## Branch

```text
feat/core-curriculum
```

## Goal

Create the 20-lab MVP pack.

## Required Labs

```text
01 Where Am I?
02 Absolute vs Relative
03 Hidden Files
04 Build the Directory Tree
05 Safe Copy
06 Rename and Move
07 Find the Needle
08 Recursive Search
09 Count the Evidence
10 Pipeline Basics
11 Redirect Correctly
12 Standard Error
13 Sort and Deduplicate
14 Extract the Column
15 Transform the Stream
16 Permission Repair or replacement
17 Environment Variable Hunt
18 Checksum Verification
19 Archive Recovery
20 Log Investigation
```

## Tasks Per Lab

Each must include:

```text
lab YAML
fixture
concept references
prerequisites
required commands
required shell features
fidelity requirements
validators
hints
reference solution
content tests
reset verification
```

## Fidelity Rule

If a command remains unverified/unsupported:

```text
replace
defer
or explicitly simulate
```

Do not falsely mark native.

## Automated Content Harness

Implement data-driven tests that run every official lab reference solution.

## Exit Gate

20 labs all pass.

---

# 16. Step 11 — Product UI

## Branch

```text
feat/product-ux
```

## Goal

Build complete learner-facing product.

## Build Order

### 11.1 Training Workspace

Implement:

```text
TrainingHeader
MissionPanel
TerminalView
HintPanel
RuntimeStatusStrip
Validate
Reset
```

### 11.2 Results

Implement:

```text
score
attempts
hints
duration
mastery delta
next lab
review
```

### 11.3 Lab Catalog

Implement filters and status.

### 11.4 Dashboard

Implement:

```text
continue training
progress
weak areas
recent sessions
```

### 11.5 Playground

Free shell mode.

### 11.6 Mastery Screen

Domain/concept mastery.

### 11.7 Diagnostics

Show:

```text
WebAssembly
Workers
SharedArrayBuffer
crossOrigin isolation
IndexedDB
runtime
network
host FS
versions
fidelity
```

### 11.8 Settings

Implement:

```text
appearance
terminal
training
accessibility
data management
```

### 11.9 Accessibility

Keyboard/focus/live regions.

## E2E Tests

```text
first launch
open lab
terminal use
hint
validation fail
retry
pass
reset
progress persist
mastery
diagnostics
```

## Exit Gate

Full learner workflow is usable without developer tools.

---

# 17. Step 12 — Deployment and Security Hardening

## Branch

```text
chore/deployment-hardening
```

## Goal

Make production runtime correct and secure.

## Tasks

### 12.1 Cloudflare Pages

Configure deployment.

### 12.2 Headers

Add:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 12.3 Production Isolation

Verify:

```js
window.crossOriginIsolated === true
```

### 12.4 Dependency Audit

Review runtime/browser dependencies.

### 12.5 Runtime Package Pin Audit

No floating runtime package versions.

### 12.6 Network Denial Regression

Prove runtime has no arbitrary networking.

### 12.7 Import Boundary Check

CI enforcement.

### 12.8 Production Error Hygiene

No debug stack leakage in normal UI.

### 12.9 CSP

Add only after actual runtime worker/asset requirements are verified.

## Exit Gate

Production preview passes runtime and security smoke tests.

---

# 18. Step 13 — Release Stabilization

## Branch

```text
release/0.1.0
```

## Goal

No major new features.

Only:

```text
bug fixes
security fixes
content corrections
performance fixes
accessibility fixes
documentation
release preparation
```

## Tasks

### 13.1 Full QA

Run:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:content
npm run build
npm run test:e2e
```

### 13.2 Manual Acceptance

Test full product from clean browser profile.

### 13.3 Documentation Freeze

Update all docs.

### 13.4 Known Limitations

Final runtime fidelity review.

### 13.5 Release Notes

Create v0.1.0 notes.

### 13.6 Production Deploy

Deploy and smoke-test.

### 13.7 Tag

Create:

```text
v0.1.0
```

## Exit Gate

All critical gates pass.

---

# 19. File-Level Implementation Map

## Runtime

```text
src/runtime/ports/ShellRuntime.ts
src/runtime/client/RuntimeClient.ts
src/runtime/worker/runtime.worker.ts
src/runtime/worker/worker.protocol.ts
src/runtime/worker/worker.schemas.ts
src/runtime/wasmer/WasmerShellRuntime.ts
src/runtime/wasmer/WasmerPackageResolver.ts
src/runtime/manifest/trusted-runtime-packages.ts
```

---

# 20. Terminal

```text
src/terminal/TerminalView.tsx
src/terminal/TerminalController.ts
src/terminal/terminal.types.ts
src/terminal/addons/
src/terminal/themes/
```

---

# 21. Content

```text
src/infrastructure/content/ContentPackLoader.ts
src/infrastructure/content/LabContentLoader.ts
src/infrastructure/content/FixtureLoader.ts
src/infrastructure/content/ConceptLoader.ts

content/packs/linux-foundations/
content/concepts/
content/registry/
content/schema/
```

---

# 22. Validation

```text
src/domain/validation/Validator.ts
src/domain/validation/ValidatorDefinition.ts
src/domain/validation/ValidationResult.ts
src/domain/validation/registry/ValidatorRegistry.ts
src/domain/validation/validators/
```

---

# 23. Persistence

```text
src/infrastructure/persistence/db/ShellgroundDatabase.ts
src/infrastructure/persistence/repositories/
src/infrastructure/persistence/migrations/
```

---

# 24. Mastery

```text
src/domain/mastery/MasteryRecord.ts
src/domain/mastery/MasteryState.ts
src/domain/mastery/calculateMastery.ts
src/application/mastery/MasteryService.ts
```

---

# 25. Features

```text
src/features/dashboard/
src/features/labs/
src/features/training/
src/features/playground/
src/features/mastery/
src/features/diagnostics/
src/features/settings/
```

---

# 26. Test Map

## Unit

```text
domain
validators
mastery
scoring
schemas
state machines
```

## Integration

```text
runtime
worker
persistence
scenario engine
reset
```

## Content

```text
schema
IDs
references
fidelity
fixtures
reference solutions
```

## E2E

```text
startup
training
playground
reset
persistence
mastery
diagnostics
```

---

# 27. Documentation Update Map

## Runtime Branches

Update:

```text
RUNTIME_SPIKE_RESULTS
COMMAND_FIDELITY
KNOWN_LIMITATIONS
```

## Scenario/Content Branches

Update:

```text
CONTENT_AUTHORING
DATABASE_CONTENT_SCHEMA
CURRICULUM
```

## UI Branch

Update:

```text
UI_DESIGN
README screenshots if appropriate
```

## Deployment Branch

Update:

```text
DEPLOYMENT
SECURITY_MODEL
THREAT_MODEL
```

---

# 28. PR Evidence Requirements

Every PR should include:

```text
what changed
why
scope
files/modules
tests run
results
screenshots if UI
runtime evidence if applicable
security impact
known limitations
docs updated
```

---

# 29. Runtime PR Evidence

Must include:

```text
browser used
SDK version
runtime package versions
commands verified
tests passed
crossOriginIsolated
network disabled
```

---

# 30. Content PR Evidence

Must include:

```text
labs added
concepts added
reference solutions
content validation
reset verification
fidelity dependencies
```

---

# 31. UI PR Evidence

Must include:

```text
screenshots
keyboard behavior
responsive behavior
accessibility checks
E2E results
```

---

# 32. Release Blockers

Do not release if any is true:

```text
runtime core unreliable
network accidentally enabled
host FS exposed
reset nondeterministic
20 labs not stable
validation false-positive/negative known in core labs
progress corruption
production not cross-origin isolated
critical/high security issue unresolved
required quality gate failing
```

---

# 33. Non-Blocking Post-MVP Items

Do not delay MVP for:

```text
PWA
cloud sync
accounts
leaderboards
AI tutor
full incident mode
full exam mode
network simulation
system administration simulation
100+ labs
```

---

# 34. Implementation Anti-Patterns

Do not:

```text
build all UI before runtime
add backend without requirement
fake unsupported commands
let YAML execute code
call Wasmer from React components
query Dexie from pages directly
store entire runtime state persistently
create giant one-branch implementation
merge untested runtime changes
```

---

# 35. Recommended Issue Breakdown

Create one issue per bounded work package.

Example:

```text
#1 Runtime spike
#2 Repository foundation
#3 Terminal subsystem
#4 WASIX runtime adapter
#5 Scenario engine
#6 Validation engine
#7 Deterministic reset
#8 Persistence
#9 Mastery
#10 Core curriculum
#11 Product UI
#12 Deployment hardening
#13 v0.1 release
```

Sub-issues may be created for larger phases.

---

# 36. Dependency Graph

```text
#1 Runtime Spike
 ↓
#2 Foundation
 ↓
#3 Terminal
 ↓
#4 Runtime Adapter
 ↓
#5 Scenario Engine
 ↓
#6 Validation
 ↓
#7 Reset
 ↓
#8 Persistence
 ↓
#9 Mastery
 ↓
#10 Curriculum
 ↓
#11 UI
 ↓
#12 Deployment
 ↓
#13 Release
```

---

# 37. Implementation Definition of Done

A work package is done only when:

```text
implementation complete
tests complete
tests passing
docs updated
known limitations recorded
security impact reviewed
branch scope respected
PR evidence supplied
```

---

# 38. Final Implementation Sequence

The final execution order is:

```text
1. Prove Wasmer/WASIX
2. Establish repository quality
3. Build terminal abstraction
4. Productionize runtime
5. Build content/scenario model
6. Build outcome validation
7. Guarantee deterministic reset
8. Persist learner state
9. Calculate mastery
10. Create 20 official labs
11. Build learner-facing UI
12. Harden deployment/security
13. Stabilize and release v0.1.0
```

The central implementation rule is:

> **Never trade runtime correctness or training correctness for faster visible progress.**

---

# 39. Next Document

The final major project document is:

```text
12. SINGLE CODING-AGENT PROMPT
```

It will convert the entire approved project baseline into one execution prompt suitable for a coding agent.

The prompt shall include:

```text
role
objective
non-negotiable architecture
phase order
branch/PR rules
runtime spike gate
stack
repository structure
security rules
content rules
testing requirements
quality gates
documentation requirements
final report requirements
```

The coding agent must be instructed not to skip the runtime spike and not to fake unsupported Linux behavior.
