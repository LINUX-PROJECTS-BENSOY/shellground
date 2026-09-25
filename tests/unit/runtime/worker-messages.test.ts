import { describe, it, expect } from 'vitest';
import type {
  InitMessage,
  ExecMessage,
  WriteInputMessage,
  ResizeMessage,
  InterruptMessage,
  ResetMessage,
  TerminateMessage,
  StdoutResponse,
  StderrResponse,
  ExitResponse,
  ErrorResponse,
} from '@runtime/worker/worker-messages';

describe('Runtime Worker Messages DTOs', () => {
  it('correctly types and instantiates request messages', () => {
    const initMsg: InitMessage = {
      id: 'req_1',
      type: 'runtime.initialize',
      payload: {
        shellPackage: 'wasmer/bash@1.0.25',
        packages: ['wasmer/grep@3.12.0'],
        networkMode: 'disabled',
      },
    };
    expect(initMsg.type).toBe('runtime.initialize');
    expect(initMsg.payload.shellPackage).toBe('wasmer/bash@1.0.25');

    const execMsg: ExecMessage = {
      id: 'req_2',
      type: 'command.execute',
      payload: {
        commandLine: 'echo test',
        timeoutMs: 5000,
      },
    };
    expect(execMsg.type).toBe('command.execute');

    const writeMsg: WriteInputMessage = {
      id: 'req_3',
      type: 'terminal.stdin',
      payload: {
        processId: 'proc_1',
        data: 'ls\n',
      },
    };
    expect(writeMsg.type).toBe('terminal.stdin');

    const resizeMsg: ResizeMessage = {
      id: 'req_4',
      type: 'terminal.resize',
      payload: {
        processId: 'proc_1',
        columns: 120,
        rows: 40,
      },
    };
    expect(resizeMsg.type).toBe('terminal.resize');

    const interruptMsg: InterruptMessage = {
      id: 'req_5',
      type: 'terminal.interrupt',
      payload: {
        processId: 'proc_1',
      },
    };
    expect(interruptMsg.type).toBe('terminal.interrupt');

    const resetMsg: ResetMessage = {
      id: 'req_6',
      type: 'runtime.reset',
    };
    expect(resetMsg.type).toBe('runtime.reset');

    const terminateMsg: TerminateMessage = {
      id: 'req_7',
      type: 'runtime.dispose',
    };
    expect(terminateMsg.type).toBe('runtime.dispose');
  });

  it('correctly types response messages', () => {
    const stdout: StdoutResponse = {
      type: 'terminal.output',
      payload: { data: 'hello world' },
    };
    expect(stdout.type).toBe('terminal.output');

    const stderr: StderrResponse = {
      type: 'terminal.error_output',
      payload: { data: 'error line' },
    };
    expect(stderr.type).toBe('terminal.error_output');

    const exit: ExitResponse = {
      requestId: 'req_2',
      type: 'command.result',
      payload: { exitCode: 0, stdout: 'ok', stderr: '' },
    };
    expect(exit.payload.exitCode).toBe(0);

    const err: ErrorResponse = {
      requestId: 'req_1',
      type: 'runtime.error',
      error: { code: 'INIT_FAIL', message: 'Failed to init' },
    };
    expect(err.error.code).toBe('INIT_FAIL');
  });
});
