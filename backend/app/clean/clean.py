import pandas as pd
import numpy as np
from flask import current_app
from sklearn.preprocessing import StandardScaler
import os
from app import db
from sqlalchemy import text
from sklearn.ensemble import IsolationForest

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

def detect_outliers(df, numeric_cols): #df是数据框，numeric_cols是数值型列
    """使用隔离森林检测异常值"""
    # 排除二元变量列
    numeric_cols = [col for col in numeric_cols if col not in df.select_dtypes(include=['category']).columns]  #从 numeric_cols 列表中排除数据框 df 中数据类型为 category 的列
    numeric_cols = [col for col in numeric_cols if col not in ['heart_disease', 'hypertension', 'diabetes']]
    if not numeric_cols:                #df中没有数值型列，则返回原始数据框
        return df

    scaler = StandardScaler()            #标准化数据
    clf = IsolationForest(contamination=0.1, random_state=42)  #一种无监督学习算法，专门用于异常值检测。它通过随机选择特征和分割点来构建决策树，利用异常值更容易被隔离的特性来识别异常。

    for column in numeric_cols:
        if column in df.columns:
            data = scaler.fit_transform(df[[column]])
            outliers = clf.fit_predict(data)    #fit_predict()方法用于训练模型并预测数据的标签
            df[f'{column}_is_outlier'] = [1 if x == -1 else 0 for x in outliers] #新加一列，标记谁是异常值
    return df

def clean_data(df):
    """根据配置规则清洗数据"""
    rules = current_app.config.get('DATA_CLEANING_RULES', {'missing_value':'median','outlier':'drop','normalization':'zscore'})
    
    # 指定需要处理缺失值的列
    target_columns = ['BloodPressure', 'SkinThickness', 'Insulin', 'BMI']

    # 缺失值处理（检测到'0'或NaN都处理）
    print(rules)
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
    
    # 异常值处理 (使用孤立森林方法检测异常值)
    if 'outlier' in rules:
        numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
        df = detect_outliers(df, numeric_cols)

        if rules['outlier'] == 'drop':
            outlier_cols = [col for col in df.columns if col.endswith('_is_outlier')]
            for col in outlier_cols:
                base_col = col.replace('_is_outlier', '')
                df = df[df[col] != 1]  # 删除异常值
        elif rules['outlier'] == 'mean':
            outlier_cols = [col for col in df.columns if col.endswith('_is_outlier')]
            for col in outlier_cols:
                base_col = col.replace('_is_outlier', '')
                df[base_col] = df[base_col].astype(float)
                df.loc[df[col] == 1, base_col] = df[base_col].mean()
        elif rules['outlier'] == 'median':
            outlier_cols = [col for col in df.columns if col.endswith('_is_outlier')]
            for col in outlier_cols:
                base_col = col.replace('_is_outlier', '')
                df[base_col] = df[base_col].astype(float)
                df.loc[df[col] == 1, base_col] = df[base_col].median()

        #删除标签
        outlier_cols = [col for col in df.columns if col.endswith('_is_outlier')]
        df = df.drop(columns=outlier_cols)


    # 标准化处理
    if 'normalization' in rules and rules['normalization'] == 'zscore' :
        numeric_cols = [col for col in df.select_dtypes(include=[np.number]).columns if col != 'Outcome']
        # 转为 float 类型，避免类型冲突
        df[numeric_cols] = df[numeric_cols].astype(float)
        # 标准化
        df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].mean()) / df[numeric_cols].std()


    return df

def save_clean_csv(df, filename):
    # 获取文件名和扩展名
    name, ext = os.path.splitext(filename)
    # 构造新文件名
    clean_filename = f"{name}_clean{ext}"
    # 构造完整路径
    save_path = os.path.join('uploads', clean_filename)
    # 保存为csv
    df.to_csv(save_path, index=False, encoding='utf-8-sig')
    return save_path


def save_to_database(df):
    """将DataFrame数据保存到数据库"""
    try:
        # 先执行数据清洗
        df = clean_data(df)
        
        # 再进行类型转换
        df = df.astype({
            'Pregnancies': 'float',
            'Glucose': 'float',
            'BloodPressure': 'float',
            'SkinThickness': 'float',
            'Insulin': 'float',
            'BMI': 'float',
            'DiabetesPedigreeFunction': 'float',
            'Age': 'float',
            'Outcome': 'int'
        }, errors='ignore')

        save_clean_csv(df, 'original.csv')

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
