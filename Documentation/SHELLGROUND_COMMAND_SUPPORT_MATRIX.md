# SHELLGROUND — Command-Support Matrix

> **Document:** Command-Support Matrix  
> **Project:** SHELLGROUND  
> **Sequence:** 4 of 13  
> **Depends on:** `SHELLGROUND_REQUIREMENTS.md`, `SHELLGROUND_FEATURE_SCOPE.md`, `SHELLGROUND_FULL_ARCHITECTURE.md`  
> **Status:** Pre-Runtime-Spike Baseline  
> **Purpose:** Define which commands and shell behaviors SHELLGROUND requires, which are candidates for real WASIX execution, which may be simulated, which are unsupported, and exactly what Phase 0 must verify before any command is presented as native.

---

# 1. Purpose

This document prevents a critical design error:

> **Desired Linux behavior must not be confused with verified browser-runtime behavior.**

SHELLGROUND is intended to teach transferable Linux command-line skills.

However, the browser execution environment is based on WebAssembly/WASIX rather than a complete Linux kernel.

Therefore every command or shell feature must have two independent classifications:

1. **Product requirement** — how important the command is to the SHELLGROUND curriculum.
2. **Runtime fidelity** — how accurately the selected browser runtime can execute it.

A command may be essential to the curriculum while still requiring runtime verification.

---

# 2. Current Technical Evidence

As of the drafting date, current Wasmer documentation establishes several relevant facts.

## 2.1 Browser Runtime

The current Wasmer JavaScript SDK supports:

- browser-local execution;
- package composition;
- sandbox files;
- interactive process spawning;
- stdin;
- stdout;
- stderr;
- terminal resize;
- browser package caching.

Browser execution uses:

- Web Workers;
- `SharedArrayBuffer`;
- cross-origin isolation.

Networking is not automatically enabled.

---

## 2.2 WASIX Capabilities

Current WASIX documentation describes WASIX as WASI plus POSIX-oriented extensions including:

```text
threads
fork/exec
TCP/UDP sockets
DNS
pipes
TTY
```

These capabilities establish that interactive UNIX-style applications can run under WASIX.

They do not prove that any specific command behaves identically to GNU/Linux.

---

## 2.3 Bash Availability

The current Wasmer Registry exposes:

```text
wasmer/bash
```

Current observed registry version during specification drafting:

```text
1.0.25
```

This provides a credible candidate shell for the runtime spike.

It shall not be treated as the final pinned runtime version until the spike completes.

---

## 2.4 Utility Packages

The Wasmer Registry contains utility packages including examples such as:

```text
wasmer/find
syrusakbary/coreutils
```

An older published `syrusakbary/coreutils` package explicitly lists commands including:

```text
ls
cat
echo
mv
env
mkdir
basename
dirname
base32
base64
sum
printf
wc
pwd
```

This proves that individual WASI utility packages exist.

It does not prove that this exact package is the correct production package for SHELLGROUND.

---

# 3. Source References

Technical references used to establish the pre-spike baseline:

```text
Wasmer JavaScript SDK
https://docs.wasmer.io/runtime/js/

Wasmer Runtime
https://docs.wasmer.io/runtime/

WASIX
https://docs.wasmer.io/runtime/wasix/

Wasmer Bash package
https://wasmer.io/wasmer/bash

Wasmer GNU Find Utilities package
https://wasmer.io/wasmer/find

Wasmer coreutils example
https://wasmer.io/syrusakbary/coreutils

xterm.js
https://github.com/xtermjs/xterm.js
```

Runtime implementation must re-check these sources before pinning dependencies because Wasmer packages and SDK behavior can change.

---

# 4. Classification Model

Every command receives multiple independent classifications.

---

# 5. Product Priority

```text
P0 — Critical
P1 — High
P2 — Useful
P3 — Optional
PX — Excluded
```

---

## 5.1 P0 — Critical

Without the command or behavior, a core part of the MVP curriculum cannot function.

Examples:

```text
pwd
cd
ls
cat
grep
find
pipes
redirection
```

---

## 5.2 P1 — High

Important to broad Linux fluency and expected in the initial or near-initial curriculum.

---

## 5.3 P2 — Useful

Valuable but not required to prove the MVP.

---

## 5.4 P3 — Optional

Convenience or advanced functionality.

---

## 5.5 PX — Excluded

Outside the browser MVP training boundary.

---

# 6. Runtime Fidelity

```ts
type Fidelity =
  | "native-wasix"
  | "simulated"
  | "unsupported"
  | "unverified";
```

`unverified` is required during development and must not be shown to learners as `native-wasix`.

---

# 7. Verification State

This specification uses:

```text
EVIDENCED
CANDIDATE
VERIFY
FAILED
```

Definitions:

### EVIDENCED

External current documentation or package metadata provides evidence that the command/package exists under Wasmer/WASIX.

This still does not mean SHELLGROUND integration has passed.

### CANDIDATE

The command is expected to be possible but current external evidence is insufficient to mark it verified.

### VERIFY

The exact SHELLGROUND runtime integration must test it.

### FAILED

The runtime spike demonstrated that native behavior is unsuitable.

---

# 8. Release-State Classification

Commands will ultimately be classified for users as:

```text
REAL
SIMULATED
UNSUPPORTED
```

Mapping:

```text
native-wasix → REAL
simulated    → SIMULATED
unsupported  → UNSUPPORTED
unverified   → never released as supported
```

---

# 9. Verification Rule

A command may be classified as `native-wasix` only after all relevant Phase 0 checks pass.

Minimum checks:

1. command resolves in the composed sandbox;
2. command executes successfully;
3. normal arguments behave as expected;
4. error exit code is usable;
5. stdout behaves correctly;
6. stderr behaves correctly;
7. pipes work where relevant;
8. redirection works where relevant;
9. guest filesystem interaction is correct;
10. behavior is sufficiently transferable to normal Linux use.

---

# 10. Verification Output

Phase 0 shall create machine-readable results conceptually equivalent to:

