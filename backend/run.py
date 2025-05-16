from app import create_app, db  
from app.models.user import User
from werkzeug.security import generate_password_hash

app = create_app()

def init_admin_user():
    with app.app_context():
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@whut.cn',
                password_hash=generate_password_hash('123456'),
                role_id=2
            )
            db.session.add(admin)
            db.session.commit()
            print("管理员用户已创建")

if __name__ == '__main__':
    init_admin_user()  # 初始化管理员用户
    app.run(debug=True)
