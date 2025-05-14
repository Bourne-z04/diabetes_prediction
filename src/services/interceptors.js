// 设置Axios拦截器
export function setupInterceptors(axiosInstance) {
  // 请求拦截器
  axiosInstance.interceptors.request.use(
    (config) => {
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      
      // 如果token存在，则添加到请求头
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  axiosInstance.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      // 如果请求被拒绝，获取状态码
      const status = error.response ? error.response.status : null
      
      // 处理401错误（未授权）
      if (status === 401) {
        // 清除token
        localStorage.removeItem('token')
        
        // 如果不是登录页面，则重定向到登录页
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      
      // 处理404错误（资源不存在）
      if (status === 404) {
        console.error('请求的资源不存在')
      }
      
      // 处理500错误（服务器错误）
      if (status === 500) {
        console.error('服务器错误，请稍后再试')
      }
      
      return Promise.reject(error)
    }
  )
} 