/**
 * DexieConceptMasteryRepository - IndexedDB Implementation of ConceptMasteryRepository
 */

import type { ShellgroundDatabase } from '../../ShellgroundDatabase';
import type { ConceptMasteryRepository } from '@domain/persistence';
import type { ConceptMasteryRecord } from '@domain/persistence';

export class DexieConceptMasteryRepository implements ConceptMasteryRepository {
  constructor(private readonly db: ShellgroundDatabase) {}

  public async get(conceptId: string): Promise<ConceptMasteryRecord | undefined> {
    return this.db.conceptMastery.get(conceptId);
  }

  public async getAll(): Promise<ConceptMasteryRecord[]> {
    return this.db.conceptMastery.toArray();
  }

  public async save(record: ConceptMasteryRecord): Promise<void> {
    await this.db.conceptMastery.put(record);
  }
}
