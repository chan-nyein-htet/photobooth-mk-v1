import socket
import os
from flask import render_template
from app import create_app
from app.core.config import Settings

# Initialize the Flask application using our Factory function
app = create_app()

def get_local_ip():
    """Retrieve the local IP address for the server display."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

@app.route('/')
def index():
    """Main landing page route."""
    all_settings = Settings.load()
    active_layouts = Settings.get_allowed_layouts()
    canvas_configs = all_settings.get('canvas_configs', {})

    return render_template(
        'index.html',
        printer_mode=all_settings.get('printer_mode', 'dual'),
        active_layouts=active_layouts,
        canvas_configs=canvas_configs
    )

if __name__ == '__main__':
    # Ensure mandatory upload directory exists
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    local_ip = get_local_ip()
    print(f"\n✨ PHX-PHOTOBOOTH MK-V2: REFACTORED ✨")
    print(f"🚀 Server is running on: http://{local_ip}:5000")
    print(f"💡 Architecture Status: Tiny Modules Active")
    print(f"-------------------------------------------")

    # Start the Flask development server
    app.run(host='0.0.0.0', port=5000, debug=True)

