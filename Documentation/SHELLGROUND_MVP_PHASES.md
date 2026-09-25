# SHELLGROUND — MVP Phases Specification

> **Document:** MVP Phases Specification  
> **Project:** SHELLGROUND  
> **Sequence:** 9 of 13  
> **Depends on:**  
> - `SHELLGROUND_REQUIREMENTS.md`  
> - `SHELLGROUND_FEATURE_SCOPE.md`  
> - `SHELLGROUND_FULL_ARCHITECTURE.md`  
> - `SHELLGROUND_COMMAND_SUPPORT_MATRIX.md`  
> - `SHELLGROUND_CURRICULUM.md`  
> - `SHELLGROUND_REPOSITORY_STRUCTURE.md`  
> - `SHELLGROUND_DATABASE_CONTENT_SCHEMA.md`  
> - `SHELLGROUND_UI_DESIGN.md`  
>
> **Status:** Draft Delivery Baseline  
> **Purpose:** Define the implementation phases required to reach a production-quality SHELLGROUND MVP, including dependencies, risk gates, deliverables, branch scope, acceptance criteria, and release milestones.

---

# 1. Delivery Objective

The MVP phases must reduce technical uncertainty before product breadth is added.

The phase model is intentionally ordered around this principle:

> **Prove the browser runtime first, then build the training system around verified behavior.**

The project shall not begin with:

```text
dashboard polish
20 labs
mastery charts
PWA
deployment automation
```

before proving:

```text
interactive shell
filesystem
pipes
redirection
reset
runtime isolation
```

---

# 2. Phase Model

The MVP is divided into thirteen phases.

```text
Phase 0   Runtime Feasibility Spike
Phase 1   Repository Foundation
Phase 2   Terminal Subsystem
Phase 3   Runtime Abstraction
Phase 4   Scenario and Content Engine
Phase 5   Validation Engine
Phase 6   Deterministic Reset
Phase 7   Persistence
Phase 8   Mastery and Progress Logic
Phase 9   Linux Foundations Curriculum
Phase 10  Product UI
Phase 11  Deployment and Security Hardening
Phase 12  MVP Stabilization and Release
```

PWA/offline optimization is explicitly post-MVP unless it becomes trivial after stabilization.

---

# 3. Phase Governance

Every phase must define:

```text
Goal
Entry Criteria
Deliverables
Implementation Scope
Tests
Exit Criteria
Blockers
Deferred Work
```

A phase is not complete because code exists.

A phase is complete only when its exit criteria are demonstrably satisfied.

---

# 4. Phase Status Values

Recommended project status values:

```text
NOT STARTED
IN PROGRESS
BLOCKED
READY FOR REVIEW
COMPLETE
DEFERRED
```

Do not use ambiguous labels such as:

```text
mostly done
almost ready
```

without evidence.

---

# 5. Phase Dependency Chain

```text
Phase 0
   ↓
Phase 1
   ↓
Phase 2
   ↓
Phase 3
   ↓
Phase 4
   ↓
Phase 5
   ↓
Phase 6
   ↓
Phase 7
   ↓
Phase 8
   ↓
Phase 9
   ↓
Phase 10
   ↓
Phase 11
   ↓
Phase 12
```

Some preparation may overlap, but exit gates may not be bypassed.

---

# 6. Phase 0 — Runtime Feasibility Spike

## 6.1 Goal

Prove that the selected browser-side WASIX architecture can support the core SHELLGROUND learning model.

This is the most important technical risk phase.

---

## 6.2 Entry Criteria

Required before starting:

- approved Requirements;
- approved Feature Scope;
- approved Full Architecture;
- approved pre-spike Command-Support Matrix.

---

## 6.3 Scope

The spike shall prove:

```text
browser capability detection
cross-origin isolation
Wasmer SDK initialization
pinned shell package
interactive stdin
stdout
stderr
terminal resize
virtual filesystem
file creation/read
directory creation
relative paths
absolute paths
pipes
stdout redirection
append redirection
stderr redirection
variables
environment export
command substitution
globbing
exit status
shell scripting
process interruption where possible
runtime shutdown
sandbox reset
network denied by default
```

---

## 6.4 Required Command Tests

At minimum:

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

