<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

// 接收用户数据
const props = defineProps<{
  users: any[]
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'edit', user: any): void
  (e: 'delete', userId: number): void
}>()

// 根据角色ID获取角色名称
function getRoleName(roleId: number) {
  return roleId === 2 ? '管理员' : '普通用户'
}

// 获取角色标签类型
function getRoleBadgeClass(roleId: number) {
  return roleId === 2 ? 'bg-danger' : 'bg-primary'
}

// 判断是否有用户数据
const hasUsers = computed(() => props.users && props.users.length > 0)
</script>

<template>
  <div class="user-table">
    <div v-if="!hasUsers" class="text-center my-5">
      <i class="bi bi-people fs-1 mb-3 d-block"></i>
      <p>暂无用户数据</p>
    </div>
    
    <div v-else class="table-responsive">
      <table class="table table-hover table-dark">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">用户名</th>
            <th scope="col">邮箱</th>
            <th scope="col">角色</th>
            <th scope="col">糖尿病类型</th>
            <th scope="col">注册日期</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="getRoleBadgeClass(user.role_id)">
                {{ getRoleName(user.role_id) }}
              </span>
            </td>
            <td>{{ user.diabetes_type || '未设置' }}</td>
            <td>{{ new Date(user.created_at).toLocaleDateString('zh-CN') }}</td>
            <td>
              <div class="btn-group btn-group-sm">
                <button 
                  class="btn btn-outline-info" 
                  @click="emit('edit', user)"
                  title="编辑用户"
                >
                  <i class="bi bi-pencil-square"></i>
                </button>
                <RouterLink 
                  :to="`/admin/user/${user.id}/records`" 
                  class="btn btn-outline-primary"
                  title="查看健康记录"
                >
                  <i class="bi bi-clipboard2-pulse"></i>
                </RouterLink>
                <button 
                  class="btn btn-outline-danger" 
                  @click="emit('delete', user.id)"
                  title="删除用户"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table {
  background-color: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 5px;
  margin-bottom: 0;
}

.table thead th {
  border-top: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  font-weight: 600;
  padding: 12px 15px;
}

.table tbody td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 15px;
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.btn-group .btn {
  margin: 0 2px;
  padding: 0.25rem 0.5rem;
}

.btn-outline-info {
  color: #36b9cc;
  border-color: #36b9cc;
}

.btn-outline-info:hover {
  background-color: #36b9cc;
  color: white;
}

.btn-outline-primary {
  color: #4e73df;
  border-color: #4e73df;
}

.btn-outline-primary:hover {
  background-color: #4e73df;
  color: white;
}

.btn-outline-danger {
  color: #e74a3b;
  border-color: #e74a3b;
}

.btn-outline-danger:hover {
  background-color: #e74a3b;
  color: white;
}
</style> 