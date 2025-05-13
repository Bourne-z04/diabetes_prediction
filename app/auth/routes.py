from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required
from app.auth.forms import LoginForm, RegistrationForm
from app.auth.models import User, UserRole
from app import db

auth = Blueprint('auth', __name__)

@auth.route('/')
def index():
    return redirect(url_for('auth.login'))

@auth.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.verify_password(form.password.data):
            login_user(user)
            # 根据角色跳转到不同界面
            if user.roles.filter_by(role_id=1).first():  # 检查是否是管理员
                return redirect(url_for('admin.index'))
            return redirect(url_for('user.index'))
        flash('用户名或密码输入错误', 'danger')
    return render_template('auth/login.html', form=form)

@auth.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        try:
            # 检查是否要注册为管理员
            if form.is_admin.data:
                # 验证管理员凭据
                admin = User.query.filter_by(email=form.admin_email.data).first()
                if not admin or not admin.verify_password(form.admin_password.data):
                    flash('管理员凭据无效', 'danger')
                    return render_template('auth/register.html', form=form)
            
            user = User(username=form.username.data, email=form.email.data, password=form.password.data)
            db.session.add(user)
            db.session.commit()
            
            # 分配角色 - 确保UserRole模型已定义
            if hasattr(UserRole, '__tablename__'):  # 检查UserRole是否已定义
                role_id = 1 if form.is_admin.data else 2
                db.session.add(UserRole(user_id=user.id, role_id=role_id))
                db.session.commit()
            
            flash('账号创建成功!', 'success')
            return redirect(url_for('auth.login'))
        except Exception as e:
            db.session.rollback()
            flash(str(e), 'danger')
    return render_template('auth/register.html', form=form)

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))