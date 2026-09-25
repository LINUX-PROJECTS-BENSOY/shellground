/**
 * TerminalController - Encapsulated Terminal Presentation Controller
 * Specified in Section 20 of FULL_ARCHITECTURE.md
 * 
 * Strict Invariant: Must NEVER import @wasmer/sdk or execute runtime logic.
 */

import { Terminal } from '@xterm/xterm';
import type { IDisposable } from '@xterm/xterm';
import { TerminalAddonManager } from './addons/addon-manager';
import { DEFAULT_TERMINAL_CONFIG } from './themes/dark-theme';
import type {
  ITerminalController,
  TerminalDimensions,
  TerminalControllerOptions,
  TerminalProcessPort,
} from './terminal.types';

export class TerminalController implements ITerminalController {
  private terminal: Terminal | null = null;
  private addonManager: TerminalAddonManager;
  private containerElement: HTMLElement | null = null;
  private options: TerminalControllerOptions;

  private dataListeners = new Set<(data: string) => void>();
  private resizeListeners = new Set<(dims: TerminalDimensions) => void>();
  private terminalDisposables: IDisposable[] = [];
  private lastEmittedDims: TerminalDimensions | null = null;
  private isDisposed = false;

  constructor(options: TerminalControllerOptions = {}) {
    this.options = options;
    this.addonManager = new TerminalAddonManager();
    this.createTerminalInstance();
  }

  public get isMounted(): boolean {
    return this.containerElement !== null && this.terminal !== null;
  }

  public get dimensions(): TerminalDimensions {
    if (!this.terminal) return { cols: 80, rows: 24 };
    return {
      cols: this.terminal.cols,
      rows: this.terminal.rows,
    };
  }

  private createTerminalInstance(): void {
    const termTheme = {
      ...DEFAULT_TERMINAL_CONFIG.theme,
      ...this.options.theme,
    };

    this.terminal = new Terminal({
      fontSize: this.options.fontSize ?? DEFAULT_TERMINAL_CONFIG.fontSize,
      fontFamily: this.options.fontFamily ?? DEFAULT_TERMINAL_CONFIG.fontFamily,
      lineHeight: this.options.lineHeight ?? DEFAULT_TERMINAL_CONFIG.lineHeight,
      cursorBlink: this.options.cursorBlink ?? DEFAULT_TERMINAL_CONFIG.cursorBlink,
      cursorStyle: this.options.cursorStyle ?? DEFAULT_TERMINAL_CONFIG.cursorStyle,
      scrollback: this.options.scrollback ?? DEFAULT_TERMINAL_CONFIG.scrollback,
      disableStdin: this.options.disableStdin ?? false,
      theme: termTheme,
      allowTransparency: false,
      convertEol: true,
    });

    // Wire onData event
    const dataDisp = this.terminal.onData((data) => {
      this.emitData(data);
    });
    this.terminalDisposables.push(dataDisp);

    // Wire onResize event
    const resizeDisp = this.terminal.onResize((event) => {
      this.emitResize({ cols: event.cols, rows: event.rows });
    });
    this.terminalDisposables.push(resizeDisp);

    // Setup custom keyboard shortcuts (Sub-Phase 2.5)
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts(): void {
    if (!this.terminal) return;

    this.terminal.attachCustomKeyEventHandler((event: KeyboardEvent) => {
      // Only handle on keydown
      if (event.type !== 'keydown') return true;

      // Ctrl + L: Clear terminal buffer
      if (event.ctrlKey && !event.shiftKey && !event.altKey && (event.key === 'l' || event.key === 'L')) {
        event.preventDefault();
        this.clear();
        this.options.onClear?.();
        // Emit form feed / clear screen to process
        this.emitData('\x0c');
        return false;
      }

      // Ctrl + C: If text selected, copy; otherwise interrupt
      if (event.ctrlKey && !event.shiftKey && !event.altKey && (event.key === 'c' || event.key === 'C')) {
        if (this.terminal?.hasSelection()) {
          // Allow browser default copy behavior
          return true;
        }
        // Emit interrupt signal
        this.options.onInterrupt?.();
        this.emitData('\x03');
        return false;
      }

      // Ctrl + Shift + C: Explicit copy
      if (event.ctrlKey && event.shiftKey && (event.key === 'c' || event.key === 'C')) {
        const selection = this.terminal?.getSelection();
        if (selection && typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(selection).catch(() => {});
          return false;
        }
      }

      // Ctrl + Shift + V: Explicit paste
      if (event.ctrlKey && event.shiftKey && (event.key === 'v' || event.key === 'V')) {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.readText().then((text) => {
            if (text) this.emitData(text);
          }).catch(() => {});
          return false;
        }
      }

      return true;
    });
  }

