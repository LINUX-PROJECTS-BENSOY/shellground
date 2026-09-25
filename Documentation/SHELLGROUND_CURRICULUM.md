# SHELLGROUND — Curriculum Specification

> **Document:** Curriculum Specification  
> **Project:** SHELLGROUND  
> **Sequence:** 5 of 13  
> **Depends on:** `SHELLGROUND_REQUIREMENTS.md`, `SHELLGROUND_FEATURE_SCOPE.md`, `SHELLGROUND_FULL_ARCHITECTURE.md`, `SHELLGROUND_COMMAND_SUPPORT_MATRIX.md`  
> **Status:** Draft Curriculum Baseline  
> **Purpose:** Define how SHELLGROUND teaches Linux command-line skills, how concepts are sequenced, how mastery is measured, and how labs evolve from guided practice to independent problem solving.

---

# 1. Curriculum Objective

The SHELLGROUND curriculum is designed to develop practical Linux command-line fluency rather than command memorization.

The learner should progress from:

```text
recognizing commands
        ↓
using single commands
        ↓
combining commands
        ↓
reasoning about shell state
        ↓
solving filesystem/text problems
        ↓
troubleshooting
        ↓
analyzing system-like evidence
        ↓
working independently
```

The curriculum must teach transferable Linux/POSIX habits while remaining explicit about browser-runtime limitations.

---

# 2. Curriculum Principles

## CP-001 — Practice Before Explanation Overload

Each concept should be introduced with the minimum explanation needed to begin meaningful practice.

The learner should spend more time:

```text
typing
observing
debugging
retrying
combining
```

than reading long theoretical material.

---

## CP-002 — Progressive Reduction of Guidance

Each topic should move through:

```text
Learn
↓
Guided
↓
Hinted
↓
Blind
↓
Mixed
↓
Incident
↓
Assessment
```

The same concept should not remain permanently guided.

---

## CP-003 — Master Concepts, Not Syntax Fragments

The curriculum should organize around capabilities such as:

```text
navigate a filesystem
locate data
transform text
control output streams
reason about permissions
write reusable shell logic
analyze logs
```

Commands are tools within these capabilities.

---

## CP-004 — Reinforcement Through Reuse

Once a concept is introduced, later labs should continue using it.

Example:

`grep` is introduced in search training, then reused in:

- logs;
- pipelines;
- scripting;
- troubleshooting;
- defensive analysis.

---

## CP-005 — Prefer Problems Over Instructions

Beginner lab:

```text
Use pwd to display the current directory.
```

Later lab:

```text
Determine where the shell session starts.
```

Advanced lab:

```text
Find the configuration file relative to your current location and print its absolute path.
```

---

## CP-006 — Allow Multiple Correct Solutions

Whenever the learning objective is outcome-based, the learner should be free to choose valid commands.

Example:

A text-counting problem may be solved with:

```text
grep + wc
awk
sed + wc
```

if all approaches meet the stated objective.

---

## CP-007 — Explicit Fidelity

A concept that depends on simulation must be labeled.

Example:

```text
systemctl → SIMULATED
ip → SIMULATED
df → SIMULATED
```

The curriculum must not blur synthetic system state with a real Linux kernel.

---

## CP-008 — Strong Foundation Before Security Tooling

The curriculum prioritizes:

```text
shell
filesystem
text
process reasoning
permissions
scripting
logs
troubleshooting
```

before introducing security-oriented analysis.

---

# 3. Learning Domains

The curriculum is divided into the following domains.

```text
D0  Terminal Fundamentals
D1  Filesystem Navigation
D2  File Operations
D3  Text Inspection
D4  Search and Filtering
D5  Streams and Redirection
D6  Text Transformation
D7  Permissions and Metadata
D8  Environment and Shell Behavior
D9  Processes and Execution
D10 Archives and Integrity
D11 Shell Scripting
D12 Logs and Evidence
D13 Networking Concepts
D14 System Administration Concepts
D15 Troubleshooting
D16 Defensive Security Analysis
D17 Digital Forensics Foundations
D18 Challenge / CTF Shell
D19 Mastery
```

---

# 4. Difficulty Model

Labs use three public difficulty levels.

```text
Beginner
Intermediate
Advanced
```

Internally, the curriculum may also use progression ranks.

```text
R0 Orientation
R1 Operator
R2 Technician
R3 Analyst
R4 Troubleshooter
R5 Shell Practitioner
R6 Investigator
R7 Independent
```

The rank system is optional UI presentation and does not change curriculum logic.

---

# 5. Training Modes

## 5.1 Learn Mode

Purpose:

Introduce a new concept.

Characteristics:

- concise explanation;
- examples;
- one or two commands;
- immediate practice;
- no time pressure.

---

## 5.2 Guided Lab

Purpose:

Apply a newly introduced concept.

Characteristics:

- explicit objective;
- concept reminders;
- optional command suggestions;
- hints;
- immediate validation.

---

## 5.3 Hinted Lab

Purpose:

Reduce dependency on instructions.

Characteristics:

- objective;
- no exact command solution;
- progressive hints;
- normal validation.

---

## 5.4 Blind Lab

Purpose:

Test independent command selection.

Characteristics:

- mission only;
- constraints;
- no suggested commands;
- optional emergency hint;
- stronger scoring penalty for hints.

---

## 5.5 Mixed Lab

Purpose:

Combine concepts from multiple domains.

Example:

```text
find
grep
sort
uniq
redirection
```

---

## 5.6 Incident Lab

Purpose:

Present an operational problem rather than a command objective.

Example:

```text
Authentication failures increased after 02:00.
Determine the source user and affected log entries.
```

---

## 5.7 Exam Mode

Purpose:

Measure retained competence.

Characteristics:

- no normal hints;
- multi-lab set;
- cumulative score;
- time tracked;
- concept-level result summary.

---

# 6. Mastery Model

Each concept has a mastery state.

Recommended internal states:

```text
UNSEEN
INTRODUCED
PRACTICING
COMPETENT
PROFICIENT
MASTERED
STALE
```

---

# 7. Mastery Transitions

## UNSEEN → INTRODUCED

Triggered when:

- concept lesson is opened;
- learner completes first guided example.

---

## INTRODUCED → PRACTICING

