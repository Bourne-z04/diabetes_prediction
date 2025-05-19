<template>
  <div class="about-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="about-card-main">
            <div class="card-body p-5">
              <h1 class="mb-4 text-center">关于我们</h1>
              
              <p class="lead">
                糖尿病健康方案定制系统是一个专为糖尿病患者设计的智能健康管理平台。我们的使命是通过人工智能和数据分析技术，为每一位糖尿病患者提供个性化的健康管理解决方案，帮助他们更好地控制血糖，改善生活质量。
              </p>
              
              <div class="row mt-5">
                <div class="col-md-6 mb-4">
                  <div class="about-card">
                    <div class="about-icon">
                      <i class="bi bi-bullseye"></i>
                    </div>
                    <h3>我们的使命</h3>
                    <p>通过科技赋能健康管理，为糖尿病患者提供精准、个性化的健康指导，让每个人都能掌控自己的健康。</p>
                  </div>
                </div>
                
                <div class="col-md-6 mb-4">
                  <div class="about-card">
                    <div class="about-icon">
                      <i class="bi bi-eye"></i>
                    </div>
                    <h3>我们的愿景</h3>
                    <p>成为全球领先的慢性病智能管理平台，用数据和智能让健康管理变得简单、高效、可持续。</p>
                  </div>
                </div>
              </div>
              
              <h2 class="mt-5 mb-4 section-title">我们的技术栈</h2>
              <div class="tech-stack-section">
                <div class="tech-category">
                  <h3><i class="bi bi-layers-fill me-2"></i>前端技术</h3>
                  <div class="tech-items">
                    <div class="tech-item">
                      <div class="tech-icon html-icon">
                        <i class="bi bi-filetype-html"></i>
                      </div>
                      <span>HTML5</span>
                    </div>
                    <div class="tech-item">
                      <div class="tech-icon css-icon">
                        <i class="bi bi-filetype-css"></i>
                      </div>
                      <span>CSS3</span>
                    </div>
                    <div class="tech-item">
                      <div class="tech-icon js-icon">
                        <i class="bi bi-filetype-js"></i>
                      </div>
                      <span>JavaScript</span>
                    </div>
                    <div class="tech-item">
                      <div class="tech-icon vue-icon">
                        <i class="bi bi-code-slash"></i>
                      </div>
                      <span>Vue.js 3</span>
                    </div>
                    <div class="tech-item">
                      <div class="tech-icon bootstrap-icon">
                        <i class="bi bi-bootstrap"></i>
                      </div>
                      <span>Bootstrap 5</span>
                    </div>
                  </div>
                </div>
                
                <div class="tech-category">
                  <h3><i class="bi bi-database-fill me-2"></i>后端技术</h3>
                  <div class="tech-items">
                    <div class="tech-item">
                      <div class="tech-icon python-icon">
                        <i class="bi bi-filetype-py"></i>
                      </div>
                      <span>Python</span>
                    </div>
                    <div class="tech-item">
                      <div class="tech-icon flask-icon">
                        <i class="bi bi-server"></i>
                      </div>
                      <span>Flask</span>
                    </div>
                    <div class="tech-item">
                      <div class="tech-icon mysql-icon">
                        <i class="bi bi-database"></i>
                      </div>
                      <span>MySQL</span>
                    </div>
                    <div class="tech-item">
                      <div class="tech-icon pandas-icon">
                        <i class="bi bi-table"></i>
                      </div>
                      <span>Pandas</span>
                    </div>
                    <div class="tech-item">
                      <div class="tech-icon ml-icon">
                        <i class="bi bi-cpu"></i>
                      </div>
                      <span>机器学习算法</span>
                    </div>
                    <div class="tech-item">
                      <div class="tech-icon viz-icon">
                        <i class="bi bi-graph-up"></i>
                      </div>
                      <span>数据可视化</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 class="mt-5 mb-4 section-title">项目架构</h2>
              <div class="architecture-section">
                <div class="architecture-card">
                  <h4><i class="bi bi-diagram-3 me-2"></i>系统架构</h4>
                  <p>本系统采用前后端分离架构，前端使用Vue3框架构建响应式单页应用，后端基于Flask提供RESTful API服务，数据存储在MySQL数据库中。系统集成了多种机器学习算法进行数据分析，并利用可视化技术呈现健康数据趋势。</p>
                </div>
                
                <div class="data-flow">
                  <div class="data-flow-step">
                    <div class="flow-icon">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div class="flow-text">用户数据输入</div>
                  </div>
                  <div class="flow-arrow"><i class="bi bi-arrow-right"></i></div>
                  <div class="data-flow-step">
                    <div class="flow-icon">
                      <i class="bi bi-database-fill"></i>
                    </div>
                    <div class="flow-text">数据存储处理</div>
                  </div>
                  <div class="flow-arrow"><i class="bi bi-arrow-right"></i></div>
                  <div class="data-flow-step">
                    <div class="flow-icon">
                      <i class="bi bi-cpu-fill"></i>
                    </div>
                    <div class="flow-text">AI分析</div>
                  </div>
                  <div class="flow-arrow"><i class="bi bi-arrow-right"></i></div>
                  <div class="data-flow-step">
                    <div class="flow-icon">
                      <i class="bi bi-clipboard2-pulse"></i>
                    </div>
                    <div class="flow-text">个性化方案</div>
                  </div>
                </div>
              </div>
              
              <h2 class="mt-5 mb-4 section-title">开发团队</h2>
              <div class="team-section">
                <div class="row">
                  <div class="col-md-4 mb-4">
                    <div class="team-category">
                      <h4 class="team-category-title">前端开发</h4>
                      <div class="team-member">
                        <div class="team-img" style="background-color: #4e73df;">
                          <i class="bi bi-laptop"></i>
                        </div>
                        <h4>蔡德馨</h4>
                        <p class="text-muted">负责HTML、JavaScript和CSS等前端开发</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-4 mb-4">
                    <div class="team-category">
                      <h4 class="team-category-title">数据库设计</h4>
                      <div class="team-member">
                        <div class="team-img" style="background-color: #1cc88a;">
                          <i class="bi bi-database"></i>
                        </div>
                        <h4>袁硕 / 管骏杰</h4>
                        <p class="text-muted">负责MySQL数据库设计和Pandas数据处理</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-4 mb-4">
                    <div class="team-category">
                      <h4 class="team-category-title">数据分析与接口</h4>
                      <div class="team-member">
                        <div class="team-img" style="background-color: #36b9cc;">
                          <i class="bi bi-cpu"></i>
                        </div>
                        <h4>胡宸瑞 / 张博宇</h4>
                        <p class="text-muted">负责机器学习算法和Flask框架接口开发</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-4 mb-4 mx-auto">
                    <div class="team-category">
                      <h4 class="team-category-title">数据可视化</h4>
                      <div class="team-member">
                        <div class="team-img" style="background-color: #f6c23e;">
                          <i class="bi bi-graph-up"></i>
                        </div>
                        <h4>张宇阳</h4>
                        <p class="text-muted">负责matplotlib等可视化库的图表开发</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="text-center mt-5">
                <h2 class="mb-4 section-title">联系我们</h2>
                <p>
                  如果您有任何问题或建议，欢迎随时联系我们：
                </p>
                <p>
                  <i class="bi bi-envelope me-2"></i> contact@diabeteshealthplan.com<br>
                  <i class="bi bi-telephone me-2"></i> +86 123 4567 8910
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  position: relative;
  min-height: 100vh;
  color: #fff;
}

