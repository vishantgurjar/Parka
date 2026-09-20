import React, { useState } from 'react';
import { MapPin, Search, CheckCircle2, ShieldCheck, Clock, Navigation, AlertCircle } from 'lucide-react';

export default function ServiceCoverageChecker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  const coverageDatabase = [
    {
      name: 'Delhi NCR (Delhi, Noida, Gurgaon, Faridabad, Ghaziabad)',
      type: 'Metro Grid',
      status: 'High Density (24/7 Active)',
      responseSLA: '10 - 15 Mins',
      mechanicsCount: '480+ Active Patrols',
      towingAvailable: true,
      tags: ['delhi', 'noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad', 'ncr', '110001', '201301', '122001']
    },
    {
      name: 'Mumbai - Pune Expressway & MMR Region',
      type: 'Expressway & City Grid',
      status: 'High Density (24/7 Active)',
      responseSLA: '12 - 18 Mins',
      mechanicsCount: '390+ Active Patrols',
      towingAvailable: true,
      tags: ['mumbai', 'pune', 'navi mumbai', 'thane', 'lonavala', 'expressway', '400001', '411001']
    },
    {
      name: 'Bengaluru Tech Corridor & Airport Expressway',
      type: 'Metro Grid',
      status: 'High Density (24/7 Active)',
      responseSLA: '12 - 16 Mins',
      mechanicsCount: '340+ Active Patrols',
      towingAvailable: true,
      tags: ['bangalore', 'bengaluru', 'whitefield', 'electronic city', 'koramangala', 'airport', '560001']
    },
    {
      name: 'Yamuna Expressway & Delhi-Agra-Jaipur Golden Triangle',
      type: 'National Expressway Corridor',
      status: 'Dedicated Highway Patrol (24/7)',
      responseSLA: '15 - 20 Mins',
      mechanicsCount: '210+ Highway Units',
      towingAvailable: true,
      tags: ['yamuna expressway', 'agra', 'jaipur', 'mathura', 'highway', 'nh48', 'delhi agra']
    },
    {
      name: 'Hyderabad & ORR (Outer Ring Road)',
      type: 'Metro & Expressway',
      status: 'High Density (24/7 Active)',
      responseSLA: '14 - 18 Mins',
      mechanicsCount: '260+ Active Patrols',
      towingAvailable: true,
      tags: ['hyderabad', 'secunderabad', 'orr', 'hitech city', 'gachibowli', '500001']
    },
    {
      name: 'Chandigarh Tri-City & Delhi-Chandigarh NH44',
      type: 'Corridor & City Grid',
      status: 'High Density (24/7 Active)',
      responseSLA: '12 - 17 Mins',
      mechanicsCount: '190+ Active Patrols',
      towingAvailable: true,
      tags: ['chandigarh', 'mohali', 'panchkula', 'nh44', 'ambala', 'karnal', '160001']
    }
  ];

  const filteredCities = searchQuery.trim() === ''
    ? coverageDatabase
    : coverageDatabase.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <section className="reveal" style={{ margin: '4rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '6px 16px',
            borderRadius: '100px',
            color: '#38bdf8',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <MapPin size={16} />
            SERVICE COVERAGE RADAR
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>
            Check Active Assistance in <span className="text-gradient">Your City / Highway</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            We provide verified 24/7 roadside assistance across all major metros and national expressway corridors in India.
          </p>
        </div>

        {/* Search Input Box */}
        <div style={{ maxWidth: '600px', margin: '0 auto 2.5rem', position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            padding: '8px 16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 20px rgba(56, 189, 248, 0.1)'
          }}>
            <Search size={22} color="var(--primary)" style={{ marginRight: '12px', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search your city, expressway, or pin code (e.g. Delhi, Pune, Yamuna, 110001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                padding: '8px 0'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Coverage Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredCities.length > 0 ? (
            filteredCities.map((item, idx) => (
              <div
                key={idx}
                className="glass-premium"
                style={{
                  padding: '1.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(3, 7, 18, 0.6) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s ease, border-color 0.3s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: 'var(--primary)',
                      background: 'rgba(20, 184, 166, 0.12)',
                      padding: '4px 10px',
                      borderRadius: '50px',
                      textTransform: 'uppercase'
                    }}>
                      {item.type}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      ● 24/7 Verified
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {item.name}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                        Avg Arrival SLA
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: '#f59e0b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {item.responseSLA}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                        Active Units
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: '#38bdf8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={14} />
                        {item.mechanicsCount}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.7)',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '10px'
                }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>Hydraulic Flatbed Towing & Crane Ready</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem 2rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '20px',
              border: '1px dashed rgba(255,255,255,0.1)'
            }}>
              <AlertCircle size={40} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                All India Highway Emergency Protocol Active
              </h4>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
                Even outside listed metro hubs, our Pan-India GPS SOS relay automatically routes your distress call to the closest local certified mechanics within 25 km.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
