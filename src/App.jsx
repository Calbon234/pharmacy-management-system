import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Prescriptions from './pages/Prescriptions';
import Sales from './pages/Sales';
import SalesHistory from './pages/SalesHistory';
import Patients from './pages/Patients';
import Suppliers from './pages/Suppliers';
import ExpiredMedicines from './pages/ExpiredMedicines';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

// Standard route guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* ── SHARED: both roles can access dashboard ── */}
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

              {/* ── PHARMACIST ONLY: operational routes ── */}
              <Route path="prescriptions" element={<ProtectedRoute allowedRoles={['pharmacist']}><Prescriptions /></ProtectedRoute>} />
              <Route path="sales"         element={<ProtectedRoute allowedRoles={['pharmacist']}><Sales /></ProtectedRoute>} />
              <Route path="patients"      element={<ProtectedRoute allowedRoles={['pharmacist']}><Patients /></ProtectedRoute>} />
              <Route path="suppliers"     element={<ProtectedRoute allowedRoles={['pharmacist']}><Suppliers /></ProtectedRoute>} />

              {/* ── SHARED: both roles can view (admin = raincheck, pharmacist = full) ── */}
              <Route path="inventory"     element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="sales-history" element={<ProtectedRoute><SalesHistory /></ProtectedRoute>} />
              <Route path="expired"       element={<ProtectedRoute><ExpiredMedicines /></ProtectedRoute>} />
              <Route path="reports"       element={<ProtectedRoute><Reports /></ProtectedRoute>} />

              {/* ── SETTINGS: accessible to both ── */}
              <Route path="settings"      element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* ── ADMIN ONLY: management routes ── */}
              <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="admin/users"     element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
              <Route path="admin/audit"     element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}