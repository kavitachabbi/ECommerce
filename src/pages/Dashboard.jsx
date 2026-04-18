import React from 'react';
import { Zap, Droplets, Trash2, Share2, Award, TrendingUp, Globe, ChevronRight, Gift, BarChart2, Users, Leaf, ShoppingBag } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import GlassCard from '../components/ui/GlassCard';
import ShimmerSkeleton from '../components/ui/ShimmerSkeleton';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../api/client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RANKS = [
  { name: 'Seedling',       min: 0,    color: 'text-slate-400',   next: 100  },
  { name: 'Eco-Starter',   min: 100,  color: 'text-blue-400',    next: 300  },
  { name: 'Champion',      min: 300,  color: 'text-emerald-400', next: 600  },
  { name: 'Earth Guardian',min: 600,  color: 'text-yellow-400',  next: 1000 },
  { name: 'Eco-Master',    min: 1000, color: 'text-purple-400',  next: null },
];

const getRankInfo = (pts) => {
  const rank = [...RANKS].reverse().find(r => pts >= r.min) || RANKS[0];
  const next = RANKS.find(r => r.min > pts);
  const pctToNext = next ? Math.min(100, ((pts - rank.min) / (next.min - rank.min)) * 100) : 100;
  return { rank, ptsToNext: next ? next.min - pts : 0, pctToNext };
};

