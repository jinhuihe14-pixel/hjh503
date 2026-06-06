import request from '../utils/request';

export const getRequisitions = (params) => request.get('/requisitions', { params });
export const getRequisitionDetail = (id) => request.get(`/requisitions/${id}`);
export const createRequisition = (data) => request.post('/requisitions', data);
export const updateRequisition = (id, data) => request.put(`/requisitions/${id}`, data);
export const approveRequisition = (id, data) => request.put(`/requisitions/${id}/approve`, data);
export const getMaterialRequisitions = (materialId, params) => 
  request.get(`/requisitions/material/${materialId}`, { params });
