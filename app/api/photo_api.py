from flask import Blueprint, request, jsonify
from app.services.booth import BoothService
from app.core.config import Settings

# Blueprint သတ်မှတ်ခြင်း
photo_bp = Blueprint('photo', __name__)
booth_service = BoothService()

@photo_bp.route('/create_order', methods=['POST'])
def create_order():
    try:
        data = request.get_json(force=True, silent=True) or {}
        amount = data.get('amount', 5000)
        layout_id = data.get('layout', '1000022813')
        order_id = booth_service.create_order(amount, layout_id)

        # Original logic အတိုင်းထားသည်
        mock_payment_link = f"http://127.0.0.1:5000/api/simulate_pay/{order_id}"

        return jsonify({
            "status": "success",
            "order_id": order_id,
            "qr_link": mock_payment_link
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@photo_bp.route('/simulate_pay/<order_id>', methods=['GET'])
def simulate_pay(order_id):
    try:
        booth_service.update_order_status(order_id.upper(), 'paid')
        return f"<h1>Payment Success!</h1><p>Order {order_id} is now PAID.</p>"
    except Exception as e:
        return str(e), 500

@photo_bp.route('/pay/<order_id>', methods=['GET'])
@photo_bp.route('/check_payment/<order_id>', methods=['GET'])
def check_payment(order_id):
    try:
        status = booth_service.check_payment(order_id.upper())
        paid = (status in ['paid', 'completed'])
        return jsonify({"status": "success", "paid": paid, "db_status": status})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@photo_bp.route('/process_photos', methods=['POST'])
def process_photos():
    try:
        data = request.get_json(force=True, silent=True) or {}
        order_id = data.get('order_id')
        images = data.get('images', [])
        layout_id = data.get('layout_id') or data.get('layout', '1000022813')

        if not order_id or not images:
            return jsonify({"status": "error", "message": "Missing Data"}), 400

        saved_photo_urls = []
        for idx, img_base64 in enumerate(images):
            file_path = booth_service.save_captured_photo(img_base64, order_id)
            if file_path:
                url = f"/{file_path}" if not file_path.startswith('/') else file_path
                saved_photo_urls.append(url)

        layout_details = Settings.get_layout_details(str(layout_id))
        all_settings = Settings.load()

        paper_size = "6x2"
        for size, layouts in all_settings.get('active_layouts', {}).items():
            if str(layout_id) in layouts:
                paper_size = size
                break

        config = all_settings.get('canvas_configs', {}).get(paper_size, {"width": 600, "height": 1800})
        layout_details['target_w'] = config['width']
        layout_details['target_h'] = config['height']

        return jsonify({
            "status": "success",
            "layout_details": layout_details,
            "photo_urls": saved_photo_urls,
            "layout_id": layout_id,
            "paper_size": paper_size
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# 🎯 FIXED: Route နာမည် မပြောင်းပါ။ sqlite3.Row object syntax ([]) ကိုသုံးထားသည်။
@photo_bp.route('/assets', methods=['GET'])
def get_assets():
    try:
        db_stickers = booth_service.get_all_stickers()
        db_filters = booth_service.get_all_filters()

        return jsonify({
            "status": "success",
            "filters": [
                {
                    "name": f['name'],
                    "filter": f['filter_css']
                } for f in db_filters
            ],
            # DB schema အရ column name သည် 'url' ဖြစ်နေ၍ [] syntax သုံးရသည်
            "stickers": [s['url'] for s in db_stickers if s['url']]
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@photo_bp.route('/process_final', methods=['POST'])
def process_final():
    try:
        data = request.get_json(force=True, silent=True) or {}
        order_id = data.get('order_id')
        layout_id = data.get('layout_id')
        final_image_base64 = data.get('final_image')

        if not final_image_base64 or not order_id:
            return jsonify({"status": "error", "message": "Incomplete Data"}), 400

        image_url = booth_service.generate_final_print(final_image_base64, order_id, layout_id)
        return jsonify({"status": "success", "image_url": image_url})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

