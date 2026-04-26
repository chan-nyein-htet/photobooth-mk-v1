from flask import Blueprint, request, jsonify
from app.core.config import Settings
from app.services.booth import BoothService
import os, cv2, numpy as np

admin_bp = Blueprint('admin', __name__)
booth_service = BoothService()

TEMPLATE_BASE_DIR = 'static/templates'
# ✅ ls အရ ရှိနေတဲ့ path အမှန်ကို ပြောင်းလိုက်ပြီ
FONT_DIR = 'static/assets/fonts' 

def auto_detect_slots(image_path):
    img = cv2.imread(image_path)
    if img is None: return []
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 2, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    slots = []
    for cnt in contours:
        if cv2.contourArea(cnt) > 5000:
            x, y, w, h = cv2.boundingRect(cnt)
            slots.append({"x": max(0, x-2), "y": max(0, y-2), "w": w+4, "h": h+4})
    return sorted(slots, key=lambda k: k['y'])

@admin_bp.route('/admin/get_layouts', methods=['GET'])
def get_layouts():
    config = Settings.load()
    return jsonify({"active_layouts": config.get('active_layouts', {}), "layout_details": config.get('layout_details', {})})

@admin_bp.route('/admin/upload_template', methods=['POST'])
def upload_template():
    file = request.files.get('file')
    size_type = request.form.get('size_type')
    layout_id = request.form.get('layout_id')
    if not file or not layout_id: return jsonify({"status": "error"}), 400
    
    path = os.path.join(TEMPLATE_BASE_DIR, size_type, f"{layout_id}.png")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    file.save(path)
    
    config = Settings.load()
    config.setdefault("layout_details", {})[layout_id] = {"name": request.form.get('layout_name'), "slots": auto_detect_slots(path)}
    if layout_id not in config['active_layouts'].get(size_type, []):
        config['active_layouts'].setdefault(size_type, []).append(layout_id)
    Settings.save(config)
    return jsonify({"status": "success"})

@admin_bp.route('/admin/get_fonts', methods=['GET'])
def get_fonts():
    fonts = []
    if os.path.exists(FONT_DIR):
        for f in os.listdir(FONT_DIR):
            if f.lower().endswith(('.ttf', '.otf')):
                fonts.append({
                    "id": f,
                    "name": f,
                    "url": f"/static/assets/fonts/{f}" # ✅ URL Path ကိုလည်း ပြင်ပေးထားတယ်
                })
    return jsonify({"fonts": fonts})

@admin_bp.route('/admin/upload_font', methods=['POST'])
def upload_font():
    file = request.files.get('file')
    if not file: return jsonify({"status": "error"}), 400
    # BoothService က static/assets/fonts ထဲ သိမ်းဖို့ လိုတယ်
    saved_path = booth_service.upload_font(file) 
    return jsonify({"status": "success", "path": saved_path})

@admin_bp.route('/admin/delete_font', methods=['POST'])
def delete_font():
    data = request.get_json()
    path = os.path.join(FONT_DIR, data.get('id'))
    if os.path.exists(path):
        os.remove(path)
        return jsonify({"status": "success"})
    return jsonify({"status": "error"}), 404