Triggered after:

- at least one lab attempt.

---

## PRACTICING → COMPETENT

Suggested gate:

- at least 3 successful encounters;
- success rate ≥ 70%;
- no more than moderate hint use.

---

## COMPETENT → PROFICIENT

Suggested gate:

- at least 5 successful encounters;
- recent success rate ≥ 80%;
- at least 2 blind/mixed successes;
- low hint dependency.

---

## PROFICIENT → MASTERED

Suggested gate:

- at least 8 successful encounters;
- at least 3 distinct context types;
- at least 2 advanced mixed labs;
- success without direct guidance.

---

## Any → STALE

If not practiced for a configured time window.

Example:

```text
30–60 days
```

The exact decay policy belongs to the later database/content schema and mastery implementation.

---

# 8. Mastery Evidence

A concept should not be marked mastered from one easy lab.

Evidence should include diversity.

Example for `grep`:

```text
simple search
case-insensitive search
pipeline search
recursive search
log analysis
mixed troubleshooting
```

---

# 9. Curriculum Prerequisite Graph

High-level dependency graph:

```text
Terminal Fundamentals
        ↓
Filesystem Navigation
        ↓
File Operations
        ↓
Text Inspection
        ↓
Search
        ↓
Streams / Redirection
        ↓
Text Transformation
        ↓
Environment / Shell Behavior
        ↓
Shell Scripting
        ↓
Logs / Troubleshooting
        ↓
Defensive Analysis
        ↓
Forensics
        ↓
Mastery
```

Parallel branches:

```text
Filesystem Navigation
        ↓
Permissions
        ↓
Troubleshooting
```

and:

```text
Streams
   ↓
Processes
   ↓
Administration Concepts
```

---

# 10. Domain D0 — Terminal Fundamentals

## 10.1 Learning Goals

The learner should understand:

- prompt structure;
- current working directory;
- command name;
- arguments;
- flags/options;
- shell exit status;
- command help;
- terminal clearing;
- command history concept.

---

## 10.2 Command Targets

Primary:

```text
pwd
echo
printf
exit
```

Conditional:

```text
history
help
clear
```

---

## 10.3 Concepts

```text
shell prompt
command invocation
argument
option
stdout
stderr
exit status
```

---

## 10.4 Beginner Labs

### LAB-D0-001 — First Contact

Objective:

```text
Print the current directory.
```

Primary concept:

```text
pwd
```

Mode:

```text
Guided
```

---

### LAB-D0-002 — Say Something

Objective:

```text
Print the phrase SHELLGROUND READY.
```

Primary concept:

```text
echo
```

---

### LAB-D0-003 — Exit Status

Objective:

Observe the difference between success and failure.

Commands:

```text
true
false
echo $?
```

Fidelity dependency:

P0 exit-code semantics.

---

## 10.5 Mastery Gate

Learner should be able to:

- identify current directory;
- run a command with arguments;
- distinguish stdout and command failure conceptually;
- explain that `0` usually means success.

---

# 11. Domain D1 — Filesystem Navigation

## 11.1 Learning Goals

Understand:

```text
/
.
..
~
absolute paths
relative paths
hidden files
directory traversal
```

---

## 11.2 Commands

```text
pwd
cd
ls
basename
dirname
```

Preferred:

```text
readlink
realpath
```

---

## 11.3 Lab Sequence

### LAB-D1-001 — Where Am I?

Find current directory.

Mode:

Guided.

---

### LAB-D1-002 — Absolute vs Relative

Navigate to target directory using:

1. absolute path;
2. relative path.

---

### LAB-D1-003 — Hidden Files

Find hidden files under the current directory.

Expected concepts:

```text
ls -a
dotfiles
```

---

### LAB-D1-004 — Parent Traversal

Reach a target using:

```text
..
```

---

### LAB-D1-005 — Path Reconstruction

Given nested paths, identify the absolute path of a target file.

Mode:

Hinted.

---

## 11.4 Blind Gate

Mission example:

```text
Locate reports/final.txt starting from your home directory and print its absolute path.
```

Do not specify `cd`, `pwd`, or `ls`.

---

# 12. Domain D2 — File Operations

## 12.1 Learning Goals

The learner should confidently:

```text
create
copy
rename
move
delete
organize
```

files and directories.

---

## 12.2 Commands

```text
touch
mkdir
rmdir
cp
mv
rm
ln
```

`ln` is conditional on verified link semantics.

---

## 12.3 Labs

### LAB-D2-001 — Build the Directory Tree

Create:

```text
project/
├── input/
├── output/
└── archive/
```

Commands:

```text
mkdir
mkdir -p
```

---

### LAB-D2-002 — Safe Copy

Copy a source file while preserving the original.

---

### LAB-D2-003 — Rename and Move

Move several files into required locations.

---

### LAB-D2-004 — Controlled Cleanup

Delete only explicitly identified temporary files.

Safety lesson:

```text
verify before destructive operations
```

---

### LAB-D2-005 — Recursive Copy

Copy a directory tree.

---

### LAB-D2-006 — Link Exercise

Conditional.

Practice:

```text
ln
ln -s
readlink
```

Only enabled if fidelity is verified.

---

## 12.4 Safety Principle

`rm` labs must explicitly teach:

```text
inspect target
then delete
```

rather than habitual use of broad recursive deletion.

---

# 13. Domain D3 — Text Inspection

## 13.1 Learning Goals

Inspect files efficiently without editing them.

---

## 13.2 Commands

```text
cat
head
tail
wc
```

Conditional:

```text
less
nl
```

---

## 13.3 Labs

### LAB-D3-001 — Read the File

Use `cat`.

---

### LAB-D3-002 — First Five Lines

Use:

```text
head
```

---

### LAB-D3-003 — Last Entries

Use:

```text
tail
```

---

### LAB-D3-004 — Count the Evidence

Determine:

```text
lines
words
bytes
```

using `wc`.

---

### LAB-D3-005 — Large File Triage

Given a larger text file:

- inspect start;
- inspect end;
- count lines;
- avoid dumping everything unnecessarily.

---

# 14. Domain D4 — Search and Filtering

## 14.1 Learning Goals

Find:

- files;
- directories;
- matching lines;
- matching patterns.

