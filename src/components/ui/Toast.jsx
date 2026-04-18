import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, Zap, X } from 'lucide-react';

const ToastContext = createContext();

const ICONS = {
  success: { Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  error:   { Icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-500/20',     border: 'border-red-500/30'   },
  info:    { Icon: Info,        color: 'text-blue-400',    bg: 'bg-blue-500/20',    border: 'border-blue-500/30'  },
  points:  { Icon: Zap,         color: 'text-yellow-400',  bg: 'bg-yellow-500/20',  border: 'border-yellow-500/30'},
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Viewport */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none" style={{ minWidth: 320 }}>
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const { Icon, color, bg, border } = ICONS[type] || ICONS.info;
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0,  scale: 1     }}
                exit={{    opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-start gap-4 px-5 py-4 rounded-3xl border backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${bg} ${border} bg-[#121816]/80`}
              >
                <Icon size={20} className={`${color} mt-0.5 flex-shrink-0`} />
                <span className="text-sm font-bold text-white leading-snug flex-1">{message}</span>
                <button
                  onClick={() => dismiss(id)}
                  className="text-slate-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
