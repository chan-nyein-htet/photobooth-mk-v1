from app.core.db import Database
from app.services.processor import ImageProcessor
import uuid

class BoothService:
    def __init__(self):
        self.db = Database()
        self.processor = ImageProcessor()

    def create_order(self, amount=5000, layout_id='A+'):
        """Order အသစ်ဖန်တီးစဉ်မှာ ရွေးချယ်ထားတဲ့ Layout ကိုပါ မှတ်တမ်းတင်မည်"""
        order_id = str(uuid.uuid4())[:8].upper()
        # Database table မှာ layout_id column ရှိဖို့တော့ လိုမယ်
        self.db.query(
            "INSERT INTO orders (order_id, amount, status, layout_id) VALUES (?, ?, ?, ?)",
            (order_id, amount, 'pending', layout_id)
        )
        return order_id

    def check_payment(self, order_id):
        """ငွေပေးချေမှု အခြေအနေကို စစ်ဆေးသည် (မူလအတိုင်း)"""
        order = self.db.query("SELECT status FROM orders WHERE order_id = ?", (order_id,), one=True)
        return order['status'] if order else None

    def save_captured_photo(self, base64_data):
        """ဓာတ်ပုံကို သိမ်းဆည်းသည် (မူလအတိုင်း)"""
        filename = f"shot_{uuid.uuid4().hex[:10]}.jpg"
        file_path = self.processor.save_base64_image(base64_data, filename)

        if file_path:
            self.db.query("INSERT INTO photos (photo_path) VALUES (?)", (file_path,))
            return file_path
        return None

