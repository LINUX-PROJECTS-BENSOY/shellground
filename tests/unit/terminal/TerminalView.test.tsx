import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TerminalView } from '@terminal/TerminalView';
import { MockTerminalProcess } from '@terminal/mock-process';
import type { TerminalController } from '@terminal/TerminalController';

// Configure React act environment
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('TerminalView React Component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 600, configurable: true });
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

  it('renders terminal container with accessible ARIA role and label', async () => {
    await act(async () => {
      root.render(<TerminalView ariaLabel="Test Terminal Subsystem" enableWebgl={false} />);
    });

    const region = container.querySelector('[role="region"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-label')).toBe('Test Terminal Subsystem');

    const host = container.querySelector('.terminal-host');
    expect(host).not.toBeNull();
  });

  it('renders status bar with ready badge and dimensions by default', async () => {
    await act(async () => {
      root.render(<TerminalView statusText="Online" enableWebgl={false} />);
    });

    const statusBadge = container.querySelector('.badge-ready');
    expect(statusBadge?.textContent).toContain('Online');

    const sandboxedBadge = container.querySelector('.badge-isolated');
    expect(sandboxedBadge?.textContent).toContain('WASIX Sandboxed');

    const statusbar = container.querySelector('.terminal-statusbar');
    expect(statusbar).not.toBeNull();
  });

  it('can hide status bar when showStatusBar is false', async () => {
    await act(async () => {
      root.render(<TerminalView showStatusBar={false} enableWebgl={false} />);
    });

    const statusbar = container.querySelector('.terminal-statusbar');
    expect(statusbar).toBeNull();
  });

  it('invokes onTerminalReady with initialized controller', async () => {
    let readyController: TerminalController | null = null;
    const onReady = vi.fn((ctrl: TerminalController) => {
      readyController = ctrl;
    });

    await act(async () => {
      root.render(
        <TerminalView
          onTerminalReady={onReady}
          enableWebgl={false}
        />
      );
    });

    expect(onReady).toHaveBeenCalled();
    expect(readyController).not.toBeNull();
    expect(readyController!.isMounted).toBe(true);
  });

  it('connects to MockTerminalProcess and renders welcome banner', async () => {
    const processPort = new MockTerminalProcess();

    await act(async () => {
      root.render(
        <TerminalView
          processPort={processPort}
          enableWebgl={false}
        />
      );
    });

    await act(async () => {
      processPort.emitWelcomeBanner();
    });

    // Terminal host should have xterm DOM nodes created
    const xtermScreen = container.querySelector('.xterm-screen');
    expect(xtermScreen).not.toBeNull();
  });
});
