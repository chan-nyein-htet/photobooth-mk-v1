import json
import os

class Settings:
    FILE_PATH = 'app/core/settings.json'

    @classmethod
    def load(cls):
        """JSON ဖိုင်ကို ဖတ်ယူခြင်း"""
        if not os.path.exists(cls.FILE_PATH):
            return {}
        try:
            with open(cls.FILE_PATH, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading JSON: {e}")
            return {}

    @classmethod
    def save(cls, data):
        """JSON ဖိုင်ထဲသို့ အချက်အလက်များ သိမ်းဆည်းခြင်း"""
        try:
            with open(cls.FILE_PATH, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"❌ Error saving JSON: {e}")
            return False

    @classmethod
    def update_layout_details(cls, layout_id, slots_data):
        """
        Template အသစ်တင်ရင် အပေါက်နေရာ (Slots) တွေကို 
        JSON ထဲမှာ အလိုအလျောက် သွားသိမ်းပေးမယ့် Nerve
        """
        data = cls.load()
        if "layout_details" not in data:
            data["layout_details"] = {}

        # layout_id တစ်ခုချင်းစီအတွက် slots data ကို သိမ်းမယ်
        data["layout_details"][layout_id] = {
            "slots": slots_data
        }
        return cls.save(data)

    @classmethod
    def get_layout_details(cls, layout_id):
        """Layout ID အလိုက် Slot Coordinates တွေကို ပြန်ထုတ်ပေးမယ်"""
        data = cls.load()
        details = data.get('layout_details', {})
        return details.get(layout_id, {"slots": []})

    @classmethod
    def get_allowed_layouts(cls):
        """Printer Mode အပေါ်မူတည်ပြီး ခွင့်ပြုထားတဲ့ Layout တွေကို ပြန်ပေးမယ်"""
        data = cls.load()
        mode = data.get('printer_mode', 'dual')
        p1_size = data.get('p1_size', '6x2')
        p2_size = data.get('p2_size', '6x4')
        all_layouts = data.get('active_layouts', {})

        allowed = {"6x2": [], "6x4": []}
        allowed[p1_size] = all_layouts.get(p1_size, [])
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

