import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  DollarSign,
  Calendar,
  Package,
  Plus,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  ArrowLeft,
  Trash2,
  Edit3,
  Users,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  CreditCard,
  Building,
  Store,
  Scissors,
  Phone,
  Sparkles,
  ExternalLink,
  MessageSquare,
  BadgeCheck,
  Ban,
  ArrowUpRight,
  UploadCloud,
  Flag,
  ShieldOff,
  ShieldAlert,
  Award
} from 'lucide-react';
import { useApp, DEFAULT_AVATAR } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { uploadImage } from '../lib/uploadImage';

export default function AdminDashboardView() {
  const {
    services,
    products,
    bookings,
    orders,
    staffList,
    addService,
    updateService,
    addProduct,
    updateProductStock,
    updateOrderStatus,
    updateBookingStatus,
    verifyStylist,
    settleVendorPayout,
    suspendUser,
    unsuspendUser,
    lusakaUniversities,
    user,
    addToast
  } = useApp();

  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'vendors' | 'traffic' | 'payouts' | 'catalog' | 'users' | 'reports'
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCampusFilter, setVendorCampusFilter] = useState('All');
  const [vendorVerifyFilter, setVendorVerifyFilter] = useState('All'); // 'All' | 'Verified' | 'Pending'
  const [trafficCampusFilter, setTrafficCampusFilter] = useState('All');
  const [trafficStatusFilter, setTrafficStatusFilter] = useState('All');
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState(null);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState('open');
  const [suspendTarget, setSuspendTarget] = useState(null); // { id, name, isVendor } while the suspend-reason modal is open
  const [suspendReason, setSuspendReason] = useState('');

  // Modals
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [selectedStylistToVerify, setSelectedStylistToVerify] = useState(null);

  // New service form state
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCat, setNewSrvCat] = useState('Barbering');
  const [newSrvPrice, setNewSrvPrice] = useState('90');
  const [newSrvDuration, setNewSrvDuration] = useState('40');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvImage, setNewSrvImage] = useState(null);
  const [uploadingSrvPhoto, setUploadingSrvPhoto] = useState(false);

  // New product form state
  const [newPrdName, setNewPrdName] = useState('');
  const [newPrdCat, setNewPrdCat] = useState('Hair Care Products');
  const [newPrdPrice, setNewPrdPrice] = useState('120');
  const [newPrdStock, setNewPrdStock] = useState('20');
  const [newPrdDesc, setNewPrdDesc] = useState('');
  const [newPrdImage, setNewPrdImage] = useState(null);
  const [uploadingPrdPhoto, setUploadingPrdPhoto] = useState(false);

  // New Vendor Form State
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorRole, setNewVendorRole] = useState('Master Barber & Stylist');
  const [newVendorCampus, setNewVendorCampus] = useState(lusakaUniversities[0]?.name || 'UNILUS Silverest Campus');
  const [newVendorDorm, setNewVendorDorm] = useState('Silverest Hostel, Block C');
  const [newVendorPhone, setNewVendorPhone] = useState('0971234567');
  const [newVendorProvider, setNewVendorProvider] = useState('Airtel Money');

  // Lock body scroll on modal opens & handle Escape
  useEffect(() => {
    const isAnyModalOpen = showAddServiceModal || showAddProductModal || showAddVendorModal || !!selectedStylistToVerify || !!suspendTarget;
    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddServiceModal(false);
        setShowAddProductModal(false);
        setShowAddVendorModal(false);
        setSelectedStylistToVerify(null);
        setSuspendTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddServiceModal, showAddProductModal, showAddVendorModal, selectedStylistToVerify, suspendTarget]);

  // Fetches every profile (customers, vendors, admins) once on mount — small
  // enough at this scale to just cache, and the vendors tab below needs it
  // too (vendor_profiles has no is_suspended column of its own; suspension
  // always lives on profiles).
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoadingCustomers(true);
    supabase
      .from('profiles')
      .select('id, name, phone, campus, hostel, role, loyalty_points, is_suspended, suspended_reason, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAllCustomers(data || []);
        setLoadingCustomers(false);
      });
  }, []);

  // Lazy-fetch the report queue only when that tab is opened.
  useEffect(() => {
    if (adminTab !== 'reports' || !isSupabaseConfigured || !supabase) return;
    setLoadingReports(true);
    supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReports(data || []);
        setLoadingReports(false);
      });
  }, [adminTab]);

  // Total signed-up users (every role, not just vendors) — profiles isn't
  // part of the app-wide bulk fetch, so this is a lightweight admin-only count.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.from('profiles').select('id', { count: 'exact', head: true }).then(({ count }) => {
      if (typeof count === 'number') setTotalUsersCount(count);
    });
  }, []);

  // Lazy-fetch analytics only when the tab is opened — this table isn't part
  // of the app-wide bulk fetch since only admins ever need it.
  useEffect(() => {
    if (adminTab !== 'analytics' || !isSupabaseConfigured || !supabase) return;
    setLoadingAnalytics(true);
    supabase
      .from('analytics_events')
      .select('event_name, created_at')
      .order('created_at', { ascending: false })
      .limit(2000)
      .then(({ data }) => {
        if (data) {
          const counts = {};
          data.forEach((e) => {
            counts[e.event_name] = (counts[e.event_name] || 0) + 1;
          });
          setAnalyticsSummary({ counts, total: data.length });
        }
        setLoadingAnalytics(false);
      });
  }, [adminTab]);

  // Defense in depth: don't trust the router alone to keep non-admins out.
  if (user?.role !== 'admin') {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4">
        <div className="apple-card p-6 text-center border-red-400/30">
          <div className="w-14 h-14 rounded-3xl bg-red-400/15 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
            Access Denied
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This area is restricted to UniHairShop administrators.
          </p>
        </div>
      </div>
    );
  }

  // Executive Calculations
  const grossBookingGMV = bookings.reduce((sum, b) => (b.status !== 'Cancelled' ? sum + (Number(b.price) || Number(b.totalPrice) || 0) : sum), 0);
  const grossRetailGMV = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const totalPlatformGMV = grossBookingGMV + grossRetailGMV;
  const pendingVendorsCount = staffList.filter((s) => !(s.isVerified || s.is_verified)).length;

  const filteredCustomers = allCustomers.filter((c) =>
    !customerSearch.trim() ||
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  // Reports reference auth.users ids directly (not a PostgREST-embeddable
  // relationship), so names are resolved client-side against whichever
  // directories are already loaded — falls back to a truncated id.
  const resolveUserName = (id) => {
    const vendor = staffList.find((s) => s.id === id);
    if (vendor) return vendor.name;
    const customer = allCustomers.find((c) => c.id === id);
    if (customer) return customer.name;
    return `User ${String(id).slice(0, 8)}…`;
  };

  const filteredReports = reports.filter((r) => reportStatusFilter === 'All' || r.status === reportStatusFilter);

  const handleOpenSuspend = (id, name, isVendor) => {
    setSuspendTarget({ id, name, isVendor });
    setSuspendReason('');
  };

  const handleConfirmSuspend = async () => {
    if (!suspendTarget) return;
    await suspendUser(suspendTarget.id, suspendReason.trim(), suspendTarget.isVendor);
    setAllCustomers((prev) => prev.map((c) => (c.id === suspendTarget.id ? { ...c, is_suspended: true, suspended_reason: suspendReason.trim() } : c)));
    setSuspendTarget(null);
    setSuspendReason('');
  };

  const handleUnsuspend = async (id, isVendor) => {
    await unsuspendUser(id, isVendor);
    setAllCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, is_suspended: false, suspended_reason: null } : c)));
  };

  const handleReportStatus = async (reportId, status) => {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('reports').update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', reportId);
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
  };

  // Platform 10% take rate + K5 platform safety fee per confirmed booking
  const confirmedBookingsCount = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Completed').length;
  const platformBookingFee = confirmedBookingsCount * 5;
  const platformCommission = Math.round(totalPlatformGMV * 0.10) + platformBookingFee;
  const totalVendorPayouts = Math.max(0, grossBookingGMV - platformCommission);

  // Campus traffic breakdown calculation
  const campusStats = lusakaUniversities.map((uni) => {
    const campusBookings = bookings.filter((b) => b.campus === uni.name);
    const campusStylists = staffList.filter((s) => s.campus === uni.name);
    const revenue = campusBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
    return {
      ...uni,
      bookingsCount: campusBookings.length,
      stylistsCount: campusStylists.length,
      revenue
    };
  });

  // Filtered Vendors
  const filteredVendors = staffList.filter((vendor) => {
    const isVerified = vendor.isVerified || vendor.is_verified;
    const matchesSearch = vendor.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          vendor.role.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          vendor.dormLocation?.toLowerCase().includes(vendorSearch.toLowerCase());
    const matchesCampus = vendorCampusFilter === 'All' || vendor.campus === vendorCampusFilter;
    const matchesVerify = vendorVerifyFilter === 'All' ||
                          (vendorVerifyFilter === 'Verified' && isVerified) ||
                          (vendorVerifyFilter === 'Pending' && !isVerified);
    return matchesSearch && matchesCampus && matchesVerify;
  });

  // Filtered Traffic Bookings
  const filteredTraffic = bookings.filter((b) => {
    const matchesCampus = trafficCampusFilter === 'All' || b.campus === trafficCampusFilter;
    const matchesStatus = trafficStatusFilter === 'All' || b.status === trafficStatusFilter;
    return matchesCampus && matchesStatus;
  });

  const handleServiceImagePicker = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSrvPhoto(true);
    try {
      const url = await uploadImage(file, { userId: user?.id, folder: 'services' });
      if (url) {
        setNewSrvImage(url);
      } else {
        addToast('Could not upload photo. Please try again.', 'error');
      }
    } finally {
      setUploadingSrvPhoto(false);
    }
  };

  const handleProductImagePicker = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPrdPhoto(true);
    try {
      const url = await uploadImage(file, { userId: user?.id, folder: 'products' });
      if (url) {
        setNewPrdImage(url);
      } else {
        addToast('Could not upload photo. Please try again.', 'error');
      }
    } finally {
      setUploadingPrdPhoto(false);
    }
  };

  const handleCreateService = (e) => {
    e.preventDefault();
    if (!newSrvName.trim()) {
      addToast('Service name is required', 'error');
      return;
    }
    addService({
      name: newSrvName.trim(),
      category: newSrvCat,
      price: Number(newSrvPrice) || 80,
      duration: Number(newSrvDuration) || 40,
      description: newSrvDesc.trim() || 'Campus beauty and styling service.',
      image: newSrvImage || undefined,
      canTravel: true,
      inStudio: true,
      popular: false
    });
    setShowAddServiceModal(false);
    setNewSrvName('');
    setNewSrvDesc('');
    setNewSrvImage(null);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newPrdName.trim()) {
      addToast('Product name is required', 'error');
      return;
    }
    addProduct({
      name: newPrdName.trim(),
      category: newPrdCat,
      price: Number(newPrdPrice) || 100,
      stock: Number(newPrdStock) || 20,
      description: newPrdDesc.trim() || 'Campus hair care product.',
      image: newPrdImage || undefined
    });
    setShowAddProductModal(false);
    setNewPrdName('');
    setNewPrdDesc('');
    setNewPrdImage(null);
  };

  const handleCreateVendor = (e) => {
    e.preventDefault();
    if (!newVendorName.trim()) {
      addToast('Stylist name is required', 'error');
      return;
    }
    verifyStylist(`stf-${Date.now().toString(36)}`, true);
    setShowAddVendorModal(false);
    setNewVendorName('');
    addToast(`New stylist ${newVendorName} added to ${newVendorCampus}!`, 'success');
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Master Admin Header */}
      <div className="card p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-white border border-amber-400/30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-apple-gold shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight m-0">
                Master Admin Command Portal
              </h1>
              <span className="badge badge-verified text-[10px] py-0.5 px-2 bg-amber-400 text-slate-950 font-extrabold">
                Executive Access
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 mb-0">
              Administrator: <strong className="text-amber-400">{user.name}</strong> ({user.email || 'mapalolungu65@gmail.com'}) • Full Campus Oversight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddVendorModal(true)}
            className="apple-btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Stylist</span>
          </button>
          <button
            onClick={() => setShowAddServiceModal(true)}
            className="apple-btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 text-white"
          >
            <Plus size={14} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-black/[0.04] dark:bg-white/[0.04] p-1.5 rounded-2xl border border-black/5 dark:border-white/10 gap-1 overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Platform Financials & Traffic', count: null },
          { id: 'vendors', label: '✂️ All Campus Vendors', count: staffList.length },
          { id: 'traffic', label: '📅 Live Booking Stream', count: bookings.length },
          { id: 'payouts', label: '📱 Mobile Money Payouts', count: null },
          { id: 'catalog', label: '🛍️ Services & Inventory', count: services.length + products.length },
          { id: 'analytics', label: '📈 Funnel Analytics', count: null },
          { id: 'users', label: '👥 Customers', count: totalUsersCount },
          { id: 'reports', label: '🚩 Reports', count: reports.filter((r) => r.status === 'open').length || null }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border-0 cursor-pointer flex items-center gap-1.5 ${
              adminTab === tab.id
                ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                adminTab === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-black/10 dark:bg-white/10 text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW & FINANCIAL TRAFFIC TAB */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="card p-5 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/30">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Gross Platform GMV</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-400 my-1">K {totalPlatformGMV.toLocaleString()}</h2>
              <p className="text-[11px] text-slate-400 m-0">Bookings: K {grossBookingGMV} • Retail: K {grossRetailGMV}</p>
            </div>

            <div className="card p-5 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 border border-emerald-500/30">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Net Platform Revenue</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 my-1">K {platformCommission.toLocaleString()}</h2>
              <p className="text-[11px] text-slate-400 m-0">10% Take Rate + Safety Fees</p>
            </div>

            <div className="card p-5 bg-gradient-to-br from-blue-500/15 via-slate-900 to-slate-950 border border-blue-500/30">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Appointments</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-400 my-1">{bookings.length}</h2>
              <p className="text-[11px] text-slate-400 m-0">{confirmedBookingsCount} active & completed</p>
            </div>

            <div className="card p-5 bg-gradient-to-br from-purple-500/15 via-slate-900 to-slate-950 border border-purple-500/30">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Active Stylists & Vendors</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-400 my-1">{staffList.length}</h2>
              <p className="text-[11px] text-slate-400 m-0">Across {lusakaUniversities.length} Lusaka Campuses</p>
            </div>

            <div className="card p-5 bg-gradient-to-br from-sky-500/15 via-slate-900 to-slate-950 border border-sky-500/30">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Registered Users</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-400 my-1">{totalUsersCount === null ? '—' : totalUsersCount}</h2>
              <p className="text-[11px] text-slate-400 m-0">Students, stylists & admins combined</p>
            </div>

            <div
              className="card p-5 bg-gradient-to-br from-rose-500/15 via-slate-900 to-slate-950 border border-rose-500/30 cursor-pointer hover:border-rose-400/50 transition-colors"
              onClick={() => { setAdminTab('vendors'); setVendorVerifyFilter('Pending'); }}
              title="Jump to pending vendor approvals"
            >
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Pending Vendor Approvals</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-400 my-1">{pendingVendorsCount}</h2>
              <p className="text-[11px] text-slate-400 m-0">{pendingVendorsCount > 0 ? 'Tap to review & approve →' : 'All caught up'}</p>
            </div>
          </div>

          {/* Campus Traffic Volume Breakdown */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">University Campus Traffic & Revenue</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Real-time breakdown of appointments and active stylists</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-black/[0.02] dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 border-b border-black/5 dark:border-white/10">
                  <tr>
                    <th className="p-3">Campus</th>
                    <th className="p-3">Location / Area</th>
                    <th className="p-3 text-center">Verified Stylists</th>
                    <th className="p-3 text-center">Bookings Count</th>
                    <th className="p-3 text-right">Gross GMV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {campusStats.map((camp) => (
                    <tr key={camp.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02]">
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building size={14} className="text-amber-500" />
                        <span>{camp.name}</span>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{camp.location}</td>
                      <td className="p-3 text-center font-semibold">{camp.stylistsCount}</td>
                      <td className="p-3 text-center">
                        <span className="badge badge-in-stock text-[10px] py-0.2 px-1.5">{camp.bookingsCount}</span>
                      </td>
                      <td className="p-3 text-right font-extrabold text-amber-500">K {camp.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ALL CAMPUS VENDORS & STYLISTS TAB */}
      {adminTab === 'vendors' && (
        <div className="space-y-4">
          {/* Verification Status Sub-Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'All', label: 'All Stylists', count: staffList.length },
              { id: 'Pending', label: 'Needs Verification', count: pendingVendorsCount },
              { id: 'Verified', label: 'Verified Stylists', count: staffList.filter((s) => s.isVerified || s.is_verified).length }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setVendorVerifyFilter(f.id)}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                  vendorVerifyFilter === f.id
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] px-1.5 rounded-full font-bold ${
                  vendorVerifyFilter === f.id ? 'bg-slate-950 text-amber-400' : 'bg-black/10 dark:bg-white/10'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search stylists by name, specialty, or hostel..."
                className="form-input pl-9 text-xs"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <select
              className="form-select text-xs w-auto"
              value={vendorCampusFilter}
              onChange={(e) => setVendorCampusFilter(e.target.value)}
            >
              <option value="All">All Campuses</option>
              {lusakaUniversities.map((u) => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Vendors Directory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => {
              const isVerified = vendor.isVerified || vendor.is_verified;
              const isVendorSuspended = allCustomers.find((c) => c.id === vendor.id)?.is_suspended || false;
              const vendorBookings = bookings.filter((b) => b.staffName?.includes(vendor.name) || b.staffId === vendor.id);

              return (
                <div key={vendor.id} className="card p-4 flex flex-col justify-between border border-black/10 dark:border-white/10 hover:border-amber-400/30 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={vendor.avatar || DEFAULT_AVATAR}
                          alt={vendor.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-black/10 dark:border-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 truncate">{vendor.name}</h4>
                            {isVerified && <BadgeCheck size={15} className="text-blue-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-amber-500 font-semibold m-0">{vendor.role}</p>
                        </div>
                      </div>

                      {/* Verification Badge */}
                      {isVerified ? (
                        <span className="badge badge-in-stock text-[9px] py-0.5 px-2 flex items-center gap-1 font-bold shrink-0">
                          <BadgeCheck size={11} className="text-blue-500" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="badge badge-out-of-stock text-[9px] py-0.5 px-2 flex items-center gap-1 font-bold shrink-0">
                          <AlertCircle size={11} className="text-amber-500" />
                          <span>Unverified</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3 bg-black/[0.02] dark:bg-white/[0.02] p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Building size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{vendor.campus}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{vendor.dormLocation || vendor.dorm_location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{vendor.phone || '0971234567'} • {vendor.payoutProvider || 'Airtel Money'}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${(vendor.idDocumentUrl || vendor.id_document_url) ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <ShieldCheck size={12} className="shrink-0" />
                        <span>{(vendor.idDocumentUrl || vendor.id_document_url) ? 'ID document submitted' : 'No ID document yet'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Card Actions */}
                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{vendorBookings.length} client appointments</span>
                      <a
                        href={`https://wa.me/260${(vendor.phone || '0971234567').replace(/^0/, '')}?text=Hi%20${encodeURIComponent(vendor.name)},%20this%20is%20UniHairShop%20Admin.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
                      >
                        <MessageSquare size={12} />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedStylistToVerify(vendor)}
                        className="apple-btn-primary flex-1 text-[11px] py-1.5 flex items-center justify-center gap-1 font-bold"
                      >
                        <ShieldCheck size={13} />
                        <span>Review & Verify</span>
                      </button>

                      <button
                        onClick={() => verifyStylist(vendor.id, !isVerified)}
                        className={`text-[11px] px-2.5 py-1.5 rounded-xl font-bold transition-colors border cursor-pointer shrink-0 ${
                          isVerified
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title={isVerified ? 'Revoke verification badge' : 'Grant verification badge'}
                      >
                        {isVerified ? 'Revoke' : 'Quick Approve'}
                      </button>
                    </div>

                    <button
                      onClick={() => (isVendorSuspended ? handleUnsuspend(vendor.id, true) : handleOpenSuspend(vendor.id, vendor.name, true))}
                      className={`w-full text-[11px] px-2.5 py-1.5 rounded-xl font-bold transition-colors border cursor-pointer flex items-center justify-center gap-1.5 ${
                        isVendorSuspended
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-500/10 border-slate-500/30 text-slate-500 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500'
                      }`}
                    >
                      {isVendorSuspended ? (<><ShieldAlert size={12} /><span>Reactivate Account</span></>) : (<><Ban size={12} /><span>Suspend Account</span></>)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LIVE BOOKING TRAFFIC STREAM TAB */}
      {adminTab === 'traffic' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">Live Platform Booking Queue</h3>
            </div>

            <div className="flex gap-2">
              <select
                className="form-select text-xs w-auto"
                value={trafficCampusFilter}
                onChange={(e) => setTrafficCampusFilter(e.target.value)}
              >
                <option value="All">All Campuses</option>
                {lusakaUniversities.map((u) => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>

              <select
                className="form-select text-xs w-auto"
                value={trafficStatusFilter}
                onChange={(e) => setTrafficStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTraffic.map((booking) => (
              <div key={booking.id} className="card p-4 flex flex-wrap justify-between items-center gap-3 border border-black/10 dark:border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">#{booking.id}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">{booking.serviceName}</h4>
                    <span className={`badge text-[10px] py-0.2 px-2 ${
                      booking.status === 'Completed'
                        ? 'badge-in-stock'
                        : booking.status === 'Confirmed'
                        ? 'badge-verified'
                        : 'badge-out-of-stock'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
                    Client: <strong className="text-slate-900 dark:text-white">{booking.customerName}</strong> ({booking.customerPhone}) • Stylist: <strong>{booking.staffName}</strong>
                  </p>
                  <p className="text-xs text-slate-400 m-0">
                    Campus: {booking.campus} • Hostel: {booking.hostel} • Date: <span className="text-amber-500 font-semibold">{booking.date} at {booking.time}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="price-tag text-base mr-2">K {booking.price || booking.totalPrice}</span>

                  {booking.status !== 'Completed' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'Completed')}
                      className="apple-btn-secondary text-xs px-3 py-1.5 text-emerald-500 hover:border-emerald-500/30"
                    >
                      Complete
                    </button>
                  )}

                  {booking.status !== 'Cancelled' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'Cancelled')}
                      className="apple-btn-secondary text-xs px-3 py-1.5 text-rose-500 hover:border-rose-500/30"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MOBILE MONEY PAYOUTS TAB */}
      {adminTab === 'payouts' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Stylist Mobile Money Settlement Ledger</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              All processed Airtel Money, MTN MoMo, and Zamtel stylist payout dispatches.
            </p>

            <div className="space-y-3">
              {[].map((payout) => (
                <div key={payout.id} className="p-4 rounded-2xl border border-black/10 dark:border-white/10 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">K {payout.amount} → {payout.stylist}</h4>
                      <span className="badge badge-in-stock text-[10px]">{payout.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
                      Dispatched to {payout.provider} ({payout.number}) • Ref: <span className="font-mono text-amber-500 font-bold">{payout.ref}</span>
                    </p>
                  </div>

                  <span className="text-xs text-slate-400">{payout.date}</span>
                </div>
              ))}
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No payouts dispatched yet.</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. SERVICES & PRODUCTS CATALOG TAB */}
      {adminTab === 'catalog' && (
        <div className="space-y-6">
          {/* Services List */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">Campus Services Menu ({services.length})</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Active hairstyles and grooming options available to students</p>
              </div>
              <button onClick={() => setShowAddServiceModal(true)} className="apple-btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1">
                <Plus size={13} />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((srv) => (
                <div key={srv.id} className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="badge badge-in-stock text-[9px] mb-1">{srv.category}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white m-0">{srv.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">Duration: {srv.duration} mins</p>
                  </div>
                  <span className="price-tag text-sm">K {srv.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products List */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">Campus Shop Products ({products.length})</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Retail inventory delivered directly to student dorm rooms</p>
              </div>
              <button onClick={() => setShowAddProductModal(true)} className="apple-btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1">
                <Plus size={13} />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((prd) => (
                <div key={prd.id} className="p-3.5 rounded-2xl border border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white m-0">{prd.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">Stock: <strong className="text-amber-500">{prd.stock} units</strong></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="price-tag text-sm">K {prd.price}</span>
                    <input
                      type="number"
                      className="form-input w-16 text-xs p-1 text-center"
                      value={prd.stock}
                      onChange={(e) => updateProductStock(prd.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. FUNNEL ANALYTICS — the only way to actually know if this thing has product-market fit */}
      {adminTab === 'analytics' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0 mb-1">Funnel Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Real counts of what's actually happening on the platform (last 2,000 events). No third-party analytics tool is wired up — this reads directly from the events UniHairShop logs itself.
            </p>
          </div>

          {loadingAnalytics ? (
            <div className="card p-8 text-center text-slate-400 text-xs">Loading analytics…</div>
          ) : !analyticsSummary || analyticsSummary.total === 0 ? (
            <div className="card p-8 text-center text-slate-400">
              <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-900 dark:text-white m-0">No events recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Signups, bookings, and orders will show up here as real usage happens.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'signup_completed', label: 'Signups' },
                { key: 'booking_created', label: 'Bookings Created' },
                { key: 'booking_completed', label: 'Bookings Completed' },
                { key: 'order_placed', label: 'Orders Placed' }
              ].map((row) => (
                <div key={row.key} className="card p-4">
                  <span className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold uppercase tracking-wider block">{row.label}</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white my-1 font-heading">{analyticsSummary.counts[row.key] || 0}</h2>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. CUSTOMER DIRECTORY TAB */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search customers by name or phone..."
              className="form-input pl-9 text-xs"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {loadingCustomers ? (
            <div className="card p-8 text-center text-slate-400 text-xs">Loading customers…</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="card p-8 text-center text-slate-400 text-xs">No customers found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((c) => (
                <div key={c.id} className="card p-4 flex flex-col justify-between border border-black/10 dark:border-white/10">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 truncate">{c.name}</h4>
                      {c.is_suspended ? (
                        <span className="badge badge-out-of-stock text-[9px] py-0.5 px-2 font-bold shrink-0">Suspended</span>
                      ) : (
                        <span className="badge badge-in-stock text-[9px] py-0.5 px-2 font-bold shrink-0 capitalize">{c.role}</span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3 bg-black/[0.02] dark:bg-white/[0.02] p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400 shrink-0" /><span>{c.phone || 'No phone on file'}</span></div>
                      <div className="flex items-center gap-1.5"><Building size={12} className="text-slate-400 shrink-0" /><span className="truncate">{c.campus}</span></div>
                      <div className="flex items-center gap-1.5"><Award size={12} className="text-slate-400 shrink-0" /><span>{c.loyalty_points || 0} loyalty points</span></div>
                    </div>
                    {c.is_suspended && c.suspended_reason && (
                      <p className="text-[11px] text-rose-500 bg-rose-500/10 border border-rose-500/25 rounded-xl p-2 mb-3">{c.suspended_reason}</p>
                    )}
                  </div>
                  {c.role !== 'admin' && (
                    <button
                      onClick={() => (c.is_suspended ? handleUnsuspend(c.id, false) : handleOpenSuspend(c.id, c.name, false))}
                      className={`w-full text-[11px] px-2.5 py-1.5 rounded-xl font-bold transition-colors border cursor-pointer flex items-center justify-center gap-1.5 ${
                        c.is_suspended
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-500/10 border-slate-500/30 text-slate-500 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500'
                      }`}
                    >
                      {c.is_suspended ? (<><ShieldAlert size={12} /><span>Reactivate Account</span></>) : (<><Ban size={12} /><span>Suspend Account</span></>)}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. SAFETY REPORTS TAB */}
      {adminTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {['open', 'reviewed', 'actioned', 'dismissed', 'All'].map((s) => (
              <button
                key={s}
                onClick={() => setReportStatusFilter(s)}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold capitalize transition-all border cursor-pointer ${
                  reportStatusFilter === s
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loadingReports ? (
            <div className="card p-8 text-center text-slate-400 text-xs">Loading reports…</div>
          ) : filteredReports.length === 0 ? (
            <div className="card p-8 text-center text-slate-400">
              <Flag size={28} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-900 dark:text-white m-0">No reports here</p>
              <p className="text-xs text-slate-400 mt-1">Chat and profile reports filed by students will show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((r) => (
                <div key={r.id} className="card p-4 border border-black/10 dark:border-white/10">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Flag size={14} className="text-rose-500 shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">{r.reason}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {resolveUserName(r.reporter_id)} reported {resolveUserName(r.reported_user_id)} · {r.context_type} · {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge text-[9px] py-0.5 px-2 font-bold shrink-0 capitalize ${
                      r.status === 'open' ? 'badge-out-of-stock' : r.status === 'actioned' ? 'badge-verified' : 'badge-in-stock'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  {r.details && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-black/[0.02] dark:bg-white/[0.02] p-2.5 rounded-xl border border-black/5 dark:border-white/5 mb-3">{r.details}</p>
                  )}
                  {r.status === 'open' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenSuspend(r.reported_user_id, resolveUserName(r.reported_user_id), Boolean(staffList.find((s) => s.id === r.reported_user_id)))}
                        className="text-[11px] px-2.5 py-1.5 rounded-xl font-bold border bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20 cursor-pointer flex items-center gap-1"
                      >
                        <Ban size={12} /><span>Suspend Reported User</span>
                      </button>
                      <button
                        onClick={() => handleReportStatus(r.id, 'reviewed')}
                        className="text-[11px] px-2.5 py-1.5 rounded-xl font-bold border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleReportStatus(r.id, 'dismissed')}
                        className="text-[11px] px-2.5 py-1.5 rounded-xl font-bold border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: SUSPEND ACCOUNT */}
      {suspendTarget && (
        <div className="modal-overlay" onClick={() => setSuspendTarget(null)}>
          <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSuspendTarget(null)}>
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <ShieldOff size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 text-center">Suspend {suspendTarget.name}?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-center leading-relaxed">
              They'll be signed out of all booking, ordering, and chat actions immediately, and will see this reason.
            </p>
            <div className="form-group">
              <label className="form-label">Reason (shown to the user):</label>
              <textarea
                className="form-input text-xs"
                rows={3}
                placeholder="e.g. Repeated harassment reports from multiple students"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
            <button onClick={handleConfirmSuspend} className="btn-danger w-full text-xs py-2.5 mt-2">
              Suspend Account
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD STYLIST */}
      {showAddVendorModal && (
        <div className="modal-overlay" onClick={() => setShowAddVendorModal(false)}>
          <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddVendorModal(false)}>
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Onboard Campus Stylist</h3>
            <form onSubmit={handleCreateVendor} className="space-y-3">
              <div className="form-group">
                <label className="form-label">Stylist Name / Brand:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior The Fade King"
                  className="form-input text-xs"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specialty Skill:</label>
                <select
                  className="form-select text-xs"
                  value={newVendorRole}
                  onChange={(e) => setNewVendorRole(e.target.value)}
                >
                  <option value="Master Barber & Stylist">Barbering & Fades</option>
                  <option value="Lead Natural Hair & Braids Specialist">Braids & Natural Hair</option>
                  <option value="Nail Artist & Lash Technician">Nail Tech & Lashes</option>
                  <option value="Locs Specialist">Locs & Retwist</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-group">
                  <label className="form-label">University Campus:</label>
                  <select
                    className="form-select text-xs"
                    value={newVendorCampus}
                    onChange={(e) => setNewVendorCampus(e.target.value)}
                  >
                    {lusakaUniversities.map((u) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hostel Dorm Room:</label>
                  <input
                    type="text"
                    required
                    placeholder="Block C, Room 14"
                    className="form-input text-xs"
                    value={newVendorDorm}
                    onChange={(e) => setNewVendorDorm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Mobile Money Provider:</label>
                  <select
                    className="form-select text-xs"
                    value={newVendorProvider}
                    onChange={(e) => setNewVendorProvider(e.target.value)}
                  >
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Zamtel Kwacha">Zamtel Kwacha</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payout Phone Number:</label>
                  <input
                    type="tel"
                    required
                    placeholder="0971234567"
                    className="form-input text-xs"
                    value={newVendorPhone}
                    onChange={(e) => setNewVendorPhone(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="apple-btn-primary w-full text-xs py-2.5 mt-2">
                <span>Save & Issue Verified Stylist Badge</span>
                <CheckCircle2 size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE */}
      {showAddServiceModal && (
        <div className="modal-overlay" onClick={() => setShowAddServiceModal(false)}>
          <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddServiceModal(false)}>
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Create New Service</h3>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div className="form-group">
                <label className="form-label">Service Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean Burst Fade & Razor Edge"
                  className="form-input text-xs"
                  value={newSrvName}
                  onChange={(e) => setNewSrvName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="form-group">
                  <label className="form-label">Category:</label>
                  <select className="form-select text-xs" value={newSrvCat} onChange={(e) => setNewSrvCat(e.target.value)}>
                    <option value="Barbering">Barbering</option>
                    <option value="Braids & Natural Hair">Braids</option>
                    <option value="Wigs & Weaves">Wigs</option>
                    <option value="Locs">Locs</option>
                    <option value="Nails & Lashes">Nails</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (ZMW):</label>
                  <input type="number" className="form-input text-xs" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (m):</label>
                  <input type="number" className="form-input text-xs" value={newSrvDuration} onChange={(e) => setNewSrvDuration(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description:</label>
                <textarea className="form-textarea text-xs" rows={2} value={newSrvDesc} onChange={(e) => setNewSrvDesc(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Service Photo:</label>
                <div className="flex items-center gap-4 bg-black/[0.02] dark:bg-white/[0.02] p-3.5 rounded-2xl border border-black/10 dark:border-white/10">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm shrink-0 bg-slate-800 flex items-center justify-center">
                    {newSrvImage ? (
                      <img src={newSrvImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UploadCloud size={20} className="text-slate-500" />
                    )}
                  </div>
                  <label className={`apple-btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer ${uploadingSrvPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                    <UploadCloud size={13} />
                    <span>{uploadingSrvPhoto ? 'Uploading…' : newSrvImage ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingSrvPhoto}
                      onChange={handleServiceImagePicker}
                    />
                  </label>
                </div>
              </div>

              <button type="submit" disabled={uploadingSrvPhoto} className="apple-btn-primary w-full text-xs py-2.5 mt-2">
                <span>Publish Service to Campus</span>
                <CheckCircle2 size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {showAddProductModal && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddProductModal(false)}>
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Add Retail Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div className="form-group">
                <label className="form-label">Product Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rosemary Hair Growth Scalp Oil"
                  className="form-input text-xs"
                  value={newPrdName}
                  onChange={(e) => setNewPrdName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category:</label>
                <select className="form-select text-xs" value={newPrdCat} onChange={(e) => setNewPrdCat(e.target.value)}>
                  <option value="Hair Care Products">Hair Care Products</option>
                  <option value="Nails & Lashes">Nails & Lashes</option>
                  <option value="Wigs & Weaves">Wigs & Weaves</option>
                  <option value="Barber Supplies">Barber Supplies</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Retail Price (ZMW):</label>
                  <input type="number" className="form-input text-xs" value={newPrdPrice} onChange={(e) => setNewPrdPrice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stock:</label>
                  <input type="number" className="form-input text-xs" value={newPrdStock} onChange={(e) => setNewPrdStock(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description:</label>
                <textarea className="form-textarea text-xs" rows={2} value={newPrdDesc} onChange={(e) => setNewPrdDesc(e.target.value)} />
              </div>

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
                  <label className={`apple-btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer ${uploadingPrdPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                    <UploadCloud size={13} />
                    <span>{uploadingPrdPhoto ? 'Uploading…' : newPrdImage ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingPrdPhoto}
                      onChange={handleProductImagePicker}
                    />
                  </label>
                </div>
              </div>

              <button type="submit" disabled={uploadingPrdPhoto} className="apple-btn-primary w-full text-xs py-2.5 mt-2">
                <span>Add Product to Shop</span>
                <CheckCircle2 size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STYLIST VERIFICATION & COMPLIANCE REVIEW */}
      {selectedStylistToVerify && (
        <div className="modal-overlay" onClick={() => setSelectedStylistToVerify(null)}>
          <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedStylistToVerify(null)}>
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src={selectedStylistToVerify.avatar || DEFAULT_AVATAR}
                alt={selectedStylistToVerify.name}
                className="w-14 h-14 rounded-2xl object-cover border border-black/10 dark:border-white/10"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white m-0 truncate">
                    {selectedStylistToVerify.name}
                  </h3>
                  {(selectedStylistToVerify.isVerified || selectedStylistToVerify.is_verified) && (
                    <BadgeCheck size={16} className="text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-amber-500 font-semibold m-0">{selectedStylistToVerify.role}</p>
                <p className="text-[11px] text-slate-400 m-0 truncate">{selectedStylistToVerify.campus}</p>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="card p-3.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Hostel Residence:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedStylistToVerify.dormLocation || selectedStylistToVerify.dorm_location || 'Hostel Studio'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp Phone:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedStylistToVerify.phone || '0971234567'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mobile Money Payout:</span>
                <span className="font-semibold text-emerald-500">{selectedStylistToVerify.payoutProvider || 'Airtel Money'} ({selectedStylistToVerify.phone || '0971234567'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dorm Travel Capability:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedStylistToVerify.travelsToDorm ? 'Travels to Hostels (+K20)' : 'Hostel Studio Only'}</span>
              </div>
            </div>

            {/* Real ID Document Review — this is the actual thing to check before verifying */}
            <div className="mb-5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Submitted Verification Document:</span>
              {(selectedStylistToVerify.idDocumentUrl || selectedStylistToVerify.id_document_url) ? (
                <a
                  href={selectedStylistToVerify.idDocumentUrl || selectedStylistToVerify.id_document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 hover:border-amber-400/50 transition-colors"
                >
                  <img
                    src={selectedStylistToVerify.idDocumentUrl || selectedStylistToVerify.id_document_url}
                    alt="Submitted ID document"
                    className="w-full max-h-56 object-contain bg-black/5 dark:bg-white/5"
                  />
                </a>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>No ID document submitted yet — do not verify without one.</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {!(selectedStylistToVerify.isVerified || selectedStylistToVerify.is_verified) ? (
                <button
                  onClick={() => {
                    verifyStylist(selectedStylistToVerify.id, true);
                    setSelectedStylistToVerify(null);
                  }}
                  className="apple-btn-primary w-full text-xs py-3 font-bold flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>Approve & Grant Verified Campus Badge 🛡️</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    verifyStylist(selectedStylistToVerify.id, false);
                    setSelectedStylistToVerify(null);
                  }}
                  className="apple-btn-secondary w-full text-xs py-2.5 font-bold flex items-center justify-center gap-2 text-rose-500 hover:border-rose-500/40"
                >
                  <Ban size={15} />
                  <span>Revoke Verification / Set Unverified</span>
                </button>
              )}

              <a
                href={`https://wa.me/260${(selectedStylistToVerify.phone || '0971234567').replace(/^0/, '')}?text=Hi%20${encodeURIComponent(selectedStylistToVerify.name)},%20this%20is%20UniHairShop%20Admin%20following%20up%20on%20your%20campus%20stylist%20verification.`}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                <MessageSquare size={14} />
                <span>Contact Stylist on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
