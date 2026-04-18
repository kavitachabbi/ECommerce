import React, { useState } from 'react';
import { Palette, Zap, Recycle, UserPlus, ArrowRight, ExternalLink, X } from 'lucide-react';
import { MOCK_DATA } from '../data/mockData';
import ShimmerSkeleton from '../components/ui/ShimmerSkeleton';
import { useToast } from '../components/ui/Toast';
import { useGlobalState } from '../context/GlobalState';
import { motion, AnimatePresence } from 'framer-motion';

const UpcycleHub = () => {
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const toast = useToast();
  const { addEcoPoints } = useGlobalState();

  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 1100); return () => clearTimeout(t); }, []);

  const categories = [
    { name: 'Textile Waste', icon: Palette, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { name: 'E-Waste',       icon: Zap,     color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { name: 'Wood & Pallets',icon: Recycle,  color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { name: 'Plastic Scraps',icon: UserPlus, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  ];

  const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800', title: 'Artisan Stools', desc: 'Industrial pallets × denim scraps' },
    { src: 'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=800', title: 'Denim Art Wall', desc: 'Levi\'s factory offcuts' },
    { src: 'https://images.unsplash.com/photo-1558484628-91e06122d73b?auto=format&fit=crop&q=80&w=800', title: 'Copper Sculptures', desc: 'TechRecycle copper wiring' },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <p className="text-[10px] font-black text-emerald-400 tracking-[0.3em] uppercase">Waste Transformed</p>
        <h2 className="text-5xl font-black text-white tracking-tight font-display">Upcycling Studio</h2>
        <p className="text-slate-400 font-medium text-lg leading-relaxed">
          Industrial and household waste into raw materials for creators.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <motion.button key={cat.name} whileHover={{ y:-4, scale:1.05 }}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-xl font-bold text-sm transition-all ${cat.color} bg-white/5`}>
            <cat.icon size={18}/>
            {cat.name}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* Eco-Creator CTA */}
          <div className="glass-card rounded-[2rem] p-8 bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-emerald-500/20">
            <h3 className="text-xl font-black text-white mb-3 leading-tight font-display">Become an Eco-Creator</h3>
            <p className="text-slate-400 text-sm mb-6">Get priority access to industrial waste streams. Tax-certified & logistics supported.</p>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all"
            >
              Register Now
            </button>
            <div className="mt-6 space-y-3">
              {['Verified Donor Network','Tax Certification Support','Logistics & Pickup'].map(b => (
                <div key={b} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"/>
                  <span className="text-xs font-medium text-slate-300">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Teaser */}
          <div className="glass-card rounded-[2rem] p-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Designer Spotlight</h4>
            <div className="aspect-square rounded-2xl overflow-hidden mb-4 cursor-pointer" onClick={()=>{setShowGallery(true);setGalleryIdx(0);}}>
              <img src={galleryImages[0].src} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt=""/>
            </div>
            <p className="text-sm font-bold text-white mb-1">{galleryImages[0].title}</p>
            <p className="text-xs text-slate-400 mb-4">{galleryImages[0].desc}</p>
            <button onClick={()=>setShowGallery(true)} className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 tracking-wider hover:underline">
              View Full Gallery <ExternalLink size={10}/>
            </button>
          </div>
        </div>

        {/* Materials Feed */}
        <div className="xl:col-span-3">
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-2xl font-black text-white font-display">Available Raw Material</h3>
          </div>

          {loading ? <ShimmerSkeleton type="card" count={4}/> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_DATA.upcycleMaterials.map((material, idx) => (
                <motion.div key={material.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:idx*0.1 }}>
                  <div className="glass-card rounded-[2rem] flex flex-col md:flex-row gap-5 p-5 group">
                    <div className="w-full md:w-36 h-36 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={material.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-75 group-hover:brightness-100" alt=""/>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-base font-bold text-white">{material.name}</h4>
                          <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mt-0.5">Donor: {material.donor}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">FREE</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{material.description}</p>
                      <button
                        onClick={() => { addEcoPoints(20); toast(`Batch of ${material.name} claimed! +20 pts ♻️`, 'success'); }}
                        className="w-full py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowRight size={13}/> Claim Batch
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Post Request CTA */}
          <div className="mt-12 p-8 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-center hover:border-emerald-500/30 transition-colors group">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all">
              <Zap size={28}/>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Looking for something specific?</h4>
            <p className="text-sm text-slate-400 max-w-md mb-8">Post a Material Request and our donor network will be notified when a match becomes available.</p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-12 py-3 rounded-2xl bg-white/5 text-white border border-white/10 font-black text-sm hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
            >
              Post Request
            </button>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/70 backdrop-blur-md">
            <motion.div initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.85,opacity:0}} className="glass-panel rounded-[2.5rem] p-10 max-w-md w-full border border-white/10 space-y-4">
              <h3 className="text-2xl font-black text-white font-display">Register as Eco-Creator</h3>
              {['Full Name','Business / Studio Name','Category (Textile, E-Waste…)','Contact Email'].map(p=>(
                <input key={p} placeholder={p} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"/>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={()=>{setShowRegisterModal(false);toast('Registration submitted! We\'ll reach out shortly 🎉','success');addEcoPoints(50);}} className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all">Submit Registration</button>
                <button onClick={()=>setShowRegisterModal(false)} className="px-6 py-3 rounded-2xl text-slate-400 hover:text-white font-bold text-sm transition-colors">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Material Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/70 backdrop-blur-md">
            <motion.div initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.85,opacity:0}} className="glass-panel rounded-[2.5rem] p-10 max-w-md w-full border border-white/10 space-y-4">
              <h3 className="text-2xl font-black text-white font-display">Post Material Request</h3>
              {['Material Type','Quantity Needed','Purpose / Project Description','Preferred Location'].map(p=>(
                <input key={p} placeholder={p} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"/>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={()=>{setShowRequestModal(false);toast('Request posted! Donors will be notified ♻️','points');addEcoPoints(15);}} className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all">Post Request</button>
                <button onClick={()=>setShowRequestModal(false)} className="px-6 py-3 rounded-2xl text-slate-400 hover:text-white font-bold text-sm transition-colors">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Gallery */}
      <AnimatePresence>
        {showGallery && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-8">
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}} className="relative max-w-3xl w-full">
              <button onClick={()=>setShowGallery(false)} className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
              <div className="rounded-[2rem] overflow-hidden">
                <img src={galleryImages[galleryIdx].src} className="w-full aspect-video object-cover" alt=""/>
              </div>
              <div className="mt-4 text-center">
                <p className="text-white font-black text-xl">{galleryImages[galleryIdx].title}</p>
                <p className="text-slate-400 text-sm">{galleryImages[galleryIdx].desc}</p>
              </div>
              <div className="flex justify-center gap-3 mt-6">
                {galleryImages.map((_, i) => (
                  <button key={i} onClick={()=>setGalleryIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i===galleryIdx?'bg-emerald-400 scale-125':'bg-slate-600'}`}/>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={()=>setGalleryIdx(i=>Math.max(0,i-1))} className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all">← Prev</button>
                <button onClick={()=>setGalleryIdx(i=>Math.min(galleryImages.length-1,i+1))} className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all">Next →</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpcycleHub;
