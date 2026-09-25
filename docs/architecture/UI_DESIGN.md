# SHELLGROUND — UI Design Specification

> **Document:** UI Design Specification  
> **Project:** SHELLGROUND  
> **Sequence:** 8 of 13  
> **Depends on:**  
> - `SHELLGROUND_REQUIREMENTS.md`  
> - `SHELLGROUND_FEATURE_SCOPE.md`  
> - `SHELLGROUND_FULL_ARCHITECTURE.md`  
> - `SHELLGROUND_COMMAND_SUPPORT_MATRIX.md`  
> - `SHELLGROUND_CURRICULUM.md`  
> - `SHELLGROUND_REPOSITORY_STRUCTURE.md`  
> - `SHELLGROUND_DATABASE_CONTENT_SCHEMA.md`  
>
> **Status:** Draft UI Baseline  
> **Design Direction:** Terminal-first, technical, dark, minimal, high-contrast  
> **Purpose:** Define the information architecture, screens, interaction model, visual hierarchy, accessibility requirements, responsive behavior, and component structure for SHELLGROUND.

---

# 1. UI Objective

The SHELLGROUND interface must make command-line practice the center of the experience.

The UI must support this priority:

```text
Mission
+
Terminal
+
Immediate Training Feedback
```

Everything else is secondary.

The interface must not become:

- a dashboard-heavy learning management system;
- a Kali Linux visual clone;
- a game UI that distracts from the shell;
- a dense analytics product;
- a generic admin dashboard.

The terminal must remain visually and functionally dominant during training.

---

# 2. Core Design Principles

## UI-001 — Terminal First

The terminal is the primary interaction surface.

During an active lab:

```text
terminal space > supporting panel space
```

---

## UI-002 — Minimal Cognitive Load

The UI should avoid unnecessary:

```text
animations
gradients
large decorative cards
marketing copy
modal interruptions
```

---

## UI-003 — Technical Clarity

Labels should use direct technical language.

Good:

```text
Runtime: Ready
Network: Disabled
Lab Reset
Validate
Hint 1/3
```

Avoid:

```text
You're doing amazing!
Magic Sandbox
Power Mode
```

---

## UI-004 — Runtime Transparency

The interface must clearly expose:

```text
REAL
SIMULATED
NOT AVAILABLE
```

for commands/features where relevant.

---

## UI-005 — Progressive Disclosure

Show only what is needed for the current workflow.

Example:

Beginner:

```text
Mission
Concepts
Hints
Terminal
```

Advanced:

```text
Mission
Constraints
Terminal
```

---

## UI-006 — Keyboard First

The interface must support efficient keyboard use.

The learner should not need a mouse for normal training.

---

## UI-007 — Non-Destructive Navigation

Leaving a lab accidentally should not silently destroy active progress.

---

## UI-008 — Consistent Status Language

Use stable labels across the application.

Examples:

```text
Ready
Loading
Running
Validating
Passed
Retry
Runtime Error
Unsupported
Simulated
```

---

# 3. Visual Identity

## 3.1 Overall Style

Recommended:

```text
dark
technical
restrained
terminal-centric
high contrast
dense but readable
```

Avoid copying Kali branding, logos, exact color systems, wallpapers, or trademarks.

SHELLGROUND should establish its own identity.

---

## 3.2 Color System

Use semantic design tokens.

Recommended categories:

```text
background.primary
background.secondary
surface.default
surface.elevated
border.default

text.primary
text.secondary
text.muted

status.success
status.warning
status.error
status.info

fidelity.real
fidelity.simulated
fidelity.unsupported

terminal.background
terminal.foreground
terminal.cursor
terminal.selection
```

Exact colors belong to implementation.

---

## 3.3 Typography

Recommended split:

### UI Font

Clean sans-serif.

Examples:

```text
Inter
system-ui
Segoe UI
```

### Terminal Font

Monospace.

Examples:

```text
JetBrains Mono
Cascadia Code
Fira Code
ui-monospace
```

Do not bundle unlicensed fonts.

---

## 3.4 Typography Scale

Suggested hierarchy:

```text
App title          24–28px
Page title         20–24px
Section heading    16–18px
Body               14–16px
Secondary/meta     12–14px
Terminal           configurable 13–16px
```

---

# 4. Information Architecture

Primary top-level areas:

```text
Dashboard
Training
Playground
Mastery
Diagnostics
Settings
```

Optional future:

```text
Incidents
Exams
Content Packs
```

---

# 5. Primary Navigation

Desktop navigation may use:

```text
left sidebar
```

Recommended:

```text
SHELLGROUND
──────────────
Dashboard
Training
Playground
Mastery
Diagnostics
Settings
──────────────
Runtime: Ready
v0.1.0
```

---

# 6. Navigation Behavior

The active route must be visually clear.

Navigation items require:

- icon optional;
- label required;
- keyboard focus state;
- active state;
- accessible name.

---

# 7. Mobile Navigation

For narrow screens:

```text
top bar
+
drawer
```

Do not permanently consume horizontal terminal space with a sidebar.

---

# 8. Route Map

Recommended routes:

```text
/
  Dashboard

/training
  Lab Catalog

/training/:packId/:labId
  Training Workspace

/playground
  Playground

/mastery
  Mastery

/diagnostics
  Diagnostics

/settings
  Settings
```

Future:

```text
/incidents
/exams
```

---

# 9. Application Shell

