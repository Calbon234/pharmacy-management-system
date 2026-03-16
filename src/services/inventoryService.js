import api from './api';

export const getMedicines   = (params = {}) => api.get('/medicines/index.php', { params });
export const getMedicine    = (id)           => api.get('/medicines/index.php', { params: { id } });
export const addMedicine    = (data)         => api.post('/medicines/index.php', data);
export const updateMedicine = (id, data)     => api.put('/medicines/index.php', data, { params: { id } });
export const deleteMedicine = (id)           => api.delete('/medicines/index.php', { params: { id } });