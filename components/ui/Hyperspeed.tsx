"use client"

import React, { useEffect, useRef } from 'react';
import { HyperspeedOptions } from './HyperSpeedPresets';

interface HyperspeedProps {
  effectOptions?: HyperspeedOptions;
}

export const Hyperspeed: React.FC<HyperspeedProps> = ({ effectOptions = {} }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const speed = effectOptions.speed ?? 3;
    const colors = effectOptions.colors ?? ['#00ffff', '#ff007f', '#a855f7'];
    const count = effectOptions.count ?? 250;
    const distortion = effectOptions.distortion ?? 0.5;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    interface Particle {
      x: number;
      y: number;
      z: number;
      prevZ: number;
      color: string;
      speedMult: number;
      width: number;
    }

    const particles: Particle[] = [];

    const initParticle = (p: Partial<Particle> = {}): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 80;
      return {
        x: p.x ?? Math.cos(angle) * radius,
        y: p.y ?? Math.sin(angle) * radius,
        z: p.z ?? 100 + Math.random() * 900,
        prevZ: p.z ?? 100 + Math.random() * 900,
        color: p.color ?? colors[Math.floor(Math.random() * colors.length)],
        speedMult: p.speedMult ?? 0.5 + Math.random() * 1.5,
        width: p.width ?? 1 + Math.random() * 2,
      };
    };

    for (let i = 0; i < count; i++) {
      particles.push(initParticle());
    }

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    let animationFrameId: number;

    const render = () => {
      ctx.fillStyle = effectOptions.fogColor ?? '#090d16';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw Hyperspeed lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update depth (z value decreases as it moves towards viewer)
        p.prevZ = p.z;
        if (!prefersReducedMotion) {
          p.z -= speed * p.speedMult;
        } else {
          p.z -= 0.1 * p.speedMult; // extremely slow drift for accessibility
        }

        // Reset if it passes the viewer
        if (p.z <= 0) {
          Object.assign(p, initParticle({ z: 1000 }));
        }

        // 3D projection
        const scale = 400 / p.z;
        const prevScale = 400 / p.prevZ;

        // Apply bend/distortion
        const bendX = Math.sin(p.z * 0.003) * distortion * 80;
        const bendY = Math.cos(p.z * 0.003) * distortion * 80;

        const x1 = cx + (p.x + bendX) * scale;
        const y1 = cy + (p.y + bendY) * scale;

        const x2 = cx + (p.x + bendX) * prevScale;
        const y2 = cy + (p.y + bendY) * prevScale;

        // Clip lines that fall outside canvas boundary to prevent rendering artifacts
        if (x1 < 0 || x1 > width || y1 < 0 || y1 > height) continue;

        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.width * (scale / 5);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effectOptions]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
};

export default Hyperspeed;
