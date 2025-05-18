from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app import db
import os
import pandas as pd
from app.clean.clean import save_to_database,DEFAULT_RULES 
from flask import send_file
from app.models.user import User
from app.models.feedback import Feedback
from app.models.health_info import HealthInfo
from app.train.predict import predict_single
import io
import json
import numpy as np

admin_bp = Blueprint('admin_bp', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 文件上传
@admin_bp.route('/upload', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': '没有选择文件'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': '没有选择文件'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)

            try:
                # 保存文件到本地
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)
                
                # 读取CSV文件
                df = pd.read_csv(file_path)
                
                # 保存到数据库
                if not save_to_database(df): 
                    raise Exception("数据库写入失败")
                    
                return jsonify({
                    'message': 'CSV文件上传并导入数据库成功',
                    'filename': filename,
                    'row_count': len(df)
                }), 200
                
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
            return jsonify({'error': '只允许上传CSV文件'}), 400

# 规则配置
# 1.缺省值处理：a.删除行 b.填充均值 c.填充中位数；
# 2.异常值处理：a.删除行 b.填充均值 c.填充中位数；
# 3.标准化：a.Z-Score b.不标准化
@admin_bp.route('/rules', methods=['GET', 'POST'])
def manage_rules():
    if request.method == 'GET':
        # 返回当前规则配置和可用选项
        current_rules = current_app.config.get('DATA_CLEANING_RULES', {})
        return jsonify({
            'current_rules': current_rules,
            'available_options': DEFAULT_RULES
        }), 200

    elif request.method == 'POST':
        # 更新规则配置
        data = request.get_json()
        
        # 验证数据
        required_fields = ['missing_value', 'outlier', 'normalization']
        if not all(field in data for field in required_fields):
            return jsonify({'message': '缺少必要参数'}), 400

        # 验证选项是否合法
        for field, value in data.items():
            if field in DEFAULT_RULES and value not in DEFAULT_RULES[field]['options']:
                return jsonify({'message': f'无效的{field}选项'}), 400

        # 保存到应用配置
        current_app.config['DATA_CLEANING_RULES'] = data
        
        return jsonify({
            'message': '规则更新成功',
            'updated_rules': data
        }), 200

