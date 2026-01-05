import axios from "./axios";

/**
 * Tạo nhóm mới
 * @param {Object} groupData - { name, members: number[] }
 * @returns {Promise}
 */
export const createNewGroup = async (groupData) => {
  return axios.post("/groups/create-new-group", groupData);
};

/**
 * Lấy danh sách nhóm của người dùng
 * @returns {Promise}
 */
export const getMyGroups = async () => {
  return axios.get("/groups/my-groups");
};

/**
 * Lấy danh sách thành viên nhóm
 * @param {number} groupId - ID của nhóm
 * @returns {Promise}
 */
export const getGroupMembers = async (groupId) => {
  return axios.get(`/groups/${groupId}/members`);
};

/**
 * Thêm thành viên vào nhóm
 * @param {number} groupId - ID của nhóm
 * @param {Object} data - { members: number[] }
 * @returns {Promise}
 */
export const addMemberToGroup = async (groupId, data) => {
  return axios.post(`/groups/add-member/${groupId}`, data);
};

/**
 * Tạo khoản chi cho nhóm
 * @param {number} groupId - ID của nhóm
 * @param {Object} expenseData - { totalAmount, due_date, remind_before?, description?, exceptMembers?: number[] }
 * @returns {Promise}
 */
export const createGroupExpense = async (groupId, expenseData) => {
  return axios.post(`/groups/${groupId}/create-expense`, expenseData);
};

/**
 * Rời khỏi nhóm
 * @param {number} groupId - ID của nhóm
 * @returns {Promise}
 */
export const leaveGroup = async (groupId) => {
  return axios.delete(`/groups/leave-group/${groupId}`);
};

/**
 * Lấy lịch sử chi tiêu nhóm
 * @param {number} groupId - ID của nhóm
 * @returns {Promise}
 */
export const getGroupHistoryExpenses = async (groupId) => {
  return axios.get(`/groups/${groupId}/history-expenses`);
};



