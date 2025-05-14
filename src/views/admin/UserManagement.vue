<template>
  <div class="user-management-page">
    <NavBar />
    
    <div class="container">
      <div class="page-header">
        <h1>用户管理</h1>
        <el-button type="primary" @click="showAddUserDialog">添加用户</el-button>
      </div>
      
      <!-- 用户列表卡片 -->
      <el-card class="user-table-card">
        <template #header>
          <div class="card-header">
            <div class="search-filter">
              <el-input
                v-model="searchQuery"
                placeholder="搜索用户名/姓名..."
                clearable
                style="width: 220px;"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              
              <el-select
                v-model="filterType"
                placeholder="用户类型"
                clearable
                style="width: 130px; margin-left: 10px;"
                @change="handleSearch"
              >
                <el-option label="全部用户" value="" />
                <el-option label="管理员" value="admin" />
                <el-option label="普通用户" value="user" />
              </el-select>
            </div>
            
            <div class="refresh-btn">
              <el-button :icon="Refresh" circle @click="fetchUsers" />
            </div>
          </div>
        </template>
        
        <el-table
          :data="filteredUsers"
          stripe
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="username" label="用户名" sortable />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="email" label="邮箱" show-overflow-tooltip />
          <el-table-column prop="phone" label="电话" />
          <el-table-column prop="createdAt" label="注册时间" sortable width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="role" label="用户类型" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.role === 'admin' ? 'danger' : 'primary'"
              >
                {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="'active'"
                :inactive-value="'inactive'"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" @click="viewUserDetail(scope.row)">查看</el-button>
              <el-button size="small" type="primary" @click="editUser(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteUser(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="totalUsers"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit" />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        
        <el-form-item label="电话" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="用户类型" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" style="width: 100%">
            <el-option label="激活" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm" :loading="submitting">
            {{ isEdit ? '保存' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="userDetailVisible"
      title="用户详情"
      width="600px"
    >
      <el-descriptions
        v-if="currentUser"
        :column="1"
        border
      >
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(currentUser.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">
          <el-tag :type="currentUser.role === 'admin' ? 'danger' : 'primary'">
            {{ currentUser.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser.status === 'active' ? 'success' : 'info'">
            {{ currentUser.status === 'active' ? '激活' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ formatDate(currentUser.lastLogin) }}</el-descriptions-item>
      </el-descriptions>
      
      <template v-if="currentUser && currentUser.healthData">
        <div class="user-health-summary">
          <h3>健康数据摘要</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="health-data-item">
                <div class="data-label">患病类型</div>
                <div class="data-value">{{ getDiseaseTypeName(currentUser.healthData.diseaseType) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="health-data-item">
                <div class="data-label">记录数量</div>
                <div class="data-value">{{ currentUser.healthData.recordCount || 0 }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="health-data-item">
                <div class="data-label">最近检测</div>
                <div class="data-value">{{ formatDate(currentUser.healthData.lastCheck) }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import api from '../../services/auth'
import NavBar from '../../components/NavBar.vue'

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 搜索和筛选
const searchQuery = ref('')
const filterType = ref('')

// 分页
const currentPage = ref(1)
const pageSize = 10
const totalUsers = ref(0)

// 对话框
const userDialogVisible = ref(false)
const userDetailVisible = ref(false)
const isEdit = ref(false)
const currentUser = ref(null)

// 表单引用
const userFormRef = ref(null)

// 用户表单
const userForm = reactive({
  username: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'user',
  status: 'active'
})

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

// 用户列表
const users = ref([])

// 过滤后的用户列表
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.username.toLowerCase().includes(query) || 
      user.name.toLowerCase().includes(query)
    )
  }
  
  // 类型过滤
  if (filterType.value) {
    result = result.filter(user => user.role === filterType.value)
  }
  
  // 更新总数
  totalUsers.value = result.length
  
  return result
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取疾病类型名称
const getDiseaseTypeName = (type) => {
  const types = {
    'diabetes': '糖尿病',
    'hypertension': '高血压',
    'heart_disease': '心脏病',
    'hyperlipidemia': '高血脂',
    'other': '其他'
  }
  return types[type] || '未知'
}

// 处理页面变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchUsers()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

// 处理状态变化
const handleStatusChange = async (user) => {
  try {
    loading.value = true
    
    // 调用API更新用户状态
    await api.put(`/admin/user/${user.id}`, { status: user.status })
    
    const statusText = user.status === 'active' ? '激活' : '禁用'
    ElMessage.success(`已${statusText}用户 ${user.username}`)
  } catch (error) {
    console.error('更新用户状态失败:', error)
    ElMessage.error('状态更新失败，请稍后重试')
    
    // 恢复原状态
    user.status = user.status === 'active' ? 'inactive' : 'active'
  } finally {
    loading.value = false
  }
}

// 显示添加用户对话框
const showAddUserDialog = () => {
  isEdit.value = false
  resetUserForm()
  userDialogVisible.value = true
}

// 重置用户表单
const resetUserForm = () => {
  Object.assign(userForm, {
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active'
  })
  
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 查看用户详情
const viewUserDetail = async (user) => {
  try {
    const loadingInstance = ElLoading.service({
      target: '.user-management-page',
      text: '加载用户详情...'
    })
    
    // 获取用户详细信息
    const response = await api.get(`/admin/user/${user.id}`)
    currentUser.value = response.data
    
    userDetailVisible.value = true
    loadingInstance.close()
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败，请稍后重试')
  }
}

// 编辑用户
const editUser = (user) => {
  isEdit.value = true
  
  // 复制用户数据到表单
  Object.assign(userForm, {
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status
  })
  
  // 清空密码字段
  userForm.password = ''
  
  // 保存当前编辑的用户ID
  userForm.id = user.id
  
  // 显示对话框
  userDialogVisible.value = true
}

// 删除用户
const deleteUser = (user) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${user.username} 吗？此操作不可恢复。`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      loading.value = true
      
      // 调用API删除用户
      await api.delete(`/admin/user/${user.id}`)
      
      // 从列表中移除
      const index = users.value.findIndex(u => u.id === user.id)
      if (index !== -1) {
        users.value.splice(index, 1)
      }
      
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 取消删除
  })
}

// 提交用户表单
const submitUserForm = () => {
  if (!userFormRef.value) return
  
  userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      
      try {
        if (isEdit.value) {
          // 更新用户
          const updateData = { ...userForm }
          delete updateData.username // 用户名不允许修改
          delete updateData.password // 密码字段为空，不更新
          
          await api.put(`/admin/user/${userForm.id}`, updateData)
          
          // 更新本地用户数据
          const index = users.value.findIndex(u => u.id === userForm.id)
          if (index !== -1) {
            users.value[index] = {
              ...users.value[index],
              name: userForm.name,
              email: userForm.email,
              phone: userForm.phone,
              role: userForm.role,
              status: userForm.status
            }
          }
          
          ElMessage.success('更新成功')
        } else {
          // 添加用户
          const response = await api.post('/admin/users', userForm)
          
          // 添加到本地用户列表
          const newUser = {
            id: response.data.userId || Date.now(),
            username: userForm.username,
            name: userForm.name,
            email: userForm.email,
            phone: userForm.phone,
            role: userForm.role,
            status: userForm.status,
            createdAt: new Date().toISOString(),
            lastLogin: null
          }
          
          users.value.push(newUser)
          ElMessage.success('添加成功')
        }
        
        userDialogVisible.value = false
      } catch (error) {
        console.error('保存用户失败:', error)
        ElMessage.error(isEdit.value ? '更新失败，请稍后重试' : '添加失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  
  try {
    // 调用API获取用户列表
    const response = await api.get('/admin/users', {
      params: {
        page: currentPage.value,
        pageSize: pageSize,
        query: searchQuery.value,
        role: filterType.value
      }
    })
    
    // 更新用户列表
    if (response.data && response.data.users) {
      users.value = response.data.users
      totalUsers.value = response.data.total || response.data.users.length
    } else {
      users.value = []
      totalUsers.value = 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error({
      message: '获取用户列表失败，请稍后重试',
      duration: 5000
    })
    users.value = []
    totalUsers.value = 0
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 24px;
  color: var(--text-color);
  margin: 0;
}

.user-table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

/* 用户健康数据样式 */
.user-health-summary {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.user-health-summary h3 {
  margin-bottom: 15px;
  color: var(--text-color);
}

.health-data-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.data-label {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 5px;
}

.data-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header h1 {
    margin-bottom: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-filter {
    margin-bottom: 10px;
    width: 100%;
  }
  
  .refresh-btn {
    margin-top: 10px;
  }
}
</style> 