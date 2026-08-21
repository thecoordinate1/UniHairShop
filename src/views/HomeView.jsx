import React from 'react';
import { Calendar, ShoppingBag, Sparkles, Star, Award, ShieldCheck, ArrowRight, Heart, Gift, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialTransformations } from '../data/mockData';

export default function HomeView() {
  const { setActiveTab, services, products, setBookingService, setSelectedProduct, toggleFavorite, user, addToCart } = useApp();

  const featuredServices = services.slice(0, 4);
  const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner Section */}
      <section
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          minHeight: '380px',
          display: 'flex',
          alignItems: 'center',
          padding: '32px 24px',
          background: `linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 60%, rgba(15, 23, 42, 0.2) 100%), url('/images/hero_banner.jpg') center/cover no-repeat`,
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ maxWidth: '540px', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 184, 0, 0.18)',
              border: '1px solid rgba(255, 184, 0, 0.3)',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '20px',
              marginBottom: '16px'
            }}
          >
            <Sparkles size={14} />
            <span>#1 Campus Salon & Grooming Shop Zambia</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', lineHeight: 1.15, marginBottom: '14px', color: '#fff' }}>
            Look Sharp on Campus <br />
            <span style={{ color: 'var(--primary)' }}>Book Fast & Shop Local</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', marginBottom: '24px' }}>
            On-campus grooming, hair braiding, nail tech, glam makeup & premium products tailored for Zambian university students. Low data, fast booking with Airtel, MTN & Zamtel Kwacha.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button className="btn-primary" onClick={() => setActiveTab('services')}>
              <Calendar size={18} />
              <span>Book Appointment</span>
            </button>
            <button className="btn-secondary" onClick={() => setActiveTab('shop')}>
              <ShoppingBag size={18} />
              <span>Shop Hair & Products</span>
            </button>
          </div>
        </div>
      </section>

      {/* Student Referral & Loyalty Perks Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(255, 184, 0, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'rgba(255, 184, 0, 0.15)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
            <Gift size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>Student Loyalty & Referral Perks</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Earn 1 point per K10 spent! Balance: <strong style={{ color: 'var(--primary)' }}>{user.loyaltyPoints} Points</strong>. Share code <strong style={{ color: '#00E676' }}>{user.referralCode}</strong> to get K15 off.
            </p>
          </div>
        </div>
        <button className="btn-secondary" onClick={() => setActiveTab('account')} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
          View Rewards
        </button>
      </section>

      {/* Featured Services Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Popular Campus Services</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Book in less than 60 seconds</p>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            style={{ background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>See All ({services.length})</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid-2">
          {featuredServices.map((srv) => (
            <div key={srv.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '180px' }}>
                <img
                  src={srv.image}
                  alt={srv.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
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
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '6px' }}>{srv.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    {srv.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <span className="price-tag">K {srv.price}</span>
                  <button className="btn-primary" onClick={() => setBookingService(srv)}>
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Retail Products */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Trending Student Products</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Hair oils, grooming kits & cosmetics delivered to your hostel</p>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            style={{ background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Visit Shop</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid-3">
          {featuredProducts.map((prd) => (
            <div key={prd.id} className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ position: 'relative', height: '160px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '12px' }}>
                  <img src={prd.image} alt={prd.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span
                    className={`badge ${prd.stock > 10 ? 'badge-in-stock' : prd.stock > 0 ? 'badge-low-stock' : 'badge-out-of-stock'}`}
                    style={{ position: 'absolute', top: '8px', left: '8px' }}
                  >
                    {prd.stock > 10 ? 'In Stock' : prd.stock > 0 ? `Only ${prd.stock} left` : 'Out of Stock'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#FFB800', marginBottom: '4px' }}>
                  <Star size={14} fill="#FFB800" />
                  <span style={{ fontWeight: 700 }}>{prd.rating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({prd.reviewsCount})</span>
                </div>
                <h4
                  style={{ fontSize: '1rem', color: '#fff', marginBottom: '6px', cursor: 'pointer' }}
                  onClick={() => setSelectedProduct(prd)}
                >
                  {prd.name}
                </h4>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <span className="price-tag" style={{ fontSize: '1.05rem' }}>K {prd.price}</span>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                  onClick={() => addToCart(prd)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Before & After Gallery */}
      <section style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto 20px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '6px' }}>Campus Student Transformations</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>See real results from our campus stylists and barbers</p>
        </div>

        <div className="grid-2">
          {initialTransformations.map((item) => (
            <div key={item.id} style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '10px', height: '150px', marginBottom: '12px' }}>
                <div style={{ flex: 1, borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative' }}>
                  <img src={item.beforeImg} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px' }}>Result</span>
                </div>
              </div>
              <h4 style={{ fontSize: '0.98rem', color: '#fff' }}>{item.title}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Client: {item.student}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
