# SHELLGROUND — Requirements Specification

> **Document:** Requirements Specification  
> **Project:** SHELLGROUND  
> **Status:** Draft Baseline  
> **Purpose:** Define what SHELLGROUND must accomplish before feature scope, architecture, schemas, UI, or implementation planning are designed.

---

# 1. Introduction

## 1.1 Project Overview

SHELLGROUND is a browser-based Linux command training environment intended to help a learner build practical command-line fluency without requiring a separate Linux installation, Kali Linux installation, WSL, Docker, VirtualBox, VMware, dual boot, or a remote Linux server.

The system is intended to provide a safe, isolated, repeatable environment in which the learner can:

- execute Linux/POSIX-style commands;
- interact with a virtual filesystem;
- complete guided and unguided command-line exercises;
- practice troubleshooting and system-analysis workflows;
- receive measurable feedback;
- track command and concept mastery over time.

SHELLGROUND is a training platform, not a Linux distribution.

---

## 1.2 Core Product Principle

The primary product principle is:

> **Train Linux command fluency without requiring the learner to manage a full Linux operating system.**

The application must prioritize:

- command usage;
- shell reasoning;
- filesystem interaction;
- text processing;
- scripting;
- troubleshooting;
- systems thinking;
- repeatable practice.

The application must not prioritize:

- visual imitation of Kali Linux;
- offensive-security tooling;
- operating-system emulation for its own sake;
- graphical desktop replication.

---

## 1.3 Problem Statement

Linux command-line proficiency is typically learned through:

- direct use of a Linux machine;
- virtual machines;
- WSL;
- cloud-hosted shells;
- remote SSH systems;
- isolated training platforms.

These approaches may introduce additional setup, resource usage, system administration overhead, or environment dependency.

SHELLGROUND addresses this by providing a focused browser-based practice environment dedicated to command-line learning.

The system should enable a learner to practice commands repeatedly without concern about damaging the host operating system.

---

# 2. Product Goals

## 2.1 Primary Goal

Provide a practical environment for learning, practicing, and mastering Linux command-line operations.

---

## 2.2 Secondary Goals

SHELLGROUND should also:

1. provide structured learning progression;
2. support repeatable exercises;
3. measure user progress;
4. identify weak command areas;
5. reinforce concepts through repeated practice;
6. provide increasingly realistic scenarios;
7. expose command-line troubleshooting patterns;
8. prepare the learner for future Linux, networking, cybersecurity, DevOps, and systems-administration work.

---

## 2.3 Long-Term Goal

The long-term objective is for the learner to progress from basic command familiarity to independent command-line problem solving.

The intended progression is:

```text
Command Recognition
        ↓
Command Usage
        ↓
Command Combination
        ↓
Shell Reasoning
        ↓
Troubleshooting
        ↓
Systems Analysis
        ↓
Independent CLI Fluency
```

---

# 3. Product Boundaries

## 3.1 SHELLGROUND Is

SHELLGROUND is:

- a Linux command trainer;
- a browser-based shell practice environment;
- a structured lab system;
- a virtual filesystem training environment;
- a progress and mastery tracker;
- a troubleshooting practice platform;
- a learning-oriented command sandbox.

---

## 3.2 SHELLGROUND Is Not

SHELLGROUND is not:

- Kali Linux;
- Ubuntu;
- Debian;
- a Linux distribution;
- a virtual machine;
- a browser desktop OS;
- a full Linux kernel emulator;
- a remote shell hosting platform;
- an offensive-security suite;
- a malware-analysis sandbox;
- an unrestricted network scanning platform.

---

# 4. Target User

## 4.1 Primary User

The primary user is a technically inclined learner who wants to improve Linux command-line skills.

Typical background may include:

- software development;
- information technology;
- networking;
- cybersecurity;
- system administration;
- DevOps;
- digital forensics.

The system should not assume that the learner is unfamiliar with computing fundamentals.

---

## 4.2 Expected User Knowledge

The product may assume familiarity with:

- files and directories;
- software installation;
- terminal concepts;
- basic programming logic;
- basic operating-system concepts.

The product should teach Linux command-line behavior rather than introductory computer literacy.

---

# 5. User Objectives

The learner shall be able to use SHELLGROUND to:

