import React from 'react';
import { motion } from 'framer-motion';

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.06,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

export function TextReveal({ text, className = '', as = 'h1', gradient = false }) {
  const Tag = motion[as] || motion.h1;
  const words = text.split(' ');

  return (
    <Tag
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.3em]"
          variants={wordVariants}
          custom={i}
        >
          {gradient && i >= words.length - 3 ? (
            <span className="text-gradient">{word}</span>
          ) : (
            word
          )}
        </motion.span>
      ))}
    </Tag>
  );
}

export function FadeInUp({ children, delay = 0, className = '', duration = 0.7 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
