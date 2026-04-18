import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Leaf, ArrowLeftRight, CheckCircle2,
  Clock, RefreshCw, Download, TrendingUp, Zap,
  ShieldCheck, AlertTriangle, CreditCard, Wallet,
  ArrowRight, Activity
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../api/client';

const AdminFinance = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [processingId, setProcessingId] = useState(null);
  const [metrics, setMetrics] = useState({ revenue: 0, commission: 0, users: 0, carbon: 0 });

  const fetchRequests = async () => {
    try {
      const data = await apiClient.get('/admin/requests');
      setRequests(data);
      
      const overview = await apiClient.get('/admin/overview');
      // Mocking the revenue/commission for the demo
      setMetrics({
        revenue: overview.total_products * 12500, // Avg price
        commission: overview.total_products * 12500 * 0.1,
        users: overview.user_count,
        carbon: overview.food_saved_kg + overview.total_products * 12
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await apiClient.post(`/admin/requests/${id}/approve`);
      toast('Transaction Authorized. Seller Payout Initiated (90%).', 'success');
      fetchRequests();
    } catch (e) {
      toast('Authorization Failed.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await apiClient.post(`/admin/requests/${id}/reject`);
      toast('Request Denied. Funds Returned to Buyer.', 'error');
      fetchRequests();
    } catch (e) {
      toast('Rejection Failed.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = filterStatus === 'All' ? requests : requests.filter(r => r.status === filterStatus);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <Activity size={18} />
            </div>
            <p className="text-[10px] font-black text-emerald-400 tracking-[0.3em] uppercase">Control Center · Finance</p>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tight font-display italic">Revenue <span className="text-emerald-500">Oversight.</span></h2>
        </div>

        <div className="flex gap-4">
           <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col items-end">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Platform Split</span>
              <span className="text-xs font-black text-white">10% ADMIN / 90% SELLER</span>
           </div>
        </div>
      </header>

// ── Metrics Grid ─────────────────────────────
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={DollarSign} 
          label="Total Platform Revenue" 
          value={`₹${metrics.revenue.toLocaleString('en-IN')}`} 
          sub="+14.2% Growth Protocol" 
          accent="gold" 
        />
        <MetricCard 
          icon={Leaf} 
          label="Total Carbon Saved" 
          value={`${metrics.carbon.toFixed(0)} kg`} 
          sub="Direct Net-Zero Impact" 
          accent="emerald" 
        />
        <MetricCard 
          icon={ArrowLeftRight} 
          label="Active Neighborhood Swaps" 
          value={metrics.users * 4} 
          sub="Circular Velocity Active" 
          accent="blue" 
        />
      </div>

      {/* Requests Table */}
      <div className="glass-card rounded-[3rem] border border-white/10 overflow-hidden bg-[#0A0F0D]/40 backdrop-blur-3xl shadow-2xl">
         <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3 italic">
                <Clock size={26} className="text-amber-400" /> Transaction <span className="text-amber-400">Ledger.</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Manual authorization required for financial dispersion.</p>
            </div>
            <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10">
              {['Pending', 'Approved', 'Rejected', 'All'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-slate-500 hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>
         </div>

         <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Asset / UID</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total Sale (₹)</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Admin (10%)</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Seller (90%)</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-10"><div className="h-4 bg-white/5 rounded-full w-full" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-24 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-xs">No transaction requests in the buffer.</td>
                  </tr>
                ) : (
                  filtered.map(req => {
                    const total = req.amount || 0;
                    const commission = total * 0.1;
                    const payout = total * 0.9;
                    
                    return (
                      <tr key={req.id} className="hover:bg-white/[0.03] transition-all group cursor-default">
                        <td className="px-10 py-8">
                          <div className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">{req.product_name}</div>
                          <div className="text-[10px] text-slate-600 font-black mt-1 uppercase tracking-widest">Node ID: {req.id} · {req.type}</div>
                        </td>
                        <td className="px-10 py-8 font-mono text-sm font-black text-white">₹{total.toLocaleString('en-IN')}</td>
                        <td className="px-10 py-8 font-mono text-sm font-black text-amber-500">₹{commission.toLocaleString('en-IN')}</td>
                        <td className="px-10 py-8 font-mono text-sm font-black text-emerald-500">₹{payout.toLocaleString('en-IN')}</td>
                        <td className="px-10 py-8 text-right">
                          {req.status === 'Pending' && processingId !== req.id ? (
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                              <button onClick={() => handleApprove(req.id)} className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">APPROVE</button>
                              <button onClick={() => handleReject(req.id)} className="px-5 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">REFUND</button>
                            </div>
                          ) : processingId === req.id ? (
                            <div className="flex items-center justify-end gap-3">
                               <div className="w-4 h-4 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
                               <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Authorizing...</span>
                            </div>
                          ) : (
                            <StatusBadge status={req.status} />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, sub, accent }) => {
  const styles = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
    blue:    'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
    gold:    'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5',
  };
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-10 glass-card rounded-[3rem] border border-white/5 flex flex-col gap-6 relative overflow-hidden group shadow-2xl bg-[#0A0F0D]/60 backdrop-blur-3xl"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={120} />
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-12 ${styles[accent]}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-4xl font-black text-white tracking-tighter mb-1">{value}</p>
        <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em]">{label}</p>
      </div>
      <div className="flex items-center gap-2">
         <TrendingUp size={12} className={accent === 'gold' ? 'text-amber-400' : 'text-emerald-400'} />
         <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{sub}</p>
      </div>
    </motion.div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Pending:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] ${styles[status]}`}>
      {status}
    </span>
  );
};

export default AdminFinance;
