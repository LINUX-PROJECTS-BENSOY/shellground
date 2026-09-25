# SHELLGROUND — Software Requirements Specification (SRS)

> **Document:** Software Requirements Specification  
> **Project:** SHELLGROUND  
> **Sequence:** 10B of 13  
> **Document Type:** SRS  
> **Status:** Requirements Baseline  
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

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification defines the functional, non-functional, interface, data, security, runtime, usability, and acceptance requirements for SHELLGROUND.

This document answers:

> **What shall SHELLGROUND do?**

It intentionally does not prescribe implementation details beyond constraints necessary to preserve system correctness, safety, and fidelity.

---

# 2. Product Definition

SHELLGROUND is a browser-based Linux command training environment designed to teach command-line proficiency without requiring:

```text
Kali Linux
a separate Linux installation
WSL
Docker
VirtualBox
VMware
dual boot
remote SSH training servers
```

The system shall provide a browser-local command environment, structured training labs, deterministic reset, outcome validation, local learner progress, concept mastery, and runtime-fidelity transparency.

---

# 3. Product Goals

The product shall enable a learner to:

1. practice Linux/POSIX-style command-line operations in a browser;
2. interact with a real shell runtime where feasible;
3. work with an isolated training filesystem;
4. complete guided and blind labs;
5. receive outcome-based validation;
6. reset labs to a known baseline;
7. persist progress locally;
8. review mastery and weak areas;
9. understand which behaviors are real, simulated, or unavailable;
10. build transferable command-line reasoning skills.

---

# 4. Product Non-Goals

The MVP shall not be:

```text
a Kali Linux clone
a Linux distribution
a complete Linux kernel emulator
a browser pentesting platform
a remote shell platform
an arbitrary-networking environment
a cloud LMS
a multiplayer training platform
an AI hacking assistant
```

---

# 5. Intended Users

Primary users:

```text
IT students
software-development students
networking students
cybersecurity students
Linux beginners
junior DevOps learners
junior system-administration learners
```

Secondary future users:

```text
instructors
security trainees
technical interview learners
self-directed professionals
```

---

# 6. User Characteristics

The primary user is expected to:

- know how to use a modern desktop browser;
- have basic computer literacy;
- not necessarily have Linux installed;
- have limited or developing terminal experience;
- benefit from repeated practice and structured progression.

No prior Kali Linux knowledge is required.

---

# 7. Operating Environment

The MVP shall target:

```text
modern desktop web browsers
HTTPS production hosting
WebAssembly-capable browser
Web Worker-capable browser
IndexedDB-capable browser
cross-origin isolated deployment
```

The supported-browser matrix shall be finalized during implementation/runtime verification.

---

# 8. Product Constraints

The MVP shall operate under these constraints:

```text
browser-local execution
no application backend
no host filesystem access
no arbitrary external networking
no raw sockets
no kernel access
local persistence only
single active interactive runtime per tab
```

---

# 9. Assumptions

The SRS assumes:

1. WebAssembly is available.
2. Web Workers are available.
3. `SharedArrayBuffer` can be enabled through required deployment headers.
4. the selected browser runtime can execute enough required shell utilities;
5. IndexedDB is available for persistent progress;
6. static hosting can provide required security headers.

If these assumptions fail, the system shall report the limitation clearly.

---

# 10. System Context

SHELLGROUND consists of:

```text
Web UI
Terminal frontend
Browser-side shell runtime
Virtual filesystem
Scenario engine
Validation engine
Local persistence
Mastery/progress engine
Diagnostics
Training content
```

The system shall not require an application server for MVP functionality.

---

# 11. Functional Requirements Overview

The MVP shall implement the following requirement groups:

```text
FR-A Browser Compatibility
FR-B Runtime and Terminal
FR-C Training Environment
FR-D Content and Labs
FR-E Validation and Reset
FR-F Learning Assistance
FR-G Progress and Mastery
FR-H Diagnostics and Fidelity
FR-I Settings and Data Management
FR-J Deployment and Operational Behavior
```

---

# 12. FR-A — Browser Compatibility

## FR-A-001 — Capability Detection

The system shall detect availability of:

```text
WebAssembly
Web Workers
SharedArrayBuffer
crossOriginIsolated
IndexedDB
```

---

## FR-A-002 — Blocking Capability Reporting

If a required capability is unavailable, the system shall:

1. identify the missing capability;
2. mark whether it is blocking;
3. prevent invalid runtime startup;
4. direct the user to diagnostics.

