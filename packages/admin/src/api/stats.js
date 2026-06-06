import request from '../utils/request';

export const getOverviewStats = () => request.get('/stats/overview');
export const getDashboardStats = () => request.get('/stats/dashboard');
export const getRevenueStats = (params) => request.get('/stats/revenue', { params });
export const getMaterialStats = (params) => request.get('/stats/material', { params });
export const getProductProfitStats = (params) => request.get('/stats/product-profit', { params });
export const getFloristPerformance = (params) => request.get('/stats/florist-performance', { params });
