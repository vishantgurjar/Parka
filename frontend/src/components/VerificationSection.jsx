import { useState, useEffect } from 'react';
import { Mail, Phone, CheckCircle2, ShieldCheck, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBackendUrl } from '../utils/api';

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
  // Email OTP States
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailTimer, setEmailTimer] = useState(30);
  const [emailDevOtp, setEmailDevOtp] = useState('');

  // Phone OTP States
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(30);
  const [phoneDevOtp, setPhoneDevOtp] = useState('');

  // Email Timer Countdown
  useEffect(() => {
    let interval = null;
    if (emailOtpSent && emailTimer > 0) {
      interval = setInterval(() => setEmailTimer(prev => prev - 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [emailOtpSent, emailTimer]);

  // Phone Timer Countdown
  useEffect(() => {
    let interval = null;
    if (phoneOtpSent && phoneTimer > 0) {
      interval = setInterval(() => setPhoneTimer(prev => prev - 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [phoneOtpSent, phoneTimer]);

  // --- SEND EMAIL OTP ---
  const handleSendEmailOtp = async () => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      return toast.error('Please enter a valid email address.');
    }
    setEmailLoading(true);
    setEmailDevOtp('');
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Verification code sent to your email! 📩');
        setEmailOtpSent(true);
        setEmailTimer(30);
        if (data.devOtp) setEmailDevOtp(data.devOtp);
      } else {
        toast.error(data.message || 'Failed to send OTP to email.');
      }
    } catch (err) {
      console.error('Email OTP send error:', err);
      toast.error('Network error connecting to verification server.');
    } finally {
      setEmailLoading(false);
    }
  };

  // --- VERIFY EMAIL OTP ---
  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.trim().length !== 6) {
      return toast.error('Please enter the 6-digit OTP code received on your email.');
    }
    setEmailLoading(true);
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: emailOtp.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Email verified successfully! ✓');
        setIsEmailVerified(true);
        setEmailDevOtp('');
      } else {
        toast.error(data.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      console.error('Email OTP verify error:', err);
      toast.error('Network error verifying email OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  // --- SEND PHONE OTP ---
  const handleSendPhoneOtp = async () => {
    const rawDigits = (phone || '').replace(/\D/g, '');
    if (rawDigits.length < 10) {
      return toast.error('Please enter a valid 10-digit mobile phone number.');
    }
    setPhoneLoading(true);
    setPhoneDevOtp('');
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/send-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: rawDigits,
          email: email.trim().toLowerCase()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Verification code sent to your mobile phone! 📱');
        setPhoneOtpSent(true);
        setPhoneTimer(30);
        if (data.devOtp) setPhoneDevOtp(data.devOtp);
      } else {
        toast.error(data.message || 'Failed to send SMS OTP.');
      }
    } catch (err) {
      console.error('Phone OTP send error:', err);
      toast.error('Network error connecting to SMS server.');
    } finally {
      setPhoneLoading(false);
    }
  };

  // --- VERIFY PHONE OTP ---
  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.trim().length !== 6) {
      return toast.error('Please enter the 6-digit OTP code received on your phone.');
    }
    setPhoneLoading(true);
    const baseUrl = getBackendUrl();
    try {
      const res = await fetch(`${baseUrl}/api/auth/verify-phone-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: (phone || '').replace(/\D/g, ''),
          otp: phoneOtp.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Mobile phone verified successfully! ✓');
        setIsPhoneVerified(true);
        setPhoneDevOtp('');
      } else {
        toast.error(data.message || 'Invalid or expired phone OTP code.');
      }
    } catch (err) {
      console.error('Phone OTP verify error:', err);
      toast.error('Network error verifying phone OTP.');
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(20, 184, 166, 0.25)',
      borderRadius: '20px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
        <ShieldCheck color="#2dd4bf" size={26} />
        <div>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.3px' }}>
            Two-Step Identity Verification
          </h4>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            Verify both your Email & Mobile Number with OTP before completing registration.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ================= 1. EMAIL VERIFICATION CARD ================= */}
        <div style={{
          background: isEmailVerified ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          border: isEmailVerified ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.25rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="#2dd4bf" /> Email Address
            </label>
            {isEmailVerified ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '0.85rem', fontWeight: '800' }}>
                <CheckCircle2 size={16} /> Verified ✓
              </span>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                OTP will be sent to your email
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              disabled={isEmailVerified || emailLoading}
              onChange={(e) => {
                setEmail(e.target.value);
                if (isEmailVerified) setIsEmailVerified(false);
              }}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: isEmailVerified ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0,0,0,0.3)',
                color: '#fff',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />

            {!isEmailVerified && (
              <button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={emailLoading || (emailOtpSent && emailTimer > 0)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)',
                  color: '#030712',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: (emailLoading || (emailOtpSent && emailTimer > 0)) ? 'not-allowed' : 'pointer',
                  opacity: (emailLoading || (emailOtpSent && emailTimer > 0)) ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                {emailLoading ? (
                  <>Sending <Loader2 size={16} className="spin" /></>
                ) : emailOtpSent && emailTimer > 0 ? (
                  `Resend in ${emailTimer}s`
                ) : emailOtpSent ? (
                  'Resend OTP 🔄'
                ) : (
                  'Send OTP 📩'
                )}
              </button>
            )}

            {isEmailVerified && (
              <button
                type="button"
                onClick={() => {
                  setIsEmailVerified(false);
                  setEmailOtpSent(false);
                  setEmailOtp('');
                }}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                Change
              </button>
            )}
          </div>

          {/* Email OTP Input row */}
          {!isEmailVerified && emailOtpSent && (
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {emailDevOtp && (
                <div style={{ background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.25)', padding: '8px 12px', borderRadius: '10px', marginBottom: '8px', fontSize: '0.85rem', color: '#5eead4' }}>
                  Code Helper: <strong>{emailDevOtp}</strong>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit email OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(45, 212, 191, 0.4)',
                      background: 'rgba(0,0,0,0.4)',
                      color: '#fff',
                      fontSize: '1rem',
                      letterSpacing: '2px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyEmailOtp}
                  disabled={emailLoading}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: emailLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {emailLoading ? 'Verifying...' : 'Verify OTP ✓'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= 2. PHONE NUMBER VERIFICATION CARD ================= */}
        <div style={{
          background: isPhoneVerified ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          border: isPhoneVerified ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.25rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={16} color="#2dd4bf" /> Mobile Phone Number
            </label>
            {isPhoneVerified ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '0.85rem', fontWeight: '800' }}>
                <CheckCircle2 size={16} /> Verified ✓
              </span>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                SMS OTP will be sent to your number
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              disabled={isPhoneVerified || phoneLoading}
              onChange={(e) => {
                setPhone(e.target.value);
                if (isPhoneVerified) setIsPhoneVerified(false);
              }}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: isPhoneVerified ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0,0,0,0.3)',
                color: '#fff',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />

            {!isPhoneVerified && (
              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={phoneLoading || (phoneOtpSent && phoneTimer > 0)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)',
                  color: '#030712',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: (phoneLoading || (phoneOtpSent && phoneTimer > 0)) ? 'not-allowed' : 'pointer',
                  opacity: (phoneLoading || (phoneOtpSent && phoneTimer > 0)) ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                {phoneLoading ? (
                  <>Sending <Loader2 size={16} className="spin" /></>
                ) : phoneOtpSent && phoneTimer > 0 ? (
                  `Resend in ${phoneTimer}s`
                ) : phoneOtpSent ? (
                  'Resend SMS 🔄'
                ) : (
                  'Send OTP 📱'
                )}
              </button>
            )}

            {isPhoneVerified && (
              <button
                type="button"
                onClick={() => {
                  setIsPhoneVerified(false);
                  setPhoneOtpSent(false);
                  setPhoneOtp('');
                }}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                Change
              </button>
            )}
          </div>

          {/* Phone OTP Input row */}
          {!isPhoneVerified && phoneOtpSent && (
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {phoneDevOtp && (
                <div style={{ background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.25)', padding: '8px 12px', borderRadius: '10px', marginBottom: '8px', fontSize: '0.85rem', color: '#5eead4' }}>
                  Code Helper: <strong>{phoneDevOtp}</strong>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit phone OTP"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(45, 212, 191, 0.4)',
                      background: 'rgba(0,0,0,0.4)',
                      color: '#fff',
                      fontSize: '1rem',
                      letterSpacing: '2px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyPhoneOtp}
                  disabled={phoneLoading}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: phoneLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {phoneLoading ? 'Verifying...' : 'Verify OTP ✓'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
