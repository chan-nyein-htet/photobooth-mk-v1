from flask import Blueprint, request, jsonify
from app.core.config import Settings
import os
import json

admin_bp = Blueprint('admin', __name__)
TEMPLATE_BASE_DIR = 'static/templates'

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
        layout_name = request.form.get('layout_name') # 🎯 Custom Name
        slots_data = json.loads(request.form.get('slots', '[]'))

        if not file or not layout_id:
            return jsonify({"status": "error", "message": "Fields missing"}), 400

        folder_path = os.path.join(TEMPLATE_BASE_DIR, size_type)
        os.makedirs(folder_path, exist_ok=True)
        file.save(os.path.join(folder_path, f"{layout_id}.png"))

        config = Settings.load()
        
        # 🎯 Layout Details ကို Object Format နဲ့ Name ရော Slots ရော သိမ်းမယ်
        config['layout_details'][layout_id] = {
            "name": layout_name or layout_id,
            "slots": slots_data
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

