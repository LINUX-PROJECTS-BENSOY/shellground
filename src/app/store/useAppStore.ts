/**
 * Global Application State Store (Zustand)
 * Coordinates active view, selected lab, services, and progress state
 */

import { create } from 'zustand';
import type { LabDefinition, PackDefinition, ConceptDefinition } from '../../domain/content/schemas';
import type { RepositoryBundle } from '../../infrastructure/persistence/StorageFactory';
import { createRepositories } from '../../infrastructure/persistence/StorageFactory';
import { PackRegistry } from '../../infrastructure/content/PackRegistry';
import { getPackRegistry } from '../../shared/content/content-bundle';
import { MasteryService } from '../../application/mastery/MasteryService';
import { RecommendationService } from '../../application/recommendations/RecommendationService';
import { FidelityTelemetryService } from '../../application/diagnostics/FidelityTelemetryService';
import { ProgressService } from '../../application/progress/ProgressService';
import { BackupService } from '../../infrastructure/persistence/backup/BackupService';
import type { LabProgressRecord, ConceptMasteryRecord } from '../../domain/persistence/models';

export type AppView =
  | 'dashboard'
  | 'catalog'
  | 'training'
  | 'playground'
  | 'mastery'
  | 'diagnostics'
  | 'settings';

export interface AppStoreState {
  currentView: AppView;
  activePackId: string;
  activeLabId: string | null;
  isSidebarCollapsed: boolean;
  isInitialized: boolean;

  // Repositories & Services
  repositories: RepositoryBundle | null;
  registry: PackRegistry;
  masteryService: MasteryService | null;
  recommendationService: RecommendationService | null;
  telemetryService: FidelityTelemetryService | null;
  progressService: ProgressService | null;
  backupService: BackupService | null;

  // Cached state for fast UI rendering
  completedLabIds: Set<string>;
  allProgress: LabProgressRecord[];
  allMastery: ConceptMasteryRecord[];

  // Actions
  init: () => Promise<void>;
  setCurrentView: (view: AppView) => void;
  selectLab: (labId: string, packId?: string) => void;
  toggleSidebar: () => void;
  refreshProgress: () => Promise<void>;
  getActiveLab: () => LabDefinition | undefined;
  getActivePack: () => PackDefinition | undefined;
  getLabConcepts: (lab: LabDefinition) => ConceptDefinition[];
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  currentView: 'dashboard',
  activePackId: 'linux-foundations',
  activeLabId: '001-where-am-i',
  isSidebarCollapsed: false,
  isInitialized: false,

  repositories: null,
  registry: getPackRegistry(),
  masteryService: null,
  recommendationService: null,
  telemetryService: null,
  progressService: null,
  backupService: null,

  completedLabIds: new Set<string>(),
  allProgress: [],
  allMastery: [],

  init: async () => {
    if (get().isInitialized) return;

    const registry = getPackRegistry();
    const repos = await createRepositories();
    const labs = registry.listLabs('linux-foundations');

    const masteryService = new MasteryService(repos.conceptMastery);
    const recommendationService = new RecommendationService(repos.labProgress, repos.conceptMastery, labs);
    const telemetryService = new FidelityTelemetryService(repos.commandHistory);
    const progressService = new ProgressService(repos.labProgress, repos.commandHistory, repos.conceptMastery);
    const backupService = repos.database ? new BackupService(repos.database) : null;

    // Load initial progress
    const progressList = await repos.labProgress.getAll();
    const masteryList = await repos.conceptMastery.getAll();
    const completed = new Set(
      progressList.filter((p) => p.status === 'completed').map((p) => p.labId)
    );

    set({
      repositories: repos,
      registry,
      masteryService,
      recommendationService,
      telemetryService,
      progressService,
      backupService,
      isInitialized: true,
      allProgress: progressList,
      allMastery: masteryList,
      completedLabIds: completed,
    });
  },

  setCurrentView: (view: AppView) => set({ currentView: view }),

  selectLab: (labId: string, packId = 'linux-foundations') => {
    set({
      activeLabId: labId,
      activePackId: packId,
      currentView: 'training',
    });
  },

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  refreshProgress: async () => {
    const { repositories, registry } = get();
    if (!repositories) return;

    const progressList = await repositories.labProgress.getAll();
    const masteryList = await repositories.conceptMastery.getAll();
    const completed = new Set(
      progressList.filter((p) => p.status === 'completed').map((p) => p.labId)
    );

    const labs = registry.listLabs(get().activePackId);
    const recommendationService = new RecommendationService(
      repositories.labProgress,
      repositories.conceptMastery,
      labs
    );

    set({
      allProgress: progressList,
      allMastery: masteryList,
      completedLabIds: completed,
      recommendationService,
    });
  },

  getActiveLab: () => {
    const { registry, activePackId, activeLabId } = get();
    if (!activeLabId) return undefined;
    return registry.getLab(activePackId, activeLabId);
  },

  getActivePack: () => {
    const { registry, activePackId } = get();
    return registry.getPack(activePackId);
  },

  getLabConcepts: (lab: LabDefinition) => {
    const { registry } = get();
    return (lab.concepts ?? [])
      .map((conceptId) => registry.getConcept(conceptId))
      .filter((c): c is ConceptDefinition => c !== undefined);
  },
}));