```yaml
command: grep
status: native-wasix

runtime:
  sdk: "@wasmer/sdk"
  sdkVersion: "<pinned>"
  shellPackage: "wasmer/bash@=<pinned>"

tests:
  basicExecution: pass
  exitCode: pass
  stdout: pass
  stderr: pass
  pipeInput: pass
  fileInput: pass
  recursive: pass

knownDifferences: []

verifiedAt: "<ISO-8601>"
```

---

# 11. Core Shell Built-ins

These are particularly important because they are normally implemented by the shell itself.

| Command / Feature | Priority | Initial Target | Pre-Spike State | Required |
|---|---:|---|---|---|
| `cd` | P0 | native-wasix | VERIFY | Yes |
| `pwd` | P0 | native-wasix | EVIDENCED/VERIFY | Yes |
| `echo` | P0 | native-wasix | EVIDENCED/VERIFY | Yes |
| `printf` | P0 | native-wasix | EVIDENCED/VERIFY | Yes |
| `export` | P0 | native-wasix | VERIFY | Yes |
| `unset` | P1 | native-wasix | VERIFY | Prefer |
| `read` | P1 | native-wasix | VERIFY | Prefer |
| `test` | P0 | native-wasix | VERIFY | Yes |
| `[` | P0 | native-wasix | VERIFY | Yes |
| `type` | P2 | native-wasix | VERIFY | No |
| `command` | P2 | native-wasix | VERIFY | No |
| `alias` | P2 | native-wasix | VERIFY | No |
| `unalias` | P3 | native-wasix | VERIFY | No |
| `history` | P2 | runtime-dependent | VERIFY | No |
| `help` | P2 | runtime-dependent | VERIFY | No |
| `exit` | P0 | native-wasix | VERIFY | Yes |

---

# 12. Navigation Commands

## 12.1 Required Commands

| Command | Priority | Initial Target | Training Purpose |
|---|---:|---|---|
| `pwd` | P0 | native-wasix | identify current directory |
| `cd` | P0 | native-wasix | navigate filesystem |
| `ls` | P0 | native-wasix | inspect directory |
| `basename` | P1 | native-wasix | extract filename component |
| `dirname` | P1 | native-wasix | extract directory component |
| `readlink` | P1 | native-wasix if links supported | inspect symlink target |
| `realpath` | P2 | candidate native | normalize paths |

---

## 12.2 `pwd`

### Required Behaviors

Test:

```bash
pwd
cd /workspace
pwd
cd ..
pwd
```

Verify:

- absolute path output;
- changes after `cd`;
- consistent root semantics.

---

## 12.3 `cd`

Test:

```bash
cd /
cd /workspace
cd ..
cd .
cd nonexistent
```

Verify:

- directory changes;
- failure exit behavior;
- `PWD` update;
- relative paths.

---

## 12.4 `ls`

Required cases:

```bash
ls
ls -a
ls -l
ls -la
ls /workspace
```

Verify:

- hidden-file listing;
- metadata output;
- ordering differences documented;
- permission display documented if metadata differs from Linux.

---

# 13. File Creation and Directory Management

| Command | Priority | Target | Phase 0 |
|---|---:|---|---|
| `touch` | P0 | native-wasix | VERIFY |
| `mkdir` | P0 | native-wasix | VERIFY |
| `rmdir` | P1 | native-wasix | VERIFY |
| `mktemp` | P2 | candidate | VERIFY |
| `truncate` | P2 | candidate | VERIFY |

---

## 13.1 `touch`

Required:

```bash
touch new.txt
touch one two three
```

Test:

- creates missing file;
- existing file behavior;
- timestamp semantics documented.

---

## 13.2 `mkdir`

Required:

```bash
mkdir alpha
mkdir -p one/two/three
```

---

## 13.3 `rmdir`

Required:

```bash
mkdir empty
rmdir empty
```

Failure:

```bash
rmdir nonempty
```

---

# 14. File Manipulation

| Command | Priority | Target | Required |
|---|---:|---|---|
| `cp` | P0 | native-wasix | Yes |
| `mv` | P0 | native-wasix | Yes |
| `rm` | P0 | native-wasix | Yes |
| `ln` | P1 | native or conditional | Prefer |
| `install` | P3 | optional | No |

---

## 14.1 `cp`

Required tests:

```bash
cp source.txt copy.txt
cp source.txt directory/
cp -r source-dir destination-dir
```

Verify:

- file content;
- recursive copy;
- overwrite behavior.

---

## 14.2 `mv`

Required:

```bash
mv old.txt new.txt
mv file directory/
```

---

## 14.3 `rm`

Required:

```bash
rm file.txt
rm -r directory
rm -f missing
```

Safety note:

This operates only inside the guest filesystem.

---

## 14.4 `ln`

Preferred:

```bash
ln source hardlink
ln -s source symlink
readlink symlink
```

If symlink semantics are incomplete:

```text
classify as unsupported
or
restrict labs to supported link type
```

Do not simulate silently.

---

# 15. File Viewing

| Command | Priority | Target |
|---|---:|---|
| `cat` | P0 | native-wasix |
| `head` | P0 | native-wasix |
| `tail` | P0 | native-wasix |
| `less` | P2 | runtime-dependent interactive |
| `more` | P3 | optional |
| `nl` | P2 | candidate |

---

## 15.1 `cat`

Required:

```bash
cat file.txt
cat one.txt two.txt
cat > output.txt
```

---

## 15.2 `head`

Required:

```bash
head file.txt
head -n 3 file.txt
```

---

## 15.3 `tail`

Required:

```bash
tail file.txt
tail -n 3 file.txt
```

`tail -f` is not required in MVP because long-running file-follow semantics add complexity without being needed for initial labs.

---

## 15.4 `less`

Conditional.

Interactive pagers depend on terminal/TTY behavior.

If verified:

```text
P2 REAL
```

If unstable:

```text
UNSUPPORTED in MVP
```

