import { Phone, PhoneOff, Shield } from 'lucide-react';

export default function IncomingCallModal({ fromName, onAccept, onReject }) {
  return (
    <div style={{
      position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
      width: '90%', maxWidth: '350px', zIndex: 10002,
      background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--primary)',
      borderRadius: '24px', padding: '1.5rem', textAlign: 'center',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
      animation: 'slideDown 0.5s ease'
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        <Shield size={12} /> Secure Privacy Call
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>Incoming WebRTC Call</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>From: <strong>{fromName}</strong> (via QR Scan)</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button 
          onClick={onReject}
          style={{ 
            width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}
        >
          <PhoneOff size={20} />
        </button>
        <button 
          onClick={onAccept}
          style={{ 
            width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#10b981', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}
          className="pulse-anim"
        >
          <Phone size={20} />
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
