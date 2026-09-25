# SHELLGROUND — Software Project Management Plan (SPMP)

> **Document:** Software Project Management Plan  
> **Project:** SHELLGROUND  
> **Sequence:** 10A of 13  
> **Document Type:** SPMP  
> **Status:** Draft Management Baseline  
> **Primary Delivery Target:** SHELLGROUND v0.1.0 MVP  
> **Development Model:** Incremental, risk-driven, milestone-gated  
> **Repository Model:** Single-package GitHub repository  
> **Primary Runtime Strategy:** Browser-local WASIX sandbox  
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

---

# 1. Introduction

## 1.1 Purpose

This Software Project Management Plan defines how SHELLGROUND will be planned, implemented, reviewed, tested, controlled, and released.

It establishes the management baseline for:

```text
scope
milestones
roles
work breakdown
branching
pull requests
quality gates
risk management
configuration management
change control
testing
documentation
release management
```

This document governs the implementation process.

It does not replace:

```text
SRS
SDD
Implementation Plan
```

which define product requirements, detailed design, and execution tasks respectively.

---

# 2. Project Overview

SHELLGROUND is a browser-based Linux command training environment designed to develop practical command-line proficiency without requiring:

```text
Kali Linux
another Linux installation
WSL
Docker
VirtualBox
VMware
dual boot
remote SSH training servers
```

The product provides:

```text
browser-side shell runtime
virtual filesystem
terminal UI
structured labs
outcome validation
deterministic reset
progress tracking
mastery tracking
runtime fidelity reporting
```

---

# 3. Project Objectives

The project shall deliver an MVP that allows a learner to:

1. launch SHELLGROUND in a supported browser;
2. run an interactive shell;
3. manipulate an isolated virtual filesystem;
4. complete structured Linux-command labs;
5. validate outcomes;
6. reset a lab deterministically;
7. receive hints;
8. track local progress;
9. track concept mastery;
10. inspect runtime limitations and fidelity;
11. complete at least 20 official training labs.

---

# 4. Project Success Criteria

The MVP is successful when:

```text
runtime boots reliably
terminal works
core commands work
pipes work
redirection works
reset is deterministic
20 labs are stable
validation is correct
progress persists
mastery updates
deployment is secure
network remains disabled
quality gates pass
known limitations are documented
```

---

# 5. Management Strategy

SHELLGROUND shall use a:

```text
risk-driven
incremental
bounded-PR
milestone-gated
```

development approach.

The most technically uncertain feature—the browser runtime—must be proven first.

---

# 6. Development Lifecycle

The implementation lifecycle is:

```text
Plan
↓
Spike
↓
Foundation
↓
Build
↓
Integrate
↓
Validate
↓
Harden
↓
Release
```

The project shall avoid implementing large downstream features before upstream feasibility is demonstrated.

---

# 7. Delivery Phases

The MVP is organized into:

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

---

# 8. Phase Governance

Each phase must define:

```text
entry criteria
implementation scope
deliverables
tests
evidence
exit criteria
blockers
deferred work
```

A phase is not considered complete solely because implementation code exists.

---

# 9. Project Roles

SHELLGROUND is initially structured as a small project.

One person may fulfill multiple roles, but responsibilities must remain conceptually distinct.

Recommended roles:

```text
Project Owner
Technical Lead
Runtime Engineer
Frontend Engineer
Content/Curriculum Author
QA Engineer
Security Reviewer
Release Manager
```

---

# 10. Project Owner

Responsibilities:

- approve scope;
- approve major product changes;
- prioritize milestones;
- accept or reject MVP scope changes;
- define learning goals;
- approve release readiness.

---

# 11. Technical Lead

Responsibilities:

- architecture ownership;
- runtime strategy;
- dependency decisions;
- coding standards;
- architecture boundaries;
- technical risk escalation;
- implementation review.

---

# 12. Runtime Engineer

Responsibilities:

- WASIX runtime spike;
- Wasmer adapter;
- worker protocol;
- runtime lifecycle;
- command fidelity testing;
- reset behavior;
- package pinning;
- runtime security.

---

# 13. Frontend Engineer

Responsibilities:

- React UI;
- terminal integration;
- state management;
- dashboard;
- training workspace;
- mastery UI;
- diagnostics;
- settings;
- accessibility.

