/**
 * Worker Protocol Definitions for SHELLGROUND Runtime
 * Specified according to Section 17 of FULL_ARCHITECTURE.md
 */

export * from './worker-messages';

export interface WorkerRequestEnvelope<T = unknown> {
  readonly id: string;
  readonly type: string;
  readonly payload: T;
}

export interface WorkerResponseEnvelope<T = unknown> {
  readonly requestId?: string;
  readonly type: string;
  readonly payload?: T;
  readonly error?: import('./worker-messages').RuntimeErrorDTO;
}
