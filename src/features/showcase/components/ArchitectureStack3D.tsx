import React, { useState, useRef } from 'react';
import { Layers, Maximize2, Minimize2, Cpu, ShieldCheck, Terminal, FolderTree, Zap, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface ArchLayer {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  icon: typeof Cpu;
  color: string;
  tech: string[];
  specs: { label: string; value: string }[];
  description: string;
}

const ARCH_LAYERS: ArchLayer[] = [
  {
    id: 'layer-ui',
    level: 5,
    title: 'WebGL GPU Terminal & Reactive UI',
    subtitle: 'Userland Presentation & Touch Controls',
    icon: Terminal,
    color: '#38bdf8',
    tech: ['Xterm.js 5.5', 'WebGL Addon', 'React 19', 'Zustand 5', 'Mobile Touchbar'],
    specs: [
      { label: 'Render Latency', value: '<2.1ms' },
      { label: 'Framerate', value: '60 FPS WebGL' },
      { label: 'Color Depth', value: 'Truecolor 24-bit' },
    ],
    description: 'Hardware-accelerated terminal canvas rendering with mobile touch accessory bar for rapid command execution.',
  },
  {
    id: 'layer-shell',
    level: 4,
    title: 'POSIX Coreutils & Shell Engine',
    subtitle: 'Command Parsing & Pipeline Routing',
    icon: Zap,
    color: '#34d399',
    tech: ['GNU Coreutils', 'bash / sh', 'awk / sed', 'grep / find', 'Pipeline Multiplexer'],
    specs: [
      { label: 'Built-in Utilities', value: '80+ Binaries' },
      { label: 'Pipe Throughput', value: '250 MB/s' },
      { label: 'Exit Code Trap', value: 'Deterministic' },
    ],
    description: 'Full POSIX command pipeline support with standard error redirection (2>), subshells, and exit code trapping.',
  },
  {
    id: 'layer-syscalls',
    level: 3,
    title: 'Syscall Interceptor & Signal Dispatcher',
    subtitle: 'Kernel ABI Emulation & Event Trapping',
    icon: Layers,
    color: '#c084fc',
    tech: ['WASIX ABI', 'POSIX Signals', 'epoll / poll', 'fork / execve', 'dup2 I/O Routing'],
    specs: [
      { label: 'Syscall Intercept', value: '0.04ms' },
      { label: 'Signal Handling', value: 'SIGINT / SIGKILL' },
      { label: 'Virtual PTYs', value: 'Multi-Channel' },
    ],
    description: 'Intercepts system calls in user space, routing hardware key combinations (Ctrl+C, Ctrl+D) to virtual process jobs.',
  },
  {
    id: 'layer-vfs',
    level: 2,
    title: 'Virtual In-Memory Filesystem (VFS)',
    subtitle: 'Deterministic Inodes & Live Diff Engine',
    icon: FolderTree,
    color: '#f59e0b',
    tech: ['Hierarchical Inodes', 'Mode 0755 Auth', 'Synthetic /proc', 'Diff Observer', 'Dexie IndexedDB'],
    specs: [
      { label: 'Inode Capacity', value: '16,384 Inodes' },
      { label: 'Snapshot Latency', value: '<4.5ms' },
      { label: 'State Persistence', value: 'IndexedDB Indexed' },
    ],
    description: 'Live spatial directory tree observing file creations, mutations (+NEW, ~MOD, -DEL), and permission flags in real time.',
  },
  {
    id: 'layer-wasm',
    level: 1,
    title: 'Sandboxed WASIX Microkernel',
    subtitle: 'Hardware WebAssembly Security Boundary',
    icon: ShieldCheck,
    color: '#ef4444',
    tech: ['WebAssembly WASIX', 'Linear 64MB Heap', 'Zero Egress Sandbox', 'Fast Reset <12ms'],
    specs: [
      { label: 'Network Egress', value: '0.00 KB (Air-Gapped)' },
      { label: 'Boot Time', value: '12ms Cold Start' },
      { label: 'Host Access', value: 'Completely Isolated' },
    ],
    description: 'Runs entirely within the browser client memory. Never makes server calls, ensuring total security and privacy.',
  },
];

interface ArchitectureStack3DProps {
  themeColor?: string;
}

export const ArchitectureStack3D: React.FC<ArchitectureStack3DProps> = ({ themeColor = '#00f0ff' }) => {
  const [exploded, setExploded] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<ArchLayer>(ARCH_LAYERS[0]!);
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  // 3D rotation angles
  const [rotX, setRotX] = useState(65);
  const [rotZ, setRotZ] = useState(-30);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 65, rotZ: -30 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotZ,
    };
    soundFx.playHover();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Pitch: clamp between 20deg and 80deg
    const nextRotX = Math.max(25, Math.min(80, dragStart.current.rotX + dy * 0.3));
    // Yaw: rotate around Z axis
    const nextRotZ = dragStart.current.rotZ + dx * 0.4;

    setRotX(nextRotX);
    setRotZ(nextRotZ);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const toggleExploded = () => {
    soundFx.playLaser();
    setExploded((prev) => !prev);
  };

  const resetView = () => {
    soundFx.playSnap();
    setRotX(65);
    setRotZ(-30);
    setExploded(false);
  };

  return (
    <div
      className="interactive-spotlight-card"
      style={{
        position: 'relative',
        borderRadius: '16px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: `${themeColor}22`,
              border: `1px solid ${themeColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={20} color={themeColor} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--color-text-heading)' }}>
              Interactive 3D Exploded-Stack Architecture Deck
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              Drag to orbit in 3D • Click layers to inspect deep subsystem telemetry
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleExploded}
            className={`cyber-control-pill ${exploded ? 'is-active' : ''}`}
            title="Expand layers vertically in 3D space"
          >
            {exploded ? <Minimize2 size={13} color={themeColor} /> : <Maximize2 size={13} />}
            <span>{exploded ? 'Collapse Stack' : 'Explode Stack (3D)'}</span>
          </button>

          <button
            onClick={resetView}
            className="cyber-control-pill"
            title="Reset 3D perspective"
          >
            <RotateCcw size={13} />
            <span>Reset Isometric</span>
          </button>
        </div>
      </div>

      {/* Main Split: 3D Isometric Viewport (Left/Top) & Spec Inspector (Right/Bottom) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* 3D Viewport Box */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            height: '420px',
            position: 'relative',
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
            backgroundColor: 'rgba(5, 8, 14, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging.current ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          {/* Laser alignment grid in background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(circle, ${themeColor}15 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          />

          {/* Drag Hint */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '14px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={11} color={themeColor} />
            <span>Drag stack to rotate • Angle: X:{Math.round(rotX)}° Z:{Math.round(rotZ)}°</span>
          </div>

          {/* 3D Rotational Stage */}
          <div
            style={{
              width: '280px',
              height: '240px',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
              transition: isDragging.current ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Center Laser Beam in Exploded Mode */}
            {exploded && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '2px',
                  height: '400px',
                  backgroundColor: themeColor,
                  boxShadow: `0 0 16px ${themeColor}, 0 0 32px ${themeColor}`,
                  transform: 'translate(-50%, -50%) rotateX(-90deg)',
                  transformStyle: 'preserve-3d',
                  pointerEvents: 'none',
                  opacity: 0.7,
                }}
              />
            )}

            {/* Slabs rendered from bottom (Layer 1) to top (Layer 5) */}
            {ARCH_LAYERS.slice().reverse().map((layer, index) => {
              const isSelected = selectedLayer.id === layer.id;
              const isHovered = hoveredLayer === layer.id;
              const LayerIcon = layer.icon;

              // Z offset: collapsed = index * 32px; exploded = index * 75px
              const spacing = exploded ? 78 : 34;
              const zOffset = (index - 2) * spacing + (isHovered ? 15 : 0);

              return (
                <div
                  key={layer.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playLaser();
                    setSelectedLayer(layer);
                  }}
                  onMouseEnter={() => {
                    setHoveredLayer(layer.id);
                    soundFx.playHover();
                  }}
                  onMouseLeave={() => setHoveredLayer(null)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: `translateZ(${zOffset}px)`,
                    transformStyle: 'preserve-3d',
                    backgroundColor: isSelected
                      ? 'rgba(25, 35, 52, 0.88)'
                      : isHovered
                      ? 'rgba(20, 26, 38, 0.85)'
                      : 'rgba(13, 17, 24, 0.78)',
                    backdropFilter: 'blur(10px)',
                    border: `1.5px solid ${isSelected ? layer.color : isHovered ? '#ffffff' : `${layer.color}66`}`,
                    borderRadius: '16px',
                    boxShadow: isSelected
                      ? `0 0 30px ${layer.color}88, inset 0 0 20px ${layer.color}44`
                      : `0 10px 25px rgba(0, 0, 0, 0.5), inset 0 0 15px ${layer.color}15`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: isDragging.current ? 'none' : 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Top Bar of Slab */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          backgroundColor: `${layer.color}22`,
                          border: `1px solid ${layer.color}55`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LayerIcon size={14} color={layer.color} />
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: layer.color,
                        }}
                      >
                        L{layer.level} • {layer.id.replace('layer-', '').toUpperCase()}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: isSelected ? layer.color : 'rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#000000' : 'var(--color-text-muted)',
                        fontWeight: isSelected ? 800 : 500,
                      }}
                    >
                      {isSelected ? 'ACTIVE' : 'SELECT'}
                    </span>
                  </div>

                  {/* Center Title */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                      {layer.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {layer.subtitle}
                    </div>
                  </div>

                  {/* Bottom Tech Pills */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {layer.tech.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '9px',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Layer Holographic Spec Card */}
        <div
          style={{
            padding: '24px',
            borderRadius: '12px',
            backgroundColor: 'rgba(13, 17, 23, 0.85)',
            border: `1px solid ${selectedLayer.color}44`,
            boxShadow: `0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${selectedLayer.color}15`,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: `${selectedLayer.color}22`,
                  border: `1px solid ${selectedLayer.color}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.createElement(selectedLayer.icon, { size: 18, color: selectedLayer.color })}
              </div>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: selectedLayer.color,
                    fontWeight: 700,
                  }}
                >
                  LAYER 0{selectedLayer.level} ARCHITECTURE SPEC
                </span>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {selectedLayer.title}
                </h4>
              </div>
            </div>

            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-success)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              100% OPERATIONAL
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {selectedLayer.description}
          </p>

          {/* Live Telemetry Specs Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              backgroundColor: 'rgba(5, 8, 14, 0.6)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {selectedLayer.specs.map((spec, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {spec.label}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: selectedLayer.color,
                    fontFamily: 'var(--font-mono)',
                    marginTop: '2px',
                  }}
                >
                  {spec.value}
                </div>
              </div>
            ))}
          </div>

          {/* Integrated Tech Stack */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                marginBottom: '8px',
              }}
            >
              INTEGRATED SUBSYSTEM TECHNOLOGIES:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {selectedLayer.tech.map((t, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
