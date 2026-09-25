import { describe, it, expect, beforeEach } from 'vitest';
import { FidelityTelemetryService } from '../../../src/application/diagnostics/FidelityTelemetryService';
import { InMemoryCommandHistoryRepository } from '../../../src/infrastructure/persistence/repositories/memory/InMemoryRepositories';

describe('FidelityTelemetryService Application Unit Tests', () => {
  let commandRepo: InMemoryCommandHistoryRepository;
  let service: FidelityTelemetryService;

  beforeEach(() => {
    commandRepo = new InMemoryCommandHistoryRepository();
    service = new FidelityTelemetryService(commandRepo);
  });

  describe('extractBaseCommand', () => {
    it('extracts base command cleanly from flags and paths', () => {
      expect(service.extractBaseCommand('ls -la /home')).toBe('ls');
      expect(service.extractBaseCommand('/bin/pwd')).toBe('pwd');
      expect(service.extractBaseCommand('mkdir -p foo/bar')).toBe('mkdir');
    });

    it('extracts base command from pipes and strips trailing commands', () => {
      expect(service.extractBaseCommand('cat file.txt | grep foo')).toBe('cat');
    });

    it('handles sudo and environment variable assignments', () => {
      expect(service.extractBaseCommand('sudo systemctl status nginx')).toBe('systemctl');
      expect(service.extractBaseCommand('DEBUG=1 ls -la')).toBe('ls');
    });

    it('returns empty string for empty input', () => {
      expect(service.extractBaseCommand('')).toBe('');
      expect(service.extractBaseCommand('   ')).toBe('');
    });
  });

  describe('generateTelemetryReport', () => {
    it('aggregates invocations, failures, and classifies runtime fidelity', async () => {
      // 2 successful ls
      await commandRepo.add({ commandLine: 'ls -la', exitCode: 0, timestamp: new Date().toISOString() });
      await commandRepo.add({ commandLine: 'ls', exitCode: 0, timestamp: new Date().toISOString() });

      // 1 successful pwd
      await commandRepo.add({ commandLine: 'pwd', exitCode: 0, timestamp: new Date().toISOString() });

      // 3 failed systemctl
      await commandRepo.add({ commandLine: 'systemctl start nginx', exitCode: 1, timestamp: new Date().toISOString() });
      await commandRepo.add({ commandLine: 'systemctl stop nginx', exitCode: 1, timestamp: new Date().toISOString() });
      await commandRepo.add({ commandLine: 'systemctl restart nginx', exitCode: 1, timestamp: new Date().toISOString() });

      // 1 custom unsupported command
      await commandRepo.add({ commandLine: 'docker ps', exitCode: 127, timestamp: new Date().toISOString() });

      const report = await service.generateTelemetryReport();

      expect(report.totalCommandsExecuted).toBe(7);
      expect(report.uniqueCommands).toBe(4);
      expect(report.overallFailureRate).toBeCloseTo(4 / 7, 2);

      // Check fidelity distribution
      expect(report.fidelityDistribution.nativeWasix).toBe(3); // 2 ls + 1 pwd
      expect(report.fidelityDistribution.simulated).toBe(3);  // 3 systemctl
      expect(report.fidelityDistribution.unsupported).toBe(1); // 1 docker

      // Check command stats
      const lsStat = report.commandStats.find((s) => s.command === 'ls');
      expect(lsStat?.invocations).toBe(2);
      expect(lsStat?.failureCount).toBe(0);
      expect(lsStat?.fidelity).toBe('native-wasix');

      const sysStat = report.commandStats.find((s) => s.command === 'systemctl');
      expect(sysStat?.invocations).toBe(3);
      expect(sysStat?.failureCount).toBe(3);
      expect(sysStat?.failureRate).toBe(1.0);
      expect(sysStat?.fidelity).toBe('simulated');

      // Check high failure warning
      expect(report.highFailureWarnings).toHaveLength(1);
      expect(report.highFailureWarnings[0]).toContain("Command 'systemctl' has a high failure rate of 100%");
    });
  });
});
