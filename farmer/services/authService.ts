import api from './api';
import { FarmerProfile } from '../types';

export interface LoginResponse {
    action: 'login' | 'register';
    access?: string;
    refresh?: string;
    pre_auth_token?: string;
    user?: FarmerProfile;
    message?: string;
}

export const authService = {
    // Check if user exists
    checkStatus: async (phone: string) => {
        const response = await api.post('/auth/check-status/', { phone });
        return response.data; // { exists: boolean, is_password_set: boolean }
    },

    // Step 1: Send OTP
    sendOtp: async (phone: string) => {
        return api.post('/auth/otp/send/', { phone });
    },

    // Step 2: Verify OTP
    verifyOtp: async (phone: string, code: string) => {
        const response = await api.post<LoginResponse>('/auth/otp/verify/', { phone, code });
        return response.data;
    },

    // Step 3: Register
    register: async (data: any) => {
        const response = await api.post('/auth/register/', data);
        return response.data;
    },

    // Login with Password
    loginWithPassword: async (phone: string, password: string) => {
        const response = await api.post('/auth/login/', { phone, password });
        return response.data;
    },

    // Update Profile Info
    updateProfile: async (data: any) => {
        const response = await api.patch('/profile/', data);
        return response.data;
    },

    // Upload Avatar
    uploadAvatar: async (formData: FormData) => {
        const response = await api.post('/profile/avatar/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
