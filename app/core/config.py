import json
import os

class Settings:
    # Path to the shared settings JSON file
    FILE_PATH = 'app/core/settings.json'

    @classmethod
    def load(cls):
        """Loads configuration data from the JSON file."""
        if not os.path.exists(cls.FILE_PATH):
            return {}
        try:
            with open(cls.FILE_PATH, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading JSON settings: {e}")
            return {}

    @classmethod
    def save(cls, data):
        """Saves configuration data back to the JSON file with indentation."""
        try:
            with open(cls.FILE_PATH, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"❌ Error saving JSON settings: {e}")
            return False

    @classmethod
    def get_layout_details(cls, layout_id):
        """Retrieves slot coordinates and metadata for a specific layout ID."""
        data = cls.load()
        details = data.get('layout_details', {})
        return details.get(str(layout_id), {"slots": []})

    @classmethod
    def get_allowed_layouts(cls):
        """Returns active layouts categorized by paper size based on the printer mode."""
        data = cls.load()
        mode = data.get('printer_mode', 'dual')
        p1_size = data.get('p1_size', '6x2')
        p2_size = data.get('p2_size', '6x4')
        all_layouts = data.get('active_layouts', {})

        allowed = {"6x2": [], "6x4": []}
        allowed[p1_size] = all_layouts.get(p1_size, [])
        
        # If dual mode is active, include layouts for the second paper size
        if mode == 'dual':
            allowed[p2_size] = all_layouts.get(p2_size, [])
        return allowed

    @classmethod
    def get_canvas_config(cls, layout_id):
        """Fetches the specific canvas dimensions (width/height) for a layout."""
        data = cls.load()
        active_layouts = data.get('active_layouts', {})
        canvas_configs = data.get('canvas_configs', {})

        # Default to 6x2 if layout is not found in a specific category
        target_size = "6x2"
        for size, layouts in active_layouts.items():
            if str(layout_id) in layouts:
                target_size = size
                break
        return canvas_configs.get(target_size, {"width": 600, "height": 1800})

