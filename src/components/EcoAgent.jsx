import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Target, ArrowRight, ShieldCheck, MessageSquare, Bot } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';

const EcoAgent = () => {
  const { ecoPoints, cartTotal } = useGlobalState();
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiStatus, setAiStatus] = useState('Idle'); // Idle, Analyzing, Suggesting
  const [insight, setInsight] = useState(null);

  const insights = [
    {
      title: 'Optimize Swap Route',
      description: '3 neighbors in your 2km radius have items matching your "Tech" interest. Initiating a bulk-swap could save 12.4kg of logistics CO2.',
      impact: '+45 pts',
      icon: Target
    },
    {
      title: 'Surplus Alert: Green Deli',
      description: 'The "Green Deli" just posted 5 portions of organic salads with a 2h deadline. Your path to work passes this node.',
      impact: '+25 pts',
      icon: Zap
    },
    {
      title: 'Portfolio Rebalance',
      description: 'Your circularity score is 81. Swapping your "Solar Power Bank" instead of selling it will push you to "Earth Guardian" rank.',
      impact: 'Rank Up',
      icon: Brain
    }
  ];

  useEffect(() => {
    if (isExpanded) {
      setAiStatus('Analyzing');
      const timer = setTimeout(() => {
        setAiStatus('Suggesting');
        setInsight(insights[Math.floor(Math.random() * insights.length)]);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setAiStatus('Idle');
      setInsight(null);
    }
  }, [isExpanded]);

  return (
    <div className="fixed bottom-32 right-8 z-40">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            className="mb-6 w-80 bg-[#0A0F0D]/90 backdrop-blur-3xl border border-emerald-500/30 rounded-[2.5rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden relative"
          >
            {/* Background Neural Network Animation */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border-[1px] border-emerald-500/20 rounded-full border-dashed"
               />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                  <Brain size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none">Agentic AI</h4>
                  <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] mt-1">{aiStatus} Environment...</p>
                </div>
              </div>

              {aiStatus === 'Analyzing' ? (
                <div className="py-12 flex flex-col items-center gap-4">
                   <motion.div 
                     animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
                   />
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Processing Nodes</p>
                </div>
              ) : insight ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                       <insight.icon size={16} className="text-emerald-400" />
                       <h5 className="text-base font-black text-white leading-tight">{insight.title}</h5>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-6">
                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Potential Impact</span>
                    <span className="text-sm font-black text-white">{insight.impact}</span>
                  </div>

                  <button className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all">
                    Execute Instruction <ArrowRight size={14} />
                  </button>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative overflow-hidden ${
          isExpanded 
            ? 'bg-emerald-500 text-white rotate-90' 
            : 'bg-[#121816]/80 backdrop-blur-2xl text-emerald-400 border border-emerald-500/40'
        }`}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <Bot size={28} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center">
               <Brain size={28} className="relative z-10" />
               <motion.div 
                 animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-20"
               />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default EcoAgent;
