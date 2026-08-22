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
    <div className="w-full flex flex-col gap-6 mx-auto">
      {/* Shop Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">UniHairShop Retail Store</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Quality hair oils, clippers, cosmetics, and self-care products with Zambian hostel delivery!
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              className="form-input pl-11"
              placeholder="Search shampoo, hair growth oil, lip gloss..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <select
            className="form-select w-auto min-w-[170px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Sort: Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Category Pills - iOS Segmented Control */}
        <div className="flex gap-2 overflow-x-auto pb-1 bg-white/[0.04] p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
                selectedCat === cat
                  ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
                  : 'text-slate-400 hover:text-white bg-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid-3">
        {filteredProducts.map((prd) => (
          <div key={prd.id} className="apple-card p-4 flex flex-col justify-between">
            <div>
              <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3.5">
                <img src={prd.image} alt={prd.name} className="w-full h-full object-cover" />
                <span
                  className={`badge ${prd.stock > 10 ? 'badge-in-stock' : prd.stock > 0 ? 'badge-low-stock' : 'badge-out-of-stock'} absolute top-2.5 left-2.5`}
                >
                  {prd.stock > 10 ? 'In Stock' : prd.stock > 0 ? `Only ${prd.stock} left` : 'Out of Stock'}
                </span>
                <button
                  onClick={() => setSelectedProduct(prd)}
                  className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/10 active:scale-95 transition-all"
                >
                  <Eye size={12} />
                  <span>Quick View</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-xs text-amber-400 mb-1.5">
                <Star size={14} fill="#F5A623" className="text-amber-400" />
                <span className="font-bold">{prd.rating}</span>
                <span className="text-slate-400">({prd.reviewsCount} reviews)</span>
              </div>

              <h3
                className="text-base font-bold text-white mb-1.5 cursor-pointer hover:text-blue-400 transition-colors tracking-tight"
                onClick={() => setSelectedProduct(prd)}
              >
                {prd.name}
              </h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                {prd.description.length > 75 ? `${prd.description.substring(0, 75)}...` : prd.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3.5 border-t border-white/10">
              <span className="price-tag text-base">K {prd.price}</span>
              <button
                className="apple-btn-secondary text-xs px-4 py-2"
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
