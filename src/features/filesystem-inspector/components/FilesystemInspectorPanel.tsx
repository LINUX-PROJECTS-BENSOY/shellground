import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FolderTree,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import type { IVirtualFsObservable, VirtualFsSnapshot, VirtualFsNode, FileDetails } from '../types';
import { FilesystemTreeView } from './FilesystemTreeView';
import { FileInspectorModal } from './FileInspectorModal';
import { FsSnapshotEngine } from '../services/FsSnapshotEngine';

export interface FilesystemInspectorPanelProps {
  readonly session: IVirtualFsObservable;
  readonly onClose?: () => void;
  readonly defaultRoot?: string;
}

export const FilesystemInspectorPanel: React.FC<FilesystemInspectorPanelProps> = ({
  session,
  onClose,
  defaultRoot = '/workspace',
}) => {
  const [rootPath, setRootPath] = useState<string>(defaultRoot);
  const [snapshot, setSnapshot] = useState<VirtualFsSnapshot | null>(() => session.getFsSnapshot(rootPath));
  const [showHidden, setShowHidden] = useState<boolean>(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set([defaultRoot, '/']));
  const [inspectedFile, setInspectedFile] = useState<FileDetails | null>(null);

  // Subscribe to virtual filesystem mutations
  useEffect(() => {
    // Initial fetch
    setSnapshot(session.getFsSnapshot(rootPath));

    const unsubscribe = session.onFsChange((newSnapshot) => {
      setSnapshot(newSnapshot);

      // Auto-expand paths containing created or modified files
      if (newSnapshot.recentMutation) {
        const affected = [
          ...newSnapshot.recentMutation.created,
          ...newSnapshot.recentMutation.modified,
        ];
        if (affected.length > 0) {
          setExpandedPaths((prev) => {
            const next = new Set(prev);
            for (const item of affected) {
              let cur = item;
              while (cur && cur !== '/') {
                const slash = cur.lastIndexOf('/');
                cur = slash > 0 ? cur.substring(0, slash) : '/';
                next.add(cur);
              }
            }
            return next;
          });
        }
      }
    });

    return unsubscribe;
  }, [session, rootPath]);

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    if (!snapshot) return;
    const allDirs = new Set<string>();
    const collect = (node: VirtualFsNode) => {
      if (node.type === 'directory') {
        allDirs.add(node.path);
        node.children?.forEach(collect);
      }
    };
    collect(snapshot.tree);
    setExpandedPaths(allDirs);
  }, [snapshot]);

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set([rootPath]));
  }, [rootPath]);

  const handleRefresh = useCallback(() => {
    setSnapshot(session.getFsSnapshot(rootPath));
  }, [session, rootPath]);

  const handleSelectFile = useCallback(
    (node: VirtualFsNode) => {
      const details = session.getFileDetails(node.path);
      if (details) {
        setInspectedFile(details);
      }
    },
    [session]
  );

  const handleInsertPath = useCallback(
    (path: string) => {
      session.writeInput(path);
    },
    [session]
  );

  const handleExecuteCommand = useCallback(
    (cmd: string) => {
      session.writeInput(`${cmd}\r`);
    },
    [session]
  );

  // Available root targets
  const rootOptions = useMemo(
    () => [
      { label: '~/workspace', value: '/workspace' },
      { label: '/ (Root)', value: '/' },
      { label: '/tmp', value: '/tmp' },
      { label: '/etc', value: '/etc' },
      { label: '/var/log', value: '/var/log' },
    ],
    []
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--color-bg-canvas)',
        borderRight: '1px solid var(--color-border-default)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border-default)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderTree size={16} color="var(--color-accent)" />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-heading)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Filesystem Tree
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Toggle Hidden Files */}
          <button
            onClick={() => setShowHidden((prev) => !prev)}
            title={showHidden ? 'Hide hidden files (.*)' : 'Show hidden files (.*)'}
            aria-label="Toggle hidden files"
            style={{
              background: showHidden ? 'var(--color-accent-subtle)' : 'none',
              border: 'none',
              color: showHidden ? 'var(--color-accent)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showHidden ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Expand All */}
          <button
            onClick={handleExpandAll}
            title="Expand all folders"
            aria-label="Expand all"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronDown size={14} />
          </button>

          {/* Collapse All */}
          <button
            onClick={handleCollapseAll}
            title="Collapse all folders"
            aria-label="Collapse all"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronRight size={14} />
          </button>

          {/* Manual Refresh */}
          <button
            onClick={handleRefresh}
            title="Refresh virtual filesystem"
            aria-label="Refresh tree"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RefreshCw size={13} />
          </button>

          {/* Close Panel Button */}
          {onClose && (
            <button
              onClick={onClose}
              title="Close Filesystem Explorer"
              aria-label="Close filesystem panel"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Root Path Selector Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: 'var(--color-bg-panel)',
          borderBottom: '1px solid var(--color-border-muted)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'var(--color-text-muted)' }}>Root:</span>
        <select
          value={rootPath}
          onChange={(e) => {
            const next = e.target.value;
            setRootPath(next);
            setExpandedPaths((prev) => new Set([...prev, next]));
          }}
          aria-label="Root directory selector"
          style={{
            backgroundColor: 'var(--color-bg-canvas)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-primary)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '2px 6px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {rootOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {snapshot && (
          <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: '10px' }}>
            {snapshot.totalFiles} files · {FsSnapshotEngine.formatBytes(snapshot.totalBytes)}
          </span>
        )}
      </div>

      {/* Recent Mutation Activity Pill */}
      {snapshot?.recentMutation && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            backgroundColor: 'rgba(56, 139, 253, 0.08)',
            borderBottom: '1px solid var(--color-border-muted)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
            flexShrink: 0,
          }}
        >
          <Sparkles size={12} color="var(--color-accent)" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Cmd: </span>
            <span style={{ color: 'var(--color-accent)' }}>{snapshot.recentMutation.command}</span>
            {snapshot.recentMutation.created.length > 0 && (
              <span style={{ color: 'var(--color-success)', marginLeft: '6px' }}>
                (+{snapshot.recentMutation.created.length} new)
              </span>
            )}
            {snapshot.recentMutation.deleted.length > 0 && (
              <span style={{ color: 'var(--color-danger)', marginLeft: '6px' }}>
                (-{snapshot.recentMutation.deleted.length} removed)
              </span>
            )}
            {snapshot.recentMutation.modified.length > 0 && (
              <span style={{ color: 'var(--color-warning)', marginLeft: '6px' }}>
                (~{snapshot.recentMutation.modified.length} mod)
              </span>
            )}
          </span>
        </div>
      )}

      {/* Tree Content Area */}
      <div
        role="tree"
        aria-label="Virtual Filesystem Directory Tree"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '6px 4px',
        }}
      >
        {snapshot ? (
          <FilesystemTreeView
            node={snapshot.tree}
            expandedPaths={expandedPaths}
            onToggleExpand={handleToggleExpand}
            onSelectFile={handleSelectFile}
            onInsertPath={handleInsertPath}
            showHidden={showHidden}
            depth={0}
          />
        ) : (
          <div
            style={{
              padding: '16px',
              color: 'var(--color-text-muted)',
              fontSize: '12px',
              fontStyle: 'italic',
            }}
          >
            Loading virtual filesystem...
          </div>
        )}
      </div>

      {/* File Inspector Modal */}
      {inspectedFile && (
        <FileInspectorModal
          file={inspectedFile}
          onClose={() => setInspectedFile(null)}
          onInsertPath={handleInsertPath}
          onExecuteCommand={handleExecuteCommand}
        />
      )}
    </div>
  );
};
