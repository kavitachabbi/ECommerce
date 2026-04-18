import React from 'react';
import { motion } from 'framer-motion';

const HubShimmer = () => {
  return (
    <div className="relative max-w-5xl mx-auto mb-20">
      <div className="w-full aspect-[16/9] bg-[#121816]/60 rounded-[3rem] relative overflow-hidden border border-white/5">
        {/* Shimmer sweep */}
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent"
        />

        {/* Floating card mockups */}
        <div className="absolute top-[15%] left-[18%] w-[55%] h-[45%] bg-white/5 rounded-[2rem] rotate-[-1.5deg] border border-white/5 flex items-center justify-center">
          <div className="w-[50%] h-[35%] bg-white/5 rounded-2xl border border-white/5" />
        </div>

        {/* Left accent panel */}
        <div className="absolute bottom-[12%] left-[8%] w-[16%] h-[42%] bg-emerald-500/5 rounded-2xl rotate-[4deg] border border-emerald-500/10" />

        {/* Top-right card */}
        <div className="absolute top-[25%] right-[12%] w-[14%] h-[28%] bg-white/5 rounded-2xl rotate-[8deg] border border-white/5" />

        {/* Bottom-right accent */}
        <div className="absolute bottom-[18%] right-[22%] w-[18%] h-[22%] bg-blue-500/5 rounded-2xl border border-blue-500/10" />

        {/* Pulsing dots */}
        {[[20, 35], [65, 25], [45, 70]].map(([x, y], i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.4, delay: i * 0.6 }}
            className="absolute w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-400/30"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default HubShimmer;
