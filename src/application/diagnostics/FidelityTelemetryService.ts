/**
 * Diagnostic & Fidelity Telemetry Service
 * Specified in Sub-Phase 8.4 of Issue #14 and Section 48 of FULL_ARCHITECTURE.md
 */

import type { CommandHistoryRepository } from '../../domain/persistence/repositories';

export type CommandFidelityType = 'native-wasix' | 'simulated' | 'unsupported';

export interface CommandFidelityDescriptor {
  priority: 'P0' | 'P1' | 'P2';
  fidelity: CommandFidelityType;
  packageSource?: string;
}

export interface CommandUsageStat {
  command: string;
  invocations: number;
  successCount: number;
  failureCount: number;
  failureRate: number; // 0.0 to 1.0
  fidelity: CommandFidelityType;
  packageSource?: string;
}

export interface FidelityTelemetryReport {
  totalCommandsExecuted: number;
  uniqueCommands: number;
  overallFailureRate: number;
  fidelityDistribution: {
    nativeWasix: number;
    simulated: number;
    unsupported: number;
  };
  commandStats: CommandUsageStat[];
  highFailureWarnings: string[];
}

/**
 * Built-in fidelity mapping matching content/registry/command-fidelity.yaml
 */
export const DEFAULT_COMMAND_FIDELITY: Record<string, CommandFidelityDescriptor> = {
  pwd: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'wasmer/bash' },
  cd: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'wasmer/bash' },
  ls: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  cat: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  grep: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'grep' },
  find: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'findutils' },
  echo: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'wasmer/bash' },
  wc: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  mkdir: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  cp: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  mv: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  rm: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  touch: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  chmod: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  head: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  tail: { priority: 'P0', fidelity: 'native-wasix', packageSource: 'coreutils' },
  systemctl: { priority: 'P2', fidelity: 'simulated', packageSource: 'internal-simulated' },
  ip: { priority: 'P2', fidelity: 'simulated', packageSource: 'internal-simulated' },
};

export class FidelityTelemetryService {
  constructor(
    private readonly commandRepo: CommandHistoryRepository,
    private readonly fidelityRegistry: Record<string, CommandFidelityDescriptor> = DEFAULT_COMMAND_FIDELITY
  ) {}

  /**
   * Extracts the base executable name from a raw command string
   * Handles environment variable assignments, sudo, pipes, and options
   */
  public extractBaseCommand(commandLine: string): string {
    const trimmed = commandLine.trim();
    if (!trimmed) return '';

    // Take the first segment before any pipe or logical separator
    const firstSegment = trimmed.split(/[|&;]/)[0]?.trim() ?? '';
    const tokens = firstSegment.split(/\s+/).filter(Boolean);

    for (const token of tokens) {
      // Skip environment variable assignments like FOO=bar
      if (token.includes('=') && !token.startsWith('-')) {
        continue;
      }
      // Skip sudo or doas
      if (token === 'sudo' || token === 'doas') {
        continue;
      }
      // If token starts with option flag, skip
      if (token.startsWith('-')) {
        continue;
      }
      // Return base binary name (stripping path like /bin/ls -> ls)
      const parts = token.split('/');
      return parts[parts.length - 1] ?? token;
    }

    return '';
  }

  /**
   * Generates a diagnostic telemetry report across executed commands
   */
  public async generateTelemetryReport(labId?: string): Promise<FidelityTelemetryReport> {
    const records = labId
      ? await this.commandRepo.getByLab(labId)
      : await this.commandRepo.getRecent(1000);

    const statsMap = new Map<
      string,
      { invocations: number; successes: number; failures: number }
    >();

    let totalCommands = 0;
    let totalFailures = 0;

    for (const record of records) {
      const baseCmd = this.extractBaseCommand(record.commandLine);
      if (!baseCmd) continue;

      totalCommands++;
      const isFailure = record.exitCode !== undefined && record.exitCode !== 0;
      if (isFailure) {
        totalFailures++;
      }

      const existing = statsMap.get(baseCmd) ?? { invocations: 0, successes: 0, failures: 0 };
      existing.invocations++;
      if (isFailure) {
        existing.failures++;
      } else {
        existing.successes++;
      }
      statsMap.set(baseCmd, existing);
    }

    const commandStats: CommandUsageStat[] = [];
    const fidelityDistribution = {
      nativeWasix: 0,
      simulated: 0,
      unsupported: 0,
    };
    const highFailureWarnings: string[] = [];

    for (const [cmd, stat] of statsMap.entries()) {
      const descriptor = this.fidelityRegistry[cmd];
      const fidelity: CommandFidelityType = descriptor ? descriptor.fidelity : 'unsupported';
      const failureRate =
        stat.invocations > 0 ? Number((stat.failures / stat.invocations).toFixed(4)) : 0;

      if (fidelity === 'native-wasix') {
        fidelityDistribution.nativeWasix += stat.invocations;
      } else if (fidelity === 'simulated') {
        fidelityDistribution.simulated += stat.invocations;
      } else {
        fidelityDistribution.unsupported += stat.invocations;
      }

      if (stat.invocations >= 3 && failureRate >= 0.5) {
        highFailureWarnings.push(
          `Command '${cmd}' has a high failure rate of ${Math.round(
            failureRate * 100
          )}% across ${stat.invocations} attempts.`
        );
      }

      commandStats.push({
        command: cmd,
        invocations: stat.invocations,
        successCount: stat.successes,
        failureCount: stat.failures,
        failureRate,
        fidelity,
        packageSource: descriptor?.packageSource,
      });
    }

    // Sort stats descending by invocations
    commandStats.sort((a, b) => b.invocations - a.invocations);

    const overallFailureRate =
      totalCommands > 0 ? Number((totalFailures / totalCommands).toFixed(4)) : 0;

    return {
      totalCommandsExecuted: totalCommands,
      uniqueCommands: commandStats.length,
      overallFailureRate,
      fidelityDistribution,
      commandStats,
      highFailureWarnings,
    };
  }
}
