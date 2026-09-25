# SHELLGROUND — Repository Structure Specification

> **Document:** Repository Structure Specification  
> **Project:** SHELLGROUND  
> **Sequence:** 6 of 13  
> **Depends on:**  
> - `SHELLGROUND_REQUIREMENTS.md`  
> - `SHELLGROUND_FEATURE_SCOPE.md`  
> - `SHELLGROUND_FULL_ARCHITECTURE.md`  
> - `SHELLGROUND_COMMAND_SUPPORT_MATRIX.md`  
> - `SHELLGROUND_CURRICULUM.md`  
>
> **Status:** Draft Repository Baseline  
> **Purpose:** Define the concrete source-tree organization, module boundaries, naming conventions, import rules, content layout, test layout, documentation layout, and configuration structure for the SHELLGROUND repository.

---

# 1. Repository Objective

The repository must make the architecture visible in the filesystem.

The codebase should make it difficult to accidentally:

- couple React components directly to Wasmer;
- mix runtime code with curriculum content;
- mix IndexedDB infrastructure with domain rules;
- execute scenario content as code;
- scatter validators throughout UI components;
- hide simulation logic inside unrelated modules;
- create circular dependencies;
- bypass runtime abstraction;
- bypass content validation.

The repository structure must support:

```text
clarity
modularity
testability
runtime isolation
content extensibility
curriculum growth
security review
bounded pull requests
```

---

# 2. Repository Type

SHELLGROUND should begin as a **single application repository**.

Recommended repository name:

```text
SHELLGROUND
```

Recommended GitHub slug:

```text
shellground
```

A monorepo is not required for the MVP.

The repository shall contain:

```text
web application
training content
runtime integration
tests
documentation
CI/CD configuration
```

---

# 3. Package Manager

Recommended:

```text
npm
```

Reason:

- straightforward Vite integration;
- predictable `package-lock.json`;
- broad ecosystem support;
- sufficient for a single-package repository.

Required install mode in CI:

```bash
npm ci
```

The project shall commit:

```text
package-lock.json
```

---

# 4. Root Repository Layout

Recommended baseline:

```text
shellground/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│
├── content/
│   ├── concepts/
│   ├── packs/
│   ├── registry/
│   └── schema/
│
├── docs/
│   ├── adr/
│   ├── architecture/
│   ├── development/
│   ├── product/
│   ├── runtime/
│   └── security/
│
├── public/
│   ├── icons/
│   └── _headers
│
├── scripts/
│   ├── content/
│   ├── runtime/
│   └── verification/
│
├── src/
│   ├── app/
│   ├── application/
│   ├── domain/
│   ├── features/
│   ├── infrastructure/
│   ├── runtime/
│   ├── terminal/
│   ├── shared/
│   └── styles/
│
├── tests/
│   ├── content/
│   ├── e2e/
│   ├── fixtures/
│   ├── integration/
│   └── unit/
│
├── .editorconfig
├── .gitignore
├── .nvmrc
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

# 5. Root Folder Responsibilities

| Folder | Responsibility |
|---|---|
| `.github/` | GitHub workflows, issue templates, PR template |
| `content/` | Declarative curriculum and lab content |
| `docs/` | Architecture, product, runtime, security, and dev docs |
| `public/` | Static public assets and hosting configuration |
| `scripts/` | Build-time and verification tooling |
| `src/` | Application source code |
| `tests/` | Cross-cutting tests not colocated with source |
| root configs | Build, lint, typecheck, testing, package management |

---

# 6. `src/` Design Principle

The `src/` directory should reflect architectural layers.

Recommended:

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

This prevents the common anti-pattern:

```text
src/
├── components/
├── hooks/
├── utils/
└── services/
```

where unrelated concerns eventually become mixed together.

---

# 7. `src/app/`

Purpose:

Application composition and framework bootstrapping.

Recommended structure:

```text
src/app/
├── App.tsx
├── main.tsx
├── providers/
│   ├── AppProviders.tsx
│   ├── RuntimeProvider.tsx
│   └── ThemeProvider.tsx
├── router/
│   ├── routes.tsx
│   └── route-paths.ts
├── startup/
│   ├── bootstrap.ts
│   └── capability-gate.ts
└── config/
    ├── app-config.ts
    └── env.ts
```

---

# 8. `app/` Responsibilities

Allowed:

- React root;
- route composition;
- top-level providers;
- environment parsing;
- application bootstrap;
- dependency wiring.

Not allowed:

- lab validator logic;
- Wasmer SDK details;
- Dexie queries;
- curriculum YAML parsing;
- mastery formulas.

---

# 9. `src/application/`

Purpose:

Coordinate use cases across domain and infrastructure.

Recommended:

```text
src/application/
├── labs/
│   ├── LabSessionService.ts
│   ├── LabLaunchService.ts
│   ├── LabResetService.ts
│   └── LabCompletionService.ts
├── progress/
│   └── ProgressService.ts
├── mastery/
│   └── MasteryService.ts
├── diagnostics/
│   └── DiagnosticsService.ts
├── fidelity/
│   └── FidelityService.ts
└── recommendations/
    └── RecommendationService.ts
```

---

# 10. Application Layer Rule

Application services may depend on:

```text
domain
ports/interfaces
shared types
```

Application services must not import:

```text
React
Dexie directly
@wasmer/sdk directly
xterm.js directly
```

---

# 11. `src/domain/`

Purpose:

Contain SHELLGROUND-specific business rules independent of external frameworks.

Recommended:

```text
src/domain/
├── labs/
│   ├── LabDefinition.ts
│   ├── LabSession.ts
│   ├── LabState.ts
│   └── Mission.ts
├── concepts/
│   ├── Concept.ts
│   └── ConceptId.ts
├── validation/
│   ├── ValidatorDefinition.ts
│   ├── ValidationResult.ts
│   └── ValidationSummary.ts
├── mastery/
│   ├── MasteryRecord.ts
│   ├── MasteryState.ts
│   └── calculateMastery.ts
├── progress/
│   └── LabProgress.ts
├── fidelity/
│   ├── FidelityClassification.ts
│   └── CommandFidelity.ts
├── runtime/
│   ├── RuntimeCapability.ts
│   └── RuntimeSnapshot.ts
└── errors/
    ├── DomainError.ts
    └── UnsupportedCapabilityError.ts
