import os
import uuid
import base64
from app.core.db import Database

class StorageService:
    def __init__(self, upload_base='static/uploads'):
        # Define paths for different image categories
        self.upload_base = upload_base
        self.originals_dir = os.path.join(upload_base, 'originals')
        self.db = Database()
        
        # Ensure directories exist
        os.makedirs(self.originals_dir, exist_ok=True)

    def save_base64_image(self, base64_data, order_id):
        """
        Decodes base64 string and saves it as a JPG file.
        Also records the file path in the database linked to an order.
        """
        try:
            # Handle potential data URI header
            if "," in base64_data:
                header, encoded = base64_data.split(",", 1)
            else:
                encoded = base64_data
                
            data = base64.b64decode(encoded)
            filename = f"shot_{uuid.uuid4().hex[:10]}.jpg"
            file_path = os.path.join(self.originals_dir, filename)
            
            # Write binary data to file
            with open(file_path, "wb") as f:
                f.write(data)
                
            # Log the saved photo in the database
            self.db.query(
                "INSERT INTO photos (name, photo_path, order_id) VALUES (?, ?, ?)",
                (filename, file_path, order_id)
            )
            
            return file_path
        except Exception as e:
            print(f"❌ Storage Service Error: {e}")
            return None

    def get_order_photos(self, order_id):
        """Retrieves all photos associated with a specific order."""
        return self.db.query(
            "SELECT * FROM photos WHERE order_id = ? ORDER BY created_at ASC",
            (order_id,)
        )