The spike should also test:

```text
sed
awk
tar
sha256sum
chmod
stat
du
```

if packages are available.

---

## 6.5 Deliverables

Required:

```text
docs/runtime/RUNTIME_SPIKE_RESULTS.md
docs/runtime/COMMAND_FIDELITY.md
runtime conformance test suite
trusted runtime package manifest
exact package versions
known limitations
```

---

## 6.6 Required Evidence

For every P0 command or shell feature:

```text
test case
actual output
exit code
classification
known difference
```

---

## 6.7 Exit Criteria

Phase 0 passes when:

1. interactive shell launches reliably;
2. stdin/stdout/stderr work;
3. file and directory operations work;
4. pipes work;
5. redirection works;
6. shell variables work;
7. basic scripts run;
8. sandbox can be recreated;
9. arbitrary networking is not enabled;
10. enough P0 commands work to support the approved MVP curriculum.

---

## 6.8 Failure Criteria

Architecture review is mandatory if the runtime cannot reliably support several of:

```text
bash/sh
cd
ls
cat
cp
mv
rm
grep
find
pipes
redirection
scripting
```

Do not continue by hand-simulating the entire Linux command layer.

---

## 6.9 Branch

Recommended:

```text
feat/runtime-spike
```

---

# 7. Phase 1 — Repository Foundation

## 7.1 Goal

Establish a clean, enforceable engineering baseline.

---

## 7.2 Entry Criteria

Phase 0 has proven the runtime strategy viable.

---

## 7.3 Deliverables

Create:

```text
React
TypeScript
Vite
strict TS config
ESLint
Vitest
Playwright
GitHub Actions
repository directories
path aliases
basic docs
```

---

## 7.4 Required Scripts

At minimum:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

Additional scripts may be added later:

```bash
npm run test:content
npm run test:e2e
```

---

## 7.5 Architecture Enforcement

Implement initial import boundaries.

Examples:

```text
features cannot import @wasmer/sdk
domain cannot import React
domain cannot import Dexie
terminal owns xterm
runtime/wasmer owns Wasmer imports
```

---

## 7.6 CI

PR CI shall run:

```text
npm ci
lint
typecheck
unit tests
build
```

---

## 7.7 Exit Criteria

Phase 1 passes when:

- clean clone installs with `npm ci`;
- lint passes;
- typecheck passes;
- tests pass;
- build passes;
- architecture directories exist;
- CI passes on pull request.

---

## 7.8 Branch

Recommended:

```text
feat/foundation
```

---

# 8. Phase 2 — Terminal Subsystem

## 8.1 Goal

Create a stable terminal frontend independent of Wasmer.

---

## 8.2 Entry Criteria

Repository foundation is complete.

---

## 8.3 Deliverables

Implement:

```text
TerminalView
TerminalController
terminal theme tokens
FitAddon integration
resize handling
focus handling
cleanup
mock runtime adapter
```

---

## 8.4 Important Rule

The terminal subsystem shall be testable without the real shell runtime.

Use a mock process to prove:

```text
input forwarding
output rendering
resize
mount/unmount
cleanup
```

---

## 8.5 Required Tests

Test:

- terminal mounts;
- input event forwarded;
- stdout rendered;
- stderr rendered;
- resize forwarded;
- terminal disposes correctly;
- listeners removed.

---

## 8.6 Exit Criteria

Phase 2 passes when xterm works through a mock runtime interface with no Wasmer dependency in UI code.

---

## 8.7 Branch

Recommended:

```text
feat/terminal
```

---

# 9. Phase 3 — Runtime Abstraction

## 9.1 Goal

Convert the Phase 0 spike into production architecture.

---

## 9.2 Entry Criteria

Terminal subsystem is stable.

---

## 9.3 Deliverables

Implement:

```text
ShellRuntime interface
RuntimeClient
Web Worker protocol
worker schemas
WasmerShellRuntime
Wasmer package resolver
runtime capability detection
runtime lifecycle
timeouts
typed errors
```

---

## 9.4 Runtime Lifecycle

Must support:

```text
initialize
open shell
write stdin
stream stdout
stream stderr
resize
snapshot/query
terminate
dispose
```

---

## 9.5 Security Requirements

