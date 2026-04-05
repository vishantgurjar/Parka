import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PaymentModal from './components/PaymentModal';
import Home from './pages/Home';
import ExtendedRegistration from './pages/ExtendedRegistration';
import LoginPage from './pages/LoginPage';
import MechanicRegistration from './pages/MechanicRegistration';
import MechanicList from './pages/MechanicList';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import FAQ from './pages/FAQ';
import VehicleLandingPage from './pages/VehicleLandingPage';

import { HelmetProvider } from 'react-helmet-async';
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
    const saved = localStorage.getItem('parkeActiveUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('parkeToken') || null);

  const login = (userData, jwtToken) => {
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
  };

  // Modals State
  const [paymentPlan, setPaymentPlan] = useState(null); // { name, amount }

  const handleOpenPayment = (name, amount) => {
    if (!user) {
      alert("Please log in or register before subscribing.");
      window.location.href = '/login';
      return;
    }
    setPaymentPlan({ name, amount });
  };

  return (
    <HelmetProvider>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <AuthContext.Provider value={{ user, login, logout }}>
            <Router>
              <Header />
              <main>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home onOpenPayment={handleOpenPayment} />} />
                  <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
                  <Route path="/register" element={<ExtendedRegistration />} />
                  <Route path="/mechanic-register" element={<MechanicRegistration />} />
                  <Route path="/mechanics" element={<MechanicList />} />
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/v/:id" element={<VehicleLandingPage />} />
                  
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
                />
              )}
            </Router>
          </AuthContext.Provider>
        </ThemeContext.Provider>
      </HelmetProvider>
  );
}

export default App;
