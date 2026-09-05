import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ExternalLink, Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';

const LandingDashboard = lazy(() => import('./pages/LandingDashboard'));
const MessagePage = lazy(() => import('./pages/MessagePage'));
const URLPage = lazy(() => import('./pages/URLPage'));
const QRPage = lazy(() => import('./pages/QRPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ModelPage = lazy(() => import('./pages/ModelPage'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/" element={<LandingDashboard />} />
            <Route path="/message" element={<MessagePage />} />
            <Route path="/url" element={<URLPage />} />
            <Route path="/qr" element={<QRPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/model" element={<ModelPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const footerCol = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  const listItem = {
    hidden: { opacity: 0, x: -12 },
    show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#07070a] text-slate-100 cyber-grid relative overflow-x-hidden">
        {/* Ambient Radial Glow */}
        <div className="ambient-glow" />

        {/* Global Multi-Page Navbar */}
        <Navbar />

        {/* Main Content Viewport */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <AnimatedRoutes />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-white/[0.08] bg-[#07070a] mt-20 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-12 gap-10"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              {/* Brand column */}
              <motion.div variants={footerCol} className="md:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-rose-500/20 border border-white/15"
                    whileHover={{ scale: 1.1, rotate: 8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Shield className="h-4 w-4 text-cyan-400" />
                  </motion.div>
                  <span className="text-lg font-extrabold font-heading text-white">Fraud<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Lens</span></span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                  The living threat shield for digital payments. Real-time multi-vector detection across SMS, phishing URLs, and QR scams.
                </p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Systems operational
                </div>
              </motion.div>

              {/* Modules */}
              <motion.div variants={footerCol} className="md:col-span-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4 font-heading">Detection Modules</h4>
                <ul className="space-y-2.5 text-sm text-slate-400">
                  {['Message & SMS Analyzer', 'URL Phishing Scanner', 'QR Security Chamber', 'Audit History'].map((m) => (
                    <motion.li
                      key={m}
                      variants={listItem}
                      className="group flex items-center gap-2 cursor-pointer transition-colors hover:text-white"
                    >
                      <span className="h-px w-0 bg-cyan-400 transition-all duration-300 group-hover:w-4" />
                      {m}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Resources */}
              <motion.div variants={footerCol} className="md:col-span-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4 font-heading">Security Resources</h4>
                <ul className="space-y-3 text-sm">
                  <motion.li variants={listItem}>
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                      <span className="font-semibold">National Cyber Crime Portal</span>
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                    <p className="text-xs text-slate-500 mt-0.5">Report fraud · Helpline 1930 · cybercrime.gov.in</p>
                  </motion.li>
                  <motion.li variants={listItem}>
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="font-semibold">Powered by</span>
                      <span className="font-mono text-xs text-slate-500">TF-IDF · Naive Bayes · XAI · Three.js</span>
                    </span>
                  </motion.li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Legal bar */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-500"
            >
              <span>© 2026 FraudLens · UPI Scam Detection &amp; Risk Analysis System</span>
              <div className="flex items-center gap-5">
                <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Report</a>
              </div>
            </motion.div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
