/**
 * 模拟API响应模块
 * 用于开发阶段，提供模拟数据而无需实际的后端服务
 */

// 模拟延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟健康记录数据
const healthRecords = [
  {
    id: '1',
    date: '2023-11-15',
    time: '08:30',
    measureType: 'fasting',
    glucose: 6.2,
    weight: 70.5,
    bloodPressure: '120/80',
    note: '早晨空腹测量'
  },
  {
    id: '2',
    date: '2023-11-14',
    time: '18:30',
    measureType: 'postprandial',
    glucose: 7.8,
    weight: 70.5,
    bloodPressure: '125/85',
    note: '晚餐后两小时测量'
  },
  {
    id: '3',
    date: '2023-11-13',
    time: '08:00',
    measureType: 'fasting',
    glucose: 5.9,
    weight: 70.2,
    bloodPressure: '118/78',
    note: ''
  },
  {
    id: '4',
    date: '2023-11-12',
    time: '12:30',
    measureType: 'postprandial',
    glucose: 8.2,
    weight: 70.0,
    bloodPressure: '122/82',
    note: '午餐后血糖偏高'
  },
  {
    id: '5',
    date: '2023-11-11',
    time: '22:00',
    measureType: 'bedtime',
    glucose: 6.5,
    weight: 70.1,
    bloodPressure: '115/75',
    note: '睡前测量'
  }
];

// 模拟健康指南数据
const healthGuide = {
  tips: [
    {
      title: '控制碳水化合物摄入',
      content: '每餐碳水化合物摄入应控制在45-60克，避免血糖波动过大。优先选择全谷物、豆类等低升糖指数食物。'
    },
    {
      title: '规律运动',
      content: '每天至少进行30分钟中等强度有氧运动，如快走、游泳或骑自行车，有助于改善胰岛素敏感性。'
    },
    {
      title: '定时监测血糖',
      content: '每天测量空腹和餐后2小时血糖，记录数据以便医生调整治疗方案。'
    },
    {
      title: '保持水分充足',
      content: '每天饮水2000-2500毫升，有助于维持血液循环和代谢废物排出。'
    }
  ],
  mealPlans: {
    breakfast: [
      {
        items: ['全麦面包 2片', '煮鸡蛋 1个', '牛奶 200ml', '蓝莓 半杯'],
        note: '全麦面包富含膳食纤维，有助于稳定血糖'
      }
    ],
    lunch: [
      {
        items: ['糙米饭 1小碗', '清蒸鱼 1份', '炒西兰花 1份', '番茄豆腐汤 1碗'],
        note: ''
      }
    ],
    dinner: [
      {
        items: ['玉米饭 小份', '蒸鸡 100克', '蒜蓉菠菜 1份', '冬瓜汤 1碗'],
        note: '晚餐宜清淡、少量，睡前两小时完成进食'
      }
    ],
    snacks: [
      {
        items: ['核桃 5个', '酸奶（无糖） 100g'],
        note: ''
      }
    ]
  },
  foodsToAvoid: ['白米饭', '白面包', '甜点', '含糖饮料', '精制面粉', '油炸食品'],
  medications: [
    {
      name: '二甲双胍',
      dosage: '850mg，每天2次',
      time: '早餐后和晚餐后',
      note: '饭后服用可减轻胃肠道反应',
      type: 'primary'
    }
  ],
  exercisePlan: [
    {
      type: '快走/慢跑',
      frequency: '每周5次',
      duration: '每次30分钟',
      notes: '保持中等强度，能讲话但略感吃力'
    },
    {
      type: '力量训练',
      frequency: '每周2-3次',
      duration: '每次20-30分钟',
      notes: '使用小重量，注重动作规范'
    }
  ]
};

// 模拟用户列表（用于管理员页面）
const userList = [
  {
    id: 1,
    username: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    role: 'admin',
    status: 'active',
    createdAt: '2023-10-01T08:00:00',
    lastLogin: '2023-11-15T09:30:00'
  },
  {
    id: 2,
    username: 'zhangsan',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    role: 'user',
    status: 'active',
    createdAt: '2023-10-05T10:20:00',
    lastLogin: '2023-11-14T16:45:00'
  },
  {
    id: 3,
    username: 'lisi',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    role: 'user',
    status: 'active',
    createdAt: '2023-10-10T14:30:00',
    lastLogin: '2023-11-12T10:15:00'
  },
  {
    id: 4,
    username: 'wangwu',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    role: 'user',
    status: 'inactive',
    createdAt: '2023-10-15T09:10:00',
    lastLogin: '2023-10-30T11:20:00'
  }
];