Do not block release.

---

# 16. Counting and Basic Text Utilities

| Command | Priority | Target |
|---|---:|---|
| `wc` | P0 | native-wasix |
| `sort` | P0 | native-wasix |
| `uniq` | P0 | native-wasix |
| `cut` | P0 | native-wasix |
| `tr` | P1 | native-wasix |
| `paste` | P2 | candidate |
| `join` | P2 | candidate |
| `comm` | P2 | candidate |

---

# 17. `wc`

Required:

```bash
wc file
wc -l file
wc -w file
wc -c file
cat file | wc -l
```

---

# 18. `sort`

Required:

```bash
sort file
sort -n numbers
sort -r file
sort file | uniq
```

---

# 19. `uniq`

Required:

```bash
uniq file
uniq -c file
sort file | uniq
```

Important learning concept:

`uniq` normally compares adjacent lines.

---

# 20. `cut`

Required:

```bash
cut -d: -f1 /etc/passwd-like-fixture
cut -c1-5 file
```

---

# 21. `tr`

Required if available:

```bash
tr 'a-z' 'A-Z'
tr -d ':'
```

---

# 22. Search Commands

| Command | Priority | Target | Evidence |
|---|---:|---|---|
| `grep` | P0 | native-wasix | candidate |
| `find` | P0 | native-wasix | Wasmer package exists |
| `which` | P2 | candidate | verify |
| `whereis` | P3 | simulated/unsupported | not required |
| `locate` | P3 | simulated | index semantics unsuitable |

---

# 23. `grep`

This is one of the most important SHELLGROUND commands.

Minimum verification:

```bash
grep "error" file.txt
grep -i "error" file.txt
grep -n "error" file.txt
grep -v "success" file.txt
grep -E 'foo|bar' file.txt
grep -r "needle" directory/
cat file.txt | grep "needle"
```

Required behavior:

- usable exit codes;
- stdin input;
- regular file input;
- recursive behavior if supported.

If recursive implementation differs, curriculum can teach:

```bash
find ... -exec ...
```

until `grep -r` is confirmed.

---

# 24. `find`

Current Wasmer Registry evidence shows a `wasmer/find` package for GNU Find Utilities.

Still required:

```bash
find .
find /workspace -type f
find . -name '*.log'
find . -type d
find . -size ...
find . -exec ...
```

Not all predicates are mandatory for MVP.

MVP minimum:

```text
path traversal
-name
-type
```

Preferred:

```text
-size
-mtime
-exec
```

---

# 25. Regular Expressions

Regex is not a separate command but is a major command-support dependency.

Training requires at minimum:

```text
basic regular expressions
extended regular expressions
anchors
character classes
alternation where supported
```

Commands likely involved:

```text
grep
sed
awk
```

---

# 26. Stream and Redirection Features

These are shell-level capabilities and must be treated as P0.

| Feature | Priority | Target |
|---|---:|---|
| stdin | P0 | native-wasix |
| stdout | P0 | native-wasix |
| stderr | P0 | native-wasix |
| pipe `|` | P0 | native-wasix |
| stdout overwrite `>` | P0 | native-wasix |
| stdout append `>>` | P0 | native-wasix |
| stdin redirect `<` | P0 | native-wasix |
| stderr redirect `2>` | P0 | native-wasix |
| stderr append `2>>` | P1 | native-wasix |
| stdout+stderr combination | P1 | native if shell supports |
| here-doc `<<` | P1 | native-wasix |
| here-string `<<<` | P2 | Bash-specific |
| `tee` | P0 | native-wasix |

---

# 27. Pipe Verification

Minimum:

```bash
printf "b\na\n" | sort
cat file | grep keyword
find . -type f | wc -l
```

Verify:

- process composition;
- exit behavior;
- output ordering;
- no deadlock.

---

# 28. Redirection Verification

Required:

```bash
echo hello > file
echo world >> file
wc -l < file
failing-command 2> error.log
```

---

# 29. `tee`

Required:

```bash
echo hello | tee output.txt
echo world | tee -a output.txt
```

---

# 30. Shell Logical Operators

| Feature | Priority | Target |
|---|---:|---|
| `;` | P0 | native |
| `&&` | P0 | native |
| `||` | P0 | native |
| grouping `( )` | P1 | native |
| brace grouping `{ }` | P1 | native |
| background `&` | P2 | runtime-dependent |

---

# 31. Variable and Expansion Features

