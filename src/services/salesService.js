import api from './api';

export const getSales   = (params = {}) => api.get('/sales/index.php', { params });
export const createSale = (data)         => api.post('/sales/index.php', data);