/** Prescription API calls */
import api from './api'
export const prescriptionService = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  dispense: (id) => api.post(`/prescriptions/${id}/dispense`),
}
