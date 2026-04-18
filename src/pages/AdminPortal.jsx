import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Server, Activity, Users, DollarSign, ArrowRight, Brain, PieChart, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FinancialDashboard from '../components/admin/FinancialDashboard';

const AdminPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('oversight'); // oversight | finance

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-white p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Top Navigation Strip */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">Admin <span className="text-blue-500">Master.</span></h2>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Root Clearance Level 5</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab('oversight')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'oversight' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              <LayoutDashboard size={14} /> Oversight
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'finance' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
            >
              <DollarSign size={14} /> Financials
            </button>
          </div>

          <div className="hidden md:flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Mainnet Stable</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'oversight' ? (
            <motion.div 
              key="oversight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                   <QuickStat label="Active Nodes" value="24" color="text-blue-400" />
                   <QuickStat label="System Uptime" value="99.9%" color="text-emerald-400" />
                   <QuickStat label="Global Users" value="12,852" color="text-purple-400" />
                   <QuickStat label="Security Level" value="Max" color="text-amber-400" />
                </div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveTab('finance')}
                  className="lg:col-span-2 p-10 rounded-[3rem] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-3xl border border-blue-500/30 cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <DollarSign size={120} />
                  </div>
                  <h3 className="text-3xl font-black mb-2">Finance Hub</h3>
                  <p className="text-white/60 mb-8 max-w-xs leading-relaxed">
                    Oversee the circular economy marketplace, manage NGO transfers, and audit champion point distributions.
                  </p>
                  <div className="flex items-center gap-2 text-blue-400 font-black uppercase text-xs tracking-widest">
                    Enter Command Center <ArrowRight size={16} />
                  </div>
                </motion.div>
              </div>

              {/* AI OVERSIGHT SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-3xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                      <Brain size={24} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Agentic <span className="text-emerald-400">Oversight.</span></h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <AgenticTask 
                       title="Fraud Prevention" 
                       status="Active" 
                       desc="Scanning 1,200+ listings for counterfeit or duplicate sustainable certificates."
                       action="View Flagged Items"
                     />
                     <AgenticTask 
                       title="Dispute Resolver" 
                       status="Processing" 
                       desc="Analyzing chat history for REQ-009. Automated resolution suggested: Refund 80%."
                       action="Authorize Resolution"
                     />
                  </div>
                </div>

                <div className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                   <div>
                     <h4 className="text-sm font-black uppercase text-white/40 tracking-widest mb-4">System Entropy</h4>
                     <div className="h-32 flex items-end gap-1 px-2">
                        {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                          <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.1, repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                            className="flex-1 bg-emerald-500/40 rounded-t-sm"
                          />
                        ))}
                     </div>
                   </div>
                   <div className="mt-8">
                     <p className="text-xs font-bold text-white/60 mb-2 italic">"Ecosystem health is optimal. No manual intervention required."</p>
                     <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">— Master AI</span>
                   </div>
                </div>
              </div>

              {/* System Logs */}
              <div className="p-10 rounded-[3rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black uppercase tracking-widest">System Event Logs</h3>
                  <button className="text-[10px] font-black uppercase text-blue-400 hover:underline">Download Report</button>
                </div>
                <div className="space-y-4 font-mono text-[11px]">
                   {[
                     { t: '12:45:02', e: 'New NGO "GreenEarth" connected to marketplace.', c: 'text-emerald-400' },
                     { t: '12:44:50', e: 'User 0x23...4F claimed 20 portions from "Organic Deli".', c: 'text-white/60' },
                     { t: '12:42:15', e: 'Security Sweep complete. 0 vulnerabilities found.', c: 'text-blue-400' },
                     { t: '12:40:01', e: 'Champion Point distribution phase 1/4 initialized.', c: 'text-amber-400' },
                   ].map((log, i) => (
                     <div key={i} className="flex gap-6 py-3 border-b border-white/5 last:border-none">
                       <span className="text-white/20">{log.t}</span>
                       <span className={log.c}>{log.e}</span>
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="finance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FinancialDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
    </div>
  );
};

const QuickStat = ({ label, value, color }) => (
  <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl">
    <p className={`text-3xl font-black mb-1 ${color}`}>{value}</p>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</p>
  </div>
);

const AgenticTask = ({ title, status, desc, action }) => (
  <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5 relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <h4 className="text-sm font-black text-white uppercase tracking-widest">{title}</h4>
      <div className="flex items-center gap-2">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
        />
        <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">{status}</span>
      </div>
    </div>
    <p className="text-xs text-white/50 leading-relaxed mb-6">{desc}</p>
    <button className="text-[10px] font-black uppercase text-emerald-400 tracking-widest hover:text-white transition-colors flex items-center gap-2">
      {action} <ArrowRight size={12} />
    </button>
  </div>
);

export default AdminPortal;