| Feature | Priority | Target |
|---|---:|---|
| assignment `VAR=value` | P0 | native |
| `$VAR` | P0 | native |
| `${VAR}` | P0 | native |
| `export` | P0 | native |
| command substitution `$()` | P0 | native |
| backticks | P3 | native if shell |
| glob `*` | P0 | native |
| glob `?` | P1 | native |
| quoting `'...'` | P0 | native |
| quoting `"..."` | P0 | native |
| escaping `\` | P0 | native |
| tilde expansion `~` | P1 | verify |
| arithmetic `$(( ))` | P1 | verify |

---

# 32. Environment Commands

| Command | Priority | Target |
|---|---:|---|
| `env` | P0 | native-wasix |
| `printenv` | P1 | candidate |
| `export` | P0 | shell builtin |
| `unset` | P1 | shell builtin |

---

# 33. Text Transformation

| Command | Priority | Target |
|---|---:|---|
| `sed` | P0 | native-wasix candidate |
| `awk` | P0 | native-wasix candidate |
| `xargs` | P1 | native candidate |

These commands are central to later fluency and should be part of the MVP if technically reliable.

---

# 34. `sed`

Minimum curriculum behavior:

```bash
sed 's/foo/bar/' file
sed 's/foo/bar/g' file
sed -n '1,5p' file
```

Preferred:

```text
addressing
deletion
basic regex
```

In-place editing:

```bash
sed -i
```

is optional because WASI packaging behavior may differ.

---

# 35. `awk`

Minimum:

```bash
awk '{print $1}' file
awk -F: '{print $1}' file
awk '$3 > 100 {print $1}' file
```

Important features:

```text
fields
-F
conditions
BEGIN/END
numeric comparison
```

Not required in the earliest beginner stage but required before MVP curriculum completion if runtime support is reliable.

---

# 36. `xargs`

Preferred:

```bash
printf "a\nb\n" | xargs
find . -name '*.log' | xargs ...
```

Null-delimited advanced usage may be deferred.

---

# 37. Checksums and Integrity

| Command | Priority | Target |
|---|---:|---|
| `sha256sum` | P0 | native candidate |
| `sha1sum` | P2 | candidate |
| `md5sum` | P2 | candidate for legacy education only |
| `cksum` | P2 | candidate |

---

# 38. Hashing Training Requirement

At least one cryptographic hash utility must be native in the MVP.

Preferred:

```text
sha256sum
```

If unavailable, another SHA-256-capable WASIX utility may satisfy the learning objective.

Do not teach MD5 as a recommended security hash.

---

# 39. Archives and Compression

| Command | Priority | Target |
|---|---:|---|
| `tar` | P0 | native candidate |
| `gzip` | P1 | native candidate |
| `gunzip` | P1 | native candidate |
| `zip` | P2 | optional |
| `unzip` | P2 | optional |

---

# 40. `tar`

Minimum:

```bash
tar -cf archive.tar directory/
tar -tf archive.tar
tar -xf archive.tar
```

Preferred:

```bash
tar -czf
tar -xzf
```

if gzip integration is stable.

---

# 41. Permissions

Permissions are a special fidelity area.

A virtual WASIX filesystem may expose POSIX-style metadata, but permission enforcement must be verified.

| Command | Priority | Initial Target |
|---|---:|---|
| `chmod` | P0 curriculum | native if semantics valid; otherwise simulated |
| `chown` | P2 | simulated/unsupported |
| `chgrp` | P2 | simulated/unsupported |
| `umask` | P2 | runtime-dependent |
| `stat` | P1 | native if metadata meaningful |

---

# 42. `chmod`

Do not classify `chmod` as REAL until tests verify:

```bash
touch test
chmod 600 test
stat test
ls -l test
```

and determine whether mode bits affect access in a way sufficiently similar to Linux.

Possible release decisions:

```text
REAL
```

if semantics are meaningful.

```text
SIMULATED
```

if metadata is educational but not enforced.

```text
UNSUPPORTED
```

if both are unreliable.

---

# 43. Ownership Commands

`chown`, `chgrp`, and real multi-user ownership are not required in the MVP.

Training can use a synthetic permission environment later.

Reason:

Browser WASIX guest identity may not meaningfully reproduce a real Linux multi-user ownership model.

---

# 44. User and Identity Commands

| Command | Priority | Target |
|---|---:|---|
| `whoami` | P2 | simulated or native if meaningful |
| `id` | P2 | simulated or native |
| `groups` | P2 | simulated |
| `who` | P3 | simulated/unsupported |
| `w` | P3 | simulated/unsupported |

These must never imply a real system user database unless such a fixture is intentionally simulated.

---

# 45. Process Commands

WASIX includes process-related extensions such as fork/exec, but process tools must be verified independently.

| Command | Priority | Target |
|---|---:|---|
| `ps` | P1 | native if accurate, otherwise simulated |
| `kill` | P1 | native if process semantics work |
| `jobs` | P2 | shell-dependent |
| `fg` | P2 | shell-dependent |
| `bg` | P2 | shell-dependent |
| `sleep` | P1 | native |
| `timeout` | P2 | candidate |
| `nice` | P3 | unsupported/simulated |
| `renice` | P3 | unsupported |

---

# 46. Process Curriculum Minimum

MVP process training requires concepts more than full system fidelity.

Minimum acceptable approach:

```text
sleep
background process if stable
basic process listing via controlled environment
signal concept
```

If native `ps`/`kill` are unreliable, provide clearly labeled simulation labs later.

They shall not block command-core MVP.

---

# 47. Disk and Filesystem Inspection

| Command | Priority | Target |
|---|---:|---|
| `du` | P1 | native candidate |
| `df` | P1 | simulated or runtime-local |
| `stat` | P1 | native candidate |
| `file` | P2 | candidate |

---

# 48. `du`

Useful for disk-usage troubleshooting.

Verify:

```bash
du file
du -h file
du -sh directory
```

---

# 49. `df`

A browser virtual filesystem does not represent a normal block-device filesystem.

Therefore:

```text
df native output may be misleading.
```

Preferred MVP handling:

```text
SIMULATED
```

for disk-capacity scenarios.

---

# 50. `stat`

If runtime filesystem metadata is reliable:

```text
REAL
```

Otherwise:

```text
restricted or simulated
```

---

# 51. Shell Scripting

Shell scripting is P0/P1 for the overall MVP.

Required script features:

```text
shebang interpretation if supported
variables
positional parameters
exit status
if
case
for
while
functions
test
&&
||
command substitution
```

---

# 52. Script Execution

Verify:

```bash
cat > script.sh <<'EOF'
#!/bin/bash
for item in one two three; do
  echo "$item"
done
EOF