---

# 14. Curriculum Author

Responsibilities:

- concepts;
- labs;
- fixtures;
- hints;
- reference solutions;
- difficulty;
- prerequisites;
- content versioning.

---

# 15. QA Engineer

Responsibilities:

- automated tests;
- content tests;
- integration tests;
- regression tests;
- E2E tests;
- release validation;
- defect tracking.

---

# 16. Security Reviewer

Responsibilities:

- runtime boundary review;
- package-source review;
- network-denial verification;
- fixture-path review;
- worker-protocol review;
- production-header review;
- dependency-security review.

---

# 17. Release Manager

Responsibilities:

- release branch;
- versioning;
- release notes;
- release checklist;
- deployment verification;
- rollback readiness.

---

# 18. Single-Developer Model

If one developer performs all roles, work must still be reviewed according to role boundaries.

Example:

```text
developer implements runtime
↓
switches to reviewer mindset
↓
checks runtime security
↓
checks test evidence
↓
records limitations
```

Role separation remains conceptual even when personnel overlap.

---

# 19. Project Scope Baseline

## 19.1 Included in MVP

```text
browser capability detection
browser-local shell runtime
xterm terminal
isolated virtual filesystem
scenario engine
validation engine
deterministic reset
guided mode
blind mode
playground
local persistence
mastery
weakness detection
diagnostics
fidelity registry
20 official labs
CI
production deployment
```

---

# 20. Excluded from MVP

```text
accounts
cloud sync
public profiles
leaderboards
multiplayer
AI tutor
arbitrary external networking
remote SSH
Metasploit
Hydra
SQLMap
Aircrack-ng
packet injection
host filesystem access
real kernel manipulation
full Kali emulation
```

---

# 21. Scope Control Rule

A new feature may enter the MVP only if it satisfies at least one of:

1. required by an approved requirement;
2. required to resolve a technical blocker;
3. required to close a security issue;
4. required to make a core MVP flow usable.

Otherwise:

```text
move to post-MVP backlog
```

---

# 22. Work Breakdown Structure

## WBS 0 — Runtime Feasibility

```text
0.1 Browser capability checks
0.2 Cross-origin isolation
0.3 Wasmer browser initialization
0.4 Shell package pinning
0.5 STDIO
0.6 Filesystem
0.7 Pipes/redirection
0.8 Script execution
0.9 Reset
0.10 Fidelity report
```

---

# 23. WBS 1 — Foundation

```text
1.1 Repository initialization
1.2 React/Vite/TypeScript
1.3 Lint
1.4 Unit test framework
1.5 E2E framework
1.6 CI
1.7 Documentation folders
1.8 Import boundaries
```

---

# 24. WBS 2 — Terminal

```text
2.1 TerminalView
2.2 TerminalController
2.3 Resize
2.4 Focus
2.5 Output rendering
2.6 Cleanup
2.7 Mock runtime
2.8 Terminal tests
```

---

# 25. WBS 3 — Runtime Productionization

```text
3.1 ShellRuntime interface
3.2 RuntimeClient
3.3 Worker protocol
3.4 Wasmer adapter
3.5 Package resolver
3.6 Runtime errors
3.7 Runtime timeouts
3.8 Runtime tests
3.9 Security tests
```

---

# 26. WBS 4 — Content Engine

```text
4.1 YAML parsing
4.2 Zod schemas
4.3 Pack loader
4.4 Lab loader
4.5 Fixture loader
4.6 Concept loader
4.7 Cross-reference validation
4.8 Content registry
```

---

# 27. WBS 5 — Validation

```text
5.1 Validator registry
5.2 stdout validators
5.3 path validators
5.4 file-content validators
5.5 cwd validator
5.6 hash validator
5.7 structured feedback
5.8 alternative solution testing
```

---

# 28. WBS 6 — Reset

```text
6.1 Fixture baseline
6.2 Sandbox disposal
6.3 Sandbox recreation
6.4 Shell restart
6.5 Terminal reconnect
6.6 Determinism tests
```

---

# 29. WBS 7 — Persistence

```text
7.1 Dexie setup
7.2 settings repository
7.3 progress repository
7.4 session repository
7.5 mastery repository
7.6 content version repository
7.7 migrations
7.8 storage failure handling
```

