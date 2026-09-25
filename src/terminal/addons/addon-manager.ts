/**
 * Terminal Addon Manager
 * Integrates FitAddon and WebglAddon with automatic fallback
 * Specified in Section 21 of FULL_ARCHITECTURE.md
 */

import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';

export interface LoadedAddons {
  readonly fitAddon: FitAddon;
  readonly webglAddon: WebglAddon | null;
  readonly isWebglActive: boolean;
}

export class TerminalAddonManager {
  private fitAddon: FitAddon | null = null;
  private webglAddon: WebglAddon | null = null;
  private isWebglActive = false;

  public initialize(terminal: Terminal, enableWebgl = true): LoadedAddons {
    // 1. Initialize FitAddon
    this.fitAddon = new FitAddon();
    terminal.loadAddon(this.fitAddon);

    // 2. Initialize WebglAddon conditionally with fallback
    if (enableWebgl && typeof window !== 'undefined') {
      try {
        const addon = new WebglAddon();
        addon.onContextLoss(() => {
          console.warn('[TerminalAddonManager] WebGL context lost; falling back to canvas.');
          addon.dispose();
          this.webglAddon = null;
          this.isWebglActive = false;
        });

        terminal.loadAddon(addon);
        this.webglAddon = addon;
        this.isWebglActive = true;
      } catch (err) {
        console.warn('[TerminalAddonManager] WebGL initialization failed; standard renderer will be used.', err);
        this.webglAddon = null;
        this.isWebglActive = false;
      }
    }

    return {
      fitAddon: this.fitAddon,
      webglAddon: this.webglAddon,
      isWebglActive: this.isWebglActive,
    };
  }

  public fit(): void {
    if (!this.fitAddon) return;
    try {
      this.fitAddon.fit();
    } catch {
      // Element may be detached or hidden; ignore non-fatal layout errors
    }
  }

  public dispose(): void {
    if (this.webglAddon) {
      try {
        this.webglAddon.dispose();
      } catch {
        // Ignore dispose error
      }
      this.webglAddon = null;
      this.isWebglActive = false;
    }

    if (this.fitAddon) {
      try {
        this.fitAddon.dispose();
      } catch {
        // Ignore dispose error
      }
      this.fitAddon = null;
    }
  }
}
