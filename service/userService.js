import axios from "./axios";

/**
 * Lấy thông tin người dùng hiện tại
 * @returns {Promise}
 */
export const getMyProfile = async () => {
  return axios.get("/users/my-profile");
};

/**
 * Cập nhật push token
 * @param {string} token - Expo push token
 * @returns {Promise}
 */
export const updatePushToken = async (token) => {
  return axios.post("/users/update-push-token", { token });
};

/**
 * Cập nhật thông tin người dùng
 * @param {Object} profileData - { name?, phone?, avatar_url? }
 * @returns {Promise}
 */
export const updateProfile = async (profileData) => {
  return axios.put("/users/update-profile", profileData);
};


