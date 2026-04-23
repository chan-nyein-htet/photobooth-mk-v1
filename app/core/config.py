import json
import os

class Settings:
    FILE_PATH = 'app/core/settings.json'

    @classmethod
    def load(cls):
        """JSON ဖိုင်ကို ဖတ်ယူခြင်း"""
        if not os.path.exists(cls.FILE_PATH):
            print(f"⚠️ Warning: {cls.FILE_PATH} not found.")
            return {}
        try:
            with open(cls.FILE_PATH, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading JSON: {e}")
            return {}

    @classmethod
    def get_allowed_layouts(cls):
        """Printer Mode အပေါ်မူတည်ပြီး 6x2 နဲ့ 6x4 ကို ခွဲပြီး Dictionary နဲ့ ပြန်ပေးမယ်"""
        data = cls.load()
        mode = data.get('printer_mode', 'dual')
        p1_size = data.get('p1_size', '6x2')
        p2_size = data.get('p2_size', '6x4')
        all_layouts = data.get('active_layouts', {})

        # အစမှာ အလွတ်သတ်မှတ်မယ်
        allowed = {
            "6x2": [],
            "6x4": []
        }

        # Printer 1 ရဲ့ Layouts တွေကို အမြဲယူမယ်
        allowed[p1_size] = all_layouts.get(p1_size, [])

        # Dual Mode ဖြစ်ရင် Printer 2 ရဲ့ Layouts တွေကိုပါ ပေါင်းထည့်မယ်
        if mode == 'dual':
            allowed[p2_size] = all_layouts.get(p2_size, [])

        return allowed

    @classmethod
    def get_canvas_config(cls, layout_id):
        """Layout ID အလိုက် Canvas Size ကို ပြန်ပေးခြင်း"""
        data = cls.load()
        active_layouts = data.get('active_layouts', {})
        canvas_configs = data.get('canvas_configs', {})

        target_size = "6x2" 
        for size, layouts in active_layouts.items():
            if layout_id in layouts:
                target_size = size
                break

        return canvas_configs.get(target_size, {"width": 1200, "height": 1800})

