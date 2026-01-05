import axios from "./axios";

/**
 * Đăng nhập
 * @param {Object} userData - { email, password }
 * @returns {Promise}
 */
export const login = async (userData) => {
  return axios.post("/auth/login", userData);
};

/**
 * Đăng ký
 * @param {Object} userData - { full_name, email, phone, password, avatar_url? }
 * @returns {Promise}
 */
export const register = async (userData) => {
  return axios.post("/auth/register", userData);
};

// Keep old function for backward compatibility
export const handleAuthLogin = login;
