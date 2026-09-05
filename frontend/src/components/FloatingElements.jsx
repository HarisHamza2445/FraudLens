import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ShieldAlert, QrCode, Link2, Wifi, Eye, Lock } from 'lucide-react';

const FLOATING_ITEMS = [
  { label: 'KYC Phishing', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { label: 'QR Trap', icon: QrCode, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { label: 'UPI Fraud', icon: Link2, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { label: 'WiFi Sniffing', icon: Wifi, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { label: 'Identity Theft', icon: Eye, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  { label: 'Data Breach', icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
];

const POSITIONS = [
  { top: '12%', left: '4%', animDuration: 18 },
  { top: '8%', right: '6%', animDuration: 22 },
  { top: '55%', left: '2%', animDuration: 20 },
  { top: '60%', right: '3%', animDuration: 24 },
  { top: '30%', left: '7%', animDuration: 16 },
  { top: '35%', right: '5%', animDuration: 21 },
];

function FloatingCard({ item, position, mouseX, mouseY, index }) {
  const Icon = item.icon;

  return (
    <motion.div
      className={`floating-el absolute z-[1] hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl glass-card ${item.bg} border ${item.border} backdrop-blur-md cursor-default select-none`}
      style={{
        top: position.top,
        left: position.left,
        right: position.right,
        animationDuration: `${position.animDuration}s`,
        x: mouseX,
        y: mouseY,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2 + index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Icon className={`h-3.5 w-3.5 ${item.color}`} />
      <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap">{item.label}</span>
    </motion.div>
  );
}

export default function FloatingElements() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 15 });

  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x * 20);
      mouseY.set(y * 15);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {FLOATING_ITEMS.map((item, i) => (
        <FloatingCard
          key={item.label}
          item={item}
          position={POSITIONS[i]}
          mouseX={springX}
          mouseY={springY}
          index={i}
        />
      ))}
    </div>
  );
}
