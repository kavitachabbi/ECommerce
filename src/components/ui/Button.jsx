import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon }) => {
  const variants = {
    primary: 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
    neon: 'btn-neon',
    secondary: 'bg-white/5 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10',
    ghost: 'text-slate-400 hover:text-white transition-colors uppercase text-[10px] tracking-[0.2em] font-black',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
  };

  const baseStyles = 'px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`${variant === 'ghost' ? '' : baseStyles} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} className={variant === 'primary' ? 'text-white' : ''} />}
      {children}
    </motion.button>
  );
};

export default Button;

