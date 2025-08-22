import axios from 'axios';
import { APP_URL } from '../components/config';

export const axiosInstance = axios.create({
  baseURL: APP_URL,
  withCredentials: true,   
  withXSRFToken: true,     

  validateStatus: (s) => (s >= 200 && s < 300) || s === 401,
});


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
    
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);
