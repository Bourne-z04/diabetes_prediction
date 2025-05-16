from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import db
from app.models.user import User

auth_bp = Blueprint('auth_bp', __name__)

# 用户注册
@auth_bp.route('/register', methods=['POST'])  
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': '用户名/邮箱/密码不能为空'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': '用户名已存在'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': '邮箱已存在'}), 400

    user = User(username=data['username'], 
               email=data['email'],
               password=data['password'],  # 使用password属性会自动哈希
               role_id=1)  # 设置默认角色ID
               
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': '注册成功', 'user': user.to_dict()}), 201
    
# 用户登录
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': '邮箱/密码不能为空'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': '邮箱或密码错误'}), 401 
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': '登录成功',
        'token': access_token,
        'user': user.to_dict()
    }), 200