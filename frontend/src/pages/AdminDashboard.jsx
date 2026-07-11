import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, IndianRupee, ShieldAlert, KeyRound, Send, Activity, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';
import { getBackendUrl } from '../utils/api';
import { toast } from 'react-hot-toast';
import EmergencySticker from '../components/EmergencySticker';

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ todayUsers: 0, activeMechanics: 0, totalRevenue: 0, liveSos: [] });
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('sos');
  const [mechanics, setMechanics] = useState([]);
  const [chargers, setChargers] = useState([]);

  // Sticker Hub States
  const [stickers, setStickers] = useState([]);
  const [stickerStats, setStickerStats] = useState({ totalPrinted: 0, totalActive: 0, totalInactive: 0 });
  const [stickerSearch, setStickerSearch] = useState('');
  const [stickerFilter, setStickerFilter] = useState('');
  const [stickerPage, setStickerPage] = useState(1);
  const [stickerTotalPages, setStickerTotalPages] = useState(1);
  const [stickersLoading, setStickersLoading] = useState(false);

  // Bulk Generator States
  const [genPrefix, setGenPrefix] = useState('PC');
  const [genStartNum, setGenStartNum] = useState(1);
  const [genCount, setGenCount] = useState(50);
  const [genLoading, setGenLoading] = useState(false);

  // Print Sheet States
  const [printPrefix, setPrintPrefix] = useState('PC');
  const [printStartNum, setPrintStartNum] = useState(1);
  const [printCount, setPrintCount] = useState(50);
  const [isPrintView, setIsPrintView] = useState(false);

  const API_BASE = getBackendUrl();

  const fetchMechanics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/mechanics`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setMechanics(data.mechanics);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mechanics.");
    }
  };

  const fetchChargers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/chargers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setChargers(data.chargers);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chargers.");
    }
  };

  const toggleMechanicApproval = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/mechanics/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchMechanics();
        fetchMetrics();
      } else {
        toast.error(data.message || "Failed to update mechanic.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error toggling mechanic approval.");
    }
  };

  const toggleChargerApproval = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/chargers/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchChargers();
      } else {
        toast.error(data.message || "Failed to update charger.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error toggling charger approval.");
    }
  };

  const deleteCharger = async (id) => {
    if (!window.confirm("Bhaiya, pakka delete karna hai ye charger?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/chargers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchChargers();
      } else {
        toast.error(data.message || "Failed to delete charger.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting charger.");
    }
  };

  const fetchStickers = async (page = 1) => {
    setStickersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/stickers?search=${stickerSearch}&status=${stickerFilter}&page=${page}&limit=50`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        setStickers(data.stickers);
        setStickerStats(data.stats);
        setStickerPage(data.page);
        setStickerTotalPages(data.totalPages);
        
        const nextNum = (data.stats.totalPrinted || 0) + 1;
        setPrintStartNum(nextNum);
        setGenStartNum(nextNum);
      } else {
        toast.error(data.message || "Failed to load stickers.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading stickers.");
    } finally {
      setStickersLoading(false);
    }
  };

  const handleGenerateStickers = async (e) => {
    e.preventDefault();
    setGenLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/stickers/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('parkeToken')}`
        },
        body: JSON.stringify({ prefix: genPrefix, startNum: genStartNum, count: genCount })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchStickers(1);
      } else {
        toast.error(data.message || "Failed to generate stickers.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating stickers.");
    } finally {
      setGenLoading(false);
    }
  };

  const toggleStickerStatus = async (stickerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/stickers/${stickerId}/toggle-status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchStickers(stickerPage);
      } else {
        toast.error(data.message || "Failed to toggle status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error toggling status.");
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/stickers/export`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('parkeToken')}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'parxee_stickers_report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("CSV Report downloaded successfully!");
      } else {
        toast.error("Failed to generate CSV report.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error downloading report.");
    }
  };

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    // 1. Kick out unauthorized users
    if (!user || (user.email !== ADMIN_EMAIL && user.role !== 'admin')) {
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

  if (isPrintView) {
    return (
      <div className="print-preview-container" style={{ background: '#030712', color: '#fff', minHeight: '100vh', padding: '20px' }}>
        <style>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: #030712 !important;
              color: white !important;
            }
            .printable-card {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin: 10px !important;
            }
          }
        `}</style>
        <div className="no-print" style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          background: 'rgba(17, 24, 39, 0.95)', 
          padding: '16px', 
          borderRadius: '12px', 
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', 
          display: 'flex', 
          gap: '12px', 
          zIndex: 10000,
          backdropFilter: 'blur(8px)'
        }}>
          <button 
            onClick={() => window.print()} 
            className="btn-gradient light-sweep" 
            style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', color: '#000' }}
          >
            🖨️ Print / Save PDF
          </button>
          <button 
            onClick={() => setIsPrintView(false)} 
            className="btn-secondary" 
            style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
          >
            ✕ Close Preview
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '30px', padding: '20px 0' }} className="no-print">
          <h2 style={{ color: '#8b5cf6', margin: '0 0 10px 0' }}>Sticker Print Sheet Preview</h2>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            Showing <strong>{printCount}</strong> cards starting from <strong>{printPrefix}{String(printStartNum).padStart(6, '0')}</strong>.
          </p>
          <p style={{ color: '#eab308', fontSize: '0.85rem', marginTop: '5px' }}>
            💡 Tip: Set Layout to <strong>Portrait</strong> and Background Graphics to <strong>Enabled</strong> in the browser print settings for best results.
          </p>
        </div>

        {/* Printable Grid */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '24px', 
          justifyContent: 'center', 
          padding: '20px 0',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {Array.from({ length: printCount }).map((_, idx) => {
            const num = printStartNum + idx;
            const paddedNum = String(num).padStart(6, '0');
            const stickerId = `${printPrefix}${paddedNum}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '/activate/' + stickerId)}`;
            const dummyUser = {
              name: 'NOT YET ACTIVATED',
              plateNumber: 'SCAN TO BIND',
              subscriptionTier: 'standard',
              smartTagId: stickerId
            };
            return (
              <div key={stickerId} className="printable-card" style={{ display: 'inline-block', transition: 'transform 0.2s' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  background: 'rgba(255,255,255,0.01)', 
                  padding: '24px 20px', 
                  borderRadius: '24px', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  overflow: 'hidden', 
                  width: '380px' 
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '12px' }}>
                    STICKER ID: {stickerId}
                  </span>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0', overflow: 'visible' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <EmergencySticker user={dummyUser} qrUrl={qrUrl} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
         
         {/* Tabs */}
         <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <button 
              onClick={() => setActiveTab('sos')}
              style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', background: activeTab === 'sos' ? '#ef4444' : 'rgba(255,255,255,0.02)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              🚨 SOS Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('mechanics'); fetchMechanics(); }}
              style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', background: activeTab === 'mechanics' ? '#10b981' : 'rgba(255,255,255,0.02)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              🔧 Manage Mechanics
            </button>
            <button 
              onClick={() => { setActiveTab('chargers'); fetchChargers(); }}
              style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', background: activeTab === 'chargers' ? '#38bdf8' : 'rgba(255,255,255,0.02)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              🔌 Manage EV Chargers
            </button>
            <button 
              onClick={() => { setActiveTab('stickers'); fetchStickers(1); }}
              style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', background: activeTab === 'stickers' ? '#8b5cf6' : 'rgba(255,255,255,0.02)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              🏷️ Sticker Hub
            </button>
         </div>

         {activeTab === 'sos' && (
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
         )}

         {activeTab === 'mechanics' && (
            <div className="glass-card fadeIn" style={{ padding: '2rem', borderRadius: '12px' }}>
               <h3 style={{ margin: '0 0 1.5rem 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <Wrench size={20} /> Registered Mechanics Setup Status
               </h3>
               {mechanics.length === 0 ? (
                  <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>No mechanics registered in database.</p>
               ) : (
                  <div style={{ overflowX: 'auto' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                           <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.85rem' }}>
                              <th style={{ padding: '12px 8px' }}>Name</th>
                              <th style={{ padding: '12px 8px' }}>Shop & Location</th>
                              <th style={{ padding: '12px 8px' }}>Experience</th>
                              <th style={{ padding: '12px 8px' }}>Wallet Balance</th>
                              <th style={{ padding: '12px 8px' }}>Paid / Approved</th>
                              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {mechanics.map((mech) => (
                              <tr key={mech._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                                 <td style={{ padding: '14px 8px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{mech.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{mech.phone}</div>
                                 </td>
                                 <td style={{ padding: '14px 8px' }}>
                                    <div>{mech.shopName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{mech.highwayLocation}</div>
                                 </td>
                                 <td style={{ padding: '14px 8px' }}>{mech.experienceYears} Years</td>
                                 <td style={{ padding: '14px 8px', fontWeight: '600', color: mech.walletBalance < 89 ? '#ef4444' : '#10b981' }}>
                                    ₹{mech.walletBalance || 0}
                                 </td>
                                 <td style={{ padding: '14px 8px' }}>
                                    <span style={{ 
                                       fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold',
                                       background: mech.isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                       color: mech.isPaid ? '#10b981' : '#ef4444'
                                    }}>
                                       {mech.isPaid ? "APPROVED" : "PENDING SETUP"}
                                    </span>
                                 </td>
                                 <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                                    <button 
                                       onClick={() => toggleMechanicApproval(mech._id)}
                                       style={{
                                          background: mech.isPaid ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                          color: mech.isPaid ? '#ef4444' : '#10b981',
                                          border: `1px solid ${mech.isPaid ? '#ef4444' : '#10b981'}`,
                                          padding: '6px 12px',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem',
                                          fontWeight: 'bold'
                                       }}
                                    >
                                       {mech.isPaid ? "Revoke Approval" : "Approve Mechanic"}
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         )}

         {activeTab === 'chargers' && (
            <div className="glass-card fadeIn" style={{ padding: '2rem', borderRadius: '12px' }}>
               <h3 style={{ margin: '0 0 1.5rem 0', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <IndianRupee size={20} /> Hosted EV Charger Grid
               </h3>
               {chargers.length === 0 ? (
                  <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>No EV chargers hosted in database.</p>
               ) : (
                  <div style={{ overflowX: 'auto' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                        <thead>
                           <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.85rem' }}>
                              <th style={{ padding: '12px 8px' }}>Host / Details</th>
                              <th style={{ padding: '12px 8px' }}>Address</th>
                              <th style={{ padding: '12px 8px' }}>Plug & Speed</th>
                              <th style={{ padding: '12px 8px' }}>Price/Hr</th>
                              <th style={{ padding: '12px 8px' }}>Status</th>
                              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {chargers.map((charger) => (
                              <tr key={charger._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                                 <td style={{ padding: '14px 8px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{charger.hostName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Phone: {charger.phone}</div>
                                 </td>
                                 <td style={{ padding: '14px 8px' }}>{charger.address}</td>
                                 <td style={{ padding: '14px 8px' }}>
                                    <div>{charger.plugType}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Speed: {charger.speed}</div>
                                 </td>
                                 <td style={{ padding: '14px 8px', fontWeight: 'bold', color: '#10b981' }}>
                                    ₹{charger.price}
                                 </td>
                                 <td style={{ padding: '14px 8px' }}>
                                    <span style={{ 
                                       fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold',
                                       background: charger.isApproved ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                       color: charger.isApproved ? '#38bdf8' : '#ef4444'
                                    }}>
                                       {charger.isApproved ? "APPROVED / LIVE" : "PENDING REVIEW"}
                                    </span>
                                 </td>
                                 <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                       <button 
                                          onClick={() => toggleChargerApproval(charger._id)}
                                          style={{
                                             background: charger.isApproved ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                                             color: charger.isApproved ? '#ef4444' : '#38bdf8',
                                             border: `1px solid ${charger.isApproved ? '#ef4444' : '#38bdf8'}`,
                                             padding: '6px 12px',
                                             borderRadius: '6px',
                                             cursor: 'pointer',
                                             fontSize: '0.8rem',
                                             fontWeight: 'bold'
                                          }}
                                       >
                                          {charger.isApproved ? "Revoke" : "Approve"}
                                       </button>
                                       <button 
                                          onClick={() => deleteCharger(charger._id)}
                                          style={{
                                             background: 'rgba(239, 68, 68, 0.15)',
                                             color: '#ef4444',
                                             border: '1px solid rgba(239, 68, 68, 0.3)',
                                             padding: '6px 12px',
                                             borderRadius: '6px',
                                             cursor: 'pointer',
                                             fontSize: '0.8rem',
                                             fontWeight: 'bold'
                                          }}
                                       >
                                          Delete
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         )}

         {activeTab === 'stickers' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Sticker Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                   <div className="glass-card" style={{ borderLeft: '4px solid #8b5cf6', padding: '1.25rem', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase' }}>Printed Stickers</h4>
                      <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stickerStats.totalPrinted}</p>
                   </div>
                   <div className="glass-card" style={{ borderLeft: '4px solid #10b981', padding: '1.25rem', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase' }}>Activated Cards</h4>
                      <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stickerStats.totalActive}</p>
                   </div>
                   <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b', padding: '1.25rem', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase' }}>Inactive Stickers</h4>
                      <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stickerStats.totalInactive}</p>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
                   
                   {/* 1. Range Generator Form */}
                   <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                      <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                         🏷️ Generate Pre-printed Sticker IDs
                      </h3>
                      <form onSubmit={handleGenerateStickers} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <div>
                               <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>Prefix</label>
                               <input 
                                  type="text" 
                                  value={genPrefix} 
                                  onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                                  style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
                               />
                            </div>
                            <div>
                               <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>Start Number</label>
                               <input 
                                  type="number" 
                                  value={genStartNum} 
                                  onChange={(e) => setGenStartNum(parseInt(e.target.value) || 1)}
                                  style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
                               />
                            </div>
                            <div>
                               <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>Count (Max 1000)</label>
                               <input 
                                  type="number" 
                                  value={genCount} 
                                  onChange={(e) => setGenCount(parseInt(e.target.value) || 50)}
                                  style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
                               />
                            </div>
                         </div>
                         <button 
                            type="submit" 
                            disabled={genLoading}
                            style={{ padding: '12px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: genLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}
                         >
                            {genLoading ? "Generating..." : "Generate & Print IDs"}
                         </button>
                      </form>
                   </div>

                    {/* 3. Bulk Print Cards */}
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                       <div>
                          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                             🖨️ Bulk Print Cards (PDF)
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                             <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>Prefix</label>
                                <input 
                                   type="text" 
                                   value={printPrefix} 
                                   onChange={(e) => setPrintPrefix(e.target.value.toUpperCase())}
                                   style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
                                />
                             </div>
                             <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>Start No.</label>
                                <input 
                                   type="number" 
                                   value={printStartNum} 
                                   onChange={(e) => setPrintStartNum(parseInt(e.target.value) || 1)}
                                   style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
                                />
                             </div>
                             <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>Count</label>
                                <input 
                                   type="number" 
                                   value={printCount} 
                                   onChange={(e) => setPrintCount(parseInt(e.target.value) || 50)}
                                   style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #374151', color: '#fff', borderRadius: '6px' }}
                                />
                             </div>
                          </div>
                       </div>
                       <button 
                          onClick={() => {
                             if (printCount > 1000) {
                                return toast.error("Maximum 1000 cards can be printed at once to prevent browser lag.");
                             }
                             setIsPrintView(true);
                          }}
                          style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                       >
                          🖨️ Prepare Print Sheet
                       </button>
                    </div>

                   {/* 2. Actions & Exports */}
                   <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                         <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                            💾 Data Exporter
                         </h3>
                         <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                            Export details of all generated stickers, including registration status, linked customer details, and vehicle information.
                         </p>
                      </div>
                      <button 
                         onClick={handleExportCsv}
                         style={{ padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                         📥 Download CSV Sticker Report
                      </button>
                   </div>

                </div>

                {/* Filter and Search controls */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                   <input 
                      type="text" 
                      placeholder="Search Sticker ID (e.g. PC000001)..." 
                      value={stickerSearch}
                      onChange={(e) => setStickerSearch(e.target.value)}
                      style={{ flex: 2, minWidth: '220px', padding: '12px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }}
                   />
                   <select 
                      value={stickerFilter}
                      onChange={(e) => setStickerFilter(e.target.value)}
                      style={{ flex: 1, minWidth: '150px', padding: '12px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '8px' }}
                   >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Deactivated</option>
                   </select>
                   <button 
                      onClick={() => fetchStickers(1)}
                      style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                   >
                      Search
                   </button>
                </div>

                {/* Sticker List Table */}
                {stickersLoading ? (
                   <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--primary)' }}>Loading Stickers Database...</div>
                ) : stickers.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border)' }}>No pre-printed stickers found matching constraints.</div>
                ) : (
                   <div>
                      <div className="table-responsive" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                            <thead>
                               <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', textTransform: 'uppercase', color: '#9ca3af' }}>
                                  <th style={{ padding: '14px 10px' }}>Sticker ID</th>
                                  <th style={{ padding: '14px 10px' }}>Status</th>
                                  <th style={{ padding: '14px 10px' }}>Linked Customer</th>
                                  <th style={{ padding: '14px 10px' }}>Vehicle Info</th>
                                  <th style={{ padding: '14px 10px' }}>Activation Date</th>
                                  <th style={{ padding: '14px 10px', textAlign: 'right' }}>Actions</th>
                               </tr>
                            </thead>
                            <tbody>
                               {stickers.map((s) => (
                                  <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                                     <td style={{ padding: '14px 10px', fontWeight: 'bold', fontFamily: 'monospace' }}>{s.stickerId}</td>
                                     <td style={{ padding: '14px 10px' }}>
                                        <span style={{ 
                                           fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold',
                                           background: s.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                           color: s.status === 'Active' ? '#10b981' : '#ef4444'
                                        }}>
                                           {s.status === 'Active' ? 'Active' : 'Deactivated'}
                                        </span>
                                     </td>
                                     <td style={{ padding: '14px 10px' }}>
                                        {s.userId ? (
                                           <div>
                                              <div style={{ fontWeight: 'bold' }}>{s.userId.name}</div>
                                              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Phone: {s.userId.phone}</div>
                                           </div>
                                        ) : "NULL"}
                                     </td>
                                     <td style={{ padding: '14px 10px' }}>{s.vehicleNumber || 'N/A'}</td>
                                     <td style={{ padding: '14px 10px', fontSize: '0.8rem', color: '#9ca3af' }}>
                                        {s.activationDate ? new Date(s.activationDate).toLocaleDateString() : 'N/A'}
                                     </td>
                                     <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                                        <button 
                                           onClick={() => {
                                              const match = s.stickerId.match(/^([A-Za-z]+)(\d+)$/);
                                              if (match) {
                                                 setPrintPrefix(match[1]);
                                                 setPrintStartNum(parseInt(match[2]));
                                                 setPrintCount(1);
                                                 setIsPrintView(true);
                                              } else {
                                                 setPrintPrefix(s.stickerId);
                                                 setPrintStartNum(1);
                                                 setPrintCount(1);
                                                 setIsPrintView(true);
                                              }
                                           }}
                                           style={{
                                              background: 'rgba(56, 189, 248, 0.15)',
                                              color: '#38bdf8',
                                              border: '1px solid rgba(56, 189, 248, 0.3)',
                                              padding: '6px 12px',
                                              borderRadius: '6px',
                                              cursor: 'pointer',
                                              fontSize: '0.8rem',
                                              fontWeight: 'bold',
                                              marginRight: '8px'
                                           }}
                                        >
                                           🖨️ Print
                                        </button>
                                         <button 
                                            onClick={() => toggleStickerStatus(s.stickerId)}
                                            style={{
                                               background: 'transparent',
                                               color: '#9ca3af',
                                               border: '1px solid rgba(255, 255, 255, 0.15)',
                                               padding: '6px 12px',
                                               borderRadius: '6px',
                                               cursor: 'pointer',
                                               fontSize: '0.8rem',
                                               fontWeight: 'bold'
                                            }}
                                         >
                                            {s.status === 'Active' ? 'Deactivate' : 'Activate'}
                                         </button>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                      
                      {/* Pagination Controls */}
                      {stickerTotalPages > 1 && (
                         <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '1.5rem', alignItems: 'center' }}>
                            <button 
                               disabled={stickerPage === 1}
                               onClick={() => fetchStickers(stickerPage - 1)}
                               style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                            >
                               Previous
                            </button>
                            <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Page {stickerPage} of {stickerTotalPages}</span>
                            <button 
                               disabled={stickerPage === stickerTotalPages}
                               onClick={() => fetchStickers(stickerPage + 1)}
                               style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                            >
                               Next
                            </button>
                         </div>
                      )}
                   </div>
                )}

             </div>
          )}
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
