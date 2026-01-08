import axios from "axios";
import Constants from "expo-constants";
import { storage } from "@/utils/storage";

const getHostIP = () => {
  const host =
    Constants.expoConfig?.hostUri?.split(":")[0] ||
    Constants.manifest2?.extra?.expoClient?.hostUri?.split(":")[0] ||
    Constants.manifest?.debuggerHost?.split(":")[0];

  return host;
};

const IP = getHostIP();

// Use environment variable or fallback to local IP
// Nếu có EXPO_PUBLIC_API_URL thì dùng, không thì dùng local
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://app-nodejs-smartdebt-backend-f5a5f6d5fteddea8.eastasia-01.azurewebsites.net';


// Log BASE_URL for debugging
console.log("API Base URL:", BASE_URL);
console.log("Detected IP:", IP);

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor: Add token to headers
instance.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle responses and errors
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        await storage.clearAll();
        // You can redirect to login screen here if needed
      }
      return Promise.reject(error.response.data || error.response);
    }
    // Network error - no response from server
    if (error.request) {
      console.error("Network Error - No response:", {
        message: error.message,
        code: error.code,
        baseURL: BASE_URL,
      });
      return Promise.reject({ 
        message: `Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng hoặc địa chỉ server: ${BASE_URL}`, 
        error: error.message,
        code: error.code 
      });
    }
    return Promise.reject({ message: "Network error", error: error.message });
  }
);

export default instance;
