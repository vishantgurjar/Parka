import { useState, useEffect, useContext } from 'react';
import { Mail, Lock, ChevronRight, ShieldCheck, ArrowLeft, Eye, EyeOff, UserPlus, LogIn, CheckCircle2, Car, Wrench, Sparkles } from 'lucide-react';
import { AuthContext } from '../App';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import { toast } from 'react-hot-toast';
import { getBackendUrl } from '../utils/api';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login', 'register', or 'forgot'
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot Password / Password Recovery State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter OTP and reset pass
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Read URL query parameters or route state to auto-switch mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'register' || location.state?.mode === 'register') {
      setMode('register');
    } else if (modeParam === 'forgot' || location.state?.mode === 'forgot') {
      setMode('forgot');
    }
  }, [location]);

  // 30-Second Countdown Timer for Forgot Password OTP Resend
  useEffect(() => {
    let interval = null;
    if (mode === 'forgot' && forgotStep === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, forgotStep, resendTimer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      return toast.error('Please enter both email and password.');
    }
    setLoading(true);
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        login(data.user, data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        const from = location.state?.from || '/';
        navigate(from);
      } else {
        toast.error(data.message || 'Login failed. Please check credentials or create an account.');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Network error connecting to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail) return toast.error('Please enter your email.');
    setLoading(true);
    setDevOtp('');
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Verification OTP generated successfully.');
        if (data.devOtp) {
          setDevOtp(data.devOtp);
        }
        setResendTimer(30);
        setForgotStep(2);
      } else {
        toast.error(data.message || 'Failed to generate verification OTP.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error('Network error. Failed to send verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    handleRequestOtp();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      return toast.error('Please fill in all fields.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (otp.length !== 6) {
      return toast.error('Verification code must be 6 digits.');
    }

    setLoading(true);
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password reset successfully! Please sign in.');
        setMode('login');
        setForgotStep(1);
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setDevOtp('');
      } else {
        toast.error(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Network error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <SEO 
        title={mode === 'register' ? "Create Account - Parxéé City" : "Login - Parxéé City"}
        description="Access your Parxéé City account or create a new profile to manage your vehicle protection, emergency smart cards, and parking passes."
      />

      <style>{`
        .login-page-container {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          background: #030712;
          position: relative;
          color: #f3f4f6;
          overflow-x: hidden;
        }
        .login-hero-pane {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          justifyContent: flex-end;
          padding: 4rem;
          background: linear-gradient(135deg, #0b1120 0%, #030712 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }
        .login-form-pane {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          padding: 2.5rem 1.5rem;
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          box-sizing: border-box;
        }
        .login-box-wrapper {
          max-width: 460px;
          width: 100%;
          position: relative;
          z-index: 2;
        }
        .mode-toggle-tab-bar {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 2rem;
          backdrop-filter: blur(12px);
          gap: 4px;
        }
        .mode-toggle-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 8px;
          padding: 11px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #9ca3af;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .mode-toggle-tab-btn.active {
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(14, 165, 233, 0.15) 100%);
          color: #5eead4;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(94, 234, 212, 0.3);
        }
        .login-input-group {
          position: relative;
        }
        .login-input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .login-input-field {
          width: 100%;
          padding: 16px 18px 16px 52px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          font-size: 1.05rem;
          outline: none;
          transition: all 0.25s ease;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
          box-sizing: border-box;
        }
        .login-input-field:focus {
          border-color: #2dd4bf;
          background: rgba(20, 184, 166, 0.06);
          box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.15);
        }
        .top-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 1.5rem;
          transition: color 0.2s;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          width: fit-content;
        }
        .top-back-btn:hover {
          color: #5eead4;
          border-color: rgba(94, 234, 212, 0.3);
        }
        @media (max-width: 900px) {
          .login-hero-pane {
            display: none !important;
          }
          .login-form-pane {
            padding: 1.5rem 1rem;
            justify-content: flex-start;
          }
          .login-box-wrapper {
            padding-top: 1rem;
            padding-bottom: 2rem;
          }
        }
      `}</style>
      
      {/* LEFT PANE: Branding / Image (Hidden on small screens) */}
      <div className="login-hero-pane">
        {/* Abstract glowing ambient orbs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '2.5rem' }}>
            <img src="/logo.png" alt="Parxéé City" style={{ width: '58px', height: '58px', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.6)' }} />
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.5px', margin: 0, background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PARXÉÉ CITY
              </h1>
              <span style={{ fontSize: '0.85rem', color: '#5eead4', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Vehicle Security Network
              </span>
            </div>
          </div>

          <h2 style={{ fontSize: '3.2rem', fontWeight: '800', lineHeight: '1.15', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Secure. <br/>
            <span style={{ color: '#5eead4' }}>Intelligent.</span> <br/>
            Connected.
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '420px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            Join the smart network of vehicle owners. Manage your emergency smart cards, automated SOS alerts, and verified parking vaults.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.95rem' }}>
              <CheckCircle2 size={18} color="#2dd4bf" /> Smart QR-based Emergency Alert System
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.95rem' }}>
              <CheckCircle2 size={18} color="#2dd4bf" /> On-demand Verified Mechanic Dispatch
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.95rem' }}>
              <CheckCircle2 size={18} color="#2dd4bf" /> 24/7 Encrypted Identity & Parking Vault
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Login & Register Forms */}
      <div className="login-form-pane">
        {/* Ambient glow behind card */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.06) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />

        <div className="login-box-wrapper">
          {/* Mobile Back to Home Navigation */}
          <Link to="/" className="top-back-btn">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          {/* Mobile Logo & Header */}
          <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
            <img src="/logo.png" alt="Parxéé City" style={{ width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 1rem', boxShadow: '0 8px 25px rgba(0,0,0,0.5)' }} />
            <h3 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff', marginBottom: '0.35rem' }}>
              {mode === 'login' ? 'Welcome Back' : mode === 'forgot' ? 'Recover Password' : 'Create an Account'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              {mode === 'login' 
                ? 'Enter your credentials to access your vehicle vault.' 
                : mode === 'forgot' 
                  ? (forgotStep === 1 ? 'Enter your registered email to receive an OTP code.' : 'Enter your 6-digit OTP code to create a new password.')
                  : 'Start your membership for smart emergency cards & protection.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Create Account) */}
          {mode !== 'forgot' && (
            <div className="mode-toggle-tab-bar">
              <button 
                type="button"
                className={`mode-toggle-tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
              >
                <LogIn size={18} /> Sign In
              </button>
              <button 
                type="button"
                className={`mode-toggle-tab-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => setMode('register')}
              >
                <UserPlus size={18} /> Create Account
              </button>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email Input */}
              <div className="login-input-group">
                <div className="login-input-icon">
                  <Mail size={20} strokeWidth={1.75} />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  autoComplete="email"
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                  className="login-input-field"
                />
              </div>

              {/* Password Input */}
              <div className="login-input-group">
                <div className="login-input-icon">
                  <Lock size={20} strokeWidth={1.75} />
                </div>
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required 
                  autoComplete="current-password"
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  className="login-input-field"
                  style={{ paddingRight: '52px' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                  title={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.25rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setForgotStep(1); setForgotEmail(loginEmail); setDevOtp(''); }} 
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }} 
                  onMouseOver={(e) => e.target.style.color = '#5eead4'} 
                  onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="btn-gradient full-width" 
                style={{ 
                  padding: '16px', 
                  fontSize: '1.05rem', 
                  border: 'none', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  borderRadius: '14px', 
                  color: '#030712', 
                  fontWeight: '800', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '8px', 
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)',
                  transition: 'all 0.2s ease',
                  marginTop: '0.25rem'
                }}
              >
                {loading ? 'Signing In...' : 'Secure Sign In'} <ChevronRight size={20} />
              </button>
              
              {/* Switch to Register link */}
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.95rem', color: '#94a3b8' }}>
                New to Parxéé City?{' '}
                <button 
                  type="button" 
                  onClick={() => setMode('register')} 
                  style={{ color: '#5eead4', background:'none', border:'none', fontWeight: 'bold', cursor: 'pointer', marginLeft: '4px', textDecoration: 'underline' }}
                >
                  Create an Account
                </button>
              </div>

              {/* Mechanic Portal Login Link */}
              <div style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                <Link to="/m-login" style={{ color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Wrench size={14} /> Partner Mechanic Login &rarr;
                </Link>
              </div>
            </form>
          )}

          {/* MODE: REGISTER / CREATE ACCOUNT */}
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ 
                background: 'rgba(20, 184, 166, 0.05)', 
                border: '1px solid rgba(20, 184, 166, 0.25)', 
                padding: '1.75rem', 
                borderRadius: '18px', 
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}>
                <div style={{ 
                  background: 'rgba(20, 184, 166, 0.12)', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.25rem',
                  border: '1px solid rgba(20, 184, 166, 0.3)'
                }}>
                  <ShieldCheck size={30} color="#2dd4bf" />
                </div>
                <h4 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '800' }}>
                  Vehicle Owner Registration
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.55', margin: '0 0 1.25rem' }}>
                  Register your vehicle profile and emergency contacts to activate your Smart QR Protection Card.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Car size={16} color="#5eead4" /> Instant Digital Emergency Vehicle Card
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="#5eead4" /> Direct Parking Space Reservation & EV Hub
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="#5eead4" /> 1-Tap SOS Contact Alerts
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/register')} 
                  className="btn-gradient full-width" 
                  style={{ 
                    padding: '16px', 
                    fontSize: '1.05rem', 
                    border: 'none', 
                    cursor: 'pointer', 
                    borderRadius: '14px', 
                    color: '#030712', 
                    fontWeight: '800', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '8px', 
                    boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)',
                    width: '100%'
                  }}
                >
                  Start Vehicle Registration <ChevronRight size={20} />
                </button>
              </div>

              {/* Mechanic registration option */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.06)', 
                padding: '1rem 1.25rem', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem' }}>Are you a mechanic?</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Join the Parxéé partner mechanic network.</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => navigate('/mechanic-register')} 
                  style={{ 
                    padding: '8px 14px', 
                    borderRadius: '10px', 
                    border: '1px solid rgba(255,255,255,0.15)', 
                    background: 'rgba(255,255,255,0.05)', 
                    color: '#5eead4', 
                    fontSize: '0.85rem', 
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Join as Mechanic &rarr;
                </button>
              </div>
              
              <div style={{ textAlign: 'center', fontSize: '0.95rem', color: '#94a3b8' }}>
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => setMode('login')} 
                  style={{ color: '#5eead4', background:'none', border:'none', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={forgotStep === 1 ? handleRequestOtp : handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {forgotStep === 1 ? (
                <>
                  <div className="login-input-group">
                    <div className="login-input-icon">
                      <Mail size={20} strokeWidth={1.75} />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Enter registered email" 
                      required 
                      value={forgotEmail} 
                      onChange={e => setForgotEmail(e.target.value)} 
                      disabled={loading}
                      className="login-input-field"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-gradient full-width" 
                    style={{ 
                      padding: '16px', 
                      fontSize: '1.05rem', 
                      border: 'none', 
                      cursor: loading ? 'not-allowed' : 'pointer', 
                      borderRadius: '14px', 
                      color: '#030712', 
                      fontWeight: '800', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '8px', 
                      opacity: loading ? 0.7 : 1, 
                      boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)'
                    }}
                  >
                    {loading ? 'Sending Code...' : 'Send Verification OTP'} <ChevronRight size={20} />
                  </button>
                </>
              ) : (
                <>
                  {devOtp && (
                    <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.3)', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.9rem', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: '#5eead4', fontWeight: 'bold' }}>Developer Mode OTP Helper:</span>
                      <span>Your OTP is: <strong style={{ fontSize: '1.15rem', letterSpacing: '3px', color: '#5eead4' }}>{devOtp}</strong></span>
                    </div>
                  )}

                  {/* OTP Input */}
                  <div className="login-input-group">
                    <div className="login-input-icon">
                      <ShieldCheck size={20} strokeWidth={1.75} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="6-Digit Verification Code" 
                      required 
                      maxLength={6}
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                      disabled={loading}
                      className="login-input-field"
                    />
                  </div>

                  {/* Resend OTP Timer & Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Didn't receive code?</span>
                    {resendTimer > 0 ? (
                      <span style={{ color: '#5eead4', fontWeight: 'bold' }}>
                        Resend in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer} ⏱️
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        style={{ background: 'none', border: 'none', color: '#5eead4', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      >
                        Resend OTP 🔄
                      </button>
                    )}
                  </div>

                  {/* New Password Input */}
                  <div className="login-input-group">
                    <div className="login-input-icon">
                      <Lock size={20} strokeWidth={1.75} />
                    </div>
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      placeholder="New Password" 
                      required 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      disabled={loading}
                      className="login-input-field"
                      style={{ paddingRight: '52px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                    >
                      {showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="login-input-group">
                    <div className="login-input-icon">
                      <Lock size={20} strokeWidth={1.75} />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm New Password" 
                      required 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      disabled={loading}
                      className="login-input-field"
                      style={{ paddingRight: '52px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                    >
                      {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-gradient full-width" 
                    style={{ 
                      padding: '16px', 
                      fontSize: '1.05rem', 
                      border: 'none', 
                      cursor: loading ? 'not-allowed' : 'pointer', 
                      borderRadius: '14px', 
                      color: '#030712', 
                      fontWeight: '800', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '8px', 
                      opacity: loading ? 0.7 : 1, 
                      boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)'
                    }}
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'} <ChevronRight size={20} />
                  </button>

                  <button 
                    type="button" 
                    disabled={loading} 
                    onClick={() => setForgotStep(1)} 
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', alignSelf: 'center', marginTop: '-0.25rem' }}
                  >
                    <ArrowLeft size={15} /> Edit Email
                  </button>
                </>
              )}

              {/* Back to Login Link */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setMode('login'); setForgotStep(1); setDevOtp(''); }} 
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }} 
                  onMouseOver={(e) => e.target.style.color = '#5eead4'} 
                  onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
