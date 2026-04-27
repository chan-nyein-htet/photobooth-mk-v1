from flask import Flask
from app.api.order_api import order_bp
from app.api.photo_api import photo_bp
from app.api.asset_api import asset_bp
from app.api.admin_api import admin_bp

def create_app():
    app = Flask(__name__,
                template_folder='../templates',
                static_folder='../static')

    app.config['UPLOAD_FOLDER'] = 'static/uploads'

    # Registering all Tiny Modules with proper prefixes
    app.register_blueprint(order_bp, url_prefix='/api')
    app.register_blueprint(photo_bp, url_prefix='/api')
    app.register_blueprint(asset_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')

    return app

