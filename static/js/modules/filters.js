import { State } from './state.js';
import { UI } from './ui.js';

export const Filters = {
    async init(canvas) {
        window.Filters = Filters;
        try {
            const res = await fetch('/api/assets');
            const data = await res.json();
            
            // Window တွင် သိမ်းထားမှ Selection Change တိုင်း UI Render ပြန်ခေါ်နိုင်မည်
            window.currentFilters = data.filters || [];
            
            UI.renderEffects(window.currentFilters, canvas, null, (f) => {
                this.applyToSelected(canvas, f);
            });
        } catch (err) {
            console.warn("⚠️ Filter fetch failed.");
        }
    },

    applyToSelected(canvas, filterValue) {
        let activeObject = canvas.getActiveObject();
        if (!activeObject || !activeObject.isPhoto) {
            activeObject = canvas.getObjects().find(o => o.isPhoto);
        }
        if (!activeObject) return;

        const name = filterValue.includes('(') ? filterValue.split('(')[0].toLowerCase() : filterValue.toLowerCase();
        activeObject.filters = [];
        activeObject.currentFilterName = name;

        // Fabric.js Filter Mapping
        if (name === 'grayscale') {
            activeObject.filters.push(new fabric.Image.filters.Grayscale());
        } else if (name === 'sepia') {
            activeObject.filters.push(new fabric.Image.filters.Sepia());
        } else if (filterValue.includes('brightness')) {
            activeObject.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.15 }));
        } else if (filterValue.includes('contrast')) {
            activeObject.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.25 }));
        }

        activeObject.applyFilters();
        canvas.requestRenderAll();
    }
};

