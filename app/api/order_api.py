from flask import Blueprint, request, jsonify
from app.services.order_service import OrderService

order_bp = Blueprint('order_api', __name__)
order_service = OrderService()

@order_bp.route('/create_order', methods=['POST'])
def create_order():
    try:
        data = request.get_json(force=True, silent=True) or {}
        amount = data.get('amount', 5000)
        layout_id = data.get('layout', '1000022813')
        order_id = order_service.create_order(amount, layout_id)
        return jsonify({"status": "success", "order_id": order_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@order_bp.route('/pay/<order_id>', methods=['GET'])
def check_payment(order_id):
    """Matches JS call: fetch('/api/pay/${orderId}')"""
    try:
        status = order_service.check_payment_status(order_id.upper())
        is_paid = (status in ['paid', 'completed'])
        return jsonify({"status": "success", "paid": is_paid, "db_status": status})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@order_bp.route('/simulate_pay/<order_id>', methods=['GET'])
def simulate_pay(order_id):
    try:
        order_service.update_order_status(order_id.upper(), 'paid')
        return f"<h1>Payment Success!</h1><p>Order {order_id} is now PAID.</p>"
    except Exception as e:
        return str(e), 500