---

## FR-A-003 — Non-Blocking Storage Failure

If IndexedDB is unavailable but runtime execution can continue, the system may permit training with a clear warning that progress will not persist.

---

# 13. FR-B — Runtime and Terminal

## FR-B-001 — Browser-Side Shell Runtime

The system shall execute the training shell locally in the browser using the approved sandbox runtime.

---

## FR-B-002 — Runtime Isolation

The runtime shall not expose the host filesystem.

---

## FR-B-003 — Terminal Input

The user shall be able to type shell commands into an interactive terminal.

---

## FR-B-004 — Terminal Output

The system shall render:

```text
stdout
stderr
```

from the guest shell.

---

## FR-B-005 — Terminal Resize

The runtime terminal dimensions shall adapt to the terminal viewport where supported.

---

## FR-B-006 — Core Shell Features

The runtime shall support, subject to Phase 0 verification:

```text
pipes
stdout redirection
append redirection
stdin redirection
stderr redirection
variables
environment export
quoting
globbing
command substitution
exit status
simple shell scripts
```

---

## FR-B-007 — Core Command Set

The MVP shall provide sufficient verified command support for the approved initial curriculum.

Target commands include:

```text
pwd
cd
ls
echo
printf
mkdir
touch
cp
mv
rm
cat
head
tail
wc
grep
find
sort
uniq
cut
tr
tee
env
test
sed
awk
basename
dirname
sha256sum
tar
```

Exact native support shall be determined by the runtime spike.

---

## FR-B-008 — Unsupported Command Handling

The system shall not falsely claim native support for commands that are unsupported.

---

## FR-B-009 — Runtime Lifecycle

The system shall support:

```text
initialize
start shell
write input
resize
query state
terminate process
reset environment
dispose runtime
```

---

## FR-B-010 — Runtime Error Recovery

If the runtime enters an unknown or failed state, the system shall offer a clean restart rather than continuing with potentially corrupted state.

---

# 14. FR-C — Training Environment

## FR-C-001 — Virtual Filesystem

The system shall provide an isolated guest filesystem suitable for training.

---

## FR-C-002 — Deterministic Fixture Seeding

Each graded lab shall initialize from a deterministic fixture definition.

---

## FR-C-003 — Linux-Like Training Paths

The system may expose Linux-like guest paths such as:

```text
/home/student
/workspace
/tmp
/opt
/var/log
/etc
```

These paths shall remain isolated from the host system.

---

## FR-C-004 — Synthetic System Files

The system may include synthetic training files such as:

```text
/etc/passwd
/etc/group
/var/log/auth.log
```

These shall not be represented as host files.

---

## FR-C-005 — Protected Paths

Labs may define protected paths that the learner should not modify or delete.

---

# 15. FR-D — Content and Labs

## FR-D-001 — Structured Lab Content

Official labs shall be represented as structured declarative content.

---

## FR-D-002 — Lab Metadata

Every stable lab shall define at minimum:

```text
ID
version
title
difficulty
mission
concepts
fixture
required capabilities
validators
```

---

## FR-D-003 — Lab Hints

Labs may provide ordered progressive hints.

---

## FR-D-004 — Lab Prerequisites

Labs may define recommended prerequisite concepts.

---

## FR-D-005 — Training Modes

The system shall support MVP training modes:

```text
guided
blind
playground
```

The schema may also support future:

```text
hinted
incident
exam
```

---

## FR-D-006 — Guided Training

Guided mode shall provide additional contextual assistance compared with blind mode.

---

## FR-D-007 — Blind Training

Blind mode shall omit direct command suggestions by default.

---

## FR-D-008 — Playground

The system shall provide an ungraded shell environment with no mission or score.

---

## FR-D-009 — Initial Curriculum Size

The MVP shall include at least:

```text
20 stable official labs
```

---

## FR-D-010 — Reference Solution

Every stable official lab shall have at least one internal reference solution used to verify solvability.

---

## FR-D-011 — Alternative Valid Solutions

The system shall avoid requiring one exact command sequence where multiple valid approaches can satisfy the objective.

---

# 16. FR-E — Validation and Reset

## FR-E-001 — Outcome-Based Validation

Lab completion shall be determined from observable runtime state and/or output.

---

## FR-E-002 — Required Validators

The validation engine shall support at least:

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

---

## FR-E-003 — Conditional Validators

