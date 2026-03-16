import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales-history" element={<SalesHistory />} />
              <Route path="patients" element={<Patients />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="expired" element={<ExpiredMedicines />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}