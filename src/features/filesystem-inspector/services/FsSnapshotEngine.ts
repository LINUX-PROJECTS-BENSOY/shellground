import type {
  VirtualFsNode,
  VirtualFsSnapshot,
  FsMutationRecord,
  MutationType,
  FileDetails,
} from '../types';

export class FsSnapshotEngine {
  /**
   * Translates octal permissions string (e.g. "755", "644") to standard UNIX "rwxr-xr-x" format
   */
  public static formatPermissions(mode: string | undefined, isDirectory: boolean): string {
    const raw = (mode || (isDirectory ? '755' : '644')).slice(-3);
    const digits = raw.padStart(3, '0').split('').map((d) => parseInt(d, 10) || 0);

    const octalToRwx = (octal: number): string => {
      const r = octal & 4 ? 'r' : '-';
      const w = octal & 2 ? 'w' : '-';
      const x = octal & 1 ? 'x' : '-';
      return `${r}${w}${x}`;
    };

    const prefix = isDirectory ? 'd' : '-';
    return `${prefix}${digits.map(octalToRwx).join('')}`;
  }

  /**
   * Formats raw byte size into human readable string
   */
  public static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = bytes / Math.pow(k, i);
    return `${val < 10 && i > 0 ? val.toFixed(1) : Math.round(val)} ${sizes[i]}`;
  }

  /**
   * Detects filesystem changes between previous and current state
   */
  public static detectMutations(
    prevFiles: Map<string, string>,
    prevDirs: Set<string>,
    currentFiles: Map<string, string>,
    currentDirs: Set<string>,
    command: string
  ): FsMutationRecord | null {
    const created: string[] = [];
    const modified: string[] = [];
    const deleted: string[] = [];

    // Detect created files
    for (const [path] of currentFiles) {
      if (!prevFiles.has(path)) {
        created.push(path);
      } else if (prevFiles.get(path) !== currentFiles.get(path)) {
        modified.push(path);
      }
    }

    // Detect created dirs
    for (const dir of currentDirs) {
      if (!prevDirs.has(dir)) {
        created.push(dir);
      }
    }

    // Detect deleted files
    for (const [path] of prevFiles) {
      if (!currentFiles.has(path)) {
        deleted.push(path);
      }
    }

    // Detect deleted dirs
    for (const dir of prevDirs) {
      if (!currentDirs.has(dir)) {
        deleted.push(dir);
      }
    }

    if (created.length === 0 && modified.length === 0 && deleted.length === 0) {
      return null;
    }

    return {
      command,
      timestamp: Date.now(),
      created,
      modified,
      deleted,
    };
  }

  /**
   * Builds the virtual filesystem tree hierarchy anchored at rootPath
   */
  public static buildSnapshot(
    vfs: Map<string, string>,
    dirs: Set<string>,
    vmodes: Map<string, string>,
    cwd: string,
    rootPath = '/workspace',
    mutationRecord: FsMutationRecord | null = null
  ): VirtualFsSnapshot {
    const normalizedRoot = rootPath === '/' ? '/' : rootPath.replace(/\/+$/, '');

    // Ensure root directory exists in directory set
    const allDirs = new Set(dirs);
    allDirs.add(normalizedRoot);

    // Compute metrics
    let totalFiles = 0;
    let totalDirs = 0;
    let totalBytes = 0;

    for (const [filePath, content] of vfs.entries()) {
      if (normalizedRoot === '/' || filePath === normalizedRoot || filePath.startsWith(normalizedRoot + '/')) {
        totalFiles++;
        totalBytes += content.length;
      }
    }

    for (const dirPath of allDirs) {
      if (dirPath !== normalizedRoot && (normalizedRoot === '/' || dirPath.startsWith(normalizedRoot + '/'))) {
        totalDirs++;
      }
    }

    const tree = this.buildNode(
      normalizedRoot,
      normalizedRoot === '/' ? '/' : normalizedRoot.split('/').pop() || normalizedRoot,
      true,
      vfs,
      allDirs,
      vmodes,
      cwd,
      mutationRecord
    );

    return {
      cwd,
      rootPath: normalizedRoot,
      tree,
      totalFiles,
      totalDirs,
      totalBytes,
      recentMutation: mutationRecord,
    };
  }

  private static buildNode(
    fullPath: string,
    name: string,
    isDirectory: boolean,
    vfs: Map<string, string>,
    dirs: Set<string>,
    vmodes: Map<string, string>,
    cwd: string,
    mutationRecord: FsMutationRecord | null
  ): VirtualFsNode {
    const rawMode = vmodes.get(fullPath) ?? (isDirectory ? '755' : '644');
    const formattedMode = this.formatPermissions(rawMode, isDirectory);
    const isHidden = name.startsWith('.') && name !== '.' && name !== '..';
    const isCwd = isDirectory && fullPath === cwd;
    const isExecutable = !isDirectory && (rawMode.includes('7') || rawMode.includes('5') || name.endsWith('.sh'));

    let mutation: MutationType = 'unchanged';
    if (mutationRecord) {
      if (mutationRecord.created.includes(fullPath)) {
        mutation = 'created';
      } else if (mutationRecord.modified.includes(fullPath)) {
        mutation = 'modified';
      }
    }

    if (!isDirectory) {
      const content = vfs.get(fullPath) ?? '';
      const dotIdx = name.lastIndexOf('.');
      const extension = dotIdx !== -1 ? name.slice(dotIdx).toLowerCase() : '';
      const lineCount = content.length > 0 ? content.split('\n').length : 0;

      return {
        path: fullPath,
        name,
        type: 'file',
        size: content.length,
        lineCount,
        mode: rawMode,
        formattedMode,
        isExecutable,
        isHidden,
        isCwd: false,
        mutation,
        extension,
      };
    }

    // Directory: Collect direct children
    const childNodes: VirtualFsNode[] = [];
    const childNames = new Set<string>();

    const prefix = fullPath === '/' ? '/' : `${fullPath}/`;

    // 1. Direct subdirectories
    for (const d of dirs) {
      if (d !== fullPath && d.startsWith(prefix)) {
        const sub = d.slice(prefix.length);
        const nextSlash = sub.indexOf('/');
        const directChildName = nextSlash === -1 ? sub : sub.slice(0, nextSlash);
        if (directChildName && !childNames.has(directChildName)) {
          childNames.add(directChildName);
          const childPath = fullPath === '/' ? `/${directChildName}` : `${fullPath}/${directChildName}`;
          childNodes.push(
            this.buildNode(childPath, directChildName, true, vfs, dirs, vmodes, cwd, mutationRecord)
          );
        }
      }
    }

    // 2. Direct files
    for (const f of vfs.keys()) {
      if (f.startsWith(prefix)) {
        const sub = f.slice(prefix.length);
        if (!sub.includes('/')) {
          if (!childNames.has(sub)) {
            childNames.add(sub);
            childNodes.push(
              this.buildNode(f, sub, false, vfs, dirs, vmodes, cwd, mutationRecord)
            );
          }
        }
      }
    }

    // Sort: directories first (alphabetical), then files (alphabetical)
    childNodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      path: fullPath,
      name,
      type: 'directory',
      size: 4096,
      lineCount: 0,
      mode: rawMode,
      formattedMode,
      isExecutable: true,
      isHidden,
      isCwd,
      mutation,
      extension: '',
      children: childNodes,
    };
  }

  /**
   * Retrieves full file details and content for inspector preview
   */
  public static getFileDetails(
    targetPath: string,
    vfs: Map<string, string>,
    dirs: Set<string>,
    vmodes: Map<string, string>
  ): FileDetails | null {
    const isDir = dirs.has(targetPath);
    const exists = isDir || vfs.has(targetPath);
    if (!exists) return null;

    const name = targetPath === '/' ? '/' : targetPath.split('/').pop() || targetPath;
    const rawMode = vmodes.get(targetPath) ?? (isDir ? '755' : '644');
    const formattedMode = this.formatPermissions(rawMode, isDir);
    const content = isDir ? '' : vfs.get(targetPath) ?? '';
    const dotIdx = name.lastIndexOf('.');
    const extension = dotIdx !== -1 ? name.slice(dotIdx).toLowerCase() : '';
    const lineCount = content.length > 0 ? content.split('\n').length : 0;
    const isHidden = name.startsWith('.') && name !== '.' && name !== '..';
    const isExecutable = !isDir && (rawMode.includes('7') || rawMode.includes('5') || name.endsWith('.sh'));

    return {
      path: targetPath,
      name,
      type: isDir ? 'directory' : 'file',
      size: isDir ? 4096 : content.length,
      lineCount,
      mode: rawMode,
      formattedMode,
      content,
      extension,
      isExecutable,
      isHidden,
    };
  }
}