Where runtime fidelity supports them, the system may support:

```text
fileModeEquals
symlinkTargetEquals
environmentEquals
directoryContains
fileContentRegex
```

---

## FR-E-004 — Validation Failure

A normal incorrect learner result shall return a failure result, not an application exception.

---

## FR-E-005 — Validation Infrastructure Error

Runtime/query/validator infrastructure failure shall be distinguished from learner failure.

---

## FR-E-006 — Attempt Count

A normal failed validation shall increment the session attempt count.

---

## FR-E-007 — Deterministic Reset

The learner shall be able to reset the lab to its original state.

---

## FR-E-008 — Reset Isolation

Reset shall remove learner mutations relevant to the lab.

---

## FR-E-009 — Reset Strategy

The implementation shall prefer sandbox recreation when that provides stronger determinism than in-place undo.

---

# 17. FR-F — Learning Assistance

## FR-F-001 — Progressive Hints

Hints shall be revealed individually and in order.

---

## FR-F-002 — Hint Tracking

The system shall record the number of unique hints revealed during a session.

---

## FR-F-003 — Hint Scoring Impact

Labs may define a score penalty for hint use.

---

## FR-F-004 — Feedback

Validation feedback shall describe the unmet state without unnecessarily revealing the complete solution.

---

## FR-F-005 — Post-Lab Review

After successful completion, the system shall provide a results summary.

---

## FR-F-006 — Reference Explanation

The system may show one valid solution after completion or explicit learner request.

It shall not imply that it is the only correct solution.

---

# 18. FR-G — Progress and Mastery

## FR-G-001 — Local Progress

The system shall persist lab progress locally.

---

## FR-G-002 — Progress Fields

The system shall support:

```text
attempts
completions
best score
best duration
lowest hints used
first/last attempt
first/last completion
```

where applicable.

---

## FR-G-003 — Session History

The system shall persist individual training session summaries.

---

## FR-G-004 — No Full Transcript by Default

The system shall not persist complete terminal transcripts by default.

---

## FR-G-005 — Concept Mastery

The system shall maintain mastery state per concept.

---

## FR-G-006 — Mastery States

The system shall support:

```text
unseen
introduced
practicing
competent
proficient
mastered
stale
```

---

## FR-G-007 — Deterministic Mastery Calculation

Mastery shall be computed deterministically.

No machine-learning model is required for MVP.

---

## FR-G-008 — Weak-Area Detection

The system shall identify weak concepts based on stored training evidence.

---

## FR-G-009 — Completion vs Mastery

The UI shall distinguish:

```text
lab completion
concept mastery
```

---

## FR-G-010 — Recent Sessions

The system shall display recent session summaries.

---

# 19. FR-H — Diagnostics and Fidelity

## FR-H-001 — Diagnostics Screen

The system shall provide a diagnostics interface.

---

## FR-H-002 — Capability Status

Diagnostics shall show:

```text
WebAssembly
Web Workers
SharedArrayBuffer
crossOriginIsolated
IndexedDB
```

---

## FR-H-003 — Runtime Status

Diagnostics shall show runtime status and relevant runtime versions.

---

## FR-H-004 — Security Boundary Status

Diagnostics shall indicate:

```text
External Network: Disabled
Host Filesystem: Disabled
```

for MVP.

---

## FR-H-005 — Command Fidelity

The system shall classify command/runtime behavior as:

```text
native-wasix
simulated
unsupported
unverified
```

internally.

---

## FR-H-006 — User-Facing Fidelity

Stable user-facing labels shall be:

```text
REAL
SIMULATED
NOT AVAILABLE
```

Unverified functionality shall not be presented as stable supported functionality.

---

## FR-H-007 — Known Differences

The system documentation shall record known behavioral differences from full Linux where relevant.

---

## FR-H-008 — Fidelity Gate

A stable lab shall not launch if it depends on unsupported required behavior.

---

# 20. FR-I — Settings and Data Management

## FR-I-001 — Appearance Settings

The system shall support at least:

```text
dark theme
high-contrast theme
```

or equivalent accessible themes.

---

## FR-I-002 — Terminal Settings

The system may support:

```text
terminal font size
scrollback size
cursor preference
```

---

## FR-I-003 — Training Settings

The system may support:

```text
default training mode
show fidelity badges
confirm reset
```

---

## FR-I-004 — Reset Training Progress

The user shall be able to reset learner progress independently from the current lab reset.

---

