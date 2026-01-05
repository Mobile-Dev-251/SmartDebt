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
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://wrongurl:3000`;

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
    return Promise.reject({ message: "Network error", error });
  }
);

export default instance;
