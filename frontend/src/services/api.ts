import { useAuthStore } from '@/stores/auth'

// const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
// const API_BASE =
//   window.location.hostname === 'localhost' || window.location.hostname === 'ri108619vw885.vicp.fun'
//     ? `${window.location.protocol}//${window.location.hostname}:5000/api`
//     : '/api'

// 优化方案（支持开发模式、穿透域名、生产环境）
// const API_BASE = (() => {
//   const { hostname, protocol } = window.location;
  
//   // 开发模式或穿透场景
//   if (
//     import.meta.env.DEV || 
//     hostname === 'ri108619vw885.vicp.fun' || 
//     hostname.endsWith('.ngrok.io')
//   ) {
//     return `${protocol}//${hostname}:5000/api`; 
//   }

//   // 生产环境
//   return '/api';
// })();
const API_BASE = (() => {
  const { hostname, protocol } = window.location;
  
  // 开发模式或穿透场景
  if (
    import.meta.env.DEV || 
    hostname === '127.0.0.1' || 
    hostname.endsWith('.ngrok.io')
  ) {
    return `${protocol}//${hostname}:5000/api`; 
  }

  // 生产环境
  return '/api';
})();
/**
 * 处理API响应中的非标准JSON值
 * 例如将NaN、Infinity、-Infinity替换为null或数值
 */
function sanitizeJsonString(jsonStr: string): string {
  if (!jsonStr) return jsonStr

  // 处理常见的非法JSON值
  const cleanedStr = jsonStr
    // 替换NaN值为null
    .replace(/:\s*NaN\s*([,}\]])/g, ': null$1')
    // 替换Infinity值为null
    .replace(/:\s*Infinity\s*([,}\]])/g, ': null$1')
    // 替换-Infinity值为null
    .replace(/:\s*-Infinity\s*([,}\]])/g, ': null$1')
    // 处理数组内的NaN
    .replace(/([,\[]\s*)NaN\s*([,\]\}])/g, '$1null$2')
    // 处理数组内的Infinity
    .replace(/([,\[]\s*)Infinity\s*([,\]\}])/g, '$1null$2')
    // 处理数组内的-Infinity
    .replace(/([,\[]\s*)-Infinity\s*([,\]\}])/g, '$1null$2')

  return cleanedStr
}

// 通用请求函数
export async function apiRequest(
  url: string,
  method = 'GET',
  data: any = null,
  isFormData = false,
  retryCount = 0,
) {
  console.log(`API请求开始: [${method}] ${url}`, data ? '数据:' : '', data || '')

  const authStore = useAuthStore()
  const token = authStore.token

  const headers: Record<string, string> = {}
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const options: RequestInit = {
    method,
    headers,
  }

  // 处理GET请求的查询参数
  let finalUrl = `${API_BASE}${url}`
  if (data && method === 'GET') {
    const queryParams = new URLSearchParams()
    for (const key in data) {
      if (Array.isArray(data[key])) {
        queryParams.append(key, JSON.stringify(data[key]))
      } else if (data[key] !== null && data[key] !== undefined) {
        queryParams.append(key, data[key])
      }
    }
    finalUrl += `?${queryParams.toString()}`
  } else if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    if (isFormData) {
      options.body = data
    } else {
      options.body = JSON.stringify(data)
    }
  }

  try {
    console.log(`请求API(${method}): ${finalUrl}`)
    const response = await fetch(finalUrl, options)

    // 先检查响应状态
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage
      try {
        const errorData = JSON.parse(sanitizeJsonString(errorText))
        errorMessage = errorData.message || errorData.error || `服务器错误(${response.status})`
      } catch (e) {
        errorMessage = errorText || `服务器错误(${response.status})`
      }
      throw new Error(errorMessage)
    }

    // 获取原始文本，以便在解析JSON失败时可以记录
    const responseText = await response.text()

    if (!responseText.trim()) {
      // 处理空响应
      return null
    }

    let result
    try {
      // 首先尝试简单地将文本解析为JSON
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.warn('API响应解析JSON失败，尝试修复非标准JSON值:', parseError)

      // 尝试清理并解析JSON
      try {
        const cleanedText = sanitizeJsonString(responseText)
        result = JSON.parse(cleanedText)
        console.info('成功修复并解析JSON响应')
      } catch (secondError) {
        console.error('JSON修复失败:', secondError)

        // 如果仍然失败且未达到最大重试次数，则重试请求
        const maxRetries = 2
        if (retryCount < maxRetries) {
          console.warn(`第${retryCount + 1}次重试API请求...`)
          // 延迟增加的重试
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
          return apiRequest(url, method, data, isFormData, retryCount + 1)
        }

        throw new Error(
          `API响应解析失败，响应数据不是有效的JSON格式: ${responseText.substring(0, 100)}...`,
        )
      }
    }

    console.log(
      `API请求成功: [${method}] ${url}`,
      result ? '返回数据摘要:' : '',
      result ? (typeof result === 'object' ? '对象/数组' : result) : '',
    )
    return result
  } catch (error: any) {
    console.error('API请求错误:', error)

    // 处理网络错误，如果未达到最大重试次数则重试
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch') && retryCount < 2) {
      console.warn(`网络错误，第${retryCount + 1}次重试...`)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
      return apiRequest(url, method, data, isFormData, retryCount + 1)
    }

    throw error
  }
}

