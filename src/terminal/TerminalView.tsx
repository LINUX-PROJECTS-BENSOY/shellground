/**
 * TerminalView - React Presentation Component for xterm.js
 * Specified in Section 19 of FULL_ARCHITECTURE.md
 * 
 * Strict Invariant: Does not contain runtime execution or @wasmer/sdk imports.
 */

import React, { useEffect } from 'react';
import { useTerminal } from './hooks/useTerminal';
import type { TerminalController } from './TerminalController';
import type { TerminalControllerOptions, TerminalProcessPort } from './terminal.types';

export interface TerminalViewProps extends TerminalControllerOptions {
  readonly processPort?: TerminalProcessPort;
  readonly onTerminalReady?: (controller: TerminalController) => void;
  readonly className?: string;
  readonly showStatusBar?: boolean;
  readonly statusText?: string;
  readonly ariaLabel?: string;
  readonly autoFocus?: boolean;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  processPort,
  onTerminalReady,
  className = '',
  showStatusBar = true,
  statusText = 'Ready',
  ariaLabel = 'Interactive Linux Terminal',
  autoFocus = true,
  ...controllerOptions
}) => {
  const { containerRef, controller, dimensions, isMounted } = useTerminal({
    ...controllerOptions,
    processPort,
    autoFocus,
  });

  useEffect(() => {
    if (controller && isMounted && onTerminalReady) {
      onTerminalReady(controller);
    }
  }, [controller, isMounted, onTerminalReady]);

  return (
    <div
      className={`terminal-view-container flex flex-col h-full w-full overflow-hidden ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        ref={containerRef}
        className="terminal-host flex-1 w-full h-full overflow-hidden focus:outline-none"
        tabIndex={0}
        aria-label="Terminal display area"
      />

      {showStatusBar && (
        <div className="terminal-statusbar select-none" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="terminal-status-badge badge-ready">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {statusText}
            </span>
            <span className="terminal-status-badge badge-isolated">
              WASIX Sandboxed
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
            <span>
              {dimensions.cols} &times; {dimensions.rows}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
