from flask import Flask, render_template, request, jsonify
import sqlite3
import base64
import os
import cv2
import numpy as np
import time
import uuid

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def init_db():
    conn = sqlite3.connect('photobooth.db')
    cursor = conn.cursor()

    # Tables ဆောက်ခြင်း
    cursor.execute('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, photo_path TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)')
    cursor.execute('CREATE TABLE IF NOT EXISTS stickers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, url TEXT, is_active INTEGER DEFAULT 1)')
    cursor.execute('CREATE TABLE IF NOT EXISTS effects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, filter_css TEXT, is_active INTEGER DEFAULT 1)')
    
    # ✅ Roadmap Step 3: Payment Tracking Table (New)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE,
            amount REAL,
            status TEXT DEFAULT 'pending', 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Database ထဲမှာ Data ရှိမရှိစစ်ပြီး Default Assets များ ထည့်ခြင်း
    check = cursor.execute('SELECT COUNT(*) FROM stickers').fetchone()[0]
    if check == 0:
        default_stickers = [
            ('Glasses', '/static/assets/stickers/glasses.png'),
            ('Heart', 'https://cdn-icons-png.flaticon.com/512/616/616408.png'),
            ('Star', 'https://cdn-icons-png.flaticon.com/512/2912/2912258.png'),
            ('Crown', 'https://cdn-icons-png.flaticon.com/512/6941/6941697.png'),
            ('Cool Shades', 'https://cdn-icons-png.flaticon.com/512/6559/6559393.png'),
            ('Cute Cat', 'https://cdn-icons-png.flaticon.com/512/6020/6020612.png'),
            ('Devil Horns', 'https://cdn-icons-png.flaticon.com/512/3252/3252431.png'),
            ('Party Hat', 'https://cdn-icons-png.flaticon.com/512/7409/7409163.png')
        ]
        cursor.executemany('INSERT INTO stickers (name, url) VALUES (?, ?)', default_stickers)

    check_eff = cursor.execute('SELECT COUNT(*) FROM effects').fetchone()[0]
    if check_eff == 0:
        default_effects = [
            ('NONE', 'none'), ('B&W', 'grayscale(100%)'), ('CLASSIC', 'sepia(100%)'),
            ('NEGATIVE', 'invert(100%)'), ('GLOW', 'brightness(1.5)'),
            ('VINTAGE', 'sepia(0.8) contrast(1.2)'), ('DREAMY', 'blur(1px) brightness(1.2) saturate(1.5)'),
            ('NIGHT', 'hue-rotate(180deg) brightness(0.8)'), ('CYBER', 'hue-rotate(90deg) saturate(2) contrast(1.5)'),
            ('WARM', 'sepia(0.3) brightness(1.1) saturate(1.3)')
        ]
        cursor.executemany('INSERT INTO effects (name, filter_css) VALUES (?, ?)', default_effects)

    conn.commit()
    conn.close()

def apply_sticker(image_path, sticker_url):
    # အခုလောလောဆယ် Glasses အတွက် AI Processing လုပ်ပေးထားသည် (Roadmap အရ Dynamic ပြင်ရန် ရှိသည်)
    local_path = 'static/assets/stickers/glasses.png'
    img = cv2.imread(image_path)
    if img is None: return

    face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 6, minSize=(100, 100))
    sticker = cv2.imread(local_path, cv2.IMREAD_UNCHANGED)

    if sticker is not None and len(faces) > 0:
        for (x, y, w, h) in faces:
            sticker_res = cv2.resize(sticker, (w, int(h/3)))
            s_h, s_w, _ = sticker_res.shape
            offset_y = int(h / 5)
            for i in range(s_h):
                for j in range(s_w):
                    ty, tx = y + i + offset_y, x + j
                    if ty < img.shape[0] and tx < img.shape[1] and sticker_res[i, j, 3] > 0:
                        alpha = sticker_res[i, j, 3] / 255.0
                        img[ty, tx] = (1.0 - alpha) * img[ty, tx] + alpha * sticker_res[i, j, :3]
    cv2.imwrite(image_path, img)

@app.route('/')
def index(): return render_template('index.html')

@app.route('/api/assets')
def get_assets():
    conn = sqlite3.connect('photobooth.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    stickers = cursor.execute('SELECT name, url FROM stickers WHERE is_active = 1').fetchall()
    effects = cursor.execute('SELECT name, filter_css as filter FROM effects WHERE is_active = 1').fetchall()
    conn.close()
    return jsonify({"stickers": [dict(s) for s in stickers], "effects": [dict(e) for e in effects]})

# ✅ Payment APIs (New Roadmap Implementation)
@app.route('/api/create_order', methods=['POST'])
def create_order():
    conn = sqlite3.connect('photobooth.db')
    cursor = conn.cursor()
    order_id = str(uuid.uuid4())[:8].upper() # Demo Order ID
    cursor.execute('INSERT INTO orders (order_id, amount) VALUES (?, ?)', (order_id, 3000.0)) # Example 3000 MMK
    conn.commit()
    conn.close()
    return jsonify({"order_id": order_id, "status": "pending"})

@app.route('/api/check_payment/<order_id>')
def check_payment(order_id):
    conn = sqlite3.connect('photobooth.db')
    cursor = conn.cursor()
    status = cursor.execute('SELECT status FROM orders WHERE order_id = ?', (order_id,)).fetchone()
    conn.close()
    return jsonify({"status": status[0] if status else "not_found"})

# Demo အတွက် Payment ကို အတင်းအဓမ္မ Paid ပြောင်းပေးမည့် route
@app.route('/api/mock_pay/<order_id>')
def mock_pay(order_id):
    conn = sqlite3.connect('photobooth.db')
    cursor = conn.cursor()
    cursor.execute('UPDATE orders SET status = "paid" WHERE order_id = ?', (order_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Order {order_id} marked as Paid!"})

@app.route('/upload', methods=['POST'])
def upload():
    try:
        data = request.json
        image_data = base64.b64decode(data['image'].split(",")[1])
        sticker_url = data.get('sticker_url', '')
        filename = f"photo_{int(time.time())}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        with open(filepath, "wb") as f: f.write(image_data)
        
        # Database ထဲသို့ Photo Path သိမ်းခြင်း
        conn = sqlite3.connect('photobooth.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO photos (photo_path) VALUES (?)', (filepath,))
        conn.commit()
        conn.close()

        apply_sticker(filepath, sticker_url)
        return jsonify({"status": "success", "path": filepath})
    except Exception as e: return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)

