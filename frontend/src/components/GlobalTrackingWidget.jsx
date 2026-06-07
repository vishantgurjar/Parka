import { useState, useEffect, useContext } from 'react';
import { Navigation, Map as MapIcon, X, PhoneCall, Send } from 'lucide-react';
import TrackingMap from './TrackingMap';
import { AuthContext } from '../App';
import { getBackendUrl } from '../utils/api';

export default function GlobalTrackingWidget({ activeSOS, mechanicLocation, userLocation, socket, onComplete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useContext(AuthContext);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const fetchChatMessages = async (sosId) => {
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/sos/${sosId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    }
  };

  useEffect(() => {
    if (activeSOS && socket) {
      fetchChatMessages(activeSOS._id);

      const handleReceiveMessage = (msg) => {
        setChatMessages(prev => [...prev, msg]);
      };

      socket.on('receive-sos-message', handleReceiveMessage);

      return () => {
        socket.off('receive-sos-message', handleReceiveMessage);
      };
    }
  }, [activeSOS, socket]);

  const sendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !activeSOS || !socket || !user) return;

    const msgPayload = {
      sosId: activeSOS._id,
      senderId: user._id,
      senderName: user.name,
      text: chatInput.trim()
    };

    socket.emit('send-sos-message', msgPayload);
    setChatInput('');
  };

  if (!activeSOS) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      zIndex: 10000,
      width: isExpanded ? 'calc(100% - 40px)' : 'auto',
      maxWidth: isExpanded ? '450px' : '220px',
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div className="glass-card fadeIn" style={{
        padding: isExpanded ? '1.5rem' : '12px 16px',
        borderRadius: isExpanded ? '24px' : '50px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(16, 185, 129, 0.2)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        background: 'rgba(3, 7, 18, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflow: 'hidden'
      }}>
        
        {/* Compact Header (Always visible) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="pulse-success" style={{ background: '#10b981', borderRadius: '50%', padding: '6px' }}>
              <Navigation size={16} color="#fff" />
            </div>
            {!isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>On The Way</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>Mechanic Arriving</span>
              </div>
            )}
            {isExpanded && (
               <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Live Tracking: {activeSOS.mechanicName}</h3>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}
            >
              <MapIcon size={16} />
            </button>
            {isExpanded && (
               <button 
                onClick={() => setIsExpanded(false)} 
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', height: '250px' }}>
               <TrackingMap userLocation={userLocation} mechanicLocation={mechanicLocation} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>CONTACT</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{activeSOS.phone || 'N/A'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>FEE</p>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>₹{activeSOS.price}</p>
              </div>
            </div>

            {/* Live Chat Panel */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chat with Mechanic</h4>
                <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '8px 10px',
                    height: '140px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    {chatMessages.length === 0 ? (
                        <div style={{ margin: 'auto', color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center' }}>
                            Send a message to update the mechanic on your status.
                        </div>
                    ) : (
                        chatMessages.map((msg, index) => {
                            const isSelf = msg.senderId === user?._id;
                            return (
                                <div key={index} style={{
                                    alignSelf: isSelf ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isSelf ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{
                                        background: isSelf ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                                        color: isSelf ? '#000' : '#fff',
                                        padding: '6px 10px',
                                        borderRadius: isSelf ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: '2px' }}>
                                        {isSelf ? 'You' : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
                <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: '6px', marginBottom: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Type message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            color: '#fff',
                            fontSize: '0.8rem',
                            outline: 'none'
                        }}
                    />
                    <button type="submit" className="btn-gradient" style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#000',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <Send size={14} />
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
               <a href={`tel:${activeSOS.phone}`} className="btn-gradient" style={{ flex: 1, textDecoration: 'none', background: '#10b981', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <PhoneCall size={18} /> Call
               </a>
               <button onClick={onComplete} className="btn-secondary" style={{ flex: 1, borderRadius: '12px', padding: '10px' }}>
                  Complete
               </button>
            </div>
          </div>
        )}

      </div>
      <style>{`
        .pulse-success {
          box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse-success-anim 2s infinite;
        }
        @keyframes pulse-success-anim {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
}
