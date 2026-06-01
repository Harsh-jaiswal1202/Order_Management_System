import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../api';
import toast from 'react-hot-toast';
import { Mail, Lock, Moon, Sun, Save, Shield, User, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        setEmail(user.email || '');
      }
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setLoadingEmail(true);
    try {
      await updateMe({ email });
      toast.success('Email updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update email');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter a new password');
      return;
    }
    setLoadingPassword(true);
    try {
      await updateMe({ password });
      toast.success('Password updated successfully');
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setLoadingPassword(false);
    }
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Account Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Manage your personal preferences, security, and application experience.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Profile Section */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%)', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '1.5rem', fontWeight: 600, boxShadow: 'var(--shadow-sm)'
            }}>
              {user?.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                <User size={18} color="var(--accent-primary)" />
                Personal Profile
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Update your primary email address used for login and notifications.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSaveEmail}>
            <div style={{ padding: '2rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.75rem', height: '2.75rem', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: '1.25rem 2rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loadingEmail} style={{ height: '2.75rem', padding: '0 1.5rem' }}>
                {loadingEmail ? <span className="spinner" /> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              <Shield size={18} color="#f59e0b" />
              Security
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>
          
          <form onSubmit={handleSavePassword}>
            <div style={{ padding: '2rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>New Password</label>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', pointerEvents: 'none' }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.75rem', height: '2.75rem', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Must be at least 8 characters long.
                </div>
              </div>
            </div>
            <div style={{ padding: '1.25rem 2rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loadingPassword} style={{ height: '2.75rem', padding: '0 1.5rem', background: '#0f172a', borderColor: '#0f172a' }}>
                {loadingPassword ? <span className="spinner" /> : <><Save size={18} /> Update Password</>}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              <Palette size={18} color="#10b981" />
              Appearance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Customize the look and feel of your dashboard interface.
            </p>
          </div>
          
          <div style={{ padding: '2rem' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              background: 'var(--bg-surface)', padding: '1.25rem 1.5rem', 
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '0.75rem', 
                  display: 'flex', border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {isDarkMode ? <Moon size={24} color="#8b5cf6" /> : <Sun size={24} color="#f59e0b" />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '0.125rem' }}>Interface Theme</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Currently using <strong>{isDarkMode ? 'Dark' : 'Light'} Mode</strong></div>
                </div>
              </div>
              
              <label className="toggle-switch" style={{ transform: 'scale(1.1)' }}>
                <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
