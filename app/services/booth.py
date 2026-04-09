from app.core.db import Database
from app.services.processor import ImageProcessor
import uuid

class BoothService:
    def __init__(self):
        self.db = Database()
        self.processor = ImageProcessor()

    def create_order(self, amount=5000):
        """Order အသစ်တစ်ခု စတင်ဖန်တီးသည် (Default 5000 MMK)"""
        order_id = str(uuid.uuid4())[:8].upper()
        self.db.query(
            "INSERT INTO orders (order_id, amount, status) VALUES (?, ?, ?)",
            (order_id, amount, 'pending')
        )
        return order_id

    def check_payment(self, order_id):
        """ငွေပေးချေမှု အခြေအနေကို စစ်ဆေးသည်"""
        order = self.db.query("SELECT status FROM orders WHERE order_id = ?", (order_id,), one=True)
        return order['status'] if order else None

    def save_captured_photo(self, base64_data):
        """ဓာတ်ပုံကို သိမ်းဆည်းပြီး Database ထဲ မှတ်တမ်းတင်သည်"""
        filename = f"shot_{uuid.uuid4().hex[:10]}.jpg"
        file_path = self.processor.save_base64_image(base64_data, filename)
        
        if file_path:
            # Database ထဲ သိမ်းသည် (db.py ထဲက default 'Untitled' ကို သုံးသွားမည်)
            self.db.query("INSERT INTO photos (photo_path) VALUES (?)", (file_path,))
            return file_path
        return None
