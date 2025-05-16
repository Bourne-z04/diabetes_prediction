import pandas as pd
import numpy as np
from flask import current_app
from app import db
from sqlalchemy import text

# 默认规则配置
DEFAULT_RULES = {
    'missing_value': {
        'options': ['drop', 'mean', 'median'],
        'default': 'median'
    },
    'outlier': {
        'options': ['drop', 'mean', 'median'],
        'default': 'drop'
    },
    'normalization': {
        'options': ['zscore', 'none'],
        'default': 'zscore'
    }
}

def clean_data(df):
    """根据配置规则清洗数据"""
    rules = current_app.config.get('DATA_CLEANING_RULES', {})
    
    # 指定需要处理的列
    target_columns = ['BloodPressure', 'SkinThickness', 'Insulin', 'BMI']

    # 缺失值处理（检测到'0'或NaN都处理）
    if 'missing_value' in rules:
        for col in target_columns:
            if col in df.columns:
                df[col] = df[col].replace(0, np.nan)
                print(df)
                if rules['missing_value'] == 'drop':
                    df = df.dropna(subset=[col])
                elif rules['missing_value'] == 'mean':
                    df[col] = df[col].fillna(df[col].mean())
                elif rules['missing_value'] == 'median':
                    df[col] = df[col].fillna(df[col].median())
    
    # 异常值处理 (使用IQR方法检测异常值)
    if 'outlier' in rules:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            if rules['outlier'] == 'drop':
                df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
            elif rules['outlier'] == 'mean':
                df.loc[(df[col] < lower_bound) | (df[col] > upper_bound), col] = df[col].mean()
            elif rules['outlier'] == 'median':
                df.loc[(df[col] < lower_bound) | (df[col] > upper_bound), col] = df[col].median()
    
    # 标准化处理
    if 'normalization' in rules and rules['normalization'] == 'zscore':
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].mean()) / df[numeric_cols].std()
    
    return df

def save_to_database(df):
    """将DataFrame数据保存到数据库"""
    try:
        # 先执行数据清洗
        df = clean_data(df)
        
        # 再进行类型转换
        df = df.astype({
            'Pregnancies': 'int',
            'Glucose': 'int', 
            'BloodPressure': 'int',
            'SkinThickness': 'int',
            'Insulin': 'int',
            'BMI': 'float',
            'DiabetesPedigreeFunction': 'float',
            'Age': 'int',
            'Outcome': 'int'
        }, errors='ignore')
        
        # 清空现有数据
        db.session.execute(text('TRUNCATE TABLE diabetes_data'))
        
        # 批量插入数据
        data = df.to_dict('records')
        db.session.execute(
            text('''
                INSERT INTO diabetes_data 
                (Pregnancies, Glucose, BloodPressure, SkinThickness, 
                 Insulin, BMI, DiabetesPedigreeFunction, Age, Outcome)
                VALUES 
                (:Pregnancies, :Glucose, :BloodPressure, :SkinThickness,
                 :Insulin, :BMI, :DiabetesPedigreeFunction, :Age, :Outcome)
            '''),
            data
        )
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"数据库写入失败: {str(e)}")
        raise e
