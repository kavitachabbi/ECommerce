import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Tag, ArrowLeftRight, Eye, Leaf, Recycle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import ShimmerSkeleton from '../components/ui/ShimmerSkeleton';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../api/client';
import Tilt from 'react-parallax-tilt';

const MODE_STYLES = {
  Sale: { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'For Sale' },
  Rent: { bg: 'bg-blue-500/20   text-blue-400   border-blue-500/30',     label: 'For Rent' },
  Swap: { bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',   label: 'Swap'     },
};

// Derived metadata for each category
const CATEGORY_META = {
  Furniture:      { circularity: 92, material: 'FSC Certified',       co2: 47, condition: 'Refurbished' },
  Tech:           { circularity: 78, material: 'Certified Pre-Owned',  co2: 18, condition: 'Refurbished' },
  Apparel:        { circularity: 85, material: 'Recycled Fabric',      co2: 12, condition: 'Vintage'     },
  Books:          { circularity: 95, material: 'Paper — Zero Waste',   co2: 3,  condition: 'Vintage'     },
  'Personal Care':{ circularity: 70, material: 'Cruelty-Free',         co2: 5,  condition: 'New-Sourced'  },
};

const CONDITION_STYLES = {
  Refurbished: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Vintage:     'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'New-Sourced':'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const CATEGORIES = ['All', 'Furniture', 'Tech', 'Apparel', 'Books', 'Personal Care'];



const CartSidebar = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, cartTotal, cartCO2, addPendingRequest, clearCart, calcEcoPoints, isEcoBonus } = useGlobalState();
  const toast = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [hasBonus, setHasBonus] = useState(false);

  // Total eco points preview for entire cart
  const totalPoints = cart.reduce((sum, item) => sum + (calcEcoPoints ? calcEcoPoints(item.category) : 5), 0);
  const cartHasBonus = cart.some(item => isEcoBonus ? isEcoBonus(item.category) : false);

  const handleCheckout = async () => {
    if (!cart.length) { toast('Your cart is empty!', 'error'); return; }
    
    try {
      // Step 2: Request & Approval Logic - Send all to Admin queue
      for (const item of cart) {
        await apiClient.post('/api/products/request', {
          type: item.mode === 'Rent' ? 'Rent' : item.mode === 'Swap' ? 'Swap' : 'Buy',
          product_id: item.id,
          requester_id: 1, // Mock current user
          amount: item.raw_price || 0
        });
      }
      
      setEarnedPoints(totalPoints);
      setHasBonus(cartHasBonus);
      setShowSuccess(true);
      toast('Authorization Request Sent! 🔐', 'success');
    } catch (e) {
      toast('Authorization link failed. Try again.', 'error');
    }
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    clearCart();
    navigate('/dashboard');
  };

  return (
    <>
      <div className="glass-panel rounded-[10px] p-6 sticky top-8 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <ShoppingCart size={16} className="text-emerald-400" />
          Cart ({cart.length})
        </h3>
        {!cart.length ? (
          <p className="text-slate-500 text-xs">Nothing here yet.</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.map(item => {
              const pts = calcEcoPoints ? calcEcoPoints(item.category) : 5;
              const bonus = isEcoBonus ? isEcoBonus(item.category) : false;
              return (
                <div key={item.cartUid} className="flex items-center gap-3">
                  <img src={item.image_url || item.image} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-emerald-400 font-black">
                        {item.price_inr || `₹${Math.round((item.price||0) * 83.5)}`}
                      </p>
                      {/* Eco-Point Preview Badge */}
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${
                        bonus
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-700/40 text-slate-500 border-slate-600/30'
                      }`}>
                        {bonus && <Leaf size={8} className="text-emerald-400" />}
                        +{pts} pts
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartUid)} className="text-slate-500 hover:text-red-400 transition-colors">✕</button>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-white/10 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-bold">Total</span>
            <span className="text-white font-black">{cartTotal}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">CO₂ footprint</span>
            <span className="text-emerald-400 font-bold">{cartCO2} kg</span>
          </div>
          {cart.length > 0 && (
            <div className={`flex justify-between text-xs p-2 rounded-xl border ${
              cartHasBonus
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-white/5 border-white/10'
            }`}>
              <span className={cartHasBonus ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-slate-500'}>
                {cartHasBonus && <Leaf size={10} />} Eco Points
              </span>
              <span className={`font-black ${cartHasBonus ? 'text-emerald-400' : 'text-slate-400'}`}>
                +{totalPoints} pts
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleCheckout}
          className={`w-full py-3 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 ${
            cartHasBonus
              ? 'bg-emerald-500 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {cartHasBonus && <Leaf size={16} />}
          Complete Order {cart.length > 0 && `· +${totalPoints} pts`}
        </button>
      </div>

      {/* 3D Order Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/70 backdrop-blur-md"
            onClick={closeSuccess}
          >
            <motion.div
              initial={{ scale: 0.7, rotateX: 30, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{ transformStyle: 'preserve-3d' }}
              className={`relative rounded-[10px] p-10 max-w-sm w-full text-center border shadow-2xl overflow-hidden bg-[#121218] border-amber-500/40 shadow-amber-500/10`}
              onClick={e => e.stopPropagation()}
            >
              {/* Ambient glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500 rounded-full blur-3xl opacity-10 pointer-events-none" />

              {/* Icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center border-2 bg-amber-500/10 border-amber-500/30"
              >
                <Clock size={40} className="text-amber-400" />
              </motion.div>

              {/* Title */}
              <h2 className="text-3xl font-black text-white mb-2 font-display">Request Sent</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs uppercase tracking-widest border border-amber-500/30 mb-4">
                Pending Admin Approval
              </div>
              <p className="text-slate-400 text-sm">
                Your request has been submitted securely. You will be notified once the Admin reviews and approves the transaction.
              </p>

              <button
                onClick={closeSuccess}
                className="mt-6 w-full py-3 rounded-2xl font-black text-sm transition-all bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/30"
              >
                Understood →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


const Marketplace = () => {
  const { addToCart } = useGlobalState();
  const navigate = useNavigate();
  const toast = useToast();
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMode,     setFilterMode]     = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);

  const handleSellSubmit = async (formData) => {
    try {
      await apiClient.post('/api/products', {
        ...formData,
        owner_id: 1, // Mock current user
      });
      toast('Listing submitted for Admin review! 🚀', 'success');
      setShowSellModal(false);
    } catch (e) {
      toast('Failed to submit listing.', 'error');
    }
  };

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiClient.get('/products');
            setProducts(data.map(p => {
              const meta = CATEGORY_META[p.category] || { circularity: 80, material: 'Sustainable Source', co2: 8, condition: 'Refurbished' };
              return {
                ...p,
                raw_price: p.price_inr || 0,
                price_inr: `₹${(p.price_inr || 0).toLocaleString('en-IN')}`,
                price_per_month: p.mode === 'Rent' ? `₹${Math.round((p.price_inr || 0) * 0.08).toLocaleString('en-IN')}/mo` : null,
                circularity: meta.circularity,
                material: meta.material,
                co2_saved: meta.co2,
                condition: meta.condition,
              };
            }));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const filtered = products
    .filter(p => filterMode     === 'All' || p.mode     === filterMode)
    .filter(p => filterCategory === 'All' || p.category === filterCategory);

  const handleAddToCart = (item) => {
    if (item.mode === 'Swap' || item.mode === 'Rent') {
      setLastAddedItem(item);
      setShowSwapModal(true);
    } else {
      addToCart(item);
      toast(`${item.name} added to cart!`, 'success');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-black text-emerald-400 tracking-[0.3em] uppercase mb-2">Circular Economy</p>
            <h2 className="text-4xl font-black text-white tracking-tight font-display">Green Marketplace</h2>
            <p className="text-slate-400 mt-1">Verified sustainable products with real impact.</p>
          </div>
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none mb-4">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-white border border-transparent'}`}>
                {cat}
              </button>
            ))}
          </div>
          {/* Mode Filter */}
          <div className="flex items-center gap-2 p-1.5 bg-[#121816]/80 rounded-2xl border border-white/10">
            {['All', 'Sale', 'Rent', 'Swap'].map(mode => (
              <button key={mode} onClick={() => setFilterMode(mode)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  filterMode === mode ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-white'
                }`}>
                {mode}
              </button>
            ))}
          </div>

          <button onClick={() => setShowSellModal(true)} 
            className="px-6 py-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-xl">
            List My Item
          </button>
        </div>

        {loading ? (
          <ShimmerSkeleton type="card" count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.length === 0 && (
              <div className="col-span-3 py-20 text-center text-slate-600 font-bold">No products found for this filter.</div>
            )}
            {filtered.map((item, idx) => {
              const modeStyle = MODE_STYLES[item.mode] || MODE_STYLES.Sale;
              const condStyle = CONDITION_STYLES[item.condition] || CONDITION_STYLES.Refurbished;
              const isFurniture = item.category === 'Furniture';
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
                  <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000} scale={1.03} className="h-full">
                    <div className="group glass-card rounded-[2.5rem] overflow-hidden flex flex-col h-full relative transition-all duration-500 border border-white/10 bg-[#121816]/60 backdrop-blur-2xl hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                      
                      {/* Image - Clickable for Detail */}
                      <div 
                        className="relative aspect-[4/3] overflow-hidden bg-[#0F1712] cursor-pointer"
                        onClick={() => setSelectedProduct(item)}
                      >
                        <img src={item.image_url || item.image} alt={item.name}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                          onError={e => { e.target.src = `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80`; }}
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">
                            View Specs
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border backdrop-blur-md ${modeStyle.bg}`}>
                            {item.mode}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex flex-col relative z-20">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em]">{item.category}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${condStyle}`}>
                            {item.condition}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-white mb-3 leading-tight group-hover:text-emerald-300 transition-colors">{item.name}</h3>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                          <div className="flex flex-col">
                             <span className="text-xl font-black text-white">{item.formatted_price || item.price_inr}</span>
                             {item.price_per_month && <span className="text-[10px] text-slate-500 font-bold">{item.price_per_month}</span>}
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                            className="p-3 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Tilt>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <CartSidebar />
      </div>

      {/* Swap / Rent Dialog */}
      <AnimatePresence>
        {showSwapModal && lastAddedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="glass-panel rounded-[2.5rem] p-10 max-w-md w-full border border-white/10"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/30">
                <ArrowLeftRight className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 leading-tight font-display">
                {lastAddedItem.mode === 'Rent' ? 'Confirm Rental?' : 'Propose a Swap?'}
              </h3>
              <p className="text-slate-400 mb-2 leading-relaxed text-sm">
                <span className="text-white font-bold">{lastAddedItem.name}</span> is listed as{' '}
                <span className="text-emerald-400 font-bold">{lastAddedItem.mode}</span>.
                {lastAddedItem.mode === 'Rent' && ' A rental request will be sent to the owner.'}
                {lastAddedItem.mode === 'Swap' && ' Our AI will match you with the best community item.'}
              </p>

              <div className="my-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">AI Match Suggestion</p>
                <p className="text-sm text-white font-bold">Similar item found in your area</p>
                <p className="text-xs text-slate-400">Same category · 0.9km · Condition 8/10</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    addToCart({ ...lastAddedItem, price_inr: 'Free Swap', price: 0 });
                    setShowSwapModal(false);
                    toast(lastAddedItem.mode === 'Rent' ? 'Rental request sent! 🤝' : 'Swap proposed! Community notified 🔄', 'points');
                  }}
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
                >
                  {lastAddedItem.mode === 'Rent' ? 'Yes, Request Rental' : 'Yes, Propose Swap'}
                </button>
                <button
                  onClick={() => { addToCart(lastAddedItem); setShowSwapModal(false); toast(`${lastAddedItem.name} added!`, 'success'); }}
                  className="w-full py-4 rounded-2xl text-slate-400 hover:text-white font-bold text-sm transition-colors"
                >
                  No thanks, add as-is
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Product Panel */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-[#0D1117] border-l border-white/10 p-10 flex flex-col shadow-2xl overflow-y-auto">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">✕</button>
              <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                <img src={selectedProduct.image_url} className="w-full h-full object-cover" alt="" />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">{selectedProduct.name}</h3>
              <p className="text-emerald-400 font-black text-xl mb-6">{selectedProduct.price_inr}</p>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 mb-1">Circularity Score</h4>
                    <p className="text-sm font-bold text-white">{selectedProduct.circularity || '85'}/100 Grade</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 mb-1">Eco-Rating</h4>
                    <p className="text-sm font-bold text-emerald-400">★ {selectedProduct.condition_score || '9.2'} Verified</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 mb-2">Sustainable Material</h4>
                  <p className="text-sm font-bold text-white">{selectedProduct.material || 'Recycled Components'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 mb-2">Specification / Size</h4>
                  <p className="text-sm font-bold text-white">{selectedProduct.size || 'Standard Fit / Regular'}</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{selectedProduct.description}</p>
              </div>
              <div className="mt-auto pt-10">
                <button onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }} className="w-full btn-neon py-4 text-sm">Initiate {selectedProduct.mode}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sell Modal */}
      <AnimatePresence>
        {showSellModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSellModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-xl bg-[#0D1117] border border-white/10 p-10 rounded-[3rem] shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-3xl font-black text-white mb-2 italic">List My <span className="text-emerald-400">Item.</span></h3>
              <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest font-bold">New listings are queued for Admin verification.</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleSellSubmit(Object.fromEntries(fd));
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Item Name</label>
                  <input name="name" required placeholder="e.g. Vintage Camera" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500/50 outline-none transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Price (₹)</label>
                    <input name="price_inr" type="number" required placeholder="1200" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mode</label>
                    <select name="mode" className="w-full bg-[#161B22] border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500/50 outline-none transition-all appearance-none">
                      <option value="Sale">Sale</option>
                      <option value="Rent">Rent</option>
                      <option value="Swap">Swap</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</label>
                  <select name="category" className="w-full bg-[#161B22] border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500/50 outline-none transition-all appearance-none">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</label>
                  <textarea name="description" required rows={3} placeholder="Tell the community about your item..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-emerald-500/50 outline-none transition-all resize-none" />
                </div>

                <button type="submit" className="w-full py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 mt-4">
                  Submit Listing
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
