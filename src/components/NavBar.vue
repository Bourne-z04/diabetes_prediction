<template>
  <header class="navbar">
    <div class="navbar-logo">
      <router-link to="/">
        <img src="../assets/logo.png" alt="健康管理系统" class="logo" />
        <span class="logo-text">健康管理系统</span>
      </router-link>
    </div>
    
    <div class="navbar-menu">
      <!-- 用户导航 -->
      <template v-if="userStore.isLoggedIn && !userStore.isAdmin">
        <router-link to="/user/dashboard" class="menu-item" active-class="active">首页</router-link>
        <router-link to="/user/health-records" class="menu-item" active-class="active">健康记录</router-link>
        <router-link to="/user/health-guide" class="menu-item" active-class="active">健康指南</router-link>
        <router-link to="/user/analysis" class="menu-item" active-class="active">健康分析</router-link>
      </template>
      
      <!-- 管理员导航 -->
      <template v-if="userStore.isLoggedIn && userStore.isAdmin">
        <router-link to="/admin/dashboard" class="menu-item" active-class="active">首页</router-link>
        <router-link to="/admin/user-management" class="menu-item" active-class="active">用户管理</router-link>
        <router-link to="/admin/data-analysis" class="menu-item" active-class="active">数据分析</router-link>
        <router-link to="/admin/feedback" class="menu-item" active-class="active">用户反馈</router-link>
      </template>
    </div>
    
    <div class="navbar-actions">
      <!-- 主题切换 -->
      <el-tooltip :content="isDarkMode ? '切换到亮色模式' : '切换到暗色模式'" placement="bottom">
        <div class="theme-toggle" @click="toggleTheme">
          <el-icon v-if="isDarkMode"><Sunny /></el-icon>
          <el-icon v-else><Moon /></el-icon>
        </div>
      </el-tooltip>
      
      <!-- 未登录显示登录按钮 -->
      <template v-if="!userStore.isLoggedIn">
        <el-button size="small" @click="$router.push('/login')">登录</el-button>
        <el-button size="small" type="primary" @click="$router.push('/register')">注册</el-button>
      </template>
      
      <!-- 已登录显示用户下拉菜单 -->
      <el-dropdown v-else trigger="click" @command="handleCommand">
        <div class="user-profile">
          <div class="avatar-wrapper" @click.stop="showAvatarUpload">
            <el-avatar :size="36" :src="avatarUrl">
              {{ userStore.username ? userStore.username.substring(0, 1).toUpperCase() : 'U' }}
            </el-avatar>
            <div class="avatar-upload-icon"><el-icon><Upload /></el-icon></div>
          </div>
          <span class="username">{{ userStore.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>个人信息
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>账号设置
            </el-dropdown-item>
            <el-dropdown-item command="feedback">
              <el-icon><ChatLineRound /></el-icon>意见反馈
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 头像上传对话框 -->
    <el-dialog v-model="avatarDialogVisible" title="更新头像" width="400px">
      <div class="avatar-upload-container">
        <el-upload
          class="avatar-uploader"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleAvatarChange"
        >
          <div class="avatar-preview">
            <img v-if="avatarPreview" :src="avatarPreview" class="avatar-image" />
            <el-icon v-else class="avatar-icon"><Plus /></el-icon>
          </div>
          <div class="upload-text">点击选择图片或拖拽图片到此处</div>
        </el-upload>
        <div class="avatar-tip">支持jpg、png格式，文件大小不超过2MB</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="avatarDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadAvatar" :loading="uploading">确认上传</el-button>
        </div>
      </template>
    </el-dialog>
  </header>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { 
  User, Setting, SwitchButton, ChatLineRound, 
  ArrowDown, Upload, Plus, Moon, Sunny 
} from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 用户存储
const userStore = useUserStore()

// 获取全局主题设置
const isDarkMode = inject('isDarkMode')
const toggleDarkMode = inject('toggleDarkMode')

// 头像上传
const avatarDialogVisible = ref(false)
const avatarPreview = ref('')
const avatarFile = ref(null)
const uploading = ref(false)

// 头像URL
const avatarUrl = computed(() => {
  return userStore.userInfo.avatar || ''
})

// 切换主题
const toggleTheme = () => {
  toggleDarkMode()
}

// 显示头像上传对话框
const showAvatarUpload = (e) => {
  e.stopPropagation()
  avatarDialogVisible.value = true
  avatarPreview.value = avatarUrl.value
}

// 处理头像变更
const handleAvatarChange = (file) => {
  // 验证文件类型
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  // 验证文件大小
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('头像只能是JPG或PNG格式!')
    return
  }
  
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过2MB!')
    return
  }
  
  // 保存文件
  avatarFile.value = file.raw
  
  // 显示预览
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 上传头像
const uploadAvatar = async () => {
  if (!avatarFile.value) {
    ElMessage.warning('请先选择图片')
    return
  }
  
  try {
    uploading.value = true
    
    // 实际项目中应该将文件上传到服务器
    // 这里模拟上传过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟更新用户信息
    userStore.updateUserData({
      avatar: avatarPreview.value
    })
    
    ElMessage.success('头像更新成功')
    avatarDialogVisible.value = false
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error('上传失败，请稍后重试')
  } finally {
    uploading.value = false
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'settings':
      router.push('/user/settings')
      break
    case 'feedback':
      router.push('/user/feedback')
      break
    case 'logout':
      confirmLogout()
      break
  }
}

// 确认退出登录
const confirmLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '退出登录',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {
    // 取消退出
  })
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;
  background-color: var(--bg-color-overlay);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.navbar-logo {
  display: flex;
  align-items: center;
}

.navbar-logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
}

.logo {
  height: 32px;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  gap: 8px;
}

.menu-item {
  padding: 0 16px;
  height: 60px;
  display: flex;
  align-items: center;
  color: var(--text-color);
  text-decoration: none;
  font-size: 15px;
  position: relative;
  transition: all 0.3s;
}

.menu-item:hover {
  color: var(--primary-color);
}

.menu-item.active {
  color: var(--primary-color);
}

.menu-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--primary-color);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--text-color);
  transition: all 0.3s;
}

.theme-toggle:hover {
  background-color: var(--bg-color-secondary);
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.3s;
}

.user-profile:hover {
  background-color: var(--bg-color-secondary);
}

.avatar-wrapper {
  position: relative;
  margin-right: 8px;
}

.avatar-upload-icon {
  position: absolute;
  right: -4px;
  bottom: -4px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-upload-icon {
  opacity: 1;
}

.username {
  margin: 0 4px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 头像上传样式 */
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.avatar-uploader {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 1px dashed var(--border-color);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 40px;
  color: var(--text-color-secondary);
}

.upload-text {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 16px;
}

.avatar-tip {
  font-size: 12px;
  color: var(--text-color-secondary);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .navbar {
    padding: 0 8px;
  }
  
  .logo-text {
    display: none;
  }
  
  .menu-item {
    padding: 0 8px;
    font-size: 14px;
  }
  
  .username {
    display: none;
  }
}
</style> 