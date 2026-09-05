import React from 'react';
import { motion } from 'framer-motion';

export default function GlowButton({ children, onClick, variant = 'primary', className = '' }) {
  const isPrimary = variant === 'primary';

  return (
    <motion.button
      onClick={onClick}
      className={`
        relative group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl
        font-semibold text-sm tracking-wide transition-all duration-300
        ${isPrimary
          ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20'
          : 'bg-white/[0.06] text-slate-200 border border-white/[0.12] hover:border-white/20'
        }
        hover:scale-[1.03] active:scale-[0.98]
        ${className}
      `}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {isPrimary && <span className="glow-button-shimmer" />}
      {children}
    </motion.button>
  );
}
