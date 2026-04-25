import os
import uuid
import base64
from datetime import datetime
from app.core.db import Database
from app.services.processor import ImageProcessor
from app.core.config import Settings

class BoothService:
    def __init__(self):
        self.db = Database()
        self.processor = ImageProcessor()
        self.output_dir = 'static/outputs'
        # အခြေခံ Output Folder ဆောက်မယ်
        os.makedirs(self.output_dir, exist_ok=True)
        # Dual Printer အတွက် Folder ခွဲဆောက်မယ်
        os.makedirs(os.path.join(self.output_dir, '6x2'), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, '6x4'), exist_ok=True)

    def create_order(self, amount=5000, layout_id='1000022813'):
        order_id = str(uuid.uuid4())[:8].upper()
        self.db.query(
            "INSERT INTO orders (order_id, amount, status, layout_id) VALUES (?, ?, ?, ?)",
            (order_id, amount, 'pending', layout_id)
        )
        return order_id

    def update_order_status(self, order_id, new_status):
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
            # 1. Base64 Clean up
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]
            img_data = base64.b64decode(base64_str)

            # 2. Dual Printer Routing Logic
            # Layout ID ပေါ်မူတည်ပြီး Paper Size ကို ရှာမယ်
            active_layouts = Settings.load().get('active_layouts', {})
            paper_size = "6x2" # default
            for size, layouts in active_layouts.items():
                if str(layout_id) in layouts:
                    paper_size = size
                    break

            # 3. ပုံကို သက်ဆိုင်ရာ Folder ထဲ သိမ်းမယ် (Spooler က ဒီကနေ လှမ်းဖတ်ရုံပဲ)
            filename = f"PRINT_{paper_size}_{order_id}_{layout_id}.jpg"
            save_path = os.path.join(self.output_dir, paper_size, filename)
            
            with open(save_path, 'wb') as f:
                f.write(img_data)

            # 4. DB Status Update
            self.update_order_status(order_id, 'completed')
            
            return f"/{save_path}"
        except Exception as e:
            print(f"❌ Printing Error: {e}")
            raise e

