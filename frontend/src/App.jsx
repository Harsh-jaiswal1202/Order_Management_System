import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, title, subtitle }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" />;
  return <Layout title={title} subtitle={subtitle}>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }
        }} 
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route path="/" element={<ProtectedRoute title="Dashboard" subtitle="Overview of your business at a glance"><DashboardPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute title="Products" subtitle="Manage your inventory and catalog"><ProductsPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute title="Customers" subtitle="View and manage customer records"><CustomersPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute title="Orders" subtitle="Track and create orders"><OrdersPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute title="Settings" subtitle="Manage your account preferences"><SettingsPage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}
