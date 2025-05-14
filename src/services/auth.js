import axios from 'axios'
import { setupInterceptors } from './interceptors'
import mockApi from './mockApi'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 设置拦截器
setupInterceptors(api)

// 添加请求拦截器以启用模拟API
api.interceptors.request.use(
  async (config) => {
    try {
      // 检查是否为开发环境（可根据实际需要调整判断条件）
      const isDevelopment = process.env.NODE_ENV === 'development' || true;
      
      if (isDevelopment) {
        // 尝试获取模拟响应
        const mockResponse = await mockApi(config);
        
        if (mockResponse) {
          // 如果存在模拟响应，取消真实请求
          const source = axios.CancelToken.source();
          config.cancelToken = source.token;
          source.cancel('Mock API响应');
          
          // 为了让请求流程继续，我们返回一个包含错误的配置
          // 这个错误会被响应拦截器捕获，然后使用我们的模拟数据
          config._mockResponse = mockResponse;
        }
      }
      
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器以处理模拟响应
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 检查错误是否由模拟API取消
    if (axios.isCancel(error) && error.message === 'Mock API响应') {
      // 从请求配置中获取模拟响应
      const mockResponse = error.config._mockResponse;
      
      // 返回模拟响应
      return Promise.resolve({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

// 登录接口
export const login = (credentials) => {
  return api.post('/login', credentials)
}

// 注册接口
export const register = (userData) => {
  return api.post('/register', userData)
}

// 获取用户信息
export const getUserInfo = () => {
  return api.get('/user/info')
}

export default api 