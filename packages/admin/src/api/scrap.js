import request from '../utils/request';

export const getScrapRecords = (params) => request.get('/scraps', { params });
export const createScrapRecord = (data) => request.post('/scraps', data);
export const approveScrap = (id, data) => request.put(`/scraps/${id}/approve`, data);
