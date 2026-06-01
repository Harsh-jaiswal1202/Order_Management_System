import { useState, useEffect } from 'react';
import { getDashboardSummary, getOrders, updateProduct } from '../api';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restock state
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [restocking, setRestocking] = useState(false);

  const fetchDashboardData = () => {
    Promise.all([
      getDashboardSummary(),
      getOrders()
    ])
      .then(([summaryRes, ordersRes]) => {
        setData(summaryRes.data);
        setOrders(ordersRes.data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRestock = async () => {
    if (!restockAmount || isNaN(restockAmount) || Number(restockAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setRestocking(true);
    try {
      const payload = {
        name: restockProduct.name,
        sku: restockProduct.sku,
        price: Number(restockProduct.price),
        quantity_in_stock: restockProduct.quantity_in_stock + parseInt(restockAmount, 10)
      };
      await updateProduct(restockProduct.id, payload);
      toast.success(`${restockProduct.name} restocked successfully`);
      setRestockProduct(null);
      setRestockAmount('');
      fetchDashboardData();
    } catch {
      toast.error('Failed to restock product');
    } finally {
      setRestocking(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner dark" /></div>;
  if (!data) return <div className="empty-state"><p>Failed to load dashboard</p></div>;

  const stats = [
    { label: 'Total Products', value: data.total_products, icon: Package, cls: 'blue' },
    { label: 'Total Customers', value: data.total_customers, icon: Users, cls: 'teal' },
    { label: 'Total Orders', value: data.total_orders, icon: ShoppingCart, cls: 'purple' },
    { label: 'Revenue', value: `$${Number(data.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, cls: 'red' },
  ];

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'delivered') return <span className="badge badge-success">Completed</span>;
    if (s === 'cancelled') return <span className="badge badge-danger">Cancelled</span>;
    return <span className="badge badge-warning">Pending</span>;
  };

  return (
    <>
      <div className="stats-grid">
        {stats.map(s => (
          <div className={`stat-card ${s.cls}`} key={s.label}>
            <div className="stat-header">
              <span className="stat-title">{s.label}</span>
              <div className={`stat-icon ${s.cls}`}><s.icon size={18} /></div>
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="card" style={{ padding: '0' }}>
          <div className="table-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
            <h3 className="table-title">Recent Orders</h3>
            <Link to="/orders" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>View All</Link>
          </div>
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="4" className="empty-state" style={{ padding: '2rem' }}>No orders found</td></tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id}>
                      <td className="primary-cell">#{o.id.toString().padStart(4, '0')}</td>
                      <td>{o.customer?.name || 'Walk-in Customer'}</td>
                      <td>{getStatusBadge(o.status)}</td>
                      <td style={{ fontWeight: '500' }}>${Number(o.total_amount).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="card" style={{ padding: '0' }}>
          <div className="table-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
            <h3 className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#ef4444" /> Low Stock Alerts
            </h3>
            <Link to="/products" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>Manage Inventory</Link>
          </div>
          
          <div style={{ padding: '1rem 1.25rem' }}>
            {data.low_stock_products.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}><p>All products are well stocked!</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.low_stock_products.slice(0, 5).map(p => (
                  <div key={p.id} className="low-stock-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', background: '#ffffff', borderRadius: '0.375rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <Package size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>{p.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>SKU: {p.sku}</div>
                      </div>
                    </div>
                    <div className="low-stock-actions">
                      <div style={{ textAlign: 'right', flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: p.quantity_in_stock === 0 ? '#ef4444' : '#f59e0b', textAlign: 'left' }}>
                          {p.quantity_in_stock} left
                        </div>
                        <div style={{ width: '100%', minWidth: '60px', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (p.quantity_in_stock / 20) * 100)}%`, height: '100%', background: p.quantity_in_stock === 0 ? '#ef4444' : '#f59e0b' }} />
                        </div>
                      </div>
                      <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }} onClick={() => { setRestockProduct(p); setRestockAmount(''); }}>Restock</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!restockProduct}
        onClose={() => setRestockProduct(null)}
        title="Restock Product"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRestockProduct(null)} disabled={restocking}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRestock} disabled={restocking}>
              {restocking ? <span className="spinner" /> : 'Confirm Restock'}
            </button>
          </>
        }
      >
        {restockProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>How many units of <strong>{restockProduct.name}</strong> would you like to add to inventory?</p>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quantity to Add</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="e.g. 50"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                autoFocus
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Current stock: {restockProduct.quantity_in_stock}. New stock will be: {restockProduct.quantity_in_stock + (parseInt(restockAmount, 10) || 0)}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
