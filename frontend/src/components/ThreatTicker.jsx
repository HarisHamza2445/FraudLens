import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ShieldAlert, QrCode, Zap, TrendingUp, Lock, Radar, ArrowUpRight, ShieldCheck } from 'lucide-react';

const THREAT_FEED = [
  {
    type: 'SMS',
    title: 'Electricity Disconnection Threat',
    detail: '9:30 PM power-cut SMS with personal mobile number asking victims to call.',
    severity: 'critical',
    regions: 'Pan-India',
  },
  {
    type: 'QR',
    title: '"Scan to Receive" Reverse-Debit Trap',
    detail: 'upi://pay requests disguised as cashback/refund, hard-coded deduction amounts.',
    severity: 'critical',
    regions: 'UPI Networks',
  },
  {
    type: 'URL',
    title: 'Typosquatted SBI KYC Phishing',
    detail: 'spoofed .vip / .top domains harvesting PAN and login credentials.',
    severity: 'high',
    regions: 'Banking Users',
  },
  {
    type: 'SMS',
    title: 'Fake Part-Time Job Bait',
    detail: 'Telegram prepaid task scams promising daily income for likes and reviews.',
    severity: 'high',
    regions: 'Job Seekers',
  },
  {
    type: 'APK',
    title: 'Trojan APK Delivery',
    detail: 'Malicious Android packages that read OTPs and drain accounts.',
    severity: 'critical',
    regions: 'Mobile Wallets',
  },
];

const severityStyles = {
  critical: { dot: 'bg-rose-500', text: 'text-rose-300', border: 'border-rose-500/40', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40' },
  high: { dot: 'bg-amber-400', text: 'text-amber-300', border: 'border-amber-500/40', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
};

export default function ThreatTicker() {
  const [index, setIndex] = useState(0);
  const [livePulse, setLivePulse] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % THREAT_FEED.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setLivePulse((p) => !p), 900);
    return () => clearInterval(blink);
  }, []);

  const item = THREAT_FEED[index];
  const style = severityStyles[item.severity] || severityStyles.high;

  return (
    <div className="hidden sm:flex items-stretch gap-0.5 px-6 py-1.5 bg-gradient-to-r from-[#170b14] via-[#071016] to-[#07070a] border-b border-white/[0.04]">
      {/* Live status badge */}
      <div className="flex items-center gap-2 pr-5 mr-5 border-r border-white/[0.06] shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className={`absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75 ${livePulse ? 'animate-ping' : ''}`} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
        </span>
        <span className="block text-[10px] font-mono font-bold tracking-widest text-white">LIVE</span>
      </div>

      {/* Auto-rotating threat feed */}
      <div className="flex items-center min-w-0 flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 min-w-0"
          >
            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${style.badge}`}>
              <Radar className="h-3 w-3" />
              <span className="text-[9px] font-mono font-bold tracking-wide">{item.type}</span>
            </span>

            <span className={`text-[11px] font-semibold text-slate-100 whitespace-nowrap`}>{item.title}</span>

            <span className={`h-1 w-1 rounded-full ${style.dot} shrink-0`} />

            <span className="text-[10px] font-mono text-slate-400 truncate">{item.detail}</span>
          </motion.div>
        </AnimatePresence>

        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#071016] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#07070a] to-transparent pointer-events-none" />
      </div>

      {/* Static stats */}
      <div className="hidden lg:flex items-center gap-4 pl-5 ml-5 border-l border-white/[0.06] shrink-0">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
          <ShieldAlert className="h-3 w-3 text-rose-400" />
          <span className="font-bold text-white">2,418</span>
          <span className="text-slate-500">threats blocked</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
          <TrendingUp className="h-3 w-3 text-amber-400" />
          <span className="font-bold text-white">+18%</span>
          <span className="text-slate-500">UPI fraud</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
          <Zap className="h-3 w-3 text-cyan-400" />
          <span className="font-bold text-white">96.8%</span>
          <span className="text-slate-500">model accuracy</span>
        </div>
      </div>
    </div>
  );
}
