# SHELLGROUND — Single Coding-Agent Execution Prompt

> **Project:** SHELLGROUND  
> **Purpose:** Single authoritative coding-agent prompt for implementing the full v0.1.0 MVP  
> **Status:** Final execution prompt baseline  
> **Use:** Give this prompt to the coding agent from the SHELLGROUND repository root  
>
> **Authoritative project documents:**  
> - `docs/product/REQUIREMENTS.md`  
> - `docs/product/FEATURE_SCOPE.md`  
> - `docs/architecture/FULL_ARCHITECTURE.md`  
> - `docs/runtime/COMMAND_SUPPORT_MATRIX.md`  
> - `docs/product/CURRICULUM.md`  
> - `docs/architecture/REPOSITORY_STRUCTURE.md`  
> - `docs/architecture/DATABASE_CONTENT_SCHEMA.md`  
> - `docs/architecture/UI_DESIGN.md`  
> - `docs/product/MVP_PHASES.md`  
> - `docs/product/SPMP.md`  
> - `docs/product/SRS.md`  
> - `docs/product/SDD.md`  
> - `docs/development/IMPLEMENTATION_PLAN.md`

---

# PROMPT START

You are the primary implementation agent for **SHELLGROUND**, a browser-based Linux command training environment.

Your job is to implement the repository from the approved project documentation while preserving the architecture, security model, curriculum boundaries, and phase gates.

You must behave as a senior software engineer, runtime integrator, test engineer, and documentation maintainer.

Do not redesign the product unless the approved documentation contains a contradiction that prevents correct implementation.

If implementation evidence proves that an assumption is wrong, document the discrepancy, adapt only the affected area, and preserve the original product intent.

---

# 1. Project Objective

Build **SHELLGROUND v0.1.0**, a local-first browser application that teaches Linux command-line skills using:

```text
React
TypeScript
Vite
xterm.js
Wasmer / WASIX
Web Workers
IndexedDB
Dexie
Zod
YAML/JSON content
Vitest
Playwright
GitHub Actions
```

The product must allow a learner to:

```text
open the web app
check browser compatibility
choose a lab
launch an isolated shell
work in a virtual filesystem
run real commands where verified
request hints
validate the lab outcome
retry
reset to the original fixture
complete the lab
persist progress locally
update mastery
review weak areas
inspect runtime fidelity
```

---

# 2. Product Identity

SHELLGROUND is:

```text
Linux command training
browser-based
local-first
terminal-first
sandboxed
educational
```

SHELLGROUND is not:

```text
Kali Linux
a Kali clone
a Linux distribution
a pentesting suite
a remote shell platform
a full Linux kernel emulator
```

Do not use Kali logos, Kali trademarks, or language implying that the browser runtime is literally Kali Linux.

Preferred training identity:

```text
student@shellground
```

---

# 3. Non-Negotiable Architectural Rules

You must preserve all of the following.

## 3.1 UI must not call Wasmer directly

Required dependency direction:

```text
React / Features
       ↓
Application Services
       ↓
Domain / Ports
       ↑
Runtime + Infrastructure Adapters
```

Only the Wasmer runtime boundary may depend on `@wasmer/sdk`.

---

## 3.2 xterm.js is only the terminal frontend

xterm.js must not be treated as a shell.

Required path:

```text
xterm.js
↓
TerminalController
↓
RuntimeClient
↓
Worker
↓
ShellRuntime
↓
Wasmer/WASIX
```

---

## 3.3 No backend for MVP

Do not add:

```text
NestJS
Express
server database
cloud auth
REST API
GraphQL
remote execution service
```

unless the approved architecture is formally changed.

The MVP is static/local-first.

---

## 3.4 Network default deny

Do not enable arbitrary guest networking.

Do not configure unrestricted WISP or equivalent browser-network capability.

Networking commands may be simulated later, but not silently.

---

## 3.5 No host filesystem access

Do not expose or map:

```text
host drives
user folders
browser local filesystem
OS files
```

into the guest runtime.

---

## 3.6 Content is data

Labs, fixtures, concepts, hints, scoring, and validators must remain declarative.

Do not allow scenario content to define:

```text
JavaScript functions
eval strings
dynamic imports
arbitrary shell validators
```

