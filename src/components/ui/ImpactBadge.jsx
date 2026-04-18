import React from 'react';
import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const ImpactBadge = ({ co2, size = 'md' }) => {
  const isPositive = co2 < 0.5; // Arbitrary threshold for "Low Impact"
  
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
        ${isPositive ? 'bg-sage-100 text-sage-700' : 'bg-orange-100 text-orange-700'}
        border border-black/5 backdrop-blur-sm shadow-sm`}
    >
      <Leaf size={14} className={isPositive ? 'text-sage' : 'text-orange-500'} />
      <span>{co2}kg <span className="opacity-70 font-normal">CO₂e</span></span>
    </motion.div>
  );
};

export default ImpactBadge;
