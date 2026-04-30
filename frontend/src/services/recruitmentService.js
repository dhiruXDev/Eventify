import axios from 'axios';

const API_URL = 'http://localhost:8002/api/recruitment';

// Create axios instance with default config
const recruitmentApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
recruitmentApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const recruitmentService = {
    getAllRecruitments: async () => {
        const response = await recruitmentApi.get('/');
        return response.data;
    },

    getRecruitmentById: async (id) => {

        const response = await recruitmentApi.get(`/${id}`);
        console.log("Response form Get", response);
        return response.data;
    },

    createRecruitment: async (data) => {
        const response = await recruitmentApi.post('/', data);
        console.log("Error  " , response);
        return response.data;
    },

    updateRecruitment: async (id, data) => {
        const response = await recruitmentApi.put(`/${id}`, data);
        return response.data;
    },

    apply: async (id, data) => {
        console.log("Data", data);
        const response = await recruitmentApi.post(`/${id}/apply`, data);
        return response.data;
    },

    getMyApplication: async (id) => {
        const response = await recruitmentApi.get(`/${id}/my-application`);
        console.log("Response form Application ", response);
        return response.data;
    },

    getMyApplications: async () => {
        const response = await recruitmentApi.get('/my-applications');
        return response.data;
    },

    getRecruitmentApplications: async (id) => {
        const response = await recruitmentApi.get(`/${id}/applications`);
        return response.data;
    },

    closeRecruitment: async (id) => {
        const response = await recruitmentApi.put(`/${id}/close`);
        return response.data;
    },

    getExam: async (id) => {
        const response = await recruitmentApi.get(`/${id}/exam`);
        return response.data;
    },

    setupExam: async (id, data) => {
        const response = await recruitmentApi.post(`/${id}/exam`, data);
        return response.data;
    },

    releaseExam: async (id, data) => {
        const response = await recruitmentApi.put(`/${id}/exam/release`, data);
        return response.data;
    },

    submitExam: async (id, data) => {
        const response = await recruitmentApi.post(`/${id}/submit-exam`, data);
        return response.data;
    },

    screenUsers: async (id, data) => {
        const response = await recruitmentApi.post(`/${id}/screen`, data);
        return response.data;
    },

    finalizeSelection: async (id, data) => {
        const response = await recruitmentApi.post(`/${id}/finalize`, data);
        return response.data;
    },

    evaluatePaper: async (id, appId, data) => {
        const response = await recruitmentApi.post(`/${id}/evaluate-paper/${appId}`, data);
        return response.data;
    }
};

export default recruitmentService;
