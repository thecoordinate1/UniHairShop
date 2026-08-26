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
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

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
    lusakaUniversities,
    user,
    addToast
  } = useApp();

  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'vendors' | 'traffic' | 'payouts' | 'catalog'
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCampusFilter, setVendorCampusFilter] = useState('All');
  const [trafficCampusFilter, setTrafficCampusFilter] = useState('All');
  const [trafficStatusFilter, setTrafficStatusFilter] = useState('All');

  // Modals
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  // New service form state
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCat, setNewSrvCat] = useState('Barbering');
  const [newSrvPrice, setNewSrvPrice] = useState('90');
  const [newSrvDuration, setNewSrvDuration] = useState('40');
  const [newSrvDesc, setNewSrvDesc] = useState('');

  // New product form state
  const [newPrdName, setNewPrdName] = useState('');
  const [newPrdCat, setNewPrdCat] = useState('Hair Care Products');
  const [newPrdPrice, setNewPrdPrice] = useState('120');
  const [newPrdStock, setNewPrdStock] = useState('20');
  const [newPrdDesc, setNewPrdDesc] = useState('');

  // New Vendor Form State
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorRole, setNewVendorRole] = useState('Master Barber & Stylist');
  const [newVendorCampus, setNewVendorCampus] = useState(lusakaUniversities[0]?.name || 'UNILUS Silverest Campus');
  const [newVendorDorm, setNewVendorDorm] = useState('Silverest Hostel, Block C');
  const [newVendorPhone, setNewVendorPhone] = useState('0971234567');
  const [newVendorProvider, setNewVendorProvider] = useState('Airtel Money');

  // Lock body scroll on modal opens & handle Escape
  useEffect(() => {
    const isAnyModalOpen = showAddServiceModal || showAddProductModal || showAddVendorModal;
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddServiceModal, showAddProductModal, showAddVendorModal]);

  // Executive Calculations
  const grossBookingGMV = bookings.reduce((sum, b) => (b.status !== 'Cancelled' ? sum + (Number(b.price) || Number(b.totalPrice) || 0) : sum), 0);
  const grossRetailGMV = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const totalPlatformGMV = grossBookingGMV + grossRetailGMV;

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
    const matchesSearch = vendor.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          vendor.role.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                          vendor.dormLocation?.toLowerCase().includes(vendorSearch.toLowerCase());
    const matchesCampus = vendorCampusFilter === 'All' || vendor.campus === vendorCampusFilter;
    return matchesSearch && matchesCampus;
  });

  // Filtered Traffic Bookings
  const filteredTraffic = bookings.filter((b) => {
    const matchesCampus = trafficCampusFilter === 'All' || b.campus === trafficCampusFilter;
    const matchesStatus = trafficStatusFilter === 'All' || b.status === trafficStatusFilter;
    return matchesCampus && matchesStatus;
  });

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
      canTravel: true,
      inStudio: true,
      popular: false
    });
    setShowAddServiceModal(false);
    setNewSrvName('');
    setNewSrvDesc('');
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
      description: newPrdDesc.trim() || 'Campus hair care product.'
    });
    setShowAddProductModal(false);
    setNewPrdName('');
    setNewPrdDesc('');
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
          { id: 'payouts', label: '📱 Mobile Money Payouts', count: 2 },
          { id: 'catalog', label: '🛍️ Services & Inventory', count: services.length + products.length }
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
              const vendorBookings = bookings.filter((b) => b.staffName?.includes(vendor.name) || b.staffId === vendor.id);

              return (
                <div key={vendor.id} className="card p-4 flex flex-col justify-between border border-black/10 dark:border-white/10">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={vendor.avatar || '/images/barber_service.jpg'}
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

                      <button
                        onClick={() => verifyStylist(vendor.id, !isVerified)}
                        className={`text-[10px] px-2 py-1 rounded-xl font-bold transition-colors border cursor-pointer ${
                          isVerified
                            ? 'bg-blue-500/15 border-blue-500/30 text-blue-500 hover:bg-rose-500/15 hover:text-rose-500 hover:border-rose-500/30'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500 hover:bg-emerald-500/15 hover:text-emerald-500'
                        }`}
                        title={isVerified ? 'Click to revoke verification' : 'Click to approve verification badge'}
                      >
                        {isVerified ? 'Verified' : 'Verify'}
                      </button>
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
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10 text-xs">
                    <span className="text-slate-400">{vendorBookings.length} total client bookings</span>
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
              {[
                { id: 'PAY-891', date: '2026-08-20', stylist: 'Junior "The Fade King"', amount: 450, provider: 'Airtel Money', number: '0971234567', status: 'Completed', ref: 'AM-TX-9841' },
                { id: 'PAY-742', date: '2026-08-14', stylist: 'Junior "The Fade King"', amount: 600, provider: 'MTN Mobile Money', number: '0961234567', status: 'Completed', ref: 'MTN-TX-1029' }
              ].map((payout) => (
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

              <button type="submit" className="apple-btn-primary w-full text-xs py-2.5 mt-2">
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

              <button type="submit" className="apple-btn-primary w-full text-xs py-2.5 mt-2">
                <span>Add Product to Shop</span>
                <CheckCircle2 size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
