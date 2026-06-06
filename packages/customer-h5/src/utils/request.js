import axios from 'axios';
import { Toast } from 'antd-mobile';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        Toast.show({ content: '登录已过期', icon: 'fail' });
      } else {
        Toast.show({ content: data?.message || '请求失败', icon: 'fail' });
      }
    } else {
      Toast.show({ content: '网络错误', icon: 'fail' });
    }
    
    return Promise.reject(error);
  }
);

export default request;
