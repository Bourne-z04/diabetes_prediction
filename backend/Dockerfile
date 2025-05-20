FROM python:3.11-slim

WORKDIR /app

# 安装MySQL客户端工具
RUN apt-get update && apt-get install -y default-mysql-client && apt-get clean

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 设置脚本权限
RUN chmod +x wait-for-db.sh

# 设置环境变量
ENV DATABASE_URL="mysql://user:password@db:3306/diabetes"
ENV FLASK_APP=run.py
ENV FLASK_ENV=production

# 暴露端口
EXPOSE 5000

# 使用等待脚本等待MySQL启动后再启动应用
CMD ["./wait-for-db.sh", "db", "python", "run.py"] 