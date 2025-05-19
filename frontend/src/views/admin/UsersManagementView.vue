<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useRouter } from 'vue-router'
import AdminUserTable from '@/components/admin/AdminUserTable.vue'
import AdminUserModal from '@/components/admin/AdminUserModal.vue'

// 获取数据存储和路由
const dataStore = useDataStore()
const router = useRouter()

// 用户数据
const loading = ref(false)
const error = ref<string | null>(null)

// 分页参数
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  perPage: 10
})

// 过滤和排序
const filters = ref({
  search: '',
  role: '',
  status: ''
})

// 模态框控制
const userModalVisible = ref(false)
const currentUser = ref<any>(null)
const modalMode = ref<'add' | 'edit'>('add')

// 从store获取过滤后的用户
const filteredUsers = computed(() => {
  if (!dataStore.isDataUploaded) return []
  
  let result = [...dataStore.users]
  
  // 应用搜索过滤
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(user => 
      user.name.toLowerCase().includes(searchTerm) || 
      user.email.toLowerCase().includes(searchTerm)
    )
  }
  
  // 应用角色过滤
  if (filters.value.role) {
    result = result.filter(user => user.role === filters.value.role)
  }
  
  // 应用状态过滤
  if (filters.value.status) {
    result = result.filter(user => user.status === filters.value.status)
  }
  
  // 计算总页数
  pagination.value.totalItems = result.length
  pagination.value.totalPages = Math.ceil(result.length / pagination.value.perPage)
  
  // 应用分页
  const start = (pagination.value.currentPage - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  
  return result.slice(start, end)
})

// 打开添加用户模态框
function openAddUserModal() {
  currentUser.value = {
    id: dataStore.users.length + 1,
    name: '',
    email: '',
    role: '用户',
    status: '激活',
    joinDate: new Date().toISOString().split('T')[0],
    dataCount: 0,
    lastLogin: null
  }
  modalMode.value = 'add'
  userModalVisible.value = true
}

// 打开编辑用户模态框
function openEditUserModal(user: any) {
  currentUser.value = {...user}
  modalMode.value = 'edit'
  userModalVisible.value = true
}

// 保存用户（添加或编辑）
function saveUser(userData: any) {
  try {
    if (modalMode.value === 'add') {
      // 添加用户到存储
      dataStore.users.push(userData)
    } else {
      // 更新存储中的用户
      const index = dataStore.users.findIndex(u => u.id === userData.id)
      if (index !== -1) {
        dataStore.users[index] = userData
      }
    }
    
    userModalVisible.value = false
    
    // 显示成功消息
    const message = modalMode.value === 'add' ? '用户添加成功' : '用户更新成功'
    const event = new CustomEvent('app-message', { 
      detail: { message, type: 'success' } 
    })
    document.dispatchEvent(event)
  } catch (err: any) {
    console.error('保存用户失败:', err)
    // 显示错误消息
    const event = new CustomEvent('app-message', { 
      detail: { message: err.message || '操作失败', type: 'error' } 
    })
    document.dispatchEvent(event)
  }
}

// 删除用户
function deleteUser(userId: number) {
  if (!confirm('确定要删除此用户吗？此操作不可恢复。')) {
    return
  }
  
  try {
    // 从存储中删除用户
    const index = dataStore.users.findIndex(u => u.id === userId)
    if (index !== -1) {
      dataStore.users.splice(index, 1)
    }
    
    // 显示成功消息
    const event = new CustomEvent('app-message', { 
      detail: { message: '用户已删除', type: 'success' } 
    })
    document.dispatchEvent(event)
  } catch (err: any) {
    console.error('删除用户失败:', err)
    // 显示错误消息
    const event = new CustomEvent('app-message', { 
      detail: { message: err.message || '删除失败', type: 'error' } 
    })
    document.dispatchEvent(event)
  }
}

// 应用筛选器
function applyFilters() {
  pagination.value.currentPage = 1 // 重置到第一页
}

// 重置筛选器
function resetFilters() {
  filters.value = {
    search: '',
    role: '',
    status: ''
  }
  pagination.value.currentPage = 1
}

// 更改页码
function changePage(page: number) {
  pagination.value.currentPage = page
}

// 跳转到数据上传页面
function navigateToUpload() {
  router.push('/admin/data-upload')
}

