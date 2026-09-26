import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Terminal,
  Play,
  Award,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  WifiOff,
  ExternalLink,
} from 'lucide-react';
import { useAppStore, type AppView } from '../../app/store/useAppStore';
import { APP_CONFIG } from '../../app/config/app-config';
import { Badge } from './Badge';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentView,
    setCurrentView,
    isSidebarCollapsed,
    toggleSidebar,
    getActiveLab,
    completedLabIds,
    registry,
  } = useAppStore();

  const activeLab = getActiveLab();
  const totalLabs = registry.listLabs('linux-foundations').length || 20;
  const completedCount = completedLabIds.size;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'catalog', label: 'Lab Catalog', icon: <BookOpen size={18} /> },
    { id: 'training', label: 'Training Range', icon: <Terminal size={18} /> },
    { id: 'playground', label: 'Playground', icon: <Play size={18} /> },
    { id: 'mastery', label: 'Concept Mastery', icon: <Award size={18} /> },
    { id: 'diagnostics', label: 'Diagnostics', icon: <Activity size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Application Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '48px',
          backgroundColor: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border-default)',
          userSelect: 'none',
          zIndex: 10,
        }}
      >
        {/* Brand & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              fontWeight: 700,
              fontSize: '15px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.5px',
              cursor: 'pointer',
            }}
          >
            <span>&gt;_</span>
            <span>{APP_CONFIG.appName}</span>
          </button>

          <span style={{ color: 'var(--color-border-default)' }}>|</span>

          {currentView === 'training' && activeLab ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Linux Foundations</span>
              <span style={{ color: 'var(--color-text-muted)' }}>/</span>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{activeLab.title}</span>
            </div>
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
              {currentView}
            </span>
          )}
        </div>

        {/* Global Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            <span>Progress:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)', fontWeight: 600 }}>
              {completedCount}/{totalLabs}
            </span>
          </div>

          <Badge variant="isolated" icon={<WifiOff size={12} />} title="Zero external network egress permitted in sandbox">
            Network: Disabled
          </Badge>

          <Badge variant="ready" icon={<ShieldCheck size={12} />} title="WASIX client-side WebAssembly isolation">
            Sandbox: WASIX
          </Badge>

          <a
            href={APP_CONFIG.docsUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              marginLeft: '4px',
            }}
          >
            <span>Docs</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* Workspace Body: Sidebar + Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Navigation Sidebar */}
        <aside
          style={{
            width: isSidebarCollapsed ? '56px' : '220px',
            backgroundColor: 'var(--color-bg-canvas)',
            borderRight: '1px solid var(--color-border-default)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.2s ease',
            zIndex: 5,
          }}
        >
          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 8px', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: isSidebarCollapsed ? '8px 10px' : '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-border-default)' : 'transparent',
                    backgroundColor: isActive ? 'var(--color-bg-panel)' : 'transparent',
                    color: isActive ? 'var(--color-text-heading)' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '13px',
                    textAlign: 'left',
                    width: '100%',
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'var(--color-accent)' : 'inherit' }}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Collapse Footer */}
          <div
            style={{
              padding: '8px',
              borderTop: '1px solid var(--color-border-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            }}
          >
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                v{APP_CONFIG.appVersion}
              </span>
            )}
            <button
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
