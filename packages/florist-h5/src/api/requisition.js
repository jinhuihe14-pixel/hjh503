import request from '../utils/request';

export const getMyRequisitions = (params) => request.get('/requisitions/my', { params });
export const createRequisition = (data) => request.post('/requisitions', data);
