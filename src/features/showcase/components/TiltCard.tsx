import React, { useRef, useState, useCallback } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  glowColor?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  style = {},
  maxTilt = 7,
  glowColor = 'rgba(56, 189, 248, 0.16)',
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glowPos, setGlowPos] = useState<{ x: number; y: number; opacity: number }>({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlowPos({ x, y, opacity: 1 });
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlowPos((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`interactive-spotlight-card ${className}`}
      style={{
        ...style,
        transform,
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 3D dynamic cursor flashlight glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(400px circle at ${glowPos.x}px ${glowPos.y}px, ${glowColor}, transparent 65%)`,
          opacity: glowPos.opacity,
          transition: 'opacity 0.25s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};