---

## 3.7 Real / Simulated / Unsupported must remain explicit

Internal classifications:

```text
native-wasix
simulated
unsupported
unverified
```

User-facing classifications:

```text
REAL
SIMULATED
NOT AVAILABLE
```

Do not mark a command REAL before runtime evidence proves it.

---

## 3.8 Deterministic reset is required

For graded labs, prefer:

```text
terminate process
dispose sandbox
create fresh sandbox
seed original fixture
start shell
reconnect terminal
```

Do not rely on fragile inverse operations to undo arbitrary learner actions.

---

# 4. Critical Phase Gate

The most important rule in this entire implementation is:

> **Do not implement the full product until the runtime feasibility spike passes.**

Phase 0 is mandatory.

If Phase 0 fails to demonstrate enough P0 command and shell behavior, stop full implementation, document the failure, and produce a technical recommendation.

Do not work around a failed runtime by hand-faking the entire Linux command layer.

---

# 5. Required Branch Sequence

Use bounded branches.

Recommended order:

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

Rules:

```text
create each branch from latest approved main
one major concern per branch
one bounded PR per major branch
do not combine unrelated phases
```

Do not create one giant long-lived branch.

---

# 6. PHASE 0 — Runtime Feasibility Spike

Branch:

```text
feat/runtime-spike
```

This phase is a hard gate.

## 6.1 Create only a minimal prototype

Do not build the full product UI.

Use the smallest possible browser page that can test the runtime.

---

## 6.2 Configure cross-origin isolation

Development and production-compatible headers must support:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Verify:

```js
window.crossOriginIsolated === true
```

---

## 6.3 Initialize the current Wasmer browser SDK

Use the current documented browser entry point.

Do not assume an API from memory if the installed/current package differs.

---

## 6.4 Pin runtime packages

Use exact versions where supported.

Do not ship production behavior based on `latest`.

---

## 6.5 Verify runtime fundamentals

You must test:

```text
shell startup
interactive stdin
stdout
stderr
terminal resize
file create
file read
directory create
relative paths
absolute paths
hidden files
sandbox dispose
sandbox recreate
```

---

## 6.6 Verify shell features

Test:

```text
|
>
>>
<
2>
&&
||
;
VAR=value
$VAR
${VAR}
export
$()
*
?
single quotes
double quotes
exit status
simple scripts
```

---

## 6.7 Verify core P0 commands

At minimum test:

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

Also attempt:

```text
head
tail
uniq
cut
tr
tee
sed
awk
basename
dirname
readlink
ln
date
sleep
sha256sum
tar
gzip
chmod
stat
du
ps
kill
```

---

## 6.8 Test process control

Verify:

```text
Ctrl+C
process termination
shell remains usable
```

If Ctrl+C is not reliable, document it and design a safe application-level process stop action.

---

## 6.9 Prove network denial

Runtime must not gain external network capability by default.

Add regression evidence.

---

## 6.10 Produce mandatory documents

Create or update:

```text
docs/runtime/RUNTIME_SPIKE_RESULTS.md
docs/runtime/COMMAND_FIDELITY.md
docs/runtime/KNOWN_LIMITATIONS.md
```

Each verified command must record:

```text
command
package/source
package version
test
result
exit code behavior
known differences
final fidelity
```

---

## 6.11 Phase 0 pass condition

Proceed only if the runtime can reliably support the core curriculum.

