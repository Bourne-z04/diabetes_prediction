const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
    : '/api';

// 通用请求函数
async function apiRequest(url, method = 'GET', data = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    // 处理GET请求的查询参数
    let finalUrl = `${API_BASE}${url}`;
    if (data && method === 'GET') {
        const queryParams = new URLSearchParams();
        for (const key in data) {
            if (Array.isArray(data[key])) {
                queryParams.append(key, JSON.stringify(data[key]));
            } else if (data[key] !== null && data[key] !== undefined) {
                queryParams.append(key, data[key]);
            }
        }
        finalUrl += `?${queryParams.toString()}`;
    } else if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(finalUrl, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '请求失败');
        }
        
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 用户认证相关函数
async function register() {
    // 使用validateAndRegister函数来处理
    validateAndRegister();
}

async function login() {
    const username = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    // 确定是邮箱还是用户名
    const isEmail = username.includes('@');
    
    const data = isEmail 
        ? { email: username, password: password }
        : { username: username, password: password };
    
    apiRequest('/auth/login', 'POST', data)
        .then(response => {
            // 存储JWT令牌和用户信息
            localStorage.setItem('jwtToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            
            // 根据用户角色跳转到对应页面
            showMessage('登录成功', 'success');
            setTimeout(() => {
                if (response.user.role_id === 2) { // 管理员
                    window.location.href = 'admin_dashboard.html';
                } else { // 普通用户
                    window.location.href = 'user_dashboard.html';
                }
            }, 1000);
        })
        .catch(error => {
            showMessage(`登录失败: ${error.message}`, 'error');
        });
}

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// 检查用户是否已登录
function checkAuth() {
    const token = localStorage.getItem('jwtToken');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!token) {
        return null;
    }
    
    // 尝试解析token，检查是否过期
    try {
        // 简单检查token格式
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            console.error('Token格式无效');
            logout(); // 清除无效token
            return null;
        }
        
        // 检查token是否过期
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.error('Token已过期');
            logout(); // 清除过期token
            return null;
        }
        
        return { token, currentUser };
    } catch (error) {
        console.error('Token验证失败:', error);
        logout(); // 出错时清除token
        return null;
    }
}

// 检查用户是否有管理员权限
function checkAdminAuth() {
    const auth = checkAuth();
    if (!auth) return;
    
    if (auth.currentUser.role_id !== 2) {
        showMessage('您没有管理员权限', 'error');
        window.location.href = 'user_dashboard.html';
    }
    
    return auth;
}

// 显示消息提示
function showMessage(message, type = 'success') {
    const resultElement = document.getElementById('result');
    if (!resultElement) return;
    
    resultElement.innerHTML = message;
    resultElement.className = type;
}

// 导出需要的函数
window.register = register;
window.login = login;
window.logout = logout;
window.checkAuth = checkAuth;
window.checkAdminAuth = checkAdminAuth;
window.apiRequest = apiRequest;

