from flask import Flask, render_template, request, jsonify
import sqlite3
import base64
import os
import cv2
import numpy as np
import time

app = Flask(__name__)

# --- ၁။ Infrastructure Setup ---
UPLOAD_FOLDER = 'static/uploads'
STICKER_PATH = 'static/assets/stickers/glasses.png'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def init_db():
    conn = sqlite3.connect('photobooth.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            photo_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# --- ၂။ AI & Image Processing Logic (Precision Update) ---
def apply_sticker(image_path):
    img = cv2.imread(image_path)
    if img is None: return

    # XML file လမ်းကြောင်း
    cascade_path = 'haarcascade_frontalface_default.xml'
    if not os.path.exists(cascade_path):
        print("Error: XML file not found!")
        return

    face_cascade = cv2.CascadeClassifier(cascade_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # မျက်မှန်နှစ်ထပ်မဖြစ်အောင် minNeighbors ကို ၆ အထိ တိုးထားပြီး မျက်နှာအစစ်ကိုပဲ ရှာခိုင်းမယ်
    faces = face_cascade.detectMultiScale(
        gray, 
        scaleFactor=1.1, 
        minNeighbors=6, 
        minSize=(100, 100)
    )

    sticker = cv2.imread(STICKER_PATH, cv2.IMREAD_UNCHANGED)

    if sticker is not None and len(faces) > 0:
        for (x, y, w, h) in faces:
            # မျက်မှန်ကို မျက်နှာရဲ့ အကျယ်အတိုင်း Resize လုပ်မယ် (အမြင့်ကိုတော့ ၁/၃ ပဲ ယူမယ်)
            sticker_res = cv2.resize(sticker, (w, int(h/3))) 
            s_h, s_w, _ = sticker_res.shape
            
            # မျက်မှန်ကို မျက်လုံးနေရာ (နဖူးအောက် နည်းနည်း) ရောက်အောင် offset ညှိမယ်
            offset_y = int(h / 5) 

            for i in range(s_h):
                for j in range(s_w):
                    target_y, target_x = y + i + offset_y, x + j
                    
                    # Image boundary ထဲမှာ ရှိမရှိ စစ်မယ်
                    if target_y < img.shape[0] and target_x < img.shape[1]:
                        # Alpha channel ပါတဲ့ Sticker အတွက် Transparency blending လုပ်မယ်
                        if sticker_res[i, j, 3] > 0:
                            alpha = sticker_res[i, j, 3] / 255.0
                            img[target_y, target_x] = (1.0 - alpha) * img[target_y, target_x] + alpha * sticker_res[i, j, :3]
    
    cv2.imwrite(image_path, img)

# --- ၃။ Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    try:
        data = request.json
        image_data = base64.b64decode(data['image'].split(",")[1])
        
        filename = f"photo_{int(time.time())}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        with open(filepath, "wb") as f:
            f.write(image_data)

        # AI Processing (မျက်မှန်ကပ်ခြင်း)
        apply_sticker(filepath)

        # Database ထဲ သိမ်းဆည်းခြင်း
        conn = sqlite3.connect('photobooth.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO photos (name, photo_path) VALUES (?, ?)', ('User', filepath))
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "path": filepath})
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    init_db()
    print("AI Photobooth Server v2.0.4 - Double Glasses Fixed Starting...")
    app.run(host='0.0.0.0', port=5000, debug=True)

