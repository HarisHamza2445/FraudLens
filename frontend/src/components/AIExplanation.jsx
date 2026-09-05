import React, { useState } from 'react';
import { Bot, Copy, Check, FileText, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

export default function AIExplanation({ aiExplanation, classification }) {
  const [copied, setCopied] = useState(false);
  const [showFullDraft, setShowFullDraft] = useState(false);

  if (!aiExplanation) return null;

  const handleCopyDraft = () => {
    soundFX.playHover();
    if (aiExplanation.complaintDraft) {
      navigator.clipboard.writeText(aiExplanation.complaintDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHighRisk = classification === 'High Risk';

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white font-heading">Explainable AI (XAI) Cognitive Breakdown</h4>
            <p className="text-[11px] text-slate-400">Contextual deception analysis & psychological vectors</p>
          </div>
        </div>

        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
          aiExplanation.generatedByLLM
            ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
        }`}>
          {aiExplanation.generatedByLLM ? 'LLM-Generated Reasoning' : 'Rule-Based Reasoning'}
        </span>
      </div>

      {/* Summary Box */}
      <p className="text-xs text-slate-200 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/[0.06]">
        {aiExplanation.summary}
      </p>

      {/* Social Engineering Vectors & Key Takeaway */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <span className="text-[11px] font-mono text-cyan-400 block font-medium">PSYCHOLOGICAL VECTORS</span>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            {(aiExplanation.socialEngineeringTactics || []).map((tactic, idx) => (
              <li key={idx}>{tactic}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
          <span className="text-[11px] font-mono text-emerald-400 block font-medium">CRITICAL SAFETY RULE</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {aiExplanation.keyTakeaway}
          </p>
        </div>
      </div>

      {/* Immediate Recommended Action */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
        isHighRisk
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`}>
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold block uppercase font-mono tracking-wider">
            RECOMMENDED IMMEDIATE ACTION:
          </span>
          <span className="text-slate-300 leading-relaxed block mt-0.5">
            {aiExplanation.immediateAction}
          </span>
        </div>
      </div>

      {/* Cybercrime 1930 Report Generator Button */}
      {isHighRisk && (
        <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 font-mono">
            <span>Ready to report to Indian Cyber Crime Cell (1930 / cybercrime.gov.in)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playHover();
                setShowFullDraft(!showFullDraft);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-slate-300 transition-all"
            >
              {showFullDraft ? 'Hide Draft' : 'Preview 1930 Complaint Draft'}
            </button>

            <button
              onClick={handleCopyDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/15 transition-all active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Official Report'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Expanded Cybercrime Complaint Draft Area */}
      {showFullDraft && isHighRisk && (
        <div className="relative mt-2 p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-slate-300 leading-relaxed max-h-60 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{aiExplanation.complaintDraft}</pre>
        </div>
      )}
    </div>
  );
}
