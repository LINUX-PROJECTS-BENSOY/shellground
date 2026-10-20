import React from 'react';
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  Terminal,
  ChevronDown,
  ChevronRight,
  CornerDownLeft,
  Eye,
} from 'lucide-react';
import type { VirtualFsNode } from '../types';
import { FsSnapshotEngine } from '../services/FsSnapshotEngine';

export interface FilesystemTreeViewProps {
  readonly node: VirtualFsNode;
  readonly expandedPaths: Set<string>;
  readonly onToggleExpand: (path: string) => void;
  readonly onSelectFile: (node: VirtualFsNode) => void;
  readonly onInsertPath?: (path: string) => void;
  readonly showHidden: boolean;
  readonly depth?: number;
}

export const FilesystemTreeView: React.FC<FilesystemTreeViewProps> = ({
  node,
  expandedPaths,
  onToggleExpand,
  onSelectFile,
  onInsertPath,
  showHidden,
  depth = 0,
}) => {
  if (node.isHidden && !showHidden && depth > 0) {
    return null;
  }

  const isDirectory = node.type === 'directory';
  const isExpanded = expandedPaths.has(node.path);

  const getFileIcon = (item: VirtualFsNode) => {
    if (item.isExecutable || item.extension === '.sh' || item.extension === '.bash') {
      return <Terminal size={14} color="var(--color-success)" />;
    }
    if (['.txt', '.md', '.markdown', '.json', '.yaml', '.yml', '.csv'].includes(item.extension)) {
      return <FileText size={14} color="var(--color-accent)" />;
    }
    if (item.extension === '.log') {
      return <FileText size={14} color="var(--color-warning)" />;
    }
    if (['.tar', '.gz', '.zip', '.bz2'].includes(item.extension)) {
      return <FileCode size={14} color="#bc8cff" />;
    }
    return <File size={14} color="var(--color-text-muted)" />;
  };

  const handleRowClick = () => {
    if (isDirectory) {
      onToggleExpand(node.path);
    } else {
      onSelectFile(node);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        role="treeitem"
        aria-expanded={isDirectory ? isExpanded : undefined}
        aria-selected={false}
        onClick={handleRowClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px',
          paddingLeft: `${Math.max(8, depth * 16 + 8)}px`,
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          userSelect: 'none',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          transition: 'background-color 0.1s ease',
          backgroundColor: node.mutation === 'created'
            ? 'rgba(63, 185, 80, 0.1)'
            : node.mutation === 'modified'
            ? 'rgba(210, 153, 34, 0.1)'
            : 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = node.mutation === 'created'
            ? 'rgba(63, 185, 80, 0.1)'
            : node.mutation === 'modified'
            ? 'rgba(210, 153, 34, 0.1)'
            : 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          {isDirectory ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.path);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          ) : (
            <span style={{ width: '14px', display: 'inline-block' }} />
          )}

          <span style={{ display: 'flex', alignItems: 'center' }}>
            {isDirectory ? (
              isExpanded ? (
                <FolderOpen size={14} color="var(--color-warning)" />
              ) : (
                <Folder size={14} color="var(--color-warning)" />
              )
            ) : (
              getFileIcon(node)
            )}
          </span>

          <span
            style={{
              color: node.isCwd
                ? 'var(--color-accent)'
                : isDirectory
                ? 'var(--color-text-heading)'
                : 'var(--color-text-primary)',
              fontWeight: isDirectory ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              opacity: node.isHidden ? 0.6 : 1,
            }}
          >
            {node.name}
          </span>

          {/* CWD Badge */}
          {node.isCwd && (
            <span
              style={{
                fontSize: '9px',
                padding: '1px 4px',
                borderRadius: '3px',
                backgroundColor: 'rgba(56, 139, 253, 0.2)',
                color: 'var(--color-accent)',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
              title="Current working directory in terminal"
            >
              CWD
            </span>
          )}

          {/* Mutation Badges */}
          {node.mutation === 'created' && (
            <span
              style={{
                fontSize: '9px',
                padding: '1px 5px',
                borderRadius: '3px',
                backgroundColor: 'var(--color-success)',
                color: '#0d1117',
                fontWeight: 700,
                boxShadow: '0 0 6px rgba(63, 185, 80, 0.4)',
              }}
              title="Newly created in recent command"
            >
              + NEW
            </span>
          )}

          {node.mutation === 'modified' && (
            <span
              style={{
                fontSize: '9px',
                padding: '1px 5px',
                borderRadius: '3px',
                backgroundColor: 'var(--color-warning)',
                color: '#0d1117',
                fontWeight: 700,
              }}
              title="Modified in recent command"
            >
              ~ MOD
            </span>
          )}
        </div>

        {/* Right Info & Quick Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {!isDirectory && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {FsSnapshotEngine.formatBytes(node.size)}
            </span>
          )}

          {isDirectory && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}
            >
              {node.children ? `(${node.children.length})` : ''}
            </span>
          )}

          {!isDirectory && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFile(node);
                }}
                title="Inspect file contents"
                aria-label={`Inspect ${node.name}`}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Eye size={12} />
              </button>

              {onInsertPath && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInsertPath(node.path);
                  }}
                  title="Insert path into terminal prompt"
                  aria-label={`Insert path for ${node.name}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CornerDownLeft size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recursive Children rendering */}
      {isDirectory && isExpanded && node.children && node.children.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {node.children.map((child) => (
            <FilesystemTreeView
              key={child.path}
              node={child}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
              onSelectFile={onSelectFile}
              onInsertPath={onInsertPath}
              showHidden={showHidden}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {isDirectory && isExpanded && node.children && node.children.length === 0 && (
        <div
          style={{
            padding: '4px 8px',
            paddingLeft: `${(depth + 1) * 16 + 18}px`,
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            fontFamily: 'var(--font-mono)',
          }}
        >
          (empty directory)
        </div>
      )}
    </div>
  );
};