---

## 14.2 Commands

```text
grep
find
```

---

## 14.3 Regex Introduction

Introduce only basic regex initially.

Order:

```text
literal search
case sensitivity
anchors
character classes
alternation
```

---

## 14.4 Labs

### LAB-D4-001 — Find the Needle

Search a file for one keyword.

---

### LAB-D4-002 — Case-Insensitive Search

Use:

```text
grep -i
```

---

### LAB-D4-003 — Number the Matches

Use:

```text
grep -n
```

---

### LAB-D4-004 — Recursive Search

Search a directory tree.

---

### LAB-D4-005 — Find by Name

Use:

```text
find -name
```

---

### LAB-D4-006 — Find by Type

Use:

```text
find -type
```

---

### LAB-D4-007 — Hidden Evidence

Find a hidden file, then inspect contents.

Mixed concepts:

```text
find
hidden files
grep
```

---

# 15. Domain D5 — Streams and Redirection

## 15.1 Learning Goals

Understand:

```text
stdin
stdout
stderr
pipe
overwrite
append
input redirect
error redirect
```

---

## 15.2 Features

```text
|
>
>>
<
2>
2>>
tee
```

---

## 15.3 Labs

### LAB-D5-001 — Pipeline Basics

Sort provided lines using:

```text
producer | sort
```

---

### LAB-D5-002 — Redirect Correctly

Write command output to a file.

---

### LAB-D5-003 — Append Without Destroying

Use:

```text
>>
```

---

### LAB-D5-004 — Standard Error

Separate success output from error output.

---

### LAB-D5-005 — Tee the Stream

Save output while still displaying it.

---

### LAB-D5-006 — Three-Stage Pipeline

Example goal:

```text
extract matching rows
sort
count
```

---

## 15.4 Mastery Gate

Learner must be able to explain:

```text
pipe ≠ redirect
stdout ≠ stderr
> ≠ >>
```

and solve at least one blind pipeline lab.

---

# 16. Domain D6 — Text Transformation

## 16.1 Learning Goals

Transform structured and unstructured text.

---

## 16.2 Commands

```text
sort
uniq
cut
tr
sed
awk
```

Preferred:

```text
xargs
```

---

# 17. `sort` and `uniq` Module

## Labs

### LAB-D6-001 — Sort the Records

Sort alphabetically.

---

### LAB-D6-002 — Sort Numerically

Use numeric sorting.

---

### LAB-D6-003 — Deduplicate Correctly

Learner must discover:

```text
sort | uniq
```

when input is not already grouped.

---

### LAB-D6-004 — Frequency Count

Produce:

```text
count + unique value
```

---

# 18. `cut` Module

## Labs

### LAB-D6-005 — Extract the Column

Given:

```text
username:uid:shell
```

print only usernames.

---

### LAB-D6-006 — Character Slice

Extract selected character positions.

---

# 19. `tr` Module

## Labs

### LAB-D6-007 — Normalize Case

Convert lowercase to uppercase.

---

### LAB-D6-008 — Remove Delimiters

Delete or replace known characters.

---

# 20. `sed` Module

## Learning Goals

Use `sed` for:

- substitution;
- selected output;
- basic editing.

---

## Labs

### LAB-D6-009 — Replace the Token

Replace one occurrence.

---

### LAB-D6-010 — Replace All Matches

Use global substitution.

---

### LAB-D6-011 — Print a Range

Use:

```text
sed -n
```

---

# 21. `awk` Module

## Learning Goals

Use:

- fields;
- delimiters;
- conditions;
- calculations;
- output formatting.

---

## Labs

### LAB-D6-012 — Extract with AWK

Print first field.

---

### LAB-D6-013 — Custom Delimiter

Use:

```text
-F
```

---

### LAB-D6-014 — Conditional Rows

Print records matching a numeric condition.

---

### LAB-D6-015 — AWK Summary

Calculate a simple count or sum.

---

# 22. Domain D7 — Permissions and Metadata

## 22.1 Fidelity Caveat

This domain depends on runtime verification.

If permission enforcement is not sufficiently Linux-like:

```text
metadata behavior may be SIMULATED
```

The UI must label this.

---

## 22.2 Concepts

```text
r
w
x
owner
group
other
octal
file mode
directory execute semantics
```

---

## 22.3 Commands

Preferred:

```text
chmod
stat
ls -l
```

Deferred/simulated:

```text
chown
chgrp
```

---

## 22.4 Labs

### LAB-D7-001 — Read the Mode

Interpret:

```text
-rw-r-----
```

---

### LAB-D7-002 — Octal Conversion

Convert symbolic permissions to octal.

---

### LAB-D7-003 — Permission Repair

Set required mode.

---

### LAB-D7-004 — Executable Script

If native executable-bit semantics work:

```text
chmod +x script.sh
./script.sh
```

Otherwise teach:

```text
bash script.sh
```

and label executable-bit behavior separately.

---

# 23. Domain D8 — Environment and Shell Behavior

## 23.1 Concepts

```text
variables
environment
export
quoting
globbing
command substitution
arithmetic
exit status
PATH
```

---

## 23.2 Commands / Features

```text
env
export
unset
$VAR
${VAR}
$()
*
?
single quotes
double quotes
backslash
```

---

## 23.3 Labs

### LAB-D8-001 — Environment Variable Hunt

Find a configured variable.

---

### LAB-D8-002 — Export It

Create and export a variable.

---

### LAB-D8-003 — Quoting Matters

Demonstrate differences between:

```text
'$VAR'
"$VAR"
$VAR
```

---

### LAB-D8-004 — Globbing

Select files by pattern.

---

### LAB-D8-005 — Command Substitution

Use:

```text
$(...)
```

inside another command.

---

### LAB-D8-006 — PATH Reasoning

Inspect command resolution.

Conditional on stable `command -v`/`type`.

---

# 24. Domain D9 — Processes and Execution

## 24.1 Runtime Caveat

This domain is partially runtime-dependent.

Native process concepts should be taught where behavior is accurate.

Otherwise synthetic process scenarios may be used.

---

## 24.2 Concepts

```text
process
PID
foreground
background
exit
signal
interrupt
```

---

## 24.3 Commands

Candidate:

