import uuid
from app.core.db import Database

class OrderService:
    def __init__(self):
        # Initializing database connection
        self.db = Database()

    def create_order(self, amount=5000, layout_id='1000022813'):
        """Creates a new order and returns a unique 8-character Order ID."""
        order_id = str(uuid.uuid4())[:8].upper()
        self.db.query(
            "INSERT INTO orders (order_id, amount, status, layout_id) VALUES (?, ?, ?, ?)",
            (order_id, amount, 'pending', layout_id)
        )
        return order_id

    def update_order_status(self, order_id, new_status):
        """Updates the status of an existing order (e.g., 'paid', 'completed')."""
        self.db.query(
            "UPDATE orders SET status = ? WHERE order_id = ?",
            (new_status, order_id)
        )
        return True

    def check_payment_status(self, order_id):
        """Checks the current status of an order from the database."""
        order = self.db.query(
            "SELECT status FROM orders WHERE order_id = ?", 
            (order_id,), 
            one=True
        )
        return order['status'] if order else None

