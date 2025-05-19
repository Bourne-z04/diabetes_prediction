import { useAuthStore } from '@/stores/auth'

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
    : '/api';

// 通用请求函数
export async function apiRequest(url: string, method = 'GET', data: any = null) {
    console.log(`API请求开始: [${method}] ${url}`, data ? '数据:' : '', data || '');
    
    const authStore = useAuthStore();
    const token = authStore.token;
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
        method,
        headers
    };

    // 处理GET请求的查询参数
    let finalUrl = `${API_BASE}${url}`;
    if (data && method === 'GET') {
        const queryParams = new URLSearchParams();
        for (const key in data) {
            if (Array.isArray(data[key])) {
                queryParams.append(key, JSON.stringify(data[key]));
            } else if (data[key] !== null && data[key] !== undefined) {
                queryParams.append(key, data[key]);
            }
        }
        finalUrl += `?${queryParams.toString()}`;
    } else if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        console.log(`请求API(${method}): ${finalUrl}`);
        const response = await fetch(finalUrl, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '请求失败');
        }
        
        console.log(`API请求成功: [${method}] ${url}`, result ? '返回数据摘要:' : '', result ? (typeof result === 'object' ? '对象/数组' : result) : '');
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 封装常用的API方法
export const api = {
    // 认证相关
    auth: {
        login: (data: { email: string; password: string }) => 
            apiRequest('/auth/login', 'POST', data),
        register: (data: { username: string; email: string; password: string }) => 
            apiRequest('/auth/register', 'POST', data),
    },
    
    // 用户健康信息相关
    user: {
        // 保存健康信息
        saveHealthInfo: (data: { 
            age: number; 
            bmi: number; 
            insulin: number; 
            skin_thickness: number; 
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
        getPredictionById: (recordId: number) => 
            apiRequest(`/user/predict/${recordId}`, 'GET'),
        
        // 导出特定记录的预测结果
        exportPredictionById: (recordId: number) => 
            apiRequest(`/user/predict/${recordId}`, 'GET', { export: 'true' }),
        
        // AI聊天服务
        aiChat: (prompt: string) => apiRequest('/user/ai_chat', 'POST', { prompt })
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
        updateUser: (userId: string, data: any) => apiRequest(`/admin/users/${userId}`, 'PUT', data),
        deleteUser: (userId: string) => apiRequest(`/admin/users/${userId}`, 'DELETE'),
    }
}; 