bash script.sh
```

If executable-bit/shebang behavior is reliable:

```bash
chmod +x script.sh
./script.sh
```

Otherwise teach:

```bash
bash script.sh
```

first.

---

# 53. Date and Time

| Command | Priority | Target |
|---|---:|---|
| `date` | P1 | native |
| `sleep` | P1 | native |
| `time` | P2 | shell/runtime-dependent |

Important:

Browser/runtime clock semantics should be documented.

Training shall not depend on precise host timezone unless explicitly controlled.

---

# 54. `/proc`

Real Linux `/proc` is kernel-generated.

Therefore:

```text
real /proc = unsupported
```

SHELLGROUND may later provide a simulated `/proc` fixture for training.

It must be labeled simulated.

---

# 55. `/sys`

Real Linux `/sys` depends on kernel/device state.

Classification:

```text
UNSUPPORTED
```

for MVP.

Synthetic `/sys` fixtures may appear later only if explicitly simulated.

---

# 56. `/etc`

A synthetic `/etc` tree is useful for training.

Examples:

```text
/etc/passwd
/etc/group
/etc/hosts
/etc/resolv.conf
```

These are:

```text
training fixture files
```

not real host configuration.

Labs must state this where confusion is possible.

---

# 57. Package Managers

| Command | Priority | Classification |
|---|---:|---|
| `apt` | PX MVP | simulated/deferred |
| `apt-get` | PX MVP | simulated/deferred |
| `dpkg` | PX MVP | simulated/deferred |
| `yum` | PX | deferred |
| `dnf` | PX | deferred |
| `pacman` | PX | deferred |

SHELLGROUND does not need a Linux distribution package manager in the MVP.

Runtime package resolution is an application concern, not a guest Linux lesson.

---

# 58. Service Management

| Command | Priority | Classification |
|---|---:|---|
| `systemctl` | PX MVP | simulated later |
| `service` | PX MVP | simulated later |
| `journalctl` | P2 future | simulated fixture |

There is no real systemd environment in the browser MVP.

Never mark these REAL.

---

# 59. Logging Commands

Core log training can rely on normal text-processing tools:

```text
cat
less
head
tail
grep
awk
sed
sort
uniq
cut
```

No real logging daemon is needed.

---

# 60. `journalctl`

Classification:

```text
SIMULATED future
```

Implementation could query a synthetic journal dataset.

Not required for initial MVP.

---

# 61. Networking Commands

Networking requires strict scope separation.

The Wasmer browser SDK can support network access through explicit WISP configuration, but SHELLGROUND MVP intentionally does not enable arbitrary guest networking.

Therefore command availability and product permission are separate issues.

---

# 62. Networking Matrix

| Command | Runtime Possibility | MVP Product Classification |
|---|---|---|
| `curl` | Wasmer package/network possible | disabled or fixture-bound |
| `wget` | possible package | disabled |
| `ping` | browser/raw ICMP unsuitable | simulated |
| `ip` | no real Linux network stack | simulated |
| `ss` | no real host sockets | simulated |
| `netstat` | no real host sockets | simulated |
| `route` | no real routing table | simulated |
| `traceroute` | unsuitable | simulated/unsupported |
| `nslookup` | networking disabled | simulated |
| `dig` | networking disabled | simulated |
| `host` | networking disabled | simulated |
| `ssh` | arbitrary external SSH excluded | unsupported |
| `scp` | excluded | unsupported |
| `sftp` | excluded | unsupported |
| `nc` / `netcat` | restricted | unsupported MVP |

---

# 63. `curl`

Wasmer documentation explicitly uses a `curl/curl` package as a networking example and states network capability must be enabled.

SHELLGROUND decision:

```text
Do not enable arbitrary network capability in MVP.
```

Possible future safe use:

```text
fixture-bound local HTTP simulation
controlled proxy endpoint
isolated exercise backend
```

Until then:

```text
curl = DISABLED/UNSUPPORTED in normal MVP labs
```

This is a product safety/scope decision, not proof that WASIX cannot execute curl.

---

# 64. `ping`

Raw ICMP behavior is not appropriate for the browser MVP.

Classification:

```text
SIMULATED
```

for future networking curriculum.

---

# 65. `ip`

There is no real Linux host network namespace inside SHELLGROUND.

Classification:

```text
SIMULATED
```

Potential simulated data:

```bash
ip addr
ip route
ip link
```

against synthetic network scenarios.

---

# 66. `ss`

Classification:

```text
SIMULATED
```

against synthetic socket tables.

---

# 67. DNS Tools

Future simulated commands:

```text
dig
nslookup
host
```

Training should use deterministic synthetic DNS answers unless a controlled network lab architecture is introduced.

---

# 68. Remote Access Commands

The following are unsupported in MVP:

```text
ssh
scp
sftp
telnet
rlogin
```

Reason:

Arbitrary external target access is not required for Linux command mastery.

---

# 69. Firewall Commands

Unsupported as real behavior:

```text
iptables
nft
ufw
firewall-cmd
```

Future handling may be:

```text
SIMULATED
```

for configuration-reading exercises.

---

# 70. Packet Capture

Unsupported as real behavior:

```text
tcpdump
tshark against host interfaces
```

Future safe option:

```text
offline pcap file analysis
```

using a dedicated WebAssembly parser/tool if appropriate.

This is not MVP scope.

---

# 71. Wireless Commands

Excluded:

```text
iw
iwconfig
airmon-ng
airodump-ng
aircrack-ng
```

No Wi-Fi hardware interface exists in the browser sandbox.

---

# 72. Kernel and Module Commands

Explicitly unsupported:

```text
modprobe
insmod
rmmod
lsmod as real kernel state
sysctl against real kernel
dmesg as real kernel buffer
```

Future simulated versions may teach concepts but must not be labeled real.

---

# 73. Mount and Storage Administration

Unsupported as real host/device operations:

```text
mount
umount
fdisk
parted
lsblk
mkfs
fsck
blkid
```

These can later be simulated through deterministic scenarios.

---

# 74. Privilege Commands

| Command | MVP |
|---|---|
| `sudo` | unsupported/simulated |
| `su` | unsupported/simulated |
| `doas` | unsupported |

There is no real privilege-escalation model required in the MVP.

---

# 75. Account Management Commands

Deferred/simulated:

```text
useradd
usermod
userdel
groupadd
groupmod
groupdel
passwd
```

Future labs may modify synthetic `/etc/passwd` and `/etc/group`, but shall not pretend this changes a real kernel identity model.

---

# 76. Editors

| Command | Priority | Initial Decision |
|---|---:|---|
| `vi` / `vim` | P2 | conditional |
| `nano` | P2 | conditional |
| `ed` | P3 | optional |

Interactive editors may work under TTY but are not required for the command-core MVP.

Simple file-writing labs can use:

```text
redirection
printf
cat heredoc
sed
```

until editor support is proven.

---

# 77. TUI Applications

Potential future tools:

```text
vim
top
htop
less
man
```

These require stronger terminal/TTY compatibility.

They are not release blockers.

---

# 78. Documentation Commands

## `man`

Priority:

```text
P1 educational
```

Potential implementation strategies:

1. real `man` package if available and stable;
2. local static manual content;
3. SHELLGROUND `:help` reference.

Do not require a full system man database in MVP.

---

# 79. `help`

Bash builtin `help` may be available if the selected Bash package provides normal builtin behavior.

Verify.

---

# 80. PATH Resolution

The shell environment must support meaningful command resolution.

Verify:

```bash
echo "$PATH"
command -v ls
type cd
```

If composed packages require unusual paths, SHELLGROUND may configure a training-friendly PATH.

This must be documented.

---

# 81. Environment Paths

Preferred training filesystem:

```text
/
├── home/
│   └── student/
├── workspace/
├── tmp/
├── opt/
├── var/
│   └── log/
└── etc/
```

Actual Wasmer package filesystem roots may differ internally.

SHELLGROUND may seed Linux-like paths if the runtime permits them safely.

---

# 82. Root User Illusion

Do not imply the learner is a real Linux root user.

Prompt design should preferably use:

```text
student@shellground
```

instead of:

```text
root@kali
```

unless a specific simulated lesson requires root concepts.

---

# 83. Hostname

A synthetic hostname may be:

```text
shellground
```

Example prompt:

```text
student@shellground:~$
```

This is a training identity, not an OS hostname claim.

---

# 84. Exit Codes

Exit-code semantics are P0.

Verify:

```bash
true
echo $?

