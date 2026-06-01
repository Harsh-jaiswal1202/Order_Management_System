import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, Menu, LogOut, Settings, Hexagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Hexagon size={28} color="#3b82f6" fill="currentColor" />
          <h1>InventoryOS</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-link" onClick={logout} style={{ width: '100%', textAlign: 'left', background: 'transparent' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="header-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu"><Menu size={20} /></button>
          </div>
          <div className="header-right">
            <div className="header-user">
              <div className="header-avatar">{getInitials(user?.email)}</div>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