// AI 聊天功能 (通过后端代理调用 DeepSeek API)
async function sendAiQuery() {
    const auth = checkAuth();
    if (!auth) return;
    
    const token = auth.token;
    const promptInput = document.getElementById('aiPromptInput');
    const chatBox = document.getElementById('aiChatBox');
    const errorMessageDiv = document.getElementById('aiCharError');
    const sendButton = document.getElementById('sendAiPrompt');
    const prompt = promptInput.value.trim();

    if (!prompt) {
        errorMessageDiv.textContent = '请输入您的问题。';
        return;
    }

    errorMessageDiv.textContent = '';
    promptInput.value = '';

    promptInput.disabled = true;
    sendButton.disabled = true;
    sendButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 发送中...';

    const userMessageContainer = document.createElement('div');
    userMessageContainer.classList.add('ai-chat-message', 'user-message');
    userMessageContainer.innerHTML = `
        <div class="ai-chat-message-content">
            ${prompt}
        </div>
        <span class="badge bg-primary ms-2 align-self-start">你</span>
    `;
    chatBox.appendChild(userMessageContainer);

    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('ai-chat-message', 'ai-message', 'thinking');
    thinkingDiv.id = 'aiThinkingMessage';
    thinkingDiv.innerHTML = `
        <span class="badge bg-secondary me-2 align-self-start">AI</span>
        <div class="ai-chat-message-content">
            <i>AI 正在思考中...</i>
        </div>
    `;
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // 使用后端代理接口
        const response = await apiRequest('/user/ai_chat', 'POST', { prompt: prompt }, token);
        
        const existingThinkingDiv = document.getElementById('aiThinkingMessage');
        if (existingThinkingDiv) chatBox.removeChild(existingThinkingDiv);

        let aiResponse = "抱歉，未能获取到有效的回复。";
        if (response.choices && response.choices.length > 0 && response.choices[0].message && response.choices[0].message.content) {
            aiResponse = response.choices[0].message.content;
        }

        const aiMessageContainer = document.createElement('div');
        aiMessageContainer.classList.add('ai-chat-message', 'ai-message');
        
        // 使用marked.js解析Markdown格式的回复
        const parsedMarkdown = marked.parse(aiResponse);
        
        aiMessageContainer.innerHTML = `
            <span class="badge bg-success me-2 align-self-start">AI</span>
            <div class="ai-chat-message-content markdown-body">
                ${parsedMarkdown}
            </div>
        `;
        chatBox.appendChild(aiMessageContainer);

        // 激活代码高亮
        document.querySelectorAll('.markdown-body pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

    } catch (error) {
        console.error("AI请求错误:", error);
        const existingThinkingDiv = document.getElementById('aiThinkingMessage');
        if (existingThinkingDiv) chatBox.removeChild(existingThinkingDiv);
        
        errorMessageDiv.textContent = `AI 请求失败: ${error.message}`;
        const errorContainer = document.createElement('div');
        errorContainer.classList.add('ai-chat-message', 'ai-message', 'error');
        errorContainer.innerHTML = `
            <span class="badge bg-danger me-2 align-self-start">AI</span>
            <div class="ai-chat-message-content">
                抱歉，连接 AI 服务时出现问题。
            </div>
        `;
        chatBox.appendChild(errorContainer);
    } finally {
        promptInput.disabled = false;
        sendButton.disabled = false;
        sendButton.innerHTML = '发送';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

window.sendAiQuery = sendAiQuery;

// 上传文件函数
async function uploadFile(token) {
    console.log("开始执行uploadFile函数");
    const fileInput = document.getElementById('file');
    if (!fileInput) {
        console.error("未找到文件输入元素 (id='file')");
        showMessage('页面缺少文件输入元素', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    console.log("选择的文件:", file ? file.name : "未选择文件");
    
    if (!file) {
        showMessage('请选择文件', 'error');
        return;
    }
    
    // 显示加载中
    const resultElement = document.getElementById('result');
    if (!resultElement) {
        console.error("未找到结果显示元素 (id='result')");
        alert('页面缺少结果显示元素');
        return;
    }
    
    resultElement.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <p>正在上传文件，请稍候...</p>
        </div>
    `;
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log("准备提交文件上传请求到:", `${API_BASE}/admin/upload`);
    
    try {
        // 使用标准fetch API来处理文件上传，而不是我们的apiRequest函数
        const response = await fetch(`${API_BASE}/admin/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log("上传请求响应状态:", response.status);
        
        const result = await response.json();
        console.log("上传请求响应数据:", result);
        
        if (!response.ok) {
            throw new Error(result.message || '上传失败');
        }
        
        showMessage(`
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                <strong>文件上传成功！</strong>
                <div class="mt-2">
                    <p class="mb-1">文件名: ${result.filename}</p>
                    <p class="mb-0">导入行数: ${result.row_count || '未知'}</p>
                </div>
            </div>
        `);
    } catch (error) {
        console.error("文件上传出错:", error);
        showMessage(`
            <div class="alert alert-danger">
                <i class="fas fa-times-circle me-2"></i>
                <strong>上传失败:</strong> ${error.message}
            </div>
        `, 'error');
    }
}

window.uploadFile = uploadFile;

// 处理文件上传事件
function handleFileUpload() {
    console.log("handleFileUpload函数被调用");
    
    // 检查认证状态
    const auth = checkAdminAuth();
    if (!auth) {
        console.error("管理员认证失败，无法上传文件");
        showMessage('认证失败，请重新登录', 'error');
        return;
    }
    
    console.log("管理员认证通过，准备上传文件");
    console.log("使用的token:", auth.token ? auth.token.substring(0, 10) + "..." : "无token");
    
    // 调用上传函数
    uploadFile(auth.token);
}

window.handleFileUpload = handleFileUpload;

// 健康报告生成功能
async function generateAndDisplayHealthReport() {
    const reportOutputDiv = document.getElementById('healthReportOutput'); // 假设HTML中有此元素
    const generateButton = document.getElementById('generateReportBtn'); // 假设HTML中有此按钮

    if (!reportOutputDiv) {
        console.error("报告输出区域 'healthReportOutput' 未找到。");
        showMessage("无法生成报告：页面缺少必要的元素。", "error");
        return;
    }

    if (generateButton) {
        generateButton.disabled = true;
        generateButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 生成中...';
    }

    reportOutputDiv.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <p>正在生成健康报告，请稍候...</p>
        </div>
    `;

    // 1. 记录前面配置规则，数据可视化，数据分析的结果 (模拟数据)
    const simulatedConfigRules = "血糖控制目标：空腹70-130mg/dL，餐后两小时低于180mg/dL。";
    const simulatedDataVisualization = "最近一个月的血糖平均值为140mg/dL，呈现轻微上升趋势。";
    const simulatedDataAnalysis = "数据显示，用户的运动量与血糖控制有明显正相关。建议增加每周至少150分钟的中等强度运动。";

    // 2. 形成prompt
    const datasetInfo = `
        数据集背景：该数据集最初来自美国国家糖尿病、消化和肾脏疾病研究所。数据集的目标是基于包含在内的特定诊断测量指标，通过诊断预测患者是否患有糖尿病。在从更大数据库中选择这些实例时设置了若干限制条件，所有患者均为至少21岁的皮马印第安裔女性。
        数据集内容：数据集包含若干医学预测（自变量）变量和一个目标（因变量）变量Outcome。自变量包括患者的怀孕次数、BMI指数、胰岛素水平、年龄等。
    `;

    const promptContent = `
        请根据以下信息，生成一份针对皮马印第安裔女性群体的糖尿病健康研究报告：

        **1. 基于以下模拟的用户健康数据和分析结果：**
           - 配置规则：${simulatedConfigRules}
           - 数据可视化摘要：${simulatedDataVisualization}
           - 数据分析摘要：${simulatedDataAnalysis}

        **2. 结合以下数据集信息：**
           - ${datasetInfo}

        **3. 报告应包含以下部分：**
           a. 对模拟用户健康数据的解读和建议。
           b. 基于提供的模拟数据和数据集背景，对该群体（皮马印第安裔女性，年龄>=21岁）的糖尿病研究情况进行概述。
           c. 总结与该数据集相关的糖尿病风险因素。

        请以结构化、清晰的方式呈现报告。
    `;

    // 【问题修复】：添加测试信息
    console.log("准备调用AI API，提示词长度:", promptContent.length);
    console.log("使用的API URL:", DEEPSEEK_API_URL);
    
    // 3. 发送给AI (复用DeepSeek API调用逻辑)
    try {
        const apiRequestBody = {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are an AI assistant specialized in generating health reports based on provided data and medical information." },
                { role: "user", content: promptContent }
            ],
            stream: false
        };

        // 【问题修复】：添加更详细的API调用日志
        console.log("发送请求到DeepSeek API...");
        console.log("请求头部:", {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY.substring(0, 5)}...` // 只显示前几个字符，保护API密钥
        });
        
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify(apiRequestBody)
        });

        console.log("API响应状态:", response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error("API错误详情:", errorData);
            throw new Error(`AI API 请求失败: ${response.status} ${errorData.message || ''}`);
        }

        const data = await response.json();
        console.log("接收到API响应数据");
        
        let aiResponseContent = "抱歉，AI未能生成有效的报告内容。";
        if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
            aiResponseContent = data.choices[0].message.content;
            console.log("成功解析AI回复，内容长度:", aiResponseContent.length);
        } else {
            console.error("无法解析AI回复:", data);
        }

        // 4. 显示报告
        // 使用marked.js解析Markdown格式的回复
        console.log("正在格式化报告...");
        
        // 【问题修复】：检查marked是否存在
        if (typeof marked === 'undefined') {
            console.error("marked库未加载，无法解析Markdown");
            reportOutputDiv.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>警告:</strong> Markdown解析库未加载，报告可能无法正常显示。
                    <hr>
                    <pre>${aiResponseContent}</pre>
                </div>
            `;
        } else {
            const parsedMarkdownReport = marked.parse(aiResponseContent);
            reportOutputDiv.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h4>健康状况报告</h4>
                    </div>
                    <div class="card-body markdown-body">
                        ${parsedMarkdownReport}
                    </div>
                </div>
            `;
            
            // 激活代码高亮 (如果报告中有代码块)
            if (typeof hljs !== 'undefined') {
                reportOutputDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            } else {
                console.warn("highlight.js未加载，代码块将不会高亮显示");
            }
        }
        
        // 显示报告区域
        reportOutputDiv.style.display = 'block';

    } catch (error) {
        console.error("生成健康报告时出错:", error);
        reportOutputDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times-circle me-2"></i>
                <strong>生成报告失败:</strong> ${error.message}
            </div>
        `;
        // 显示报告区域以便用户能看到错误信息
        reportOutputDiv.style.display = 'block';
    } finally {
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.innerHTML = '生成健康报告';
        }
    }
}
window.generateAndDisplayHealthReport = generateAndDisplayHealthReport;

// 图表初始化函数
function initializeCharts() {
    console.log("尝试初始化图表...");
    
    // 检查Chart.js是否可用
    if (typeof Chart === 'undefined') {
        console.error("Chart.js 未加载，无法初始化图表");
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>图表加载失败</strong>：未找到Chart.js库。请确保在HTML中引入了Chart.js。
                </div>
            `;
        });
        return;
    }
    
    // 检查canvas元素是否存在
    const chartCanvas = document.getElementById('diabetesChart');
    if (!chartCanvas) {
        console.error("未找到图表画布元素 'diabetesChart'");
        return;
    }
    
    try {
        const ctx = chartCanvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar', // 或其他图表类型
            data: {
                labels: ['空腹血糖', '餐后血糖', 'BMI指数', '年龄', '胰岛素'],
                datasets: [{
                    label: '您的数据',
                    data: [95, 142, 26.8, 35, 120],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }, {
                    label: '健康标准',
                    data: [90, 140, 24, 0, 130],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '健康数据分析'
                    }
                }
            }
        });
        console.log("图表初始化成功");
    } catch (error) {
        console.error("初始化图表时出错:", error);
        if (chartCanvas) {
            const container = chartCanvas.parentElement;
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-times-circle me-2"></i>
                        <strong>图表加载失败</strong>：${error.message}
                    </div>
                `;
            }
        }
    }
}
window.initializeCharts = initializeCharts;

// 健康报告生成处理函数
function generateHealthReport() {
    console.log("启动健康报告生成流程...");
    
    // 显示加载遮罩
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingProgress = document.getElementById('loadingProgress');
    
    if (!loadingOverlay || !loadingProgress) {
        console.error("未找到加载遮罩或进度条元素");
        showMessage('界面元素缺失，无法显示生成进度', 'error');
        // 尝试直接调用报告生成函数
        generateAndDisplayHealthReport();
        return;
    }
    
    loadingOverlay.style.display = 'flex';
    
    // 模拟进度条
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 100) {
            clearInterval(progressInterval);
            return;
        }
        loadingProgress.style.width = `${progress}%`;
    }, 250);
    
    // 验证用户登录状态
    const auth = checkAuth();
    if (!auth) {
        clearInterval(progressInterval);
        loadingOverlay.style.display = 'none';
        console.error("用户未登录，无法生成报告");
        showMessage('请先登录', 'error');
        setTimeout(() => window.location.href = 'index.html', 1000);
        return;
    }
    
    try {
        console.log("调用报告生成主函数...");
        // 直接调用 app.js 中的函数
        generateAndDisplayHealthReport()
            .then(() => {
                console.log("报告生成成功");
                clearInterval(progressInterval);
                loadingProgress.style.width = '100%';
                
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    const reportOutput = document.getElementById('healthReportOutput');
                    if (reportOutput) {
                        reportOutput.style.display = 'block';
                        // 平滑滚动到报告
                        reportOutput.scrollIntoView({
                            behavior: 'smooth'
                        });
                    } else {
                        console.error("无法找到报告输出区域");
                    }
                }, 500);
            })
            .catch(error => {
                console.error('报告生成失败:', error);
                clearInterval(progressInterval);
                loadingOverlay.style.display = 'none';
                showMessage(`生成报告失败: ${error.message}`, 'error');
            });
    } catch (error) {
        clearInterval(progressInterval);
        loadingOverlay.style.display = 'none';
        console.error('调用报告生成函数时出错:', error);
        showMessage(`生成报告失败: ${error.message}`, 'error');
    }
}
window.generateHealthReport = generateHealthReport;

// 页面加载完成后的初始化函数
function initializePage() {
    console.log("页面初始化中...");
    
    // 检查用户登录状态
    const auth = checkAuth();
    if (!auth) {
        console.warn("用户未登录，将重定向到登录页面");
        window.location.href = 'index.html';
        return;
    }
    
    // 根据页面上的元素决定执行哪些初始化
    if (document.getElementById('diabetesChart')) {
        console.log("检测到图表元素，初始化图表");
        initializeCharts();
    }
    
    // 检查是否在管理员页面
    if (document.getElementById('adminControls')) {
        console.log("检测到管理员控制面板，验证管理员权限");
        const adminAuth = checkAdminAuth();
        if (!adminAuth) {
            console.error("非管理员用户尝试访问管理页面");
            // 已经在checkAdminAuth中处理了重定向
            return;
        }
    }
    
    console.log("页面初始化完成");
}

// 注册页面加载事件处理
document.addEventListener('DOMContentLoaded', initializePage);

// 原测试DeepSeek API的函数已删除，现在使用更安全的后端代理