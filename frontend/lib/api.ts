// lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Request Interceptor to add token from cookies
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            Cookies.remove('token');
            // Redirect to login page if 401 Unauthorized
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
