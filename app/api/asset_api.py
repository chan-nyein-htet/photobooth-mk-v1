from flask import Blueprint, request, jsonify
from app.services.asset_service import AssetService

asset_bp = Blueprint('asset_api', __name__)
asset_service = AssetService()

@asset_bp.route('/assets', methods=['GET'])
def get_all_assets():
    try:
        stickers = asset_service.get_active_stickers()
        filters = asset_service.get_active_filters()
        return jsonify({
            "status": "success",
            "stickers": [{"id": s['id'], "url": s['url']} for s in stickers],
            "filters": [{"id": f['id'], "name": f['name'], "filter": f['filter_css']} for f in filters]
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@asset_bp.route('/admin/get_fonts', methods=['GET'])
def get_fonts():
    return jsonify({"status": "success", "fonts": asset_service.get_available_fonts()})

@asset_bp.route('/admin/add_sticker', methods=['POST'])
def add_sticker():
    asset_service.add_sticker(request.form.get('name'), request.files.get('file'))
    return jsonify({"status": "success"})

@asset_bp.route('/admin/upload_font', methods=['POST'])
def upload_font():
    path = asset_service.upload_font(request.files.get('file'))
    return jsonify({"status": "success", "path": path})