Enforce:

```text
no arbitrary package URLs
no guest host filesystem mapping
network not configured
validated worker messages
trusted package manifest
resource cleanup
```

---

## 9.6 Required Tests

Integration tests:

```text
runtime boot
shell process start
stdin/stdout
stderr
filesystem operation
pipe
redirection
runtime shutdown
network denial
```

---

## 9.7 Exit Criteria

The real shell must work through:

```text
TerminalView
→ TerminalController
→ ShellRuntime
→ Worker
→ Wasmer
```

with no React-to-Wasmer direct dependency.

---

## 9.8 Branch

Recommended:

```text
feat/wasix-runtime
```

---

# 10. Phase 4 — Scenario and Content Engine

## 10.1 Goal

Introduce declarative training content.

---

## 10.2 Entry Criteria

Runtime abstraction is stable.

---

## 10.3 Deliverables

Implement:

```text
Zod schemas
YAML parsing
pack loader
lab loader
fixture loader
concept loader
content registry
semantic validation
lab session state machine
```

---

## 10.4 Initial Content

Use only a small proof set:

```text
3–5 labs
```

Do not build all 20 yet.

Recommended proof labs:

```text
Where Am I?
Hidden Files
Safe Copy
Find the Needle
Pipeline Basics
```

---

## 10.5 Required Content Tests

Validate:

```text
schema
IDs
fixture references
concept references
command dependencies
validator references
unsafe paths
```

---

## 10.6 Exit Criteria

Phase 4 passes when:

- 3–5 labs load from content files;
- fixtures initialize correctly;
- malformed content is rejected;
- unsupported dependencies are detected;
- content tests pass.

---

## 10.7 Branch

Recommended:

```text
feat/scenario-engine
```

---

# 11. Phase 5 — Validation Engine

## 11.1 Goal

Determine lab success from runtime outcomes.

---

## 11.2 Entry Criteria

Scenario engine and fixtures work.

---

## 11.3 Deliverables

Implement validator registry with initial types:

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

---

## 11.4 Validation Principle

Use:

```text
outcome-based validation
```

rather than exact command matching.

---

## 11.5 Required Tests

Each validator requires:

```text
pass test
fail test
invalid-definition test
runtime-query error test
```

---

## 11.6 Alternative-Solution Test

At least one proof lab must pass through two different valid command approaches.

This proves the engine is not overfitted to one solution.

---

## 11.7 Exit Criteria

Phase 5 passes when:

- proof labs can be validated;
- failures return structured feedback;
- infrastructure errors remain distinct;
- multiple valid approaches work.

---

## 11.8 Branch

Recommended:

```text
feat/validation
```

---

# 12. Phase 6 — Deterministic Reset

## 12.1 Goal

Guarantee reproducible lab restart.

---

## 12.2 Entry Criteria

Scenario and validation systems work.

---

## 12.3 Deliverables

Implement:

```text
fixture baseline hash
sandbox recreation
shell restart
terminal reconnect
state reset
reset UI hook
```

---

## 12.4 Reset Strategy

Preferred:

```text
dispose sandbox
create fresh sandbox
reseed fixture
restart shell
```

rather than attempting to reverse arbitrary learner actions.

---

## 12.5 Stress Test

Recommended:

```text
100 reset cycles
```

against a representative fixture.

Validate:

```text
same required paths
same file contents
same fixture hash
same environment
```

---

## 12.6 Exit Criteria

Reset reliably restores original state and removes learner mutations.

---

## 12.7 Branch

Recommended:

```text
feat/deterministic-reset
```

---

# 13. Phase 7 — Persistence

## 13.1 Goal

Persist learner progress locally.

---

## 13.2 Entry Criteria

Lab lifecycle is stable.

---

## 13.3 Deliverables

Implement:

```text
Dexie database
settings repository
lab progress repository
session repository
mastery repository
content version repository
database migrations
storage diagnostics
```

---

## 13.4 Persistence Scope

Persist:

```text
settings
lab progress
sessions
mastery
command stats
content versions
```

Do not persist:

```text
entire sandbox
full terminal transcript
runtime package cache
real credentials
```

---

## 13.5 Required Tests

Test:

