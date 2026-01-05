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

