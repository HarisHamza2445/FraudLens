import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

export default function DetectionReasons({ flags = [], classification = 'Safe', tactics = [] }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          <span>Zero Malicious Signatures Detected</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          No urgency indicators, fake KYC threats, unverified VPAs, or deceptive reverse-debit schemes were found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <AlertCircle className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold uppercase tracking-wider">Detection Signatures & Red Flags ({flags.length})</span>
        </div>
        {tactics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tactics.map((tactic, idx) => (
              <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                {tactic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {flags.map((flag, index) => {
          const isCritical = flag.severity === 'critical';
          const isHigh = flag.severity === 'high';
          const isSafe = flag.severity === 'safe';

          let cardStyle = 'bg-amber-500/[0.04] border-amber-500/20 text-amber-300';
          let badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          let icon = <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />;

          if (isCritical) {
            cardStyle = 'bg-rose-500/[0.06] border-rose-500/30 text-rose-200';
            badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            icon = <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />;
          } else if (isSafe) {
            cardStyle = 'bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-200';
            badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            icon = <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />;
          }

          return (
            <div
              key={index}
              className={`p-3.5 rounded-xl border transition-all ${cardStyle} backdrop-blur-sm space-y-1.5`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="text-xs font-semibold text-white">{flag.title}</span>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                  {flag.severity || 'WARNING'}
                </span>
              </div>
              <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                {flag.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
