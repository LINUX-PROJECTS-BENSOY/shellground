# SHELLGROUND

> **Browser-Based Linux Command Training Platform**  
> *Train Linux command fluency without managing a full operating system.*

[![CI](https://github.com/LINUX-PROJECTS-BENSOY/shellground/actions/workflows/ci.yml/badge.svg)](https://github.com/LINUX-PROJECTS-BENSOY/shellground/actions/workflows/ci.yml)
[![Organization](https://img.shields.io/badge/Org-LINUX--PROJECTS--BENSOY-blue.svg)](https://github.com/LINUX-PROJECTS-BENSOY)
[![Documentation](https://img.shields.io/badge/Docs-shellground--docs-green.svg)](https://github.com/LINUX-PROJECTS-BENSOY/shellground-docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Project Summary

**SHELLGROUND** is an interactive, browser-local Linux command training environment. It enables learners to practice real command-line workflows, troubleshoot synthetic incidents, and develop command fluency safely inside a browser sandbox.

SHELLGROUND is **not** Kali Linux, a Linux distribution, a virtual machine manager, or a remote SSH shell. It executes a POSIX/Linux userland locally via Web Workers and WebAssembly (WASIX), coupled to an xterm.js terminal interface.

---

## 2. Core Architecture

The codebase strictly enforces clean architecture and hexagonal isolation:

```text
React / Presentation (src/features, src/app)
        ↓
Application Services (src/application)
        ↓
Domain Rules & Ports (src/domain)
        ↑
Adapters & Infrastructure (src/runtime, src/infrastructure, src/terminal)
```

- **Runtime Isolation**: `@wasmer/sdk` is strictly encapsulated inside `src/runtime/`. Features and UI components interact only with the `ShellRuntime` port interface.
- **Terminal Decoupling**: `@xterm/xterm` is encapsulated in `src/terminal/` via `TerminalController`.
- **Local-First Persistence**: Learner progress, command history, and preferences persist in browser IndexedDB via Dexie. No backend server is required.
- **Declarative Content**: Curriculum packs and labs reside in `content/` as versioned YAML/JSON validated by Zod schemas. Scenarios never execute arbitrary JavaScript.
- **Explicit Fidelity**: Every command reports whether its execution is native WASIX (`REAL`), simulated (`SIMULATED`), or `UNSUPPORTED`.

---

## 3. Directory Layout

```text
shellground/
├── .github/          # GitHub Actions CI/CD workflows and issue templates
├── content/          # Declarative curriculum packs, concepts, and registries
│   ├── concepts/     # Concept definitions (filesystem, text, streams, etc.)
│   ├── packs/        # Curriculum packs (e.g., linux-foundations)
│   ├── registry/     # Global registries (fidelity, packs, curriculum)
│   └── schema/       # JSON Schemas for content validation
├── public/           # Static assets, web manifest, and COOP/COEP _headers
├── scripts/          # Build-time and verification tools
├── src/              # Application source code
│   ├── app/          # Bootstrap, providers, router, app configuration
│   ├── application/  # Use case orchestration (labs, progress, mastery)
│   ├── domain/       # Business rules, domain models, validation contracts
│   ├── features/     # User-facing features (training, playground, dashboard)
│   ├── infrastructure/ # Persistence (Dexie) and content loaders
│   ├── runtime/      # Wasmer/WASIX Web Worker adapter and runtime contracts
│   ├── terminal/     # xterm.js controller and terminal views
│   ├── shared/       # Common types, utilities, logging, Result pattern
│   └── styles/       # Design tokens, terminal styling, accessibility
└── tests/            # Unit, integration, content, and E2E test suites
```

---

## 4. Development Setup

### Prerequisites
- **Node.js**: `>= 20.0.0` (LTS recommended)
- **npm**: `>= 10.0.0`
- **Modern Browser**: Chrome/Edge/Firefox with WebAssembly, Web Workers, and `SharedArrayBuffer` support.

### Getting Started

```bash
# Clone the repository
git clone https://github.com/LINUX-PROJECTS-BENSOY/shellground.git
cd shellground

# Install dependencies
npm ci

# Start the development server (with required COOP/COEP headers)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 5. Quality Commands & Gates

All branches must pass quality gates before merging:

```bash
# Type-checking
npm run typecheck

# Code linting
npm run lint

# Run unit tests
npm run test

# Run content schema validation tests
npm run test:content

# Run Playwright E2E tests
npm run test:e2e

# Production build
npm run build
```

---

## 6. Project Specifications & Documentation

All architectural specifications, curriculum designs, requirements, and development roadmaps are maintained in the private documentation repository:
👉 **[LINUX-PROJECTS-BENSOY/shellground-docs](https://github.com/LINUX-PROJECTS-BENSOY/shellground-docs)** *(Organization Private)*

Authoritative specifications include:
- Requirements Specification (`REQUIREMENTS.md`)
- Feature Scope Specification (`FEATURE_SCOPE.md`)
- Full Architecture Specification (`FULL_ARCHITECTURE.md`)
- Command Support Matrix (`COMMAND_SUPPORT_MATRIX.md`)
- Curriculum Specification (`CURRICULUM.md`)
- Repository Structure Specification (`REPOSITORY_STRUCTURE.md`)
- Database & Content Schema Specification (`DATABASE_CONTENT_SCHEMA.md`)
- UI Design Specification (`UI_DESIGN.md`)
- MVP Delivery Phases (`MVP_PHASES.md`)
- Software Requirements Specification (`SRS.md`)
- Software Design Description (`SDD.md`)
- Implementation Plan (`IMPLEMENTATION_PLAN.md`)
- Single Coding-Agent Execution Prompt (`SINGLE_CODING_AGENT_PROMPT.md`)

---

## 7. Security Model

- **Zero Host Access**: Shellground runs purely inside the browser sandbox; no host filesystem access is permitted.
- **Cross-Origin Isolation**: Required headers (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`) are configured for thread isolation.
- **Network Default Deny**: Untrusted network access is blocked by default.
- **Safe Scenario Data**: Lab configurations are declarative data structures validated by Zod and cannot execute arbitrary code.

---

## 8. License

This project is licensed under the [MIT License](LICENSE).
