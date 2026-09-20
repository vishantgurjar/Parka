import React from 'react';
import { Star, ShieldCheck, CheckCircle2, User } from 'lucide-react';

export default function CustomerTestimonialsGrid() {
  const reviews = [
    {
      name: 'Rohan Malhotra',
      role: 'Software Architect, Gurugram',
      vehicle: 'Tata Nexon EV Max',
      location: 'Delhi-Jaipur Expressway',
      rating: 5,
      story: 'My battery was low and a tyre punctured at 11 PM on the Jaipur Highway. Tapped Parxéé SOS — within 16 minutes a verified mechanic arrived with hydraulic jack and puncture kit. Lifesaver for my family!',
      date: 'Verified 2 weeks ago'
    },
    {
      name: 'Dr. Ananya Sen',
      role: 'Consultant Cardiologist, Mumbai',
      vehicle: 'Hyundai Creta Turbo',
      location: 'Bandra-Kurla Complex',
      rating: 5,
      story: 'I hate writing my personal phone number on my car dashboard. With Parxéé Smart Tag, someone notified me on WhatsApp about my car window being left open in heavy rain without exposing my number at all.',
      date: 'Verified 1 month ago'
    },
    {
      name: 'Vikramjit Singh',
      role: 'Fleet Manager, Chandigarh',
      vehicle: 'Mahindra XUV700 AX7',
      location: 'Ambala-Chandigarh NH44',
      rating: 5,
      story: 'We ordered Diamond passes for our 4 family cars. The metallic QR stickers look super sleek on the windshield, and the 24/7 highway response gives genuine peace of mind on long road trips.',
      date: 'Verified 3 weeks ago'
    }
  ];

  return (
    <section className="reveal" style={{ margin: '4rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '6px 16px',
            borderRadius: '100px',
            color: '#f59e0b',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <Star size={16} fill="#f59e0b" />
            VERIFIED CAR OWNER STORIES
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>
            Trusted by Over <span className="text-gradient">18,400+ Vehicle Owners</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Real reviews from daily commuters and highway travellers across India.
          </p>
        </div>

        {/* Reviews Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {reviews.map((r, i) => (
            <div
              key={i}
              className="glass-premium"
              style={{
                padding: '2rem',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(3, 7, 18, 0.7) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Rating & Verified Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} size={16} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#10b981',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle2 size={14} /> Verified Member
                  </span>
                </div>

                <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  "{r.story}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    color: '#000',
                    fontSize: '1.1rem'
                  }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                      {r.name}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600', marginTop: '2px' }}>
                      🚗 {r.vehicle} • {r.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
