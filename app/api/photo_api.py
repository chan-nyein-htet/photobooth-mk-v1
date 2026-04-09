from flask import Blueprint, request, jsonify, render_template
from app.services.booth import BoothService

photo_bp = Blueprint('photo_api', __name__)
booth_service = BoothService()

@photo_bp.route('/api/assets', methods=['GET'])
def get_assets():
    try:
        effects_raw = booth_service.db.query("SELECT name, filter_css FROM effects WHERE is_active = 1")
        stickers_raw = booth_service.db.query("SELECT name, url FROM stickers")

        return jsonify({
            "effects": [{"name": e[0], "filter": e[1]} for e in effects_raw],
            "stickers": [{"name": s[0], "url": s[1]} for s in stickers_raw]
        })
    except Exception as e:
        print(f"Asset Error: {e}")
        return jsonify({"error": str(e)}), 500

@photo_bp.route('/api/create_order', methods=['POST'])
def create_order():
    try:
        order_id = booth_service.create_order()
        return jsonify({"order_id": order_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🚀 QR Scan Redirect Route
@photo_bp.route('/api/pay/<order_id>')
def pay_gateway(order_id):
    try:
        booth_service.db.query(
            "UPDATE orders SET status = 'completed' WHERE order_id = ?",
            (order_id,)
        )
        # HTML ကို string အနေနဲ့ သေချာ ပြန်ပိတ်ထားပါတယ်
        html_content = f"""
        <html>
            <body style="text-align:center; font-family:sans-serif; padding-top:50px;">
                <h1 style="color:green;">✅ Payment Successful!</h1>
                <p>Order ID: {order_id}</p>
                <p>မင်းရဲ့ ဓာတ်ပုံရိုက်စက် screen ကို ပြန်ကြည့်လိုက်ပါတော့။</p>
                <button onclick="window.close()" style="padding:10px 20px;">Close Tab</button>
            </body>
        </html>
        """
        return html_content
    except Exception as e:
        return f"<h1>Payment Error: {str(e)}</h1>", 500

@photo_bp.route('/api/check_payment/<order_id>', methods=['GET'])
def check_payment(order_id):
    try:
        status = booth_service.check_payment(order_id)
        return jsonify({"status": status})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@photo_bp.route('/api/upload', methods=['POST'])
def upload_photo():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data"}), 400
        path = booth_service.save_captured_photo(data['image'])
        return jsonify({"message": "Success", "path": path}) if path else (jsonify({"error": "Save failed"}), 500)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

