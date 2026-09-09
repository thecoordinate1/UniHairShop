import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Truck,
  Store,
  MessageSquare,
  MessageCircle,
  Phone,
  ShieldCheck,
  Tag,
  UploadCloud,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building,
  Star,
  Settings,
  Eye,
  Check,
  Copy,
  Lock,
  Share2,
  ShoppingBag,
  Package,
  Award
} from 'lucide-react';
import { useApp, getAvatarHaloClass } from '../context/AppContext';
import { playSuccessChime } from '../lib/soundEffects';
import { uploadImage } from '../lib/uploadImage';
import { lusakaUniversities, campusHostels } from '../data/mockData';

export const wholesaleSupplies = [
  {
    id: 'ws-1',
    name: 'Darling Soft Braid Extensions (3-Pack Bundle)',
    category: 'Braids & Weaves',
    wholesalePrice: 85,
    marketPrice: 115,
    unit: '3 Packs (Color 1B/27)',
    image: '/images/hair_braids.jpg',
    inStock: true,
    minBookingsRequired: 3
  },
  {
    id: 'ws-2',
    name: 'Andis / Kemei Clipper Blade Oil & Cool Care Spray',
    category: 'Barber Supplies',
    wholesalePrice: 65,
    marketPrice: 95,
    unit: '400ml Spray Can',
    image: '/images/barber_service.jpg',
    inStock: true,
    minBookingsRequired: 2
  },
  {
    id: 'ws-3',
    name: 'Organic Tea Tree Scalp Oil & Strong Edge Control',
    category: 'Hair Care & Oils',
    wholesalePrice: 55,
    marketPrice: 80,
    unit: '250ml Oil + 150g Wax',
    image: '/images/scalp_care.jpg',
    inStock: true,
    minBookingsRequired: 2
  },
  {
    id: 'ws-4',
    name: 'Lace Tint Melting Mousse & Ghost Bond Glue Remover',
    category: 'Wig & Lace Care',
    wholesalePrice: 75,
    marketPrice: 110,
    unit: 'Mousse + 100ml Remover',
    image: '/images/wig_care.jpg',
    inStock: true,
    minBookingsRequired: 3
  },
  {
    id: 'ws-5',
    name: 'Sanitary Disposable Neck Strips (500-Pack Rolls)',
    category: 'Barber Supplies',
    wholesalePrice: 40,
    marketPrice: 65,
    unit: '5 Rolls (500 pcs)',
    image: '/images/barber_service.jpg',
    inStock: true,
    minBookingsRequired: 1
  }
];