```text
CRUD
reload persistence
transaction behavior
database migration
storage failure handling
reset progress
```

---

## 13.6 Exit Criteria

Complete a lab, reload application, and verify:

```text
completion persists
session history persists
settings persist
```

---

## 13.7 Branch

Recommended:

```text
feat/persistence
```

---

# 14. Phase 8 — Mastery and Progress Logic

## 14.1 Goal

Turn stored outcomes into meaningful training feedback.

---

## 14.2 Entry Criteria

Persistence is working.

---

## 14.3 Deliverables

Implement:

```text
mastery calculator
mastery states
weak-area detection
progress summary
concept aggregation
recent-session aggregation
```

---

## 14.4 Mastery Inputs

Use deterministic inputs such as:

```text
success rate
attempts
hint use
blind success
mixed success
recency
completion duration
```

---

## 14.5 No ML

Do not add:

```text
machine learning
LLM scoring
opaque recommendation model
```

---

## 14.6 Required Tests

Test:

```text
new concept
repeated success
repeated failure
hint-heavy success
blind success
stale concept
weak-area ranking
```

---

## 14.7 Exit Criteria

The system can compute and display meaningful concept mastery from stored sessions.

---

## 14.8 Branch

Recommended:

```text
feat/mastery
```

---

# 15. Phase 9 — Linux Foundations Curriculum

## 15.1 Goal

Expand from proof labs to the approved MVP curriculum.

---

## 15.2 Entry Criteria

Runtime, scenarios, validation, reset, persistence, and mastery all work.

---

## 15.3 Deliverables

