import request from '../utils/request';

export const getFloristOrders = (params) => request.get('/orders/florist', { params });
export const getOrderDetail = (id) => request.get(`/orders/${id}`);
export const updateOrderStatus = (id, data) => request.put(`/orders/${id}/status`, data);
