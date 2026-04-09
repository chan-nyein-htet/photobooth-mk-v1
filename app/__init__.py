from flask import Flask
from app.api.photo_api import photo_bp

def create_app():
    app = Flask(__name__, 
                template_folder='../templates', 
                static_folder='../static')
    
    app.config['UPLOAD_FOLDER'] = 'static/uploads'

    # url_prefix='/api' ကို ဖြုတ်ပြီး Blueprint ကို တန်းချိတ်လိုက်တာ
    app.register_blueprint(photo_bp)

    return app