1. practice Linux commands;
2. learn command syntax;
3. understand shell behavior;
4. manipulate files and directories;
5. process text;
6. search files and content;
7. combine commands using pipes;
8. use input/output redirection;
9. work with permissions;
10. understand environment variables;
11. write shell scripts;
12. analyze logs;
13. solve troubleshooting scenarios;
14. inspect system-like data;
15. complete command-line exercises without step-by-step help;
16. monitor personal mastery and weaknesses.

---

# 6. Functional Requirements

## FR-001 — Application Launch

The system shall run through a modern web browser.

The user shall not be required to install:

- Kali Linux;
- another Linux distribution;
- VirtualBox;
- VMware;
- WSL;
- Docker;
- a remote SSH server.

---

## FR-002 — Terminal Environment

The system shall provide an interactive terminal interface.

The terminal shall support:

- keyboard input;
- command execution;
- terminal output;
- error output;
- cursor behavior;
- terminal resizing;
- command history where supported by the selected shell runtime.

---

## FR-003 — Command Execution

The user shall be able to execute Linux/POSIX-style commands inside the SHELLGROUND environment.

The system shall distinguish between:

- commands that execute through the real browser runtime;
- commands that are simulated;
- commands that are unsupported.

The system shall not falsely represent unsupported functionality as genuine Linux behavior.

---

## FR-004 — Virtual Filesystem

The user shall be able to interact with a virtual filesystem.

The filesystem shall support, where technically available:

- directories;
- files;
- hidden files;
- file contents;
- nested paths;
- symbolic links;
- file metadata;
- file permissions.

---

## FR-005 — Safe Environment Isolation

Operations performed inside SHELLGROUND shall not directly modify the user's host filesystem.

Training files shall remain inside the isolated application environment.

---

## FR-006 — Lab Environment

The system shall support structured labs.

Each lab shall define:

- a title;
- difficulty;
- learning objective;
- starting environment;
- expected outcome;
- validation conditions;
- relevant concepts;
- optional hints.

---

## FR-007 — Deterministic Lab Initialization

A lab shall initialize into a known starting state.

Restarting the same deterministic lab version shall restore the same initial training environment.

---

## FR-008 — Lab Reset

The user shall be able to reset an active lab.

Reset shall restore the lab to its configured initial state.

---

## FR-009 — Lab Validation

The system shall determine whether the learner successfully completed the stated objective.

Validation may inspect:

- terminal output;
- filesystem state;
- file contents;
- file existence;
- path structure;
- current directory;
- permissions;
- checksums;
- other predefined training-state conditions.

---

## FR-010 — Alternative Solutions

The validation system should accept different valid command sequences when they produce the correct result.

Example:

If the objective is to identify matching lines, the system should not require exactly one prescribed `grep` invocation when another valid shell approach achieves the same learning objective.

Command-specific enforcement shall only be used when the purpose of the exercise is explicitly to practice that command.

---

## FR-011 — Hints

Labs may provide optional hints.

The system shall be able to:

- display hints progressively;
- record hint usage;
- reduce scoring or mastery impact when appropriate.

Hints should guide reasoning without immediately revealing the full solution.

---

## FR-012 — Free Practice

The system shall provide a free-practice environment.

Free practice shall allow the user to experiment without:

- required objectives;
- scoring;
- forced progression.

---

## FR-013 — Guided Training

The system shall support guided training.

Guided training may include:

- objective explanation;
- concept summary;
- examples;
- hints;
- completion feedback.

---

## FR-014 — Blind Training

The system shall support exercises with minimal assistance.

Blind training shall remove or reduce:

- example commands;
- suggested commands;
- walkthrough steps.

The learner shall primarily receive:

- the mission;
- relevant constraints;
- success criteria.

---

## FR-015 — Drill Training

The system shall support targeted practice.

The user shall be able to practice a selected:

- command;
- concept;
- topic;
- command family.

Examples:

```text
grep
find
permissions
pipes
redirection
awk
filesystem navigation
```

---

## FR-016 — Exam Mode

The system shall eventually support an exam mode.

Exam mode shall support:

- multiple labs;
- no hints;
- cumulative results;
- elapsed time;
- domain-level performance.

---

## FR-017 — Troubleshooting Scenarios

The system shall support scenario-driven exercises that simulate realistic administrative problems.

Examples include:

- excessive disk usage;
- incorrect file permissions;
- malformed files;
- suspicious log entries;
- missing configuration values;
- duplicate records;
- failed integrity checks.