Desktop baseline:

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ Main Content                                      │
│         │                                                   │
│         │                                                   │
│         │                                                   │
└──────────────────────────────────────────────────────────────┘
```

During active training, the shell may collapse/minimize the sidebar automatically.

---

# 10. Dashboard Purpose

The dashboard answers:

```text
What should I practice next?
What did I recently do?
Where am I weak?
Can the runtime run?
```

It should not overwhelm the user with charts.

---

# 11. Dashboard Layout

Recommended:

```text
┌────────────────────────────────────────────────────────────┐
│ SHELLGROUND                                                │
│ Linux Command Training Range                               │
├────────────────────────────────────────────────────────────┤
│ Continue Training                                          │
│ Linux Foundations — 7/20                                   │
│ [Resume]                                                   │
├───────────────────────┬────────────────────────────────────┤
│ Mastery Snapshot      │ Weak Areas                         │
│ Search      78%       │ 1. awk                             │
│ Streams     64%       │ 2. stderr redirection              │
│ Filesystem  88%       │ 3. permissions                     │
├───────────────────────┴────────────────────────────────────┤
│ Recent Sessions                                            │
│ Hidden Files       Passed     04:11                        │
│ Pipeline Basics    Retry      06:42                        │
│ Safe Copy          Passed     02:18                        │
└────────────────────────────────────────────────────────────┘
```

---

# 12. Dashboard Components

Required:

```text
ContinueTrainingCard
ProgressSummary
WeakAreasPanel
RecentSessionsList
RuntimeStatusBadge
```

Conditional:

```text
Streak
XP
Achievements
```

Not required for MVP.

---

# 13. Continue Training Card

Fields:

```text
pack
current stage
last lab
completion %
recommended next lab
```

Primary action:

```text
Resume
```

Secondary:

```text
View Labs
```

---

# 14. Progress Summary

Prefer simple indicators:

```text
7 / 20 labs
35% complete
```

Avoid implying:

```text
35% mastery
```

Completion and mastery are different.

---

# 15. Weak Areas Panel

Show:

```text
concept
mastery %
last practiced
```

Example:

```text
awk                   39%
stderr redirection    44%
permissions           47%
```

Action:

```text
Practice
```

This may route to relevant labs even before adaptive drill mode exists.

---

# 16. Recent Sessions

Display:

```text
lab title
outcome
duration
date/time
```

Do not display raw terminal history.

---

# 17. Training / Lab Catalog

Purpose:

Browse official labs.

Primary filters:

```text
pack
domain
difficulty
status
completion
fidelity
```

---

# 18. Lab Catalog Layout

Desktop:

```text
┌───────────────────────────────────────────────────────────┐
│ Training                                                  │
├───────────────────────────────────────────────────────────┤
│ Pack: Linux Foundations      Filter: All                 │
├───────────────────────────────────────────────────────────┤
│ 01 Where Am I?                Beginner      Completed    │
│ 02 Absolute vs Relative       Beginner      Completed    │
│ 03 Hidden Files               Beginner      In Progress  │
│ 04 Build the Directory Tree   Beginner      Not Started  │
│ ...                                                       │
└───────────────────────────────────────────────────────────┘
```

---

# 19. Lab Row/Card

Each item shows:

```text
sequence number
title
difficulty
concepts
status
estimated time
runtime fidelity requirements
```

Optional:

```text
best score
best time
```

---

# 20. Lab Status Labels

Use:

```text
Not Started
In Progress
Completed
Blocked
Experimental
```

---

# 21. Blocked Lab

If runtime capability prevents launch:

```text
Blocked
```

with reason:

```text
Requires native chmod support, which is not available in this runtime.
```

Do not let user launch a broken lab.

---

# 22. Training Workspace Objective

The training workspace is the most important screen.

Its job is to keep the learner focused on:

```text
mission
terminal
training controls
```

---

# 23. Training Workspace — Desktop Layout

Recommended:

```text
┌────────────────────────────────────────────────────────────────────┐
│ Hidden Evidence     Intermediate     REAL: find, grep     03:14   │
├───────────────────────┬────────────────────────────────────────────┤
│ MISSION               │                                            │
│                       │ student@shellground:~$                     │
│ Locate the hidden     │ █                                          │
│ evidence file...      │                                            │
│                       │                                            │
│ Concepts              │                                            │
│ find                  │                                            │
│ grep                  │                                            │
│ hidden files          │                                            │
│                       │                                            │
│ Hints 0/3             │                                            │
│                       │                                            │
│ [Hint]                │                                            │
│ [Reset]               │                                            │
├───────────────────────┴────────────────────────────────────────────┤
│ Runtime READY | Network OFF | Attempt 1 | [Validate]              │
└────────────────────────────────────────────────────────────────────┘
```

---

# 24. Layout Ratio

Suggested desktop ratio:

```text
Mission/support panel: 25–35%
Terminal:              65–75%
```

The terminal should never become a small embedded card.

---

# 25. Collapsible Mission Panel

The learner may collapse the mission panel.

Keyboard shortcut optional:

```text
Ctrl/Cmd + B
```

or another non-conflicting binding.

Collapsed state:

```text
terminal expands
mission remains accessible
```

---

# 26. Training Header

Contains:

```text
lab title
difficulty
mode
runtime/fidelity summary
elapsed time
```

Optional:

```text
pack/stage breadcrumb
```

---

# 27. Mission Panel Sections

Recommended order:

```text
Mission
Constraints
Concepts
Hints
Actions
```

---

# 28. Mission Text

Mission should be visually dominant within the side panel.

Use:

```text
short paragraphs
bullet constraints
monospace only for commands/paths
```

---

# 29. Concepts Section

Display concept chips or compact labels:

```text
find
grep
hidden files
absolute paths
```

Do not overload with dozens of tags.

---

# 30. Fidelity Badges

Example:

```text
find   REAL
grep   REAL
```

For simulated content:

```text
ip     SIMULATED
```

Badge should have tooltip/details.

---

# 31. Hint Interaction

Default:

```text
Hints 0/3
```

Click:

```text
Reveal Hint
```

Before revealing a penalized hint, optional confirmation:

```text
This hint reduces the maximum score by 5 points.
Reveal?
```

For beginner guided mode, confirmation may be unnecessary.

---

# 32. Hint Display

Show one revealed hint at a time.

Example:

```text
Hint 1

