import api from './api';

export const farmerService = {
    // Fields
    getFields: async () => {
        const response = await api.get('/fields/');
        return response.data;
    },

    createField: async (data: any) => {
        const response = await api.post('/fields/', data);
        return response.data;
    },

    // IoT Readings
    getIoTReadings: async (fieldId?: string) => {
        const params = fieldId ? { field_id: fieldId } : {};
        const response = await api.get('/iot/', { params });
        return response.data;
    },

    // Consultation Advice (Expert replies)
    getAdvice: async () => {
        const response = await api.get('/expert-advice/'); // Fetch structured expert advice
        return response.data;
    },

    // AI Consultations
    getAIConsultations: async (fieldId?: string) => {
        const params = fieldId ? { field_id: fieldId } : {};
        const response = await api.get('/ai-consultations/', { params });
        return response.data;
    }
};
