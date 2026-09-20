import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, ShieldCheck, Zap, PhoneCall, Award } from 'lucide-react';

export default function EnhancedFAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'privacy', label: 'Privacy & Smart Tag' },
    { id: 'sos', label: 'Highway SOS & Patrol' },
    { id: 'pricing', label: 'Pricing & Delivery' }
  ];

  const faqs = [
    {
      category: 'privacy',
      q: 'Will anyone be able to see my personal phone number when they scan the tag or call me?',
      a: 'NO, NEVER. When someone scans your Parxéé Smart Tag, they are routed through our encrypted WebRTC Voice Bridge. Calls and WhatsApp alerts are 100% masked. Neither party can ever view or access the other person’s private phone number.'
    },
    {
      category: 'privacy',
      q: 'Does a passerby or guard need to download any mobile app to contact me?',
      a: 'No app is required! Anyone with any smartphone (iPhone or Android) can simply open their default camera app, point it at your windshield Smart Tag, and initiate an encrypted call or WhatsApp notice in 3 seconds.'
    },
    {
      category: 'sos',
      q: 'How fast does a mechanic or towing unit arrive during a Highway emergency?',
      a: 'Our average highway arrival time is 14 to 20 minutes on major national expressways (Delhi-Jaipur, Yamuna Expressway, Mumbai-Pune Expressway, Bangalore Highway, etc.) and 10 to 15 minutes inside metro city limits.'
    },
    {
      category: 'sos',
      q: 'What if I am stranded in an area with poor mobile network?',
      a: 'Our system uses lightweight satellite GPS coordinate caching. Once SOS is pressed, your coordinates are locked and broadcast directly to our central control room and the nearest 3 active patrol units on duty.'
    },
    {
      category: 'pricing',
      q: 'What happens if my physical metallic sticker gets damaged or if I sell my car?',
      a: 'You can instantly update your car plate number, mobile number, or re-assign your Smart Tag anytime from your Profile dashboard in 1 tap. If your sticker is damaged, we provide a free digital duplicate and discounted replacement delivery.'
    },
    {
      category: 'pricing',
      q: 'Is there a refund policy if I am not satisfied with the service?',
      a: 'Yes, we offer a 100% Hassle-Free 7-Day Money Back Guarantee on all subscriptions. If you are not satisfied for any reason, reach out to support@parxeecity.com for an immediate full refund.'
    }
  ];

  const filteredFaqs = faqs.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="reveal" style={{ margin: '4rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(20, 184, 166, 0.12)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            padding: '6px 16px',
            borderRadius: '100px',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <HelpCircle size={16} />
            CLEAR ANSWERS & COMMON QUESTIONS
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', margin: '0 auto', lineHeight: '1.6' }}>
            Everything you need to know about our privacy shield, roadside response, and smart tags.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                border: activeCategory === c.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                background: activeCategory === c.id ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255,255,255,0.03)',
                color: activeCategory === c.id ? 'var(--primary)' : '#9ca3af',
                transition: 'all 0.2s'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="glass-premium"
                style={{
                  borderRadius: '16px',
                  border: isOpen ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isOpen ? 'rgba(20, 184, 166, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: '#fff',
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    gap: '1rem'
                  }}
                >
                  <span>{faq.q}</span>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isOpen ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} color="#9ca3af" />}
                  </div>
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 1.5rem 1.25rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.92rem',
                    lineHeight: '1.6',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    paddingTop: '1rem'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
