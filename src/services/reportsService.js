import api from './api';
export const getSalesReport = (params) => api.get('/reports/sales', { params });
export const getInventoryReport = () => api.get('/reports/inventory');
export const getPrescriptionReport = (params) => api.get('/reports/prescriptions', { params });
export const exportReport = (type, params) => api.get(`/reports/export/${type}`, { params, responseType: 'blob' });
