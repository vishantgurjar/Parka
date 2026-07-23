import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PhoneCall, AlertTriangle, User, Car, MapPin, ShieldCheck, Wrench, ChevronRight, Lock, Bell, Lightbulb, Info, Camera } from 'lucide-react';
import SEO from '../components/SEO';
import { getBackendUrl } from '../utils/api';
import SecureCallModal from '../components/SecureCallModal';
import { AuthContext } from '../App';
import { toast } from 'react-hot-toast';

export default function VehicleLandingPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSecureCall, setShowSecureCall] = useState(false);
  const [nearestMechanic, setNearestMechanic] = useState({ phone: '9112200000', name: 'Parxéé Admin' });
  const [reporting, setReporting] = useState(null);
  const { user: currentUser } = useContext(AuthContext);

  // Photo Capture states for Proof requirement
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedIssueLabel, setSelectedIssueLabel] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);


  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const baseUrl = getBackendUrl();
        const res = await fetch(`${baseUrl}/api/auth/vehicle/${id}`);
        const data = await res.json();
        
        if (res.ok) {
          setVehicle(data);

          // Request location to notify owner (PRO Feature logic is on backend)
          if (navigator.geolocation) {
            // Try high accuracy first
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                sendScanAlert(latitude, longitude, data.phone);
                fetchNearestMechanic(latitude, longitude);
              },
              (error) => {
                console.warn("High accuracy scan geolocation failed, trying low accuracy:", error);
                // Try low accuracy as fallback
                navigator.geolocation.getCurrentPosition(
                  (pos2) => {
                    const { latitude, longitude } = pos2.coords;
                    sendScanAlert(latitude, longitude, data.phone);
                    fetchNearestMechanic(latitude, longitude);
                  },
                  (error2) => {
                    console.log("Location denied or error:", error2);
                    sendScanAlert(null, null, data.phone);
                  },
                  { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
                );
              },
              { enableHighAccuracy: true, timeout: 3500, maximumAge: 60000 }
            );
          } else {
            sendScanAlert(null, null, data.phone);
          }

        } else {
          setError(data.message || 'Vehicle not found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const sendScanAlert = (lat, lng, ownerPhone) => {
      const baseUrl = getBackendUrl();
      
      // 1. Send scan notification to owner
      fetch(`${baseUrl}/api/alerts/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vehicleId: id, 
          ownerPhone: ownerPhone,
          lat, 
          lng 
        })
      }).catch(err => console.log('Alert skipped:', err));

      // 2. Log scan to history for analytics
      fetch(`${baseUrl}/api/stickers/log-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stickerId: id, 
          lat, 
          lng 
        })
      }).catch(err => console.log('Scan log skipped:', err));
    };

    const fetchNearestMechanic = async (lat, lng) => {
      try {
        const baseUrl = getBackendUrl();
        const res = await fetch(`${baseUrl}/api/mechanics/nearest?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          setNearestMechanic(data);
        }
      } catch (err) {
        console.log("Could not find nearest mechanic:", err);
      }
    };


    fetchVehicle();
  }, [id]);

  const triggerReportFlow = (issueType) => {
    setSelectedIssueLabel(issueType);
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    setShowPhotoModal(true);
  };

  const handleReportIssue = async () => {
    if (reporting || !photoFile) return;
    setIsUploadingPhoto(true);
    setReporting(selectedIssueLabel);
    
    try {
      // 1. Upload photo proof to Cloudinary
      const formData = new FormData();
      formData.append('file', photoFile);
      formData.append('upload_preset', 'parxee city');
      formData.append('resource_type', 'image');

      const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dosb2aa9f/image/upload', {
        method: 'POST',
        body: formData
      });

      if (!cloudRes.ok) {
        throw new Error("Failed to upload photo proof. Please try again.");
      }

      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      // 2. Submit report to backend
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/user/report-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: id,
          reporterId: currentUser?._id,
          issueType: selectedIssueLabel,
          imageUrl: imageUrl
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowPhotoModal(false);
      } else {
        toast.error(data.message || "Failed to notify owner.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error reporting issue. Check your connection.");
    } finally {
      setIsUploadingPhoto(false);
      setReporting(null);
    }
  };


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
        <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Scanning Security Grid...</div>
      </div>
    );
  }

  if (error || !vehicle || vehicle.isInactive) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#030712', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AlertTriangle size={44} color="#ef4444" />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff', fontWeight: '800' }}>
          Smart QR Code Deactivated
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '1rem', maxWidth: '420px', marginBottom: '2rem', lineHeight: '1.6' }}>
          {error || "This Smart QR Tag (ID: " + id + ") has not been activated yet or has been deactivated by admin."}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
          <Link 
            to={`/activate/${id}`} 
            className="btn-gradient light-sweep" 
            style={{ textDecoration: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', color: '#000' }}
          >
            ⚡ ACTIVATE STICKER NOW
          </Link>
          <Link 
            to="/" 
            style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', color: '#9ca3af', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', padding: '80px 1rem 40px' }}>
      <SEO 
        title="Secured Vehicle Profile - Parxéé City"
        description="Protected vehicle emergency contact portal. Contact the owner securely without exposing any personal contact info, names, or plate numbers."
      />
      
      <div className="container" style={{ maxWidth: '500px' }}>

        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--card-bg)', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)'
          }}>
            <Car size={40} className="text-gradient" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <span className="text-gradient">Vehicle Info</span>
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20, 184, 166, 0.1)', padding: '6px 12px', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}>
            <ShieldCheck size={16} />
            Verified Profile
          </div>
        </div>

        {/* Vehicle Details Card */}
        <div className="electric-border" style={{ marginBottom: '2rem' }}>
          <div className="glass-premium" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div className="shimmer-shimmer"></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
               <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Owner</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>🔒 SECURED OWNER</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Number</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                  🔒 SECURED BY PARXÉÉ
                </p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vehicle Plate</p>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>🔒 SECURED & HIDDEN</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vehicle Model</p>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>🔒 SECURED & HIDDEN</p>
              </div>
            </div>
            <div className="card-chip" style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.5 }}></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 1. Primary Action: Secure Privacy Call (IDENTITY HIDDEN) */}
          <button onClick={() => setShowSecureCall(true)} className="btn-gradient" style={{ 
            border: 'none',
            cursor: 'pointer',
            padding: '18px', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '1.2rem',
            fontWeight: '800',
            background: 'var(--gradient-primary)',
            color: '#fff',
            boxShadow: '0 10px 25px rgba(13, 148, 136, 0.4)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '14px' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem' }}>Secure Privacy Call</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '500' }}>IDENTITY HIDDEN • ENCRYPTED</div>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>


          
          {/* 3. Highway Emergency Help (Critical) */}
          <a href={`tel:${nearestMechanic.phone}`} style={{ 
            textDecoration: 'none', 
            padding: '20px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            border: 'none',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: '900',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
            animation: 'pulse-emergency 2s infinite'
          }}>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes pulse-emergency {
                0% { transform: scale(1); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4); }
                50% { transform: scale(1.02); box-shadow: 0 15px 45px rgba(239, 68, 68, 0.6); }
                100% { transform: scale(1); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4); }
              }
            `}} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px' }}>
                <AlertTriangle size={28} />
              </div>
              {nearestMechanic.name === 'Parxéé Admin' ? 'HIGHWAY HELP (24/7)' : `SOS: ${nearestMechanic.shopName || nearestMechanic.name}`}
            </div>
            <ChevronRight size={24} />
          </a>


          {/* 4. Find Mechanic */}
          <Link to="/mechanics" style={{ 
            textDecoration: 'none', 
            padding: '16px', 
            borderRadius: '20px', 
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'var(--fg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px', borderRadius: '12px' }}>
                <Wrench size={24} />
              </div>
              Nearby Assistance
            </div>
            <ChevronRight size={24} />
          </Link>

          {/* 5. Report Issue (Neighbor Rewards) */}
          <div className="glass-premium" style={{ marginTop: '1rem', padding: '1.5rem', borderRadius: '24px', border: '1px dashed var(--border)' }}>
             <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Bell size={18} /> Help the Owner
             </h3>
             <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                See something wrong? Notify {vehicle.name} instantly and earn <strong>50 Parxéé Points</strong>.
             </p>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'wrong_parking', label: 'Wrongly Parked', icon: AlertTriangle },
                  { id: 'lights_on', label: 'Lights are ON', icon: Lightbulb },
                  { id: 'window_open', label: 'Window Open', icon: Info },
                  { id: 'flat_tire', label: 'Flat Tire', icon: Wrench }
                ].map((item) => (
                  <button 
                    key={item.id}
                    disabled={reporting === item.id}
                    onClick={() => triggerReportFlow(item.label)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      color: 'var(--fg)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <item.icon size={14} color="var(--primary)" />
                    {reporting === item.label ? 'Notifying...' : item.label}
                  </button>
                ))}
             </div>
             
             {!currentUser && (
               <p style={{ marginTop: '12px', fontSize: '0.75rem', color: '#eab308', textAlign: 'center' }}>
                  Log in to earn points for helping!
               </p>
             )}
          </div>
        </div>

        {/* Footer Info */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <img src="/logo.png" alt="Parxéé City" style={{ width: '32px', height: '32px', borderRadius: '8px', marginBottom: '1rem', opacity: 0.8 }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            This vehicle is protected by <br/>
            <strong>Parxéé City Smart Parking Systems</strong>
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
              Register Your Vehicle →
            </Link>
          </div>
        </div>
      </div>

      {showSecureCall && (
        <SecureCallModal vehicleId={vehicle._id} onClose={() => setShowSecureCall(false)} />
      )}

      {showPhotoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(10px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}
        onClick={() => setShowPhotoModal(false)}
        >
          <div className="bento-item glass" style={{
            width: '100%', maxWidth: '420px', padding: '2rem', borderRadius: '28px',
            textAlign: 'center', position: 'relative', border: '1px solid rgba(20, 184, 166, 0.3)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(20,184,166,0.15)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowPhotoModal(false)}
              style={{ position: 'absolute', top: '16px', right: '20px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.25rem', opacity: 0.5, cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ width: '56px', height: '56px', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Camera size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Photo Proof Required</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Please take a live photo of the vehicle showing the issue <strong>[{selectedIssueLabel}]</strong> to prevent misuse and earn your 50 points.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              {photoPreviewUrl ? (
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={photoPreviewUrl} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                  <button 
                    onClick={() => { setPhotoFile(null); setPhotoPreviewUrl(''); }}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '2rem 1rem', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.1)',
                  cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <Camera size={32} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Click to Open Camera</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Take a live photo proof</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPhotoFile(file);
                        setPhotoPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    style={{ display: 'none' }} 
                  />
                </label>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                disabled={!photoFile || isUploadingPhoto}
                onClick={handleReportIssue}
                className="btn-gradient light-sweep" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--gradient-primary)', border: 'none', color: '#000', cursor: (!photoFile || isUploadingPhoto) ? 'not-allowed' : 'pointer', opacity: (!photoFile || isUploadingPhoto) ? 0.5 : 1 }}
              >
                {isUploadingPhoto ? 'Uploading Proof...' : '✔ Submit Report & Notify Owner'}
              </button>
              <button 
                disabled={isUploadingPhoto}
                onClick={() => setShowPhotoModal(false)}
                className="btn-secondary" 
                style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 'bold', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