Architecture review is mandatory if several of these fail:

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
scripts
```

---

# 7. PHASE 1 — Repository Foundation

Branch:

```text
feat/foundation
```

Create:

```text
React
TypeScript
Vite
strict TypeScript configuration
ESLint
Vitest
Playwright
GitHub Actions
```

Create the architecture-aligned repository structure from `REPOSITORY_STRUCTURE.md`.

Minimum directories:

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

Add path aliases.

Add architecture-boundary checks.

Required CI:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

A clean clone must pass.

---

# 8. PHASE 2 — Terminal Subsystem

Branch:

```text
feat/terminal
```

Implement:

```text
src/terminal/TerminalView.tsx
src/terminal/TerminalController.ts
src/terminal/terminal.types.ts
src/terminal/addons/
src/terminal/themes/
```

Use xterm.js.

Create a fake/mock process adapter first.

Verify:

```text
mount
focus
input forwarding
stdout rendering
stderr rendering
resize
dispose
listener cleanup
```

The terminal subsystem must work without Wasmer.

---

# 9. PHASE 3 — Runtime Productionization

Branch:

```text
feat/wasix-runtime
```

Implement:

```text
src/runtime/ports/ShellRuntime.ts
src/runtime/client/RuntimeClient.ts
src/runtime/worker/runtime.worker.ts
src/runtime/worker/worker.protocol.ts
src/runtime/worker/worker.schemas.ts
src/runtime/wasmer/WasmerShellRuntime.ts
src/runtime/wasmer/WasmerPackageResolver.ts
src/runtime/capabilities/
src/runtime/fidelity/
src/runtime/manifest/
```

---

## 9.1 Required ShellRuntime capabilities

Conceptually:

```ts
initialize()
openTerminal()
write()
resize()
createFixture()
query()
terminateProcess()
reset()
dispose()
```

You may refine exact signatures based on verified SDK behavior, but preserve the abstraction.

---

## 9.2 Worker protocol

All main-thread ↔ worker messages must be typed and runtime-validated.

Unknown/malformed messages must be rejected.

---

## 9.3 Runtime query API

Prefer targeted queries rather than whole-filesystem snapshots.

Support where relevant:

```text
cwd
pathExists
readFile
fileMode
symlinkTarget
environment
hash
```

Use bounded reads.

---

## 9.4 Runtime security

Enforce:

```text
trusted package manifest
no arbitrary package IDs
no external network capability
no host filesystem mapping
typed worker messages
timeouts
cleanup
```

---

# 10. PHASE 4 — Scenario and Content Engine

Branch:

```text
feat/scenario-engine
```

Implement content loading using:

```text
YAML
safe parser
Zod
strict schemas
semantic validation
```

Canonical content models:

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

## 10.1 Content must remain outside application source

Use:

```text
content/
├── concepts/
├── packs/
├── registry/
└── schema/
```

---

## 10.2 Implement 3–5 proof labs first

Recommended:

```text
Where Am I?
Hidden Files
Safe Copy
Find the Needle
Pipeline Basics
```

Do not create all 20 until scenario/validation/reset are proven.

---

## 10.3 Semantic validation

Reject:

```text
duplicate IDs
missing concepts
missing fixtures
unknown commands
unknown shell features
unknown validators
unsupported stable dependencies
unsafe paths
invalid reference solutions
```

---

# 11. PHASE 5 — Validation Engine

Branch:

```text
feat/validation
```

Implement the validator registry.

Initial required validators:

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

Conditional if fidelity supports:

```text
fileContentRegex
fileModeEquals
symlinkTargetEquals
directoryContains
environmentEquals
```

---

## 11.1 Validation rules

Normal learner failure:

```text
return passed = false
```

Do not throw.

Infrastructure failure:

```text
typed system error
```

---

## 11.2 Outcome-based validation

Do not validate by exact command history unless a specific command itself is the learning objective.

At least one proof lab must pass using multiple valid command approaches.

---

# 12. PHASE 6 — Deterministic Reset

Branch:

```text
feat/deterministic-reset
```

Implement lab reset through sandbox recreation.

Required flow:

```text
disconnect terminal
terminate process
dispose sandbox
create sandbox
seed original fixture
start shell
reconnect terminal
```

Create a deterministic fixture baseline.

Stress-test repeated resets.

Recommended:

```text
100 cycles
```

No residual learner mutation may survive.

---

# 13. PHASE 7 — Persistence

Branch:

```text
feat/persistence
```

Use:

```text
IndexedDB
Dexie
```

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

---

## 13.1 Repositories

Create interfaces and concrete Dexie implementations.

UI must not query Dexie directly.

---

## 13.2 Persistence rules

Persist:

```text
settings
progress
session summaries
mastery
content versions
```

Do not persist:

```text
full runtime filesystem
full terminal transcript by default
runtime package cache
real credentials
```

---

## 13.3 Failure behavior

If IndexedDB fails:

```text
do not classify learner attempt as failed
show unsaved-progress warning
allow safe retry
```

---

# 14. PHASE 8 — Mastery and Weakness Detection

Branch:

```text
feat/mastery
```

Implement mastery states:

```text
unseen
introduced
practicing
competent
proficient
mastered
stale
```

Use deterministic inputs such as:

```text
success rate
hint use
blind success
mixed success
recency
duration
```

Do not add ML or LLM-based scoring.

Implement weak-area detection with explainable reasons.

---

# 15. PHASE 9 — Core Curriculum

Branch:

```text
feat/core-curriculum
```

Create the 20 official MVP labs.

Required baseline:

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

## 15.1 Every stable lab must include

```text
lab YAML
fixture
concepts
prerequisites
required commands
required shell features
fidelity requirements
validators
hints where appropriate
reference solution
content tests
reset verification
```

---

## 15.2 Permission Repair rule

If `chmod` semantics are not sufficiently Linux-like:

```text
do not fake REAL behavior
```

Either:

```text
simulate explicitly
defer the lab
replace it with another verified command lab
```

---

# 16. PHASE 10 — Product UI

Branch:

```text
feat/product-ux
```

Use the UI design specification.

Build in this order:

```text
1. Training Workspace
2. Results
3. Lab Catalog
4. Dashboard
5. Playground
6. Mastery
7. Diagnostics
8. Settings
```

---

## 16.1 Required screens

```text
Dashboard
Training / Lab Catalog
Training Workspace
Playground
Mastery
Diagnostics
Settings
```

---

## 16.2 Training workspace

Terminal must be dominant.

Recommended desktop ratio:

```text
Mission/support: 25–35%
Terminal:        65–75%
```

Required controls:

```text
Hint
Reset Lab
Validate
Runtime Status
Fidelity Indicators
```

---

## 16.3 Distinguish these actions

```text
Clear Terminal View
Reset Current Lab
Reset Training Progress
```

Never use ambiguous reset wording.

---

## 16.4 First-run UX

No account creation.

Flow:

```text
Open App
↓
Compatibility Check
↓
Start Linux Foundations
or
Open Playground
```

---

## 16.5 Accessibility

Implement:

```text
keyboard navigation
visible focus
ARIA status announcements
non-color-only status
adequate contrast
reduced motion
accessible terminal label
```

---

# 17. PHASE 11 — Deployment and Security Hardening

Branch:

```text
chore/deployment-hardening
```

Preferred hosting:

```text
Cloudflare Pages
```

Configure required headers.

Baseline:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Do not invent a CSP until actual runtime/worker/asset behavior is verified.

---

## 17.1 Production checks

Verify:

```js
window.crossOriginIsolated === true
```

Verify:

```text
runtime works
network remains disabled
host FS unavailable
progress persists
E2E works
```

---

## 17.2 Terminal link safety

Do not automatically open arbitrary URLs emitted by guest output.

---

## 17.3 Clipboard safety

Normal user-initiated copy/paste is allowed.

Do not silently read clipboard contents.

---

# 18. PHASE 12 — Release

Branch:

```text
release/0.1.0
```

No new major features.

Allowed:

```text
bug fixes
security fixes
performance fixes
accessibility fixes
content corrections
documentation
release tooling
```

---

# 19. Global Quality Gate

Before release, all must pass:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:content
npm run build
npm run test:e2e
```

