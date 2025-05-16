from app import db

class HealthInfo(db.Model):
    __tablename__ = 'health_info'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    bmi = db.Column(db.Float, nullable=False)
    insulin = db.Column(db.Float, nullable=False)
    skin_thickness = db.Column(db.Integer, nullable=False)
    glucose = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(), nullable=False)