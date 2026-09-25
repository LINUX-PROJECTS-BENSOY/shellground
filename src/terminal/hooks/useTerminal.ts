/**
 * useTerminal - React Hook managing TerminalController Lifecycle
 * Integrates container ref, ResizeObserver, and process port connection
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { TerminalController } from '../TerminalController';
import type {
  TerminalControllerOptions,
  TerminalProcessPort,
  TerminalDimensions,
} from '../terminal.types';

export interface UseTerminalOptions extends TerminalControllerOptions {
  readonly processPort?: TerminalProcessPort;
  readonly autoFocus?: boolean;
}

export interface UseTerminalResult {
  readonly containerRef: (node: HTMLElement | null) => void;
  readonly controller: TerminalController | null;
  readonly dimensions: TerminalDimensions;
  readonly isMounted: boolean;
}

export function useTerminal(options: UseTerminalOptions = {}): UseTerminalResult {
  const [controller, setController] = useState<TerminalController | null>(null);
  const [dimensions, setDimensions] = useState<TerminalDimensions>({ cols: 80, rows: 24 });
  const [isMounted, setIsMounted] = useState(false);

  const containerNodeRef = useRef<HTMLElement | null>(null);
  const controllerRef = useRef<TerminalController | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const disconnectPortRef = useRef<(() => void) | null>(null);

  // Initialize or connect process port when available
  useEffect(() => {
    if (controllerRef.current && options.processPort) {
      if (disconnectPortRef.current) {
        disconnectPortRef.current();
      }
      disconnectPortRef.current = controllerRef.current.connect(options.processPort);
    }

    return () => {
      if (disconnectPortRef.current) {
        disconnectPortRef.current();
        disconnectPortRef.current = null;
      }
    };
  }, [options.processPort]);

  const containerRef = useCallback(
    (node: HTMLElement | null) => {
      // Cleanup previous container if any
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      containerNodeRef.current = node;

      if (!node) {
        setIsMounted(false);
        return;
      }

      // Create controller instance if not created
      if (!controllerRef.current) {
        const ctrl = new TerminalController(options);
        controllerRef.current = ctrl;
        setController(ctrl);

        ctrl.onResize((newDims) => {
          setDimensions(newDims);
        });

        if (options.processPort) {
          disconnectPortRef.current = ctrl.connect(options.processPort);
        }
      }

      const ctrl = controllerRef.current;

      try {
        ctrl.mount(node);
        setIsMounted(true);
        setDimensions(ctrl.dimensions);

        if (options.autoFocus !== false) {
          ctrl.focus();
        }

        // Setup ResizeObserver for responsive fitting
        if (typeof ResizeObserver !== 'undefined') {
          const observer = new ResizeObserver(() => {
            if (ctrl.isMounted) {
              ctrl.fit();
            }
          });
          observer.observe(node);
          resizeObserverRef.current = observer;
        }
      } catch (err) {
        console.error('[useTerminal] Failed to mount terminal:', err);
      }
    },
    []
  );

  // Teardown controller on unmount
  useEffect(() => {
    return () => {
      if (disconnectPortRef.current) {
        disconnectPortRef.current();
        disconnectPortRef.current = null;
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (controllerRef.current) {
        controllerRef.current.dispose();
        controllerRef.current = null;
      }
    };
  }, []);

  return {
    containerRef,
    controller,
    dimensions,
    isMounted,
  };
}
