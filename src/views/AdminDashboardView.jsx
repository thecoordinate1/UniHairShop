import React, { useState } from 'react';
import { ShieldCheck, DollarSign, Calendar, Package, Plus, Edit, Check, AlertCircle, RefreshCw, X } from 'lucide-react';
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

  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'services', 'inventory', 'bookings', 'orders'
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

  // Calculated Sales Metrics
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Admin Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700 }}>
            <ShieldCheck size={20} />
            <span>Business Owner Dashboard</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>UniHairShop Manager</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 14px' }} onClick={() => setShowAddServiceModal(true)}>
            <Plus size={16} />
            <span>Add Service</span>
          </button>
          <button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 14px' }} onClick={() => setShowAddProductModal(true)}>
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid-3">
        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)', border: '1px solid rgba(255, 184, 0, 0.3)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Sales & Revenue</span>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '4px 0' }}>K {totalRevenue}</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bookings: K {bookingRevenue} | Shop: K {orderRevenue}</p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Active Service Appointments</span>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '4px 0' }}>{bookings.length}</h2>
          <p style={{ fontSize: '0.78rem', color: '#00E676' }}>{bookings.filter((b) => b.status === 'Confirmed').length} Confirmed upcoming</p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Retail Shop Orders</span>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '4px 0' }}>{orders.length}</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Inventory items: {products.length} products</p>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
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
            style={{
              background: adminTab === tab.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
              color: adminTab === tab.id ? 'var(--text-dark)' : 'var(--text-main)',
              fontWeight: adminTab === tab.id ? 700 : 500,
              fontSize: '0.82rem',
              padding: '8px 16px',
              borderRadius: '20px',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. SALES OVERVIEW TAB */}
      {adminTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '14px' }}>Daily/Weekly Performance Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Top Category (Bookings):</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>Barbing & Knotless Braids</p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Top Selling Product:</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>Miracle Scalp Growth Oil</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SERVICES MANAGER TAB */}
      {adminTab === 'services' && (
        <div className="grid-2">
          {services.map((srv) => (
            <div key={srv.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-in-stock">{srv.category}</span>
                <span className="price-tag">K {srv.price}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '6px' }}>{srv.name}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{srv.description}</p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Duration: {srv.duration} mins</div>
            </div>
          ))}
        </div>
      )}

      {/* 3. INVENTORY STOCK MANAGER TAB */}
      {adminTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((prd) => (
            <div key={prd.id} className="card" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src={prd.image} alt={prd.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', color: '#fff' }}>{prd.name}</h4>
                  <span className="price-tag" style={{ fontSize: '0.88rem' }}>K {prd.price}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0, width: '120px' }}>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Stock Count:</label>
                  <input
                    type="number"
                    className="form-input"
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.map((b) => (
            <div key={b.id} className="card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <span className="badge badge-in-stock" style={{ marginBottom: '4px' }}>{b.id}</span>
                <h4 style={{ fontSize: '1rem', color: '#fff' }}>{b.serviceName}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Client: {b.customerName} ({b.customerPhone}) | Date: {b.date} at {b.time}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  className="form-select"
                  value={b.status}
                  onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                  style={{ width: 'auto' }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((ord) => (
            <div key={ord.id} className="card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <span className="badge badge-in-stock" style={{ marginBottom: '4px' }}>{ord.id}</span>
                <h4 style={{ fontSize: '1rem', color: '#fff' }}>Total: K {ord.totalAmount}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Customer: {ord.customerName} | Delivery: {ord.deliveryType} ({ord.hostelDetails})
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  className="form-select"
                  value={ord.status}
                  onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                  style={{ width: 'auto' }}
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
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setShowAddServiceModal(false)}><X size={18} /></button>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Add New Bookable Service</h3>

            <div className="form-group">
              <label className="form-label">Service Title:</label>
              <input type="text" className="form-input" placeholder="e.g. Loc Maintenance / Beard Treatment" value={newSrvName} onChange={(e) => setNewSrvName(e.target.value)} />
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="form-group">
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
              <textarea className="form-textarea" rows={3} value={newSrvDesc} onChange={(e) => setNewSrvDesc(e.target.value)} />
            </div>

            <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleCreateService}>
              Save Service
            </button>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <button className="modal-close" onClick={() => setShowAddProductModal(false)}><X size={18} /></button>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Add New Retail Product</h3>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="form-group">
              <div>
                <label className="form-label">Price (ZMW / K):</label>
                <input type="number" className="form-input" value={newPrdPrice} onChange={(e) => setNewPrdPrice(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Initial Stock:</label>
                <input type="number" className="form-input" value={newPrdStock} onChange={(e) => setNewPrdStock(e.target.value)} />
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleCreateProduct}>
              Save Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
