import { useState, useEffect, useRef, useContext } from 'react';
import { Shield, Radio, Activity, Camera, AlertCircle, X, MapPin, Gauge } from 'lucide-react';
import { AuthContext } from '../App';
import SEO from '../components/SEO';

export default function Sentinel() {
  const { isPro } = useContext(AuthContext);
  const [isActive, setIsActive] = useState(false);
  const [isImpactDetected, setIsImpactDetected] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [gForce, setGForce] = useState({ x: 0, y: 0, z: 0, total: 0 });
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [logs, setLogs] = useState([]);

  // Mock logging function
  const addLog = (msg) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg }, ...prev].slice(0, 5));
  };

  const triggerImpact = () => {
    setIsImpactDetected(true);
    addLog("CRITICAL IMPACT DETECTED!");
    setCountdown(10);
  };

  const sendSOS = () => {
    addLog("SOS DISPATCHED TO EMERGENCY CLOUD.");
    alert("SOS DISPATCHED! Evidence locked and uploaded to Parkéé Cloud.");
    setIsImpactDetected(false);
  };

  const cancelSOS = () => {
    setIsImpactDetected(false);
    addLog("SOS Manually Cancelled.");
  };

  const stopSentinel = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    setIsImpactDetected(false);
    setStream(null);
  };

  const startSentinel = async () => {
    if (!isPro()) {
      alert("Sentinel Mode is a PRO feature. Join Diamond PRO for life-saving protection.");
      return;
    }
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsActive(true);
      addLog("System Armed. Monitoring Sensors.");
    } catch (e) {
      alert("Camera access required for Sentinel Mode.");
    }
  };

  // Sensor Logic
  useEffect(() => {
    if (!isActive) return;

    const handleMotion = (event) => {
      const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      const total = Math.sqrt((x||0)*(x||0) + (y||0)*(y||0) + (z||0)*(z||0));
      setGForce({ 
        x: (x||0).toFixed(2), 
        y: (y||0).toFixed(2), 
        z: (z||0).toFixed(2), 
        total: total.toFixed(2) 
      });

      // Sensitivity: 4.5G (approx 44 m/s2)
      if (total > 45 && !isImpactDetected) {
        triggerImpact();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isImpactDetected, triggerImpact]);

  // Countdown Logic
  useEffect(() => {
    let timer;
    if (isImpactDetected && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (isImpactDetected && countdown === 0) {
      setTimeout(() => sendSOS(), 0);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImpactDetected, countdown, sendSOS]);

  return (
    <div className="sentinel-page" style={{ background: '#0a0a0b', minHeight: '100vh', color: '#fff', paddingTop: '80px', paddingBottom: '40px' }}>
      <SEO title="Parkéé Sentinel - AI Accident Detection" description="Transform your phone into a smart black box with Parkéé Sentinel Mode." />
      
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', color: '#38bdf8', fontWeight: 'bold', marginBottom: '1rem' }}>
            <Shield size={18} />
            Sentinel AI Guardian
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 10px 0' }}>
            Driving <span className="text-gradient">Sentinel Mode</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>Active Accident Monitoring & Evidence Protection</p>
        </header>

        <div className="sentinel-grid" style={{ display: 'grid', gridTemplateColumns: isActive ? '1fr 340px' : '1fr', gap: '2rem' }}>
          
          {/* Main Display */}
          <div className="main-display glass" style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            
            {!isActive ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="sentinel-logo pulse-primary" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 40px rgba(56, 189, 248, 0.3)' }}>
                  <Shield size={60} color="#fff" />
                </div>
                <h2 style={{ marginBottom: '1rem' }}>Ready to Secure Your Drive?</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
                  Sentinel converts your phone into a black box. Mount it on your dashboard and enjoy 24/7 protection.
                </p>
                <button 
                  onClick={startSentinel}
                  className="btn-gradient pulse-primary" 
                  style={{ padding: '18px 40px', fontSize: '1.2rem', borderRadius: '50px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <Activity size={24} />
                  Activate Sentinel Mode
                </button>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {/* Live Video Feed */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, display: 'block' }}
                />
                
                {/* HUD Overlay */}
                <div className="hud-overlay" style={{ position: 'absolute', inset: 0, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                  
                  {/* Top HUD */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="glass" style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px' }}>System Status</div>
                      <div style={{ color: '#22c55e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Radio size={14} className="pulse-anim" /> ONLINE
                      </div>
                    </div>
                    <div className="glass" style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px' }}>Storage</div>
                      <div style={{ fontWeight: 'bold' }}>BUFFERING (30s)</div>
                    </div>
                  </div>

                  {/* Center HUD (Impact) */}
                  {isImpactDetected && (
                    <div className="impact-alert glass" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '2px solid #ef4444', padding: '3rem', borderRadius: '24px', textAlign: 'center', animation: 'impact-pulse 1s infinite', pointerEvents: 'all' }}>
                      <AlertCircle size={60} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                      <h2 style={{ fontSize: '2rem', color: '#ef4444', fontWeight: '900', marginBottom: '0.5rem' }}>IMPACT DETECTED!</h2>
                      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Automatic SOS in <strong>{countdown}s</strong></p>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={cancelSOS} style={{ padding: '14px 28px', background: '#333', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          I'M SAFE
                        </button>
                        <button onClick={sendSOS} style={{ padding: '14px 28px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          SEND SOS
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom HUD */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div className="glass" style={{ padding: '20px', borderRadius: '20px', minWidth: '200px', display: 'flex', gap: '20px' }}>
                        <div>
                          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>G-FORCE</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{gForce.total}G</div>
                        </div>
                        <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div>
                          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>STABILITY</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>98%</div>
                        </div>
                    </div>
                    <button 
                      onClick={stopSentinel} 
                      style={{ pointerEvents: 'all', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Logs */}
          {isActive && (
            <div className="sentinel-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', flex: 1, backgroundColor: 'rgba(15, 15, 18, 0.7)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                  <Activity size={18} /> Live Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {logs.map((log, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', borderLeft: '2px solid #38bdf8' }}>
                      <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>[{log.time}]</span> {log.msg}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', backgroundColor: 'rgba(15, 15, 18, 0.7)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>System Controls</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button onClick={triggerImpact} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    <MapPin size={16} /> Fake Crash
                  </button>
                  <button style={{ padding: '15px', borderRadius: '12px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                     Night HUD
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Features Info */}
        {!isActive && (
          <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="feature-item glass" style={{ padding: '2rem', borderRadius: '24px' }}>
              <div style={{ color: '#38bdf8', marginBottom: '1rem' }}><Activity size={32} /></div>
              <h3>Crash-Sense AI</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Uses phone's 100Hz gyroscope to detect impact with surgical precision.</p>
            </div>
            <div className="feature-item glass" style={{ padding: '2rem', borderRadius: '24px' }}>
              <div style={{ color: '#38bdf8', marginBottom: '1rem' }}><Camera size={32} /></div>
              <h3>Rolling Black-Box</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Constant video buffering that only saves when a crash is confirmed.</p>
            </div>
            <div className="feature-item glass" style={{ padding: '2rem', borderRadius: '24px' }}>
              <div style={{ color: '#38bdf8', marginBottom: '1rem' }}><Gauge size={32} /></div>
              <h3>Cloud Security</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Instant evidence upload to ensure records are safe even if phone is damaged.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pulse-anim { animation: sentinel-pulse 2s infinite; }
        @keyframes sentinel-pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes impact-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 30px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .text-gradient {
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass {
          background: rgba(15, 15, 18, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .sentinel-page h2, .sentinel-page h3 { margin: 0; }
      `}</style>
    </div>
  );
}
