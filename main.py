import socket
import os
from flask import Flask, render_template, jsonify
from app.api.photo_api import photo_bp
from app.core.db import Database

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# ✅ Blueprint ကို ချိတ်ဆက်ခြင်း
app.register_blueprint(photo_bp)

db = Database()

def get_local_ip():
    """စက်ရဲ့ Local IP ကို အလိုအလျောက် ရှာပေးတဲ့ function"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/assets')
def get_assets():
    stickers = db.query("SELECT * FROM stickers WHERE is_active = 1")
    effects = db.query("SELECT * FROM effects WHERE is_active = 1")
    return jsonify({
        "stickers": [dict(s) for s in stickers],
        "effects": [dict(e) for e in effects]
    })

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
        
    local_ip = get_local_ip()
    print(f"\n🚀 Server Starting at http://{local_ip}:5000")
    
    # 0.0.0.0 ဆိုတာ တခြားဖုန်းတွေ လှမ်းချိတ်လို့ရအောင် လမ်းဖွင့်ပေးတာ
    app.run(host='0.0.0.0', port=5000, debug=True)

