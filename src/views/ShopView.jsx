import React, { useState } from 'react';
import { Search, Star, ShoppingBag, Filter, Sparkles, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ShopView() {
  const { products, addToCart, setSelectedProduct } = useApp();
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // popular, price-low, price-high

  const categories = ['All', 'Hair Products', 'Grooming Products', 'Cosmetics'];

  const filteredProducts = products
    .filter((p) => {
      const matchCat = selectedCat === 'All' || p.category.toLowerCase() === selectedCat.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return b.rating - a.rating;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Shop Header */}
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>UniHairShop Retail Store</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Quality hair oils, clippers, cosmetics, and self-care products with Zambian hostel delivery!
        </p>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search shampoo, hair growth oil, lip gloss..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Sort: Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                background: selectedCat === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                color: selectedCat === cat ? 'var(--text-dark)' : 'var(--text-main)',
                fontWeight: selectedCat === cat ? 700 : 500,
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

      {/* Products Grid */}
      <div className="grid-3">
        {filteredProducts.map((prd) => (
          <div key={prd.id} className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ position: 'relative', height: '180px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '12px' }}>
                <img src={prd.image} alt={prd.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span
                  className={`badge ${prd.stock > 10 ? 'badge-in-stock' : prd.stock > 0 ? 'badge-low-stock' : 'badge-out-of-stock'}`}
                  style={{ position: 'absolute', top: '8px', left: '8px' }}
                >
                  {prd.stock > 10 ? 'In Stock' : prd.stock > 0 ? `Only ${prd.stock} left` : 'Out of Stock'}
                </span>
                <button
                  onClick={() => setSelectedProduct(prd)}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={12} />
                  <span>Quick View</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#FFB800', marginBottom: '4px' }}>
                <Star size={14} fill="#FFB800" />
                <span style={{ fontWeight: 700 }}>{prd.rating}</span>
                <span style={{ color: 'var(--text-muted)' }}>({prd.reviewsCount} reviews)</span>
              </div>

              <h3
                style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '6px', cursor: 'pointer' }}
                onClick={() => setSelectedProduct(prd)}
              >
                {prd.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {prd.description.length > 70 ? `${prd.description.substring(0, 70)}...` : prd.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <span className="price-tag">K {prd.price}</span>
              <button
                className="btn-secondary"
                disabled={prd.stock <= 0}
                onClick={() => addToCart(prd)}
              >
                {prd.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