```text
sleep
ps
kill
jobs
fg
bg
```

---

## 24.4 Labs

### LAB-D9-001 — Sleeping Process

Launch a controlled process.

---

### LAB-D9-002 — Interrupt

Practice:

```text
Ctrl+C
```

if runtime supports it reliably.

---

### LAB-D9-003 — Background Job

Conditional.

---

### LAB-D9-004 — Process Investigation

Native if accurate; otherwise simulated.

---

# 25. Domain D10 — Archives and Integrity

## 25.1 Commands

```text
tar
gzip
gunzip
sha256sum
```

---

## 25.2 Labs

### LAB-D10-001 — Create an Archive

Archive a directory.

---

### LAB-D10-002 — Inspect Archive

List archive contents.

---

### LAB-D10-003 — Recover Archive

Extract files.

---

### LAB-D10-004 — Checksum Verification

Compare known SHA-256 hashes.

---

### LAB-D10-005 — Integrity Failure

Identify a modified file using checksum evidence.

---

# 26. Domain D11 — Shell Scripting

## 26.1 Goal

Move the learner from interactive command use to reusable shell automation.

---

## 26.2 Concepts

```text
script execution
variables
positional arguments
conditions
loops
functions
exit codes
```

---

# 27. Scripting Progression

```text
single command script
↓
variables
↓
arguments
↓
if/test
↓
for loop
↓
while loop
↓
functions
↓
multi-stage script
```

---

## 27.1 Labs

### LAB-D11-001 — First Script

Create and run:

```bash
echo "hello"
```

from a script file.

---

### LAB-D11-002 — Arguments

Use:

```text
$1
$2
$#
$@
```

---

### LAB-D11-003 — File Test

Check whether a file exists.

---

### LAB-D11-004 — Conditional Script

Use:

```text
if
then
else
fi
```

---

### LAB-D11-005 — Loop Through Files

Use:

```text
for
```

---

### LAB-D11-006 — Function

Define and call a shell function.

---

### LAB-D11-007 — Exit Correctly

Return meaningful status.

---

### LAB-D11-008 — Automation Challenge

Process a folder of files and write summarized output.

Mode:

Blind.

---

# 28. Domain D12 — Logs and Evidence

## 28.1 Goal

Apply general shell skills to realistic operational text.

---

## 28.2 Data Model

Logs are synthetic fixture files.

Examples:

```text
/var/log/auth.log
/var/log/app.log
/var/log/system.log
```

These are training artifacts, not real browser/host logs.

---

## 28.3 Skills Reused

```text
cat
head
tail
grep
cut
sort
uniq
awk
sed
wc
pipes
redirection
```

---

## 28.4 Labs

### LAB-D12-001 — Count Failures

Count matching error events.

---

### LAB-D12-002 — Extract Source IPs

Use structured log fields.

---

### LAB-D12-003 — Most Frequent Source

Pipeline:

```text
extract
sort
uniq -c
sort
```

---

### LAB-D12-004 — Time Window

Filter records within a specified interval.

---

### LAB-D12-005 — Authentication Investigation

Determine:

```text
user
source
timestamp
event count
```

---

# 29. Domain D13 — Networking Concepts

## 29.1 Fidelity

Networking is primarily simulated in MVP/post-MVP.

Commands such as:

```text
ip
ss
ping
dig
```

must be labeled SIMULATED unless a future controlled networking runtime is introduced.

---

## 29.2 Concepts

```text
interface
IP address
subnet
route
DNS
socket
port
TCP
UDP
```

---

## 29.3 Labs

Future examples:

### LAB-D13-001 — Read Interface State

Synthetic:

```text
ip addr
```

---

### LAB-D13-002 — Routing Decision

Synthetic:

```text
ip route
```

---

### LAB-D13-003 — Listening Services

Synthetic:

```text
ss -tulpn
```

---

### LAB-D13-004 — DNS Lookup

Synthetic deterministic DNS records.

---

# 30. Domain D14 — System Administration Concepts

## 30.1 Fidelity

Mostly simulated because browser runtime is not a Linux distribution with systemd and package management.

---

## 30.2 Concepts

```text
services
packages
configuration
disk capacity
users/groups
```

---

## 30.3 Simulated Commands

```text
systemctl
journalctl
df
apt-like workflows
user management
```

---

## 30.4 Goal

Teach:

```text
how to reason about command output
```

not pretend the browser sandbox is a real system service manager.

---

# 31. Domain D15 — Troubleshooting

## 31.1 Goal

Combine multiple command families to diagnose and correct a problem.

---

## 31.2 Troubleshooting Framework

Train the learner to follow:

```text
1. Observe
2. Narrow
3. Verify
4. Change
5. Re-verify
```

---

## 31.3 Labs

### LAB-D15-001 — Disk Usage Mystery

Use:

```text
du
find
sort
```

If `df` is simulated, label accordingly.

---

### LAB-D15-002 — Missing Configuration

Locate a file and repair a value.

---

### LAB-D15-003 — Permission Failure

Identify wrong mode and correct it.

---

### LAB-D15-004 — Broken Environment

Find incorrect environment variable.

---

### LAB-D15-005 — Duplicate Records

Identify and clean repeated entries.

---

### LAB-D15-006 — Wrong Output File

Trace a pipeline/redirection mistake.

---

# 32. Domain D16 — Defensive Security Analysis

## 32.1 Scope

This domain remains defensive and local.

It uses synthetic data.

No offensive target interaction is required.

---

## 32.2 Skills

```text
log filtering
hash verification
permission inspection
file search
timeline reasoning
pattern detection
```

---

## 32.3 Labs

### LAB-D16-001 — Suspicious Login

Identify abnormal authentication entry.

---

### LAB-D16-002 — World-Writable Files

Search synthetic fixture metadata.

---

### LAB-D16-003 — Modified Artifact

Use hashes.

---

### LAB-D16-004 — Hidden Persistence Clue

Find a hidden file and inspect contents.

---

### LAB-D16-005 — Failed Login Burst

Count and group repeated failures.

---

# 33. Domain D17 — Digital Forensics Foundations

## 33.1 Scope

Forensics exercises operate on local synthetic evidence.

No live host data collection is required.

---

## 33.2 Concepts

