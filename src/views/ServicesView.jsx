import React, { useState } from 'react';
import { Search, Clock, Heart, Sparkles, SearchX, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CampusTransformationFeed from '../components/CampusTransformationFeed';

export default function ServicesView() {
  const { services, setBookingService, setSelectedService, toggleFavorite, user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Barbering',
    'Braids & Natural Hair',
    'Wigs & Weaves',
    'Locs',
    'Nails & Lashes',
    'Hair Care Products'
  ];

  const filteredServices = services.filter((srv) => {
    const matchesCat = selectedCategory === 'All' || srv.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-8 mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-500 dark:text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            <Sparkles size={13} className="text-amber-500" />
            <span>Verified Campus Stylists & In-Dorm Appointments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Campus Beauty & Grooming Services</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Pick your hairstyle or beauty service, choose your stylist, and book your date & time slot.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            className="form-input pl-11"
            placeholder="Search barbing, knotless braids, nails, makeup, locs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search services"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        </div>

        {/* Category Pills - Segmented Control */}
        <div className="flex gap-2 overflow-x-auto pb-1 bg-black/[0.02] dark:bg-white/[0.04] p-1.5 rounded-full border border-black/5 dark:border-white/10" role="tablist" aria-label="Service categories">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              role="tab"
              aria-selected={selectedCategory === cat}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
                selectedCategory === cat
                  ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon bg-amber-400/15">
            <SearchX size={28} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Services Found</h3>
          <p className="text-sm text-slate-400">
            {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : `No services in "${selectedCategory}" category yet.`}
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredServices.map((srv) => (
            <div key={srv.id} className="apple-card flex flex-col justify-between">
              <div
                className="relative h-48 w-full bg-slate-800 cursor-pointer"
                onClick={() => setSelectedService(srv)}
                title="Tap to view full service details"
              >
                <img src={srv.image} alt={srv.name} className="w-full h-full object-cover" loading="lazy" />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(srv.id); }}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full border border-white/10 active:scale-95 transition-all"
                  aria-label={user?.favorites?.includes(srv.id) ? `Remove ${srv.name} from favorites` : `Add ${srv.name} to favorites`}
                >
                  <Heart size={16} fill={user?.favorites?.includes(srv.id) ? 'var(--accent)' : 'none'} className={user?.favorites?.includes(srv.id) ? 'text-pink-500' : 'text-white'} aria-hidden="true" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                  <Clock size={12} className="text-amber-400" aria-hidden="true" />
                  <span>{srv.duration} mins</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">
                      {srv.category}
                    </span>
                    {srv.canTravel && (
                      <span className="badge badge-in-stock text-[9px] py-0.2 px-1.5 flex items-center gap-1">
                        <Truck size={10} />
                        <span>Travels to Dorm</span>
                      </span>
                    )}
                  </div>
                  <h3
                    onClick={() => setSelectedService(srv)}
                    className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight cursor-pointer hover:text-amber-500 transition-colors"
                  >
                    {srv.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/10">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Starts at</span>
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
      )}

      {/* Campus Lookbook / Transformation Feed */}
      <div className="pt-4 border-t border-black/10 dark:border-white/10">
        <CampusTransformationFeed
          title="Campus Hair Transformation Lookbook"
          subtitle="Explore real student transformations. Click 'Book This Look' to schedule with the stylist!"
        />
      </div>
    </div>
  );
}
