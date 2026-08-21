import React from 'react';
import { MapPin, Clock, Phone, MessageCircle, Mail, Sparkles, Award } from 'lucide-react';

export default function AboutView() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>About UniHairShop</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Your premium on-campus hair grooming & beauty hub in Zambia. Combining top barbering, hair styling, nail art, and e-commerce for university students.
        </p>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <MapPin size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Campus Location</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>UNZA Great East Campus / Student Centre Building, Shop 4B</p>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Conveniently located near campus hostels so students can drop by between lectures or get quick hostel delivery!
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Clock size={24} style={{ color: '#00E676' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Opening Hours</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monday – Saturday: 08:00 AM – 19:30 PM</p>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Open late for evening haircut appointments before campus weekend events!
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '14px' }}>Direct Campus Contact & Support</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href="https://wa.me/260971234567"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '0.9rem' }}
          >
            <div style={{ background: '#25D366', padding: '8px', borderRadius: '50%', color: '#fff' }}>
              <MessageCircle size={18} />
            </div>
            <span>WhatsApp Customer Desk: +260 971 234 567</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '0.9rem' }}>
            <div style={{ background: 'rgba(255, 184, 0, 0.2)', padding: '8px', borderRadius: '50%', color: 'var(--primary)' }}>
              <Phone size={18} />
            </div>
            <span>Airtel / MTN Helpline: 0971234567 / 0961234567</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', fontSize: '0.9rem' }}>
            <div style={{ background: 'rgba(255, 62, 108, 0.2)', padding: '8px', borderRadius: '50%', color: 'var(--accent)' }}>
              <Mail size={18} />
            </div>
            <span>Email: info@unihairshop.co.zm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
