import { State } from './state.js';
import { UI } from './ui.js';

export const Filters = {
    async init(canvas) {
        window.Filters = Filters;
        try {
            const res = await fetch('/api/assets');
            const data = await res.json();
            UI.renderEffects(data.filters || [], canvas, null, (f) => {
                this.applyToSelected(canvas, f);
            });
            console.log("✨ Filters Initialized");
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

        if (name === 'grayscale') {
            activeObject.filters.push(new fabric.Image.filters.Grayscale());
        } else if (name === 'sepia') {
            activeObject.filters.push(new fabric.Image.filters.Sepia());
        } else if (filterValue.includes('contrast')) { 
            activeObject.filters.push(new fabric.Image.filters.Sepia());
            activeObject.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.1 }));
        }

        activeObject.applyFilters();
        canvas.requestRenderAll();
    }
};

