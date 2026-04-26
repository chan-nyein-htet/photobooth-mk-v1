import os
import uuid
import base64
import json
from datetime import datetime
from PIL import Image
from io import BytesIO
from werkzeug.utils import secure_filename
from app.core.db import Database
from app.services.processor import ImageProcessor
from app.core.config import Settings

class BoothService:
    def __init__(self):
        self.db = Database()
        self.processor = ImageProcessor()
        self.output_dir = 'static/outputs'
        
        # Folder များ အလိုအလျောက် တည်ဆောက်ခြင်း
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, '6x2'), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, '6x4'), exist_ok=True)
        os.makedirs('static/assets/stickers', exist_ok=True)
        os.makedirs('static/assets/fonts', exist_ok=True)

    # --- 🛒 ORDER & PAYMENT LOGIC ---
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

    # --- 📸 PHOTO LOGIC ---
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

    # --- 🎯 ASSETS READ LOGIC (STICKERS & FILTERS) ---
    def get_all_stickers(self):
        try:
            return self.db.query("SELECT * FROM stickers WHERE is_active = 1")
        except Exception as e:
            print(f"❌ DB Sticker Error: {e}")
            return []

    def get_all_filters(self):
        try:
            return self.db.query("SELECT * FROM effects WHERE is_active = 1")
        except Exception as e:
            print(f"❌ DB Filter Error: {e}")
            return []

    # --- ⚙️ ADMIN CRUD LOGIC (NEW: FOR STICKERS, FILTERS & FONTS) ---
    
    def add_sticker(self, name, file):
        """Sticker (PNG) ကို static ထဲသိမ်းပြီး DB ထဲ path ထည့်သည်"""
        filename = secure_filename(file.filename)
        save_path = os.path.join('static/assets/stickers', filename)
        file.save(save_path)
        url = f"/{save_path}"
        return self.db.query(
            "INSERT INTO stickers (name, url, is_active) VALUES (?, ?, 1)", 
            (name, url)
        )

    def add_filter(self, name, css):
        """CSS Filter string ကို DB ထဲ တန်းသိမ်းသည်"""
        return self.db.query(
            "INSERT INTO effects (name, filter_css, is_active) VALUES (?, ?, 1)", 
            (name, css)
        )

    def upload_font(self, file):
        """TTF Font File ကို တိုက်ရိုက် Upload တင်သည်"""
        filename = secure_filename(file.filename)
        save_path = os.path.join('static/assets/fonts', filename)
        file.save(save_path)
        return f"/{save_path}"

    # --- 🖼️ FINAL PRINT GENERATION ---
    def generate_final_print(self, base64_str, order_id, layout_id):
        try:
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]
            img_data = base64.b64decode(base64_str)

            all_settings = Settings.load()
            active_layouts = all_settings.get('active_layouts', {})
            paper_size = "6x2"
            for size, layouts in active_layouts.items():
                if str(layout_id) in layouts:
                    paper_size = size
                    break

            with Image.open(BytesIO(img_data)) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                canvas_cfg = all_settings.get('canvas_configs', {}).get(paper_size, {"width": 600, "height": 1800})
                target_size = (int(canvas_cfg['width'] * 3), int(canvas_cfg['height'] * 3))

                final_img = img.resize(target_size, Image.Resampling.LANCZOS)
                filename = f"PRINT_{paper_size}_{order_id}_{layout_id}.jpg"
                save_path = os.path.join(self.output_dir, paper_size, filename)
                final_img.save(save_path, "JPEG", quality=100, subsampling=0, dpi=(300, 300))

            self.update_order_status(order_id, 'completed')
            return f"/{save_path}"
        except Exception as e:
            print(f"❌ Printing Error: {e}")
            raise e