```

---

# 12. Domain Purity Rule

The domain layer must not import:

```text
react
react-dom
zustand
dexie
@wasmer/sdk
@xterm/xterm
vite
browser globals directly
```

Pure TypeScript is preferred.

---

# 13. `src/features/`

Purpose:

User-facing product features.

Recommended:

```text
src/features/
├── dashboard/
├── labs/
├── training/
├── playground/
├── mastery/
├── diagnostics/
└── settings/
```

Each feature contains view-level composition only.

---

# 14. Feature Folder Pattern

Example:

```text
src/features/training/
├── components/
│   ├── MissionPanel.tsx
│   ├── TrainingToolbar.tsx
│   ├── HintPanel.tsx
│   └── ValidationResultPanel.tsx
├── hooks/
│   ├── useTrainingSession.ts
│   └── useTrainingKeyboardShortcuts.ts
├── pages/
│   └── TrainingPage.tsx
├── state/
│   └── training-store.ts
└── index.ts
```

---

# 15. Feature Dependency Rule

Features may depend on:

```text
application
domain
shared
terminal public API
```

Features must not depend directly on:

```text
runtime/wasmer internals
infrastructure/dexie internals
content filesystem implementation
```

---

# 16. `src/runtime/`

Purpose:

Define runtime ports and concrete runtime implementation.

Recommended:

```text
src/runtime/
├── ports/
│   ├── ShellRuntime.ts
│   ├── TerminalProcessPort.ts
│   └── RuntimeSnapshotPort.ts
│
├── client/
│   ├── RuntimeClient.ts
│   └── runtime-client.types.ts
│
├── worker/
│   ├── runtime.worker.ts
│   ├── worker.protocol.ts
│   ├── worker.schemas.ts
│   └── worker-errors.ts
│
├── wasmer/
│   ├── WasmerShellRuntime.ts
│   ├── WasmerPackageResolver.ts
│   ├── WasmerFilesystemAdapter.ts
│   ├── WasmerProcessAdapter.ts
│   └── wasmer.types.ts
│
├── capabilities/
│   ├── detectCapabilities.ts
│   ├── CapabilityReport.ts
│   └── capability.constants.ts
│
├── fidelity/
│   ├── runtime-fidelity-registry.ts
│   └── resolve-runtime-fidelity.ts
│
└── manifest/
    ├── trusted-runtime-packages.ts
    └── runtime-manifest.types.ts
```

---

# 17. Runtime Encapsulation Rule

Only files under:

```text
src/runtime/wasmer/
```

may import:

```text
@wasmer/sdk
```

Exception:

The worker bootstrap may import the Wasmer adapter, but not the SDK directly unless technically unavoidable.

---

# 18. `src/terminal/`

Purpose:

Own xterm.js and terminal presentation behavior.

Recommended:

```text
src/terminal/
├── TerminalView.tsx
├── TerminalController.ts
├── terminal.types.ts
├── terminal.constants.ts
├── addons/
│   ├── createFitAddon.ts
│   └── configureTerminalAddons.ts
├── themes/
│   ├── default-theme.ts
│   └── high-contrast-theme.ts
└── hooks/
    └── useTerminalController.ts
```

---

# 19. Terminal Encapsulation Rule

Only `src/terminal/` should import:

```text
@xterm/xterm
```

Feature components receive a higher-level terminal API.

---

# 20. `src/infrastructure/`

Purpose:

External persistence and browser-specific infrastructure.

Recommended:

```text
src/infrastructure/
├── persistence/
│   ├── db/
│   │   ├── ShellgroundDatabase.ts
│   │   └── database-version.ts
│   ├── repositories/
│   │   ├── DexieLabProgressRepository.ts
│   │   ├── DexieSessionRepository.ts
│   │   ├── DexieMasteryRepository.ts
│   │   ├── DexieSettingsRepository.ts
│   │   └── DexieContentVersionRepository.ts
│   └── migrations/
│       └── v1.ts
│
├── content/
│   ├── ContentPackLoader.ts
│   ├── LabContentLoader.ts
│   ├── FixtureLoader.ts
│   └── ConceptLoader.ts
│
└── diagnostics/
    ├── BrowserDiagnosticsAdapter.ts
    └── StorageDiagnosticsAdapter.ts
