import React, { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Activity, Radar, TrendingUp, ScanSearch } from 'lucide-react';
import { apiFetch } from '../utils/api';

function AnimatedNumber({ value }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1.4, bounce: 0 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <motion.span>{rounded}</motion.span>;
}

const EASE = [0.16, 1, 0.3, 1];

export default function LiveMetricsBar() {
  const [stats, setStats] = useState({ total: 0, safe: 0, suspicious: 0, highRisk: 0, safePct: 0, highRiskPct: 0 });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await apiFetch('/api/stats');
        if (res.ok && active) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.warn('Could not fetch stats:', err);
      }
    };
    load();
    const interval = setInterval(load, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const total = stats.total || 0;
  const blocked = stats.highRisk + stats.suspicious;
  const safeRate = stats.safePct || 0;

  const metrics = [
    {
      label: 'Scans Analyzed',
      value: total,
      icon: ScanSearch,
      accent: 'text-cyan-300',
      tint: 'from-cyan-500/20',
      bar: 'bg-cyan-400',
    },
    {
      label: 'Safe Transactions',
      value: stats.safe,
      icon: ShieldCheck,
      accent: 'text-emerald-300',
      tint: 'from-emerald-500/20',
      bar: 'bg-emerald-400',
      pct: safeRate,
    },
    {
      label: 'Suspicious',
      value: stats.suspicious,
      icon: Activity,
      accent: 'text-amber-300',
      tint: 'from-amber-500/20',
      bar: 'bg-amber-400',
    },
    {
      label: 'Threats Blocked',
      value: blocked,
      icon: ShieldAlert,
      accent: 'text-rose-300',
      tint: 'from-rose-500/20',
      bar: 'bg-rose-400',
      pct: stats.highRiskPct,
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={m.label}
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.96 },
              show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
            }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-4"
          >
            <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${m.tint} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{m.label}</span>
              <Icon className={`h-4 w-4 ${m.accent}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-extrabold font-heading ${m.accent}`}>
                <AnimatedNumber value={m.value} />
              </span>
              {m.pct !== undefined && m.pct > 0 && (
                <span className="text-[11px] font-mono text-slate-500">({m.pct}%)</span>
              )}
            </div>
            {m.pct !== undefined && (
              <div className="mt-2 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${m.bar}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(m.pct, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
