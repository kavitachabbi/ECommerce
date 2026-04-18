import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  ChevronRight, 
  Zap,
  Target,
  Brain
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen h-screen relative overflow-hidden font-sans">
      
      {/* ── FULL-SCREEN BACKGROUND ── */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/ecolife.png" 
          alt="EcoLife Hub" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
        {/* Subtle teal glow at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-950/60 to-transparent" />
      </div>

      {/* ── FOREGROUND CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">

        {/* ── Hero Title ── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/30 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase text-emerald-300 tracking-[0.4em]">System Online · Agentic AI Protocol Active</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-6 drop-shadow-2xl">
            Live Life <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 italic">
              in the Loop.
            </span>
          </h1>
          <p className="text-white/50 text-base md:text-lg font-medium max-w-xl mx-auto">
            Your integrated sustainability hub powered by <span className="text-emerald-400">Agentic AI</span>. Choose your portal to begin the transformation.
          </p>
        </motion.div>

        {/* ── Login Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl"
        >
          {/* User Card */}
          <LoginCard
            type="User"
            title="User Portal"
            description="Access your AI-driven eco-advisor, rescue food, and join the circular economy."
            icon={User}
            accent="emerald"
            onOpen={() => navigate('/user-login')}
          />

          {/* Admin Card */}
          <LoginCard
            type="Admin"
            title="Admin Portal"
            description="Manage global listings with Agentic AI oversight and oversee system metrics."
            icon={ShieldCheck}
            accent="blue"
            onOpen={() => navigate('/admin-login')}
          />

          {/* Oversight Card */}
          <LoginCard
            type="Oversight"
            title="Revenue Hub"
            description="Analyze 10/90 splits, authorize transactions, and monitor fiscal ecosystem health."
            icon={Zap}
            accent="amber"
            onOpen={() => navigate('/admin-finance')}
          />
        </motion.div>

        {/* ── Eco Stats Strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-16 text-white/30"
        >
          <PortalFeature icon={Brain} text="Agentic Insight Engine" />
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <PortalFeature icon={Zap} text="Autonomous Marketplace" />
          <div className="w-px h-8 bg-white/10 hidden md:block" />
          <PortalFeature icon={Target} text="Precise Resource Allocation" />
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-4 opacity-25">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">EcoLoop AI v2.0</span>
          <div className="w-1 h-1 bg-white rounded-full" />
          <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">© 2026 Agentic Sustainability Protocol</span>
        </div>
      </footer>
    </div>
  );
};

const PortalFeature = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400/50 border border-emerald-500/20">
      <Icon size={16} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{text}</span>
  </div>
);

// ── Login Card Sub-Component ──────────────────────────────────
const LoginCard = ({ title, description, icon: Icon, accent, onOpen }) => {
  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="flex-1 text-left group"
    >
      <div className={`relative p-8 rounded-[2.5rem] bg-white/[0.04] backdrop-blur-2xl border transition-all duration-500 overflow-hidden shadow-2xl cursor-pointer
        ${accent === 'emerald' ? 'border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-emerald-500/10' : 
          accent === 'blue' ? 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-blue-500/10' :
          'border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 hover:shadow-amber-500/10'} 
        hover:shadow-[0_30px_80px_rgba(0,0,0,0.4)]`}
      >
        {/* BG Icon */}
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Icon size={110} />
        </div>

        {/* Icon Badge */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-transform duration-500 group-hover:scale-110 ${
          accent === 'emerald' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
          accent === 'blue' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' :
          'bg-amber-500/15 text-amber-400 border-amber-500/25'
        }`}>
          <Icon size={26} />
        </div>

        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-white/40 text-sm font-medium leading-relaxed mb-8">{description}</p>

        <div className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 ${
          accent === 'emerald' ? 'text-emerald-400' :
          accent === 'blue' ? 'text-blue-400' :
          'text-amber-400'
        }`}>
          Sign In <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.button>
  );
};

export default LandingPage;
