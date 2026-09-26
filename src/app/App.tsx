import React, { useEffect, useState } from 'react';
import { detectBrowserCapabilities, type RuntimeCapabilityReport } from '../domain/runtime/RuntimeCapability';
import { useAppStore } from './store/useAppStore';
import { AppShell } from '../shared/components/AppShell';
import { DashboardView } from '../features/dashboard/DashboardView';
import { LabCatalogView } from '../features/labs/LabCatalogView';
import { TrainingWorkspace } from '../features/training/TrainingWorkspace';
import { PlaygroundView } from '../features/playground/PlaygroundView';
import { MasteryView } from '../features/mastery/MasteryView';
import { DiagnosticsView } from '../features/diagnostics/DiagnosticsView';
import { SettingsView } from '../features/settings/SettingsView';

export const App: React.FC = () => {
  const { currentView, init, isInitialized } = useAppStore();
  const [capabilities, setCapabilities] = useState<RuntimeCapabilityReport | null>(null);

  useEffect(() => {
    setCapabilities(detectBrowserCapabilities());
    init();
  }, [init]);

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'catalog':
        return <LabCatalogView />;
      case 'training':
        return <TrainingWorkspace />;
      case 'playground':
        return <PlaygroundView />;
      case 'mastery':
        return <MasteryView />;
      case 'diagnostics':
        return <DiagnosticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AppShell>
      {/* Capability Warning Banner if any */}
      {capabilities && !capabilities.isFullySupported && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(248, 81, 73, 0.15)',
            borderBottom: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            fontSize: '13px',
          }}
        >
          <strong>Browser Compatibility Warning:</strong>
          <ul style={{ margin: '4px 0 0 20px' }}>
            {capabilities.blockingFailures.map((failure, idx) => (
              <li key={idx}>{failure}</li>
            ))}
          </ul>
        </div>
      )}

      {isInitialized ? (
        renderActiveView()
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Initializing SHELLGROUND sandbox & local database...
        </div>
      )}
    </AppShell>
  );
};
