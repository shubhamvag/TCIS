import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const TCIS_API_KEY = "tcis_sim_2026_marketing_hub";

// Create base instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Inject Auth & Logging
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add API Key for specific write operations if needed, 
        // or always include it if the backend requires it for all internal calls
        config.headers["X-TCIS-API-Key"] = TCIS_API_KEY;

        if (import.meta.env.DEV) {
            console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
            console.log(`✅ [API Response] ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error: AxiosError) => {
        const status = error.response?.status;
        const message = error.message;

        if (status === 401) {
            console.error("🔑 Unauthorized - Redirecting to login or clearing session...");
        } else if (status === 500) {
            console.error("💥 Server Error - Something went wrong on the backend.");
        } else {
            console.error(`❌ API Error [${status || 'NETWORK'}]: ${message}`);
        }

        return Promise.reject(error);
    }
);

export default api;
