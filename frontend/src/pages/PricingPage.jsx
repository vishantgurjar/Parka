import { useState, useContext } from 'react';
import { Check, Star, Shield, Lock } from 'lucide-react';
import { AuthContext } from '../App';
import PaymentModal from '../components/PaymentModal';
import SEO from '../components/SEO';

export default function PricingPage() {
  const { user, login } = useContext(AuthContext);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleUpgrade = (tierName, amount) => {
    if (!user) {
      alert("Please log in first to upgrade your account.");
      window.location.href = '/login';
      return;
    }
    setSelectedPlan({ name: tierName, amount });
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    // Notify custom backend route of the upgrade
    try {
      const tier = selectedPlan.name.includes('Gold') ? 'gold' : 'silver';
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/user/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, tier })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, localStorage.getItem('parkeToken')); // Update AuthContext user
        alert(`Congratulations! You are now a ${tier.toUpperCase()} PRO member.`);
        setShowPayment(false);
      }
    } catch (err) {
      console.error(err);
      alert('Issue upgrading account, please contact support.');
    }
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '4rem', minHeight: '100vh', background: 'var(--bg)' }}>
      <SEO title="PRO Pricing - Parkéé City" />
      
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '6px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              <Star size={16} fill="currentColor" /> Parkéé City PRO
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--fg)' }}>Upgrade to <span className="text-gradient">Ultimate Protection</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Get exclusive holographic stickers, zero convenience fees on SOS rescues, and elite Privacy Calling.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* Basic Tier */}
          <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Basic Web</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>₹0 <span style={{fontSize:'1rem', color:'var(--muted)'}}>/lifetime</span></p>
            <button className="btn-secondary" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '2rem' }}>Current Plan</button>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '10px' }}><Check size={20} color="var(--primary)" /> Public QR Profile</li>
              <li style={{ display: 'flex', gap: '10px' }}><Check size={20} color="var(--primary)" /> SMS Alert System</li>
              <li style={{ display: 'flex', gap: '10px', color: 'var(--muted)' }}><span>✕</span> Public Phone Number visible</li>
              <li style={{ display: 'flex', gap: '10px', color: 'var(--muted)' }}><span>✕</span> 1 Vehicle limit</li>
            </ul>
          </div>

          {/* Gold PRO Tier */}
          <div className="glass-card" style={{ padding: '2rem', border: '2px solid #eab308', position: 'relative', transform: 'scale(1.05)', zIndex: 1, boxShadow: '0 20px 40px rgba(234, 179, 8, 0.15)' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '2rem', background: '#eab308', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>MOST POPULAR</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield color="#eab308"/> Gold PRO</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>₹999 <span style={{fontSize:'1rem', color:'var(--muted)'}}>/year</span></p>
            
            {user?.subscriptionTier === 'gold' ? (
              <button disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '2rem', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', border: 'none', fontWeight: 'bold' }}>Active Plan</button>
            ) : (
              <button onClick={() => handleUpgrade('Gold PRO', 999)} className="btn-gradient" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '2rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', border: 'none', color: '#fff' }}>Upgrade Now</button>
            )}

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '10px', fontWeight: 'bold' }}><Lock size={20} color="#eab308" /> Secure WebRTC Privacy Calling</li>
              <li style={{ display: 'flex', gap: '10px' }}><Check size={20} color="#eab308" /> Physical Holographic Sticker Delivery</li>
              <li style={{ display: 'flex', gap: '10px' }}><Check size={20} color="#eab308" /> Multi-Vehicle Support (Up to 5)</li>
              <li style={{ display: 'flex', gap: '10px' }}><Check size={20} color="#eab308" /> Zero Convenience Fee for SOS Mechanics</li>
              <li style={{ display: 'flex', gap: '10px' }}><Check size={20} color="#eab308" /> Dedicated Analytics Log</li>
            </ul>
          </div>

        </div>
      </div>

      {showPayment && (
        <PaymentModal 
          plan={selectedPlan} 
          entityId={user?._id}
          entityType="user"
          onClose={() => setShowPayment(false)} 
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
