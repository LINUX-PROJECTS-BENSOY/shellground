import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Terminal } from '@xterm/xterm';
import { TerminalAddonManager } from '@terminal/addons/addon-manager';

describe('TerminalAddonManager', () => {
  let terminal: Terminal;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    terminal = new Terminal();
    terminal.open(container);
  });

  afterEach(() => {
    terminal.dispose();
    container.remove();
    vi.restoreAllMocks();
  });

  it('initializes FitAddon and attempts WebglAddon with graceful fallback', () => {
    const manager = new TerminalAddonManager();
    const addons = manager.initialize(terminal, true);

    expect(addons.fitAddon).toBeDefined();
    // In happy-dom without WebGL, WebglAddon either initializes or safely fails to null
    expect(typeof addons.isWebglActive).toBe('boolean');

    manager.dispose();
  });

  it('disables WebglAddon when enableWebgl is false', () => {
    const manager = new TerminalAddonManager();
    const addons = manager.initialize(terminal, false);

    expect(addons.fitAddon).toBeDefined();
    expect(addons.webglAddon).toBeNull();
    expect(addons.isWebglActive).toBe(false);

    manager.dispose();
  });

  it('executes fit() safely without throwing even if dimensions are uncomputed', () => {
    const manager = new TerminalAddonManager();
    manager.initialize(terminal, false);

    expect(() => manager.fit()).not.toThrow();

    manager.dispose();
  });

  it('safely handles multiple dispose() calls', () => {
    const manager = new TerminalAddonManager();
    manager.initialize(terminal, false);

    expect(() => {
      manager.dispose();
      manager.dispose();
    }).not.toThrow();
  });
});
