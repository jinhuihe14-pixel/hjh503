import request from '../utils/request';

export const getMyRequisitions = (params) => request.get('/requisitions/my', { params });
export const getRequisitionDetail = (id) => request.get(`/requisitions/${id}`);
export const createRequisition = (data) => request.post('/requisitions', data);
export const updateRequisition = (id, data) => request.put(`/requisitions/${id}`, data);
