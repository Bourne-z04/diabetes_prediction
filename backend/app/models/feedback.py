from app import db
from datetime import datetime

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, processing, resolved
    admin_reply = db.Column(db.Text)
    reply_time = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'contact': self.contact,
            'created_at': self.created_at.isoformat(),
            'status': self.status,
            'admin_reply': self.admin_reply,
            'reply_time': self.reply_time.isoformat() if self.reply_time else None
        }