---

# 30. WBS 8 — Mastery

```text
8.1 Mastery model
8.2 Mastery calculator
8.3 mastery states
8.4 weak-area detection
8.5 progress aggregation
8.6 recent-session aggregation
```

---

# 31. WBS 9 — Curriculum

```text
9.1 Concept definitions
9.2 20 labs
9.3 Fixtures
9.4 Hints
9.5 Validators
9.6 Reference solutions
9.7 Content tests
9.8 Fidelity review
```

---

# 32. WBS 10 — Product UI

```text
10.1 Training workspace
10.2 Results
10.3 Lab catalog
10.4 Dashboard
10.5 Mastery
10.6 Diagnostics
10.7 Settings
10.8 Accessibility
10.9 E2E flows
```

---

# 33. WBS 11 — Deployment and Security

```text
11.1 Cloudflare Pages
11.2 Headers
11.3 Production diagnostics
11.4 dependency review
11.5 network denial test
11.6 package pin verification
11.7 error hygiene
11.8 production E2E
```

---

# 34. WBS 12 — Release

```text
12.1 Full regression
12.2 Documentation freeze
12.3 Known limitations
12.4 Release notes
12.5 Version bump
12.6 Production deployment
12.7 Smoke test
12.8 Release tag
```

---

# 35. Milestone Structure

Recommended milestones:

```text
M0 Runtime Viability
M1 Engineering Foundation
M2 Interactive Shell
M3 Training Engine
M4 Persistent Learning
M5 Curriculum Complete
M6 Product Complete
M7 Production Ready
M8 MVP Released
```

---

# 36. M0 — Runtime Viability

Corresponds to:

```text
Phase 0
```

Exit:

runtime strategy proven.

---

# 37. M1 — Engineering Foundation

Corresponds to:

```text
Phase 1
```

Exit:

repository and CI stable.

---

# 38. M2 — Interactive Shell

Corresponds to:

```text
Phases 2–3
```

Exit:

real runtime connected through production architecture.

---

# 39. M3 — Training Engine

Corresponds to:

```text
Phases 4–6
```

Exit:

labs can load, validate, and reset.

---

# 40. M4 — Persistent Learning

Corresponds to:

```text
Phases 7–8
```

Exit:

progress and mastery persist.

---

# 41. M5 — Curriculum Complete

Corresponds to:

```text
Phase 9
```

Exit:

20 official labs pass content/runtime tests.

---

# 42. M6 — Product Complete

Corresponds to:

```text
Phase 10
```

Exit:

full learner workflow available.

---

# 43. M7 — Production Ready

Corresponds to:

```text
Phase 11
```

Exit:

secure deployment passes.

---

# 44. M8 — MVP Released

Corresponds to:

```text
Phase 12
```

Exit:

v0.1.0 released.

---

# 45. Scheduling Model

The SPMP uses dependency-based sequencing rather than fixed calendar dates.

Reason:

The runtime spike can materially change downstream scope.

A schedule should be created only after:

```text
Phase 0 passes
```

---

# 46. Relative Effort Model

Recommended sizing:

```text
XS  < 0.5 workday
S   0.5–1 day
M   1–3 days
L   3–5 days
XL  > 5 days
```

Any XL item should normally be decomposed before implementation.

---

# 47. Phase Effort Risk

Indicative relative effort:

| Phase | Relative Effort |
|---|---|
| 0 Runtime Spike | L |
| 1 Foundation | S/M |
| 2 Terminal | M |
| 3 Runtime | L |
| 4 Scenario Engine | M |
| 5 Validation | M/L |
| 6 Reset | M |
| 7 Persistence | M |
| 8 Mastery | M |
| 9 Curriculum | L |
| 10 UI | L |
| 11 Hardening | M/L |
| 12 Release | M |

These are planning categories, not delivery promises.

---

# 48. Branching Strategy

Primary branch:

```text
main
```

Feature branches:

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

---

# 49. Main Branch Rules

`main` should remain:

```text
buildable
tested
reviewable
```

Direct feature work on `main` is discouraged.

---

# 50. Branch Scope Rule

A branch should represent one bounded concern.

Bad:

```text
feat/build-everything
```

Good:

```text
feat/scenario-engine
```

---

# 51. Pull Request Policy

