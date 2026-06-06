import request from '../utils/request';

export const getOrders = (params) => request.get('/orders', { params });
export const getOrderDetail = (id) => request.get(`/orders/${id}`);
export const assignOrder = (id, data) => request.put(`/orders/${id}/assign`, data);
export const updateOrderStatus = (id, data) => request.put(`/orders/${id}/status`, data);
export const cancelOrder = (id) => request.put(`/orders/${id}/cancel`);