# 数据集信息可视化
@admin_bp.route('/visualize', methods=['GET'])
def visualize_data():
    try:
        # 从查询参数获取数据，而不是请求体
        columns_str = request.args.get('columns')
        if not columns_str:
            return jsonify({'error': '缺少columns参数'}), 400
            
        # 将字符串转换为列表
        try:
            if isinstance(columns_str, str):
                columns = json.loads(columns_str)
            else:
                columns = columns_str
        except:
            # 如果是以逗号分隔的字符串，直接分割
            columns = columns_str.split(',')
        
        # 获取其他参数
        normalize = request.args.get('normalize', 'false').lower() == 'true'
        exclude_outliers = request.args.get('exclude_outliers', 'false').lower() == 'true'
        compare_by = request.args.get('compare_by')
        
        # 从数据库获取指定列的数据
        from app.models.diabetes_data import DiabetesData
        query = DiabetesData.query
        results = query.with_entities(*[getattr(DiabetesData, col) for col in columns]).all()
        
        # 转换为前端需要的格式
        data = {
            'columns': columns,
            'values': [dict(zip(columns, row)) for row in results],
            'count': len(results)
        }
        
        # 数据归一化处理
        if normalize:
            for col in columns:
                values = [item[col] for item in data['values']]
                min_val = min(values)
                max_val = max(values)
                if max_val > min_val:  # 避免除以零
                    for item in data['values']:
                        item[col] = (item[col] - min_val) / (max_val - min_val)
        
        # 去除异常值
        if exclude_outliers:
            for col in columns:
                values = np.array([item[col] for item in data['values']])
                q1 = np.percentile(values, 25)
                q3 = np.percentile(values, 75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                
                # 筛选非异常值
                filtered_values = []
                for item in data['values']:
                    is_outlier = False
                    for c in columns:
                        if item[c] < lower_bound or item[c] > upper_bound:
                            is_outlier = True
                            break
                    if not is_outlier:
                        filtered_values.append(item)
                
                data['values'] = filtered_values
        
        return jsonify({
            'message': '数据获取成功',
            'data': data
        }), 200
        
    except AttributeError as e:
        return jsonify({'error': f'无效的列名: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# 数据分析
@admin_bp.route('/analyse', methods=['POST'])
def analyse_data():
    try:
        req_data = request.get_json()
        if not req_data or 'analysis_type' not in req_data:
            return jsonify({'error': '缺少analysis_type参数'}), 400
            
        analysis_type = req_data['analysis_type']
        if analysis_type not in ['cluster', 'predict']:
            return jsonify({'error': '无效的分析类型，只支持cluster或predict'}), 400
            
        # 获取分析参数
        params = req_data.get('params', {})
        
        if analysis_type == 'cluster':
            from app.train.cluster import perform_clustering
            results = perform_clustering(params)
            return jsonify({
                'message': '聚类分析成功',
                'results': results
            }), 200
        else:
            from app.train.predict import perform_prediction
            results = perform_prediction(params)
            return jsonify({
                'message': '预测分析成功',
                'results': results
            }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 下载分析结果
@admin_bp.route('/download', methods=['GET'])
def download_results():
    try:
        # 获取分析类型和结果
        analysis_type = request.args.get('type')
        if analysis_type not in ['cluster', 'predict']:
            return jsonify({'error': '无效的分析类型'}), 400
            
        if analysis_type == 'cluster':
            from app.train.cluster import perform_clustering
            results = perform_clustering(request.args)
        else:
            from app.train.predict import perform_prediction
            results = perform_prediction(request.args)
        
        # 将结果转换为DataFrame
        df = pd.DataFrame()
        if analysis_type == 'cluster':
            for model, data in results['results'].items():
                temp_df = pd.DataFrame({
                    'Model': model,
                    'Cluster': data['clusters'],
                    'Score': data['score']
                })
                df = pd.concat([df, temp_df])
        else:
            for model, data in results['results'].items():
                temp_df = pd.DataFrame({
                    'Model': model,
                    'Prediction': data['predictions'],
                    'Accuracy': data['accuracy'],
                    'F1_Score': data['f1_score'],
                    'Recall': data['recall']
                })
                df = pd.concat([df, temp_df])
        
        # 创建内存中的Excel文件
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Results', index=False)
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'{analysis_type}_results.xlsx'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#----用户管理相关接口----
# 用户管理
@admin_bp.route('/users', methods=['GET', 'POST'])
def manage_users():
    if request.method == 'GET':
        # 获取用户列表
        users = User.query.all()
        return jsonify({
            'message': '获取用户列表成功',
            'users': [user.to_dict() for user in users]
        }), 200
        
    elif request.method == 'POST':
        # 创建新用户 - 参考auth.py的注册写法
        data = request.get_json()
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': '用户名/邮箱/密码不能为空'}), 400
            
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': '用户名已存在'}), 400
            
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': '邮箱已存在'}), 400
            
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],  # 使用password属性自动哈希
            role_id=data.get('role_id', 1)  # 默认为普通用户
        )
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': '用户创建成功',
            'user': user.to_dict()
        }), 201

@admin_bp.route('/user/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_user(user_id):
    user = User.query.get_or_404(user_id)
    
    if request.method == 'GET':
        # 获取用户详情
        return jsonify({
            'message': '获取用户详情成功',
            'user': user.to_dict()
        }), 200
        
    elif request.method == 'PUT':
        # 更新用户信息
        data = request.get_json()
        if not data:
            return jsonify({'message': '没有提供更新数据'}), 400
            
        if 'username' in data and data['username'] != user.username:
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'message': '用户名已存在'}), 400
            user.username = data['username']
            
        if 'email' in data and data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'message': '邮箱已存在'}), 400
            user.email = data['email']
            
        if 'password' in data:
            user.password = data['password']
            
        if 'role_id' in data:
            user.role_id = data['role_id']
            
        db.session.commit()
        
        return jsonify({
            'message': '用户信息更新成功',
            'user': user.to_dict()
        }), 200
        
    elif request.method == 'DELETE':
        # 删除用户
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': '用户删除成功'}), 200

