import React, { useEffect, useRef } from 'react';

export default function RiskMeter({ riskScore = 15, classification = 'Safe' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 280;
    const height = 150;
    canvas.width = width * 2; // retina scaling
    canvas.height = height * 2;
    ctx.scale(2, 2);

    let currentScore = 0;
    let animId;

    const centerX = width / 2;
    const centerY = height - 15;
    const radius = 100;

    // Angle mapping: 0 score = -Math.PI, 100 score = 0
    const scoreToAngle = (score) => {
      const normalized = Math.min(Math.max(score, 0), 100) / 100;
      return -Math.PI + normalized * Math.PI;
    };

    const targetAngle = scoreToAngle(riskScore);
    let currentAngle = -Math.PI;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Dial Track Arcs
      const drawArcSegment = (startScore, endScore, color) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, scoreToAngle(startScore), scoreToAngle(endScore));
        ctx.lineWidth = 14;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.stroke();
      };

      // Green (Safe: 0-35), Amber (Suspicious: 35-70), Red (High Risk: 70-100)
      drawArcSegment(0, 35, '#10b981');
      drawArcSegment(37, 70, '#f59e0b');
      drawArcSegment(72, 100, '#f43f5e');

      // 2. Draw Subtle Tick Marks
      for (let i = 0; i <= 100; i += 10) {
        const tickAngle = scoreToAngle(i);
        const innerX = centerX + Math.cos(tickAngle) * (radius - 12);
        const innerY = centerY + Math.sin(tickAngle) * (radius - 12);
        const outerX = centerX + Math.cos(tickAngle) * (radius - 4);
        const outerY = centerY + Math.sin(tickAngle) * (radius - 4);

        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.lineWidth = i % 50 === 0 ? 2 : 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.stroke();
      }

      // 3. Smooth Needle Physics
      currentAngle += (targetAngle - currentAngle) * 0.12;

      // Needle Line
      const needleLength = radius - 16;
      const needleTipX = centerX + Math.cos(currentAngle) * needleLength;
      const needleTipY = centerY + Math.sin(currentAngle) * needleLength;

      // Needle Glow
      ctx.shadowColor = classification === 'High Risk' ? '#f43f5e' : classification === 'Suspicious' ? '#f59e0b' : '#10b981';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(needleTipX, needleTipY);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#ffffff';
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.shadowBlur = 0; // reset

      // 4. Center Metallic Pivot Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      if (Math.abs(targetAngle - currentAngle) > 0.002) {
        animId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [riskScore, classification]);

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md shadow-xl">
      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <span>3D Analog Threat Gauge</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '280px', height: '150px' }}
        className="cursor-pointer"
      />
      <div className="flex items-center justify-between w-full max-w-[240px] text-[10px] font-mono text-slate-400 px-2 mt-[-4px]">
        <span className="text-emerald-400 font-semibold">SAFE (0)</span>
        <span className="text-amber-400 font-semibold">SUSPICIOUS (50)</span>
        <span className="text-rose-400 font-semibold">CRITICAL (100)</span>
      </div>
    </div>
  );
}
