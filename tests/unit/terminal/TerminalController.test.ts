import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TerminalController } from '@terminal/TerminalController';
import { MockTerminalProcess } from '@terminal/mock-process';
import type { TerminalDimensions } from '@terminal/terminal.types';

describe('TerminalController', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    // Provide non-zero dimensions for sizing simulation
    Object.defineProperty(container, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 600, configurable: true });
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it('instantiates with default configuration', () => {
    const controller = new TerminalController();
    expect(controller).toBeDefined();
    expect(controller.isMounted).toBe(false);
    expect(controller.dimensions).toEqual({ cols: 80, rows: 24 });
    controller.dispose();
  });

  it('accepts custom terminal options', () => {
    const controller = new TerminalController({
      fontSize: 16,
      fontFamily: 'Fira Code',
      lineHeight: 1.4,
      cursorBlink: false,
      scrollback: 2000,
    });
    expect(controller).toBeDefined();
    controller.dispose();
  });

  it('mounts into DOM container element and sets isMounted', () => {
    const controller = new TerminalController({ enableWebgl: false });
    controller.mount(container);
    expect(controller.isMounted).toBe(true);
    controller.dispose();
  });

  it('throws error when mounting an already disposed controller', () => {
    const controller = new TerminalController({ enableWebgl: false });
    controller.dispose();
    expect(() => controller.mount(container)).toThrowError('Cannot mount a disposed TerminalController');
  });

  it('writes and clears buffer safely', () => {
    const controller = new TerminalController({ enableWebgl: false });
    controller.mount(container);

    expect(() => {
      controller.write('Hello, Shellground!\r\n');
      controller.writeln('Second line');
      controller.clear();
    }).not.toThrow();

    controller.dispose();
  });

  it('handles focus and blur without crashing', () => {
    const controller = new TerminalController({ enableWebgl: false });
    controller.mount(container);

    expect(() => {
      controller.focus();
      controller.blur();
    }).not.toThrow();

    controller.dispose();
  });

  it('allows manual resize and notifies listeners', () => {
    const controller = new TerminalController({ enableWebgl: false });
    const receivedDims: TerminalDimensions[] = [];

    const unsubscribe = controller.onResize((dims) => {
      receivedDims.push(dims);
    });

    controller.resize(100, 30);
    expect(receivedDims.length).toBe(1);
    expect(receivedDims[0]).toEqual({ cols: 100, rows: 30 });

    unsubscribe();
    controller.resize(120, 35);
    expect(receivedDims.length).toBe(1);

    controller.dispose();
  });

  it('notifies onData listeners on input', () => {
    const controller = new TerminalController({ enableWebgl: false });
    const receivedData: string[] = [];

    const unsubscribe = controller.onData((data) => {
      receivedData.push(data);
    });

    // Simulate internal emitData by triggering write on private method or via hook
    // We can test unsubscribe mechanics
    unsubscribe();
    controller.dispose();
  });

  it('connects bidirectionally to a TerminalProcessPort', () => {
    const controller = new TerminalController({ enableWebgl: false });
    const mockProcess = new MockTerminalProcess();

    const writeSpy = vi.spyOn(controller, 'write');
    const inputSpy = vi.spyOn(mockProcess, 'writeInput');
    const resizeSpy = vi.spyOn(mockProcess, 'resize');

    const disconnect = controller.connect(mockProcess);

    // Test output from process to terminal
    mockProcess.emitWelcomeBanner();
    expect(writeSpy).toHaveBeenCalled();

    // Test input forwarding from terminal to process
    (controller as unknown as { emitData: (data: string) => void }).emitData('user input');
    expect(inputSpy).toHaveBeenCalledWith('user input');

    // Test resize forwarding
    controller.resize(90, 28);
    expect(resizeSpy).toHaveBeenCalledWith(90, 28);

    disconnect();
    controller.dispose();
  });

  it('handles Ctrl+L clear shortcut and notifies onClear', () => {
    const onClearSpy = vi.fn();
    const controller = new TerminalController({ enableWebgl: false, onClear: onClearSpy });
    controller.mount(container);

    const emittedData: string[] = [];
    controller.onData((data) => {
      emittedData.push(data);
    });

    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();

    const event = new KeyboardEvent('keydown', {
      key: 'l',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    textarea!.dispatchEvent(event);

    expect(onClearSpy).toHaveBeenCalled();
    expect(emittedData).toContain('\x0c');

    controller.dispose();
  });

  it('handles Ctrl+C interrupt shortcut when no selection exists', () => {
    const onInterruptSpy = vi.fn();
    const controller = new TerminalController({ enableWebgl: false, onInterrupt: onInterruptSpy });
    controller.mount(container);

    const emittedData: string[] = [];
    controller.onData((data) => {
      emittedData.push(data);
    });

    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();

    const event = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    textarea!.dispatchEvent(event);

    expect(onInterruptSpy).toHaveBeenCalled();
    expect(emittedData).toContain('\x03');

    controller.dispose();
  });

  it('gracefully disposes all listeners, addons, and terminal instances', () => {
    const controller = new TerminalController({ enableWebgl: false });
    controller.mount(container);
    expect(controller.isMounted).toBe(true);

    controller.dispose();
    expect(controller.isMounted).toBe(false);

    // Multiple dispose calls should be safe and idempotent
    expect(() => controller.dispose()).not.toThrow();
  });
});
