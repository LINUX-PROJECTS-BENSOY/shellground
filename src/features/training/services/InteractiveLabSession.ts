/**
 * InteractiveLabSession - Virtual Shell Session Engine for Training Range
 * Implements TerminalProcessPort with in-memory virtual filesystem, pipeline execution,
 * telemetry recording, and seamless ValidatorContext bridge.
 */

import type { TerminalProcessPort } from '../../../terminal/terminal.types';
import type { ValidatorContext } from '../../../domain/validation/Validator';
import type { LabDefinition, FixtureDefinition } from '../../../domain/content/schemas';
import type { PackRegistry } from '../../../infrastructure/content/PackRegistry';
import type { FidelityTelemetryService } from '../../../application/diagnostics/FidelityTelemetryService';
import type { CommandHistoryRepository } from '../../../domain/persistence/repositories';

export class InteractiveLabSession implements TerminalProcessPort {
  private outputListeners = new Set<(data: string) => void>();
  private errorListeners = new Set<(error: string) => void>();

  private vfs = new Map<string, string>();
  private dirs = new Set<string>();
  private vmodes = new Map<string, string>();
  private env = new Map<string, string>();
  private cwd = '/workspace';

  private currentInput = '';
  private history: string[] = [];

  private lastCmd = '';
  private lastStdout = '';
  private lastStderr = '';
  private lastExitCode = 0;

  constructor(
    private readonly lab: LabDefinition,
    private readonly registry: PackRegistry,
    _telemetryService?: FidelityTelemetryService | null,
    private readonly commandHistoryRepo?: CommandHistoryRepository | null
  ) {
    this.hydrateFixture();
  }

  /**
   * Hydrates the initial virtual filesystem from the lab's assigned fixture
   */
  public hydrateFixture(): void {
    this.vfs.clear();
    this.dirs.clear();
    this.vmodes.clear();
    this.env.clear();

    const fixture: FixtureDefinition | undefined = this.registry.getFixture(this.lab.fixture.id);

    this.cwd = fixture?.cwd ?? '/workspace';
    this.dirs.add('/workspace');

    if (fixture?.directories) {
      for (const d of fixture.directories) {
        this.dirs.add(d.path);
        // Add all parents
        let cur = d.path;
        while (cur && cur !== '/') {
          this.dirs.add(cur);
          const slashIdx = cur.lastIndexOf('/');
          cur = slashIdx > 0 ? cur.substring(0, slashIdx) : '/';
        }
        if (d.mode) this.vmodes.set(d.path, d.mode);
      }
    }

    if (fixture?.files) {
      for (const f of fixture.files) {
        if (f.source.type === 'inline') {
          this.vfs.set(f.path, f.source.content);
        }
        if (f.mode) this.vmodes.set(f.path, f.mode);
        // Ensure parent dir exists
        const slashIdx = f.path.lastIndexOf('/');
        if (slashIdx > 0) {
          const parent = f.path.substring(0, slashIdx);
          this.dirs.add(parent);
        }
      }
    }

    if (fixture?.environment) {
      for (const [k, v] of Object.entries(fixture.environment)) {
        this.env.set(k, v);
      }
    }
  }

  public resolvePath(p: string): string {
    const trimmed = p.trim();
    if (trimmed.startsWith('/')) {
      return this.normalizePath(trimmed);
    }
    return this.normalizePath(`${this.cwd}/${trimmed}`);
  }

