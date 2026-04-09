from flask import Blueprint, request, jsonify, render_template
from app.services.booth import BoothService

photo_bp = Blueprint('photo_api', __name__)
booth_service = BoothService()

@photo_bp.route('/api/assets', methods=['GET'])
def get_assets():
    try:
        effects_raw = booth_service.db.query("SELECT name, filter_css FROM effects WHERE is_active = 1")
        stickers_raw = booth_service.db.query("SELECT name, url FROM stickers WHERE is_active = 1")
        return jsonify({
            "effects": [{"name": e['name'], "filter": e['filter_css']} for e in effects_raw],
            "stickers": [{"name": s['name'], "url": s['url']} for s in stickers_raw]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@photo_bp.route('/api/create_order', methods=['POST'])
def create_order():
    try:
        order_id = booth_service.create_order()
        return jsonify({"order_id": order_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@photo_bp.route('/api/check_payment/<order_id>')
def check_payment(order_id):
    try:
        # DB query status ကို စစ်မယ်
        res = booth_service.db.query("SELECT status FROM orders WHERE order_id = ?", (order_id,))
        if res and len(res) > 0:
            return jsonify({"status": res[0]['status']})
        return jsonify({"status": "not_found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@photo_bp.route('/api/pay/<order_id>')
def pay_gateway(order_id):
    try:
        # ✅ 'execute' နေရာမှာ 'query' ကို သုံးပြီး status update လုပ်လိုက်တယ်
        booth_service.db.query("UPDATE orders SET status='paid' WHERE order_id = ?", (order_id,))
        return f"""
        <div style='text-align:center; padding:50px; font-family:sans-serif;'>
            <h1 style='color:green;'>✅ Payment Successful!</h1>
            <p>Order ID: {order_id}</p>
            <p>You can now go back to the booth screen.</p>
        </div>
        """
    except Exception as e:
        print(f"❌ Pay Gateway Error: {e}")
        return str(e), 500

