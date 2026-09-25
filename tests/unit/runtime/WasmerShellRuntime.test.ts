import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WasmerShellRuntime } from '@runtime/client/WasmerShellRuntime';
import type { RuntimeStatus } from '@runtime/ports/ShellRuntime';

class MockWorker {
  public postMessage = vi.fn();
  public terminate = vi.fn();
  public onmessage: ((e: MessageEvent) => void) | null = null;
  public onerror: ((e: ErrorEvent) => void) | null = null;

  public emit(data: unknown): void {
    if (this.onmessage) {
      this.onmessage({ data } as MessageEvent);
    }
  }

  public emitError(message: string): void {
    if (this.onerror) {
      this.onerror({ message } as ErrorEvent);
    }
  }

  public getMessage(index: number): { id: string; type: string; payload?: Record<string, unknown> } {
    const call = this.postMessage.mock.calls[index];
    if (!call || !call[0]) {
      throw new Error(`No postMessage call at index ${index}`);
    }
    return call[0] as { id: string; type: string; payload?: Record<string, unknown> };
  }
}

describe('WasmerShellRuntime Client Adapter', () => {
  let mockWorker: MockWorker;
  let runtime: WasmerShellRuntime;

  beforeEach(() => {
    mockWorker = new MockWorker();
    runtime = new WasmerShellRuntime({
      worker: mockWorker as unknown as Worker,
      defaultTimeoutMs: 1000,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts in uninitialized status', () => {
    expect(runtime.status).toBe('uninitialized');
  });

  it('tracks status transitions and notifies onStatusChange listeners', async () => {
    const statuses: RuntimeStatus[] = [];
    const unsub = runtime.onStatusChange((s) => {
      statuses.push(s);
    });

    const initPromise = runtime.initialize();
    expect(runtime.status).toBe('initializing');
    expect(statuses).toContain('initializing');

    // Simulate worker ready response
    const initReq = mockWorker.getMessage(0);
    mockWorker.emit({ requestId: initReq.id, type: 'runtime.ready' });

    await initPromise;
    expect(runtime.status).toBe('ready');
    expect(statuses).toEqual(['initializing', 'ready']);

    unsub();
  });

  it('throws error when executing command before initialization', async () => {
    await expect(runtime.execute('pwd')).rejects.toThrow(
      'Cannot execute command in state: uninitialized'
    );
  });

  it('executes command and returns ExecutionResult', async () => {
    // 1. Initialize
    const initPromise = runtime.initialize();
    const initReq = mockWorker.getMessage(0);
    mockWorker.emit({ requestId: initReq.id, type: 'runtime.ready' });
    await initPromise;

    // 2. Execute command
    const execPromise = runtime.execute('echo hello');
    expect(runtime.status).toBe('executing');

    const execCall = mockWorker.getMessage(1);
    expect(execCall.type).toBe('command.execute');
    expect(execCall.payload?.['commandLine']).toBe('echo hello');

    const execReqId = execCall.id;
    mockWorker.emit({
      requestId: execReqId,
      type: 'command.result',
      payload: { exitCode: 0, stdout: 'hello\n', stderr: '' },
    });

    const result = await execPromise;
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('hello\n');
    expect(runtime.status).toBe('ready');
  });

  it('prevents concurrent execution on the active channel', async () => {
    // 1. Initialize
    const initPromise = runtime.initialize();
    const initReq = mockWorker.getMessage(0);
    mockWorker.emit({ requestId: initReq.id, type: 'runtime.ready' });
    await initPromise;

    // 2. Start first execution
    void runtime.execute('sleep 10');
    expect(runtime.status).toBe('executing');

    // 3. Attempt second execution concurrently
    await expect(runtime.execute('ls')).rejects.toThrow(
      'Runtime is already executing a command'
    );
  });

  it('rejects execution on timeout and restores ready state', async () => {
    vi.useFakeTimers();

    const shortTimeoutRuntime = new WasmerShellRuntime({
      worker: mockWorker as unknown as Worker,
      defaultTimeoutMs: 500,
    });

    const initPromise = shortTimeoutRuntime.initialize();
    const initReq = mockWorker.getMessage(0);
    mockWorker.emit({ requestId: initReq.id, type: 'runtime.ready' });
    await initPromise;

    const execPromise = shortTimeoutRuntime.execute('slow-command', { timeoutMs: 300 });

    // Advance timers past timeout
    vi.advanceTimersByTime(350);

    await expect(execPromise).rejects.toThrow('Command execution timed out after 300ms');
    expect(shortTimeoutRuntime.status).toBe('ready');

    vi.useRealTimers();
  });

  it('interrupt() cancels active command with SIGINT error and resets state', async () => {
    const initPromise = runtime.initialize();
    const initReq = mockWorker.getMessage(0);
    mockWorker.emit({ requestId: initReq.id, type: 'runtime.ready' });
    await initPromise;

    const execPromise = runtime.execute('infinite_loop');
    expect(runtime.status).toBe('executing');

    await runtime.interrupt();

    await expect(execPromise).rejects.toThrow('Command execution interrupted by user (SIGINT)');
    expect(runtime.status).toBe('ready');
  });

  it('forwards output and error events to registered callbacks', async () => {
    const initPromise = runtime.initialize();
    const initReq = mockWorker.getMessage(0);
    mockWorker.emit({ requestId: initReq.id, type: 'runtime.ready' });
    await initPromise;

    const outputs: string[] = [];
    const errors: string[] = [];

    const unsubOut = runtime.onOutput((data) => outputs.push(data));
    const unsubErr = runtime.onError((err) => errors.push(err));

    mockWorker.emit({
      type: 'terminal.output',
      payload: { data: 'live terminal output' },
    });

    mockWorker.emitError('worker crashed');

    expect(outputs).toEqual(['live terminal output']);
    expect(errors).toEqual(['worker crashed']);

    unsubOut();
    unsubErr();
  });

  it('forwards stdin and resize requests when activeProcessId exists', async () => {
    const initPromise = runtime.initialize();
    const initReq = mockWorker.getMessage(0);
    mockWorker.emit({ requestId: initReq.id, type: 'runtime.ready' });
    await initPromise;

    // Open terminal session
    const openPromise = runtime.openTerminal({ columns: 90, rows: 30 });
    const openReq = mockWorker.getMessage(1);
    mockWorker.emit({
      requestId: openReq.id,
      type: 'terminal.opened',
      payload: { processId: 'proc_123' },
    });
    const procId = await openPromise;
    expect(procId).toBe('proc_123');

    // Test writeInput
    runtime.writeInput('ls\r');
    const stdinCall = mockWorker.getMessage(2);
    expect(stdinCall.type).toBe('terminal.stdin');
    expect(stdinCall.payload?.['data']).toBe('ls\r');

    // Test resize
    runtime.resize(100, 35);
    const resizeCall = mockWorker.getMessage(3);
    expect(resizeCall.type).toBe('terminal.resize');
    expect(resizeCall.payload?.['columns']).toBe(100);
    expect(resizeCall.payload?.['rows']).toBe(35);
  });

  it('terminates worker and cleans up resources', async () => {
    const initPromise = runtime.initialize();
    const initReq = mockWorker.getMessage(0);
    mockWorker.emit({ requestId: initReq.id, type: 'runtime.ready' });
    await initPromise;

    const termPromise = runtime.terminate();
    const disposeReq = mockWorker.getMessage(1);
    expect(disposeReq.type).toBe('runtime.dispose');

    mockWorker.emit({
      requestId: disposeReq.id,
      type: 'runtime.disposed',
    });

    await termPromise;
    expect(runtime.status).toBe('uninitialized');
    expect(mockWorker.terminate).toHaveBeenCalled();
  });
});
