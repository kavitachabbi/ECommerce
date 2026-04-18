import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Leaf, Recycle, LayoutDashboard, Zap, Banknote } from 'lucide-react';
import { useGlobalState } from '../../context/GlobalState';

const Navbar = () => {
  const { ecoPoints, ecoRank, userRole } = useGlobalState();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const navItems = userRole === 'admin' ? [
    { path: '/admin',         icon: LayoutDashboard, label: 'Command' },
    { path: '/admin-finance', icon: Banknote,        label: 'Finance' },
    { path: '/marketplace',   icon: ShoppingBag,     label: 'Shop'    },
  ] : [
    { path: '/marketplace',   icon: ShoppingBag,    label: 'Shop'    },
    { path: '/food-rescue',    icon: Leaf,           label: 'Rescue'  },
    { path: '/upcycle',        icon: Recycle,        label: 'Upcycle' },
    { path: '/dashboard',      icon: LayoutDashboard,label: 'Hub'     },
  ];

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[#121816]/80 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-[2.5rem] flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Back to Home Button */}
        {!isHome && (
          <NavLink
            to="/"
            className="group relative flex flex-col items-center gap-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 group-active:scale-95 transition-all">
              <Zap size={22} className="fill-current" />
            </div>
          </NavLink>
        )}
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center gap-1 group transition-all duration-300
              ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-500 hover:text-slate-300'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest font-display">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute -bottom-3 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="h-8 w-px bg-white/10 mx-2" />

        {/* Pulsing '420 Champion' Rank */}
        <NavLink 
          to="/dashboard"
          className="relative bg-emerald-500/10 rounded-2xl px-5 py-2 flex items-center gap-3 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all duration-300 group overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute -inset-2 bg-emerald-400/20 rounded-full blur-sm"
            />
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Leaf size={14} className="text-emerald-400" />
            </div>
          </div>
          <div className="flex flex-col relative z-10">
            <span className="text-base font-black text-white leading-none tracking-tight drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
              {ecoPoints}
            </span>
            <span className="text-[10px] text-emerald-400 font-black uppercase leading-tight tracking-[0.2em] drop-shadow-[0_0_2px_rgba(16,185,129,0.8)]">
              Champion
            </span>
          </div>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;

