import axios from 'axios';
import { toast } from 'react-toastify';

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
        const status = error.response?.status;
        if (status === 401) {
            localStorage.removeItem('dt_jwt_token');
            localStorage.removeItem('dt_jwt_user');
        } else if (status === 403) {
            toast.error(error.response?.data?.message || 'Akses ditolak: Anda tidak memiliki izin.');
        } else if (status >= 500) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan pada server (500). Silakan coba lagi.');
        } else if (!error.response && error.message) {
            toast.error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
        }
        return Promise.reject(error);
    }
);

export default api;