```text
hash
metadata
timestamps
artifact location
timeline
evidence preservation
```

---

## 33.3 Labs

### LAB-D17-001 — Hash the Evidence

Generate and compare SHA-256.

---

### LAB-D17-002 — File Timeline

Use metadata if runtime supports meaningful timestamps.

Otherwise use synthetic metadata fixtures.

---

### LAB-D17-003 — Evidence Search

Use `find` + text processing.

---

### LAB-D17-004 — Correlate Logs

Combine multiple files.

---

# 34. Domain D18 — Challenge / CTF Shell

## 34.1 Goal

Provide puzzle-like command challenges after sufficient foundation.

These are safe, local, and command-focused.

---

## 34.2 Example Challenges

```text
find a hidden token
decode structured data
follow symlinks
combine several filters
recover archived evidence
identify the only unique line
```

---

## 34.3 Design Rule

Challenges should test:

```text
shell reasoning
```

rather than obscure trivia.

---

# 35. Domain D19 — Mastery

## 35.1 Goal

Assess whether the learner can solve unfamiliar Linux command tasks without direct guidance.

---

## 35.2 Mastery Session

A mastery session may include:

```text
filesystem task
search task
pipeline task
text transformation
script task
log-analysis task
troubleshooting task
```

---

## 35.3 Mastery Characteristics

```text
minimal hints
randomized fixtures
mixed concepts
time measured
multiple valid solutions
```

---

# 36. Initial MVP Curriculum

The MVP requires a minimum of 20 official labs.

Recommended exact baseline:

---

## 36.1 Lab 01 — Where Am I?

Domain:

```text
D0/D1
```

Concepts:

```text
pwd
current working directory
```

Difficulty:

Beginner.

Mode:

Guided.

---

## 36.2 Lab 02 — Absolute vs Relative

Domain:

D1.

Concepts:

```text
cd
absolute path
relative path
..
```

---

## 36.3 Lab 03 — Hidden Files

Domain:

D1.

Concepts:

```text
ls -a
dotfiles
```

---

## 36.4 Lab 04 — Build the Directory Tree

Domain:

D2.

Commands:

```text
mkdir
mkdir -p
```

---

## 36.5 Lab 05 — Safe Copy

Domain:

D2.

Command:

```text
cp
```

---

## 36.6 Lab 06 — Rename and Move

Domain:

D2.

Command:

```text
mv
```

---

## 36.7 Lab 07 — Find the Needle

Domain:

D4.

Command:

```text
grep
```

---

## 36.8 Lab 08 — Recursive Search

Domain:

D4.

Commands:

```text
find
grep
```

---

## 36.9 Lab 09 — Count the Evidence

Domain:

D3/D5.

Commands:

```text
wc
grep
```

---

## 36.10 Lab 10 — Pipeline Basics

Domain:

D5.

Features:

```text
|
sort
```

---

## 36.11 Lab 11 — Redirect Correctly

Domain:

D5.

Features:

```text
>
>>
```

---

## 36.12 Lab 12 — Standard Error

Domain:

D5.

Feature:

```text
2>
```

---

## 36.13 Lab 13 — Sort and Deduplicate

Domain:

D6.

Commands:

```text
sort
uniq
```

---

## 36.14 Lab 14 — Extract the Column

Domain:

D6.

Command:

```text
cut
```

---

## 36.15 Lab 15 — Transform the Stream

Domain:

D6.

Primary command:

```text
sed
or
awk
```

Use whichever is verified first, then add the other later.

---

## 36.16 Lab 16 — Permission Repair

Domain:

D7.

Command:

```text
chmod
```

Only included as a REAL lab if runtime fidelity passes.

Fallback:

Replace with another verified shell concept and move permission repair to simulated/conditional content.

---

## 36.17 Lab 17 — Environment Variable Hunt

Domain:

D8.

Commands/features:

```text
env
export
$VAR
```

---

## 36.18 Lab 18 — Checksum Verification

Domain:

D10.

Command:

```text
sha256sum
```

or verified equivalent.

---

## 36.19 Lab 19 — Archive Recovery

Domain:

D10.

Command:

```text
tar
```

---

## 36.20 Lab 20 — Log Investigation

Domain:

D12.

Mixed:

```text
grep
cut
sort
uniq
wc
pipes
```

Mode:

Blind or lightly hinted.

---

# 37. MVP Curriculum Dependencies

```text
Lab 01
 ↓
Lab 02
 ↓
Lab 03
 ↓
Lab 04
 ↓
Lab 05
 ↓
Lab 06
 ↓
Lab 07
 ↓
Lab 08
 ↓
Lab 09
 ↓
Lab 10
 ↓
Lab 11
 ↓
Lab 12
 ↓
Lab 13
 ↓
Lab 14
 ↓
Lab 15
 ↓
Lab 17
 ↓
Lab 18
 ↓
Lab 19
 ↓
Lab 20
```

Lab 16 is conditional based on permission fidelity.

Not every lab must be hard-locked sequentially, but prerequisite recommendations should follow this order.

---

# 38. Guided-to-Blind Transition Rules

For each major concept:

```text
1 guided lab
1 hinted lab
1 blind or mixed encounter
```

before marking strong competence.

Example for `grep`:

```text
Guided:
Find exact keyword.

Hinted:
Find all errors case-insensitively.

Blind:
Determine which user has the most authentication failures.
```

---

# 39. Repetition Schedule

Each important command should appear in multiple later contexts.

Recommended minimum recurring exposure before mastery:

| Command / Concept | Suggested Successful Encounters |
|---|---:|
| `pwd` / navigation | 4 |
| `cd` | 6 |
| `ls` | 6 |
| `cp` / `mv` / `rm` | 4 each |
| `grep` | 8 |
| `find` | 6 |
| pipes | 8 |
| redirection | 6 |
| `sort` / `uniq` | 5 |
| `cut` | 4 |
| `sed` | 4 |
| `awk` | 5 |
| variables | 5 |
| shell scripting | 6 |
| log analysis | 5 |

These are curriculum targets, not hard-coded scoring values.

---

# 40. Interleaving Strategy

Avoid teaching all examples of one command consecutively forever.

After initial introduction, mix concepts.

Example:

