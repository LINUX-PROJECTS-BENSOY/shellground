export interface RuntimeCapabilityReport {
  readonly webAssembly: boolean;
  readonly webWorkers: boolean;
  readonly sharedArrayBuffer: boolean;
  readonly crossOriginIsolated: boolean;
  readonly indexedDB: boolean;
  readonly isFullySupported: boolean;
  readonly blockingFailures: readonly string[];
  readonly warnings: readonly string[];
}

export function detectBrowserCapabilities(): RuntimeCapabilityReport {
  const hasWasm = typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
  const hasWorkers = typeof Worker === 'function';
  const hasSAB = typeof SharedArrayBuffer !== 'undefined';
  const hasCOI = typeof window !== 'undefined' ? Boolean(window.crossOriginIsolated) : false;
  const hasIDB = typeof indexedDB !== 'undefined';

  const blocking: string[] = [];
  const warnings: string[] = [];

  if (!hasWasm) blocking.push('WebAssembly is missing or disabled in this browser.');
  if (!hasWorkers) blocking.push('Web Workers are not supported.');
  if (!hasSAB || !hasCOI) {
    blocking.push(
      'SharedArrayBuffer or cross-origin isolation (COOP/COEP) is missing. Required for WASIX runtime threads.'
    );
  }
  if (!hasIDB) {
    warnings.push('IndexedDB is not available; progress and lab states cannot be persisted locally.');
  }

  return {
    webAssembly: hasWasm,
    webWorkers: hasWorkers,
    sharedArrayBuffer: hasSAB,
    crossOriginIsolated: hasCOI,
    indexedDB: hasIDB,
    isFullySupported: blocking.length === 0,
    blockingFailures: blocking,
    warnings,
  };
}
