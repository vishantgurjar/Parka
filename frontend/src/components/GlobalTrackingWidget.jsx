import { useState } from 'react';
import { Navigation, Map as MapIcon, X, PhoneCall } from 'lucide-react';
import TrackingMap from './TrackingMap';

export default function GlobalTrackingWidget({ activeSOS, mechanicLocation, userLocation, onComplete }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
