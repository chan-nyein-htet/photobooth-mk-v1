import socket
import os
from flask import Flask, render_template
from app.api.photo_api import photo_bp
from app.core.config import Settings  # ✅ Settings class ကို ခေါ်ယူခြင်း

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# ✅ Blueprint Register (API Routes)
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
    # ✅ (၁) Settings ထဲကနေ လက်ရှိ Printer mode နဲ့ ကိုက်ညီတဲ့ Layout list ကို ယူမယ်
    allowed_layouts = Settings.get_allowed_layouts()

    # ✅ (၂) JSON ထဲက Canvas Size Config တွေကိုပါ ဆွဲထုတ်မယ်
    all_settings = Settings.load()
    canvas_configs = all_settings.get('canvas_configs', {})

    # ✅ (၃) Layouts ရော Canvas Sizes ရော index.html ဆီ ပို့ပေးလိုက်မယ်
    return render_template(
        'index.html', 
        allowed_layouts=allowed_layouts, 
        canvas_configs=canvas_configs
    )

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

