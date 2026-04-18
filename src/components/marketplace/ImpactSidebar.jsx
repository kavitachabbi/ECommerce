import React from 'react';
import { useGlobalState } from '../../context/GlobalState';
import { Trash2, ShieldCheck, TreePine, Droplets, Bug } from 'lucide-react';
import { MOCK_DATA } from '../../data/mockData';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const ImpactSidebar = () => {
  const { cart, cartCO2, removeFromCart, offsetProject, setOffsetProject } = useGlobalState();

  const getOffsetIcon = (id) => {
    if (id === 'reforest') return <TreePine size={18} />;
    if (id === 'plastic') return <Droplets size={18} />;
    if (id === 'bees') return <Bug size={18} />;
    return <ShieldCheck size={18} />;
  };

  return (
    <div className="flex flex-col gap-6 sticky top-8">
      <GlassCard hover={false} float floatSeed={1} className="bg-sage/5 border-sage/10">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          Your Impact Hub
          <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
        </h3>
        
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total CO2 Savings</span>
            <span className="text-2xl font-black text-sage leading-none">{cartCO2} kg</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((cartCO2 / 10) * 100, 100)}%` }}
              className="bg-sage h-full"
            />
          </div>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.div
                key={`${item.id}-${Math.random()}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-3 bg-white/50 rounded-2xl border border-white/40"
              >
                <img src={item.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] font-medium text-slate-400">Impact: -{item.carbon}kg CO2</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <p className="text-center py-8 text-slate-400 text-sm font-medium italic">Your cart is light as air...</p>
          )}
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <h4 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">Carbon Offset Toggle</h4>
        <div className="space-y-3">
          {MOCK_DATA.offsetProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setOffsetProject(offsetProject?.id === project.id ? null : project)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300 ${
                offsetProject?.id === project.id 
                  ? 'border-sage bg-sage/5 ring-4 ring-sage/5' 
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                offsetProject?.id === project.id ? 'bg-sage text-white' : 'bg-white text-slate-400 shadow-sm'
              }`}>
                {getOffsetIcon(project.id)}
              </div>
              <div className="text-left">
                <p className={`text-xs font-bold ${offsetProject?.id === project.id ? 'text-sage' : 'text-slate-700'}`}>
                  {project.name}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">+${project.cost.toFixed(2)} / donation</p>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <Button className="w-full py-4 text-base shadow-xl shadow-sage/20">
        Checkout & Plant 🌿
      </Button>
    </div>
  );
};

export default ImpactSidebar;
