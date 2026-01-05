import axios from "./axios";

/**
 * Lấy tất cả chi phí
 * @returns {Promise}
 */
export const getAllExpenses = async () => {
  return axios.get("/expenses");
};

/**
 * Lấy chi phí theo ID
 * @param {number} id - ID của chi phí
 * @returns {Promise}
 */
export const getExpenseById = async (id) => {
  return axios.get(`/expenses/${id}`);
};

/**
 * Tạo chi phí mới
 * @param {Object} expenseData - { category_id, amount, description, date }
 * @returns {Promise}
 */
export const createExpense = async (expenseData) => {
  return axios.post("/expenses", expenseData);
};

/**
 * Cập nhật chi phí
 * @param {number} id - ID của chi phí
 * @param {Object} expenseData - Dữ liệu cập nhật
 * @returns {Promise}
 */
export const updateExpense = async (id, expenseData) => {
  return axios.put(`/expenses/${id}`, expenseData);
};

/**
 * Xóa chi phí
 * @param {number} id - ID của chi phí
 * @returns {Promise}
 */
export const deleteExpense = async (id) => {
  return axios.delete(`/expenses/${id}`);
};


