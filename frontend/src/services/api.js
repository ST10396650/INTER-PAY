import axios from 'axios'

const API_BASE_URL = 'https://localhost:5443/api';


// Create axios instance with security configurations
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token')
            localStorage.removeItem('userType')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authService = {
    async login(credentials, userType) {
        const endpoint = userType === 'employee' ? '/employee/login' : '/customer/login'
        const response = await apiClient.post(endpoint, credentials)
        return response.data
    },

    async register(userData) {
        const response = await apiClient.post('/customer/register', userData)
        return response.data
    },

    async logout() {
        const userType = localStorage.getItem('userType')
        const endpoint = userType === 'employee' ? '/employee/logout' : '/customer/logout'
        return await apiClient.post(endpoint)
    },

    async verifyToken(token) {
        // This would typically call a token verification endpoint
        // For now, we'll use the profile endpoint
        const userType = localStorage.getItem('userType')
        const endpoint = userType === 'employee' ? '/employee/profile' : '/customer/profile'
        const response = await apiClient.get(endpoint)
        return response.data
    },

      getProfile: async () => {
        const userType = localStorage.getItem('userType');
        const endpoint = userType === 'employee' ? '/employee/profile' : '/customer/profile';
        console.log('🔍 Fetching profile from:', endpoint);
        const response = await apiClient.get(endpoint);
        console.log('✅ Profile response:', response.data);
        return response.data;
    }
};

export const paymentService = {
    async createPayment(paymentData) {
        const response = await apiClient.post('/customer/payment', paymentData)
        return response.data
    },

    getTransactions: async () => {
        const response = await apiClient.get('/customer/transactions');
        return response.data;
    },

    async getTransactionById(id) {
        const response = await apiClient.get(`/transactions/${id}`)
        return response.data
    },

    async updateTransactionStatus(id, status) {
        const response = await apiClient.patch(`/transactions/${id}/status`, { status })
        return response.data
    },

    async submitToSwift(id) {
        const response = await apiClient.post(`/transactions/${id}/submit-to-swift`)
        return response.data
    }
};

export default apiClient;