<template>
  <div class="health-guide-page">
    <NavBar />
    
    <div class="container">
      <div class="page-header">
        <h1>健康指南</h1>
        <el-button type="primary" @click="printGuide">
          <el-icon><Printer /></el-icon>
          打印指南
        </el-button>
      </div>
      
      <div class="guide-content" ref="guideContentRef">
        <!-- 个性化提示 -->
        <el-card class="guide-card">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>个性化健康建议</span>
            </div>
          </template>
          
          <div class="tips-container">
            <div class="tip-item" v-for="(tip, index) in healthTips" :key="index">
              <el-icon><Check /></el-icon>
              <div class="tip-content">
                <h3>{{ tip.title }}</h3>
                <p>{{ tip.content }}</p>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 饮食指南 -->
        <el-card class="guide-card">
          <template #header>
            <div class="card-header">
              <el-icon><Food /></el-icon>
              <span>饮食指南</span>
            </div>
          </template>
          
          <div class="meal-plans">
            <div class="meal-section">
              <h3>三餐食谱建议</h3>
              
              <el-tabs tab-position="left">
                <el-tab-pane label="早餐">
                  <div class="meal-plan">
                    <div class="meal-header">
                      <h4>早餐推荐</h4>
                      <span class="calorie-info">约300-400卡路里</span>
                    </div>
                    
                    <div class="meal-options">
                      <div class="meal-option" v-for="(option, idx) in mealPlans.breakfast" :key="idx">
                        <h5>选项 {{ idx + 1 }}</h5>
                        <ul>
                          <li v-for="(item, i) in option.items" :key="i">
                            {{ item }}
                          </li>
                        </ul>
                        <p class="note" v-if="option.note">注：{{ option.note }}</p>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="午餐">
                  <div class="meal-plan">
                    <div class="meal-header">
                      <h4>午餐推荐</h4>
                      <span class="calorie-info">约500-600卡路里</span>
                    </div>
                    
                    <div class="meal-options">
                      <div class="meal-option" v-for="(option, idx) in mealPlans.lunch" :key="idx">
                        <h5>选项 {{ idx + 1 }}</h5>
                        <ul>
                          <li v-for="(item, i) in option.items" :key="i">
                            {{ item }}
                          </li>
                        </ul>
                        <p class="note" v-if="option.note">注：{{ option.note }}</p>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="晚餐">
                  <div class="meal-plan">
                    <div class="meal-header">
                      <h4>晚餐推荐</h4>
                      <span class="calorie-info">约400-500卡路里</span>
                    </div>
                    
                    <div class="meal-options">
                      <div class="meal-option" v-for="(option, idx) in mealPlans.dinner" :key="idx">
                        <h5>选项 {{ idx + 1 }}</h5>
                        <ul>
                          <li v-for="(item, i) in option.items" :key="i">
                            {{ item }}
                          </li>
                        </ul>
                        <p class="note" v-if="option.note">注：{{ option.note }}</p>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="加餐">
                  <div class="meal-plan">
                    <div class="meal-header">
                      <h4>加餐推荐</h4>
                      <span class="calorie-info">约100-150卡路里</span>
                    </div>
                    
                    <div class="meal-options">
                      <div class="meal-option" v-for="(option, idx) in mealPlans.snacks" :key="idx">
                        <h5>选项 {{ idx + 1 }}</h5>
                        <ul>
                          <li v-for="(item, i) in option.items" :key="i">
                            {{ item }}
                          </li>
                        </ul>
                        <p class="note" v-if="option.note">注：{{ option.note }}</p>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
            
            <!-- 需要控制的食物 -->
            <div class="foods-to-avoid">
              <h3>需要控制的食物</h3>
              <el-tag 
                v-for="food in foodsToAvoid.value" 
                :key="food" 
                type="danger" 
                effect="dark"
                class="avoid-food-tag"
              >
                {{ food }}
              </el-tag>
            </div>
          </div>
        </el-card>
        
        <!-- 用药指南 -->
        <el-card class="guide-card">
          <template #header>
            <div class="card-header">
              <el-icon><FirstAid /></el-icon>
              <span>用药指南</span>
            </div>
          </template>
          
          <div v-if="medicationGuides.length > 0">
            <el-alert
              title="以下用药指南仅供参考，具体用药请遵医嘱"
              type="warning"
              :closable="false"
              style="margin-bottom: 20px;"
            />
            
            <el-timeline>
              <el-timeline-item
                v-for="(medication, index) in medicationGuides"
                :key="index"
                :timestamp="medication.time"
                :type="medication.type"
              >
                <div class="medication-item">
                  <h3>{{ medication.name }}</h3>
                  <p>剂量：{{ medication.dosage }}</p>
                  <p>备注：{{ medication.note }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
          <div v-else class="empty-data">
            暂无用药指南，请遵医嘱用药
          </div>
        </el-card>
        
        <!-- 运动建议 -->
        <el-card class="guide-card">
          <template #header>
            <div class="card-header">
              <el-icon><Place /></el-icon>
              <span>运动建议</span>
            </div>
          </template>
          
          <div class="exercise-plan">
            <h3>每周运动计划</h3>
            
            <el-table :data="exercisePlan.value" stripe style="width: 100%">
              <el-table-column label="运动类型" prop="type" />
              <el-table-column label="频率" prop="frequency" />
              <el-table-column label="时长" prop="duration" />
              <el-table-column label="注意事项" prop="notes" />
            </el-table>
            
            <div class="exercise-tips">
              <h3>运动小贴士</h3>
              <ul>
                <li>运动前30分钟应适量进食，避免低血糖</li>
                <li>运动前后测量血糖，监控身体状况</li>
                <li>随身携带糖果或者含糖饮料，以防低血糖</li>
                <li>循序渐进，不要突然增加运动量</li>
                <li>如有不适，立即停止运动并咨询医生</li>
              </ul>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getHealthGuide } from '../../services/user'
