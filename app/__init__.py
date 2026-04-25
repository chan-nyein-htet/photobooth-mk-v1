from flask import Flask
from app.api.photo_api import photo_bp
from app.api.admin_api import admin_bp

def create_app():
    app = Flask(__name__,
                template_folder='../templates',
                static_folder='../static')

    app.config['UPLOAD_FOLDER'] = 'static/uploads'

    # 🎯 Blueprint Register လုပ်တဲ့နေရာမှာ url_prefix ထည့်ပေးလိုက်ပြီ
    # ဒါမှ Frontend က /api/... ဆိုပြီး လှမ်းခေါ်လို့ရမှာ
    app.register_blueprint(photo_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')

    return app

