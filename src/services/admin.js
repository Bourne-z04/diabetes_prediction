import api from './auth'

/**
 * 管理员API服务
 * 提供管理员相关功能的API调用
 */

// 获取用户列表
export const getUsers = (params) => {
  return api.get('/admin/users', { params })
}

// 获取用户详情
export const getUserDetail = (userId) => {
  return api.get(`/admin/user/${userId}`)
}

// 添加用户
export const addUser = (userData) => {
  return api.post('/admin/users', userData)
}

// 更新用户
export const updateUser = (userId, userData) => {
  return api.put(`/admin/user/${userId}`, userData)
}

// 删除用户
export const deleteUser = (userId) => {
  return api.delete(`/admin/user/${userId}`)
}

// 获取用户健康记录
export const getUserHealthRecords = (userId, params) => {
  return api.get(`/admin/user/${userId}/health-records`, { params })
}

// 获取异常数据报告
export const getAbnormalData = (params) => {
  return api.get('/admin/abnormal-data', { params })
}

// 获取用户反馈
export const getUserFeedbacks = (params) => {
  return api.get('/admin/feedbacks', { params })
}

// 回复用户反馈
export const replyFeedback = (feedbackId, data) => {
  return api.post(`/admin/feedback/${feedbackId}/reply`, data)
}

// 获取系统统计数据
export const getSystemStats = () => {
  return api.get('/admin/stats')
}

export default {
  getUsers,
  getUserDetail,
  addUser,
  updateUser,
  deleteUser,
  getUserHealthRecords,
  getAbnormalData,
  getUserFeedbacks,
  replyFeedback,
  getSystemStats
} 