// Admin Command Center card
const AdminMetric = ({ label, value, icon: Icon, color, sub }) => (
  <div className="glass-card rounded-[2rem] p-6 flex flex-col gap-3">
    <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
    {sub && <p className="text-[10px] text-emerald-400 font-bold">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { ecoPoints, ecoRank, userBadges, addEcoPoints, cartTotal, requests, currentUser, addRequestMessage } = useGlobalState();
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('personal'); // 'personal', 'requests', 'admin'
  const [apiMetrics, setApiMetrics] = React.useState(null);
  const [chatMsgs, setChatMsgs] = React.useState({});
  const [showChart, setShowChart] = React.useState(false);
  const [rankData, setRankData] = React.useState(null);

  const userRequests = requests?.filter(r => r.user === currentUser) || [];

  const handleSendChat = (reqId) => {
    const msg = chatMsgs[reqId];
    if (!msg || !msg.trim()) return;
    addRequestMessage(reqId, currentUser, msg);
    setChatMsgs(prev => ({ ...prev, [reqId]: '' }));
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [metrics, userData] = await Promise.all([
          apiClient.get('/admin/metrics'),
          apiClient.get('/users/1')
        ]);
        setApiMetrics(metrics);
        if (userData?.rank_history) {
            setRankData({
                labels: userData.rank_history.map(h => new Date(h.ts).toLocaleDateString()),
                datasets: [{
                    label: 'Champion Points',
                    data: userData.rank_history.map(h => h.points),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { rank, ptsToNext, pctToNext } = getRankInfo(ecoPoints);

  const stats = [
    { label: 'CO₂ Saved', value: '124.5 kg', icon: Zap,      color: 'bg-orange-500/20 text-orange-400', sub: '+12% this month' },
    { label: 'Water Saved', value: '1,200 L',  icon: Droplets, color: 'bg-blue-500/20 text-blue-400',    sub: '+8% this month' },
    { label: 'Items Saved', value: '48 items', icon: Trash2,   color: 'bg-purple-500/20 text-purple-400',sub: '+5 this week'   },
  ];

  const rewards = [
    { id: 1, title: 'Free Fair-Trade Coffee', partner: 'EcoBrew Cafe',  priceInPoints: 300,  unlocked: ecoPoints >= 300  },
    { id: 2, title: '20% Off Refill Station', partner: 'ZeroWaste Store', priceInPoints: 500, unlocked: ecoPoints >= 500  },
    { id: 3, title: 'Plant a Mangrove Tree',  partner: 'OceanGuard',    priceInPoints: 1000, unlocked: ecoPoints >= 1000 },
  ];

  // Admin metrics fetched from API
  const adminMetrics = [
    { label: 'Total Products',   value: apiMetrics?.total_products || '0',  icon: ShoppingBag, color: 'bg-emerald-500/20 text-emerald-400', sub: 'Listed in marketplace' },
    { label: 'Food Rescues',      value: apiMetrics?.total_rescues || '0', icon: Leaf,        color: 'bg-blue-500/20 text-blue-400',       sub: `${apiMetrics?.accepted_rescues || 0} accepted by NGOs` },
    { label: 'Waste Saved (Est)', value: `${apiMetrics?.kg_saved_estimate || 0} kg`, icon: Trash2, color: 'bg-purple-500/20 text-purple-400',   sub: 'Based on food rescue' },
    { label: 'Total Eco Points',value: apiMetrics?.total_eco_points?.toLocaleString() || '0', icon: BarChart2,   color: 'bg-yellow-500/20 text-yellow-400',  sub: 'Community wide' },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item      = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-emerald-400 tracking-[0.3em] uppercase mb-2">Mission Control</p>
          <h2 className="text-4xl font-black text-white tracking-tight font-display">Impact Hub</h2>
          <p className="text-slate-400 mt-1">Your personal circular economy command center.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-[#121816]/80 rounded-2xl border border-white/10 overflow-x-auto hide-scrollbar">
            {['personal', 'requests', 'admin'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-white'}`}>
                {tab === 'personal' ? '⚡ My Stats' : tab === 'requests' ? '📩 My Requests' : '🛡️ Admin'}
              </button>
            ))}
          </div>
          <button onClick={() => toast('Impact report copied to clipboard! 📊', 'success')}
            className="px-5 py-2.5 rounded-2xl bg-white/5 text-white border border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
            <Share2 size={14}/> Share
          </button>
        </div>
      </div>

      {loading ? (
        <ShimmerSkeleton type="dashboard" />
      ) : activeTab === 'personal' ? (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Rank Hero */}
          <motion.div variants={item}>
            <div className="glass-card rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border border-emerald-500/20 relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Rank Ring */}
              <div className="relative flex-shrink-0">
                <svg className="w-48 h-48 -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5"/>
                  <motion.circle cx="96" cy="96" r="80" stroke="url(#rankGrad)" strokeWidth="10" fill="transparent"
                    strokeDasharray="502"
                    initial={{ strokeDashoffset: 502 }}
                    animate={{ strokeDashoffset: 502 - (502 * pctToNext / 100) }}
                    transition={{ duration: 1.8, ease: 'circOut' }}
                    strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="rankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981"/>
                      <stop offset="100%" stopColor="#3B82F6"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">{ecoPoints}</span>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Points</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-sm font-black uppercase tracking-widest mb-4 border border-white/10 ${rank.color}`}>
                  <Award size={16}/> {rank.name}
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight font-display">
                  {rank.name === 'Eco-Master' ? 'Pinnacle Achieved 🏆' : `${ptsToNext} pts to next rank`}
                </h3>
                <p className="text-slate-400 font-medium mb-6 max-w-sm">
                  You're in the <span className="text-white font-black">top 5%</span> of EcoLoop members this month. Every action earns points.
                </p>
                {/* Progress to next rank */}
                <div className="space-y-2 max-w-sm">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">{rank.name}</span>
                    <span className={rank.color}>{pctToNext.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pctToNext}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"/>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { addEcoPoints(10); toast('+10 Bonus Points for checking in! 🌱', 'points'); }}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                    Daily Check-in
                  </button>
                  <button onClick={() => setShowChart(!showChart)}
                    className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                    {showChart ? 'Hide Growth' : 'View Rank History'}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showChart && rankData && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-8 p-6 bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
                      <Line data={rankData} options={{ 
                        responsive: true, 
                        plugins: { legend: { display: false } },
                        scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }, x: { grid: { display: false }, ticks: { color: '#64748b' } } }
                      }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map(s => (
              <div key={s.label} className="glass-card rounded-[2rem] p-6 flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon size={26}/></div>
                <div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                  <p className="text-[10px] text-emerald-400 font-bold mt-1">{s.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Badges */}
            <motion.div variants={item}>
              <div className="glass-card rounded-[2.5rem] p-8 h-full">
                <h3 className="text-lg font-black text-white mb-1 flex justify-between items-center">
                  Earned Badges
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase font-black">{userBadges.length} Total</span>
                </h3>
                <p className="text-slate-500 text-xs mb-6">Achievements from your sustainability journey.</p>
                <div className="flex flex-wrap gap-4">
                  {userBadges.map((badge) => (
                    <div key={badge} className="group relative">
                      <motion.div whileHover={{ scale: 1.15, rotate: 5 }}
                        className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 cursor-help hover:bg-emerald-500 hover:text-white transition-all duration-300">
                        <Award size={28}/>
                      </motion.div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#0A0F0D] border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {badge}
                      </div>
                    </div>
                  ))}
                  <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center text-slate-600">
                    <Award size={24}/>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 tracking-widest mt-8 hover:underline">
                  View all secret badges <ChevronRight size={12}/>
                </button>
              </div>
            </motion.div>

            {/* Rewards Gallery */}
            <motion.div variants={item}>
              <div className="glass-card rounded-[2.5rem] p-8 h-full">
                <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
                  <Gift className="text-yellow-400" size={20}/> Eco-Rewards
                </h3>
                <p className="text-slate-500 text-xs mb-6">Redeem your champion points for real perks.</p>
                <div className="space-y-3">
                  {rewards.map((reward) => (
                    <motion.div key={reward.id} whileHover={reward.unlocked ? { x: 4 } : {}}
                      className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                        reward.unlocked
                          ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                          : 'border-white/5 bg-white/5 opacity-50'
                      }`}
                      onClick={() => reward.unlocked && toast(`"${reward.title}" redeemed! Check your email 🎁`, 'points')}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reward.unlocked ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                          <Gift size={18}/>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{reward.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{reward.partner}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-black ${reward.unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {reward.unlocked ? 'CLAIM →' : `${reward.priceInPoints} pts`}
                        </p>
                        {!reward.unlocked && (
                          <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                            <div className="bg-slate-600 h-full" style={{ width: `${Math.min(100,(ecoPoints/reward.priceInPoints)*100)}%`}}/>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Global Rank */}
          <motion.div variants={item}>
            <div className="glass-card rounded-[2rem] p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center"><Globe size={26}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Ranking</p>
                  <p className="text-3xl font-black text-white">#1,402</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <TrendingUp size={16}/> Up 47 places this week
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : activeTab === 'requests' ? (
        /* ── MY AUTHORIZATION LOOP ── */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card rounded-[3rem] p-10 border border-white/10 bg-[#0A0F0D]/60 relative overflow-hidden">
             {/* Background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

             <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-2xl font-black text-white flex items-center gap-3 italic">
                     <ShieldCheck className="text-amber-400" size={26} /> My Authorization <span className="text-amber-400">Loop.</span>
                   </h3>
                   <p className="text-xs text-slate-500 mt-1 max-w-sm">Tracking the progress of your circular transaction requests. Every node requires central authorization.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> Live Status Feed
                </div>
             </div>

             <div className="space-y-4">
               {userRequests.length === 0 ? (
                 <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                    <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No active sequences in the buffer.</p>
                 </div>
               ) : (
                 userRequests.map((req, i) => (
                   <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex flex-col md:flex-row items-center justify-between p-7 bg-white/[0.03] border border-white/5 rounded-[2.5rem] group hover:border-amber-500/30 transition-all">
                     <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                          req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          req.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                        }`}>
                           {req.type === 'Buy' ? <ShoppingBag size={28} /> : <ArrowLeftRight size={28} />}
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                             <h4 className="text-xl font-black text-white">{req.item}</h4>
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                                req.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                'bg-amber-500/20 text-amber-400 border-amber-500/30'
                             }`}>{req.status}</span>
                           </div>
                           <p className="text-xs text-slate-500 font-bold mt-1">Transaction Sequence: REQ-{req.id}</p>
                        </div>
                     </div>
                     <div className="mt-6 md:mt-0 text-right">
                        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Authorization Note</p>
                        <p className="text-[11px] text-slate-500 max-w-[240px] leading-relaxed font-medium italic">
                          {req.status === 'Pending' ? "Encryption phase complete. Awaiting central node manual oversight." : 
                           req.status === 'Approved' ? "Clearance granted. Permission to proceed with asset exchange." : "Sequence rejected by system protocol. Check security logs."}
                        </p>
                     </div>
                   </motion.div>
                 ))
               )}
             </div>
          </div>
        </motion.div>

      ) : (
        /* ── ADMIN COMMAND CENTER ── */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
            <span className="text-yellow-400 text-lg">🛡️</span>
            <p className="text-sm font-bold text-yellow-300">Admin Command Center — Real-time ecosystem metrics.</p>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {adminMetrics.map(m => <AdminMetric key={m.label} {...m}/>)}
          </div>

          {/* Leaderboard & User Rank Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-[2.5rem] p-8">
              <h3 className="text-lg font-black text-white mb-1">Top Champions</h3>
              <p className="text-slate-500 text-xs mb-6">Live global leaderboard snapshot.</p>
              <div className="space-y-3">
                {[
                  { name: 'Priya S.', pts: 2140, rank: 'Eco-Master', badge: '🥇' },
                  { name: 'Aryan M.', pts: 1890, rank: 'Eco-Master', badge: '🥈' },
                  { name: 'You',      pts: ecoPoints, rank: ecoRank, badge: '🌱', isYou: true },
                  { name: 'Kavya R.', pts: 380,  rank: 'Champion', badge: '🥉' },
                  { name: 'Dev P.',   pts: 215,  rank: 'Eco-Starter', badge: '4️⃣' },
                ].map((u, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-2xl ${u.isYou ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{u.badge}</span>
                      <div>
                        <p className={`text-sm font-bold ${u.isYou ? 'text-emerald-400' : 'text-white'}`}>{u.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{u.rank}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-white">{u.pts.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Point Adjustment Panel */}
            <div className="glass-card rounded-[2.5rem] p-8 space-y-5">
              <h3 className="text-lg font-black text-white mb-1">Point Adjustment</h3>
              <p className="text-slate-500 text-xs">Award or deduct points from users (admin only).</p>
              <input placeholder="User ID or Email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"/>
              <input placeholder="Points (positive or negative)" type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"/>
              <input placeholder="Reason (e.g. Food Rescue bonus)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"/>
              <button onClick={() => toast('Points updated and user notified via EcoLoop alert ✅', 'success')}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all">
                Apply Adjustment
              </button>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {['Export CSV','Broadcast Alert','Reset Badges','Refresh Cache'].map(action => (
                    <button key={action} onClick={() => toast(`${action} triggered!`, 'info')}
                      className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
