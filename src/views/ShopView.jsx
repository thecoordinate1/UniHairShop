import React, { useState } from 'react';
import { Search, Star, ShoppingBag, Eye, SearchX, Tag, CheckCircle2, Truck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ShopView() {
  const { products, bundles, addToCart, addBundleToCart, setSelectedProduct, setIsCartOpen } = useApp();
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const categories = ['All', 'Hair Care Products', 'Grooming Products', 'Cosmetics', 'Essentials Bundles'];

  const filteredProducts = products
    .filter((p) => {
      const matchCat = selectedCat === 'All' || selectedCat === 'Essentials Bundles' || p.category.toLowerCase() === selectedCat.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return b.rating - a.rating;
    });

  const handleBuyNow = (prd) => {
    addToCart(prd, 1);
    setIsCartOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-8 mx-auto">
      {/* Shop Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-500 dark:text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-2">
          <Sparkles size={13} className="text-amber-500" />
          <span>Fast Campus Hostel Delivery (Free over K200)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Campus Hair & Beauty Shop</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Oils, silk bonnets, edge controls, grooming kits, and makeup essentials delivered to your room!
        </p>
      </div>

      {/* Frequently Bought Together Bundles */}
      <section className="w-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent p-5 sm:p-7 rounded-[32px] border border-amber-400/30 shadow-apple-glass">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="badge badge-low-stock text-[10px] font-bold py-0.5 px-2 mb-1">Bundle & Save</span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Frequently Bought Together</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="card p-4 flex flex-col justify-between border-amber-400/30 bg-white/80 dark:bg-[#1A1A22]/80">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="badge badge-low-stock text-[10px] font-bold py-0.5 px-2">{bundle.savings}</span>
                  <span className="price-tag text-base">K {bundle.bundlePrice}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{bundle.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{bundle.tagline}</p>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 mb-3">
                  {bundle.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="apple-btn-primary text-xs w-full py-2"
                onClick={() => addBundleToCart(bundle)}
              >
                <Tag size={13} />
                <span>Add Bundle to Bag (K {bundle.bundlePrice})</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Search & Categories Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              className="form-input pl-11"
              placeholder="Search miracle oil, silk bonnet, clippers, lip gloss..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          </div>

          <select
            className="form-select w-auto min-w-[170px] text-xs"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
          >
            <option value="popular">Sort: Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 bg-black/[0.02] dark:bg-white/[0.04] p-1.5 rounded-full border border-black/5 dark:border-white/10" role="tablist" aria-label="Product categories">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              role="tab"
              aria-selected={selectedCat === cat}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
                selectedCat === cat
                  ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon bg-amber-400/15">
            <SearchX size={28} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Products Found</h3>
          <p className="text-sm text-slate-400">
            {search ? `No results for "${search}". Try another term.` : `No items in "${selectedCat}" category yet.`}
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredProducts.map((prd) => (
            <div key={prd.id} className="apple-card p-4 flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3.5 bg-slate-800">
                  <img src={prd.image} alt={prd.name} className="w-full h-full object-cover" loading="lazy" />
                  <span
                    className={`badge ${prd.stock > 10 ? 'badge-in-stock' : prd.stock > 0 ? 'badge-low-stock' : 'badge-out-of-stock'} absolute top-2.5 left-2.5`}
                  >
                    {prd.stock > 10 ? 'In Stock' : prd.stock > 0 ? `Only ${prd.stock} left` : 'Out of Stock'}
                  </span>
                  <button
                    onClick={() => setSelectedProduct(prd)}
                    className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/10 active:scale-95 transition-all cursor-pointer"
                    aria-label={`Quick view ${prd.name}`}
                  >
                    <Eye size={12} aria-hidden="true" />
                    <span>Quick View</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-500 mb-1.5">
                  <Star size={14} fill="#F5A623" className="text-amber-500" aria-hidden="true" />
                  <span className="font-bold">{prd.rating}</span>
                  <span className="text-slate-400">({prd.reviewsCount} reviews)</span>
                </div>

                <h3
                  className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1 cursor-pointer hover:text-blue-500 transition-colors tracking-tight line-clamp-1"
                  onClick={() => setSelectedProduct(prd)}
                >
                  {prd.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {prd.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3.5 border-t border-black/5 dark:border-white/10">
                <span className="price-tag text-base">K {prd.price}</span>
                <div className="flex gap-1.5">
                  <button
                    className="apple-btn-secondary text-xs px-3 py-1.5"
                    disabled={prd.stock <= 0}
                    onClick={() => addToCart(prd)}
                    title="Add to Cart Drawer"
                  >
                    Add to Cart
                  </button>
                  <button
                    className="apple-btn-primary text-xs px-3 py-1.5"
                    disabled={prd.stock <= 0}
                    onClick={() => handleBuyNow(prd)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