```text
grep
↓
filesystem lab
↓
pipeline lab using grep
↓
permissions lab
↓
log lab using grep
```

This improves transfer.

---

# 41. Spaced Reinforcement

Post-MVP recommendation engine should reintroduce concepts based on:

```text
time since last success
mastery score
recent failures
hint dependence
```

Example:

```text
grep mastered 35 days ago
→ schedule one mixed reinforcement lab
```

---

# 42. Failure-Based Remediation

If learner fails the same concept repeatedly:

```text
Blind
↓
Hinted
↓
Guided refresher
```

Do not simply repeat the identical lab indefinitely.

---

# 43. Hint Design Rules

Hints must progress from conceptual to specific.

Bad:

```text
Run grep -R "error" /var/log
```

Good:

```text
Hint 1:
You need to search text rather than filenames.

Hint 2:
The relevant files are inside a directory tree.

Hint 3:
A recursive text-search option may help.
```

---

# 44. Solution Reveal Policy

MVP should not automatically reveal the complete solution after one failure.

Possible reveal conditions:

```text
multiple failed attempts
explicit learner request
lab review mode
```

Even then, prefer explanation over copy-paste answer.

---

# 45. Scoring Philosophy

Scores should reward:

- completing objective;
- reduced hint use;
- successful independent reasoning;
- improvement.

Scores should not excessively reward:

- fewer commands;
- obscure one-liners;
- risky command compression.

A clear five-command solution may be better learning than a difficult one-liner.

---

# 46. Efficiency Scoring

Do not globally score command count.

Efficiency scoring may be used only in specific advanced labs where the objective explicitly includes:

```text
pipeline construction
command composition
```

---

# 47. Time Scoring

Time may be recorded.

Time should not heavily penalize beginners.

Use timing primarily for:

```text
self-comparison
exam mode
advanced drills
```

---

# 48. Concept Taxonomy

Recommended concept IDs:

```text
terminal.prompt
terminal.exit-status

filesystem.cwd
filesystem.absolute-path
filesystem.relative-path
filesystem.hidden-files
filesystem.create
filesystem.copy
filesystem.move
filesystem.delete
filesystem.links

text.inspect
text.count
text.search
text.sort
text.deduplicate
text.fields
text.transform
text.regex

streams.stdin
streams.stdout
streams.stderr
streams.pipe
streams.redirect
streams.append
streams.tee

shell.variables
shell.environment
shell.quoting
shell.expansion
shell.command-substitution
shell.globbing
shell.conditions
shell.loops
shell.functions
shell.exit-codes

permissions.mode
permissions.octal
permissions.execute

processes.pid
processes.signal
processes.background

archives.tar
integrity.sha256

logs.filter
logs.aggregate
logs.timeline

networking.interfaces
networking.routes
networking.sockets
networking.dns

troubleshooting.observe
troubleshooting.narrow
troubleshooting.verify

security.auth-logs
security.file-integrity
security.permissions

forensics.hashing
forensics.metadata
forensics.timeline
```

---

# 49. Prerequisite Examples

```yaml
text.search:
  prerequisites:
    - text.inspect

streams.pipe:
  prerequisites:
    - terminal.exit-status
    - streams.stdout

text.deduplicate:
  prerequisites:
    - text.sort

shell.conditions:
  prerequisites:
    - shell.variables
    - shell.exit-codes

logs.aggregate:
  prerequisites:
    - text.search
    - streams.pipe
    - text.sort
    - text.deduplicate
```

---

# 50. Lab Metadata Requirements

Every lab should identify:

```text
domain
concepts
prerequisites
difficulty
training mode
estimated duration
runtime fidelity dependencies
validators
hints
reference solution
```

The exact schema belongs to the later Database/Content Schema document.

---

# 51. Curriculum Gating

The learner should not be blocked by every previous lab.

Use:

```text
soft prerequisites
```

for most progression.

Hard gates should be limited to cases where a later lab is effectively impossible without earlier concepts.

---

# 52. Recommended Soft-Gate Rule

A learner may open a later lab but receives:

```text
Recommended prerequisites:
- Pipes
- grep
- sort
```

This preserves exploration.

---

# 53. Hard Gates

Possible for:

```text
exam mode
mastery assessment
advanced scripting track
```

Not necessary for most normal labs.

---

# 54. Curriculum Tracks

After core foundation, future curriculum may expose tracks.

```text
Linux Fundamentals
Shell Power User
System Administration
Networking Foundations
DevOps CLI
Defensive Security
Digital Forensics
```

The MVP ships primarily:

```text
Linux Fundamentals
```

with one early defensive-analysis lab.

---

# 55. Linux Fundamentals Track

Includes:

```text
D0
D1
D2
D3
D4
D5
D6
D7
D8
D10
basic D11
basic D12
```

---

# 56. Shell Power User Track

Future:

```text
advanced grep
advanced find
regex
sed
awk
xargs
shell functions
robust scripting
error handling
```

---

# 57. System Administration Track

Future/simulated:

```text
permissions
processes
services
disk usage
users/groups
packages
configuration
```

---

# 58. Networking Track

Future/simulated or controlled backend:

```text
ip
routes
DNS
sockets
HTTP
network troubleshooting
```

---

# 59. Defensive Security Track

Future:

```text
authentication logs
file integrity
permission audit
suspicious files
process review
network evidence
```

---

# 60. Digital Forensics Track

Future:

```text
hashes
metadata
timeline
artifact collection
log correlation
archive analysis
```

---

# 61. Assessment Types

## 61.1 Micro Check

One short objective.

Duration:

```text
1–3 minutes
```

---

## 61.2 Domain Check

Several related concepts.

Duration:

```text
5–15 minutes
```

---

## 61.3 Mixed Challenge

Cross-domain.

Duration:

```text
10–20 minutes
```

---

## 61.4 Incident Assessment

Realistic scenario.

Duration:

```text
15–30 minutes
```

---

## 61.5 Mastery Exam

Multiple domains.

Duration:

```text
30–60 minutes
```

Future feature.

---

# 62. Assessment Rules

A proper assessment should:

- avoid giving command names;
- use familiar concepts in unfamiliar combinations;
- accept multiple solutions;
- not rely on trivia;
- not depend on unstable runtime behavior.

---

# 63. Example Domain Assessment — Search

