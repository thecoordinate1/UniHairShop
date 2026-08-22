import React from 'react';
import { Calendar, ShoppingBag, Sparkles, Star, Award, ShieldCheck, ArrowRight, Heart, Gift, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialTransformations } from '../data/mockData';

export default function HomeView() {
  const { setActiveTab, services, products, setBookingService, setSelectedProduct, toggleFavorite, user, addToCart, currentCampus } = useApp();

  const featuredServices = services.slice(0, 4);
  const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="w-full flex flex-col gap-8 mx-auto">
      {/* Hero Banner Section - Apple Glass Hero */}
      <section
        className="w-full relative rounded-[36px] overflow-hidden min-h-[420px] flex items-center p-7 sm:p-12 border border-white/15 shadow-apple-glass mx-auto"
        style={{
          background: `linear-gradient(100deg, rgba(10, 10, 12, 0.95) 0%, rgba(10, 10, 12, 0.8) 50%, rgba(10, 10, 12, 0.4) 100%), url('/images/hero_banner.jpg') center/cover no-repeat`
        }}
      >
        <div className="max-w-xl w-full z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 backdrop-blur-xl shadow-sm">
            <Sparkles size={14} className="text-amber-400" />
            <span>#1 Campus Beauty & Grooming — {currentCampus}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] mb-5 text-white font-heading tracking-tight">
            Look Sharp on Campus. <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Book Fast & Shop Local</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-lg leading-relaxed font-normal">
            On-campus hair grooming, knotless braids, nail tech, glam makeup & retail products tailored for Zambian university students. Low data, instant mobile booking with Airtel, MTN & Zamtel Kwacha.
          </p>

          <div className="flex flex-wrap gap-3.5">
            <button className="apple-btn-primary" onClick={() => setActiveTab('services')}>
              <Calendar size={18} />
              <span>Book Appointment</span>
            </button>
            <button className="apple-btn-secondary" onClick={() => setActiveTab('shop')}>
              <ShoppingBag size={18} />
              <span>Shop Products</span>
            </button>
          </div>
        </div>
      </section>

      {/* Student Referral & Loyalty Perks Banner */}
      <section className="w-full bg-white/[0.04] backdrop-blur-2xl border border-amber-400/25 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 mx-auto shadow-apple-glass">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400/15 border border-amber-400/30 p-3.5 rounded-2xl text-amber-300 shrink-0">
            <Gift size={26} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Student Loyalty & Referral Perks</h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Earn 1 point per K10 spent! Balance: <strong className="text-amber-300 font-bold">{user.loyaltyPoints} Points</strong>. Share code <strong className="text-emerald-400 font-bold">{user.referralCode}</strong> for K15 off.
            </p>
          </div>
        </div>
        <button className="apple-btn-secondary text-xs px-4 py-2 shrink-0" onClick={() => setActiveTab('account')}>
          View Rewards
        </button>
      </section>

      {/* Featured Services Section */}
      <section className="w-full mx-auto">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Popular Campus Services</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Book in less than 60 seconds</p>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            className="text-[#007AFF] hover:text-blue-400 font-semibold text-sm flex items-center gap-1 bg-transparent border-0 cursor-pointer transition-colors"
          >
            <span>See All ({services.length})</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid-2">
          {featuredServices.map((srv) => (
            <div key={srv.id} className="apple-card flex flex-col justify-between">
              <div className="relative h-48 w-full">
                <img
                  src={srv.image}
                  alt={srv.name}
                  className="w-full h-full object-cover"
                />
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
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="price-tag">K {srv.price}</span>
                  <button className="apple-btn-primary text-xs px-4 py-2" onClick={() => setBookingService(srv)}>
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Retail Products */}
      <section className="w-full mx-auto">
        <div className="flex justify-between items-end mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Trending Student Products</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Hair oils, grooming kits & cosmetics delivered to your hostel</p>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            className="text-[#007AFF] hover:text-blue-400 font-semibold text-sm flex items-center gap-1 bg-transparent border-0 cursor-pointer transition-colors"
          >
            <span>Visit Shop</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid-3">
          {featuredProducts.map((prd) => (
            <div key={prd.id} className="apple-card p-4 flex flex-col justify-between">
              <div>
                <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3">
                  <img src={prd.image} alt={prd.name} className="w-full h-full object-cover" />
                  <span
                    className={`badge ${prd.stock > 10 ? 'badge-in-stock' : prd.stock > 0 ? 'badge-low-stock' : 'badge-out-of-stock'} absolute top-2.5 left-2.5`}
                  >
                    {prd.stock > 10 ? 'In Stock' : prd.stock > 0 ? `Only ${prd.stock} left` : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400 mb-1.5">
                  <Star size={14} fill="#F5A623" className="text-amber-400" />
                  <span className="font-bold">{prd.rating}</span>
                  <span className="text-slate-400">({prd.reviewsCount})</span>
                </div>
                <h4
                  className="text-sm font-bold text-white mb-1 cursor-pointer hover:text-blue-400 transition-colors tracking-tight"
                  onClick={() => setSelectedProduct(prd)}
                >
                  {prd.name}
                </h4>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                <span className="price-tag text-base">K {prd.price}</span>
                <button
                  className="apple-btn-secondary text-xs px-3.5 py-1.5"
                  onClick={() => addToCart(prd)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Transformations */}
      <section className="w-full bg-white/[0.04] backdrop-blur-2xl rounded-[32px] p-7 border border-white/10 mx-auto shadow-apple-glass">
        <div className="text-center max-w-md mx-auto mb-6">
          <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Campus Student Transformations</h2>
          <p className="text-xs text-slate-400">Real results from our campus stylists at {currentCampus}</p>
        </div>

        <div className="grid-2">
          {initialTransformations.map((item) => (
            <div key={item.id} className="bg-white/[0.04] rounded-2xl p-4 border border-white/10">
              <div className="flex gap-2.5 h-40 mb-3">
                <div className="flex-1 rounded-xl overflow-hidden relative">
                  <img src={item.beforeImg} alt="Result" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">Result</span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Client: {item.student}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
