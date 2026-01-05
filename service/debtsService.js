import axios from "./axios";

/**
 * Lấy tất cả các khoản nợ/cho vay
 * @returns {Promise}
 */
export const getAllDebts = async () => {
  return axios.get("/debts");
};

/**
 * Tạo khoản nợ mới
 * @param {Object} debtData - { borrower_id, type?, title?, amount, due_date, remind_before?, note?, isSaved? }
 * @returns {Promise}
 */
export const createDebt = async (debtData) => {
  return axios.post("/debts", debtData);
};

/**
 * Cập nhật khoản nợ
 * @param {number} id - ID của khoản nợ
 * @param {Object} debtData - Dữ liệu cập nhật
 * @returns {Promise}
 */
export const updateDebt = async (id, debtData) => {
  return axios.put(`/debts/${id}`, debtData);
};

/**
 * Xóa khoản nợ
 * @param {number} id - ID của khoản nợ
 * @returns {Promise}
 */
export const deleteDebt = async (id) => {
  return axios.delete(`/debts/${id}`);
};



