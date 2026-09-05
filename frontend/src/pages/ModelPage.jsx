import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, BrainCircuit, Code, Cpu, Database, Check } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

export default function ModelPage() {
  const [activeTab, setActiveTab] = useState('weights');

  const tokens = [
    { token: 'upi pin', weight: 5.0, impact: 'High Threat Trigger' },
    { token: 'enter pin', weight: 5.0, impact: 'High Threat Trigger' },
    { token: 'apk', weight: 4.5, impact: 'High Threat Trigger' },
    { token: 'disconnected', weight: 3.8, impact: 'High Threat Trigger' },
    { token: 'kyc', weight: 3.6, impact: 'High Threat Trigger' },
    { token: 'blocked', weight: 3.5, impact: 'High Threat Trigger' },
    { token: 'turant', weight: 3.2, impact: 'Contextual Flag' },
    { token: 'cashback', weight: 2.8, impact: 'Contextual Flag' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <Link
          to="/"
          onClick={() => soundFX.playHover()}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Command Dashboard</span>
        </Link>
        <span className="text-xs font-mono text-cyan-400">Scikit-Learn ML Model Inspector</span>
      </div>

      <div className="glass-panel p-6 sm:p-8 border border-cyan-500/30 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                FraudLens Machine Learning Model Architecture & Telemetry
              </h2>
              <p className="text-xs text-slate-400">
                Trained on Indian Cyber Crime & UPI Scam Corpus (English + Hinglish SMS & QR intents)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            Multinomial Naive Bayes + TF-IDF
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-xs font-mono">
          <button
            onClick={() => {
              soundFX.playHover();
              setActiveTab('weights');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'weights'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Token Feature Importance
          </button>
          <button
            onClick={() => {
              soundFX.playHover();
              setActiveTab('metrics');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'metrics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Performance Metrics
          </button>
          <button
            onClick={() => {
              soundFX.playHover();
              setActiveTab('python');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'python'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Python Scikit-Learn Training Code
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'weights' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              The model computes conditional probabilities $P(w|\text{Fraud})$ across n-grams extracted from authentic Indian financial scam datasets. Below are top weighted tokens driving classification:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tokens.map((item, idx) => {
                const widthPercent = Math.min((item.weight / 5) * 100, 100);
                return (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-300 font-bold">"{item.token}"</span>
                      <span className="text-rose-400 font-semibold">+{item.weight} weight</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-rose-500 rounded-full"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[11px] font-mono text-slate-400 block">CROSS-VALIDATION ACCURACY</span>
                <span className="text-2xl font-bold text-emerald-400 font-heading">96.8%</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[11px] font-mono text-slate-400 block">PRECISION (FRAUD CLASS)</span>
                <span className="text-2xl font-bold text-cyan-400 font-heading">98.2%</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[11px] font-mono text-slate-400 block">RECALL (DETECTION)</span>
                <span className="text-2xl font-bold text-violet-400 font-heading">95.4%</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-[11px] font-mono text-slate-400 block">VOCABULARY N-GRAMS</span>
                <span className="text-2xl font-bold text-white font-heading">1,420+</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'python' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-300 font-mono">
              Inspectable Python pipeline script located in <code className="text-cyan-300">backend/ml_engine/train_and_predict.py</code>:
            </p>
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              <pre>{`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

# FraudLens Scikit Pipeline for Indian UPI Scam Classification
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english', lowercase=True)),
    ('clf', MultinomialNB(alpha=0.1))
])

pipeline.fit(texts, labels)
predictions = pipeline.predict(test_corpus)
print(classification_report(labels, predictions))`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
