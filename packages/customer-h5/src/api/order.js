import request from '../utils/request';

export const getMyOrders = (params) => request.get('/orders/my', { params });
export const getOrderDetail = (id) => request.get(`/orders/${id}`);
export const createOrder = (data) => request.post('/orders', data);
export const cancelOrder = (id) => request.put(`/orders/${id}/cancel`);
