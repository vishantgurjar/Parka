import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, Wrench, PhoneCall, CheckCircle, Radio, Navigation, Wallet } from 'lucide-react';
import SEO from '../components/SEO';
import { io } from 'socket.io-client';
import PaymentModal from '../components/PaymentModal';

export default function MechanicDashboard() {
  const navigate = useNavigate();
  const [mechanic, setMechanic] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // SOS State
  const [activeSosRequests, setActiveSosRequests] = useState([]);
  const [socket, setSocket] = useState(null);
  const [bidAmounts, setBidAmounts] = useState({});
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('parkeActiveMechanic');
    if (!saved) {
      navigate('/mechanic-login');
      return;
    }
    const parsed = JSON.parse(saved);
    setMechanic(parsed);
    setIsOnline(parsed.isAvailable !== false);

    // Initial Fetch for active SOS
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/sos/active`)
        .then(res => res.json())
        .then(data => setActiveSosRequests(data))
        .catch(err => console.error("Error fetching SOS", err));

    // Connect to Socket.IO
    const newSocket = io(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
        newSocket.emit('mechanic-subscribe', parsed._id);
    });

    newSocket.on('incoming-sos', (sos) => {
        // Prepend new SOS to list
        setActiveSosRequests(prev => [sos, ...prev]);
    });

    newSocket.on('sos-resolved', (sosId) => {
        // Remove resolved SOS from list
        setActiveSosRequests(prev => prev.filter(req => req._id !== sosId));
    });

    newSocket.on('sos-match-confirmed', (data) => {
        // data: { sosId, sos }
        setAcceptedSOS(data.sos);
        setActiveSosRequests(prev => prev.filter(req => req._id !== data.sosId));
        alert("🎉 SOS MATCH CONFIRMED! Drive safe to the customer. Live tracking started.");
    });

    newSocket.on('bid-error', (errMessage) => {
        alert(errMessage);
    });

    return () => {
        newSocket.disconnect();
    };
  }, [navigate]);

  // Point 1: Live Tracking Heartbeat
  const [acceptedSOS, setAcceptedSOS] = useState(null);
  useEffect(() => {
    let watchId;
    if (acceptedSOS && socket) {
        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                socket.emit('update-mechanic-location', {
                    sosId: acceptedSOS._id,
                    userId: acceptedSOS.userId,
                    location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
                });
            },
            (err) => console.log("Tracking error:", err),
            { enableHighAccuracy: true }
        );
    }
    return () => {
        if(watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [acceptedSOS, socket]);

  const toggleStatus = async () => {
    setUpdating(true);
    try {
      const newStatus = !isOnline;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/mechanics/${mechanic._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus })
      });
      if (res.ok) {
        setIsOnline(newStatus);
        const updated = { ...mechanic, isAvailable: newStatus };
        setMechanic(updated);
        localStorage.setItem('parkeActiveMechanic', JSON.stringify(updated));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('parkeActiveMechanic');
    localStorage.removeItem('parkeMechanicToken');
    navigate('/');
  };

  if (!mechanic) return null;

  const handleBidSubmit = (sosId, userId) => {
      const amount = bidAmounts[sosId];
      if (!amount || amount <= 0) return alert("Please enter a valid amount.");
      
      const payload = {
          sosId,
          userId,
          mechanicId: mechanic._id,
          mechanicName: mechanic.name,
          phone: mechanic.phone,
          price: parseInt(amount),
          distance: (Math.random() * 5 + 1).toFixed(1) // Simulated distance
      };
      
      socket.emit('submit-bid', payload);
      alert("Bid sent successfully. Waiting for user response...");
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '4rem' }}>
      <SEO title="Mechanic Dashboard - Parkéé City" />
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--fg)' }}>Dashboard</h1>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}>
            Sign Out
          </button>
        </div>

        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>Online Status</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.95rem' }}>
              Turning this on will list you on the interactive map for drivers.
            </p>
          </div>
          <button 
            onClick={toggleStatus} 
            disabled={updating}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isOnline ? '#10b981' : '#ef4444',
              border: `2px solid ${isOnline ? '#10b981' : '#ef4444'}`,
              padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            <Power size={20} />
            {updating ? 'Updating...' : isOnline ? 'You are ONLINE' : 'You are OFFLINE'}
          </button>
        </div>

        {/* --- MECHANIC WALLET --- */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid #10b981' }}>
            <div>
                <h3 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wallet size={20} style={{ color: '#10b981' }} /> Parkéé Leads Wallet
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>Balance required to accept SOS Leads (Cost: ₹89 per accepted lead)</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: mechanic.walletBalance < 89 ? '#ef4444' : '#10b981' }}>
                    ₹{mechanic.walletBalance || 0}
                </div>
                <button 
                    onClick={() => setShowWalletModal(true)} 
                    className="btn-gradient" 
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Top Up Wallet
                </button>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={20} style={{ color: 'var(--primary)' }} /> Profile Info
            </h3>
            <p><strong>Name:</strong> {mechanic.name}</p>
            <p><strong>Shop:</strong> {mechanic.shopName}</p>
            <p><strong>Phone:</strong> {mechanic.phone}</p>
            <p><strong>Experience:</strong> {mechanic.experienceYears} Years</p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} style={{ color: 'var(--primary)' }} /> Location & Services
            </h3>
            <p><strong>Primary Highway:</strong> {mechanic.highwayLocation}</p>
            <div style={{ marginTop: '1rem' }}>
              <strong>Services:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {mechanic.services?.map(s => (
                  <span key={s} style={{ background: 'var(--border)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- LIVE SOS REQUESTS --- */}
        {isOnline && (
            <div style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                    <Radio className="pulse-anim" /> Live SOS Broadcasts
                </h2>

                {acceptedSOS && (
                    <div className="glass-card fadeIn" style={{ border: '2px solid #10b981', padding: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '1rem' }}>
                            <Navigation size={24} className="pulse-anim" /> 
                            <h3 style={{ margin: 0 }}>ACTIVE JOB: On My Way</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '0 0 4px 0' }}>DRIVER</p>
                                <p style={{ fontWeight: 'bold' }}>{acceptedSOS.userName}</p>
                            </div>
                            <div>
                                <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '0 0 4px 0' }}>PHONE</p>
                                <p style={{ fontWeight: 'bold' }}>{acceptedSOS.userPhone}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <a href={`tel:${acceptedSOS.userPhone}`} className="btn-gradient" style={{ flex: 1, textDecoration: 'none', background: '#10b981' }}>
                                <PhoneCall size={18} /> Call Driver
                            </a>
                            <button onClick={() => setAcceptedSOS(null)} className="btn-outline-primary" style={{ flex: 1 }}>
                                Complete Job
                            </button>
                        </div>
                    </div>
                )}

                {activeSosRequests.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', color: 'var(--muted)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        Listening for stranded drivers... Keep this dashboard open.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {activeSosRequests.map((sos) => (
                            <div key={sos._id} className="fadeIn" style={{ background: 'var(--card-bg)', border: '1px solid #ef4444', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold' }}>URGENT SOS</p>
                                        <h3 style={{ margin: 0 }}>Driver: {sos.userName}</h3>
                                        <p style={{ margin: '5px 0 0 0', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Navigation size={14} /> {(Math.random() * 5 + 1).toFixed(1)} km away
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Time Elapsed: {Math.floor((new Date() - new Date(sos.createdAt)) / 60000)} mins</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <input 
                                        type="number" 
                                        placeholder="Your Offer (₹)" 
                                        value={bidAmounts[sos._id] || ''}
                                        onChange={(e) => setBidAmounts({...bidAmounts, [sos._id]: e.target.value})}
                                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', flex: 1 }}
                                    />
                                    <button onClick={() => handleBidSubmit(sos._id, sos.userId)} className="btn-gradient" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', border: 'none', color: '#fff', fontWeight: 'bold', padding: '0 20px', borderRadius: '8px', cursor: 'pointer' }}>
                                        Submit Bid
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </div>

      {showWalletModal && (
        <PaymentModal 
          plan={{ name: 'Wallet Recharge (₹500)', amount: 500 }}
          entityId={mechanic._id}
          entityType="wallet"
          onClose={() => setShowWalletModal(false)}
          onSuccess={(data) => {
              const updated = data.mechanic;
              setMechanic(updated);
              localStorage.setItem('parkeActiveMechanic', JSON.stringify(updated));
              alert("Wallet Recharge Successful! Your new balance is ₹" + updated.walletBalance);
          }}
        />
      )}
    </div>
  );
}
