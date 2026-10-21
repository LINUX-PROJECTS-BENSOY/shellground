import React, { useState, useRef, useEffect } from 'react';
import { Box, Play, CheckCircle2, RotateCcw, Zap } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface CubeCommand {
  cmd: string;
  description: string;
  output: string;
}

interface CubeFace {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  rotX: number;
  rotY: number;
  commands: CubeCommand[];
}

const CUBE_FACES: CubeFace[] = [
  {
    id: 'front',
    name: 'Spatial Filesystem',
    subtitle: 'VFS INODES & DISK OPS',
    color: '#38bdf8',
    rotX: 0,
    rotY: 0,
    commands: [
      { cmd: 'ls -lah /workspace', description: 'List files with permissions', output: 'total 16\ndrwxr-xr-x 2 student student 4096 Oct 21 15:00 .\n-rw-r--r-- 1 student student  350 Oct 21 15:00 app.sh' },
      { cmd: 'mkdir -p /workspace/build/bin', description: 'Create nested directory hierarchy', output: '[VirtualFS] Created directory tree /workspace/build/bin (+NEW)' },
      { cmd: 'tree -L 2 /workspace', description: 'Render visual ASCII tree', output: '/workspace\n├── build\n│   └── bin\n└── app.sh' },
    ],
  },
  {
    id: 'right',
    name: 'Process Forensics',
    subtitle: 'PID 1 & SIGNALS',
    color: '#34d399',
    rotX: 0,
    rotY: -90,
    commands: [
      { cmd: 'ps aux | grep wasm', description: 'Inspect active sandboxed jobs', output: 'student   1  0.0  0.1   1240   856 ?  S  15:00  0:00 /bin/sh -i\nstudent  42  0.0  0.0    980   410 ?  R  15:02  0:00 ps aux' },
      { cmd: 'kill -9 42', description: 'Send virtual SIGKILL', output: '[Signals] Process 42 terminated with code 137 (SIGKILL)' },
      { cmd: 'top -b -n 1', description: 'Instant CPU & memory telemetry', output: 'Tasks: 3 total, 1 running, 2 sleeping\n%Cpu(s): 0.2 us, 0.1 sy, 99.7 id\nMiB Mem : 64.0 total, 52.4 free, 11.6 used' },
    ],
  },
  {
    id: 'back',
    name: 'Pipelines & Filters',
    subtitle: 'STREAM MULTIPLEXING',
    color: '#c084fc',
    rotX: 0,
    rotY: -180,
    commands: [
      { cmd: 'cat access.log | grep 404 | wc -l', description: 'Stream pipeline counting', output: '142' },
      { cmd: "awk -F: '{print $1}' /etc/passwd", description: 'Field extraction stream', output: 'root\ndaemon\nbin\nsys\nstudent\nnobody' },
      { cmd: 'head -n 2 /etc/os-release', description: 'Header inspection', output: 'NAME="ShellGround WASIX POSIX Virtual Linux"\nVERSION="1.4.0-WASM"' },
    ],
  },
  {
    id: 'left',
    name: 'System Introspection',
    subtitle: 'KERNEL TELEMETRY',
    color: '#f59e0b',
    rotX: 0,
    rotY: 90,
    commands: [
      { cmd: 'uname -a', description: 'Kernel build and architecture', output: 'Linux shellground 6.1.0-wasix #1 SMP PREEMPT_DYNAMIC wasm32 WASIX' },
      { cmd: 'df -h', description: 'Virtual filesystem capacity', output: 'Filesystem      Size  Used Avail Use% Mounted on\nmemfs            64M   12M   52M  19% /workspace\nprocfs            0M    0M    0M   0% /proc' },
      { cmd: 'free -m', description: 'WASM memory heap statistics', output: '               total        used        free      shared  buff/cache   available\nMem:              64          11          53           0           0          53' },
    ],
  },
  {
    id: 'top',
    name: 'Security & Permissions',
    subtitle: 'AIR-GAP SANDBOXING',
    color: '#ec4899',
    rotX: -90,
    rotY: 0,
    commands: [
      { cmd: 'chmod 700 /workspace/keys', description: 'Enforce private owner read/write', output: '[VirtualFS] Mode updated to drwx------ (0700)' },
      { cmd: 'chown -R student:student /workspace', description: 'Enforce userland tenancy', output: '[VirtualFS] Ownership updated recursively' },
      { cmd: 'stat /workspace/app.sh', description: 'Query inode permission metadata', output: '  File: /workspace/app.sh\n  Size: 350       Blocks: 1       IO Block: 4096   regular file\nAccess: (0755/-rwxr-xr-x)  Uid: ( 1000/ student)   Gid: ( 1000/ student)' },
    ],
  },
  {
    id: 'bottom',
    name: 'Chaos & Recovery',
    subtitle: '12MS INSTANT RESTORATION',
    color: '#ef4444',
    rotX: 90,
    rotY: 0,
    commands: [
      { cmd: 'rm -rf /*', description: 'Attempt total filesystem wipe', output: '[Sim] Warning: Root directory unlinked! 0 inodes remaining.\n[Kernel] Watchdog triggered. Clean state restored in 11.8ms (+OK)' },
      { cmd: ':(){ :|:& };:', description: 'Execute virtual fork bomb', output: '[cgroups] Max process limit (128) exceeded. Fork rejected safely.' },
      { cmd: 'reset --clean', description: 'Deterministic fresh sandbox', output: '[ShellGround] Fresh in-memory environment loaded in 8.4ms' },
    ],
  },
];