Hidden filenames typically begin with a dot.
```

Next control:

```text
Reveal Next Hint
```

---

# 33. Reset Interaction

Reset should never be triggered accidentally.

Recommended:

```text
Reset Lab
```

Confirmation:

```text
Reset this lab?
Your current sandbox changes will be discarded.
Your previous attempts remain recorded.
```

---

# 34. Validate Interaction

Primary training action:

```text
Validate
```

Keyboard shortcut may be:

```text
Ctrl/Cmd + Enter
```

if it does not conflict with terminal interaction.

Alternative:

```text
Alt + Enter
```

must be tested for browser/OS conflicts.

---

# 35. Validation In Progress

During validation:

```text
Validating...
```

Disable duplicate validation requests.

Terminal can remain visible.

Whether terminal input is temporarily paused depends on validation snapshot requirements.

---

# 36. Validation Failure

Do not use a generic red modal.

Preferred inline result:

```text
Not yet.

Expected:
A file named result.txt exists in /workspace/output.

Current:
No matching file exists.
```

Then:

```text
Try Again
```

---

# 37. Validation Success

Display:

```text
Objective complete
```

Then show:

```text
Score
Attempts
Hints
Duration
Concepts reinforced
Mastery changes
```

Action:

```text
Next Lab
Review
Return to Training
```

---

# 38. Results Panel

Can replace mission panel or appear as a dedicated post-lab screen.

Recommended:

```text
┌───────────────────────────────┐
│ Objective Complete            │
│                               │
│ Score            90 / 100     │
│ Attempts         2            │
│ Hints            1            │
│ Duration         05:42        │
│                               │
│ Mastery                       │
│ find             +4%          │
│ grep             +3%          │
│                               │
│ [Next Lab] [Review]           │
└───────────────────────────────┘
```

---

# 39. Reference Explanation

Post-completion may expose:

```text
View One Solution
```

Label deliberately:

```text
One Solution
```

not:

```text
The Correct Answer
```

---

# 40. Terminal Presentation

Recommended prompt:

```text
student@shellground:~$
```

Avoid:

```text
root@kali
```

unless explicitly simulating a specific lesson.

---

# 41. Terminal Controls

Avoid visible button clutter.

Minimal controls:

```text
Focus
Clear View
Reconnect if needed
```

Do not expose destructive/runtime internals prominently.

---

# 42. Terminal Clear

If native `clear` works, learner can use it.

UI may additionally offer:

```text
Clear Terminal View
```

This must not reset the filesystem or shell state.

---

# 43. Terminal Disconnection State

Show:

```text
Terminal disconnected
```

Actions:

```text
Reconnect
Restart Lab
View Diagnostics
```

---

# 44. Runtime Boot State

Before terminal is ready:

```text
Starting SHELLGROUND runtime...
Loading shell package...
Preparing training filesystem...
```

Avoid fake progress percentages unless actual progress is known.

---

# 45. Runtime Failure State

Example:

```text
Runtime could not start.

SharedArrayBuffer is unavailable because cross-origin isolation is disabled.

[Open Diagnostics]
```

Technical but actionable.

---

# 46. Playground Screen

Purpose:

Free shell experimentation.

Layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ Playground                                                   │
├──────────────────────────────────────────────────────────────┤
│ student@shellground:~$                                      │
│ █                                                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Network OFF | [Reset Playground] | [Command Reference]      │
└──────────────────────────────────────────────────────────────┘
```

---

# 47. Playground Rules

No:

```text
score
mission
pass/fail
```

Allow:

```text
experiment
reset
reference
```

---

# 48. Playground Reset

Confirmation may be lighter than graded lab reset.

Example:

```text
Reset playground filesystem?
```

---

# 49. Mastery Screen

Purpose:

Show competence, not engagement vanity metrics.

Recommended sections:

```text
Overall concept summary
Weak concepts
Strong concepts
Domains
Recent changes
```

---

# 50. Mastery Layout

```text
┌────────────────────────────────────────────────────────────┐
│ Mastery                                                    │
├────────────────────────────────────────────────────────────┤
│ Domain                Score       State                    │
│ Filesystem            82%         Proficient               │
│ Search                74%         Competent                │
│ Streams               61%         Practicing               │
│ Text Processing       48%         Practicing               │
│ Shell Variables       37%         Practicing               │
└────────────────────────────────────────────────────────────┘
```

---

# 51. Mastery Detail

Selecting a concept may show:

```text
mastery %
state
encounters
successes
blind successes
last practiced
recommended labs
```

---

# 52. Mastery Visualization

Preferred MVP:

```text
bars
tables
small sparklines only if useful
```

Avoid overly complex radar charts.

---

# 53. Completion vs Mastery UI

Must clearly separate:

```text
Pack Completion
and
Concept Mastery
```

