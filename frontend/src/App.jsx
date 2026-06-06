import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Header from './components/Header';
import Footer from './components/Footer';
import PaymentModal from './components/PaymentModal';
import IncomingCallModal from './components/IncomingCallModal';
import SecureCallModal from './components/SecureCallModal';
import { Toaster, toast } from 'react-hot-toast';
import { getBackendUrl } from './utils/api';

import Home from './pages/Home';
import ExtendedRegistration from './pages/ExtendedRegistration';
import LoginPage from './pages/LoginPage';
import MechanicRegistration from './pages/MechanicRegistration';
import MechanicList from './pages/MechanicList';
import MechanicLogin from './pages/MechanicLogin';
import MechanicDashboard from './pages/MechanicDashboard';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import FAQ from './pages/FAQ';
import VehicleLandingPage from './pages/VehicleLandingPage';
import AIAssistant from './pages/AIAssistant';
import CommunityHelp from './pages/CommunityHelp';
import Sentinel from './pages/Sentinel';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import GlobalTrackingWidget from './components/GlobalTrackingWidget';
import HostSpace from './pages/HostSpace';
import FindParking from './pages/FindParking';
import EVHub from './pages/EVHub';

import { HelmetProvider } from 'react-helmet-async';

// Contexts
export const ThemeContext = createContext();
export const AuthContext = createContext();