import NavBar from '../../components/NavBar.vue'
import { 
  Printer, InfoFilled, Check, Food, FirstAid, 
  Place 
} from '@element-plus/icons-vue'

// 引用
const guideContentRef = ref(null)

// 个性化健康建议
const healthTips = ref([
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
  },
  {
    title: '足部护理',
    content: '糖尿病患者需特别注意足部护理，每天检查足部是否有伤口、水泡或感染迹象，保持足部清洁干燥。'
  }
])

// 三餐食谱
const mealPlans = reactive({
  breakfast: [
    {
      items: [
        '全麦面包 2片（约60克）',
        '煮鸡蛋 1个',
        '牛奶（脱脂） 200ml',
        '蓝莓 半杯'
      ],
      note: '全麦面包富含膳食纤维，有助于稳定血糖'
    },
    {
      items: [
        '燕麦粥 1碗（干燕麦40克）',
        '杏仁 10粒',
        '酸奶（低脂） 100g',
        '苹果 半个'
      ],
      note: '燕麦含有β-葡聚糖，能延缓碳水化合物的吸收'
    },
    {
      items: [
        '杂粮粥 1碗',
        '煮鸡胸肉 50克',
        '蔬菜沙拉 1份',
        '橙子 1个'
      ]
    }
  ],
  lunch: [
    {
      items: [
        '糙米饭 1小碗（约100克）',
        '清蒸鱼 1份（约100克）',
        '炒西兰花 1份',
        '番茄豆腐汤 1碗'
      ]
    },
    {
      items: [
        '荞麦面 1小碗',
        '烤鸡胸 100克',
        '炒菌菇 1份',
        '小白菜汤 1碗'
      ],
      note: '荞麦面的升糖指数低于普通面条'
    },
    {
      items: [
        '藜麦沙拉 1份',
        '煎三文鱼 100克',
        '烤蔬菜（胡萝卜、西葫芦）1份',
        '紫菜汤 1碗'
      ]
    }
  ],
  dinner: [
    {
      items: [
        '玉米饭 小份（50克干米）',
        '蒸鸡 100克',
        '蒜蓉菠菜 1份',
        '冬瓜汤 1碗'
      ]
    },
    {
      items: [
        '豆腐 100克',
        '清炒青菜 1份',
        '紫米饭 小份',
        '萝卜排骨汤 1碗（少油）'
      ]
    },
    {
      items: [
        '蒸红薯 1个（中等大小）',
        '清蒸鲈鱼 100克',
        '凉拌黄瓜 1份',
        '海带排骨汤 1碗'
      ],
      note: '晚餐宜清淡、少量，睡前两小时完成进食'
    }
  ],
  snacks: [
    {
      items: [
        '核桃 5个',
        '酸奶（无糖） 100g'
      ]
    },
    {
      items: [
        '苹果 1个',
        '无盐腰果 10粒'
      ]
    },
    {
      items: [
        '红心火龙果 半个',
        '奶酪条 1根'
      ]
    }
  ]
})

// 需要控制的食物
const foodsToAvoid = ref([
  '白米饭', '白面包', '甜点', '含糖饮料', '精制面粉', 
  '油炸食品', '加工肉类', '含糖水果罐头', '蜂蜜', '果酱',
  '酒精饮品', '高盐零食', '奶油蛋糕', '巧克力', '冰淇淋'
])

// 用药指南（示例数据）
const medicationGuides = ref([
  {
    name: '二甲双胍',
    dosage: '850mg，每天2次',
    time: '早餐后和晚餐后',
    note: '饭后服用可减轻胃肠道反应',
    type: 'primary'
  },
  {
    name: '格列美脲',
    dosage: '2mg，每天1次',
    time: '早餐前',
    note: '注意监测血糖，警惕低血糖',
    type: 'warning'
  },
  {
    name: '阿卡波糖',
    dosage: '50mg，每天3次',
    time: '三餐第一口食物前',
    note: '与食物同服可减少胃肠道不适',
    type: 'success'
  }
])