Create at least 20 official labs:

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
16 Permission Repair or verified replacement
17 Environment Variable Hunt
18 Checksum Verification
19 Archive Recovery
20 Log Investigation
```

---

## 15.4 Every Lab Requires

```text
schema-valid lab file
fixture
concepts
prerequisites
fidelity requirements
validators
hints where appropriate
reference solution
content test
reset verification
```

---

## 15.5 Fidelity Rule

If a target lab depends on an unreliable command:

```text
replace the lab
or
reclassify as simulated/deferred
```

Do not fake native behavior.

---

## 15.6 Required Tests

Automated content suite must verify every official lab.

At least one reference solution must pass.

Important labs should have multiple reference approaches.

---

## 15.7 Exit Criteria

All 20 labs:

- load;
- initialize;
- solve;
- validate;
- reset;
- pass content tests.

---

## 15.8 Branch

Recommended:

```text
feat/core-curriculum
```

---

# 16. Phase 10 — Product UI

## 16.1 Goal

Turn the working training engine into the complete MVP user experience.

---

## 16.2 Entry Criteria

The underlying product loop is functional.

---

## 16.3 Deliverables

Implement:

```text
App Shell
Dashboard
Lab Catalog
Training Workspace
Playground
Mastery
Diagnostics
Settings
Results
Error/Loading/Empty states
Fidelity badges
Runtime status
```

---

## 16.4 Priority Order

Build UI in this order:

```text
1. Training Workspace
2. Results
3. Lab Catalog
4. Dashboard
5. Mastery
6. Diagnostics
7. Settings
```

Training must be polished before analytics.

---

## 16.5 Accessibility

Validate:

```text
keyboard navigation
focus
contrast
status announcements
non-color-only fidelity
destructive confirmation
reduced motion
```

---

## 16.6 E2E Tests

Required:

```text
launch app
open lab
use terminal
request hint
validate fail
retry
validate pass
progress persists
open mastery
open diagnostics
```

---

## 16.7 Exit Criteria

A learner can complete the full first-run and returning-user flows without developer intervention.

---

## 16.8 Branch

Recommended:

```text
feat/product-ux
```

---

# 17. Phase 11 — Deployment and Security Hardening

## 17.1 Goal

Prepare the application for production hosting.

---

## 17.2 Entry Criteria

Product UI and training workflow are complete.

---

## 17.3 Deliverables

Implement:

```text
Cloudflare Pages deployment
COOP/COEP headers
security headers
production diagnostics
environment validation
dependency review
runtime package pin review
network-denial regression test
import-boundary verification
production error hygiene
```

---

## 17.4 Required Headers

Baseline:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP is added only after verified runtime asset/worker requirements.

---

## 17.5 Production Gate

Production must verify:

```js
window.crossOriginIsolated === true
```

---

## 17.6 Security Regression Tests

Required:

```text
network remains disabled
host filesystem unavailable
arbitrary package IDs rejected
malformed worker messages rejected
unsafe fixture paths rejected
scenario code execution impossible
```

---

## 17.7 Exit Criteria

Production deployment passes runtime, security, and E2E smoke tests.

---

## 17.8 Branch

Recommended:

```text
chore/deployment-hardening
```

---

# 18. Phase 12 — MVP Stabilization and Release

## 18.1 Goal

Freeze scope, eliminate release blockers, and produce the first stable MVP.

---

## 18.2 Entry Criteria

All prior phases complete.

---

## 18.3 Scope

No new major features.

Allowed:

```text
bug fixes
performance fixes
accessibility fixes
content corrections
documentation corrections
security fixes
release tooling
```

Not allowed:

```text
new backend
new cloud account system
new networking runtime
large curriculum expansion
AI tutor
major redesign
```

---

## 18.4 Full Acceptance Suite

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

All must pass.

---

## 18.5 Manual Acceptance

Verify:

```text
first launch
compatibility check
dashboard
lab catalog
lab start
shell input
pipes/redirection
hint
validation fail
retry
validation success
reset
playground
progress persistence
mastery
diagnostics
production headers
network disabled
```

---

## 18.6 Documentation Release Set

Required:

```text
README
REQUIREMENTS
FEATURE_SCOPE
FULL_ARCHITECTURE
COMMAND_SUPPORT_MATRIX
CURRICULUM
REPOSITORY_STRUCTURE
DATABASE_CONTENT_SCHEMA
UI_DESIGN
MVP_PHASES
SPMP
SRS
SDD
IMPLEMENTATION_PLAN
SECURITY_MODEL
DEPLOYMENT
RUNTIME_SPIKE_RESULTS
COMMAND_FIDELITY
KNOWN_LIMITATIONS
```

---

## 18.7 Release Version

Recommended first stable milestone:

```text
v0.1.0
```

---

## 18.8 Exit Criteria

Release when:

1. all required tests pass;
2. 20 labs are stable;
3. no known critical security issue remains;
4. command fidelity is documented;
5. deployment is cross-origin isolated;
6. networking is disabled;
7. progress persists;
8. reset is deterministic;
9. known limitations are documented;
10. production build is reproducible.

---

# 19. Phase Risk Classification

| Phase | Risk |
|---|---|
| 0 Runtime Spike | Critical |
| 1 Foundation | Low |
| 2 Terminal | Medium |
| 3 Runtime Abstraction | High |
| 4 Scenario Engine | Medium |
| 5 Validation | High |
| 6 Reset | High |
| 7 Persistence | Medium |
| 8 Mastery | Low/Medium |
| 9 Curriculum | Medium |
| 10 Product UI | Medium |
| 11 Deployment/Security | High |
| 12 Stabilization | Medium |

---

# 20. Critical Path

The technical critical path is:

```text
Runtime
→ Terminal
→ Scenario
→ Validation
→ Reset
→ Persistence
→ Curriculum
→ UI
→ Deployment
```

Mastery depends on persistence but is not a runtime blocker.

---

# 21. Hard Gates

The following gates may not be bypassed.

## Gate A — Runtime Viability

Before full product implementation.

## Gate B — Outcome Validation

Before curriculum expansion.

## Gate C — Deterministic Reset

Before serious scoring/progress.

## Gate D — Persistence

Before mastery/dashboard.

## Gate E — Content Fidelity

Before declaring 20 labs stable.

## Gate F — Production Isolation

Before release.

---

# 22. Parallelizable Work

Limited work may happen in parallel.

After Phase 3:

```text
content schema authoring
UI component scaffolding
docs
```

may proceed carefully.

However:

```text
stable curriculum
```

must wait for validation/reset/fidelity proof.

---

# 23. Branch Strategy by Phase

Recommended:

```text
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

One bounded PR per major phase is preferred.

---

# 24. PR Requirements Per Phase

Every phase PR should include:

