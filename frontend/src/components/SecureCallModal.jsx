import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Shield } from 'lucide-react';
import io from 'socket.io-client';

export default function SecureCallModal({ vehicleId, onClose }) {
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, calling, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const socketRef = useRef();

  useEffect(() => {
    // Connect to Socket server
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');
    socketRef.current = socket;

    socket.on('connect', () => {
      // Setup WebRTC mock state for visual UI feeling initially
      setTimeout(() => {
        setCallStatus('calling');
        socket.emit('join-room', vehicleId);
        
        // Simulating the owner picking up after 3 seconds for demo purposes
        setTimeout(() => {
          setCallStatus('connected');
        }, 3000);
      }, 1000);
    });
    
    // In actual WebRTC, we would capture microphone navigator.mediaDevices.getUserMedia
    // and pipe the stream via simple-peer or RTCPeerConnection to the socket events.

    return () => {
      socket.disconnect();
    };
  }, [vehicleId]);

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="glass-card" style={{ 
        width: '90%', maxWidth: '350px', padding: '2rem', textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            <Shield size={14} /> End-to-End Encrypted
          </div>
          
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.1)' }}>
            <Phone size={40} color="var(--primary)" style={{ opacity: callStatus === 'calling' ? 0.5 : 1 }} className={callStatus === 'calling' ? 'pulse-anim' : ''} />
          </div>
          
          <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: '0 0 0.5rem' }}>Vehicle Owner</h3>
          
          <p style={{ color: callStatus === 'connected' ? '#10b981' : 'var(--muted)', fontSize: '1rem', margin: 0, fontWeight: '500' }}>
            {callStatus === 'connecting' && 'Establishing secure connection...'}
            {callStatus === 'calling' && 'Calling (Hidden Number)...'}
            {callStatus === 'connected' && '00:01 • Connected'}
            {callStatus === 'ended' && 'Call Ended'}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
          <button 
            onClick={toggleMute}
            disabled={callStatus !== 'connected'}
            style={{ 
              width: '60px', height: '60px', borderRadius: '50%', border: 'none', cursor: callStatus === 'connected' ? 'pointer' : 'not-allowed',
              background: isMuted ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
            onClick={handleEndCall}
            style={{ 
              width: '60px', height: '60px', borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: '#ef4444', color: '#fff', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <PhoneOff size={24} />
          </button>
        </div>

      </div>
    </div>
  );
}
