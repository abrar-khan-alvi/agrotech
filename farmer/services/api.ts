import axios from 'axios';


const API_URL = 'http://127.0.0.1:8000/api/v1';
export const API_ROOT = API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to requests
// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    async (config) => {
        // For Mock Backend: Use token from localStorage instead of Firebase
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Handle 401 (Refresh Token logic could go here)

export default api;
