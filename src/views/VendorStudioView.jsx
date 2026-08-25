import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VendorStudioView() {
  const {
    vendorProfile,
    updateVendorProfile,
    toggleVendorDormTravel,
    vendorWallet,
    requestVendorPayout,
    acceptBooking,
    completeBooking,
    addVendorPortfolioItem,
    addService,
    services,
    bookings,
    staffList,
    toggleUserMode,
    setActiveTab,
    setActiveChatStylistId,
    addToast
  } = useApp();

  const [activeTab, setActiveTabLocal] = useState('overview'); // 'overview' | 'schedule' | 'services' | 'portfolio' | 'wallet'

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
  const [portImg, setPortImg] = useState('/images/barber_service.jpg');

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutProvider, setPayoutProvider] = useState(vendorProfile.payoutProvider || 'Airtel Money');
  const [payoutNumber, setPayoutNumber] = useState(vendorProfile.payoutNumber || '0971234567');

  const myStylistObj = staffList.find((s) => s.id === vendorProfile.id) || staffList[0] || {};
  const myServices = services.filter((s) => (s.staffIds || s.staff_ids || []).includes(vendorProfile.id) || s.category === 'Barbering');
  const myBookings = bookings.filter((b) => {
    const sName = b.staffName || b.staff_name || '';
    const sId = b.staffId || b.staff_id || '';
    return sId === vendorProfile.id || sName.includes(vendorProfile.name) || sName === 'Junior "The Fade King"';
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

  const handleSavePortfolio = () => {
    if (!portTag.trim()) {
      addToast('Please enter a hairstyle or cut tag', 'error');
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
            className="w-16 h-16 rounded-3xl object-cover border-2 border-amber-400 shadow-apple-gold shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">{vendorProfile.name}</h1>
              <span className="badge badge-verified text-[10px] py-0.2 px-2">Verified Campus Stylist</span>
            </div>
            <p className="text-xs text-amber-500 font-semibold mt-0.5 mb-0.5">{vendorProfile.role} • {vendorProfile.campus}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">Studio Room: {vendorProfile.dormLocation}</p>
          </div>
        </div>

        {/* Action Toggle & Customer Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
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
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                <Star size={13} fill="#F5A623" />
                <span>4.9 Star Average Rating</span>
              </div>
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Location: {b.campus} ({b.hostel})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/260772822579?text=Hi%20${encodeURIComponent(b.customerName)},%20I'm%20your%20campus%20stylist%20for%20your%20appointment%20ref:${b.id}`}
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

      {/* 2. SCHEDULE & BOOKINGS MANAGER */}
      {activeTab === 'schedule' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight m-0">Client Appointment Schedule</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Review appointments, dorm addresses, and add-ons</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {myBookings.map((b) => (
              <div key={b.id} className="card p-4 sm:p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-in-stock text-[10px]">{b.serviceType || 'Dorm Appointment'}</span>
                      <span className="text-[11px] text-slate-400 font-mono">Ref: {b.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight m-0">{b.serviceName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
                      Client: <strong className="text-slate-900 dark:text-white">{b.customerName}</strong> • Phone: <strong className="text-slate-900 dark:text-white">{b.customerPhone}</strong>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Location: {b.campus} — {b.hostel}</p>
                  </div>

                  <div className="text-right">
                    <span className="price-tag text-base">K {b.totalPrice || b.price}</span>
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
                      href={`https://wa.me/260772822579?text=Hi%20${encodeURIComponent(b.customerName)},%20I'm%20ready%20for%20your%20${encodeURIComponent(b.serviceName)}%20appointment%20ref:${b.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apple-btn-secondary text-xs px-3 py-1.5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp</span>
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
            ))}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {myStylistObj.portfolio?.map((item) => (
              <div key={item.id} className="relative rounded-3xl overflow-hidden aspect-square border border-black/10 dark:border-white/10 bg-slate-900 group">
                <img src={item.image} alt={item.tag} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-xs font-bold leading-tight">{item.tag}</span>
                  <span className="text-[10px] text-slate-300">{item.client}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. WALLET & PAYOUTS */}
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
                </div>

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
      {showAddServiceModal && (
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
        </div>
      )}

      {/* UPLOAD PORTFOLIO MODAL */}
      {showPortfolioModal && (
        <div className="modal-overlay" onClick={() => setShowPortfolioModal(false)}>
          <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Add Hairstyle Transformation</h3>

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
              <button className="apple-btn-primary text-xs flex-1" onClick={handleSavePortfolio}>
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
