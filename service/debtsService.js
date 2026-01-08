import axios from "./axios";

/**
 * Lấy tất cả các khoản nợ/cho vay
 * @returns {Promise}
 */
export const getAllDebts = async () => {
  return axios.get("/debts");
};

/**
 * Lấy thông tin chi tiết một khoản nợ
 * @param {number} id - ID của khoản nợ
 * @returns {Promise}
 */
export const getDebtById = async (id) => {
  return axios.get(`/debts/${id}`);
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

/**
 * Người mượn xác nhận đã trả tiền
 * @param {number} debtId - ID của khoản nợ
 * @returns {Promise}
 */
export const borrowerConfirmDebt = async (debtId) => {
  return axios.put(`/debts/borrower-confirm/${debtId}`);
};

/**
 * Người cho mượn xác nhận đã nhận tiền (Hoàn tất)
 * @param {number} debtId - ID của khoản nợ
 * @returns {Promise}
 */
export const markDebtAsPaid = async (debtId) => {
  return axios.put(`/debts/mark-paid/${debtId}`);
};









