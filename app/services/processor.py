import cv2
import numpy as np
import base64
import os
from PIL import Image
from io import BytesIO
from app.core.config import Settings # ✅ Settings ကို import လုပ်ပါ

class ImageProcessor:
    def __init__(self, upload_folder='static/uploads'):
        self.upload_folder = upload_folder
        self.output_folders = {
            'originals': os.path.join(upload_folder, 'originals'),
            'strips': os.path.join(upload_folder, 'outputs/strips')
        }
        for folder in self.output_folders.values():
            os.makedirs(folder, exist_ok=True)

    def save_base64_image(self, base64_data, filename):
        try:
            header, encoded = base64_data.split(",", 1)
            data = base64.b64decode(encoded)
            file_path = os.path.join(self.output_folders['originals'], filename)
            with open(file_path, "wb") as f:
                f.write(data)
            return file_path
        except Exception as e:
            print(f"❌ Error saving image: {e}")
            return None

    def convert_to_pdf(self, session_id, collage_base64, layout_id):
        """Layout ID ပေါ်မူတည်ပြီး Dynamic Canvas Size ဖြင့် PDF ပြောင်းသည်"""
        try:
            header, encoded = collage_base64.split(",", 1)
            data = base64.b64decode(encoded)
            img = Image.open(BytesIO(data))

            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # ✅ JSON ထဲကနေ Layout အလိုက် Canvas Size ကို ဆွဲထုတ်မယ်
            canvas_cfg = Settings.get_canvas_config(layout_id)
            target_size = (canvas_cfg['width'], canvas_cfg['height'])
            
            print(f"🎨 Processing Layout {layout_id}: Size {target_size}")

            # Resize လုပ်မယ် (LANCZOS က quality အကောင်းဆုံးပဲ)
            img = img.resize(target_size, Image.Resampling.LANCZOS)

            pdf_path = os.path.join(self.output_folders['strips'], f"print_{session_id}.pdf")
            img.save(pdf_path, "PDF", resolution=300.0)

            return f"static/uploads/outputs/strips/print_{session_id}.pdf"

        except Exception as e:
            print(f"❌ PDF Conversion Error: {e}")
            return None

