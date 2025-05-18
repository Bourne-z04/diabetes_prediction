from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from flask_jwt_extended import JWTManager

# 初始化数据库
db = SQLAlchemy()
# 初始化JWT
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)    # 初始化数据库
    jwt.init_app(app)   # 初始化JWT

    # 配置CORS，允许所有来源的请求
    CORS(app, resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"]
    }})
    
    # 添加一个通用路由处理OPTIONS请求
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def options_handler(path):
        return jsonify({}), 200

    # 注册蓝图
    from app.routes.auth import auth_bp  
    from app.routes.user import user_bp
    from app.routes.admin import admin_bp  
    

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # JWT错误处理
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'message': '无效的令牌',
            'error': 'invalid_token'
        }), 401
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({
            'message': '缺少令牌',
            'error': 'authorization_required'
        }), 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'message': '令牌已过期',
            'error': 'token_expired'
        }), 401
    
    return app
