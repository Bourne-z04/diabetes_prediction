from app import db

class DiabetesData(db.Model):
    __tablename__ = 'diabetes_data'
    
    id = db.Column(db.Integer, primary_key=True)
    Pregnancies = db.Column(db.Float, nullable=False)
    Glucose = db.Column(db.Float, nullable=False)
    BloodPressure = db.Column(db.Float, nullable=False)
    SkinThickness = db.Column(db.Float, nullable=False)
    Insulin = db.Column(db.Float, nullable=False)
    BMI = db.Column(db.Float, nullable=False)
    DiabetesPedigreeFunction = db.Column(db.Float, nullable=False)
    Age = db.Column(db.Float, nullable=False)
    Outcome = db.Column(db.Integer, nullable=False)