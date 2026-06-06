import request from '../utils/request';

export const getSalaryRecords = (params) => request.get('/salary', { params });
export const calculateSalary = (data) => request.post('/salary/calculate', data);
export const updateSalary = (id, data) => request.put(`/salary/${id}`, data);
export const confirmSalary = (id, data) => request.put(`/salary/${id}/confirm`, data);
