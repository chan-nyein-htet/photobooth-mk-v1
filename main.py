import socket
import os
from flask import Flask, render_template
from app.api.photo_api import photo_bp

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# ✅ Blueprint ကို register လုပ်တဲ့နေရာမှာ url_prefix='/api' ထည့်လိုက်ပြီ
# ဒါဆိုရင် photo_api.py ထဲက route တွေကို လှမ်းခေါ်ရင် /api/... နဲ့ ခေါ်ရမယ်
# ဥပမာ - photo_api ထဲမှာ /create_order လို့ရေးထားရင် ဒီမှာ /api/create_order ဖြစ်သွားမယ်
app.register_blueprint(photo_bp, url_prefix='/api')

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

# ✅ အနာဂတ်မှာ Dashboard route တွေထည့်ချင်ရင် ဒီအောက်မှာ Blueprint သီးသန့်ထပ်တိုးရုံပဲ
# ဥပမာ - app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

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

