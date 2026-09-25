/**
 * Sandbox Reset Engine & State Reconstruction
 * Specified in Section 30 & 120 (ADR-008) of FULL_ARCHITECTURE.md
 * 
 * Philosophy: Deterministic Reset Over Incremental Undo.
 * Invariant: Reset must discard all mutated state and reconstruct the exact pristine fixture baseline.
 */

import type { ShellRuntime } from '../ports/ShellRuntime';

export type ResetStrategy = 'recreation' | 'in-place';

export interface SandboxResetOptions {
  /**
   * Reset strategy to employ:
   * - 'recreation' (ADR-008 default for graded labs): Completely destroys the sandbox and spawns a clean one.
   * - 'in-place' (playground / light reset): Clears mutable paths and re-writes files without worker recreation.
   */
  strategy?: ResetStrategy;

  /** Pristine fixture files to hydrate: path -> text content */
  files?: Record<string, string>;

  /** Target working directory to navigate to post-reset */
  cwd?: string;

  /** Timeout in milliseconds for reset completion (default: 5000ms) */
  timeoutMs?: number;
}

export interface ResetResult {
  success: boolean;
  strategy: ResetStrategy;
  durationMs: number;
  filesRestored: number;
  error?: string;
}

export interface IntegrityVerificationResult {
  valid: boolean;
  checkedCount: number;
  mismatches: Array<{
    path: string;
    expectedHash?: string;
    actualHash?: string;
    reason: string;
  }>;
}

/**
 * Calculates SHA-256 hex digest using Web Crypto
 */
export async function calculateSha256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies that virtual sandbox files match their expected SHA-256 hashes
 */
export async function verifyFixtureIntegrity(
  runtime: ShellRuntime,
  expectedFiles: Record<string, string>
): Promise<IntegrityVerificationResult> {
  const mismatches: IntegrityVerificationResult['mismatches'] = [];
  let checkedCount = 0;

  for (const [filePath, expectedContent] of Object.entries(expectedFiles)) {
    checkedCount++;
    const expectedHash = await calculateSha256(expectedContent);

    try {
      const escaped = `'${filePath.replace(/'/g, "'\\''")}'`;
      const res = await runtime.execute(`cat -- ${escaped}`);

      if (res.exitCode !== 0) {
        mismatches.push({
          path: filePath,
          expectedHash,
          reason: `File missing or could not be read (exitCode: ${res.exitCode})`,
        });
        continue;
      }

      const actualHash = await calculateSha256(res.stdout);
      if (actualHash !== expectedHash) {
        mismatches.push({
          path: filePath,
          expectedHash,
          actualHash,
          reason: 'Hash mismatch: file content has been altered',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      mismatches.push({
        path: filePath,
        expectedHash,
        reason: `Inspection error: ${msg}`,
      });
    }
  }

  return {
    valid: mismatches.length === 0,
    checkedCount,
    mismatches,
  };
}

/**
 * Executes a deterministic reset of the sandbox runtime
 */
export async function resetSandbox(
  runtime: ShellRuntime,
  options: SandboxResetOptions = {}
): Promise<ResetResult> {
  const startTime = performance.now();
  const strategy = options.strategy ?? 'recreation';
  const files = options.files ?? {};
  const fileCount = Object.keys(files).length;

  try {
    if (strategy === 'recreation') {
      // ADR-008: Destroy mutated sandbox and reconstruct clean runtime with fixture files
      await runtime.reset(files);
    } else {
      // In-place reset: remove mutable files and re-write fixture files
      const escapedCwd = options.cwd ? `'${options.cwd.replace(/'/g, "'\\''")}'` : "'/workspace'";
      // Clean training directory non-destructively for core system
      await runtime.execute(`rm -rf ${escapedCwd}/* 2>/dev/null || true`);
      await runtime.execute(`mkdir -p ${escapedCwd}`);

      // Re-write pristine files
      for (const [filePath, content] of Object.entries(files)) {
        const escaped = `'${filePath.replace(/'/g, "'\\''")}'`;
        // Use EOF heredoc safely
        await runtime.execute(`cat << 'SHELLGROUND_FIXTURE_EOF' > ${escaped}\n${content}\nSHELLGROUND_FIXTURE_EOF`);
      }
    }

    // Navigate to clean CWD if provided
    if (options.cwd) {
      const escapedCwd = `'${options.cwd.replace(/'/g, "'\\''")}'`;
      await runtime.execute(`cd ${escapedCwd} 2>/dev/null || true`);
    }

    const durationMs = Math.round(performance.now() - startTime);

    return {
      success: true,
      strategy,
      durationMs,
      filesRestored: fileCount,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    const msg = err instanceof Error ? err.message : String(err);

    return {
      success: false,
      strategy,
      durationMs,
      filesRestored: 0,
      error: msg,
    };
  }
}
