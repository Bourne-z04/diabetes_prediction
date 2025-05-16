from app import db

class UserHealthInfo(db.Model):
    __tablename__ = 'user_health_info'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    health_info_id = db.Column(db.Integer, db.ForeignKey('health_info.id'), nullable=False)