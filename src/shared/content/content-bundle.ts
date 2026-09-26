/// <reference types="vite/client" />
/**
 * Content Bundle Provider for Browser Runtime
 * Loads declarative curriculum, fixtures, and concepts via Vite static import.meta.glob
 */

import { ContentLoader } from '../../infrastructure/content/ContentLoader';
import { PackRegistry } from '../../infrastructure/content/PackRegistry';

// Glob all YAML files from the content/ directory at build/runtime
const yamlFiles = (
  import.meta as unknown as {
    glob: (pattern: string, options: Record<string, unknown>) => Record<string, string>;
  }
).glob('/content/**/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

let cachedRegistry: PackRegistry | null = null;

export function getPackRegistry(): PackRegistry {
  if (cachedRegistry) {
    return cachedRegistry;
  }

  const registry = new PackRegistry();

  // 1. Packs
  for (const [filePath, rawContent] of Object.entries(yamlFiles)) {
    if (filePath.endsWith('/pack.yaml')) {
      try {
        const pack = ContentLoader.loadPack(rawContent, filePath);
        registry.registerPack(pack);
      } catch (err) {
        console.error(`[ContentBundle] Failed to load pack from ${filePath}`, err);
      }
    }
  }

  // 2. Fixtures
  for (const [filePath, rawContent] of Object.entries(yamlFiles)) {
    if (filePath.includes('/fixtures/')) {
      try {
        const fixture = ContentLoader.loadFixture(rawContent, filePath);
        registry.registerFixture(fixture);
      } catch (err) {
        console.error(`[ContentBundle] Failed to load fixture from ${filePath}`, err);
      }
    }
  }

  // 3. Labs
  for (const [filePath, rawContent] of Object.entries(yamlFiles)) {
    if (filePath.includes('/labs/')) {
      try {
        const lab = ContentLoader.loadLab(rawContent, filePath);
        registry.registerLab(lab);
      } catch (err) {
        console.error(`[ContentBundle] Failed to load lab from ${filePath}`, err);
      }
    }
  }

  // 4. Concepts
  for (const [filePath, rawContent] of Object.entries(yamlFiles)) {
    if (filePath.includes('/concepts/')) {
      try {
        const concept = ContentLoader.loadConcept(rawContent, filePath);
        registry.registerConcept(concept);
      } catch (err) {
        console.error(`[ContentBundle] Failed to load concept from ${filePath}`, err);
      }
    }
  }

  cachedRegistry = registry;
  return registry;
}
