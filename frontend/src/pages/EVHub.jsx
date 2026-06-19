import React, { useState, useEffect, useContext, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SEO from '../components/SEO';
import { AuthContext } from '../App';
import { toast } from 'react-hot-toast';
import { 
  Zap, ShieldCheck, MapPin, User, CheckCircle, Navigation, 
  Clock, CreditCard, ChevronRight, BarChart3, AlertTriangle, 
  RefreshCcw, Mic, Activity, Volume2, Plus, Sparkles, ShieldAlert,
  Car, Eye, BatteryCharging
} from 'lucide-react';
import { getBackendUrl } from '../utils/api';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically center map on coords
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Force Leaflet to recalculate container bounds and redraw tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

// Component to dynamically set marker position on host selection map
function AddChargerMapMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });
  return position ? <Marker position={position} /> : null;
}

// Initial Mock EV Chargers
const INITIAL_CHARGERS = [
  {
    id: 1,
    host: "Sharma Ji 🔌",
    address: "Sector 62, Noida (Driveway Gate Area)",
    plugType: "CCS2 (7.4 kW AC)",
    speed: "7.4 kW",
    price: 15,
    timings: "2:00 PM - 6:00 PM",
    lat: 28.625,
    lng: 77.370,
    security: "Outer Gate / Driveway (No Home Entry)",
    kycVerified: true,
    rating: 4.9,
    reviews: 24,
    status: "Available"
  },
  {
    id: 2,
    host: "Kabir Malhotra",
    address: "GK-2 Main Road, New Delhi (Garage Entrance)",
    plugType: "Type 2 (22 kW AC)",
    speed: "22 kW",
    price: 18,
    timings: "9:00 AM - 4:00 PM",
    lat: 28.530,
    lng: 77.240,
    security: "Private Garage (CCTV Protected)",
    kycVerified: true,
    rating: 4.8,
    reviews: 18,
    status: "Available"
  },
  {
    id: 3,
    host: "Rajesh Kumar",
    address: "Golf Course Road, Gurugram (Front Yard Gate)",
    plugType: "CCS2 (11 kW AC)",
    speed: "11 kW",
    price: 14,
    timings: "12:00 PM - 8:00 PM",
    lat: 28.459,
    lng: 77.026,
    security: "Driveway Parking Only (CCTV Active)",
    kycVerified: true,
    rating: 4.7,
    reviews: 15,
    status: "Occupied"
  },
  {
    id: 4,
    host: "Siddharth Goel",
    address: "Vaishali Sector 4, Ghaziabad (Outside Outer Wall)",
    plugType: "CCS2 (15 kW AC Fast)",
    speed: "15 kW",
    price: 16,
    timings: "6:00 AM - 10:00 PM",
    lat: 28.643,
    lng: 77.345,
    security: "Outside Outer Wall (Roadside Parking)",
    kycVerified: true,
    rating: 4.9,
    reviews: 32,
    status: "Available"
  }
];

// EV Models Specs for Calculator
const EV_MODELS = [
  { name: "Tata Nexon EV Max", batteryKwh: 40.5, certifiedRange: 437, efficiency: 108 },
  { name: "Tata Punch EV", batteryKwh: 35.0, certifiedRange: 421, efficiency: 95 },
  { name: "MG ZS EV", batteryKwh: 50.3, certifiedRange: 461, efficiency: 120 },
  { name: "Ola S1 Pro (Scooter)", batteryKwh: 4.0, certifiedRange: 195, efficiency: 25 },
  { name: "BYD Atto 3", batteryKwh: 60.5, certifiedRange: 521, efficiency: 135 },
  { name: "Tesla Model Y RWD", batteryKwh: 60.0, certifiedRange: 455, efficiency: 140 },
  { name: "Hyundai Ioniq 5", batteryKwh: 72.6, certifiedRange: 631, efficiency: 145 }
];