export default function VendorStudioView() {
  const {
    user,
    vendorProfile,
    updateVendorProfile,
    toggleVendorDormTravel,
    vendorWallet,
    vendorSales,
    requestVendorPayout,
    acceptBooking,
    completeBooking,
    addVendorPortfolioItem,
    addService,
    services,
    products,
    addProduct,
    updateProductStock,
    deleteProduct,
    bookings,
    staffList,
    updateVendorSchedule,
    toggleUserMode,
    setActiveTab,
    setActiveChatStylistId,
    addToast
  } = useApp();

  const [activeTab, setActiveTabLocal] = useState('overview'); // 'overview' | 'schedule' | 'services' | 'portfolio' | 'shop' | 'wholesale' | 'wallet'

  // Timetable & Bio Link State
  const [blockDay, setBlockDay] = useState('Wednesday');
  const [blockHour, setBlockHour] = useState('10:00');
  const [copiedBioLink, setCopiedBioLink] = useState(false);

  // Service Creation State
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCat, setNewSrvCat] = useState('Barbering');
  const [newSrvPrice, setNewSrvPrice] = useState('90');
  const [newSrvDuration, setNewSrvDuration] = useState('40');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvAddOnName, setNewSrvAddOnName] = useState('');
  const [newSrvAddOnPrice, setNewSrvAddOnPrice] = useState('20');
  const [tempAddOns, setTempAddOns] = useState([]);

  // Portfolio Upload State
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portTag, setPortTag] = useState('');
  const [portClient, setPortClient] = useState('');
  const [portImg, setPortImg] = useState(null);
  const [uploadingPortfolioPhoto, setUploadingPortfolioPhoto] = useState(false);

  // Edit Profile State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(vendorProfile.name || '');
  const [editBio, setEditBio] = useState(vendorProfile.bio || '');
  const [editPhone, setEditPhone] = useState(vendorProfile.phone || '');
  const [editAvatar, setEditAvatar] = useState(vendorProfile.avatar || '');
  const [editCampus, setEditCampus] = useState(vendorProfile.campus || lusakaUniversities[0].name);
  const [editDormLocation, setEditDormLocation] = useState(vendorProfile.dormLocation || vendorProfile.dorm_location || '');
  const [editGender, setEditGender] = useState(vendorProfile.gender || 'male');
  const [editIdDocument, setEditIdDocument] = useState(vendorProfile.idDocumentUrl || vendorProfile.id_document_url || '');
  const [editSpecialties, setEditSpecialties] = useState(vendorProfile.specialties || []);
  const [editSocialLinks, setEditSocialLinks] = useState(
    vendorProfile.socialLinks?.length
      ? vendorProfile.socialLinks
      : (vendorProfile.social_links?.length
        ? vendorProfile.social_links
        : ((vendorProfile.socialLink || vendorProfile.social_link) ? [vendorProfile.socialLink || vendorProfile.social_link] : []))
  );
  const [newSocialLinkInput, setNewSocialLinkInput] = useState('');
  const [editPayoutAccounts, setEditPayoutAccounts] = useState(vendorProfile.payoutAccounts || vendorProfile.payout_accounts || []);
  const [newAccountProvider, setNewAccountProvider] = useState('Airtel Money');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingIdDocument, setUploadingIdDocument] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const SPECIALTY_OPTIONS = ['Barbering', 'Braids & Natural Hair', 'Wigs & Weaves', 'Locs', 'Nails & Lashes'];

  const toggleEditSpecialty = (specialty) => {
    setEditSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  };

  const handleAddPayoutAccount = () => {
    if (!newAccountNumber.trim()) {
      addToast('Enter a mobile money number first', 'error');
      return;
    }
    setEditPayoutAccounts((prev) => [
      ...prev,
      { id: `pay-acc-${Date.now()}`, provider: newAccountProvider, number: newAccountNumber.trim() }
    ]);
    setNewAccountNumber('');
  };

  const handleRemovePayoutAccount = (id) => {
    setEditPayoutAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddSocialLink = () => {
    const trimmed = newSocialLinkInput.trim();
    if (!trimmed) {
      addToast('Enter a link first', 'error');
      return;
    }
    setEditSocialLinks((prev) => [...prev, trimmed]);
    setNewSocialLinkInput('');
  };

  const handleRemoveSocialLink = (index) => {
    setEditSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // My Shop (Vendor Product Listings) State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newPrdName, setNewPrdName] = useState('');
  const [newPrdCategory, setNewPrdCategory] = useState('Hair Care Products');
  const [newPrdPrice, setNewPrdPrice] = useState('100');
  const [newPrdStock, setNewPrdStock] = useState('10');
  const [newPrdDesc, setNewPrdDesc] = useState('');
  const [newPrdImage, setNewPrdImage] = useState(null);
  const [uploadingProductPhoto, setUploadingProductPhoto] = useState(false);

  // Lock body scroll while any of this view's modals are open, and close on Escape.
  // Without this, these modals (rendered inline in the view rather than via the
  // shared portal-based ones) let the page behind them keep scrolling underneath.
  const anyModalOpen = showAddServiceModal || showPortfolioModal || showEditProfileModal || showAddProductModal;
  useEffect(() => {
    if (!anyModalOpen) return;

    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddServiceModal(false);
        setShowPortfolioModal(false);
        setShowEditProfileModal(false);
        setShowAddProductModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [anyModalOpen]);

  // Payout Form State — prefer the first saved mobile money account, if any
  const savedPayoutAccounts = vendorProfile.payoutAccounts || vendorProfile.payout_accounts || [];
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutProvider, setPayoutProvider] = useState(savedPayoutAccounts[0]?.provider || vendorProfile.payoutProvider || 'Airtel Money');
  const [payoutNumber, setPayoutNumber] = useState(savedPayoutAccounts[0]?.number || vendorProfile.payoutNumber || '0971234567');

  const myStylistObj = staffList.find((s) => s.id === vendorProfile.id) || {};
  const currentSchedule = myStylistObj.scheduleConfig || vendorProfile.scheduleConfig || {
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: { start: '08:00', end: '20:00' },
    blockedSlots: []
  };

  const myRating = myStylistObj.rating ?? vendorProfile.rating ?? 0;
  const myReviewsCount = myStylistObj.reviewsCount ?? myStylistObj.reviews_count ?? 0;

  const myProducts = products.filter((p) => (p.vendorId || p.vendor_id) === vendorProfile.id);
  const totalUnitsSold = vendorSales.reduce((sum, s) => sum + s.quantity, 0);
  const totalProductRevenue = vendorSales.reduce((sum, s) => sum + s.totalAmount, 0);

  const bioHandle = vendorProfile.handle || myStylistObj.handle || vendorProfile.id || '';
  const bioUrl = `${window.location.origin}/?stylist=${bioHandle}`;

  const handleCopyBioUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bioUrl);
      setCopiedBioLink(true);
      addToast(`Booking link copied: ${bioUrl}`, 'success');
      setTimeout(() => setCopiedBioLink(false), 2500);
    }
  };

  const handleShareBioWhatsApp = () => {
    const text = encodeURIComponent(`💈 Book your next haircut or braids with me on UniHairShop! Verified campus appointments: ${bioUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleAddBlockedSlot = () => {
    const slotString = `${blockDay} ${blockHour}`;
    if ((currentSchedule.blockedSlots || []).includes(slotString)) {
      addToast(`${slotString} is already blocked!`, 'error');
      return;
    }
    const updated = {
      ...currentSchedule,
      blockedSlots: [...(currentSchedule.blockedSlots || []), slotString]
    };
    updateVendorSchedule(vendorProfile.id, updated);
  };

  const handleRemoveBlockedSlot = (slotString) => {
    const updated = {
      ...currentSchedule,
      blockedSlots: (currentSchedule.blockedSlots || []).filter((s) => s !== slotString)
    };
    updateVendorSchedule(vendorProfile.id, updated);
  };

  const myServices = services.filter((s) => (s.staffIds || s.staff_ids || []).includes(vendorProfile.id));
  const myBookings = bookings.filter((b) => {
    const sName = b.staffName || b.staff_name || '';
    const sId = b.staffId || b.staff_id || '';
    return sId === vendorProfile.id || (vendorProfile.name && sName.includes(vendorProfile.name));
  });

  const activeConfirmedBookings = myBookings.filter((b) => b.status === 'Confirmed');
  const completedBookings = myBookings.filter((b) => b.status === 'Completed');

  const handleAddTempAddOn = () => {
    if (!newSrvAddOnName.trim()) return;
    setTempAddOns([...tempAddOns, { id: `add-${Date.now()}`, name: newSrvAddOnName.trim(), price: Number(newSrvAddOnPrice) || 20, duration: 10 }]);
    setNewSrvAddOnName('');
  };

  const handleSaveService = () => {
    if (!newSrvName.trim()) {
      addToast('Please enter a service name', 'error');
      return;
    }
    addService({
      name: newSrvName.trim(),
      category: newSrvCat,
      price: Number(newSrvPrice) || 80,
      duration: Number(newSrvDuration) || 35,
      description: newSrvDesc.trim() || 'Campus grooming & styling service.',
      canTravel: vendorProfile.travelsToDorm,
      inStudio: vendorProfile.hasStudio,
      popular: false,
      addOns: tempAddOns
    });
    setShowAddServiceModal(false);
    setNewSrvName('');
    setNewSrvDesc('');
    setTempAddOns([]);
  };

  const handlePortfolioImagePicker = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPortfolioPhoto(true);
    try {
      const url = await uploadImage(file, { userId: user?.id, folder: 'portfolio' });
      if (url) {
        setPortImg(url);
      } else {
        addToast('Could not upload photo. Please try again.', 'error');
      }
    } finally {
      setUploadingPortfolioPhoto(false);
    }
  };

  const handleSavePortfolio = () => {
    if (!portTag.trim()) {
      addToast('Please enter a hairstyle or cut tag', 'error');
      return;
    }
    if (!portImg) {
      addToast('Please upload a photo of the finished look', 'error');
      return;
    }
    addVendorPortfolioItem({
      image: portImg,
      tag: portTag.trim(),
      client: portClient.trim() || 'Campus Student'
    });
    setShowPortfolioModal(false);
    setPortTag('');
    setPortClient('');
    setPortImg(null);
  };

  const handleAvatarPicker = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file, { userId: user?.id, folder: 'avatars' });
      if (url) {
        setEditAvatar(url);
      } else {
        addToast('Could not upload photo. Please try again.', 'error');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleIdDocumentPicker = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdDocument(true);
    try {
      const url = await uploadImage(file, { userId: user?.id, folder: 'id-documents' });
      if (url) {
        setEditIdDocument(url);
      } else {
        addToast('Could not upload document. Please try again.', 'error');
      }
    } finally {
      setUploadingIdDocument(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      addToast('Please enter your name or stylist brand name', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await updateVendorProfile({
        name: editName.trim(),
        bio: editBio.trim(),
        phone: editPhone.trim(),
        avatar: editAvatar || vendorProfile.avatar,
        campus: editCampus,
        dormLocation: editDormLocation.trim(),
        gender: editGender,
        idDocumentUrl: editIdDocument || null,
        specialties: editSpecialties,
        socialLink: editSocialLinks[0] || '',
        socialLinks: editSocialLinks,
        payoutAccounts: editPayoutAccounts
      });
      setShowEditProfileModal(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProductImagePicker = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProductPhoto(true);
    try {
      const url = await uploadImage(file, { userId: user?.id, folder: 'products' });
      if (url) {
        setNewPrdImage(url);
      } else {
        addToast('Could not upload photo. Please try again.', 'error');
      }
    } finally {
      setUploadingProductPhoto(false);
    }
  };

  const handleSaveProduct = () => {
    if (!newPrdName.trim()) {
      addToast('Please enter a product name', 'error');
      return;
    }
    addProduct({
      name: newPrdName.trim(),
      category: newPrdCategory,
      price: Number(newPrdPrice) || 0,
      stock: Number(newPrdStock) || 0,
      description: newPrdDesc.trim() || 'Sold directly by this campus stylist.',
      image: newPrdImage,
      vendorId: vendorProfile.id
    });
    setShowAddProductModal(false);
    setNewPrdName('');
    setNewPrdDesc('');
    setNewPrdImage(null);
  };

  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      addToast('Enter a valid payout amount in Kwacha', 'error');
      return;
    }
    if (amt > vendorWallet.availableBalance) {
      addToast('Amount exceeds your available balance', 'error');
      return;
    }
    const success = requestVendorPayout(amt, payoutProvider, payoutNumber);
    if (success) {
      setPayoutAmount('');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Studio Header Banner */}
      <div className="card p-6 bg-gradient-to-br from-amber-500/20 via-slate-900 to-[#121217] border border-amber-400/30 text-slate-900 dark:text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={vendorProfile.avatar}
            alt={vendorProfile.name}
            className={`w-16 h-16 rounded-3xl object-cover border-2 border-amber-400 shadow-apple-gold shrink-0 ${getAvatarHaloClass(vendorProfile.gender)}`}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">{vendorProfile.name}</h1>
              {vendorProfile.isVerified ? (
                <span className="badge badge-verified text-[10px] py-0.2 px-2">Verified Campus Stylist</span>
              ) : (
                <span className="badge badge-out-of-stock text-[10px] py-0.2 px-2">Pending Verification</span>
              )}
            </div>
            <p className="text-xs text-amber-500 font-semibold mt-0.5 mb-0.5">{vendorProfile.role} • {vendorProfile.campus}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">Studio Room: {vendorProfile.dormLocation}</p>
          </div>
        </div>

        {/* Action Toggle & Customer Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Edit Profile */}
          <button
            onClick={() => {
              setEditName(vendorProfile.name || '');
              setEditBio(vendorProfile.bio || '');
              setEditPhone(vendorProfile.phone || '');
              setEditAvatar(vendorProfile.avatar || '');
              setEditCampus(vendorProfile.campus || lusakaUniversities[0].name);
              setEditDormLocation(vendorProfile.dormLocation || vendorProfile.dorm_location || '');
              setEditGender(vendorProfile.gender || 'male');
              setEditIdDocument(vendorProfile.idDocumentUrl || vendorProfile.id_document_url || '');
              setEditSpecialties(vendorProfile.specialties || []);
              setEditSocialLinks(
                vendorProfile.socialLinks?.length
                  ? vendorProfile.socialLinks
                  : (vendorProfile.social_links?.length
                    ? vendorProfile.social_links
                    : ((vendorProfile.socialLink || vendorProfile.social_link) ? [vendorProfile.socialLink || vendorProfile.social_link] : []))
              );
              setNewSocialLinkInput('');
              setEditPayoutAccounts(vendorProfile.payoutAccounts || vendorProfile.payout_accounts || []);
              setShowEditProfileModal(true);
            }}
            className="apple-btn-secondary text-xs px-3.5 py-2 flex items-center gap-2"
          >
            <Settings size={14} />
            <span>Edit Profile</span>
          </button>

          {/* Dorm Travel Availability Switch */}
          <button
            onClick={toggleVendorDormTravel}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border ${
              vendorProfile.travelsToDorm
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold'
                : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500'
            }`}
            title="Toggle whether you accept dorm visits"
          >
            <Truck size={15} />
            <span>{vendorProfile.travelsToDorm ? 'Dorm Travel: ON' : 'Dorm Travel: OFF'}</span>
          </button>

          {/* Switch back to Customer Student Mode */}
          <button
            onClick={toggleUserMode}
            className="apple-btn-secondary text-xs px-4 py-2"
          >
            <span>Switch to Customer Mode</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 bg-black/[0.02] dark:bg-white/[0.04] p-1.5 rounded-full border border-black/5 dark:border-white/10" role="tablist" aria-label="Vendor Studio tabs">
        {[
          { id: 'overview', label: 'Studio Overview' },
          { id: 'schedule', label: `Schedule & Bookings (${activeConfirmedBookings.length})` },
          { id: 'services', label: `Service Menu (${myServices.length})` },
          { id: 'portfolio', label: `Hairstyle Portfolio (${myStylistObj.portfolio?.length || 0})` },
          { id: 'shop', label: `My Shop (${myProducts.length})` },
          { id: 'wholesale', label: 'Wholesale Supplies (25% Off)' },
          { id: 'wallet', label: `Wallet & Payouts (K ${vendorWallet.availableBalance})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabLocal(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
              activeTab === tab.id
                ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Quick Metrics Cards */}
          <div className="grid-3">
            <div className="card p-5 bg-gradient-to-br from-amber-500/15 via-white/80 to-white dark:via-[#1A1A22] dark:to-slate-900 border border-amber-500/30">
              <span className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold uppercase tracking-wider block">Available Balance</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-500 my-1 font-heading">K {vendorWallet.availableBalance}</h2>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-slate-500 dark:text-slate-400">Total Earned: K {vendorWallet.totalEarned}</span>
                <button className="text-[#007AFF] font-bold cursor-pointer bg-transparent border-0" onClick={() => setActiveTabLocal('wallet')}>
                  Withdraw →
                </button>
              </div>
            </div>

            <div className="card p-5">
              <span className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold uppercase tracking-wider block">Active Appointments</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white my-1 font-heading">{activeConfirmedBookings.length}</h2>
              <p className="text-xs text-emerald-500 font-medium">
                {activeConfirmedBookings.length > 0 ? `${activeConfirmedBookings.length} upcoming today/tomorrow` : 'Queue is clear'}
              </p>
            </div>

            <div className="card p-5">
              <span className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold uppercase tracking-wider block">Completed Campus Jobs</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white my-1 font-heading">{vendorWallet.completedJobsCount}</h2>
              {myRating > 0 ? (
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                  <Star size={13} fill="#F5A623" />
                  <span>{myRating.toFixed(1)} Star Average ({myReviewsCount} reviews)</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1 m-0">No ratings yet</p>
              )}
            </div>
          </div>

          {/* Incoming Appointments Queue Quick View */}
          <div className="card p-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight m-0">Upcoming Client Appointments</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Accept, reschedule, or communicate with clients</p>
              </div>
              <button
                className="apple-btn-secondary text-xs px-3.5 py-1.5"
                onClick={() => setActiveTabLocal('schedule')}
              >
                View Full Queue
              </button>
            </div>

            {activeConfirmedBookings.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active bookings right now. Share your referral link or hairstyle portfolio to get clients!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeConfirmedBookings.slice(0, 2).map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <span className="badge badge-in-stock text-[10px] mb-1">{b.serviceType || 'Travel to Dorm'}</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">{b.serviceName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-0">
                        Client: <strong className="text-slate-900 dark:text-white">{b.customerName}</strong> ({b.customerPhone}) • <span className="text-amber-500">{b.date} at {b.time}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                        Location: {b.campus} ({b.hostel})
                        {(b.locationLink || b.location_link) && (
                          <a href={b.locationLink || b.location_link} target="_blank" rel="noopener noreferrer" className="ml-1.5 text-[#007AFF] font-semibold">
                            View Map Pin →
                          </a>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/260${(b.customerPhone || '').replace(/^0/, '')}?text=Hi%20${encodeURIComponent(b.customerName)},%20I'm%20your%20campus%20stylist%20for%20your%20appointment%20ref:${b.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="apple-btn-secondary text-xs px-3 py-1.5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp Client</span>
                      </a>
                      <button
                        className="apple-btn-primary text-xs px-3 py-1.5"
                        onClick={() => completeBooking(b.id)}
                      >
                        <Check size={13} />
                        <span>Mark Done</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SCHEDULE & TIMETABLE MANAGER */}
      {activeTab === 'schedule' && (
        <div className="flex flex-col gap-5">
          {/* Shareable Bio Link Card */}
          <div className="card p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-amber-400/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="badge badge-low-stock text-[10px] font-bold py-0.5 px-2 mb-1.5">Direct Booking Link</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight m-0">Share Your Personal Booking Link</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-2">
                  Paste this link in your WhatsApp status, TikTok bio, or IG to receive direct student appointments on your timetable.
                </p>
                <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 font-mono text-xs text-amber-600 dark:text-amber-300">
                  <span>{bioUrl}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyBioUrl}
                  className="apple-btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
                >
                  {copiedBioLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedBioLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={handleShareBioWhatsApp}
                  className="apple-btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white border-0"
                >
                  <MessageSquare size={14} />
                  <span>WhatsApp Status</span>
                </button>
              </div>
            </div>
          </div>

          {/* Class & Lecture Hours Timetable Blocker */}
          <div className="card p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight m-0">Class & Lecture Hours Blocker</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                  Block your class, exam, or study hours so students cannot book those slots.
                </p>
              </div>
              <span className="badge badge-in-stock text-xs">Working: {currentSchedule.workingHours?.start || '08:00'} – {currentSchedule.workingHours?.end || '20:00'}</span>
            </div>

            {/* Add Block Form */}
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-2xl border border-black/5 dark:border-white/5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Block Class Time:</span>
              <select
                value={blockDay}
                onChange={(e) => setBlockDay(e.target.value)}
                className="form-select py-1.5 px-3 text-xs w-auto rounded-xl"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={blockHour}
                onChange={(e) => setBlockHour(e.target.value)}
                className="form-select py-1.5 px-3 text-xs w-auto rounded-xl"
              >
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddBlockedSlot}
                className="apple-btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Block Slot</span>
              </button>
            </div>

            {/* Currently Blocked Slots List */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Currently Blocked Timetable Hours ({currentSchedule.blockedSlots?.length || 0}):
              </span>
              {!currentSchedule.blockedSlots || currentSchedule.blockedSlots.length === 0 ? (
                <p className="text-xs text-slate-400 italic m-0">No blocked hours. You are open for all standard working slots.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentSchedule.blockedSlots.map((slot) => (
                    <div
                      key={slot}
                      className="bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 font-medium"
                    >
                      <Lock size={12} />
                      <span>{slot} (Blocked)</span>
                      <button
                        onClick={() => handleRemoveBlockedSlot(slot)}
                        className="text-red-400 hover:text-red-600 bg-transparent border-0 cursor-pointer p-0 font-bold"
                        title="Unblock this slot"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Client Appointments List */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-3">
              Upcoming Student Appointments ({myBookings.length})
            </h3>

            <div className="flex flex-col gap-3">
              {myBookings.length === 0 ? (
                <div className="card p-8 text-center text-slate-400">
                  <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white m-0">No appointments scheduled yet</p>
                  <p className="text-xs text-slate-400 mt-1">Share your bio link to get booked by campus students!</p>
                </div>
              ) : (
                myBookings.map((b) => (
                  <div key={b.id} className="card p-4 sm:p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge badge-in-stock text-[10px]">{b.serviceType || 'Dorm Appointment'}</span>
                          <span className="text-[11px] text-slate-400 font-mono">Ref: {b.id}</span>
                          {(b.depositAmount || b.deposit_amount) > 0 && (
                            <span className="badge badge-verified text-[10px] bg-emerald-500/15 text-emerald-600">Deposit Paid (K{b.depositAmount || b.deposit_amount})</span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight m-0">{b.serviceName}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
                          Client: <strong className="text-slate-900 dark:text-white">{b.customerName}</strong> • Phone: <strong className="text-slate-900 dark:text-white">{b.customerPhone}</strong>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                          Location: {b.campus} — {b.hostel}
                          {(b.locationLink || b.location_link) && (
                            <a href={b.locationLink || b.location_link} target="_blank" rel="noopener noreferrer" className="ml-1.5 text-[#007AFF] font-semibold">
                              View Map Pin →
                            </a>
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="price-tag text-base">K {b.totalPrice || b.total_price || b.price}</span>
                        {(b.balanceDue ?? b.balance_due) > 0 ? (
                          <span className="text-[11px] text-amber-500 block font-semibold">Collect K{b.balanceDue ?? b.balance_due} on Arrival</span>
                        ) : (
                          <span className="text-[11px] text-emerald-500 block font-semibold">Paid in Full</span>
                        )}
                        <div className={`badge ${b.status === 'Confirmed' ? 'badge-in-stock' : b.status === 'Completed' ? 'badge-verified' : 'badge-out-of-stock'} block mt-1`}>
                          {b.status}
                        </div>
                      </div>
                    </div>

                    {/* Selected Add-Ons details */}
                    {b.selectedAddOns?.length > 0 && (
                      <div className="bg-black/[0.02] dark:bg-slate-900/60 p-2.5 rounded-xl text-xs mb-3 border border-black/5 dark:border-white/5">
                        <span className="text-slate-400 font-semibold block mb-1">Client Selected Add-ons:</span>
                        <div className="flex flex-wrap gap-2">
                          {b.selectedAddOns.map((addon) => (
                            <span key={addon.id} className="bg-amber-400/15 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                              {addon.name} (+K{addon.price})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-black/5 dark:border-white/10 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Scheduled: <strong className="text-amber-500">{b.date} at {b.time}</strong></span>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/260${(b.customerPhone || '0971234567').replace(/^0/, '')}?text=Hi%20${encodeURIComponent(b.customerName)},%20I'm%20your%20campus%20stylist%20for%20your%20${encodeURIComponent(b.serviceName)}%20appointment%20(Ref:%20${b.id}).%20Looking%20forward%20to%20our%20session!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="apple-btn-secondary text-xs px-3 py-1.5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold"
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp Client</span>
                        </a>

                        {b.status === 'Confirmed' && (
                          <button
                            className="apple-btn-primary text-xs px-3.5 py-1.5"
                            onClick={() => completeBooking(b.id)}
                          >
                            <Check size={13} />
                            <span>Complete Job</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SERVICE MENU MANAGER */}
      {activeTab === 'services' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight m-0">My Service & Pricing Menu</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Configure haircuts, braids, add-on treatments, and durations</p>
            </div>
            <button
              className="apple-btn-primary text-xs px-3.5 py-2"
              onClick={() => setShowAddServiceModal(true)}
            >
              <Plus size={14} />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid-2">
            {myServices.map((srv) => (
              <div key={srv.id} className="card p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge badge-in-stock text-[10px]">{srv.category}</span>
                    <span className="price-tag text-base">K {srv.price}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">{srv.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{srv.description}</p>

                  {/* Add-ons preview */}
                  {srv.addOns?.length > 0 && (
                    <div className="space-y-1 mb-3 text-xs bg-black/[0.02] dark:bg-white/[0.03] p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Add-ons Available:</span>
                      {srv.addOns.map((a) => (
                        <div key={a.id} className="flex justify-between text-slate-600 dark:text-slate-300 text-[11px]">
                          <span>{a.name}</span>
                          <span className="font-semibold text-amber-500">+K {a.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/10 text-xs text-slate-400">
                  <span>Duration: {srv.duration} mins</span>
                  <span className="text-emerald-500 font-bold">Active in Studio</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. INSTAGRAM-STYLE PORTFOLIO MANAGER */}
      {activeTab === 'portfolio' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight m-0">My Visual Portfolio</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Showcase your before-and-after work to attract student bookings</p>
            </div>
            <button
              className="apple-btn-primary text-xs px-3.5 py-2"
              onClick={() => setShowPortfolioModal(true)}
            >
              <UploadCloud size={14} />
              <span>Add Transformation</span>
            </button>
          </div>

          {(!myStylistObj.portfolio || myStylistObj.portfolio.length === 0) ? (
            <div className="card p-8 text-center text-slate-400">
              <UploadCloud size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-900 dark:text-white m-0">No transformations uploaded yet</p>
              <p className="text-xs text-slate-400 mt-1">Add your first hairstyle photo to start attracting bookings!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {myStylistObj.portfolio.map((item) => (
                <div key={item.id} className="relative rounded-3xl overflow-hidden aspect-square border border-black/10 dark:border-white/10 bg-slate-900 group">
                  <img src={item.image} alt={item.tag} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                    <span className="text-xs font-bold leading-tight">{item.tag}</span>
                    <span className="text-[10px] text-slate-300">{item.client}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. MY SHOP — vendor-owned product listings */}
      {activeTab === 'shop' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight m-0">My Shop</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0">List your own hair products, tools, or kits for students to buy</p>
            </div>
            <button
              className="apple-btn-primary text-xs px-3.5 py-2"
              onClick={() => setShowAddProductModal(true)}
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>

          {myProducts.length > 0 && (
            <div className="grid-3">
              <div className="card p-4">
                <span className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold uppercase tracking-wider block">Products Listed</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white my-1 font-heading">{myProducts.length}</h3>
              </div>
              <div className="card p-4">
                <span className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold uppercase tracking-wider block">Units Sold</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white my-1 font-heading">{totalUnitsSold}</h3>
              </div>
              <div className="card p-4 bg-gradient-to-br from-amber-500/15 via-white/80 to-white dark:via-[#1A1A22] dark:to-slate-900 border border-amber-500/30">
                <span className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold uppercase tracking-wider block">Shop Revenue</span>
                <h3 className="text-xl font-extrabold text-amber-500 my-1 font-heading">K {totalProductRevenue}</h3>
              </div>
            </div>
          )}

          {myProducts.length === 0 ? (
            <div className="card p-8 text-center text-slate-400">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-900 dark:text-white m-0">No products listed yet</p>
              <p className="text-xs text-slate-400 mt-1">Add a product to start selling directly to campus students.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProducts.map((prd) => {
                const stockLevel = Number(prd.stock) || 0;
                const stockBadge = stockLevel === 0
                  ? { label: 'Out of Stock', cls: 'badge-out-of-stock' }
                  : stockLevel <= 3
                    ? { label: `Low Stock (${stockLevel})`, cls: 'badge-low-stock' }
                    : { label: 'In Stock', cls: 'badge-in-stock' };
                return (
                  <div key={prd.id} className="card p-4 flex flex-col justify-between border border-black/10 dark:border-white/10 bg-white dark:bg-[#15151c]">
                    <div>
                      <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-3 bg-slate-800">
                        <img src={prd.image} alt={prd.name} className="w-full h-full object-cover" />
                        <span className={`badge ${stockBadge.cls} absolute top-2 left-2 text-[10px]`}>{stockBadge.label}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mb-1">{prd.name}</h4>
                      <p className="text-[11px] text-slate-400 mb-2 line-clamp-2">{prd.description}</p>
                      <span className="price-tag text-base">K {prd.price}</span>
                    </div>

                    <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] text-slate-400 font-semibold" htmlFor={`stock-${prd.id}`}>Stock:</label>
                        <input
                          id={`stock-${prd.id}`}
                          type="number"
                          min="0"
                          className="form-input text-xs py-1 w-16"
                          defaultValue={prd.stock}
                          onBlur={(e) => updateProductStock(prd.id, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => deleteProduct(prd.id)}
                        className="text-red-500 hover:text-red-600 bg-transparent border-0 cursor-pointer text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sales History — a real, tamper-proof record of what's actually sold */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-3">
              Sales History ({vendorSales.length})
            </h3>
            {vendorSales.length === 0 ? (
              <div className="card p-6 text-center text-slate-400">
                <p className="text-xs m-0">No sales yet. Once a student buys one of your products, it'll show up here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {vendorSales.map((sale) => (
                  <div key={sale.id} className="card p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{sale.productName}</span>
                      <span className="text-slate-400"> × {sale.quantity}</span>
                      <p className="text-[11px] text-slate-400 m-0">
                        {sale.customerName ? `Sold to ${sale.customerName} • ` : ''}
                        {new Date(sale.createdAt).toLocaleDateString()} • Ref: {sale.orderId}
                      </p>
                    </div>
                    <span className="price-tag text-sm shrink-0">K {sale.totalAmount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. WHOLESALE SUPPLIES CLUB (ANTI-DISINTERMEDIATION MOAT) */}
      {activeTab === 'wholesale' && (
        <div className="flex flex-col gap-5">
          {/* Wholesale Club Benefits Banner */}
          <div className="card p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-amber-400/30">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400/20 text-amber-500 p-2.5 rounded-2xl border border-amber-400/30 shrink-0">
                <Package size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight m-0">
                    Stylist Wholesale Supplies Club
                  </h3>
                  <span className="badge badge-verified text-[10px] py-0.5 px-2 bg-amber-400 text-slate-950 font-extrabold">25% OFF Town Prices</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0">
                  Bulk hair packs, clippers, oils & mousse delivered straight to your campus room ({vendorProfile.dormLocation}). Use your vendor wallet to reorder!
                </p>
              </div>
            </div>
          </div>

          {/* Wholesale Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wholesaleSupplies.map((item) => (
              <div
                key={item.id}
                className="card p-4 flex flex-col justify-between border border-black/10 dark:border-white/10 bg-white dark:bg-[#15151c]"
              >
                <div>
                  <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-3 bg-slate-800">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <span className="badge badge-in-stock absolute top-2.5 left-2.5 text-[10px]">
                      {item.category}
                    </span>
                    <span className="badge bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30 absolute bottom-2.5 left-2.5 text-[10px] font-bold">
                      Save K{item.marketPrice - item.wholesalePrice}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-2">Package: {item.unit}</p>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="price-tag text-lg text-emerald-500">K {item.wholesalePrice}</span>
                    <span className="text-xs text-slate-400 line-through">Town: K {item.marketPrice}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold">Free Hostel Dropoff</span>
                  <button
                    onClick={() => {
                      if (vendorWallet.availableBalance < item.wholesalePrice) {
                        addToast('Insufficient wallet balance. Complete more bookings or top up!', 'error');
                        return;
                      }
                      playSuccessChime();
                      addToast(`Order placed for ${item.name}! Delivered to ${vendorProfile.dormLocation} tomorrow.`, 'success');
                    }}
                    className="apple-btn-primary text-xs py-1.5 px-3 font-bold"
                  >
                    <span>Order (K {item.wholesalePrice})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. WALLET & PAYOUTS */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payout Withdrawal Card */}
          <div className="card p-6 border-amber-400/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-amber-400/15 p-2 rounded-2xl text-amber-500">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight m-0">Vendor Mobile Money Payout</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Instant withdrawal to your Zambian mobile money account (Airtel, MTN, Zamtel).
              </p>

              <div className="bg-black/[0.03] dark:bg-white/[0.04] p-4 rounded-2xl border border-black/5 dark:border-white/10 mb-4">
                <span className="text-xs text-slate-400 block mb-1">Available for Withdrawal:</span>
                <span className="price-tag text-2xl">K {vendorWallet.availableBalance}</span>
              </div>

              <form onSubmit={handlePayoutSubmit} className="space-y-3">
                <div className="form-group mb-2">
                  <label className="form-label" htmlFor="payout-amount">Withdrawal Amount (K):</label>
                  <input
                    id="payout-amount"
                    type="number"
                    min="10"
                    max={vendorWallet.availableBalance}
                    placeholder="e.g. 300"
                    className="form-input text-xs"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                  />
                </div>

                {savedPayoutAccounts.length > 0 ? (
                  <div className="form-group mb-3">
                    <label className="form-label" htmlFor="payout-account">Pay Out To:</label>
                    <select
                      id="payout-account"
                      className="form-select text-xs"
                      value={`${payoutProvider}|${payoutNumber}`}
                      onChange={(e) => {
                        const [prov, num] = e.target.value.split('|');
                        setPayoutProvider(prov);
                        setPayoutNumber(num);
                      }}
                    >
                      {savedPayoutAccounts.map((acc) => (
                        <option key={acc.id} value={`${acc.provider}|${acc.number}`}>
                          {acc.provider} — {acc.number}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1 m-0">Manage saved accounts from Edit Profile.</p>
                  </div>
                ) : (
                  <>
                    <div className="form-group mb-2">
                      <label className="form-label" htmlFor="payout-provider">Mobile Money Provider:</label>
                      <select
                        id="payout-provider"
                        className="form-select text-xs"
                        value={payoutProvider}
                        onChange={(e) => setPayoutProvider(e.target.value)}
                      >
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="MTN Mobile Money">MTN Mobile Money</option>
                        <option value="Zamtel Kwacha">Zamtel Kwacha</option>
                      </select>
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="payout-phone">Registered Mobile Number:</label>
                      <input
                        id="payout-phone"
                        type="tel"
                        className="form-input text-xs"
                        value={payoutNumber}
                        onChange={(e) => setPayoutNumber(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-400 mt-1 m-0">Save this in Edit Profile to add more providers.</p>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={vendorWallet.availableBalance <= 0}
                  className="apple-btn-primary w-full text-xs py-2.5"
                >
                  <span>Request Instant Payout</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Payout History Ledger */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-3">Payout Ledger History</h3>
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-80 pr-1">
                {vendorWallet.payouts.map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{p.provider} — K{p.amount}</div>
                      <div className="text-[11px] text-slate-400">{p.date} • Ref: {p.ref}</div>
                    </div>
                    <span className="badge badge-in-stock text-[10px]">{p.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 text-[11px] text-slate-400">
              ⚡ Mobile Money payouts are processed instantly via automated payment rails.
            </div>
          </div>
        </div>
      )}

      {/* CREATE SERVICE MODAL */}
      {showAddServiceModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowAddServiceModal(false)}>
          <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Add New Campus Hairstyle / Service</h3>

            <div className="form-group">
              <label className="form-label">Service Title:</label>
              <input
                type="text"
                className="form-input text-xs"
                placeholder="e.g. Burst Fade & Lineup"
                value={newSrvName}
                onChange={(e) => setNewSrvName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category:</label>
              <select className="form-select text-xs" value={newSrvCat} onChange={(e) => setNewSrvCat(e.target.value)}>
                <option value="Barbering">Barbering</option>
                <option value="Braids & Natural Hair">Braids & Natural Hair</option>
                <option value="Wigs & Weaves">Wigs & Weaves</option>
                <option value="Locs">Locs</option>
                <option value="Nails & Lashes">Nails & Lashes</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 form-group">
              <div>
                <label className="form-label">Base Price (K):</label>
                <input
                  type="number"
                  className="form-input text-xs"
                  value={newSrvPrice}
                  onChange={(e) => setNewSrvPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Duration (Mins):</label>
                <input
                  type="number"
                  className="form-input text-xs"
                  value={newSrvDuration}
                  onChange={(e) => setNewSrvDuration(e.target.value)}
                />
              </div>
            </div>

            {/* Optional Custom Add-ons */}
            <div className="mb-4 bg-black/[0.02] dark:bg-white/[0.03] p-3 rounded-2xl border border-black/5 dark:border-white/5">
              <label className="form-label mb-1">Add-On Options (Optional):</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Beard Oil Wash"
                  className="form-input py-1 text-xs flex-1"
                  value={newSrvAddOnName}
                  onChange={(e) => setNewSrvAddOnName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="K"
                  className="form-input py-1 text-xs w-20"
                  value={newSrvAddOnPrice}
                  onChange={(e) => setNewSrvAddOnPrice(e.target.value)}
                />
                <button type="button" className="apple-btn-secondary text-xs px-3" onClick={handleAddTempAddOn}>
                  Add
                </button>
              </div>

              {tempAddOns.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tempAddOns.map((a) => (
                    <span key={a.id} className="text-[11px] bg-amber-400/20 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-lg font-semibold">
                      {a.name} (+K{a.price})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="apple-btn-secondary text-xs flex-1" onClick={() => setShowAddServiceModal(false)}>
                Cancel
              </button>
              <button className="apple-btn-primary text-xs flex-1" onClick={handleSaveService}>
                Save to Menu
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* UPLOAD PORTFOLIO MODAL */}
      {showPortfolioModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowPortfolioModal(false)}>
          <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Add Hairstyle Transformation</h3>

            <div className="form-group">
              <label className="form-label">Photo of the Finished Look:</label>
              <div className="flex items-center gap-4 bg-black/[0.02] dark:bg-white/[0.02] p-3.5 rounded-2xl border border-black/10 dark:border-white/10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm shrink-0 bg-slate-800 flex items-center justify-center">
                  {portImg ? (
                    <img src={portImg} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UploadCloud size={20} className="text-slate-500" />
                  )}
                </div>
                <label className={`apple-btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer ${uploadingPortfolioPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                  <UploadCloud size={13} />
                  <span>{uploadingPortfolioPhoto ? 'Uploading…' : portImg ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPortfolioPhoto}
                    onChange={handlePortfolioImagePicker}
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hairstyle / Cut Tag:</label>
              <input
                type="text"
                className="form-input text-xs"
                placeholder="e.g. Crisp Taper Fade & Razor Lineup"
                value={portTag}
                onChange={(e) => setPortTag(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Client Name / Campus Tag:</label>
              <input
                type="text"
                className="form-input text-xs"
                placeholder="e.g. Mwamba (UNILUS Silverest)"
                value={portClient}
                onChange={(e) => setPortClient(e.target.value)}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button className="apple-btn-secondary text-xs flex-1" onClick={() => setShowPortfolioModal(false)}>
                Cancel
              </button>
              <button className="apple-btn-primary text-xs flex-1" disabled={uploadingPortfolioPhoto} onClick={handleSavePortfolio}>
                Save Photo
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowEditProfileModal(false)}>
          <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Edit My Stylist Profile</h3>

            <div className="form-group">
              <label className="form-label">Profile Photo:</label>
              <div className="flex items-center gap-4 bg-black/[0.02] dark:bg-white/[0.02] p-3.5 rounded-2xl border border-black/10 dark:border-white/10">
                <img
                  src={editAvatar || vendorProfile.avatar}
                  alt="Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0 bg-slate-800"
                />
                <label className={`apple-btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer ${uploadingAvatar ? 'opacity-60 pointer-events-none' : ''}`}>
                  <UploadCloud size={13} />
                  <span>{uploadingAvatar ? 'Uploading…' : 'Change Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingAvatar}
                    onChange={handleAvatarPicker}
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name / Brand Name:</label>
              <input
                type="text"
                className="form-input text-xs"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Phone Number:</label>
              <input
                type="tel"
                className="form-input text-xs"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Tagline:</label>
              <textarea
                rows={3}
                className="form-input text-xs"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 form-group">
              <div>
                <label className="form-label">Campus:</label>
                <select
                  className="form-select text-xs"
                  value={editCampus}
                  onChange={(e) => setEditCampus(e.target.value)}
                >
                  {lusakaUniversities.map((uni) => (
                    <option key={uni.id} value={uni.name}>{uni.shortName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Hostel / Studio Location:</label>
                {campusHostels[editCampus] ? (
                  <select
                    className="form-select text-xs"
                    value={editDormLocation}
                    onChange={(e) => setEditDormLocation(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {campusHostels[editCampus].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Hostel Block C, Room 14"
                    className="form-input text-xs"
                    value={editDormLocation}
                    onChange={(e) => setEditDormLocation(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gender:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditGender('male')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                    editGender === 'male'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setEditGender('female')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                    editGender === 'female'
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Specialty Skills (select all that apply):</label>
              <div className="flex flex-wrap gap-1.5">
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => toggleEditSpecialty(specialty)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all ${
                      editSpecialties.includes(specialty)
                        ? 'bg-amber-400 border-amber-400 text-slate-950'
                        : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Social Media Links (Instagram, TikTok, etc.):</label>
              {editSocialLinks.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-2">
                  {editSocialLinks.map((link, i) => (
                    <div key={link + i} className="flex items-center justify-between gap-2 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 rounded-xl border border-black/5 dark:border-white/5 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{link}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(i)}
                        className="text-red-500 hover:text-red-600 bg-transparent border-0 cursor-pointer text-[11px] font-semibold shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://instagram.com/yourhandle"
                  className="form-input text-xs flex-1"
                  value={newSocialLinkInput}
                  onChange={(e) => setNewSocialLinkInput(e.target.value)}
                />
                <button type="button" className="apple-btn-secondary text-xs px-3" onClick={handleAddSocialLink}>
                  Add
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Money Payout Accounts:</label>
              <p className="text-[11px] text-slate-400 mb-2 m-0">
                Add every provider you use so you can pick the right one when requesting a payout.
              </p>
              {editPayoutAccounts.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-2">
                  {editPayoutAccounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between gap-2 bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 rounded-xl border border-black/5 dark:border-white/5 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{acc.provider} — {acc.number}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePayoutAccount(acc.id)}
                        className="text-red-500 hover:text-red-600 bg-transparent border-0 cursor-pointer text-[11px] font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <select
                  className="form-select text-xs w-auto"
                  value={newAccountProvider}
                  onChange={(e) => setNewAccountProvider(e.target.value)}
                >
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Zamtel Kwacha">Zamtel Kwacha</option>
                </select>
                <input
                  type="tel"
                  placeholder="0971234567"
                  className="form-input text-xs flex-1"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                />
                <button type="button" className="apple-btn-secondary text-xs px-3" onClick={handleAddPayoutAccount}>
                  Add
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Student ID / Verification Document
                {vendorProfile.isVerified ? (
                  <span className="ml-2 badge badge-verified text-[10px]">Verified</span>
                ) : (
                  <span className="ml-2 badge badge-out-of-stock text-[10px]">Pending Review</span>
                )}
              </label>
              <p className="text-[11px] text-slate-400 mb-2 m-0">
                Upload a photo of your student ID so an admin can verify you're a real campus stylist. This is what earns your "Verified" badge — it isn't automatic.
              </p>
              <div className="flex items-center gap-4 bg-black/[0.02] dark:bg-white/[0.02] p-3.5 rounded-2xl border border-black/10 dark:border-white/10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm shrink-0 bg-slate-800 flex items-center justify-center">
                  {editIdDocument ? (
                    <img src={editIdDocument} alt="ID document preview" className="w-full h-full object-cover" />
                  ) : (
                    <ShieldCheck size={20} className="text-slate-500" />
                  )}
                </div>
                <label className={`apple-btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer ${uploadingIdDocument ? 'opacity-60 pointer-events-none' : ''}`}>
                  <UploadCloud size={13} />
                  <span>{uploadingIdDocument ? 'Uploading…' : editIdDocument ? 'Replace Document' : 'Upload Document'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingIdDocument}
                    onChange={handleIdDocumentPicker}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="apple-btn-secondary text-xs flex-1" onClick={() => setShowEditProfileModal(false)}>
                Cancel
              </button>
              <button className="apple-btn-primary text-xs flex-1" disabled={uploadingAvatar || uploadingIdDocument || savingProfile} onClick={handleSaveProfile}>
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Add Product to My Shop</h3>

            <div className="form-group">
              <label className="form-label">Product Photo:</label>
              <div className="flex items-center gap-4 bg-black/[0.02] dark:bg-white/[0.02] p-3.5 rounded-2xl border border-black/10 dark:border-white/10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm shrink-0 bg-slate-800 flex items-center justify-center">
                  {newPrdImage ? (
                    <img src={newPrdImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UploadCloud size={20} className="text-slate-500" />
                  )}
                </div>
                <label className={`apple-btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer ${uploadingProductPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                  <UploadCloud size={13} />
                  <span>{uploadingProductPhoto ? 'Uploading…' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingProductPhoto}
                    onChange={handleProductImagePicker}
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product Name:</label>
              <input
                type="text"
                className="form-input text-xs"
                placeholder="e.g. Edge Control Gel (100g)"
                value={newPrdName}
                onChange={(e) => setNewPrdName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category:</label>
              <select className="form-select text-xs" value={newPrdCategory} onChange={(e) => setNewPrdCategory(e.target.value)}>
                <option value="Hair Care Products">Hair Care Products</option>
                <option value="Nails & Lashes">Nails & Lashes</option>
                <option value="Wigs & Weaves">Wigs & Weaves</option>
                <option value="Barber Supplies">Barber Supplies</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 form-group">
              <div>
                <label className="form-label">Price (K):</label>
                <input
                  type="number"
                  className="form-input text-xs"
                  value={newPrdPrice}
                  onChange={(e) => setNewPrdPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Stock Quantity:</label>
                <input
                  type="number"
                  className="form-input text-xs"
                  value={newPrdStock}
                  onChange={(e) => setNewPrdStock(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea
                rows={2}
                className="form-input text-xs"
                placeholder="Describe the product for student buyers"
                value={newPrdDesc}
                onChange={(e) => setNewPrdDesc(e.target.value)}
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button className="apple-btn-secondary text-xs flex-1" onClick={() => setShowAddProductModal(false)}>
                Cancel
              </button>
              <button className="apple-btn-primary text-xs flex-1" disabled={uploadingProductPhoto} onClick={handleSaveProduct}>
                Add to Shop
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
