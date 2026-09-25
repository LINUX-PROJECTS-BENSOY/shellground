# SHELLGROUND — Feature Scope Specification

> **Document:** Feature Scope Specification  
> **Project:** SHELLGROUND  
> **Sequence:** 2 of 13  
> **Depends on:** `SHELLGROUND_REQUIREMENTS.md`  
> **Status:** Draft Baseline  
> **Purpose:** Define exactly which product capabilities belong in the MVP, which are post-MVP, and which are explicitly excluded.

---

# 1. Purpose

This document translates the approved SHELLGROUND requirements into a bounded product scope.

The goal is to prevent two forms of scope failure:

1. **Under-scoping** — building only a terminal emulator without an actual training system.
2. **Over-scoping** — turning SHELLGROUND into a browser-based Kali Linux clone, pentesting suite, cloud lab platform, or full Linux emulator.

The MVP must be large enough to prove the training model but small enough to remain technically controlled and testable.

---

# 2. Scope Principle

The product scope is governed by one rule:

> **Every MVP feature must directly improve Linux command fluency, training repeatability, progress measurement, or runtime safety.**

A feature shall be deferred when it primarily serves:

- social functionality;
- cloud convenience;
- visual novelty;
- offensive-security tooling;
- infrastructure complexity;
- community content;
- full operating-system fidelity;
- functionality not required for learning Linux commands.

---

# 3. Scope Levels

SHELLGROUND features are divided into four scope classes.

## 3.1 Scope Class A — MVP Mandatory

These features must be implemented for the first complete MVP.

Failure to implement any mandatory capability means the MVP is incomplete.

---

## 3.2 Scope Class B — MVP Conditional

These features may be implemented in the MVP only if the selected browser runtime supports them correctly without destabilizing the critical path.

They must not block MVP release.

---

## 3.3 Scope Class C — Post-MVP Planned

These capabilities are intentionally planned for later versions.

They may influence architecture decisions but shall not be implemented during the first MVP unless all mandatory work is complete and doing so creates no scope risk.

---

## 3.4 Scope Class D — Explicitly Excluded

These features are outside the current product mission.

They shall not be implemented in the MVP.

Some may remain permanently excluded.

---

# 4. MVP Product Definition

The MVP is:

> A local-first browser application that launches a sandboxed Linux/POSIX-style shell, presents deterministic command-line training labs, validates outcomes, resets environments, records local progress, reports command/runtime fidelity, and includes a minimum viable curriculum.

The MVP is not simply:

```text
Browser
+
Terminal
```

It must be:

```text
Browser Shell
+
Training Engine
+
Scenario Content
+
Validation
+
Reset
+
Progress
+
Mastery
+
Runtime Transparency
```

---

# 5. MVP Feature Domains

The MVP contains ten mandatory product domains:

1. Runtime and capability detection
2. Terminal interaction
3. Virtual training environment
4. Scenario/lab engine
5. Validation and reset
6. Learning assistance
7. Progress and mastery
8. Training content
9. Diagnostics and fidelity
10. Quality/deployment foundation

Each domain is defined below.

---

# 6. Domain A — Runtime and Capability Detection

## 6.1 Browser Capability Check

### Scope
**Mandatory**

The application shall detect whether the current browser can support the runtime.

Required checks:

- WebAssembly;
- Web Workers;
- `SharedArrayBuffer`;
- `crossOriginIsolated`;
- IndexedDB.

### User Outcome

The learner must know whether SHELLGROUND can run before starting a lab.

### Required Behaviors

The system shall:

- perform compatibility checks;
- display pass/fail state;
- explain blocked capabilities;
- prevent runtime launch when a hard dependency is unavailable.

### Out of Scope

The MVP shall not:

- install browser features;
- modify browser security settings automatically;
- provide alternate native desktop runtimes.

### Requirement Traceability

```text
FR-001
FR-026
NFR-012
AR-002
```

---

## 6.2 Browser-Side Shell Runtime

### Scope
**Mandatory**

The application shall launch an isolated browser-side shell environment.

### Required Behaviors

The runtime must support enough real shell behavior to power the approved initial curriculum.

At minimum, the runtime feasibility phase must validate:

