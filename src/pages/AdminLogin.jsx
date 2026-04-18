import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Key } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useToast } from '../components/ui/Toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useGlobalState();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation logic
  const caps = (password.match(/[A-Z]/g) || []).length;
  const lows = (password.match(/[a-z]/g) || []).length;
  const nums = (password.match(/[0-9]/g) || []).length;
  const isLen = password.length === 8;

  const validCaps = caps === 1;
  const validLows = lows === 5;
  const validNums = nums === 2;
  const validTotal = isLen && validCaps && validLows && validNums;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid Email Format');
      toast('Invalid Email Format', 'error');
      return;
    }

    // Password validation
    if (!validTotal) {
      setPasswordError('Password must contain 1 Capital, 5 Small, and 2 Numbers');
      toast('Password must contain 1 Capital, 5 Small, and 2 Numbers', 'error');
      return;
    }

    if (!pin) { 
      toast('Admin PIN is required.', 'error'); 
      return; 
    }
    
    setLoading(true);
    
    // Simulate auth delay & skeleton loader
    await new Promise(r => setTimeout(r, 1200));
    
    // Hardcoded logic for "security layer"
    if (pin === '1234' || pin === 'superadmin') {
      login('admin', 'superadmin');
      toast('Security Clearance: Super-Admin. Welcome.', 'success');
      const from = location.state?.from?.pathname || '/admin-action-center';
      navigate(from, { replace: true });
    } else if (pin === '0000' || pin === 'mod') {
      login('admin', 'moderator');
      toast('Security Clearance: Moderator. Welcome.', 'success');
      const from = location.state?.from?.pathname || '/admin-action-center';
      navigate(from, { replace: true });
    } else {
      toast('Invalid Admin PIN. Access Denied.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F0D] p-8 relative overflow-hidden">
      
      {/* Background ambient glow for Admin */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-700/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ rotate: -20, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[#121816] border border-emerald-500/30 rounded-[20px] text-emerald-400 mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
          >
            <ShieldCheck size={32} />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 leading-tight font-display">
            Admin Portal
          </h1>
          <p className="text-emerald-500/60 font-medium text-sm font-mono tracking-widest uppercase">Restricted Access</p>
        </div>

        {/* Charcoal Glass Panel */}
        <div className="bg-[#121816] border border-white/5 rounded-[20px] p-8 shadow-2xl relative overflow-hidden">
          
          {loading && (
            <div className="absolute inset-0 z-50 bg-[#121816]/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-[80%] space-y-3">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-1/2 h-full bg-emerald-500/50 rounded-full"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-500/50">
                  <span>Authenticating</span>
                  <span>Verifying PIN</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 ml-1 flex items-center gap-2">
                <Lock size={12} className="text-slate-600" /> Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="admin@ecoloop.earth"
                className={`w-full bg-[#0A0F0D] border rounded-xl px-5 py-3.5 text-white text-sm font-medium focus:outline-none transition-all placeholder:text-slate-600 ${
                  emailError ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20'
                }`}
              />
              {emailError && <p className="text-[10px] text-red-400 font-bold mt-2 ml-1">{emailError}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 ml-1 flex items-center gap-2">
                <Lock size={12} className="text-slate-600" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                placeholder="••••••••"
                className={`w-full bg-[#0A0F0D] border rounded-xl px-5 py-3.5 text-white text-sm font-mono tracking-widest focus:outline-none transition-all placeholder:text-slate-600 ${
                  passwordError ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20'
                }`}
              />
              {passwordError && <p className="text-[10px] text-red-400 font-bold mt-2 ml-1">{passwordError}</p>}
              
              {/* Live Password Strength Checklist */}
              <div className="mt-3 bg-black/20 rounded-xl p-3 space-y-2 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Password Policy (8 Chars)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${validCaps ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${validCaps ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-600 bg-transparent'}`}>
                      {validCaps && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    </div>
                    1 Capital Letter
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${validLows ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${validLows ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-600 bg-transparent'}`}>
                      {validLows && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    </div>
                    5 Small Letters
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${validNums ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${validNums ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-600 bg-transparent'}`}>
                      {validNums && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    </div>
                    2 Numbers
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isLen ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${isLen ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-600 bg-transparent'}`}>
                      {isLen && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    </div>
                    Exactly 8 Chars
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 ml-1 flex items-center gap-2">
                <Key size={12} className="text-slate-600" /> Secret Key / PIN
              </label>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-[#0A0F0D] border border-white/5 rounded-xl px-5 py-3.5 text-emerald-400 text-center font-mono text-lg font-black tracking-[0.5em] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600/50"
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              disabled={loading}
              className="w-full py-4 mt-2 rounded-[12px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Initialize Override <ArrowRight size={14} />
            </motion.button>
          </form>
        </div>

        {/* Footer link back to user */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/user-login')}
            className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] hover:text-white transition-colors"
          >
            ← Return to Public Portal
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
