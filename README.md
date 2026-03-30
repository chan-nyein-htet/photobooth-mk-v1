# 📸 AI Photobooth v2.0 - Stable Edition

A web-based professional photobooth application developed with Flask and Vanilla JavaScript. This version (v2.0) focuses on user-controlled photography with flexible layout options and selective editing.

## 🚀 Key Features (v2.0 Updates)
- **Dynamic Photo Selection:** Choose between 1 to 6 total photos before starting the session.
- **Orientation Switching:** Support for both **Portrait (3:4)** and **Landscape (4:3)** modes per photo.
- **Selective Retake (Smart Edit):** Tap any photo in the library to re-capture it without restarting the entire session.
- **Improved Compatibility:** Optimized camera initialization script for mobile and desktop browsers (v2.8 based stable core).
- **Responsive UI:** Dark-themed professional interface designed for 1200px+ screens and mobile devices.

## 🛠️ Technology Stack
- **Backend:** Python (Flask)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Hardware Access:** MediaDevices API (getUserMedia)

## 📂 Project Structure
```text
├── app.py              # Flask Backend Server
├── templates/
│   └── index.html      # Main Photobooth UI (v2.0)
└── static/
    └── photos/         # Saved captures (Future use)

