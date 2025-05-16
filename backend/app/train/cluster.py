from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from app.models.diabetes_data import DiabetesData
from app import db
import numpy as np
import pandas as pd

def perform_clustering(params):
    # 获取数据
    query = DiabetesData.query
    data = query.all()
    
    # 提取特征
    features = np.array([
        [d.Age, d.BMI, d.Insulin, d.SkinThickness, d.Glucose] 
        for d in data
    ])
    
    # 数据标准化
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    
    # 聚类分析 - 比较多个模型
    n_clusters = params.get('n_clusters', 3)
    eps = params.get('eps', 0.5)
    
    models = {
        'KMeans': KMeans(n_clusters=n_clusters, random_state=42),
        'DBSCAN': DBSCAN(eps=eps),
        'Agglomerative': AgglomerativeClustering(n_clusters=n_clusters)
    }
    
    results = {}
    for name, model in models.items():
        clusters = model.fit_predict(features_scaled)
        score = silhouette_score(features_scaled, clusters) if len(set(clusters)) > 1 else -1
        
        if hasattr(model, 'cluster_centers_'):
            centers = scaler.inverse_transform(model.cluster_centers_)
        else:
            centers = []
            
        results[name] = {
            'clusters': clusters.tolist(),
            'centers': centers.tolist(),
            'score': score
        }
    
    return {
        'results': results,
        'feature_names': ['Age', 'BMI', 'Insulin', 'SkinThickness', 'Glucose'],
        'best_model': max(results.items(), key=lambda x: x[1]['score'])[0]
    }