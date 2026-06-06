import request from '../utils/request';

export const getMaterials = (params) => request.get('/materials', { params });
export const getMaterialDetail = (id) => request.get(`/materials/${id}`);
