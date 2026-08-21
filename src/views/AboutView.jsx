import React from 'react';
import { MapPin, Clock, Phone, MessageCircle, Mail, Sparkles, Award, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AboutView() {
  const { lusakaUniversities, currentCampus, setCurrentCampus, addToast } = useApp();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>UniHairShop Lusaka Campuses</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          On-campus grooming, hair dressing, nail tech, and e-commerce for university students across Lusaka, Zambia.
        </p>
      </div>

      {/* Lusaka Universities List with UNILUS Silverest at Top */}
      <div className="card" style={{ padding: '20px', border: '1px solid rgba(255, 184, 0, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <GraduationCap size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Supported Lusaka Universities & Campuses</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fast hostel delivery & bookable salon branches</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {lusakaUniversities.map((uni, idx) => (
            <div
              key={uni.id}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: idx === 0 ? 'rgba(255, 184, 0, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                border: idx === 0 ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.98rem', color: idx === 0 ? 'var(--primary)' : '#fff' }}>{uni.name}</h4>
                  {idx === 0 && (
                    <span className="badge badge-low-stock" style={{ fontSize: '0.7rem' }}>Primary Hub</span>
                  )}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Area: {uni.area}</p>
              </div>

              <button
                className={currentCampus === uni.name ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                onClick={() => {
                  setCurrentCampus(uni.name);
                  addToast(`Selected ${uni.name}!`, 'success');
                }}
              >
                {currentCampus === uni.name ? 'Active' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <MapPin size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>UNILUS Silverest Main Hub</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>University of Lusaka — Silverest Campus, Student Centre</p>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Our main flagship campus salon location at Silverest Campus! Quick delivery to all hostel blocks.
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
            Open late for evening haircut appointments before weekend events!
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
