import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 mb-6">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Join the Circle.</h2>
          <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">EcoLoop Registration</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" size={20} />
            <input 
              placeholder="Full Name" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" size={20} />
            <input 
              placeholder="Email Address" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" size={20} />
            <input 
              type="password"
              placeholder="Create Password" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        <button 
          onClick={() => navigate('/user-login')}
          className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
        >
          Create Account <ChevronRight size={18} />
        </button>

        <p className="text-center mt-8 text-white/30 text-xs font-bold uppercase tracking-widest">
          Already have an account? <span onClick={() => navigate('/user-login')} className="text-emerald-400 cursor-pointer hover:underline">Sign In</span>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
