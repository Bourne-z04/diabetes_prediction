const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
    : '/api';

// 通用请求函数
async function apiRequest(url, method = 'GET', data = null, token = null, retries = 2) {
    console.log(`API请求开始: [${method}] ${url}`, data ? '数据:' : '', data || '');
    
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
        // 添加凭证模式，允许发送和接收cookie
        credentials: 'include'
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
        const response = await Promise.race([
            fetch(finalUrl, options),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('请求超时，请检查网络连接')), 15000)
            )
        ]);
        
        // 检查响应状态
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // 特殊处理405错误（Method Not Allowed）
            if (response.status === 405) {
                console.error(`API方法不允许: ${method} ${url}`);
                
                // 如果是GET方法不被允许，尝试使用POST
                if (method === 'GET' && retries > 0) {
                    console.log(`尝试将GET请求切换为POST请求...`);
                    return apiRequest(url, 'POST', data, token, retries - 1);
                }
                
                throw new Error(`请求方法不被允许：${method}。请联系管理员`);
            }
            
            const errorMessage = errorData.message || `服务器返回错误状态: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log(`API请求成功: [${method}] ${url}`, result ? '返回数据摘要:' : '', result ? (typeof result === 'object' ? '对象/数组' : result) : '');
        return result;
    } catch (error) {
        console.error(`API请求错误 (${method} ${finalUrl}):`, error);
        
        // 如果是网络错误并且还有重试次数，则重试
        if ((error.message === 'Failed to fetch' || error.message.includes('网络') || error.message.includes('超时')) && retries > 0) {
            console.log(`尝试重新连接(剩余${retries}次)...`);
            // 延迟一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000));
            return apiRequest(url, method, data, token, retries - 1);
        }
        
        // 转换通用错误消息为更友好的提示
        if (error.message === 'Failed to fetch') {
            throw new Error('无法连接到服务器，请检查网络连接或联系管理员');
        }
        
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

// AI 聊天功能 (通过后端代理调用 AI API)
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
        const parsedMarkdown = marked ? marked.parse(aiResponse) : aiResponse;
        
        aiMessageContainer.innerHTML = `
            <span class="badge bg-success me-2 align-self-start">AI</span>
            <div class="ai-chat-message-content markdown-body">
                ${parsedMarkdown}
            </div>
        `;
        chatBox.appendChild(aiMessageContainer);

        // 如果页面有代码高亮
        if (typeof hljs !== 'undefined') {
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
    }
}

window.sendAiQuery = sendAiQuery;

// 提交用户反馈
async function submitFeedback(token) {
    const content = document.getElementById('feedbackContent').value;
    const contact = document.getElementById('contactInfo').value;
    
    if (!content) {
        showMessage('反馈内容不能为空', 'error');
        return;
    }
    
    try {
        const result = await apiRequest('/user/feedback', 'POST', {
            content,
            contact
        }, token);
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
        modal.hide();
        
        // 清空表单
        document.getElementById('feedbackContent').value = '';
        document.getElementById('contactInfo').value = '';
        
        showMessage('感谢您的反馈！我们会尽快处理', 'success');
    } catch (error) {
        showMessage(`提交反馈失败: ${error.message}`, 'error');
    }
}

window.submitFeedback = submitFeedback;

// 清空聊天框
function clearChat() {
    const chatBox = document.getElementById('aiChatBox');
    if (chatBox) {
        chatBox.innerHTML = '<div class="text-muted text-center">你好！我是您的 AI 助手，有什么可以帮助您的吗？</div>';
    }
}

window.clearChat = clearChat;

// 插入预设问题到输入框
function insertPrompt(text) {
    const inputElement = document.getElementById('aiPromptInput');
    if (inputElement) {
        inputElement.value = text;
        inputElement.focus();
    }
}

window.insertPrompt = insertPrompt;