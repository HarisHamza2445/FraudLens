import React, { useState } from 'react';
import { Sparkles, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

const PRESET_TEMPLATES = [
  {
    label: 'Electricity Cut-off SMS',
    text: 'Dear consumer your electricity power will be disconnected tonight at 9:30 PM from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer at 9876543210.'
  },
  {
    label: 'Fake SBI KYC Block',
    text: 'Dear customer your SBI bank account will be suspended today. Click link to update your PAN and Aadhaar card immediately http://sbi-pan-kyc.vip to avoid deactivation.'
  },
  {
    label: 'Cashback / PIN Trap',
    text: 'Congratulations! You have won a cash prize of Rs 50,000 from PhonePe Lucky Draw. Scan the QR code and enter your UPI PIN to claim money into your account.'
  },
  {
    label: 'Part-Time Job WhatsApp',
    text: 'Part time work from home opportunity! Earn Rs 3,000 to 5,000 daily by liking YouTube videos and rating hotels. Contact HR on WhatsApp now wa.me/919988776655.'
  },
  {
    label: 'Genuine Bank Alert',
    text: 'Sent Rs 450.00 from HDFC Bank A/c XX4019 to Swiggy via UPI Ref No 429104928172. Available balance is Rs 24,190.00.'
  }
];

export default function MessageAnalyzer({ onAnalyze, isAnalyzing }) {
  const [text, setText] = useState(PRESET_TEMPLATES[0].text);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    soundFX.playScan();
    onAnalyze({ type: 'message', text });
  };

  const handleSelectPreset = (presetText) => {
    soundFX.playHover();
    setText(presetText);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white font-heading flex items-center gap-2">
            <span>Analyze Suspicious SMS / WhatsApp / Telegram Message</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              English & Hinglish
            </span>
          </h3>
          <p className="text-xs text-slate-400">Detects fake KYC deactivation, electricity threats, lottery baits, and coercive language.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playHover();
            setText('');
          }}
          className="self-start sm:self-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Clear text</span>
        </button>
      </div>

      {/* Preset Quick-Test Buttons */}
      <div>
        <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Example Threat Vectors:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TEMPLATES.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectPreset(preset.text)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all hover:border-cyan-500/30 active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm focus-within:border-cyan-500/50 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste suspicious SMS, WhatsApp forward, or payment message here..."
            rows={4}
            className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
            <span>{text.length} characters</span>
            <span>TF-IDF + Naive Bayes + Heuristic NLP</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isAnalyzing || !text.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Running ML Scam Model...</span>
              </>
            ) : (
              <>
                <span>Analyze Message in 3D</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
