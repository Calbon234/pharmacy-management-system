/** Billing/Sales API calls */
import api from './api'
export const billingService = {
  getSales: (params) => api.get('/sales', { params }),
  createSale: (data) => api.post('/sales', data),
  getInvoice: (id) => api.get(`/sales/${id}/invoice`),
  processRefund: (id, data) => api.post(`/sales/${id}/refund`, data),
}
