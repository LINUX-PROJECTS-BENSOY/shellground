import React from 'react';
import type { TerminalProcessPort } from '../terminal.types';
import type { TerminalController } from '../TerminalController';

export interface TerminalTouchBarProps {
  readonly processPort?: TerminalProcessPort;
  readonly controller?: TerminalController | null;
  readonly className?: string;
}

interface TouchKey {
  readonly label: string;
  readonly value: string;
  readonly title?: string;
  readonly highlight?: boolean;
}

const TOUCH_KEYS: TouchKey[] = [
  { label: 'Tab', value: '\t', title: 'Autocomplete' },
  { label: 'Ctrl+C', value: '\x03', title: 'Interrupt / Cancel', highlight: true },
  { label: 'Ctrl+L', value: '\x0c', title: 'Clear screen' },
  { label: '|', value: ' | ', title: 'Pipe' },
  { label: '/', value: '/', title: 'Slash' },
  { label: '-', value: '-', title: 'Dash / Flag' },
  { label: '~', value: '~', title: 'Home directory' },
  { label: '>', value: ' > ', title: 'Redirect stdout' },
  { label: '*', value: '*', title: 'Wildcard' },
  { label: '$', value: '$', title: 'Variable / End of line' },
  { label: 'pwd', value: 'pwd\r', title: 'Print working directory' },
  { label: 'ls', value: 'ls\r', title: 'List directory' },
  { label: 'clear', value: 'clear\r', title: 'Clear screen' },
];

export const TerminalTouchBar: React.FC<TerminalTouchBarProps> = ({
  processPort,
  controller,
  className = '',
}) => {
  const handleKeyPress = (value: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (processPort) {
      processPort.writeInput(value);
    }
    if (controller) {
      controller.focus();
    }
  };

  return (
    <div
      className={`terminal-touch-bar ${className}`}
      role="toolbar"
      aria-label="Terminal keyboard shortcuts toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 8px',
        backgroundColor: 'var(--color-bg-subtle)',
        borderTop: '1px solid var(--color-border-default)',
        borderBottom: '1px solid var(--color-border-default)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        flexShrink: 0,
        zIndex: 3,
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
          paddingRight: '4px',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        KEYS:
      </span>

      {TOUCH_KEYS.map((k) => (
        <button
          key={k.label}
          type="button"
          title={k.title}
          aria-label={k.title || k.label}
          onMouseDown={(e) => handleKeyPress(k.value, e)}
          onTouchStart={(e) => handleKeyPress(k.value, e)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '32px',
            minWidth: '36px',
            padding: '0 10px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid',
            borderColor: k.highlight ? 'rgba(248, 81, 73, 0.4)' : 'var(--color-border-default)',
            backgroundColor: k.highlight ? 'rgba(248, 81, 73, 0.12)' : 'var(--color-bg-panel)',
            color: k.highlight ? 'var(--color-danger)' : 'var(--color-text-primary)',
            cursor: 'pointer',
            flexShrink: 0,
            userSelect: 'none',
            touchAction: 'manipulation',
            transition: 'background-color 0.1s, transform 0.05s',
          }}
        >
          {k.label}
        </button>
      ))}
    </div>
  );
};

