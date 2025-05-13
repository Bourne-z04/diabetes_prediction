from flask import render_template, request, flash, redirect, url_for
import pandas as pd
from werkzeug.utils import secure_filename
import os
from . import admin
from sqlalchemy.sql import text

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}
RULES_DIR= 'cleaning_rules'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_cleaning_rules(rule_name='default'):  # 从json文件中加载用户名
    """根据规则名称加载清洗规则"""
    rule_file = f'{rule_name}_rules.json'  # 拼接文件名
    rule_path = os.path.join(RULES_DIR, rule_file)  # 合成文件路径

    if not os.path.exists(rule_path):  # 如果文件不存在，则加载默认规则
        rule_path = os.path.join(RULES_DIR, 'default_rules.json')

    with open(rule_path, 'r', encoding='utf-8') as f:  # 打开json文件
        import json
        return json.load(f)  # 读取json文件内容并返回字典对象

def clean_basic(df, rules):
    """根据规则清洗数据"""

    # 删除规则
    if rules['drop_rules'].get('dropna'):
        df = df.dropna()
    if rules['drop_rules'].get('drop_duplicates'):
        df = df.drop_duplicates()
    if 'drop_columns' in rules['drop_rules']:
        df = df.drop(columns=rules['drop_rules']['drop_columns'], errors='ignore')

    # 替换规则
    for column, rule in rules['replace_rules'].items():
        if column in df.columns:
            if rule.get('type') == 'numeric':
                for old_value, replacement in rule['replacements'].items():
                    mask = df[column] == float(old_value)
                    if replacement['method'] == 'median':
                        df.loc[mask, column] = round(df[column].median())
                    elif replacement['method'] == 'mean':
                        df.loc[mask, column] = df[column].mean()

    # 类型转换规则
    for column, conversion in rules['type_conversion'].items():
        if column in df.columns:
            if isinstance(conversion, dict):
                if conversion.get('handle_invalid') == 'mean': #平均值
                    df[column] = pd.to_numeric(df[column], errors='coerce')
                    df[column] = df[column].fillna(df[column].mean())
                elif conversion.get('handle_invalid') == 'drop':    #删除
                    df[column] = pd.to_numeric(df[column], errors='coerce')
                    df = df.dropna(subset=[column])
                elif conversion.get('handle_invalid') == 'custom': #用自定义值填充，须在json里定义
                    df[column] = pd.to_numeric(df[column], errors='coerce')
                    df[column] = df[column].fillna(conversion['custom_value'])
                elif conversion.get('handle_invalid') == 'mode':#众数
                    mode_value = df[column].mode()[0]    #[0]是返回第一个众数
                    df[column] = df[column].fillna(mode_value)
                df[column] = df[column].astype(conversion['type'])
            else:
                df[column] = df[column].astype(conversion)

    # 范围规则
    for column, range_rule in rules.get('range_rules', {}).items():
        if column in df.columns:
            if 'min' in range_rule:
                df[column] = df[column].clip(lower=range_rule['min'])  #设定最小值
            if 'max' in range_rule:
                df[column] = df[column].clip(upper=range_rule['max'])    #设定最大值
            if range_rule.get('handle_out_of_range') == 'mean':        #均值填充
                mean_value = df[column].mean()
                df[column] = df[column].where(
                    (df[column] >= range_rule.get('min', float('-inf'))) &
                    (df[column] <= range_rule.get('max', float('inf'))),
                    mean_value
                )
            elif range_rule.get('handle_out_of_range') == 'drop':             #删除
                df = df[(df[column] >= range_rule.get('min', float('-inf'))) &
                        (df[column] <= range_rule.get('max', float('inf')))]
            elif range_rule.get('handle_out_of_range') == 'custom':         #用自定义值填充，须在json里定义
                df[column] = df[column].where(
                    (df[column] >= range_rule.get('min', float('-inf'))) &
                    (df[column] <= range_rule.get('max', float('inf'))),
                    range_rule['custom_value']
                )
            elif range_rule.get('handle_out_of_range') == 'mode':          #众数
                mode_value = df[column].mode()[0]
                df[column] = df[column].where(
                    (df[column] >= range_rule.get('min', float('-inf'))) &
                    (df[column] <= range_rule.get('max', float('inf'))),
                    mode_value
                )
            elif range_rule.get('handle_out_of_range') == 'median':
                median_value = df[column].median()
                df[column] = df[column].where(
                    (df[column] >= range_rule.get('min', float('-inf'))) &
                    (df[column] <= range_rule.get('max', float('inf'))),
                    median_value
                )


    # 重命名列
    if 'rename_columns' in rules:          #如果json文件中有重命名规则
        df = df.rename(columns=rules['rename_columns'])

    # 自定义规则
    for column in rules.get('custom_rules', {}).get('uppercase_columns', []):   #大写字母
        if column in df.columns:
            df[column] = df[column].str.upper()
    for column in rules.get('custom_rules', {}).get('strip_whitespace', []):
        if column in df.columns:
            df[column] = df[column].str.strip()  #去除首尾空格

    return df

@admin.route('/upload', methods=['GET', 'POST'])
def upload_file():
    preview_data = None
    if request.method == 'POST':
        if 'file' not in request.files:
            return '<script>alert("没有选择文件"); window.history.back();</script>'
        
        file = request.files['file']
        if file.filename == '':
            return '<script>alert("没有选择文件"); window.history.back();</script>'


        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(filepath)

            file.seek(0)
            df = pd.read_csv(file)

            preview_data = {
                'headers': df.columns.tolist(),
                'rows': df.head(5).values.tolist(),  # 显示前5行
                'total_rows': len(df)
            }

            try:
                from app import db

                rules = load_cleaning_rules('default')  # 加载默认规则
                df = clean_basic(df, rules)  # 清洗数据

                # 导入数据
                df.to_sql('diabetes_data', db.engine, if_exists='append', index=False)

                # 验证数据是否导入成功
                with db.engine.connect() as conn:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {'diabetes_data'}")).fetchone()
                    if result[0] == len(df):
                        flash('数据导入成功!', 'success')
                    else:
                        flash('数据导入失败！', 'warning')
                return '<script>alert("文件上传成功"); window.location.href="/admin";</script>'
            except Exception as e:
                return f'<script>alert("文件处理错误: {str(e)}"); window.history.back();</script>'
    
    return render_template('admin/upload.html', preview_data=preview_data)

@admin.route('/')
def index():
    return render_template('admin/index.html')