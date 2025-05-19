<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// 检查用户是否为管理员
if (!authStore.isAdmin) {
  router.push('/')
}

const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 用户列表数据
const users = ref([
  {
    id: 1,
    username: '张三',
    email: 'zhangsan@example.com',
    role_id: 1,
    diabetes_type: '2',
    activity_level: 'low',
    created_at: '2023-10-15T08:30:00',
    updated_at: '2023-11-18T15:45:30'
  },
  {
    id: 2,
    username: '李四',
    email: 'lisi@example.com',
    role_id: 1,
    diabetes_type: '1',
    activity_level: 'moderate',
    created_at: '2023-10-16T10:20:00',
    updated_at: '2023-11-17T09:12:45'
  },
  {
    id: 3,
    username: '王五',
    email: 'wangwu@example.com',
    role_id: 1,
    diabetes_type: '2',
    activity_level: 'high',
    created_at: '2023-10-18T14:50:00',
    updated_at: '2023-11-19T11:30:20'
  },
  {
    id: 4,
    username: '管理员',
    email: 'admin@example.com',
    role_id: 2,
    diabetes_type: 'none',
    activity_level: 'moderate',
    created_at: '2023-10-01T00:00:00',
    updated_at: '2023-11-20T08:00:00'
  },
  {
    id: 5,
    username: '赵六',
    email: 'zhaoliu@example.com',
    role_id: 1,
    diabetes_type: 'prediabetes',
    activity_level: 'low',
    created_at: '2023-10-25T16:40:00',
    updated_at: '2023-11-15T13:25:10'
  }
])

// 编辑用户表单
const editUserForm = reactive({
  id: 0,
  username: '',
  email: '',
  role_id: 1,
  diabetes_type: '',
  activity_level: ''
})

// 编辑模态框状态
const showEditModal = ref(false)

// 过滤后的用户
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// 分页后的用户
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => 
  Math.ceil(filteredUsers.value.length / pageSize.value)
)

// 页码范围
const pageRange = computed(() => {
  const range = []
  for (let i = 1; i <= totalPages.value; i++) {
    range.push(i)
  }
  return range
})

// 加载用户数据
onMounted(async () => {
  await loadUsers()
})

// 模拟从API加载用户数据
async function loadUsers() {
  loading.value = true
  
  try {
    // 在实际应用中，应该调用API获取用户列表
    // const response = await api.admin.getUsers()
    // users.value = response.users
    
    // 这里我们已经有了模拟数据，所以简单等待一下就好
    await new Promise(resolve => setTimeout(resolve, 800))
    
  } catch (err: any) {
    error.value = err.message || '加载用户数据失败'
  } finally {
    loading.value = false
  }
}

// 打开编辑用户模态框
function openEditModal(user: any) {
  editUserForm.id = user.id
  editUserForm.username = user.username
  editUserForm.email = user.email
  editUserForm.role_id = user.role_id
  editUserForm.diabetes_type = user.diabetes_type
  editUserForm.activity_level = user.activity_level
  
  showEditModal.value = true
}

// 提交用户编辑
async function handleSubmitEdit() {
  loading.value = true
  
  try {
    // 在实际应用中，应该调用API更新用户
    // await api.admin.updateUser(editUserForm.id.toString(), editUserForm)
    
    // 这里我们模拟一下更新
    const index = users.value.findIndex(user => user.id === editUserForm.id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        ...editUserForm,
        updated_at: new Date().toISOString()
      }
    }
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // 关闭模态框
    showEditModal.value = false
  } catch (err: any) {
    error.value = err.message || '更新用户失败'
  } finally {
    loading.value = false
  }
}

// 删除用户
async function handleDeleteUser(userId: number) {
  if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) {
    return
  }
  
  loading.value = true
  
  try {
    // 在实际应用中，应该调用API删除用户
    // await api.admin.deleteUser(userId.toString())
    
    // 这里我们模拟删除
    users.value = users.value.filter(user => user.id !== userId)
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 600))
  } catch (err: any) {
    error.value = err.message || '删除用户失败'
  } finally {
    loading.value = false
  }
}

// 翻页
function changePage(page: number) {
  currentPage.value = page
}
</script>

