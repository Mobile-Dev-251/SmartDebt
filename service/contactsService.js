import axios from "./axios";

/**
 * Lấy danh sách liên hệ
 * @returns {Promise}
 */
export const getAllContacts = async () => {
  return axios.get("/contacts");
};

/**
 * Xóa liên hệ
 * @param {number} deleteId - ID của liên hệ cần xóa
 * @returns {Promise}
 */
export const deleteContact = async (deleteId) => {
  return axios.delete(`/contacts/${deleteId}`);
};

/**
 * Tạo liên hệ mới
 * @param {Object} contactData - { name, phone }
 * @returns {Promise}
 */
export const createContact = async (contactData) => {
  return axios.post("/contacts", contactData);
};

/**
 * Tìm kiếm user theo số điện thoại
 * @param {string} phone - Số điện thoại
 * @returns {Promise}
 */
export const findUserByPhone = async (phone) => {
  return axios.get("/users/search", { params: { phone } });
};

/**
 * Tạo liên hệ mới bằng số điện thoại
 * @param {Object} data - { phone, name }
 * @returns {Promise}
 */
export const createContactByPhone = async (data) => {
  return axios.post("/contacts/create-by-phone", data);
};
