import React, { useState } from 'react';
import { Utensils, MapPin, Clock, AlertCircle, CheckCircle2, Plus, ChevronRight, Bell, Leaf } from 'lucide-react';
import { MOCK_DATA } from '../data/mockData';
import ShimmerSkeleton from '../components/ui/ShimmerSkeleton';
import { useToast } from '../components/ui/Toast';
import { useGlobalState } from '../context/GlobalState';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../api/client';

const FoodRescue = () => {
  const [viewMode, setViewMode] = useState('Volunteer'); // Volunteer, NGO, Restaurant
  const [activeItems, setActiveItems] = useState(MOCK_DATA.foodRescue);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('Distance'); // Distance, Quantity
  const [showPostModal, setShowPostModal] = useState(false);
  const toast = useToast();
  const { addEcoPoints, pushNotification, addPendingRequest } = useGlobalState();

  const [postForm, setPostForm] = useState({ restaurant: '', items: '', amount: '', expiry_date: '' });

  const fetchItems = async () => {
    try {
      const data = await apiClient.get('/food-rescue');
      setActiveItems(data.map(i => ({ ...i, total: parseInt(i.amount) || 10, claimed: 0 })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchItems(); }, []);

  const handleClaim = async (item) => {
    try {
      // Logic for claiming portions
      setActiveItems(prev => prev.map(i => i.id === item.id ? { ...i, claimed: Math.min(i.claimed + 1, (i.total || 10)) } : i));
      addEcoPoints(25);
      toast(`${item.items} portion claimed! +25 pts 🌱`, 'success');
      
      if (pushNotification) {
        pushNotification(`Rescue sequence active. Head to ${item.restaurant}!`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNGOAccept = async (item) => {
    try {
      const res = await apiClient.patch(`/food-rescue/${item.id}/accept`, { ngo_link_id: 101 });
      setActiveItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'NGO Accepted' } : i));
      toast(`Handshake Complete with ${item.restaurant}! ✅`, 'success');
      addEcoPoints(100);
      
      addPendingRequest({
        type: 'Food Rescue',
        item: item.items,
        amount: item.amount,
        user: 'NGO Partner',
        seller: item.restaurant,
        messages: [{ sender: item.restaurant, text: `Hi, we have the ${item.items} ready for pickup. What time can you arrive?` }]
      });

      if (pushNotification) {
        pushNotification(`Dispatch logistics for ${item.items} initiated.`, 'info');
      }
    } catch (err) {
      toast('Handshake failed. Encryption error.', 'error');
    }
  };

  const handleMarkExpired = async (item) => {
    try {
      // In a real app, this would update the DB
      setActiveItems(prev => prev.filter(i => i.id !== item.id));
      toast('Listing removed.', 'info');
    } catch (e) { toast('Error removing listing', 'error'); }
  };

  const handlePostSubmit = async () => {
    try {
      await apiClient.post('/food-rescue', { ...postForm, donor_id: 1 });
      setShowPostModal(false);
      toast('Surplus listed! Community notified 🌱', 'success');
      addEcoPoints(30);
      setPostForm({ restaurant: '', items: '', amount: '', expiry_date: '' });
      fetchItems();
    } catch (e) { toast('Error posting listing', 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-slate-100 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <Utensils size={24} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Food <span className="text-emerald-500">Rescue.</span></h1>
            </div>
            <p className="text-slate-400 font-medium max-w-md">The last-mile protocol for surplus food distribution. Connecting restaurants, NGOs, and volunteers.</p>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
            {['Volunteer', 'NGO', 'Restaurant'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                {mode}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">Live Surplus Feed <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full animate-pulse border border-emerald-500/30">Active Nodes</span></h2>
              <div className="flex gap-4">
                <select onChange={(e) => setFilterType(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500/50">
                  <option value="Distance">Sort by Distance</option>
                  <option value="Quantity">Sort by Quantity</option>
                </select>
              </div>
            </div>

            {activeItems.length === 0 ? (
              <div className="py-20 text-center glass-card rounded-[3rem] border border-dashed border-white/10">
                <Leaf size={48} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No active surplus in your radius.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {activeItems
                  .sort((a, b) => {
                    if (filterType === 'Distance') return parseFloat(a.distance) - parseFloat(b.distance);
                    return b.total - a.total;
                  })
                  .map((item, idx) => {
                    const isNGOAccepted = item.status === 'NGO Accepted';
                    const isCompleted = item.status === 'Completed';
                    return (
                      <motion.div key={item.id} layout initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }} transition={{ duration:0.4, delay:idx*0.05 }}
                        className={`group relative rounded-[2.5rem] p-8 border backdrop-blur-3xl transition-all duration-500 hover:scale-[1.01] ${
                          isNGOAccepted 
                            ? 'border-blue-500/30 bg-blue-500/5 shadow-[0_0_30px_rgba(37,99,235,0.1)]' 
                            : 'border-white/10 bg-white/[0.03] hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                        }`}>
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="flex-1">
                            <div className="flex items-center gap-5 mb-6">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6 ${
                                isNGOAccepted 
                                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              }`}>
                                <Utensils size={28}/>
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-white tracking-tight">{item.restaurant}</h4>
                                <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-1">
                                  <MapPin size={12} className="text-emerald-500" /> {item.distance || '0.8km'} · Verified Donor
                                </p>
                              </div>
                              <div className="ml-auto">
                                {isNGOAccepted && <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase border border-blue-500/30 tracking-widest">Handshake Complete</span>}
                                {isCompleted && <span className="px-4 py-1.5 rounded-full bg-slate-500/20 text-slate-400 text-[10px] font-black uppercase border border-white/10 tracking-widest">Rescued</span>}
                              </div>
                            </div>

                            <h5 className="text-2xl font-black text-white mb-6 tracking-tight leading-none">{item.items}</h5>
                            
                            <div className="grid grid-cols-3 gap-4 mb-8">
                              {[
                                ['Portions', item.amount, Utensils], 
                                ['Deadline', item.expiry_date || item.pickupBy || 'ASAP', Clock], 
                                ['Impact', `~${Math.round((parseInt(item.amount)||10) * 0.5)}kg CO2`, Leaf]
                              ].map(([label, value, Icon]) => (
                                <div key={label} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Icon size={12} className={label === 'Deadline' ? 'text-amber-400' : 'text-emerald-500'} /> {label}
                                  </p>
                                  <p className={`text-sm font-black ${label === 'Impact' ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
                                </div>
                              ))}
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-500">Rescue Progress</span>
                                <span className="text-emerald-400">{item.claimed || 0}/{item.total || 10} portions</span>
                              </div>
                              <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{width:0}} 
                                  animate={{width:`${((item.claimed || 0)/(item.total || 10))*100}%`}} 
                                  transition={{duration:1, ease:'easeOut'}} 
                                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex md:flex-col gap-3 md:justify-center">
                            {viewMode === 'Volunteer' && (
                              <button onClick={()=>handleClaim(item)} disabled={isNGOAccepted || isCompleted} 
                                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                  isNGOAccepted || isCompleted 
                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5' 
                                    : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                                }`}>
                                Claim portions
                              </button>
                            )}
                            {viewMode === 'NGO' && (
                              <button onClick={()=>handleNGOAccept(item)} disabled={isNGOAccepted || isCompleted}
                                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                  isNGOAccepted 
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                    : isCompleted 
                                      ? 'bg-white/5 text-slate-600 border border-white/5' 
                                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.3)]'
                                }`}>
                                <Bell size={14}/> {isNGOAccepted ? 'Handshake Active' : 'NGO Accept'}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            )}
          </div>

          <div className="space-y-6 sticky top-8">
            <div className="glass-card rounded-[2rem] p-6 border border-emerald-500/20 bg-emerald-500/5">
              <h3 className="text-sm font-black text-white mb-1 flex items-center gap-2">Food Hero Stats <CheckCircle2 size={18} className="text-emerald-400"/></h3>
              <p className="text-slate-400 text-xs mb-5">Your activity this week fed <span className="text-white font-bold">12 people</span>.</p>
              <div className="space-y-3">
                {[['Meals Rescued','42'],['Shelters Reached','3'],['Waste Diverted','15.5 kg']].map(([label,value])=>(
                  <div key={label} className="flex justify-between items-center p-3 bg-white/5 rounded-2xl">
                    <span className="text-xs font-bold text-slate-400">{label}</span>
                    <span className="text-base font-black text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {viewMode === 'Restaurant' && (
              <motion.button initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} onClick={()=>setShowPostModal(true)}
                className="w-full glass-card rounded-[2rem] p-8 flex flex-col items-center text-center group border border-dashed border-white/10 hover:border-emerald-500/40 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"><Plus className="text-emerald-400" size={28}/></div>
                <h4 className="text-sm font-black text-white mb-1">Post Surplus Food</h4>
                <p className="text-xs text-slate-400">Tax-deductible. Helps local communities.</p>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPostModal(false)} />
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
             className="relative w-full max-w-lg glass-card rounded-[3rem] p-10 border border-white/10 shadow-2xl">
             <h3 className="text-3xl font-black text-white mb-2">List Surplus.</h3>
             <p className="text-slate-400 text-sm mb-8">Make your contribution to the local food loop.</p>
             <div className="space-y-4 mb-10">
                <input placeholder="Restaurant Name" value={postForm.restaurant} onChange={e => setPostForm({ ...postForm, restaurant: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-emerald-500/50" />
                <input placeholder="Food Items (e.g., 20 Samosas)" value={postForm.items} onChange={e => setPostForm({ ...postForm, items: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-emerald-500/50" />
                <input placeholder="Quantity/Portions" value={postForm.amount} onChange={e => setPostForm({ ...postForm, amount: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-emerald-500/50" />
                <input placeholder="Expiry/Pickup By (e.g., 10:00 PM)" value={postForm.expiry_date} onChange={e => setPostForm({ ...postForm, expiry_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-emerald-500/50" />
             </div>
             <button onClick={handlePostSubmit} className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">Authorize Listing</button>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default FoodRescue;
