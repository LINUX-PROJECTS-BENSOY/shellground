import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Badge } from '../../../src/shared/components/Badge';
import { Button } from '../../../src/shared/components/Button';
import { Modal } from '../../../src/shared/components/Modal';
import { InteractiveLabSession } from '../../../src/features/training/services/InteractiveLabSession';
import { PackRegistry } from '../../../src/infrastructure/content/PackRegistry';
import type { LabDefinition, FixtureDefinition } from '../../../src/domain/content/schemas';

// Configure React act environment
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Phase 10 UI & Training Experience Conformance', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  describe('Shared Design System Components', () => {
    it('renders Badge with correct variant classes and content', async () => {
      await act(async () => {
        root.render(
          <div>
            <Badge variant="real">native-wasix</Badge>
            <Badge variant="simulated">simulated</Badge>
            <Badge variant="unsupported">unsupported</Badge>
            <Badge variant="success">Passed</Badge>
          </div>
        );
      });

      expect(container.textContent).toContain('native-wasix');
      expect(container.textContent).toContain('simulated');
      expect(container.textContent).toContain('unsupported');
      expect(container.textContent).toContain('Passed');
    });

    it('renders Button with variants and handles click events', async () => {
      const handleClick = vi.fn();
      await act(async () => {
        root.render(
          <Button variant="primary" size="md" onClick={handleClick}>
            Execute Validation
          </Button>
        );
      });

      const button = container.querySelector('button');
      expect(button).not.toBeNull();
      expect(button?.textContent).toContain('Execute Validation');

      button?.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders accessible Modal with dialog role and Escape key handling', async () => {
      const handleClose = vi.fn();
      await act(async () => {
        root.render(
          <Modal isOpen={true} onClose={handleClose} title="Lab Mission Outcome">
            <p>Verification Passed</p>
          </Modal>
        );
      });

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
      expect(container.textContent).toContain('Lab Mission Outcome');
      expect(container.textContent).toContain('Verification Passed');

      // Trigger Esc key
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('InteractiveLabSession Virtual Runtime', () => {
    const fixture: FixtureDefinition = {
      id: 'test-fixture',
      version: 1,
      cwd: '/workspace',
      directories: [{ path: '/workspace/logs' }],
      files: [
        {
          path: '/workspace/logs/app.log',
          source: { type: 'inline', content: '2026-09-26 ERROR Disk failure\n2026-09-26 INFO OK\n' },
        },
      ],
    };

    const lab: LabDefinition = {
      id: 'test-lab',
      version: 1,
      packId: 'test-pack',
      title: 'Log Inspection Test Lab',
      difficulty: 'beginner',
      mission: { objective: 'Find the disk failure line' },
      fixture: { id: 'test-fixture', version: 1 },
      concepts: ['pipes.grep'],
      validators: [],
    };

    it('hydrates virtual filesystem from fixture correctly', () => {
      const registry = new PackRegistry();
      registry.registerFixture(fixture);

      const session = new InteractiveLabSession(lab, registry);
      const ctx = session.getValidatorContext();

      expect(ctx.lastCommand).toBe('');
      return ctx.readFile('/workspace/logs/app.log').then((content) => {
        expect(content).toContain('ERROR Disk failure');
      });
    });

    it('executes piping, grep filtering, and stdout redirection to new virtual file', async () => {
      const registry = new PackRegistry();
      registry.registerFixture(fixture);

      const session = new InteractiveLabSession(lab, registry);

      // Execute command with pipe and redirection
      session.executeCommandLine('cat /workspace/logs/app.log | grep ERROR > /workspace/errors.txt');

      const ctx = session.getValidatorContext();
      const output = await ctx.readFile('/workspace/errors.txt');
      expect(output).toContain('2026-09-26 ERROR Disk failure');
      expect(output).not.toContain('INFO OK');

      const exists = await ctx.fileExists('/workspace/errors.txt');
      expect(exists).toBe(true);
    });

    it('records telemetry in command history repository upon command execution', async () => {
      const registry = new PackRegistry();
      registry.registerFixture(fixture);

      const mockHistoryRepo = {
        add: vi.fn().mockResolvedValue(1),
        getByLab: vi.fn().mockResolvedValue([]),
        getRecent: vi.fn().mockResolvedValue([]),
        clear: vi.fn().mockResolvedValue(undefined),
      };

      const session = new InteractiveLabSession(lab, registry, null, mockHistoryRepo);
      session.executeCommandLine('pwd');

      expect(mockHistoryRepo.add).toHaveBeenCalledWith(
        expect.objectContaining({
          commandLine: 'pwd',
          exitCode: 0,
          labId: 'test-lab',
        })
      );
    });
  });
});
