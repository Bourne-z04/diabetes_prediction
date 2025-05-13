from app import create_app
from config import Config 
import os

# 创建Flask应用实例
app = create_app(Config()) 

if __name__ == '__main__':
    # 确保数据库表已创建
    with app.app_context():
        from app.auth.models import User, UserRole
        from app import db
        db.create_all()
        
        # 创建默认管理员 admin
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(username='admin', email='python@whut.cn', password='123456')
            db.session.add(admin)
            db.session.commit()
            
            # 分配管理员角色
            admin_role = UserRole(user_id=admin.id, role_id=1)
            db.session.add(admin_role)
            db.session.commit()
    
    # 运行应用
    app.run(host='0.0.0.0', port=5000, debug=True)