import React, { useState } from 'react';
import { MapPin, Search, ShieldCheck, X, ArrowRight, Star } from 'lucide-react';
import { MOCK_DATA } from '../data/mockData';
import ShimmerSkeleton from '../components/ui/ShimmerSkeleton';
import { useToast } from '../components/ui/Toast';
import { useGlobalState } from '../context/GlobalState';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_STYLE = {
  Rent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Swap: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const Neighborhood = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(new Set());
  const toast = useToast();
  const { addEcoPoints } = useGlobalState();

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // Enrich with INR prices
  const enriched = MOCK_DATA.neighborhoodItems.map(item => ({
    ...item,
    price_inr: item.price === 0 ? 'Free (Swap)' : `₹${Math.round(item.price * 83.5)}/day`,
  }));

  const filteredItems = enriched.filter(item => {
    const matchFilter = filter === 'All' || item.type === filter;
    const matchSearch = search === '' || item.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleRequest = (item) => {
    setRequested(prev => new Set([...prev, item.id]));
    addEcoPoints(15);
    toast(`Request sent to ${item.owner.split(' ')[0]}! +15 pts 🤝`, 'success');
    setSelectedItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-emerald-400 tracking-[0.3em] uppercase mb-2">Hyper-Local</p>
          <h2 className="text-4xl font-black text-white tracking-tight font-display">Neighborhood Circle</h2>
          <p className="text-slate-400 mt-1">Rent, borrow, or swap items with verified neighbors nearby.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-[#121816]/80 rounded-2xl border border-white/10">
          {['All', 'Rent', 'Swap'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${filter === f ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Interactive Map Panel */}
        <div className="xl:col-span-2">
          <div className="relative aspect-video bg-[#0D1510]/60 rounded-[2.5rem] overflow-hidden border border-white/5 group">
            {/* SVG grid lines */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                {[20, 40, 60, 80].map(v => (
                  <React.Fragment key={v}>
                    <line x1={v} y1={0} x2={v} y2={100} stroke="#10B981" strokeWidth="0.3" />
                    <line x1={0} y1={v} x2={100} y2={v} stroke="#10B981" strokeWidth="0.3" />
                  </React.Fragment>
                ))}
              </svg>
            </div>

            {/* Ambient glow center */}
            <div className="absolute inset-0 bg-radial pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 70%)' }} />

            {/* Location pins */}
            <div className="absolute inset-0 p-10">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.button
                    key={item.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.25 }}
                    onClick={() => setSelectedItem(item)}
                    className="absolute"
                    style={{ left: `${item.coords.x}%`, top: `${item.coords.y}%` }}
                  >
                    <div className="relative group">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border backdrop-blur-md shadow-lg transition-all ${
                        requested.has(item.id)
                          ? 'bg-emerald-500 text-white border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                          : 'bg-[#121816]/90 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      }`}>
                        <MapPin size={20} />
                      </div>
                      {/* Pulse ring on hover */}
                      <motion.div
                        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 rounded-2xl bg-emerald-500/20"
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#121816] border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
                        {item.name}
                        <br />
                        <span className={`text-[9px] font-black uppercase ${item.type === 'Rent' ? 'text-blue-400' : 'text-purple-400'}`}>{item.type} • {item.price_inr}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Radius label */}
            <div className="absolute bottom-5 right-5">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-400 tracking-wider border border-white/10">
                📍 2.5km Radius · Live Grid
              </div>
            </div>
          </div>
        </div>

        {/* List Sidebar */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search nearby items…"
              className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          {/* Items list */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {loading ? (
              <ShimmerSkeleton type="list" count={4} />
            ) : (
              filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => setSelectedItem(item)}
                  className="cursor-pointer"
                >
                  <div className={`glass-card rounded-[1.5rem] p-4 flex gap-4 transition-all hover:border-emerald-500/30 ${requested.has(item.id) ? 'border-emerald-500/20' : ''}`}>
                    <div className="relative">
                      <img src={item.image} className="w-18 h-18 w-[72px] h-[72px] rounded-2xl object-cover flex-shrink-0" alt="" />
                      {requested.has(item.id) && (
                        <div className="absolute inset-0 bg-emerald-500/30 rounded-2xl flex items-center justify-center">
                          <span className="text-xs font-black text-white">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase border ml-2 flex-shrink-0 ${TYPE_STYLE[item.type] || TYPE_STYLE.Rent}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">{item.distance} · {item.owner}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-emerald-400">{item.price_inr}</span>
                        {item.verified && <ShieldCheck size={13} className="text-blue-400" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.88, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 24, opacity: 0 }}
              className="glass-panel rounded-[2.5rem] max-w-2xl w-full overflow-hidden flex flex-col md:flex-row border border-white/10"
            >
              {/* Image side */}
              <div className="md:w-1/2 aspect-square md:aspect-auto relative">
                <img src={selectedItem.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase border ${TYPE_STYLE[selectedItem.type]}`}>
                    {selectedItem.type}
                  </span>
                </div>
              </div>

              {/* Content side */}
              <div className="p-8 md:w-1/2 flex flex-col">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{selectedItem.distance} away</p>
                <h3 className="text-3xl font-black text-white mb-4 font-display leading-tight">{selectedItem.name}</h3>

                {/* Owner card */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedItem.owner}`}
                    className="w-11 h-11 rounded-xl bg-white/10"
                    alt=""
                  />
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5">
                      {selectedItem.owner}
                      {selectedItem.verified && <ShieldCheck size={13} className="text-blue-400" />}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      {[1,2,3,4,5].map(s => <Star key={s} size={9} className="fill-yellow-400 text-yellow-400" />)}
                      <span className="ml-1">4.9 · 12 Swaps</span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Great quality {selectedItem.name.toLowerCase()} — well-maintained and includes all original accessories. Easy pickup after 5 PM. Message first to confirm availability.
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price / Swap</p>
                      <p className="text-2xl font-black text-white">{selectedItem.price_inr}</p>
                    </div>
                    {selectedItem.type === 'Rent' && <p className="text-xs font-bold text-slate-500">Per Day</p>}
                  </div>

                  <button
                    onClick={() => handleRequest(selectedItem)}
                    disabled={requested.has(selectedItem.id)}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requested.has(selectedItem.id) ? '✓ Request Sent' : (<>Message {selectedItem.owner.split(' ')[0]} <ArrowRight size={16} /></>)}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Neighborhood;