@admin_bp.route('/user/<int:user_id>/health_records', methods=['GET'])
def get_user_health_records(user_id):
    # 获取用户健康信息
    user = User.query.get_or_404(user_id)
    health_infos = user.health_infos
    
    return jsonify({
        'message': '获取用户健康信息成功',
        'health_records': [{
            'id': info.id,
            'age': info.age,
            'bmi': info.bmi,
            'insulin': info.insulin,
            'skin_thickness': info.skin_thickness,
            'glucose': info.glucose,
            'created_at': info.created_at.isoformat()
        } for info in health_infos]
    }), 200

# 用户反馈管理
@admin_bp.route('/feedbacks', methods=['GET'])
def get_feedbacks():
    # 获取所有用户反馈，按时间降序排序
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    
    # 查询用户信息，便于前端显示
    feedback_list = []
    for feedback in feedbacks:
        user = User.query.get(feedback.user_id)
        feedback_data = feedback.to_dict()
        feedback_data['username'] = user.username if user else '未知用户'
        feedback_list.append(feedback_data)
    
    return jsonify({
        'message': '获取反馈列表成功',
        'feedbacks': feedback_list
    }), 200

@admin_bp.route('/feedback/<int:feedback_id>', methods=['GET', 'PUT'])
def manage_feedback(feedback_id):
    feedback = Feedback.query.get_or_404(feedback_id)
    
    if request.method == 'GET':
        # 获取反馈详情
        user = User.query.get(feedback.user_id)
        feedback_data = feedback.to_dict()
        feedback_data['username'] = user.username if user else '未知用户'
        
        return jsonify({
            'message': '获取反馈详情成功',
            'feedback': feedback_data
        }), 200
        
    elif request.method == 'PUT':
        # 更新反馈状态和回复
        data = request.get_json()
        if not data:
            return jsonify({'message': '没有提供更新数据'}), 400
        
        # 更新反馈状态
        if 'status' in data:
            feedback.status = data['status']
        
        # 添加管理员回复
        if 'admin_reply' in data:
            feedback.admin_reply = data['admin_reply']
            feedback.reply_time = db.func.current_timestamp()
        
        db.session.commit()
        
        return jsonify({
            'message': '反馈更新成功',
            'feedback': feedback.to_dict()
        }), 200

