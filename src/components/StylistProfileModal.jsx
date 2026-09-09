import React, { useState, useEffect } from 'react';
import { X, Star, ShieldCheck, Clock, MapPin, MessageCircle, Calendar, CheckCircle2, ChevronRight, Sparkles, Heart, Share2, Copy, Check, Link2, Flag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ReportModal from './ReportModal';

export default function StylistProfileModal() {
  const {
    selectedStylist,
    setSelectedStylist,
    services,
    reviews,
    setBookingService,
    setActiveTab,
    setActiveChatStylistId,
    user,
    toggleFavorite,
    addToast
  } = useApp();

  const [activeTab, setActiveProfileTab] = useState('portfolio'); // 'portfolio' | 'services' | 'reviews'
  const [copiedLink, setCopiedLink] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!selectedStylist) return;
    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedStylist(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedStylist, setSelectedStylist]);

  if (!selectedStylist) return null;

  const stylistServices = services.filter((s) => (s.staffIds || s.staff_ids || []).includes(selectedStylist.id));
  const stylistReviews = reviews.filter((r) => (r.vendorId || r.vendor_id) === selectedStylist.id);
  const stylistRating = selectedStylist.rating ?? 0;
  const stylistReviewsCount = selectedStylist.reviewsCount ?? selectedStylist.reviews_count ?? stylistReviews.length;
  const stylistIsVerified = selectedStylist.isVerified ?? selectedStylist.is_verified ?? false;
  const bioHandle = selectedStylist.handle || selectedStylist.id;
  const shareUrl = `${window.location.origin}/?stylist=${bioHandle}`;

  const handleShareBioLink = async () => {
    const shareText = `Book an appointment with verified stylist ${selectedStylist.name} on UniHairShop (${selectedStylist.campus})! 💈✨`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedStylist.name} on UniHairShop`,
          text: shareText,
          url: shareUrl
        });
        addToast('Profile link shared!', 'success');
        return;
      } catch (e) {
        if (e.name !== 'AbortError') console.warn(e);
      }
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      addToast(`Stylist bio link copied: ${shareUrl}`, 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleBookService = (srv) => {
    setSelectedStylist(null);
    setBookingService(srv);
  };

  const handleStartChat = () => {
    setActiveChatStylistId(selectedStylist.id);
    setSelectedStylist(null);
    setActiveTab('messages');
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) setSelectedStylist(null); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Profile of ${selectedStylist.name}`}
    >
      <div className="modal-card max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header Cover Banner */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-4 flex items-start justify-between">
          <div className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10">
            <Sparkles size={12} className="text-amber-400" />
            <span>{selectedStylist.campus}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareBioLink}
              className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold border border-white/15 cursor-pointer transition-all active:scale-95"
              title="Share Stylist Direct Bio Link"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
            </button>

            <button
              className="bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center border border-white/15 cursor-pointer"
              onClick={() => setSelectedStylist(null)}
              title="Close (Esc)"
              aria-label="Close profile"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 flex-1 overflow-y-auto -mt-12 bg-white dark:bg-[#121217]">
          {/* Avatar & Action Row */}
          <div className="flex justify-between items-end mb-4">
            <div className="relative">
              <img
                src={selectedStylist.avatar}
                alt={selectedStylist.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-[#121217] shadow-xl bg-slate-800"
              />
              {stylistIsVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-[#121217]" title="Verified Campus Stylist">
                  <ShieldCheck size={16} />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleStartChat}
                className="apple-btn-secondary text-xs px-3.5 py-2"
                aria-label="Direct message stylist"
              >
                <MessageCircle size={14} />
                <span>Message</span>
              </button>
              <button
                onClick={() => {
                  const firstSrv = stylistServices[0] || services[0];
                  handleBookService(firstSrv);
                }}
                className="apple-btn-primary text-xs px-4 py-2"
              >
                <Calendar size={14} />
                <span>Book Slot</span>
              </button>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight m-0">{selectedStylist.name}</h2>
              {stylistIsVerified ? (
                <span className="badge badge-verified text-[10px] py-0.5 px-2 font-bold">{selectedStylist.badge || 'Verified Campus Stylist'}</span>
              ) : (
                <span className="badge badge-low-stock text-[10px] py-0.5 px-2 font-bold">Pending Verification</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 mb-2">
              <span className="text-xs text-amber-500 font-semibold">{selectedStylist.role}</span>
              <span className="text-[11px] font-mono text-slate-400">@{bioHandle}</span>
              {(() => {
                const links = (selectedStylist.socialLinks?.length ? selectedStylist.socialLinks : selectedStylist.social_links) || [];
                const legacy = selectedStylist.socialLink || selectedStylist.social_link;
                const allLinks = links.length > 0 ? links : (legacy ? [legacy] : []);
                return allLinks.map((link, i) => (
                  <a
                    key={link + i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#007AFF] font-semibold"
                  >
                    <Link2 size={12} />
                    <span>{allLinks.length > 1 ? `Social ${i + 1}` : 'Social'}</span>
                  </a>
                ));
              })()}
              {user?.isLoggedIn && user?.id !== selectedStylist.id && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-500 font-semibold bg-transparent border-0 cursor-pointer p-0"
                >
                  <Flag size={11} />
                  <span>Report</span>
                </button>
              )}
            </div>

            {(selectedStylist.specialties?.length > 0) && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedStylist.specialties.map((specialty) => (
                  <span key={specialty} className="text-[10px] bg-amber-400/15 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold">
                    {specialty}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
              <div className="flex items-center gap-1">
                <MapPin size={13} className="text-slate-400" />
                <span>{selectedStylist.dormLocation}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={13} className="text-slate-400" />
                <span>Replies in {selectedStylist.responseTime}</span>
              </div>
              <div className="flex items-center gap-1">
                {stylistRating > 0 ? (
                  <>
                    <Star size={13} fill="#F5A623" className="text-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-white">{stylistRating.toFixed(1)}</span>
                    <span>({stylistReviewsCount} reviews)</span>
                  </>
                ) : (
                  <span className="text-slate-400">No ratings yet</span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed m-0">
              {selectedStylist.bio}
            </p>
          </div>

          {/* Service Delivery Perks */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className={`p-2.5 rounded-2xl border text-xs flex items-center gap-2 ${
              selectedStylist.travelsToDorm
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-400'
            }`}>
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{selectedStylist.travelsToDorm ? 'Travels to Student Dorms' : 'No Room Travel'}</span>
            </div>

            <div className="p-2.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Dorm Studio Available</span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex gap-2 border-b border-black/10 dark:border-white/10 pb-2 mb-4">
            {[
              { id: 'portfolio', label: `Portfolio (${selectedStylist.portfolio?.length || 0})` },
              { id: 'services', label: `Service Menu (${stylistServices.length})` },
              { id: 'reviews', label: `Student Reviews (${stylistReviews.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all border-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#007AFF] text-white shadow-apple-blue'
                    : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 1. Instagram-Style Visual Portfolio Grid */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {selectedStylist.portfolio?.map((item) => (
                <div key={item.id} className="relative rounded-2xl overflow-hidden group aspect-square border border-black/10 dark:border-white/10 bg-slate-900">
                  <img src={item.image} alt={item.tag} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                    <span className="text-[11px] font-bold leading-tight">{item.tag}</span>
                    <span className="text-[9px] text-slate-300">{item.client}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Service Menu & Add-ons */}
          {activeTab === 'services' && (
            <div className="flex flex-col gap-3">
              {stylistServices.map((srv) => (
                <div key={srv.id} className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 truncate">{srv.name}</h4>
                      <span className="badge badge-in-stock text-[10px] py-0.2 px-1.5">{srv.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-1 line-clamp-1">{srv.description}</p>
                    <div className="text-[11px] text-slate-400">
                      Duration: {srv.duration} mins {srv.addOns?.length > 0 && `• ${srv.addOns.length} add-ons available`}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="price-tag text-base mb-1.5">K {srv.price}</div>
                    <button
                      className="apple-btn-primary text-xs px-3.5 py-1.5"
                      onClick={() => handleBookService(srv)}
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Real Reviews — written only after a completed, verified booking */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-3">
              {stylistReviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Star size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white m-0">No reviews yet</p>
                  <p className="text-xs text-slate-400 mt-1">Reviews appear here once real students complete a booking and rate it.</p>
                </div>
              ) : (
                stylistReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04]">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.customerName || rev.customer_name || 'Campus Student'}</span>
                        <span className="badge badge-verified text-[9px] py-0.2 px-1.5">Verified Booking</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(rev.createdAt || rev.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1 mb-1.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={12} fill="#F5A623" className="text-amber-400" />
                      ))}
                    </div>

                    {rev.comment && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showReportModal && (
        <ReportModal
          reportedUserId={selectedStylist.id}
          reportedUserName={selectedStylist.name}
          contextType="stylist_profile"
          contextId={selectedStylist.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
