import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ShellRuntime, ExecutionResult } from '../../../src/runtime/ports/ShellRuntime';
import {
  resetSandbox,
  verifyFixtureIntegrity,
  calculateSha256,
} from '../../../src/runtime/wasmer/sandbox-reset';

describe('Deterministic Sandbox Reset Integration', () => {
  let virtualFiles: Map<string, string>;
  let mockRuntime: ShellRuntime;

  const pristineFixture: Record<string, string> = {
    '/workspace/hello.txt': 'Hello, Shellground Linux Learner!',
    '/workspace/config/app.conf': 'PORT=8080\nDEBUG=false\n',
  };

  beforeEach(() => {
    virtualFiles = new Map<string, string>();
    for (const [k, v] of Object.entries(pristineFixture)) {
      virtualFiles.set(k, v);
    }

    mockRuntime = {
      status: 'ready',
      initialize: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockImplementation(async (cmd: string): Promise<ExecutionResult> => {
        // Simple simulated VFS commands
        if (cmd.startsWith('cat -- ')) {
          const rawPath = cmd.slice(7).replace(/'/g, '').trim();
          if (virtualFiles.has(rawPath)) {
            return { exitCode: 0, stdout: virtualFiles.get(rawPath)!, stderr: '' };
          }
          return { exitCode: 1, stdout: '', stderr: 'No such file or directory' };
        }

        if (cmd.startsWith('test -e ')) {
          const rawPath = cmd.slice(8).replace(/'/g, '').trim();
          return { exitCode: virtualFiles.has(rawPath) ? 0 : 1, stdout: '', stderr: '' };
        }

        return { exitCode: 0, stdout: '', stderr: '' };
      }),
      interrupt: vi.fn().mockResolvedValue(undefined),
      openTerminal: vi.fn().mockResolvedValue('proc-1'),
      writeInput: vi.fn(),
      onOutput: vi.fn().mockReturnValue(() => {}),
      onError: vi.fn().mockReturnValue(() => {}),
      resize: vi.fn(),
      reset: vi.fn().mockImplementation(async (files?: Record<string, string>) => {
        // Discard all mutable files and re-seed from provided files
        virtualFiles.clear();
        if (files) {
          for (const [k, v] of Object.entries(files)) {
            virtualFiles.set(k, v);
          }
        }
      }),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('restores modified and deleted files to exact pristine SHA-256 hashes in < 1000ms', async () => {
    // 1. Initial integrity verification matches
    const initialIntegrity = await verifyFixtureIntegrity(mockRuntime, pristineFixture);
    expect(initialIntegrity.valid).toBe(true);

    // 2. Simulate learner mutations: mutate hello.txt, delete config, add rogue file
    virtualFiles.set('/workspace/hello.txt', 'CORRUPTED BY LEARNER');
    virtualFiles.delete('/workspace/config/app.conf');
    virtualFiles.set('/workspace/rogue.sh', 'rm -rf /');

    // Integrity check must now fail
    const mutatedIntegrity = await verifyFixtureIntegrity(mockRuntime, pristineFixture);
    expect(mutatedIntegrity.valid).toBe(false);
    expect(mutatedIntegrity.mismatches).toHaveLength(2);

    // 3. Execute deterministic reset
    const result = await resetSandbox(mockRuntime, {
      strategy: 'recreation',
      files: pristineFixture,
    });

    expect(result.success).toBe(true);
    expect(result.durationMs).toBeLessThan(1000);

    // 4. Verify post-reset state: rogue file is eradicated and files restored
    expect(virtualFiles.has('/workspace/rogue.sh')).toBe(false);
    expect(virtualFiles.get('/workspace/hello.txt')).toBe(pristineFixture['/workspace/hello.txt']);
    expect(virtualFiles.get('/workspace/config/app.conf')).toBe(
      pristineFixture['/workspace/config/app.conf']
    );

    // 5. Post-reset cryptographic integrity check passes
    const restoredIntegrity = await verifyFixtureIntegrity(mockRuntime, pristineFixture);
    expect(restoredIntegrity.valid).toBe(true);
    expect(restoredIntegrity.checkedCount).toBe(2);

    const expectedHash = await calculateSha256(pristineFixture['/workspace/hello.txt']!);
    const actualHash = await calculateSha256(virtualFiles.get('/workspace/hello.txt')!);
    expect(actualHash).toBe(expectedHash);
  });
});
