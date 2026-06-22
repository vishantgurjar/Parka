import { useState, useContext } from 'react';
import { Car, Mail, Lock, ChevronRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../App';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { toast } from 'react-hot-toast';
import { getBackendUrl } from '../utils/api';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login', 'register', or 'forgot'
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password / Password Recovery State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter OTP and reset pass
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
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
        navigate('/');
      } else {
        toast.error(data.message || 'Login failed. Please check credentials or register initially.');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Network error connecting to the server.');
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
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
        toast.success(data.message || 'Password reset successfully.');
        // reset form & transition back to login
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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
      <SEO 
        title="Login - Parxéé City"
        description="Log in to your Parxéé City account to manage your vehicle protection, subscriptions, and emergency cards."
      />
      
      {/* LEFT PANE: Branding / Image (Hidden on small screens) */}
      <div className="login-hero-pane" style={{ 
        flex: 1, 
        position: 'relative', 
        display: window.innerWidth < 768 ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '4rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Abstract shapes / orbs for premium feel */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
        
        {/* Placeholder image representation - we use a clean gradient/mesh if no image is available */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="Parxéé City" style={{ width: '60px', height: '60px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: 0, background: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PARXÉÉ CITY</h1>
          </div>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Secure. <br/>
            <span style={{ color: 'var(--primary)' }}>Intelligent.</span> <br/>
            Connected.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '400px', lineHeight: '1.6' }}>
            Join the elite network of smart vehicle owners. Experience next-generation parking and emergency protection.
          </p>
        </div>
      </div>

      {/* RIGHT PANE: Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Subtle ambient glow behind form */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(13, 148, 136, 0.05) 0%, rgba(0,0,0,0) 50%)', pointerEvents: 'none' }}></div>
        
        <div style={{ maxWidth: '440px', width: '100%', position: 'relative', zIndex: 1 }}>
          
          <div style={{ marginBottom: '3rem', textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
            {window.innerWidth < 768 && (
               <img src="/logo.png" alt="Logo" style={{ width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 1.5rem' }} />
            )}
            <h3 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff', marginBottom: '0.5rem' }}>
              {mode === 'login' ? 'Welcome Back.' : mode === 'forgot' ? 'Recover Password.' : 'Join the Network.'}
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
              {mode === 'login' ? 'Enter your credentials to access your vault.' : mode === 'forgot' ? (forgotStep === 1 ? 'Enter your email to request a reset code.' : 'Enter the verification code and your new password.') : 'Setup your secure vehicle profile.'}
            </p>
          </div>

          {mode === 'login' ? (
             <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               
               {/* Email Input */}
               <div style={{ position: 'relative' }}>
                 <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                   <Mail size={22} strokeWidth={1.5} />
                 </div>
                 <input 
                   type="email" 
                   placeholder="Email Address" 
                   required 
                   value={loginEmail} 
                   onChange={e => setLoginEmail(e.target.value)} 
                   style={{ width: '100%', padding: '18px 18px 18px 54px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.1rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} 
                   onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(20, 184, 166, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.1)'; }}
                   onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'; }}
                 />
               </div>

               {/* Password Input */}
               <div style={{ position: 'relative' }}>
                 <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                   <Lock size={22} strokeWidth={1.5} />
                 </div>
                 <input 
                   type="password" 
                   placeholder="Password" 
                   required 
                   value={loginPassword} 
                   onChange={e => setLoginPassword(e.target.value)} 
                   style={{ width: '100%', padding: '18px 18px 18px 54px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.1rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} 
                   onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(20, 184, 166, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.1)'; }}
                   onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'; }}
                 />
               </div>

               {/* Forgot Password Link */}
               <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setForgotStep(1); setForgotEmail(loginEmail); setDevOtp(''); }} 
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }} 
                    onMouseOver={(e) => e.target.style.color = 'var(--primary)'} 
                    onMouseOut={(e) => e.target.style.color = 'var(--muted)'}
                  >
                    Forgot Password?
                  </button>
               </div>

               {/* Submit Button */}
               <button type="submit" className="btn-gradient full-width" style={{ padding: '18px', fontSize: '1.15rem', border: 'none', cursor: 'pointer', borderRadius: '16px', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(20, 184, 166, 0.5)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(20, 184, 166, 0.4)'; }}>
                 Secure Login <ChevronRight size={22} />
               </button>
               
               {/* Footer Links */}
               <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1rem', color: 'var(--muted)' }}>
                 Don't have an account? <button type="button" onClick={() => setMode('register')} style={{ color: '#fff', background:'none', border:'none', fontWeight: 'bold', cursor: 'pointer', marginLeft: '6px', borderBottom: '1px solid var(--primary)', paddingBottom: '2px' }}>Apply Now</button>
               </div>
               
               <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                 <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                 <span style={{ padding: '0 1rem', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px' }}>OR</span>
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
        toast.success(data.message || 'Password reset successfully.');
        // reset form & transition back to login
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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', overflow: 'hidden' }}>
      <SEO 
        title="Login - Parxéé City"
        description="Log in to your Parxéé City account to manage your vehicle protection, subscriptions, and emergency cards."
      />
      
      {/* LEFT PANE: Branding / Image (Hidden on small screens) */}
      <div className="login-hero-pane" style={{ 
        flex: 1, 
        position: 'relative', 
        display: window.innerWidth < 768 ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '4rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Abstract shapes / orbs for premium feel */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
        
        {/* Placeholder image representation - we use a clean gradient/mesh if no image is available */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="Parxéé City" style={{ width: '60px', height: '60px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: 0, background: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PARXÉÉ CITY</h1>
          </div>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Secure. <br/>
            <span style={{ color: 'var(--primary)' }}>Intelligent.</span> <br/>
            Connected.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '400px', lineHeight: '1.6' }}>
            Join the elite network of smart vehicle owners. Experience next-generation parking and emergency protection.
          </p>
        </div>
      </div>

      {/* RIGHT PANE: Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Subtle ambient glow behind form */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(13, 148, 136, 0.05) 0%, rgba(0,0,0,0) 50%)', pointerEvents: 'none' }}></div>
        
        <div style={{ maxWidth: '440px', width: '100%', position: 'relative', zIndex: 1 }}>
          
          <div style={{ marginBottom: '3rem', textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
            {window.innerWidth < 768 && (
               <img src="/logo.png" alt="Logo" style={{ width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 1.5rem' }} />
            )}
            <h3 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff', marginBottom: '0.5rem' }}>
              {mode === 'login' ? 'Welcome Back.' : mode === 'forgot' ? 'Recover Password.' : 'Join the Network.'}
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
              {mode === 'login' ? 'Enter your credentials to access your vault.' : mode === 'forgot' ? (forgotStep === 1 ? 'Enter your email to request a reset code.' : 'Enter the verification code and your new password.') : 'Setup your secure vehicle profile.'}
            </p>
          </div>

          {mode === 'login' ? (
             <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               
               {/* Email Input */}
               <div style={{ position: 'relative' }}>
                 <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                   <Mail size={22} strokeWidth={1.5} />
                 </div>
                 <input 
                   type="email" 
                   placeholder="Email Address" 
                   required 
                   value={loginEmail} 
                   onChange={e => setLoginEmail(e.target.value)} 
                   style={{ width: '100%', padding: '18px 18px 18px 54px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.1rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} 
                   onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(20, 184, 166, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.1)'; }}
                   onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'; }}
                 />
               </div>

               {/* Password Input */}
               <div style={{ position: 'relative' }}>
                 <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                   <Lock size={22} strokeWidth={1.5} />
                 </div>
                 <input 
                   type="password" 
                   placeholder="Password" 
                   required 
                   value={loginPassword} 
                   onChange={e => setLoginPassword(e.target.value)} 
                   style={{ width: '100%', padding: '18px 18px 18px 54px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.1rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} 
                   onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(20, 184, 166, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.1)'; }}
                   onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'; }}
                 />
               </div>

               {/* Forgot Password Link */}
               <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setForgotStep(1); setForgotEmail(loginEmail); setDevOtp(''); }} 
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }} 
                    onMouseOver={(e) => e.target.style.color = 'var(--primary)'} 
                    onMouseOut={(e) => e.target.style.color = 'var(--muted)'}
                  >
                    Forgot Password?
                  </button>
               </div>

               {/* Submit Button */}
               <button type="submit" className="btn-gradient full-width" style={{ padding: '18px', fontSize: '1.15rem', border: 'none', cursor: 'pointer', borderRadius: '16px', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(20, 184, 166, 0.5)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(20, 184, 166, 0.4)'; }}>
                 Secure Login <ChevronRight size={22} />
               </button>
               
               {/* Footer Links */}
               <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1rem', color: 'var(--muted)' }}>
                 Don't have an account? <button type="button" onClick={() => setMode('register')} style={{ color: '#fff', background:'none', border:'none', fontWeight: 'bold', cursor: 'pointer', marginLeft: '6px', borderBottom: '1px solid var(--primary)', paddingBottom: '2px' }}>Apply Now</button>
               </div>
               
               <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                 <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                 <span style={{ padding: '0 1rem', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px' }}>OR</span>
                 <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
               </div>
               
               <Link to="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', color: '#fff', textDecoration: 'none', fontSize: '1.05rem', fontWeight: '600', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
                  <ShieldCheck size={20} color="var(--primary)" /> Extended Portal
               </Link>
             </form>
          ) : mode === 'forgot' ? (
             <form onSubmit={forgotStep === 1 ? handleRequestOtp : handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               
               {forgotStep === 1 ? (
                 <>
                   {/* Email Input */}
                   <div style={{ position: 'relative' }}>
                     <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                       <Mail size={22} strokeWidth={1.5} />
                     </div>
                     <input 
                       type="email" 
                       placeholder="Email Address" 
                       required 
                       value={forgotEmail} 
                       onChange={e => setForgotEmail(e.target.value)} 
                       disabled={loading}
                       style={{ width: '100%', padding: '18px 18px 18px 54px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.1rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} 
                       onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(20, 184, 166, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.1)'; }}
                       onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'; }}
                     />
                   </div>

                   <button type="submit" disabled={loading} className="btn-gradient full-width" style={{ padding: '18px', fontSize: '1.15rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '16px', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1, boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(20, 184, 166, 0.5)'; } }} onMouseOut={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(20, 184, 166, 0.4)'; } }}>
                     {loading ? 'Sending Code...' : 'Send Verification Code'} <ChevronRight size={22} />
                   </button>
                 </>
               ) : (
                 <>
                   {/* Dev OTP Box */}
                   {devOtp && (
                     <div style={{ background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.95rem', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Developer Mode OTP Helper:</span>
                       <span>Your verification code is: <strong style={{ fontSize: '1.1rem', letterSpacing: '2px', color: 'var(--primary)' }}>{devOtp}</strong></span>
                     </div>
                   )}

                   {/* OTP Input */}
                   <div style={{ position: 'relative' }}>
                     <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                       <ShieldCheck size={22} strokeWidth={1.5} />
                     </div>
                     <input 
                       type="text" 
                       placeholder="6-Digit Verification Code" 
                       required 
                       maxLength={6}
                       value={otp} 
                       onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                       disabled={loading}
                       style={{ width: '100%', padding: '18px 18px 18px 54px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.1rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} 
                       onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(20, 184, 166, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.1)'; }}
                       onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'; }}
                     />
                   </div>

                   {/* New Password Input */}
                   <div style={{ position: 'relative' }}>
                     <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                       <Lock size={22} strokeWidth={1.5} />
                     </div>
                     <input 
                       type="password" 
                       placeholder="New Password" 
                       required 
                       value={newPassword} 
                       onChange={e => setNewPassword(e.target.value)} 
                       disabled={loading}
                       style={{ width: '100%', padding: '18px 18px 18px 54px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.1rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} 
                       onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(20, 184, 166, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.1)'; }}
                       onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'; }}
                     />
                   </div>

                   {/* Confirm Password Input */}
                   <div style={{ position: 'relative' }}>
                     <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                       <Lock size={22} strokeWidth={1.5} />
                     </div>
                     <input 
                       type="password" 
                       placeholder="Confirm New Password" 
                       required 
                       value={confirmPassword} 
                       onChange={e => setConfirmPassword(e.target.value)} 
                       disabled={loading}
                       style={{ width: '100%', padding: '18px 18px 18px 54px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.1rem', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} 
                       onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(20, 184, 166, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(20, 184, 166, 0.1)'; }}
                       onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)'; }}
                     />
                   </div>

                   <button type="submit" disabled={loading} className="btn-gradient full-width" style={{ padding: '18px', fontSize: '1.15rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '16px', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1, boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(20, 184, 166, 0.5)'; } }} onMouseOut={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(20, 184, 166, 0.4)'; } }}>
                     {loading ? 'Resetting Password...' : 'Reset Password'} <ChevronRight size={22} />
                   </button>

                   <button type="button" disabled={loading} onClick={() => setForgotStep(1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', alignSelf: 'center', marginTop: '-0.5rem' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = 'var(--muted)'}>
                     <ArrowLeft size={16} /> Edit Email
                   </button>
                 </>
               )}

               {/* Back to Login Link */}
               <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setMode('login'); setForgotStep(1); setDevOtp(''); }} 
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s', padding: 0 }} 
                    onMouseOver={(e) => e.target.style.color = 'var(--primary)'} 
                    onMouseOut={(e) => e.target.style.color = 'var(--muted)'}
                  >
                    <ArrowLeft size={16} /> Back to Login
                  </button>
               </div>
             </form>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.2)', padding: '2rem', borderRadius: '20px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(20, 184, 166, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                     <ShieldCheck size={32} color="var(--primary)" />
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '700' }}>Secure KYC Process</h4>
                  <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
                    To ensure the maximum safety of our elite network, all new vehicle registrations and identities are processed through our encrypted Extended Portal.
                  </p>
               </div>
               
               <button 
                 onClick={() => navigate('/register')} 
                 className="btn-gradient full-width" 
                 style={{ padding: '18px', fontSize: '1.15rem', border: 'none', cursor: 'pointer', borderRadius: '16px', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(20, 184, 166, 0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(20, 184, 166, 0.5)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(20, 184, 166, 0.4)'; }}
               >
                 Start Registration <ChevronRight size={22} />
               </button>
               
               <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1rem', color: 'var(--muted)' }}>
                  Already registered? <button type="button" onClick={() => setMode('login')} style={{ color: '#fff', background:'none', border:'none', fontWeight: 'bold', cursor: 'pointer', marginLeft: '6px', borderBottom: '1px solid var(--primary)', paddingBottom: '2px' }}>Log in</button>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
