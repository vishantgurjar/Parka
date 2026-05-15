import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, IndianRupee, ShieldAlert, KeyRound, Send, Activity, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';
import { toast } from 'react-hot-toast';

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ todayUsers: 0, activeMechanics: 0, totalRevenue: 0, liveSos: [] });
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app';
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'panwarvishant9@gmail.com';

  useEffect(() => {
    // 1. Kick out unauthorized users
    if (!user || user.email !== ADMIN_EMAIL) {
      toast.error("UNAUTHORIZED ACCESS DETECTED. IPs LOGGED.");
      navigate('/');
      return;
    }
    
    // 2. Fetch metrics
    fetchMetrics();
    
    // 3. Auto-refresh every 10 seconds
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/metrics`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data);
      }
    } catch (err) {
      console.error("Failed to load metrics", err);
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) return toast.error("Message cannot be empty!");
    setBroadcastSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('parkeToken')}`
        },
        body: JSON.stringify({ title: "PLATFORM ANNOUNCEMENT", message: broadcastMessage })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setBroadcastMessage('');
      } else {
        toast.error("Broadcast failed.");
      }
    } catch (err) {
      toast.error("Network Error");
    } finally {
      setBroadcastSending(false);
    }
  };

  if (loading) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#ef4444' }}><Activity className="pulse-anim" size={40} /></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', paddingTop: '80px', paddingBottom: '4rem' }}>
      <SEO title="System Admin | Parxéé City" />
      
      <div className="container" style={{ maxWidth: '1200px' }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', margin: 0, fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
               <KeyRound size={28} /> Cam Mode System [God Mode]
            </h1>
            <button onClick={fetchMetrics} style={{ background: '#111827', border: '1px solid #374151', color: '#9ca3af', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
               <RefreshCw size={16} /> Sync
            </button>
         </div>

         {/* Metrics HUD */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="glass-card" style={{ borderLeft: '4px solid #ef4444', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', color: '#ef4444' }}>
                   <Users size={24} />
                   <span style={{ fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>LIVE</span>
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#9ca3af', textTransform: 'uppercase' }}>New Users Today</h3>
                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{metrics.todayUsers}</p>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', color: '#3b82f6' }}>
                   <Wrench size={24} />
                   <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>HIGHWAY READY</span>
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#9ca3af', textTransform: 'uppercase' }}>Active Mechanics</h3>
                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{metrics.activeMechanics}</p>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid #10b981', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', color: '#10b981' }}>
                   <IndianRupee size={24} />
                   <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>REAL REVENUE</span>
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#9ca3af', textTransform: 'uppercase' }}>Pro Tier Subs</h3>
                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>₹{metrics.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            
            {/* Global Broadcast */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1.5rem 0', color: 'var(--fg)', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <Send size={20} color="#8b5cf6" /> Push Notify All Devices
               </h3>
               <textarea 
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter emergency or promotional broadcast message..."
                  style={{ width: '100%', padding: '1rem', background: '#050505', border: '1px solid #374151', color: '#f3f4f6', borderRadius: '4px', minHeight: '100px', resize: 'vertical', marginBottom: '1rem', fontFamily: 'inherit' }}
               />
               <button 
                  onClick={sendBroadcast}
                  disabled={broadcastSending}
                  style={{ width: '100%', padding: '12px', background: broadcastSending ? '#374151' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: broadcastSending ? 'not-allowed' : 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
               >
                  {broadcastSending ? "Broadcasting..." : "Execute Global Push"}
               </button>
            </div>

            {/* Live SOS Desk */}
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px' }}>
                    <button onClick={async () => {
                         if(window.confirm("Delete all active SOS requests?")) {
                            await fetch(`${API_BASE}/api/admin/clear-sos`, {
                               method: 'POST',
                               headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
                            });
                            fetchMetrics();
                         }
                      }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem', padding: '6px 12px', borderRadius: '4px' }}>
                         🧹 Clear Junk SOS
                    </button>
                    <button onClick={fetchMetrics} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                        <RefreshCw size={14} className={loading ? 'spin' : ''} /> Force Sync
                     </button>
                </div>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1.5rem 0', color: 'var(--fg)', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <ShieldAlert size={20} color="#f59e0b" /> Active SOS Watch
               </h3>
               
               {metrics.liveSos.length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>No active distress calls globally.</p>
               ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {metrics.liveSos.map((sos) => (
                        <div key={sos._id} style={{ background: 'var(--bg)', border: `1px solid ${sos.status === 'pending' ? '#ef4444' : '#f59e0b'}`, padding: '1rem', borderRadius: '8px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>ID: {sos._id.substring(0,8)}</span>
                              <span style={{ fontSize: '0.8rem', background: sos.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: sos.status === 'pending' ? '#ef4444' : '#f59e0b', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                 {sos.status}
                              </span>
                           </div>
                           <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}><strong>Victim:</strong> {sos.userName || 'Unknown'} ({sos.userPhone || 'No Phone'})</p>
                           {sos.assignedBid?.mechanicName && (
                              <p style={{ margin: '0', fontSize: '0.9rem', color: '#10b981' }}><strong>Mechanic:</strong> {sos.assignedBid.mechanicName} ({sos.assignedBid.phone})</p>
                           )}
                           {sos.evidenceUrl && (
                               <div style={{ marginTop: '10px' }}>
                                  <button onClick={() => setSelectedVideo(sos.evidenceUrl)} style={{ display: 'inline-block', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                     🎥 Play Dashcam Evidence
                                  </button>
                               </div>
                            )}
                        </div>
                     ))}
                  </div>
               )}
            </div>

         </div>
      </div>
      {selectedVideo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
            <button onClick={() => setSelectedVideo(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', zIndex: 10, fontWeight: 'bold' }}>X</button>
            <video src={selectedVideo} controls autoPlay style={{ width: '100%', display: 'block' }}>
               Your browser does not support the video tag.
            </video>
            <div style={{ padding: '15px', textAlign: 'center' }}>
               <a href={selectedVideo} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.9rem' }}>Download / Open Original</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
