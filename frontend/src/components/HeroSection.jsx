import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Terminal, Activity, ChevronDown, Shield } from 'lucide-react';
import AuroraBackground from './AuroraBackground';
import ThreeThreatShield from './ThreeThreatShield';
import FloatingElements from './FloatingElements';
import { TextReveal, FadeInUp, ScaleIn } from './TextReveal';
import GlowButton from './GlowButton';

const STAT_BADGES = [
  { icon: Zap, text: 'TF-IDF + Naive Bayes ML', color: 'text-cyan-400' },
  { icon: Terminal, text: 'Explainable AI (XAI)', color: 'text-violet-400' },
  { icon: Activity, text: '1930 Cybercrime Drafter', color: 'text-emerald-400' },
];

export default function HeroSection({ riskScore = 15, classification = 'Safe', onScrollToAnalyzers }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Layer 1: Aurora gradient background */}
      <AuroraBackground classification={classification} riskScore={riskScore} />

      {/* Layer 2: Floating glass elements */}
      <FloatingElements />

      {/* Layer 3: Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 flex flex-col items-center text-center">
        {/* Top pill badge */}
        <FadeInUp delay={0.2}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-cyan-500/25 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono text-cyan-300 tracking-wide">AI-Powered Fraud Detection</span>
          </div>
        </FadeInUp>

        {/* Main headline with text stagger */}
        <TextReveal
          text="The living threat shield for digital payments."
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading tracking-tight text-white leading-[1.08] max-w-5xl"
          gradient
        />

        {/* Subtitle */}
        <FadeInUp delay={0.8}>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300/90 font-normal leading-relaxed max-w-2xl">
            Real-time multi-modal detection of{' '}
            <strong className="text-white">fake KYC messages</strong>,{' '}
            <strong className="text-rose-300">reverse-debit QR traps</strong>,{' '}
            power disconnection threats, and typosquatted banking links.
          </p>
        </FadeInUp>

        {/* CTA Buttons */}
        <FadeInUp delay={1.0}>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <GlowButton variant="primary" onClick={onScrollToAnalyzers}>
              <Shield className="h-4 w-4" />
              <span>Scan Now</span>
            </GlowButton>
            <GlowButton variant="ghost" onClick={() => window.open('https://cybercrime.gov.in', '_blank')}>
              <span>Report to 1930</span>
            </GlowButton>
          </div>
        </FadeInUp>

        {/* 3D Threat Shield — cinematic centerpiece */}
        <ScaleIn delay={0.5} className="w-full max-w-3xl mt-10">
          <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${classification === 'High Risk' ? 'bg-rose-500 animate-ping' : classification === 'Suspicious' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span>LIVE 3D WEBGL CORE</span>
              </span>
              <span className="text-cyan-400 font-bold">{riskScore}/100</span>
            </div>
            <ThreeThreatShield riskScore={riskScore} classification={classification} />
          </div>
        </ScaleIn>

        {/* Feature badges */}
        <FadeInUp delay={1.4}>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 text-xs font-mono text-slate-400">
            {STAT_BADGES.map((badge) => (
              <span
                key={badge.text}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] transition-colors duration-300"
              >
                <badge.icon className={`h-3.5 w-3.5 ${badge.color}`} />
                <span>{badge.text}</span>
              </span>
            ))}
          </div>
        </FadeInUp>

        {/* Scroll indicator */}
        <FadeInUp delay={1.8}>
          <motion.button
            onClick={onScrollToAnalyzers}
            className="mt-10 flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <span className="text-[10px] font-mono tracking-widest uppercase">Explore</span>
            <ChevronDown className="h-4 w-4" />
          </motion.button>
        </FadeInUp>
      </div>
    </section>
  );
}
