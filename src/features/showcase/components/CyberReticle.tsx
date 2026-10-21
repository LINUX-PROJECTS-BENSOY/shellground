import React, { useEffect, useState, useRef } from 'react';
import { soundFx } from '../utils/soundEffects';

interface Shockwave {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface CyberReticleProps {
  color?: string;
}

export const CyberReticle: React.FC<CyberReticleProps> = ({ color = '#00f0ff' }) => {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);

  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const reticleRef = useRef<HTMLDivElement>(null);
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      setCoords({ x: Math.round(e.clientX), y: Math.round(e.clientY) });

      // Check if hovering an interactive element
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a'))) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      soundFx.playTyping();
      const newWave: Shockwave = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        color,
      };

      setShockwaves((prev) => [...prev.slice(-6), newWave]);

      // Remove after animation completes
      setTimeout(() => {
        setShockwaves((prev) => prev.filter((w) => w.id !== newWave.id));
      }, 700);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick);

    // Smooth lerp loop for the reticle
    const updateReticle = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.22;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.22;

      if (reticleRef.current) {
        reticleRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
      }

      animFrame.current = requestAnimationFrame(updateReticle);
    };

    animFrame.current = requestAnimationFrame(updateReticle);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [color]);

  // Don't render if outside or touch
  if (!coords) return null;

  return (
    <>
      {/* Expanding Click Shockwaves */}
      {shockwaves.map((wave) => (
        <div
          key={wave.id}
          className="cyber-shockwave-ring"
          style={{
            position: 'fixed',
            left: `${wave.x}px`,
            top: `${wave.y}px`,
            borderColor: wave.color,
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        />
      ))}

      {/* Cyber Reticle HUD */}
      <div
        ref={reticleRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: isLocked ? '46px' : '32px',
            height: isLocked ? '46px' : '32px',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.2s ease, height 0.2s ease',
          }}
        >
          {/* Rotating Outer Ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `1px dashed ${color}`,
              opacity: isLocked ? 0.9 : 0.45,
              animation: 'spinGradient 12s linear infinite',
            }}
          />

          {/* Crosshairs */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '-4px',
              right: '-4px',
              height: '1px',
              backgroundColor: color,
              opacity: 0.35,
              transform: 'translateY(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '-4px',
              bottom: '-4px',
              width: '1px',
              backgroundColor: color,
              opacity: 0.35,
              transform: 'translateX(-50%)',
            }}
          />

          {/* Center Target Dot */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: isLocked ? '6px' : '4px',
              height: isLocked ? '6px' : '4px',
              borderRadius: '50%',
              backgroundColor: isLocked ? '#ffffff' : color,
              boxShadow: `0 0 8px ${color}`,
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.15s ease',
            }}
          />

          {/* Coordinate Readout */}
          <div
            style={{
              position: 'absolute',
              left: '120%',
              top: '-6px',
              fontSize: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              color: isLocked ? '#ffffff' : color,
              backgroundColor: 'rgba(13, 17, 23, 0.85)',
              padding: '1px 4px',
              borderRadius: '3px',
              border: `1px solid ${color}44`,
              whiteSpace: 'nowrap',
              opacity: 0.85,
            }}
          >
            {isLocked ? 'LOCK' : `${coords.x},${coords.y}`}
          </div>
        </div>
      </div>
    </>
  );
};
