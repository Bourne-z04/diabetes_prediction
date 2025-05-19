<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 检查用户是否已登录，如果已登录则自动跳转到对应的仪表板
if (authStore.isAuthenticated) {
  authStore.isAdmin 
    ? router.push('/admin/dashboard')
    : router.push('/user/dashboard')
}

// 滚动到功能区
function scrollToFeatures() {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

// 滚动到介绍区
function scrollToIntro() {
  document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })
}

// 滚动到用户角色区
function scrollToRoles() {
  document.getElementById('user-roles')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="home">
    <!-- 头部横幅 -->
    <div class="header">
      <div class="header-content">
        <div class="header-icon-container">
          <i class="bi bi-heart-fill icon-custom header-icon"></i>
        </div>
        <h1 class="system-title">针对糖尿病患者的健康方案定制系统</h1>
        <p>基于人工智能的个性化健康管理解决方案</p>
        <div class="header-sub-text">
          <p>为不同类型的糖尿病患者提供全面、个性化的健康管理服务</p>
        </div>
        <div class="header-buttons">
          <router-link to="/login" class="btn btn-primary btn-lg">
            <i class="bi bi-box-arrow-in-right me-2"></i>立即登录
          </router-link>
          <router-link to="/about" class="btn btn-outline-light btn-lg ms-3">
            <i class="bi bi-info-circle me-2"></i>了解更多
          </router-link>
        </div>
      </div>
      <div class="scroll-indicator">
        <div class="scroll-btn" @click="scrollToIntro">
          <i class="bi bi-chevron-double-down"></i>
          <div>系统介绍</div>
        </div>
        <div class="scroll-btn ms-4" @click="scrollToFeatures">
          <i class="bi bi-chevron-double-down"></i>
          <div>功能特点</div>
        </div>
        <div class="scroll-btn ms-4" @click="scrollToRoles">
          <i class="bi bi-chevron-double-down"></i>
          <div>用户角色</div>
        </div>
      </div>
    </div>

    <div class="container my-5">
      <!-- 系统简介 -->
      <div id="intro" class="system-info-section py-5" data-aos="fade-up">
        <div class="container">
          <h2 class="section-title text-center mb-5">
            <i class="bi bi-info-circle-fill text-primary"></i> 系统概述
          </h2>
          
          <div class="intro-main-card mb-4">
            <div class="intro-card-content">
              <div class="intro-icon">
                <i class="bi bi-heart-pulse-fill"></i>
              </div>
              <h3 class="intro-subtitle">智能健康管理解决方案</h3>
              <p class="intro-lead">针对糖尿病患者的健康方案定制系统致力于为不同类型的糖尿病患者提供全面、个性化的健康管理服务。</p>
            </div>
          </div>
          
          <div class="row gx-4 gy-4">
            <div class="col-md-6">
              <div class="intro-card">
                <div class="intro-card-content">
                  <div class="intro-icon">
                    <i class="bi bi-people-fill"></i>
                  </div>
                  <h4>用户功能</h4>
                  <p>用户可以通过该系统进行注册、登录，查看个人健康信息、历史记录、专属健康指南，并能提交每日健康反馈。系统会依据用户的各项健康数据，结合其糖尿病类型和运动量，生成个性化的健康方案，帮助患者更好地管理自身健康。</p>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="intro-card">
                <div class="intro-card-content">
                  <div class="intro-icon">
                    <i class="bi bi-cpu"></i>
                  </div>
                  <h4>AI技术支持</h4>
                  <p>本系统通过人工智能技术分析患者的健康数据，结合医学知识和专家经验，生成针对性的饮食、运动和生活方式建议，实现全方位的健康管理。AI助手全天候为您提供健康咨询，让健康管理不再困难。</p>
                </div>
              </div>
            </div>
            
            <div class="col-md-12 mt-4">
              <div class="intro-feature-list">
                <div class="intro-feature-item">
                  <i class="bi bi-shield-check"></i>
                  <span>专业的医学支持</span>
                </div>
                <div class="intro-feature-item">
                  <i class="bi bi-graph-up-arrow"></i>
                  <span>数据可视化分析</span>
                </div>
                <div class="intro-feature-item">
                  <i class="bi bi-person-bounding-box"></i>
                  <span>个性化健康方案</span>
                </div>
                <div class="intro-feature-item">
                  <i class="bi bi-clock-history"></i>
                  <span>实时健康监测</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户角色 -->
      <div id="user-roles" class="user-roles-section py-5 my-5">
        <h2 class="section-title text-center mb-5">
          <i class="bi bi-people-fill me-2 text-primary"></i>用户角色
        </h2>
        <div class="row">
          <!-- 普通用户 -->
          <div class="col-md-6 mb-4">
            <div class="role-card">
              <div class="role-icon-container">
                <i class="bi bi-person-fill"></i>
              </div>
              <h3 class="role-title">普通用户</h3>
              <ul class="role-features">
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>注册与登录系统</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>查看个人基础信息</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>记录和查看历史健康数据</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>获取个性化健康指南</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>提交每日健康反馈</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>使用AI健康助手咨询</li>
              </ul>
            </div>
          </div>
          
          <!-- 管理员用户 -->
          <div class="col-md-6 mb-4">
            <div class="role-card">
              <div class="role-icon-container admin-icon">
                <i class="bi bi-person-lock"></i>
              </div>
              <h3 class="role-title">管理员用户</h3>
              <ul class="role-features">
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>拥有普通用户的所有权限</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>查看用户列表</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>管理用户信息</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>查看统计数据和分析报告</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>管理系统健康指南内容</li>
                <li><i class="bi bi-check-circle-fill text-success me-2"></i>查看和处理用户反馈</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能特点 -->
      <div id="features" class="feature-section py-5">
        <div class="container">
                  <h2 class="section-title text-center mb-5">
          <i class="bi bi-star-fill me-2 text-primary"></i>核心功能
        </h2>
          <div class="row">
            <!-- 特点1：登录与注册 -->
            <div class="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="100">
              <div class="feature-card">
                <div class="feature-icon-container">
                  <i class="bi bi-person-plus-fill"></i>
                </div>
                <h3 class="feature-title">登录与注册</h3>
                <p>用户注册时可选择患病类型（1型糖尿病、2型糖尿病、妊娠期糖尿病等）和运动量级别，系统验证用户名唯一性后完成注册。</p>
              </div>
            </div>
            
            <!-- 特点2：个人基础信息 -->
            <div class="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="200">
              <div class="feature-card">
                <div class="feature-icon-container">
                  <i class="bi bi-person-vcard-fill"></i>
                </div>
                <h3 class="feature-title">个人基础信息</h3>
                <p>展示用户基本资料、患病类型、运动量、过敏原、基础疾病、中医体质以及用药和生活方式建议。</p>
              </div>
            </div>
            
            <!-- 特点3：动态监测信息 -->
            <div class="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="300">
              <div class="feature-card">
                <div class="feature-icon-container">
                  <i class="bi bi-activity"></i>
                </div>
                <h3 class="feature-title">动态监测信息</h3>
                <p>记录每日空腹血糖、每周体重和腰臀围数据，以及医嘱和体检报告，全面监测健康状况变化。</p>
              </div>
            </div>
            
            <!-- 特点4：个性化健康方案 -->
            <div class="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="400">
              <div class="feature-card">
                <div class="feature-icon-container">
                  <i class="bi bi-clipboard2-pulse"></i>
                </div>
                <h3 class="feature-title">个性化健康方案</h3>
                <p>根据用户的糖尿病类型、运动量和健康数据，生成个性化的饮食食谱、用药指导和运动建议。</p>
              </div>
            </div>
            
            <!-- 特点5：用户反馈 -->
            <div class="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="500">
              <div class="feature-card">
                <div class="feature-icon-container">
                  <i class="bi bi-chat-dots-fill"></i>
                </div>
                <h3 class="feature-title">用户反馈</h3>
                <p>用户每日可对饮食、运动、心情、压力、睡眠进行1-5星评分，同时可输入其他意见建议。</p>
              </div>
            </div>
            
            <!-- 特点6：用户管理 -->
            <div class="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="600">
              <div class="feature-card">
                <div class="feature-icon-container">
                  <i class="bi bi-people-gear"></i>
                </div>
                <h3 class="feature-title">用户管理</h3>
                <p>管理员可查看用户列表、修改用户信息、删除用户等，实现系统的有效管理和维护。</p>
              </div>
            </div>
          </div>

          <div class="row mt-4">
            <!-- 特点7：AI助手咨询 -->
            <div class="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="700">
              <div class="feature-card">
                <div class="feature-icon-container">
                  <i class="bi bi-robot"></i>
                </div>
                <h3 class="feature-title">AI助手咨询</h3>
                <p>智能AI助手提供24/7健康咨询服务，回答用户关于糖尿病管理的问题，给予专业建议。</p>
              </div>
            </div>
            
            <!-- 特点8：数据可视化 -->
            <div class="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="800">
              <div class="feature-card">
                <div class="feature-icon-container">
                  <i class="bi bi-graph-up"></i>
                </div>
                <h3 class="feature-title">数据可视化</h3>
                <p>通过直观的图表和仪表盘，帮助用户理解自己的健康数据变化趋势和健康状况改善情况。</p>
              </div>
            </div>
            
            <!-- 特点9：健康报告 -->
            <div class="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="900">
              <div class="feature-card">
                <div class="feature-icon-container">
                  <i class="bi bi-file-earmark-medical-fill"></i>
                </div>
                <h3 class="feature-title">健康报告</h3>
                <p>系统自动生成定期健康报告，总结健康数据变化，评估健康管理成效，提供改进建议。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 开始使用 -->
      <div class="text-center mt-5 pt-5 call-to-action" data-aos="fade-up">
        <i class="call-to-action-icon bi bi-play-circle-fill mb-4"></i>
        <h2 class="mb-4">立即开始使用</h2>
        <p class="mb-4">注册账号，开始您的个性化健康管理之旅</p>
        <p class="text-muted mb-4">系统会根据您的糖尿病类型、运动量和健康数据，为您量身定制健康方案</p>
        <router-link to="/login" class="btn btn-primary btn-lg">
          <i class="bi bi-person-plus-fill me-2"></i>立即登录/注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  position: relative;
  overflow: hidden;
  height: 100vh;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
}

