import request from '../utils/request';

export const getProducts = (params) => request.get('/products', { params });
export const getProductDetail = (id) => request.get(`/products/${id}`);