<template>
  <div class="admin-users">
    <div class="container py-4">
      <h1 class="mb-4">用户管理</h1>
      
      <div v-if="loading && !showEditModal" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">加载数据中...</p>
      </div>
      
      <div v-else-if="error" class="alert alert-danger my-4">
        {{ error }}
      </div>
      
      <template v-else>
        <!-- 工具栏 -->
        <div class="card mb-4">
          <div class="card-body p-3">
            <div class="row align-items-center">
              <div class="col-md-6 mb-3 mb-md-0">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="搜索用户..." 
                    v-model="searchQuery"
                  >
                  <button class="btn btn-primary" type="button">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-6 text-md-end">
                <button class="btn btn-success me-2" @click="loadUsers">
                  <i class="fas fa-sync-alt me-1"></i> 刷新
                </button>
                <button class="btn btn-primary">
                  <i class="fas fa-user-plus me-1"></i> 添加用户
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 用户列表 -->
        <div class="card">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-striped table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>邮箱</th>
                    <th>角色</th>
                    <th>注册时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in paginatedUsers" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span class="badge rounded-pill" :class="user.role_id === 2 ? 'bg-danger' : 'bg-primary'">
                        {{ user.role_id === 2 ? '管理员' : '用户' }}
                      </span>
                    </td>
                    <td>{{ new Date(user.created_at).toLocaleString() }}</td>
                    <td>
                      <button class="btn btn-sm btn-primary me-1" @click="openEditModal(user)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" @click="handleDeleteUser(user.id)" :disabled="user.id === 4">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="paginatedUsers.length === 0">
                    <td colspan="6" class="text-center py-3">
                      没有找到符合条件的用户
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 分页 -->
          <div class="card-footer d-flex justify-content-between align-items-center" v-if="filteredUsers.length > 0">
            <div>
              显示 {{ (currentPage - 1) * pageSize + 1 }} 到 
              {{ Math.min(currentPage * pageSize, filteredUsers.length) }} 
              条，共 {{ filteredUsers.length }} 条
            </div>
            <nav>
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">上一页</a>
                </li>
                <li 
                  v-for="page in pageRange" 
                  :key="page" 
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">下一页</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 编辑用户模态框 -->
    <div class="modal fade" id="editUserModal" tabindex="-1" data-bs-backdrop="static" 
      data-bs-keyboard="false" :class="{ show: showEditModal }" :style="{ display: showEditModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">编辑用户</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmitEdit">
              <div class="mb-3">
                <label for="edit-username" class="form-label">用户名</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="edit-username" 
                  v-model="editUserForm.username" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="edit-email" class="form-label">电子邮箱</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="edit-email" 
                  v-model="editUserForm.email" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="edit-role" class="form-label">角色</label>
                <select 
                  class="form-select" 
                  id="edit-role" 
                  v-model="editUserForm.role_id"
                >
                  <option value="1">用户</option>
                  <option value="2">管理员</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="edit-diabetes" class="form-label">糖尿病类型</label>
                <select 
                  class="form-select" 
                  id="edit-diabetes" 
                  v-model="editUserForm.diabetes_type"
                >
                  <option value="1">I型糖尿病</option>
                  <option value="2">II型糖尿病</option>
                  <option value="gestational">妊娠糖尿病</option>
                  <option value="prediabetes">糖尿病前期</option>
                  <option value="none">无糖尿病</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="edit-activity" class="form-label">活动水平</label>
                <select 
                  class="form-select" 
                  id="edit-activity" 
                  v-model="editUserForm.activity_level"
                >
                  <option value="sedentary">久坐生活方式</option>
                  <option value="low">低度活动</option>
                  <option value="moderate">中度活动</option>
                  <option value="high">高度活动</option>
                  <option value="extreme">极高活动量</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showEditModal = false">取消</button>
            <button type="button" class="btn btn-primary" @click="handleSubmitEdit" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: showEditModal }" :style="{ display: showEditModal ? 'block' : 'none' }"></div>
  </div>
</template>

<style scoped>
.admin-users {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 2rem;
}

.modal.show {
  display: block;
}

.modal-backdrop.show {
  opacity: 0.5;
}

.table th, .table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.375rem 0.75rem;
}

.page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}
</style> 