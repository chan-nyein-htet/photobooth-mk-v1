import os
import cv2
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from app.core.config import Settings

class PrintEngine:
    def __init__(self):
        self.output_dir = 'static/outputs'
        # Ensure output subdirectories exist
        os.makedirs(os.path.join(self.output_dir, '6x2'), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, '6x4'), exist_ok=True)

    def auto_detect_slots(self, image_path):
        """Uses OpenCV to find transparent or dark slots in a template image."""
        img = cv2.imread(image_path)
        if img is None: return []
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Threshold to find slots (assuming they are near-black or transparent)
        _, thresh = cv2.threshold(gray, 2, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        slots = []
        for cnt in contours:
            if cv2.contourArea(cnt) > 5000: # Filter out noise
                x, y, w, h = cv2.boundingRect(cnt)
                # Slight offset to ensure images cover the slot area
                slots.append({"x": max(0, x-2), "y": max(0, y-2), "w": w+4, "h": h+4})
        
        # Sort slots by Y-axis to maintain logical order
        return sorted(slots, key=lambda k: k['y'])

    def generate_final_print(self, base64_str, order_id, layout_id):
        """Processes the final collage into a high-resolution JPEG for printing."""
        try:
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]
            img_data = base64.b64decode(base64_str)

            # Determine paper size from layout_id
            all_settings = Settings.load()
            paper_size = "6x2"
            for size, layouts in all_settings.get('active_layouts', {}).items():
                if str(layout_id) in layouts:
                    paper_size = size
                    break

            with Image.open(BytesIO(img_data)) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                # Get high-res canvas config (3x scaling for 300 DPI quality)
                canvas_cfg = all_settings.get('canvas_configs', {}).get(paper_size, {"width": 600, "height": 1800})
                target_size = (int(canvas_cfg['width'] * 3), int(canvas_cfg['height'] * 3))

                # High-quality resize
                final_img = img.resize(target_size, Image.Resampling.LANCZOS)
                
                filename = f"PRINT_{paper_size}_{order_id}_{layout_id}.jpg"
                save_path = os.path.join(self.output_dir, paper_size, filename)
                
                # Save with maximum quality settings
                final_img.save(save_path, "JPEG", quality=100, subsampling=0, dpi=(300, 300))

            return f"/{save_path}"
        except Exception as e:
            print(f"❌ Print Engine Error: {e}")
            raise e