Every major phase should result in a bounded PR.

PR must include:

```text
summary
scope
requirement IDs
architecture impact
security impact
tests
evidence
known limitations
deferred work
```

---

# 52. Pull Request Size

Prefer reviewable changes.

If a PR contains unrelated:

```text
runtime
UI redesign
20 labs
database
```

it should be split.

---

# 53. Merge Criteria

A PR may merge when:

- scope matches branch purpose;
- required tests pass;
- lint passes;
- typecheck passes;
- build passes;
- documentation updated;
- no unresolved blocking review comment;
- no known critical security issue introduced.

---

# 54. Commit Policy

Commits should be logically grouped.

Examples:

```text
feat(runtime): add worker protocol
test(runtime): add stdio conformance
docs(runtime): record known limitations
```

Conventional Commits are recommended but not mandatory if repository policy differs.

---

# 55. Configuration Management

Configuration-controlled artifacts include:

```text
source code
package-lock.json
runtime package manifest
content packs
fixtures
schemas
fidelity registry
CI workflows
security headers
documentation
```

---

# 56. Version Control Requirements

All project artifacts required to reproduce the MVP must be committed except:

```text
build output
test output
local caches
local environment overrides
```

---

# 57. Dependency Management

Dependencies shall:

- be declared in `package.json`;
- be locked in `package-lock.json`;
- be reviewed before major upgrades;
- avoid unnecessary packages;
- be checked for licensing/security implications.

---

# 58. Runtime Package Management

WASIX/runtime packages require stronger controls.

Maintain:

```text
trusted runtime manifest
exact package versions
command provenance
fidelity test evidence
```

No learner-controlled package source.

---

# 59. Dependency Upgrade Rule

Before updating:

```text
@wasmer/sdk
shell package
core utilities package
```

rerun:

```text
runtime conformance
command fidelity
20-lab content tests
```

---

# 60. Change Management

Changes fall into:

```text
Minor
Moderate
Major
Emergency
```

---

# 61. Minor Change

Examples:

```text
typo
small UI polish
non-semantic docs correction
```

No architecture review required.

---

# 62. Moderate Change

Examples:

```text
new validator
new lab
new persistence field
new settings option
```

Requires:

- requirement impact check;
- tests;
- docs if behavior changes.

---

# 63. Major Change

Examples:

```text
runtime replacement
backend introduction
schema redesign
network capability
new authentication system
monorepo conversion
```

Requires:

```text
architecture review
scope review
security review
ADR
migration plan
```

---

# 64. Emergency Change

Examples:

```text
critical security fix
broken production runtime
data corruption
```

May bypass normal scheduling but not validation.

Emergency fixes still require:

```text
focused tests
documented reason
post-fix review
```

---

# 65. Scope Change Request

Any proposed MVP addition should document:

```text
request
reason
requirement affected
estimated effort
risk
dependencies
release impact
decision
```

---

# 66. Scope Change Decision

Possible decisions:

```text
ACCEPT MVP
DEFER POST-MVP
REJECT
REPLACE EXISTING SCOPE
```

---

# 67. Risk Management

Major project risks shall be tracked with:

```text
ID
description
probability
impact
mitigation
trigger
owner
status
```

---

# 68. Risk R-001 — Browser Runtime Incompatibility

Probability:

```text
Medium
```

Impact:

```text
Critical
```

Risk:

WASIX behavior may not support enough Linux command semantics.

Mitigation:

```text
Phase 0 spike
command fidelity matrix
runtime abstraction
alternative package evaluation
```

Trigger:

multiple P0 commands fail.

---

# 69. Risk R-002 — Reset Is Not Deterministic

Probability:

```text
Medium
```

Impact:

```text
High
```

Mitigation:

```text
sandbox recreation
fixture hashing
stress tests
```

---

# 70. Risk R-003 — Deployment Missing Cross-Origin Isolation

Probability:

```text
Medium
```

Impact:

```text
High
```

Mitigation:

```text
compatible static host
COOP/COEP
production diagnostics
E2E deployment test
```

---

# 71. Risk R-004 — Runtime Package Drift

Probability:

```text
Medium
```

Impact:

```text
High
```

Mitigation:

```text
version pinning
lockfile
fidelity regression
runtime manifest
```

---

