import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, RotateCcw, Eye, Orbit, Zap } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface SubsystemNode {
  id: string;
  name: string;
  category: string;
  lat: number; // -90 to 90
  lon: number; // -180 to 180
  status: string;
  metric: string;
  description: string;
}

const SUBSYSTEM_NODES: SubsystemNode[] = [
  {
    id: 'wasix-core',
    name: 'WASIX Core Kernel',
    category: 'RUNTIME',
    lat: 0,
    lon: 0,
    status: 'ONLINE',
    metric: '12ms Spinup',
    description: 'Deterministic sandboxed WebAssembly execution environment.',
  },
  {
    id: 'vfs-inode',
    name: 'Virtual Inode Tree',
    category: 'STORAGE',
    lat: 35,
    lon: 45,
    status: 'OPTIMAL',
    metric: '2,048 Inodes',
    description: 'Spatial in-memory virtual filesystem with live diffing.',
  },
  {
    id: 'syscall-interceptor',
    name: 'Syscall Dispatcher',
    category: 'KERNEL',
    lat: -30,
    lon: 60,
    status: 'FILTERING',
    metric: '0.04ms Latency',
    description: 'Intercepts open, read, write, stat, fork, and execve.',
  },
  {
    id: 'pty-webgl',
    name: 'WebGL Terminal PTY',
    category: 'DISPLAY',
    lat: 50,
    lon: -60,
    status: 'ACCELERATED',
    metric: '60 FPS Canvas',
    description: 'GPU-accelerated VT100 terminal emulation via xterm.js.',
  },
  {
    id: 'process-table',
    name: 'Process Scheduler',
    category: 'SCHEDULING',
    lat: -45,
    lon: -40,
    status: 'ISOLATED',
    metric: 'PID 1 Root',
    description: 'Single-tenant virtual thread control and job tracking.',
  },
  {
    id: 'posix-signals',
    name: 'POSIX Signal Matrix',
    category: 'SIGNALS',
    lat: 20,
    lon: 130,
    status: 'TRAPPING',
    metric: 'SIGINT / SIGTERM',
    description: 'Hardware key interception for Ctrl+C, Ctrl+D, and signals.',
  },
  {
    id: 'airgap-wall',
    name: 'Air-Gap Isolation Wall',
    category: 'SECURITY',
    lat: -25,
    lon: -140,
    status: 'LOCKED',
    metric: '0 Byte Egress',
    description: 'Strict browser-level sandbox forbidding outbound telemetry.',
  },
  {
    id: 'indexeddb-dexie',
    name: 'Dexie Storage Engine',
    category: 'PERSISTENCE',
    lat: 65,
    lon: 160,
    status: 'INDEXED',
    metric: 'Local-First',
    description: 'High-speed browser database for lab scores and mastery.',
  },
  {
    id: 'dev-devices',
    name: 'Virtual Device Bus',
    category: 'I/O',
    lat: -60,
    lon: 110,
    status: 'SYNTHETIC',
    metric: '/dev/null, /dev/zero',
    description: 'Emulated character devices for stdin, stdout, and redirection.',
  },
  {
    id: 'auto-validator',
    name: 'Automated Rule Engine',
    category: 'ASSESSMENT',
    lat: 10,
    lon: -110,
    status: 'READY',
    metric: 'Multi-Rule Hash',
    description: 'Instant SHA256 and AST verification upon lab submission.',
  },
];

interface HoloSphere3DProps {
  themeColor?: string;
}

