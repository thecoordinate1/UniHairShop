import React, { useState } from 'react';
import { Search, Clock, Heart, Plus, Sparkles, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ServicesView() {
  const { services, setBookingService, toggleFavorite, user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extensible categories list
  const categories = ['All', 'Barbing', 'Hair Dressing', 'Nail Tech', 'Makeup', 'Grooming'];

  const filteredServices = services.filter((srv) => {
    const matchesCat = selectedCategory === 'All' || srv.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>Campus Beauty & Grooming Services</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Select a service, pick your preferred stylist, and book your date & time slot.
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search barbing, knotless braids, nails, makeup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                color: selectedCategory === cat ? 'var(--text-dark)' : 'var(--text-main)',
                fontWeight: selectedCategory === cat ? 700 : 500,
                fontSize: '0.82rem',
                padding: '6px 14px',
                borderRadius: '20px',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid-2">
        {filteredServices.map((srv) => (
          <div key={srv.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', height: '180px' }}>
              <img src={srv.image} alt={srv.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => toggleFavorite(srv.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: user.favorites.includes(srv.id) ? 'var(--accent)' : '#fff',
                  padding: '8px',
                  borderRadius: '50%'
                }}
              >
                <Heart size={16} fill={user.favorites.includes(srv.id) ? 'var(--accent)' : 'none'} />
              </button>
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Clock size={12} />
                <span>{srv.duration} mins</span>
              </div>
            </div>

            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  {srv.category}
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '6px' }}>{srv.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  {srv.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Price</span>
                  <span className="price-tag">K {srv.price}</span>
                </div>
                <button className="btn-primary" onClick={() => setBookingService(srv)}>
                  Book Service
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
