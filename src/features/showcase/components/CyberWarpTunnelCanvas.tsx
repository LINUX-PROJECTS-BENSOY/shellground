import React, { useEffect, useRef } from 'react';

interface Star3D {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  color: string;
  size: number;
}

interface CyberWarpTunnelCanvasProps {
  color?: string;
  speedMultiplier?: number;
}

export const CyberWarpTunnelCanvas: React.FC<CyberWarpTunnelCanvasProps> = ({
  color = '#00f0ff',
  speedMultiplier = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const STAR_COUNT = 320;
    const MAX_DEPTH = 1200;
    const stars: Star3D[] = [];

    const colorPalette = [
      color,
      '#38bdf8',
      '#818cf8',
      '#34d399',
      '#ffffff',
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * MAX_DEPTH,
        prevZ: MAX_DEPTH,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)] || color,
        size: Math.random() * 2 + 1,
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    const targetSpeed = 7 * speedMultiplier;
    let currentSpeed = targetSpeed;

    const handleMouseMove = (e: MouseEvent) => {
      // Offset from center (-1 to 1)
      mouseX = (e.clientX - width / 2) * 0.15;
      mouseY = (e.clientY - height / 2) * 0.15;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const fov = 300;
    const cx = width / 2;
    const cy = height / 2;

    const render = () => {
      ctx.fillStyle = 'rgba(8, 11, 16, 0.35)';
      ctx.fillRect(0, 0, width, height);

      currentSpeed += (targetSpeed - currentSpeed) * 0.05;

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i]!;

        star.prevZ = star.z;
        star.z -= currentSpeed;

        // Interactive tilt based on mouse position
        star.x -= mouseX * 0.02;
        star.y -= mouseY * 0.02;

        if (star.z <= 1) {
          star.z = MAX_DEPTH;
          star.prevZ = MAX_DEPTH;
          star.x = (Math.random() - 0.5) * width * 2.5;
          star.y = (Math.random() - 0.5) * height * 2.5;
        }

        // 3D perspective projection
        const k = fov / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        const prevK = fov / star.prevZ;
        const prevPx = star.x * prevK + cx;
        const prevPy = star.y * prevK + cy;

        // Skip if outside viewport
        if (px < -100 || px > width + 100 || py < -100 || py > height + 100) {
          continue;
        }

        // Draw laser star trail
        const alpha = Math.min(1, Math.max(0, 1 - star.z / MAX_DEPTH));
        ctx.strokeStyle = star.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.lineWidth = Math.max(1, (1 - star.z / MAX_DEPTH) * star.size * 2);

        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Glowing star head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.8, (1 - star.z / MAX_DEPTH) * star.size), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Draw subtle futuristic cyber crosshairs at vanishing point
      const vpx = cx + mouseX * 0.3;
      const vpy = cy + mouseY * 0.3;

      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(vpx, vpy, 40, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(vpx, vpy, 80, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(vpx - 100, vpy);
      ctx.lineTo(vpx + 100, vpy);
      ctx.moveTo(vpx, vpy - 100);
      ctx.lineTo(vpx, vpy + 100);
      ctx.stroke();
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color, speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};