```

---

# 21. Infrastructure Rule

Infrastructure implements ports.

It does not define domain behavior.

Example:

```text
Mastery formula
```

belongs in:

```text
domain/mastery
```

not:

```text
infrastructure/persistence
```

---

# 22. `src/shared/`

Purpose:

Cross-cutting utilities that are genuinely reusable.

Recommended:

```text
src/shared/
├── components/
├── constants/
├── errors/
├── logging/
├── types/
├── utils/
└── validation/
```

---

# 23. Shared Folder Constraint

Do not use `shared/` as a dumping ground.

A module belongs in `shared/` only if:

1. it has no domain-specific owner;
2. at least two architectural areas use it;
3. moving it to a domain-specific module would create awkward dependency direction.

---

# 24. Shared Examples

Appropriate:

```text
assertNever.ts
iso-date.ts
Result.ts
AppError.ts
logger interface
generic loading component
```

Inappropriate:

```text
lab scoring
runtime reset logic
fidelity resolution
mastery calculation
```

---

# 25. `src/styles/`

Recommended:

```text
src/styles/
├── globals.css
├── tokens.css
├── terminal.css
└── accessibility.css
```

If Tailwind is selected later, style files may differ.

The repository structure must not depend on Tailwind.

---

# 26. Content Root

Training content is stored outside `src/`.

Reason:

```text
content is product data
not application implementation
```

Recommended:

```text
content/
├── concepts/
├── packs/
├── registry/
└── schema/
```

---

# 27. `content/concepts/`

Purpose:

Canonical concept definitions.

Example:

```text
content/concepts/
├── terminal/
├── filesystem/
├── text/
├── streams/
├── shell/
├── permissions/
├── processes/
├── archives/
├── logs/
├── networking/
├── troubleshooting/
├── security/
└── forensics/
```

---

# 28. Concept File Naming

Recommended:

```text
filesystem.absolute-path.yaml
filesystem.relative-path.yaml
text.search.yaml
streams.pipe.yaml
shell.variables.yaml
```

Alternative directory-based structure is acceptable, but concept IDs must remain stable.

---

# 29. Content Packs

Recommended MVP:

```text
content/packs/linux-foundations/
```

Structure:

```text
content/packs/linux-foundations/
├── pack.yaml
├── labs/
├── fixtures/
├── references/
└── README.md
```

---

# 30. Pack Manifest

`pack.yaml` describes:

```text
pack ID
name
version
schema version
description
lab list
concept coverage
```

Exact schema belongs to the later schema document.

---

# 31. Labs Directory

Recommended:

```text
content/packs/linux-foundations/labs/
├── 001-where-am-i.yaml
├── 002-absolute-vs-relative.yaml
├── 003-hidden-files.yaml
├── 004-build-directory-tree.yaml
├── 005-safe-copy.yaml
├── 006-rename-and-move.yaml
├── 007-find-the-needle.yaml
├── 008-recursive-search.yaml
├── 009-count-the-evidence.yaml
├── 010-pipeline-basics.yaml
├── 011-redirect-correctly.yaml
├── 012-standard-error.yaml
├── 013-sort-and-deduplicate.yaml
├── 014-extract-the-column.yaml
├── 015-transform-the-stream.yaml
├── 016-permission-repair.yaml
├── 017-environment-variable-hunt.yaml
├── 018-checksum-verification.yaml
├── 019-archive-recovery.yaml
└── 020-log-investigation.yaml
```

---

# 32. Lab File Naming

Format:

```text
NNN-kebab-case-title.yaml
```

The number communicates curriculum order.

The canonical ID inside the file remains the source of identity.

Do not derive identity solely from filename.

---

# 33. Fixture Directory

Recommended:

```text
content/packs/linux-foundations/fixtures/
├── 001-where-am-i/
├── 002-absolute-vs-relative/
├── ...
└── 020-log-investigation/
```

Each fixture directory may contain:

```text
fixture.yaml
files/
```

or a manifest-driven equivalent.

---

# 34. Fixture Example

```text
fixtures/020-log-investigation/
├── fixture.yaml
└── files/
    └── var/
        └── log/
            └── auth.log
```

This makes fixture contents reviewable as ordinary files.

---

# 35. Fixture Binary Files

If later labs require binary files:

```text
files/
```

may contain them directly.

Avoid large binaries in MVP.

Add size limits.

---

# 36. Reference Solutions

Recommended:

```text
content/packs/linux-foundations/references/
├── 001-where-am-i.solution.yaml
├── ...
└── 020-log-investigation.solution.yaml
```

Reference solutions are:

```text
test artifacts
```

not UI content.

---

# 37. Reference Solution Security

Reference solutions are bundled in the repository, so they are not secrets.

They should not be shipped to the browser when unnecessary.

Build tooling should exclude them from production assets unless explicitly needed.

---

# 38. `content/registry/`

Purpose:

Global registries.

Recommended:

```text
content/registry/
├── command-fidelity.yaml
├── concepts.yaml
├── curriculum.yaml
└── packs.yaml
```

These may later be generated from source files instead of handwritten.

---

# 39. Command Fidelity Registry

Source of truth should live in:

```text
content/registry/command-fidelity.yaml
```

or a generated equivalent.

It must not be hardcoded independently in multiple modules.

---

# 40. `content/schema/`

Purpose:

Versioned content schemas or schema documentation.

Recommended:

```text
content/schema/
├── lab.schema.json
├── fixture.schema.json
├── concept.schema.json
├── pack.schema.json
└── fidelity.schema.json
```

If Zod is the runtime source of truth, generated JSON Schema may be placed here.

---

# 41. Schema Ownership

Canonical schema logic should exist in TypeScript under a dedicated application module.

Generated schema artifacts may live in `content/schema/`.

Avoid maintaining two independent schema definitions manually.

---

# 42. Schema Module Location

Recommended:

```text
src/domain/content/
```

or:

```text
src/infrastructure/content/schema/
```

Preferred architectural direction:

```text
domain representation
+
application-level parser
```

Exact schema implementation will be finalized in the next document.

---

# 43. `docs/`

Recommended:

```text
docs/
├── adr/
├── architecture/
├── development/
├── product/
├── runtime/
└── security/
```

---

# 44. `docs/product/`

Recommended files:

```text
REQUIREMENTS.md
FEATURE_SCOPE.md
CURRICULUM.md
SPMP.md
SRS.md
SDD.md
```

Once the planning phase is complete, the existing generated documents can be normalized into these locations.

---

# 45. `docs/architecture/`

Recommended:

```text
FULL_ARCHITECTURE.md
REPOSITORY_STRUCTURE.md
DATABASE_CONTENT_SCHEMA.md
UI_DESIGN.md
```

---

# 46. `docs/runtime/`

Recommended:

```text
COMMAND_SUPPORT_MATRIX.md
RUNTIME_SPIKE_RESULTS.md
COMMAND_FIDELITY.md
KNOWN_LIMITATIONS.md
```

---

# 47. `docs/security/`

Recommended:

```text
SECURITY_MODEL.md
THREAT_MODEL.md
CONTENT_TRUST_MODEL.md
```

---

# 48. `docs/development/`

Recommended:

```text
CONTRIBUTING.md
LOCAL_DEVELOPMENT.md
TESTING.md
DEPLOYMENT.md
CONTENT_AUTHORING.md
RELEASE_PROCESS.md
```

---

# 49. ADR Directory

Recommended:

```text
docs/adr/
├── ADR-001-browser-local-execution.md
├── ADR-002-wasmer-runtime.md
├── ADR-003-xterm-terminal.md
├── ADR-004-no-backend-mvp.md
├── ADR-005-network-default-deny.md
├── ADR-006-scenario-as-data.md
├── ADR-007-indexeddb.md
├── ADR-008-sandbox-recreation-reset.md
├── ADR-009-fidelity-registry.md
└── ADR-010-static-hosting.md
```

---

# 50. ADR Naming

Format:

```text
ADR-NNN-kebab-case-title.md
```

Each ADR should contain:

```text
Status
Context
Decision
Consequences
Alternatives
```

---

# 51. `scripts/`

Purpose:

Repository automation that is not part of the production web bundle.

Recommended:

```text
scripts/
├── content/
├── runtime/
└── verification/
```

---

# 52. Content Scripts

Recommended:

```text
scripts/content/
├── validate-content.ts
├── validate-fixtures.ts
├── validate-reference-solutions.ts
└── generate-content-index.ts
```

---

# 53. Runtime Scripts

Recommended:

```text
scripts/runtime/
├── generate-fidelity-report.ts
└── check-runtime-manifest.ts
```

---

# 54. Verification Scripts

Recommended:

```text
scripts/verification/
├── verify-no-network-capability.ts
├── verify-package-pins.ts
└── verify-import-boundaries.ts
```

---

# 55. Script Rule

Scripts may use Node APIs because they run during development/CI.

Production application code must not assume Node APIs exist in the browser.

---

# 56. `tests/`

Recommended:

```text
tests/
├── unit/
├── integration/
├── content/
├── e2e/
└── fixtures/
```

Colocated unit tests may also be used.

---

# 57. Unit Test Structure

Option A:

```text
src/domain/mastery/calculateMastery.test.ts
```

Option B:

```text
tests/unit/domain/mastery/calculateMastery.test.ts
```

Recommended:

Use colocated tests for small pure modules.

Use `tests/` for cross-module tests.

---

# 58. Integration Tests

Recommended:

```text
tests/integration/
├── runtime/
│   ├── shell-runtime.integration.test.ts
│   ├── filesystem.integration.test.ts
│   ├── reset.integration.test.ts
│   └── networking-denied.integration.test.ts
├── persistence/
│   └── repositories.integration.test.ts
└── scenarios/
    └── lab-session.integration.test.ts
