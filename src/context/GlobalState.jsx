import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const GlobalContext = createContext();

// Currency conversion singleton
const USD_TO_INR = 83.5;
export const toINR = (usd) => `₹${Math.round(usd * USD_TO_INR).toLocaleString('en-IN')}`;

const RANKS = [
  { name: 'Seedling',       min: 0    },
  { name: 'Eco-Starter',   min: 100  },
  { name: 'Champion',      min: 300  },
  { name: 'Earth Guardian',min: 600  },
  { name: 'Eco-Master',    min: 1000 },
];

// ── Eco-Point Logic ─────────────────────────────────────────
// Categories that earn the sustainability BONUS (50 pts)
export const ECO_BONUS_CATEGORIES = ['Furniture', 'Books', 'Personal Care'];
// Standard categories earn a base reward (5 pts)
export const ECO_BASE_POINTS  = 5;
export const ECO_BONUS_POINTS = 50;

export const calcEcoPoints = (category) =>
  ECO_BONUS_CATEGORIES.includes(category) ? ECO_BONUS_POINTS : ECO_BASE_POINTS;

export const isEcoBonus = (category) => ECO_BONUS_CATEGORIES.includes(category);

const getRank = (pts) => {
  const rank = [...RANKS].reverse().find(r => pts >= r.min);
  return rank?.name || 'Seedling';
};

