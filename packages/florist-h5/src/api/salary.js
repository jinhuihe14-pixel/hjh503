import request from '../utils/request';

export const getMySalary = (params) => request.get('/salary/my', { params });
