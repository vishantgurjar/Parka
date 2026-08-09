import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Wrench, Mail, ShieldCheck, Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import { getBackendUrl } from '../utils/api';
import { toast } from 'react-hot-toast';

export default function MechanicLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Forgot password flow states
  const [mode, setMode] = useState('login'); // 'login' or 'forgot'
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request OTP, 2 = Reset Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/mechanics/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('parkeActiveMechanic', JSON.stringify(data.mechanic));
        localStorage.setItem('parkeMechanicToken', data.token);
        toast.success(`Welcome back, ${data.mechanic.name}!`);
        navigate('/m-dash');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (e) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Please enter your email.');
    setLoading(true);
    setDevOtp('');
    setError(null);
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/mechanics/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Verification OTP sent.');
        if (data.devOtp) {
          setDevOtp(data.devOtp);
        }
        setForgotStep(2);
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Network error.');
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
      return toast.error('OTP code must be 6 digits.');
    }

    setLoading(true);
    setError(null);
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/mechanics/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password reset successfully.');
        setMode('login');
        setForgotStep(1);
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setDevOtp('');
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '4rem' }}>
      <SEO title="Mechanic Login - Parxéé City" />
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="glass-card fadeIn" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              background: 'rgba(20, 184, 166, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem',
              border: '1px solid rgba(20, 184, 166, 0.2)'
            }}>
              <Wrench size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--fg)', fontWeight: 'bold' }}>
              {mode === 'login' ? 'Mechanic Portal' : 'Reset Password'}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              {mode === 'login' 
                ? 'Log in to manage your roadside assistance profile' 
                : 'Enter your registered email to request a reset code'}
            </p>
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.15)', 
              color: '#ef4444', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ fontWeight: '600' }}>Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="name@shop.com"
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: '0', fontWeight: '600' }}>Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setError(null); }} 
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold', padding: '0' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder="••••••••"
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="btn-gradient full-width" 
                style={{ padding: '14px', borderRadius: '12px', marginTop: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Sign In as Mechanic'} <LogIn size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={forgotStep === 1 ? handleRequestOtp : handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {forgotStep === 1 ? (
                <>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>Registered Email</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="email" 
                        value={forgotEmail} 
                        onChange={e => setForgotEmail(e.target.value)} 
                        placeholder="your-email@example.com"
                        required 
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-gradient full-width" 
                    style={{ padding: '14px', borderRadius: '12px', marginTop: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {loading ? 'Sending Code...' : 'Send Verification OTP'} <ChevronRight size={18} />
                  </button>
                </>
              ) : (
                <>
                  {devOtp && (
                    <div style={{ background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', color: '#fff' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Dev Mode Helper OTP: </span>
                      <strong style={{ fontSize: '1rem', letterSpacing: '2px', color: 'var(--primary)' }}>{devOtp}</strong>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>6-Digit OTP Code</label>
                    <input 
                      type="text" 
                      placeholder="Enter verification code" 
                      required 
                      maxLength={6}
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>New Password</label>
                    <input 
                      type="password" 
                      placeholder="Minimum 6 characters" 
                      required 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ fontWeight: '600' }}>Confirm Password</label>
                    <input 
                      type="password" 
                      placeholder="Confirm new password" 
                      required 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      disabled={loading}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-gradient full-width" 
                    style={{ padding: '14px', borderRadius: '12px', marginTop: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {loading ? 'Resetting Password...' : 'Verify & Set Password'} <ShieldCheck size={18} />
                  </button>
                </>
              )}

              <button 
                type="button" 
                onClick={() => { setMode('login'); setForgotStep(1); setError(null); setDevOtp(''); }} 
                style={{ background: 'transparent', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', marginTop: '0.5rem' }}
              >
                <ArrowLeft size={16} /> Back to Login
              </button>
            </form>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--muted)' }}>
            Not registered? <span onClick={() => navigate('/mechanic-register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Join Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
