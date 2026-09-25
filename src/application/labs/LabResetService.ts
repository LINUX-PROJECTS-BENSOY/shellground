/**
 * LabResetService - Orchestrates Deterministic Sandbox Reset
 * Specified in Section 30 & 62 of FULL_ARCHITECTURE.md and Issue #12
 * 
 * Philosophy: Discard all mutated state and reconstruct exact pristine baseline in <1000ms.
 */

import type { ShellRuntime } from '../../runtime/ports/ShellRuntime';
import type { LabDefinition } from '../../domain/content/schemas';
import type { PackRegistry } from '../../infrastructure/content/PackRegistry';
import {
  resetSandbox,
  verifyFixtureIntegrity,
  type ResetStrategy,
  type ResetResult,
  type IntegrityVerificationResult,
} from '../../runtime/wasmer/sandbox-reset';

export type ResetState = 'idle' | 'resetting' | 'ready' | 'error';

export interface LabResetOptions {
  /** Reset strategy to execute ('recreation' by default) */
  strategy?: ResetStrategy;

  /** Whether to verify SHA-256 hashes of restored fixture files (default: true) */
  verifyIntegrity?: boolean;

  /** Callback to clear terminal screen */
  clearTerminal?: () => void;

  /** Rows for newly opened interactive terminal */
  terminalRows?: number;

  /** Columns for newly opened interactive terminal */
  terminalCols?: number;
}

export interface LabResetResult {
  success: boolean;
  strategy: ResetStrategy;
  durationMs: number;
  filesRestored: number;
  integrity?: IntegrityVerificationResult;
  error?: string;
}

export type ResetStateListener = (state: ResetState) => void;

export class LabResetService {
  private readonly runtime: ShellRuntime;
  private readonly packRegistry: PackRegistry;
  private currentState: ResetState = 'idle';
  private readonly stateListeners = new Set<ResetStateListener>();

  constructor(runtime: ShellRuntime, packRegistry: PackRegistry) {
    this.runtime = runtime;
    this.packRegistry = packRegistry;
  }

  public getState(): ResetState {
    return this.currentState;
  }

  public onStateChange(listener: ResetStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private setState(state: ResetState): void {
    this.currentState = state;
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }

  /**
   * Orchestrates the complete deterministic reset sequence (FULL_ARCHITECTURE.md Section 62):
   * 1. State -> RESETTING
   * 2. Clear terminal output
   * 3. Interrupt active shell
   * 4. Dispose and recreate sandbox with pristine fixture files
   * 5. Set clean working directory
   * 6. Re-open interactive shell terminal
   * 7. State -> READY
   */
  public async resetLab(lab: LabDefinition, options: LabResetOptions = {}): Promise<LabResetResult> {
    const startTime = performance.now();
    this.setState('resetting');

    try {
      // 1. Clear terminal if callback provided
      if (options.clearTerminal) {
        options.clearTerminal();
      }

      // 2. Interrupt any ongoing long-running process
      try {
        await this.runtime.interrupt();
      } catch {
        // Safe to ignore if no process was running
      }

      // 3. Resolve fixture and build hydrated file map
      const fixture = this.packRegistry.getFixture(lab.fixture.id);
      const fixtureFiles = fixture ? this.packRegistry.buildFixtureFiles(fixture) : {};
      const targetCwd = fixture?.cwd || '/workspace';

      // 4. Execute deterministic sandbox reset
      const resetResult: ResetResult = await resetSandbox(this.runtime, {
        strategy: options.strategy ?? 'recreation',
        files: fixtureFiles,
        cwd: targetCwd,
      });

      if (!resetResult.success) {
        throw new Error(resetResult.error || 'Sandbox reset failed');
      }

      // 5. Verify integrity if requested
      let integrity: IntegrityVerificationResult | undefined;
      if (options.verifyIntegrity !== false && Object.keys(fixtureFiles).length > 0) {
        integrity = await verifyFixtureIntegrity(this.runtime, fixtureFiles);
        if (!integrity.valid) {
          const reasons = integrity.mismatches.map((m) => `${m.path}: ${m.reason}`).join('; ');
          throw new Error(`Fixture integrity verification failed: ${reasons}`);
        }
      }

      // 6. Re-open terminal session if openTerminal is available
      if (this.runtime.openTerminal) {
        await this.runtime.openTerminal({
          columns: options.terminalCols ?? 80,
          rows: options.terminalRows ?? 24,
        });
      }

      const totalDurationMs = Math.round(performance.now() - startTime);
      this.setState('ready');

      return {
        success: true,
        strategy: resetResult.strategy,
        durationMs: totalDurationMs,
        filesRestored: resetResult.filesRestored,
        integrity,
      };
    } catch (err) {
      this.setState('error');
      const totalDurationMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : String(err);

      return {
        success: false,
        strategy: options.strategy ?? 'recreation',
        durationMs: totalDurationMs,
        filesRestored: 0,
        error: msg,
      };
    }
  }
}
