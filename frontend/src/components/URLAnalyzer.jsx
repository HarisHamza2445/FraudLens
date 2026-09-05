import React, { useState } from 'react';
import { Link2, ArrowRight, RotateCcw, Sparkles, Globe, ShieldAlert } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

const PRESET_URLS = [
  { label: 'SBI Phishing (.vip)', url: 'http://sbi-pan-kyc-verify.vip' },
  { label: 'HDFC Spoof (.top)', url: 'http://hdfc-bank-netbanking.top/login' },
  { label: 'Malicious APK Link', url: 'http://jio-5g-upgrade-secure.apk' },
  { label: 'Raw IP Address', url: 'http://192.168.1.100/paytm-security-alert' },
  { label: 'Official SBI Portal', url: 'https://onlinesbi.sbi' }
];

export default function URLAnalyzer({ onAnalyze, isAnalyzing }) {
  const [url, setUrl] = useState(PRESET_URLS[0].url);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!url.trim()) return;
    soundFX.playScan();
    onAnalyze({ type: 'url', url });
  };

  const handleSelectPreset = (presetUrl) => {
    soundFX.playHover();
    setUrl(presetUrl);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white font-heading flex items-center gap-2">
            <span>Inspect Suspicious Link / Payment URL</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              Typosquatting & TLD Scanner
            </span>
          </h3>
          <p className="text-xs text-slate-400">Checks domain entropy, Levenshtein brand distance, malicious TLDs, and APK downloads.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFX.playHover();
            setUrl('');
          }}
          className="self-start sm:self-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Clear URL</span>
        </button>
      </div>

      {/* Preset Quick-Test Buttons */}
      <div>
        <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Example Threat Vectors:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_URLS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectPreset(preset.url)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all hover:border-cyan-500/30 active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex items-center rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm focus-within:border-cyan-500/50 transition-all px-3 py-1">
          <Globe className="h-5 w-5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste suspicious website link or payment portal URL (e.g. sbi-kyc.vip)..."
            className="w-full bg-transparent py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isAnalyzing || !url.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Checking URL Security...</span>
              </>
            ) : (
              <>
                <span>Scan URL Safety</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