Example:

```text
Linux Foundations
Completion: 70%
Mastery: 56%
```

Do not combine them into one ambiguous progress bar.

---

# 54. Diagnostics Screen

Purpose:

Explain whether SHELLGROUND can operate correctly.

Sections:

```text
Browser Capabilities
Runtime
Storage
Content
Security Boundary
Versions
```

---

# 55. Diagnostics Example

```text
Browser Capabilities

WebAssembly             PASS
Web Workers             PASS
SharedArrayBuffer       PASS
Cross-Origin Isolation  PASS
IndexedDB               PASS

Runtime

Adapter                  Wasmer
Status                   READY
Network                  DISABLED
Host Filesystem          DISABLED

Content

Pack                     linux-foundations 0.1.0
Schema                   1
```

---

# 56. Diagnostics Severity

Use:

```text
PASS
WARNING
FAIL
INFO
```

A failure must state whether it is blocking.

---

# 57. Fidelity Details

Diagnostics may include a searchable table:

```text
Command      Fidelity      Notes

grep         REAL          Verified
find         REAL          Verified
chmod        SIMULATED     Metadata only
systemctl    SIMULATED     Synthetic service model
tcpdump      NOT AVAILABLE No host packet access
```

---

# 58. Settings Screen

Sections:

```text
Appearance
Terminal
Training
Accessibility
Data
Diagnostics
```

---

# 59. Appearance Settings

MVP:

```text
Theme
UI font scale
Reduced motion
```

---

# 60. Terminal Settings

Possible:

```text
Terminal font size
Scrollback
Cursor style
High contrast
```

Do not expose dozens of terminal knobs initially.

---

# 61. Training Settings

Possible:

```text
Default training mode
Show fidelity badges
Confirm lab reset
Show estimated duration
```

---

# 62. Data Settings

Actions:

```text
Reset Training Progress
Reset All Local Data
```

Both require confirmation.

Future:

```text
Export Progress
Import Progress
```

---

# 63. Dangerous Settings Pattern

Reset actions must be placed in a clearly separated danger zone.

Example:

```text
Data Management
────────────────────
Reset Training Progress
Reset All Local Data
```

Do not place next to normal theme toggles.

---

# 64. Unsupported Browser Screen

If browser prerequisites fail:

```text
SHELLGROUND cannot start the training runtime in this browser configuration.
```

Show:

```text
WebAssembly             PASS
Web Workers             PASS
SharedArrayBuffer       FAIL
Cross-Origin Isolation  FAIL
IndexedDB               PASS
```

Then explain exact blocking reason.

---

# 65. Content Error State

If official content cannot load:

```text
Training content failed validation.
```

Show:

```text
Pack
Lab ID if known
Error code
```

Do not expose raw internal stack by default.

---

# 66. Empty States

Examples:

## No Recent Sessions

```text
No training sessions yet.
Start with Linux Foundations.
```

## No Weak Areas

```text
No weak areas identified yet.
Complete more labs to build a mastery profile.
```

## No Completed Labs

```text
No completed labs yet.
```

---

# 67. Loading States

Avoid global full-screen spinners for small operations.

Use local loading states.

Example:

```text
Loading lab...
Preparing runtime...
Loading progress...
```

---

# 68. Error State Language

Use specific descriptions.

Bad:

```text
Something went wrong.
```

Better:

```text
The runtime worker stopped unexpectedly.
Restart the lab to create a clean sandbox.
```

---

# 69. Toasts

Use toasts sparingly.

Good use:

```text
Settings saved
Progress restored
```

Bad use:

```text
Every command success
Every terminal event
```

---

# 70. Modal Policy

Modals reserved for:

```text
destructive confirmation
critical compatibility issue
leaving active lab with unsaved/runtime state
```

Avoid modal-based normal training flow.

---

# 71. Leaving an Active Lab

If learner navigates away:

```text
Leave this lab?
The current sandbox will be destroyed.
Progress from completed validations remains saved.
```

Actions:

```text
Stay
Leave Lab
```

---

# 72. Browser Refresh

If refresh destroys runtime:

On reload:

```text
Previous active runtime session ended.
You can restart the lab from its initial state.
```

Do not imply that ephemeral sandbox state was preserved if it was not.

---

# 73. Responsive Strategy

Primary target:

```text
desktop
```

because command training is keyboard/terminal intensive.

Tablet:

Supported where practical.

Mobile:

View progress, browse labs, diagnostics; terminal training may be constrained.

---

# 74. Desktop Breakpoint Behavior

Wide:

```text
sidebar
mission panel
terminal
```

Medium:

```text
collapsible sidebar
narrower mission panel
terminal
```

---

# 75. Narrow Screen Training

Use stacked or drawer design:

```text
Mission drawer
Terminal full-width
Bottom action bar
```

Do not split screen into unusably narrow columns.

---

# 76. Mobile Terminal Warning

If viewport is too narrow:

```text
Terminal training works best on a larger screen with a physical keyboard.
```

Still allow use if technically possible.

---

# 77. Keyboard Navigation

Required:

```text
Tab
Shift+Tab
Enter
Space
Escape
Arrow keys
```

for normal UI controls.

Terminal keystrokes must continue to work without the application hijacking shell input.

---

# 78. Global Shortcuts

Only use shortcuts unlikely to interfere with terminal usage.

Potential:

```text
Ctrl/Cmd + K   open command palette
Escape         close side panel/modal
```

Training-specific shortcuts should be configurable or carefully chosen.

---

# 79. Command Palette

