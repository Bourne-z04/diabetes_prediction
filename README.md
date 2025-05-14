# 健康管理系统 (Vue3)

这是一个基于Vue3开发的健康管理系统前端，提供完整的健康数据记录、分析和管理功能。

## 技术栈

- **框架**: Vue 3
- **状态管理**: Pinia
- **路由**: Vue Router
- **UI组件**: Element Plus
- **数据可视化**: ECharts
- **HTTP客户端**: Axios

## 主要功能

### 用户功能

- 用户账户管理（登录、注册）
- 个人信息管理
- 健康记录管理（血糖、体重、血压等）
- 健康数据可视化
- 健康趋势分析
- 健康建议和指南
- 用户反馈

### 管理员功能

- 用户管理
- 数据分析和统计
- 健康异常监控
- 用户反馈管理

## 接口文档

系统使用模拟API进行开发和测试。以下是可用的API接口说明：

### 认证相关接口

| 接口 | 方法 | 描述 | 参数 | 返回 |
| ---- | ---- | ---- | ---- | ---- |
| `/login` | POST | 用户登录 | `{username, password}` | `{token, user: {username, role}}` |
| `/register` | POST | 用户注册 | `{username, password, email, ...}` | `{token, message}` |
| `/user/info` | GET | 获取用户信息 | - | `{username, name, role, email, ...}` |

### 健康记录相关接口

| 接口 | 方法 | 描述 | 参数 | 返回 |
| ---- | ---- | ---- | ---- | ---- |
| `/user/health-records` | GET | 获取健康记录 | `{dateRange, page, pageSize}` | `{records: [], total}` |
| `/user/health-records/add` | POST | 添加健康记录 | `{date, time, measureType, glucose, ...}` | `{success, message, recordId}` |
| `/user/health-records/:id` | PUT | 更新健康记录 | `{date, time, measureType, glucose, ...}` | `{success, message}` |
| `/user/health-records/:id` | DELETE | 删除健康记录 | - | `{success, message}` |
| `/user/health-records/export` | GET | 导出健康数据 | `{dateRange}` | `{success, message, data: []}` |

### 健康分析相关接口

| 接口 | 方法 | 描述 | 参数 | 返回 |
| ---- | ---- | ---- | ---- | ---- |
| `/user/health-analysis` | GET | 获取健康分析数据 | - | `{healthScore, glucoseStatus, weightStatus, bpStatus, predictions, advice}` |
| `/user/health-guide` | GET | 获取健康指南 | - | `{tips, mealPlans, foodsToAvoid, medications, exercisePlan}` |

### 用户管理相关接口

| 接口 | 方法 | 描述 | 参数 | 返回 |
| ---- | ---- | ---- | ---- | ---- |
| `/user/update` | POST | 更新用户信息 | `{name, email, ...}` | `{success, message}` |
| `/user/feedback` | POST | 提交反馈 | `{type, content}` | `{success, message, feedbackId}` |

### 管理员接口

| 接口 | 方法 | 描述 | 参数 | 返回 |
| ---- | ---- | ---- | ---- | ---- |
| `/admin/users` | GET | 获取用户列表 | - | `{users: [], total}` |
| `/admin/users` | POST | 创建新用户 | `{username, role, ...}` | `{success, message, userId}` |
| `/admin/user/:id` | GET | 获取用户详情 | - | `{id, username, ..., healthData: {}}` |
| `/admin/user/:id` | PUT | 更新用户信息 | `{status, role, ...}` | `{success, message}` |
| `/admin/user/:id` | DELETE | 删除用户 | - | `{success, message}` |
| `/admin/user/:id/health-records` | GET | 获取用户健康记录 | - | `{records: [], total}` |

### 请求示例

```javascript
// 用户登录示例
axios.post('/api/login', {
  username: 'zhangsan',
  password: '123456'
})
.then(response => {
  console.log('登录成功:', response.data);
})
.catch(error => {
  console.error('登录失败:', error);
});

// 获取健康记录示例
axios.get('/api/user/health-records', {
  params: {
    dateRange: 'month',
    page: 1,
    pageSize: 10
  }
})
.then(response => {
  console.log('健康记录:', response.data);
})
.catch(error => {
  console.error('获取记录失败:', error);
});
```

## 主要优化措施

### 功能增强

- **健康分析功能**：新增多维度健康数据分析
- **趋势预测**：基于历史数据预测未来健康状况
- **健康预警**：根据数据异常进行健康风险提示
- **健康对比**：支持不同时间段健康数据对比

### 界面优化

- **响应式设计**：完全适配移动端和桌面端
- **动画效果**：增加平滑过渡和数据加载动画
- **夜间模式**：支持浅色/深色主题切换
- **空状态优化**：优化无数据状态下的用户体验

### 性能优化

- **组件懒加载**：路由和大型组件使用懒加载
- **数据缓存**：健康数据使用Pinia存储并缓存
- **代码分割**：第三方库独立打包
- **虚拟滚动**：大型列表使用虚拟滚动提高性能

### 测试覆盖

- **单元测试**：关键业务逻辑的单元测试
- **性能测试**：数据处理性能基准测试

## 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run serve

# 构建生产版本
npm run build

# 运行测试
npm run test:unit
```

## 开发指南

### 模拟数据

系统使用`mockApi.js`模拟后端API响应，可用于开发测试。目前支持以下登录凭据：

- 管理员：admin / 123456
- 普通用户：zhangsan / 123456

### 目录结构

```
src/
├── assets/           # 静态资源
├── components/       # 公共组件
├── router/           # 路由配置
├── services/         # API服务
├── stores/           # Pinia存储
└── views/            # 页面视图
    ├── admin/        # 管理员页面
    ├── auth/         # 认证页面
    └── user/         # 用户页面
```

## 性能注意事项

- 当使用图表时，确保图表实例在组件销毁时也被销毁
- 使用`v-if`而不是`v-show`来条件渲染大型组件
- 使用计算属性而不是方法来派生状态

## 协作和贡献

欢迎提交Issue和Pull Request。在提交PR前，请确保：

1. 代码符合项目风格
2. 单元测试通过
3. 文档已更新 