```text
pwd
cd
ls
echo
mkdir
touch
cp
mv
rm
cat
grep
find
pipes
redirection
variables
simple scripting
```

### Scope Boundary

The runtime is required to support training-oriented POSIX/Linux-style command execution.

It is not required to reproduce:

- Linux kernel internals;
- systemd;
- kernel networking;
- real hardware;
- real block devices;
- host processes.

### Requirement Traceability

```text
FR-002
FR-003
RF-001
RF-004
AR-003
AR-004
AR-005
```

---

# 7. Domain B — Terminal Interaction

## 7.1 Interactive Terminal

### Scope
**Mandatory**

The application shall provide a real terminal-style interaction surface.

### Required Behaviors

The terminal shall support:

- keyboard input;
- shell output;
- error output;
- cursor;
- terminal focus;
- resizing;
- shell history where supported;
- copy behavior consistent with browser security constraints.

### Required User Experience

The training terminal must feel sufficiently close to a standard CLI that learned interaction patterns transfer to real Linux terminals.

### Explicit Boundary

The terminal renderer itself must not fake command execution.

### Requirement Traceability

```text
FR-002
NFR-001
NFR-007
AR-003
```

---

## 7.2 Terminal Themes

### Scope
**Conditional**

The MVP may provide:

- default dark theme;
- high-contrast theme;
- one alternative theme.

### Not Required

The MVP does not need:

- Kali theme packs;
- dozens of themes;
- animated terminal skins;
- custom cursor packs.

### Rationale

Visual customization is secondary to training functionality.

---

# 8. Domain C — Virtual Training Environment

## 8.1 Virtual Filesystem

### Scope
**Mandatory**

Labs shall operate against an isolated virtual filesystem.

### Required Content Types

The MVP shall support:

- directories;
- regular files;
- nested paths;
- hidden files;
- file content;
- relative paths;
- absolute paths.

### Conditional Filesystem Features

Implement only when runtime behavior is reliable:

- symbolic links;
- file permission metadata;
- executable bits;
- timestamps.

### Requirement Traceability

```text
FR-004
FR-005
AR-004
AR-009
```

---

## 8.2 Fixture Seeding

### Scope
**Mandatory**

Each lab shall be able to define a starting environment.

Examples:

```text
/home/student/readme.txt
/opt/archive/.evidence
/var/log/auth.log
/tmp/results.csv
```

### Required Behaviors

The fixture system shall support:

- deterministic file creation;
- deterministic directory creation;
- known file contents;
- lab-specific environment initialization.

### Requirement Traceability

```text
FR-006
FR-007
CR-006
NFR-005
```

---

# 9. Domain D — Scenario and Lab Engine

## 9.1 Structured Lab Definition

### Scope
**Mandatory**

Every official lab shall be represented by structured versioned content.

Each lab must contain:

- unique ID;
- schema version;
- title;
- difficulty;
- mission objective;
- concepts;
- fixture reference;
- validator definitions;
- optional hints;
- capabilities;
- scoring metadata if scored.

### Requirement Traceability

```text
FR-006
CR-001
CR-002
CR-003
CR-004
```

---

## 9.2 Mission Presentation

### Scope
**Mandatory**

The learner shall be shown a clear objective.

Example:

```text
Find the hidden file under /opt/archive that contains
ACCESS_GRANTED and print its absolute path.
```

The application shall avoid unnecessarily telling the learner which exact command to use.

### Requirement Traceability

```text
FR-006
LR-006
```

---

## 9.3 Guided Mode

### Scope
**Mandatory**

Guided mode shall include:

- mission;
- concept labels;
- optional contextual explanation;
- hints;
- validation.

### Requirement Traceability

```text
FR-013
LR-001
LR-002
LR-007
```

---

## 9.4 Blind Mode

### Scope
**Mandatory**

Blind mode shall remove most instructional assistance.

The user receives:

- mission;
- constraints;
- validation capability.

The system shall not show:

- sample commands;
- command suggestions;
- step-by-step walkthroughs.

### Requirement Traceability

```text
FR-014
LR-004
LR-006
```

---

## 9.5 Playground Mode

### Scope
**Mandatory**

Playground mode shall provide a non-graded shell environment.

Required:

- terminal;
- default filesystem;
- reset;
- no mandatory objective;
- no score.

