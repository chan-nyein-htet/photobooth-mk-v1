import socket
import os
from flask import Flask, render_template
from app.api.photo_api import photo_bp
from app.core.config import Settings

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# ✅ Blueprint Register
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
    # ၁။ Settings အကုန်လုံးကို Load လုပ်မယ်
    all_settings = Settings.load()
    
    # ၂။ Dictionary Format နဲ့ Layout တွေကို ယူမယ် (6x2, 6x4 ခွဲပြီးသား)
    active_layouts = Settings.get_allowed_layouts()
    
    # ၃။ Canvas Configs တွေကို ယူမယ်
    canvas_configs = all_settings.get('canvas_configs', {})

    # ၄။ Template ဆီ နာမည်မှန်မှန်နဲ့ ပို့မယ်
    return render_template(
        'index.html',
        printer_mode=all_settings.get('printer_mode', 'dual'),
        active_layouts=active_layouts,
        canvas_configs=canvas_configs
    )

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    local_ip = get_local_ip()
    print(f"\n✨ PHX-PHOTOBOOTH MK-V2 ✨")
    print(f"🚀 Server: http://{local_ip}:5000")
    print(f"-----------------------------------")

    app.run(host='0.0.0.0', port=5000, debug=True)

