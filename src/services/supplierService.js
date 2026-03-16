import api from './api';

export const getSuppliers   = (params = {}) => api.get('/suppliers/index.php', { params });
export const addSupplier    = (data)         => api.post('/suppliers/index.php', data);
export const updateSupplier = (id, data)     => api.put('/suppliers/index.php', data, { params: { id } });
export const deleteSupplier = (id)           => api.delete('/suppliers/index.php', { params: { id } });