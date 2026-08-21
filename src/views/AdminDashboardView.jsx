import React, { useState, useEffect } from 'react';
import { ShieldCheck, DollarSign, Calendar, Package, Plus, Edit, Check, AlertCircle, RefreshCw, X, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminDashboardView() {
  const {
    services,
    products,
    bookings,
    orders,
    addService,
    updateService,
    addProduct,
    updateProductStock,
    updateOrderStatus,
    updateBookingStatus
  } = useApp();

  const [adminTab, setAdminTab] = useState('overview');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New service form state
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCat, setNewSrvCat] = useState('Barbing');
  const [newSrvPrice, setNewSrvPrice] = useState(100);
  const [newSrvDuration, setNewSrvDuration] = useState(40);
  const [newSrvDesc, setNewSrvDesc] = useState('');

  // New product form state
  const [newPrdName, setNewPrdName] = useState('');
  const [newPrdCat, setNewPrdCat] = useState('Hair Products');
  const [newPrdPrice, setNewPrdPrice] = useState(120);
  const [newPrdStock, setNewPrdStock] = useState(20);
  const [newPrdDesc, setNewPrdDesc] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddServiceModal(false);
        setShowAddProductModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const bookingRevenue = bookings.reduce((sum, b) => (b.status !== 'Cancelled' ? sum + b.price : sum), 0);
  const orderRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRevenue = bookingRevenue + orderRevenue;

  const handleCreateService = () => {
    if (!newSrvName.trim()) return;
    addService({
      name: newSrvName,
      category: newSrvCat,
      price: Number(newSrvPrice),
      duration: Number(newSrvDuration),
      description: newSrvDesc || 'Campus beauty service.',
      popular: false
    });
    setShowAddServiceModal(false);
    setNewSrvName('');
  };

  const handleCreateProduct = () => {
    if (!newPrdName.trim()) return;
    addProduct({
      name: newPrdName,
      category: newPrdCat,
      price: Number(newPrdPrice),
      stock: Number(newPrdStock),
      description: newPrdDesc || 'High-quality retail item.'
    });
    setShowAddProductModal(false);
    setNewPrdName('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Admin Title */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck size={20} />
            <span>Business Owner Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-white">UniHairShop Manager</h1>
        </div>

        <div className="flex gap-2">
          <button className="btn-primary text-xs px-3.5 py-2" onClick={() => setShowAddServiceModal(true)}>
            <Plus size={16} />
            <span>Add Service</span>
          </button>
          <button className="btn-secondary text-xs px-3.5 py-2" onClick={() => setShowAddProductModal(true)}>
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid-3">
        <div className="card p-5 bg-gradient-to-br from-amber-400/15 to-slate-800 border border-amber-400/30">
          <span className="text-xs text-slate-400 block">Total Sales & Revenue</span>
          <h2 className="text-2xl font-extrabold text-amber-400 my-1">K {totalRevenue}</h2>
          <p className="text-xs text-slate-400">Bookings: K {bookingRevenue} | Shop: K {orderRevenue}</p>
        </div>

        <div className="card p-5">
          <span className="text-xs text-slate-400 block">Active Service Appointments</span>
          <h2 className="text-2xl font-extrabold text-white my-1">{bookings.length}</h2>
          <p className="text-xs text-emerald-400">{bookings.filter((b) => b.status === 'Confirmed').length} Confirmed upcoming</p>
        </div>

        <div className="card p-5">
          <span className="text-xs text-slate-400 block">Retail Shop Orders</span>
          <h2 className="text-2xl font-extrabold text-white my-1">{orders.length}</h2>
          <p className="text-xs text-slate-400">Inventory items: {products.length} products</p>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-2">
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
            className={`text-xs px-3.5 py-2 rounded-full whitespace-nowrap transition-colors border-0 ${
              adminTab === tab.id
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. SALES OVERVIEW TAB */}
      {adminTab === 'overview' && (
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h3 className="text-base font-bold text-white mb-3">Daily/Weekly Performance Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10">
                <span className="text-xs text-slate-400">Top Category (Bookings):</span>
                <p className="text-base font-bold text-white my-1">Barbing & Knotless Braids</p>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10">
                <span className="text-xs text-slate-400">Top Selling Product:</span>
                <p className="text-base font-bold text-white my-1">Miracle Scalp Growth Oil</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SERVICES MANAGER TAB */}
      {adminTab === 'services' && (
        <div className="grid-2">
          {services.map((srv) => (
            <div key={srv.id} className="card p-4">
              <div className="flex justify-between mb-2">
                <span className="badge badge-in-stock">{srv.category}</span>
                <span className="price-tag text-base">K {srv.price}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{srv.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{srv.description}</p>
              <div className="text-xs text-slate-400">Duration: {srv.duration} mins</div>
            </div>
          ))}
        </div>
      )}

      {/* 3. INVENTORY STOCK MANAGER TAB */}
      {adminTab === 'inventory' && (
        <div className="flex flex-col gap-3">
          {products.map((prd) => (
            <div key={prd.id} className="card p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={prd.image} alt={prd.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-white">{prd.name}</h4>
                  <span className="price-tag text-sm">K {prd.price}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-28 m-0">
                  <label className="form-label text-[10px]">Stock Count:</label>
                  <input
                    type="number"
                    className="form-input py-1 text-xs"
                    value={prd.stock}
                    onChange={(e) => updateProductStock(prd.id, e.target.value)}
                  />
                </div>
                <span className={`badge ${prd.stock > 10 ? 'badge-in-stock' : prd.stock > 0 ? 'badge-low-stock' : 'badge-out-of-stock'}`}>
                  {prd.stock > 0 ? 'In Stock' : 'Out of Stock'}
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
            <div key={b.id} className="card p-4 flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="badge badge-in-stock mb-1">{b.id}</span>
                <h4 className="text-base font-bold text-white">{b.serviceName}</h4>
                <p className="text-xs text-slate-400">
                  Client: {b.customerName} ({b.customerPhone}) | Date: {b.date} at {b.time}
                </p>
              </div>

              <div>
                <select
                  className="form-select w-auto text-xs py-1.5"
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
            <div key={ord.id} className="card p-4 flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="badge badge-in-stock mb-1">{ord.id}</span>
                <h4 className="text-base font-bold text-white">Total: K {ord.totalAmount}</h4>
                <p className="text-xs text-slate-400">
                  Customer: {ord.customerName} | Delivery: {ord.deliveryType} ({ord.hostelDetails})
                </p>
              </div>

              <div>
                <select
                  className="form-select w-auto text-xs py-1.5"
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
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddServiceModal(false); }}>
          <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddServiceModal(false)} title="Close (Esc)"><X size={18} /></button>
            <h3 className="text-lg font-bold text-white mb-3">Add New Bookable Service</h3>

            <div className="form-group">
              <label className="form-label">Service Title:</label>
              <input type="text" className="form-input" placeholder="e.g. Loc Maintenance" value={newSrvName} onChange={(e) => setNewSrvName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Category:</label>
              <select className="form-select" value={newSrvCat} onChange={(e) => setNewSrvCat(e.target.value)}>
                <option value="Barbing">Barbing</option>
                <option value="Hair Dressing">Hair Dressing</option>
                <option value="Nail Tech">Nail Tech</option>
                <option value="Makeup">Makeup</option>
                <option value="Grooming">Grooming</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 form-group">
              <div>
                <label className="form-label">Price (ZMW / K):</label>
                <input type="number" className="form-input" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Duration (Mins):</label>
                <input type="number" className="form-input" value={newSrvDuration} onChange={(e) => setNewSrvDuration(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea className="form-textarea" rows={2} value={newSrvDesc} onChange={(e) => setNewSrvDesc(e.target.value)} />
            </div>

            <button className="btn-primary w-full mt-2 text-xs" onClick={handleCreateService}>
              Save Service
            </button>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddProductModal(false); }}>
          <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddProductModal(false)} title="Close (Esc)"><X size={18} /></button>
            <h3 className="text-lg font-bold text-white mb-3">Add New Retail Product</h3>

            <div className="form-group">
              <label className="form-label">Product Name:</label>
              <input type="text" className="form-input" placeholder="e.g. Leave-in Conditioner Spray" value={newPrdName} onChange={(e) => setNewPrdName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Category:</label>
              <select className="form-select" value={newPrdCat} onChange={(e) => setNewPrdCat(e.target.value)}>
                <option value="Hair Products">Hair Products</option>
                <option value="Grooming Products">Grooming Products</option>
                <option value="Cosmetics">Cosmetics</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 form-group">
              <div>
                <label className="form-label">Price (ZMW / K):</label>
                <input type="number" className="form-input" value={newPrdPrice} onChange={(e) => setNewPrdPrice(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Initial Stock:</label>
                <input type="number" className="form-input" value={newPrdStock} onChange={(e) => setNewPrdStock(e.target.value)} />
              </div>
            </div>

            <button className="btn-primary w-full mt-2 text-xs" onClick={handleCreateProduct}>
              Save Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
