from flask import Blueprint, request, jsonify
from app.services.booth import BoothService
import uuid

photo_bp = Blueprint('photo_api', __name__)
booth_service = BoothService()

# Memory ထဲမှာ payment status သိမ်းရန်
payments = {}

@photo_bp.route('/assets', methods=['GET'])
def get_assets():
    """
    ✅ main.py က url_prefix='/api' ကြောင့် ဒီ route က /api/assets ဖြစ်သွားမယ်
    """
    print("📡 Asset API called!")
    return jsonify({
        "stickers": [],
        "filters": ["none", "grayscale", "sepia", "vivid"]
    })

@photo_bp.route('/create_order', methods=['POST'])
def create_order():
    try:
        data = request.get_json(force=True, silent=True) or {}
        layout = data.get('layout', 'A+')
        shots = data.get('shots', 8)
        order_id = str(uuid.uuid4())[:8].upper()

        payments[order_id] = "pending"

        print(f"📦 New Order Created: {order_id} (Layout: {layout})")
        return jsonify({
            "status": "success",
            "order_id": order_id,
            "qr_link": "/static/assets/payment_qr.png"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@photo_bp.route('/check_payment/<order_id>', methods=['GET'])
def check_payment(order_id):
    status = payments.get(order_id, "not_found")
    if status == "completed":
        return jsonify({"status": "success", "paid": True})
    return jsonify({"status": "pending", "paid": False})

@photo_bp.route('/pay/<order_id>', methods=['GET'])
def simulate_pay(order_id):
    if order_id in payments:
        payments[order_id] = "completed"
        return jsonify({"status": "success", "message": f"Order {order_id} marked as paid!"})
    return jsonify({"status": "error", "message": "Order not found"}), 404

@photo_bp.route('/process_photos', methods=['POST'])
def process_photos():
    try:
        data = request.get_json(force=True, silent=True) or {}
        order_id = data.get('order_id')
        layout_id = data.get('layout_id', 'A+')
        raw_images = data.get('images', [])

        if not raw_images:
            print(f"⚠️ No images received for Order: {order_id}")
            return jsonify({"status": "error", "message": "No raw images received"}), 400

        print(f"📸 Received {len(raw_images)} raw photos for Order: {order_id}")

        # ၁။ Raw Photos များကို သိမ်းဆည်းခြင်း
        for i, b64 in enumerate(raw_images):
            booth_service.processor.save_base64_image(b64, f"raw_{order_id}_{i}.jpg")

        # Success JSON ပဲ ပြန်ပို့မည်
        return jsonify({
            "status": "success",
            "message": "Photos saved successfully",
            "order_id": order_id
        })
    except Exception as e:
        print(f"❌ Process Error: {e}")
        return jsonify({"error": str(e)}), 500