## FR-I-005 — Full Local Reset

The user shall be able to clear all local application data through an explicit destructive action.

---

## FR-I-006 — Destructive Confirmation

Destructive local-data operations shall require confirmation.

---

# 21. FR-J — Operational and Deployment Requirements

## FR-J-001 — Static Deployment

The MVP shall be deployable as a static web application.

---

## FR-J-002 — Cross-Origin Isolation

Production deployment shall provide the required headers for runtime isolation.

---

## FR-J-003 — Production Runtime Gate

If runtime operation depends on isolation, production startup shall verify:

```js
window.crossOriginIsolated === true
```

---

## FR-J-004 — CI

The repository shall include continuous integration.

---

## FR-J-005 — Required Quality Commands

The project shall expose equivalent commands for:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:content
npm run build
npm run test:e2e
```

---

## FR-J-006 — Production Error Hygiene

The normal user interface shall not expose raw stack traces.

---

# 22. External Interface Requirements

---

# 23. User Interface Requirements

The UI shall provide:

```text
Dashboard
Training/Lab Catalog
Training Workspace
Playground
Mastery
Diagnostics
Settings
```

---

# 24. Training Workspace Requirements

The training workspace shall show:

```text
mission
terminal
runtime status
hint controls
reset control
validate control
```

The terminal shall occupy the majority of desktop workspace area.

---

# 25. Terminal Prompt Identity

The default training prompt should use a project-owned synthetic identity, such as:

```text
student@shellground
```

The system shall not imply that the browser environment is literally Kali Linux.

---

# 26. Navigation Requirements

The user shall be able to move among major product sections through visible, keyboard-accessible navigation.

---

# 27. Error Interface Requirements

Blocking errors shall include:

```text
specific explanation
stable error code where useful
recovery action
diagnostics action where applicable
```

---

# 28. Software Interface Requirements

The runtime layer shall expose an application-facing shell runtime interface.

The application shall not depend directly on vendor-specific runtime objects outside the runtime adapter boundary.

---

# 29. Persistence Interface Requirements

Application logic shall interact with persistence through repository abstractions.

UI pages shall not issue direct Dexie queries.

---

# 30. Content Interface Requirements

Training content shall be loaded through a validated content repository/loader.

Raw YAML shall not be consumed directly by UI components.

---

# 31. Data Requirements

Persistent MVP data shall include:

```text
settings
lab progress
session summaries
mastery
command statistics
content versions
application metadata
```

---

# 32. Data Versioning Requirements

The system shall maintain explicit versions for:

```text
database schema
content schema
pack
lab
fixture
fidelity registry
runtime package set
```

---

# 33. Data Migration Requirements

Database schema changes shall provide deterministic migrations.

Normal upgrades shall not silently erase learner progress.

---

# 34. Content Schema Requirements

Official content shall be structurally validated with strict schemas.

Unknown/incorrect fields in stable official content shall fail validation.

---

# 35. Content Semantic Requirements

The build shall reject stable content containing:

```text
duplicate IDs
missing concept references
missing fixtures
unknown commands
unknown validators
unsafe paths
unsupported required runtime capability
invalid reference solution
```

---

# 36. Fixture Requirements

Fixtures shall be:

```text
deterministic
versioned
guest-isolated
reviewable
bounded in size
```

---

# 37. Data Privacy Requirements

The MVP shall not require or persist:

```text
name
email
account ID
precise location
real credentials
personal files
host terminal history
```

---

# 38. Security Requirements

## SR-001 — Host Filesystem Isolation

The guest runtime shall not access the browser user's host filesystem.

---

## SR-002 — Runtime Isolation

Learner shell commands shall execute only inside the approved guest runtime boundary.

---

## SR-003 — Network Default Deny

Arbitrary guest networking shall remain disabled in MVP.

---

## SR-004 — No Raw Network Access

The system shall not expose raw sockets, host packet interfaces, or Wi-Fi hardware access.

---

## SR-005 — Trusted Runtime Packages

Only approved/pinned runtime packages shall be loaded.

Learner input shall not determine package IDs or package URLs.

---

## SR-006 — Scenario-as-Data

Training content shall not execute arbitrary JavaScript.

---

## SR-007 — Trusted Validator Code

Validator implementations shall be trusted application code selected by declarative validator type.

---

## SR-008 — Worker Message Validation

Runtime-worker requests shall be validated before processing.

---

## SR-009 — Fixture Path Safety

Fixture paths shall be normalized and restricted to guest paths.

---

## SR-010 — Synthetic Credentials

Official training content shall use synthetic credentials/secrets only.

---

## SR-011 — Permission Minimization

The application shall not request camera, microphone, location, or other unrelated browser permissions.

---

## SR-012 — Resource Cleanup

Runtime processes, workers, listeners, and terminal instances shall be cleaned up when no longer needed.

---

## SR-013 — Security Headers

Production shall include appropriate security headers compatible with the runtime.

---

## SR-014 — Terminal Link Safety

The application shall not automatically open arbitrary links emitted by guest terminal escape sequences.

---

## SR-015 — Clipboard Safety

The application shall not silently read clipboard contents.

---

# 39. Non-Functional Requirements

---

# 40. NFR-001 — Responsiveness

Normal UI interactions shall remain responsive while the runtime is active.

Heavy runtime work shall not unnecessarily block the main browser UI thread.

---

# 41. NFR-002 — Runtime Startup

Runtime initialization should be lazy.

Dashboard browsing shall not require runtime startup.

---

# 42. NFR-003 — Determinism

Stable labs shall start from reproducible fixtures and reset to equivalent initial state.

---

# 43. NFR-004 — Reliability

A failure in persistence shall not automatically terminate a functioning shell session.

---

# 44. NFR-005 — Recoverability

Runtime failure shall provide a clean restart path.

---

# 45. NFR-006 — Maintainability

The implementation shall maintain clear module boundaries between:

```text
UI
application
domain
runtime
terminal
persistence
content
```

---

# 46. NFR-007 — Testability

Core domain logic shall be testable without requiring the real runtime.

---

# 47. NFR-008 — Accessibility

Core UI shall support:

```text
keyboard navigation
visible focus
semantic labels
non-color-only status
status announcements
reduced motion
adequate contrast
```

---

# 48. NFR-009 — Transparency

The product shall make runtime limitations and simulation status understandable to the learner.

---

# 49. NFR-010 — Local-First Operation

Training, progress, and mastery shall not require an application backend.

---

# 50. NFR-011 — Versionability

Content and persistence formats shall support controlled evolution through explicit version fields.

---

# 51. NFR-012 — Bounded Resource Usage

The application shall avoid:

```text
unbounded terminal transcript buffers
unbounded file validation reads
unbounded fixture sizes
unbounded runtime logs
```

---

# 52. NFR-013 — Build Reproducibility

The project shall use dependency lockfiles and pinned runtime package versions where supported.

---

# 53. NFR-014 — Documentation Integrity

Architecture/runtime/schema changes shall update relevant project documentation.

---

# 54. Usability Requirements

## UR-001 — First-Run Simplicity

The user shall be able to begin training without creating an account.

---

## UR-002 — Direct Training Access

The first-run experience shall provide a clear action to start Linux Foundations.

---

## UR-003 — Terminal Priority

The terminal shall be the dominant active-training surface.

---

## UR-004 — Clear Validation Feedback

The user shall understand why a lab has not yet passed.

---

## UR-005 — Clear Reset Meaning

The UI shall distinguish:

```text
clear terminal display
reset current lab
reset training progress
```

---

## UR-006 — Simulation Disclosure

A lab using simulated system state shall disclose that fact.

---

## UR-007 — Mobile Advisory

On small screens, the system may advise that terminal training works best with a larger display and physical keyboard.

---

# 55. Performance Requirements

Exact numeric performance targets shall be established after the runtime spike and baseline measurements.

The system shall nevertheless meet these qualitative requirements:

```text
dashboard loads without starting WASIX
terminal input feels interactive
validation does not freeze the UI
reset completes without page reload where feasible
progress writes remain lightweight
```

---

# 56. Compatibility Requirements

The application shall expose diagnostics rather than assuming browser compatibility.

Supported browsers shall be determined by actual capability verification.

---

# 57. Content Requirements

The MVP curriculum shall include coverage of:

```text
terminal fundamentals
filesystem navigation
file operations
text inspection
search
streams
redirection
text transformation
environment variables
integrity/checksums
archives
log analysis
```

---

# 58. Initial 20-Lab Baseline

The target initial labs are:

1. Where Am I?
2. Absolute vs Relative
3. Hidden Files
4. Build the Directory Tree
5. Safe Copy
6. Rename and Move
7. Find the Needle
8. Recursive Search
9. Count the Evidence
10. Pipeline Basics
11. Redirect Correctly
12. Standard Error
13. Sort and Deduplicate
14. Extract the Column
15. Transform the Stream
16. Permission Repair or verified replacement
17. Environment Variable Hunt
18. Checksum Verification
19. Archive Recovery
20. Log Investigation

If runtime fidelity invalidates one lab, it shall be replaced rather than falsely simulated as native.

---

# 59. Command Fidelity Requirements

The final command matrix shall distinguish:

```text
REAL
SIMULATED
NOT AVAILABLE
```

A command shall not become REAL without runtime evidence.

---

# 60. Runtime Spike Requirements

Before declaring the runtime production-ready, the project shall produce evidence for:

```text
shell startup
stdin
stdout
stderr
filesystem
pipes
redirection
variables
environment
exit status
scripts
reset
network denial
cleanup
```

---

# 61. Error Classification Requirements

System errors shall be categorized at minimum as:

```text
Capability
Content
Runtime
Protocol
Validation Infrastructure
Persistence
Configuration
```

---

# 62. Stable Error Codes

Important system failures should expose stable codes such as:

```text
SG-RUNTIME-001
SG-CONTENT-001
SG-STORAGE-001
```

---

# 63. Logging Requirements

The application may generate structured development/diagnostic logs.

Production logging shall avoid:

```text
real secrets
clipboard contents
complete learner file contents
full terminal transcripts
```

---

# 64. CI Requirements

Pull requests affecting production code shall run appropriate automated checks.

At minimum:

```text
install
lint
typecheck
tests
build
```

Content changes shall additionally run content validation.

---

# 65. Testing Requirements

The project shall include:

```text
unit tests
integration tests
runtime conformance tests
content tests
E2E tests
manual release acceptance
```

---

# 66. Unit Test Coverage Areas

At minimum:

```text
mastery
validation
scoring
schema parsing
state transitions
fidelity resolution
```

---

# 67. Integration Test Areas

At minimum:

```text
runtime
worker protocol
filesystem fixture seeding
reset
persistence repositories
lab lifecycle
```

---

# 68. Runtime Conformance Areas

At minimum:

```text
shell boot
stdio
filesystem
pipes
redirection
environment
scripts
reset
network denied
dispose
```

---

# 69. Content Test Areas

At minimum:

```text
schema
IDs
references
fixtures
fidelity dependencies
reference solutions
curriculum order
```

---

# 70. E2E Acceptance Flow

At minimum, automated or manual E2E shall prove:

```text
load app
capability check
open lab
runtime start
terminal input
hint
validation failure
retry
validation pass
progress persistence
mastery update
diagnostics
```

---

# 71. Acceptance Criteria — Runtime

The runtime requirement set is accepted when:

- shell starts reliably;
- core file operations succeed;
- pipes work;
- required redirection works;
- scripts run;
- reset works;
- no arbitrary networking is enabled;
- runtime can be disposed cleanly.

---

# 72. Acceptance Criteria — Training

The training system is accepted when:

- lab loads;
- fixture initializes;
- mission is visible;
- hints work;
- validation can fail correctly;
- validation can pass correctly;
- reset restores the lab;
- multiple valid command solutions are accepted where appropriate.

---

# 73. Acceptance Criteria — Persistence

Persistence is accepted when:

```text
complete a lab
reload application
completion remains
mastery remains
settings remain
```

---

# 74. Acceptance Criteria — UI

The UI is accepted when the user can:

```text
navigate
find a lab
start a lab
use the terminal
request hints
reset
validate
see results
view mastery
open diagnostics
change settings
```

without developer intervention.

---

# 75. Acceptance Criteria — Security

Security is accepted when tests confirm:

```text
host filesystem unavailable
arbitrary guest networking disabled
unapproved runtime packages rejected
malformed worker messages rejected
unsafe fixture paths rejected
content cannot execute JS
unneeded browser permissions absent
```

---

# 76. Acceptance Criteria — Production Deployment

Production is accepted when:

```text
HTTPS works
required isolation headers are present
crossOriginIsolated is true
runtime starts
labs work
progress works
security headers present
E2E smoke test passes
```

---

# 77. Release Acceptance Baseline

Before v0.1.0:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:content
npm run build
npm run test:e2e
```