// 模拟待处理反馈
const pendingFeedbacks = [
  {
    id: 1,
    date: '2023-11-15',
    username: '张三',
    type: '功能建议',
    content: '希望能增加饮食记录功能，方便追踪每日摄入的营养成分。'
  },
  {
    id: 2,
    date: '2023-11-14',
    username: '李四',
    type: '问题反馈',
    content: '在安卓手机上使用时，添加血糖记录页面偶尔会闪退。'
  }
];

// 模拟异常数据
const abnormalData = [
  {
    id: 1,
    date: '2023-11-15',
    username: '赵六',
    dataType: '血糖',
    value: '18.2 mmol/L',
    status: '异常偏高'
  },
  {
    id: 2,
    date: '2023-11-14',
    username: '钱七',
    dataType: '血压',
    value: '180/120 mmHg',
    status: '异常偏高'
  }
];

/**
 * 处理模拟API请求
 * @param {Object} config - Axios请求配置
 * @returns {Object|null} 模拟响应数据或null（表示没有模拟）
 */
const mockApi = async (config) => {
  // 添加随机延迟模拟网络延迟
  await delay(300 + Math.random() * 300);
  
  const { url, method, params, data } = config;
  
  // 去掉baseURL前缀
  const path = url.replace(/^\/api/, '');
  
  console.log(`[Mock API] ${method.toUpperCase()} ${path}`);
  
  // 模拟用户端API
  if (path.startsWith('/user/health-records')) {
    // 获取健康记录
    if (method.toLowerCase() === 'get' && !path.includes('/export')) {
      return {
        records: healthRecords,
        total: healthRecords.length
      };
    }
    
    // 添加健康记录
    if (method.toLowerCase() === 'post' && path.includes('/add')) {
      const newRecord = typeof data === 'string' ? JSON.parse(data) : data;
      newRecord.id = Date.now().toString();
      
      // 添加到记录集合头部
      healthRecords.unshift(newRecord);
      
      return {
        success: true,
        message: '添加记录成功',
        recordId: newRecord.id
      };
    }
    
    // 删除健康记录
    if (method.toLowerCase() === 'delete') {
      const recordId = path.split('/').pop();
      const index = healthRecords.findIndex(record => record.id === recordId);
      
      if (index !== -1) {
        healthRecords.splice(index, 1);
        return {
          success: true,
          message: '删除记录成功'
        };
      }
      
      return {
        success: false,
        message: '记录不存在'
      };
    }
    
    // 更新健康记录
    if (method.toLowerCase() === 'put') {
      const recordId = path.split('/').pop();
      const updateData = typeof data === 'string' ? JSON.parse(data) : data;
      const index = healthRecords.findIndex(record => record.id === recordId);
      
      if (index !== -1) {
        healthRecords[index] = { ...healthRecords[index], ...updateData };
        return {
          success: true,
          message: '更新记录成功'
        };
      }
      
      return {
        success: false,
        message: '记录不存在'
      };
    }
    
    // 导出健康数据
    if (method.toLowerCase() === 'get' && path.includes('/export')) {
      // 模拟导出功能，实际上无法产生真正的文件下载
      // 在前端实现中，可以使用返回的数据手动构建下载内容
      return {
        success: true,
        message: '导出成功',
        data: healthRecords
      };
    }
  }
  
  // 获取健康指南
  if (path === '/user/health-guide' && method.toLowerCase() === 'get') {
    return healthGuide;
  }
  
  // 更新用户信息
  if (path === '/user/update' && method.toLowerCase() === 'post') {
    return {
      success: true,
      message: '用户信息更新成功'
    };
  }
  
  // 提交反馈
  if (path === '/user/feedback' && method.toLowerCase() === 'post') {
    return {
      success: true,
      message: '反馈提交成功',
      feedbackId: Date.now().toString()
    };
  }
  
  // 模拟管理员API
  
  // 获取用户列表
  if (path === '/admin/users' && method.toLowerCase() === 'get') {
    return {
      users: userList,
      total: userList.length
    };
  }
  
  // 获取用户详情
  if (path.match(/^\/admin\/user\/\d+$/) && method.toLowerCase() === 'get') {
    const userId = parseInt(path.split('/').pop());
    const user = userList.find(u => u.id === userId);
    
    if (user) {
      return {
        ...user,
        healthData: {
          diseaseType: 'diabetes',
          recordCount: 28,
          lastCheck: '2023-11-13T08:30:00'
        }
      };
    }
    
    return null; // 找不到用户返回null，将导致404错误
  }
  
  // 更新用户信息
  if (path.match(/^\/admin\/user\/\d+$/) && method.toLowerCase() === 'put') {
    const userId = parseInt(path.split('/').pop());
    const updateData = typeof data === 'string' ? JSON.parse(data) : data;
    const index = userList.findIndex(user => user.id === userId);
    
    if (index !== -1) {
      userList[index] = { ...userList[index], ...updateData };
      return {
        success: true,
        message: '用户信息更新成功'
      };
    }
    
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  // 删除用户
  if (path.match(/^\/admin\/user\/\d+$/) && method.toLowerCase() === 'delete') {
    const userId = parseInt(path.split('/').pop());
    const index = userList.findIndex(user => user.id === userId);
    
    if (index !== -1) {
      userList.splice(index, 1);
      return {
        success: true,
        message: '用户删除成功'
      };
    }
    
    return {
      success: false,
      message: '用户不存在'
    };
  }
  
  // 创建新用户
  if (path === '/admin/users' && method.toLowerCase() === 'post') {
    const newUser = typeof data === 'string' ? JSON.parse(data) : data;
    newUser.id = userList.length > 0 ? Math.max(...userList.map(u => u.id)) + 1 : 1;
    newUser.createdAt = new Date().toISOString();
    newUser.lastLogin = null;
    
    userList.push(newUser);
    
    return {
      success: true,
      message: '用户创建成功',
      userId: newUser.id
    };
  }
  
  // 获取用户健康记录
  if (path.match(/^\/admin\/user\/\d+\/health-records$/) && method.toLowerCase() === 'get') {
    return {
      records: healthRecords,
      total: healthRecords.length
    };
  }
  
  // 模拟登录
  if (path === '/login' && method.toLowerCase() === 'post') {
    // 解析请求数据
    const requestData = typeof data === 'string' ? JSON.parse(data) : data;
    
    // 模拟登录成功
    return {
      token: `mock-token-${Date.now()}`,
      user: {
        username: requestData.username,
        role: requestData.username === 'admin' ? 'admin' : 'user'
      }
    };
  }
  
  // 模拟注册
  if (path === '/register' && method.toLowerCase() === 'post') {
    return {
      token: `mock-token-${Date.now()}`,
      message: '注册成功'
    };
  }
  
  // 模拟获取用户信息
  if (path === '/user/info' && method.toLowerCase() === 'get') {
    // 这里通常会基于token返回匹配的用户信息
    // 出于演示目的，我们返回一个模拟用户
    return {
      username: 'demo_user',
      name: '演示用户',
      role: 'user',
      email: 'demo@example.com',
      gender: 'male',
      age: 35,
      diseaseType: 'diabetes',
      exerciseLevel: 'medium'
    };
  }
  
  // 添加健康分析相关接口
  if (path === '/user/health-analysis') {
    // 获取健康分析数据
    return {
      healthScore: 85,
      glucoseStatus: {
        status: 'normal',
        description: '血糖在正常范围',
        risk: 'low'
      },
      weightStatus: {
        status: 'normal',
        description: '体重在正常范围',
        risk: 'low'
      },
      bpStatus: {
        status: 'normal',
        description: '血压在正常范围',
        risk: 'low'
      },
      predictions: [
        { date: '2023-11-20', value: 5.6 },
        { date: '2023-11-21', value: 5.7 },
        { date: '2023-11-22', value: 5.8 },
        { date: '2023-11-23', value: 5.9 },
        { date: '2023-11-24', value: 6.0 },
        { date: '2023-11-25', value: 6.1 },
        { date: '2023-11-26', value: 6.2 }
      ],
      advice: [
        '保持适量运动，每天至少30分钟中等强度活动',
        '控制碳水化合物摄入，避免高糖食物',
        '多喝水，保持水分充足',
        '按时服药，定时监测血糖'
      ]
    };
  }
  
  // 如果没有找到匹配的模拟API，则返回null，表示应该使用真实API
  return null;
};

export default mockApi; 