false
echo $?

grep missing file
echo $?
```

Curriculum depends on:

```text
0 = success
nonzero = failure
```

where shell conventions apply.

---

# 85. Signals

Signals are WASIX-capable in principle, but exact command/tool semantics must be tested.

Minimum conceptual support:

```text
Ctrl+C
process termination
```

Verify interactive interrupt handling.

---

# 86. Ctrl+C

P0 terminal behavior.

The runtime spike must verify whether xterm input:

```text
0x03
```

properly interrupts the active guest process.

If not:

SHELLGROUND must expose a safe application-level terminate action.

---

# 87. Ctrl+D

Verify EOF behavior for interactive processes.

Important for:

```text
stdin
shell exit
interactive tools
```

---

# 88. Ctrl+L

Shell screen clearing should be verified.

An application-level terminal clear command may supplement this.

---

# 89. `clear`

Priority:

```text
P1
```

Candidate native utility.

If unavailable, SHELLGROUND can expose:

```text
:clear
```

but should distinguish it from Linux `clear`.

---

# 90. Shell History

Bash history persistence across sandbox recreation is not required.

MVP acceptable behavior:

```text
history exists during current shell
```

if supported.

SHELLGROUND progress storage shall not depend on Bash history files.

---

# 91. Process Substitution

Features:

```bash
<(command)
>(command)
```

Classification:

```text
P3
```

Not required for MVP.

Verify only after core shell behavior.

---

# 92. Arrays

Bash arrays:

```text
P2
```

Useful for advanced scripting, not initial MVP requirement.

---

# 93. Shell Functions

Priority:

```text
P1
```

Verify:

```bash
hello() {
  echo "hello"
}
hello
```

---

# 94. Conditional Statements

P0/P1 scripting capability.

Verify:

```bash
if test -f file; then
  echo yes
fi
```

---

# 95. Loops

P1.

Verify:

```bash
for item in a b c; do
  echo "$item"
done
```

and:

```bash
while ...
```

---

# 96. `case`

P2.

Useful for advanced scripting.

---

# 97. Positional Parameters

P1.

Verify:

```bash
echo "$1"
echo "$#"
echo "$@"
```

inside a script.

---

# 98. Command-Support Release Tiers

## Tier 0 — Runtime Foundation

Must pass before continuing:

```text
bash/sh
stdin
stdout
stderr
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
pipes
>
>>
<
2>
exit codes
variables
quoting
```

Failure of several Tier 0 features blocks the architecture.

---

## Tier 1 — MVP Command Core

Required for initial curriculum:

```text
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
basename
dirname
sed
awk
checksum utility
archive workflow
```

If one or two utilities require alternate packages, compose them.

If a large subset cannot function reliably, reassess runtime packaging before product implementation.

---

## Tier 2 — Systems Fundamentals

Preferred:

```text
chmod
stat
du
sleep
ps
kill
readlink
ln
xargs
date
```

May partially defer.

---

## Tier 3 — Simulation Layer

Future:

```text
df
whoami
id
groups
ip
ss
ping
journalctl
systemctl
package management
```

---

## Tier 4 — Explicitly Unsupported

```text
kernel modules
real firewall
host packet capture
raw packet injection
Wi-Fi interfaces
host storage devices
arbitrary SSH
```

---

# 99. Phase 0 Test Matrix

The runtime spike shall generate results for at least the following.

| ID | Capability | Blocking |
|---|---|---|
| RT-001 | shell starts | Yes |
| RT-002 | interactive stdin | Yes |
| RT-003 | stdout stream | Yes |
| RT-004 | stderr stream | Yes |
| RT-005 | terminal resize | Yes |
| RT-006 | Ctrl+C behavior | High |
| RT-007 | guest file create | Yes |
| RT-008 | guest file read | Yes |
| RT-009 | guest directory create | Yes |
| RT-010 | relative path | Yes |
| RT-011 | absolute path | Yes |
| RT-012 | pipe | Yes |
| RT-013 | stdout redirect | Yes |
| RT-014 | append redirect | Yes |
| RT-015 | stderr redirect | Yes |
| RT-016 | shell variables | Yes |
| RT-017 | exported environment | Yes |
| RT-018 | command substitution | Yes |
| RT-019 | globbing | Yes |
| RT-020 | exit status | Yes |
| RT-021 | script execution | Yes |
| RT-022 | sandbox reset | Yes |
| RT-023 | networking absent | Yes |
| RT-024 | sandbox close | Yes |

---

# 100. Command Test Template

Every P0/P1 native candidate should have a test record.

Example:

```yaml
id: CMD-GREP-001
command: grep

