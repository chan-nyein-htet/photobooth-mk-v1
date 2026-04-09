import cv2
import numpy as np
import base64
import os

class ImageProcessor:
    def __init__(self, upload_folder='static/uploads'):
        self.upload_folder = upload_folder
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)

    def save_base64_image(self, base64_data, filename):
        """Base64 data ကို JPEG ဖိုင်အဖြစ် ပြောင်းလဲသိမ်းဆည်းသည်"""
        try:
            # ✅ data:image/jpeg;base64, header ကို ဖယ်ထုတ်သည်
            header, encoded = base64_data.split(",", 1)
            data = base64.b64decode(encoded)
            
            file_path = os.path.join(self.upload_folder, filename)
            with open(file_path, "wb") as f:
                f.write(data)
            
            return file_path
        except Exception as e:
            print(f"Error saving image: {e}")
            return None

    def apply_filter(self, image_path, filter_type):
        """OpenCV သုံးပြီး filter များ ထည့်သွင်းရန် (လိုအပ်ပါက သုံးရန်)"""
        # လက်ရှိမှာ Frontend က filter လုပ်ပြီးသားမို့ ဒါကို extension အနေနဲ့ ထားထားမယ်
        img = cv2.imread(image_path)
        if filter_type == 'grayscale':
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        cv2.imwrite(image_path, img)
        return image_path
