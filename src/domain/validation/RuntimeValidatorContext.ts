/**
 * RuntimeValidatorContext - Non-destructive Validator Context Implementation
 * Inspects virtual sandbox state non-destructively via ShellRuntime
 */

import type { ShellRuntime } from '../../runtime/ports/ShellRuntime';
import type { ValidatorContext } from './Validator';

export interface RuntimeValidatorContextOptions {
  runtime: ShellRuntime;
  lastCommand?: string;
  lastStdout?: string;
  lastStderr?: string;
  lastExitCode?: number;
}

export class RuntimeValidatorContext implements ValidatorContext {
  public readonly runtime: ShellRuntime;
  public readonly lastCommand?: string;
  public readonly lastStdout?: string;
  public readonly lastStderr?: string;
  public readonly lastExitCode?: number;

  constructor(options: RuntimeValidatorContextOptions) {
    this.runtime = options.runtime;
    this.lastCommand = options.lastCommand;
    this.lastStdout = options.lastStdout;
    this.lastStderr = options.lastStderr;
    this.lastExitCode = options.lastExitCode;
  }

  /**
   * Safely escapes shell single quote arguments to prevent shell injection during queries
   */
  private escapeArg(arg: string): string {
    return `'${arg.replace(/'/g, "'\\''")}'`;
  }

  public async readFile(path: string): Promise<string | null> {
    try {
      const res = await this.runtime.execute(`cat -- ${this.escapeArg(path)}`);
      if (res.exitCode === 0) {
        return res.stdout;
      }
      return null;
    } catch {
      return null;
    }
  }

  public async fileExists(path: string): Promise<boolean> {
    try {
      const res = await this.runtime.execute(`test -e ${this.escapeArg(path)}`);
      return res.exitCode === 0;
    } catch {
      return false;
    }
  }

  public async readDir(path: string): Promise<string[] | null> {
    try {
      const res = await this.runtime.execute(`ls -1a -- ${this.escapeArg(path)}`);
      if (res.exitCode !== 0) {
        return null;
      }
      const entries = res.stdout
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s !== '.' && s !== '..');
      return entries;
    } catch {
      return null;
    }
  }

  public async getCwd(): Promise<string> {
    try {
      const res = await this.runtime.execute('pwd');
      if (res.exitCode === 0) {
        return res.stdout.trim();
      }
      return '';
    } catch {
      return '';
    }
  }

  public async getEnv(name: string): Promise<string | null> {
    try {
      // Validate env var name pattern (alphanumeric and underscore only)
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
        return null;
      }
      const res = await this.runtime.execute(`printenv ${this.escapeArg(name)}`);
      if (res.exitCode === 0) {
        return res.stdout.replace(/\r?\n$/, '');
      }
      return null;
    } catch {
      return null;
    }
  }

  public async getFileMode(path: string): Promise<string | null> {
    try {
      const res = await this.runtime.execute(`stat -c "%a" -- ${this.escapeArg(path)}`);
      if (res.exitCode === 0) {
        return res.stdout.trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  public async getSymlinkTarget(path: string): Promise<string | null> {
    try {
      const res = await this.runtime.execute(`readlink -- ${this.escapeArg(path)}`);
      if (res.exitCode === 0) {
        return res.stdout.trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  public async getFileHash(path: string, _algorithm: 'sha256' = 'sha256'): Promise<string | null> {
    try {
      const content = await this.readFile(path);
      if (content === null) {
        return null;
      }
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch {
      return null;
    }
  }
}
