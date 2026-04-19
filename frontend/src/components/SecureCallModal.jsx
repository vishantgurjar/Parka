import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Shield, AlertCircle } from 'lucide-react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

export default function SecureCallModal({ vehicleId, onClose, incomingSignal, callerSocketId, isOwner = false }) {
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, calling, connected, ended, failed
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const socketRef = useRef();
  const peerRef = useRef();
  const streamRef = useRef();
  const audioRemoteRef = useRef(new Audio());

  useEffect(() => {
    // 1. Setup Socket
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app');
    socketRef.current = socket;

    const startConnection = async () => {
      try {
        // 2. Get Media
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;

        // 3. Initialize Peer
        const peer = new Peer({
          initiator: !isOwner,
          trickle: false,
          stream: stream
        });

        peer.on('signal', (data) => {
          if (!isOwner) {
            // Caller: Send offer to Owner
            socket.emit('call-user', {
              userToCall: vehicleId,
              signalData: data,
              from: socket.id,
              fromName: 'Guest Scanner'
            });
            setCallStatus('calling');
          } else {
            // Owner: Send answer back to Caller
            socket.emit('answer-call', {
              signal: data,
              to: callerSocketId
            });
          }
        });

        peer.on('stream', (remoteStream) => {
          audioRemoteRef.current.srcObject = remoteStream;
          audioRemoteRef.current.play();
          setCallStatus('connected');
        });

        socket.on('call-answered', (signal) => {
          if (!isOwner) {
            peer.signal(signal);
            setCallStatus('connected');
          }
        });

        socket.on('call-error', (err) => {
          setErrorMessage(err.message);
          setCallStatus('failed');
        });

        if (isOwner && incomingSignal) {
          peer.signal(incomingSignal);
        }

        peerRef.current = peer;

      } catch (err) {
        console.error('WebRTC Error:', err);
        setErrorMessage('Microphone access denied or connection failed.');
        setCallStatus('failed');
      }
    };

    startConnection();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (peerRef.current) peerRef.current.destroy();
      socket.disconnect();
    };
  }, [vehicleId, isOwner, incomingSignal, callerSocketId]);

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => onClose(), 1000);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.85)', zIndex: 99999,
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
            <Phone size={40} color={callStatus === 'failed' ? '#ef4444' : 'var(--primary)'} className={callStatus === 'calling' || callStatus === 'connecting' ? 'pulse-anim' : ''} />
          </div>
          
          <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: '0 0 0.5rem' }}>
            {isOwner ? 'Incoming Call' : 'Vehicle Owner'}
          </h3>
          
          <p style={{ color: callStatus === 'connected' ? '#10b981' : (callStatus === 'failed' ? '#ef4444' : 'var(--muted)'), fontSize: '1rem', margin: 0, fontWeight: '500' }}>
            {callStatus === 'connecting' && 'Establishing line...'}
            {callStatus === 'calling' && 'Ringing...'}
            {callStatus === 'connected' && 'Connected • Secure'}
            {callStatus === 'failed' && (errorMessage || 'Connection Failed')}
            {callStatus === 'ended' && 'Call Ended'}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
          <button 
            onClick={toggleMute}
            disabled={callStatus !== 'connected'}
            style={{ 
              width: '60px', height: '60px', borderRadius: '50%', border: 'none', cursor: callStatus === 'connected' ? 'pointer' : 'not-allowed',
              background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.1)', color: '#fff',
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

        {callStatus === 'failed' && (
          <p style={{ marginTop: '1.5rem', color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <AlertCircle size={14} /> Try refreshing the page.
          </p>
        )}
      </div>
    </div>
  );
}
