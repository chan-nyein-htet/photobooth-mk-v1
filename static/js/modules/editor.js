import { State } from './state.js';
import { Filters } from './filters.js';               
export const Editor = {                                   
    canvas: null,
    selectedSlot: null,                                   
    async init() {                                    
        window.Editor = Editor;                               
        await Editor.loadProject();                   
    },
    async loadProject() {
        if (!State.session.layout_details) { setTimeout(() => Editor.loadProject(), 100); return; }
        const { layoutId, paperSize, capturedImages } = State.session;
        const templatePath = `/static/templates/${paperSize}/${layoutId}.png`;
                                                              return new Promise((resolve) => {
            fabric.Image.fromURL(templatePath, (img) => {
                if (!img) return resolve();           
                if (!Editor.canvas) {
                    Editor.canvas = new fabric.Canvas('editorCanvas', {
                        backgroundColor: '#fff',      
                        preserveObjectStacking: true,
                        selection: false,
                        renderOnAddRemove: false 
                    });
                }
                Editor.canvas.setDimensions({ width: img.width, height: img.height });
                Editor.canvas.clear();

                const slots = State.session.layout_details.slots || [];
                slots.forEach((slot, i) => {
                    if (capturedImages[i]) Editor.addImageToSlot(capturedImages[i], slot);
                });

                img.set({ left: 0, top: 0, selectable: false, evented: false });
                Editor.canvas.setOverlayImage(img, () => {
                    Editor.canvas.renderAll();
                    const wrapper = document.querySelector('.editor-canvas-wrapper');
                    const container = document.querySelector('.canvas-container');
                    if (wrapper && container) {
                        const scale = Math.min((wrapper.clientWidth - 20) / img.width, (wrapper.clientHeight - 20) / img.height);
                        container.style.transform = `scale(${scale})`;
                    }
                    resolve();
                });

                Filters.init(Editor.canvas);
                Editor.renderGalleryTray(capturedImages);
                Editor.bindEvents();
                Editor.bindCanvasSelection();
            }, { crossOrigin: 'anonymous' });
        });
    },

    addImageToSlot(dataUrl, slot) {
        fabric.Image.fromURL(dataUrl, (img) => {
            const scale = Math.max(slot.w / img.width, slot.h / img.height);
            img.set({
                left: slot.x + (slot.w / 2), top: slot.y + (slot.h / 2),
                originX: 'center', originY: 'center',
                scaleX: scale, scaleY: scale,
                isPhoto: true, hasControls: false, hasBorders: false,
                perPixelTargetFind: true,
                slotData: slot, currentFilterName: 'none'
            });
            img.clipPath = new fabric.Rect({ left: slot.x, top: slot.y, width: slot.w, height: slot.h, absolutePositioned: true });
            Editor.canvas.add(img);
            img.sendToBack();
            Editor.canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    },

    async goToStickerStage() {
        const btn = document.getElementById('saveEditBtn');
        if (btn) { btn.innerText = "PREPARING..."; btn.disabled = true; }

        const badge = Editor.canvas.getObjects().find(o => o.isBadge);
        if (badge) Editor.canvas.remove(badge);
        Editor.canvas.discardActiveObject().renderAll();

        try {
            const editedImage = Editor.canvas.toDataURL({
                format: 'png',
                quality: 0.8,
                multiplier: 1.5
            });

            const nextView = document.getElementById('stickerOverlayView');
            const currView = document.getElementById('photoEditorView');

            if (nextView) {
                // 🎯 အရေးကြီးဆုံးပြင်ဆင်မှု: Sticker Module ကို အရင် Init လုပ်မယ်
                if (window.Stickers && typeof window.Stickers.init === 'function') {
                    await window.Stickers.init(); 
                }

                if (currView) currView.style.display = 'none';
                nextView.style.display = 'flex';
                nextView.classList.remove('hidden-element');

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if (window.Stickers) window.Stickers.initCanvas(editedImage);
                    }, 100);
                });
            }
        } catch (err) {
            console.error("Export Error:", err);
            alert("Something went wrong during export.");
        }
        if (btn) { btn.innerText = "Next Step ✨"; btn.disabled = false; }
    },

    handleSelection(obj) {
        if (obj && obj.isPhoto) {
            Editor.selectedSlot = obj;
            this.toggleControls(true);
            if (window.Filters && typeof window.Filters.updateFilterUI === 'function') {
                window.Filters.updateFilterUI(obj.currentFilterName || 'none');
            }
            this.drawSelectionBadge(obj);
        }
    },

    drawSelectionBadge(obj) {
        const objects = Editor.canvas.getObjects();
        objects.forEach(o => { if (o.isBadge) Editor.canvas.remove(o); });
        const slot = obj.slotData;
        const badge = new fabric.Group([
            new fabric.Rect({ width: 75, height: 22, fill: '#22c55e', rx: 5, ry: 5 }),
            new fabric.Text("SELECTED", { fontSize: 10, fill: '#fff', fontWeight: '900', originX: 'center', originY: 'center', left: 37, top: 11 })
        ], { left: slot.x + 5, top: slot.y + 5, isBadge: true, selectable: false, evented: false });
        Editor.canvas.add(badge);
        badge.bringToFront();
        Editor.canvas.requestRenderAll();
    },

    toggleControls(show) {
        ['effectList', 'selectionBadge', 'controlArrows'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', !show);
        });
    },

    bindCanvasSelection() {
        Editor.canvas.on('selection:created', (e) => this.handleSelection(e.selected[0]));
        Editor.canvas.on('selection:updated', (e) => this.handleSelection(e.selected[0]));
        Editor.canvas.on('selection:cleared', () => {
            Editor.selectedSlot = null;
            this.toggleControls(false);
            const b = Editor.canvas.getObjects().find(o => o.isBadge);
            if (b) Editor.canvas.remove(b);
        });
    },

    renderGalleryTray(images) {
        const tray = document.getElementById('galleryList');
        if (tray) tray.innerHTML = images.map(url => `
            <div class="gallery-item w-20 h-20 flex-shrink-0" onclick="window.Editor.swapPhoto('${url}')">
                <img src="${url}" class="w-full h-full object-cover rounded-xl border border-white/10">
            </div>
        `).join('');
    },

    bindEvents() {
        const btn = document.getElementById('saveEditBtn');
        if (btn) btn.onclick = () => Editor.goToStickerStage();
    },

    swapPhoto(url) {
        if (!Editor.selectedSlot) return;
        const slot = Editor.selectedSlot.slotData;
        const oldObj = Editor.selectedSlot;
        fabric.Image.fromURL(url, (newImg) => {
            const scale = Math.max(slot.w / newImg.width, slot.h / newImg.height);
            newImg.set({
                left: oldObj.left, top: oldObj.top, originX: 'center', originY: 'center',
                scaleX: scale, scaleY: scale, isPhoto: true, hasControls: false,
                perPixelTargetFind: true, clipPath: oldObj.clipPath, slotData: slot, currentFilterName: 'none'
            });
            Editor.canvas.remove(oldObj);
            Editor.canvas.add(newImg);
            newImg.sendToBack();
            Editor.canvas.setActiveObject(newImg);
            Editor.canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    }
};

