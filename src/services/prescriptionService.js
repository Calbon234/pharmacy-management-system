import api from './api';

export const getPrescriptions   = (params = {}) => api.get('/prescriptions/index.php', { params });
export const addPrescription    = (data)         => api.post('/prescriptions/index.php', data);
export const updatePrescription = (id, data)     => api.put('/prescriptions/index.php', data, { params: { id } });
export const deletePrescription = (id)           => api.delete('/prescriptions/index.php', { params: { id } });