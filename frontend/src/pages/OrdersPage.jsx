import { useState, useEffect, useCallback } from 'react';
import { getOrders, getOrder, createOrder, deleteOrder, getProducts, getCustomers } from '../api';
import SlideOver from '../components/SlideOver';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  Plus, ShoppingCart, Trash2, Eye, User, Package, PlusCircle, CheckCircle2, Filter, Search, Calendar
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data for create order form
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Create SlideOver state
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ customer_id: '', items: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // View detail SlideOver state
  const [viewOrder, setViewOrder] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFormData = useCallback(async () => {
    try {
      const [cRes, pRes] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(cRes.data);
      setProducts(pRes.data.filter(p => p.quantity_in_stock > 0));
    } catch {
      toast.error('Failed to load form data');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
      fetchFormData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOrders, fetchFormData]);

  const openCreate = () => {
    setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
    setErrors({});
    setCreateOpen(true);
    fetchFormData(); // refresh stock levels
  };

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });
  };

  const handleRemoveItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const validate = () => {
    const e = {};
    if (!form.customer_id) e.customer_id = 'Customer is required';
    if (form.items.length === 0) e.items = 'At least one item is required';
    
    form.items.forEach((item, idx) => {
      if (!item.product_id) {
        e[`item_${idx}_product`] = 'Select a product';
      }
      if (!item.quantity || item.quantity < 1) {
        e[`item_${idx}_qty`] = 'Invalid quantity';
      } else if (item.product_id) {
        const product = products.find(p => p.id.toString() === item.product_id.toString());
        if (product && item.quantity > product.quantity_in_stock) {
          e[`item_${idx}_qty`] = `Max ${product.quantity_in_stock}`;
        }
      }
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    
    const payload = {
      customer_id: parseInt(form.customer_id, 10),
      items: form.items.map(item => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10)
      }))
    };

    try {
      await createOrder(payload);
      toast.success('Order successfully created');
      setCreateOpen(false);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create order';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const loadOrderDetails = async (id) => {
    setViewLoading(true);
    // Open slideover right away with loading state
    setViewOrder({ id, loading: true });
    try {
      const res = await getOrder(id);
      setViewOrder(res.data);
    } catch {
      toast.error('Failed to load order details');
      setViewOrder(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteOrder(deleteTarget.id);
      toast.success('Order cancelled and stock restored');
      setDeleteTarget(null);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to cancel order';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const getFormTotal = () => {
    return form.items.reduce((total, item) => {
      if (!item.product_id || !item.quantity) return total;
      const product = products.find(p => p.id.toString() === item.product_id.toString());
      if (!product) return total;
      return total + (Number(product.price) * parseInt(item.quantity, 10));
    }, 0);
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const avatarColors = ['', 'teal', 'purple', 'red'];
  const getAvatarColor = (id) => avatarColors[id % avatarColors.length];

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'delivered') return <span className="badge badge-success">Completed</span>;
    if (s === 'cancelled') return <span className="badge badge-danger">Cancelled</span>;
    return <span className="badge badge-warning">Pending</span>;
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ minWidth: '280px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search orders..." />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: '160px' }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-secondary">
            <Filter size={16} /> Filters
          </button>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Create Order
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner dark" />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} />
            <h3>No orders found</h3>
            <p>Ready to make a sale? Create your first order.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingRight: '0' }}>
                  <label className="custom-checkbox"><input type="checkbox" /></label>
                </th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ paddingRight: '0' }}>
                    <label className="custom-checkbox"><input type="checkbox" /></label>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    ORD-{o.id.toString().padStart(4, '0')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={`avatar-initials ${getAvatarColor(o.customer.id)}`} style={{ width: '28px', height: '28px', fontSize: '0.65rem' }}>
                        {getInitials(o.customer.full_name)}
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{o.customer.full_name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      {new Date(o.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>{o.items?.length || 0} items</td>
                  <td style={{ fontWeight: 600 }}>${Number(o.total_amount).toFixed(2)}</td>
                  <td>{getStatusBadge(o.status)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-ghost view" title="View Details" onClick={() => loadOrderDetails(o.id)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-ghost delete" title="Cancel Order" onClick={() => setDeleteTarget(o)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Order SlideOver */}
      <SlideOver
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Order"
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, paddingBottom: '2rem' }}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="order-customer">Select Customer</label>
              <select
                id="order-customer"
                className={`form-select ${errors.customer_id ? 'error' : ''}`}
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              >
                <option value="">-- Choose a customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
              {errors.customer_id && <div className="form-error">{errors.customer_id}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Order Items</h3>
              <button type="button" className="btn btn-sm btn-ghost" style={{ color: 'var(--accent-primary)' }} onClick={handleAddItem}>
                <PlusCircle size={16} /> Add Item
              </button>
            </div>
            
            {errors.items && <div className="form-error" style={{ marginBottom: '1rem' }}>{errors.items}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {form.items.map((item, index) => {
                const product = products.find(p => p.id.toString() === item.product_id.toString());
                const maxQty = product ? product.quantity_in_stock : '';
                const price = product ? product.price : 0;
                const subtotal = product && item.quantity ? Number(price) * parseInt(item.quantity, 10) : 0;

                return (
                  <div key={index} style={{ 
                    padding: '1rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    position: 'relative'
                  }}>
                    <button 
                      type="button" 
                      className="btn-ghost delete" 
                      onClick={() => handleRemoveItem(index)}
                      disabled={form.items.length === 1}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', opacity: form.items.length === 1 ? 0.3 : 1, padding: '0.25rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="form-group" style={{ marginBottom: '1rem', paddingRight: '2rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Product</label>
                      <select
                        className={`form-select ${errors[`item_${index}_product`] ? 'error' : ''}`}
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity_in_stock < 1}>
                            {p.name} - ${p.price} ({p.quantity_in_stock} left)
                          </option>
                        ))}
                      </select>
                      {errors[`item_${index}_product`] && <div className="form-error">{errors[`item_${index}_product`]}</div>}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          max={maxQty || ''}
                          className={`form-input ${errors[`item_${index}_qty`] ? 'error' : ''}`}
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                        {errors[`item_${index}_qty`] && <div className="form-error">{errors[`item_${index}_qty`]}</div>}
                      </div>
                      <div style={{ flex: 1, textAlign: 'right', paddingBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subtotal</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${subtotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div style={{ 
            marginTop: 'auto', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            position: 'sticky',
            bottom: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Amount</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>${getFormTotal().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={saving}>
                {saving ? <span className="spinner" /> : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      </SlideOver>

      {/* View Detail SlideOver */}
      <SlideOver 
        isOpen={!!viewOrder} 
        onClose={() => setViewOrder(null)} 
        title={viewOrder && !viewOrder.loading ? `Order #ORD-${viewOrder.id.toString().padStart(4, '0')}` : 'Order Details'}
      >
        {viewLoading || (viewOrder && viewOrder.loading) ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner dark" />
          </div>
        ) : viewOrder ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1 }}>
              {/* Status Stepper */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Order Status</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
                  
                  {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                    const isActive = viewOrder.status === 'Completed' ? true : viewOrder.status === 'Pending' ? i <= 1 : i === 0;
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
                        <div style={{ 
                          width: '24px', height: '24px', borderRadius: '50%', 
                          background: isActive ? 'var(--accent-primary)' : 'var(--bg-card)',
                          border: `2px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color-hover)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#ffffff'
                        }}>
                          {isActive && <CheckCircle2 size={14} />}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ background: 'var(--bg-surface)', borderRadius: '0.5rem', padding: '1.25rem', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} color="var(--text-muted)" /> Customer Information
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div className={`avatar-initials ${getAvatarColor(viewOrder.customer.id)}`}>
                    {getInitials(viewOrder.customer.full_name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{viewOrder.customer.full_name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{viewOrder.customer.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phone Number</div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{viewOrder.customer.phone_number}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order Date</div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{new Date(viewOrder.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={16} color="var(--text-muted)" /> Order Items
                </h3>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                      <tr>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Item</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 500, color: 'var(--text-secondary)' }}>Qty</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewOrder.items.map((item, i) => (
                        <tr key={item.id} style={{ borderBottom: i === viewOrder.items.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.product.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {item.product.sku}</div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 500 }}>{item.quantity}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>${Number(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div style={{ 
              marginTop: 'auto', 
              paddingTop: '1.5rem', 
              borderTop: '1px dashed var(--border-color)',
              background: 'var(--bg-secondary)',
              position: 'sticky',
              bottom: 0
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>${Number(viewOrder.total_amount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Shipping</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>$0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>${Number(viewOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </SlideOver>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Cancel Order ORD-${deleteTarget?.id.toString().padStart(4, '0')}?`}
        message={`This will permanently delete the order for ${deleteTarget?.customer?.full_name} and restore the stock of all associated products.`}
        loading={deleting}
      />
    </>
  );
}
