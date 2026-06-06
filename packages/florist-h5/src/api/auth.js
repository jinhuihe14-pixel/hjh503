import request from '../utils/request';

export const login = (data) => request.post('/auth/login', data);
export const getProfile = () => request.get('/auth/profile');
export const updateProfile = (data) => request.put('/auth/profile', data);
