import { useState, useEffect, useCallback } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  Plus, Search, Users, Trash2, Eye, Mail, Phone, Filter
} from 'lucide-react';

const emptyForm = { full_name: '', email: '', phone_number: '' };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // View detail
  const [viewCustomer, setViewCustomer] = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers(search);
      setCustomers(res.data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.phone_number.trim()) e.phone_number = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
    };

    try {
      await createCustomer(payload);
      toast.success('Customer created');
      setModalOpen(false);
      fetchCustomers();
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
      await deleteCustomer(deleteTarget.id);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const avatarColors = ['', 'teal', 'purple', 'red'];
  const getAvatarColor = (id) => avatarColors[id % avatarColors.length];

  return (
    <>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ minWidth: '280px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ width: 'auto', minWidth: '160px' }}>
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn btn-secondary">
            <Filter size={16} /> Filters
          </button>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add New Customer
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner dark" />
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No customers found</h3>
            <p>{search ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingRight: '0' }}>
                  <label className="custom-checkbox"><input type="checkbox" /></label>
                </th>
                <th>Customer Name</th>
                <th>Contact Information</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ paddingRight: '0' }}>
                    <label className="custom-checkbox"><input type="checkbox" /></label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className={`avatar-initials ${getAvatarColor(c.id)}`}>
                        {getInitials(c.full_name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                        <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                        {c.email}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                        {c.phone_number}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-active">Active</span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-ghost view" title="View" onClick={() => setViewCustomer(c)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-ghost delete" title="Delete" onClick={() => setDeleteTarget(c)}>
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Customer"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Save Customer'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className={`form-input ${errors.full_name ? 'error' : ''}`}
              placeholder="e.g. Jane Doe"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            {errors.full_name && <div className="form-error">{errors.full_name}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className={`form-input ${errors.phone_number ? 'error' : ''}`}
              placeholder="+1 555 123 4567"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            />
            {errors.phone_number && <div className="form-error">{errors.phone_number}</div>}
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select className="form-select">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!viewCustomer} onClose={() => setViewCustomer(null)} title="Customer Details">
        {viewCustomer && (
          <div className="order-detail-grid">
            <div><div className="detail-label">Full Name</div><div className="detail-value">{viewCustomer.full_name}</div></div>
            <div><div className="detail-label">Email</div><div className="detail-value" style={{ color: 'var(--text-accent)' }}>{viewCustomer.email}</div></div>
            <div><div className="detail-label">Phone</div><div className="detail-value">{viewCustomer.phone_number}</div></div>
            <div><div className="detail-label">Joined</div><div className="detail-value">{new Date(viewCustomer.created_at).toLocaleString()}</div></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.full_name}"?`}
        message="This customer will be permanently removed. Customers with existing orders cannot be deleted."
        loading={deleting}
      />
    </>
  );
}
