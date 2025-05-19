<template>
  <div class="not-found-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="error-container">
            <h1 class="error-code">404</h1>
            <h2 class="error-title">页面未找到</h2>
            <p class="error-message">
              抱歉，您尝试访问的页面不存在或已被移除。
            </p>
            <router-link to="/" class="btn btn-primary">
              <i class="fas fa-home me-2"></i>返回首页
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.error-container {
  padding: 3rem;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  background: linear-gradient(45deg, #4e73df, #36b9cc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #5a5c69;
}

.error-message {
  font-size: 1.1rem;
  color: #858796;
  margin-bottom: 2rem;
}

.btn {
  font-weight: 600;
  padding: 0.75rem 2rem;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(78, 115, 223, 0.2);
}
</style> 