export const Admin = {
    clickCount: 0,
    lastClickTime: 0,
    currentTab: 'layouts',

    init() {
        console.log("🛠️ Admin Module V3.1 Initialized...");
        window.Admin = this;
        this.bindEvents();
    },

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
                e.preventDefault();
                this.toggle();
            }
        });

        const welcome = document.getElementById('welcomeScreen');
        if (welcome) {
            welcome.addEventListener('click', () => {
                const now = Date.now();
                if (now - this.lastClickTime < 500) this.clickCount++;
                else this.clickCount = 1;
                this.lastClickTime = now;
                if (this.clickCount === 5) { this.clickCount = 0; this.toggle(); }
            });
        }

        const tplInp = document.getElementById('admin_tpl_file');
        if (tplInp) tplInp.addEventListener('change', (e) => this.handleFileSelect(e));

        const fltCss = document.getElementById('flt_css');
        if (fltCss) fltCss.addEventListener('input', (e) => {
            const previewImg = document.getElementById('filter_preview_img');
            if (previewImg) previewImg.style.filter = e.target.value;
        });

        const fntInp = document.getElementById('fnt_file');
        if (fntInp) fntInp.addEventListener('change', (e) => this.handleFontPreview(e));
    },

    toggle() {
        const p = document.getElementById('admin-panel');
        if (p) {
            p.classList.toggle('hidden');
            if (!p.classList.contains('hidden')) this.showTab(this.currentTab);
        }
    },

    showTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
        const activeTab = document.getElementById(`tab-${tabName}`);
        if (activeTab) activeTab.classList.remove('hidden');

        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-800', 'text-gray-400');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('bg-blue-600', 'text-white');
                btn.classList.remove('bg-gray-800', 'text-gray-400');
            }
        });

        if (tabName === 'layouts') this.loadLayouts();
        else this.loadAssets();
    },

    async handleFontPreview(e) {
        const file = e.target.files[0];
        if (!file) return;
        const fontName = 'PreviewFont_' + Date.now();
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const fontFace = new FontFace(fontName, `url(${ev.target.result})`);
            try {
                await fontFace.load();
                document.fonts.add(fontFace);
                const p = document.getElementById('font-preview-text');
                if (p) {
                    p.style.fontFamily = fontName;
                    p.innerText = "Font Preview: " + file.name;
                }
            } catch (err) { console.error("Font preview load failed", err); }
        };
        reader.readAsDataURL(file);
    },

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const preview = document.getElementById('admin_tpl_preview');
            if (preview) {
                preview.src = ev.target.result;
                preview.classList.remove('hidden');
            }
            const placeholder = document.getElementById('preview-placeholder');
            if (placeholder) placeholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
        const nameDisplay = document.getElementById('file-name-display');
        if (nameDisplay) nameDisplay.innerText = file.name;
        const layoutIdInp = document.getElementById('admin_layout_id');
        if (layoutIdInp) layoutIdInp.value = file.name.replace('.png', '').replace(/\s+/g, '_');
    },

    async loadLayouts() {
        const list = document.getElementById('admin_layout_list');
        if (!list) return;
        try {
            const res = await fetch('/api/admin/get_layouts');
            const data = await res.json();
            list.innerHTML = '';
            if (data.active_layouts) {
                Object.entries(data.active_layouts).forEach(([type, ids]) => {
                    ids.forEach(id => {
                        const card = document.createElement('div');
                        card.className = "bg-gray-800 p-2 rounded border border-gray-700 relative group text-center";
                        card.innerHTML = `
                            <img src="/static/templates/${type}/${id}.png?t=${Date.now()}" class="w-full aspect-[2/3] object-contain mb-1">
                            <p class="text-[8px] text-gray-500 truncate">${id}</p>
                            <button onclick="Admin.deleteLayout('${id}', '${type}')" class="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">×</button>
                        `;
                        list.appendChild(card);
                    });
                });
            }
        } catch (err) { console.error("Layout load failed", err); }
    },

    async loadAssets() {
        try {
            console.log("Fetching all assets...");
            const [assetRes, fontRes] = await Promise.all([
                fetch('/api/assets'),
                fetch('/api/admin/get_fonts')
            ]);

            const data = await assetRes.json();
            const fontData = await fontRes.json();
            console.log("Font Data Received:", fontData);

            // --- 🎨 Stickers ---
            const stkList = document.getElementById('admin_sticker_list');
            if (stkList && data.stickers) {
                stkList.innerHTML = data.stickers.map(s => {
                    const url = typeof s === 'object' ? s.url : s;
                    const id = typeof s === 'object' ? s.id : s;
                    return `
                        <div class="bg-gray-800 p-2 rounded border border-gray-700 relative group transition-all hover:border-blue-500">
                            <img src="${url}" class="w-full aspect-square object-contain">
                            <button onclick="Admin.deleteSticker('${id}')" class="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-10 border border-white/20">×</button>
                        </div>`;
                }).join('');
            }

            // --- ✨ Filters ---
            const fltList = document.getElementById('admin_filter_list');
            if (fltList && data.filters) {
                fltList.innerHTML = data.filters.map(f => `
                    <div class="bg-gray-800 p-2 rounded border border-gray-700 relative group overflow-hidden transition-all hover:border-purple-500">
                        <div class="w-full h-16 bg-black rounded overflow-hidden mb-2">
                            <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=200" style="filter: ${f.filter_css || f.filter}" class="w-full h-full object-cover opacity-80">
                        </div>
                        <p class="text-[9px] text-white font-bold truncate uppercase text-center">${f.name}</p>
                        <button onclick="Admin.deleteFilter(${f.id})" class="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>`).join('');
            }

            // --- 🖋️ Fonts (FIXED LOGIC) ---
            const fontList = document.getElementById('admin_font_list');
            if (fontList) {
                if (fontData.fonts && fontData.fonts.length > 0) {
                    fontList.innerHTML = fontData.fonts.map(f => {
                        const name = f.name;
                        const url = f.url;
                        const id = f.id;
                        const fontFamily = name.split('.')[0].replace(/\s+/g, '_');

                        if (!document.getElementById(`style_${fontFamily}`)) {
                            const style = document.createElement('style');
                            style.id = `style_${fontFamily}`;
                            style.textContent = `@font-face { font-family: '${fontFamily}'; src: url('${url}'); }`;
                            document.head.appendChild(style);
                        }

                        return `
                            <div class="bg-gray-800 p-3 rounded border border-gray-700 relative group hover:border-orange-500 transition-all">
                                <p class="text-[10px] text-gray-500 mb-1 truncate">${name}</p>
                                <p style="font-family: '${fontFamily}'" class="text-white text-base truncate">AaBbCc 123</p>
                                <button onclick="Admin.deleteFont('${id}')" class="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold px-1">×</button>
                            </div>`;
                    }).join('');
                } else {
                    fontList.innerHTML = '<div class="col-span-full py-4 text-center text-gray-600 text-xs uppercase tracking-widest">No Fonts Installed</div>';
                }
            }
        } catch (err) { console.error("Asset load failed", err); }
    },

    async save() {
        const fileInp = document.getElementById('admin_tpl_file');
        const file = fileInp ? fileInp.files[0] : null;
        if(!file) return alert("Select PNG file!");
        const fd = new FormData();
        fd.append('layout_id', document.getElementById('admin_layout_id').value);
        fd.append('layout_name', document.getElementById('admin_layout_name').value);
        fd.append('size_type', document.getElementById('admin_size_type').value);
        fd.append('file', file);
        await fetch('/api/admin/upload_template', { method: 'POST', body: fd });
        this.loadLayouts();
        alert("Template Registered!");
    },

    async deleteLayout(id, type) {
        if (!confirm("Delete this layout?")) return;
        await fetch('/api/admin/delete_layout', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, type}) });
        this.loadLayouts();
    },

    async saveSticker() {
        const fileInp = document.getElementById('stk_file');
        const file = fileInp ? fileInp.files[0] : null;
        if(!file) return alert("Select sticker PNG!");
        const fd = new FormData();
        fd.append('name', document.getElementById('stk_name').value);
        fd.append('file', file);
        await fetch('/api/admin/add_sticker', { method: 'POST', body: fd });
        this.loadAssets();
        alert("Sticker Added!");
    },

    async deleteSticker(id) {
        if (!confirm("Delete this sticker?")) return;
        await fetch('/api/admin/delete_sticker', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id}) });
        this.loadAssets();
    },

    async saveFilter() {
        const name = document.getElementById('flt_name').value;
        const css = document.getElementById('flt_css').value;
        if(!name || !css) return alert("Fill filter info!");
        await fetch('/api/admin/add_filter', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name, filter_css: css }) });
        this.loadAssets();
        alert("Filter Added!");
    },

    async deleteFilter(id) {
        if (!confirm("Delete this filter?")) return;
        await fetch('/api/admin/delete_filter', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id}) });
        this.loadAssets();
    },

    async saveFont() {
        const fileInp = document.getElementById('fnt_file');
        const file = fileInp ? fileInp.files[0] : null;
        if(!file) return alert("Select TTF/OTF!");
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/upload_font', { method: 'POST', body: fd });
        const data = await res.json();
        if(data.status === 'success') {
            this.loadAssets();
            alert("Font Uploaded!");
        }
    },

    async deleteFont(id) {
        if (!confirm("Delete this font?")) return;
        await fetch('/api/admin/delete_font', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id}) });
        this.loadAssets();
    }
};