### Requirement Traceability

```text
FR-012
LR-002
```

---

## 9.6 Drill Mode

### Scope
**Post-MVP Planned**

Drill mode shall eventually allow selection by:

```text
command
concept
domain
weak area
```

Examples:

```text
grep drills
find drills
permissions drills
redirection drills
awk drills
```

### Why Deferred

The MVP first needs:

- enough content;
- mastery statistics;
- lab taxonomy.

### Requirement Traceability

```text
FR-015
FR-022
FR-023
```

---

## 9.7 Exam Mode

### Scope
**Post-MVP Planned**

Exam mode shall eventually include:

- multiple labs;
- no hints;
- elapsed time;
- cumulative score;
- domain breakdown.

### Why Deferred

It depends on a larger validated curriculum.

### Requirement Traceability

```text
FR-016
LR-004
```

---

## 9.8 Incident Mode

### Scope
**Post-MVP Planned**

Incident mode shall present realistic system-analysis problems.

Examples:

- investigate authentication failures;
- determine why disk usage is excessive;
- identify modified files;
- verify integrity;
- locate dangerous permissions.

### MVP Inclusion

The MVP may include one simple incident-style lab as a proof of concept, but a dedicated incident mode is deferred.

### Requirement Traceability

```text
FR-017
FR-018
LR-005
LR-006
```

---

# 10. Domain E — Validation and Reset

## 10.1 Outcome-Based Validation

### Scope
**Mandatory**

The application shall validate whether the desired final state was achieved.

Supported MVP validator classes should include at least:

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

### Conditional Validators

Implement where runtime semantics are reliable:

```text
fileModeEquals
symlinkTargetEquals
environmentEquals
```

### Scope Rule

The validator should measure success, not enforce unnecessary command syntax.

### Requirement Traceability

```text
FR-009
FR-010
CR-005
NFR-004
```

---

## 10.2 Deterministic Reset

### Scope
**Mandatory**

The learner shall be able to restore the active lab.

Reset must restore:

- initial fixture;
- lab state;
- validation baseline.

The runtime may be restarted when this is the safest implementation.

### Requirement Traceability

```text
FR-007
FR-008
CR-006
NFR-005
NFR-006
AR-007
```

---

## 10.3 Reference-Solution Verification

### Scope
**Mandatory for official content**

Each official lab shall have an internal test reference demonstrating that the configured objective is solvable.

The reference solution is not required to be shown to learners.

### Requirement Traceability

```text
CR-007
CR-008
NFR-004
```

---

# 11. Domain F — Learning Assistance

## 11.1 Progressive Hints

### Scope
**Mandatory**

Labs may define ordered hints.

Example:

```text
Hint 1:
Hidden files usually begin with a dot.

Hint 2:
Use a search command that can traverse directories.

Hint 3:
Combine filename search with content filtering.
```

### Requirements

The application shall:

- reveal hints explicitly on request;
- record hint use;
- avoid revealing all hints immediately.

### Requirement Traceability

```text
FR-011
LR-007
```

---

## 11.2 `:why` Explanation Command

### Scope
**Conditional**

A SHELLGROUND meta-command may explain the structure of a command.

Example:

```text
:why grep -R "failed" /var/log
```

Possible output:

```text
grep
  search text

-R
  recursive traversal

"failed"
  pattern

/var/log
  search root
```

### Scope Boundary

The feature must not become a full AI tutor in the MVP.

Static parsing/explanation is acceptable.

### Requirement Traceability

```text
FR-028
LR-007
```

---

## 11.3 Built-In Command Reference

### Scope
**Conditional**

The MVP may provide concise reference material for common commands.

This should supplement, not replace, training.

### Deferred Enhancements

- searchable full reference;
- man-page mirror;
- external documentation aggregation.

---

# 12. Domain G — Progress and Mastery

## 12.1 Local Progress Tracking

### Scope
**Mandatory**

The system shall store local lab progress.

Minimum fields:

```text
attempts
completed
best score
hints used
best duration
last attempt
completion date
```

### Requirement Traceability

```text
FR-019
FR-024
DR-001
```

---

## 12.2 Concept Mastery

### Scope
**Mandatory**

