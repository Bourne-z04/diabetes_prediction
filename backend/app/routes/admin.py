from flask import Blueprint, request, jsonify,current_app
from werkzeug.utils import secure_filename
from app import db
import os
import pandas as pd
from app.clean.clean import save_to_database,DEFAULT_RULES 
from flask import send_file
import io

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
        # 获取前端传递的参数
        req_data = request.get_json()
        if not req_data or 'columns' not in req_data:
            return jsonify({'error': '缺少columns参数'}), 400
            
        columns = req_data['columns']
        
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

