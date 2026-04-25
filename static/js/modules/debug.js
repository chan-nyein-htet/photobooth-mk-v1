import { State } from './state.js';

export const Debug = {
    init() {
        // 1. Catch Runtime Errors
        window.onerror = (msg, url, line, col, error) => {
            const fileName = url ? url.split('/').pop() : 'unknown';
            this.showCrashScreen(msg, fileName, line, col, error?.stack || 'No stack trace');
            return true;
        };

        // 2. Catch Async/Promise Errors
        window.onunhandledrejection = (event) => {
            this.showCrashScreen(event.reason, 'Async/Promise', 'N/A', 'N/A', event.reason?.stack || 'No stack trace');
        };

        console.log("🛠️ Debugger Initialized. Use Debug.logState() in console for deep check.");
    },

    // ✅ State ကို အသေးစိတ် စစ်ဖို့ logic အသစ်
    logState() {
        console.group("🔍 SYSTEM STATE CHECK");
        console.log("📦 Order ID:", State.session.orderId);
        console.log("🖼️ Layout ID:", State.session.layoutId);
        console.log("📸 Captured Photos:", State.session.capturedImages);
        console.log("📐 Layout Details:", State.session.layout_details);
        
        if (!State.session.layout_details) {
            console.error("❌ CRITICAL: Layout Details is NULL. Editor cannot start.");
        } else {
            console.log("✅ Layout Details Loaded.");
        }

        if (State.session.capturedImages.length === 0) {
            console.error("❌ CRITICAL: No captured images found.");
        }
        console.groupEnd();
    },

    showCrashScreen(msg, file, line, col, stack) {
        document.body.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#000; color:#ff4444; padding:20px; font-family:monospace; z-index:999999; overflow:auto;">
                <h1 style="color:#fff; border-bottom:2px solid #ff4444;">❌ SYSTEM CRASH</h1>
                <p><b>Error:</b> ${msg}</p>
                <p><b>Location:</b> ${file} at Line ${line}:${col}</p>
                <div style="background:#1a1a1a; padding:15px; border-radius:5px; color:#aaa; font-size:12px;">
                    <b>Stack Trace:</b>
                    <pre style="white-space:pre-wrap; margin-top:10px;">${stack}</pre>
                </div>
                <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; cursor:pointer; background:#fff; border:none; font-weight:bold;">RELOAD APP</button>
            </div>
        `;
    }
};

// Console ကနေ ခေါ်သုံးလို့ရအောင် window ထဲ ထည့်ပေးမယ်
window.Debug = Debug;

