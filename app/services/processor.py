import cv2
import numpy as np
import base64
import os
from PIL import Image
from io import BytesIO

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
        """Base64 ကို JPEG အဖြစ် originals folder ထဲမှာ သိမ်းသည် (Logic မပြောင်းလဲပါ)"""
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

    def convert_to_pdf(self, session_id, collage_base64):
        """Frontend က ပို့လိုက်တဲ့ Final Collage ကို 4x6 inch (300 DPI) PDF အဖြစ် ပြောင်းသည်"""
        try:
            header, encoded = collage_base64.split(",", 1)
            data = base64.b64decode(encoded)
            img = Image.open(BytesIO(data))

            # ၁။ RGB ပြောင်း (PDF support ရအောင်)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # ၂။ Physical Size ကို 4x6 inch (300 DPI) ဖြစ်အောင် Resize လုပ်မယ်
            # 4 inch * 300 = 1200px, 6 inch * 300 = 1800px
            # မင်းရဲ့ Collage က Portrait ဆိုရင် (1200, 1800), Landscape ဆိုရင် (1800, 1200)
            target_size = (1200, 1800) 
            img = img.resize(target_size, Image.Resampling.LANCZOS)

            # ၃။ PDF သိမ်းမည်
            pdf_path = os.path.join(self.output_folders['strips'], f"print_{session_id}.pdf")
            img.save(pdf_path, "PDF", resolution=300.0)
            
            # Frontend က သုံးလို့ရအောင် relative path ပြန်ပေးမယ်
            return f"static/uploads/outputs/strips/print_{session_id}.pdf"
            
        except Exception as e:
            print(f"❌ PDF Conversion Error: {e}")
            return None

