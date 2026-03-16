import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@context/AuthContext'
import { PharmacyProvider } from '@context/PharmacyContext'
import MainLayout from '@components/layout/MainLayout'
import PrivateRoute from '@components/common/PrivateRoute'

// Pages
import Dashboard from '@pages/Dashboard'
import Inventory from '@pages/Inventory'
import Prescriptions from '@pages/Prescriptions'
import Patients from '@pages/Patients'
import Billing from '@pages/Billing'
import Reports from '@pages/Reports'
import Settings from '@pages/Settings'
import Login from '@pages/Login'
import NotFound from '@pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <PharmacyProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="patients" element={<Patients />} />
              <Route path="billing" element={<Billing />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </PharmacyProvider>
    </AuthProvider>
  )
}
