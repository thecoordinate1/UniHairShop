import React, { useState } from 'react';
import { Sparkles, Heart, Share2, Calendar, MapPin, Scissors, ArrowLeft, Clock, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Populated from real completed bookings/portfolio uploads once real stylists
// and customers exist — intentionally empty until that data source is wired up,
// rather than showing fabricated "transformations" as if they were real.
export const transformationPosts = [];

export default function CampusTransformationFeed({ title = 'Campus Trending Looks', subtitle = 'Real hairstyles done on campus. Tap any look to book instantly!' }) {
  const { setBookingService, services, setSelectedStylist, staffList, addToast } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [likedPosts, setLikedPosts] = useState({});
  const [selectedLook, setSelectedLook] = useState(null);

  const categories = ['All', 'Barbering', 'Braids & Wigs', 'Nails & Makeup', 'Locs & Natural'];

  const filteredPosts = selectedFilter === 'All'
    ? transformationPosts
    : transformationPosts.filter((p) => p.category === selectedFilter);

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    addToast(likedPosts[postId] ? 'Removed like' : 'Liked hairstyle!', 'success');
  };

  const handleBookLook = (post) => {
    // Find matching service
    const matchedService = services.find(
      (s) => s.name.toLowerCase().includes(post.serviceName.toLowerCase()) || s.category === post.category
    ) || services[0];

    if (!matchedService) {
      addToast('No matching service available to book yet.', 'error');
      return;
    }

    // Find matching stylist
    const matchedStylist = staffList.find((s) => s.id === post.stylistId) || staffList[0];

    setSelectedStylist(null);
    setBookingService({
      ...matchedService,
      price: post.price,
      preferredStaff: matchedStylist?.name
    });
  };

  const handleShareLook = async (post) => {
    const shareText = `Check out this "${post.title}" by verified stylist ${post.stylistName} on UniHairShop (${post.campus})! 💈✨ Book it here: ${window.location.origin}/?stylist=${post.stylistHandle}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: `${window.location.origin}/?stylist=${post.stylistHandle}`
        });
        addToast('Shared look to social feed!', 'success');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.warn(err);
      }
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      addToast('Story link copied to clipboard!', 'success');
    }
  };

  const handleOpenLook = (post) => {
    setSelectedLook(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedLook) {
    const isLiked = likedPosts[selectedLook.id];
    const totalLikes = selectedLook.likes + (isLiked ? 1 : 0);

    return (
      <article className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
        <button type="button" onClick={() => setSelectedLook(null)} className="apple-btn-secondary text-xs px-3 py-2 mb-4">
          <ArrowLeft size={14} /> Back to Lookbook
        </button>
        <div className="card overflow-hidden bg-white dark:bg-[#15151c]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative min-h-[18rem] md:min-h-[34rem] bg-slate-900">
              <img src={selectedLook.image} alt={selectedLook.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
              <div className="absolute top-4 left-4 right-4 flex justify-between gap-3">
                <span className="badge bg-black/60 backdrop-blur-md text-white border border-white/15 text-xs">{selectedLook.category}</span>
                <button type="button" onClick={() => toggleLike(selectedLook.id)} className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95 ${isLiked ? 'bg-rose-500 border-rose-400 text-white' : 'bg-black/50 border-white/20 text-white'}`} aria-label="Like this look">
                  <Heart size={17} fill={isLiked ? '#FFFFFF' : 'none'} />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs text-amber-200 flex items-center gap-1 mb-1"><MapPin size={13} />{selectedLook.campus} · {selectedLook.hostel}</p>
                <p className="text-2xl font-extrabold m-0">K {selectedLook.price}</p>
              </div>
            </div>
            <div className="p-5 sm:p-7 flex flex-col">
              <div className="flex items-center gap-2 text-amber-500 text-xs font-bold mb-2"><Sparkles size={14} /> Campus transformation</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0 mb-3">{selectedLook.title}</h1>
              <div className="flex items-center gap-2.5 pb-4 border-b border-black/5 dark:border-white/10">
                <img src={selectedLook.stylistAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-amber-400/40" />
                <div><p className="text-sm font-bold text-slate-900 dark:text-white m-0">{selectedLook.stylistName}</p><p className="text-xs text-amber-500 m-0">@{selectedLook.stylistHandle}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 my-5">
                <div className="rounded-2xl p-3 bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10"><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold m-0 mb-1 flex items-center gap-1"><Clock size={12} />Duration</p><p className="text-sm font-bold text-slate-900 dark:text-white m-0">{selectedLook.duration} min</p></div>
                <div className="rounded-2xl p-3 bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10"><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold m-0 mb-1 flex items-center gap-1"><Heart size={12} />Loved by</p><p className="text-sm font-bold text-slate-900 dark:text-white m-0">{totalLikes} students</p></div>
              </div>
              <div className="rounded-2xl bg-amber-400/10 border border-amber-400/20 p-4 mb-4"><p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-300 font-bold m-0 mb-1">Client review</p><p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed m-0">“{selectedLook.clientComment}”</p></div>
              <div className="flex flex-wrap gap-1.5 mb-6">{selectedLook.tags.map((tag) => <span key={tag} className="text-[11px] text-slate-500 dark:text-slate-400 bg-black/[0.03] dark:bg-white/[0.05] rounded-full px-2.5 py-1"><Tag size={10} className="inline mr-1" />{tag}</span>)}</div>
              <div className="mt-auto flex gap-2.5">
                <button type="button" onClick={() => handleShareLook(selectedLook)} className="apple-btn-secondary p-3 shrink-0" aria-label="Share this look"><Share2 size={16} /></button>
                <button type="button" onClick={() => handleBookLook(selectedLook)} className="apple-btn-primary flex-1 text-xs py-3"><Calendar size={15} />Book This Look</button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Title & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-600 dark:text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30 mb-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Campus Hair Lookbook</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">
            {subtitle}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedFilter === cat
                  ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold shadow-apple-gold'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-amber-400/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="card p-10 text-center flex flex-col items-center gap-2 border border-dashed border-black/10 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-500 flex items-center justify-center mb-1">
            <Scissors size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">No transformations yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs m-0">
            Once campus stylists complete real bookings, their transformations will appear here.
          </p>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPosts.map((post) => {
          const isLiked = likedPosts[post.id];
          const totalLikes = post.likes + (isLiked ? 1 : 0);

          return (
            <article
              key={post.id}
              onClick={() => handleOpenLook(post)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleOpenLook(post); } }}
              tabIndex={0}
              role="button"
              aria-label={`Open details for ${post.title}`}
              className="card p-0 overflow-hidden flex flex-col justify-between group hover:shadow-apple-card transition-all duration-300 border border-black/10 dark:border-white/10 bg-white dark:bg-[#15151c] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              {/* Media Container */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Category Badge & Like Button */}
                <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-center">
                  <span className="badge bg-black/60 backdrop-blur-md text-white border border-white/15 text-[10px] py-0.5 px-2 font-semibold">
                    {post.category}
                  </span>

                  <button
                    onClick={(event) => { event.stopPropagation(); toggleLike(post.id); }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer border ${
                      isLiked
                        ? 'bg-rose-500 border-rose-400 text-white shadow-sm'
                        : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                    }`}
                    title="Like look"
                  >
                    <Heart size={15} fill={isLiked ? '#FFFFFF' : 'none'} />
                  </button>
                </div>

                {/* Price Tag & Likes Info */}
                <div className="absolute bottom-2.5 inset-x-3 flex justify-between items-end text-white">
                  <div>
                    <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                      <MapPin size={11} />
                      <span>{post.campus.split(' ')[0]} ({post.hostel.split(',')[0]})</span>
                    </div>
                    <span className="text-sm font-extrabold text-white">K {post.price}</span>
                  </div>

                  <span className="text-[11px] text-slate-300 font-medium">{totalLikes} likes</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-snug mb-1">
                    {post.title}
                  </h3>

                  {/* Stylist Mini Attribution */}
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={post.stylistAvatar}
                      alt={post.stylistName}
                      className="w-5 h-5 rounded-full object-cover border border-amber-400/40"
                    />
                    <span className="text-xs text-amber-500 font-semibold truncate">
                      {post.stylistName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">@{post.stylistHandle}</span>
                  </div>

                  {/* Client Quote */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 m-0 mb-3 bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-xl border border-black/5 dark:border-white/5">
                    "{post.clientComment}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={(event) => { event.stopPropagation(); handleShareLook(post); }}
                    className="apple-btn-secondary text-xs p-2 shrink-0 text-slate-500 hover:text-amber-500"
                    title="Share transformation to WhatsApp"
                  >
                    <Share2 size={13} />
                  </button>

                  <button
                    onClick={(event) => { event.stopPropagation(); handleBookLook(post); }}
                    className="apple-btn-primary text-xs w-full py-2 flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Calendar size={13} />
                    <span>Book This Look</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