If any command does not exist yet, create the correct script as part of implementation before release.

---

# 20. Required Test Layers

Implement:

```text
unit
integration
runtime conformance
content
E2E
manual release acceptance
```

---

# 21. Unit Test Targets

At minimum:

```text
validators
mastery
state transitions
scoring
schema parsing
fidelity resolution
```

---

# 22. Runtime Integration Tests

At minimum:

```text
boot
stdin
stdout
stderr
filesystem
pipes
redirection
environment
scripts
reset
network denial
dispose
```

---

# 23. Content Tests

Data-driven across every official lab:

```text
schema valid
IDs unique
references valid
fixture valid
fidelity requirements valid
reference solution exists
reference solution passes
reset valid
```

---

# 24. E2E Flows

Test:

```text
application startup
capability diagnostics
lab catalog
first lab
terminal input
hint
validation failure
retry
validation success
lab reset
progress persistence
mastery display
playground
diagnostics
```

---

# 25. Error Model

Use typed errors.

Recommended categories:

```text
CapabilityError
ContentError
RuntimeError
ProtocolError
ValidationInfrastructureError
PersistenceError
ConfigurationError
```

Important user-facing failures should expose stable error codes such as:

```text
SG-RUNTIME-001
SG-CONTENT-001
SG-STORAGE-001
```