interface HoloCommandCubeProps {
  themeColor?: string;
  onSelectCommand?: (cmd: string) => void;
}

export const HoloCommandCube: React.FC<HoloCommandCubeProps> = ({
  themeColor = '#00f0ff',
  onSelectCommand,
}) => {
  const [rotX, setRotX] = useState(-15);
  const [rotY, setRotY] = useState(25);
  const [activeFace, setActiveFace] = useState<CubeFace>(CUBE_FACES[0]!);
  const [autoSpin, setAutoSpin] = useState(true);
  const [activeExecution, setActiveExecution] = useState<{ cmd: string; output: string } | null>({
    cmd: CUBE_FACES[0]!.commands[0]!.cmd,
    output: CUBE_FACES[0]!.commands[0]!.output,
  });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: -15, rotY: 25 });
  const animFrame = useRef<number | null>(null);

  // Auto spin loop
  useEffect(() => {
    if (!autoSpin) return;

    let lastTime = performance.now();
    const spin = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!isDragging.current) {
        setRotY((prev) => (prev + delta * 18) % 360);
      }
      animFrame.current = requestAnimationFrame(spin);
    };

    animFrame.current = requestAnimationFrame(spin);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [autoSpin]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotY,
    };
    soundFx.playHover();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    setRotX(dragStart.current.rotX - dy * 0.4);
    setRotY(dragStart.current.rotY + dx * 0.4);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const snapToFace = (face: CubeFace) => {
    soundFx.playSnap();
    setAutoSpin(false);
    setActiveFace(face);
    setRotX(face.rotX);
    setRotY(face.rotY);
    setActiveExecution({
      cmd: face.commands[0]!.cmd,
      output: face.commands[0]!.output,
    });
  };

  const runCommand = (cmd: CubeCommand, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playLaser();
    setActiveExecution({ cmd: cmd.cmd, output: cmd.output });
    if (onSelectCommand) {
      onSelectCommand(cmd.cmd);
    }
  };

  const resetRotation = () => {
    soundFx.playSnap();
    setRotX(-15);
    setRotY(25);
    setAutoSpin(true);
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
      {/* Header */}
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
            <Box size={20} color={themeColor} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--color-text-heading)' }}>
              Interactive 3D Holographic Command Cube
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              Drag to spin • Click commands on cube faces to trigger live execution
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              soundFx.playHover();
              setAutoSpin((prev) => !prev);
            }}
            className={`cyber-control-pill ${autoSpin ? 'is-active' : ''}`}
            title="Toggle continuous auto spin"
          >
            <Zap size={13} color={autoSpin ? themeColor : undefined} />
            <span>{autoSpin ? 'Auto-Spin: ON' : 'Auto-Spin: OFF'}</span>
          </button>

          <button
            onClick={resetRotation}
            className="cyber-control-pill"
            title="Reset cube rotation"
          >
            <RotateCcw size={13} />
            <span>Reset Angles</span>
          </button>
        </div>
      </div>

      {/* Face Selector Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
        }}
      >
        {CUBE_FACES.map((face) => {
          const isSelected = activeFace.id === face.id;
          return (
            <button
              key={face.id}
              onClick={() => snapToFace(face)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: isSelected ? `${face.color}25` : 'rgba(22, 27, 34, 0.75)',
                border: `1px solid ${isSelected ? face.color : 'rgba(255, 255, 255, 0.1)'}`,
                color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: face.color }} />
              <span>{face.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Cube Stage & Execution Preview Split */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* 3D Cube Viewport */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            height: '380px',
            position: 'relative',
            perspective: '1000px',
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
          {/* Subtle Cyber Radar in Background */}
          <div
            style={{
              position: 'absolute',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              border: `1px dashed ${themeColor}33`,
              pointerEvents: 'none',
              animation: 'spinGradient 40s linear infinite',
            }}
          />

          {/* Hint Overlay */}
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
            <Box size={11} color={themeColor} />
            <span>Click &amp; drag cube in 3D • Click any command chip to test</span>
          </div>

          {/* 3D Cube Root (180px cube -> half size = 90px) */}
          <div
            style={{
              width: '200px',
              height: '200px',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            {/* FRONT FACE */}
            <div
              style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                transform: 'translateZ(100px)',
                backgroundColor: 'rgba(13, 17, 23, 0.88)',
                backdropFilter: 'blur(8px)',
                border: `2px solid ${CUBE_FACES[0]!.color}`,
                borderRadius: '12px',
                boxShadow: `0 0 20px ${CUBE_FACES[0]!.color}33, inset 0 0 15px ${CUBE_FACES[0]!.color}22`,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: CUBE_FACES[0]!.color, fontWeight: 700 }}>
                  [FRONT] {CUBE_FACES[0]!.subtitle}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {CUBE_FACES[0]!.name}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {CUBE_FACES[0]!.commands.map((c, i) => (
                  <button
                    key={i}
                    onClick={(e) => runCommand(c, e)}
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.cmd}</span>
                    <Play size={10} color={CUBE_FACES[0]!.color} />
                  </button>
                ))}
              </div>
            </div>

            {/* BACK FACE */}
            <div
              style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                transform: 'rotateY(180deg) translateZ(100px)',
                backgroundColor: 'rgba(13, 17, 23, 0.88)',
                backdropFilter: 'blur(8px)',
                border: `2px solid ${CUBE_FACES[2]!.color}`,
                borderRadius: '12px',
                boxShadow: `0 0 20px ${CUBE_FACES[2]!.color}33, inset 0 0 15px ${CUBE_FACES[2]!.color}22`,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: CUBE_FACES[2]!.color, fontWeight: 700 }}>
                  [BACK] {CUBE_FACES[2]!.subtitle}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {CUBE_FACES[2]!.name}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {CUBE_FACES[2]!.commands.map((c, i) => (
                  <button
                    key={i}
                    onClick={(e) => runCommand(c, e)}
                    style={{
                      background: 'rgba(192, 132, 252, 0.12)',
                      border: '1px solid rgba(192, 132, 252, 0.4)',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.cmd}</span>
                    <Play size={10} color={CUBE_FACES[2]!.color} />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT FACE */}
            <div
              style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                transform: 'rotateY(90deg) translateZ(100px)',
                backgroundColor: 'rgba(13, 17, 23, 0.88)',
                backdropFilter: 'blur(8px)',
                border: `2px solid ${CUBE_FACES[1]!.color}`,
                borderRadius: '12px',
                boxShadow: `0 0 20px ${CUBE_FACES[1]!.color}33, inset 0 0 15px ${CUBE_FACES[1]!.color}22`,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: CUBE_FACES[1]!.color, fontWeight: 700 }}>
                  [RIGHT] {CUBE_FACES[1]!.subtitle}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {CUBE_FACES[1]!.name}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {CUBE_FACES[1]!.commands.map((c, i) => (
                  <button
                    key={i}
                    onClick={(e) => runCommand(c, e)}
                    style={{
                      background: 'rgba(52, 211, 153, 0.12)',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.cmd}</span>
                    <Play size={10} color={CUBE_FACES[1]!.color} />
                  </button>
                ))}
              </div>
            </div>

            {/* LEFT FACE */}
            <div
              style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                transform: 'rotateY(-90deg) translateZ(100px)',
                backgroundColor: 'rgba(13, 17, 23, 0.88)',
                backdropFilter: 'blur(8px)',
                border: `2px solid ${CUBE_FACES[3]!.color}`,
                borderRadius: '12px',
                boxShadow: `0 0 20px ${CUBE_FACES[3]!.color}33, inset 0 0 15px ${CUBE_FACES[3]!.color}22`,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: CUBE_FACES[3]!.color, fontWeight: 700 }}>
                  [LEFT] {CUBE_FACES[3]!.subtitle}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {CUBE_FACES[3]!.name}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {CUBE_FACES[3]!.commands.map((c, i) => (
                  <button
                    key={i}
                    onClick={(e) => runCommand(c, e)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.cmd}</span>
                    <Play size={10} color={CUBE_FACES[3]!.color} />
                  </button>
                ))}
              </div>
            </div>

            {/* TOP FACE */}
            <div
              style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                transform: 'rotateX(90deg) translateZ(100px)',
                backgroundColor: 'rgba(13, 17, 23, 0.88)',
                backdropFilter: 'blur(8px)',
                border: `2px solid ${CUBE_FACES[4]!.color}`,
                borderRadius: '12px',
                boxShadow: `0 0 20px ${CUBE_FACES[4]!.color}33, inset 0 0 15px ${CUBE_FACES[4]!.color}22`,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: CUBE_FACES[4]!.color, fontWeight: 700 }}>
                  [TOP] {CUBE_FACES[4]!.subtitle}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {CUBE_FACES[4]!.name}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {CUBE_FACES[4]!.commands.map((c, i) => (
                  <button
                    key={i}
                    onClick={(e) => runCommand(c, e)}
                    style={{
                      background: 'rgba(236, 72, 153, 0.12)',
                      border: '1px solid rgba(236, 72, 153, 0.4)',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.cmd}</span>
                    <Play size={10} color={CUBE_FACES[4]!.color} />
                  </button>
                ))}
              </div>
            </div>

            {/* BOTTOM FACE */}
            <div
              style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                transform: 'rotateX(-90deg) translateZ(100px)',
                backgroundColor: 'rgba(13, 17, 23, 0.88)',
                backdropFilter: 'blur(8px)',
                border: `2px solid ${CUBE_FACES[5]!.color}`,
                borderRadius: '12px',
                boxShadow: `0 0 20px ${CUBE_FACES[5]!.color}33, inset 0 0 15px ${CUBE_FACES[5]!.color}22`,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: CUBE_FACES[5]!.color, fontWeight: 700 }}>
                  [BOTTOM] {CUBE_FACES[5]!.subtitle}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {CUBE_FACES[5]!.name}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {CUBE_FACES[5]!.commands.map((c, i) => (
                  <button
                    key={i}
                    onClick={(e) => runCommand(c, e)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.cmd}</span>
                    <Play size={10} color={CUBE_FACES[5]!.color} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Command Execution Preview Card */}
        <div
          style={{
            padding: '24px',
            borderRadius: '12px',
            backgroundColor: 'rgba(13, 17, 23, 0.85)',
            border: `1px solid ${activeFace.color}44`,
            boxShadow: `0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${activeFace.color}15`,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: `${activeFace.color}22`,
                  border: `1px solid ${activeFace.color}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={16} color={activeFace.color} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: activeFace.color,
                    fontWeight: 700,
                  }}
                >
                  ACTIVE COMMAND TEST-BENCH
                </span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                  {activeFace.name} Sandbox Execution
                </div>
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
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={12} />
              <span>EXIT 0</span>
            </span>
          </div>

          {/* Simulated Terminal Output Box */}
          <div
            style={{
              backgroundColor: '#05080e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#ffffff',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ color: activeFace.color, fontWeight: 700 }}>
              guest@shellground:~/workspace$ {activeExecution?.cmd}
            </div>
            <pre
              style={{
                margin: 0,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
              }}
            >
              {activeExecution?.output}
            </pre>
          </div>

          {/* Quick Select Buttons from Current Face */}
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              TRY OTHER COMMANDS ON THIS FACE:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {activeFace.commands.map((c, i) => (
                <button
                  key={i}
                  onClick={(e) => runCommand(c, e)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: activeExecution?.cmd === c.cmd ? `${activeFace.color}25` : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${activeExecution?.cmd === c.cmd ? activeFace.color : 'rgba(255, 255, 255, 0.1)'}`,
                    color: activeExecution?.cmd === c.cmd ? '#ffffff' : 'var(--color-text-secondary)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c.cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