must all pass.

---

# 78. Requirement Priorities

Priority classes:

```text
MUST
SHOULD
MAY
OUT
```

Interpretation:

```text
MUST   required for v0.1.0
SHOULD strongly preferred, may defer only with documented reason
MAY    optional
OUT    explicitly outside MVP
```

---

# 79. Priority — MUST

Examples:

```text
browser shell
terminal
virtual FS
20 labs
validation
reset
local progress
mastery
diagnostics
fidelity
CI
production isolation
network deny
```

---

# 80. Priority — SHOULD

Examples:

```text
command statistics
permission fidelity if reliable
high-contrast theme
reference solution review
additional accessibility polish
```

---

# 81. Priority — MAY

Examples:

```text
command palette
light theme
:why
detailed session-history screen
```

---

# 82. Priority — OUT

Examples:

```text
accounts
cloud sync
leaderboards
AI tutor
full pentesting suite
raw sockets
host packet capture
Wi-Fi attacks
arbitrary SSH
```

---

# 83. Traceability — Requirements to Major Modules

| Requirement Group | Primary Module |
|---|---|
| FR-A | Diagnostics / Capability Detection |
| FR-B | Runtime / Terminal |
| FR-C | Runtime / Fixture Engine |
| FR-D | Content / Scenario Engine |
| FR-E | Validation / Reset |
| FR-F | Training Application |
| FR-G | Persistence / Mastery |
| FR-H | Fidelity / Diagnostics |
| FR-I | Settings / Persistence |
| FR-J | CI / Deployment |

