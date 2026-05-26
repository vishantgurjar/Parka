import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, IndianRupee, ShieldAlert, KeyRound, Send, Activity, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';
import { getBackendUrl } from '../utils/api';
import { toast } from 'react-hot-toast';

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ todayUsers: 0, activeMechanics: 0, totalRevenue: 0, liveSos: [] });
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const API_BASE = getBackendUrl();
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

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
      
      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('parkeActiveUser');
        localStorage.removeItem('parkeToken');
        navigate('/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setMetrics(data);
      } else {
        toast.error(data.message || "Failed to load metrics");
      }
    } catch (err) {
      console.error("Failed to load metrics", err);
      toast.error("Connection error. Could not fetch metrics.");
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                     {metrics.liveSos.map((sos) => (
                        <div key={sos._id} style={{ background: 'rgba(17, 24, 39, 0.7)', border: `1px solid ${sos.status === 'pending' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`, padding: '1.25rem', borderRadius: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', transition: 'transform 0.2s, border-color 0.2s' }} className="sos-card-hover">
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>ID: {sos._id.substring(0,8)}</span>
                              <span style={{ fontSize: '0.75rem', background: sos.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: sos.status === 'pending' ? '#ef4444' : '#f59e0b', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                 {sos.status}
                              </span>
                           </div>
                           
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                              <p style={{ margin: '0', fontSize: '0.9rem', color: '#e5e7eb' }}>
                                 <strong style={{ color: '#9ca3af' }}>Victim:</strong> {sos.userName || 'Unknown'} 
                                 <span style={{ fontSize: '0.85rem', color: '#6b7280', marginLeft: '6px' }}>({sos.userPhone || 'No Phone'})</span>
                              </p>
                              {sos.assignedBid?.mechanicName && (
                                 <p style={{ margin: '0', fontSize: '0.9rem', color: '#10b981' }}>
                                    <strong style={{ color: '#6b7280' }}>Mechanic:</strong> {sos.assignedBid.mechanicName} 
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(16, 185, 129, 0.7)', marginLeft: '6px' }}>({sos.assignedBid.phone})</span>
                                 </p>
                              )}
                           </div>

                           {/* Evidence Backup Status Block */}
                           <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 {sos.evidenceUrl ? (
                                    <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '50px', fontWeight: '500' }}>
                                       <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                                       Cloud Backup Secured
                                    </span>
                                 ) : sos.debugLogs ? (
                                    <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '6px', fontWeight: '500' }}>
                                       ⚠️ {sos.debugLogs}
                                    </span>
                                 ) : (
                                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '50px', fontWeight: '500' }} className="pulse-anim">
                                       <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                                       Awaiting Dashcam link...
                                    </span>
                                 )}
                              </div>

                              {sos.evidenceUrl && (
                                 <button 
                                    onClick={() => setSelectedVideo(sos.evidenceUrl)} 
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)', transition: 'all 0.2s' }}
                                    className="play-btn-hover"
                                 >
                                    🎥 Play Dashcam Evidence
                                 </button>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

         </div>
      </div>
      {selectedVideo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '780px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#1f2937' }}>
               <span style={{ fontWeight: 'bold', color: '#f3f4f6', fontSize: '0.95rem' }}>🎥 Sentinel Cloud Player</span>
               <button onClick={() => setSelectedVideo(null)} style={{ background: 'rgba(255,255,255,0.08)', color: '#9ca3af', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.2s' }} className="close-btn-hover">✕</button>
            </div>
            <video src={selectedVideo} controls autoPlay style={{ width: '100%', maxHeight: '450px', display: 'block', background: '#000' }}>
               Your browser does not support the video tag.
            </video>
            <div style={{ padding: '15px 20px', textAlign: 'center', background: '#1f2937', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Format: Direct Stream</span>
               <a href={selectedVideo} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Download / Open Original →</a>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .sos-card-hover:hover {
          transform: translateY(-2px);
          border-color: rgba(56, 189, 248, 0.4) !important;
        }
        .play-btn-hover:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.5) !important;
        }
        .close-btn-hover:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}
