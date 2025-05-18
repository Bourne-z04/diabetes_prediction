from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user_health_info import UserHealthInfo
from app.models.health_info import HealthInfo
from app.models.feedback import Feedback
from app.train.predict import predict_single  # 新增导入
import requests
import os

user_bp = Blueprint('user_bp', __name__)

# 从环境变量或配置中获取DeepSeek API密钥
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', 'sk-817c497b1f8e45b69c63b79b054d985a')
DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

# 新增AI聊天代理接口
@user_bp.route('/ai_chat', methods=['POST'])
@jwt_required()
def ai_chat_proxy():
    try:
        data = request.get_json()
        
        if not data or not data.get('prompt'):
            return jsonify({'error': '请求内容不能为空'}), 400
            
        # 准备发送给DeepSeek API的数据
        api_request_body = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant specialized in diabetes health management."},
                {"role": "user", "content": data.get('prompt')}
            ],
            "stream": False
        }
        
        # 调用DeepSeek API
        response = requests.post(
            DEEPSEEK_API_URL,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
            },
            json=api_request_body
        )
        
        # 检查响应状态
        if response.status_code != 200:
            return jsonify({
                'error': f'AI服务请求失败: {response.status_code}',
                'details': response.text
            }), 500
            
        # 返回AI响应
        return jsonify(response.json()), 200
        
    except Exception as e:
        return jsonify({'error': f'AI聊天请求错误: {str(e)}'}), 500

# 用户保存健康信息
@user_bp.route('/saveinfo', methods=['GET', 'POST'])
@jwt_required()
def handle_user_info():
    if request.method == 'POST':
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        # 创建健康信息记录
        health_info = HealthInfo(
            user_id=current_user_id,
            age=data.get('age'),
            bmi=data.get('bmi'),
            insulin=data.get('insulin'),
            skin_thickness=data.get('skin_thickness'),
            glucose=data.get('glucose')
        )
        db.session.add(health_info)
        db.session.flush()  # 获取新创建的health_info的ID
        
        # 创建用户健康信息关联记录
        user_health_info = UserHealthInfo(
            user_id=current_user_id,
            health_info_id=health_info.id
        )
        db.session.add(user_health_info)
        db.session.commit()
        
        return jsonify({
            'message': '健康信息保存成功',
            'health_info_id': health_info.id
        }), 201
    
# 用户获取预测结果(包含导出功能)
@user_bp.route('/predict', methods=['GET'])
@jwt_required()
def get_prediction():
    try:
        current_user_id = get_jwt_identity()
        
        # 获取用户最新健康信息
        health_info = HealthInfo.query.filter_by(user_id=current_user_id)\
            .order_by(HealthInfo.created_at.desc()).first()
            
        if not health_info:
            return jsonify({'error': '未找到健康信息'}), 404
            
        # 准备预测数据
        features = [
            health_info.age,
            health_info.bmi,
            health_info.insulin,
            health_info.skin_thickness,
            health_info.glucose
        ]
        
        # 调用预测模型获取概率结果
        prediction_results = predict_single(features)
        
        # 计算平均概率
        probabilities = [result['probability'] for result in prediction_results.values()]
        avg_probability = sum(probabilities) / len(probabilities)
        
        # 准备响应数据(包含导出所需全部信息)
        response_data = {
            'probability': avg_probability,
            'model_details': prediction_results,
            'health_info': {
                'age': health_info.age,
                'bmi': health_info.bmi,
                'insulin': health_info.insulin,
                'skin_thickness': health_info.skin_thickness,
                'glucose': health_info.glucose,
                'created_at': health_info.created_at.isoformat()  # 添加时间戳用于导出
            },
            'export_ready': True  # 标记数据可用于导出
        }
        
        # 检查是否请求导出格式
        if request.args.get('export') == 'true':
            response_data['export_format'] = 'full'  # 标识为完整导出格式
            return jsonify(response_data), 200, {
                'Content-Disposition': f'attachment; filename=prediction_export_{current_user_id}.json'
            }
            
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 用户提交反馈
@user_bp.route('/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('content'):
            return jsonify({'error': '反馈内容不能为空'}), 400
        
        # 创建反馈记录
        feedback = Feedback(
            user_id=current_user_id,
            content=data['content'],
            contact=data.get('contact', '')
        )
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'message': '反馈提交成功',
            'feedback_id': feedback.id,
            'user_id': current_user_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 用户获取所有健康记录历史
@user_bp.route('/health_records', methods=['GET'])
@jwt_required()
def get_health_records():
    try:
        current_user_id = get_jwt_identity()
        
        # 获取用户所有健康信息，按时间降序排序
        health_infos = HealthInfo.query.filter_by(user_id=current_user_id)\
            .order_by(HealthInfo.created_at.desc()).all()
            
        if not health_infos:
            return jsonify([]), 200
            
        # 为每个健康记录计算预测结果
        records = []
        for health_info in health_infos:
            # 准备预测数据
            features = [
                health_info.age,
                health_info.bmi,
                health_info.insulin,
                health_info.skin_thickness,
                health_info.glucose
            ]
            
            # 调用预测模型获取概率结果
            prediction_results = predict_single(features)
            
            # 计算平均概率
            probabilities = [result['probability'] for result in prediction_results.values()]
            avg_probability = sum(probabilities) / len(probabilities)
            
            # 构建记录数据
            record = {
                'id': health_info.id,
                'probability': avg_probability,
                'model_details': prediction_results,
                'health_info': {
                    'age': health_info.age,
                    'bmi': health_info.bmi,
                    'insulin': health_info.insulin,
                    'skin_thickness': health_info.skin_thickness,
                    'glucose': health_info.glucose
                },
                'created_at': health_info.created_at.isoformat()
            }
            records.append(record)
        
        return jsonify(records), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 用户获取特定健康记录的预测结果（支持导出）
@user_bp.route('/predict/<int:record_id>', methods=['GET'])
@jwt_required()
def get_specific_prediction(record_id):
    try:
        current_user_id = get_jwt_identity()
        
        # 获取特定的健康信息记录
        health_info = HealthInfo.query.filter_by(id=record_id, user_id=current_user_id).first()
            
        if not health_info:
            return jsonify({'error': '未找到健康信息或无权访问'}), 404
            
        # 准备预测数据
        features = [
            health_info.age,
            health_info.bmi,
            health_info.insulin,
            health_info.skin_thickness,
            health_info.glucose
        ]
        
        # 调用预测模型获取概率结果
        prediction_results = predict_single(features)
        
        # 计算平均概率
        probabilities = [result['probability'] for result in prediction_results.values()]
        avg_probability = sum(probabilities) / len(probabilities)
        
        # 准备响应数据
        response_data = {
            'id': health_info.id,
            'probability': avg_probability,
            'model_details': prediction_results,
            'health_info': {
                'age': health_info.age,
                'bmi': health_info.bmi,
                'insulin': health_info.insulin,
                'skin_thickness': health_info.skin_thickness,
                'glucose': health_info.glucose,
                'created_at': health_info.created_at.isoformat()
            },
            'export_ready': True
        }
        
        # 检查是否请求导出格式
        if request.args.get('export') == 'true':
            response_data['export_format'] = 'full'
            return jsonify(response_data), 200, {
                'Content-Disposition': f'attachment; filename=prediction_export_{record_id}_{current_user_id}.json'
            }
            
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500