export default function EVHub() {
  const { user, isPro } = useContext(AuthContext);
  
  // Subscription Protection Check
  if (!user || !isPro(user)) {
    return (
      <>
        <SEO title="Premium Feature - Parxéé EV Hub" description="Subscribe to unlock EV Hub." />
        <div className="bg-grain"></div>
        <div style={{ paddingTop: '120px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '5rem' }}>
          <div className="glass bento-item" style={{ maxWidth: '500px', width: '100%', padding: '3.5rem 2.5rem', textAlign: 'center', borderRadius: '32px', border: '1px solid rgba(45, 212, 191, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(45, 212, 191, 0.15)' }}>
            <div style={{ width: '70px', height: '70px', background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Zap size={36} style={{ fill: '#2dd4bf' }} />
            </div>
            
            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>
              Unlock EV Smart Hub
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#f43f5e', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              🔒 Subscribed Members Only
            </div>
            
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Bhai, EV Smart Hub access karne ke liye aapke paas active **Silver, Gold PRO, ya Diamond** membership honi chahiye. Upgrade karne par aapko live charger radar, safe P2P charger sharing, aur AI diagnostics access milega!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => window.location.href = '/#pricing'} 
                className="btn-gradient light-sweep" 
                style={{ padding: '15px', borderRadius: '12px', fontWeight: 'bold', background: 'var(--gradient-premium)', border: 'none', color: '#000' }}
              >
                Upgrade Plan Now (मेम्बरशिप लें)
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="btn-secondary" 
                style={{ padding: '12px', borderRadius: '12px', fontWeight: 'bold', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#fff' }}
              >
                Go Back Home
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('grid-share'); // 'grid-share', 'host-charger', 'wallet', 'sos', 'calculator', 'diagnostics'
  
  // Grid Share States
  const [chargers, setChargers] = useState(INITIAL_CHARGERS);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default: Delhi area
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [filterType, setFilterType] = useState('All'); // 'All', 'CCS2', 'Type 2', 'Fast'
  
  // Booking simulation states
  const [bookingHours, setBookingHours] = useState(2);
  const [bookingStep, setBookingStep] = useState('idle'); // 'idle', 'confirming', 'approving', 'success'
  const [secureOtp, setSecureOtp] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [activeRenterBooking, setActiveRenterBooking] = useState(null);
  const [activeHostBookings, setActiveHostBookings] = useState([]);
  const [isCharging, setIsCharging] = useState(false);
  const [chargePercent, setChargePercent] = useState(0);
  const [enteredOtp, setEnteredOtp] = useState('');
  
  // Host Charger Form States
  const [hostForm, setHostForm] = useState({
    hostName: user?.name || '',
    phone: '',
    address: '',
    plugType: 'CCS2 (7.4 kW AC)',
    speed: '7.4 kW',
    price: '15',
    timings: '9:00 AM - 6:00 PM',
    security: 'Outer Gate / Driveway (No Home Entry)'
  });

  // Dynamic coordinates for new host
  const [newHostCoords, setNewHostCoords] = useState([28.6139, 77.2090]);

  // Wallet stats
  const [walletTx, setWalletTx] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalUnitsShared, setTotalUnitsShared] = useState(0);

  // Geolocation detection on load
  useEffect(() => {
    if (navigator.geolocation) {
      // Try high accuracy first
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(coords);
          setNewHostCoords(coords);
        },
        (err) => {
          console.warn("High accuracy EV geolocation failed, trying low accuracy:", err);
          // Try low accuracy as fallback
          navigator.geolocation.getCurrentPosition(
            (pos2) => {
              const coords2 = [pos2.coords.latitude, pos2.coords.longitude];
              setMapCenter(coords2);
              setNewHostCoords(coords2);
            },
            (err2) => {
              console.log("Default coordinates set to New Delhi.", err2);
              if (!window.isSecureContext) {
                toast.error("GPS is blocked on insecure (HTTP) connections. Please use HTTPS or search manually!", { duration: 6000 });
              } else if (err2.code === err2.PERMISSION_DENIED) {
                toast.error("Location permission is blocked in your browser settings. Please search manually!", { duration: 6000 });
              } else {
                toast.error("GPS signal check failed. Showing Delhi area. Please search manually!", { duration: 4000 });
              }
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      toast.error("Location support is not available on your browser!");
    }
  }, []);

  const fetchChargers = async () => {
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/ev/chargers`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setChargers(data);
        } else {
          setChargers(INITIAL_CHARGERS);
        }
      } else {
        setChargers(INITIAL_CHARGERS);
      }
    } catch (err) {
      console.error("Failed to load chargers:", err);
      setChargers(INITIAL_CHARGERS);
    }
  };

  const fetchEarnings = async () => {
    if (!user) return;
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/ev/earnings/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance);
        setWalletTx(data.transactions || []);
        setTotalUnitsShared(data.totalUnits || 0);
      }
    } catch (err) {
      console.error("Failed to load earnings:", err);
    }
  };

  const fetchActiveBookings = async () => {
    if (!user) return;
    try {
      const baseUrl = getBackendUrl();
      const renterRes = await fetch(`${baseUrl}/api/ev/bookings/renter/active/${user._id}`);
      if (renterRes.ok) {
        const renterData = await renterRes.json();
        setActiveRenterBooking(renterData.booking);
        if (renterData.booking) {
          setSecureOtp(renterData.booking.otp || '');
        }
      }
      const hostRes = await fetch(`${baseUrl}/api/ev/bookings/host/active/${user._id}`);
      if (hostRes.ok) {
        const hostData = await hostRes.json();
        setActiveHostBookings(hostData.bookings || []);
      }
    } catch (err) {
      console.error("Failed to load active bookings:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'grid-share') {
      fetchChargers();
      fetchActiveBookings();
    } else if (activeTab === 'wallet') {
      fetchEarnings();
      fetchActiveBookings();
    }
  }, [activeTab]);

  // Text-To-Speech function for WhatsApp audio feel
  const speakVoice = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // hinges sound
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Charger Filtering logic
  const filteredChargers = chargers.filter(c => {
    if (filterType === 'All') return true;
    if (filterType === 'CCS2') return (c.plugType || '').includes('CCS2');
    if (filterType === 'Type 2') return (c.plugType || '').includes('Type 2');
    if (filterType === 'Fast') return parseFloat(c.speed || 0) >= 15;
    return true;
  });

  // Start Booking Flow
  const triggerBooking = (charger) => {
    if (!user) {
      toast.error("Please log in to book a charger slot!");
      return;
    }
    setSelectedCharger(charger);
    setBookingStep('confirming');
  };

  // Confirm and Send request to Host for verification check
  const confirmBookingRequest = async () => {
    setBookingStep('approving');
    speakVoice("Requesting host approval and checking driver credentials verification...");
    
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/ev/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chargerId: selectedCharger._id,
          userId: user._id,
          hours: Number(bookingHours)
        })
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.message || 'Failed to create order');

      if (orderData.isMock) {
        setCurrentOrder(orderData);
        setBookingStep('mock_payment_gateway');
        return;
      }

      // Real Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100,
        currency: 'INR',
        name: "Parxéé EV Grid",
        description: `Booking with host ${selectedCharger.host}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${baseUrl}/api/ev/verify-booking`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: orderData.bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setSecureOtp(verifyData.otp);
              setBookingStep('success');
              speakVoice(`Booking approved! Your secure charger OTP is ${verifyData.otp.replace('-', ' ')}`);
              toast.success("Payment verified successfully!");
              fetchChargers();
            } else {
              throw new Error(verifyData.message || 'Failed to verify payment');
            }
          } catch (err) {
            toast.error(err.message || 'Signature verification failed.');
            setBookingStep('idle');
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || ""
        },
        theme: { color: "#2dd4bf" }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      toast.error(err.message || "Could not complete booking request.");
      setBookingStep('idle');
    }
  };

  // Host Registration Form Submission
  const handleHostSubmit = async (e) => {
    e.preventDefault();
    if (!hostForm.address || !hostForm.phone || !hostForm.price) {
      toast.error("Please fill in all the fields correctly!");
      return;
    }

    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/ev/host`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: user._id,
          hostName: hostForm.hostName,
          phone: hostForm.phone,
          address: hostForm.address,
          plugType: hostForm.plugType,
          speed: hostForm.speed,
          price: parseFloat(hostForm.price),
          timings: hostForm.timings,
          security: hostForm.security,
          location: { lat: newHostCoords[0], lng: newHostCoords[1] }
        })
      });

      if (res.ok) {
        toast.success("Congratulations! Your charger is now active on the radar grid!");
        speakVoice("Your charger has been hosted successfully and is now active on the radar map!");
        setHostForm({
          hostName: user?.name || '',
          phone: '',
          address: '',
          plugType: 'CCS2 (7.4 kW AC)',
          speed: '7.4 kW',
          price: '15',
          timings: '9:00 AM - 6:00 PM',
          security: 'Outer Gate / Driveway (No Home Entry)'
        });
        setActiveTab('grid-share');
        fetchChargers();
      } else {
        toast.error("Failed to host charger.");
      }
    } catch (err) {
      toast.error("Network error hosting charger.");
    }
  };


  // --- EV EMERGENCY SOS VAN SIMULATION ---
  const [sosStatus, setSosStatus] = useState('idle'); // 'idle', 'searching', 'dispatched', 'arrived'
  const [sosProgress, setSosProgress] = useState(0);
  const [sosMarkerCoords, setSosMarkerCoords] = useState(null);

  const startSosSimulation = () => {
    setSosStatus('searching');
    setSosProgress(0);
    speakVoice("Locating the nearest Parxéé highway charging rescue unit...");
    
    // Step 1: Searching for rescue van
    setTimeout(() => {
      setSosStatus('dispatched');
      speakVoice("Rescuer unit dispatched! Tracking coordinates and ETA is 12 minutes.");
      toast.success("SOS Rescuer Unit Dispatched!");
      
      // Place rescue van close by user map coordinates
      const startLat = mapCenter[0] + 0.02;
      const startLng = mapCenter[1] + 0.02;
      setSosMarkerCoords([startLat, startLng]);
      
      // Step 2: Animate Van heading closer to the center
      let prg = 0;
      const interval = setInterval(() => {
        prg += 5;
        setSosProgress(prg);
        
        // Move marker closer linearly
        setSosMarkerCoords(prev => {
          if (!prev) return null;
          const diffLat = (mapCenter[0] - startLat) * (prg / 100);
          const diffLng = (mapCenter[1] - startLng) * (prg / 100);
          return [startLat + diffLat, startLng + diffLng];
        });

        if (prg >= 100) {
          clearInterval(interval);
          setSosStatus('arrived');
          speakVoice("Rescue unit arrived at your coordinates. Ready to charge!");
        }
      }, 500); // Speed simulation
    }, 3000);
  };


  // --- CALCULATOR STATE & LOGIC ---
  const [calcModel, setCalcModel] = useState(EV_MODELS[0]);
  const [calcSoc, setCalcSoc] = useState(80);
  const [calcSpeed, setCalcSpeed] = useState(80);
  const [calcAc, setCalcAc] = useState(true);
  const [calcTemp, setCalcTemp] = useState('Normal'); // 'Cold', 'Normal', 'Hot'
  const [calcEco, setCalcEco] = useState(false);

  // Dynamic range math logic
  const calculateOutput = () => {
    const baseRange = (calcModel.certifiedRange * calcSoc) / 100;
    
    // Efficiency factors
    let speedFactor = 1;
    if (calcSpeed > 100) speedFactor = 0.82; // High drag drains faster
    else if (calcSpeed > 80) speedFactor = 0.92;
    else if (calcSpeed < 50) speedFactor = 0.95; // Stop-and-go losses

    let acPenalty = calcAc ? 0.90 : 1.0; // AC drains ~10% range
    
    let tempFactor = 1;
    if (calcTemp === 'Cold') tempFactor = 0.85; // Battery chemicals slow in cold
    else if (calcTemp === 'Hot') tempFactor = 0.94; // Thermal management pump overheads

    let ecoBonus = calcEco ? 1.08 : 1.0; // Eco driving regenerates more energy

    const estimatedRange = Math.round(baseRange * speedFactor * acPenalty * tempFactor * ecoBonus);
    
    // Charger times logic (assuming full charge needed to 80% based on remaining capacity)
    const capacityNeededKwh = (calcModel.batteryKwh * (80 - calcSoc)) / 100;
    
    let timeSlow = "0h 0m";
    let timeFast = "0h 0m";

    if (capacityNeededKwh > 0) {
      // Slow AC (7.2 kW)
      const hrSlow = capacityNeededKwh / 7.2;
      const minSlow = Math.round((hrSlow % 1) * 60);
      timeSlow = `${Math.floor(hrSlow)}h ${minSlow}m`;

      // Fast DC (50 kW)
      const hrFast = capacityNeededKwh / 50;
      const minFast = Math.round((hrFast % 1) * 60);
      timeFast = `${Math.floor(hrFast)}h ${minFast}m`;
    }

    return { estimatedRange, timeSlow, timeFast };
  };

  const { estimatedRange, timeSlow, timeFast } = calculateOutput();


  // --- AI DIAGNOSTICS LOGIC ---
  const [diagStatus, setDiagStatus] = useState('idle'); // 'idle', 'uploading', 'analyzing', 'success'
  const [diagReport, setDiagReport] = useState(null);
  const [diagSymptom, setDiagSymptom] = useState('');
  const [diagImage, setDiagImage] = useState(null);
  const fileRef = useRef(null);

  const mockDiagnostics = (symptom) => {
    const sym = symptom.toLowerCase();
    
    // Fallback: Reject ICE vehicle queries if requested on EV tab
    const iceTerms = ['spark', 'plug', 'radiator', 'exhaust', 'silencer', 'clutch', 'belt', 'diesel', 'petrol', 'cng', 'engine oil', 'tappet', 'carburetor', 'misfire', 'combustion', 'piston'];
    if (iceTerms.some(term => sym.includes(term))) {
      return {
        issue: "ICE Vehicle Query Detected",
        dangerLevel: "LOW",
        details: "Bhaiya, ye EV Diagnostics console hai aur aapki query ICE (Petrol/Diesel/CNG) gaadi se related lag rahi hai. Please 'AI Engine Sound Doctor' page par jaakar ise check karein. EV Hub me sirf EV ki battery, electric motor, regenerative braking aur EV console alerts diagnose hote hain.",
        action: "AI Engine Sound Doctor page open karein aur wahan input karein.",
        estimatedCost: "₹0",
        suggestedMechanic: "N/A",
        confidence: 100
      };
    }

    if (sym.includes('temp') || sym.includes('overheat') || sym.includes('garam')) {
      return {
        issue: "EV Battery Core Thermal Spike",
        dangerLevel: "CRITICAL",
        details: "Bhaiya, aapki car ki battery cell temp 55°C hit kar chuki hai. Cooling fluid line check karo aur immediate parking me lagake cabin switch off karo.",
        action: "Gaadi shade area me rokein aur AC shut down karein. 15 minutes rest ke baad cooling system restart karein.",
        estimatedCost: "₹4,000 - ₹12,000 (Fluid Flush / Sensor repair)",
        suggestedMechanic: "EV Electrical Specialist",
        confidence: 94
      };
    } else if (sym.includes('regen') || sym.includes('brake') || sym.includes('jam')) {
      return {
        issue: "Regenerative Braking Limiter Fault",
        dangerLevel: "MEDIUM",
        details: "Regen braking recovery system fail lag raha hai. Battery high voltage bypass block switch fail hone ki wajah se energy recharge block ho rahi hai.",
        action: "Normal hydraulic brakes normal kaam karenge par speed restrict rakhein. High speed se bachein.",
        estimatedCost: "₹2,500 - ₹6,500",
        suggestedMechanic: "EV Specialist / Brand Workshop",
        confidence: 89
      };
    } else {
      return {
        issue: "EV Sub-System Ground Isolation Leak",
        dangerLevel: "MEDIUM",
        details: "Instrument screen par orange warning light aayi hai, iska matlab system ground safety wire me insulation fault detect hua hai. Isse power drop ho sakti hai.",
        action: "Wet terrain ya water logging me gaadi dhyan se chalayein. Scan check mandatory hai.",
        estimatedCost: "₹3,500 - ₹7,000",
        suggestedMechanic: "EV Wiring Specialist",
        confidence: 85
      };
    }
  };

  const handleDiagImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDiagImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const startDiagnosticsAnalysis = async () => {
    setDiagStatus('analyzing');
    speakVoice("Scanning dashboard logs and performing diagnostic trace analysis...");
    
    // Hit backend endpoint if backend is live, otherwise use smart fallback
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/ai/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            symptom: diagSymptom || "EV Dashboard Error code", 
            image: diagImage,
            vehicleType: 'ev'
        })
      });
      const data = await res.json();
      
      setTimeout(() => {
        if (res.ok) {
          setDiagReport(data);
          setDiagStatus('success');
          speakVoice(`Diagnostic report generated. Issue detected: ${data.issue}. Action required: ${data.action}`);
        } else {
          throw new Error("API fail");
        }
      }, 3000);

    } catch (err) {
      // Fallback response simulation
      setTimeout(() => {
        const report = mockDiagnostics(diagSymptom || "isolation leak");
        setDiagReport(report);
        setDiagStatus('success');
        speakVoice(`Diagnostic report generated. Issue detected: ${report.issue}. Action required: ${report.action}`);
      }, 3000);
    }
  };

  return (
    <>
      <SEO 
        title="Parxéé EV Hub - P2P Charging & Roadside Intelligence"
        description="Share personal EV chargers safely on our P2P Grid, request emergency charging rescue, calculate ranges dynamically, and run dashboard diagnostics."
      />
      
      {/* Background aesthetics */}
      <div className="bg-grain"></div>
      <div className="bg-grid"></div>

      <style>{`
        /* Leaflet Dark Mode Popup Override */
        .leaflet-popup-content-wrapper {
          background: rgba(3, 7, 18, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          color: #fff !important;
          border: 1px solid rgba(45, 212, 191, 0.25) !important;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6) !important;
          border-radius: 16px !important;
          font-family: inherit !important;
          padding: 4px !important;
        }
        .leaflet-popup-tip {
          background: rgba(3, 7, 18, 0.95) !important;
          border-left: 1px solid rgba(45, 212, 191, 0.25) !important;
          border-top: 1px solid rgba(45, 212, 191, 0.25) !important;
        }
        .leaflet-popup-close-button {
          color: rgba(255, 255, 255, 0.6) !important;
          padding: 8px !important;
        }
        
        /* Laser Scanner Line */
        .scanner-container {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }
        .scanner-laser {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #0ea5e9, #2dd4bf, #0ea5e9, transparent);
          box-shadow: 0 0 12px #2dd4bf, 0 0 20px #0ea5e9;
          animation: scanLaser 3s ease-in-out infinite;
          z-index: 5;
        }
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0.1; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0.1; }
        }

        /* Pulsating circles */
        @keyframes radarPulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .pulse-active {
          animation: radarPulse 2.5s infinite ease-in-out;
        }

        /* Smooth tab highlight sweep */
        .switcher-btn {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent !important;
        }
        .switcher-btn:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          color: #fff !important;
          transform: translateY(-1px);
        }
        .switcher-btn.active {
          background: rgba(45, 212, 191, 0.1) !important;
          border-color: rgba(45, 212, 191, 0.3) !important;
          color: #2dd4bf !important;
          box-shadow: 0 0 15px rgba(45, 212, 191, 0.08) !important;
        }
        
        /* Interactive coordinate selector map hover */
        .selector-map-container {
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: border-color 0.3s;
        }
        .selector-map-container:hover {
          border-color: rgba(45, 212, 191, 0.3);
        }
        
        /* Premium custom marker icon hover */
        .custom-ev-icon {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .custom-ev-icon:hover {
          transform: scale(1.15) translateY(-2px);
          filter: drop-shadow(0 0 10px rgba(45, 212, 191, 0.8));
        }

        /* Speed calculator range ring progress */
        .range-ring {
          transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Premium Glowing Slider Controls */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08) !important;
          border-radius: 6px;
          outline: none;
          transition: background 0.3s;
          margin: 10px 0;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2dd4bf !important;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(45, 212, 191, 0.8) !important;
          transition: transform 0.15s, background-color 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          background: #0ea5e9 !important;
          box-shadow: 0 0 12px rgba(14, 165, 233, 0.8) !important;
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border: none;
          border-radius: 50%;
          background: #2dd4bf !important;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(45, 212, 191, 0.8) !important;
          transition: transform 0.15s, background-color 0.15s;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.25);
          background: #0ea5e9 !important;
          box-shadow: 0 0 12px rgba(14, 165, 233, 0.8) !important;
        }

        .ev-hub-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 1.5rem;
          height: 600px;
        }
        .ev-map-wrapper {
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--border);
          position: relative;
          height: 100%;
          min-height: 350px;
        }
        .ev-list-wrapper {
          border-radius: 24px;
          border: 1px solid var(--border) !important;
          padding: 1.5rem !important;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          height: 100%;
        }
        @media (max-width: 991px) {
          .ev-hub-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
          .ev-map-wrapper {
            height: 350px;
          }
          .ev-list-wrapper {
            height: 400px;
          }
        }
      `}</style>

      <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '5rem' }}>
        <div className="container">
          
          {/* Header Banner */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', padding: '8px 20px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.25rem', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
              <Zap size={16} style={{ fill: '#2dd4bf' }} /> PARXÉÉ EV LABS
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '1rem' }}>
              Futuristic EV <span className="text-gradient" style={{ backgroundImage: 'var(--gradient-premium)' }}>Smart Hub</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Grid sharing safely, on-demand highway battery rescue, dynamic range predictions, and Gemini AI vehicle diagnostics.
            </p>
          </div>

          {/* Tab Navigation Menu */}
          <div className="glass" style={{ display: 'flex', gap: '8px', padding: '8px', borderRadius: '20px', overflowX: 'auto', marginBottom: '2.5rem', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => { setActiveTab('grid-share'); setBookingStep('idle'); }} 
              className={`switcher-btn ${activeTab === 'grid-share' ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '12px 20px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              🔌 Parxéé Grid Share (P2P)
            </button>
            <button 
              onClick={() => setActiveTab('host-charger')} 
              className={`switcher-btn ${activeTab === 'host-charger' ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '12px 20px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              🏠 Host Your Charger
            </button>
            <button 
              onClick={() => setActiveTab('wallet')} 
              className={`switcher-btn ${activeTab === 'wallet' ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '12px 20px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              💰 Earning Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('sos')} 
              className={`switcher-btn ${activeTab === 'sos' ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '12px 20px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              🚨 Emergency SOS
            </button>
            <button 
              onClick={() => setActiveTab('calculator')} 
              className={`switcher-btn ${activeTab === 'calculator' ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '12px 20px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              📊 Range Estimator
            </button>
            <button 
              onClick={() => setActiveTab('diagnostics')} 
              className={`switcher-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '12px 20px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              🔍 AI Diagnostics
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: PARXEE GRID SHARE (FIND & BOOK MAP) */}
          {/* ======================================================== */}
          {activeTab === 'grid-share' && (
            <div className="fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
              
              {/* Active Charging Session for Renters */}
              {activeRenterBooking && (
                <div className="glass bento-item fadeIn" style={{
                  padding: '2rem',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  background: 'rgba(45, 212, 191, 0.02)',
                  borderRadius: '24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ 
                        width: '50px', height: '50px', borderRadius: '12px', 
                        background: isCharging ? 'rgba(16, 185, 129, 0.1)' : 'rgba(45, 212, 191, 0.1)', 
                        color: isCharging ? '#10b981' : '#2dd4bf', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        <BatteryCharging size={28} className={isCharging ? "pulse-anim" : ""} />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>
                          {isCharging ? "Charging Session In Progress... ⚡" : "Secure Charger Ready to Unlock"}
                        </h4>
                        <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                          Charger: <strong>{activeRenterBooking.chargerId?.hostName || "Verified Host"}</strong> ({activeRenterBooking.chargerId?.address})
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {!isCharging ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Key in OTP to Unlock</span>
                            <input 
                              type="text" 
                              placeholder="e.g. PX-1234" 
                              value={enteredOtp} 
                              onChange={(e) => setEnteredOtp(e.target.value)}
                              style={{ 
                                padding: '8px 12px', borderRadius: '8px', 
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
                                color: '#fff', fontSize: '0.85rem', width: '120px', textAlign: 'center', fontWeight: 'bold' 
                              }}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const cleanEntered = enteredOtp.trim().toUpperCase();
                              const cleanExpected = (activeRenterBooking.otp || '').trim().toUpperCase();
                              if (cleanEntered === cleanExpected) {
                                setIsCharging(true);
                                speakVoice("OTP verified successfully. Charging initiated!");
                                toast.success("OTP Verified! Charging initiated.");
                                
                                // Start charging percentage animation
                                let pct = 0;
                                const interval = setInterval(() => {
                                  setChargePercent(prev => {
                                    if (prev >= 100) {
                                      return 0; // loop charging simulation
                                    }
                                    return prev + 4;
                                  });
                                }, 300);
                                window.chargingTimer = interval;
                              } else {
                                toast.error("Invalid OTP code. Please try again!");
                              }
                            }}
                            className="btn-gradient"
                            style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', color: '#000', fontWeight: 'bold', fontSize: '0.8rem', marginTop: '14px', cursor: 'pointer' }}
                          >
                            Unlock Plug
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold', display: 'block' }}>⚡ {chargePercent}% Charged</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Power: 7.4 kW Flowing</span>
                          </div>
                          <button
                            onClick={async () => {
                              if (window.chargingTimer) {
                                clearInterval(window.chargingTimer);
                              }
                              try {
                                const baseUrl = getBackendUrl();
                                const res = await fetch(`${baseUrl}/api/ev/complete-booking`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ bookingId: activeRenterBooking._id })
                                });
                                if (res.ok) {
                                  toast.success("Charging session completed successfully!");
                                  speakVoice("Charging session completed successfully. Thank you for grid sharing!");
                                  setActiveRenterBooking(null);
                                  setIsCharging(false);
                                  setChargePercent(0);
                                  setEnteredOtp('');
                                  fetchChargers();
                                } else {
                                  toast.error("Failed to complete booking.");
                                }
                              } catch (err) {
                                toast.error("Error ending session.");
                              }
                            }}
                            className="btn-gradient"
                            style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--gradient-emergency)', color: '#fff', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Stop Charging
                          </button>
                        </div>
                      )}

                      {/* Display OTP helper */}
                      {!isCharging && (
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>Your OTP Code:</span>
                          <strong style={{ fontSize: '1.3rem', color: '#2dd4bf', letterSpacing: '1px' }}>{activeRenterBooking.otp}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Find A Shared Charger</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Map displays verified neighbor chargers outside gates/driveways for comfort.</p>
                </div>
                
                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['All', 'CCS2', 'Type 2', 'Fast'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setFilterType(type)}
                      style={{ 
                        padding: '6px 14px', 
                        borderRadius: '10px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold', 
                        background: filterType === type ? '#2dd4bf' : 'rgba(255,255,255,0.05)',
                        color: filterType === type ? 'var(--primary-fg)' : '#fff',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      {type === 'Fast' ? '⚡ DC Fast (15kW+)' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map & Listings Split */}
              <div className="ev-hub-grid">
                
                {/* Leaflet Map Area */}
                <div className="ev-map-wrapper">
                  
                  {/* Floating Search Bar */}
                  <div style={{
                    position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 10, background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(12px)',
                    padding: '6px 12px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    width: '90%', maxWidth: '380px'
                  }}>
                    <Navigation size={16} color="#2dd4bf" style={{ flexShrink: 0 }} />
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const query = e.target.search.value;
                      if (!query.trim()) return;
                      try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                        const data = await res.json();
                        if (data && data.length > 0) {
                          const { lat, lon } = data[0];
                          setMapCenter([parseFloat(lat), parseFloat(lon)]);
                          toast.success(`Found: ${data[0].display_name.split(',')[0]}`);
                        } else {
                          toast.error("Location not found.");
                        }
                      } catch (err) {
                        toast.error("Search failed.");
                      }
                    }} style={{ display: 'flex', width: '100%', gap: '6px' }}>
                      <input 
                        name="search"
                        type="text" 
                        placeholder="Search Charging Zone..." 
                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                      />
                      <button type="submit" className="btn-gradient" style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', background: 'linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)' }}>
                        Go
                      </button>
                    </form>
                  </div>

                  <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <ChangeMapView center={mapCenter} zoom={12} />
                    
                    {/* Dark Satellite Imagery mapping */}
                    <TileLayer
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                      attribution="Map data © Google"
                      maxZoom={20}
                    />

                    {/* Render Charger Markers */}
                    {filteredChargers.map(charger => {
                      const markerHtml = `
                        <div style="background: linear-gradient(135deg, #2dd4bf, #0ea5e9); color: white; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2.5px solid #fff; box-shadow: 0 0 15px rgba(45,212,191,0.7);">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18.65 14.65c.98-.3 1.35-1.42.75-2.22l-6-8c-.62-.83-1.9-.4-1.9.64v5.5H7.35c-.98.3-1.35 1.42-.75 2.22l6 8c.62.83 1.9.4 1.9-.64v-5.5Z"/>
                          </svg>
                        </div>
                      `;
                      const chargerIcon = new L.DivIcon({
                        html: markerHtml,
                        className: 'custom-ev-icon',
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                      });

                      return (
                        <Marker 
                          key={charger.id} 
                          position={[charger.lat, charger.lng]}
                          icon={chargerIcon}
                          eventHandlers={{ click: () => { setSelectedCharger(charger); setBookingStep('confirming'); } }}
                        >
                          <Popup>
                            <div style={{ color: '#fff', fontSize: '0.85rem' }}>
                              <strong>{charger.host}</strong><br/>
                              <span>{charger.plugType}</span><br/>
                              <strong>₹{charger.price}/unit</strong>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>

                {/* List Side View */}
                <div className="glass ev-list-wrapper">
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Chargers Nearby</h4>
                  {filteredChargers.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { setMapCenter([c.lat, c.lng]); setSelectedCharger(c); setBookingStep('confirming'); }}
                      className="charger-list-item light-sweep"
                      style={{ 
                        padding: '1.25rem', 
                        borderRadius: '16px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: selectedCharger?.id === c.id ? '1px solid #2dd4bf' : '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{c.host}</strong>
                        
                        {/* Rating */}
                        <span style={{ fontSize: '0.8rem', color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                          ★ {c.rating}
                        </span>
                      </div>

                      {/* Security setting & verified flags */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {c.kycVerified && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                            <ShieldCheck size={10} /> KYC Verified
                          </span>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: c.status === 'Available' ? 'rgba(45, 212, 191, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: c.status === 'Available' ? '#2dd4bf' : '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                          {c.status}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px' }}><MapPin size={10} style={{ marginRight: '3px' }} /> {c.address}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', fontSize: '0.8rem' }}>
                        <span style={{ opacity: 0.8 }}>⚡ {c.plugType}</span>
                        <strong style={{ color: '#2dd4bf', fontSize: '0.9rem' }}>₹{c.price}/kWh</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOOKING PANEL MODAL OVERLAY (KYC / Host-Approval System) */}
              {selectedCharger && bookingStep !== 'idle' && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(10px)',
                  zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}
                onClick={() => setBookingStep('idle')}
                >
                  <div className="bento-item glass" style={{
                    width: '100%', maxWidth: '460px', padding: '2.5rem', borderRadius: '28px',
                    textAlign: 'center', position: 'relative', border: '1px solid rgba(45, 212, 191, 0.3)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(45,212,191,0.15)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                  >
                    {/* Close x */}
                    <button 
                      onClick={() => setBookingStep('idle')}
                      style={{ position: 'absolute', top: '16px', right: '20px', background: 'transparent', color: '#fff', fontSize: '1.25rem', opacity: 0.5 }}
                    >
                      ✕
                    </button>

                    {/* STEP 1: CONFIRM BOOKING */}
                    {bookingStep === 'confirming' && (
                      <div className="fadeIn">
                        <div style={{ width: '60px', height: '60px', background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                          <Zap size={30} style={{ fill: '#2dd4bf' }} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '8px' }}>Book Power Box</h3>
                        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Confirm secure slot with host {selectedCharger.host}</p>

                        {/* Security Warning / Comfort Badge */}
                        <div style={{ 
                          background: 'rgba(16, 185, 129, 0.05)', 
                          border: '1px solid rgba(16, 185, 129, 0.2)', 
                          borderRadius: '16px', 
                          padding: '1rem', 
                          textAlign: 'left', 
                          marginBottom: '1.5rem',
                          display: 'flex',
                          gap: '10px'
                        }}>
                          <ShieldCheck size={28} color="#10b981" style={{ flexShrink: 0 }} />
                          <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#10b981', display: 'block' }}>Security Protection:</span>
                            <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '600' }}>{selectedCharger.security}</span>
                          </div>
                        </div>

                        {/* Transaction Pricing Summary */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                            <span style={{ opacity: 0.7 }}>Charger Rate:</span>
                            <strong style={{ color: '#2dd4bf' }}>₹{selectedCharger.price}/unit</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                            <span style={{ opacity: 0.7 }}>Plug System:</span>
                            <strong>{selectedCharger.plugType}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                            <span style={{ opacity: 0.7 }}>Estimated units:</span>
                            <strong>~15 kWh</strong>
                          </div>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold' }}>
                            <span>Total Estimated Price:</span>
                            <span style={{ color: '#2dd4bf' }}>₹{selectedCharger.price * 15}</span>
                          </div>
                        </div>

                        {/* Booking Controls */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <label style={{ fontSize: '0.7rem', opacity: 0.7 }}>Duration (Hours)</label>
                            <input 
                              type="number" min="1" max="10" 
                              value={bookingHours} 
                              onChange={(e) => setBookingHours(e.target.value)}
                              style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                            />
                          </div>
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <label style={{ fontSize: '0.7rem', opacity: 0.7 }}>Status</label>
                            <div style={{ width: '100%', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
                              ✔ KYC Cleared
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={confirmBookingRequest}
                          className="btn-gradient light-sweep" 
                          style={{ width: '100%', padding: '15px', borderRadius: '14px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--gradient-premium)', border: 'none', color: '#000' }}
                        >
                          <CreditCard size={18} /> Request Access Token
                        </button>
                      </div>
                    )}

                    {/* MOCK RAZORPAY PAYMENT GATEWAY */}
                    {bookingStep === 'mock_payment_gateway' && currentOrder && (
                      <div className="fadeIn" style={{ padding: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#2952e3', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>razorpay</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Secured Payment</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#2dd4bf', fontWeight: 'bold', background: 'rgba(45,212,191,0.1)', padding: '2px 8px', borderRadius: '20px' }}>TEST MODE</span>
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Amount to Pay</span>
                          <strong style={{ fontSize: '2rem', color: '#fff', display: 'block', marginBottom: '10px' }}>₹{currentOrder.amount}</strong>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                            <span><strong>Host:</strong> {selectedCharger?.host}</span>
                            <span><strong>Plug Type:</strong> {selectedCharger?.plugType}</span>
                            <span><strong>Rate:</strong> ₹{selectedCharger?.price}/unit</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
                          <button
                            onClick={async () => {
                              setBookingStep('approving');
                              speakVoice("Processing simulation payment. Verifying with Razorpay engine...");
                              try {
                                const baseUrl = getBackendUrl();
                                const verifyRes = await fetch(`${baseUrl}/api/ev/verify-booking`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    bookingId: currentOrder.bookingId,
                                    razorpay_order_id: currentOrder.orderId,
                                    razorpay_payment_id: `pay_ev_mock_${Date.now()}`,
                                    razorpay_signature: "mock_signature"
                                  })
                                });
                                const verifyData = await verifyRes.json();
                                if (verifyRes.ok) {
                                  setSecureOtp(verifyData.otp);
                                  setBookingStep('success');
                                  speakVoice(`Booking approved! Your secure charger OTP is ${verifyData.otp.replace('-', ' ')}`);
                                  toast.success("Payment simulated successfully! OTP generated.");
                                  fetchChargers();
                                  fetchActiveBookings();
                                } else {
                                  throw new Error(verifyData.message || 'Failed to verify booking');
                                }
                              } catch (err) {
                                toast.error(err.message || 'Verification failed');
                                setBookingStep('idle');
                              }
                            }}
                            className="btn-gradient light-sweep"
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 'bold', background: '#10b981', border: 'none', color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}
                          >
                            ✔ Pay Successfully (Simulate)
                          </button>
                          
                          <button
                            onClick={() => {
                              toast.error("Payment declined/cancelled.");
                              setBookingStep('idle');
                            }}
                            className="btn-secondary"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 'bold', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}
                          >
                            ✕ Cancel/Decline Payment
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: REQUESTING APPROVAL */}
                    {bookingStep === 'approving' && (
                      <div className="fadeIn">
                        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                          <div style={{ width: '60px', height: '60px', border: '4px solid rgba(45, 212, 191, 0.2)', borderTopColor: '#2dd4bf', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#2dd4bf', marginBottom: '10px' }}>Requesting Host Approval...</h3>
                        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                          Host is checking driver ID verification profile. Security protocol validates your vehicle registration plate and KYC.
                        </p>
                      </div>
                    )}

                    {/* STEP 3: SUCCESS APPROVED */}
                    {bookingStep === 'success' && (
                      <div className="fadeIn">
                        <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}>
                          <CheckCircle size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', marginBottom: '8px' }}>Access Approved!</h3>
                        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                          Host accepted booking request. Charger interface unlocked!
                        </p>

                        {/* Smart OTP Unlock Code */}
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed #10b981', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', letterSpacing: '1px', marginBottom: '6px' }}>Secure Charger Plug OTP</span>
                          <strong style={{ fontSize: '2rem', letterSpacing: '4px', color: '#fff', fontFamily: 'monospace' }}>{secureOtp}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px', margin: 0 }}>Enter this code on host's smart power box key pad to start power current supply.</p>
                        </div>

                        {/* Directions */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1rem', textAlign: 'left', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                          <strong>Host Address:</strong>
                          <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>{selectedCharger.address}</p>
                        </div>

                        <button 
                          onClick={() => setBookingStep('idle')}
                          className="btn-gradient" 
                          style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 'bold', background: '#10b981', border: 'none', color: '#fff' }}
                        >
                          Finish & Track Route
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: HOST A CHARGER FORM */}
          {/* ======================================================== */}
          {activeTab === 'host-charger' && (
            <div className="glass bento-item fadeIn" style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0 }}>Register Your Home Charger</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: 0 }}>Generate passive income safely by sharing your wallbox plug.</p>
                </div>
              </div>

              <form className="form-grid" onSubmit={handleHostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Host Name</label>
                    <input 
                      type="text" placeholder="Your name" 
                      value={hostForm.hostName} 
                      onChange={(e) => setHostForm({...hostForm, hostName: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Phone Number</label>
                    <input 
                      type="text" placeholder="e.g. +91 99999 XXXXX" 
                      value={hostForm.phone} 
                      onChange={(e) => setHostForm({...hostForm, phone: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Address / Charger Location</label>
                  <input 
                    type="text" placeholder="e.g. Sector 12, Block C, House 45, Noida" 
                    value={hostForm.address} 
                    onChange={(e) => setHostForm({...hostForm, address: e.target.value})}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                  />
                </div>

                {/* INTERACTIVE COORDINATE SELECTOR MAP */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>
                      📍 Pinpoint Plug Location on Radar
                    </label>
                    <span style={{ fontSize: '0.7rem', color: '#2dd4bf', fontWeight: 'bold' }}>
                      Click on the map to place your charger pin
                    </span>
                  </div>
                  
                  <div className="selector-map-container" style={{ height: '220px', borderRadius: '16px', overflow: 'hidden', marginBottom: '10px' }}>
                    <MapContainer key={activeTab} center={newHostCoords} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                      <ChangeMapView center={newHostCoords} zoom={13} />
                      <TileLayer
                        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                        attribution="Map data © Google"
                        maxZoom={20}
                      />
                      <AddChargerMapMarker position={newHostCoords} setPosition={setNewHostCoords} />
                    </MapContainer>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    <span>Coordinates: <strong>{newHostCoords[0].toFixed(5)}, {newHostCoords[1].toFixed(5)}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setNewHostCoords([pos.coords.latitude, pos.coords.longitude]);
                              toast.success("GPS Coordinates detected! 🎯");
                            },
                            () => toast.error("Could not fetch GPS coordinates. Please select manually on map. 🗺"),
                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                          );
                        }
                      }}
                      style={{ background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Use My GPS Location
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Plug Interface Type</label>
                    <select 
                      value={hostForm.plugType} 
                      onChange={(e) => setHostForm({...hostForm, plugType: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                    >
                      <option value="CCS2 (7.4 kW AC)" style={{ background: '#030712' }}>CCS2 (7.4 kW AC)</option>
                      <option value="Type 2 (22 kW AC)" style={{ background: '#030712' }}>Type 2 (22 kW AC)</option>
                      <option value="CCS2 (15 kW AC Fast)" style={{ background: '#030712' }}>CCS2 (15 kW AC Fast)</option>
                      <option value="GB/T (3.3 kW AC)" style={{ background: '#030712' }}>GB/T (3.3 kW AC)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Charging Speed (Power Output)</label>
                    <select 
                      value={hostForm.speed} 
                      onChange={(e) => setHostForm({...hostForm, speed: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                    >
                      <option value="3.3 kW" style={{ background: '#030712' }}>3.3 kW</option>
                      <option value="7.4 kW" style={{ background: '#030712' }}>7.4 kW</option>
                      <option value="11 kW" style={{ background: '#030712' }}>11 kW</option>
                      <option value="22 kW" style={{ background: '#030712' }}>22 kW</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Price (₹ per unit kWh)</label>
                    <input 
                      type="number" placeholder="e.g. 15" 
                      value={hostForm.price} 
                      onChange={(e) => setHostForm({...hostForm, price: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Availability Hours</label>
                    <input 
                      type="text" placeholder="e.g. 9:00 AM - 5:00 PM" 
                      value={hostForm.timings} 
                      onChange={(e) => setHostForm({...hostForm, timings: e.target.value})}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                    />
                  </div>
                </div>

                {/* SAFETY LOCATION SELECTOR */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px', display: 'block' }}>Security / Comfort Zone Location</label>
                  <select 
                    value={hostForm.security} 
                    onChange={(e) => setHostForm({...hostForm, security: e.target.value})}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                  >
                    <option value="Outer Gate / Driveway (No Home Entry)" style={{ background: '#030712' }}>Outer Gate / Driveway (Renter stays outside house boundary)</option>
                    <option value="Private Garage (CCTV Active)" style={{ background: '#030712' }}>Private Garage (Host/security monitored area)</option>
                    <option value="Society Shared Parking Space" style={{ background: '#030712' }}>Society Shared Parking Space (Society approval required)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                  <span>Your profile has an active KYC clearance. Submitting this form will instantly add your charger to the active radar grid.</span>
                </div>

                <button 
                  type="submit" 
                  className="btn-gradient light-sweep" 
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', fontWeight: 'bold', background: '#10b981', border: 'none', color: '#fff', marginTop: '1rem' }}
                >
                  Activate & Share Charger Plugs
                </button>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: GRID EARNINGS WALLET */}
          {/* ======================================================== */}
          {activeTab === 'wallet' && (
            <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Host Active Sessions */}
              {activeHostBookings.length > 0 && (
                <div className="glass bento-item fadeIn" style={{ padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.02)', borderRadius: '24px', marginBottom: '1rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                    <Zap size={18} color="#10b981" /> Active Rental Sessions on Your Chargers
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activeHostBookings.map(bk => (
                      <div key={bk._id} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ textAlign: 'left' }}>
                          <strong style={{ fontSize: '1rem', color: '#fff' }}>Renter: {bk.userId?.name || "Verified Driver"}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                            Timings: {bk.chargerId?.timings} | Speed: {bk.chargerId?.speed} | Address: {bk.chargerId?.address}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>
                            Contact: {bk.userId?.phone || bk.userId?.email || "N/A"}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>Session OTP Code</span>
                            <strong style={{ fontSize: '1.25rem', color: '#10b981', fontFamily: 'monospace' }}>{bk.otp}</strong>
                          </div>

                          <button
                            onClick={async () => {
                              try {
                                const baseUrl = getBackendUrl();
                                const res = await fetch(`${baseUrl}/api/ev/complete-booking`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ bookingId: bk._id })
                                });
                                if (res.ok) {
                                  toast.success("Charging session completed and balance credited!");
                                  speakVoice("Session completed. Charging earnings have been credited to your wallet.");
                                  fetchEarnings();
                                  fetchActiveBookings();
                                } else {
                                  toast.error("Failed to complete session.");
                                }
                              } catch (err) {
                                toast.error("Error completing session.");
                              }
                            }}
                            className="btn-gradient"
                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Release Charger (End Session)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Counter Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr 1.5fr', gap: '1.5rem' }}>
                <div className="bento-item glass light-sweep" style={{ padding: '2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Total Earnings (KYC Secured)</span>
                  <strong style={{ fontSize: '2.5rem', color: '#10b981', display: 'block', margin: '0.5rem 0' }}>₹{walletBalance}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>✔ Fully settled to bank</span>
                </div>
                
                <div className="bento-item glass light-sweep" style={{ padding: '2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Total Units Shared</span>
                  <strong style={{ fontSize: '2.5rem', color: '#2dd4bf', display: 'block', margin: '0.5rem 0' }}>{totalUnitsShared} kWh</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Across {walletTx.length} successful {walletTx.length === 1 ? 'transaction' : 'transactions'}</span>
                </div>

                {/* Earnings Trend Graphic Sparkline */}
                <div className="bento-item glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Weekly Earning Growth</span>
                  
                  {/* CSS SVG Sparkline */}
                  <div style={{ height: '70px', marginTop: '1rem', position: 'relative' }}>
                    <svg viewBox="0 0 300 70" style={{ width: '100%', height: '100%' }}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 60 L 50 45 L 100 50 L 150 25 L 200 35 L 250 10 L 300 20 L 300 70 L 0 70 Z" fill="url(#chartGrad)" />
                      <path d="M 0 60 L 50 45 L 100 50 L 150 25 L 200 35 L 250 10 L 300 20" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="250" cy="10" r="5" fill="#10b981" />
                    </svg>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '8px' }}>
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Sat (Peak: ₹800)</span>
                  </div>
                </div>
              </div>

              {/* Transactions Log */}
              <div className="glass bento-item" style={{ padding: '2.5rem 2rem' }}>
                              {walletTx.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.12)', marginBottom: '1.5rem' }}>
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V9a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12" />
                      <circle cx="9" cy="12" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <path d="M12 2v3M9 2v1M15 2v1" />
                    </svg>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>No Earning Transactions Yet</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                      Bhai, jab koi renter aapka grid charger rent karega aur charging session end hoga, toh aapki income yahan show hogi!
                    </p>
                    <button
                      onClick={() => setActiveTab('host-charger')}
                      className="btn-gradient"
                      style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Host Your Charger Now
                    </button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                          <th style={{ padding: '12px' }}>Renter Name</th>
                          <th style={{ padding: '12px' }}>Vehicle Model</th>
                          <th style={{ padding: '12px' }}>Timestamp</th>
                          <th style={{ padding: '12px' }}>Duration</th>
                          <th style={{ padding: '12px' }}>Units Sold</th>
                          <th style={{ padding: '12px' }}>Payout</th>
                          <th style={{ padding: '12px' }}>Verification status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {walletTx.map((tx) => (
                          <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '14px', fontWeight: 'bold' }}>{tx.renter}</td>
                            <td style={{ padding: '14px' }}>{tx.car}</td>
                            <td style={{ padding: '14px', color: 'var(--muted)' }}>{tx.date}</td>
                            <td style={{ padding: '14px' }}>{tx.duration}</td>
                            <td style={{ padding: '14px' }}>{tx.units}</td>
                            <td style={{ padding: '14px', color: '#10b981', fontWeight: 'bold' }}>{tx.amount}</td>
                            <td style={{ padding: '14px' }}>
                              <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                ✔ KYC Checked
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: EV EMERGENCY SOS CHARGING VAN RESCUE */}
          {/* ======================================================== */}
          {activeTab === 'sos' && (
            <div className="fadeIn" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
              
              {/* Intro grid */}
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '3fr 2fr', gap: '2rem' }}>
                
                <div className="glass bento-item" style={{ padding: '3rem 2rem', justifyContent: 'center' }}>
                  <div className="emergency-phone-icon pulse-primary" style={{ background: '#f43f5e', margin: '0 auto 1.5rem', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <Zap size={32} color="#fff" />
                  </div>
                  <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: '900', marginBottom: '10px' }}>Dead Battery Highway SOS</h2>
                  <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
                    Stuck with a flat EV battery on the highway? Push the button below to dispatch a mobile charging generator van to your current coordinate point.
                  </p>

                  <div style={{ textAlign: 'center' }}>
                    {sosStatus === 'idle' && (
                      <button 
                        onClick={startSosSimulation}
                        className="btn-gradient light-sweep"
                        style={{ background: 'var(--gradient-emergency)', color: '#fff', border: 'none', padding: '18px 40px', borderRadius: '50px', fontWeight: '900', fontSize: '1.1rem' }}
                      >
                        ⚡ Dispatch Emergency Charger Van
                      </button>
                    )}

                    {sosStatus === 'searching' && (
                      <div className="fadeIn" style={{ maxWidth: '300px', margin: '0 auto' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(244, 63, 94, 0.2)', borderTopColor: '#f43f5e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                        <h4 style={{ color: '#f43f5e', fontWeight: 'bold' }}>Locating Rescuer Van...</h4>
                      </div>
                    )}

                    {sosStatus === 'dispatched' && (
                      <div className="fadeIn" style={{ width: '100%', maxWidth: '460px', margin: '0 auto', textAlign: 'left' }}>
                        {/* Status Card */}
                        <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#f43f5e', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>SOS Tracking Status</span>
                          <strong style={{ fontSize: '1.2rem', color: '#fff', display: 'block', margin: '4px 0' }}>Van En Route (ETA: {Math.max(1, Math.round(12 - (sosProgress * 0.12)))} min)</strong>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' }}>
                            <div style={{ width: `${sosProgress}%`, height: '100%', background: '#f43f5e', transition: 'width 0.4s linear' }}></div>
                          </div>
                        </div>

                        {/* Rescuer Info */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1.25rem' }}>
                          <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            RG
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>Ramesh Gujjar (EV Rescue Expert)</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Vehicle: Mahindra e-Supro (DL-3C-XX-8742)</span>
                          </div>
                        </div>

                        {/* Real-time Telemetry Terminal */}
                        <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#f43f5e', marginBottom: '1.5rem', minHeight: '65px' }}>
                          <span style={{ color: '#fff', opacity: 0.4 }}>[TELEMETRY LOGS]</span>
                          <p style={{ margin: '6px 0 0 0', lineHeight: '1.4' }}>
                            {sosProgress < 25 && "» [SYSTEM] Rescuer assigned. Charging van dispatched from Sector-62 depot."}
                            {sosProgress >= 25 && sosProgress < 50 && "» [TELEMETRY] Driving past toll gate, moving at 65 km/h. Distance: 4.8 km."}
                            {sosProgress >= 50 && sosProgress < 75 && "» [TELEMETRY] Navigating highway traffic. GPS lock active. ETA: 5 minutes."}
                            {sosProgress >= 75 && sosProgress < 100 && "» [SYSTEM] Vehicle approaching target coordinates. Preparing HV coupling."}
                            {sosProgress >= 100 && "» [SUCCESS] Coupler connected. 30 kW DC power flowing safely!"}
                          </p>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <button onClick={() => setSosStatus('idle')} className="btn-secondary" style={{ padding: '10px 24px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Cancel SOS Dispatch</button>
                        </div>
                      </div>
                    )}

                    {sosStatus === 'arrived' && (
                      <div className="fadeIn" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.75rem', borderRadius: '20px', marginBottom: '1.5rem', textAlign: 'center' }}>
                          <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}>
                            <CheckCircle size={28} />
                          </div>
                          <strong style={{ fontSize: '1.3rem', color: '#fff', display: 'block', marginBottom: '6px' }}>Rescue Unit Arrived! 🎉</strong>
                          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, lineHeight: '1.5' }}>
                            Ramesh Gujjar has successfully plugged in the fast DC charger. Charging is active. Stay safe inside your car!
                          </p>
                        </div>
                        <button onClick={() => setSosStatus('idle')} className="btn-gradient" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', color: '#fff', background: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>Finish Charging Session</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Map monitoring route */}
                <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', height: '400px' }}>
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <ChangeMapView center={mapCenter} zoom={13} />
                    <TileLayer
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                      attribution="Map data © Google"
                      maxZoom={20}
                    />

                    {/* User Marker */}
                    <Marker position={mapCenter}>
                      <Popup>Your coordinate position</Popup>
                    </Marker>

                    {/* SOS Van Marker moving dynamically */}
                    {sosStatus === 'dispatched' && sosMarkerCoords && (
                      <Marker 
                        position={sosMarkerCoords}
                        icon={new L.DivIcon({
                          html: `<div style="background: #f43f5e; color: white; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px rgba(244,63,94,0.6);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`,
                          className: 'van-icon',
                          iconSize: [36, 36],
                          iconAnchor: [18, 18]
                        })}
                      >
                        <Popup>Emergency Generator Van</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: EV RANGE & CHARGE SPEED CALCULATOR */}
          {/* ======================================================== */}
          {activeTab === 'calculator' && (
            <div className="fadeIn" style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1.2fr 1fr', gap: '2rem' }}>
              
              {/* Sliders Input */}
              <div className="glass bento-item" style={{ padding: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car size={20} color="#2dd4bf" /> Range Estimator Parameters
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Model dropdown */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>Select EV Vehicle Model</label>
                    <select 
                      value={calcModel.name} 
                      onChange={(e) => setCalcModel(EV_MODELS.find(m => m.name === e.target.value))}
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
                    >
                      {EV_MODELS.map(m => (
                        <option key={m.name} value={m.name} style={{ background: '#030712' }}>{m.name} ({m.batteryKwh} kWh)</option>
                      ))}
                    </select>
                  </div>

                  {/* SoC Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Current Battery SoC (%)</label>
                      <strong style={{ color: '#2dd4bf' }}>{calcSoc}%</strong>
                    </div>
                    <input 
                      type="range" min="5" max="100" 
                      value={calcSoc} 
                      onChange={(e) => setCalcSoc(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#2dd4bf', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Speed Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Cruising Speed (km/h)</label>
                      <strong style={{ color: '#2dd4bf' }}>{calcSpeed} km/h</strong>
                    </div>
                    <input 
                      type="range" min="40" max="130" 
                      value={calcSpeed} 
                      onChange={(e) => setCalcSpeed(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#2dd4bf', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Temperature Buttons */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>Ambient Weather Temperature</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {['Cold (5°C)', 'Normal (25°C)', 'Hot (42°C)'].map(t => {
                        const val = t.split(' ')[0];
                        return (
                          <button 
                            key={val}
                            type="button"
                            onClick={() => setCalcTemp(val)}
                            style={{ 
                              padding: '10px', 
                              borderRadius: '8px', 
                              fontSize: '0.8rem', 
                              fontWeight: 'bold',
                              background: calcTemp === val ? '#2dd4bf' : 'rgba(255,255,255,0.03)',
                              color: calcTemp === val ? '#000' : '#fff',
                              border: '1px solid rgba(255,255,255,0.05)'
                            }}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggles (AC & ECO) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Cabin A/C ON</span>
                      <input 
                        type="checkbox" checked={calcAc} 
                        onChange={(e) => setCalcAc(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2dd4bf' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981' }}>Eco Mode ECO</span>
                      <input 
                        type="checkbox" checked={calcEco} 
                        onChange={(e) => setCalcEco(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Output displays */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Range Card with Circular SVG Dial Gauge */}
                <div className="bento-item glass light-sweep" style={{ 
                  padding: '2.5rem', 
                  background: 'rgba(45, 212, 191, 0.02)', 
                  borderColor: 'rgba(45, 212, 191, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#2dd4bf', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>Estimated Range Output</span>
                  
                  <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="transparent" 
                        stroke="rgba(255, 255, 255, 0.05)" 
                        strokeWidth="7" 
                      />
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="transparent" 
                        stroke={estimatedRange > 250 ? '#10b981' : estimatedRange > 120 ? '#eab308' : '#ef4444'} 
                        strokeWidth="7" 
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(1, estimatedRange / 600))}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{
                          transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.8s ease',
                          filter: `drop-shadow(0 0 6px ${estimatedRange > 250 ? 'rgba(16, 185, 129, 0.5)' : estimatedRange > 120 ? 'rgba(234, 179, 8, 0.5)' : 'rgba(239, 68, 68, 0.5)'})`
                        }}
                      />
                    </svg>
                    
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', letterSpacing: '1px' }}>Range</span>
                      <strong style={{ fontSize: '3.2rem', color: '#fff', display: 'block', lineHeight: 1.1, letterSpacing: '-1.5px' }}>{estimatedRange}</strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 'bold' }}>KM</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <span>Efficiency: <strong style={{ color: '#fff' }}>{calcModel.efficiency} Wh/km</strong></span>
                      <span>Battery: <strong style={{ color: '#fff' }}>{calcModel.batteryKwh} kWh</strong></span>
                    </div>
                  </div>
                </div>

                {/* Charge Time Comparison card */}
                <div className="glass bento-item" style={{ padding: '2rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.25rem' }}>Estimated Charging Time (to 80%)</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block' }}>Slow AC Wallbox (7.2 kW)</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Ideal for overnight charging</span>
                      </div>
                      <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{timeSlow}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', background: 'rgba(45, 212, 191, 0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', color: '#2dd4bf' }}>DC Fast Charger (50 kW)</span>
                        <span style={{ fontSize: '0.7rem', color: '#2dd4bf', opacity: 0.8 }}>Highway pitstop charge speed</span>
                      </div>
                      <strong style={{ fontSize: '1.2rem', color: '#2dd4bf' }}>{timeFast}</strong>
                    </div>
                  </div>
                </div>

                {/* AI Advice tip */}
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', color: '#10b981' }}>
                  <Sparkles size={16} style={{ flexShrink: 0 }} />
                  <span><strong>AI Tip:</strong> {calcSpeed > 100 ? "Bhai, cruising speed 90 km/h rakhne se battery load 18% kam ho jayegi aur range badh jayegi!" : "Excellent speed control! Driving in ECO mode helps regenerate energy during deceleration."}</span>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: EV CAM AI DIAGNOSTICS */}
          {/* ======================================================== */}
          {activeTab === 'diagnostics' && (
            <div className="fadeIn" style={{ maxWidth: '800px', margin: '0 auto' }}>
              
              <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                
                {diagStatus === 'idle' && (
                  <div style={{ width: '100%', maxWidth: '500px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>AI EV Console Diagnostics</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                      Upload a photo of your EV instrument cluster dashboard, error warning light, or state code log. Gemini AI will diagnose the technical anomalies instantly.
                    </p>

                    <textarea 
                      placeholder="Optional: Describe symptom (e.g. 'Battery temperature warning came on', 'Regen brake error orange alert')"
                      value={diagSymptom}
                      onChange={(e) => setDiagSymptom(e.target.value)}
                      style={{
                        width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)', color: 'var(--fg)', fontSize: '0.95rem', resize: 'none', marginBottom: '1.5rem'
                      }}
                      rows="3"
                    />

                    {/* Selector / Trigger */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
                      <div>
                        <input 
                          type="file" accept="image/*" 
                          style={{ display: 'none' }} 
                          ref={fileRef}
                          onChange={handleDiagImageSelect}
                        />
                        <button 
                          onClick={() => fileRef.current.click()}
                          style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: diagImage ? 'rgba(45, 212, 191, 0.1)' : 'rgba(255,255,255,0.05)',
                            border: `2px solid ${diagImage ? '#2dd4bf' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: diagImage ? '#2dd4bf' : 'var(--muted)', margin: '0 auto 0.75rem', overflow: 'hidden'
                          }}
                        >
                          {diagImage ? (
                            <img src={diagImage} alt="Dashboard preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Activity size={28} />
                          )}
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{diagImage ? "Image Uploaded" : "Console Screenshot"}</span>
                      </div>
                    </div>

                    <button 
                      onClick={startDiagnosticsAnalysis}
                      className="btn-gradient light-sweep"
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', color: '#000', fontWeight: 'bold', fontSize: '1rem' }}
                    >
                      Start AI Diagnostics Scanning
                    </button>
                  </div>
                )}

                {diagStatus === 'analyzing' && (
                  <div className="fadeIn" style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
                    {diagImage ? (
                      <div className="scanner-container" style={{ width: '100%', height: '220px', position: 'relative', border: '1px solid rgba(45,212,191,0.3)', boxShadow: '0 0 15px rgba(45,212,191,0.1)', marginBottom: '1.5rem' }}>
                        <div className="scanner-laser"></div>
                        <img src={diagImage} alt="Scanning dashboard" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                      </div>
                    ) : (
                      <div className="pulse-active" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Activity size={32} />
                      </div>
                    )}
                    <h3 style={{ color: '#2dd4bf', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Performing Spectral Diagnostics...</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      Analyzing vehicle telemetry logs, dashboard indicators, and battery cell health via Gemini Generative Vision.
                    </p>
                  </div>
                )}

                {diagStatus === 'success' && diagReport && (
                  <div className="fadeIn" style={{ width: '100%', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {diagReport.dangerLevel === 'CRITICAL' ? (
                          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                            <ShieldAlert size={22} />
                          </div>
                        ) : (
                          <div style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={22} />
                          </div>
                        )}
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>{diagReport.issue}</h3>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: diagReport.dangerLevel === 'CRITICAL' ? '#ef4444' : '#facc15' }}>
                            {diagReport.dangerLevel} THREAT DANGER
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => speakVoice(`${diagReport.details}. Expected cost is: ${diagReport.estimatedCost}. Suggested Action is: ${diagReport.action}`)}
                        style={{ background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', border: '1px solid rgba(45, 212, 191, 0.2)', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                      >
                        <Volume2 size={18} /> Voice Report
                      </button>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>AI Technical Analysis</span>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{diagReport.details}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Repair Cost Est.</span>
                        <strong style={{ fontSize: '1.1rem', color: '#10b981', display: 'block', marginTop: '4px' }}>{diagReport.estimatedCost}</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Required Specialist</span>
                        <strong style={{ fontSize: '1.1rem', color: '#2dd4bf', display: 'block', marginTop: '4px' }}>{diagReport.suggestedMechanic}</strong>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(45, 212, 191, 0.05)', borderLeft: '4px solid #2dd4bf', padding: '1rem', borderRadius: '0 10px 10px 0', fontSize: '0.85rem', marginBottom: '2rem' }}>
                      <strong>Recommended Safe Action:</strong> {diagReport.action}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => { setDiagStatus('idle'); setDiagImage(null); setDiagSymptom(''); }} className="btn-secondary" style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', color: '#fff', background: 'transparent', borderRadius: '10px' }}>
                        <RefreshCcw size={16} /> Run Diagnostics Again
                      </button>
                      <button onClick={() => window.location.href='/mechanics'} className="btn-gradient" style={{ flex: 1, padding: '12px', border: 'none', color: '#000', background: 'var(--gradient-premium)', borderRadius: '10px', fontWeight: 'bold' }}>
                        Locate EV Repair Station
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