Optional MVP feature.

Could expose:

```text
Go to Dashboard
Open Playground
Open Diagnostics
Reset Lab
Validate Lab
```

Not required.

---

# 80. Focus Management

When lab starts:

```text
focus terminal
```

After modal closes:

```text
return focus to prior control
```

After validation failure:

do not steal focus unexpectedly unless accessibility requires announcement.

---

# 81. Screen Reader Support

Key requirements:

- route changes announced;
- buttons have labels;
- runtime status exposed;
- validation result announced;
- terminal container has accessible label;
- fidelity badges include text.

---

# 82. Live Regions

Use ARIA live regions for:

```text
runtime ready
validation passed
validation failed
runtime error
```

Avoid announcing every terminal output line.

---

# 83. Color Accessibility

Never rely on color only.

Example:

```text
REAL
SIMULATED
NOT AVAILABLE
```

must be text labels.

---

# 84. Contrast

Meet WCAG contrast guidelines for UI text.

Terminal contrast should also be configurable.

---

# 85. Reduced Motion

If enabled:

disable/minimize:

```text
panel animation
progress transitions
success animation
```

---

# 86. Terminal Accessibility

Respect xterm accessibility capabilities.

Avoid unnecessary ligatures if they reduce character clarity.

Offer readable font size.

---

# 87. Component Inventory

Core UI components:

```text
AppShell
Sidebar
TopBar
PageHeader
StatusBadge
FidelityBadge
ProgressBar
MasteryBar
EmptyState
ErrorState
LoadingState
ConfirmDialog
```

---

# 88. Dashboard Components

```text
ContinueTrainingCard
ProgressSummary
WeakAreasPanel
RecentSessionsList
RuntimeStatusCard
```

---

# 89. Catalog Components

```text
LabCatalog
LabFilters
LabList
LabListItem
LabStatusBadge
DifficultyBadge
ConceptTag
```

---

# 90. Training Components

```text
TrainingWorkspace
TrainingHeader
MissionPanel
MissionObjective
ConstraintList
ConceptList
HintPanel
TrainingToolbar
ValidationPanel
ResultsPanel
RuntimeStatusStrip
```

---

# 91. Terminal Components

```text
TerminalView
TerminalContainer
TerminalStatus
TerminalDisconnectedState
```

Actual xterm ownership remains in `src/terminal/`.

---

# 92. Mastery Components

```text
MasterySummary
DomainMasteryTable
ConceptMasteryRow
WeakConceptsPanel
MasteryStateBadge
```

---

# 93. Diagnostics Components

```text
CapabilityTable
RuntimeDiagnosticsCard
StorageDiagnosticsCard
ContentVersionCard
FidelityTable
DiagnosticStatusBadge
```

---

# 94. Settings Components

```text
SettingsSection
ThemeSelector
TerminalSettingsForm
TrainingSettingsForm
DataManagementPanel
```

---

# 95. Design Token Categories

Recommended:

```text
--sg-color-bg
--sg-color-surface
--sg-color-border
--sg-color-text
--sg-color-muted

--sg-color-success
--sg-color-warning
--sg-color-error
--sg-color-info

--sg-space-1 ...
--sg-radius-sm
--sg-radius-md

--sg-font-ui
--sg-font-mono

--sg-terminal-bg
--sg-terminal-fg
```

---

# 96. Spacing

Use a compact scale.

Suggested:

```text
4
8
12
16
24
32
```

Terminal workspace should avoid excessive padding.

---

# 97. Border Radius

Prefer small/moderate radius.

Avoid large rounded consumer-app cards.

---

# 98. Shadows

Use sparingly.

Technical hierarchy should rely more on:

```text
contrast
borders
spacing
```

than large shadows.

---

# 99. Icons

Icons may support labels but should not replace them for important actions.

Example:

```text
[↻] Reset Lab
```

not icon-only unless tooltip/accessibility label exists.

---

# 100. Button Hierarchy

Primary:

```text
Validate
Next Lab
Resume
```

Secondary:

```text
Hint
Review
View Labs
```

Danger:

```text
Reset Lab
Reset Progress
```

---

# 101. Validation Button Placement

Keep visible without scrolling.

Preferred:

```text
bottom status/action bar
```

or training header depending viewport.

---

# 102. Runtime Status Strip

Example:

```text
Runtime READY | Network OFF | Lab 07 | Attempt 2 | 04:31
```

Keep compact.

---

# 103. Status Strip Semantics

Possible values:

```text
Runtime STARTING
Runtime READY
Runtime RESETTING
Runtime ERROR
Network OFF
Simulation ACTIVE
```

---

# 104. Fidelity Banner

For labs using simulation:

```text
This lab includes simulated Linux system state.
```

Allow:

```text
View Details
```

Do not display an alarming security warning for expected simulation.

---

# 105. Beginner Training Layout

May include:

```text
Mission
Concept explanation
Syntax example
Terminal
Hints
```

---

# 106. Intermediate Layout

Show:

```text
Mission
Concepts
Terminal
Hints collapsed
```

---

# 107. Advanced Layout

Show:

```text
Context
Objective
Constraints
Terminal
```

No command examples.

---

# 108. Exam Layout

Future:

```text
Question/lab number
Time
Terminal
Submit/Validate
```

Hide:

```text
Hints
Reference
Mastery changes during exam
```

---

# 109. Incident Layout

Future:

```text
Incident Brief
Objectives
Evidence Sources
Terminal
Notebook optional
```

---

# 110. Notification Strategy

Important persistent states should live in-page.

