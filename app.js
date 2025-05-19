const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
    : '/api';

// 通用请求函数
async function apiRequest(url, method = 'GET', data = null, token = null) {
    console.log(`API请求开始: [${method}] ${url}`, data ? '数据:' : '', data || '');
    
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
        console.log(`请求API(${method}): ${finalUrl}`);
        const response = await fetch(finalUrl, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '请求失败');
        }
        
        console.log(`API请求成功: [${method}] ${url}`, result ? '返回数据摘要:' : '', result ? (typeof result === 'object' ? '对象/数组' : result) : '');
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 用户认证相关函数
async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    // 获取糖尿病类型和运动量等额外字段
    const diabetesType = document.getElementById('reg-diabetesType')?.value;
    const activityLevel = document.getElementById('reg-activityLevel')?.value;

    // 表单验证
    if (!username || !email || !password) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('请输入有效的电子邮箱地址', 'error');
        return;
    }

    try {
        // 显示加载状态
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 注册中...';
        }

        // 构建注册数据对象，包含额外字段
        const data = {
            username: username,
            email: email,
            password: password
        };

        // 如果存在糖尿病类型和运动量字段，则添加到数据中
        if (diabetesType) {
            data.diabetes_type = diabetesType;
        }
        if (activityLevel) {
            data.activity_level = activityLevel;
        }

        const result = await apiRequest('/auth/register', 'POST', data);
        showMessage(`注册成功: ${result.message}`, 'success');
        
        // 自动切换到登录页面
        setTimeout(() => {
            // 如果是在index.html页面，直接切换表单
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            if (loginForm && registerForm) {
                // 切换到登录表单
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
                loginForm.classList.remove('inactive');
                loginForm.classList.add('active');
                
                // 自动填充邮箱
                const loginEmail = document.getElementById('login-email');
                if (loginEmail) loginEmail.value = email;
                
                // 聚焦密码输入框
                const loginPassword = document.getElementById('login-password');
                if (loginPassword) loginPassword.focus();
            } else {
                // 如果在其他页面，则可能有登录标签页
                const loginTab = document.getElementById('login-tab');
                if (loginTab) loginTab.click();
            }
        }, 1500);
    } catch (error) {
        showMessage(`注册失败: ${error.message}`, 'error');
    } finally {
        // 恢复按钮状态
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.innerHTML = '注册';
        }
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showMessage('请填写邮箱和密码', 'error');
        return;
    }

    try {
        // 显示加载状态
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 登录中...';
        }

        // 确定是邮箱还是用户名
        const isEmail = email.includes('@');
        
        // 构建登录数据
        const data = isEmail 
            ? { email: email, password: password }
            : { username: email, password: password };

        const result = await apiRequest('/auth/login', 'POST', data);
        localStorage.setItem('jwtToken', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        showMessage(`登录成功，欢迎回来！`, 'success');
        
        // 添加平滑过渡效果
        document.body.style.opacity = '0.5';
        document.body.style.transition = 'opacity 0.5s ease';
        
        // 根据用户角色导航到不同页面
        if (result.user.role_id === 2) { // 管理员
            setTimeout(() => window.location.href = 'admin_dashboard.html', 1000);
        } else { // 普通用户
            setTimeout(() => window.location.href = 'user_dashboard.html', 1000);
        }
    } catch (error) {
        showMessage(`登录失败: ${error.message}`, 'error');
    } finally {
        // 恢复按钮状态
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '登录';
        }
    }
}

function logout() {
    // 添加淡出动画
    document.body.style.opacity = '0.5';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // 延迟清除登录信息，使动画有时间执行
    setTimeout(() => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }, 300);
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
        
        // 初始化页面元素
        initPageElements(currentUser);
        
        return { token, currentUser };
    } catch (error) {
        console.error('Token验证失败:', error);
        logout(); // 出错时清除token
        return null;
    }
}

// 初始化页面元素，显示用户信息
function initPageElements(user) {
    // 设置用户名和头像
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName && user.username) {
        userDisplayName.textContent = user.username;
    }
    
    // 如果有用户角色徽章，则设置相应的标签
    const userRoleBadge = document.getElementById('userRoleBadge');
    if (userRoleBadge && user.role_id) {
        userRoleBadge.textContent = user.role_id === 2 ? '管理员' : '用户';
        userRoleBadge.className = user.role_id === 2 ? 'badge bg-danger' : 'badge bg-primary';
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
    
    // 添加淡入效果
    resultElement.style.opacity = '0';
    resultElement.innerHTML = message;
    resultElement.className = type;
    resultElement.style.display = 'block';
    
    // 触发重绘后淡入
    setTimeout(() => {
        resultElement.style.transition = 'opacity 0.3s ease';
        resultElement.style.opacity = '1';
    }, 10);
    
    // 自动隐藏消息（3秒后）
    setTimeout(() => {
        resultElement.style.opacity = '0';
        setTimeout(() => {
            resultElement.style.display = 'none';
        }, 300);
    }, 3000);
}

// 初始化页面动画和效果
function initPageEffects() {
    // 为特定元素添加淡入动画
    document.querySelectorAll('.fade-in-element').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 + (index * 150));
    });
    
    // 为卡片添加悬停效果
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
    });
}

// 在页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    initPageEffects();
    
    // 检查URL参数是否有登录/注册的指示
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'register') {
        const registerTab = document.getElementById('register-tab');
        if (registerTab) registerTab.click();
    }
});

// 导出需要的函数
window.register = register;
window.login = login;
window.logout = logout;
window.checkAuth = checkAuth;
window.checkAdminAuth = checkAdminAuth;
window.apiRequest = apiRequest;
window.initPageEffects = initPageEffects;

// AI 聊天功能 (通过后端代理调用 API)
async function sendAiQuery(token) {
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
        const parsedMarkdown = marked ? marked.parse(aiResponse) : aiResponse;
        
        aiMessageContainer.innerHTML = `
            <span class="badge bg-success me-2 align-self-start">AI</span>
            <div class="ai-chat-message-content markdown-body">
                ${parsedMarkdown}
            </div>
        `;
        chatBox.appendChild(aiMessageContainer);

        // 激活代码高亮
        if (hljs) {
            document.querySelectorAll('.markdown-body pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

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
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> 发送';
        chatBox.scrollTop = chatBox.scrollHeight;
        promptInput.focus();
    }
}

// 清空聊天历史
function clearChat() {
    const chatBox = document.getElementById('aiChatBox');
    const errorMessageDiv = document.getElementById('aiCharError');
    
    if (chatBox) {
        while (chatBox.firstChild) {
            chatBox.removeChild(chatBox.firstChild);
        }
        
        // 添加欢迎消息
        const welcomeMessage = document.createElement('div');
        welcomeMessage.classList.add('text-muted', 'text-center', 'my-3');
        welcomeMessage.innerHTML = '欢迎使用AI助手，请输入您的问题...';
        chatBox.appendChild(welcomeMessage);
    }
    
    if (errorMessageDiv) {
        errorMessageDiv.textContent = '';
    }
}

// 插入预设提示
function insertPrompt(text) {
    const promptInput = document.getElementById('aiPromptInput');
    if (promptInput) {
        promptInput.value = text;
        promptInput.focus();
    }
}

// 导出需要的函数
window.sendAiQuery = sendAiQuery;
window.clearChat = clearChat;
window.insertPrompt = insertPrompt;