import os
from flask import Blueprint, request, jsonify
from app.core.config import Settings
from app.services.print_service import PrintEngine
from app.services.asset_service import AssetService

admin_bp = Blueprint('admin_api', __name__)
print_engine = PrintEngine()
asset_service = AssetService()

@admin_bp.route('/admin/get_layouts', methods=['GET'])
def get_layouts():
    config = Settings.load()
    return jsonify({
        "status": "success",
        "active_layouts": config.get('active_layouts', {}),
        "layout_details": config.get('layout_details', {})
    })

@admin_bp.route('/admin/upload_template', methods=['POST'])
def upload_template():
    try:
        file = request.files.get('file')
        size_type = request.form.get('size_type')
        layout_id = request.form.get('layout_id')
        path = os.path.join('static/templates', size_type, f"{layout_id}.png")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        file.save(path)
        slots = print_engine.auto_detect_slots(path)
        config = Settings.load()
        config.setdefault("layout_details", {})[layout_id] = {"name": layout_id, "slots": slots}
        active_list = config.setdefault("active_layouts", {}).setdefault(size_type, [])
        if layout_id not in active_list: active_list.append(layout_id)
        Settings.save(config)
        return jsonify({"status": "success", "slots_detected": len(slots)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/admin/delete_layout', methods=['POST'])
def delete_layout():
    data = request.get_json()
    lid, ltype = data.get('id'), data.get('type')
    config = Settings.load()
    if ltype in config.get('active_layouts', {}):
        config['active_layouts'][ltype] = [i for i in config['active_layouts'][ltype] if i != lid]
    Settings.save(config)
    return jsonify({"status": "success"})

@admin_bp.route('/admin/delete_sticker', methods=['POST'])
def delete_sticker():
    sticker_id = request.get_json().get('id')
    asset_service.db.query("DELETE FROM stickers WHERE id = ?", (sticker_id,))
    return jsonify({"status": "success"})

@admin_bp.route('/admin/delete_filter', methods=['POST'])
def delete_filter():
    filter_id = request.get_json().get('id')
    asset_service.db.query("DELETE FROM effects WHERE id = ?", (filter_id,))
    return jsonify({"status": "success"})

@admin_bp.route('/admin/add_filter', methods=['POST'])
def add_filter():
    data = request.get_json()
    asset_service.add_filter(data.get('name'), data.get('filter_css'))
    return jsonify({"status": "success"})

