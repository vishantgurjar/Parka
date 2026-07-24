import { useState } from 'react';
import { Mail, Phone, CheckCircle2, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBackendUrl } from '../utils/api';
import { sendPhoneOtp, verifyPhoneOtp } from '../utils/firebase';

export default function VerificationSection({
  email,
  setEmail,
  phone,
  setPhone,
  isEmailVerified,
  setIsEmailVerified,
  isPhoneVerified,
  setIsPhoneVerified
}) {
  // Email OTP state
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [devEmailOtp, setDevEmailOtp] = useState('');

  // Phone OTP state
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Send Email OTP
  const handleSendEmailOtp = async () => {
    if (!email || !email.includes('@')) {
      return toast.error('Please enter a valid email address.');
    }
    setEmailLoading(true);
    setDevEmailOtp('');
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailOtpSent(true);
        if (data.devOtp) setDevEmailOtp(data.devOtp);
        toast.success(data.message || 'OTP sent to your email!');
      } else {
        toast.error(data.message || 'Failed to send OTP to email.');
      }
    } catch (err) {
      console.error('Email OTP send error:', err);
      toast.error('Network error sending Email OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      return toast.error('Enter 6-digit email OTP.');
    }
    setEmailLoading(true);
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailOtp })
      });
      const data = await res.json();
      if (res.ok && data.isEmailVerified) {
        setIsEmailVerified(true);
        toast.success('Email verified successfully! ✅');
      } else {
        toast.error(data.message || 'Invalid email OTP.');
      }
    } catch (err) {
      console.error('Email OTP verify error:', err);
      toast.error('Network error verifying Email OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Send Phone OTP via Firebase or Backend Fallback
  const handleSendPhoneOtp = async () => {
    if (!phone || phone.length < 10) {
      return toast.error('Please enter a valid 10-digit phone number.');
    }
    setPhoneLoading(true);

    const hasRealFirebaseKey = import.meta.env.VITE_FIREBASE_API_KEY && 
      !import.meta.env.VITE_FIREBASE_API_KEY.includes('DummyKey');

    // Try Firebase first if valid key exists
    if (hasRealFirebaseKey) {
      try {
        const result = await sendPhoneOtp(phone, 'firebase-recaptcha-container');
        if (result.success) {
          setPhoneOtpSent(true);
          toast.success(`SMS OTP sent to ${result.formattedPhone}! Please check your mobile messages. 📱`);
          setPhoneLoading(false);
          return;
        }
      } catch (error) {
        console.warn('Firebase SMS attempt failed, falling back to Backend OTP:', error);
      }
    }

    // Backend Phone OTP Fallback
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/auth/send-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPhoneOtpSent(true);
        toast.success(data.message || `SMS OTP sent to ${phone}! Please check your mobile. 📱`);
      } else {
        toast.error(data.message || 'Failed to send OTP to mobile.');
      }
    } catch (err) {
      console.error('Backend Phone OTP error:', err);
      toast.error('Network error sending Phone OTP.');
    } finally {
      setPhoneLoading(false);
    }
  };


  // Verify Phone OTP
  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length !== 6) {
      return toast.error('Enter 6-digit phone OTP received on your mobile.');
    }
    setPhoneLoading(true);

    // If using Firebase confirmation result
    if (window.confirmationResult) {
      try {
        const { token } = await verifyPhoneOtp(phoneOtp);
        const baseUrl = getBackendUrl();
        const res = await fetch(`${baseUrl}/api/auth/verify-phone-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, verificationToken: token })
        });
        const data = await res.json();
        if (res.ok && data.isPhoneVerified) {
          setIsPhoneVerified(true);
          toast.success('Phone number verified successfully! ✅');
          setPhoneLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Firebase token verify failed, trying backend OTP verify:', err);
      }
    }

    // Backend Phone OTP Verify
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/auth/verify-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: phoneOtp })
      });
      const data = await res.json();
      if (res.ok && data.isPhoneVerified) {
        setIsPhoneVerified(true);
        toast.success('Phone number verified successfully! ✅');
      } else {
        toast.error(data.message || 'Invalid Phone OTP code.');
      }
    } catch (err) {
      console.error('Phone OTP verify error:', err);
      toast.error('Network error verifying Phone OTP.');
    } finally {
      setPhoneLoading(false);
    }
  };



  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(20, 184, 166, 0.2)',
      borderRadius: '20px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Hidden Recaptcha Container */}
      <div id="firebase-recaptcha-container"></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
        <ShieldCheck color="var(--primary)" size={24} />
        <div>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>
            Real-Time Identity Verification
          </h4>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>
            Verify your Email & Phone to prevent fake registrations
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* 1. EMAIL VERIFICATION BOX */}
        <div style={{
          background: isEmailVerified ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          border: isEmailVerified ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="var(--primary)" /> Email Address
            </label>
            {isEmailVerified ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                <CheckCircle2 size={16} /> Email Verified
              </span>
            ) : (
              <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '600' }}>
                *Verification Required
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setIsEmailVerified(false); setEmailOtpSent(false); }}
              disabled={isEmailVerified || emailLoading}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: isEmailVerified ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0,0,0,0.2)',
                color: '#fff',
                outline: 'none'
              }}
            />
            {!isEmailVerified && (
              <button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={emailLoading || !email}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: (emailLoading || !email) ? 'not-allowed' : 'pointer',
                  opacity: (emailLoading || !email) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {emailLoading ? <RefreshCw size={14} className="spin" /> : <KeyRound size={14} />}
                {emailOtpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            )}
          </div>

          {/* Email Dev OTP helper banner */}
          {devEmailOtp && !isEmailVerified && (
            <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)', color: '#14b8a6', fontSize: '0.85rem' }}>
              <strong>Verification OTP Helper:</strong> Enter <strong>{devEmailOtp}</strong> to verify email.
            </div>
          )}

          {/* Email OTP Input Row */}
          {emailOtpSent && !isEmailVerified && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Email OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                disabled={emailLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(20, 184, 166, 0.4)',
                  background: 'rgba(20, 184, 166, 0.05)',
                  color: '#fff',
                  fontSize: '1rem',
                  letterSpacing: '2px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleVerifyEmailOtp}
                disabled={emailLoading || emailOtp.length !== 6}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#22c55e',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: (emailLoading || emailOtp.length !== 6) ? 'not-allowed' : 'pointer',
                  opacity: (emailLoading || emailOtp.length !== 6) ? 0.6 : 1
                }}
              >
                {emailLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          )}
        </div>

        {/* 2. PHONE VERIFICATION BOX */}
        <div style={{
          background: isPhoneVerified ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          border: isPhoneVerified ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={16} color="var(--primary)" /> Mobile Phone Number
            </label>
            {isPhoneVerified ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                <CheckCircle2 size={16} /> Phone Verified
              </span>
            ) : (
              <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '600' }}>
                *Verification Required
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setIsPhoneVerified(false); setPhoneOtpSent(false); }}
              disabled={isPhoneVerified || phoneLoading}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: isPhoneVerified ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0,0,0,0.2)',
                color: '#fff',
                outline: 'none'
              }}
            />
            {!isPhoneVerified && (
              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={phoneLoading || !phone}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: (phoneLoading || !phone) ? 'not-allowed' : 'pointer',
                  opacity: (phoneLoading || !phone) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {phoneLoading ? <RefreshCw size={14} className="spin" /> : <KeyRound size={14} />}
                {phoneOtpSent ? 'Resend SMS' : 'Send SMS OTP'}
              </button>
            )}
          </div>

          {/* Phone Dev OTP helper banner */}
          {devPhoneOtp && !isPhoneVerified && (
            <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)', color: '#14b8a6', fontSize: '0.85rem' }}>
              <strong>Phone Verification OTP Helper:</strong> Enter <strong>{devPhoneOtp}</strong> to verify mobile.
            </div>
          )}

          {/* Phone OTP Input Row */}
          {phoneOtpSent && !isPhoneVerified && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit SMS OTP"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                disabled={phoneLoading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(20, 184, 166, 0.4)',
                  background: 'rgba(20, 184, 166, 0.05)',
                  color: '#fff',
                  fontSize: '1rem',
                  letterSpacing: '2px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleVerifyPhoneOtp}
                disabled={phoneLoading || phoneOtp.length !== 6}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#22c55e',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: (phoneLoading || phoneOtp.length !== 6) ? 'not-allowed' : 'pointer',
                  opacity: (phoneLoading || phoneOtp.length !== 6) ? 0.6 : 1
                }}
              >
                {phoneLoading ? 'Verifying...' : 'Verify Phone'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