export const HoloSphere3D: React.FC<HoloSphere3DProps> = ({ themeColor = '#00f0ff' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeNode, setActiveNode] = useState<SubsystemNode | null>(SUBSYSTEM_NODES[0]!);
  const [renderMode, setRenderMode] = useState<'mesh' | 'particles' | 'constellation'>('mesh');
  const [autoRotate, setAutoRotate] = useState(true);

  // Rotation angles in radians
  const rotX = useRef(0.2);
  const rotY = useRef(0);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0.004, y: 0.001 });

  // Hover detection
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = 420 * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const SPHERE_RADIUS = 135;
    const CAMERA_DISTANCE = 320;
    const FOV = 360;

    // Build rings for the sphere mesh
    const latitudeRings = [-60, -30, 0, 30, 60];
    const longitudeRings = [0, 45, 90, 135, 180, 225, 270, 315];

    // Build random 3D surface particles
    const SURFACE_PARTICLES: { lat: number; lon: number; size: number; pulse: number }[] = [];
    for (let i = 0; i < 90; i++) {
      SURFACE_PARTICLES.push({
        lat: (Math.random() - 0.5) * 160,
        lon: (Math.random() - 0.5) * 360,
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const displayWidth = rect?.width || 600;
      const displayHeight = 420;

      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Auto rotation or velocity decay
      if (autoRotate && !isDragging.current) {
        rotY.current += velocity.current.x;
        rotX.current += velocity.current.y * 0.2;
      } else if (!isDragging.current) {
        rotY.current += velocity.current.x;
        rotX.current += velocity.current.y;
        velocity.current.x *= 0.94;
        velocity.current.y *= 0.94;
      }

      // 3D Projection Helper
      const project = (x3d: number, y3d: number, z3d: number) => {
        // Rotate around X
        const cosX = Math.cos(rotX.current);
        const sinX = Math.sin(rotX.current);
        const y1 = y3d * cosX - z3d * sinX;
        const z1 = y3d * sinX + z3d * cosX;

        // Rotate around Y
        const cosY = Math.cos(rotY.current);
        const sinY = Math.sin(rotY.current);
        const x2 = x3d * cosY + z1 * sinY;
        const z2 = -x3d * sinY + z1 * cosY;

        // Perspective
        const scale = FOV / (CAMERA_DISTANCE + z2);
        const x2d = x2 * scale + displayWidth / 2;
        const y2d = y1 * scale + displayHeight / 2;

        return { x: x2d, y: y2d, z: z2, scale };
      };

      // Convert lat/lon to 3D Cartesian
      const latLonTo3D = (latDeg: number, lonDeg: number, radius: number) => {
        const latRad = (latDeg * Math.PI) / 180;
        const lonRad = (lonDeg * Math.PI) / 180;
        const x = radius * Math.cos(latRad) * Math.sin(lonRad);
        const y = -radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.cos(lonRad);
        return { x, y, z };
      };

      // 1. Draw Central Glowing Core
      const coreProj = project(0, 0, 0);
      const coreGrad = ctx.createRadialGradient(
        coreProj.x,
        coreProj.y,
        10,
        coreProj.x,
        coreProj.y,
        SPHERE_RADIUS * 0.9
      );
      coreGrad.addColorStop(0, `${themeColor}26`);
      coreGrad.addColorStop(0.5, `${themeColor}0a`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(coreProj.x, coreProj.y, SPHERE_RADIUS * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Wireframe Mesh Mode
      if (renderMode === 'mesh' || renderMode === 'constellation') {
        ctx.strokeStyle = `${themeColor}2e`;
        ctx.lineWidth = 1;

        // Latitude circles
        latitudeRings.forEach((lat) => {
          ctx.beginPath();
          let firstPoint = true;
          for (let lon = -180; lon <= 180; lon += 12) {
            const p3 = latLonTo3D(lat, lon, SPHERE_RADIUS);
            const p2 = project(p3.x, p3.y, p3.z);
            if (p2.z > -SPHERE_RADIUS * 0.4) {
              if (firstPoint) {
                ctx.moveTo(p2.x, p2.y);
                firstPoint = false;
              } else {
                ctx.lineTo(p2.x, p2.y);
              }
            } else {
              firstPoint = true;
            }
          }
          ctx.stroke();
        });

        // Longitude meridians
        longitudeRings.forEach((lon) => {
          ctx.beginPath();
          let firstPoint = true;
          for (let lat = -90; lat <= 90; lat += 10) {
            const p3 = latLonTo3D(lat, lon, SPHERE_RADIUS);
            const p2 = project(p3.x, p3.y, p3.z);
            if (p2.z > -SPHERE_RADIUS * 0.4) {
              if (firstPoint) {
                ctx.moveTo(p2.x, p2.y);
                firstPoint = false;
              } else {
                ctx.lineTo(p2.x, p2.y);
              }
            } else {
              firstPoint = true;
            }
          }
          ctx.stroke();
        });
      }

      // 3. Draw Outer Orbiting Particle Ring
      const now = performance.now() * 0.001;
      ctx.strokeStyle = `${themeColor}55`;
      ctx.beginPath();
      for (let angle = 0; angle <= 360; angle += 10) {
        const rad = (angle * Math.PI) / 180;
        const ringR = SPHERE_RADIUS * 1.25;
        // Tilted ring at 25 degrees
        const x3 = ringR * Math.cos(rad);
        const y3 = ringR * Math.sin(rad) * Math.sin(0.45);
        const z3 = ringR * Math.sin(rad) * Math.cos(0.45);
        const p2 = project(x3, y3, z3);
        if (angle === 0) ctx.moveTo(p2.x, p2.y);
        else ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();

      // Moving photon on the tilted ring
      const photonAngle = (now * 1.5) % (Math.PI * 2);
      const ringR = SPHERE_RADIUS * 1.25;
      const photon3 = {
        x: ringR * Math.cos(photonAngle),
        y: ringR * Math.sin(photonAngle) * Math.sin(0.45),
        z: ringR * Math.sin(photonAngle) * Math.cos(0.45),
      };
      const photon2 = project(photon3.x, photon3.y, photon3.z);
      if (photon2.z > -SPHERE_RADIUS) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(photon2.x, photon2.y, 3 * photon2.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. Draw Surface Ambient Particles
      SURFACE_PARTICLES.forEach((sp) => {
        const p3 = latLonTo3D(sp.lat, sp.lon, SPHERE_RADIUS);
        const p2 = project(p3.x, p3.y, p3.z);
        if (p2.z > 0) {
          const alpha = (p2.z / SPHERE_RADIUS) * 0.7;
          ctx.fillStyle = themeColor;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p2.x, p2.y, sp.size * p2.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      // 5. Draw Subsystem Nodes (depth sorted)
      const projectedNodes = SUBSYSTEM_NODES.map((node) => {
        const p3 = latLonTo3D(node.lat, node.lon, SPHERE_RADIUS);
        const p2 = project(p3.x, p3.y, p3.z);
        return { node, ...p2 };
      });

      // Sort back-to-front
      projectedNodes.sort((a, b) => a.z - b.z);

      // Draw constellation lines between nearby front-facing nodes
      if (renderMode === 'constellation') {
        ctx.strokeStyle = `${themeColor}44`;
        ctx.lineWidth = 1;
        for (let i = 0; i < projectedNodes.length; i++) {
          for (let j = i + 1; j < projectedNodes.length; j++) {
            const nA = projectedNodes[i]!;
            const nB = projectedNodes[j]!;
            if (nA.z > -40 && nB.z > -40) {
              const dist = Math.hypot(nA.x - nB.x, nA.y - nB.y);
              if (dist < 110) {
                ctx.beginPath();
                ctx.moveTo(nA.x, nA.y);
                ctx.lineTo(nB.x, nB.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Check mouse hover over nodes
      let hoveredNode: SubsystemNode | null = null;

      projectedNodes.forEach((pn) => {
        const isFront = pn.z > -30;
        const isSelected = activeNode?.id === pn.node.id;

        // Hit detection if front-facing and mouse is present
        if (mousePos.current && isFront) {
          const mouseDist = Math.hypot(mousePos.current.x - pn.x, mousePos.current.y - pn.y);
          if (mouseDist < 16) {
            hoveredNode = pn.node;
          }
        }

        // Depth cue opacity
        const depthAlpha = isFront ? Math.min(1, Math.max(0.3, (pn.z + 50) / (SPHERE_RADIUS + 50))) : 0.15;
        const nodeRadius = (isSelected ? 7 : 4.5) * pn.scale;

        // Node Glow Ring
        if (isSelected || isFront) {
          ctx.strokeStyle = isSelected ? '#ffffff' : themeColor;
          ctx.globalAlpha = depthAlpha * 0.8;
          ctx.lineWidth = isSelected ? 2 : 1;
          ctx.beginPath();
          ctx.arc(pn.x, pn.y, nodeRadius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Node Dot
        ctx.fillStyle = isSelected ? '#ffffff' : isFront ? themeColor : `${themeColor}88`;
        ctx.globalAlpha = depthAlpha;
        ctx.beginPath();
        ctx.arc(pn.x, pn.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node Label (if in front hemisphere)
        if (isFront && pn.scale > 0.85) {
          ctx.font = '10px var(--font-mono, monospace)';
          ctx.fillStyle = isSelected ? '#ffffff' : `${themeColor}cc`;
          ctx.textAlign = 'left';
          ctx.fillText(pn.node.name, pn.x + nodeRadius + 6, pn.y + 3);
        }
      });

      ctx.globalAlpha = 1;

      if (hoveredNode && hoveredNode !== activeNode) {
        soundFx.playHover();
        setActiveNode(hoveredNode);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [themeColor, renderMode, autoRotate, activeNode]);

  // Pointer drag event handlers for 3D rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    soundFx.playHover();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (isDragging.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;

      rotY.current += dx * 0.008;
      rotX.current += dy * 0.008;

      velocity.current = {
        x: dx * 0.006,
        y: dy * 0.006,
      };

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handlePointerLeave = () => {
    isDragging.current = false;
    mousePos.current = null;
  };

  const handleResetOrbit = () => {
    soundFx.playSnap();
    rotX.current = 0.2;
    rotY.current = 0;
    velocity.current = { x: 0.004, y: 0.001 };
    setAutoRotate(true);
  };

  return (
    <div
      ref={containerRef}
      className="interactive-spotlight-card"
      style={{
        position: 'relative',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
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
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: `${themeColor}22`,
              border: `1px solid ${themeColor}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Orbit size={18} color={themeColor} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text-heading)' }}>
              Interactive 3D Holographic Kernel Core
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              Drag to orbit • Hover nodes to inspect microkernel subsystems
            </p>
          </div>
        </div>

        {/* Control Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              soundFx.playHover();
              setRenderMode((m) => (m === 'mesh' ? 'particles' : m === 'particles' ? 'constellation' : 'mesh'));
            }}
            className="cyber-control-pill"
            title="Toggle 3D wireframe / point cloud / constellation mode"
          >
            <Eye size={12} color={themeColor} />
            <span style={{ textTransform: 'capitalize' }}>Mode: {renderMode}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playHover();
              setAutoRotate((prev) => !prev);
            }}
            className={`cyber-control-pill ${autoRotate ? 'is-active' : ''}`}
            title="Toggle automatic orbital rotation"
          >
            <Zap size={12} color={autoRotate ? themeColor : undefined} />
            <span>{autoRotate ? 'Auto-Orbit: ON' : 'Auto-Orbit: OFF'}</span>
          </button>

          <button
            onClick={handleResetOrbit}
            className="cyber-control-pill"
            title="Reset 3D camera angles"
          >
            <RotateCcw size={12} />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          borderRadius: '12px',
          backgroundColor: 'rgba(5, 8, 14, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          cursor: isDragging.current ? 'grabbing' : 'grab',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
        />

        {/* Drag Hint Watermark */}
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
          <Sparkles size={11} color={themeColor} />
          <span>Click &amp; drag sphere to rotate in 3D space</span>
        </div>

        {/* Selected Node HUD Overlay */}
        {activeNode && (
          <div
            className="hud-node-card"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '260px',
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(13, 17, 23, 0.92)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${themeColor}66`,
              boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px ${themeColor}22`,
              pointerEvents: 'none',
              animation: 'fadeInScale 0.2s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: themeColor,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                [{activeNode.category}]
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-success)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {activeNode.status}
              </span>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              {activeNode.name}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: '0 0 8px' }}>
              {activeNode.description}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '6px',
              }}
            >
              <span>TELEMETRY:</span>
              <span style={{ color: themeColor, fontWeight: 600 }}>{activeNode.metric}</span>
            </div>
          </div>
        )}
      </div>

      {/* Subsystem Quick Selector Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}
      >
        {SUBSYSTEM_NODES.map((node) => {
          const isSelected = activeNode?.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => {
                soundFx.playHover();
                setActiveNode(node);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: isSelected ? `${themeColor}22` : 'rgba(22, 27, 34, 0.7)',
                border: `1px solid ${isSelected ? themeColor : 'rgba(255, 255, 255, 0.1)'}`,
                color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {node.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
