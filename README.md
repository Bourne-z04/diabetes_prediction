# 糖尿病预测系统 - Docker部署指南

## 项目概述
这是一个糖尿病预测系统，包含前端和后端组件，使用Docker进行容器化部署。

## 部署前准备

### 必要条件
- Docker (20.10+)
- Docker Compose (2.0+)
- Git

## 部署步骤

### 1. 获取代码
```bash
git clone <您的代码仓库地址>
cd diabetes_prediction
```

### 2. 配置环境变量（可选）
如需修改默认配置，可以编辑`docker-compose.yml`文件中的环境变量。

### 3. 启动应用
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 4. 访问应用
- 前端页面：http://服务器IP
- 后端API：http://服务器IP:5000

## 常见问题排查

### 数据库连接问题
如果遇到数据库连接问题，请检查：
```bash
# 查看所有容器状态
docker-compose ps

# 检查数据库容器日志
docker-compose logs db
```

### 应用更新
当代码更新后，执行以下命令重新构建并部署：
```bash
# 停止所有服务
docker-compose down

# 重新构建并启动
docker-compose up --build -d
```

## 备份数据
要备份MySQL数据，可以执行：
```bash
docker exec -it diabetes_prediction_db_1 mysqldump -u root -p diabetes > backup.sql
```

## 安全注意事项
- 在生产环境中，请修改所有默认密码
- 建议使用HTTPS保护前端和API通信
- 限制数据库端口的访问，只允许内部网络访问 