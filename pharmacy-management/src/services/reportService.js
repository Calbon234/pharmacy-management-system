/** Reports & analytics */
import api from './api'
export const reportService = {
  getSalesSummary: (params) => api.get('/reports/sales', { params }),
  getInventoryReport: () => api.get('/reports/inventory'),
  getExpiryReport: () => api.get('/reports/expiry'),
  getPrescriptionStats: () => api.get('/reports/prescriptions'),
}
