import React, { useState } from 'react';
import {
  Sparkles,
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
  Menu,
  X,
} from 'lucide-react';
import { useAppStore, type AppView } from '../../app/store/useAppStore';
import { APP_CONFIG } from '../../app/config/app-config';
import { Badge } from './Badge';
import { useIsMobile } from '../hooks/useMediaQuery';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentView,
    setCurrentView,
    switchToMainTab,
    switchToAppTab,
    isSidebarCollapsed,
    toggleSidebar,
    getActiveLab,
    completedLabIds,
    registry,
  } = useAppStore();

  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMainTab = currentView === 'welcome';
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Application Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 10px' : '0 16px',
          height: '52px',
          backgroundColor: 'var(--color-bg-subtle)',
          borderBottom: '1px solid var(--color-border-default)',
          userSelect: 'none',
          zIndex: 10,
          gap: isMobile ? '8px' : '16px',
        }}
      >
        {/* Left: Brand & Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '14px', flexShrink: 0 }}>
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-primary)',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Menu size={20} />
            </button>
          )}

          <button
            onClick={switchToMainTab}
            title="Return to Main Showcase Tab"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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

          {!isMobile && !isMainTab && (
            <>
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
            </>
          )}
        </div>

        {/* Center: Top-Level Tab Bar (Separates Main Showcase from Web App) */}
        <nav
          role="tablist"
          aria-label="Top-Level Application Tabs"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(10, 14, 23, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '3px',
            borderRadius: '10px',
            gap: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Tab 1: Main / Showcase Tab */}
          <button
            role="tab"
            aria-selected={isMainTab}
            data-testid="tab-main"
            onClick={switchToMainTab}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '5px' : '8px',
              padding: isMobile ? '5px 10px' : '6px 16px',
              borderRadius: '7px',
              border: isMainTab ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid transparent',
              backgroundColor: isMainTab ? 'rgba(0, 240, 255, 0.14)' : 'transparent',
              color: isMainTab ? '#00f0ff' : 'var(--color-text-secondary)',
              fontWeight: isMainTab ? 600 : 500,
              fontSize: isMobile ? '12px' : '13px',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: isMainTab ? '0 0 14px rgba(0, 240, 255, 0.22)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={isMobile ? 13 : 15} />
            <span>{isMobile ? 'Main' : 'Main / Showcase'}</span>
            {isMainTab && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#00f0ff',
                  boxShadow: '0 0 6px #00f0ff',
                }}
              />
            )}
          </button>

          {/* Tab 2: ShellGround Web App Tab */}
          <button
            role="tab"
            aria-selected={!isMainTab}
            data-testid="tab-app"
            onClick={switchToAppTab}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '5px' : '8px',
              padding: isMobile ? '5px 10px' : '6px 16px',
              borderRadius: '7px',
              border: !isMainTab ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
              backgroundColor: !isMainTab ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
              color: !isMainTab ? '#60a5fa' : 'var(--color-text-secondary)',
              fontWeight: !isMainTab ? 600 : 500,
              fontSize: isMobile ? '12px' : '13px',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: !isMainTab ? '0 0 14px rgba(59, 130, 246, 0.22)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <Terminal size={isMobile ? 13 : 15} />
            <span>{isMobile ? 'Web App' : 'ShellGround Web App'}</span>
            {!isMainTab && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  boxShadow: '0 0 6px #3b82f6',
                }}
              />
            )}
          </button>
        </nav>

        {/* Right: Badges & Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px', flexShrink: 0 }}>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <span>Progress:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)', fontWeight: 600 }}>
                {completedCount}/{totalLabs}
              </span>
            </div>
          )}

          {!isMobile && (
            <Badge variant="isolated" icon={<WifiOff size={12} />} title="Zero external network egress permitted in sandbox">
              Network: Disabled
            </Badge>
          )}

          <Badge variant="ready" icon={<ShieldCheck size={12} />} title="WASIX client-side WebAssembly isolation">
            {isMobile ? 'WASIX' : 'Sandbox: WASIX'}
          </Badge>

          {!isMobile && (
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
          )}
        </div>
      </header>

      {/* Workspace Body: Sidebar + Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Desktop Navigation Sidebar (shown only when in Web App mode) */}
        {!isMobile && !isMainTab && (
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
                    data-testid={`nav-${item.id}`}
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
        )}

        {/* Mobile Slide-in Navigation Drawer */}
        {isMobile && mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
            }}
          >
            {/* Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(3px)',
              }}
            />

            {/* Drawer Panel */}
            <div
              style={{
                position: 'relative',
                width: '280px',
                maxWidth: '85vw',
                height: '100%',
                backgroundColor: 'var(--color-bg-canvas)',
                borderRight: '1px solid var(--color-border-default)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 101,
                boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  <span>&gt;_</span>
                  <span>{APP_CONFIG.appName}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
                {/* Main Showcase Tab Item */}
                <button
                  data-testid="mobile-nav-main"
                  onClick={() => {
                    switchToMainTab();
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isMainTab ? 'rgba(0, 240, 255, 0.45)' : 'transparent',
                    backgroundColor: isMainTab ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                    color: isMainTab ? '#00f0ff' : 'var(--color-text-secondary)',
                    fontWeight: isMainTab ? 600 : 500,
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isMainTab ? '0 0 10px rgba(0, 240, 255, 0.15)' : 'none',
                    marginBottom: '4px',
                  }}
                >
                  <Sparkles size={18} color={isMainTab ? '#00f0ff' : undefined} />
                  <span>Main / Showcase Tab</span>
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--color-border-muted)', margin: '4px 0 8px' }} />

                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-text-muted)', padding: '0 8px 4px', fontWeight: 600 }}>
                  Web App Workspaces
                </div>

                {navItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      data-testid={`mobile-nav-${item.id}`}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: isActive ? 'var(--color-border-default)' : 'transparent',
                        backgroundColor: isActive ? 'var(--color-bg-panel)' : 'transparent',
                        color: isActive ? 'var(--color-text-heading)' : 'var(--color-text-secondary)',
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'var(--color-accent)' : 'inherit' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div style={{ padding: '16px', borderTop: '1px solid var(--color-border-default)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Progress</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)', fontWeight: 600 }}>
                    {completedCount}/{totalLabs} labs
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  <span>Sandbox: WASIX Isolated</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>v{APP_CONFIG.appVersion}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