```

---

# 59. Content Tests

Recommended:

```text
tests/content/
├── schema.test.ts
├── unique-ids.test.ts
├── fixtures.test.ts
├── references.test.ts
├── fidelity-dependencies.test.ts
└── curriculum-order.test.ts
```

---

# 60. E2E Tests

Recommended:

```text
tests/e2e/
├── app-startup.spec.ts
├── diagnostics.spec.ts
├── playground.spec.ts
├── first-lab.spec.ts
├── lab-reset.spec.ts
├── lab-completion.spec.ts
└── progress-persistence.spec.ts
```

---

# 61. Test Fixtures

Recommended:

```text
tests/fixtures/
├── runtime/
├── scenarios/
├── persistence/
└── malformed-content/
```

Do not reuse production training content for every parser edge case.

---

# 62. `public/`

Recommended:

```text
public/
├── icons/
├── favicon.svg
├── manifest.webmanifest
└── _headers
```

PWA files may remain minimal until PWA phase.

---

# 63. `_headers`

For Cloudflare Pages:

```text
public/_headers
```

should eventually include:

```text
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Exact CSP shall be added only after runtime verification.

---

# 64. `.github/`

Recommended:

```text
.github/
├── ISSUE_TEMPLATE/
│   ├── bug.yml
│   ├── feature.yml
│   └── content.yml
├── workflows/
│   ├── ci.yml
│   ├── e2e.yml
│   └── deploy.yml
└── PULL_REQUEST_TEMPLATE.md
```

---

# 65. CI Workflow Responsibilities

`ci.yml`:

```text
npm ci
lint
typecheck
unit tests
content tests
build
```

---

# 66. E2E Workflow

`e2e.yml`:

```text
build app
serve with required headers
launch supported browser
run Playwright
```

---

# 67. Deployment Workflow

`deploy.yml` should:

- build only after quality gates;
- deploy trusted branches;
- avoid secrets in PR logs;
- avoid production deployment from untrusted fork contexts.

---

# 68. Pull Request Template

Recommended sections:

```text
Summary
Scope
Requirement IDs
Architecture impact
Security impact
Runtime fidelity impact
Content impact
Tests
Screenshots if UI
Known limitations
```

---

# 69. Issue Templates

Recommended categories:

```text
bug
feature
content/lab
runtime fidelity
documentation
```

---

# 70. Root `README.md`

Must remain concise.

Recommended structure:

```text
Project summary
Why SHELLGROUND exists
Current status
Architecture summary
Development setup
Quality commands
Documentation links
Security boundary
License
```

Do not duplicate the full specification in README.

---

# 71. Root Configuration Files

Recommended:

```text
.editorconfig
.gitignore
.nvmrc
eslint.config.js
tsconfig.json
tsconfig.app.json
tsconfig.node.json
vite.config.ts
vitest.config.ts
playwright.config.ts
```

---

# 72. Node Version

Pin a supported Node LTS version using:

```text
.nvmrc
```

and:

```json
"engines"
```

inside `package.json` if desired.

Exact version belongs to implementation-time current compatibility checks.

---

# 73. TypeScript Configuration

Use strict TypeScript.

Minimum intent:

```text
strict
noImplicitOverride
noFallthroughCasesInSwitch
noUncheckedIndexedAccess
```

Exact flags may be tuned to library compatibility.

---

# 74. Path Aliases

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

Avoid overly broad aliases such as:

```text
@/*
```

if they obscure dependency direction.

---

# 75. Import Boundary Policy

Allowed high-level dependency direction:

```text
app
 ↓
features
 ↓
application
 ↓
domain
 ↑
infrastructure implementations
 ↑
runtime implementations
```

Shared utilities may be used laterally when appropriate.

---

# 76. Forbidden Imports

Examples:

```text
domain → React
domain → Dexie
domain → Wasmer
domain → xterm
application → React
features → @wasmer/sdk
features → Dexie
terminal → scenario validators
content → executable application code
```

---

# 77. Runtime Import Rule

Searchable rule:

```text
@wasmer/sdk
```

should appear only inside the Wasmer runtime implementation boundary.

This can be checked in CI.

---

# 78. Terminal Import Rule

Searchable rule:

```text
@xterm/xterm
```

should remain within `src/terminal/`.

---

# 79. Persistence Import Rule

Searchable rule:

```text
dexie
```

should remain within persistence infrastructure.

---

# 80. Zustand Usage

Zustand may be used for active application/session state.

