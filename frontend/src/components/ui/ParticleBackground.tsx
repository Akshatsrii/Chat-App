'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  color: string; life: number; maxLife: number;
}

const COLORS = ['#00d4ff', '#9966ff', '#00e5a0', '#ffb800', '#ff33aa'];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    // Spawn particles
    const spawnParticle = () => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      });
    };

    // Initial population
    for (let i = 0; i < 80; i++) spawnParticle();

    let frameCount = 0;
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      // Spawn new particles occasionally
      if (frameCount % 8 === 0 && particlesRef.current.length < 120) spawnParticle();

      // Draw connection lines
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particlesRef.current.length; i++) {
        const a = particlesRef.current[i];
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const b = particlesRef.current[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,212,255,${0.04 * (1 - dist / 120)})`;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        if (p.life > p.maxLife) return false;

        // Mouse repulsion
        const mdx = p.x - mouseRef.current.x;
        const mdy = p.y - mouseRef.current.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 100) {
          p.vx += (mdx / mdist) * 0.08;
          p.vy += (mdy / mdist) * 0.08;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Fade in/out
        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.2
          ? lifeRatio / 0.2
          : lifeRatio > 0.8
          ? (1 - lifeRatio) / 0.2
          : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `,${p.opacity * alpha})`).replace('rgb(', 'rgba(').replace('#', '').replace(
          /^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i,
          (_, r, g, b) => `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},${p.opacity * alpha})`
        );
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, p.color.replace('#', '').replace(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i,
          (_, r, g, b) => `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},${0.08 * alpha})`));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();

        return true;
      });
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}