Example:

Runtime unsupported should not be a temporary toast.

---

# 111. Command Reference

If included:

```text
side drawer
```

rather than navigating away from active terminal.

Contents:

```text
command
purpose
common syntax
fidelity
```

Do not show full lab answer.

---

# 112. `:help` Integration

When SHELLGROUND meta-commands exist, UI documentation should distinguish:

```text
Linux commands
SHELLGROUND meta-commands
```

Example:

```text
:reset
:mission
:hint
```

---

# 113. `:why` UI

If implemented:

Command explanation may appear in:

```text
terminal output
or
side panel
```

Side panel is preferable for richer explanation.

---

# 114. Data Visualization Rules

Do not create complex analytics unless they answer a learner question.

Good:

```text
Which concepts are weak?
What changed recently?
What should I practice?
```

Bad:

```text
decorative chart with no training action
```

---

# 115. Mastery State Labels

Recommended:

```text
Unseen
Introduced
Practicing
Competent
Proficient
Mastered
Stale
```

Show state + score where useful.

---

# 116. Difficulty Labels

Use:

```text
Beginner
Intermediate
Advanced
```

Avoid:

```text
Easy
Medium
Hard
```

if pedagogical framing is preferable.

---

# 117. Estimated Duration

Show as:

```text
~5 min
~10 min
```

Do not present as deadline.

---

# 118. Progress Persistence UI

After successful save:

no intrusive message required.

If save fails:

```text
Progress not saved locally.
Your completed lab result is still visible in this session.
[Retry Save]
```

---

# 119. Storage Failure

If IndexedDB unavailable:

Training may continue if technically possible.

Show persistent warning:

```text
Local progress storage is unavailable.
Lab progress will not persist after this session.
```

---

# 120. Runtime Package Loading

If cold start is slow:

show meaningful stage text:

```text
Loading shell runtime
Preparing filesystem
Starting terminal
```

Do not show fake 87% progress.

---

# 121. Long Operation Cancellation

Potentially allow:

```text
Cancel
```

for runtime initialization/reset if technically safe.

Otherwise explain operation state.

---

# 122. Ctrl+C Support UI

If native interrupt is verified:

do nothing special.

If not:

provide:

```text
Stop Process
```

with clear label.

Do not pretend Ctrl+C works if it does not.

---

# 123. Command Failure UI

Normal shell command failures belong in terminal output.

The surrounding UI should not convert every nonzero command exit into an application error.

---

# 124. Validation vs Shell Errors

Important distinction:

```text
Shell command failed
≠
Lab failed
```

The user may intentionally run incorrect commands during learning.

---

# 125. Breadcrumbs

Optional:

```text
Training / Linux Foundations / Search / Find the Needle
```

Useful on desktop.

Not required in terminal-focused narrow view.

---

# 126. Back Navigation

The UI must provide an explicit way to leave a lab.

Recommended:

```text
← Training
```

If runtime active, trigger leave confirmation.

---

# 127. Session Resume

MVP should not claim to resume ephemeral sandbox state after browser close.

"Resume" may mean:

```text
return to the lab from its initial fixture
```

unless runtime persistence is later implemented.

Label accordingly.

---

# 128. Recent Session Details

Clicking recent session may show:

```text
lab
outcome
duration
score
hints
mastery changes
runtime/content version
```

Do not show full command transcript by default.

---

# 129. Content Version UI

Diagnostics only by default.

No need to show pack version in every lab card.

---

# 130. Runtime Version UI

Diagnostics only unless troubleshooting.

---

# 131. Security Boundary UI

Diagnostics may explicitly show:

```text
Host Filesystem: Disabled
External Network: Disabled
Camera: Not Requested
Microphone: Not Requested
```

This reinforces sandbox transparency.

---

# 132. First-Run Experience

Recommended first launch:

```text
Welcome to SHELLGROUND

Practice Linux commands in a browser-based sandbox.
No VM or Linux installation required.

[Run Compatibility Check]
```

After pass:

```text
[Start Linux Foundations]
[Open Playground]
```

---

# 133. First-Run Avoidances

Do not force:

```text
account creation
profile creation
tutorial carousel
marketing onboarding
```

---

# 134. First Lab UX

The first lab should briefly explain:

```text
Mission panel
Terminal
Validate button
Reset button
Hints
```

Then get out of the way.

---

# 135. Persistent Help

Provide:

```text
?
```

or:

```text
Help
```

link to:

```text
UI controls
SHELLGROUND meta-commands
runtime limitations
```

---

# 136. Empty Mastery State

Before enough data exists:

```text
Mastery data will appear after you complete several labs.
```

Do not calculate misleading scores from one attempt.

---

# 137. Empty Diagnostics State

Diagnostics should always provide something, even if runtime not initialized.

Example:

```text
Runtime: Not Started
```

not empty screen.

---

# 138. Error Codes

Technical errors may expose stable codes:

```text
SG-RUNTIME-001
SG-CONTENT-003
SG-STORAGE-002
```

Useful for documentation and issue reports.

---

# 139. User-Facing Error Format

Example:

```text
Runtime failed to start
SG-RUNTIME-001

Cross-origin isolation is disabled.

[Open Diagnostics]
[Retry]
```

---

# 140. Developer Details

Advanced diagnostics may include:

```text
Copy Diagnostic Report
```

This report should exclude sensitive learner input by default.

---

# 141. Responsive Component Priority

When width decreases, preserve in order:

```text
1. Terminal
2. Mission
3. Validation controls
4. Runtime status
5. Concepts
6. Secondary analytics
```