function App() {
  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Auth State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('parkeActiveUser');
      let u = (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
      // Force Diamond status for owner on startup/refresh
      if (u && u.email === import.meta.env.VITE_ADMIN_EMAIL) {
        u.subscriptionTier = 'diamond';
      }
      return u;
    } catch (err) {
      console.error("Corrupted LocalStorage User data:", err);
      localStorage.removeItem('parkeActiveUser');
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      const saved = localStorage.getItem('parkeToken');
      return (saved && saved !== 'undefined' && saved !== 'null') ? saved : null;
    } catch (err) {
      return null;
    }
  });

  const login = (userData, jwtToken) => {
    if (!userData) return;
    // Force Diamond status for owner upon login
    if (userData.email === import.meta.env.VITE_ADMIN_EMAIL) {
      userData.subscriptionTier = 'diamond';
    }
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('parkeActiveUser', JSON.stringify(userData));
    localStorage.setItem('parkeToken', jwtToken);
  };

  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('parkeActiveUser');
    localStorage.removeItem('parkeToken');
    localStorage.removeItem('active_order_id'); // Cleanup any stale payment data
  };

  const isPro = (u = user) => {
    if (!u) return false;
    // Hardcoded bypass for owner for absolute reliability
    if (u.email === import.meta.env.VITE_ADMIN_EMAIL) return true;
    if (!u.subscriptionTier) return false;
    return ['silver', 'gold', 'diamond'].includes(u.subscriptionTier.toLowerCase());
  };


  // Global SOS Tracking State
  const [activeSOS, setActiveSOS] = useState(null);
  const [mechanicLocation, setMechanicLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Global location error:", err)
      );
    }
  }, []);

  // Modals & Call State
  const [paymentPlan, setPaymentPlan] = useState(null); // { name, amount }
  const [incomingCall, setIncomingCall] = useState(null); // { from, signal, fromName }
  const [activeCall, setActiveCall] = useState(false);
  
  const [socket, setSocket] = useState(null);
  
  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      console.log('PWA Install Prompt ready');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const baseUrl = getBackendUrl();
    console.log(`Connecting to backend at: ${baseUrl}`);
    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });
    setSocket(newSocket);
    
    if (user) {
      newSocket.emit('register-user', user._id);
      newSocket.emit('join-sos-room', user._id);
    }

    newSocket.on('incoming-call', (data) => {
      setIncomingCall(data);
    });

    newSocket.on('mechanic-moved', (loc) => {
      setMechanicLocation(loc);
    });

    return () => newSocket.disconnect();
  }, [user?._id]);

  const handleAcceptCall = () => {
    setActiveCall(true);
    // Modal will handle the Peer connection once opened via state
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
  };

  const handleOpenPayment = (name, amount) => {
    if (!user) {
      toast.error("Please log in or register before subscribing.");
      window.location.href = '/login';
      return;
    }
    setPaymentPlan({ name, amount });
  };

  const handlePaymentSuccess = async () => {
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/user/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, tier })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, localStorage.getItem('parkeToken')); // Update AuthContext user
        toast.success(`Congratulations! You are now a ${paymentPlan.name} member.`);
        setPaymentPlan(null);
        // Refresh to trigger PWA detection if they just upgraded
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      toast.error('Issue upgrading account, please contact support.');
    }
  };

  // --- PWA SERVICE WORKER REGISTRATION ---
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('PWA Service Worker Registered', reg.scope))
        .catch(err => console.error('PWA Registration Error:', err));
    }
  }, []);

  // --- PUSH NOTIFICATIONS REGISTRATION ---
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then(async (registration) => {
        // We only subscribe if a user or mechanic is actively logged in
        const parkeActive = localStorage.getItem('parkeActiveUser');
        const mechanicActive = localStorage.getItem('mechanic_data');
        
        if (!parkeActive && !mechanicActive) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const existingSub = await registration.pushManager.getSubscription();
                if (!existingSub) {
                    const baseUrl = getBackendUrl();
                    const vapidRes = await fetch(`${baseUrl}/api/push/vapidPublicKey`);
                    if (!vapidRes.ok) return;
                    
                    const { publicKey } = await vapidRes.json();
                    if (!publicKey) {
                      console.warn('VAPID Public Key not found in response');
                      return;
                    }
                    const padding = '='.repeat((4 - publicKey.length % 4) % 4);
                    const base64 = (publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
                    const rawData = window.atob(base64);
                    const authArray = new Uint8Array(rawData.length);
                    for (let i = 0; i < rawData.length; ++i) { authArray[i] = rawData.charCodeAt(i); }
                    
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: authArray
                    });
                    
                    let reqBody = { subscription };
                    if (user && user._id) {
                        reqBody.userId = user._id;
                    } else if (mechanicActive) {
                        const m = JSON.parse(mechanicActive);
                        reqBody.mechanicId = m._id || m.id;
                    }

                    await fetch(`${baseUrl}/api/push/subscribe`, {
                        method: 'POST',
                        body: JSON.stringify(reqBody),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    console.log('Push Notifications Subscribed successfully!');
                }
            }
        } catch (err) {
            console.error('Push Registration Error:', err);
        }
      }).catch(err => console.error('SW Push Err', err));
    }
  }, [user]);

  return (
    <HelmetProvider>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <AuthContext.Provider value={{ user, token, login, logout, isPro, activeSOS, setActiveSOS, userLocation, mechanicLocation }}>
            <Router>
              <Toaster position="top-center" toastOptions={{ style: { background: '#111827', color: '#f3f4f6', borderRadius: '8px', border: '1px solid #374151' } }} />
              <Header onOpenPayment={handleOpenPayment} installPrompt={installPrompt} />
              <main>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home onOpenPayment={handleOpenPayment} />} />
                  <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
                  <Route path="/register" element={<ExtendedRegistration />} />
                  <Route path="/mechanic-register" element={<MechanicRegistration />} />
                  <Route path="/join" element={<Navigate to="/mechanic-register" replace />} />
                  <Route path="/m-login" element={<MechanicLogin />} />
                  <Route path="/m-dash" element={<MechanicDashboard />} />
                  <Route path="/mechanics" element={<MechanicList />} />
                  <Route path="/ai-doctor" element={<AIAssistant />} />
                  <Route path="/help" element={<CommunityHelp />} />
                  <Route path="/community-help" element={<Navigate to="/help" replace />} />
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/v/:id" element={<VehicleLandingPage />} />
                  <Route path="/cam" element={<Sentinel />} />
                  <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                  <Route path="/sentinel-ops" element={user && (user.email === import.meta.env.VITE_ADMIN_EMAIL) ? <AdminDashboard user={user} /> : <Navigate to="/" />} />
                  <Route path="/host" element={<HostSpace />} />
                  <Route path="/park" element={<FindParking />} />
                  <Route path="/ev-hub" element={<EVHub />} />
                  {/* Guest-only routes are handled by redirection logic in components or above */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
              <Footer />

              {/* Modals */}
              {paymentPlan && (
                <PaymentModal 
                  plan={paymentPlan} 
                  entityId={user?._id} 
                  entityType="user" 
                  onClose={() => setPaymentPlan(null)} 
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {incomingCall && (
                <IncomingCallModal 
                  fromName={incomingCall.fromName}
                  onAccept={handleAcceptCall}
                  onReject={handleRejectCall}
                />
              )}

              {activeCall && incomingCall && (
                <SecureCallModal 
                  vehicleId={user?._id}
                  incomingSignal={incomingCall.signal}
                  callerSocketId={incomingCall.from}
                  isOwner={true}
                  onClose={() => {
                    setActiveCall(false);
                    setIncomingCall(null);
                  }}
                />
              )}

              {/* Global Tracking Widget */}
              <GlobalTrackingWidget 
                activeSOS={activeSOS}
                mechanicLocation={mechanicLocation}
                userLocation={userLocation}
                onComplete={() => setActiveSOS(null)}
              />
            </Router>
          </AuthContext.Provider>
        </ThemeContext.Provider>
      </HelmetProvider>
  );
}

export default App;
