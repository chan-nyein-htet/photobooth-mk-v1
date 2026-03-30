from flask import Flask, render_template, request, jsonify
import sqlite3
import base64
import os

app = Flask(__name__)

# --- ၁။ Infrastructure Setup (Folder & Database) ---
UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def init_db():
    conn = sqlite3.connect('photobooth.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            photo_path TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# --- ၂။ Routes (Website လမ်းကြောင်းများ) ---

# Home Page: Browser ကနေ ဝင်ကြည့်မယ့်နေရာ
@app.route('/')
def index():
    return render_template('index.html')

# Upload Endpoint: ဓာတ်ပုံကို လက်ခံပြီး သိမ်းမယ့်နေရာ
@app.route('/upload', methods=['POST'])
def upload():
    try:
        data = request.json
        image_data = data['image'].split(",")[1] # Base64 string ကို ခွဲထုတ်တာ
        
        # ဖိုင်အမည်ကို အချိန်နဲ့ပေးပြီး သိမ်းမယ်
        import time
        filename = f"photo_{int(time.time())}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # ပုံကို Decoding လုပ်ပြီး File အဖြစ် ရေးမယ်
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_data))
            
        # Database ထဲကို သိမ်းမယ်
        conn = sqlite3.connect('photobooth.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO photos (name, photo_path) VALUES (?, ?)', ('User', filepath))
        conn.commit()
        conn.close()
        
        return jsonify({"status": "success", "message": "Photo Saved!", "path": filepath})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- ၃။ Server Start ---
if __name__ == "__main__":
    init_db()
    print("AI Photobooth Server is starting...")
    app.run(host='0.0.0.0', port=5000, debug=True)

