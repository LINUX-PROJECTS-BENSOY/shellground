import { describe, it, expect } from 'vitest';
import { FsSnapshotEngine } from '../../../src/features/filesystem-inspector/services/FsSnapshotEngine';

describe('FsSnapshotEngine', () => {
  describe('formatPermissions', () => {
    it('formats file permissions from octal', () => {
      expect(FsSnapshotEngine.formatPermissions('644', false)).toBe('-rw-r--r--');
      expect(FsSnapshotEngine.formatPermissions('755', false)).toBe('-rwxr-xr-x');
      expect(FsSnapshotEngine.formatPermissions('777', false)).toBe('-rwxrwxrwx');
      expect(FsSnapshotEngine.formatPermissions('600', false)).toBe('-rw-------');
    });

    it('formats directory permissions with d prefix', () => {
      expect(FsSnapshotEngine.formatPermissions('755', true)).toBe('drwxr-xr-x');
      expect(FsSnapshotEngine.formatPermissions('700', true)).toBe('drwx------');
    });

    it('falls back gracefully when mode is omitted', () => {
      expect(FsSnapshotEngine.formatPermissions(undefined, false)).toBe('-rw-r--r--');
      expect(FsSnapshotEngine.formatPermissions(undefined, true)).toBe('drwxr-xr-x');
    });
  });

  describe('formatBytes', () => {
    it('formats byte sizes correctly', () => {
      expect(FsSnapshotEngine.formatBytes(0)).toBe('0 B');
      expect(FsSnapshotEngine.formatBytes(42)).toBe('42 B');
      expect(FsSnapshotEngine.formatBytes(1024)).toBe('1.0 KB');
      expect(FsSnapshotEngine.formatBytes(2048)).toBe('2.0 KB');
      expect(FsSnapshotEngine.formatBytes(1048576)).toBe('1.0 MB');
    });
  });

  describe('detectMutations', () => {
    it('detects newly created files and directories', () => {
      const prevFiles = new Map<string, string>();
      const prevDirs = new Set<string>(['/workspace']);

      const nextFiles = new Map<string, string>([['/workspace/hello.txt', 'Hello World']]);
      const nextDirs = new Set<string>(['/workspace', '/workspace/docs']);

      const mutation = FsSnapshotEngine.detectMutations(
        prevFiles,
        prevDirs,
        nextFiles,
        nextDirs,
        'touch hello.txt && mkdir docs'
      );

      expect(mutation).not.toBeNull();
      expect(mutation?.created).toContain('/workspace/hello.txt');
      expect(mutation?.created).toContain('/workspace/docs');
      expect(mutation?.modified).toHaveLength(0);
      expect(mutation?.deleted).toHaveLength(0);
    });

    it('detects modified files when content changes', () => {
      const prevFiles = new Map<string, string>([['/workspace/app.log', 'line 1\n']]);
      const prevDirs = new Set<string>(['/workspace']);

      const nextFiles = new Map<string, string>([['/workspace/app.log', 'line 1\nline 2\n']]);
      const nextDirs = new Set<string>(['/workspace']);

      const mutation = FsSnapshotEngine.detectMutations(
        prevFiles,
        prevDirs,
        nextFiles,
        nextDirs,
        'echo "line 2" >> app.log'
      );

      expect(mutation).not.toBeNull();
      expect(mutation?.modified).toContain('/workspace/app.log');
      expect(mutation?.created).toHaveLength(0);
      expect(mutation?.deleted).toHaveLength(0);
    });

    it('detects deleted files and directories', () => {
      const prevFiles = new Map<string, string>([['/workspace/old.txt', 'bye']]);
      const prevDirs = new Set<string>(['/workspace', '/workspace/temp']);

      const nextFiles = new Map<string, string>();
      const nextDirs = new Set<string>(['/workspace']);

      const mutation = FsSnapshotEngine.detectMutations(
        prevFiles,
        prevDirs,
        nextFiles,
        nextDirs,
        'rm old.txt && rmdir temp'
      );

      expect(mutation).not.toBeNull();
      expect(mutation?.deleted).toContain('/workspace/old.txt');
      expect(mutation?.deleted).toContain('/workspace/temp');
      expect(mutation?.created).toHaveLength(0);
      expect(mutation?.modified).toHaveLength(0);
    });

    it('returns null when no mutations occurred', () => {
      const prevFiles = new Map<string, string>([['/workspace/file.txt', 'data']]);
      const prevDirs = new Set<string>(['/workspace']);

      const mutation = FsSnapshotEngine.detectMutations(
        prevFiles,
        prevDirs,
        prevFiles,
        prevDirs,
        'pwd'
      );

      expect(mutation).toBeNull();
    });
  });

  describe('buildSnapshot', () => {
    it('constructs hierarchical tree sorted with directories first and alphabetical files', () => {
      const vfs = new Map<string, string>([
        ['/workspace/zebra.txt', 'z'],
        ['/workspace/apple.txt', 'a'],
        ['/workspace/src/index.js', 'console.log("hi");'],
      ]);
      const dirs = new Set<string>(['/workspace', '/workspace/src', '/workspace/docs']);
      const vmodes = new Map<string, string>([['/workspace/zebra.txt', '644']]);

      const snapshot = FsSnapshotEngine.buildSnapshot(vfs, dirs, vmodes, '/workspace', '/workspace');

      expect(snapshot.rootPath).toBe('/workspace');
      expect(snapshot.totalFiles).toBe(3);
      expect(snapshot.totalDirs).toBe(2);
      expect(snapshot.tree.type).toBe('directory');
      expect(snapshot.tree.children).toBeDefined();

      const children = snapshot.tree.children!;
      // Dirs first: docs, src
      expect(children[0]?.name).toBe('docs');
      expect(children[0]?.type).toBe('directory');
      expect(children[1]?.name).toBe('src');
      expect(children[1]?.type).toBe('directory');

      // Then files alphabetical: apple.txt, zebra.txt
      expect(children[2]?.name).toBe('apple.txt');
      expect(children[2]?.type).toBe('file');
      expect(children[3]?.name).toBe('zebra.txt');
      expect(children[3]?.type).toBe('file');

      // Subtree checks
      const srcNode = children[1]!;
      expect(srcNode.children).toHaveLength(1);
      expect(srcNode.children![0]?.name).toBe('index.js');
      expect(srcNode.children![0]?.path).toBe('/workspace/src/index.js');
    });

    it('marks node as CWD when matching current working directory', () => {
      const vfs = new Map<string, string>();
      const dirs = new Set<string>(['/workspace', '/workspace/build']);
      const vmodes = new Map<string, string>();

      const snapshot = FsSnapshotEngine.buildSnapshot(vfs, dirs, vmodes, '/workspace/build', '/workspace');
      const buildDir = snapshot.tree.children?.find((c) => c.name === 'build');

      expect(buildDir?.isCwd).toBe(true);
      expect(snapshot.tree.isCwd).toBe(false);
    });
  });

  describe('getFileDetails', () => {
    it('returns null for nonexistent path', () => {
      const details = FsSnapshotEngine.getFileDetails('/workspace/nope.txt', new Map(), new Set(), new Map());
      expect(details).toBeNull();
    });

    it('extracts line counts, extension, and formatted mode for a file', () => {
      const vfs = new Map<string, string>([['/workspace/script.sh', '#!/bin/bash\necho "hello"\nexit 0\n']]);
      const dirs = new Set<string>(['/workspace']);
      const vmodes = new Map<string, string>([['/workspace/script.sh', '755']]);

      const details = FsSnapshotEngine.getFileDetails('/workspace/script.sh', vfs, dirs, vmodes);
      expect(details).not.toBeNull();
      expect(details?.name).toBe('script.sh');
      expect(details?.type).toBe('file');
      expect(details?.lineCount).toBe(4);
      expect(details?.extension).toBe('.sh');
      expect(details?.isExecutable).toBe(true);
      expect(details?.formattedMode).toBe('-rwxr-xr-x');
      expect(details?.content).toContain('#!/bin/bash');
    });
  });
});