---

# 84. Traceability — Requirements to Project Phases

| Requirement Group | Main Phase |
|---|---|
| FR-A | 0, 11 |
| FR-B | 0, 2, 3 |
| FR-C | 3, 4, 6 |
| FR-D | 4, 9 |
| FR-E | 5, 6 |
| FR-F | 4, 5, 10 |
| FR-G | 7, 8, 10 |
| FR-H | 0, 3, 10, 11 |
| FR-I | 7, 10 |
| FR-J | 1, 11, 12 |

---

# 85. Traceability — Security to Tests

| Security Requirement | Verification |
|---|---|
| SR-001 Host FS isolation | runtime integration test |
| SR-003 Network deny | network-denial regression |
| SR-005 Trusted packages | manifest validation |
| SR-006 Scenario as data | schema/content tests |
| SR-008 Worker validation | protocol tests |
| SR-009 Path safety | fixture semantic tests |
| SR-011 Permission minimization | browser/manual review |
| SR-012 Cleanup | lifecycle integration tests |

---

# 86. Requirement Change Control

After this SRS is baselined, any change to a MUST requirement shall:

1. identify affected requirement ID;
2. update Feature Scope if applicable;
3. update architecture/design if applicable;
4. update tests/acceptance criteria;
5. be recorded through project change control.

