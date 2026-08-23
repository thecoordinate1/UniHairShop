import React, { useState } from 'react';
import {
  Calendar,
  ShoppingBag,
  Sparkles,
  Star,
  ShieldCheck,
  ArrowRight,
  Heart,
  Gift,
  Clock,
  MapPin,
  CheckCircle2,
  Filter,
  Search,
  Truck,
  Store,
  ChevronRight,
  ShieldAlert,
  Zap,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialTransformations } from '../data/mockData';

export default function HomeView() {
  const {
    setActiveTab,
    services,
    bundles,
    staffList,
    setBookingService,
    setSelectedStylist,
    setSelectedProduct,
    toggleFavorite,
    user,
    addToCart,
    addBundleToCart,
    currentCampus,
    filterCategory,
    setFilterCategory,
    serviceTypeFilter,
    setServiceTypeFilter,
    priceFilter,
    setPriceFilter,
    ratingFilter,
    setRatingFilter,
    availabilityFilter,
    setAvailabilityFilter,
    setShowSafetyModal
  } = useApp();

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

  // Granular Filter Pipeline
  const filteredServices = services.filter((srv) => {
    // 1. Category
    const matchesCategory = filterCategory === 'All' || srv.category.toLowerCase() === filterCategory.toLowerCase();

    // 2. Search query
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Service Type
    let matchesServiceType = true;
    if (serviceTypeFilter === 'travel') matchesServiceType = srv.canTravel;
    if (serviceTypeFilter === 'studio') matchesServiceType = srv.inStudio;

    // 4. Price range
    let matchesPrice = true;
    if (priceFilter === 'under100') matchesPrice = srv.price < 100;
    if (priceFilter === '100to200') matchesPrice = srv.price >= 100 && srv.price <= 200;
    if (priceFilter === 'over200') matchesPrice = srv.price > 200;

    return matchesCategory && matchesSearch && matchesServiceType && matchesPrice;
  });

  return (
    <div className="w-full flex flex-col gap-8 mx-auto">
      {/* Hero Banner Section */}
      <section
        className="w-full relative rounded-[36px] overflow-hidden min-h-[440px] flex items-center p-6 sm:p-12 border border-black/10 dark:border-white/15 shadow-apple-glass mx-auto"
        style={{
          background: `linear-gradient(105deg, rgba(10, 10, 12, 0.95) 0%, rgba(10, 10, 12, 0.8) 55%, rgba(10, 10, 12, 0.4) 100%), url('/images/hero_banner.jpg') center/cover no-repeat`
        }}
      >
        <div className="max-w-xl w-full z-10 text-white">
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 backdrop-blur-xl shadow-sm">
            <Sparkles size={14} className="text-amber-400" aria-hidden="true" />
            <span>#1 Campus Grooming App — {currentCampus}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] mb-4 font-heading tracking-tight text-white">
            Campus Grooming, <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              In Your Dorm or Studio.
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm mb-6 max-w-lg leading-relaxed font-normal">
            Book verified campus barbers, knotless braiders, and nail techs traveling directly to your hostel room. Instant mobile booking with Airtel Money, MTN MoMo, and Zamtel Kwacha.
          </p>

          {/* Quick Search & Filter in Hero */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-2 rounded-2xl flex flex-wrap items-center gap-2 max-w-lg mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-1 min-w-[180px]">
              <Search size={16} className="text-amber-300 shrink-0" />
              <input
                type="text"
                placeholder="Search braids, taper fade, nails..."
                className="bg-transparent border-0 text-white text-xs outline-none w-full placeholder:text-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search campus services"
              />
            </div>
            <button
              onClick={() => setActiveTab('services')}
              className="apple-btn-primary text-xs px-4 py-2"
            >
              Explore All
            </button>
          </div>

          {/* Service Mode Selector Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Service Mode:</span>
            <button
              onClick={() => setServiceTypeFilter(serviceTypeFilter === 'travel' ? 'All' : 'travel')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                serviceTypeFilter === 'travel'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
              }`}
            >
              <Truck size={13} />
              <span>Travels to Dorm</span>
            </button>

            <button
              onClick={() => setServiceTypeFilter(serviceTypeFilter === 'studio' ? 'All' : 'studio')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                serviceTypeFilter === 'studio'
                  ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                  : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
              }`}
            >
              <Store size={13} />
              <span>Visit Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* Safety & Student Guarantee Bar */}
      <section
        onClick={() => setShowSafetyModal(true)}
        className="w-full card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/40 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <div className="bg-emerald-500/15 p-2.5 rounded-2xl text-emerald-500 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight m-0">100% Verified Campus Stylists & Safety Guarantee</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Student ID authenticated stylists • In-dorm peer safety code • Free 12-hr cancellation</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
          <span>Read Safety Code</span>
          <ChevronRight size={14} />
        </div>
      </section>

      {/* Verified Campus Stylists Spotlight Carousel */}
      <section className="w-full mx-auto">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 uppercase tracking-wider mb-0.5">
              <Zap size={14} />
              <span>Top Campus Creators</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Verified Campus Stylists</h2>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            className="text-[#007AFF] font-semibold text-xs flex items-center gap-1 bg-transparent border-0 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {staffList.map((stylist) => (
            <div
              key={stylist.id}
              onClick={() => setSelectedStylist(stylist)}
              className="apple-card p-4 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3 bg-slate-800">
                  <img src={stylist.avatar} alt={stylist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <span className="badge badge-verified absolute top-2.5 left-2.5 text-[10px]">
                    <ShieldCheck size={11} />
                    <span>{stylist.badge}</span>
                  </span>
                  <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white flex items-center gap-1">
                    <MapPin size={11} className="text-amber-400" />
                    <span className="truncate max-w-[130px]">{stylist.dormLocation}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">{stylist.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold shrink-0">
                    <Star size={13} fill="#F5A623" />
                    <span>{stylist.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">{stylist.role}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {stylist.specialties.slice(0, 2).map((spec, i) => (
                    <span key={i} className="text-[10px] bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10 text-xs">
                <span className="text-slate-400">Replies in {stylist.responseTime}</span>
                <span className="text-[#007AFF] font-bold">View Portfolio →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Granular Service Category Filter Bar */}
      <section className="w-full mx-auto">
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Book Popular Campus Services</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select your hairstyle or treatment & pick a convenient time</p>
            </div>

            {/* Quick Price Filters */}
            <div className="flex items-center gap-1.5 text-xs">
              {['All', 'under100', '100to200', 'over200'].map((pKey) => {
                const labels = { All: 'All Prices', under100: 'Under K100', '100to200': 'K100 - K200', over200: 'K200+' };
                return (
                  <button
                    key={pKey}
                    onClick={() => setPriceFilter(pKey)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border-0 cursor-pointer ${
                      priceFilter === pKey
                        ? 'bg-[#007AFF] text-white shadow-apple-blue'
                        : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {labels[pKey]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 bg-black/[0.02] dark:bg-white/[0.04] p-1.5 rounded-full border border-black/5 dark:border-white/10" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                role="tab"
                aria-selected={filterCategory === cat}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
                  filterCategory === cat
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
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No services match your filters</h3>
            <p className="text-xs text-slate-400 mb-3">Try clearing category or price filters to see more results.</p>
            <button
              className="apple-btn-secondary text-xs"
              onClick={() => { setFilterCategory('All'); setPriceFilter('All'); setServiceTypeFilter('All'); setSearchQuery(''); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {filteredServices.map((srv) => (
              <div key={srv.id} className="apple-card flex flex-col justify-between">
                <div className="relative h-48 w-full">
                  <img src={srv.image} alt={srv.name} className="w-full h-full object-cover" loading="lazy" />
                  <button
                    onClick={() => toggleFavorite(srv.id)}
                    className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full border border-white/10 active:scale-95 transition-all"
                    aria-label="Save to favorites"
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
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">
                        {srv.category}
                      </span>
                      {srv.canTravel && (
                        <span className="badge badge-in-stock text-[9px] py-0.2 px-1.5">Travels to Dorm</span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{srv.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/10">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Starts at</span>
                      <span className="price-tag">K {srv.price}</span>
                    </div>
                    <button className="apple-btn-primary text-xs px-5 py-2.5" onClick={() => setBookingService(srv)}>
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Frequently Bought Together Bundles Section */}
      <section className="w-full bg-gradient-to-br from-amber-500/10 via-transparent to-amber-500/5 rounded-[32px] p-6 sm:p-8 border border-amber-400/25 shadow-apple-glass">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">Student Hair Essentials</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Frequently Bought Together Bundles</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bundle your favorite night care, bonnets, oils & clippers for up to 20% savings!</p>
          </div>
        </div>

        <div className="grid-2">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="card p-5 flex flex-col justify-between border-amber-400/30">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="badge badge-low-stock text-[10px] font-bold py-0.5 px-2 mb-1.5">{bundle.savings}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{bundle.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{bundle.tagline}</p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 text-xs text-slate-700 dark:text-slate-300">
                  {bundle.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10">
                <div>
                  <span className="text-xs text-slate-400 line-through mr-2">K {bundle.originalPrice}</span>
                  <span className="price-tag text-lg">K {bundle.bundlePrice}</span>
                </div>
                <button
                  className="apple-btn-primary text-xs px-4 py-2"
                  onClick={() => addBundleToCart(bundle)}
                >
                  <Tag size={13} />
                  <span>Add Bundle</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Transformations */}
      <section className="w-full card p-6 sm:p-8">
        <div className="text-center max-w-md mx-auto mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Campus Student Transformations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real results from our campus stylists across Lusaka hostels</p>
        </div>

        <div className="grid-2">
          {initialTransformations.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
              <div className="h-44 rounded-xl overflow-hidden relative mb-3 bg-slate-800">
                <img src={item.beforeImg} alt={`${item.title} transformation result`} className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Verified Result
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{item.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Student Client: {item.student}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
