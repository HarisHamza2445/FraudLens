import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskScore({ riskScore = 12, classification = 'Safe', confidence = 0.94 }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = riskScore;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [riskScore]);

  const colorMap = {
    Safe: { ring: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: ShieldCheck, label: 'Safe to Proceed' },
    Suspicious: { ring: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle, label: 'Suspicious Anomalies Detected' },
    'High Risk': { ring: '#f43f5e', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: ShieldAlert, label: 'Critical Fraud Threat' },
  };

  const config = colorMap[classification] || colorMap.Safe;
  const Icon = config.icon;
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (displayScore / 100) * circumference;

  return (
    <motion.div
      className="glass-card p-6 flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative w-[140px] h-[140px]">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={config.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${config.ring}60)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold font-heading ${config.text}`}>
            {displayScore}
          </span>
          <span className="text-[10px] font-mono text-slate-500 -mt-0.5">/100 RISK</span>
        </div>
      </div>

      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg} border ${config.border}`}>
        <Icon className={`h-3.5 w-3.5 ${config.text}`} />
        <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
      </div>

      <div className="text-center">
        <span className="text-xs font-mono text-slate-400">
          Confidence: <span className="text-white font-bold">{(confidence * 100).toFixed(1)}%</span>
        </span>
      </div>
    </motion.div>
  );
}
