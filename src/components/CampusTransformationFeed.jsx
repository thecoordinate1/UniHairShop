import React, { useState } from 'react';
import { Sparkles, Heart, Share2, Calendar, MapPin, CheckCircle2, Scissors, Eye, MessageSquare, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const transformationPosts = [
  {
    id: 'tr-1',
    title: 'Low Taper Fade & Sharp Beard Sculpt',
    category: 'Barbering',
    serviceName: 'Men\'s Clean Haircut & Beard Sculpt',
    stylistId: 'stf-1',
    stylistName: 'Junior "The Fade King"',
    stylistHandle: 'juniorfades',
    stylistAvatar: '/images/barber_service.jpg',
    image: '/images/barber_service.jpg',
    campus: 'UNILUS Silverest Campus',
    hostel: 'Block C, Room 14',
    price: 90,
    duration: 35,
    likes: 184,
    tags: ['#TaperFade', '#BeardLineup', '#UNILUSGrooming'],
    clientComment: 'Zero tension, came straight to my room in Block A. Looked 10/10 for the gala!'
  },
  {
    id: 'tr-2',
    title: 'Medium Knotless French Curl Braids',
    category: 'Braids & Wigs',
    serviceName: 'Knotless Braids (Medium Length)',
    stylistId: 'stf-2',
    stylistName: 'Chileshe Braids & Wigs',
    stylistHandle: 'chileshebraids',
    stylistAvatar: '/images/hair_braids.jpg',
    image: '/images/hair_braids.jpg',
    campus: 'UNILUS Silverest Campus',
    hostel: 'Block F, Flat 02',
    price: 250,
    duration: 180,
    likes: 242,
    tags: ['#FrenchCurls', '#KnotlessBraids', '#CampusBraids'],
    clientComment: 'Lightweight and lasted 6 full weeks during semester exams!'
  },
  {
    id: 'tr-3',
    title: 'Chrome French Tip Acrylics & 3D Charms',
    category: 'Nails & Makeup',
    serviceName: 'Acrylic Full Set & Nail Art',
    stylistId: 'stf-3',
    stylistName: 'Natasha Glam & Nail Bar',
    stylistHandle: 'natashaglam',
    stylistAvatar: '/images/nail_art.jpg',
    image: '/images/nail_art.jpg',
    campus: 'UNZA Great East Road Campus',
    hostel: 'October Hall, Room 28',
    price: 160,
    duration: 60,
    likes: 198,
    tags: ['#ChromeNails', '#UNZAGlam', '#Acrylics'],
    clientComment: 'Still rock solid after 3 weeks. Natasha is the GOAT nail tech at UNZA.'
  },
  {
    id: 'tr-4',
    title: 'Starter Locs & Palm Roll Retwist',
    category: 'Locs & Natural',
    serviceName: 'Loc Maintenance & Scalp Treatment',
    stylistId: 'stf-4',
    stylistName: 'Barber Kasonde',
    stylistHandle: 'barberkasonde',
    stylistAvatar: '/images/barber_service.jpg',
    image: '/images/barber_service.jpg',
    campus: 'UNILUS Silverest Campus',
    hostel: 'Student Centre Pavilion',
    price: 180,
    duration: 90,
    likes: 126,
    tags: ['#LocRetwist', '#NaturalHair', '#SilverestBarber'],
    clientComment: 'Clean parting and hot towel scalp detox. 100% recommended.'
  }
];

export default function CampusTransformationFeed({ title = 'Campus Trending Looks', subtitle = 'Real hairstyles done on campus. Tap any look to book instantly!' }) {
  const { setBookingService, services, setSelectedStylist, staffList, addToast, user } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [likedPosts, setLikedPosts] = useState({});

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

    // Find matching stylist
    const matchedStylist = staffList.find((s) => s.id === post.stylistId) || staffList[0];

    setSelectedStylist(null);
    setBookingService({
      ...matchedService,
      price: post.price,
      preferredStaff: matchedStylist.name
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPosts.map((post) => {
          const isLiked = likedPosts[post.id];
          const totalLikes = post.likes + (isLiked ? 1 : 0);

          return (
            <div
              key={post.id}
              className="card p-0 overflow-hidden flex flex-col justify-between group hover:shadow-apple-card transition-all duration-300 border border-black/10 dark:border-white/10 bg-white dark:bg-[#15151c]"
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
                    onClick={() => toggleLike(post.id)}
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
                    onClick={() => handleShareLook(post)}
                    className="apple-btn-secondary text-xs p-2 shrink-0 text-slate-500 hover:text-amber-500"
                    title="Share transformation to WhatsApp"
                  >
                    <Share2 size={13} />
                  </button>

                  <button
                    onClick={() => handleBookLook(post)}
                    className="apple-btn-primary text-xs w-full py-2 flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Calendar size={13} />
                    <span>Book This Look</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
