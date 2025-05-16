const API_BASE = 'http://localhost:5000/api';

async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const result = await response.json();
        document.getElementById('result').innerHTML = 
            `注册结果: ${JSON.stringify(result)}`;
    } catch (error) {
        console.error('注册错误:', error);
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        document.getElementById('result').innerHTML = 
            `登录结果: ${JSON.stringify(result)}`;
    } catch (error) {
        console.error('登录错误:', error);
    }
}