```text
Summary
Scope
Requirement IDs
Architecture impact
Security impact
Tests
Evidence
Known limitations
Deferred work
```

---

# 25. Phase Definition of Done

A phase is DONE when:

- code is merged or ready for approved merge;
- tests exist;
- tests pass;
- docs updated;
- no known phase blocker remains;
- acceptance evidence exists;
- scope did not unintentionally expand.

---

# 26. Scope Freeze Rule

After Phase 9 starts, major new feature requests should generally move to:

```text
post-MVP backlog
```

unless they are necessary to satisfy an existing requirement.

---

# 27. Deferred Post-MVP Phases

After v0.1.0:

```text
PWA/offline optimization
Drill mode
Adaptive reinforcement
Randomized labs
Incident mode
Exam mode
Networking simulation
Administration simulation
Expanded scripting
Defensive-analysis pack
Forensics pack
```

---

# 28. v0.2 Candidate Scope

Target:

```text
50–70 labs
```

Add:

```text
advanced grep
advanced find
sed
awk
shell scripting
troubleshooting
defensive logs
```

---

# 29. v0.3 Candidate Scope

Add:

```text
weak-area drills
spaced repetition
randomized fixtures
training recommendations
```

---

# 30. v0.4 Candidate Scope

Add:

```text
incident mode
exam mode
timed challenges
network simulation
system administration simulation
```

---

# 31. v1.0 Target

Potential:

```text
100+ deterministic labs
20+ randomized templates
10+ incidents
3+ exams
multiple learning tracks
stable content API
stable persistence schema
stable runtime fidelity model
```

---

# 32. MVP Release Boundary

The MVP is considered functionally complete when the learner can perform this loop:

```text
Open App
↓
Compatibility Check
↓
Choose Lab
↓
Runtime Starts
↓
Fixture Loads
↓
Use Terminal
↓
Request Hint if Needed
↓
Validate
↓
Retry or Pass
↓
Reset if Needed
↓
Progress Saves
↓
Mastery Updates
↓
Continue Training
```

---

# 33. MVP Must Not Depend On

The MVP must not require:

```text
backend
account
cloud database
remote shell host
Docker
WSL
VirtualBox
Kali Linux
unrestricted external networking
AI tutor
```

---

# 34. MVP Technical Success Criteria

```text
runtime works
terminal works
filesystem works
pipes work
redirection works
reset deterministic
validation correct
20 labs stable
progress persists
mastery computes
UI complete
deployment isolated
network disabled
tests green
```

---

# 35. MVP Product Success Criteria

A learner can:

```text
practice commands
solve structured labs
receive feedback
retry safely
progress from guided to blind tasks
see weak areas
understand runtime limitations
```

without installing Linux.

---

# 36. Phase Traceability

## Runtime Phases

Support:

```text
FR-001
FR-002
FR-003
FR-004
FR-005
FR-026
FR-027
SR-001–SR-006
RF-001–RF-005
```

## Scenario/Validation Phases

Support:

```text
FR-006–FR-011
CR-001–CR-008
LR-001–LR-008
```

## Persistence/Mastery Phases

Support:

```text
FR-019–FR-024
DR-001–DR-005
```

## UI/Deployment Phases

Support:

```text
NFR-001–NFR-012
AR-001–AR-012
```

---

# 37. Final Phase Decision

The implementation sequence is:

```text
PROVE
→ STRUCTURE
→ CONNECT
→ MODEL
→ VALIDATE
→ RESET
→ PERSIST
→ MEASURE
→ EXPAND CONTENT
→ POLISH PRODUCT
→ HARDEN
→ RELEASE
```

The most important rule is:

> **Do not spend major effort on curriculum volume or interface polish before the runtime and reset model are proven.**

---

# 38. Next Document

The next item in the approved sequence is:

```text
10. SPMP / SRS / SDD
```

Because these are three formal documents, they should still be created one-by-one:

```text
10A. SPMP
10B. SRS
10C. SDD
```

The next file should therefore be:

```text
SHELLGROUND_SPMP.md
```

It will formalize:

- project management approach;
- scope;
- milestones;
- roles;
- schedule model;
- configuration management;
- risk management;
- quality assurance;
- verification strategy;
- change control;
- deliverables;
- release management.