.about-card-main {
  background-color: rgba(30, 41, 59, 0.75);
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.about-card {
  padding: 2rem;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  height: 100%;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.about-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.about-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #fff;
}

.section-title {
  position: relative;
  display: inline-block;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  border-bottom: 2px solid rgba(78, 115, 223, 0.6);
  padding-bottom: 10px;
}

/* 技术栈部分 */
.tech-stack-section {
  margin-top: 2rem;
}

.tech-category {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tech-category h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  text-align: center;
}

.tech-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.tech-item:hover .tech-icon {
  transform: scale(1.1);
}

.html-icon { background-color: rgba(227, 79, 38, 0.3); }
.css-icon { background-color: rgba(38, 77, 228, 0.3); }
.js-icon { background-color: rgba(247, 223, 30, 0.3); }
.vue-icon { background-color: rgba(65, 184, 131, 0.3); }
.bootstrap-icon { background-color: rgba(86, 61, 124, 0.3); }
.python-icon { background-color: rgba(55, 118, 171, 0.3); }
.flask-icon { background-color: rgba(0, 0, 0, 0.3); }
.mysql-icon { background-color: rgba(0, 117, 143, 0.3); }
.pandas-icon { background-color: rgba(150, 83, 132, 0.3); }
.ml-icon { background-color: rgba(243, 156, 18, 0.3); }
.viz-icon { background-color: rgba(46, 204, 113, 0.3); }

/* 架构部分 */
.architecture-section {
  margin-top: 2rem;
}

.architecture-card {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.architecture-card h4 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.data-flow {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.data-flow-step {
  text-align: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 120px;
}

.flow-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.flow-text {
  font-size: 0.9rem;
  color: #fff;
}

.flow-arrow {
  font-size: 1.5rem;
  color: #fff;
}

/* 团队部分 */
.team-section {
  margin-top: 2rem;
}

.team-category {
  text-align: center;
  height: 100%;
}

.team-category-title {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #fff;
  background-color: rgba(78, 115, 223, 0.3);
  padding: 0.5rem;
  border-radius: 30px;
  display: inline-block;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.team-member {
  text-align: center;
  padding: 1.5rem;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: calc(100% - 3rem);
}

.team-member:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  background-color: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.team-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.team-member h4 {
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.team-member .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 0.9rem;
}

.lead {
  font-size: 1.2rem;
  line-height: 1.8;
}

/* 媒体查询 */
@media (max-width: 768px) {
  .data-flow {
    flex-direction: column;
  }
  
  .flow-arrow {
    transform: rotate(90deg);
  }
  
  .tech-items {
    justify-content: center;
  }
}
</style>
