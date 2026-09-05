import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, QrCode, Shield } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import RiskScore from '../components/RiskScore';
import RiskMeter from '../components/RiskMeter';
import DetectionReasons from '../components/DetectionReasons';
import AIExplanation from '../components/AIExplanation';
import ThreeThreatShield from '../components/ThreeThreatShield';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { soundFX } from '../utils/soundEffects';
import { apiFetch } from '../utils/api';

export default function QRPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analysisResult, setAnalysisResult] = useState({
    type: 'qr',
    input: 'upi://pay?pa=rewards-cashback-desk@okhdfcbank&pn=GPayCashbackDept&am=4999.00&cu=INR&tn=CashbackRewardCreditApproved',
    riskScore: 99,
    classification: 'High Risk',
    confidence: 0.99,
    flags: [
      {
        title: 'CRITICAL: Reverse-Debit Money Trap',
        detail: 'You indicated you are RECEIVING money, but this QR is a PAYMENT REQUEST (upi://pay) of ₹4999.00. If you scan this and enter your UPI PIN, money will be DEDUCTED from your bank account! Remember: You NEVER need to enter your UPI PIN to receive money.',
        severity: 'critical'
      },
      {
        title: 'Institutional Impersonation in VPA/Name',
        detail: 'The payee claims to be "GPayCashbackDept", using institutional keywords without a verified Merchant Category Code (MCC). This is an individual account spoofing official support.',
        severity: 'critical'
      },
      {
        title: 'Pre-set Transfer Amount: ₹4999.00',
        detail: 'The QR has hard-coded an immediate deduction of ₹4999.00. Once authorized via PIN, UPI transactions are instant and irrevocable.',
        severity: 'critical'
      }
    ],
    tactics: ['Reverse Payment Trap', 'PIN Authorization Trick', 'Fake Reward Deception'],
    aiExplanation: {
      summary: 'CRITICAL THREAT: This is the classic Indian UPI "Scan to Receive Money" reverse-debit scam. The fraudster sent a payment request QR masquerading as a cashback reward. If scanned, the banking app will prompt for your UPI PIN to DEDUCT ₹4,999.',
      socialEngineeringTactics: ['Reverse Debit Scheme', 'Authority Spoofing', 'Greed / Fake Cashback'],
      immediateAction: 'DO NOT SCAN OR ENTER YOUR UPI PIN. Remember: You NEVER enter your UPI PIN to receive money, cashback, or refunds.',
      keyTakeaway: 'UPI PIN is solely used for deducting money from your account. No technology on earth requires a PIN to receive a payment into your account.',
      complaintDraft: `=== NATIONAL CYBER CRIME REPORTING PORTAL (1930) DRAFT ===
Incident Category: UPI Reverse-Debit Fraud Attempt
Suspect UPI URI: upi://pay?pa=rewards-cashback-desk@okhdfcbank&pn=GPayCashbackDept&am=4999.00
Suspect VPA: rewards-cashback-desk@okhdfcbank
Claimed Scheme: Fake Cashback Reward`
    }
  });

  const handleAnalyze = async ({ qrContent, userContext }) => {
    setIsAnalyzing(true);
    try {
      const response = await apiFetch('/api/analyze/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrContent, userContext })
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
          <span className="text-xs font-mono text-rose-400">Dedicated UPI QR Security Chamber</span>
        </div>
      </Reveal>

      {/* Input Analyzer Card (with QR Image File Upload & Camera) */}
      <Reveal delay={0.1}>
        <div className="glass-panel p-5 sm:p-7 border border-white/10 shadow-2xl">
          <QRScanner onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </div>
      </Reveal>

      {/* 3D Telemetry Matrix */}
      <section className="space-y-4 pt-2">
        <Reveal delay={0.15}>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-rose-400" />
            <h2 className="text-sm font-bold font-heading text-white">
              UPI QR Fraud Analysis & 3D Telemetry
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
