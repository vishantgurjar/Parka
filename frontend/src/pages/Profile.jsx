import { useContext, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Car, ShieldCheck, MapPin, Award, FileText, Calendar, Zap, X, ShoppingBag, CheckCircle, AlertCircle, Copy, Check, Gift, Sparkles, Wrench } from 'lucide-react';
import SEO from '../components/SEO';
import EmergencySticker from '../components/EmergencySticker';
import { toPng } from 'html-to-image';
import { getBackendUrl } from '../utils/api';
import { INDIAN_CAR_BRANDS, VEHICLE_YEARS, VEHICLE_COLORS } from '../utils/vehicleData';

export default function Profile() {
  const { user, login } = useContext(AuthContext);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [isSecondaryCardModalOpen, setIsSecondaryCardModalOpen] = useState(false);
  const [selectedVehicleForCard, setSelectedVehicleForCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ make: '', customMake: '', model: '', customModel: '', year: '', color: '', customColor: '', plateNumber: '' });
  const secondaryQrRef = useRef(null);

  const downloadSecondaryQR = async () => {
    if (!secondaryQrRef.current) return;
    
    const originalCard = secondaryQrRef.current.querySelector('.emergency-sticker-card') || secondaryQrRef.current;
    const clonedCard = originalCard.cloneNode(true);
    
    try {
      const name = selectedVehicleForCard?.plateNumber?.replace(/\s+/g, '-') || 'secondary-card';
      clonedCard.classList.add('is-downloading-sticker');
      document.body.appendChild(clonedCard);
      
      await new Promise(r => setTimeout(r, 500));

      const options = {
        width: 360,
        height: 560,
        pixelRatio: 4, 
        backgroundColor: '#030712',
        style: {
          transform: 'none',
          margin: '0',
          padding: '0',
          width: '360px',
          height: '560px'
        }
      };

      const dataUrl = await toPng(clonedCard, options);
      
      if (isIOSDevice()) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `parxee-city-${name}.png`, { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Parxéé City ID Card`,
              text: `My Parxéé City Smart QR Card`
            });
            toast.success("Share sheet opened!");
          } else {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `parxee-city-${name}.png`;
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
          }
        } catch (downloadErr) {
          console.warn("iOS sharing/download failed:", downloadErr);
        }
      } else {
        const link = document.createElement('a');
        link.download = `parxee-city-${name}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Final Download Error:', err);
      toast.error("Mobile render failed. Please use a screenshot if this continues.");
    } finally {
      if (document.body.contains(clonedCard)) {
        document.body.removeChild(clonedCard);
      }
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const finalMake = newVehicle.make === 'Other Brand' ? (newVehicle.customMake || 'Other') : newVehicle.make;
    const finalModel = newVehicle.model === 'Other' ? (newVehicle.customModel || 'Other') : newVehicle.model;
    const finalColor = newVehicle.color === 'Other Color' ? (newVehicle.customColor || 'Other') : newVehicle.color;

    if (!newVehicle.plateNumber || !finalMake || !finalModel || !newVehicle.year || !finalColor) {
      return toast.error("Please fill in all vehicle details.");
    }
    setIsLoading(true);
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/user/add-secondary-vehicle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user._id || user.id, 
          plateNumber: newVehicle.plateNumber.toUpperCase(),
          make: finalMake,
          model: finalModel,
          year: newVehicle.year,
          color: finalColor
        })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, localStorage.getItem('parkeToken'));
        toast.success("Secondary vehicle added successfully!");
        setIsAddVehicleModalOpen(false);
        setNewVehicle({ make: '', customMake: '', model: '', customModel: '', year: '', color: '', customColor: '', plateNumber: '' });
      } else {
        toast.error(data.message || 'Failed to add vehicle.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error adding vehicle.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVehicle = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to remove this vehicle?")) return;
    setIsLoading(true);
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/user/remove-secondary-vehicle/${vehicleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id || user.id })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, localStorage.getItem('parkeToken'));
        toast.success("Secondary vehicle removed successfully!");
      } else {
        toast.error(data.message || 'Failed to remove vehicle.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error removing vehicle.');
    } finally {
      setIsLoading(false);
    }
  };

  const tier = user.subscriptionTier?.toLowerCase() || 'free';
  let totalLimit = 1;
  if (tier === 'gold' || tier === 'gold pro') totalLimit = 3;
  if (tier === 'diamond' || tier === 'pro') totalLimit = 5;

  const currentCount = 1 + (user.secondaryVehicles ? user.secondaryVehicles.length : 0);
  const canAddMore = currentCount < totalLimit;

  const isIOSDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  };



  // Form State for Documents
  const [docData, setDocData] = useState({
    rcNumber: user?.rcNumber || '',
    rcExpiryDate: user?.rcExpiryDate || '',
    licenseNumber: user?.licenseNumber || '',
    licenseExpiryDate: user?.licenseExpiryDate || '',
    name: user?.name || '',
    plateNumber: user?.plateNumber || '',
    make: user?.make || '',
    model: user?.model || '',
    year: user?.year || '',
    color: user?.color || '',
    emergencyContact: user?.emergencyContact || ''
  });

  if (!user) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 className="section-title">Please login to view your profile.</h2>
      </div>
    );
  }

  const handleDocChange = (e) => {
    setDocData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateDocuments = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/user/update-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, ...docData })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, localStorage.getItem('parkeToken'));
        setIsDocsModalOpen(false);
        toast.success('Documents updated successfully! Verification status will be updated shortly.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating documents.');
    } finally {
      setIsLoading(false);
    }
  };


  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [redeemedVoucher, setRedeemedVoucher] = useState(null);

  const perks = [
    { id: 1, name: 'Highway Mechanic SOS Discount', category: 'Mechanic', discount: '₹150 OFF', description: 'Instant ₹150 discount on breakdown & puncture assistance.', cost: 100, icon: <Wrench size={20} color="#eab308" /> },
    { id: 2, name: 'P2P EV Charger Slot Voucher', category: 'EV Charging', discount: '1 Free Hour', description: '1 Free 5kWh session at any verified host EV charger.', cost: 120, icon: <Zap size={20} color="#2dd4bf" /> },
    { id: 3, name: 'Reserved Parking Spot Pass', category: 'Parking', discount: '25% OFF', description: 'Save 25% on your next reserved driveway booking.', cost: 80, icon: <MapPin size={20} color="#818cf8" /> },
    { id: 4, name: 'Priority Smart QR Replacement', category: 'Smart Tag', discount: 'Free Dispatch', description: 'Free replacement sticker delivered with priority dispatch.', cost: 150, icon: <ShieldCheck size={20} color="#10b981" /> }
  ];

  const redeemPerk = async (perk) => {
    if ((user.parxeePoints || 0) < perk.cost) {
      toast.error(`You need ${perk.cost} Parxéé Points to unlock this perk.`);
      return;
    }
    setIsLoading(true);
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/user/redeem-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id || user.id,
          pointsToDeduct: perk.cost,
          perkName: perk.name,
          category: perk.category || 'Voucher',
          discount: perk.discount || 'Special'
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setRedeemedVoucher({ code: data.couponCode, title: perk.name });
        login(data.user, localStorage.getItem('parkeToken'));
      } else {
        toast.error(data.message || 'Failed to redeem reward.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error during reward redemption.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success("Coupon code copied to clipboard! 📋");
    setTimeout(() => setCopiedCoupon(''), 3000);
  };

  // Dynamic Safety Score calculation
  let computedScore = 78;
  if (user.smartTagId) computedScore += 8;
  if (user.phone) computedScore += 4;
  if (user.rcNumber) computedScore += 5;
  if (user.emergencyContact) computedScore += 5;
  const safetyScore = user.safetyScore || computedScore;

  const tierColor = user.subscriptionTier === 'diamond' ? '#818cf8' : (user.subscriptionTier === 'gold' ? '#eab308' : '#38bdf8');
  const isVerified = user.rcNumber && user.licenseNumber;

  return (
    <>
      <SEO title={`${user.name} - Profile | Parxéé City`} />
      
      <div className="profile-page" style={{ padding: '100px 0 60px', background: 'var(--bg)', minHeight: '90vh' }}>
        <div className="container">
          
          <div className="section-header" style={{ marginBottom: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="emergency-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', marginBottom: '1.5rem' }}>
              <User size={14} /> ACCOUNT OVERVIEW
            </div>
            <h2 className="section-title">Your Premium <span className="text-gradient">Profile</span></h2>
          </div>

          {/* ======================================================== */}
          {/* CITY SAFETY SCORE & GAMIFIED REWARDS HUB */}
          {/* ======================================================== */}
          <div className="glass-card bento-item light-sweep" style={{
            padding: '2rem',
            marginBottom: '35px',
            borderRadius: '24px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(3, 7, 18, 0.7) 100%)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.4), 0 0 25px rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1fr 1.6fr', gap: '2rem', alignItems: 'center' }}>
              
              {/* Circular Animated Score Gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#10b981', letterSpacing: '1.5px', marginBottom: '10px' }}>
                  City Safety Score
                </span>

                <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke="url(#safetyScoreGrad)" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - (safetyScore / 100))}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      style={{
                        transition: 'stroke-dashoffset 1s ease-in-out',
                        filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))'
                      }}
                    />
                    <defs>
                      <linearGradient id="safetyScoreGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2dd4bf" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <strong style={{ fontSize: '2.4rem', color: '#fff', display: 'block', lineHeight: 1, letterSpacing: '-1px' }}>
                      {safetyScore}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold' }}>/ 100</span>
                  </div>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '10px' }}>
                  <ShieldCheck size={14} /> Elite Urban Guardian
                </div>
              </div>

              {/* Badges, Points & Rewards Callout */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff', margin: 0 }}>Urban Safety Badges</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Earned by safe parking, verified QR tag, and community protection</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 14px', borderRadius: '12px' }}>
                    <Award size={18} color="#38bdf8" />
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#38bdf8' }}>{user.parxeePoints || 0} pts</span>
                  </div>
                </div>

                {/* 4 Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
                  {[
                    { title: 'Verified Citizen', icon: '🛡️', color: '#10b981', desc: 'ID verified' },
                    { title: 'Smart Parker', icon: '🚗', color: '#38bdf8', desc: 'Zero violations' },
                    { title: 'EV Pioneer', icon: '⚡', color: '#2dd4bf', desc: 'Clean transit' },
                    { title: 'SOS Guardian', icon: '🤝', color: '#f59e0b', desc: 'Community hero' }
                  ].map((badge, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{badge.icon}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{badge.title}</div>
                      <div style={{ fontSize: '0.65rem', color: badge.color, fontWeight: 'bold' }}>{badge.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Actions & Redeem Button */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setRedeemedVoucher(null); setIsRedeemModalOpen(true); }}
                    className="btn-gradient light-sweep"
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      border: 'none',
                      color: '#000',
                      background: 'linear-gradient(135deg, #10b981 0%, #2dd4bf 100%)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Gift size={16} /> Redeem Discount Perks
                  </button>
                  {user.redeemedPerks && user.redeemedPerks.length > 0 && (
                    <button
                      onClick={() => { setRedeemedVoucher(null); setIsRedeemModalOpen(true); }}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      🎫 My Vouchers ({user.redeemedPerks.length})
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="form-grid form-grid-2" style={{ gap: '30px', alignItems: 'start' }}>
            
            {/* CARD 1: PERSONAL IDENTITY (Carbon Fiber Style) */}
            <div className="hybrid-card" style={{ width: '100%', height: 'auto', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
              <div className="carbon-section" style={{ height: '80px' }}>
                <div className="hybrid-brand">
                  <div className="logo-icon" style={{ background: tierColor, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#fff' }}>
                    <User size={24} />
                  </div>
                  <span>PERSONAL IDENTITY</span>
                </div>
                <div className={`tier-badge tier-badge-${user.subscriptionTier?.toLowerCase()}`} style={{ padding: '6px 16px', borderRadius: '50px', fontWeight: '900', fontSize: '0.8rem', background: tierColor, color: '#fff' }}>
                  {user.subscriptionTier?.toUpperCase() || 'FREE'}
                </div>
              </div>

              <div className="glass-section" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
                <div className="hybrid-info">
                  <div className="hybrid-info-group">
                    <span className="hybrid-label">FULL NAME</span>
                    <span className="hybrid-value" style={{ fontSize: '1.8rem' }}>{user.name}</span>
                  </div>
                </div>

                <div className="form-grid form-grid-2" style={{ width: '100%', gap: '20px' }}>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label"><Mail size={10} style={{ marginRight: '4px' }} /> EMAIL ADDRESS</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem', textTransform: 'none' }}>{user.email}</span>
                  </div>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label"><Phone size={10} style={{ marginRight: '4px' }} /> CONTACT NUMBER</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.phone || 'Not Provided'}</span>
                  </div>
                </div>
                
                <div className="hybrid-info-group" style={{ width: '100%' }}>
                  <span className="hybrid-label"><MapPin size={10} style={{ marginRight: '4px' }} /> REGISTERED ADDRESS</span>
                  <span className="hybrid-value" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {user.address ? `${user.address}, ${user.city}, ${user.state} ${user.zipCode}` : 'Address not yet updated in system'}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: VEHICLE IDENTITY (Sapphire Glass Style) */}
            <div className="hybrid-card" style={{ width: '100%', height: 'auto', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
              <div className="carbon-section" style={{ height: '80px', borderBottomColor: '#818cf8', boxShadow: '0 4px 15px rgba(129, 140, 248, 0.2)' }}>
                <div className="hybrid-brand">
                  <Car size={24} color="#818cf8" />
                  <span style={{ textShadow: '0 0 10px rgba(129, 140, 248, 0.3)' }}>VEHICLE IDENTITY</span>
                </div>
                <div className="hybrid-chip" style={{ background: 'linear-gradient(135deg, #818cf8 0%, #3730a3 100%)' }}></div>
              </div>

              <div className="glass-section" style={{ background: 'rgba(129, 140, 248, 0.05)', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
                <div className="hybrid-info">
                  <div className="hybrid-info-group">
                    <span className="hybrid-label" style={{ color: '#818cf8' }}>REGISTRATION PLATE</span>
                    <span className="hybrid-helpline" style={{ color: '#fff', fontSize: '2.2rem', textShadow: '0 0 15px rgba(129, 140, 248, 0.5)' }}>
                      {user.plateNumber || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="form-grid form-grid-3" style={{ width: '100%', gap: '20px' }}>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label" style={{ color: '#818cf8' }}>MAKE</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.make || 'N/A'}</span>
                  </div>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label" style={{ color: '#818cf8' }}>MODEL</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.model || 'N/A'}</span>
                  </div>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label" style={{ color: '#818cf8' }}>YEAR</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.year || 'N/A'}</span>
                  </div>
                </div>

                <div className="hybrid-info-group">
                  <span className="hybrid-label" style={{ color: '#818cf8' }}>VEHICLE COLOR</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: user.color || '#ccc', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.color || 'STREAK'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SECONDARY VEHICLES SECTION */}
          {(user.subscriptionTier?.toLowerCase() === 'gold' || user.subscriptionTier?.toLowerCase() === 'gold pro' || user.subscriptionTier?.toLowerCase() === 'diamond' || user.subscriptionTier?.toLowerCase() === 'pro') && (
            <div className="glass-card" style={{ marginTop: '30px', padding: '28px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Car size={24} /> Secondary Vehicles ({currentCount}/{totalLimit})
                </h3>
                {canAddMore ? (
                  <button 
                    onClick={() => setIsAddVehicleModalOpen(true)}
                    className="btn-gradient light-sweep"
                    style={{ padding: '8px 20px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}
                  >
                    + Add Vehicle
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '50px' }}>
                    Plan limit reached ({totalLimit} max)
                  </span>
                )}
              </div>

              {user.secondaryVehicles && user.secondaryVehicles.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {user.secondaryVehicles.map((veh, idx) => (
                    <div key={veh._id} className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button 
                        onClick={() => handleRemoveVehicle(veh._id)}
                        style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Remove vehicle"
                      >
                        <X size={14} />
                      </button>

                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '900', letterSpacing: '1px' }}>SECONDARY VEHICLE</span>
                      <h4 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff', margin: '4px 0' }}>{veh.plateNumber}</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', marginBottom: '10px' }}>
                        <div>
                          <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.65rem', fontWeight: 'bold' }}>MAKE/BRAND</span>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{veh.make}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.65rem', fontWeight: 'bold' }}>MODEL</span>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{veh.model}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.65rem', fontWeight: 'bold' }}>YEAR</span>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{veh.year}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.65rem', fontWeight: 'bold' }}>COLOR</span>
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{veh.color}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedVehicleForCard(veh);
                          setIsSecondaryCardModalOpen(true);
                        }}
                        className="btn-gradient light-sweep" 
                        style={{ padding: '10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold', border: 'none', color: '#000', cursor: 'pointer' }}
                      >
                        🎫 Generate Card
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)' }}>
                  <p style={{ fontSize: '0.9rem' }}>No secondary vehicles added to this profile yet.</p>
                </div>
              )}
            </div>
          )}

          {(!user.subscriptionTier || user.subscriptionTier?.toLowerCase() === 'free' || user.subscriptionTier?.toLowerCase() === 'silver') && (
            <div className="glass-card" style={{ marginTop: '30px', padding: '28px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>Want to protect more vehicles?</h4>
                <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--muted)' }}>Upgrade to **Gold PRO** (up to 3 vehicles) or **Diamond** (up to 5 vehicles) to manage all your cars in one account.</p>
              </div>
              <Link to="/#pricing" className="btn-gradient light-sweep" style={{ padding: '10px 24px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                Upgrade Plan
              </Link>
            </div>
          )}

          <div className="form-grid form-grid-3" style={{ marginTop: '30px', gap: '20px' }}>
            
            {/* STAT CARD 1: REWARDS */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.1)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Award size={24} />
              </div>
              <p className="hybrid-label">PARXÉÉ POINTS</p>
              <h3 className="text-gradient" style={{ fontSize: '2rem', margin: '8px 0' }}>{user.parxeePoints || 0}</h3>
              <button 
                onClick={() => setIsRedeemModalOpen(true)}
                className="btn-gradient" 
                style={{ padding: '8px 20px', borderRadius: '50px', fontSize: '0.8rem', marginTop: '10px', width: '100%', border: 'none' }}
              >
                Redeem Store
              </button>
            </div>

            {/* STAT CARD 2: DOCS STATUS */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: `1px solid ${isVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)'}` }}>
              <div style={{ width: '48px', height: '48px', background: isVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: isVerified ? '#22c55e' : '#eab308', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FileText size={24} />
              </div>
              <p className="hybrid-label" style={{ color: isVerified ? '#22c55e' : '#eab308' }}>DIGITAL DOCUMENTS</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '12px' }}>
                <div title="RC Status" style={{ color: user.rcNumber ? '#22c55e' : '#f43f5e' }}><Zap size={16} /></div>
                <div title="License Status" style={{ color: user.licenseNumber ? '#22c55e' : '#f43f5e' }}><ShieldCheck size={16} /></div>
              </div>
              <button 
                onClick={() => setIsDocsModalOpen(true)}
                className="btn-secondary" 
                style={{ padding: '8px 20px', borderRadius: '50px', fontSize: '0.8rem', marginTop: '15px', width: '100%' }}
              >
                Manage Docs
              </button>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '12px', fontWeight: 'bold' }}>
                Security Audit: {isVerified ? 'VERIFIED' : 'INCOMPLETE'}
              </p>
            </div>

            {/* STAT CARD 3: SECURITY CAM MODE */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ShieldCheck size={24} />
              </div>
              <p className="hybrid-label" style={{ color: '#f43f5e' }}>CAM MODE</p>
              <h3 style={{ fontSize: '1.2rem', color: '#f43f5e', margin: '8px 0', fontWeight: 'bold' }}>ACTIVE 🛡️</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>24/7 AI-Protection Enabled</p>
            </div>

          </div>


          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              *Member since: {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>

        </div>
      </div>

      {/* --- MODALS --- */}

      {/* REDEEM STORE & VOUCHERS MODAL */}
      {isRedeemModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '0', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
                <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <Gift size={22} color="#10b981" /> Safety Rewards Store
                    </h3>
                    <button onClick={() => setIsRedeemModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                </div>
                
                <div style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
                    
                    {/* Points Balance Banner */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '14px', borderRadius: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Available Parxéé Points</span>
                          <h4 style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: '900', margin: 0 }}>{user.parxeePoints || 0}</h4>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 12px', borderRadius: '50px', fontWeight: 'bold' }}>
                          Score: {safetyScore}/100 🛡️
                        </span>
                    </div>

                    {/* Recently Claimed Voucher Celebration */}
                    {redeemedVoucher && (
                      <div className="fadeIn" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '2px dashed #10b981', borderRadius: '16px', padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
                        <Sparkles size={24} color="#10b981" style={{ margin: '0 auto 6px' }} />
                        <h4 style={{ fontSize: '1rem', color: '#fff', margin: '0 0 4px 0', fontWeight: 'bold' }}>🎉 Coupon Unlocked: {redeemedVoucher.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                          <code style={{ background: '#000', padding: '6px 14px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981', letterSpacing: '1px' }}>
                            {redeemedVoucher.code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(redeemedVoucher.code)}
                            style={{ padding: '8px 12px', borderRadius: '8px', background: '#10b981', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}
                          >
                            {copiedCoupon === redeemedVoucher.code ? <Check size={14} /> : <Copy size={14} />}
                            {copiedCoupon === redeemedVoucher.code ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Perks List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '1px' }}>
                          Available Perks To Unlock
                        </span>
                        {perks.map(perk => {
                          const canAfford = (user.parxeePoints || 0) >= perk.cost;
                          return (
                            <div key={perk.id} className="glass" style={{ padding: '16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      {perk.icon}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <p style={{ fontWeight: 'bold', fontSize: '0.9rem', margin: 0, color: '#fff' }}>{perk.name}</p>
                                          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '800' }}>{perk.discount}</span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>{perk.description}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => redeemPerk(perk)}
                                    disabled={isLoading || !canAfford}
                                    style={{ 
                                      padding: '8px 16px', 
                                      borderRadius: '50px', 
                                      border: 'none', 
                                      background: canAfford ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.06)', 
                                      color: canAfford ? '#fff' : 'rgba(255,255,255,0.4)', 
                                      fontSize: '0.8rem', 
                                      fontWeight: '800', 
                                      cursor: canAfford ? 'pointer' : 'not-allowed',
                                      flexShrink: 0 
                                    }}
                                >
                                    {perk.cost} P
                                </button>
                            </div>
                          );
                        })}
                    </div>

                    {/* Active Vouchers List */}
                    {user.redeemedPerks && user.redeemedPerks.length > 0 && (
                      <div style={{ marginTop: '25px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>
                          Your Active Vouchers ({user.redeemedPerks.length})
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {user.redeemedPerks.map((voucher, vIdx) => (
                            <div key={vIdx} style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{voucher.title}</div>
                                <code style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>{voucher.code}</code>
                              </div>
                              <button
                                onClick={() => handleCopyCode(voucher.code)}
                                style={{ background: 'transparent', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {copiedCoupon === voucher.code ? <Check size={12} /> : <Copy size={12} />}
                                {copiedCoupon === voucher.code ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                </div>
            </div>
        </div>
      )}

      {/* MANAGE DOCUMENTS MODAL */}
      {isDocsModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '95%', maxWidth: '600px', padding: '0', overflow: 'hidden', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(129, 140, 248, 0.3)' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} color="#818cf8" /> Manage Digital Vault
                    </h3>
                    <button onClick={() => setIsDocsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                </div>
                <form onSubmit={updateDocuments} style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '10px', background: 'rgba(129, 140, 248, 0.05)', borderRadius: '8px' }}>
                        <ShieldCheck size={18} color="#818cf8" />
                        <p style={{ fontSize: '0.8rem', color: '#818cf8' }}>Update your primary identity and vehicle details to sync with your QR Cards.</p>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>FULL NAME (ON CARD)</label>
                        <input type="text" name="name" value={docData.name} onChange={handleDocChange} placeholder="e.g. VISHANT PANWAR" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>

                    <div className="form-grid form-grid-2" style={{ gap: '20px' }}>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>VEHICLE PLATE NUMBER</label>
                           <input type="text" name="plateNumber" value={docData.plateNumber} onChange={handleDocChange} placeholder="e.g. UP16 AB 1234" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>VEHICLE COLOR</label>
                           <input type="text" name="color" value={docData.color} onChange={handleDocChange} placeholder="e.g. Sapphire Black" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '15px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>EMERGENCY CONTACT NUMBER</label>
                        <input type="tel" name="emergencyContact" value={docData.emergencyContact} onChange={handleDocChange} placeholder="e.g. 9876543210" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>

                    <div className="form-grid form-grid-3" style={{ gap: '15px', marginTop: '15px' }}>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>MAKE</label>
                           <input type="text" name="make" value={docData.make} onChange={handleDocChange} placeholder="e.g. Toyota" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>MODEL</label>
                           <input type="text" name="model" value={docData.model} onChange={handleDocChange} placeholder="e.g. Fortuner" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>YEAR</label>
                           <input type="text" name="year" value={docData.year} onChange={handleDocChange} placeholder="e.g. 2024" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                    </div>

                    <div className="separator" style={{ margin: '25px 0', opacity: 0.1 }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '10px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '8px' }}>
                        <FileText size={18} color="#22c55e" />
                        <p style={{ fontSize: '0.8rem', color: '#22c55e' }}>Digital verification documents for secondary security audit.</p>
                    </div>

                    <div className="form-grid form-grid-2" style={{ gap: '20px' }}>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>RC NUMBER</label>
                           <input type="text" name="rcNumber" value={docData.rcNumber} onChange={handleDocChange} placeholder="UPxx AA xxxx" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>RC EXPIRY</label>
                           <input type="date" name="rcExpiryDate" value={docData.rcExpiryDate} onChange={handleDocChange} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                    </div>

                    <div className="separator" style={{ margin: '20px 0' }}></div>

                    <div className="form-grid form-grid-2" style={{ gap: '20px' }}>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>LICENSE NUMBER</label>
                           <input type="text" name="licenseNumber" value={docData.licenseNumber} onChange={handleDocChange} placeholder="DLxxxxxxxxxxxx" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>LICENSE EXPIRY</label>
                           <input type="date" name="licenseExpiryDate" value={docData.licenseExpiryDate} onChange={handleDocChange} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                    </div>


                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn-gradient full-width" 
                        style={{ marginTop: '30px', padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none' }}
                    >
                        {isLoading ? 'Encrypting & Saving...' : 'Submit Documents for Verification'}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '15px' }}>
                        *Your data is encrypted using AES-256 for Parxéé Cam Mode Security.
                    </p>
                </form>
            </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {isAddVehicleModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '0', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <Car size={22} color="#10b981" /> Add Secondary Vehicle
                    </h3>
                    <button onClick={() => setIsAddVehicleModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                </div>
                <form onSubmit={handleAddVehicle} style={{ padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
                    
                    {/* PLATE NUMBER */}
                    <div className="form-group" style={{ marginBottom: '18px', textAlign: 'left' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px', color: '#10b981', marginBottom: '6px', display: 'block' }}>PLATE NUMBER</label>
                        <input 
                          type="text" 
                          placeholder="e.g. UP11VP0004 or DL 3C AB 1234" 
                          style={{ background: '#0d1527', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '10px', padding: '12px 14px', width: '100%', outline: 'none', fontSize: '0.95rem', fontWeight: '600', letterSpacing: '1px' }}
                          value={newVehicle.plateNumber}
                          onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value.toUpperCase() })}
                          required
                        />
                    </div>

                    {/* BRAND/MAKE & MODEL GRID */}
                    <div className="form-grid form-grid-2" style={{ gap: '15px', marginBottom: '18px' }}>
                        
                        {/* BRAND/MAKE DROPDOWN */}
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>BRAND/MAKE</label>
                            <select 
                              style={{ background: '#0d1527', border: '1px solid rgba(255,255,255,0.15)', color: newVehicle.make ? '#fff' : '#9ca3af', borderRadius: '10px', padding: '12px 10px', width: '100%', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
                              value={newVehicle.make}
                              onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value, model: '', customMake: '', customModel: '' })}
                              required
                            >
                              <option value="" disabled style={{ background: '#111827', color: '#9ca3af' }}>-- Select Brand --</option>
                              {Object.keys(INDIAN_CAR_BRANDS).map(brand => (
                                <option key={brand} value={brand} style={{ background: '#111827', color: '#fff' }}>
                                  {brand}
                                </option>
                              ))}
                            </select>
                            {newVehicle.make === 'Other Brand' && (
                              <input 
                                type="text"
                                placeholder="Type Brand Name..."
                                style={{ background: '#0d1527', border: '1px solid #10b981', color: '#fff', borderRadius: '8px', padding: '10px', width: '100%', marginTop: '8px', outline: 'none', fontSize: '0.85rem' }}
                                value={newVehicle.customMake}
                                onChange={(e) => setNewVehicle({ ...newVehicle, customMake: e.target.value })}
                                required
                              />
                            )}
                        </div>

                        {/* MODEL DROPDOWN (DEPENDENT ON BRAND) */}
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>MODEL</label>
                            <select 
                              style={{ background: '#0d1527', border: '1px solid rgba(255,255,255,0.15)', color: newVehicle.model ? '#fff' : '#9ca3af', borderRadius: '10px', padding: '12px 10px', width: '100%', outline: 'none', fontSize: '0.9rem', cursor: newVehicle.make ? 'pointer' : 'not-allowed' }}
                              value={newVehicle.model}
                              onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value, customModel: '' })}
                              disabled={!newVehicle.make}
                              required
                            >
                              <option value="" disabled style={{ background: '#111827', color: '#9ca3af' }}>
                                {newVehicle.make ? `-- Select ${newVehicle.make} Model --` : '-- Select Brand First --'}
                              </option>
                              {newVehicle.make && (INDIAN_CAR_BRANDS[newVehicle.make] || ["Other"]).map(model => (
                                <option key={model} value={model} style={{ background: '#111827', color: '#fff' }}>
                                  {model}
                                </option>
                              ))}
                            </select>
                            {newVehicle.model === 'Other' && (
                              <input 
                                type="text"
                                placeholder="Type Model Name..."
                                style={{ background: '#0d1527', border: '1px solid #10b981', color: '#fff', borderRadius: '8px', padding: '10px', width: '100%', marginTop: '8px', outline: 'none', fontSize: '0.85rem' }}
                                value={newVehicle.customModel}
                                onChange={(e) => setNewVehicle({ ...newVehicle, customModel: e.target.value })}
                                required
                              />
                            )}
                        </div>
                    </div>

                    {/* YEAR & COLOR GRID */}
                    <div className="form-grid form-grid-2" style={{ gap: '15px', marginBottom: '24px' }}>
                        
                        {/* YEAR DROPDOWN */}
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>YEAR</label>
                            <select 
                              style={{ background: '#0d1527', border: '1px solid rgba(255,255,255,0.15)', color: newVehicle.year ? '#fff' : '#9ca3af', borderRadius: '10px', padding: '12px 10px', width: '100%', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
                              value={newVehicle.year}
                              onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                              required
                            >
                              <option value="" disabled style={{ background: '#111827', color: '#9ca3af' }}>-- Select Year --</option>
                              {VEHICLE_YEARS.map(year => (
                                <option key={year} value={year} style={{ background: '#111827', color: '#fff' }}>
                                  {year}
                                </option>
                              ))}
                            </select>
                        </div>

                        {/* COLOR DROPDOWN */}
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>COLOR</label>
                            <select 
                              style={{ background: '#0d1527', border: '1px solid rgba(255,255,255,0.15)', color: newVehicle.color ? '#fff' : '#9ca3af', borderRadius: '10px', padding: '12px 10px', width: '100%', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
                              value={newVehicle.color}
                              onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value, customColor: '' })}
                              required
                            >
                              <option value="" disabled style={{ background: '#111827', color: '#9ca3af' }}>-- Select Color --</option>
                              {VEHICLE_COLORS.map(color => (
                                <option key={color} value={color} style={{ background: '#111827', color: '#fff' }}>
                                  {color}
                                </option>
                              ))}
                            </select>
                            {newVehicle.color === 'Other Color' && (
                              <input 
                                type="text"
                                placeholder="Type Custom Color..."
                                style={{ background: '#0d1527', border: '1px solid #10b981', color: '#fff', borderRadius: '8px', padding: '10px', width: '100%', marginTop: '8px', outline: 'none', fontSize: '0.85rem' }}
                                value={newVehicle.customColor}
                                onChange={(e) => setNewVehicle({ ...newVehicle, customColor: e.target.value })}
                                required
                              />
                            )}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn-gradient full-width" 
                        style={{ padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none', fontSize: '1rem', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                    >
                        {isLoading ? 'Adding Vehicle...' : 'Add Vehicle to Profile'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* SECONDARY CARD MODAL */}
      {isSecondaryCardModalOpen && selectedVehicleForCard && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '95%', maxWidth: '450px', padding: '0', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(129, 140, 248, 0.3)' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>🎫</span> Virtual Card Generator
                    </h3>
                    <button onClick={() => setIsSecondaryCardModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '12px' }}>
                      STICKER ID: {user.smartTagId}-S{user.secondaryVehicles.indexOf(selectedVehicleForCard) + 1}
                    </span>

                    <div style={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      padding: '10px 0',
                      overflow: 'visible'
                    }}>
                      <div ref={secondaryQrRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <EmergencySticker 
                          user={{ ...user, plateNumber: selectedVehicleForCard.plateNumber }} 
                          qrUrl={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '/v/' + user.smartTagId + '-S' + (user.secondaryVehicles.indexOf(selectedVehicleForCard) + 1))}`} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
                      <button 
                        onClick={downloadSecondaryQR} 
                        className="btn-gradient light-sweep" 
                        style={{ padding: '12px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', border: 'none', color: '#000', cursor: 'pointer', flex: 1, textAlign: 'center' }}
                      >
                        Download Card
                      </button>
                      <a 
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(window.location.origin + '/v/' + user.smartTagId + '-S' + (user.secondaryVehicles.indexOf(selectedVehicleForCard) + 1))}`}
                        download={`parxee_qr_${selectedVehicleForCard.plateNumber}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary" 
                        style={{ padding: '12px 20px', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', color: '#fff', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', flex: 1, textAlign: 'center' }}
                      >
                        Download QR Only
                      </a>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
