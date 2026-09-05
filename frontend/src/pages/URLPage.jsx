import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Link2, Shield } from 'lucide-react';
import URLAnalyzer from '../components/URLAnalyzer';
import RiskScore from '../components/RiskScore';
import RiskMeter from '../components/RiskMeter';
import DetectionReasons from '../components/DetectionReasons';
import AIExplanation from '../components/AIExplanation';
import ThreeThreatShield from '../components/ThreeThreatShield';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { soundFX } from '../utils/soundEffects';

export default function URLPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analysisResult, setAnalysisResult] = useState({
    type: 'url',
    input: 'http://sbi-pan-kyc-verify.vip',
    riskScore: 99,
    classification: 'High Risk',
    confidence: 0.98,
    flags: [
      {
        title: 'Brand Impersonation (SBI)',
        detail: 'The domain contains "SBI", but is not an official domain of this institution. Scammers create spoofed domains to harvest login credentials and OTPs.',
        severity: 'critical'
      },
      {
        title: 'High-Risk Top-Level Domain (.vip)',
        detail: 'The .vip extension has a high statistical correlation with disposable cyber fraud infrastructure according to threat intelligence.',
        severity: 'high'
      },
      {
        title: 'Phishing Lure Terminology (kyc, verify)',
        detail: 'URL path contains terms commonly weaponized in credential harvesting campaigns.',
        severity: 'medium'
      }
    ],
    tactics: ['Typosquatting Mimicry', 'Credential Harvesting', 'Malicious TLD'],
    aiExplanation: {
      summary: 'FraudLens AI detected an aggressive phishing lure. This domain impersonates the State Bank of India using deceptive subdomains on an untrusted .vip registry.',
      socialEngineeringTactics: ['Bank Impersonation', 'Fake KYC Urgency', 'Credential Interception'],
      immediateAction: 'DO NOT open this link or input netbanking passwords. Never enter UPI PIN on external websites.',
      keyTakeaway: 'Genuine SBI netbanking is exclusively hosted on onlinesbi.sbi and sbi.co.in.',
      complaintDraft: `=== NATIONAL CYBER CRIME REPORTING PORTAL (1930) DRAFT ===
Incident Category: Phishing Website / Banking Typosquatting
Suspect URL: http://sbi-pan-kyc-verify.vip
Impersonated Entity: State Bank of India (SBI)`
    }
  });

  const handleAnalyze = async ({ url }) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        soundFX.playResult(data.classification);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb */}
      <Reveal y={16}>
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <Link
            to="/"
            onClick={() => soundFX.playHover()}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Command Dashboard</span>
          </Link>
          <span className="text-xs font-mono text-violet-400">Dedicated URL Phishing Lab</span>
        </div>
      </Reveal>

      {/* Input Analyzer Card */}
      <Reveal delay={0.1}>
        <div className="glass-panel p-5 sm:p-7 border border-white/10 shadow-2xl">
          <URLAnalyzer onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </div>
      </Reveal>

      {/* 3D Telemetry Matrix */}
      <section className="space-y-4 pt-2">
        <Reveal delay={0.15}>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-bold font-heading text-white">
              URL Threat Analysis & 3D Telemetry
            </h2>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-12 gap-6" gap={0.12}>
          {/* Gauges & 3D Core Column */}
          <StaggerItem y={20} className="md:col-span-4 flex flex-col gap-4">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md">
              <div className="text-[10px] font-mono text-slate-400 text-center pb-1">REACTIVE 3D SHIELD MATRIX</div>
              <ThreeThreatShield
                riskScore={analysisResult.riskScore}
                classification={analysisResult.classification}
              />
            </div>

            <RiskScore
              riskScore={analysisResult.riskScore}
              classification={analysisResult.classification}
              confidence={analysisResult.confidence}
            />

            <RiskMeter
              riskScore={analysisResult.riskScore}
              classification={analysisResult.classification}
            />
          </StaggerItem>

          {/* Reasons & AI Explanation Column */}
          <StaggerItem y={20} className="md:col-span-8 space-y-5">
            <DetectionReasons
              flags={analysisResult.flags}
              classification={analysisResult.classification}
              tactics={analysisResult.tactics}
            />

            <AIExplanation
              aiExplanation={analysisResult.aiExplanation}
              classification={analysisResult.classification}
            />
          </StaggerItem>
        </Stagger>
      </section>
    </div>
  );
}
