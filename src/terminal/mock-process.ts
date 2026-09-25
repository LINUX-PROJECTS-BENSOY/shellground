/**
 * MockTerminalProcess - Fake Terminal Process Port for Decoupled Presentation Testing
 * Specified in Section 3.5 of IMPLEMENTATION_PLAN.md (Phase 2 Exit Gate)
 * 
 * Strict Invariant: Does not import @wasmer/sdk.
 */

import type { TerminalProcessPort } from './terminal.types';

export class MockTerminalProcess implements TerminalProcessPort {
  private outputListeners = new Set<(data: string) => void>();
  private errorListeners = new Set<(error: string) => void>();
  private currentInput = '';
  private currentCwd = '/workspace';

  public writeInput(data: string): void {
    for (const char of data) {

      // Handle Enter (CR or LF)
      if (char === '\r' || char === '\n') {
        this.emitOutput('\r\n');
        this.handleCommand(this.currentInput.trim());
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

      // Handle Ctrl+D (\x04)
      if (char === '\x04') {
        this.emitOutput('exit\r\n');
        return;
      }

      // Normal printable characters
      if (char >= ' ' || char === '\t') {
        this.currentInput += char;
        this.emitOutput(char);
      }
    }
  }

  private handleCommand(cmd: string): void {
    if (!cmd) return;

    if (cmd === 'pwd') {
      this.emitOutput(`${this.currentCwd}\r\n`);
    } else if (cmd === 'ls') {
      this.emitOutput('alpha.txt  beta.sh  nested_dir\r\n');
    } else if (cmd === 'help') {
      this.emitOutput('SHELLGROUND Presentation Subsystem (Mock Mode)\r\nAvailable mock commands: pwd, ls, help, clear\r\n');
    } else if (cmd === 'clear') {
      this.emitOutput('\x1b[2J\x1b[H');
    } else if (cmd.startsWith('echo ')) {
      this.emitOutput(`${cmd.slice(5)}\r\n`);
    } else {
      this.emitOutput(`bash: ${cmd}: command not found (mock terminal)\r\n`);
    }
  }

  public emitPrompt(): void {
    this.emitOutput(`\x1b[32mstudent@shellground\x1b[0m:\x1b[34m${this.currentCwd}\x1b[0m$ `);
  }

  public emitWelcomeBanner(): void {
    this.emitOutput(
      '\r\n\x1b[36m╭────────────────────────────────────────────────────────────╮\x1b[0m\r\n' +
      '\x1b[36m│\x1b[0m  \x1b[1;32mSHELLGROUND\x1b[0m — Linux Command Training Subsystem (Phase 2)    \x1b[36m│\x1b[0m\r\n' +
      '\x1b[36m│\x1b[0m  Presentation terminal initialized in decoupled mock mode. \x1b[36m│\x1b[0m\r\n' +
      '\x1b[36m╰────────────────────────────────────────────────────────────╯\x1b[0m\r\n\r\n'
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
    // Acknowledge resize
    void cols;
    void rows;
  }

  private emitOutput(data: string): void {
    for (const listener of this.outputListeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('[MockTerminalProcess] output listener error:', err);
      }
    }
  }
}
