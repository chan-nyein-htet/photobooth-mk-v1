import { State } from './state.js';

export const Debug = {
    init() {
        window.Debug = this;
        this.logSystem("🚀 Debugger V3.0.3 Stable Active");

        this.hookBackend();

        window.onerror = (msg, url, line, col, error) => {
            if (msg.includes("responseText")) return; // ignore xhr errors
            this.showCrashScreen(msg, url, line, col, error?.stack);
            return false;
        };
    },

    hookBackend() {
        const originalOpen = XMLHttpRequest.prototype.open;
        const self = this;
        XMLHttpRequest.prototype.open = function(method, url) {
            this.addEventListener('load', function() {
                // 🎯 Binary data (model weights/images) ဆိုရင် text အနေနဲ့ မဖတ်အောင် စစ်မယ်
                if (this.responseType === '' || this.responseType === 'text') {
                    console.groupCollapsed(`%c📡 API: ${method} ${url} [${this.status}]`, "color: #FFD700;");
                    try { console.log("JSON:", JSON.parse(this.responseText)); } 
                    catch(e) { console.log("Raw:", this.responseText.substring(0, 100) + "..."); }
                    console.groupEnd();
                } else {
                    console.log(`%c📡 API (Binary): ${method} ${url} [${this.status}]`, "color: #aaa;");
                }
            });
            return originalOpen.apply(this, arguments);
        };
    },

    trace(module, action, data = {}) {
        console.log(`%c[${module}] %c${action}`, "color: #00D1FF; font-weight: bold;", "color: #fff;", data);
    },

    logSystem(msg) {
        console.log(`%c[SYSTEM] ${msg}`, "background: #1a1a1a; color: #00D1FF; padding: 2px 5px;");
    },

    logState() {
        console.group("🔍 CURRENT STATE CHECK");
        console.log("Session:", State.session);
        if (window.Editor && window.Editor.canvas) {
            console.log("Canvas Objects:", window.Editor.canvas.getObjects().map(o => ({
                type: o.type,
                isPhoto: o.isPhoto,
                filters: o.filters?.length,
                crossOrigin: o.crossOrigin
            })));
        }
        console.groupEnd();
    },

    showCrashScreen(msg, file, line, col, stack) {
        if (document.getElementById('crash-screen')) return;
        const div = document.createElement('div');
        div.id = 'crash-screen';
        div.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); color:#ff4444; padding:20px; z-index:999999; font-family:monospace;";
        div.innerHTML = `<h1>❌ CRASH</h1><p>${msg}</p><pre style="font-size:10px; color:#666;">${stack}</pre><button onclick="location.reload()">RELOAD</button>`;
        document.body.appendChild(div);
    }
};

