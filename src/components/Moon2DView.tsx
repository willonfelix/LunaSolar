import React, { useRef, useEffect } from 'react';
import { MoonPhaseDetails } from '../types';

interface Moon2DViewProps {
  phaseDetails: MoonPhaseDetails;
  size?: number;
}

export const Moon2DView: React.FC<Moon2DViewProps> = ({ phaseDetails, size = 220 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const radius = size / 2 - 12;
    const cx = size / 2;
    const cy = size / 2;

    // Clear background
    ctx.clearRect(0, 0, size, size);

    // Subtle outer atmospheric glow
    const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.25);
    outerGlow.addColorStop(0, 'rgba(224, 242, 254, 0.15)');
    outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // 1. Draw Base Dark Disk (unlit portion of Moon)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Dark lunar surface gradient
    const darkGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    darkGrad.addColorStop(0, '#111827');
    darkGrad.addColorStop(0.8, '#0b0f19');
    darkGrad.addColorStop(1, '#05070c');
    ctx.fillStyle = darkGrad;
    ctx.fill();

    // Draw dark craters
    drawCraters(ctx, cx, cy, radius, '#1f2937', '#030712');

    ctx.restore();

    // 2. Draw Illuminated Portion of Moon using Phase Fraction and Phase Angle
    // Phase fraction ranges from 0 (New) to 1 (Full)
    // Waxing vs Waning is derived from phaseCode
    const isWaxing = phaseDetails.phaseCode.includes('WAXING') || phaseDetails.phaseCode === 'FIRST_QUARTER';
    const isFull = phaseDetails.phaseCode === 'FULL';
    const isNew = phaseDetails.phaseCode === 'NEW';

    if (!isNew) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Create Light Path using parametric terminator ellipse
      ctx.beginPath();

      // Convert phase fraction (0..1) to terminator ratio (-1..1)
      // 0 = -1 (all shadow), 0.5 = 0 (half lit), 1 = 1 (all lit)
      const k = phaseDetails.phaseFraction;
      const xTerm = Math.cos(phaseDetails.phaseAngle * (Math.PI / 180));

      // Draw lit crescent or gibbous path
      if (isFull || k > 0.98) {
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      } else {
        // Draw semi-circle + ellipse curve
        if (isWaxing) {
          // Lit on the right side
          ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI / 2, false);
          ctx.ellipse(cx, cy, Math.abs(radius * xTerm), radius, 0, Math.PI / 2, -Math.PI / 2, xTerm < 0);
        } else {
          // Lit on the left side
          ctx.arc(cx, cy, radius, Math.PI / 2, -Math.PI / 2, false);
          ctx.ellipse(cx, cy, Math.abs(radius * xTerm), radius, 0, -Math.PI / 2, Math.PI / 2, xTerm > 0);
        }
      }

      // Lit lunar surface gradient
      const litGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, radius * 0.1, cx, cy, radius * 1.1);
      litGrad.addColorStop(0, '#ffffff');
      litGrad.addColorStop(0.5, '#e2e8f0');
      litGrad.addColorStop(0.85, '#cbd5e1');
      litGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = litGrad;
      ctx.fill();

      // Draw light craters on illuminated side
      drawCraters(ctx, cx, cy, radius, '#94a3b8', '#e2e8f0');

      ctx.restore();
    }

    // 3. Crisp Limb Border Ring
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

  }, [phaseDetails, size]);

  // Helper to draw realistic lunar maria & craters
  function drawCraters(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, craterColor: string, highlightColor: string) {
    const craters = [
      { x: -0.3, y: -0.2, r: 0.22 }, // Sea of Tranquility / Mare Tranquillitatis
      { x: 0.2, y: -0.3, r: 0.28 },  // Oceanus Procellarum
      { x: -0.1, y: 0.2, r: 0.18 },  // Mare Imbrium
      { x: 0.35, y: 0.3, r: 0.14 },  // Tycho crater area
      { x: -0.4, y: 0.3, r: 0.12 },  // Mare Crisium
      { x: 0.05, y: -0.5, r: 0.15 }, // Mare Serenitatis
    ];

    craters.forEach((c) => {
      const px = cx + c.x * r;
      const py = cy + c.y * r;
      const pr = c.r * r;

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = craterColor;
      ctx.globalAlpha = 0.35;
      ctx.fill();

      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
      ctx.restore();
    });
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <canvas ref={canvasRef} style={{ width: size, height: size }} className="drop-shadow-2xl" />
      
      {/* Illumination Badge */}
      <div className="mt-2 text-center">
        <span className="text-xl font-extrabold font-display text-slate-100 tracking-tight">
          {phaseDetails.illuminationPct}%
        </span>
        <span className="block text-[11px] font-medium text-cyan-400 uppercase tracking-widest">
          Iluminação Solar
        </span>
      </div>
    </div>
  );
};