Mission:

```text
A dataset under /workspace/archive contains exactly one line
with the token SESSION_INVALID.

Determine:
1. the file containing it;
2. the line number;
3. the absolute file path.
```

Concepts:

```text
find
grep
-n
paths
```

---

# 64. Example Mixed Assessment — Logs

Mission:

```text
Determine which source IP generated the highest number of failed login attempts.
```

Possible learner solution:

```text
grep
awk/cut
sort
uniq -c
sort
```

No exact solution required.

---

# 65. Incident Design Framework

Every incident should contain:

```text
context
observable symptoms
evidence
constraints
objective
validation
```

---

# 66. Incident Example — Disk Usage

Context:

```text
A training server reports unexpected storage growth.
```

Evidence:

```text
filesystem tree
synthetic capacity metadata
logs
```

Objective:

```text
Identify largest unnecessary artifact and reduce usage below threshold without deleting protected files.
```

---

# 67. Incident Example — Authentication

Objective:

```text
Identify:
- affected account
- source address
- first event
- total failed attempts
```

Evidence:

```text
synthetic auth.log
```

---

# 68. Incident Constraints

Advanced labs may include rules such as:

```text
Do not modify /srv/database
Do not delete audit logs
Do not alter original evidence file
```

This teaches operational discipline.

---

# 69. Randomized Labs

Post-MVP randomized labs should vary:

```text
filenames
directory paths
tokens
record ordering
usernames
IP addresses
timestamps
counts
decoy files
```

while preserving the same learning concept.

---

# 70. Deterministic Randomness

Randomized labs should use explicit seeds.

Example:

```text
seed: 427318
```

This permits:

- reproducibility;
- debugging;
- fair assessment review.

---

# 71. Lab Reference Solutions

Every official lab should have at least one internal reference solution.

Purpose:

- prove solvability;
- automated content testing;
- regression protection.

Reference solutions must not imply exclusivity.

---

# 72. Multiple Reference Solutions

For important labs, test more than one solution style.

Example:

Goal:

Count failed logins by user.

Reference A:

```text
grep + cut + sort + uniq
```

Reference B:

```text
awk + sort + uniq
```

This validates outcome-based design.

---

# 73. Curriculum Fidelity Dependency

Every lab should declare the runtime features it requires.

Example:

```yaml
requires:
  commands:
    - grep
    - find
  shellFeatures:
    - pipe
```

If any dependency is:

```text
unsupported
```

the lab must not launch.

---

# 74. Simulation Dependency

If a lab uses a simulated command:

```text
SIMULATED
```

must be visible before or during the lab.

Example:

```text
This exercise uses a simulated network interface table.
```

---

# 75. Curriculum Build Validation

Before release, validate:

- every lab has valid concept IDs;
- prerequisites exist;
- required commands exist in matrix;
- no lab depends on unsupported feature;
- every official lab has validators;
- every official lab has a reference solution;
- every graded lab has deterministic setup.

---

# 76. Runtime-Spike Impact on Curriculum

After Phase 0:

1. mark verified native commands;
2. remove unsupported assumptions;
3. replace invalid labs;
4. adjust ordering if required;
5. update fidelity labels;
6. freeze MVP lab list.

Example:

If native `chmod` semantics fail:

```text
Permission Repair
```

moves to simulated/post-MVP and another real-command lab replaces it in the initial 20.

---

# 77. Beginner UX Rules

Beginner labs may show:

```text
concept
syntax pattern
example
mission
```

but should avoid full answer duplication.

---

# 78. Intermediate UX Rules

Intermediate labs show:

```text
mission
relevant concepts
optional hints
```

No command examples by default.

---

# 79. Advanced UX Rules

Advanced labs show:

```text
context
objective
constraints
```

No command list.

---

# 80. Mastery UX Rules

Mastery sessions show:

```text
problem only
```

with optional post-completion review.

---

# 81. Mistake Taxonomy

Training feedback may categorize failures.

Recommended categories:

```text
path mistake
syntax mistake
wrong command family
wrong stream
destructive action
pattern mismatch
permission mismatch
incomplete result
format mismatch
```

---

# 82. Feedback Design

Bad feedback:

```text
Wrong.
```

Better:

```text
The expected file still does not exist.
```

Best:

```text
The output file exists, but it contains three lines instead of the required one.
Review the filtering stage before redirecting the result.
```

Feedback should describe state, not immediately provide the command.

---

# 83. Post-Lab Review

On completion, show:

```text
objective
result
concepts reinforced
hints used
attempts
duration
mastery changes
optional reference explanation
```

---

# 84. Command Explanation

Post-lab explanations may show:

```text
what the reference solution does
```

but should state:

```text
This is one valid solution.
```

---

# 85. Curriculum Metrics

Useful aggregate metrics:

```text
completion rate by lab
average attempts
hint usage
median completion time
concept mastery distribution
most failed concepts
```

For MVP these remain local.

---

# 86. Privacy

No cloud analytics are required.

Local mastery metrics are sufficient.

---

# 87. Curriculum Versioning

Every content pack should have:

```text
pack version
schema version
```

Material changes to a graded lab should update version metadata.

---

# 88. Curriculum Compatibility

If a command becomes unsupported in a runtime update:

```text
affected labs should be blocked or migrated
```

rather than silently producing incorrect training.

---

# 89. Content Pack Organization

Recommended future packs:

```text
linux-foundations
text-processing
shell-scripting
permissions
logs
troubleshooting
defensive-analysis
forensics
networking-sim
```

Exact repository layout belongs to the next Repository Structure document.

---

# 90. MVP Pack

The first pack should be:

```text
linux-foundations
```

It contains the initial 20 labs.

---

# 91. Pack Completion

A pack may display:

```text
completion percentage
mastery percentage
recommended next lab
```

These are not identical metrics.

A learner can complete all labs but still have weak mastery.

---

# 92. Completion vs Mastery

Completion:

```text
Did the learner pass the lab?
```

Mastery:

```text
Can the learner repeatedly apply the concept across contexts?
```

Keep these separate.

---

# 93. Recommended Learning Session

A normal session may follow:

```text
1 new concept
2 practice labs
1 reinforcement lab
1 optional blind challenge
```

