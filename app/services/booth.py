import os
import uuid
import base64
from datetime import datetime
from app.core.db import Database
from app.services.processor import ImageProcessor

class BoothService:
    def __init__(self):
        self.db = Database()
        self.processor = ImageProcessor()
        self.output_dir = 'static/outputs'
        os.makedirs(self.output_dir, exist_ok=True)

    def create_order(self, amount=5000, layout_id='1000022813'):
        order_id = str(uuid.uuid4())[:8].upper()
        self.db.query(
            "INSERT INTO orders (order_id, amount, status, layout_id) VALUES (?, ?, ?, ?)",
            (order_id, amount, 'pending', layout_id)
        )
        return order_id

    def update_order_status(self, order_id, new_status):
        """DB ထဲက Status ကို Update လုပ်ပေးရန်"""
        self.db.query(
            "UPDATE orders SET status = ? WHERE order_id = ?",
            (new_status, order_id)
        )
        return True

    def check_payment(self, order_id):
        order = self.db.query("SELECT status FROM orders WHERE order_id = ?", (order_id,), one=True)
        return order['status'] if order else None

    def save_captured_photo(self, base64_data, order_id):
        filename = f"shot_{uuid.uuid4().hex[:10]}.jpg"
        file_path = self.processor.save_base64_image(base64_data, filename)
        if file_path:
            self.db.query(
                "INSERT INTO photos (name, photo_path, order_id) VALUES (?, ?, ?)",
                (filename, file_path, order_id)
            )
            return file_path
        return None

    def get_photos_by_order(self, order_id):
        return self.db.query(
            "SELECT * FROM photos WHERE order_id = ? ORDER BY created_at DESC LIMIT 8",
            (order_id,)
        )

    def generate_final_print(self, base64_str, order_id, layout_id):
        try:
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]
            img_data = base64.b64decode(base64_str)
            filename = f"FINAL_{order_id}_{layout_id}.jpg"
            filepath = os.path.join(self.output_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(img_data)
            return f"/{filepath}"
        except Exception as e:
            raise e

