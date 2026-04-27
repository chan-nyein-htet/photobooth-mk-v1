import os
from werkzeug.utils import secure_filename
from app.core.db import Database

class AssetService:
    def __init__(self):
        self.db = Database()
        self.sticker_dir = 'static/assets/stickers'
        self.font_dir = 'static/assets/fonts'
        
        # Ensure asset directories exist
        os.makedirs(self.sticker_dir, exist_ok=True)
        os.makedirs(self.font_dir, exist_ok=True)

    # --- Sticker Management ---
    def get_active_stickers(self):
        """Fetches all active stickers from the database."""
        return self.db.query("SELECT * FROM stickers WHERE is_active = 1")

    def add_sticker(self, name, file):
        """Saves a sticker image file and records its metadata in the database."""
        filename = secure_filename(file.filename)
        save_path = os.path.join(self.sticker_dir, filename)
        file.save(save_path)
        
        # Store relative URL for frontend access
        url = f"/{save_path}"
        return self.db.query(
            "INSERT INTO stickers (name, url, is_active) VALUES (?, ?, 1)",
            (name, url)
        )

    # --- Filter Management ---
    def get_active_filters(self):
        """Fetches all active CSS filters from the database."""
        return self.db.query("SELECT * FROM effects WHERE is_active = 1")

    def add_filter(self, name, css_string):
        """Adds a new CSS filter effect to the database."""
        return self.db.query(
            "INSERT INTO effects (name, filter_css, is_active) VALUES (?, ?, 1)",
            (name, css_string)
        )

    # --- Font Management ---
    def get_available_fonts(self):
        """Scans the font directory and returns a list of font assets."""
        fonts = []
        if os.path.exists(self.font_dir):
            for f in os.listdir(self.font_dir):
                if f.lower().endswith(('.ttf', '.otf')):
                    fonts.append({
                        "id": f,
                        "name": f,
                        "url": f"/{self.font_dir}/{f}"
                    })
        return fonts

    def upload_font(self, file):
        """Saves a font file (TTF/OTF) to the assets directory."""
        filename = secure_filename(file.filename)
        save_path = os.path.join(self.font_dir, filename)
        file.save(save_path)
        return f"/{save_path}"

