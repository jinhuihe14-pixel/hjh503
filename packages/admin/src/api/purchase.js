import request from '../utils/request';

export const getPurchaseOrders = (params) => request.get('/purchases', { params });
export const createPurchaseOrder = (data) => request.post('/purchases', data);
export const receivePurchaseOrder = (id) => request.put(`/purchases/${id}/receive`);
export const generateAutoPurchase = () => request.get('/purchases/auto-generate');
