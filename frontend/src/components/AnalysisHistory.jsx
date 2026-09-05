import React, { useState, useEffect } from 'react';
import { History, Search, Download, Trash2, ShieldAlert, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import { apiFetch } from '../utils/api';

export default function AnalysisHistory({ onSelectHistoricalItem }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, highRisk: 0, suspicious: 0, safe: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchHistoryAndStats = async () => {
    try {
      const [histRes, statsRes] = await Promise.all([
        apiFetch('/api/history'),
        apiFetch('/api/stats')
      ]);
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.warn('Could not fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndStats();
  }, []);

  const handleExportJSON = () => {
    soundFX.playHover();
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraudlens-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.preview || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTier === 'ALL') return matchesSearch;
    if (filterTier === 'HIGH_RISK') return matchesSearch && item.classification === 'High Risk';
    if (filterTier === 'SUSPICIOUS') return matchesSearch && item.classification === 'Suspicious';
    if (filterTier === 'SAFE') return matchesSearch && item.classification === 'Safe';
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
          <span className="text-[11px] font-mono text-slate-400 block">TOTAL SCANS</span>
          <span className="text-2xl font-bold font-heading text-white">{stats.total || history.length}</span>
        </div>
        <div className="p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 backdrop-blur-sm">
          <span className="text-[11px] font-mono text-rose-300 block">HIGH RISK THREATS</span>
          <span className="text-2xl font-bold font-heading text-rose-400">{stats.highRisk}</span>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 backdrop-blur-sm">
          <span className="text-[11px] font-mono text-amber-300 block">SUSPICIOUS ANOMALIES</span>
          <span className="text-2xl font-bold font-heading text-amber-400">{stats.suspicious}</span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 backdrop-blur-sm">
          <span className="text-[11px] font-mono text-emerald-300 block">VERIFIED SAFE</span>
          <span className="text-2xl font-bold font-heading text-emerald-400">{stats.safe}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit records by keyword, VPA, phone, or URL..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono">
            {['ALL', 'HIGH_RISK', 'SUSPICIOUS', 'SAFE'].map((tier) => (
              <button
                key={tier}
                onClick={() => {
                  soundFX.playHover();
                  setFilterTier(tier);
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterTier === tier
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono text-slate-200 transition-all"
            title="Download audit log in JSON format"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-2 pt-1">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono bg-white/[0.02] border border-white/[0.06] rounded-xl">
            No audit records matching your filter criteria.
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isHigh = item.classification === 'High Risk';
            const isSuspicious = item.classification === 'Suspicious';

            let badgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
            let Icon = ShieldCheck;
            if (isHigh) {
              badgeColor = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
              Icon = ShieldAlert;
            } else if (isSuspicious) {
              badgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
              Icon = AlertTriangle;
            }

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${badgeColor}`}>
                      {item.classification} ({item.riskScore}/100)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono line-clamp-1">
                    {item.preview}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] font-mono text-slate-400 shrink-0">
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/5">
                    {item.type.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
