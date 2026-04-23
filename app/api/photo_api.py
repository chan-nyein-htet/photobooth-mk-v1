from flask import Blueprint, request, jsonify
from app.services.booth import BoothService
import uuid

photo_bp = Blueprint('photo_api', __name__)
booth_service = BoothService()

# Memory ထဲမှာ payment status သိမ်းရန်
payments = {}

@photo_bp.route('/assets', methods=['GET'])
def get_assets():
    """Stickers နဲ့ Filters စာရင်းကို ပြန်ပေးခြင်း"""
    return jsonify({
        "stickers": [],
        "filters": ["none", "grayscale", "sepia", "vivid"]
    })

@photo_bp.route('/create_order', methods=['POST'])
def create_order():
    """အော်ဒါအသစ်ဆောက်ပြီး ID ထုတ်ပေးခြင်း"""
    try:
        data = request.get_json(force=True, silent=True) or {}
        # Layout သတ်မှတ်ချက် (Default: A)
        layout = data.get('layout', 'A')
        
        # Unique Order ID ဆောက်မယ်
        order_id = str(uuid.uuid4())[:8].upper()
        payments[order_id] = "pending"

        print(f"📦 New Order Created: {order_id} (Layout: {layout})")
        return jsonify({
            "status": "success",
            "order_id": order_id,
            "qr_link": "/static/assets/payment_qr.png"
        })
    except Exception as e:
        print(f"❌ Create Order Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@photo_bp.route('/check_payment/<order_id>', methods=['GET'])
def check_payment(order_id):
    """ငွေပေးချေမှု အခြေအနေကို စစ်ဆေးခြင်း"""
    # Case sensitivity အတွက် upper လုပ်ပြီးစစ်မယ်
    target_id = order_id.upper()
    status = payments.get(target_id, "not_found")
    
    paid = (status == "completed")
    return jsonify({"status": "success", "paid": paid})

@photo_bp.route('/pay/<order_id>', methods=['GET'])
def simulate_pay(order_id):
    """ငွေပေးချေမှုကို အတုပြုလုပ်ခြင်း (Testing အတွက်)"""
    target_id = order_id.upper()
    if target_id in payments:
        payments[target_id] = "completed"
        print(f"✅ Order {target_id} marked as paid!")
        return jsonify({"status": "success", "message": f"Order {target_id} marked as paid!"})
    
    print(f"❌ Payment Failed: {target_id} not found in {list(payments.keys())}")
    return jsonify({"status": "error", "message": "Order not found"}), 404

@photo_bp.route('/process_photos', methods=['POST'])
def process_photos():
    """ဓာတ်ပုံများကို သိမ်းဆည်းပြီး PDF အဖြစ် ပြောင်းလဲခြင်း"""
    try:
        data = request.get_json(force=True, silent=True) or {}
        order_id = data.get('order_id')
        layout_id = data.get('layout_id', 'A') # UI က ပို့ပေးတဲ့ Layout ID
        raw_images = data.get('images', [])
        collage_base64 = data.get('collage') # Frontend က ဆောက်ထားတဲ့ Final Collage

        if not raw_images:
            print(f"⚠️ No images received for Order: {order_id}")
            return jsonify({"status": "error", "message": "No raw images received"}), 400

        print(f"📸 Processing {len(raw_images)} photos for Order: {order_id} (Layout: {layout_id})")

        # ၁။ Raw Photos များကို Originals Folder ထဲမှာ သိမ်းဆည်းခြင်း
        for i, b64 in enumerate(raw_images):
            booth_service.processor.save_base64_image(b64, f"raw_{order_id}_{i}.jpg")

        # ၂။ PDF ပြောင်းခြင်း (Dynamic Canvas Size Logic ကို သုံးမည်)
        pdf_url = None
        if collage_base64:
            # Settings Class ကနေ Canvas size ကို အလိုအလျောက် ယူသွားလိမ့်မယ်
            pdf_url = booth_service.processor.convert_to_pdf(order_id, collage_base64, layout_id)

        return jsonify({
            "status": "success",
            "message": "Photos processed successfully",
            "order_id": order_id,
            "pdf_url": pdf_url
        })
    except Exception as e:
        print(f"❌ Process Photos Error: {e}")
        return jsonify({"error": str(e)}), 500