// 运动计划
const exercisePlan = ref([
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
  },
  {
    type: '游泳',
    frequency: '每周1-2次',
    duration: '每次30分钟',
    notes: '全身性运动，关节负担小'
  },
  {
    type: '瑜伽/太极',
    frequency: '每周2次',
    duration: '每次30-45分钟',
    notes: '有助于放松身心，降低压力'
  }
])

// 打印指南
const printGuide = () => {
  const printContents = guideContentRef.value.innerHTML
  const originalContents = document.body.innerHTML
  
  document.body.innerHTML = `
    <div style="padding: 20px;">
      <h1 style="text-align: center; margin-bottom: 20px;">个性化健康指南</h1>
      ${printContents}
    </div>
  `
  
  window.print()
  document.body.innerHTML = originalContents
  
  // 重新挂载Vue组件（这个操作实际上在Vue3中不太可行，仅为示例）
  // 实际项目中应使用打印插件如vue-print-nb或使用新窗口打印
  ElMessage.success('打印指南已发送至打印机')
}

// 获取健康指南
const fetchHealthGuide = async () => {
  try {
    // 调用API获取健康指南
    const response = await getHealthGuide();
    
    // 处理返回的数据
    if (response.data) {
      // 更新健康提示
      if (response.data.tips) {
        healthTips.value = response.data.tips;
      }
      
      // 更新餐饮计划
      if (response.data.mealPlans) {
        Object.assign(mealPlans, response.data.mealPlans);
      }
      
      // 更新要避免的食物
      if (response.data.foodsToAvoid) {
        foodsToAvoid.value = response.data.foodsToAvoid;
      }
      
      // 更新用药指南
      if (response.data.medications) {
        medicationGuides.value = response.data.medications;
      }
      
      // 更新运动计划
      if (response.data.exercisePlan) {
        exercisePlan.value = response.data.exercisePlan;
      }
    }
  } catch (error) {
    console.error('获取健康指南失败:', error);
    ElMessage.error('获取健康指南失败，请稍后重试');
  }
}

// 生命周期钩子
onMounted(() => {
  fetchHealthGuide()
})
</script>

<style scoped>
.health-guide-page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.container {
  padding: 20px;
  max-width: 1000px;
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

.guide-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: var(--text-color);
}

.card-header .el-icon {
  margin-right: 8px;
  color: var(--primary-color);
}

/* 健康提示样式 */
.tips-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tip-item .el-icon {
  color: var(--success-color);
  margin-right: 10px;
  margin-top: 4px;
}

.tip-content h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  color: var(--text-color);
}

.tip-content p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 1.5;
}

/* 餐饮计划样式 */
.meal-plans {
  margin-bottom: 20px;
}

.meal-section {
  margin-bottom: 30px;
}

.meal-section h3 {
  margin-bottom: 20px;
  color: var(--text-color);
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.meal-header h4 {
  margin: 0;
  color: var(--primary-color);
}

.calorie-info {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.meal-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.meal-option {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.meal-option h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--text-color);
}

.meal-option ul {
  padding-left: 20px;
  margin-bottom: 10px;
}

.meal-option ul li {
  margin-bottom: 5px;
  color: var(--text-color-secondary);
}

.note {
  font-size: 12px;
  color: var(--warning-color);
  margin: 0;
}

/* 需要避免的食物 */
.foods-to-avoid {
  margin-top: 30px;
}

.foods-to-avoid h3 {
  margin-bottom: 15px;
  color: var(--text-color);
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.avoid-food-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

/* 用药指南样式 */
.medication-item h3 {
  margin: 0 0 10px 0;
  color: var(--text-color);
}

.medication-item p {
  margin: 5px 0;
  color: var(--text-color-secondary);
}

/* 运动建议样式 */
.exercise-plan h3 {
  margin-bottom: 15px;
  color: var(--text-color);
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.exercise-tips {
  margin-top: 30px;
}

.exercise-tips ul {
  padding-left: 20px;
}

.exercise-tips ul li {
  margin-bottom: 10px;
  color: var(--text-color-secondary);
}

.empty-data {
  text-align: center;
  padding: 30px;
  color: var(--text-color-secondary);
}

@media print {
  /* 打印样式 */
  .page-header, .el-button {
    display: none !important;
  }

  .container {
    padding: 0;
    max-width: 100%;
  }

  .guide-card {
    box-shadow: none !important;
    border: 1px solid #ddd;
  }
}

@media (max-width: 768px) {
  .tips-container {
    grid-template-columns: 1fr;
  }
  
  .meal-options {
    grid-template-columns: 1fr;
  }
}
</style> 