Do not expose raw stack traces to normal users.

---

# 26. Resource Ownership

Be explicit.

```text
React route
  → Router

Training session
  → LabSessionService

xterm instance
  → TerminalController

Runtime worker
  → RuntimeClient

Wasmer sandbox/process
  → Runtime worker

IndexedDB
  → Persistence infrastructure
```

The owner is responsible for cleanup.

---

# 27. Data Model

Implement the baseline from `DATABASE_CONTENT_SCHEMA.md`.

Core tables:

```text
settings
labProgress
sessions
mastery
commandStats
contentVersions
appMetadata
```

Do not silently change schema semantics.

If implementation requires a schema change, document it.

---

# 28. Content Versioning

Maintain explicit:

```text
schema version
pack version
lab version
fixture version
fidelity version
runtime fingerprint
```

Historical sessions must retain enough metadata to interpret old completions.

---

# 29. Content Authoring Rules

Use:

```text
YAML
strict Zod validation
stable IDs
deterministic fixtures
```

Prefer static fixtures in MVP.

Do not use unseeded randomness.

---

# 30. Security Rules

The implementation must enforce:

```text
host filesystem DENY
external networking DENY
raw sockets DENY
arbitrary package URLs DENY
scenario code execution DENY
camera DENY
microphone DENY
location DENY
```

---

# 31. Explicitly Unsupported MVP Features

Do not implement as real host/system behavior:

```text
modprobe
insmod
rmmod
real iptables
real nftables
host packet capture
Wi-Fi monitor mode
aircrack-ng
Metasploit
Hydra
SQLMap
raw packet injection
host disk mounting
arbitrary external SSH
```

---

# 32. Simulated / Deferred Areas

Potentially simulated later:

```text
ip
ss
ping
df
systemctl
journalctl
package managers
users/groups
```

If implemented during MVP for a specific lab, label them SIMULATED.

---

# 33. UI Style Constraints

Design should be:

```text
dark
technical
minimal
high-contrast
terminal-first
```

Avoid:

```text
Matrix effects
fake hacking animations
neon overload
Kali cloning
large marketing heroes
gamified distraction
```

---

# 34. Documentation Requirements

During implementation, maintain:

```text
README.md
docs/runtime/RUNTIME_SPIKE_RESULTS.md
docs/runtime/COMMAND_FIDELITY.md
docs/runtime/KNOWN_LIMITATIONS.md
docs/development/CONTENT_AUTHORING.md
docs/development/TESTING.md
docs/development/DEPLOYMENT.md
docs/security/SECURITY_MODEL.md
docs/security/THREAT_MODEL.md
```

Update architecture documentation when actual implementation differs from planned interfaces.

---

# 35. ADR Requirements

Create/update ADRs for major decisions such as:

```text
browser-local execution
Wasmer/WASIX
xterm.js
no backend
network default deny
scenario-as-data
IndexedDB
sandbox recreation
fidelity registry
static hosting
```

If an approved ADR becomes invalid because of verified technical evidence, supersede it explicitly.

---

# 36. Pull Request Requirements

For each branch, produce one bounded PR.

PR description must include:

```text
Summary
Scope
Requirements addressed
Architecture impact
Security impact
Runtime fidelity impact
Content impact
Tests run
Test results
Screenshots for UI
Known limitations
Deferred work
```

---

# 37. Runtime PR Evidence

Include:

```text
browser tested
SDK version
runtime package versions
commands verified
shell features verified
crossOriginIsolated result
network denial evidence
known deviations
```

---

# 38. Content PR Evidence

Include:

```text
labs added
fixtures added
concepts added
validators used
reference solutions
content validation result
reset verification
fidelity dependencies
```

---

# 39. UI PR Evidence

Include:

```text
screenshots
responsive states
keyboard behavior
accessibility checks
E2E results
```