---

## FR-018 — Defensive Analysis Scenarios

The system shall support safe, local defensive analysis exercises using synthetic data.

Examples include:

- authentication-log review;
- suspicious-file discovery;
- integrity verification;
- permission auditing;
- log correlation;
- file timeline inspection.

---

## FR-019 — Progress Tracking

The system shall record training progress.

At minimum, progress may include:

- labs attempted;
- labs completed;
- attempts;
- best score;
- hints used;
- completion time;
- last attempted date.

---

## FR-020 — Command Mastery Tracking

The system shall maintain training statistics for commands or command-related concepts.

Potential metrics include:

- frequency of exposure;
- successful use;
- failed exercises;
- recent practice;
- hint dependency;
- completion speed.

---

## FR-021 — Concept Mastery Tracking

The system shall maintain mastery data for broader concepts.

Examples:

```text
filesystem navigation
search
permissions
text processing
redirection
shell variables
scripting
logs
troubleshooting
```

---

## FR-022 — Weakness Identification

The system shall identify areas with comparatively weak performance.

Weakness detection may consider:

- repeated failed labs;
- frequent hint use;
- poor recent performance;
- long completion times;
- low mastery score.

---

## FR-023 — Training Recommendations

The system should eventually recommend additional practice based on weak areas.

Recommendations shall remain explainable.

The system shall not require machine learning to generate basic recommendations.

---

## FR-024 — Local Persistence

The system shall store learner progress locally.

The initial release shall not require:

- account creation;
- cloud authentication;
- a remote database.

---

## FR-025 — Settings

The application shall support configurable user preferences.

Potential settings include:

- terminal font size;
- terminal theme;
- sound;
- hints;
- UI density;
- reduced motion;
- preferred training mode.

---

## FR-026 — Diagnostics

The system shall provide a diagnostics view capable of reporting application-runtime compatibility.

The diagnostics shall include at minimum:

- WebAssembly availability;
- Web Worker availability;
- SharedArrayBuffer availability;
- cross-origin isolation;
- local persistence availability;
- shell runtime status.

---

## FR-027 — Runtime Capability Transparency

The application shall clearly indicate when a command or feature is:

```text
REAL
SIMULATED
UNSUPPORTED
```

Equivalent terminology may be used, provided the distinction remains clear.

---

## FR-028 — Application Meta Commands

SHELLGROUND may provide application-specific terminal commands.

Application commands shall use a distinct prefix.

Recommended examples:

```text
:help
:mission
:hint
:reset
:validate
:progress
:why
:drill
```

These commands shall not be presented as normal Linux commands.

---

# 7. Security Requirements

## SR-001 — Host Filesystem Protection

The shell runtime shall not receive unrestricted access to the host operating system filesystem.

---

## SR-002 — Host Process Protection

Training commands shall not be able to directly manipulate host operating-system processes.

---

## SR-003 — Network Default Deny

Arbitrary outbound network access shall be disabled in the initial product.

---

## SR-004 — No Inbound Network Exposure

The training runtime shall not expose listening services to arbitrary external clients.

---

## SR-005 — No Raw Socket Access

Raw network socket access shall not be provided in the MVP.

---

## SR-006 — No Arbitrary Package Sources

The user shall not be able to provide arbitrary remote runtime packages or executable package URLs for execution.

---

## SR-007 — Trusted Runtime Packages

Runtime packages used by the application shall be explicitly selected and version-controlled or version-pinned.

---

## SR-008 — Scenario Content Safety

Training scenarios shall be treated as declarative data.

Scenario definitions shall not be permitted to execute arbitrary JavaScript.

---

## SR-009 — Validator Safety

Validation logic shall be implemented by trusted application code.

Scenario files may select validator types and provide validator parameters, but shall not embed executable validators.

---

## SR-010 — Message Validation

Messages exchanged between the main application and runtime worker shall follow an explicit validated protocol.

---

## SR-011 — Synthetic Data

Any training data representing:

- passwords;
- credentials;
- tokens;
- keys;
- account information;

shall be synthetic.

---

## SR-012 — No Real Secrets

Real credentials, private tokens, API keys, or personal secrets shall never be included in official training content.

---

## SR-013 — Production Error Handling

Production error messages shall avoid exposing unnecessary internal implementation details.