It should not become a global replacement for:

```text
domain entities
IndexedDB
runtime worker state
```

---

# 81. Store Naming

Recommended:

```text
training-session.store.ts
ui-preferences.store.ts
```

Avoid one global:

```text
appStore.ts
```

that accumulates unrelated state.

---

# 82. Public Module APIs

Each major module may expose:

```text
index.ts
```

as a stable public boundary.

Example:

```text
src/runtime/index.ts
```

exports:

```text
ShellRuntime
RuntimeClient
CapabilityReport
```

but not internal Wasmer adapter helpers.

---

# 83. Barrel File Constraint

Avoid deep, recursive barrel files that create cycles.

Use `index.ts` only at module boundaries.

---

# 84. File Naming Conventions

Recommended:

React components:

```text
PascalCase.tsx
```

Classes:

```text
PascalCase.ts
```

Functions/utilities:

```text
kebab-case.ts
```

Domain types may use:

```text
PascalCase.ts
```

Tests:

```text
*.test.ts
*.spec.ts
```

---

# 85. Content Naming Convention

Labs:

```text
NNN-kebab-case.yaml
```

Concepts:

```text
domain.concept.yaml
```

ADRs:

```text
ADR-NNN-kebab-case.md
```

Scripts:

```text
kebab-case.ts
```

---

# 86. IDs vs Filenames

Canonical identity lives in file content.

Filename changes must not automatically change:

```text
lab ID
concept ID
pack ID
```

---

# 87. ID Naming

Recommended lab IDs:

```text
linux-foundations.navigation.where-am-i
linux-foundations.search.find-the-needle
linux-foundations.streams.pipeline-basics
```

Alternative shorter stable IDs are acceptable.

Avoid numeric-only IDs.

---

# 88. Concept IDs

Recommended:

```text
filesystem.cwd
filesystem.absolute-path
text.search
streams.pipe
shell.variables
```

These should remain stable across curriculum versions.

---

# 89. Package/Pack IDs

Example:

```text
linux-foundations
shell-scripting
defensive-analysis
```

---

# 90. Content Boundary Rule

Official training content must not import or reference:

```text
React component paths
TypeScript functions
JavaScript callback names
arbitrary module URLs
```

Content references only stable IDs and declared validator types.

---

# 91. Validator Location

Recommended:

```text
src/domain/validation/
```

for contracts and results.

Concrete application validator registry:

```text
src/application/validation/
```

or:

```text
src/domain/validation/validators/
```

if validators are pure domain behavior.

---

# 92. Validator Implementation Layout

Recommended:

```text
src/domain/validation/
├── Validator.ts
├── ValidatorDefinition.ts
├── ValidationResult.ts
├── registry/
│   └── ValidatorRegistry.ts
└── validators/
    ├── stdout-contains.ts
    ├── stdout-regex.ts
    ├── path-exists.ts
    ├── path-missing.ts
    ├── file-content-equals.ts
    ├── file-content-contains.ts
    ├── cwd-equals.ts
    └── hash-equals.ts
```

---

# 93. Simulation Module

Future simulation logic must live explicitly under:

```text
src/runtime/simulation/
```

or:

```text
src/domain/simulation/
```

Recommended:

```text
src/runtime/simulation/
├── SimulatedCommandRuntime.ts
├── filesystem/
├── networking/
├── services/
└── processes/
```

Do not mix simulation handlers into Wasmer adapter files.

---

# 94. Simulation Naming

Classes/functions should include `Simulated` where practical.

Example:

```text
SimulatedNetworkState
SimulatedSystemctlCommand
```

This reduces fidelity ambiguity during review.

---

# 95. Fidelity Registry Location

Application runtime copy:

```text
src/runtime/fidelity/
```

Content source:

```text
content/registry/command-fidelity.yaml
```

Recommended flow:

```text
YAML registry
  ↓
build validation
  ↓
generated typed artifact
  ↓
runtime fidelity service
```

---

# 96. Generated Files

If code generation is used:

```text
src/generated/
```

may be introduced.

Generated files must include:

```text
DO NOT EDIT
```

and clear source provenance.

Do not manually edit generated fidelity/content indexes.

---

# 97. Generated Artifacts

Potential generated outputs:

```text
content index
concept index
lab index
fidelity registry
JSON Schemas
version manifest
```

---

# 98. Generated Artifact Policy

Source content remains canonical.

Generated artifacts may be deleted and recreated.

---

# 99. Runtime Manifest

Recommended:

```text
src/runtime/manifest/trusted-runtime-packages.ts
```

or generated from:

```text
runtime-packages.yaml
```

The runtime manifest must not be learner-editable at runtime.

---

# 100. Runtime Package Tests

Relevant tests:

```text
package is exactly versioned
package ID is approved
no unknown package source
no duplicate command conflict without override
```

---

# 101. Environment File Policy

Do not rely on secrets in:

```text
.env
```

Frontend environment variables are public.

Potential files:

```text
.env.example
```

only if build-time configuration is useful.

Never commit private `.env.local`.

---

# 102. App Config

Recommended:

```text
src/app/config/app-config.ts
```

This exposes typed build-time public configuration.

---

# 103. Error Modules

Recommended:

```text
src/domain/errors/
src/shared/errors/
```

Domain-specific errors belong to domain.

Generic infrastructure errors may live closer to infrastructure.

---

# 104. Logging Module

Recommended:

```text
src/shared/logging/
├── AppLogger.ts
├── createLogger.ts
└── log-level.ts
```

Runtime worker may use a worker-specific adapter.

---

# 105. No Production Console Noise

Direct `console.log` should be limited.

Production code should use logger abstraction or deliberate diagnostic paths.

---

# 106. CSS/Design Token Location

Recommended:

```text
src/styles/tokens.css
```

Tokens should represent:

```text
spacing
typography
surface colors
border radii
terminal colors
focus styles
```

UI details belong to later UI Design document.

---

# 107. Security Documentation Co-location

Security-sensitive modules should contain nearby comments only where needed.

Long rationale belongs in:

```text
docs/security/
```

Avoid giant security essays in source comments.

---

# 108. Content Authoring Documentation

Recommended:

```text
docs/development/CONTENT_AUTHORING.md
```

