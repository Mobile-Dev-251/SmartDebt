import axios from "./axios";

/**
 * Lấy thông tin người dùng hiện tại
 * @returns {Promise}
 */
export const getMyProfile = async () => {
  return axios.get("/users/my-profile");
};

/**
 * Cập nhật thông tin người dùng
 * @param {Object} profileData - { name?, phone?, avatar_url? }
 * @returns {Promise}
 */
export const updateProfile = async (profileData) => {
  return axios.put("/users/update-profile", profileData);
};

/**
 * Lấy danh sách thông báo của tôi
 * @returns {Promise}
 */
export const getMyNotifications = async () => {
  return axios.get("/users/my-notifications");
};

/**
 * Đánh dấu thông báo đã đọc
 * @param {number} notificationId - ID của thông báo
 * @returns {Promise}
 */
export const markNotificationAsRead = async (notificationId) => {
  return axios.put(`/users/mark-notification-read/${notificationId}`);
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * @returns {Promise}
 */
export const markAllNotificationsAsRead = async () => {
  return axios.put("/users/mark-all-notifications-read");
};

/**
 * Cập nhật push token
 * @param {string} pushToken - Expo push token
 * @returns {Promise}
 */
export const updatePushToken = async (pushToken) => {
  return axios.post("/users/update-push-token", { token: pushToken });
};


