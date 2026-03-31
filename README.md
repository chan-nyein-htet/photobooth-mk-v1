# AI Photobooth v2.0.1 📸

A professional-grade, web-based AI Photobooth featuring real-time face detection, sticker overlays, and flexible orientation controls.

---

## ✨ Features
* **AI Face Detection:** Real-time tracking and sticker placement powered by MediaPipe.
* **Fixed Aspect Ratios:** Manual toggles for **Portrait (450x800)** and **Landscape (800x450)** modes to ensure consistent UI across different monitors.
* **Auto-Crop Viewfinder:** Uses `object-fit: cover` to eliminate black bars and fill the container with the webcam feed.
* **Modern Circle UI:** Intuitive circular buttons for Snap, Retake, and Next actions.
* **Dynamic Gallery:** Local session storage for captured shots (supports 1-6 shots).

---

## 🛠 Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **AI Engine:** [Google MediaPipe Face Detection](https://google.github.io/mediapipe/solutions/face_detection)
* **Camera API:** Web MediaDevices API

---

## 🚀 Full Environment Setup

### 1. Prerequisites
Since the application uses the Camera API, it **must** be served over `HTTPS` or `localhost` due to browser security policies.

### 2. Running a Local Server
Choose one of the following methods to start the app:

* **Method A: Python (Fastest)**
    ```bash
    python -m http.server 8000
    ```
    Access at: `http://localhost:8000`

* **Method B: Node.js (http-server)**
    ```bash
    npm install -g http-server
    http-server
    ```

* **Method C: VS Code**
    Install the **"Live Server"** extension and click **"Go Live"** on `index.html`.

---

## 📂 Project Structure
```text
├── index.html          # Main Application (UI & Logic)
├── README.md           # Project Documentation
└── assets/             # (Optional) Local stickers or assets

