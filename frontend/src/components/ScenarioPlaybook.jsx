import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldAlert, ShieldCheck, AlertTriangle, Play, ExternalLink } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import { soundFX } from '../utils/soundEffects';

const SCAM_SHOWCASE_ITEMS = [
  {
    id: '#001',
    category: 'Fake KYC',
    type: 'message',
    title: 'SBI YONO Account Suspension SMS',
    description: 'Urgent SMS threatening SIM & bank account freeze unless PAN card is updated via spoofed link.',
    threatLevel: 'High Risk',
    score: 94,
    samplePayload: 'Dear customer your SBI bank account will be suspended today. Click link to update your PAN and Aadhaar card immediately http://sbi-pan-kyc.vip',
    tags: ['Fake KYC', 'Urgency', 'Bank Spoof']
  },
  {
    id: '#002',
    category: 'Utility Threats',
    type: 'message',
    title: 'Electricity Power Disconnection Threat (9:30 PM)',
    description: 'Threatens home power cut at 9:30 PM and provides personal 10-digit mobile number as electricity officer.',
    threatLevel: 'High Risk',
    score: 92,
    samplePayload: 'Dear consumer your electricity power will be disconnected tonight at 9:30 PM from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer at 9876543210.',
    tags: ['Electricity Scam', 'Panic Induction', 'Personal Number']
  },
  {
    id: '#003',
    category: 'Reverse QR',
    type: 'qr',
    title: 'The "Scan to Receive Cashback" QR Trap',
    description: 'Scammer promises ₹4,999 cashback, but sends a upi://pay debit request with hard-coded deduction amount.',
    threatLevel: 'High Risk',
    score: 98,
    samplePayload: 'upi://pay?pa=rewards-cashback-desk@okhdfcbank&pn=GPayCashbackDept&am=4999.00&cu=INR&tn=CashbackRewardCreditApproved',
    expectedAction: 'receive',
    tags: ['Reverse Debit', 'PIN Fraud', 'UPI Protocol']
  },
  {
    id: '#004',
    category: 'Phishing Links',
    type: 'url',
    title: 'Typosquatted SBI Netbanking (sbi-pan-kyc.vip)',
    description: 'Credential harvesting phishing domain with deceptive .vip top-level extension mimicry.',
    threatLevel: 'High Risk',
    score: 89,
    samplePayload: 'http://sbi-pan-kyc-verify.vip',
    tags: ['Typosquatting', '.vip TLD', 'Phishing']
  },
  {
    id: '#005',
    category: 'Reverse QR',
    type: 'qr',
    title: 'OLX Army Officer Advance Payment QR',
    description: 'Fraudulent buyer on classifieds marketplace sends QR saying "scan and approve to receive advance payment".',
    threatLevel: 'High Risk',
    score: 96,
    samplePayload: 'upi://pay?pa=olx-advance-agent@okaxis&pn=ArmyOfficerBuyer&am=12000.00&cu=INR&tn=ItemAdvancePayment',
    expectedAction: 'receive',
    tags: ['Marketplace Scam', 'Reverse Debit', 'Impersonation']
  },
  {
    id: '#006',
    category: 'Phishing Links',
    type: 'url',
    title: 'Trojan APK Delivery (jio-5g-upgrade.apk)',
    description: 'Direct download link targeting Android devices to install screen-sharing or SMS-stealing malware.',
    threatLevel: 'High Risk',
    score: 95,
    samplePayload: 'http://jio-5g-upgrade-secure.apk',
    tags: ['Android APK', 'Trojan', 'OTP Theft']
  },
  {
    id: '#007',
    category: 'Fake KYC',
    type: 'message',
    title: 'Work-From-Home YouTube Like WhatsApp Scam',
    description: 'Promises ₹5,000/day for liking videos, funneling victims to prepaid Telegram investment scams.',
    threatLevel: 'High Risk',
    score: 87,
    samplePayload: 'Part time work from home opportunity! Earn Rs 3,000 to 5,000 daily by liking YouTube videos and rating hotels. Contact HR on WhatsApp now wa.me/919988776655.',
    tags: ['Part-time Job', 'Prepaid Task', 'WhatsApp Bait']
  },
  {
    id: '#008',
    category: 'Safe Patterns',
    type: 'qr',
    title: 'Verified Swiggy Food Delivery QR',
    description: 'Legitimate merchant transaction with compliant Merchant Category Code (5812) and verified banking handle.',
    threatLevel: 'Safe',
    score: 12,
    samplePayload: 'upi://pay?pa=swiggy.food@icici&pn=Swiggy&mc=5812&am=380.00&cu=INR&tn=Order940192',
    expectedAction: 'pay',
    tags: ['Merchant Verified', 'MCC 5812', 'Safe Debit']
  },
  {
    id: '#009',
    category: 'Safe Patterns',
    type: 'message',
    title: 'Official Bank Transaction Alert',
    description: 'Standard debit alert SMS from bank with masked account number and clear UPI reference ID.',
    threatLevel: 'Safe',
    score: 8,
    samplePayload: 'Sent Rs 450.00 from HDFC Bank A/c XX4019 to Swiggy via UPI Ref No 429104928172. Available balance is Rs 24,190.00.',
    tags: ['Genuine Bank SMS', 'No Urgency', 'Legitimate']
  }
];

const CATEGORIES = ['All Scenarios', 'Reverse QR', 'Fake KYC', 'Utility Threats', 'Phishing Links', 'Safe Patterns'];

export default function ScenarioPlaybook({ onRunScenario }) {
  const [activeCategory, setActiveCategory] = useState('All Scenarios');

  const filteredItems = SCAM_SHOWCASE_ITEMS.filter((item) => {
    if (activeCategory === 'All Scenarios') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-pulse">Attack Playbook</span>
              <span className="text-xs font-mono text-cyan-400">{filteredItems.length} Curated Scenarios</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white mt-1">
              Real-World UPI Scam & Attack Patterns
            </h2>
            <p className="text-xs text-slate-400">
              Live threat-vector library. Run any scenario through the detection engine.
            </p>
          </div>

          {/* Category Filter Pills (21st.dev style horizontal scroll) */}
          <Stagger className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none" gap={0.04}>
            {CATEGORIES.map((cat) => (
              <StaggerItem key={cat} y={12}>
                <button
                  onClick={() => {
                    soundFX.playHover();
                    setActiveCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                    activeCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Reveal>

      {/* Grid of CollectUI Cards */}
      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isHigh = item.threatLevel === 'High Risk';
          return (
            <StaggerItem key={item.id}>
              <div className="group glass-card p-4 rounded-xl flex flex-col justify-between space-y-3 relative overflow-hidden h-full hover:scale-[1.02] hover:-translate-y-1 hover:border-white/20 transition-all">
                {/* Top Bar: ID and Threat Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-400">{item.id}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isHigh
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {item.threatLevel} ({item.score}/100)
                  </span>
                </div>

                {/* Title and Description */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/[0.04] text-slate-400 border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Button: Feed into 3D Analyzer */}
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{item.type}</span>
                  <button
                    onClick={() => {
                      soundFX.playScan();
                      onRunScenario(item);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition-all active:scale-95"
                  >
                    <Play className="h-3 w-3 fill-cyan-400 text-cyan-400" />
                    <span>Run in 3D Threat Engine</span>
                  </button>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
