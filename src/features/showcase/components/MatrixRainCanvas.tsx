import React, { useEffect, useRef } from 'react';

interface MatrixRainCanvasProps {
  opacity?: number;
  color?: string;
}

export const MatrixRainCanvas: React.FC<MatrixRainCanvasProps> = ({
  opacity = 0.35,
  color = '#00f0ff',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const chars = '01$#_/>-~+=:;*!@%&[]{}|/\\0123456789abcdefABCDEFλπΩΨΣ';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    let frameCount = 0;
    const render = () => {
      frameCount++;
      // Render every 2 frames for smooth retro terminal 30-40fps cadence
      if (frameCount % 2 === 0) {
        ctx.fillStyle = 'rgba(8, 11, 16, 0.15)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px "JetBrains Mono", "Fira Code", monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)] ?? '0';
          const x = i * fontSize;
          const y = (drops[i] ?? 0) * fontSize;

          // Glowing leading head
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = color;
          ctx.fillText(text, x, y);

          // Trailing body
          ctx.fillStyle = color;
          ctx.shadowBlur = 0;

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] = (drops[i] ?? 0) + 1;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
        transition: 'opacity 0.4s ease',
      }}
    />
  );
};