It should explain:

```text
create lab
create fixture
assign concepts
add validators
add hints
add reference solution
run content tests
```

---

# 109. Runtime Development Documentation

Recommended:

```text
docs/runtime/RUNTIME_SPIKE_RESULTS.md
docs/runtime/KNOWN_LIMITATIONS.md
```

These should be updated when the runtime changes.

---

# 110. Local Development Docs

Recommended:

```text
docs/development/LOCAL_DEVELOPMENT.md
```

Include:

```text
Node setup
npm ci
dev server
required headers
browser requirements
test commands
runtime troubleshooting
```

---

# 111. Branch-to-Folder Scope Guidance

Example bounded PR:

```text
feat/runtime-spike
```

should primarily touch:

```text
src/runtime/
tests/integration/runtime/
docs/runtime/
vite config
package files
```

It should not also redesign curriculum UI.

---

# 112. Curriculum PR Scope

Example:

```text
feat/core-curriculum
```

should primarily touch:

```text
content/
tests/content/
docs/development/CONTENT_AUTHORING.md
```

plus only minimal engine changes if genuinely required.

---

# 113. UI PR Scope

Example:

```text
feat/product-ux
```

should primarily touch:

```text
src/features/
src/styles/
src/terminal/
tests/e2e/
```

---

# 114. Ownership by Architectural Area

Even for a single developer, ownership should be conceptual.

| Area | Ownership |
|---|---|
| Runtime | execution boundary and sandbox |
| Terminal | xterm lifecycle and presentation |
| Domain | business rules |
| Application | use-case orchestration |
| Infrastructure | persistence/content IO |
| Content | curriculum/labs/fixtures |
| Features | user-facing workflows |
| Docs | project decisions and authoring guidance |

---

# 115. CODEOWNERS — Optional Future

If contributors grow, introduce:

```text
.github/CODEOWNERS
```

Example areas:

```text
/src/runtime/
/content/
/docs/security/
```

Not required for solo MVP.

---

# 116. Avoiding Cyclic Dependencies

Potential dangerous cycle:

```text
feature
→ application
→ runtime
→ feature
```

Forbidden.

Runtime must never import features.

---

# 117. Dependency Direction Example

Correct:

```text
TrainingPage
  ↓
LabSessionService
  ↓
ShellRuntime interface
  ↑
WasmerShellRuntime implementation
```

Incorrect:

```text
TrainingPage
  ↓
Wasmer SDK
```

---

# 118. Content Dependency Direction

Correct:

```text
YAML
 ↓
Content Loader
 ↓
Typed LabDefinition
 ↓
Application
```

Incorrect:

```text
YAML
 ↓
eval()
```

---

# 119. Persistence Dependency Direction

Correct:

```text
ProgressService
 ↓
LabProgressRepository interface
 ↑
DexieLabProgressRepository
```

Incorrect:

```text
TrainingPage
 ↓
db.labProgress.put(...)
```

---

# 120. Test Dependency Direction

Tests may access internals deliberately when unit testing.

E2E tests should treat the app as a user-visible system.

---

# 121. Source File Size Guidance

Avoid giant modules.

Guideline:

```text
one primary responsibility per file
```

Do not enforce arbitrary line-count limits mechanically.

Split based on responsibility.

---

# 122. Class Usage

Prefer functions for:

```text
pure transformations
validators
mastery calculations
schema parsing
```

Use classes when lifecycle/state ownership benefits from them:

```text
TerminalController
RuntimeClient
WasmerShellRuntime
repositories
```

---

# 123. Interface Naming

Do not prefix all interfaces with `I`.

Use:

```text
ShellRuntime
LabProgressRepository
```

rather than:

```text
IShellRuntime
ILabProgressRepository
```

---

# 124. DTO Naming

Worker protocol and persistence transport types may use:

```text
DTO
```

when distinction from domain entities matters.

Example:

```text
RuntimeErrorDTO
```

---

# 125. Public API Naming

Prefer domain-oriented names:

```text
startLab
validateLab
resetLab
```

over implementation-oriented names:

```text
callWasmer
reloadWorker
```

---

# 126. Comments

Comments should explain:

```text
why
constraint
security decision
runtime quirk
```

Avoid comments that restate code.

---

# 127. TODO Policy

TODOs must reference:

```text
issue ID
or
clear reason
```

Avoid untracked:

```text
// TODO fix later
```

---

# 128. Experimental Code

Runtime spike experiments may live temporarily under:

```text
experiments/
```

but should be removed or moved before MVP architecture hardening.

Preferred final repository does not include stale spike code.

---

# 129. `experiments/` Policy

If used:

```text
experiments/runtime-spike/
```

must be isolated from production imports.

After spike:

```text
archive findings in docs
delete obsolete experiment code
```

unless it becomes production infrastructure.

---

# 130. Build Output

Vite output:

```text
dist/
```

must be ignored by Git.

---

# 131. Test Output

Ignore:

```text
playwright-report/
test-results/
coverage/
```

unless deliberately published as CI artifacts.

---

# 132. Runtime Cache

Browser runtime cache is not a repository directory.

Do not commit downloaded Wasmer package cache artifacts.

---

# 133. Fixture Size Policy

MVP fixture guideline:

```text
small
reviewable
deterministic
```

Avoid fixture archives when plain files suffice.

---

# 134. Large File Policy

Avoid Git LFS in MVP unless a real requirement emerges.

Training content should remain lightweight.

---

# 135. Binary Policy

Binary fixtures must have:

```text
documented learning purpose
license/provenance
size justification
```

No opaque unknown binaries.

---

# 136. Licensing Layout

Recommended root:

```text
LICENSE
```

Content requiring separate attribution may use:

```text
docs/product/ATTRIBUTIONS.md
```

---

# 137. Third-Party Attribution

If external sample data is used:

- verify license;
- attribute appropriately;
- prefer synthetic data for training fixtures.

---

# 138. Synthetic Log Policy

Generate project-owned synthetic logs whenever practical.

This avoids:

```text
privacy issues
copyright issues
real credential leakage
```

---

# 139. Security Test Location

Recommended:

```text
tests/integration/security/
```

Potential tests:

