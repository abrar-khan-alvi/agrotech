import axios from 'axios';


const API_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    async (config) => {
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

// Response interceptor for API calls
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/token/refresh/`, {
                        refresh: refreshToken
                    });
                    const { access } = response.data;
                    localStorage.setItem('accessToken', access);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (error) {
                // If refresh fails, logout user
                console.error("Token refresh failed", error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/expert/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth Services
export const auth = {
    sendOtp: async (phone: string) => {
        const response = await api.post('/experts/auth/otp/send/', { phone });
        return response.data;
    },

    verifyOtp: async (phone: string, code: string) => {
        const response = await api.post('/experts/auth/otp/verify/', { phone, code });
        return response.data;
    },

    register: async (formData: FormData) => {
        const response = await api.post('/experts/auth/register/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    login: async (phone: string, password: string) => {
        const response = await api.post('/experts/auth/login/', { phone, password });
        return response.data;
    },
};

// Expert Services
export const expert = {
    getProfile: async () => {
        const response = await api.get('/expert/profile/');
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.patch('/expert/profile/', data);
        return response.data;
    },

    updateStatus: async (isOnline: boolean) => {
        const response = await api.patch('/expert/profile/', { is_online: isOnline });
        return response.data;
    },

    // Public/All Experts (if needed)
    getAllExperts: async () => {
        const response = await api.get('/experts/');
        return response.data;
    },

    getExpertDetail: async (id: number) => {
        const response = await api.get(`/experts/${id}/`);
        return response.data;
    },

    getRequests: async () => {
        const response = await api.get('/consultations/');
        return response.data;
    },

    updateRequestStatus: async (id: string, status: string) => {
        const response = await api.patch(`/consultations/${id}/`, { status });
        return response.data;
    },

    submitAdvice: async (data: any) => {
        const response = await api.post('/expert-advice/', data);
        return response.data;
    },

    getAdviceByField: async (fieldId: number) => {
        const response = await api.get(`/expert-advice/?field=${fieldId}`);
        return response.data;
    }

};

export default api;
