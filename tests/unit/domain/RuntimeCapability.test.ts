import { describe, it, expect } from 'vitest';
import { detectBrowserCapabilities } from '@domain/runtime/RuntimeCapability';

describe('detectBrowserCapabilities', () => {
  it('detects capability availability in environment', () => {
    const report = detectBrowserCapabilities();
    expect(report).toBeDefined();
    expect(typeof report.webAssembly).toBe('boolean');
    expect(typeof report.webWorkers).toBe('boolean');
    expect(typeof report.sharedArrayBuffer).toBe('boolean');
    expect(typeof report.crossOriginIsolated).toBe('boolean');
    expect(typeof report.indexedDB).toBe('boolean');
    expect(Array.isArray(report.blockingFailures)).toBe(true);
    expect(Array.isArray(report.warnings)).toBe(true);
  });
});