.header-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
}

.header-icon-container {
  margin-bottom: 2rem;
}

.header-icon {
  font-size: 5rem;
  color: #fff;
  animation: pulse 2s infinite;
}

.header-sub-text {
  font-size: 1.2rem;
  margin-top: 0.5rem;
  opacity: 0.9;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.system-title {
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  text-shadow: 0 3px 15px rgba(0, 0, 0, 0.3);
  animation: fadeIn 1.5s ease-in-out;
}

@media (min-width: 768px) {
  .system-title {
    font-size: 4rem;
  }
}

.header p {
  font-size: 1.5rem;
  opacity: 0.9;
  max-width: 80%;
  margin: 0 auto 1.5rem;
}

.header-buttons {
  margin-top: 2rem;
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  color: white;
  z-index: 10;
}

.scroll-btn {
  cursor: pointer;
  animation: bounce 2s infinite;
  text-align: center;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 系统简介样式 */
.system-info-section {
  padding: 60px 0;
  background-color: rgba(30, 41, 59, 0.75);
  margin-top: 30px;
  position: relative;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  color: #fff;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.system-info-section .section-title {
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.system-info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, #4e73df, #36b9cc);
  border-radius: 15px 15px 0 0;
}

.intro-main-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
  backdrop-filter: blur(5px);
}

.intro-main-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, #4e73df, #36b9cc);
}

