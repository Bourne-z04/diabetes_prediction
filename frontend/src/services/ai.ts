// AI服务接口，直接调用DeepSeek API
const DEEPSEEK_API_KEY = 'sk-2359b6a51afb4622b0de79152e3c0a12'; 
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 基础的AI请求函数
export async function sendChatRequest(
  messages: Array<{role: string, content: string}>,
  options: {stream?: boolean} = {}
) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: options.stream || false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '请求AI服务失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('AI服务请求失败:', error);
    throw error;
  }
}

// AI辅助函数
export const aiService = {
  // 普通聊天对话
  chat: async (userMessage: string, systemPrompt: string = '您是一个专业的糖尿病健康助手，能够提供专业、实用的健康建议。') => {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];
    
    return sendChatRequest(messages);
  },
  
  // 根据健康数据生成个性化健康计划
  generateHealthPlan: async (userData: {
    age: number;
    bmi: number;
    insulin: number;
    skin_thickness: number;
    glucose: number;
    diabetesRisk: number;
    userPreferences?: string;
  }) => {
    const systemPrompt = `您是一个专业的糖尿病健康管理专家。请根据用户的健康数据制定个性化的健康管理方案。
给出详细的饮食建议、运动计划、生活习惯调整和定期检测建议。`;
    
    const userPrompt = `请根据我的健康数据，为我制定一个个性化的糖尿病预防/管理方案：
- 年龄: ${userData.age}岁
- BMI指数: ${userData.bmi}
- 胰岛素水平: ${userData.insulin} μU/ml
- 皮肤厚度: ${userData.skin_thickness} mm
- 血糖水平: ${userData.glucose} mg/dL
- 糖尿病风险评估: ${(userData.diabetesRisk * 100).toFixed(1)}%
${userData.userPreferences ? `- 个人偏好: ${userData.userPreferences}` : ''}

请提供以下几个方面的详细建议：
1. 饮食方案（包括每日饮食安排、食物选择、注意事项）
2. 运动计划（包括推荐的运动类型、频率、强度）
3. 生活习惯调整建议
4. 定期检测项目和频率
5. 需要注意的风险信号`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    return sendChatRequest(messages);
  },
  
  // 获取关于特定指标的解释
  explainHealthMetric: async (metric: string) => {
    const systemPrompt = '您是一位糖尿病专家和健康教育工作者，请提供准确、易懂的医学指标解释。';
    const userPrompt = `请详细解释${metric}这一健康指标：
1. 这个指标是什么？
2. 正常范围是多少？
3. 对糖尿病风险的影响
4. 如何改善这一指标？`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    return sendChatRequest(messages);
  }
}; 