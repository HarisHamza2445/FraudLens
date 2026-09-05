import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText, Link2, QrCode, History, ArrowRight } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import ScenarioPlaybook from '../components/ScenarioPlaybook';
import LiveMetricsBar from '../components/LiveMetricsBar';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { soundFX } from '../utils/soundEffects';

export default function LandingDashboard() {
  const navigate = useNavigate();

  const featureCards = [
    {
      to: '/message',
      title: 'Message & SMS Studio',
      description: 'NLP & ML engine analyzing fake KYC threats, electricity disconnections, and coercive urgency.',
      icon: MessageSquareText,
      badge: 'TF-IDF + Naive Bayes',
      gradient: 'from-cyan-500/20 to-violet-500/10 border-cyan-500/30 text-cyan-300'
    },
    {
      to: '/url',
      title: 'Phishing & Link Lab',
      description: 'Domain typosquatting checker matching lookalikes against SBI, HDFC, Paytm, and .vip TLDs.',
      icon: Link2,
      badge: 'Typosquatting & APK',
      gradient: 'from-violet-500/20 to-fuchsia-500/10 border-violet-500/30 text-violet-300'
    },
    {
      to: '/qr',
      title: 'UPI QR Security Chamber',
      description: 'Upload WhatsApp QR screenshots or scan to expose reverse-debit fraud and fake merchant VPAs.',
      icon: QrCode,
      badge: 'QR Image Upload + jsQR',
      gradient: 'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-300'
    },
    {
      to: '/history',
      title: 'Audit Trail & 1930 Portal',
      description: 'Searchable incident logs with 1-click legal complaint drafting for cybercrime.gov.in (1930).',
      icon: History,
      badge: 'Persisted Audit',
      gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300'
    }
  ];

  const handleRunScenario = (item) => {
    if (item.type === 'message') {
      navigate('/message', { state: { prefillText: item.samplePayload } });
    } else if (item.type === 'url') {
      navigate('/url', { state: { prefillUrl: item.samplePayload } });
    } else if (item.type === 'qr') {
      navigate('/qr', { state: { prefillQr: item.samplePayload, expectedAction: item.expectedAction } });
    }
  };

  return (
    <div className="space-y-12">
      {/* Cinematic 3D Animated Hero */}
      <HeroSection
        riskScore={25}
        classification="Safe"
        onScrollToAnalyzers={() => {
          const el = document.getElementById('features');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Feature Navigation Grid */}
      <section id="features" className="space-y-6 pt-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge-pulse">Live Network Telemetry</span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  Auto-refresh
                </span>
              </div>
              <h2 className="text-xl font-bold font-heading text-white mt-1">
                Fraud Detection Modules
              </h2>
              <p className="text-xs text-slate-400">
                Real-time scan metrics from the detection engine, updated live.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Live Security Metrics Dashboard */}
        <LiveMetricsBar />

        <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <StaggerItem key={feat.to}>
                <button
                  onClick={() => {
                    soundFX.playHover();
                    navigate(feat.to);
                  }}
                  className="group glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 border transition-all hover:scale-[1.03] hover:-translate-y-1 hover:border-white/25 text-left h-full w-full"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white group-hover:scale-110 group-hover:text-cyan-400 transition-all">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/10">
                        {feat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white font-heading group-hover:text-cyan-300 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Open Module</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </div>
                </button>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Real-World Scam Pattern Gallery */}
      <section className="pt-4">
        <ScenarioPlaybook onRunScenario={handleRunScenario} />
      </section>
    </div>
  );
}
