from flask import Blueprint, request, jsonify
from app.core.config import Settings
import os
import json
import cv2
import numpy as np

admin_bp = Blueprint('admin', __name__)
TEMPLATE_BASE_DIR = 'static/templates'

def auto_detect_slots(image_path):
    """Standalone logic for slot detection"""
    img = cv2.imread(image_path)
    if img is None: return []
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 2, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    slots = []
    padding = 2
    for cnt in contours:
        if cv2.contourArea(cnt) > 5000:
            x, y, w, h = cv2.boundingRect(cnt)
            slots.append({
                "x": max(0, x - padding),
                "y": max(0, y - padding),
                "w": w + (padding * 2),
                "h": h + (padding * 2)
            })
    return sorted(slots, key=lambda k: k['y'])

@admin_bp.route('/admin/get_layouts', methods=['GET'])
def get_layouts():
    try:
        config = Settings.load()
        return jsonify({
            "active_layouts": config.get('active_layouts', {}),
            "layout_details": config.get('layout_details', {})
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/admin/upload_template', methods=['POST'])
def upload_template():
    try:
        file = request.files.get('file')
        size_type = request.form.get('size_type')
        layout_id = request.form.get('layout_id')
        layout_name = request.form.get('layout_name')
        # slots_data = json.loads(request.form.get('slots', '[]')) # မူရင်းအတိုင်းထားပေမယ့် အောက်မှာ auto သုံးမယ်

        if not file or not layout_id:
            return jsonify({"status": "error", "message": "Fields missing"}), 400

        folder_path = os.path.join(TEMPLATE_BASE_DIR, size_type)
        os.makedirs(folder_path, exist_ok=True)
        save_path = os.path.join(folder_path, f"{layout_id}.png")
        file.save(save_path)

        # 🎯 Auto Detection Logic - မူရင်း logic ထဲ ညှပ်ထည့်ခြင်း
        detected_slots = auto_detect_slots(save_path)

        config = Settings.load()

        if "layout_details" not in config: config["layout_details"] = {}

        config['layout_details'][layout_id] = {
            "name": layout_name or layout_id,
            "slots": detected_slots # 🎯 Auto Detected Data ကို သုံးမယ်
        }

        if layout_id not in config['active_layouts'][size_type]:
            config['active_layouts'][size_type].append(layout_id)

        Settings.save(config)
        return jsonify({"status": "success", "message": f"'{layout_name}' Registered!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/admin/delete_layout', methods=['POST'])
def delete_layout():
    try:
        data = request.json
        l_id, l_type = data.get('id'), data.get('type')
        config = Settings.load()

        if l_id in config['active_layouts'].get(l_type, []):
            config['active_layouts'][l_type].remove(l_id)
            if l_id in config.get('layout_details', {}):
                del config['layout_details'][l_id]
            Settings.save(config)

            path = os.path.join(TEMPLATE_BASE_DIR, l_type, f"{l_id}.png")
            if os.path.exists(path): os.remove(path)
            return jsonify({"status": "success"})
        return jsonify({"status": "error", "message": "Not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

