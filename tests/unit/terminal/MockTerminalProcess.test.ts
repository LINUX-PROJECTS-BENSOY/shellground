import { describe, it, expect, vi } from 'vitest';
import { MockTerminalProcess } from '@terminal/mock-process';

describe('MockTerminalProcess', () => {
  it('initializes and emits welcome banner and prompt', () => {
    const process = new MockTerminalProcess();
    const outputs: string[] = [];

    process.onOutput((data) => {
      outputs.push(data);
    });

    process.emitWelcomeBanner();

    const fullOutput = outputs.join('');
    expect(fullOutput).toContain('SHELLGROUND');
    expect(fullOutput).toContain('Linux Command Training Subsystem');
    expect(fullOutput).toContain('student@shellground');
  });

  it('handles basic commands like pwd, ls, help, and echo', () => {
    const process = new MockTerminalProcess();
    const outputs: string[] = [];

    process.onOutput((data) => {
      outputs.push(data);
    });

    // Send 'pwd' + Enter
    process.writeInput('pwd\r');
    let fullOutput = outputs.join('');
    expect(fullOutput).toContain('/workspace');

    // Send 'ls' + Enter
    outputs.length = 0;
    process.writeInput('ls\r');
    fullOutput = outputs.join('');
    expect(fullOutput).toContain('alpha.txt');

    // Send 'echo hello world' + Enter
    outputs.length = 0;
    process.writeInput('echo hello world\n');
    fullOutput = outputs.join('');
    expect(fullOutput).toContain('hello world');

    // Send 'help' + Enter
    outputs.length = 0;
    process.writeInput('help\r');
    fullOutput = outputs.join('');
    expect(fullOutput).toContain('SHELLGROUND Presentation Subsystem');

    // Send unknown command
    outputs.length = 0;
    process.writeInput('foobar\r');
    fullOutput = outputs.join('');
    expect(fullOutput).toContain('command not found (mock terminal)');
  });

  it('handles backspace editing properly', () => {
    const process = new MockTerminalProcess();
    const outputs: string[] = [];

    process.onOutput((data) => {
      outputs.push(data);
    });

    // Type 'pw' then backspace then 'd' then Enter
    process.writeInput('pw\x7fd\r');
    const fullOutput = outputs.join('');
    expect(fullOutput).toContain('/workspace');
  });

  it('handles Ctrl+C interrupt in input buffer', () => {
    const process = new MockTerminalProcess();
    const outputs: string[] = [];

    process.onOutput((data) => {
      outputs.push(data);
    });

    // Type some text then Ctrl+C
    process.writeInput('some long command\x03');
    const fullOutput = outputs.join('');
    expect(fullOutput).toContain('^C');
    expect(fullOutput).toContain('student@shellground');
  });

  it('handles Ctrl+D exit signal', () => {
    const process = new MockTerminalProcess();
    const outputs: string[] = [];

    process.onOutput((data) => {
      outputs.push(data);
    });

    process.writeInput('\x04');
    const fullOutput = outputs.join('');
    expect(fullOutput).toContain('exit');
  });

  it('supports error and resize listeners', () => {
    const process = new MockTerminalProcess();
    const errorSpy = vi.fn();

    const unsubError = process.onError(errorSpy);
    expect(typeof unsubError).toBe('function');
    unsubError();

    expect(() => process.resize(120, 40)).not.toThrow();
  });
});