// 封装常用的API方法
export const api = {
  // 认证相关
  auth: {
    login: (data: { email: string; password: string }) => apiRequest('/auth/login', 'POST', data),
    register: (data: { username: string; email: string; password: string }) =>
      apiRequest('/auth/register', 'POST', data),
  },

  // 用户健康信息相关
  user: {
    // 保存健康信息
    saveHealthInfo: (data: {
      age: number
      bmi: number
      insulin: number
      skin_thickness: number
      glucose: number
    }) => apiRequest('/user/saveinfo', 'POST', data),

    // 获取预测结果
    getPrediction: () => apiRequest('/user/predict', 'GET'),

    // 导出预测结果
    exportPrediction: () => apiRequest('/user/predict', 'GET', { export: 'true' }),

    // 提交反馈
    submitFeedback: (data: { content: string; contact?: string }) =>
      apiRequest('/user/feedback', 'POST', data),

    // 获取健康记录历史
    getHealthRecords: () => apiRequest('/user/health_records', 'GET'),

    // 获取特定记录的预测结果
    getPredictionById: (recordId: number) => apiRequest(`/user/predict/${recordId}`, 'GET'),

    // 导出特定记录的预测结果
    exportPredictionById: (recordId: number) =>
      apiRequest(`/user/predict/${recordId}`, 'GET', { export: 'true' }),

    // AI聊天服务
    aiChat: (prompt: string) => apiRequest('/user/ai_chat', 'POST', { prompt }),
  },

  // 健康方案相关
  healthPlan: {
    getPlans: () => apiRequest('/health-plans', 'GET'),
    getPlanById: (id: string) => apiRequest(`/health-plans/${id}`, 'GET'),
    createPlan: (data: any) => apiRequest('/health-plans', 'POST', data),
  },

  // AI查询相关
  ai: {
    query: (data: { message: string }) => apiRequest('/ai/query', 'POST', data),
  },

  // 管理员相关
  admin: {
    getUsers: (params: any = {}) => apiRequest('/admin/users', 'GET', params),
    addUser: (userData: any) => apiRequest('/admin/users', 'POST', userData),
    updateUser: (userId: string | number, data: any) =>
      apiRequest(`/admin/user/${userId}`, 'PUT', data),
    deleteUser: (userId: string | number) => apiRequest(`/admin/user/${userId}`, 'DELETE'),

    // 文件上传接口，使用 FormData
    uploadCsvFile: async (file: File) => {
      console.log('Attempting to upload CSV file:', file.name)
      const formData = new FormData()
      formData.append('file', file)
      // Pass true for isFormData to handle multipart/form-data
      return apiRequest('/admin/upload', 'POST', formData, true)
    },

    // 用户健康记录
    getUserHealthRecords: (userId: string | number) =>
      apiRequest(`/admin/user/${userId}/health_records`, 'GET'),

    // Dashboard统计数据
    getDashboardStats: () => apiRequest('/admin/health_analytics', 'GET'),

    // 数据清洗规则
    getCleaningRules: () => apiRequest('/admin/rules', 'GET'),
    updateCleaningRules: (rules: any) => {
      // 尝试转换数据格式，处理可能的类型问题
      const formattedRules = {
        missing_values: {
          strategy: String(rules.missing_values?.strategy || 'mean'),
          constant_value:
            rules.missing_values?.constant_value !== undefined
              ? Number(rules.missing_values.constant_value)
              : null,
          custom_values: rules.missing_values?.custom_values || {},
        },
        outliers: {
          detection: String(rules.outliers?.detection || 'zscore'),
          threshold: rules.outliers?.threshold !== undefined ? Number(rules.outliers.threshold) : 3,
          strategy: String(rules.outliers?.strategy || 'cap'),
        },
        transformations: {
          normalize: Boolean(rules.transformations?.normalize),
          columns: Array.isArray(rules.transformations?.columns)
            ? rules.transformations.columns
            : [],
        },
      }

      // 尝试不同的请求体格式
      console.log('发送规则数据:', JSON.stringify(formattedRules, null, 2))

      // 使用手动构建的请求体发送，使用POST方法            return apiRequest('/admin/rules', 'POST', formattedRules);
    },

    // 数据可视化
    getVisualizationData: (params: {
      columns: string[]
      normalize?: boolean
      exclude_outliers?: boolean
      compare_by?: string
    }) => {
      // 根据测试文件，使用POST方法，直接发送columns数组
      return apiRequest('/visualize', 'POST', { columns: params.columns })
    },

    // 数据分析 (需要确认参数如何传递)
    performDataAnalysis: (analysisData: { analysis_type: 'cluster' | 'predict'; params?: any }) =>
      apiRequest('/admin/analyse', 'POST', analysisData),

    // 下载分析结果 (需要确认参数如何传递)
    downloadAnalysisResults: (params: { type: 'cluster' | 'predict' }) =>
      apiRequest('/admin/download', 'GET', params), // Note: This likely initiates a file download, apiRequest might need adjustment for blob responses

    // 用户反馈
    getFeedbacks: (params: any = {}) => apiRequest('/admin/feedbacks', 'GET', params),
    getFeedbackById: (feedbackId: string | number) =>
      apiRequest(`/admin/feedback/${feedbackId}`, 'GET'),
    updateFeedback: (
      feedbackId: string | number,
      data: { status?: string; admin_comment?: string },
    ) => apiRequest(`/admin/feedback/${feedbackId}`, 'PUT', data),
  },
}