setup:
  files:
    /workspace/test.txt: |
      success
      failed login
      success

execute:
  - grep "failed" /workspace/test.txt

expect:
  exitCode: 0
  stdoutContains:
    - failed login

classificationIfPass:
  fidelity: native-wasix
```

---

# 101. Negative Tests

Support claims require negative behavior too.

Example:

```bash
grep "missing" file
```

Expected:

```text
exit 1
```

not application failure.

---

# 102. Error Tests

Example:

```bash
cat nonexistent
```

Verify:

```text
nonzero exit
error appears on stderr
shell remains usable
```

---

# 103. Pipeline Tests

Example:

```bash
printf "c\na\nb\n" | sort | head -n 1
```

Expected:

```text
a
```

---

# 104. Filesystem Mutation Tests

Example:

```bash
mkdir test
touch test/a
cp test/a test/b
mv test/b test/c
rm test/c
```

Then validate final paths using the runtime filesystem API.

---

# 105. Reset Test

Workflow:

```text
seed fixture
mutate heavily
create new files
delete files
change cwd
set env variables
reset
compare against baseline
```

Reset must remove learner mutations relevant to the lab.

---

# 106. Network Denial Test

A networking package must not accidentally gain capability simply because it exists in the runtime.

Test concept:

```text
launch sandbox without network configuration
attempt controlled outbound operation
confirm denial/failure
```

This is a security regression test.

---

# 107. Package Composition Strategy

The final runtime may compose:

```text
shell package
+
core utility package(s)
+
text-processing package(s)
+
archive/hash utility package(s)
```

Do not assume one package contains everything.

---

# 108. Package Selection Criteria

Candidate packages shall be evaluated for:

1. active/credible source;
2. reproducible version;
3. browser WASIX compatibility;
4. command semantics;
5. package size;
6. cold-start cost;
7. license compatibility;
8. deterministic resolution;
9. security posture;
10. required commands.

---

# 109. Package Pinning

Use exact package versions where supported.

Conceptually:

```text
package@=<exact-version>
```

Do not depend on:

```text
latest
```

for production curriculum fidelity.

---

# 110. Command Collision Policy

If two composed packages export the same command:

1. explicitly select preferred package;
2. configure predictable PATH ordering;
3. document source package;
4. test exact resolved binary.

---

# 111. Command Origin Metadata

The fidelity registry should record:

```yaml
command: ls
source:
  package: "<package>"
  version: "<version>"
  binary: "<path>"
```

This allows reproducibility.

---

# 112. Built-in vs External Commands

The matrix must distinguish shell built-ins.

Example:

```text
cd      shell builtin
export  shell builtin
test    builtin and possibly external
pwd     builtin and/or external
echo    builtin and/or external
```

Curriculum should generally teach user-visible behavior rather than implementation detail, but advanced material may explain the distinction.

---

# 113. Aliases

Official curriculum shall not rely on aliases.

Reason:

Aliases vary across distributions and shells.

Example:

```bash
ls --color=auto
```

should not be assumed to exist through an alias.

---

# 114. Distribution-Specific Commands

Avoid teaching distro-specific utilities in the command-core curriculum.

Examples:

```text
apt
dnf
pacman
systemctl
```

These belong to later simulated administration modules.

---

# 115. GNU-Specific Features

Many Linux learners encounter GNU utilities.

However, browser packages may implement:

```text
GNU
uutils
BusyBox
other POSIX-compatible variants
```

SHELLGROUND must document meaningful option differences.

Do not teach an option that the shipped implementation does not support.

---

# 116. POSIX Baseline

Where practical, beginner labs should prefer broadly portable syntax.

Advanced labs may explicitly label GNU-specific behavior.

---

# 117. Fidelity Metadata Schema Preview

The later schema document should support a structure comparable to:

```yaml
id: command.grep

name: grep
category: search

fidelity:
  classification: native-wasix
  runtimeVersion: "<version>"

source:
  package: "<package>"
  packageVersion: "<version>"

capabilities:
  stdin: true
  stdout: true
  stderr: true
  files: true
  recursive: true

verifiedTests:
  - CMD-GREP-001
  - CMD-GREP-002

knownDifferences: []
```

This is illustrative only.

The final schema belongs to the Database/Content Schema document.

---

# 118. Curriculum Dependency Tags

Commands should advertise concepts they enable.

Example:

```yaml
grep:
  concepts:
    - text.search
    - streams.pipeline
    - regex.basic
```

---

# 119. Command Categories

The registry shall use stable categories.

Recommended:

```text
shell
navigation
filesystem
inspection
search
streams
text-processing
permissions
environment
processes
archives
integrity
scripting
system-inspection
networking
administration
security-analysis
```

---

# 120. MVP Command Target Summary

## P0 Native Candidates

```text
bash/sh
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
tee
env
export
test
sed
awk
```

Shell:

```text
pipes
redirection
variables
quoting
globbing
command substitution
exit status
```

---

## P1 Native Candidates

```text
rmdir
tr
basename
dirname
readlink
ln
xargs
date
sleep
sha256sum
tar
gzip
chmod
stat
du
```

Some may be deferred if native semantics are inadequate.

---

## Runtime-Dependent

```text
less
history
jobs
fg
bg
ps
kill
whoami
id
groups
umask
```

---

## Simulated

```text
df
ip
ss
ping
journalctl
systemctl
package manager behavior
multi-user administration
```

---

## Unsupported

```text
modprobe
insmod
rmmod
real iptables
real nftables
host tcpdump
Wi-Fi monitor mode
aircrack-ng
Metasploit
Hydra
SQLMap
raw packet injection
host device mounting
arbitrary SSH
```

---

# 121. MVP Blocking Criteria

The browser-runtime strategy is considered unsuitable for the current SHELLGROUND design if the runtime spike cannot reliably provide:

```text
interactive shell
basic filesystem
pipes
redirection
environment variables
basic scripting
core file operations
core text processing
```

Specifically, failure of more than a small number of the following P0 targets should trigger architecture review:

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
pipe
redirect
script
```