# 72. Risk R-005 — Content Overfits One Command Sequence

Probability:

```text
Medium
```

Impact:

```text
Medium
```

Mitigation:

```text
outcome validation
multiple reference solutions
content review
```

---

# 73. Risk R-006 — Scope Creep Into Pentesting Suite

Probability:

```text
High
```

Impact:

```text
High
```

Mitigation:

```text
feature scope baseline
explicit exclusions
change control
```

---

# 74. Risk R-007 — Excessive Runtime Size

Probability:

```text
Medium
```

Impact:

```text
Medium
```

Mitigation:

```text
lazy loading
minimal package set
cache
bundle/runtime measurement
```

---

# 75. Risk R-008 — IndexedDB Failure

Probability:

```text
Low/Medium
```

Impact:

```text
Medium
```

Mitigation:

```text
storage diagnostics
typed repository errors
training can continue unsaved
retry
```

---

# 76. Risk R-009 — Browser Differences

Probability:

```text
Medium
```

Impact:

```text
Medium/High
```

Mitigation:

```text
supported-browser policy
capability detection
Playwright
diagnostics
```

---

# 77. Risk R-010 — Misleading Linux Fidelity

Probability:

```text
Medium
```

Impact:

```text
High
```

Mitigation:

```text
REAL/SIMULATED/NOT AVAILABLE
known-difference documentation
verified command matrix
```

---

# 78. Risk Review

Risks should be reviewed:

```text
at each milestone
before release
after runtime/dependency changes
```

---

# 79. Quality Management

Quality is defined by:

```text
correctness
determinism
security
maintainability
testability
usability
runtime transparency
```

---

# 80. Quality Gates

Final project commands:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:content
npm run build
npm run test:e2e
```

---

# 81. Code Quality

Required:

```text
strict TypeScript
bounded modules
typed errors
no unnecessary any
no silent promise failures
no stale debug code
clear ownership
```

---

# 82. Content Quality

Every official lab requires:

```text
schema
fixture
concepts
validators
reference solution
fidelity dependencies
reset test
```

---

# 83. Runtime Quality

Runtime quality requires:

```text
conformance suite
package pins
fidelity report
network-denial test
resource cleanup
```

---

# 84. Security Quality

Security requirements include:

```text
no host filesystem
no arbitrary networking
no arbitrary package URLs
no executable scenario content
validated worker protocol
synthetic credentials
production headers
```

---

# 85. Documentation Quality

Major behavior changes must update relevant docs.

Examples:

```text
runtime update
→ COMMAND_FIDELITY + KNOWN_LIMITATIONS

schema update
→ DATABASE_CONTENT_SCHEMA

architecture change
→ ADR + architecture docs
```

---

# 86. Verification Strategy

Verification levels:

```text
Unit
Integration
Runtime Conformance
Content
E2E
Manual Acceptance
```

---

# 87. Unit Testing

Targets:

```text
mastery
scoring
validators
schemas
state transitions
utility functions
```

---

# 88. Integration Testing

Targets:

```text
runtime adapter
worker protocol
Dexie repositories
fixture seeding
reset
lab completion
```

---

# 89. Runtime Conformance

Targets:

```text
shell start
stdin
stdout
stderr
filesystem
pipes
redirection
scripts
reset
network denial
```

---

# 90. Content Testing

Targets:

```text
schema
IDs
references
fidelity dependencies
reference solutions
fixtures
curriculum order
```

---

# 91. E2E Testing

Targets:

```text
first launch
compatibility
open lab
use terminal
hint
validation failure
validation success
persistence
mastery
diagnostics
```

---

# 92. Manual Acceptance

Required before v0.1.0 release.

Manual review should use a clean browser profile where possible.

---

# 93. Defect Management

Defects should be classified:

```text
Critical
High
Medium
Low
```

---

# 94. Critical Defect

Examples:

```text
host access
network escape
runtime unusable
data corruption
all labs blocked
```

Blocks release.

---

# 95. High Defect

Examples:

```text
reset nondeterministic
incorrect lab validation
major command fidelity mismatch
progress consistently lost
```

Normally blocks release.

---

# 96. Medium Defect

Examples:

```text
individual lab issue
UI accessibility issue
non-critical browser incompatibility
```

May block depending scope.

---

# 97. Low Defect

Examples:

```text
minor visual defect
copy issue
non-blocking metadata
```

May defer.

---

# 98. Defect Workflow

```text
Open
↓
Triaged
↓
In Progress
↓
Fixed
↓
Verified
↓
Closed
```

---

# 99. Issue Labels

Recommended:

```text
type:bug
type:feature
type:content
type:docs
type:security

