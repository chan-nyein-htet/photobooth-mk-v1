import { UI } from './ui.js';

export const Filters = {
    allFilters: [],

    async init(canvas) {
        window.Filters = Filters; 
        try {
            // 🎯 Fabric Filter Backend ကို သေချာ Initialize လုပ်မယ်
            if (fabric.isWebglSupported && fabric.isWebglSupported()) {
                fabric.filterBackend = new fabric.WebglFilterBackend();
            } else {
                fabric.filterBackend = new fabric.CanvasFilterBackend();
            }

            const res = await fetch('/api/assets');
            const data = await res.json();
            this.allFilters = data.filters || ['none', 'grayscale', 'sepia', 'brightness'];

            UI.renderEffects(this.allFilters, canvas, null, (filterName) => {
                this.applyToActiveObject(canvas, filterName);
            });
        } catch (err) {
            console.error("❌ Filters Init Error:", err);
            this.allFilters = ['none', 'grayscale', 'sepia', 'brightness'];
            UI.renderEffects(this.allFilters, canvas, null, (f) => this.applyToActiveObject(canvas, f));
        }
    },

    applyToActiveObject(canvas, filterName) {
        const activeObject = canvas.getActiveObject();
        // 🎯 ပုံရွေးထားမှ Filter ပေးလုပ်မယ်
        if (!activeObject || !activeObject.isPhoto) {
            console.warn("Please select a photo first!");
            return;
        }

        const name = filterName.toLowerCase();
        activeObject.filters = []; // Clear old filters

        if (name === 'grayscale') {
            activeObject.filters.push(new fabric.Image.filters.Grayscale());
        } else if (name === 'sepia') {
            activeObject.filters.push(new fabric.Image.filters.Sepia());
        } else if (name === 'warm' || name === 'brightness') {
            activeObject.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.1 }));
        }

        // 🎯 Filter ကို လက်တွေ့ Apply လုပ်တဲ့ အပိုင်း
        activeObject.applyFilters();
        activeObject.currentFilterName = name;
        canvas.requestRenderAll();
        
        this.updateFilterUI(name);
    },

    updateFilterUI(filterName) {
        const activeName = filterName ? filterName.toLowerCase() : 'none';
        document.querySelectorAll('#effectList .box').forEach(el => {
            const span = el.querySelector('span');
            const label = span ? span.innerText.toLowerCase() : "";
            const isMatch = label === activeName || (activeName === 'none' && label === 'original');
            el.style.border = isMatch ? '2px solid #00D1FF' : '1px solid rgba(255, 255, 255, 0.1)';
            el.style.background = isMatch ? 'rgba(0, 209, 255, 0.1)' : 'transparent';
        });
    }
};