```text
no network capability
no host filesystem access
malformed worker message rejected
unsafe fixture path rejected
arbitrary package ID rejected
```

---

# 140. Runtime Conformance Test Location

Recommended:

```text
tests/integration/runtime/conformance/
```

Files may include:

```text
shell-start.test.ts
stdio.test.ts
filesystem.test.ts
pipes.test.ts
redirection.test.ts
scripts.test.ts
reset.test.ts
```

---

# 141. Content Conformance Test Location

Recommended:

```text
tests/content/conformance/
```

---

# 142. Lab-Level Tests

Optionally:

```text
tests/content/labs/001-where-am-i.test.ts
```

But prefer data-driven tests so every lab is checked automatically.

---

# 143. Data-Driven Content Tests

Example concept:

```text
for each lab:
  load schema
  verify fixture
  verify command dependencies
  verify validators
  verify reference solution
```

Avoid one manually duplicated test file per lab unless needed.

---

# 144. Content Index

Build tooling should generate a content index.

Conceptual:

```text
generated/content-index.json
```

or TypeScript equivalent.

This allows the application to discover labs without manual imports.

---

# 145. Dynamic Imports

Content can be lazy-loaded by pack/lab if bundler behavior is reliable.

Do not require all fixture content in initial bundle if it becomes large.

MVP can begin simpler.

---

# 146. Import.meta Glob

Vite may support:

```text
import.meta.glob
```

for content discovery.

Use only if it preserves predictable build behavior and content validation.

---

# 147. Content Parsing

Recommended:

```text
YAML source
↓
parser
↓
Zod validation
↓
typed domain object
```

Exact parser/schema design is next document.

---

# 148. Markdown in Content

Mission text may eventually support Markdown.

If enabled:

- sanitize output;
- disallow arbitrary HTML by default;
- do not permit script execution.

---

# 149. Static Asset Location

Training images, if ever required:

```text
content/packs/<pack>/assets/
```

MVP terminal curriculum should not require images.

---

# 150. Future Multi-Package Evolution

If project complexity grows, repository may later become:

```text
apps/web
packages/domain
packages/content-schema
packages/runtime
packages/training-content
```

Do not start there.

---

# 151. Monorepo Migration Trigger

Consider monorepo only when at least one becomes true:

- multiple deployable apps;
- reusable runtime SDK;
- external content-authoring CLI;
- server backend;
- native desktop app;
- separately versioned shared packages.

---

# 152. Current Decision

MVP remains:

```text
single-package repository
```

with clear internal modules.

---

# 153. Repository Security Boundaries

High-risk folders:

```text
src/runtime/
src/infrastructure/
scripts/
.github/workflows/
public/_headers
```

Changes here deserve stronger review.

---

# 154. Curriculum Review Boundaries

Content changes should be reviewable independently of runtime code.

This is a major reason to keep:

```text
content/
```

outside:

```text
src/
```

---

# 155. Runtime Fidelity Review Boundary

Changes to:

```text
content/registry/command-fidelity.yaml
```

must be accompanied by test evidence or runtime spike evidence.

Do not manually promote:

```text
UNVERIFIED → REAL
```

without proof.

---

# 156. Repository Documentation Map

After the full design sequence:

```text
docs/product/
  REQUIREMENTS.md
  FEATURE_SCOPE.md
  CURRICULUM.md
  SPMP.md
  SRS.md
  SDD.md

docs/architecture/
  FULL_ARCHITECTURE.md
  REPOSITORY_STRUCTURE.md
  DATABASE_CONTENT_SCHEMA.md
  UI_DESIGN.md

docs/runtime/
  COMMAND_SUPPORT_MATRIX.md
  RUNTIME_SPIKE_RESULTS.md
  COMMAND_FIDELITY.md

docs/development/
  IMPLEMENTATION_PLAN.md
  CONTENT_AUTHORING.md
  TESTING.md
  DEPLOYMENT.md
```

---

# 157. Naming the Current Planning Files

The externally generated planning files may later be copied into the repository and renamed consistently.

Current:

```text
SHELLGROUND_REQUIREMENTS.md
SHELLGROUND_FEATURE_SCOPE.md
SHELLGROUND_FULL_ARCHITECTURE.md
SHELLGROUND_COMMAND_SUPPORT_MATRIX.md
SHELLGROUND_CURRICULUM.md
SHELLGROUND_REPOSITORY_STRUCTURE.md
```

Recommended in-repo names:

```text
docs/product/REQUIREMENTS.md
docs/product/FEATURE_SCOPE.md
docs/architecture/FULL_ARCHITECTURE.md
docs/runtime/COMMAND_SUPPORT_MATRIX.md
docs/product/CURRICULUM.md
docs/architecture/REPOSITORY_STRUCTURE.md
```

---

# 158. Recommended Final Repository Tree

