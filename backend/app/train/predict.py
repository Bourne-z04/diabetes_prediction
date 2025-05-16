from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from app.models.diabetes_data import DiabetesData
from app import db
import numpy as np
import joblib
import os

MODEL_FILE = 'diabetes_models.pkl'

def train_models():
    # 获取训练数据
    query = DiabetesData.query
    data = query.all()
    
    # 准备特征和标签
    X = np.array([
        [d.Age, d.BMI, d.Insulin, d.SkinThickness, d.Glucose] 
        for d in data
    ])
    y = np.array([d.Outcome for d in data])
    
    # 定义和训练多个模型
    models = {
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
        'LogisticRegression': LogisticRegression(max_iter=1000),
        'SVM': SVC(probability=True)
    }
    
    # 训练所有模型
    for model in models.values():
        model.fit(X, y)
    
    # 保存训练好的模型
    joblib.dump(models, MODEL_FILE)
    return models

def load_models():
    if os.path.exists(MODEL_FILE):
        return joblib.load(MODEL_FILE)
    return train_models()

def predict_single(features):
    """
    使用所有训练好的模型对单条数据进行预测
    参数:
        features: 包含[Age, BMI, Insulin, SkinThickness, Glucose]的列表
    返回:
        包含各模型预测概率的字典
    """
    models = load_models()
    results = {}
    
    for name, model in models.items():
        proba = model.predict_proba([features])[0][1]
        results[name] = {
            'probability': float(proba),
            'accuracy': None  # 单条预测无法计算准确率
        }
    
    return results

def evaluate_models():
    """
    评估所有模型的性能
    """
    models = load_models()
    query = DiabetesData.query
    data = query.all()
    
    X = np.array([
        [d.Age, d.BMI, d.Insulin, d.SkinThickness, d.Glucose] 
        for d in data
    ])
    y = np.array([d.Outcome for d in data])
    
    # 分割数据集
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    results = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        results[name] = {
            'accuracy': accuracy_score(y_test, y_pred)
        }
    
    return results