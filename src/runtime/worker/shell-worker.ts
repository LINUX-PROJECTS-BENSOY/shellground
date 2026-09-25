/**
 * shell-worker.ts - Dedicated Web Worker Execution Host for SHELLGROUND Sandbox
 * Specified in Sub-Phase 3.2 of Issue #9
 */

import { WorkerRuntimeManager } from './runtime-worker';
import type { RuntimeWorkerRequest } from './worker-messages';

const manager = new WorkerRuntimeManager();

if (typeof self !== 'undefined') {
  self.onmessage = async (event: MessageEvent<unknown>) => {
    const data = event.data as RuntimeWorkerRequest;
    if (!data || typeof data !== 'object' || !('type' in data) || !('id' in data)) {
      if (typeof self.postMessage === 'function') {
        self.postMessage({
          type: 'runtime.error',
          error: {
            code: 'MALFORMED_REQUEST',
            message: 'Worker received a malformed or invalid request envelope.',
          },
        });
      }
      return;
    }

    switch (data.type) {
      case 'runtime.initialize':
        await manager.initialize(data.id, data.payload);
        break;
      case 'terminal.open':
        await manager.openTerminal(data.id, data.payload);
        break;
      case 'terminal.stdin':
        await manager.writeStdin(data.id, data.payload);
        break;
      case 'terminal.resize':
        manager.resizeTerminal(data.id, data.payload);
        break;
      case 'terminal.interrupt':
        await manager.interrupt(data.id);
        break;
      case 'command.execute':
        await manager.executeCommand(data.id, data.payload);
        break;
      case 'runtime.reset':
        await manager.reset(data.id, data.payload);
        break;
      case 'runtime.dispose':
        await manager.dispose(data.id);
        break;
      default:
        if (typeof self.postMessage === 'function') {
          self.postMessage({
            requestId: (data as { id?: string }).id,
            type: 'runtime.error',
            error: {
              code: 'UNKNOWN_REQUEST_TYPE',
              message: `Unsupported request type: ${(data as { type: string }).type}`,
            },
          });
        }
    }
  };
}

export { manager };
