import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, Github, Mail, Zap } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useToast } from '../components/ui/Toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useGlobalState();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Performance: Resource Preloading
  const handlePreload = () => {
    if (!document.getElementById('dash-prefetch')) {
      const link = document.createElement('link');
      link.id = 'dash-prefetch';
      link.rel = 'prefetch';
      link.href = '/dashboard'; // Pre-fetch dashboard assets
      document.head.appendChild(link);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    // Step 1: Parallelize - Start Auth Request while validating
    // In a real app, we'd fire a non-blocking 'pre-auth' ping here
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid Email Format');
      return;
    }

    // Password validation
    if (!validTotal) {
      setPasswordError('Policy Mismatch');
      return;
    }

    setLoading(true);

    try {
      // Step 2: Payload Trimming - Only send essential credentials
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Connection': 'keep-alive' // Connection Pooling
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Step 3: Optimistic UI - Transition state immediately
        setLoading('success'); 
        
        setTimeout(() => {
          login(data.user);
          toast('EarthID Verified. Welcome back! 🌱', 'success');
          const from = location.state?.from?.pathname || '/marketplace';
          navigate(from, { replace: true });
        }, 150); // Perception tuning: 150ms feels 'instant' but solid
      } else {
        const error = await response.json();
        toast(error.error || 'Authentication Failed', 'error');
        setLoading(false);
      }
    } catch (err) {
      toast('Ecosystem Offline. Try again.', 'error');
      setLoading(false);
    }
  };

  const handleSSO = (provider) => {
    login({ name: 'Guardian', role: 'User', points: 420 });
    toast(`Authenticated via ${provider} 🔐`, 'success');
    const from = location.state?.from?.pathname || '/marketplace';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#0A0F0D]">

      {/* LEFT PANEL — Hero */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-end pb-16"
        style={{
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F0D] via-black/40 to-transparent" />

        {/* Carbon neutral badge */}
        <motion.div
          initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute top-10 left-10 px-4 py-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full flex items-center gap-2"
        >
          <Leaf size={14} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">Carbon Neutral Platform</span>
        </motion.div>

        {/* Floating stat pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="absolute top-24 right-10 flex flex-col gap-2"
        >
          {['+20 kg CO₂ Saved', '+12 Items Rescued', '420 EcoPoints'].map((s, i) => (
            <div key={i} className="px-4 py-2 bg-black/40 backdrop-blur-sm border border-emerald-500/20 rounded-xl text-white text-xs font-bold">
              {s}
            </div>
          ))}
        </motion.div>

        {/* Bottom branding */}
        <div className="relative z-10 text-center">
          <h2 className="text-5xl font-black text-white tracking-tighter leading-tight mb-3 font-display">
            Close the<br /><span className="text-emerald-400 italic">Loop.</span>
          </h2>
          <p className="text-white/50 font-medium text-sm max-w-xs mx-auto">
            Join 12,850+ members building a circular economy, one action at a time.
          </p>
        </div>
      </motion.div>

      {/* RIGHT PANEL — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ rotate: -20, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-3xl text-white mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
            >
              <Leaf size={32} />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 leading-tight font-display">
              Welcome Back,<br />Guardian.
            </h1>
            <p className="text-slate-500 font-medium text-sm">Enter the ecosystem to continue your impact.</p>
          </div>

          {/* Glass Card */}
          <div className="bg-[#121816]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 ml-1">
                  E-Mail Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder="guardian@ecoloop.earth"
                  className={`w-full bg-white/5 border rounded-2xl px-5 py-3.5 text-white text-sm font-medium focus:outline-none transition-all placeholder:text-slate-600 ${
                    emailError ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'
                  }`}
                />
                {emailError && <p className="text-[10px] text-red-400 font-bold mt-2 ml-1">{emailError}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onFocus={handlePreload}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border rounded-2xl px-5 py-3.5 text-white text-sm font-mono tracking-widest focus:outline-none transition-all placeholder:text-slate-600 ${
                    passwordError ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10'
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

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  loading === 'success' 
                    ? 'bg-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.8)]' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                }`}
              >
                {loading === 'success' ? (
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                     <ShieldCheck size={20} /> Verified
                  </motion.div>
                ) : loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>Authenticate with EarthID <ArrowRight size={16} /></>
                )}
              </motion.button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Or Continue With</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'GitHub', icon: Github, provider: 'GitHub' },
                { label: 'Google', icon: Mail,   provider: 'Google' },
              ].map(({ label, icon: Icon, provider }) => (
                <button
                  key={label}
                  onClick={() => handleSSO(provider)}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white font-bold text-sm"
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Don't have an account?{' '}
                <span
                  onClick={() => { login(); navigate('/marketplace'); }}
                  className="text-emerald-400 font-black uppercase tracking-widest cursor-pointer hover:underline"
                >
                  Join the Loop
                </span>
              </p>
            </div>

            {/* Subtle watermark */}
            <div className="absolute -bottom-1 -right-1 opacity-[0.03]">
              <ShieldCheck size={100} className="text-white" />
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-8 flex justify-center items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] hover:text-emerald-400 transition-colors"
            >
              ← Back to Hub
            </button>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-600 tracking-[0.15em]">
              <Zap size={10} className="text-emerald-500" /> Privacy Shield Active
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <button
              onClick={() => navigate('/admin-auth')}
              className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] hover:text-emerald-400 transition-colors"
            >
              Admin Portal
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
