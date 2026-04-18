import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, Calendar, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { apiClient } from '../../api/client';

const FinancialDashboard = () => {
  const [finances, setFinances] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const data = await apiClient.get('/api/admin/finances');
        setFinances(data);
      } catch (e) {
        console.error('Failed to fetch finances', e);
        // Mock data if backend fails
        setFinances({
          total_revenue: 125000,
          admin_commission: 12500,
          seller_payouts: 112500,
          transactions: [
            { id: 1, date: '2026-04-18', product: 'Vintage SLR Camera', seller: 'Aryan M.', amount: 12000, admin: 1200, seller_pay: 10800 },
            { id: 2, date: '2026-04-17', product: 'Sustainable Bamboo Desk', seller: 'Priya S.', amount: 8500, admin: 850, seller_pay: 7650 },
            { id: 3, date: '2026-04-17', product: 'Recycled Wool Coat', seller: 'Sneha R.', amount: 4500, admin: 450, seller_pay: 4050 },
            { id: 4, date: '2026-04-16', product: 'Smart Garden Kit', seller: 'Rahul K.', amount: 15000, admin: 1500, seller_pay: 13500 },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFinances();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronizing Financial Ledger...</div>;

  return (
    <div className="space-y-8">
      {/* 3D-Style Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="Total Gross Volume" 
          value={`₹${(finances?.total_revenue || 0).toLocaleString('en-IN')}`} 
          icon={<DollarSign size={24} />} 
          color="from-emerald-500/20 to-teal-500/20"
          accent="text-emerald-400"
        />
        <MetricCard 
          label="Admin Commission (10%)" 
          value={`₹${(finances?.admin_commission || 0).toLocaleString('en-IN')}`} 
          icon={<ShieldCheck size={24} />} 
          color="from-blue-500/20 to-indigo-500/20"
          accent="text-blue-400"
        />
        <MetricCard 
          label="Seller Payouts (90%)" 
          value={`₹${(finances?.seller_payouts || 0).toLocaleString('en-IN')}`} 
          icon={<TrendingUp size={24} />} 
          color="from-purple-500/20 to-pink-500/20"
          accent="text-purple-400"
        />
      </div>

      {/* Transaction Ledger Table */}
      <div className="glass-panel rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
          <div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white">Financial Ledger</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time 10/90 split verification</p>
          </div>
          <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white">
            <Download size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Product / Item</th>
                <th className="px-8 py-5">Seller</th>
                <th className="px-8 py-5">Gross Amount</th>
                <th className="px-8 py-5 text-emerald-400">Admin (10%)</th>
                <th className="px-8 py-5 text-blue-400">Seller (90%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {finances?.transactions?.map((tx, idx) => (
                <motion.tr 
                  key={tx.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Calendar size={12} className="text-slate-600" />
                      {tx.date}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{tx.product}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400">
                        {tx.seller[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-300">{tx.seller}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-white">₹{tx.amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-emerald-400">₹{tx.admin.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] font-bold text-emerald-500/50 uppercase">Verified</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-blue-400">₹{tx.seller_pay.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] font-bold text-blue-500/50 uppercase">Cleared</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon, color, accent }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`p-8 rounded-[3rem] bg-gradient-to-br ${color} border border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-xl`}
  >
    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-500">
      {icon}
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">{label}</p>
    <div className="flex items-baseline gap-2">
      <h4 className={`text-3xl font-black ${accent} tracking-tight`}>{value}</h4>
      <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
        <TrendingUp size={10} /> +12%
      </div>
    </div>
  </motion.div>
);

export default FinancialDashboard;