This is a recommendation, not a hard rule.

---

# 94. Short Session

For 10–15 minutes:

```text
1 reinforcement
1 new lab
```

---

# 95. Long Session

For 30–60 minutes:

```text
review
new concept
guided lab
blind lab
mixed challenge
post-session mastery review
```

---

# 96. Streaks

Streaks are optional gamification and not core curriculum logic.

If implemented later, streaks should not pressure the learner into low-quality practice.

---

# 97. XP

XP may be used as presentation.

It must not replace mastery.

Example:

```text
XP = engagement
Mastery = demonstrated competence
```

---

# 98. Badges

Optional future examples:

```text
Pipeline Operator
Regex Apprentice
Log Analyst
Shell Scripter
```

Not MVP-critical.

---

# 99. Curriculum Accessibility

Training content should avoid relying only on color.

Examples:

Use:

```text
PASS
SIMULATED
UNSUPPORTED
```

with text/icons, not only green/yellow/red.

---

# 100. Language Style

Mission text should be:

- concise;
- technical;
- unambiguous.

Avoid unnecessary story text unless incident context adds learning value.

---

# 101. Naming Style

Good lab titles:

```text
Hidden Files
Pipeline Basics
Permission Repair
Archive Recovery
Log Investigation
```

Avoid vague names such as:

```text
Challenge 7
Advanced Task
Exercise B
```

---

# 102. Curriculum Quality Gate

A lab is release-ready only when:

- learning objective is explicit;
- prerequisite concepts are valid;
- runtime dependencies are valid;
- fixture is deterministic;
- validation is outcome-based;
- at least one reference solution passes;
- hints are ordered;
- reset works;
- lab does not falsely claim runtime fidelity.

---

# 103. Initial Mastery Gate by Domain

## D0/D1

Learner can:

```text
navigate without help
identify current path
reason about relative/absolute paths
```

---

## D2

Learner can:

```text
create
copy
move
delete
```

correctly.

---

## D3/D4

Learner can:

```text
inspect
search
locate
count
```

data.

---

## D5

Learner can:

```text
compose pipelines
redirect output
handle stderr
```

---

## D6

Learner can:

```text
extract
sort
deduplicate
transform
```

structured text.

---

## D8/D11

Learner can:

```text
use variables
write simple scripts
use conditions and loops
```

---

## D12/D15

Learner can:

```text
solve a problem without being told which command to use
```

---

# 104. MVP Graduation Requirement

A learner can be considered to have completed the initial SHELLGROUND foundation when they:

1. complete the 20-lab foundation pack;
2. pass at least one blind search lab;
3. pass at least one blind pipeline lab;
4. pass the log investigation lab;
5. demonstrate competent mastery in:
   - navigation;
   - file operations;
   - search;
   - streams;
   - text processing;
6. complete at least one task without hints.

This does not imply expert Linux mastery.

It indicates completion of the SHELLGROUND foundation.

---

# 105. Post-MVP Expansion Targets

## v0.2

Target:

```text
50–70 total labs
```

Add:

```text
advanced grep
advanced find
sed
awk
scripting
troubleshooting
defensive logs
```

---

## v0.3

Add:

```text
adaptive drills
spaced reinforcement
randomized fixtures
weak-area queues
```

---

## v0.4

Add:

```text
incident mode
exam mode
timed drills
network simulation
administration simulation
```

---

## v1.0

Target:

```text
100+ deterministic labs
20+ randomized templates
10+ incidents
3+ exams
multiple curriculum tracks
```

---

# 106. Curriculum Traceability to Command Matrix

Examples:

| Curriculum Domain | Command Matrix Dependency |
|---|---|
| D0 Terminal | shell built-ins, exit status |
| D1 Navigation | `pwd`, `cd`, `ls` |
| D2 Files | `touch`, `mkdir`, `cp`, `mv`, `rm` |
| D3 Inspection | `cat`, `head`, `tail`, `wc` |
| D4 Search | `grep`, `find` |
| D5 Streams | pipe, redirects, `tee` |
| D6 Transform | `sort`, `uniq`, `cut`, `tr`, `sed`, `awk` |
| D7 Permissions | `chmod`, `stat` |
| D8 Environment | `env`, `export`, quoting, expansion |
| D9 Processes | `sleep`, `ps`, `kill`, job control |
| D10 Integrity | `tar`, `gzip`, `sha256sum` |
| D11 Scripting | shell conditions, loops, functions |
| D12 Logs | text-processing stack |
| D13 Networking | simulated command layer |
| D14 Administration | simulated command layer |
| D15 Troubleshooting | mixed verified commands |
| D16 Defensive | mixed verified commands |
| D17 Forensics | hash, metadata, logs |
| D18 CTF | mixed verified commands |
| D19 Mastery | all completed dependencies |

---

# 107. Curriculum Traceability to Requirements

Supports:

```text
FR-006 Structured labs
FR-011 Hints
FR-013 Guided training
FR-014 Blind training
FR-015 Drill training
FR-016 Exam mode
FR-017 Troubleshooting
FR-018 Defensive analysis
FR-020 Command mastery
FR-021 Concept mastery
FR-022 Weakness detection
FR-023 Training recommendations
```

Learning requirements:

```text
LR-001 Progressive difficulty
LR-002 Active practice
LR-003 Repetition
LR-004 Reduced guidance
LR-005 Transfer
LR-006 Problem orientation
LR-007 Feedback
LR-008 Avoid answer memorization
```

---

# 108. Curriculum Baseline Decision

The SHELLGROUND curriculum shall:

```text
start with real command fundamentals
progress toward command composition
reuse concepts across contexts
reduce guidance over time
introduce scripting after shell foundations
use synthetic logs for realistic analysis
teach simulated system/network commands only with explicit labels
defer offensive tooling
end with independent problem solving
```

---

# 109. Next Document

The next document in sequence is:

```text
6. REPOSITORY STRUCTURE
```

That document will define:

- application directories;
- domain/module boundaries;
- runtime package location;
- content-pack layout;
- fixture layout;
- test layout;
- docs;
- CI;
- configuration files;
- naming conventions;
- import boundaries;
- ownership rules.

It will translate the architecture and curriculum into a concrete repository organization without yet defining the final database/content schema.
