import socket
import os
from flask import Flask, render_template
from app.api.photo_api import photo_bp

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# ✅ Blueprint ကို ချိတ်လိုက်တာနဲ့ photo_api.py ထဲက route တွေအားလုံး အလုပ်လုပ်ပြီ
app.register_blueprint(photo_bp)

def get_local_ip():
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

if __name__ == '__main__':
    # Upload folder မရှိရင် ဆောက်မယ်
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    local_ip = get_local_ip()
    print(f"\n✨ PHX-PHOTOBOOTH MK-V2 ✨")
    print(f"🚀 Server: http://{local_ip}:5000")
    print(f"🛠️  Mode: Debug (Auto-Reload Enabled)")
    print(f"-----------------------------------")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