area:runtime
area:terminal
area:content
area:persistence
area:ui
area:deployment

priority:critical
priority:high
priority:medium
priority:low
```

---

# 100. Documentation Management

Documentation is version-controlled with source.

Major documents:

```text
Requirements
Feature Scope
Architecture
Command Matrix
Curriculum
Repository Structure
Database/Content Schema
UI Design
MVP Phases
SPMP
SRS
SDD
Implementation Plan
Security Model
Deployment
Runtime Results
```

---

# 101. Documentation Baseline Rule

Once implementation starts, design changes must update the corresponding baseline document.

Do not let docs describe a system that no longer exists.

---

# 102. Configuration Items

The following are configuration-controlled:

```text
runtime SDK version
runtime packages
shell package
content pack version
lab versions
fixture versions
schema versions
database version
deployment headers
CI
```

---

# 103. Release Management

Recommended release model:

```text
0.1.0 MVP
0.2.x curriculum expansion
0.3.x adaptive practice
0.4.x incident/exam
1.0 stable training platform
```

---

# 104. Semantic Versioning

Use:

```text
MAJOR.MINOR.PATCH
```

Before 1.0:

```text
0.MINOR.PATCH
```

Breaking changes may occur but must be documented.

---

# 105. Release Branch

Recommended:

```text
release/0.1.0
```

Purpose:

```text
stabilization
documentation freeze
final fixes
release validation
```

No feature expansion.

---

# 106. Release Checklist

Before production release:

- [ ] `npm ci` passes
- [ ] lint passes
- [ ] typecheck passes
- [ ] unit/integration tests pass
- [ ] content tests pass
- [ ] build passes
- [ ] E2E passes
- [ ] 20 labs stable
- [ ] runtime fidelity current
- [ ] reset deterministic
- [ ] progress persistence verified
- [ ] diagnostics verified
- [ ] network denied
- [ ] production isolation verified
- [ ] known limitations updated
- [ ] README updated
- [ ] version updated
- [ ] release notes written

---

# 107. Release Notes

Include:

```text
version
date
major capabilities
known limitations
runtime versions
content pack version
breaking changes
security-relevant changes
```

---

# 108. Rollback Strategy

Because MVP is statically hosted, rollback should support:

```text
redeploy prior known-good build
```

Persistence migrations require special caution.

If a database migration cannot be reversed safely:

```text
forward fix
```

may be required.

---

# 109. Build Reproducibility

Use:

```text
package-lock.json
exact runtime package pins
CI build
documented Node version
```

---

# 110. Environment Management

Environments:

```text
Local Development
Preview
Production
```

---

# 111. Local Development

Requirements:

```text
supported Node
npm ci
cross-origin headers
supported browser
```

---

# 112. Preview Environment

Used for:

```text
PR review
UI review
runtime smoke testing
```

Must use production-like headers if runtime is tested.

---

# 113. Production

Must provide:

```text
HTTPS
COOP
COEP
security headers
stable asset hosting
```

---

# 114. Security Review Points

Mandatory review before:

```text
runtime merge
network-related changes
content import support
new package resolution behavior
deployment release
```

---

# 115. Architecture Review Points

Mandatory when:

```text
runtime changes
backend proposed
schema breaks
monorepo proposed
sync proposed
new execution model introduced
```

---

# 116. Project Metrics

Useful metrics:

```text
phase completion
open critical/high defects
test pass rate
content validation pass rate
stable lab count
runtime fidelity coverage
build status
```

Avoid vanity metrics.

---

# 117. Runtime Fidelity Coverage

Track:

```text
P0 verified / total P0
P1 verified / required P1
```

Example:

```text
P0: 24 / 24 verified
P1: 11 / 14 verified
```

---

# 118. Curriculum Coverage

Track:

```text
stable labs / 20 MVP target
reference solutions / stable labs
reset tests / stable labs
```

---

# 119. Release Readiness Dashboard

Recommended summary:

```text
Runtime          PASS
Terminal         PASS
Validation       PASS
Reset            PASS
Persistence      PASS
20 Labs          PASS
UI               PASS
Security         PASS
Deployment       PASS
Docs             PASS
```

Any critical FAIL blocks release.

---

# 120. Communication Model

For a solo/small project, GitHub remains the primary project record.

Use:

```text
Issues
PRs
Milestones
ADRs
Documentation
```

Avoid important architecture decisions existing only in chat or local notes.

---

# 121. Decision Recording

Major technical decisions use ADRs.

Product-scope changes update:

```text
FEATURE_SCOPE.md
```

Requirement changes update:

```text
REQUIREMENTS.md
```

---

# 122. Project Backlog

Backlog categories:

```text
MVP
Post-MVP
Research
Technical Debt
Content Expansion
Security
```

---

# 123. Technical Debt

Technical debt must be explicit.

Example issue:

```text
Replace temporary runtime event adapter with typed stream abstraction.
```

Do not hide debt inside untracked TODOs.

---

# 124. Stop Conditions

Implementation should stop and escalate when:

```text
runtime core fails
security boundary cannot be maintained
reset cannot be made deterministic
content validation is fundamentally unreliable
production isolation unavailable
```

Do not compensate for foundational failure with UI polish.

---

# 125. Project Constraints

The MVP operates under:

```text
browser runtime limitations
no backend
no arbitrary networking
no host filesystem
static hosting
local persistence
single-package repository
```

---

# 126. Assumptions

The plan assumes:

- modern desktop browser;
- WebAssembly availability;
- worker support;
- cross-origin isolation deployable;
- selected WASIX packages remain available;
- IndexedDB available in supported environments.

Phase 0 and diagnostics validate these assumptions.

---

# 127. Deliverable Inventory

## Planning/Design

```text
Requirements
Feature Scope
Full Architecture
Command Support Matrix
Curriculum
Repository Structure
Database/Content Schema
UI Design
MVP Phases
SPMP
SRS
SDD
Implementation Plan
Coding-Agent Prompt
```

---

# 128. Engineering Deliverables

```text
source code
runtime adapter
terminal subsystem
content engine
validators
reset engine
persistence
mastery
20 labs
tests
CI
deployment configuration
```

---

# 129. Runtime Deliverables

```text
runtime package manifest
runtime spike report
command fidelity report
known limitations
conformance tests
```

---

# 130. Content Deliverables

```text
Linux Foundations pack
20 lab definitions
20 fixture sets
concept registry
reference solutions
content tests
```

---

# 131. Release Deliverables

```text
v0.1.0 build
production deployment
release notes
tag
known limitations
validated documentation
```

---

# 132. Acceptance Authority

The project owner accepts:

```text
scope
MVP behavior
curriculum
release
```

The technical lead accepts:

```text
architecture
runtime
quality gates
technical readiness
```

Where the same person fills both roles, both perspectives must still be evaluated.

---

# 133. SPMP Compliance Checklist

The implementation process shall follow:

- [ ] phase gates
- [ ] bounded branches
- [ ] bounded PRs
- [ ] CI
- [ ] runtime spike first
- [ ] command fidelity evidence
- [ ] content tests
- [ ] deterministic reset
- [ ] risk review
- [ ] configuration control
- [ ] change control
- [ ] release checklist
- [ ] known limitations
- [ ] documentation synchronization

---

# 134. Final Management Decision

SHELLGROUND will be managed as a:

```text
risk-first
incremental
test-gated
configuration-controlled
documentation-driven
```

software project.

The project shall prioritize:

```text
runtime correctness
training correctness
security boundaries
determinism
maintainability
```

over:

```text
feature count
visual novelty
scope expansion
```

The primary management rule is:

> **A downstream feature may not conceal an unresolved upstream technical risk.**

---

# 135. Next Document

The next document is:

```text
10B. SHELLGROUND SRS
```

The SRS will formalize:

- system purpose;
- product perspective;
- functional requirements;
- external interface requirements;
- data requirements;
- security requirements;
- performance requirements;
- usability requirements;
- constraints;
- assumptions;
- acceptance criteria;
- traceability.

It will describe **what the system shall do**, while this SPMP defines **how the project is managed**.
