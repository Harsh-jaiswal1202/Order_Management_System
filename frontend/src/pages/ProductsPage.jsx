import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import SlideOver from '../components/SlideOver';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  Plus, Search, Package, Edit3, Trash2, Image as ImageIcon, Filter
} from 'lucide-react';

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // SlideOver state
  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts(search);
      setProducts(res.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setSlideOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setErrors({});
    setSlideOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (form.quantity_in_stock === '' || isNaN(form.quantity_in_stock) || Number(form.quantity_in_stock) < 0) e.quantity_in_stock = 'Valid quantity required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    };

    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      setSlideOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const getStockBadge = (qty) => {
    if (qty === 0) return 'badge-danger';
    if (qty <= 10) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ minWidth: '280px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: '160px' }}>
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
          </select>
          <select className="form-select" style={{ width: 'auto', minWidth: '160px' }}>
            <option value="">Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <button className="btn btn-secondary">
            <Filter size={16} /> Filters
          </button>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add New Product
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner dark" />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No products found</h3>
            <p>{search ? 'Try adjusting your search terms.' : 'Get started by adding your first product.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingRight: '0' }}>
                  <label className="custom-checkbox"><input type="checkbox" /></label>
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Stock Status</th>
                <th>Status</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ paddingRight: '0' }}>
                    <label className="custom-checkbox"><input type="checkbox" /></label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--bg-hover)', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <ImageIcon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>General</td>
                  <td style={{ fontWeight: 500 }}>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${getStockBadge(p.quantity_in_stock)}`}>
                      {p.quantity_in_stock} in stock
                    </span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked={true} />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-ghost edit" title="Edit" onClick={() => openEdit(p)}>
                        <Edit3 size={16} />
                      </button>
                      <button className="btn-ghost delete" title="Delete" onClick={() => setDeleteTarget(p)}>
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

      <SlideOver
        isOpen={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editing ? 'Edit Product' : 'Add New Product'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
          <div>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Wireless Mouse"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input
                className={`form-input ${errors.sku ? 'error' : ''}`}
                placeholder="e.g. WM-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
              {errors.sku && <div className="form-error">{errors.sku}</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  className={`form-input ${errors.price ? 'error' : ''}`}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                {errors.price && <div className="form-error">{errors.price}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input
                  className={`form-input ${errors.quantity_in_stock ? 'error' : ''}`}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.quantity_in_stock}
                  onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
                />
                {errors.quantity_in_stock && <div className="form-error">{errors.quantity_in_stock}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select">
                <option value="general">General</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSlideOpen(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={saving}>
              {saving ? <span className="spinner" /> : editing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This product will be permanently removed. Products with existing orders cannot be deleted."
        loading={deleting}
      />
    </>
  );
}
