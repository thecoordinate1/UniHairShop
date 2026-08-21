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
      {/* Hero Banner Section */}
      <section
        className="w-full relative rounded-3xl overflow-hidden min-h-[380px] flex items-center p-6 sm:p-10 border border-white/10 shadow-2xl mx-auto"
        style={{
          background: `linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.75) 55%, rgba(15, 23, 42, 0.3) 100%), url('/images/hero_banner.jpg') center/cover no-repeat`
        }}
      >
        <div className="max-w-xl w-full z-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Sparkles size={14} />
            <span>#1 Campus Salon & Shop — {currentCampus}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-white font-heading">
            Look Sharp on Campus <br />
            <span className="text-amber-400">Book Fast & Shop Local</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mb-6 max-w-lg">
            On-campus hair grooming, knotless braids, nail tech, glam makeup & retail products tailored for Zambian university students. Low data, fast mobile booking with Airtel, MTN & Zamtel Kwacha.
          </p>

          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => setActiveTab('services')}>
              <Calendar size={18} />
              <span>Book Appointment</span>
            </button>
            <button className="btn-secondary" onClick={() => setActiveTab('shop')}>
              <ShoppingBag size={18} />
              <span>Shop Products</span>
            </button>
          </div>
        </div>
      </section>

      {/* Student Referral & Loyalty Perks Banner */}
      <section className="w-full bg-gradient-to-r from-slate-800 to-slate-900 border border-amber-400/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 mx-auto">
        <div className="flex items-center gap-3.5">
          <div className="bg-amber-400/15 p-3 rounded-full text-amber-400 shrink-0">
            <Gift size={26} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Student Loyalty & Referral Perks</h4>
            <p className="text-xs sm:text-sm text-slate-300">
              Earn 1 point per K10 spent! Balance: <strong className="text-amber-400">{user.loyaltyPoints} Points</strong>. Share code <strong className="text-emerald-400">{user.referralCode}</strong> for K15 off.
            </p>
          </div>
        </div>
        <button className="btn-secondary text-xs px-4 py-2 shrink-0" onClick={() => setActiveTab('account')}>
          View Rewards
        </button>
      </section>

      {/* Featured Services Section */}
      <section className="w-full mx-auto">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Popular Campus Services</h2>
            <p className="text-xs sm:text-sm text-slate-400">Book in less than 60 seconds</p>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            className="text-amber-400 font-semibold text-sm flex items-center gap-1 hover:underline bg-transparent border-0"
          >
            <span>See All ({services.length})</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid-2">
          {featuredServices.map((srv) => (
            <div key={srv.id} className="card flex flex-col justify-between">
              <div className="relative h-44 w-full">
                <img
                  src={srv.image}
                  alt={srv.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleFavorite(srv.id)}
                  className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full border-0"
                >
                  <Heart size={16} fill={user.favorites.includes(srv.id) ? 'var(--accent)' : 'none'} className={user.favorites.includes(srv.id) ? 'text-pink-500' : 'text-white'} />
                </button>
                <div className="absolute bottom-3 left-3 bg-slate-900/85 px-2.5 py-1 rounded-xl text-xs font-semibold text-white flex items-center gap-1">
                  <Clock size={12} />
                  <span>{srv.duration} mins</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-amber-400 font-bold uppercase mb-1">
                    {srv.category}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{srv.name}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {srv.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="price-tag">K {srv.price}</span>
                  <button className="btn-primary text-xs px-4 py-2" onClick={() => setBookingService(srv)}>
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
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Trending Student Products</h2>
            <p className="text-xs sm:text-sm text-slate-400">Hair oils, grooming kits & cosmetics delivered to your hostel</p>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            className="text-amber-400 font-semibold text-sm flex items-center gap-1 hover:underline bg-transparent border-0"
          >
            <span>Visit Shop</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid-3">
          {featuredProducts.map((prd) => (
            <div key={prd.id} className="card p-3.5 flex flex-col justify-between">
              <div>
                <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3">
                  <img src={prd.image} alt={prd.name} className="w-full h-full object-cover" />
                  <span
                    className={`badge ${prd.stock > 10 ? 'badge-in-stock' : prd.stock > 0 ? 'badge-low-stock' : 'badge-out-of-stock'} absolute top-2 left-2`}
                  >
                    {prd.stock > 10 ? 'In Stock' : prd.stock > 0 ? `Only ${prd.stock} left` : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400 mb-1">
                  <Star size={14} fill="#FFB800" />
                  <span className="font-bold">{prd.rating}</span>
                  <span className="text-slate-400">({prd.reviewsCount})</span>
                </div>
                <h4
                  className="text-sm font-bold text-white mb-1 cursor-pointer hover:text-amber-400"
                  onClick={() => setSelectedProduct(prd)}
                >
                  {prd.name}
                </h4>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                <span className="price-tag text-base">K {prd.price}</span>
                <button
                  className="btn-secondary text-xs px-3 py-1.5"
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
      <section className="w-full bg-slate-800 rounded-3xl p-6 border border-white/10 mx-auto">
        <div className="text-center max-w-md mx-auto mb-5">
          <h2 className="text-xl font-bold text-white mb-1">Campus Student Transformations</h2>
          <p className="text-xs text-slate-400">Real results from our campus stylists at {currentCampus}</p>
        </div>

        <div className="grid-2">
          {initialTransformations.map((item) => (
            <div key={item.id} className="bg-slate-900/70 rounded-xl p-3.5 border border-white/10">
              <div className="flex gap-2.5 h-36 mb-3">
                <div className="flex-1 rounded-lg overflow-hidden relative">
                  <img src={item.beforeImg} alt="Result" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded">Result</span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-slate-400">Client: {item.student}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
