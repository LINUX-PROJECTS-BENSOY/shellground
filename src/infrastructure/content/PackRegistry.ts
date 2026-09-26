/**
 * PackRegistry - In-memory Registry and Resolver for Packs, Labs, and Fixtures
 * Specified in Sub-Phases 4.3 & 4.4 of Issue #10
 */

import type {
  PackDefinition,
  LabDefinition,
  FixtureDefinition,
  ConceptDefinition,
} from '../../domain/content/schemas';

export interface IntegrityCheckResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export class PackRegistry {
  private packs = new Map<string, PackDefinition>();
  private labs = new Map<string, LabDefinition>(); // keyed by `${packId}:${labId}`
  private fixtures = new Map<string, FixtureDefinition>();
  private concepts = new Map<string, ConceptDefinition>();

  public registerPack(pack: PackDefinition): void {
    this.packs.set(pack.id, pack);
  }

  public registerLab(lab: LabDefinition): void {
    const key = `${lab.packId}:${lab.id}`;
    this.labs.set(key, lab);
  }

  public registerFixture(fixture: FixtureDefinition): void {
    this.fixtures.set(fixture.id, fixture);
  }

  public registerConcept(concept: ConceptDefinition): void {
    this.concepts.set(concept.id, concept);
  }

  public getConcept(conceptId: string): ConceptDefinition | undefined {
    return this.concepts.get(conceptId);
  }

  public listConcepts(): ConceptDefinition[] {
    return Array.from(this.concepts.values());
  }

  public getPack(packId: string): PackDefinition | undefined {
    return this.packs.get(packId);
  }

  public getLab(packId: string, labId: string): LabDefinition | undefined {
    return this.labs.get(`${packId}:${labId}`);
  }

  public getFixture(fixtureId: string): FixtureDefinition | undefined {
    return this.fixtures.get(fixtureId);
  }

  public listPacks(): PackDefinition[] {
    return Array.from(this.packs.values());
  }

  public listLabs(packId: string): LabDefinition[] {
    const pack = this.packs.get(packId);
    if (!pack) return [];

    const result: LabDefinition[] = [];
    for (const labId of pack.labs) {
      const lab = this.getLab(packId, labId);
      if (lab) {
        result.push(lab);
      }
    }
    return result;
  }

  public getLabOrder(packId: string): string[] {
    const pack = this.packs.get(packId);
    return pack ? [...pack.labs] : [];
  }

  public getNextLab(packId: string, currentLabId: string): LabDefinition | undefined {
    const order = this.getLabOrder(packId);
    const currentIndex = order.indexOf(currentLabId);
    if (currentIndex === -1 || currentIndex >= order.length - 1) {
      return undefined;
    }
    const nextLabId = order[currentIndex + 1];
    return nextLabId ? this.getLab(packId, nextLabId) : undefined;
  }

  public getPreviousLab(packId: string, currentLabId: string): LabDefinition | undefined {
    const order = this.getLabOrder(packId);
    const currentIndex = order.indexOf(currentLabId);
    if (currentIndex <= 0) {
      return undefined;
    }
    const prevLabId = order[currentIndex - 1];
    return prevLabId ? this.getLab(packId, prevLabId) : undefined;
  }

  /**
   * Builds hydrated virtual filesystem map from a FixtureDefinition
   * Ready to pass directly to ShellRuntime.reset(files)
   */
  public buildFixtureFiles(
    fixture: FixtureDefinition,
    assetResolver?: (assetPath: string) => string
  ): Record<string, string> {
    const files: Record<string, string> = {};

    if (fixture.files) {
      for (const f of fixture.files) {
        if (f.source.type === 'inline') {
          files[f.path] = f.source.content;
        } else if (f.source.type === 'asset' && assetResolver) {
          files[f.path] = assetResolver(f.source.path);
        }
      }
    }

    return files;
  }

  /**
   * Validates cross-reference integrity across registered packs, labs, and fixtures
   */
  public validateIntegrity(): IntegrityCheckResult {
    const errors: string[] = [];

    for (const [packId, pack] of this.packs.entries()) {
      for (const labId of pack.labs) {
        const lab = this.getLab(packId, labId);
        if (!lab) {
          errors.push(`Pack "${packId}" references missing lab "${labId}"`);
        } else {
          // Verify lab fixture reference
          const fixture = this.getFixture(lab.fixture.id);
          if (!fixture) {
            errors.push(
              `Lab "${lab.id}" in pack "${packId}" references missing fixture "${lab.fixture.id}"`
            );
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public clear(): void {
    this.packs.clear();
    this.labs.clear();
    this.fixtures.clear();
    this.concepts.clear();
  }
}