---

# 142. Desktop Minimum

Target usable training width:

```text
>= 1024px
```

Prefer:

```text
1280px+
```

for comfortable split workspace.

---

# 143. Tablet

Mission panel may become a drawer.

Terminal remains full-width.

---

# 144. Mobile

Training usable only as best effort.

Priority mobile features:

```text
browse labs
view progress
view mastery
diagnostics
settings
```

Terminal training may show advisory.

---

# 145. Accessibility Acceptance Criteria

Core UI passes when:

- keyboard navigation reaches all non-terminal controls;
- focus indicators visible;
- validation result announced;
- runtime state announced;
- color not sole indicator;
- contrast adequate;
- terminal has accessible label;
- destructive actions require confirmation;
- reduced-motion preference respected.

---

# 146. UI Testing Targets

Component tests:

```text
status labels
fidelity badges
hint sequencing
confirm dialog
empty/error states
```

E2E:

```text
navigate catalog
launch lab
terminal focus
request hint
reset lab
validate fail
validate pass
open mastery
open diagnostics
```

---

# 147. Visual Regression Targets

Optional but useful later:

```text
Dashboard
Lab Catalog
Training Workspace
Validation Failure
Validation Success
Diagnostics
Unsupported Browser
```

---

# 148. UI Performance Requirements

Avoid re-rendering terminal on every unrelated state update.

xterm instance should remain lifecycle-managed outside normal React render churn.

---

# 149. Terminal Resize Behavior

Use ResizeObserver or equivalent.

Update:

```text
xterm dimensions
runtime PTY dimensions
```

together where supported.

---

# 150. Scroll Behavior

Terminal scroll remains independent from mission panel scroll.

Avoid page-level scroll during active desktop training when possible.

---

# 151. Mission Panel Scrolling

If mission/hints exceed height:

```text
panel scrolls
terminal remains fixed
```

---

# 152. Results Transition

On success:

Do not immediately destroy terminal.

Allow learner to inspect final state.

Recommended:

```text
Results side panel
+
Terminal remains available read-only or active until Next Lab
```

Exact behavior can be tuned.

---

# 153. Post-Completion Terminal

Options:

```text
keep interactive
or
freeze
```

Recommended MVP:

```text
keep interactive until user leaves
```

but validation state remains completed.

---

# 154. Revalidate After Completion

Not required.

If learner mutates environment after completion, completion remains historically recorded.

---

# 155. Retry After Failure

Failure should leave sandbox intact unless validator itself requires otherwise.

The learner can continue correcting the state.

---

# 156. Attempt Count

Increment when:

```text
Validate
```

returns a normal failure.

Do not increment on:

```text
runtime error
content error
storage error
```

---

# 157. Hint Count

Increment only when a new hint is revealed.

Reopening an already revealed hint does not increment.

---

# 158. Accessibility of Terminal Output

Do not mirror all output into visible duplicate text solely for accessibility.

Use xterm accessibility capabilities and focus on surrounding status announcements.

---

# 159. UI Security Rules

Never render content with unsafe HTML.

Mission/hint Markdown, if added, must be sanitized.

Never create clickable links from arbitrary terminal escape sequences without explicit safe handling.

---

# 160. Terminal Escape Safety

xterm options and addons must be reviewed for dangerous link handling.

Do not automatically open arbitrary URLs produced by guest commands.

---

# 161. Clipboard Policy

Normal browser copy is allowed.

Paste into terminal is allowed through user gesture.

The application should not read clipboard silently.

---

# 162. Drag-and-Drop

Not required for MVP.

Future local fixture import must have strict security design.

---

# 163. File Upload

Not required for MVP.

This avoids mixing host data with the sandbox boundary.

---

# 164. Theme Baseline

MVP needs:

```text
Dark
High Contrast
```

Light theme optional.

---

# 165. Default Theme Character

Recommended appearance:

```text
near-black background
neutral dark panels
subtle borders
high legibility
restrained accent
```

Do not imitate Kali's exact theme.

---

# 166. Branding

Display:

```text
SHELLGROUND
```

Subheading:

```text
Linux Command Training Range
```

Possible terminal identity:

```text
student@shellground
```

---

# 167. Logo

Optional.

If created later, use an original symbol.

Do not use Kali dragon or Debian logos.

---

# 168. Dashboard Priority Order

Recommended visual hierarchy:

```text
1. Continue Training
2. Weak Areas
3. Progress
4. Recent Sessions
5. Runtime status
```

---

# 169. Catalog Priority Order

```text
1. Lab title
2. Completion state
3. Difficulty
4. Concepts
5. Estimated time
6. Fidelity details
```

---

# 170. Training Priority Order

```text
1. Terminal
2. Objective
3. Validate
4. Constraints
5. Hints
6. Concepts
7. Metadata
```

---

# 171. Mastery Priority Order

```text
1. Weak areas
2. Domain mastery
3. Concept detail
4. Historical trend
```

---

# 172. Diagnostics Priority Order

```text
1. Blocking capability failures
2. Runtime readiness
3. Security boundary
4. Version info
5. Detailed fidelity table
```

---

# 173. Design Anti-Patterns

Avoid:

```text
large hero banners
gamified confetti every lab
fake hacking animations
Matrix rain
neon overload
red/green-only status
tiny terminal cards
multiple simultaneous terminal panes
floating buttons covering terminal
modal-heavy lab flow
```

---

# 174. UX Anti-Patterns

Avoid:

```text
forcing mouse use
forcing account creation
auto-revealing answers
hiding simulation status
calling every failed validation an error
discarding lab state without confirmation
mixing completion with mastery
```

---

# 175. MVP UI Scope

Mandatory:

```text
App Shell
Dashboard
Lab Catalog
Training Workspace
Playground
Mastery
Diagnostics
Settings

Mission Panel
Terminal
Hints
Reset
Validate
Results
Fidelity Badges
Runtime Status
Error/Loading/Empty States
```

---

# 176. Conditional UI Scope

May ship if time permits:

```text
Command Reference
:why side panel
Command Palette
Light Theme
Detailed session history view
```

---

# 177. Deferred UI Scope

Post-MVP:

```text
Exam UI
Incident UI
Achievement UI
Advanced charts
Content pack manager
Progress export/import UI
Account/cloud sync UI
```

---

# 178. Main User Flow — First Session

```text
Open App
↓
Compatibility Check
↓
Dashboard
↓
Start Linux Foundations
↓
Open Lab 1
↓
Runtime Starts
↓
Terminal Focus
↓
Execute Commands
↓
Validate
↓
Pass
↓
Results
↓
Next Lab
```

---

# 179. Main User Flow — Returning User

```text
Open App
↓
Dashboard
↓
Resume
↓
Recommended Lab
↓
Runtime Starts
↓
Practice
↓
Progress Updates
```

---

# 180. Main User Flow — Runtime Failure

```text
Open Lab
↓
Runtime Start
↓
Failure
↓
Error State
↓
Diagnostics
↓
Actionable Fix / Retry
```

---

# 181. Main User Flow — Weak Area

```text
Dashboard
↓
Weak Areas
↓
Select Concept
↓
Relevant Labs
↓
Practice
```

Full adaptive drill mode remains future work.

---

# 182. UI State Machine — Training

```text
IDLE
↓
LOADING
↓
READY
↓
ACTIVE
├── VALIDATING
│   ├── ACTIVE
│   └── COMPLETED
├── RESETTING
│   └── ACTIVE
└── ERROR
```

Each state must have a visible UI representation.

---

# 183. ACTIVE State

Show:

```text
mission
terminal
hint/reset/validate controls
runtime status
```

---

# 184. VALIDATING State

Show:

```text
validation progress
disable duplicate Validate
```

---

# 185. RESETTING State

Show:

```text
Resetting sandbox...
```

Temporarily disable input if runtime unavailable.

---

# 186. COMPLETED State

Show:

```text
results
next lab
review
```

---

# 187. ERROR State

Show:

```text
specific error
error code
recovery action
diagnostics action
```

---

# 188. Fidelity UI Contract

Internal:

```text
native-wasix
simulated
unsupported
unverified
```

Public:

```text
REAL
SIMULATED
NOT AVAILABLE
```

`unverified` should not appear in stable user-facing curriculum.

---

# 189. Final Desktop Wireframe

```text
┌────────────────────────────────────────────────────────────────────────┐
│ SHELLGROUND        Linux Foundations / Search / Hidden Evidence       │
├───────────────┬────────────────────────────────────────────────────────┤
│ MISSION       │ student@shellground:~$                                │
│               │ █                                                      │
│ Locate the    │                                                        │
│ hidden file   │                                                        │
│ containing    │                                                        │
│ ACCESS...     │                                                        │
│               │                                                        │
│ CONCEPTS      │                                                        │
│ find   REAL   │                                                        │
│ grep   REAL   │                                                        │
│               │                                                        │
│ HINTS 0/3     │                                                        │
│ [Reveal Hint] │                                                        │
│               │                                                        │
│ [Reset Lab]   │                                                        │
├───────────────┴────────────────────────────────────────────────────────┤
│ Runtime READY | Network OFF | Attempt 1 | 03:14 | [Validate]          │
└────────────────────────────────────────────────────────────────────────┘
```

---

# 190. Final Mobile/Narrow Wireframe

```text
┌───────────────────────────────┐
│ Hidden Evidence        [≡]    │
├───────────────────────────────┤
│ student@shellground:~$        │
│ █                             │
│                               │
│                               │
├───────────────────────────────┤
│ [Mission] [Hint] [Validate]   │
│ Runtime READY                 │
└───────────────────────────────┘
```

Mission opens as drawer/sheet.

---

# 191. UI Acceptance Criteria

The UI design is accepted when it supports:

1. compatibility checks;
2. clear navigation;
3. lab discovery;
4. terminal-first training;
5. mission visibility;
6. hint progression;
7. reset confirmation;
8. validation failure;
9. validation success;
10. results;
11. mastery review;
12. diagnostics;
13. settings;
14. fidelity transparency;
15. keyboard-first use;
16. accessible status communication;
17. responsive terminal-first layout;
18. actionable error states.

---

# 192. Final UI Decision

SHELLGROUND shall use a:

```text
dark
technical
terminal-first
minimal
high-contrast
keyboard-focused
transparent
```

interface.

The training workspace is the central product surface.

The design must reinforce:

> **Solve the problem in the shell.**

The UI exists to provide context, validation, feedback, and progress—not to replace command-line practice.

---

# 193. Next Document

The next document in sequence is:

```text
9. MVP PHASES
```

That document will define:

- project phases;
- phase goals;
- dependencies;
- deliverables;
- acceptance gates;
- sequencing;
- release milestones;
- scope boundaries per phase;
- technical risk gates;
- criteria for moving from spike to product implementation.

It will not yet replace the later formal SPMP/SRS/SDD documents.
