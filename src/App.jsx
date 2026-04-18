import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GlobalProvider, useGlobalState } from './context/GlobalState';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import Neighborhood from './pages/Neighborhood';
import FoodRescue from './pages/FoodRescue';
import UpcycleHub from './pages/UpcycleHub';
import Dashboard from './pages/Dashboard';
import AdminPortal from './pages/AdminPortal';
import AdminFinance from './pages/AdminFinance';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import EcoAgent from './components/EcoAgent';

// Auth Guard: redirects unauthenticated users to landing page
const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useGlobalState();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Admin Guard: ensures only admins can access restricted portals
const AdminGuard = ({ children }) => {
  const { isAuthenticated, userRole } = useGlobalState();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (userRole?.toLowerCase() !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = ['/login', '/user-login', '/admin-login', '/register'].includes(location.pathname);
  const isHub = location.pathname === '/';

  // Pages that use their own full-screen dark layout
  const darkPages = [
    '/neighborhood-circle', 
    '/dashboard', 
    '/admin', 
    '/admin-finance', 
    '/user-login', 
    '/admin-login', 
    '/register'
  ];
  const isDarkPage = darkPages.includes(location.pathname);

  return (
    <div className={`min-h-screen ${isDarkPage ? 'bg-[#0A0F0D]' : 'bg-[#F8FAF8]'}`}>
      {/* App-level header — shown on inner pages only */}
      {!isHub && !hideNavbar && !isDarkPage && (
        <header className="pt-12 px-8 flex justify-between items-center max-w-7xl mx-auto relative z-20">
          <div>
            <h1 className="text-3xl font-black text-sage tracking-tighter flex items-center gap-2">
              EcoLoop <span className="text-xs bg-sage-50 text-sage px-2 py-1 rounded-lg uppercase tracking-widest border border-sage/10">v1.0</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest text-[10px]">Circular Economy Ecosystem</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-400 uppercase">Current Session</p>
              <p className="text-sm font-black text-slate-700">Earth Guardian</p>
            </div>
            <LogoutButton />
          </div>
        </header>
      )}

      <main className={`${!hideNavbar && !isHub && !isDarkPage ? 'max-w-7xl mx-auto px-8 py-12 pb-32' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Navigate to="/user-login" replace />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/marketplace" element={<AuthGuard><Marketplace /></AuthGuard>} />
            <Route path="/neighborhood" element={<AuthGuard><Neighborhood /></AuthGuard>} />
            <Route path="/food-rescue" element={<AuthGuard><FoodRescue /></AuthGuard>} />
            <Route path="/upcycle" element={<AuthGuard><UpcycleHub /></AuthGuard>} />
            <Route path="/neighborhood-circle" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminGuard><AdminPortal /></AdminGuard>} />
            <Route path="/admin-finance" element={<AdminGuard><AdminFinance /></AdminGuard>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!hideNavbar && !isHub && <Navbar />}
      {!hideNavbar && !isHub && <EcoAgent />}
    </div>
  );
};

// Small logout button in the header avatar area
const LogoutButton = () => {
  const { logout } = useGlobalState();
  return (
    <button
      onClick={logout}
      title="Sign out"
      className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-sage-700 border-2 border-white shadow-md cursor-pointer hover:ring-4 hover:ring-red-200 hover:from-red-400 hover:to-red-600 transition-all duration-300"
    />
  );
};

const App = () => (
  <GlobalProvider>
    <Router>
      <AppContent />
    </Router>
  </GlobalProvider>
);

export default App;