The MVP shall compute a simple deterministic mastery score for concepts.

Examples:

```text
filesystem navigation
search
redirection
text processing
permissions
shell variables
logs
```

### Initial Inputs

Mastery may consider:

- success;
- attempts;
- hint usage;
- recency;
- completion duration.

### Requirement Traceability

```text
FR-021
LR-003
DR-001
```

---

## 12.3 Command-Level Statistics

### Scope
**Conditional**

The application may track command usage for learning analytics.

Example:

```text
grep   18 uses
find   11 uses
awk     4 uses
```

### Important Constraint

Command parsing shall not be used as a security boundary.

### Requirement Traceability

```text
FR-020
```

---

## 12.4 Weakness Detection

### Scope
**Mandatory**

The MVP shall identify weak concepts using deterministic rules.

Example:

```text
Weak Areas
1. awk
2. stderr redirection
3. permissions
```

### Requirement Traceability

```text
FR-022
```

---

## 12.5 Adaptive Training Recommendations

### Scope
**Post-MVP Planned**

The application shall eventually recommend labs based on:

- low mastery;
- stale practice;
- failed attempts;
- excessive hint use.

### Explicit Constraint

No ML model is required.

### Requirement Traceability

```text
FR-023
```

---

# 13. Domain H — Training Content

## 13.1 MVP Curriculum Size

### Scope
**Mandatory**

The MVP shall ship with at least:

```text
20 official labs
```

---

## 13.2 Required MVP Topics

The 20-lab baseline must cover:

### Navigation

```text
pwd
cd
ls
relative paths
absolute paths
hidden files
```

### File Operations

```text
mkdir
touch
cp
mv
rm
```

### Search

```text
grep
find
```

### Streams

```text
pipes
stdout
stderr
redirection
append
```

### Text Processing

```text
wc
sort
uniq
cut
sed or awk
```

### Integrity / Archive

```text
checksum
archive extraction or creation
```

### Logs

At least one structured log-analysis exercise.

---

## 13.3 Initial Lab List

The initial target set is:

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
16. Permission Repair
17. Environment Variable Hunt
18. Checksum Verification
19. Archive Recovery
20. Log Investigation

If runtime constraints make one lab technically invalid, it shall be replaced by an equivalent learning objective rather than faked.

### Requirement Traceability

```text
CR-001
CR-003
CR-004
CR-005
CR-006
CR-007
CR-008
AR-012
MVP acceptance baseline
```

---

# 14. Domain I — Diagnostics and Fidelity

## 14.1 Runtime Diagnostics

### Scope
**Mandatory**

The diagnostics view shall show:

```text
WebAssembly
Web Workers
SharedArrayBuffer
crossOriginIsolated
IndexedDB
runtime status
runtime version
content version
```

### Requirement Traceability

```text
FR-026
AR-002
```

---

## 14.2 Command Fidelity Registry

### Scope
**Mandatory**

Every command relevant to the curriculum shall be classified as:

```text
native-wasix
simulated
unsupported
```

### User Presentation

The UI may display:

```text
REAL
SIMULATED
UNSUPPORTED
```

### Requirement Traceability

```text
FR-003
FR-027
RF-002
RF-003
RF-004
RF-005
```

---

## 14.3 Runtime Spike Report

### Scope
**Mandatory development artifact**

Before full implementation, the project shall produce:

```text
docs/RUNTIME_SPIKE_RESULTS.md
```

This must record:

- actual runtime package;
- version;
- supported commands;
- unsupported commands;
- filesystem behavior;
- pipes;
- redirection;
- reset strategy;
- browser constraints.

This is a product-development gate, not an end-user feature.

---

# 15. Domain J — Quality and Deployment Foundation

## 15.1 Automated Quality Gates

### Scope
**Mandatory**

