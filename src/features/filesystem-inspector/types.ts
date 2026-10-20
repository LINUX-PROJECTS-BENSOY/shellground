/**
 * Virtual Filesystem Inspector Type Definitions
 * Models the live tree hierarchy, node metadata, mutation diffing, and file inspection.
 */

export type FsNodeType = 'file' | 'directory';

export type MutationType = 'created' | 'modified' | 'deleted' | 'unchanged';

export interface VirtualFsNode {
  readonly path: string;
  readonly name: string;
  readonly type: FsNodeType;
  readonly size: number;
  readonly lineCount: number;
  readonly mode: string;
  readonly formattedMode: string;
  readonly isExecutable: boolean;
  readonly isHidden: boolean;
  readonly isCwd: boolean;
  readonly mutation: MutationType;
  readonly extension: string;
  readonly children?: VirtualFsNode[];
}

export interface FsMutationRecord {
  readonly command: string;
  readonly timestamp: number;
  readonly created: readonly string[];
  readonly modified: readonly string[];
  readonly deleted: readonly string[];
}

export interface VirtualFsSnapshot {
  readonly cwd: string;
  readonly rootPath: string;
  readonly tree: VirtualFsNode;
  readonly totalFiles: number;
  readonly totalDirs: number;
  readonly totalBytes: number;
  readonly recentMutation: FsMutationRecord | null;
}

export interface FileDetails {
  readonly path: string;
  readonly name: string;
  readonly type: FsNodeType;
  readonly size: number;
  readonly lineCount: number;
  readonly mode: string;
  readonly formattedMode: string;
  readonly content: string;
  readonly extension: string;
  readonly isExecutable: boolean;
  readonly isHidden: boolean;
}

export interface IVirtualFsObservable {
  getFsSnapshot(rootPath?: string): VirtualFsSnapshot;
  onFsChange(listener: (snapshot: VirtualFsSnapshot) => void): () => void;
  getFileDetails(path: string): FileDetails | null;
  getRawFileContent(path: string): string | null;
  writeInput(data: string): void;
}
