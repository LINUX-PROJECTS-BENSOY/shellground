import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileText, CornerDownLeft } from 'lucide-react';
import type { FileDetails } from '../types';
import { FsSnapshotEngine } from '../services/FsSnapshotEngine';
import { Button } from '../../../shared/components/Button';

export interface FileInspectorModalProps {
  readonly file: FileDetails | null;
  readonly onClose: () => void;
  readonly onInsertPath?: (path: string) => void;
  readonly onExecuteCommand?: (cmd: string) => void;
}

export const FileInspectorModal: React.FC<FileInspectorModalProps> = ({
  file,
  onClose,
  onInsertPath,
  onExecuteCommand,
}) => {
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(file.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (onInsertPath) {
      onInsertPath(file.path);
      onClose();
    }
  };

  const handleCat = () => {
    if (onExecuteCommand) {
      onExecuteCommand(`cat ${file.path}`);
      onClose();
    }
  };

  const lines = file.content.split('\n');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`File Inspector: ${file.name}`}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(3px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: 'var(--color-bg-canvas)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'var(--color-bg-subtle)',
            borderBottom: '1px solid var(--color-border-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <FileText size={18} color="var(--color-accent)" />
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-heading)',
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: 0,
                }}
              >
                {file.name}
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {file.path}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Metadata Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            backgroundColor: 'var(--color-bg-panel)',
            borderBottom: '1px solid var(--color-border-muted)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Mode: </span>
            <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{file.formattedMode}</span>
            <span style={{ color: 'var(--color-text-muted)' }}> ({file.mode})</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Size: </span>
            <span style={{ color: 'var(--color-text-heading)' }}>{FsSnapshotEngine.formatBytes(file.size)}</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Lines: </span>
            <span style={{ color: 'var(--color-text-heading)' }}>{file.lineCount}</span>
          </div>
          {file.isExecutable && (
            <span
              style={{
                backgroundColor: 'rgba(63, 185, 80, 0.15)',
                color: 'var(--color-success)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}
            >
              executable
            </span>
          )}
        </div>

        {/* File Content Preview */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: 'var(--terminal-bg)',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: '1.6',
            color: 'var(--terminal-fg)',
          }}
        >
          {file.content.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
              (Empty file)
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', userSelect: 'text' }}>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} style={{ verticalAlign: 'top' }}>
                    <td
                      style={{
                        width: '32px',
                        paddingRight: '12px',
                        textAlign: 'right',
                        color: 'var(--color-text-muted)',
                        userSelect: 'none',
                        opacity: 0.6,
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: 'var(--color-bg-subtle)',
            borderTop: '1px solid var(--color-border-default)',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              size="sm"
              variant="secondary"
              icon={copied ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
              onClick={handleCopyPath}
            >
              {copied ? 'Copied' : 'Copy Path'}
            </Button>

            {onInsertPath && (
              <Button
                size="sm"
                variant="secondary"
                icon={<CornerDownLeft size={13} />}
                onClick={handleInsert}
                title="Inserts path into current terminal prompt"
              >
                Insert Path
              </Button>
            )}

            {onExecuteCommand && (
              <Button
                size="sm"
                variant="secondary"
                icon={<Terminal size={13} />}
                onClick={handleCat}
                title="Runs cat on this file in the terminal"
              >
                cat {file.name}
              </Button>
            )}
          </div>

          <Button size="sm" variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
