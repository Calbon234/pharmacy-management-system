import api from './api';

export const getPatients   = (params = {}) => api.get('/patients/index.php', { params });
export const addPatient    = (data)         => api.post('/patients/index.php', data);
export const updatePatient = (id, data)     => api.put('/patients/index.php', data, { params: { id } });
export const deletePatient = (id)           => api.delete('/patients/index.php', { params: { id } });