import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        Accept: 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('dt_jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Jika payload adalah FormData, pastikan Content-Type tidak dikunci ke application/json
    // agar browser secara otomatis menyertakan multipart/form-data beserta boundary yang valid
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('dt_jwt_token');
            localStorage.removeItem('dt_jwt_user');
        }
        return Promise.reject(error);
    }
);

export default api;
