import React, { useMemo } from 'react';

const RISK_PALETTES = {
  Safe: {
    blob1: 'rgba(16, 185, 129, 0.18)',
    blob2: 'rgba(6, 182, 212, 0.14)',
    blob3: 'rgba(99, 102, 241, 0.10)',
    blob4: 'rgba(16, 185, 129, 0.08)',
  },
  Suspicious: {
    blob1: 'rgba(245, 158, 11, 0.20)',
    blob2: 'rgba(239, 68, 68, 0.14)',
    blob3: 'rgba(245, 158, 11, 0.10)',
    blob4: 'rgba(234, 88, 12, 0.08)',
  },
  'High Risk': {
    blob1: 'rgba(244, 63, 94, 0.22)',
    blob2: 'rgba(147, 51, 234, 0.16)',
    blob3: 'rgba(244, 63, 94, 0.12)',
    blob4: 'rgba(168, 85, 247, 0.10)',
  },
};

export default function AuroraBackground({ classification = 'Safe', riskScore = 15 }) {
  const palette = useMemo(() => RISK_PALETTES[classification] || RISK_PALETTES.Safe, [classification]);

  const speedFactor = classification === 'High Risk' ? 0.7 : classification === 'Suspicious' ? 1.0 : 1.4;

  return (
    <div className="aurora-container" aria-hidden="true">
      <div
        className="aurora-blob aurora-blob-1"
        style={{
          background: `radial-gradient(circle, ${palette.blob1} 0%, transparent 70%)`,
          animationDuration: `${12 * speedFactor}s`,
        }}
      />
      <div
        className="aurora-blob aurora-blob-2"
        style={{
          background: `radial-gradient(circle, ${palette.blob2} 0%, transparent 70%)`,
          animationDuration: `${15 * speedFactor}s`,
        }}
      />
      <div
        className="aurora-blob aurora-blob-3"
        style={{
          background: `radial-gradient(circle, ${palette.blob3} 0%, transparent 70%)`,
          animationDuration: `${18 * speedFactor}s`,
        }}
      />
      <div
        className="aurora-blob aurora-blob-4"
        style={{
          background: `radial-gradient(circle, ${palette.blob4} 0%, transparent 70%)`,
          animationDuration: `${20 * speedFactor}s`,
        }}
      />
      <div className="aurora-noise" />
      <div className="aurora-vignette" />
    </div>
  );
}
