from app import db, bcrypt
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = 'user'  # 确保表名与UserRole中的外键引用一致
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(60), nullable=False)
    
    roles = db.relationship('UserRole', backref='user', lazy='dynamic')
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def verify_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


class UserRole(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer)


class DataRecord(db.Model):     # 数据记录模型类
    __tablename__ = 'diabetes_data'

    id = db.Column(db.Integer, primary_key=True)
    Pregnancies = db.Column(db.Integer)
    Glucose = db.Column(db.Integer)
    BloodPressure= db.Column(db.Integer)
    SkinThickness = db.Column(db.Integer)
    Insulin = db.Column(db.Integer)
    BMI = db.Column(db.Float)
    DiabetesPedigreeFunction = db.Column(db.Float)
    Age = db.Column(db.Integer)
    Outcome = db.Column(db.Integer)