// 监听筛选器变化，自动应用筛选
watch(filters, () => {
  applyFilters()
}, { deep: true })
</script>

<template>
  <div class="user-management container py-4 text-white">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>用户管理</h1>
      <button class="btn btn-success" @click="openAddUserModal" :disabled="!dataStore.isDataUploaded">
        <i class="bi bi-plus-circle me-1"></i> 添加用户
      </button>
    </div>
    
    <!-- 未上传数据提示 -->
    <div v-if="!dataStore.isDataUploaded" class="no-data-container">
      <div class="card bg-dark border-0 shadow p-5 text-center">
        <div class="no-data-icon mb-4">
          <i class="bi bi-people-fill"></i>
        </div>
        <h3 class="mb-3">暂无用户数据</h3>
        <p class="text-muted mb-4">您尚未上传任何糖尿病健康数据。需要先上传CSV数据文件才能生成用户数据并进行管理。</p>
        <div class="d-grid gap-2 col-md-6 mx-auto">
          <button class="btn btn-primary" @click="navigateToUpload">
            <i class="bi bi-cloud-upload me-2"></i> 上传数据文件
          </button>
        </div>
      </div>
    </div>
    
    <div v-else>
      <!-- 过滤器 -->
      <div class="card bg-dark border-0 shadow mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="form-floating">
                <input 
                  type="text" 
                  class="form-control bg-dark text-white" 
                  id="searchInput" 
                  v-model="filters.search" 
                  placeholder="搜索用户名或邮箱"
                >
                <label for="searchInput">搜索用户名或邮箱</label>
              </div>
            </div>
            
            <div class="col-md-3">
              <div class="form-floating">
                <select class="form-select bg-dark text-white" id="roleFilter" v-model="filters.role">
                  <option value="">所有角色</option>
                  <option value="管理员">管理员</option>
                  <option value="用户">用户</option>
                </select>
                <label for="roleFilter">用户角色</label>
              </div>
            </div>
            
            <div class="col-md-3">
              <div class="form-floating">
                <select class="form-select bg-dark text-white" id="statusFilter" v-model="filters.status">
                  <option value="">所有状态</option>
                  <option value="激活">激活</option>
                  <option value="未激活">未激活</option>
                </select>
                <label for="statusFilter">账户状态</label>
              </div>
            </div>
            
            <div class="col-md-2 d-flex align-items-center">
              <button class="btn btn-outline-secondary" @click="resetFilters">
                <i class="bi bi-x-circle me-1"></i> 重置
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载用户数据...</p>
      </div>
      
      <!-- 错误信息 -->
      <div v-else-if="error" class="alert alert-danger my-4">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
      </div>
      
      <!-- 用户表格 -->
      <AdminUserTable 
        v-else
        :users="filteredUsers" 
        @edit="openEditUserModal" 
        @delete="deleteUser"
      />
      
      <!-- 分页控件 -->
      <div v-if="!loading && !error && pagination.totalPages > 1" class="d-flex justify-content-center mt-4">
        <nav aria-label="用户数据分页">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(pagination.currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </a>
            </li>
            
            <li 
              v-for="page in pagination.totalPages" 
              :key="page" 
              class="page-item"
              :class="{ active: page === pagination.currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            
            <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(pagination.currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    
    <!-- 用户添加/编辑模态框 -->
    <AdminUserModal
      v-if="userModalVisible"
      :user="currentUser"
      :mode="modalMode"
      @close="userModalVisible = false"
      @save="saveUser"
    />
  </div>
</template>

<style scoped>
.user-management {
  min-height: calc(100vh - 180px);
}

/* 自定义表单样式 */
.form-control, .form-select {
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.form-control:focus, .form-select:focus {
  border-color: #4e73df;
  box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
}

.form-floating > label {
  color: rgba(255, 255, 255, 0.6);
}

/* 分页样式 */
.pagination .page-link {
  background-color: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.pagination .page-item.active .page-link {
  background-color: #4e73df;
  border-color: #4e73df;
}

.pagination .page-item.disabled .page-link {
  background-color: rgba(30, 41, 59, 0.5);
  color: rgba(255, 255, 255, 0.4);
}

.no-data-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.no-data-icon {
  font-size: 5rem;
  color: rgba(78, 115, 223, 0.5);
}
</style> 