---

## SR-014 — Browser Permission Minimization

The application shall not request unrelated browser permissions.

The MVP shall not require:

- camera;
- microphone;
- geolocation.

---

## SR-015 — Runtime Resource Cleanup

The application shall terminate runtime workers and associated resources when they are no longer required.

---

# 8. Non-Functional Requirements

## NFR-001 — Responsiveness

Terminal execution shall not freeze the primary interface during normal use.

---

## NFR-002 — Maintainability

The implementation shall separate:

- UI;
- terminal rendering;
- shell runtime;
- scenarios;
- validation;
- persistence;
- progress;
- mastery.

---

## NFR-003 — Extensibility

New labs shall be addable without rewriting the application core.

---

## NFR-004 — Testability

Core logic shall be designed for automated testing.

Examples:

- scenario parsing;
- validation;
- mastery;
- scoring;
- persistence;
- state transitions.

---

## NFR-005 — Determinism

Training scenarios marked deterministic shall produce the same starting state for the same version and seed.

---

## NFR-006 — Recoverability

A broken training session shall be recoverable through reset or restart.

---

## NFR-007 — Accessibility

Important controls shall be usable with a keyboard.

The terminal and surrounding UI shall maintain sufficient contrast.

---

## NFR-008 — Usability

The learner shall be able to launch a training session without navigating through excessive configuration.

---

## NFR-009 — Transparency

The system shall clearly communicate environmental differences between SHELLGROUND and a real Linux machine.

---

## NFR-010 — Local-First Operation

Core training functionality shall not require a remote account or cloud database.

---

## NFR-011 — Versioning

The project shall support versioning of:

- application;
- training content;
- lab schema;
- persistence schema;
- runtime compatibility information.

---

## NFR-012 — Browser Compatibility

The application shall support modern desktop browsers that provide the runtime capabilities required by the selected WebAssembly environment.

Unsupported browsers shall receive a clear compatibility message.

---

# 9. Learning Requirements

## LR-001 — Progressive Difficulty

Training shall progress from simple command use to more complex shell reasoning.

---

## LR-002 — Active Practice

The learner shall interact with commands rather than only read documentation.

---

## LR-003 — Repetition

Important concepts shall recur in multiple contexts.

---

## LR-004 — Reduced Guidance

The application shall gradually reduce assistance as proficiency improves.

---

## LR-005 — Transfer of Knowledge

Later exercises shall require combining previously learned concepts.

Example:

```text
find
+
grep
+
pipes
+
sort
+
redirect
```

---

## LR-006 — Problem-Oriented Learning

Advanced training should describe a problem rather than naming the exact command to use.

---

## LR-007 — Feedback

The learner shall receive feedback after completing or failing a scenario.

Feedback may include:

- whether the objective was met;
- concepts involved;
- hints used;
- relevant mistake category;
- recommendation for another attempt.

---

## LR-008 — Avoid Answer Memorization

The system should eventually support randomized scenario details to prevent users from memorizing fixed answers.

---

# 10. Data Requirements

## DR-001 — Local Training Data

The application shall maintain local records for:

- user settings;
- progress;
- mastery;
- session history;
- command statistics;
- content versions.

---

## DR-002 — Data Minimization

Only data necessary for training and product operation shall be stored.

---

## DR-003 — No Required Personally Identifiable Information

The MVP shall not require personally identifiable information.

---

## DR-004 — Resettable Training Data

The user should eventually be able to reset local training progress.

---

## DR-005 — Exportability

A future version should support exporting training progress in a portable format.

---

# 11. Content Requirements

## CR-001 — Structured Content

Official labs shall use a versioned structured format.

---

## CR-002 — Unique IDs

Every official lab shall have a unique identifier.

---

## CR-003 — Learning Concepts

Every lab shall declare the concepts it teaches or reinforces.

---

## CR-004 — Difficulty

Every lab shall declare difficulty.

Recommended levels:

```text
beginner
intermediate
advanced
```

---

## CR-005 — Validation

Every graded lab shall include one or more validation rules.

---

## CR-006 — Reset Support

Every lab shall support restoring the expected initial state.

---

## CR-007 — Reference Solution

Official labs shall include an internal reference solution or verification method for test purposes.

---

## CR-008 — Content Testing

Official content shall be validated automatically for:

