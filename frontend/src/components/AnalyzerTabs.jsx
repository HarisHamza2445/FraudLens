import React from 'react';
import { MessageSquareText, Link2, QrCode, Sparkles, History } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

export default function AnalyzerTabs({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'message', label: 'Message & SMS Analyzer', icon: MessageSquareText, count: 'NLP + ML' },
    { id: 'url', label: 'URL & Phishing Scanner', icon: Link2, count: 'Typosquatting' },
    { id: 'qr', label: 'UPI QR & Intent Scanner', icon: QrCode, count: 'Reverse-Debit Trap' },
    { id: 'gallery', label: 'CollectUI Scam Showcase', icon: Sparkles, count: '12 Scenarios' },
    { id: 'history', label: 'Audit Log & History', icon: History, count: 'Persisted' }
  ];

  return (
    <div className="w-full flex items-center justify-start sm:justify-center border-b border-white/[0.08] overflow-x-auto py-2 px-4 scrollbar-none">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.playHover();
                onSelectTab(tab.id);
              }}
              onMouseEnter={() => soundFX.playHover()}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 outline-none ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/10 text-white border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                isActive ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' : 'bg-white/[0.05] border-white/5 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
