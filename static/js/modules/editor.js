import { State } from './state.js';

export const Editor = {
    canvas: null,
    selectedSlot: null,
    filterList: [],

    async init() {
        console.log("🚀 Editor Engine Starting...");
        window.Editor = Editor;
        if (typeof fabric !== 'undefined') {
            fabric.filterBackend = fabric.initFilterBackend();
        }
        await Editor.loadProject();
    },

    async loadProject() {
        if (!State.session.layout_details) {
            setTimeout(() => Editor.loadProject(), 100);
            return;
        }

        const { layoutId, paperSize, capturedImages } = State.session;
        const layoutDetails = State.session.layout_details;
        const backendSlots = layoutDetails.slots || [];
        const templatePath = `/static/templates/${paperSize}/${layoutId}.png`;

        return new Promise((resolve) => {
            fabric.Image.fromURL(templatePath, (img) => {
                if (!img) return resolve();

                if (!Editor.canvas) {
                    Editor.canvas = new fabric.Canvas('editorCanvas', {
                        width: img.width,
                        height: img.height,
                        backgroundColor: '#fff',
                        preserveObjectStacking: true,
                        selection: true // Selection ကို true ပေးထားမယ်
                    });
                } else {
                    Editor.canvas.setDimensions({ width: img.width, height: img.height });
                    Editor.canvas.clear();
                }

                // UI Auto-Scaling
                const wrapper = document.querySelector('.editor-canvas-wrapper');
                const container = document.querySelector('.canvas-container');
                if (wrapper && container) {
                    const scale = Math.min((wrapper.clientWidth - 20) / img.width, (wrapper.clientHeight - 20) / img.height);
                    container.style.width = `${img.width}px`;
                    container.style.height = `${img.height}px`;
                    container.style.transform = `scale(${scale})`;
                    container.style.transformOrigin = 'center center';
                }

                Editor.syncToSlots(backendSlots, capturedImages);
                Editor.renderFilterTray();

                img.set({ left: 0, top: 0, selectable: false, evented: false });
                Editor.canvas.setOverlayImage(img, Editor.canvas.renderAll.bind(Editor.canvas), {
                    crossOrigin: 'anonymous'
                });

                Editor.bindEvents();
                Editor.bindCanvasSelection();
                resolve();
            }, { crossOrigin: 'anonymous' });
        });
    },

    addImageToSlot(dataUrl, slot) {
        fabric.Image.fromURL(dataUrl, (img) => {
            if (!img) return;
            const scale = Math.max(slot.w / img.width, slot.h / img.height);
            img.set({
                left: slot.x + (slot.w / 2),
                top: slot.y + (slot.h / 2),
                originX: 'center', originY: 'center',
                scaleX: scale, scaleY: scale,
                isPhoto: true,
                hasControls: true, // User ရွှေ့လို့ရအောင်
                borderColor: 'var(--color-primary)',
                cornerColor: 'var(--color-primary)',
                cornerSize: 10,
                slotData: slot
            });

            img.clipPath = new fabric.Rect({
                left: slot.x, top: slot.y, width: slot.w, height: slot.h, absolutePositioned: true
            });

            Editor.canvas.add(img);
            img.sendToBack();
            Editor.canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    },

    moveSelected(dir) {
        const active = Editor.canvas.getActiveObject();
        if (!active || !active.isPhoto) return;
        const step = 15;
        if (dir === 'up') active.top -= step;
        if (dir === 'down') active.top += step;
        if (dir === 'left') active.left -= step;
        if (dir === 'right') active.left += step;
        Editor.canvas.requestRenderAll();
    },

    renderFilterTray() {
        const tray = document.getElementById('effectList');
        if (!tray) return;

        this.filterList = [
            { name: 'Original', f: null },
            { name: 'B&W', f: new fabric.Image.filters.Grayscale() },
            { name: 'Sepia', f: new fabric.Image.filters.Sepia() },
            { name: 'Bright', f: new fabric.Image.filters.Brightness({ brightness: 0.1 }) }
        ];

        tray.innerHTML = this.filterList.map((f, i) => `
            <div class="box" onclick="window.Editor.applyFilter(${i})">
                <div class="w-6 h-6 rounded-full border border-white/20 mb-1"></div>
                <span class="text-[8px] font-black uppercase">${f.name}</span>
            </div>
        `).join('');
    },

    applyFilter(index) {
        const active = Editor.canvas.getActiveObject();
        if (!active || !active.isPhoto) return;

        const filterObj = this.filterList[index].f;
        active.filters = filterObj ? [filterObj] : [];
        active.applyFilters();
        Editor.canvas.requestRenderAll();

        document.querySelectorAll('#effectList .box').forEach((el, i) => {
            el.classList.toggle('active', i === index);
        });
    },

    swapPhoto(url) {
        if (!Editor.selectedSlot) return;
        const slot = Editor.selectedSlot.slotData;
        const oldObj = Editor.selectedSlot;

        fabric.Image.fromURL(url, (newImg) => {
            const scale = Math.max(slot.w / newImg.width, slot.h / newImg.height);
            newImg.set({
                left: oldObj.left, top: oldObj.top,
                originX: 'center', originY: 'center',
                scaleX: scale, scaleY: scale,
                isPhoto: true, hasControls: true,
                clipPath: oldObj.clipPath, slotData: slot
            });
            Editor.canvas.remove(oldObj);
            Editor.canvas.add(newImg);
            newImg.sendToBack();
            Editor.canvas.setActiveObject(newImg);
            Editor.canvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
    },

    renderGalleryTray(images) {
        const tray = document.getElementById('galleryList');
        if (!tray) return;
        tray.innerHTML = images.map(url => `
            <div class="gallery-item w-20 h-20 flex-shrink-0" onclick="window.Editor.swapPhoto('${url}')">
                <img src="${url}" class="w-full h-full object-cover rounded-xl shadow-lg">
            </div>
        `).join('');
    },

    syncToSlots(slots, images) {
        if (!images || images.length === 0) return;
        slots.forEach((slot, i) => {
            if (images[i]) Editor.addImageToSlot(images[i], slot);
        });
        Editor.renderGalleryTray(images);
    },

    bindCanvasSelection() {
        Editor.canvas.on('selection:created', (e) => this.handleSelection(e.selected[0]));
        Editor.canvas.on('selection:updated', (e) => this.handleSelection(e.selected[0]));
        Editor.canvas.on('selection:cleared', () => {
            Editor.selectedSlot = null;
            document.getElementById('effectList')?.classList.add('hidden');
            document.getElementById('selectionBadge')?.classList.add('hidden');
            document.getElementById('controlArrows')?.classList.add('hidden');
        });
    },

    handleSelection(obj) {
        if (obj && obj.isPhoto) {
            Editor.selectedSlot = obj;
            document.getElementById('effectList')?.classList.remove('hidden');
            document.getElementById('selectionBadge')?.classList.remove('hidden');
            document.getElementById('controlArrows')?.classList.remove('hidden');
        }
    },

    bindEvents() {
        const btn = document.getElementById('saveEditBtn');
        if (btn) btn.onclick = () => Editor.finalize();
    },

    async finalize() {
        const btn = document.getElementById('saveEditBtn');
        btn.innerText = "PRINTING...";
        btn.disabled = true;

        const finalData = Editor.canvas.toDataURL({ format: 'jpeg', quality: 0.95 });

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
            btn.innerText = "Print Photo ✨";
            btn.disabled = false;
        }
    }
};

window.Editor = Editor;

