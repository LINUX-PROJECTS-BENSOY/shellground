import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FilesystemInspectorPanel } from '../../../src/features/filesystem-inspector/components/FilesystemInspectorPanel';
import { InteractiveLabSession } from '../../../src/features/training/services/InteractiveLabSession';
import { PackRegistry } from '../../../src/infrastructure/content/PackRegistry';
import type { LabDefinition } from '../../../src/domain/content/schemas';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('FilesystemInspectorPanel Component', () => {
  let container: HTMLDivElement;
  let root: Root;
  let session: InteractiveLabSession;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    const registry = new PackRegistry();
    const lab: LabDefinition = {
      id: 'test-panel-lab',
      version: 1,
      packId: 'linux-foundations',
      title: 'Inspector UI Test Lab',
      difficulty: 'beginner',
      mission: {
        objective: 'Test FilesystemInspectorPanel UI',
      },
      fixture: {
        id: 'file-ops-workspace',
        version: 1,
      },
      concepts: ['filesystem.paths'],
      validators: [],
    };

    session = new InteractiveLabSession(lab, registry);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders filesystem panel header, root selector, and directory tree', async () => {
    await act(async () => {
      root.render(<FilesystemInspectorPanel session={session} />);
    });

    expect(container.textContent).toContain('Filesystem Tree');
    expect(container.textContent).toContain('workspace');

    const select = container.querySelector('select');
    expect(select).not.toBeNull();
    expect(select?.value).toBe('/workspace');
  });

  it('updates live tree when a new file is created in session', async () => {
    await act(async () => {
      root.render(<FilesystemInspectorPanel session={session} />);
    });

    await act(async () => {
      session.executeCommandLine('touch /workspace/live_demo.txt');
    });

    expect(container.textContent).toContain('live_demo.txt');
    expect(container.textContent).toContain('+ NEW');
    expect(container.textContent).toContain('touch /workspace/live_demo.txt');
  });

  it('opens FileInspectorModal when clicking on a file item', async () => {
    await act(async () => {
      session.executeCommandLine('echo "SECRET_DATA" > /workspace/test_doc.txt');
      root.render(<FilesystemInspectorPanel session={session} />);
    });

    // Find the tree item for test_doc.txt
    const fileItem = Array.from(container.querySelectorAll('[role="treeitem"]')).find((el) =>
      el.textContent?.includes('test_doc.txt')
    );
    expect(fileItem).toBeDefined();

    await act(async () => {
      fileItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Modal dialog should be rendered
    const modal = document.querySelector('[role="dialog"]');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('test_doc.txt');
    expect(modal?.textContent).toContain('SECRET_DATA');
    expect(modal?.textContent).toContain('Mode:');
    expect(modal?.textContent).toContain('Copy Path');

    // Clicking close button dismisses modal
    const closeBtn = Array.from(modal?.querySelectorAll('button') ?? []).find(
      (b) => b.textContent?.trim() === 'Close'
    );
    expect(closeBtn).toBeDefined();

    await act(async () => {
      closeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    await act(async () => {
      root.render(<FilesystemInspectorPanel session={session} onClose={handleClose} />);
    });

    const closeBtn = container.querySelector('button[aria-label="Close filesystem panel"]');
    expect(closeBtn).not.toBeNull();

    await act(async () => {
      closeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
