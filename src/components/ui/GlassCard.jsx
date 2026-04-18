import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  return (
    <motion.div
      whileHover={hover ? { 
        y: -10, 
        scale: 1.01,
        transition: { duration: 0.4, ease: "easeOut" }
      } : {}}
      onClick={onClick}
      className={`
        relative rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500
        bg-[#121816]/60 backdrop-blur-2xl border border-white/5
        ${hover ? 'hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Internal Glow Effect on Hover */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;

