import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Shield, Radio, Activity, Camera, AlertCircle, X, MapPin, Gauge } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../App';
import SEO from '../components/SEO';
import { getBackendUrl } from '../utils/api';

export default function Sentinel() {
  const { isPro, user, socket } = useContext(AuthContext);
  const [isActive, setIsActive] = useState(false);
  const [isImpactDetected, setIsImpactDetected] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [gForce, setGForce] = useState({ x: 0, y: 0, z: 0, total: 0 });
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [stream, setStream] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState([]);

  // Dual-Camera / Role State
  const [role, setRole] = useState('front'); // 'front' (phone) or 'rear' (infotainment)
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Fetch camera devices on mount
  useEffect(() => {
    const listDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.warn("Failed listing cameras:", err);
      }
    };
    listDevices();
  }, []);

  // Mock logging function
  const addLog = useCallback((msg) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg }, ...prev].slice(0, 5));
  }, []);

  const triggerImpact = useCallback(() => {
    setIsImpactDetected(true);
    addLog("CRITICAL IMPACT DETECTED!");
    setCountdown(10);
  }, [addLog]);

  const sosIdRef = useRef(null);
  const isFakeCrashRef = useRef(false);
  const skipUploadRef = useRef(false);
  const [currentSosId, setCurrentSosId] = useState(null);

  const sendSOS = useCallback(async () => {
    addLog("SOS DISPATCHED TO EMERGENCY CLOUD.");
    
    try {
      const baseUrl = getBackendUrl();
      
      // 1. Broadcast the SOS
      const res = await fetch(`${baseUrl}/api/sos/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id || 'guest',
          userName: user?.name || 'Sentinel Driver',
          userPhone: user?.phone || '9112200000',
          location: { lat: 28.7041, lng: 77.1025 } // Using static/mock location for now
        })
      });

      const data = await res.json();
      if (res.ok && data.sosRequest) {
        addLog("SOS BROADCASTED SUCCESSFULLY.");
        toast.success("Emergency Signal Sent!");
        setCurrentSosId(data.sosRequest._id);
        sosIdRef.current = data.sosRequest._id;
        
        // Sync rear device if socket is active
        if (socket && user) {
          socket.emit("sentinel-impact-detected", {
            userId: user._id,
            type: "front",
            sosId: data.sosRequest._id
          });
          addLog("EMITTED REAL-TIME SYNC TRIGGER TO CAR SCREEN.");
        }
        
        // 2. Stop recording and link evidence (mock only if camera is inactive/simulation, real upload if camera is active)
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
          addLog("LINKING MOCK DASHCAM EVIDENCE...");
          const mockVideoUrl = "https://www.w3schools.com/html/movie.mp4";
          
          setIsUploading(true);
          
          try {
            const linkRes = await fetch(`${baseUrl}/api/sos/evidence-link`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sosId: data.sosRequest._id,
                userId: user?._id || 'guest',
                evidenceUrl: mockVideoUrl,
                isSecondary: role === 'rear'
              })
            });
            if (linkRes.ok) {
              addLog("MOCK EVIDENCE SECURED & LINKED.");
              await new Promise(resolve => setTimeout(resolve, 1500));
              toast.success("SOS & Demo Evidence Secured!");
            }
          } catch (linkErr) {
            console.error("Failed to link mock evidence:", linkErr);
          } finally {
            setIsUploading(false);
          }
        } else {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        }
        isFakeCrashRef.current = false; // Reset anyway
      }
    } catch (err) {
      console.error("SOS Broadcast Failed:", err);
    }

    setIsImpactDetected(false);
  }, [addLog, user]);

  const uploadEvidence = useCallback(async (blob, sosId) => {
    setIsUploading(true);
    addLog("DIRECT CLOUD UPLOAD INITIALIZED...");
    
    try {
      const cloudName = document.getElementById('debugCloud')?.value || 'dosb2aa9f';
      const uploadPreset = document.getElementById('debugPreset')?.value || 'parxee city';

      // Try primary and fallback presets
      const presets = [uploadPreset, uploadPreset.replace(' ', '_'), uploadPreset.replace(' ', '')];
      let success = false;
      let lastError = '';

      for (const preset of presets) {
        if (success) break;
        
        const formData = new FormData();
        const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
        // Force correct filename extension to help Cloudinary recognize the video from mobile blobs
        formData.append('file', blob, `evidence.${ext}`);
        formData.append('upload_preset', preset);
        formData.append('resource_type', 'video');

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
          method: 'POST',
          body: formData
        });

        const cloudData = await cloudRes.json();

        if (cloudRes.ok && cloudData.secure_url) {
          success = true;
          addLog(`EVIDENCE SECURED (${preset})`);
          
          const baseUrl = getBackendUrl();
          const linkRes = await fetch(`${baseUrl}/api/sos/evidence-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sosId: sosId || null,
              userId: user?._id || 'guest',
              evidenceUrl: cloudData.secure_url,
              isSecondary: role === 'rear'
            })
          });

          if (linkRes.ok) {
            addLog("EVIDENCE LINKED TO SOS.");
            toast.success("SOS & Evidence Secured!");
          }
        } else {
          lastError = cloudData.error?.message || `HTTP ${cloudRes.status}`;
        }
      }

      if (!success) {
        addLog(`CLOUD DIRECT FAILED: Trying backend fallback...`);
        
        try {
          const backendFormData = new FormData();
          const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
          backendFormData.append('video', blob, `evidence.${ext}`);
          if (sosId) backendFormData.append('sosId', sosId);
          backendFormData.append('userId', user?._id || 'guest');

          const baseUrl = getBackendUrl();
          const backendRes = await fetch(`${baseUrl}/api/sos/evidence`, {
            method: 'POST',
            body: backendFormData
          });

          const backendData = await backendRes.json();
          if (backendRes.ok && backendData.url) {
            success = true;
            addLog("EVIDENCE SECURED (Backend Fallback)");
            toast.success("SOS & Evidence Secured!");
          } else {
            lastError = backendData.message || 'Backend upload failed';
          }
        } catch (backendErr) {
          lastError = backendErr.message;
        }

        if (!success) {
          addLog(`UPLOAD ERROR: ${lastError}`);
          toast.error(`Upload Fail: ${lastError}`);
          
          const baseUrl = getBackendUrl();
          // Log error to backend for remote debugging
          await fetch(`${baseUrl}/api/sos/evidence-error`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sosId: sosId || null,
              userId: user?._id || 'guest',
              errorMessage: lastError
            })
          });
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      addLog("NETWORK ERROR DURING UPLOAD.");
    } finally {
      setIsUploading(false);
    }
  }, [addLog, user]);

  const cancelSOS = () => {
    setIsImpactDetected(false);
    isFakeCrashRef.current = false;
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
    if (!user) {
      toast("Preview Mode: Activated for Guest testing.", { icon: '🛡️' });
    } else if (!isPro()) {
      alert("Cam Mode is a PRO feature. Join Diamond PRO for life-saving protection.");
      return;
    }
    
    try {
      // Request low-res video to keep file size small for cloud upload (< 4MB limit on Vercel)
      const constraints = {
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        }, 
        audio: true 
      };
      
      if (selectedDeviceId) {
        constraints.video.deviceId = { exact: selectedDeviceId };
      } else {
        constraints.video.facingMode = role === 'rear' ? 'environment' : 'user';
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      
      // Setup MediaRecorder with cross-browser mimeType support
      const supportedMime = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ].find(type => MediaRecorder.isTypeSupported(type)) || '';

      if (!supportedMime) {
        addLog("Critical: No supported video format found.");
        toast.error("Video recording not supported on this device.");
        return;
      }

      addLog(`Recorder active: ${supportedMime}`);
      // Force 1 Mbps bitrate to keep 10s video around 1.25MB (Well below Vercel's 4.5MB limit)
      const recorderOptions = { mimeType: supportedMime };
      if (MediaRecorder.isTypeSupported(supportedMime)) {
         recorderOptions.videoBitsPerSecond = 1000000;
      }
      const recorder = new MediaRecorder(mediaStream, recorderOptions);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunksRef.current.push(e.data);
            // No shifting chunks here to ensure full recording is preserved
        }
      };
      recorder.onstop = () => {
        if (skipUploadRef.current) {
          skipUploadRef.current = false; // Reset the flag
          addLog("SIMULATION DETECTED: SKIPPING REAL VIDEO UPLOAD.");
          return;
        }
        const blob = new Blob(chunksRef.current, { type: supportedMime });
        uploadEvidence(blob, sosIdRef.current);
      };
      
      recorder.start(); // Remove timeslice (e.g. 1000ms) to avoid corrupted blobs on mobile
      mediaRecorderRef.current = recorder;

      setIsActive(true);
      addLog("System Armed. Monitoring Sensors.");
    } catch (e) {
      console.warn("Camera failed, entering Simulation Mode:", e);
      addLog("Camera failed. Armed in Simulation Mode.");
      toast("Armed in Simulation Mode (No Camera)", { icon: '🛡️' });
      mediaRecorderRef.current = null;
      setIsActive(true);
    }
  };

  // Sensor Logic
  useEffect(() => {
    if (!isActive || role !== 'front') return;

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
  }, [isActive, isImpactDetected, triggerImpact, role]);

  // Rear Camera remote socket impact trigger
  useEffect(() => {
    if (!socket || !isActive || role !== 'rear' || !user) return;

    const handleRemoteImpact = (data) => {
      addLog(`[SYNC] REMOTE IMPACT DETECTED! TARGET SOS ID: ${data.sosId}`);
      setIsImpactDetected(true);
      sosIdRef.current = data.sosId;

      // Stop recording to upload rear evidence after a small delay
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        } else {
          // Simulated fallback
          addLog("LINKING SIMULATED REAR DASHCAM EVIDENCE...");
          const baseUrl = getBackendUrl();
          fetch(`${baseUrl}/api/sos/evidence-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sosId: data.sosId,
              userId: user?._id || 'guest',
              evidenceUrl: "https://www.w3schools.com/html/movie.mp4",
              isSecondary: true
            })
          }).then(res => {
            if (res.ok) {
              addLog("SIMULATED REAR EVIDENCE LINKED.");
              toast.success("Rear Evidence Secured!");
            }
          }).catch(err => console.error("Simulated rear link fail:", err));
        }
        setIsImpactDetected(false);
      }, 1500);
    };

    socket.on("sentinel-trigger-recording", handleRemoteImpact);
    return () => {
      socket.off("sentinel-trigger-recording", handleRemoteImpact);
    };
  }, [socket, isActive, role, user, addLog]);

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

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
  };

  if (!isMobileDevice()) {
    return (
      <div className="sentinel-page" style={{ background: '#0a0a0b', minHeight: '100vh', color: '#fff', paddingTop: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '40px' }}>
        <SEO title="Mobile Only - Parxéé Cam Mode" description="Parxéé Cam Mode is a smartphone only feature." />
        <div className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '0 20px' }}>
          <div className="glass" style={{ padding: '3rem 2rem', borderRadius: '32px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(15, 15, 18, 0.8)' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', width: '72px', height: '72px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <Shield size={36} color="#38bdf8" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem', color: '#fff' }}>Smartphone Feature Only</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Parxéé Cam Mode requires smartphone sensors (gyroscope, accelerometer, and GPS) to monitor vehicle motion and detect collisions. It is not supported on desktop or laptop computers.
            </p>
            
            <div style={{ background: '#fff', padding: '16px', borderRadius: '20px', display: 'inline-block', marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}`} 
                alt="Scan to open on Mobile" 
                style={{ display: 'block', width: '180px', height: '180px' }}
              />
            </div>
            
            <h4 style={{ margin: '0 0 6px 0', color: 'var(--primary)', fontSize: '1rem', fontWeight: 'bold' }}>Scan QR to Open on Phone</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>Open your smartphone camera to scan and activate Cam Mode instantly.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sentinel-page" style={{ background: '#0a0a0b', minHeight: '100vh', color: '#fff', paddingTop: '80px', paddingBottom: '40px' }}>
      <SEO title="Parxéé Cam Mode - AI Accident Detection" description="Transform your phone into a smart black box with Parxéé Cam Mode." />
      
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', color: '#38bdf8', fontWeight: 'bold', marginBottom: '1rem' }}>
            <Shield size={18} />
            Cam Mode Guardian
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 10px 0' }}>
            Driving <span className="text-gradient">Cam Mode</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>v2.5.0 - Enhanced Cloud Protection</p>
        </header>

        <div className="sentinel-grid" style={{ display: 'grid', gridTemplateColumns: isActive ? '1fr 340px' : '1fr', gap: '2rem' }}>
          
          {/* Debug Settings (Only for Dev/Admin) */}
          {!isActive && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#38bdf8' }}>Cloud Debugger</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  id="debugCloud" 
                  defaultValue="dosb2aa9f" 
                  placeholder="Cloud Name" 
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', width: '150px' }} 
                />
                <input 
                  id="debugPreset" 
                  defaultValue="parxee city" 
                  placeholder="Upload Preset" 
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', flex: 1 }} 
                />
                <button 
                  onClick={() => {
                    toast.success("Settings applied to this session!");
                    addLog("Custom Config Applied.");
                  }} 
                  style={{ background: '#38bdf8', color: '#000', border: 'none', padding: '5px 15px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
          
          {/* Main Display */}
          <div className="main-display glass" style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            
            {!isActive ? (
              <div style={{ textAlign: 'center', padding: '2rem 3rem' }}>
                <div className="sentinel-logo pulse-primary" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 40px rgba(56, 189, 248, 0.3)' }}>
                  <Shield size={50} color="#fff" />
                </div>
                <h2 style={{ marginBottom: '0.75rem', fontSize: '1.75rem' }}>Secure Your Drive</h2>
                
                {/* Role and Device selection */}
                <div style={{ maxWidth: '380px', margin: '0 auto 1.5rem', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Device Camera Role</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <button 
                      type="button"
                      onClick={() => setRole('front')}
                      style={{ 
                        padding: '10px', 
                        borderRadius: '8px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        background: role === 'front' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                        color: '#fff'
                      }}
                    >
                      📱 Phone (Front)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole('rear')}
                      style={{ 
                        padding: '10px', 
                        borderRadius: '8px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        background: role === 'rear' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                        color: '#fff'
                      }}
                    >
                      📺 Screen (Rear)
                    </button>
                  </div>

                  {/* Camera Input Selector */}
                  {videoDevices.length > 0 && (
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Camera Source</label>
                      <select 
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          borderRadius: '8px', 
                          background: '#0d1527', 
                          border: '1px solid rgba(255,255,255,0.15)', 
                          color: '#fff', 
                          fontSize: '0.85rem', 
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {videoDevices.map(device => (
                          <option key={device.deviceId} value={device.deviceId} style={{ background: '#111827', color: '#fff' }}>
                            {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button 
                  onClick={startSentinel}
                  className="btn-gradient pulse-primary" 
                  style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}
                >
                  <Activity size={22} />
                  Activate Cam Mode
                </button>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isUploading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
                    <div className="pulse-anim" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                      <Activity size={80} color="#38bdf8" />
                    </div>
                    <h2 style={{ fontSize: '2rem', color: '#38bdf8', marginBottom: '1rem' }}>SECURING EVIDENCE</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', margin: '0 auto' }}>
                      Uploading dashcam footage to Parxéé Cloud Vault. Please do not close the app.
                    </p>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '2.5rem', overflow: 'hidden' }}>
                      <div className="loading-bar-fill" style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', animation: 'loading-progress 2s infinite linear' }} />
                    </div>
                  </div>
                ) : (
                  <>
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
                          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px' }}>Sentinel Role</div>
                          <div style={{ color: '#38bdf8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {role === 'front' ? '📱 FRONT CAMERA / SENSOR' : '📺 REAR CAMERA STREAM'}
                          </div>
                        </div>
                        <div className="glass" style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px' }}>System Status</div>
                          <div style={{ color: '#22c55e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                            <Radio size={14} className="pulse-anim" /> ONLINE
                          </div>
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
                  </>
                )}
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
                  <button onClick={() => {
                    isFakeCrashRef.current = true;
                    triggerImpact();
                  }} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
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
        @keyframes loading-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .loading-bar-fill {
           animation: loading-progress 2s infinite linear;
        }
        .fadeIn {
           animation: fadeIn 0.5s ease forwards;
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
        @media (max-width: 768px) {
          .sentinel-grid {
            grid-template-columns: 1fr !important;
          }
          .main-display {
            min-height: 400px !important;
          }
          .hud-overlay {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
