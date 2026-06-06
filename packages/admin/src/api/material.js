import request from '../utils/request';

export const getMaterials = (params) => request.get('/materials', { params });
export const getMaterialDetail = (id) => request.get(`/materials/${id}`);
export const createMaterial = (data) => request.post('/materials', data);
export const updateMaterial = (id, data) => request.put(`/materials/${id}`, data);
export const deleteMaterial = (id) => request.delete(`/materials/${id}`);
export const stockIn = (data) => request.post('/materials/stock-in', data);
export const stockOut = (data) => request.post('/materials/stock-out', data);
export const getStockRecords = (params) => request.get('/materials/stock/records', { params });
export const getLowStockMaterials = () => request.get('/materials/low-stock');
