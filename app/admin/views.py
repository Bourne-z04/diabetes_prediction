from flask import render_template, request, flash, redirect, url_for
import pandas as pd
from werkzeug.utils import secure_filename
import os
from . import admin
from sqlalchemy.sql import text

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@admin.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return '<script>alert("没有选择文件"); window.history.back();</script>'
        
        file = request.files['file']
        if file.filename == '':
            return '<script>alert("没有选择文件"); window.history.back();</script>'
            
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(filepath)
            
            try:
                df = pd.read_csv(filepath)
                return '<script>alert("文件上传成功"); window.location.href="/admin";</script>'
            except Exception as e:
                return f'<script>alert("文件处理错误: {str(e)}"); window.history.back();</script>'
    
    return render_template('admin/upload.html')

@admin.route('/')
def index():
    return render_template('admin/index.html')