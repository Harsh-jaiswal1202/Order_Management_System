import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Hexagon, Package, ShoppingCart, Activity, Eye, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password);
      toast.success('Account created successfully!', {
        icon: '✓',
        style: {
          borderRadius: '8px',
          background: '#d1fae5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          padding: '12px 16px',
        },
      });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel - Dark Navy */}
      <div className="auth-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
            <Hexagon size={24} color="#ffffff" fill="none" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>InventoryOS</h1>
        </div>
        
        <div style={{ zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1.2, marginBottom: '1rem', maxWidth: '400px' }}>
            Smart control over your entire supply chain.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '3rem' }}>
            Join today to manage Products, Orders & Inventory in one place
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <Package size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Products</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Catalog, SKUs & pricing in one view</div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <ShoppingCart size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Orders</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Automatic totals & stock deduction</div>
              </div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Inventory Tracking</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Real-time stock & low-stock alerts</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={14} /> Enterprise-grade security • © 2025 InventoryOS
        </div>
      </div>

      {/* Right Panel - White */}
      <div className="auth-right">
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--bg-sidebar-header)', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>Sign up for a new account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : (
                <><UserPlus size={18} /> Sign Up</>
              )}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <div style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure access</div>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--bg-sidebar-header)' }}>Sign in here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