The project shall support equivalent commands for:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:content
npm run build
npm run test:e2e
```

---

## 15.2 CI

### Scope
**Mandatory**

CI shall validate:

- dependency installation;
- lint;
- types;
- tests;
- content;
- build.

E2E execution may run separately depending on browser/runtime environment.

---

## 15.3 Production Hosting

### Scope
**Mandatory**

The selected deployment platform must support runtime-required headers.

The application shall not be considered production-ready if:

```js
window.crossOriginIsolated !== true
```

when the selected runtime requires isolation.

---

## 15.4 PWA Installability

### Scope
**Post-MVP Planned**

PWA support is deferred until:

- runtime caching is understood;
- worker behavior is stable;
- versioning strategy is stable.

The MVP may include basic manifest groundwork but shall not make offline/PWA work a release blocker.

---

# 16. MVP Mandatory Feature Checklist

The MVP must include all of the following:

- [ ] Browser capability detection
- [ ] Browser-side shell runtime
- [ ] Interactive terminal
- [ ] Isolated virtual filesystem
- [ ] Fixture seeding
- [ ] Deterministic reset
- [ ] Structured lab definitions
- [ ] Guided mode
- [ ] Blind mode
- [ ] Playground mode
- [ ] Outcome-based validation
- [ ] Progressive hints
- [ ] Local progress persistence
- [ ] Concept mastery
- [ ] Weakness detection
- [ ] Command fidelity registry
- [ ] Diagnostics screen
- [ ] Minimum 20 official labs
- [ ] Official content tests
- [ ] Runtime spike documentation
- [ ] Automated quality gates
- [ ] CI
- [ ] Production-compatible deployment configuration

If any item remains unimplemented, it must be explicitly documented as a release blocker or formally removed from the MVP baseline.

---

# 17. MVP Conditional Feature Checklist

These features may ship if technically sound:

- [ ] Terminal theme selection
- [ ] `:why`
- [ ] Command-level statistics
- [ ] Built-in command reference
- [ ] File permission validation
- [ ] Symbolic-link validation
- [ ] Environment-variable validation
- [ ] One incident-style proof-of-concept lab

None of these may delay mandatory MVP functionality.

---

# 18. Post-MVP Planned Features

## 18.1 v0.2 — Curriculum Expansion

Target:

```text
50–70 total labs
```

Focus:

- deeper `grep`;
- `find`;
- `sed`;
- `awk`;
- shell scripting;
- troubleshooting;
- defensive analysis.

---

## 18.2 v0.3 — Adaptive Practice

Add:

- drill mode;
- weak-area lab selection;
- spaced repetition;
- randomized fixture templates;
- proficiency trends.

---

## 18.3 v0.4 — Operational Training

Add:

- incident mode;
- exam mode;
- timed exercises;
- multi-step system scenarios;
- defensive investigations.

---

## 18.4 v1.0 — Stable Learning Platform

Target:

```text
100+ deterministic labs
20+ randomized lab templates
10+ incident scenarios
3+ exam presets
stable content schema
stable persistence schema
stable runtime fidelity registry
```

---

# 19. Explicitly Excluded Features

The following shall not be implemented in the MVP.

## 19.1 Offensive Security Tooling

Excluded:

```text
Metasploit
Hydra
SQLMap
Aircrack-ng
password spraying
credential stuffing
exploit frameworks
payload generators
```

Reason:

They are outside Linux command-mastery MVP scope.

---

## 19.2 Real Network Attack Capability

Excluded:

```text
arbitrary port scanning
raw packet injection
external target enumeration
Wi-Fi attacks
packet capture from host interfaces
arbitrary SSH
```

---

## 19.3 Linux Kernel Emulation

Excluded:

```text
kernel modules
real systemd
real kernel firewalling
real device mounts
real block devices
host namespaces
host process table
```

---

## 19.4 Cloud Accounts

Excluded from MVP:

```text
registration
login
OAuth
cloud synchronization
cross-device progress
```

---

## 19.5 Social Features

Excluded:

```text
friends
public profiles
leaderboards
chat
social feeds
public achievements
```

---

## 19.6 Community Content Marketplace

Excluded:

- public lab submissions;
- public pack registry;
- ratings;
- comments;
- paid training packs.

The architecture may eventually support imported content, but this is not an MVP requirement.

---

## 19.7 AI Tutor

Excluded from MVP:

- LLM-generated commands;
- LLM-generated lab solutions;
- autonomous personalized tutoring;
- generative incident scenarios.

Static deterministic learning assistance is preferred initially.

---

# 20. Scope Dependency Map

```text
Runtime Feasibility
        │
        ▼
Interactive Shell
        │
        ▼