  public mount(element: HTMLElement): void {
    if (this.isDisposed) {
      throw new Error('Cannot mount a disposed TerminalController.');
    }
    if (!this.terminal) {
      this.createTerminalInstance();
    }

    this.containerElement = element;
    this.terminal!.open(element);

    // Initialize Addons (FitAddon and WebglAddon)
    this.addonManager.initialize(this.terminal!, this.options.enableWebgl ?? true);

    // Trigger initial fit
    this.fit();
  }

  public write(data: string | Uint8Array): void {
    if (!this.terminal) return;
    this.terminal.write(data);
  }

  public writeln(data: string): void {
    if (!this.terminal) return;
    this.terminal.writeln(data);
  }

  public clear(): void {
    if (!this.terminal) return;
    this.terminal.clear();
  }

  public focus(): void {
    if (!this.terminal) return;
    this.terminal.focus();
  }

  public blur(): void {
    if (!this.terminal) return;
    this.terminal.blur();
  }

  public fit(): void {
    if (!this.terminal || !this.containerElement) return;
    this.addonManager.fit();
    this.emitResize(this.dimensions);
  }

  public resize(cols: number, rows: number): void {
    if (!this.terminal) return;
    this.terminal.resize(cols, rows);
    this.emitResize({ cols, rows });
  }

  public onData(callback: (data: string) => void): () => void {
    this.dataListeners.add(callback);
    return () => this.dataListeners.delete(callback);
  }

  public onResize(callback: (dims: TerminalDimensions) => void): () => void {
    this.resizeListeners.add(callback);
    return () => this.resizeListeners.delete(callback);
  }

  public connect(processPort: TerminalProcessPort): () => void {
    const unsubs: (() => void)[] = [];

    // Forward terminal keyboard input to process stdin
    const unsubData = this.onData((data) => {
      processPort.writeInput(data);
    });
    unsubs.push(unsubData);

    // Forward process stdout to terminal output
    const unsubOutput = processPort.onOutput((data) => {
      this.write(data);
    });
    unsubs.push(unsubOutput);

    // Forward process stderr if present
    if (processPort.onError) {
      const unsubError = processPort.onError((err) => {
        this.write(err);
      });
      unsubs.push(unsubError);
    }

    // Forward terminal resize to process
    if (processPort.resize) {
      const unsubResize = this.onResize((dims) => {
        processPort.resize!(dims.cols, dims.rows);
      });
      unsubs.push(unsubResize);
    }

    // Initial resize sync if already mounted
    if (this.isMounted && processPort.resize) {
      processPort.resize(this.dimensions.cols, this.dimensions.rows);
    }

    return () => {
      for (const unsub of unsubs) {
        unsub();
      }
    };
  }

  private emitData(data: string): void {
    for (const listener of this.dataListeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('[TerminalController] Error in onData listener:', err);
      }
    }
  }

  private emitResize(dims: TerminalDimensions): void {
    if (
      this.lastEmittedDims &&
      this.lastEmittedDims.cols === dims.cols &&
      this.lastEmittedDims.rows === dims.rows
    ) {
      return;
    }
    this.lastEmittedDims = { ...dims };

    for (const listener of this.resizeListeners) {
      try {
        listener(dims);
      } catch (err) {
        console.error('[TerminalController] Error in onResize listener:', err);
      }
    }
  }

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;

    for (const d of this.terminalDisposables) {
      try {
        d.dispose();
      } catch {
        // Ignore dispose error
      }
    }
    this.terminalDisposables = [];

    this.addonManager.dispose();

    if (this.terminal) {
      try {
        this.terminal.dispose();
      } catch {
        // Ignore dispose error
      }
      this.terminal = null;
    }

    this.containerElement = null;
    this.dataListeners.clear();
    this.resizeListeners.clear();
  }
}