```text
shellground/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.yml
│   │   ├── content.yml
│   │   └── feature.yml
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── e2e.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── content/
│   ├── concepts/
│   │   ├── filesystem/
│   │   ├── shell/
│   │   ├── streams/
│   │   ├── text/
│   │   ├── logs/
│   │   ├── troubleshooting/
│   │   ├── security/
│   │   └── forensics/
│   │
│   ├── packs/
│   │   └── linux-foundations/
│   │       ├── pack.yaml
│   │       ├── README.md
│   │       ├── labs/
│   │       ├── fixtures/
│   │       └── references/
│   │
│   ├── registry/
│   │   ├── command-fidelity.yaml
│   │   ├── concepts.yaml
│   │   ├── curriculum.yaml
│   │   └── packs.yaml
│   │
│   └── schema/
│       ├── concept.schema.json
│       ├── fidelity.schema.json
│       ├── fixture.schema.json
│       ├── lab.schema.json
│       └── pack.schema.json
│
├── docs/
│   ├── adr/
│   ├── architecture/
│   │   ├── DATABASE_CONTENT_SCHEMA.md
│   │   ├── FULL_ARCHITECTURE.md
│   │   ├── REPOSITORY_STRUCTURE.md
│   │   └── UI_DESIGN.md
│   ├── development/
│   │   ├── CONTENT_AUTHORING.md
│   │   ├── DEPLOYMENT.md
│   │   ├── LOCAL_DEVELOPMENT.md
│   │   ├── TESTING.md
│   │   └── RELEASE_PROCESS.md
│   ├── product/
│   │   ├── CURRICULUM.md
│   │   ├── FEATURE_SCOPE.md
│   │   ├── REQUIREMENTS.md
│   │   ├── SDD.md
│   │   ├── SPMP.md
│   │   └── SRS.md
│   ├── runtime/
│   │   ├── COMMAND_FIDELITY.md
│   │   ├── COMMAND_SUPPORT_MATRIX.md
│   │   ├── KNOWN_LIMITATIONS.md
│   │   └── RUNTIME_SPIKE_RESULTS.md
│   └── security/
│       ├── CONTENT_TRUST_MODEL.md
│       ├── SECURITY_MODEL.md
│       └── THREAT_MODEL.md
│
├── public/
│   ├── icons/
│   ├── _headers
│   ├── favicon.svg
│   └── manifest.webmanifest
│
├── scripts/
│   ├── content/
│   │   ├── generate-content-index.ts
│   │   ├── validate-content.ts
│   │   ├── validate-fixtures.ts
│   │   └── validate-reference-solutions.ts
│   ├── runtime/
│   │   ├── check-runtime-manifest.ts
│   │   └── generate-fidelity-report.ts
│   └── verification/
│       ├── verify-import-boundaries.ts
│       ├── verify-no-network-capability.ts
│       └── verify-package-pins.ts
│
├── src/
│   ├── app/
│   │   ├── config/
│   │   ├── providers/
│   │   ├── router/
│   │   ├── startup/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── application/
│   │   ├── diagnostics/
│   │   ├── fidelity/
│   │   ├── labs/
│   │   ├── mastery/
│   │   ├── progress/
│   │   └── recommendations/
│   │
│   ├── domain/
│   │   ├── concepts/
│   │   ├── errors/
│   │   ├── fidelity/
│   │   ├── labs/
│   │   ├── mastery/
│   │   ├── progress/
│   │   ├── runtime/
│   │   └── validation/
│   │
│   ├── features/
│   │   ├── dashboard/
│   │   ├── diagnostics/
│   │   ├── labs/
│   │   ├── mastery/
│   │   ├── playground/
│   │   ├── settings/
│   │   └── training/
│   │
│   ├── infrastructure/
│   │   ├── content/
│   │   ├── diagnostics/
│   │   └── persistence/
│   │
│   ├── runtime/
│   │   ├── capabilities/
│   │   ├── client/
│   │   ├── fidelity/
│   │   ├── manifest/
│   │   ├── ports/
│   │   ├── wasmer/
│   │   └── worker/
│   │
│   ├── terminal/
│   │   ├── addons/
│   │   ├── hooks/
│   │   ├── themes/
│   │   ├── TerminalController.ts
│   │   ├── TerminalView.tsx
│   │   └── terminal.types.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── logging/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── styles/
│       ├── accessibility.css
│       ├── globals.css
│       ├── terminal.css
│       └── tokens.css
│
├── tests/
│   ├── content/
│   │   ├── conformance/
│   │   ├── curriculum-order.test.ts
│   │   ├── fidelity-dependencies.test.ts
│   │   ├── fixtures.test.ts
│   │   ├── references.test.ts
│   │   ├── schema.test.ts
│   │   └── unique-ids.test.ts
│   │
│   ├── e2e/
│   │   ├── app-startup.spec.ts
│   │   ├── diagnostics.spec.ts
│   │   ├── first-lab.spec.ts
│   │   ├── lab-completion.spec.ts
│   │   ├── lab-reset.spec.ts
│   │   ├── playground.spec.ts
│   │   └── progress-persistence.spec.ts
│   │
│   ├── fixtures/
│   │   ├── malformed-content/
│   │   ├── persistence/
│   │   ├── runtime/
│   │   └── scenarios/
│   │
│   ├── integration/
│   │   ├── persistence/
│   │   ├── runtime/
│   │   │   ├── conformance/
│   │   │   └── security/
│   │   └── scenarios/
│   │
│   └── unit/
│
├── .editorconfig
├── .gitignore
├── .nvmrc
├── eslint.config.js
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── playwright.config.ts
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

# 159. Repository Acceptance Criteria

The repository structure is considered correct when:

1. application layers have clear physical boundaries;
2. React cannot directly depend on Wasmer internals;
3. xterm usage is encapsulated;
4. Dexie usage is encapsulated;
5. curriculum content lives outside application source;
6. validators are centrally registered;
7. fixtures are version-controlled and reviewable;
8. official labs have reference solutions;
9. tests are organized by responsibility;
10. runtime fidelity has one canonical registry;
11. CI can validate import boundaries;
12. documentation is grouped by purpose;
13. future content packs can be added without restructuring the app;
14. the repository remains a single-package project for MVP.

---

# 160. Repository Anti-Patterns

The implementation must avoid structures such as:

```text
src/components/*
src/utils/*
src/services/*
```

as the entire architecture.

These names are acceptable inside bounded modules but not as global catch-all architecture.

Also avoid:

```text
src/kali/
src/hacking/
src/commands/
```

as misleading central abstractions.

The project is a training platform, not a Kali clone.

---

# 161. Final Repository Decision

The approved repository design is:

```text
Single GitHub repository
Single web package
Architecture-aligned src modules
Declarative content outside src
Dedicated runtime boundary
Dedicated terminal boundary
Dedicated infrastructure boundary
Dedicated content tests
Dedicated runtime conformance tests
Structured documentation
GitHub Actions quality gates
```

This structure is intended to remain understandable even after the project grows from:

```text
20 labs
```

to:

```text
100+ labs
multiple tracks
simulation modules
future optional backends
```

without forcing an early monorepo.

---

# 162. Next Document

The next document in sequence is:

```text
7. DATABASE / CONTENT SCHEMA
```

That document will define in detail:

- IndexedDB/Dexie entities;
- keys and indexes;
- migrations;
- lab progress records;
- sessions;
- mastery records;
- settings;
- content versions;
- lab YAML schema;
- fixture schema;
- concept schema;
- pack schema;
- fidelity schema;
- validator schemas;
- version compatibility;
- data validation rules.

It will build directly on this repository structure.