---

# 122. Fallback Strategy

If one utility is unavailable:

```text
compose another verified WASI/WASIX package
```

If several related utilities are unavailable:

```text
evaluate an alternative coreutils/BusyBox-style package
```

If the shell environment itself cannot provide adequate semantics:

```text
reassess the runtime implementation
```

Do not replace large portions of Linux with hand-coded fake commands merely to preserve the architecture.

---

# 123. Simulation Policy

Simulation is acceptable only when:

1. the learning concept depends on Linux kernel/system state;
2. the browser environment cannot expose meaningful real state;
3. the simulation is deterministic;
4. the UI clearly labels it;
5. the simulation teaches transferable command interpretation.

Examples:

```text
ip addr
ss -tulpn
systemctl status
df -h
```

---

# 124. Simulation Anti-Pattern

Do not implement:

```ts
if (input === "ls") {
  return "file1 file2";
}
```

for commands that can run natively.

That would create a terminal simulator rather than a Linux command training environment.

---

# 125. Unsupported Policy

A command should remain unsupported when:

- simulation offers little learning value;
- behavior depends on hardware;
- behavior creates security risk;
- browser limitations make output misleading;
- the command belongs outside product scope.

---

# 126. Version Drift Policy

A runtime/package update may change command semantics.

Therefore:

1. runtime packages remain pinned;
2. fidelity tests run before upgrading;
3. command matrix updates with package upgrades;
4. curriculum tests run against the new runtime;
5. no automatic production dependency update may silently change command behavior.

---

# 127. Continuous Fidelity Testing

Once implementation exists, CI or a scheduled compatible-browser test should periodically validate:

```text
runtime boot
P0 commands
P0 shell operators
fixture reset
network disabled
```

A package registry artifact disappearing or changing must not silently corrupt training behavior.

---

# 128. User-Facing Terminology

Recommended UI terminology:

```text
REAL
SIMULATED
NOT AVAILABLE
```

Developer/internal terminology:

```text
native-wasix
simulated
unsupported
unverified
```

---

# 129. Fidelity Tooltip Example

```text
REAL

This command is executed inside the SHELLGROUND
WASIX sandbox.

Behavior may still differ from a complete Linux
kernel. See Runtime Details.
```

---

# 130. Simulation Tooltip Example

```text
SIMULATED

This command operates on a deterministic training
model rather than a real Linux kernel subsystem.
```

---

# 131. Unsupported Tooltip Example

```text
NOT AVAILABLE

This command requires capabilities not provided by
the current SHELLGROUND training environment.
```

---

# 132. Runtime Spike Deliverables

Phase 0 must produce:

```text
docs/RUNTIME_SPIKE_RESULTS.md
docs/COMMAND_FIDELITY.md
runtime conformance tests
package manifest
package version lock
known limitations
```

---

# 133. Command Matrix Completion Gate

This pre-spike document becomes a verified command matrix only after:

- the runtime package set is pinned;
- every P0 command is tested;
- every P1 MVP dependency is tested;
- shell operators are tested;
- simulations are explicitly selected;
- unsupported commands are documented;
- known behavioral differences are recorded.

---

# 134. Requirement Traceability

## Core Shell and Filesystem

Supports:

```text
FR-002
FR-003
FR-004
FR-012
FR-013
FR-014
```

---

## Fidelity Classification

Supports:

```text
FR-027
RF-001
RF-002
RF-003
RF-004
RF-005
```

---

## Security Restrictions

Supports:

```text
SR-001
SR-002
SR-003
SR-004
SR-005
SR-006
```

---

## Curriculum Preparation

Supports:

```text
LR-001
LR-002
LR-003
LR-005
LR-006
```

---

# 135. Command-Support Baseline Decision

The initial SHELLGROUND technical strategy is:

```text
Use real browser-side shell behavior wherever practical.
Use composed verified WASI/WASIX utilities for core commands.
Simulate kernel/system-state commands only when educationally useful.
Reject hardware-level or unsafe functionality.
Never claim native support before the runtime spike proves it.
```

---

# 136. Final Pre-Spike Matrix

| Area | MVP Strategy |
|---|---|
| Shell | REAL candidate |
| Filesystem navigation | REAL candidate |
| File operations | REAL candidate |
| Text viewing | REAL candidate |
| Search | REAL candidate |
| Pipes | REAL candidate |
| Redirection | REAL candidate |
| Text processing | REAL candidate |
| Shell scripting | REAL candidate |
| Checksums | REAL candidate |
| Archives | REAL candidate |
| Permissions | VERIFY / possibly SIMULATED |
| Process tools | VERIFY / partial |
| Disk capacity | SIMULATED |
| User accounts | SIMULATED |
| Services | SIMULATED |
| Package management | DEFERRED/SIMULATED |
| Networking | DISABLED/SIMULATED |
| Firewall | UNSUPPORTED |
| Packet capture | UNSUPPORTED |
| Wi-Fi | UNSUPPORTED |
| Kernel modules | UNSUPPORTED |
| Host hardware | UNSUPPORTED |
| Arbitrary SSH | UNSUPPORTED |

---

# 137. Next Document

The next project document is:

```text
5. CURRICULUM
```

The curriculum will use this matrix to determine:

- which commands are introduced first;
- prerequisite relationships;
- stage progression;
- lab difficulty;
- repetition schedule;
- guided-to-blind transitions;
- mastery requirements;
- incident-style exercises.

The curriculum must not assume any command marked `unverified` has native runtime support until Phase 0 confirms it.
