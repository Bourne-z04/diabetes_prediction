import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://root:041105zby@localhost:3306/data_analysis'
    SQLALCHEMY_TRACK_MODIFICATIONS = False