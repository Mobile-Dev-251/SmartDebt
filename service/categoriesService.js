import axios from "./axios";

/**
 * Lấy tất cả danh mục
 * @returns {Promise}
 */
export const getAllCategories = async () => {
  return axios.get("/categories");
};

/**
 * Lấy danh mục theo ID
 * @param {number} id - ID của danh mục
 * @returns {Promise}
 */
export const getCategoryById = async (id) => {
  return axios.get(`/categories/${id}`);
};

/**
 * Tạo danh mục mới
 * @param {Object} categoryData - { name }
 * @returns {Promise}
 */
export const createCategory = async (categoryData) => {
  return axios.post("/categories", categoryData);
};

/**
 * Cập nhật danh mục
 * @param {number} id - ID của danh mục
 * @param {Object} categoryData - { name }
 * @returns {Promise}
 */
export const updateCategory = async (id, categoryData) => {
  return axios.put(`/categories/${id}`, categoryData);
};

/**
 * Xóa danh mục
 * @param {number} id - ID của danh mục
 * @returns {Promise}
 */
export const deleteCategory = async (id) => {
  return axios.delete(`/categories/${id}`);
};


