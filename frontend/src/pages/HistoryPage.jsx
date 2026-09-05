import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, History, Shield } from 'lucide-react';
import AnalysisHistory from '../components/AnalysisHistory';
import { soundFX } from '../utils/soundEffects';

export default function HistoryPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <Link
          to="/"
          onClick={() => soundFX.playHover()}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Command Dashboard</span>
        </Link>
        <span className="text-xs font-mono text-emerald-400">Forensic Audit Trail & 1930 Portal</span>
      </div>

      <div className="glass-panel p-5 sm:p-7 border border-white/10 shadow-2xl">
        <AnalysisHistory />
      </div>
    </div>
  );
}
