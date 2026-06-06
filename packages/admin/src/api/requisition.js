import request from '../utils/request';

export const getRequisitions = (params) => request.get('/requisitions', { params });
export const getMyRequisitions = (params) => request.get('/requisitions/my', { params });
export const createRequisition = (data) => request.post('/requisitions', data);
export const approveRequisition = (id, data) => request.put(`/requisitions/${id}/approve`, data);
