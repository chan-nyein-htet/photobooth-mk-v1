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
        """Printer Mode အပေါ်မူတည်ပြီး ခွင့်ပြုထားသော Layout များကို ပြန်ပေးခြင်း"""
        data = cls.load()
        mode = data.get('printer_mode', 'single')
        p1_size = data.get('p1_size', '6x2')
        p2_size = data.get('p2_size', '6x4')
        all_layouts = data.get('active_layouts', {})

        allowed = []
        # Printer 1 ရဲ့ Layouts တွေကို အမြဲယူမယ်
        allowed.extend(all_layouts.get(p1_size, []))

        # Dual Mode ဖြစ်ရင် Printer 2 ရဲ့ Layouts တွေကိုပါ ပေါင်းထည့်မယ်
        if mode == 'dual':
            allowed.extend(all_layouts.get(p2_size, []))

        # Duplicate ဖြစ်နိုင်တာတွေကို ဖယ်ထုတ်ပြီး List ပြန်ပေးမယ်
        return list(set(allowed))

    @classmethod
    def get_canvas_config(cls, layout_id):
        """Layout ID အလိုက် Width နဲ့ Height (Canvas Size) ကို ပြန်ပေးခြင်း"""
        data = cls.load()
        active_layouts = data.get('active_layouts', {})
        canvas_configs = data.get('canvas_configs', {})

        # Layout ID က ဘယ် Size အမျိုးအစား (6x2 လား၊ 6x4 လား) ထဲမှာ ပါသလဲ ရှာမယ်
        target_size = "6x2" # Default size
        for size, layouts in active_layouts.items():
            if layout_id in layouts:
                target_size = size
                break
        
        # JSON ထဲက Canvas Config ကို ယူမယ်၊ မရှိရင် Default Standard (1200, 1800) ပြန်ပေးမယ်
        return canvas_configs.get(target_size, {"width": 1200, "height": 1800})

