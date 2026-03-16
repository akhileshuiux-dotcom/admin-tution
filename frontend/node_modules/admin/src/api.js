import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/admin/',
});

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized! Clearing session...");
            localStorage.clear();
            const currentPath = window.location.pathname;
            if (currentPath.includes('/admin') || currentPath.includes('/dashboard')) {
                window.location.href = '/login/admin';
            } else {
                window.location.href = '/login/student';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