.intro-subtitle {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 20px 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.intro-card {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
  height: 100%;
  transition: all 0.3s ease;
  overflow: hidden;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.intro-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.intro-card-content {
  padding: 30px;
}

.intro-icon {
  width: 60px;
  height: 60px;
  background-color: rgba(78, 115, 223, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.intro-icon i {
  font-size: 30px;
  color: #fff;
}

.intro-lead {
  font-size: 1.25rem;
  color: #fff;
  line-height: 1.7;
  margin: 15px 0;
}

.intro-card h4 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.intro-card p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.intro-feature-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}

.intro-feature-item {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 15px 25px;
  border-radius: 50px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.intro-feature-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.25);
}

.intro-feature-item i {
  font-size: 22px;
  color: #fff;
  margin-right: 10px;
}

.intro-feature-item span {
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 40px;
  position: relative;
  display: inline-block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* 用户角色卡片 */
.user-roles-section {
  border-radius: 15px;
  background-color: rgba(30, 41, 59, 0.75);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  padding: 40px;
  backdrop-filter: blur(10px);
  color: #fff;
}

.user-roles-section .section-title {
  color: #fff;
}

.role-card {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 30px 20px;
  height: 100%;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.role-icon-container {
  font-size: 3.5rem;
  color: #fff;
  margin-bottom: 1.5rem;
  background: rgba(78, 115, 223, 0.2);
  width: 100px;
  height: 100px;
  line-height: 100px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.admin-icon {
  color: #fff;
  background: rgba(231, 74, 59, 0.2);
}

.role-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.role-features {
  text-align: left;
  list-style: none;
  padding-left: 0;
}

.role-features li {
  margin-bottom: 10px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

/* 功能特点部分 */
.feature-section {
  background-color: rgba(30, 41, 59, 0.75);
  border-radius: 15px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  color: #fff;
}

.feature-section .section-title {
  color: #fff;
}

/* 功能特点卡片 */
.feature-card {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 30px 20px;
  height: 100%;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-icon-container {
  font-size: 3.5rem;
  color: #fff !important;
  margin-bottom: 1.5rem;
  background: rgba(78, 115, 223, 0.2);
  width: 80px;
  height: 80px;
  line-height: 80px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon-container {
  transform: scale(1.1);
  background-color: rgba(78, 115, 223, 0.4);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.feature-card p {
  color: rgba(255, 255, 255, 0.9);
}

/* 为每个图标添加特殊颜色 */
.feature-card:nth-child(1) .feature-icon-container {
  background-color: rgba(28, 200, 138, 0.2); /* 绿色 */
}
.feature-card:nth-child(1):hover .feature-icon-container {
  background-color: rgba(28, 200, 138, 0.4);
}

.feature-card:nth-child(2) .feature-icon-container {
  background-color: rgba(231, 74, 59, 0.2); /* 红色 */
}
.feature-card:nth-child(2):hover .feature-icon-container {
  background-color: rgba(231, 74, 59, 0.4);
}

.feature-card:nth-child(3) .feature-icon-container {
  background-color: rgba(246, 194, 62, 0.2); /* 黄色 */
}
.feature-card:nth-child(3):hover .feature-icon-container {
  background-color: rgba(246, 194, 62, 0.4);
}

.feature-card:nth-child(4) .feature-icon-container {
  background-color: rgba(78, 115, 223, 0.2); /* 蓝色 */
}
.feature-card:nth-child(4):hover .feature-icon-container {
  background-color: rgba(78, 115, 223, 0.4);
}

.feature-card:nth-child(5) .feature-icon-container {
  background-color: rgba(54, 185, 204, 0.2); /* 青色 */
}
.feature-card:nth-child(5):hover .feature-icon-container {
  background-color: rgba(54, 185, 204, 0.4);
}

.feature-card:nth-child(6) .feature-icon-container {
  background-color: rgba(90, 92, 105, 0.2); /* 灰色 */
}
.feature-card:nth-child(6):hover .feature-icon-container {
  background-color: rgba(90, 92, 105, 0.4);
}

.feature-card:nth-child(7) .feature-icon-container {
  background-color: rgba(111, 66, 193, 0.2); /* 紫色 */
}
.feature-card:nth-child(7):hover .feature-icon-container {
  background-color: rgba(111, 66, 193, 0.4);
}

.feature-card:nth-child(8) .feature-icon-container {
  background-color: rgba(253, 126, 20, 0.2); /* 橙色 */
}
.feature-card:nth-child(8):hover .feature-icon-container {
  background-color: rgba(253, 126, 20, 0.4);
}

.feature-card:nth-child(9) .feature-icon-container {
  background-color: rgba(32, 201, 151, 0.2); /* 绿松石 */
}
.feature-card:nth-child(9):hover .feature-icon-container {
  background-color: rgba(32, 201, 151, 0.4);
}

/* 呼叫行动区域 */
.call-to-action {
  padding: 50px 0;
  border-radius: 15px;
  background-color: rgba(30, 41, 59, 0.75);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  color: #fff;
}

.call-to-action-icon {
  font-size: 4rem;
  color: #fff;
}

/* 图标专用样式 */
.icon-custom {
  display: inline-block;
  font-size: 3rem;
  color: #fff !important;
  margin-bottom: 15px;
}
</style>