# 用户健康数据分析报告
@admin_bp.route('/health_analytics', methods=['GET'])
def get_health_analytics():
    try:
        # 获取所有用户健康记录
        health_infos = HealthInfo.query.all()
        
        if not health_infos:
            return jsonify({'message': '没有找到健康记录数据'}), 404
            
        # 提取数据，计算风险
        analytics_data = []
        for info in health_infos:
            # 准备预测数据
            features = [
                info.age,
                info.bmi,
                info.insulin,
                info.skin_thickness,
                info.glucose
            ]
            
            # 调用预测模型获取概率结果
            prediction_results = predict_single(features)
            
            # 计算平均概率
            probabilities = [result['probability'] for result in prediction_results.values()]
            avg_probability = sum(probabilities) / len(probabilities)
            
            # 记录分析所需数据
            analytics_data.append({
                'user_id': info.user_id,
                'age': info.age,
                'bmi': info.bmi,
                'insulin': info.insulin,
                'skin_thickness': info.skin_thickness,
                'glucose': info.glucose,
                'risk_probability': avg_probability,
                'created_at': info.created_at
            })
        
        # 转换为DataFrame进行统计分析
        df = pd.DataFrame(analytics_data)
        
        # 1. 年龄段分布
        age_bins = [0, 18, 30, 40, 50, 60, 70, 100]
        age_labels = ['0-18', '19-30', '31-40', '41-50', '51-60', '61-70', '71+']
        df['age_group'] = pd.cut(df['age'], bins=age_bins, labels=age_labels)
        age_distribution = df['age_group'].value_counts().sort_index().to_dict()
        
        # 2. BMI指数分布
        bmi_bins = [0, 18.5, 24.9, 29.9, 34.9, 39.9, 100]
        bmi_labels = ['偏瘦', '正常', '超重', '轻度肥胖', '中度肥胖', '重度肥胖']
        df['bmi_group'] = pd.cut(df['bmi'], bins=bmi_bins, labels=bmi_labels)
        bmi_distribution = df['bmi_group'].value_counts().sort_index().to_dict()
        
        # 3. 糖尿病风险分布
        risk_bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
        risk_labels = ['极低风险', '低风险', '中等风险', '高风险', '极高风险']
        df['risk_group'] = pd.cut(df['risk_probability'], bins=risk_bins, labels=risk_labels)
        risk_distribution = df['risk_group'].value_counts().sort_index().to_dict()
        
        # 4. 每月健康记录数量趋势
        df['month'] = pd.to_datetime(df['created_at']).dt.to_period('M')
        monthly_records = df.groupby('month').size()
        monthly_trend = {str(k): int(v) for k, v in monthly_records.items()}
        
        # 5. 平均BMI和年龄随风险概率的变化
        risk_bmi_age = df.groupby('risk_group')[['bmi', 'age']].mean().to_dict()
        
        # 6. 关键统计指标
        stats = {
            'total_records': len(df),
            'total_users': df['user_id'].nunique(),
            'avg_age': df['age'].mean(),
            'avg_bmi': df['bmi'].mean(),
            'avg_insulin': df['insulin'].mean(),
            'avg_glucose': df['glucose'].mean(),
            'high_risk_percentage': (df['risk_probability'] > 0.6).mean() * 100
        }
        
        # 整合所有分析结果
        result = {
            'age_distribution': age_distribution,
            'bmi_distribution': bmi_distribution,
            'risk_distribution': risk_distribution,
            'monthly_trend': monthly_trend,
            'risk_bmi_age_correlation': risk_bmi_age,
            'statistics': stats
        }
        
        return jsonify({
            'message': '健康数据分析成功',
            'analytics': result
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 导出健康数据分析报告
@admin_bp.route('/health_analytics/export', methods=['GET'])
def export_health_analytics():
    try:
        # 获取所有用户健康记录
        health_infos = HealthInfo.query.all()
        
        if not health_infos:
            return jsonify({'message': '没有找到健康记录数据'}), 404
        
        # 提取数据并计算风险概率
        data = []
        for info in health_infos:
            # 获取用户信息
            user = User.query.get(info.user_id)
            username = user.username if user else '未知用户'
            
            # 计算风险概率
            features = [info.age, info.bmi, info.insulin, info.skin_thickness, info.glucose]
            prediction_results = predict_single(features)
            probabilities = [result['probability'] for result in prediction_results.values()]
            avg_probability = sum(probabilities) / len(probabilities)
            
            # 记录数据
            data.append({
                'user_id': info.user_id,
                'username': username,
                'age': info.age,
                'bmi': info.bmi,
                'insulin': info.insulin,
                'skin_thickness': info.skin_thickness,
                'glucose': info.glucose,
                'risk_probability': avg_probability,
                'created_at': info.created_at.isoformat()
            })
        
        # 创建Excel工作簿
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # 详细数据表
            df = pd.DataFrame(data)
            df.to_excel(writer, sheet_name='详细数据', index=False)
            
            # 生成统计数据
            workbook = writer.book
            
            # 年龄统计表
            age_bins = [0, 18, 30, 40, 50, 60, 70, 100]
            age_labels = ['0-18岁', '19-30岁', '31-40岁', '41-50岁', '51-60岁', '61-70岁', '71岁以上']
            df['年龄段'] = pd.cut(df['age'], bins=age_bins, labels=age_labels)
            age_stats = df['年龄段'].value_counts().reset_index()
            age_stats.columns = ['年龄段', '人数']
            age_stats.to_excel(writer, sheet_name='年龄分布', index=False)
            
            # 风险统计表
            risk_bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
            risk_labels = ['极低风险', '低风险', '中等风险', '高风险', '极高风险']
            df['风险等级'] = pd.cut(df['risk_probability'], bins=risk_bins, labels=risk_labels)
            risk_stats = df['风险等级'].value_counts().reset_index()
            risk_stats.columns = ['风险等级', '人数']
            risk_stats.to_excel(writer, sheet_name='风险分布', index=False)
            
            # BMI统计表
            bmi_bins = [0, 18.5, 24.9, 29.9, 34.9, 39.9, 100]
            bmi_labels = ['偏瘦', '正常', '超重', '轻度肥胖', '中度肥胖', '重度肥胖']
            df['BMI分类'] = pd.cut(df['bmi'], bins=bmi_bins, labels=bmi_labels)
            bmi_stats = df['BMI分类'].value_counts().reset_index()
            bmi_stats.columns = ['BMI分类', '人数']
            bmi_stats.to_excel(writer, sheet_name='BMI分布', index=False)
        
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='健康数据分析报告.xlsx'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

