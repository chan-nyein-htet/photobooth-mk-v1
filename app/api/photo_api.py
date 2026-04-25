from flask import Blueprint, request, jsonify
from app.services.booth import BoothService
from app.core.config import Settings

# Blueprint Definition
photo_bp = Blueprint('photo', __name__)
booth_service = BoothService()

@photo_bp.route('/create_order', methods=['POST'])
def create_order():
    try:
        data = request.get_json(force=True, silent=True) or {}
        amount = data.get('amount', 5000)
        layout_id = data.get('layout', '1000022813')
        order_id = booth_service.create_order(amount, layout_id)
        
        # Scan ဖတ်ရင် status ကို ပြောင်းပေးမယ့် URL
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
        return f"<h1>Payment Success!</h1><p>Order {order_id} is now PAID. Go back to your booth screen.</p>"
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
        if not order_id or not images:
            return jsonify({"status": "error", "message": "Missing Data"}), 400

        for idx, img_base64 in enumerate(images):
            booth_service.save_captured_photo(img_base64, order_id)

        layout_id = data.get('layout_id', '1000022813')
        layout_details = Settings.get_layout_details(str(layout_id))
        return jsonify({"status": "success", "layout_details": layout_details})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@photo_bp.route('/assets', methods=['GET'])
def get_assets():
    return jsonify({
        "filters": [
            {"name": "Normal", "filter": "none"},
            {"name": "Grayscale", "filter": "grayscale(100%)"},
            {"name": "Sepia", "filter": "sepia(100%)"},
            {"name": "Warm", "filter": "sepia(30%) contrast(110%)"}
        ],
        "stickers": []
    })

@photo_bp.route('/process_final', methods=['POST'])
def process_final():
    try:
        data = request.get_json(force=True, silent=True) or {}
        order_id = data.get('order_id')
        layout_id = data.get('layout_id')
        final_image_base64 = data.get('final_image')

        if not final_image_base64 or not order_id:
            return jsonify({"status": "error", "message": "Incomplete Data"}), 400

        pdf_url = booth_service.generate_final_print(final_image_base64, order_id, layout_id)
        return jsonify({"status": "success", "pdf_url": pdf_url})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