Virtual Filesystem
        │
        ├─────────────┐
        ▼             ▼
Scenario Engine    Reset Engine
        │             │
        └──────┬──────┘
               ▼
        Validation Engine
               │
               ▼
          Training Modes
               │
        ┌──────┴──────┐
        ▼             ▼
     Progress       Content
        │             │
        └──────┬──────┘
               ▼
            Mastery
               │
               ▼
        Weakness Detection
```

This dependency order constrains implementation sequencing.

---

# 21. Scope Decision Rules

When a new feature is proposed, evaluate it using the following questions.

## Rule 1

Does it directly improve Linux command learning?

If no, defer.

---

## Rule 2

Does it require host-level access?

If yes, exclude from the browser MVP unless safely simulated.

---

## Rule 3

Does it depend on a full Linux kernel?

If yes, classify as:

```text
simulated
or
unsupported
```

Do not silently fake fidelity.

---

## Rule 4

Does it require a backend?

If yes, defer unless the requirement cannot be satisfied locally.

The current MVP does not require a backend.

---

## Rule 5

Does it create substantial security exposure without improving the core training goal?

If yes, exclude.

---

## Rule 6

Does it require significant effort but only add visual polish?

If yes, implement after training-critical features.

---

## Rule 7

Can the feature be added later without architectural breakage?

If yes, keep it out of the MVP unless necessary.

---

# 22. Feature-to-Requirement Traceability Summary

| Feature | Requirement IDs |
|---|---|
| Capability detection | FR-001, FR-026, NFR-012, AR-002 |
| Browser shell | FR-002, FR-003, AR-003, AR-004 |
| Terminal UI | FR-002, NFR-001, NFR-007 |
| Virtual filesystem | FR-004, FR-005, AR-009 |
| Lab fixture | FR-006, FR-007, CR-006 |
| Structured labs | FR-006, CR-001–CR-005 |
| Guided mode | FR-013, LR-001, LR-002 |
| Blind mode | FR-014, LR-004, LR-006 |
| Playground | FR-012 |
| Validation | FR-009, FR-010, CR-005 |
| Reset | FR-008, NFR-005, NFR-006 |
| Hints | FR-011, LR-007 |
| Local progress | FR-019, FR-024, DR-001 |
| Mastery | FR-020, FR-021 |
| Weakness detection | FR-022 |
| Fidelity reporting | FR-027, RF-002–RF-005 |
| Diagnostics | FR-026 |
| 20 labs | CR-001–CR-008, MVP acceptance |
| CI/quality gates | NFR-004, AR-012 |
| Drill mode | FR-015, deferred |
| Exam mode | FR-016, deferred |
| Incident mode | FR-017, FR-018, deferred |
| Adaptive recommendations | FR-023, deferred |

---

# 23. MVP Release Boundary

The MVP release boundary is reached when the learner can perform the following full workflow:

```text
Open SHELLGROUND
        ↓
Compatibility passes
        ↓
Choose a lab
        ↓
Lab fixture loads
        ↓
Interactive shell starts
        ↓
Read mission
        ↓
Execute commands
        ↓
Request hint if needed
        ↓
Validate result
        ↓
Pass or retry
        ↓
Reset if required
        ↓
Progress is stored
        ↓
Mastery is updated
        ↓
Weak areas are visible
```

If this complete loop works reliably across the initial curriculum, the MVP has achieved its product purpose.

---

# 24. Feature Scope Baseline Summary

## Mandatory MVP

```text
Browser runtime
Terminal
Virtual filesystem
Scenario engine
20 labs
Validation
Reset
Hints
Guided mode
Blind mode
Playground
Local progress
Mastery
Weakness detection
Diagnostics
Fidelity classification
CI
Production deployment
```

## Deferred

```text
Drill mode
Exam mode
Full incident mode
Adaptive scheduling
Random generation
PWA/offline optimization
Cloud sync
Accounts
Community content
AI tutor
```

## Excluded

```text
Kali cloning
Full Linux kernel emulation
Offensive-security suite
Arbitrary network attacks
Raw sockets
Host filesystem access
Host process manipulation
```

This document defines **what SHELLGROUND will and will not contain**.

The next project document should define the **full architecture** needed to implement this approved scope.
