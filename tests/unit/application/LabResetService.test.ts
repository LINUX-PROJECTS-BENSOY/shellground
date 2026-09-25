import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ShellRuntime } from '../../../src/runtime/ports/ShellRuntime';
import type { LabDefinition, FixtureDefinition } from '../../../src/domain/content/schemas';
import { PackRegistry } from '../../../src/infrastructure/content/PackRegistry';
import { LabResetService, type ResetState } from '../../../src/application/labs/LabResetService';

describe('LabResetService', () => {
  let mockRuntime: ShellRuntime;
  let packRegistry: PackRegistry;
  let service: LabResetService;

  const mockFixture: FixtureDefinition = {
    schemaVersion: 1,
    id: 'fixture.test.default',
    version: 1,
    root: '/workspace',
    cwd: '/workspace',
    files: [
      {
        path: '/workspace/welcome.txt',
        source: {
          type: 'inline',
          content: 'Welcome to Shellground!',
        },
      },
    ],
  };

  const mockLab: LabDefinition = {
    schemaVersion: 1,
    id: 'lab.test.001',
    version: 1,
    packId: 'pack.test',
    title: 'Test Lab',
    difficulty: 'beginner',
    mission: { objective: 'Test' },
    concepts: ['concept.test'],
    fixture: { id: 'fixture.test.default', version: 1 },
    validators: [],
  };

  beforeEach(() => {
    mockRuntime = {
      status: 'ready',
      initialize: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue({
        exitCode: 0,
        stdout: 'Welcome to Shellground!',
        stderr: '',
      }),
      interrupt: vi.fn().mockResolvedValue(undefined),
      openTerminal: vi.fn().mockResolvedValue('proc-1'),
      writeInput: vi.fn(),
      onOutput: vi.fn().mockReturnValue(() => {}),
      onError: vi.fn().mockReturnValue(() => {}),
      resize: vi.fn(),
      reset: vi.fn().mockResolvedValue(undefined),
      terminate: vi.fn().mockResolvedValue(undefined),
    };

    packRegistry = new PackRegistry();
    packRegistry.registerFixture(mockFixture);
    packRegistry.registerLab(mockLab);

    service = new LabResetService(mockRuntime, packRegistry);
  });

  it('orchestrates complete reset transition sequence from idle -> resetting -> ready', async () => {
    const states: ResetState[] = [];
    service.onStateChange((state) => states.push(state));

    const clearTerminalMock = vi.fn();
    const result = await service.resetLab(mockLab, {
      clearTerminal: clearTerminalMock,
    });

    expect(result.success).toBe(true);
    expect(result.filesRestored).toBe(1);
    expect(result.integrity?.valid).toBe(true);
    expect(clearTerminalMock).toHaveBeenCalledTimes(1);
    expect(mockRuntime.interrupt).toHaveBeenCalledTimes(1);
    expect(mockRuntime.reset).toHaveBeenCalledWith({
      '/workspace/welcome.txt': 'Welcome to Shellground!',
    });
    expect(mockRuntime.openTerminal).toHaveBeenCalledWith({ columns: 80, rows: 24 });
    expect(states).toEqual(['resetting', 'ready']);
    expect(service.getState()).toBe('ready');
  });

  it('supports in-place reset strategy', async () => {
    const result = await service.resetLab(mockLab, {
      strategy: 'in-place',
    });

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('in-place');
    // In-place strategy executes cleanup and recreation commands instead of runtime.reset()
    expect(mockRuntime.execute).toHaveBeenCalled();
  });

  it('transitions state to error and returns failure result when reset fails', async () => {
    (mockRuntime.reset as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Wasmer worker crashed')
    );

    const states: ResetState[] = [];
    service.onStateChange((state) => states.push(state));

    const result = await service.resetLab(mockLab);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Wasmer worker crashed');
    expect(states).toEqual(['resetting', 'error']);
    expect(service.getState()).toBe('error');
  });
});