- schema validity;
- unique IDs;
- fixture references;
- validator references;
- required fields;
- invalid paths.

---

# 12. Runtime Fidelity Requirements

## RF-001 — No False Equivalence

The system shall not claim to be a full Linux operating system.

---

## RF-002 — Explicit Runtime Classification

Runtime behaviors shall be classified as:

```text
native-wasix
simulated
unsupported
```

---

## RF-003 — Documentation

Runtime differences shall be documented.

---

## RF-004 — Command Verification

A command shall not be marked as natively supported until it has been verified using the selected runtime package.

---

## RF-005 — Simulation Labeling

Simulated commands shall display or otherwise expose that they operate against training data rather than real kernel facilities.

---

# 13. Constraints

## 13.1 Technical Constraints

The system shall avoid dependence on:

- native hypervisors;
- Linux host installation;
- WSL;
- remote shell services.

The selected browser runtime may impose differences from normal Linux behavior.

Those differences must be documented rather than hidden.

---

## 13.2 Scope Constraints

The first implementation shall focus on Linux command mastery.

The first implementation shall not expand into a complete cybersecurity training range.

---

## 13.3 Network Constraints

Real unrestricted networking shall remain outside the initial scope.

Networking concepts may be taught through:

- synthetic files;
- simulated command output;
- controlled fixtures.

---

## 13.4 Kernel Constraints

Features that require a real Linux kernel may be:

- simulated;
- deferred;
- unsupported.

---

# 14. Initial Acceptance Requirements

The first usable SHELLGROUND release shall not be considered acceptable unless all of the following are demonstrated.

## AR-001

The application loads successfully in a supported browser.

## AR-002

The required browser runtime capabilities are detected.

## AR-003

An interactive shell session can be launched.

## AR-004

Basic filesystem commands operate in the training environment.

## AR-005

Pipes and redirection operate sufficiently for the defined training curriculum.

## AR-006

At least one complete lab can be initialized, solved, validated, and reset.

## AR-007

Reset restores the expected environment.

## AR-008

Progress can be persisted locally.

## AR-009

The host filesystem is not exposed to the training environment.

## AR-010

Arbitrary networking is not enabled.

## AR-011

Runtime fidelity is visible to the learner.

## AR-012

Automated tests verify core scenario and validation behavior.

---

# 15. MVP Acceptance Baseline

A complete MVP shall additionally demonstrate:

- at least 20 official labs;
- structured training content;
- guided mode;
- free-practice mode;
- progress persistence;
- mastery tracking;
- diagnostics;
- deterministic reset;
- runtime fidelity reporting;
- automated content validation;
- successful production build.

---

# 16. Deferred Requirements

The following requirements are intentionally deferred until after the MVP:

- accounts;
- cloud synchronization;
- public profiles;
- multiplayer;
- classroom administration;
- public leaderboards;
- community-generated content;
- advanced networking labs;
- remote sandbox infrastructure;
- AI tutoring;
- adaptive ML models;
- offensive-security tool execution;
- container-backed full Linux labs.

These items shall not block the MVP.

---

# 17. Requirements Traceability Categories

Future project documents shall reference requirements using these prefixes:

```text
FR   Functional Requirement
SR   Security Requirement
NFR  Non-Functional Requirement
LR   Learning Requirement
DR   Data Requirement
CR   Content Requirement
RF   Runtime Fidelity Requirement
AR   Acceptance Requirement
```

Example:

```text
Architecture component:
ScenarioValidator

Satisfies:
FR-009
FR-010
CR-005
NFR-004
```

This traceability model shall be used in later:

- feature scope;
- architecture;
- database/content schema;
- SRS;
- SDD;
- implementation plan;
- test planning.

---

# 18. Requirements Baseline Summary

SHELLGROUND must provide:

```text
Safe browser-based shell practice
+
Virtual filesystem
+
Structured Linux command labs
+
Outcome validation
+
Resettable environments
+
Progress tracking
+
Mastery tracking
+
Runtime transparency
+
Local-first operation
+
Progressive difficulty
```

The project must remain focused on:

> **learning and mastering Linux command-line workflows without requiring a full Linux operating system.**

This requirements document defines **what the product must accomplish**.

It intentionally does not define the final feature implementation, software architecture, repository layout, persistence schema, UI implementation, or coding-agent workflow. Those belong to the subsequent project documents.