export const GlobalProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('eco_auth') === 'true');
  const [userRole, setUserRole] = useState(() => {
    const cached = sessionStorage.getItem('eco_profile_cache');
    if (cached) return JSON.parse(cached).role;
    return localStorage.getItem('eco_role') || 'user';
  }); 
  const [adminRole, setAdminRole] = useState(() => localStorage.getItem('eco_admin_lvl') || null); 
  const [ecoPoints, setEcoPoints] = useState(() => {
    const cached = sessionStorage.getItem('eco_profile_cache');
    if (cached) return JSON.parse(cached).points;
    return 420;
  });
  const [cart, setCart] = useState([]);
  const [cartCO2, setCartCO2]   = useState(0);
  const [cartTotal, setCartTotal] = useState('₹0');
  const [userBadges, setUserBadges] = useState(['Early Adopter', 'Waste Warrior', 'Food Hero']);
  const [notifications, setNotifications] = useState([]);

  // Recompute CO2 and INR total whenever cart changes
  useEffect(() => {
    const totalCO2   = cart.reduce((s, i) => s + (i.carbon || 0), 0);
    const totalPrice = cart.reduce((s, i) => s + (i.price   || 0), 0);
    setCartCO2(totalCO2.toFixed(3));
    setCartTotal(toINR(totalPrice));
  }, [cart]);

  const login = (userData) => {
    setIsAuthenticated(true);
    const role = (userData.role || 'User').toLowerCase();
    setUserRole(role);
    setEcoPoints(userData.points || 420);
    
    // Fast Mode: Cache essential metadata
    const profile = {
      ...userData,
      role,
      cachedAt: Date.now()
    };

    localStorage.setItem('eco_auth', 'true');
    localStorage.setItem('eco_role', role);
    localStorage.setItem('eco_user_id', userData.id);
    sessionStorage.setItem('eco_profile_cache', JSON.stringify(profile));

    if (role === 'admin') {
      setAdminRole('Level 5');
      localStorage.setItem('eco_admin_lvl', 'Level 5');
    }
  };
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('user');
    setAdminRole(null);
    setCart([]);
    localStorage.clear();
  };

  const addToCart = useCallback((product) => {
    setCart(prev => [...prev, { ...product, cartUid: Date.now() }]);
  }, []);

  const removeFromCart = useCallback((cartUid) => {
    setCart(prev => prev.filter(i => i.cartUid !== cartUid));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addEcoPoints = useCallback((points) => {
    setEcoPoints(prev => prev + points);
  }, []);

  const pushNotification = useCallback((msg) => {
    const id = Date.now();
    setNotifications(prev => [{ id, msg, ts: new Date() }, ...prev]);
  }, []);

  // Admin Oversight logic & Requests
  const currentUser = 'USR-001'; // Mock user ID for the standard user
  const [requests, setRequests] = useState([
    { id: 'REQ-001', type: 'Buy', item: 'Elegant Kids Dress', productId: 1, amount: '₹1,200', status: 'Pending', user: 'USR-001', messages: [{ sender: 'USR-001', text: 'Is this available in red?' }] },
    { id: 'REQ-002', type: 'Rent', item: 'Power Drill', productId: 2, amount: '₹500', status: 'Pending', user: 'Anika M.', seller: 'Amit V.', messages: [] },
    { id: 'REQ-003', type: 'Swap', item: 'Corduroy Shirt', productId: 3, amount: 'Swap', status: 'Approved', user: 'USR-001', messages: [{ sender: 'Admin', text: 'Approved! You can proceed.' }] }
  ]);

  const [activityLog, setActivityLog] = useState([
    { id: 'LOG-1', action: 'System Init', details: 'EcoLoop Advanced Protocol Started', timestamp: new Date(Date.now() - 86400000) }
  ]);

  const [escrowHoldings, setEscrowHoldings] = useState([
    { id: 'ESC-001', item: 'Camera Lens', amount: '₹2,500', status: 'Held', seller: 'Priya K.' }
  ]);

  const [disputes, setDisputes] = useState([
    { id: 'DSP-001', item: 'Fake RayBans', reason: 'Counterfeit Item', status: 'Open', buyer: 'Rahul T.', amount: '₹1,500' }
  ]);

  const logActivity = useCallback((action, details) => {
    setActivityLog(prev => [{ id: `LOG-${Date.now()}`, action, details, timestamp: new Date() }, ...prev]);
  }, []);

  const addPendingRequest = useCallback((request) => {
    setRequests(prev => [{ ...request, id: `REQ-${Date.now().toString().slice(-4)}`, status: 'Pending', messages: request.messages || [] }, ...prev]);
    logActivity('New Request', `User initiated ${request.type} for ${request.item}`);
  }, [logActivity]);

  const addRequestMessage = useCallback((id, sender, text) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, messages: [...r.messages, { sender, text }] } : r));
  }, []);

  const resolveRequest = useCallback((id, status) => {
    setRequests(prev => {
      const req = prev.find(r => r.id === id);
      if (req) {
        logActivity(`Request ${status}`, `${req.item} (${req.type}) was ${status.toLowerCase()} by Admin`);
        if (status === 'Approved' && req.type === 'Rent') {
          // Send to Escrow automatically
          setEscrowHoldings(h => [{ id: `ESC-${Date.now().toString().slice(-4)}`, item: req.item, amount: req.amount, status: 'Held', seller: req.seller || 'Platform' }, ...h]);
        }
      }
      return prev.map(r => r.id === id ? { ...r, status } : r);
    });
  }, [logActivity]);

  const releaseEscrow = useCallback((id) => {
    setEscrowHoldings(prev => prev.map(h => h.id === id ? { ...h, status: 'Released' } : h));
    logActivity('Escrow Released', `Funds released for holding ${id}`);
  }, [logActivity]);

  const refundDispute = useCallback((id) => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'Refunded' } : d));
    logActivity('Dispute Refunded', `Instant refund issued for ticket ${id}`);
  }, [logActivity]);

  const [financialMetrics, setFinancialMetrics] = useState(null);
  const [sellerMetrics, setSellerMetrics] = useState(null);

  const fetchFinancialMetrics = useCallback(async () => {
    try {
      const data = await apiClient.get('/api/admin/finances');
      setFinancialMetrics(data);
    } catch (e) {
      console.error('Finance sync failed', e);
    }
  }, []);

  const fetchSellerMetrics = useCallback(async (userId) => {
    try {
      const data = await apiClient.get(`/api/seller/metrics/${userId}`);
      setSellerMetrics(data);
    } catch (e) {
      console.error('Seller metrics sync failed', e);
    }
  }, []);

  return (
    <GlobalContext.Provider value={{
      isAuthenticated, login, logout,
      ecoPoints, addEcoPoints,
      ecoRank: getRank(ecoPoints),
      cart, addToCart, removeFromCart, clearCart,
      cartCO2, cartTotal,
      userBadges,
      notifications, pushNotification,
      toINR,
      calcEcoPoints,
      isEcoBonus,
      userRole, adminRole, currentUser,
      requests, addPendingRequest, resolveRequest, addRequestMessage,
      activityLog, logActivity,
      escrowHoldings, releaseEscrow,
      disputes, refundDispute,
      financialMetrics, fetchFinancialMetrics,
      sellerMetrics, fetchSellerMetrics
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalContext);