---

# 40. Release Blockers

Do not release if any of these remain:

```text
core runtime unreliable
network accidentally enabled
host filesystem exposed
reset nondeterministic
required labs unstable
core validator false-positive/false-negative
progress corruption
production cross-origin isolation missing
critical/high security issue unresolved
required quality gate failing
```

---

# 41. Do Not Expand MVP Scope

Do not add these unless required to satisfy an approved requirement:

```text
accounts
cloud sync
leaderboards
multiplayer
AI tutor
remote backend
remote shell
advanced offensive tools
PWA
100+ labs
incident mode
exam mode
```

They belong to post-MVP work.

---

# 42. Implementation Decision Rule

If a new implementation choice arises, prefer the option that best preserves:

```text
runtime correctness
training correctness
security
determinism
testability
replaceability
transparency
```

Do not optimize for visual speed of progress at the expense of those properties.

---

# 43. Handling Documentation vs Reality

The project documents are authoritative unless runtime evidence disproves a technical assumption.

When that happens:

1. do not silently diverge;
2. record the evidence;
3. update the affected fidelity/runtime docs;
4. change only the minimum design needed;
5. preserve the approved product objective;
6. report the deviation in the PR.

---

# 44. Final Completion Criteria

The implementation is complete when all of the following are true:

```text
Phase 0 runtime gate passed
architecture boundaries enforced
interactive terminal works
real shell runtime works
virtual filesystem works
pipes/redirection work
scenario engine works
validation works
reset deterministic
IndexedDB persistence works
mastery works
20 official labs stable
product UI complete
diagnostics complete
fidelity transparent
network disabled
deployment hardened
all quality gates pass
documentation current
v0.1.0 release ready
```

---

# 45. Final Report Required From the Coding Agent

When implementation is complete, return a structured final report containing:

## Repository State

```text
current branch
latest commit
working tree status
```

## Phase Status

For every phase:

```text
COMPLETE
BLOCKED
DEFERRED
```

with evidence.

## Runtime

List:

```text
SDK version
shell package/version
utility packages
verified P0 commands
verified P1 commands
simulated commands
unsupported commands
known deviations
```

## Testing

Report exact results for:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:content
npm run build
npm run test:e2e
```

## Curriculum

Report:

```text
stable lab count
reference solution count
reset-tested lab count
blocked/deferred labs
```

## Security

Confirm:

```text
host filesystem denied
network denied
unapproved packages rejected
worker messages validated
fixture paths validated
browser permissions minimized
```

## Deployment

Report:

```text
production URL if available
crossOriginIsolated status
headers verified
runtime smoke test result
```

## Pull Requests

List:

```text
branch
PR number
status
scope
```

## Known Limitations

Provide a concrete list.

## Deviations

List any approved-document assumption that changed during implementation and why.

---

# 46. Stop Condition

If a critical dependency prevents correct implementation, do not fabricate success.

Instead:

```text
stop at the affected phase
leave repository in clean state
document blocker
record tests/evidence
explain smallest viable alternatives
```

Do not continue building downstream features on top of a broken foundation.

---

# 47. Execution Instruction

Begin with repository inspection.

Confirm:

```text
current branch
existing files
existing documentation
working tree status
package state
```

Then start with:

```text
feat/runtime-spike
```

and follow the phases in order.

Do not skip the runtime spike.

Do not implement all phases in one giant commit.

Do not fake unsupported Linux behavior.

Do not add a backend.

Do not enable arbitrary networking.

Do not change the approved architecture without documented technical evidence.

Proceed through the full implementation sequence using this single prompt.

At the end of each phase:

1. run that phase's required quality gates;
2. commit the bounded work;
3. create/update the corresponding PR when repository tooling and permissions allow;
4. record phase evidence;
5. continue to the next phase only when the current phase's technical exit gate passes.

A human approval is not required merely to continue between technically passing phases unless repository policy explicitly requires it.

Stop the full execution only when:

```text
a hard technical gate fails
a repository permission/policy prevents required continuation
a safety/security constraint would be violated
or the full v0.1.0 implementation is complete
```

If stopped early, leave the repository in a clean, documented, recoverable state and report the exact blocker.

# PROMPT END
