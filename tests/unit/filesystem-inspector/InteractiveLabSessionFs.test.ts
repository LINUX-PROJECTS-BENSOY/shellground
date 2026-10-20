import { describe, it, expect, beforeEach } from 'vitest';
import { InteractiveLabSession } from '../../../src/features/training/services/InteractiveLabSession';
import { PackRegistry } from '../../../src/infrastructure/content/PackRegistry';
import type { LabDefinition } from '../../../src/domain/content/schemas';

describe('InteractiveLabSession Filesystem Integration', () => {
  let registry: PackRegistry;
  let lab: LabDefinition;
  let session: InteractiveLabSession;

  beforeEach(() => {
    registry = new PackRegistry();
    registry.registerFixture({
      schemaVersion: 1,
      id: 'file-ops-workspace',
      version: 1,
      files: [
        {
          path: '/workspace/welcome.txt',
          source: { type: 'inline', content: 'Welcome to ShellGround' },
        },
      ],
      directories: [{ path: '/workspace/docs', mode: '755' }],
    });

    lab = {
      id: 'fs-test-lab',
      version: 1,
      packId: 'linux-foundations',
      title: 'Filesystem Test Lab',
      difficulty: 'beginner',
      mission: {
        objective: 'Test filesystem observer integration',
      },
      fixture: {
        id: 'file-ops-workspace',
        version: 1,
      },
      concepts: ['filesystem.paths'],
      validators: [],
    };

    session = new InteractiveLabSession(lab, registry);
  });

  it('provides an initial virtual filesystem snapshot with fixture entries', () => {
    const snapshot = session.getFsSnapshot();
    expect(snapshot.rootPath).toBe('/workspace');
    expect(snapshot.cwd).toBe('/workspace');
    expect(snapshot.totalFiles).toBeGreaterThan(0);
    expect(snapshot.tree.type).toBe('directory');
  });

  it('notifies listeners when a new file is created with touch', () => {
    let notifiedSnapshot: ReturnType<typeof session.getFsSnapshot> | null = null;
    const unsubscribe = session.onFsChange((snap) => {
      notifiedSnapshot = snap;
    });

    session.executeCommandLine('touch /workspace/new_canary.txt');

    expect(notifiedSnapshot).not.toBeNull();
    expect(notifiedSnapshot!.recentMutation?.created).toContain('/workspace/new_canary.txt');

    const details = session.getFileDetails('/workspace/new_canary.txt');
    expect(details).not.toBeNull();
    expect(details?.name).toBe('new_canary.txt');

    unsubscribe();
  });

  it('notifies listeners when a directory is created with mkdir', () => {
    let notifiedSnapshot: ReturnType<typeof session.getFsSnapshot> | null = null;
    session.onFsChange((snap) => {
      notifiedSnapshot = snap;
    });

    session.executeCommandLine('mkdir /workspace/new_folder');

    expect(notifiedSnapshot).not.toBeNull();
    expect(notifiedSnapshot!.recentMutation?.created).toContain('/workspace/new_folder');
  });

  it('notifies listeners and removes files with rm command', () => {
    session.executeCommandLine('touch /workspace/delete_me.txt');

    let notifiedSnapshot: ReturnType<typeof session.getFsSnapshot> | null = null;
    session.onFsChange((snap) => {
      notifiedSnapshot = snap;
    });

    session.executeCommandLine('rm /workspace/delete_me.txt');

    expect(notifiedSnapshot).not.toBeNull();
    expect(notifiedSnapshot!.recentMutation?.deleted).toContain('/workspace/delete_me.txt');
    expect(session.getFileDetails('/workspace/delete_me.txt')).toBeNull();
  });

  it('removes directories and their contents recursively with rm -r', () => {
    session.executeCommandLine('mkdir /workspace/nested_dir');
    session.executeCommandLine('touch /workspace/nested_dir/inner.txt');

    let notifiedSnapshot: ReturnType<typeof session.getFsSnapshot> | null = null;
    session.onFsChange((snap) => {
      notifiedSnapshot = snap;
    });

    session.executeCommandLine('rm -rf /workspace/nested_dir');

    expect(notifiedSnapshot).not.toBeNull();
    expect(notifiedSnapshot!.recentMutation?.deleted).toContain('/workspace/nested_dir');
    expect(session.getFileDetails('/workspace/nested_dir/inner.txt')).toBeNull();
  });

  it('notifies listeners and reflects modified content with redirection', () => {
    session.executeCommandLine('echo "Hello Linux" > /workspace/greeting.txt');

    let notifiedSnapshot: ReturnType<typeof session.getFsSnapshot> | null = null;
    session.onFsChange((snap) => {
      notifiedSnapshot = snap;
    });

    session.executeCommandLine('echo "More text" >> /workspace/greeting.txt');

    expect(notifiedSnapshot).not.toBeNull();
    expect(notifiedSnapshot!.recentMutation?.modified).toContain('/workspace/greeting.txt');

    const content = session.getRawFileContent('/workspace/greeting.txt');
    expect(content).toContain('Hello Linux');
    expect(content).toContain('More text');
  });

  it('notifies listeners when cd changes working directory', () => {
    session.executeCommandLine('mkdir /workspace/project');

    let lastCwd = '';
    session.onFsChange((snap) => {
      lastCwd = snap.cwd;
    });

    session.executeCommandLine('cd /workspace/project');

    expect(lastCwd).toBe('/workspace/project');
  });

  it('resets filesystem state and clears mutations on hydrateFixture', () => {
    session.executeCommandLine('touch /workspace/mutation.tmp');
    session.hydrateFixture();

    const snapshot = session.getFsSnapshot();
    expect(snapshot.recentMutation).toBeNull();
    expect(session.getFileDetails('/workspace/mutation.tmp')).toBeNull();
  });
});