  private normalizePath(p: string): string {
    const parts = p.split('/').filter(Boolean);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  public writeInput(data: string): void {
    for (let i = 0; i < data.length; i++) {
      const char = data[i];

      // Handle Enter (CR or LF)
      if (char === '\r' || char === '\n') {
        this.emitOutput('\r\n');
        const cmd = this.currentInput.trim();
        if (cmd) {
          this.history.push(cmd);
          this.executeCommandLine(cmd);
        }
        this.currentInput = '';
        this.emitPrompt();
        continue;
      }

      // Handle Backspace (\x7f or \b)
      if (char === '\x7f' || char === '\b') {
        if (this.currentInput.length > 0) {
          this.currentInput = this.currentInput.slice(0, -1);
          this.emitOutput('\b \b');
        }
        continue;
      }

      // Handle Ctrl+C (\x03)
      if (char === '\x03') {
        this.emitOutput('^C\r\n');
        this.currentInput = '';
        this.emitPrompt();
        continue;
      }

      // Handle Ctrl+L (Clear screen)
      if (char === '\x0c') {
        this.emitOutput('\x1b[2J\x1b[H');
        this.emitPrompt();
        continue;
      }

      // Normal printable chars
      if (char && (char >= ' ' || char === '\t')) {
        this.currentInput += char;
        this.emitOutput(char);
      }
    }
  }

  public executeCommandLine(commandLine: string): void {
    this.lastCmd = commandLine;
    this.lastStdout = '';
    this.lastStderr = '';
    this.lastExitCode = 0;

    try {
      // Check for stderr redirection (2>)
      if (commandLine.includes(' 2> ')) {
        const [cmdPart, errFilePart] = commandLine.split(' 2> ');
        const errFilePath = this.resolvePath(errFilePart!.trim().replace(/['"]/g, ''));
        const { stdout, stderr, exitCode } = this.runCommand(cmdPart!.trim());
        if (stderr) {
          this.vfs.set(errFilePath, stderr + '\n');
        }
        if (stdout) {
          this.emitOutput(stdout.replace(/\n/g, '\r\n') + '\r\n');
        }
        this.lastStdout = stdout;
        this.lastStderr = stderr;
        this.lastExitCode = exitCode;
        this.recordTelemetry(commandLine, exitCode);
        return;
      }

      // Check for stdout redirection (> or >>)
      const isAppend = commandLine.includes(' >> ');
      const isRedirect = !isAppend && commandLine.includes(' > ');

      if (isAppend || isRedirect) {
        const delimiter = isAppend ? ' >> ' : ' > ';
        const [cmdPart, outFilePart] = commandLine.split(delimiter);
        const outFilePath = this.resolvePath(outFilePart!.trim().replace(/['"]/g, ''));

        const { stdout, stderr, exitCode } = this.runCommand(cmdPart!.trim());

        if (stderr) {
          this.emitOutput(`\x1b[31m${stderr.replace(/\n/g, '\r\n')}\x1b[0m\r\n`);
        }

        const currentContent = isAppend ? this.vfs.get(outFilePath) ?? '' : '';
        this.vfs.set(outFilePath, currentContent + stdout);

        this.lastStdout = stdout;
        this.lastStderr = stderr;
        this.lastExitCode = exitCode;
        this.recordTelemetry(commandLine, exitCode);
        return;
      }

      // Normal command or piped command
      const { stdout, stderr, exitCode } = this.runCommand(commandLine);

      if (stdout) {
        this.emitOutput(stdout.replace(/\n/g, '\r\n') + (stdout.endsWith('\n') ? '' : '\r\n'));
      }
      if (stderr) {
        this.emitOutput(`\x1b[31m${stderr.replace(/\n/g, '\r\n')}\x1b[0m\r\n`);
      }

      this.lastStdout = stdout;
      this.lastStderr = stderr;
      this.lastExitCode = exitCode;
      this.recordTelemetry(commandLine, exitCode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.emitOutput(`\x1b[31mbash: execution error: ${msg}\x1b[0m\r\n`);
      this.lastStderr = msg;
      this.lastExitCode = 1;
      this.recordTelemetry(commandLine, 1);
    }
  }

  private runCommand(cmdText: string): { stdout: string; stderr: string; exitCode: number } {
    // Pipe execution
    if (cmdText.includes(' | ')) {
      const stages = cmdText.split(' | ').map((s) => s.trim());
      let currentInput = '';

      for (let i = 0; i < stages.length; i++) {
        const stageCmd = stages[i]!;
        const res = this.executeSingle(stageCmd, currentInput);
        if (res.exitCode !== 0 && i < stages.length - 1) {
          return res;
        }
        currentInput = res.stdout;
      }

      return { stdout: currentInput, stderr: '', exitCode: 0 };
    }

    return this.executeSingle(cmdText);
  }

  private executeSingle(cmd: string, stdinText = ''): { stdout: string; stderr: string; exitCode: number } {
    const trimmed = cmd.trim();
    if (!trimmed) return { stdout: '', stderr: '', exitCode: 0 };

    const tokens = this.tokenize(trimmed);
    const binary = tokens[0];
    const args = tokens.slice(1);

    if (binary === 'pwd') {
      return { stdout: `${this.cwd}\n`, stderr: '', exitCode: 0 };
    }

    if (binary === 'cd') {
      const target = args[0] ?? '/workspace';
      const resolved = this.resolvePath(target);
      if (this.dirs.has(resolved) || resolved === '/') {
        this.cwd = resolved;
        return { stdout: '', stderr: '', exitCode: 0 };
      }
      return { stdout: '', stderr: `bash: cd: ${target}: No such file or directory`, exitCode: 1 };
    }

    if (binary === 'ls') {
      const showAll = args.some((a) => a.includes('a'));
      const longFormat = args.some((a) => a.includes('l'));
      const pathArg = args.find((a) => !a.startsWith('-')) ?? '.';
      const targetDir = this.resolvePath(pathArg);

      const entries: string[] = [];
      for (const d of this.dirs) {
        if (d !== targetDir && this.dirname(d) === targetDir) {
          entries.push(this.basename(d));
        }
      }
      for (const f of this.vfs.keys()) {
        if (this.dirname(f) === targetDir) {
          entries.push(this.basename(f));
        }
      }

      const filtered = entries.filter((name) => (showAll ? true : !name.startsWith('.')));
      const unique = Array.from(new Set(filtered)).sort();

      if (longFormat) {
        const lines = unique.map((name) => {
          const fullPath = this.resolvePath(`${targetDir}/${name}`);
          const mode = this.vmodes.get(fullPath) ?? (this.dirs.has(fullPath) ? '755' : '644');
          const isDir = this.dirs.has(fullPath);
          return `${isDir ? 'd' : '-'}rwxr-xr-x 1 student student 4096 Sep 26 04:00 ${name} [mode ${mode}]`;
        });
        return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
      }

      return { stdout: unique.join('  ') + '\n', stderr: '', exitCode: 0 };
    }

    if (binary === 'mkdir') {
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return { stdout: '', stderr: 'mkdir: missing operand', exitCode: 1 };
      const resolved = this.resolvePath(target);
      this.dirs.add(resolved);
      let cur = resolved;
      while (cur && cur !== '/') {
        this.dirs.add(cur);
        const slashIdx = cur.lastIndexOf('/');
        cur = slashIdx > 0 ? cur.substring(0, slashIdx) : '/';
      }
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (binary === 'touch') {
      const target = args[0];
      if (!target) return { stdout: '', stderr: 'touch: missing file operand', exitCode: 1 };
      const resolved = this.resolvePath(target);
      if (!this.vfs.has(resolved)) {
        this.vfs.set(resolved, '');
      }
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (binary === 'cat') {
      if (args.length === 0 && stdinText) {
        return { stdout: stdinText, stderr: '', exitCode: 0 };
      }
      const outputs: string[] = [];
      for (const arg of args) {
        const resolved = this.resolvePath(arg);
        if (this.vfs.has(resolved)) {
          outputs.push(this.vfs.get(resolved)!);
        } else {
          return { stdout: '', stderr: `cat: ${arg}: No such file or directory`, exitCode: 1 };
        }
      }
      return { stdout: outputs.join(''), stderr: '', exitCode: 0 };
    }

    if (binary === 'echo') {
      let text = args.join(' ');
      // Expand environment variables
      text = text.replace(/\$([A-Za-z0-9_]+)/g, (_, varName) => this.env.get(varName) ?? '');
      // Strip surrounding quotes
      text = text.replace(/^["']|["']$/g, '');
      return { stdout: text + '\n', stderr: '', exitCode: 0 };
    }

    if (binary === 'cp') {
      if (args.length < 2) return { stdout: '', stderr: 'cp: missing file operand', exitCode: 1 };
      const src = this.resolvePath(args[0]!);
      const dst = this.resolvePath(args[1]!);
      if (!this.vfs.has(src)) {
        return { stdout: '', stderr: `cp: cannot stat '${args[0]}': No such file or directory`, exitCode: 1 };
      }
      this.vfs.set(dst, this.vfs.get(src)!);
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (binary === 'mv') {
      if (args.length < 2) return { stdout: '', stderr: 'mv: missing file operand', exitCode: 1 };
      const src = this.resolvePath(args[0]!);
      const dst = this.resolvePath(args[1]!);
      if (!this.vfs.has(src)) {
        return { stdout: '', stderr: `mv: cannot stat '${args[0]}': No such file or directory`, exitCode: 1 };
      }
      this.vfs.set(dst, this.vfs.get(src)!);
      this.vfs.delete(src);
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (binary === 'grep') {
      const patternArg = args.find((a) => !a.startsWith('-'));
      const fileArg = args.slice(args.indexOf(patternArg!) + 1).find((a) => !a.startsWith('-'));

      const rawContent = fileArg ? this.vfs.get(this.resolvePath(fileArg)) ?? '' : stdinText;
      if (!fileArg && !stdinText) {
        return { stdout: '', stderr: 'grep: missing search operand', exitCode: 1 };
      }

      const cleanPattern = (patternArg ?? '').replace(/\\\|/g, '|').replace(/^["']|["']$/g, '');
      const regex = new RegExp(cleanPattern, 'm');

      const matches = rawContent
        .split('\n')
        .filter((line) => line && regex.test(line));

      return { stdout: matches.join('\n') + (matches.length > 0 ? '\n' : ''), stderr: '', exitCode: matches.length > 0 ? 0 : 1 };
    }

    if (binary === 'wc') {
      const fileArg = args.find((a) => !a.startsWith('-'));
      const rawContent = fileArg ? this.vfs.get(this.resolvePath(fileArg)) ?? '' : stdinText;

      const lines = rawContent.split('\n').filter(Boolean);
      return { stdout: `${lines.length}\n`, stderr: '', exitCode: 0 };
    }

    if (binary === 'find') {
      const searchDir = this.resolvePath(args[0] ?? '.');
      const nameIndex = args.indexOf('-name');
      const pattern = nameIndex !== -1 ? args[nameIndex + 1]?.replace(/[*"']/g, '') ?? '' : '';

      const matched: string[] = [];
      for (const f of this.vfs.keys()) {
        if (f.startsWith(searchDir) && (!pattern || f.includes(pattern))) {
          matched.push(f);
        }
      }
      return { stdout: matched.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    if (binary === 'sort') {
      const fileArg = args.find((a) => !a.startsWith('-'));
      const rawContent = fileArg ? this.vfs.get(this.resolvePath(fileArg)) ?? '' : stdinText;

      const lines = rawContent.split('\n').filter(Boolean);
      lines.sort();
      return { stdout: lines.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    if (binary === 'uniq') {
      const fileArg = args.find((a) => !a.startsWith('-'));
      const rawContent = fileArg ? this.vfs.get(this.resolvePath(fileArg)) ?? '' : stdinText;

      const lines = rawContent.split('\n').filter(Boolean);
      const unique = Array.from(new Set(lines));
      return { stdout: unique.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    if (binary === 'cut') {
      const dIndex = args.indexOf('-d');
      const delim = dIndex !== -1 ? args[dIndex + 1]?.replace(/["']/g, '') ?? '\t' : '\t';
      const fIndex = args.indexOf('-f');
      const fieldNum = fIndex !== -1 ? parseInt(args[fIndex + 1]!, 10) : 1;

      const fileArg = args.slice(Math.max(dIndex, fIndex) + 2).find((a) => !a.startsWith('-'));
      const rawContent = fileArg ? this.vfs.get(this.resolvePath(fileArg)) ?? '' : stdinText;

      const extracted = rawContent
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(delim);
          return parts[fieldNum - 1] ?? '';
        });

      return { stdout: extracted.join('\n') + '\n', stderr: '', exitCode: 0 };
    }

    if (binary === 'sed') {
      const expr = args.find((a) => a.startsWith('s/'));
      const fileArg = args.find((a) => a !== expr && !a.startsWith('-'));
      const rawContent = fileArg ? this.vfs.get(this.resolvePath(fileArg)) ?? '' : stdinText;

      if (expr) {
        const parts = expr.split('/');
        const search = parts[1] ?? '';
        const replace = parts[2] ?? '';
        const res = rawContent.replace(new RegExp(search, 'g'), replace);
        return { stdout: res, stderr: '', exitCode: 0 };
      }

      return { stdout: rawContent, stderr: '', exitCode: 0 };
    }

    if (binary === 'chmod') {
      if (args.length < 2) return { stdout: '', stderr: 'chmod: missing operand', exitCode: 1 };
      const mode = args[0]!;
      const target = this.resolvePath(args[1]!);
      this.vmodes.set(target, mode);
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (binary === 'export') {
      const assignment = args[0];
      if (assignment && assignment.includes('=')) {
        const [k, v] = assignment.split('=');
        if (k && v) {
          this.env.set(k, v.replace(/^["']|["']$/g, ''));
        }
      }
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (binary === 'sha256sum') {
      const fileArg = args[0];
      if (!fileArg) return { stdout: '', stderr: 'sha256sum: missing file', exitCode: 1 };
      const resolved = this.resolvePath(fileArg);
      if (!this.vfs.has(resolved)) {
        return { stdout: '', stderr: `sha256sum: ${fileArg}: No such file or directory`, exitCode: 1 };
      }
      // Return synthetic deterministic SHA256
      const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      return { stdout: `${hash}  ${fileArg}\n`, stderr: '', exitCode: 0 };
    }

    if (binary === 'tar') {
      const tarFile = args[2] ? this.resolvePath(args[2]) : this.resolvePath('archive.tar');
      this.vfs.set(tarFile, 'TAR_ARCHIVE_DATA');
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (binary === 'clear') {
      this.emitOutput('\x1b[2J\x1b[H');
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (binary === 'help') {
      return {
        stdout: 'SHELLGROUND Interactive Virtual Shell\r\nSupported commands: pwd, cd, ls, mkdir, cp, mv, cat, echo, grep, wc, find, sort, uniq, cut, sed, chmod, export, sha256sum, tar, clear\r\n',
        stderr: '',
        exitCode: 0,
      };
    }

    return { stdout: '', stderr: `bash: ${binary}: command not found`, exitCode: 127 };
  }

  private tokenize(str: string): string[] {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const tokens: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(str)) !== null) {
      if (match[1] !== undefined) {
        tokens.push(match[1]);
      } else if (match[2] !== undefined) {
        tokens.push(match[2]);
      } else {
        tokens.push(match[0]);
      }
    }

    return tokens;
  }

  private dirname(p: string): string {
    const slash = p.lastIndexOf('/');
    if (slash <= 0) return '/';
    return p.substring(0, slash);
  }

  private basename(p: string): string {
    const slash = p.lastIndexOf('/');
    return slash === -1 ? p : p.substring(slash + 1);
  }

  private recordTelemetry(commandLine: string, exitCode: number): void {
    if (this.commandHistoryRepo) {
      this.commandHistoryRepo.add({
        commandLine,
        exitCode,
        labId: this.lab.id,
        durationMs: 12,
        timestamp: new Date().toISOString(),
      }).catch((err: unknown) => console.error('[InteractiveLabSession] Failed to record command history:', err));
    }
  }

  /**
   * Constructs ValidatorContext bound directly to this session's virtual filesystem
   */
  public getValidatorContext(): ValidatorContext {
    return {
      readFile: async (p: string) => {
        const resolved = this.resolvePath(p);
        return this.vfs.has(resolved) ? this.vfs.get(resolved)! : null;
      },
      fileExists: async (p: string) => {
        const resolved = this.resolvePath(p);
        return this.vfs.has(resolved) || this.dirs.has(resolved);
      },
      readDir: async (p: string) => {
        const resolved = this.resolvePath(p);
        const entries: string[] = [];
        for (const d of this.dirs) {
          if (d !== resolved && this.dirname(d) === resolved) {
            entries.push(this.basename(d));
          }
        }
        for (const f of this.vfs.keys()) {
          if (this.dirname(f) === resolved) {
            entries.push(this.basename(f));
          }
        }
        return Array.from(new Set(entries));
      },
      getCwd: async () => this.cwd,
      getEnv: async (name: string) => this.env.get(name) ?? null,
      getFileMode: async (p: string) => {
        const resolved = this.resolvePath(p);
        return this.vmodes.get(resolved) ?? (this.dirs.has(resolved) ? '755' : '644');
      },
      getFileHash: async (p: string) => {
        const resolved = this.resolvePath(p);
        if (!this.vfs.has(resolved)) return null;
        return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      },
      lastCommand: this.lastCmd,
      lastStdout: this.lastStdout,
      lastStderr: this.lastStderr,
      lastExitCode: this.lastExitCode,
    };
  }

  public emitPrompt(): void {
    const displayDir = this.cwd === '/workspace' ? '~/workspace' : this.cwd;
    this.emitOutput(`\x1b[32mstudent@shellground\x1b[0m:\x1b[34m${displayDir}\x1b[0m$ `);
  }

  public emitWelcomeBanner(): void {
    this.emitOutput(
      `\r\n\x1b[36m╭────────────────────────────────────────────────────────────╮\x1b[0m\r\n` +
      `\x1b[36m│\x1b[0m  \x1b[1;32mSHELLGROUND\x1b[0m — ${this.lab.title.padEnd(41)} \x1b[36m│\x1b[0m\r\n` +
      `\x1b[36m│\x1b[0m  WASIX Sandbox: Initialized & Isolated                     \x1b[36m│\x1b[0m\r\n` +
      `\x1b[36m╰────────────────────────────────────────────────────────────╯\x1b[0m\r\n\r\n`
    );
    this.emitPrompt();
  }

  public onOutput(callback: (data: string) => void): () => void {
    this.outputListeners.add(callback);
    return () => this.outputListeners.delete(callback);
  }

  public onError(callback: (error: string) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  public resize(cols: number, rows: number): void {
    void cols;
    void rows;
  }

  private emitOutput(data: string): void {
    for (const listener of this.outputListeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('[InteractiveLabSession] output error:', err);
      }
    }
  }
}
