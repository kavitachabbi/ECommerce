import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, ShoppingCart, Truck, CheckCircle2, Package, MapPin, CreditCard, Banknote, RefreshCw, User, Send, Leaf, Clock, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { useToast } from '../components/ui/Toast';
import { useGlobalState } from '../context/GlobalState';
import Tilt from 'react-parallax-tilt';
import Lottie from 'lottie-react';

// ─── Size options per category ───────────────────────────────
const SIZE_OPTIONS = {
  Apparel:  ['XS','S','M','L','XL','XXL'],
  Furniture:['Standard','Large','Custom'],
  Tech:     ['128GB','256GB','512GB','1TB'],
  Books:    ['Paperback','Hardcover'],
  default:  ['One Size'],
};

// ─── Delivery steps ──────────────────────────────────────────
const STEPS = ['Confirmed','Dispatched','Out for Delivery','Delivered'];

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(n => (
      <button key={n} onClick={() => onChange && onChange(n)} type="button">
        <Star size={18} className={n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
      </button>
    ))}
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { addEcoPoints, calcEcoPoints, isEcoBonus, addPendingRequest, requests, currentUser, addRequestMessage } = useGlobalState();

  const [product, setProduct]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedSize, setSelectedSize] = useState('');

  // Payment / order flow states
  const [stage, setStage]               = useState('detail'); // detail | checkout | pending | tracking
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderData, setOrderData]       = useState({ name:'', address:'' });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [order, setOrder]               = useState(null);
  const [trackStep, setTrackStep]       = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [hasBonus, setHasBonus]         = useState(false);

  // Review form
  const [reviewForm, setReviewForm] = useState({ name:'', content:'', rating: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [prod, revs] = await Promise.all([
          apiClient.get(`/products/${id}`),
          apiClient.get(`/reviews/${id}`),
        ]);
        setProduct(prod);
        setReviews(revs);
        const sizes = SIZE_OPTIONS[prod.category] || SIZE_OPTIONS.default;
        setSelectedSize(sizes[0]);
      } catch { toast('Could not load product', 'error'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  // Simulate delivery status advancing every 3s when on tracking screen
  useEffect(() => {
    if (stage !== 'tracking' || trackStep >= STEPS.length - 1) return;
    const t = setTimeout(async () => {
      const next = trackStep + 1;
      try {
        await apiClient.patch(`/orders/${order.id}/status`, { status: STEPS[next] });
        setTrackStep(next);
        if (next === STEPS.length - 1) toast('🎉 Order Delivered! Thank you for shopping sustainably.', 'points', 5000);
      } catch {}
    }, 3000);
    return () => clearTimeout(t);
  }, [stage, trackStep, order]);

  const handlePlaceOrder = async () => {
    if (!orderData.name.trim() || !orderData.address.trim()) {
      toast('Please fill your name and address', 'error'); return;
    }
    setPlacingOrder(true);
    // Simulate delay
    await new Promise(r => setTimeout(r, 800));
    
    addPendingRequest({
      type: product.mode === 'Rent' ? 'Rent' : product.mode === 'Swap' ? 'Swap' : 'Buy',
      item: product.name,
      amount: product.mode === 'Swap' ? 'Swap' : price,
      user: currentUser,
      productId: Number(id),
      messages: [{ sender: currentUser, text: 'I am ready to proceed with the payment.' }]
    });
    
    setStage('checkout');
    setPlacingOrder(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.content.trim() || !reviewForm.name.trim()) return;
    setSubmittingReview(true);
    try {
      await apiClient.post('/reviews', {
        product_id: id, reviewer_name: reviewForm.name,
        content: reviewForm.content, rating: reviewForm.rating,
      });
      const revs = await apiClient.get(`/reviews/${id}`);
      setReviews(revs);
      setReviewForm({ name:'', content:'', rating:5 });
      toast('Review posted! +10 Eco Points 🌱', 'points');
    } catch { toast('Could not post review', 'error'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCw className="animate-spin text-emerald-400" size={32} />
    </div>
  );
  if (!product) return <div className="text-center text-slate-500 py-20">Product not found.</div>;

  const sizes = SIZE_OPTIONS[product.category] || SIZE_OPTIONS.default;
  const avgRating = reviews.length ? (reviews.reduce((s,r) => s+(r.rating||0),0)/reviews.length).toFixed(1) : null;
  const price = typeof product.price_inr === 'number'
    ? `₹${product.price_inr.toLocaleString('en-IN')}`
    : product.price_inr;

  const existingRequest = requests.find(r => r.productId === Number(id) && r.user === currentUser);
  const [requestMsg, setRequestMsg] = useState('');
  const [chatMsg, setChatMsg] = useState('');

  const handleSendInitialRequest = () => {
    if (!requestMsg.trim()) return;
    addPendingRequest({
      type: product.mode === 'Rent' ? 'Rent' : product.mode === 'Swap' ? 'Swap' : 'Buy',
      item: product.name,
      amount: product.mode === 'Swap' ? 'Swap' : price,
      user: currentUser,
      productId: Number(id),
      messages: [{ sender: currentUser, text: requestMsg }]
    });
    toast('Request sent to Admin!', 'success');
    navigate('/dashboard');
  };

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    addRequestMessage(existingRequest.id, currentUser, chatMsg);
    setChatMsg('');
  };

  // ── Delivery Tracker Screen ──────────────────────────────
  if (stage === 'tracking') return (
    <div className="max-w-lg mx-auto py-16 space-y-8">
      <button onClick={() => navigate('/marketplace')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Marketplace
      </button>
      <div className="glass-card rounded-[2rem] p-8 space-y-6">
        <h2 className="text-2xl font-black text-white">Delivery Tracker</h2>
        <p className="text-slate-400 text-sm">{product.name}</p>
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-4">
            <motion.div animate={i <= trackStep ? {scale:[1,1.3,1]} : {}}
              transition={{duration:0.4}}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                i < trackStep  ? 'bg-emerald-500 border-emerald-500' :
                i === trackStep ? 'bg-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/10'
              }`}>
              {i < trackStep ? <CheckCircle2 size={18} className="text-white" /> :
               i === trackStep ? <RefreshCw size={16} className="text-emerald-400 animate-spin" /> :
               <div className="w-2 h-2 rounded-full bg-slate-600" />}
            </motion.div>
            <div>
              <p className={`font-bold text-sm ${i <= trackStep ? 'text-white' : 'text-slate-600'}`}>{step}</p>
              {i === trackStep && i < STEPS.length-1 && <p className="text-[10px] text-emerald-400 animate-pulse">In progress…</p>}
              {i === STEPS.length-1 && trackStep === STEPS.length-1 && <p className="text-[10px] text-emerald-400 font-bold">✅ Order Delivered!</p>}
            </div>
          </div>
        ))}
        {trackStep === STEPS.length - 1 && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-emerald-400 font-black text-lg">📦 Order Delivered!</p>
            <p className="text-slate-400 text-sm mt-1">Thank you for choosing EcoLoop. You've saved the planet one item at a time! 🌍</p>
          </motion.div>
        )}
      </div>
    </div>
  );

  // ── Checkout Screen ──────────────────────────────────────
  if (stage === 'checkout') return (
    <div className="max-w-lg mx-auto py-10 space-y-6">
      <button onClick={() => setStage('detail')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Product
      </button>
      <div className="glass-card rounded-[2rem] p-8 space-y-6">
        <h2 className="text-2xl font-black text-white">Checkout</h2>
        {/* Product mini summary */}
        <div className="flex gap-4 p-4 rounded-2xl bg-white/5">
          <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
          <div>
            <p className="text-white font-bold text-sm">{product.name}</p>
            <p className="text-emerald-400 font-black">{price}</p>
            <p className="text-slate-500 text-xs">Size: {selectedSize}</p>
          </div>
        </div>
        {/* Delivery info */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Full Name</span>
            <input value={orderData.name} onChange={e => setOrderData(p=>({...p,name:e.target.value}))}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              placeholder="Priya Sharma" />
          </label>
          <label className="block">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Delivery Address</span>
            <textarea value={orderData.address} onChange={e => setOrderData(p=>({...p,address:e.target.value}))}
              rows={3}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
              placeholder="Flat 4B, Eco Towers, Bangalore – 560001" />
          </label>
        </div>
        {/* Payment method */}
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            {[{key:'COD',label:'Cash on Delivery',Icon:Banknote},{key:'Online',label:'Online Payment',Icon:CreditCard}].map(({key,label,Icon}) => (
              <button key={key} onClick={() => setPaymentMethod(key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  paymentMethod===key ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                }`}>
                <Icon size={22} />
                <span className="text-xs font-black">{label}</span>
              </button>
            ))}
          </div>
          {paymentMethod === 'Online' && (
            <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 text-center">
              🔒 Secure UPI / Card payment — demo mode
            </div>
          )}
        </div>
        <button onClick={handlePlaceOrder} disabled={placingOrder}
          className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {placingOrder ? <RefreshCw size={18} className="animate-spin" /> : <Package size={18} />}
          {placingOrder ? 'Placing Order…' : 'Place Order'}
        </button>
      </div>
    </div>
  );

  // ── Product Detail Screen ────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <button onClick={() => navigate('/marketplace')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Image */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000} transitionSpeed={1500} scale={1.02} className="relative rounded-[2rem] overflow-hidden aspect-square bg-[#0F1712]">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border backdrop-blur-md ${
              product.mode==='Rent' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              product.mode==='Swap' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
              'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
              {product.mode}
            </span>
          </div>
        </Tilt>

        {/* Right: Info */}
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">{product.category}</p>
            <h1 className="text-3xl font-black text-white font-display leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              {avgRating && <div className="flex items-center gap-1.5"><Star size={14} className="fill-yellow-400 text-yellow-400" /><span className="text-yellow-400 font-bold text-sm">{avgRating}</span><span className="text-slate-500 text-xs">({reviews.length} reviews)</span></div>}
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 text-sm">Condition: <span className="text-white font-bold">{product.condition_score}/10</span></span>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white">{price}</span>
            {product.mode === 'Rent' && <span className="text-blue-400 text-sm font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">₹{Math.round((product.price_inr||0)*0.08).toLocaleString('en-IN')}/month</span>}
          </div>

          {/* Size Selector */}
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 rounded-xl border text-xs font-black transition-all ${
                    selectedSize===s ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/5 text-slate-400 border-white/10 hover:border-emerald-500/40'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
            <Truck size={16} className="text-emerald-400" />
            <p className="text-xs text-slate-400">Free delivery · Estimated <span className="text-white font-bold">3–5 business days</span></p>
          </div>

          {/* Permission Gate & Actions */}
          <div className="pt-4 border-t border-white/10">
            {!existingRequest && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-amber-400 flex items-center gap-2"><Clock size={14}/> Requires Admin Approval</p>
                <textarea value={requestMsg} onChange={e=>setRequestMsg(e.target.value)}
                  placeholder="Explain why you want to buy/rent this item..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:border-amber-500/50" rows={2} />
                <button onClick={handleSendInitialRequest}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-white font-black text-sm hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2">
                  <Send size={16} /> Send Request to Admin
                </button>
              </div>
            )}

            {existingRequest && existingRequest.status === 'Pending' && (
              <div className="p-4 rounded-[10px] bg-white/5 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-2"><Clock size={14}/> Waiting for Admin Approval</p>
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/20 px-2 py-1 rounded-[4px]">Pending</span>
                </div>
                
                {/* Chat UI */}
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {existingRequest.messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.sender === currentUser ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-slate-500 mb-0.5">{m.sender === currentUser ? 'You' : 'Admin'}</span>
                      <div className={`px-3 py-2 rounded-[10px] text-xs ${m.sender === currentUser ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30 rounded-tr-none' : 'bg-white/10 text-slate-300 border border-white/10 rounded-tl-none'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} placeholder="Type a message..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50" />
                  <button onClick={handleSendChat} className="px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all"><Send size={14}/></button>
                </div>
              </div>
            )}

            {existingRequest && existingRequest.status === 'Approved' && (
              <div className="space-y-4">
                <div className="p-3 rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-400 font-bold text-sm">Request Approved!</p>
                    <p className="text-emerald-500/70 text-xs mt-0.5">The Admin has authorized this transaction. You may now securely checkout.</p>
                  </div>
                </div>
                <button onClick={() => setStage('checkout')}
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2">
                  <ShoppingCart size={18} /> Proceed to Checkout — {price}
                </button>
              </div>
            )}

            {existingRequest && existingRequest.status === 'Rejected' && (
              <div className="p-4 rounded-[10px] bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-bold text-sm">Request Rejected</p>
                  <p className="text-red-500/70 text-xs mt-0.5">The Admin declined this transaction. Please review your messages.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="glass-card rounded-[2rem] p-8 space-y-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Star size={18} className="text-yellow-400 fill-yellow-400" /> Customer Reviews
          {avgRating && <span className="text-yellow-400 font-black ml-1">{avgRating}/5</span>}
        </h2>

        {/* Existing reviews */}
        <div className="space-y-4">
          {reviews.length === 0 && <p className="text-slate-500 text-sm">No reviews yet. Be the first!</p>}
          {reviews.map(r => (
            <div key={r.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <User size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-white font-bold text-sm">{r.reviewer_name || 'Anonymous'}</span>
                </div>
                <StarRating value={r.rating || 5} />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{r.content}</p>
              <p className="text-slate-600 text-[10px]">{new Date(r.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
            </div>
          ))}
        </div>

        {/* Write a review */}
        <form onSubmit={handleSubmitReview} className="space-y-4 border-t border-white/10 pt-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Write a Review</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={reviewForm.name} onChange={e => setReviewForm(p=>({...p,name:e.target.value}))}
              placeholder="Your name"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4">
              <span className="text-slate-500 text-xs">Rating:</span>
              <StarRating value={reviewForm.rating} onChange={v => setReviewForm(p=>({...p,rating:v}))} />
            </div>
          </div>
          <textarea value={reviewForm.content} onChange={e => setReviewForm(p=>({...p,content:e.target.value}))}
            rows={3} placeholder="Share your experience…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none" />
          <button type="submit" disabled={submittingReview}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">
            <Send size={13} /> {submittingReview ? 'Posting…' : 'Post Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