---

# 87. Requirement Conflict Rule

If implementation convenience conflicts with a MUST requirement:

```text
the requirement wins
```

unless the requirement is formally changed.

---

# 88. Runtime Fidelity Conflict Rule

If curriculum requires behavior that the runtime cannot provide reliably:

```text
replace the lab
simulate explicitly
or
defer the concept
```

Do not misrepresent fidelity.

---

# 89. Deferred Requirements

Post-MVP requirements include:

```text
Drill mode
Adaptive repetition
Randomized fixtures
Incident mode
Exam mode
Networking simulation
Administration simulation
PWA/offline optimization
Cloud sync
Accounts
Community content
```

These are not v0.1.0 acceptance blockers.

---

# 90. Final SRS Baseline

SHELLGROUND v0.1.0 shall provide:

```text
Browser compatibility gate
Browser-local sandboxed shell
Terminal interaction
Virtual filesystem
Structured deterministic labs
Outcome validation
Deterministic reset
Hints
Guided + blind training
Playground
20 official labs
Local progress
Concept mastery
Weak-area detection
Diagnostics
Explicit fidelity
Static secure deployment
CI and automated tests
```

The central SRS principle is:

> **SHELLGROUND shall teach transferable Linux command-line skills using real sandboxed behavior wherever verified, explicit simulation where necessary, and no false claims of Linux fidelity.**

---

# 91. Next Document

The design document that implements this SRS is:

```text
10C. SHELLGROUND_SDD.md
```

Because the SDD was drafted before this SRS was finalized, the SDD should now be cross-checked against this SRS before the project proceeds to the final coding-agent prompt.

The remaining project sequence is:

```text
10C. SDD cross-check
11. Implementation Plan
12. Single Coding-Agent Prompt
```
