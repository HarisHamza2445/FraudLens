import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquareText, Shield } from 'lucide-react';
import MessageAnalyzer from '../components/MessageAnalyzer';
import RiskScore from '../components/RiskScore';
import RiskMeter from '../components/RiskMeter';
import DetectionReasons from '../components/DetectionReasons';
import AIExplanation from '../components/AIExplanation';
import ThreeThreatShield from '../components/ThreeThreatShield';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { soundFX } from '../utils/soundEffects';
import { apiFetch } from '../utils/api';

export default function MessagePage() {
  const location = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analysisResult, setAnalysisResult] = useState({
    type: 'message',
    input: 'Dear consumer your electricity power will be disconnected tonight at 9:30 PM from electricity office...',
    riskScore: 92,
    classification: 'High Risk',
    confidence: 0.96,
    flags: [
      {
        type: 'ELECTRICITY_DISCONNECTION_SCAM',
        severity: 'critical',
        title: 'Power Disconnection Scare',
        detail: 'Classic utility threat. State electricity boards (BESCOM, TNEB, MSEB) never send personal SMS demanding calls to personal numbers to avoid same-night disconnection.'
      },
      {
        type: 'ARTIFICIAL_URGENCY',
        severity: 'medium',
        title: 'Artificial Urgency & Panic Induction',
        detail: 'Imposes short deadlines ("tonight at 9:30 PM") engineered to disable rational thinking and force hurried payments.'
      },
      {
        type: 'PERSONAL_MOBILE_SPOOF',
        severity: 'medium',
        title: 'Personal Mobile Routed as Official Helpline',
        detail: 'Message asks victim to contact personal mobile number (9876543210) instead of official 1800 toll-free institutional helpline.'
      }
    ],
    tactics: ['Fear of Essential Service Loss', 'Psychological Panic Induction', 'Spoofed Direct Contact'],
    aiExplanation: {
      summary: 'FraudLens AI flagged this SMS as a severe fraud attempt (Risk Score: 92/100). The attacker weaponizes fear of power disconnection to force victims into calling an unauthorized phone number.',
      socialEngineeringTactics: ['Panic/Urgency Creation', 'Utility Impersonation', 'Fear of Disconnection'],
      immediateAction: 'DO NOT call the number. Verify bill status strictly on your electricity provider official portal.',
      keyTakeaway: 'Electricity boards never send personal SMS threatening power cuts on the same night.',
      complaintDraft: `=== NATIONAL CYBER CRIME REPORTING PORTAL (1930) DRAFT ===
Incident Category: Fake Electricity Bill / UPI Impersonation
System Assessment: High Risk (92/100)
Suspect Contact Number: 9876543210`
    }
  });

  const handleAnalyze = async ({ text }) => {
    setIsAnalyzing(true);
    try {
      const response = await apiFetch('/api/analyze/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
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
          <span className="text-xs font-mono text-cyan-400">Dedicated Message Studio</span>
        </div>
      </Reveal>

      {/* Input Analyzer Card */}
      <Reveal delay={0.1}>
        <div className="glass-panel p-5 sm:p-7 border border-white/10 shadow-2xl">
          <MessageAnalyzer onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </div>
      </Reveal>

      {/* 3D Telemetry Matrix */}
      <section className="space-y-4 pt-2">
        <Reveal delay={0.15}>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold font-heading text-white">
              Message Threat Analysis & 3D Telemetry
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
