import { Mail, Phone, CheckCircle2, ShieldCheck } from 'lucide-react';

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
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(20, 184, 166, 0.2)',
      borderRadius: '20px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
        <ShieldCheck color="var(--primary)" size={24} />
        <div>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>
            Contact & Identity Details
          </h4>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>
            Enter your email & phone number to create your vehicle account
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* 1. EMAIL ADDRESS INPUT BOX (NO OTP REQUIRED) */}
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
                <CheckCircle2 size={16} /> Email Added
              </span>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                Enter valid email address
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                if (val && val.includes('@') && val.includes('.')) {
                  setIsEmailVerified(true);
                } else {
                  setIsEmailVerified(false);
                }
              }}
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
          </div>
        </div>

        {/* 2. PHONE NUMBER INPUT BOX (NO OTP REQUIRED) */}
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
                <CheckCircle2 size={16} /> Phone Added
              </span>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                Enter 10-digit number
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => {
                const val = e.target.value;
                setPhone(val);
                if (val.replace(/\D/g, '').length >= 10) {
                  setIsPhoneVerified(true);
                } else {
                  setIsPhoneVerified(false);
                }
              }}
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
          </div>
        </div>

      </div>
    </div>
  );
}
