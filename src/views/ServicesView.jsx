import React, { useState } from 'react';
import { Search, Clock, Heart, Plus, Sparkles, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ServicesView() {
  const { services, setBookingService, toggleFavorite, user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Barbing', 'Hair Dressing', 'Nail Tech', 'Makeup', 'Grooming'];

  const filteredServices = services.filter((srv) => {
    const matchesCat = selectedCategory === 'All' || srv.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-6 mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Campus Beauty & Grooming Services</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Select a service, pick your preferred stylist, and book your date & time slot.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            className="form-input pl-11"
            placeholder="Search barbing, knotless braids, nails, makeup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Category Pills - Segmented Control */}
        <div className="flex gap-2 overflow-x-auto pb-1 bg-white/[0.04] p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
                selectedCategory === cat
                  ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
                  : 'text-slate-400 hover:text-white bg-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid-2">
        {filteredServices.map((srv) => (
          <div key={srv.id} className="apple-card flex flex-col justify-between">
            <div className="relative h-48 w-full">
              <img src={srv.image} alt={srv.name} className="w-full h-full object-cover" />
              <button
                onClick={() => toggleFavorite(srv.id)}
                className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full border border-white/10 active:scale-95 transition-all"
              >
                <Heart size={16} fill={user.favorites.includes(srv.id) ? 'var(--accent)' : 'none'} className={user.favorites.includes(srv.id) ? 'text-pink-500' : 'text-white'} />
              </button>
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                <Clock size={12} className="text-amber-400" />
                <span>{srv.duration} mins</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-1">
                  {srv.category}
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">{srv.name}</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Price</span>
                  <span className="price-tag">K {srv.price}</span>
                </div>
                <button className="apple-btn-primary text-xs px-5 py-2.5" onClick={() => setBookingService(srv)}>
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
