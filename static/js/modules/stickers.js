import { State } from './state.js';
import { UI } from './ui.js';

export const Stickers = {
    canvas: null,

    async init() {
        try {
            const res = await fetch('/api/assets');
            if (!res.ok) throw new Error("Assets failed to load");
            const data = await res.json();
            
            // UI.renderStickers ထဲမှာ နှိပ်လိုက်ရင် Canvas ပေါ် ရောက်သွားမယ့် callback ပေးမယ်
            UI.renderStickers(data.stickers || [], (stickerUrl) => {
                this.addStickerToCanvas(stickerUrl);
            });
            console.log("✅ Stickers Initialized");
        } catch (err) {
            console.error("❌ Stickers Init Error:", err);
            UI.renderStickers([], () => {});
        }
    },

    initCanvas(baseImage) {
        console.log("🎨 Sticker Engine Starting...");
        window.Stickers = Stickers;

        if (!this.canvas) {
            this.canvas = new fabric.Canvas('stickerCanvas', {
                preserveObjectStacking: true,
                selection: true,
                renderOnAddRemove: true
            });
        }

        fabric.Image.fromURL(baseImage, (img) => {
            this.canvas.setDimensions({ width: img.width, height: img.height });
            this.canvas.clear();
            img.set({ selectable: false, evented: false });
            this.canvas.add(img);
            this.autoScale();
        }, { crossOrigin: 'anonymous' });
    },

    autoScale() {
        const wrapper = document.querySelector('#stickerOverlayView .editor-canvas-wrapper');
        const container = document.querySelector('#stickerOverlayView .canvas-container');
        if (wrapper && container) {
            const scale = Math.min((wrapper.clientWidth - 20) / this.canvas.width, (wrapper.clientHeight - 20) / this.canvas.height);
            container.style.width = `${this.canvas.width}px`;
            container.style.height = `${this.canvas.height}px`;
            container.style.transform = `scale(${scale})`;
            container.style.transformOrigin = 'center center';
        }
    },

    addStickerToCanvas(url) {
        if (!this.canvas) return;
        fabric.Image.fromURL(url, (img) => {
            img.set({
                left: this.canvas.width / 2,
                top: this.canvas.height / 2,
                originX: 'center', originY: 'center',
                scaleX: 0.3, scaleY: 0.3,
                
                // 🎯 Smooth Interaction Settings
                padding: 10,
                cornerSize: 24,
                cornerColor: '#00D1FF',
                cornerStyle: 'circle',
                transparentCorners: false,
                borderColor: '#00D1FF',
                hasControls: true,
                lockScalingFlip: true
            });
            
            this.canvas.add(img);
            this.canvas.setActiveObject(img);
            this.canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    },

    addText() {
        if (!this.canvas) return;
        const text = new fabric.IText('Tap to Edit', {
            left: this.canvas.width / 2,
            top: this.canvas.height / 2,
            fill: '#ffffff',
            fontSize: 60,
            fontFamily: 'Arial',
            originX: 'center', originY: 'center',
            padding: 15,
            cornerSize: 24,
            cornerColor: '#00D1FF',
            cornerStyle: 'circle',
            transparentCorners: false
        });
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        this.canvas.requestRenderAll();
    },

    deleteSelected() {
        const active = this.canvas.getActiveObject();
        if (active) {
            this.canvas.remove(active);
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
        }
    },

    async finalize() {
        const btn = document.getElementById('finalPrintBtn');
        btn.innerText = "SENDING TO PRINT...";
        btn.disabled = true;

        const finalData = this.canvas.toDataURL({ format: 'jpeg', quality: 0.95 });

        try {
            const res = await fetch('/api/process_final', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: State.session.orderId,
                    layout_id: State.session.layoutId,
                    final_image: finalData
                })
            });
            const result = await res.json();
            if (result.status === 'success') window.location.href = '/';
        } catch (err) {
            btn.innerText = "Print Final ✨";
            btn.disabled = false;
        }
    }
};

