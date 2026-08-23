import React, { useState, useEffect } from 'react';
import { ShieldCheck, DollarSign, Calendar, Package, Plus, Check, AlertCircle, RefreshCw, X, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminDashboardView() {
  const {
    services,
    products,
    bookings,
    orders,
    addService,
    addProduct,
    updateProductStock,
    updateOrderStatus,
    updateBookingStatus,
    addToast
  } = useApp();

  const [adminTab, setAdminTab] = useState('overview');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New service form state
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCat, setNewSrvCat] = useState('Barbing');
  const [newSrvPrice, setNewSrvPrice] = useState('100');
  const [newSrvDuration, setNewSrvDuration] = useState('40');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [srvErrors, setSrvErrors] = useState({});

  // New product form state
  const [newPrdName, setNewPrdName] = useState('');
  const [newPrdCat, setNewPrdCat] = useState('Hair Products');
  const [newPrdPrice, setNewPrdPrice] = useState('120');
  const [newPrdStock, setNewPrdStock] = useState('20');
  const [newPrdDesc, setNewPrdDesc] = useState('');
  const [prdErrors, setPrdErrors] = useState({});

  // Lock body scroll on modal opens & handle Escape
  useEffect(() => {
    const isAnyModalOpen = showAddServiceModal || showAddProductModal;
    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddServiceModal(false);
        setShowAddProductModal(false);
        setSrvErrors({});
        setPrdErrors({});
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddServiceModal, showAddProductModal]);

  const bookingRevenue = bookings.reduce((sum, b) => (b.status !== 'Cancelled' ? sum + (Number(b.price) || 0) : sum), 0);
  const orderRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const totalRevenue = bookingRevenue + orderRevenue;

  const handleCreateService = () => {
    const errors = {};
    if (!newSrvName.trim()) errors.name = 'Service title is required.';
    if (!newSrvPrice || Number(newSrvPrice) <= 0) errors.price = 'Enter a valid price in Kwacha.';
    if (!newSrvDuration || Number(newSrvDuration) <= 0) errors.duration = 'Enter a valid duration in minutes.';

    if (Object.keys(errors).length > 0) {
      setSrvErrors(errors);
      return;
    }

    addService({
      name: newSrvName.trim(),
      category: newSrvCat,
      price: Number(newSrvPrice),
      duration: Number(newSrvDuration),
      description: newSrvDesc.trim() || 'Campus beauty and styling service.',
      popular: false
    });

    setShowAddServiceModal(false);
    setNewSrvName('');
    setNewSrvDesc('');
    setSrvErrors({});
  };

  const handleCreateProduct = () => {
    const errors = {};
    if (!newPrdName.trim()) errors.name = 'Product name is required.';
    if (!newPrdPrice || Number(newPrdPrice) <= 0) errors.price = 'Enter a valid retail price.';
    if (newPrdStock === '' || Number(newPrdStock) < 0) errors.stock = 'Enter initial stock quantity.';

    if (Object.keys(errors).length > 0) {
      setPrdErrors(errors);
      return;
    }

    addProduct({
      name: newPrdName.trim(),
      category: newPrdCat,
      price: Number(newPrdPrice),
      stock: Number(newPrdStock),
      description: newPrdDesc.trim() || 'High-quality campus retail product.'
    });

    setShowAddProductModal(false);
    setNewPrdName('');
    setNewPrdDesc('');
    setPrdErrors({});
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Admin Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-1.5">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>Store & Salon Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">UniHairShop Business Hub</h1>
        </div>

        <div className="flex gap-2.5">
          <button className="apple-btn-primary text-xs px-3.5 py-2" onClick={() => setShowAddServiceModal(true)}>
            <Plus size={15} />
            <span>Add Service</span>
          </button>
          <button className="apple-btn-secondary text-xs px-3.5 py-2" onClick={() => setShowAddProductModal(true)}>
            <Plus size={15} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid-3">
        <div className="card p-5 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30">
          <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider block">Total Store Revenue</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-400 my-1 font-heading">K {totalRevenue.toLocaleString()}</h2>
          <p className="text-xs text-slate-400">Bookings: K {bookingRevenue} • Shop: K {orderRevenue}</p>
        </div>

        <div className="card p-5">
          <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider block">Service Appointments</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white my-1 font-heading">{bookings.length}</h2>
          <p className="text-xs text-emerald-400 font-medium">
            {bookings.filter((b) => b.status === 'Confirmed').length} Confirmed Active
          </p>
        </div>

        <div className="card p-5">
          <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider block">Retail Shop Orders</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white my-1 font-heading">{orders.length}</h2>
          <p className="text-xs text-slate-400">Inventory Items: {products.length} Products</p>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 bg-white/[0.04] p-1.5 rounded-full border border-white/10 backdrop-blur-md" role="tablist" aria-label="Admin tabs">
        {[
          { id: 'overview', label: 'Sales Overview' },
          { id: 'services', label: `Manage Services (${services.length})` },
          { id: 'inventory', label: `Inventory Stock (${products.length})` },
          { id: 'bookings', label: `Bookings (${bookings.length})` },
          { id: 'orders', label: `Orders (${orders.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            role="tab"
            aria-selected={adminTab === tab.id}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
              adminTab === tab.id
                ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
                : 'text-slate-400 hover:text-white bg-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. SALES OVERVIEW TAB */}
      {adminTab === 'overview' && (
        <div className="flex flex-col gap-4">
          <div className="card p-5 sm:p-6">
            <h3 className="text-base font-bold text-white mb-4 tracking-tight">Campus Revenue Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Top Booked Category</span>
                <p className="text-lg font-bold text-white my-1">Barbing & Knotless Braids</p>
                <p className="text-xs text-emerald-400">Highest student volume on weekends</p>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Best-Selling Product</span>
                <p className="text-lg font-bold text-white my-1">Miracle Scalp Growth Oil</p>
                <p className="text-xs text-emerald-400">High repeat order rate across hostels</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SERVICES MANAGER TAB */}
      {adminTab === 'services' && (
        <div className="grid-2">
          {services.map((srv) => (
            <div key={srv.id} className="card p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="badge badge-in-stock">{srv.category}</span>
                  <span className="price-tag text-base">K {srv.price}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1 tracking-tight">{srv.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{srv.description}</p>
              </div>
              <div className="text-xs text-slate-400 pt-2 border-t border-white/10 flex justify-between items-center">
                <span>Duration: {srv.duration} mins</span>
                <span className="text-emerald-400 font-medium">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. INVENTORY STOCK MANAGER TAB */}
      {adminTab === 'inventory' && (
        <div className="flex flex-col gap-3">
          {products.map((prd) => (
            <div key={prd.id} className="card p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-[200px]">
                <img src={prd.image} alt={prd.name} className="w-12 h-12 rounded-xl object-cover shrink-0" loading="lazy" />
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{prd.name}</h4>
                  <span className="price-tag text-sm">K {prd.price}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-28 m-0">
                  <label className="form-label text-[10px] mb-1" htmlFor={`stock-${prd.id}`}>Stock Units:</label>
                  <input
                    id={`stock-${prd.id}`}
                    type="number"
                    min="0"
                    className="form-input py-1 text-xs"
                    value={prd.stock}
                    onChange={(e) => updateProductStock(prd.id, Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <span className={`badge ${prd.stock > 10 ? 'badge-in-stock' : prd.stock > 0 ? 'badge-low-stock' : 'badge-out-of-stock'}`}>
                  {prd.stock > 0 ? `${prd.stock} In Stock` : 'Out of Stock'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. BOOKINGS MANAGER TAB */}
      {adminTab === 'bookings' && (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="card p-4 sm:p-5 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="badge badge-in-stock mb-1.5">{b.id}</span>
                <h4 className="text-base font-bold text-white tracking-tight">{b.serviceName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: {b.customerName} ({b.customerPhone}) • Date: <span className="text-amber-400">{b.date} at {b.time}</span>
                </p>
                <p className="text-xs text-slate-400">Location: {b.campus}</p>
              </div>

              <div>
                <label className="sr-only" htmlFor={`booking-status-${b.id}`}>Update status for booking {b.id}</label>
                <select
                  id={`booking-status-${b.id}`}
                  className="form-select w-auto text-xs py-2"
                  value={b.status}
                  onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. ORDERS MANAGER TAB */}
      {adminTab === 'orders' && (
        <div className="flex flex-col gap-3">
          {orders.map((ord) => (
            <div key={ord.id} className="card p-4 sm:p-5 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="badge badge-in-stock mb-1.5">{ord.id}</span>
                <h4 className="text-base font-bold text-white tracking-tight">Total: K {ord.totalAmount}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer: {ord.customerName} ({ord.customerPhone}) • Delivery: {ord.deliveryType} ({ord.hostelDetails})
                </p>
              </div>

              <div>
                <label className="sr-only" htmlFor={`order-status-${ord.id}`}>Update status for order {ord.id}</label>
                <select
                  id={`order-status-${ord.id}`}
                  className="form-select w-auto text-xs py-2"
                  value={ord.status}
                  onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {showAddServiceModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddServiceModal(false); setSrvErrors({}); } }}
          role="dialog"
          aria-modal="true"
          aria-label="Add new bookable service"
        >
          <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => { setShowAddServiceModal(false); setSrvErrors({}); }}
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-3">Add New Service</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="srv-name">Service Title:</label>
              <input
                id="srv-name"
                type="text"
                className={`form-input ${srvErrors.name ? 'error' : ''}`}
                placeholder="e.g. Loc Maintenance"
                value={newSrvName}
                onChange={(e) => {
                  setNewSrvName(e.target.value);
                  if (srvErrors.name) setSrvErrors((p) => ({ ...p, name: undefined }));
                }}
              />
              {srvErrors.name && <p className="form-error-text">{srvErrors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="srv-cat">Category:</label>
              <select id="srv-cat" className="form-select" value={newSrvCat} onChange={(e) => setNewSrvCat(e.target.value)}>
                <option value="Barbing">Barbing</option>
                <option value="Hair Dressing">Hair Dressing</option>
                <option value="Nail Tech">Nail Tech</option>
                <option value="Makeup">Makeup</option>
                <option value="Grooming">Grooming</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 form-group">
              <div>
                <label className="form-label" htmlFor="srv-price">Price (K):</label>
                <input
                  id="srv-price"
                  type="number"
                  min="1"
                  className={`form-input ${srvErrors.price ? 'error' : ''}`}
                  value={newSrvPrice}
                  onChange={(e) => {
                    setNewSrvPrice(e.target.value);
                    if (srvErrors.price) setSrvErrors((p) => ({ ...p, price: undefined }));
                  }}
                />
                {srvErrors.price && <p className="form-error-text">{srvErrors.price}</p>}
              </div>
              <div>
                <label className="form-label" htmlFor="srv-duration">Duration (Mins):</label>
                <input
                  id="srv-duration"
                  type="number"
                  min="5"
                  className={`form-input ${srvErrors.duration ? 'error' : ''}`}
                  value={newSrvDuration}
                  onChange={(e) => {
                    setNewSrvDuration(e.target.value);
                    if (srvErrors.duration) setSrvErrors((p) => ({ ...p, duration: undefined }));
                  }}
                />
                {srvErrors.duration && <p className="form-error-text">{srvErrors.duration}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="srv-desc">Description:</label>
              <textarea
                id="srv-desc"
                className="form-textarea"
                rows={2}
                placeholder="Details about what is included..."
                value={newSrvDesc}
                onChange={(e) => setNewSrvDesc(e.target.value)}
              />
            </div>

            <button className="apple-btn-primary w-full mt-2 text-xs" onClick={handleCreateService}>
              Save Service
            </button>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddProductModal(false); setPrdErrors({}); } }}
          role="dialog"
          aria-modal="true"
          aria-label="Add new retail product"
        >
          <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => { setShowAddProductModal(false); setPrdErrors({}); }}
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-3">Add Retail Product</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="prd-name">Product Name:</label>
              <input
                id="prd-name"
                type="text"
                className={`form-input ${prdErrors.name ? 'error' : ''}`}
                placeholder="e.g. Scalp Growth Conditioner"
                value={newPrdName}
                onChange={(e) => {
                  setNewPrdName(e.target.value);
                  if (prdErrors.name) setPrdErrors((p) => ({ ...p, name: undefined }));
                }}
              />
              {prdErrors.name && <p className="form-error-text">{prdErrors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prd-cat">Category:</label>
              <select id="prd-cat" className="form-select" value={newPrdCat} onChange={(e) => setNewPrdCat(e.target.value)}>
                <option value="Hair Products">Hair Products</option>
                <option value="Grooming Products">Grooming Products</option>
                <option value="Cosmetics">Cosmetics</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 form-group">
              <div>
                <label className="form-label" htmlFor="prd-price">Price (K):</label>
                <input
                  id="prd-price"
                  type="number"
                  min="1"
                  className={`form-input ${prdErrors.price ? 'error' : ''}`}
                  value={newPrdPrice}
                  onChange={(e) => {
                    setNewPrdPrice(e.target.value);
                    if (prdErrors.price) setPrdErrors((p) => ({ ...p, price: undefined }));
                  }}
                />
                {prdErrors.price && <p className="form-error-text">{prdErrors.price}</p>}
              </div>
              <div>
                <label className="form-label" htmlFor="prd-stock">Initial Stock:</label>
                <input
                  id="prd-stock"
                  type="number"
                  min="0"
                  className={`form-input ${prdErrors.stock ? 'error' : ''}`}
                  value={newPrdStock}
                  onChange={(e) => {
                    setNewPrdStock(e.target.value);
                    if (prdErrors.stock) setPrdErrors((p) => ({ ...p, stock: undefined }));
                  }}
                />
                {prdErrors.stock && <p className="form-error-text">{prdErrors.stock}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prd-desc">Description:</label>
              <textarea
                id="prd-desc"
                className="form-textarea"
                rows={2}
                placeholder="Product description and usage instructions..."
                value={newPrdDesc}
                onChange={(e) => setNewPrdDesc(e.target.value)}
              />
            </div>

            <button className="apple-btn-primary w-full mt-2 text-xs" onClick={handleCreateProduct}>
              Save Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
