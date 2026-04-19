import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, IndianRupee, ShieldAlert, KeyRound, Send, Activity, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ todayUsers: 0, activeMechanics: 0, totalRevenue: 0, liveSos: [] });
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app';
  const ADMIN_EMAIL = 'panwarvishant9@gmail.com';

  useEffect(() => {
    // 1. Kick out unauthorized users
    if (!user || user.email !== ADMIN_EMAIL) {
      alert("UNAUTHORIZED ACCESS DETECTED. IPs LOGGED.");
      navigate('/');
      return;
    }
    
    // 2. Fetch metrics
    fetchMetrics();
    
    // 3. Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/metrics?email=${ADMIN_EMAIL}`);
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
    if (!broadcastMessage.trim()) return alert("Message cannot be empty!");
    setBroadcastSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, title: "PLATFORM ANNOUNCEMENT", message: broadcastMessage })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setBroadcastMessage('');
      } else {
        alert("Broadcast failed.");
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setBroadcastSending(false);
    }
  };

  if (loading) {
     return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#ef4444' }}><Activity className="pulse-anim" size={40} /></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#f3f4f6', paddingTop: '80px', paddingBottom: '4rem', fontFamily: 'monospace' }}>
      <SEO title="System Admin | Parkéé City" />
      
      <div className="container" style={{ maxWidth: '1200px' }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', margin: 0, fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
               <KeyRound size={28} /> Sentinel System [God Mode]
            </h1>
            <button onClick={fetchMetrics} style={{ background: '#111827', border: '1px solid #374151', color: '#9ca3af', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
               <RefreshCw size={16} /> Sync
            </button>
         </div>

         {/* Metrics HUD */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: '#111827', border: '1px solid #ef4444', borderLeft: '4px solid #ef4444', padding: '1.5rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', color: '#ef4444' }}>
                   <Users size={24} />
                   <span style={{ fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>LIVE</span>
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#9ca3af', textTransform: 'uppercase' }}>New Users Today</h3>
                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{metrics.todayUsers}</p>
            </div>

            <div style={{ background: '#111827', border: '1px solid #3b82f6', borderLeft: '4px solid #3b82f6', padding: '1.5rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', color: '#3b82f6' }}>
                   <Wrench size={24} />
                   <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>HIGHWAY READY</span>
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#9ca3af', textTransform: 'uppercase' }}>Active Mechanics</h3>
                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{metrics.activeMechanics}</p>
            </div>

            <div style={{ background: '#111827', border: '1px solid #10b981', borderLeft: '4px solid #10b981', padding: '1.5rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', color: '#10b981' }}>
                   <IndianRupee size={24} />
                   <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>EST. REVENUE</span>
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#9ca3af', textTransform: 'uppercase' }}>Pro Tier Subs</h3>
                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>₹{metrics.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            
            {/* Global Broadcast */}
            <div style={{ background: '#111827', border: '1px solid #374151', padding: '2rem', borderRadius: '4px' }}>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1.5rem 0', color: '#f3f4f6', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
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
            <div style={{ background: '#111827', border: '1px solid #374151', padding: '2rem', borderRadius: '4px' }}>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1.5rem 0', color: '#f3f4f6', borderBottom: '1px solid #1f2937', paddingBottom: '1rem' }}>
                  <ShieldAlert size={20} color="#f59e0b" /> Active SOS Watch
               </h3>
               
               {metrics.liveSos.length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>No active distress calls globally.</p>
               ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {metrics.liveSos.map((sos) => (
                        <div key={sos._id} style={{ background: '#050505', border: `1px solid ${sos.status === 'pending' ? '#ef4444' : '#f59e0b'}`, padding: '1rem', borderRadius: '4px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>ID: {sos._id.substring(0,8)}</span>
                              <span style={{ fontSize: '0.8rem', background: sos.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: sos.status === 'pending' ? '#ef4444' : '#f59e0b', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                 {sos.status}
                              </span>
                           </div>
                           <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}><strong>Victim:</strong> {sos.user?.name || 'Unknown'} ({sos.user?.phone || 'No Phone'})</p>
                           {sos.acceptedBy && (
                              <p style={{ margin: '0', fontSize: '0.9rem', color: '#10b981' }}><strong>Mechanic:</strong> {sos.acceptedBy.name} ({sos.acceptedBy.phone})</p>
                           )}
                           <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#ef4444' }}><strong>Issue:</strong> {sos.issueDescription}</p>
                        </div>
                     ))}
                  </div>
               )}
            </div>

         </div>
      </div>
    </div>
  );
}
