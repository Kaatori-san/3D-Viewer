window.CAFE_VIEWER_BOOTSTRAP = function startCafeViewer() {
"use strict";
const VIEWER_LOCAL_CSS = "body {\n            font-family: 'Inter', sans-serif;\n            overflow: hidden;\n            user-select: none;\n            background-color: #0f172a;\n            color: #f8fafc;\n        }\n        .mono {\n            font-family: 'JetBrains Mono', monospace;\n        }\n        /* Custom Scrollbar */\n        ::-webkit-scrollbar {\n            width: 6px;\n            height: 6px;\n        }\n        ::-webkit-scrollbar-track {\n            background: #1e293b;\n        }\n        ::-webkit-scrollbar-thumb {\n            background: #475569;\n            border-radius: 9999px;\n        }\n        ::-webkit-scrollbar-thumb:hover {\n            background: #64748b;\n        }\n        /* Range Input Styling */\n        input[type=range] {\n            -webkit-appearance: none;\n            background: transparent;\n        }\n        input[type=range]::-webkit-slider-runnable-track {\n            height: 6px;\n            border-radius: 3px;\n            background: #334155;\n        }\n        input[type=range]::-webkit-slider-thumb {\n            -webkit-appearance: none;\n            height: 16px;\n            width: 16px;\n            border-radius: 50%;\n            background: #38bdf8;\n            margin-top: -5px;\n            cursor: pointer;\n            box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);\n            transition: transform 0.15s ease;\n        }\n        input[type=range]::-webkit-slider-thumb:hover {\n            transform: scale(1.15);\n        }\n        #canvas-container canvas {\n            display: block;\n            width: 100% !important;\n            height: 100% !important;\n            outline: none;\n        }\n\n/* The app fills the visible viewport, including browser chrome and the keyboard. */\n:root {\n    --app-height: 100vh;\n    --app-top: 0px;\n    --safe-top: env(safe-area-inset-top, 0px);\n    --safe-right: env(safe-area-inset-right, 0px);\n    --safe-bottom: env(safe-area-inset-bottom, 0px);\n    --safe-left: env(safe-area-inset-left, 0px);\n    --dock-height: calc(68px + var(--safe-bottom));\n}\n@supports (height: 100dvh) { :root { --app-height: 100dvh; } }\n* { box-sizing: border-box; }\nhtml { height: 100%; overscroll-behavior: none; -webkit-text-size-adjust: 100%; }\nbody {\n    position: fixed; top: var(--app-top); left: 0; right: 0;\n    width: 100%; height: var(--app-height); min-height: 0; margin: 0;\n    display: flex; flex-direction: row; overscroll-behavior: none;\n    font-family: 'Inter', system-ui, -apple-system, sans-serif;\n}\n[hidden], .hidden { display: none !important; }\n.mobile-only { display: none; }\nbutton, a, label, input, select, textarea { -webkit-tap-highlight-color: transparent; }\nbutton, a, label { touch-action: manipulation; }\nbutton:disabled { opacity: .55; cursor: wait; }\nbutton:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {\n    outline: 2px solid #7dd3fc; outline-offset: 3px;\n}\ninput, textarea { user-select: text; -webkit-user-select: text; }\nsvg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }\n#sidebar {\n    width: 360px; height: 100%; max-height: none; min-height: 0;\n    padding-top: var(--safe-top); padding-left: var(--safe-left);\n    background: #0f172a; display: flex; flex-direction: column; flex-shrink: 0;\n}\n#sidebarHeader { flex-shrink: 0; gap: 8px; padding: 16px; }\n#sidebarHeader > div { min-width: 0; }\n#sidebarHeader p { font-size: 10px; }\n#openCodeModalBtn { flex-shrink: 0; min-height: 44px; }\n#sidebarScroll {\n    flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;\n    overscroll-behavior-y: contain; -webkit-overflow-scrolling: touch;\n    padding-bottom: calc(24px + var(--safe-bottom)); scroll-padding: 16px;\n}\n#sidebarScroll > div { scroll-margin-top: 16px; }\n#modelListContainer, #savedModelListContainer { overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }\n#statModelName, #statDimensions { text-align: right; overflow-wrap: anywhere; min-width: 0; }\n#specsSection .flex { gap: 12px; }\n#specsSection .flex > :first-child { flex-shrink: 0; }\n#specsSection .flex:last-child { flex-wrap: wrap; }\n#viewportMain { height: 100%; min-height: 0; min-width: 0; width: auto; flex: 1; }\n#canvas-container { width: 100%; height: 100%; touch-action: none; }\n#canvas-container canvas { touch-action: none; -webkit-user-select: none; user-select: none; }\n#hudBadge { max-width: calc(100% - 385px); top: calc(16px + var(--safe-top)); }\n#hudBadge > div, #hudBadge > div > div { min-width: 0; }\n#hudStorageDot { flex-shrink: 0; }\n#hudModelTitle, #hudModelDesc { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n#viewportActions { top: calc(16px + var(--safe-top)); right: calc(16px + var(--safe-right)); }\n#viewportActions button { min-height: 44px; white-space: nowrap; }\n#desktopGestureHint { white-space: nowrap; bottom: calc(16px + var(--safe-bottom)); }\n#touchGestureHint { display: none; }\n#toastBanner {\n    z-index: 80; max-width: min(460px, calc(100% - 32px)); overflow-wrap: anywhere;\n    right: calc(16px + var(--safe-right)); bottom: calc(20px + var(--safe-bottom));\n    pointer-events: none;\n}\n#stlModal, #actionModal, #downloadModal {\n    position: fixed; top: var(--app-top); bottom: auto; left: 0; right: 0;\n    height: var(--app-height); z-index: 60; display: flex; align-items: center; justify-content: center;\n    padding: calc(16px + var(--safe-top)) calc(16px + var(--safe-right)) calc(16px + var(--safe-bottom)) calc(16px + var(--safe-left));\n    background: rgba(0, 0, 0, .75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\n}\n#stlModal > div, #actionModal > div, .download-card {\n    max-height: 100%; min-height: 0; display: flex; flex-direction: column; overflow: hidden;\n}\n#stlModal > div > :first-child, #stlModal > div > :last-child,\n#actionModal > div > :first-child, #actionModal > div > :last-child { flex-shrink: 0; }\n#stlModal > div > :nth-child(2), #actionModal > div > :nth-child(2) {\n    min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;\n}\n#stlModal button, #actionModal button, .download-card button, #saveFileLink { min-height: 44px; }\n#closeModalBtn, #closeActionModalBtn { min-width: 44px; flex-shrink: 0; }\n.download-card { width: 100%; max-width: 420px; padding: 20px; gap: 16px; background: #0f172a; border: 1px solid #334155; border-radius: 20px; overflow-y: auto; }\n.download-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }\n.download-heading h2 { font-size: 18px; font-weight: 700; }\n.download-heading button { width: 44px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; background: #1e293b; }\n#downloadFilename { color: #cbd5e1; overflow-wrap: anywhere; font-size: 14px; }\n#saveFileLink, #shareFileBtn { display: flex; align-items: center; justify-content: center; text-align: center; padding: 12px; border-radius: 12px; text-decoration: none; font-size: 15px; font-weight: 600; }\n#saveFileLink { background: #38bdf8; color: #082f49; }\n#shareFileBtn { background: #1e293b; color: #e2e8f0; border: 1px solid #475569; }\n.download-help { font-size: 12px; line-height: 1.6; color: #94a3b8; }\ninput[type=range] { height: 36px; margin: 0; touch-action: pan-y; }\ninput[type=range]::-moz-range-track { height: 6px; border-radius: 3px; background: #334155; }\ninput[type=range]::-moz-range-thumb { width: 22px; height: 22px; border: 0; border-radius: 50%; background: #38bdf8; }\n\n@media (max-width: 1023px), (any-pointer: coarse) {\n    button, #saveFileLink, label:has(input[type=file]) { min-height: 44px; }\n    button { min-width: 44px; }\n    input[type=text], input[type=search], textarea, select { font-size: 16px !important; }\n    input[type=text], input[type=search], select { min-height: 46px; }\n    #customStlTextarea { line-height: 1.5; }\n    #materialColors { flex-wrap: wrap; }\n    #colorSwatches { flex-basis: 100%; gap: 4px; justify-content: space-between; }\n    #colorSwatches button { width: 44px; height: 44px; flex-shrink: 0; }\n    #materialColors > :last-child { margin-left: auto; min-height: 44px; }\n    #customColorPicker { width: 32px; height: 32px; }\n    input[type=range]::-webkit-slider-thumb { width: 24px; height: 24px; margin-top: -9px; }\n    #desktopGestureHint { display: none; }\n    #touchGestureHint {\n        display: block; position: absolute; left: 12px; right: 12px; bottom: calc(16px + var(--safe-bottom));\n        margin: 0; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6; pointer-events: none;\n    }\n}\n\n@media (max-width: 1023px) {\n    body { flex-direction: column; }\n    .mobile-only { display: flex; }\n    #mobileHeader {\n        flex-shrink: 0; min-height: calc(60px + var(--safe-top)); padding: calc(8px + var(--safe-top)) calc(12px + var(--safe-right)) 8px calc(16px + var(--safe-left));\n        align-items: center; justify-content: space-between; gap: 12px; background: #0f172a; border-bottom: 1px solid #1e293b;\n    }\n    #mobileHeader strong { display: block; font-size: 15px; line-height: 1.4; letter-spacing: -.02em; }\n    #mobileHeader span { display: block; font-size: 11px; color: #94a3b8; }\n    #mobileMenuBtn, #closeSidebarBtn { width: 44px; height: 44px; border-radius: 12px; background: #1e293b; color: #e2e8f0; align-items: center; justify-content: center; }\n    #mobileMenuBtn { display: flex; }\n    #viewportMain { width: 100%; height: auto; flex: 1 1 0; }\n    #mobileDock {\n        flex-shrink: 0; height: var(--dock-height); padding: 6px calc(12px + var(--safe-right)) calc(6px + var(--safe-bottom)) calc(12px + var(--safe-left));\n        gap: 8px; background: #0f172a; border-top: 1px solid #26354a; z-index: 25;\n    }\n    #mobileDock button { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: #cbd5e1; border-radius: 12px; font-size: 11px; font-weight: 600; }\n    #mobileDock button:first-child { background: #102e43; color: #7dd3fc; }\n    #sidebarBackdrop { display: block; position: fixed; inset: 0; z-index: 30; background: rgba(2, 6, 23, .65); }\n    #sidebar {\n        position: fixed; z-index: 40; top: auto; bottom: calc(100% - var(--app-top) - var(--app-height) + var(--dock-height));\n        left: var(--safe-left); right: var(--safe-right); width: auto; padding: 0;\n        height: min(640px, calc(var(--app-height) - var(--dock-height) - var(--safe-top) - 24px));\n        max-height: none; border: 1px solid #334155; border-radius: 24px 24px 0 0;\n        transform: translateY(calc(100% + var(--dock-height))); visibility: hidden; pointer-events: none;\n        transition: transform .22s ease, visibility .22s; box-shadow: 0 -12px 48px rgba(0, 0, 0, .35);\n    }\n    body.drawer-open #sidebar { transform: translateY(0); visibility: visible; pointer-events: auto; }\n    #sidebarHeader { padding: 14px 16px; }\n    #sidebarHeader > div > div:first-child { display: none; }\n    #sidebarHeader > div > div:last-child { margin-left: 0; }\n    #sidebarHeader > div { flex: 1; }\n    #sidebarHeader p { font-size: 10px; }\n    #openCodeModalBtn { display: none; }\n    #sidebarScroll { padding: 16px 16px 24px; }\n    #sidebarScroll button { font-size: 13px; }\n    #modelListContainer { max-height: none; overflow: visible; padding-right: 0; }\n    #savedModelListContainer { max-height: 240px; }\n    #modelListContainer button { min-height: 62px; }\n    #modelListContainer button > div { flex: 1; }\n    #hudBadge { top: 12px; left: calc(12px + var(--safe-left)); right: calc(12px + var(--safe-right)); max-width: none; }\n    #hudBadge > div { padding: 10px 12px; }\n    #viewportActions { top: auto; left: calc(12px + var(--safe-left)); right: calc(12px + var(--safe-right)); bottom: 12px; gap: 6px; }\n    #viewportActions button { padding: 10px 8px; border-radius: 12px; min-width: 0; font-size: 11px; justify-content: center; }\n    #downloadStlBtn { flex: 1.2; }\n    #quickExportHtmlBtn, #resetCameraBtn { flex: 1; }\n    #viewportActions i { display: none; }\n    #touchGestureHint { bottom: 67px; left: calc(12px + var(--safe-left)); right: calc(12px + var(--safe-right)); }\n    #desktopGestureHint { display: none; }\n    #modelLoadingStatus { top: 76px; left: 12px; right: 12px; }\n    #toastBanner { bottom: calc(var(--dock-height) + 12px); left: 16px; right: 16px; max-width: none; font-size: 13px; }\n    #stlModal, #actionModal, #downloadModal { padding: calc(8px + var(--safe-top)) calc(8px + var(--safe-right)) calc(8px + var(--safe-bottom)) calc(8px + var(--safe-left)); }\n    #stlModal > div > :nth-child(2) { padding: 16px; }\n    #stlModal > div > :last-child { display: grid; grid-template-columns: auto 1fr; padding: 12px; }\n    #stlModal > div > :nth-child(2) > div:first-child { flex-direction: column; align-items: stretch; }\n    #exportStandaloneHtmlBtn { white-space: normal; justify-content: center; }\n    #customStlTextarea { min-height: 140px; }\n    #copySnippetBtn { font-size: 11px; max-width: 55%; }\n    #dependencyError { overflow: auto; }\n}\n\n/* Keep the model visible on a phone held sideways. */\n@media (max-width: 1023px) and (max-height: 540px) and (orientation: landscape) {\n    :root { --dock-height: calc(54px + var(--safe-bottom)); }\n    #mobileHeader { min-height: calc(48px + var(--safe-top)); padding-top: var(--safe-top); padding-bottom: 0; }\n    #mobileHeader span { display: none; }\n    #mobileDock { padding-top: 4px; padding-bottom: calc(4px + var(--safe-bottom)); }\n    #mobileDock button { flex-direction: row; gap: 8px; }\n    #sidebar { left: var(--safe-left); right: auto; width: min(400px, calc(100% - 32px)); height: calc(var(--app-height) - var(--dock-height) - var(--safe-top)); border-radius: 0 20px 0 0; }\n    #hudBadge { max-width: min(42%, 320px); top: 8px; }\n    #viewportActions { top: 8px; bottom: auto; left: auto; width: 310px; }\n    #touchGestureHint { bottom: 8px; }\n    #modelLoadingStatus { top: 66px; }\n}\n@media (prefers-reduced-motion: reduce) {\n    *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; transition: none !important; }\n}\n\n#modelsSection > div:nth-child(2) > div:first-child { flex-wrap: wrap; gap: 8px; }\n";
const VIEWER_INFLATE_SOURCE = "!function(e){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=e();else if(\"function\"==typeof define&&define.amd)define([],e);else{(\"undefined\"!=typeof window?window:\"undefined\"!=typeof global?global:\"undefined\"!=typeof self?self:this).pako=e()}}(function(){return function r(o,s,f){function l(t,e){if(!s[t]){if(!o[t]){var i=\"function\"==typeof require&&require;if(!e&&i)return i(t,!0);if(d)return d(t,!0);var n=new Error(\"Cannot find module '\"+t+\"'\");throw n.code=\"MODULE_NOT_FOUND\",n}var a=s[t]={exports:{}};o[t][0].call(a.exports,function(e){return l(o[t][1][e]||e)},a,a.exports,r,o,s,f)}return s[t].exports}for(var d=\"function\"==typeof require&&require,e=0;e<f.length;e++)l(f[e]);return l}({1:[function(e,t,i){\"use strict\";var n=\"undefined\"!=typeof Uint8Array&&\"undefined\"!=typeof Uint16Array&&\"undefined\"!=typeof Int32Array;i.assign=function(e){for(var t,i,n=Array.prototype.slice.call(arguments,1);n.length;){var a=n.shift();if(a){if(\"object\"!=typeof a)throw new TypeError(a+\"must be non-object\");for(var r in a)t=a,i=r,Object.prototype.hasOwnProperty.call(t,i)&&(e[r]=a[r])}}return e},i.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var a={arraySet:function(e,t,i,n,a){if(t.subarray&&e.subarray)e.set(t.subarray(i,i+n),a);else for(var r=0;r<n;r++)e[a+r]=t[i+r]},flattenChunks:function(e){var t,i,n,a,r,o;for(t=n=0,i=e.length;t<i;t++)n+=e[t].length;for(o=new Uint8Array(n),t=a=0,i=e.length;t<i;t++)r=e[t],o.set(r,a),a+=r.length;return o}},r={arraySet:function(e,t,i,n,a){for(var r=0;r<n;r++)e[a+r]=t[i+r]},flattenChunks:function(e){return[].concat.apply([],e)}};i.setTyped=function(e){e?(i.Buf8=Uint8Array,i.Buf16=Uint16Array,i.Buf32=Int32Array,i.assign(i,a)):(i.Buf8=Array,i.Buf16=Array,i.Buf32=Array,i.assign(i,r))},i.setTyped(n)},{}],2:[function(e,t,i){\"use strict\";var f=e(\"./common\"),a=!0,r=!0;try{String.fromCharCode.apply(null,[0])}catch(e){a=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){r=!1}for(var l=new f.Buf8(256),n=0;n<256;n++)l[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function d(e,t){if(t<65534&&(e.subarray&&r||!e.subarray&&a))return String.fromCharCode.apply(null,f.shrinkBuf(e,t));for(var i=\"\",n=0;n<t;n++)i+=String.fromCharCode(e[n]);return i}l[254]=l[254]=1,i.string2buf=function(e){var t,i,n,a,r,o=e.length,s=0;for(a=0;a<o;a++)55296==(64512&(i=e.charCodeAt(a)))&&a+1<o&&56320==(64512&(n=e.charCodeAt(a+1)))&&(i=65536+(i-55296<<10)+(n-56320),a++),s+=i<128?1:i<2048?2:i<65536?3:4;for(t=new f.Buf8(s),a=r=0;r<s;a++)55296==(64512&(i=e.charCodeAt(a)))&&a+1<o&&56320==(64512&(n=e.charCodeAt(a+1)))&&(i=65536+(i-55296<<10)+(n-56320),a++),i<128?t[r++]=i:(i<2048?t[r++]=192|i>>>6:(i<65536?t[r++]=224|i>>>12:(t[r++]=240|i>>>18,t[r++]=128|i>>>12&63),t[r++]=128|i>>>6&63),t[r++]=128|63&i);return t},i.buf2binstring=function(e){return d(e,e.length)},i.binstring2buf=function(e){for(var t=new f.Buf8(e.length),i=0,n=t.length;i<n;i++)t[i]=e.charCodeAt(i);return t},i.buf2string=function(e,t){var i,n,a,r,o=t||e.length,s=new Array(2*o);for(i=n=0;i<o;)if((a=e[i++])<128)s[n++]=a;else if(4<(r=l[a]))s[n++]=65533,i+=r-1;else{for(a&=2===r?31:3===r?15:7;1<r&&i<o;)a=a<<6|63&e[i++],r--;1<r?s[n++]=65533:a<65536?s[n++]=a:(a-=65536,s[n++]=55296|a>>10&1023,s[n++]=56320|1023&a)}return d(s,n)},i.utf8border=function(e,t){var i;for((t=t||e.length)>e.length&&(t=e.length),i=t-1;0<=i&&128==(192&e[i]);)i--;return i<0?t:0===i?t:i+l[e[i]]>t?i:t}},{\"./common\":1}],3:[function(e,t,i){\"use strict\";t.exports=function(e,t,i,n){for(var a=65535&e|0,r=e>>>16&65535|0,o=0;0!==i;){for(i-=o=2e3<i?2e3:i;r=r+(a=a+t[n++]|0)|0,--o;);a%=65521,r%=65521}return a|r<<16|0}},{}],4:[function(e,t,i){\"use strict\";t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],5:[function(e,t,i){\"use strict\";var s=function(){for(var e,t=[],i=0;i<256;i++){e=i;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[i]=e}return t}();t.exports=function(e,t,i,n){var a=s,r=n+i;e^=-1;for(var o=n;o<r;o++)e=e>>>8^a[255&(e^t[o])];return-1^e}},{}],6:[function(e,t,i){\"use strict\";t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name=\"\",this.comment=\"\",this.hcrc=0,this.done=!1}},{}],7:[function(e,t,i){\"use strict\";t.exports=function(e,t){var i,n,a,r,o,s,f,l,d,c,u,h,b,m,w,k,_,g,v,p,x,y,S,E,Z;i=e.state,n=e.next_in,E=e.input,a=n+(e.avail_in-5),r=e.next_out,Z=e.output,o=r-(t-e.avail_out),s=r+(e.avail_out-257),f=i.dmax,l=i.wsize,d=i.whave,c=i.wnext,u=i.window,h=i.hold,b=i.bits,m=i.lencode,w=i.distcode,k=(1<<i.lenbits)-1,_=(1<<i.distbits)-1;e:do{b<15&&(h+=E[n++]<<b,b+=8,h+=E[n++]<<b,b+=8),g=m[h&k];t:for(;;){if(h>>>=v=g>>>24,b-=v,0===(v=g>>>16&255))Z[r++]=65535&g;else{if(!(16&v)){if(0==(64&v)){g=m[(65535&g)+(h&(1<<v)-1)];continue t}if(32&v){i.mode=12;break e}e.msg=\"invalid literal/length code\",i.mode=30;break e}p=65535&g,(v&=15)&&(b<v&&(h+=E[n++]<<b,b+=8),p+=h&(1<<v)-1,h>>>=v,b-=v),b<15&&(h+=E[n++]<<b,b+=8,h+=E[n++]<<b,b+=8),g=w[h&_];i:for(;;){if(h>>>=v=g>>>24,b-=v,!(16&(v=g>>>16&255))){if(0==(64&v)){g=w[(65535&g)+(h&(1<<v)-1)];continue i}e.msg=\"invalid distance code\",i.mode=30;break e}if(x=65535&g,b<(v&=15)&&(h+=E[n++]<<b,(b+=8)<v&&(h+=E[n++]<<b,b+=8)),f<(x+=h&(1<<v)-1)){e.msg=\"invalid distance too far back\",i.mode=30;break e}if(h>>>=v,b-=v,(v=r-o)<x){if(d<(v=x-v)&&i.sane){e.msg=\"invalid distance too far back\",i.mode=30;break e}if(S=u,(y=0)===c){if(y+=l-v,v<p){for(p-=v;Z[r++]=u[y++],--v;);y=r-x,S=Z}}else if(c<v){if(y+=l+c-v,(v-=c)<p){for(p-=v;Z[r++]=u[y++],--v;);if(y=0,c<p){for(p-=v=c;Z[r++]=u[y++],--v;);y=r-x,S=Z}}}else if(y+=c-v,v<p){for(p-=v;Z[r++]=u[y++],--v;);y=r-x,S=Z}for(;2<p;)Z[r++]=S[y++],Z[r++]=S[y++],Z[r++]=S[y++],p-=3;p&&(Z[r++]=S[y++],1<p&&(Z[r++]=S[y++]))}else{for(y=r-x;Z[r++]=Z[y++],Z[r++]=Z[y++],Z[r++]=Z[y++],2<(p-=3););p&&(Z[r++]=Z[y++],1<p&&(Z[r++]=Z[y++]))}break}}break}}while(n<a&&r<s);n-=p=b>>3,h&=(1<<(b-=p<<3))-1,e.next_in=n,e.next_out=r,e.avail_in=n<a?a-n+5:5-(n-a),e.avail_out=r<s?s-r+257:257-(r-s),i.hold=h,i.bits=b}},{}],8:[function(e,t,i){\"use strict\";var z=e(\"../utils/common\"),R=e(\"./adler32\"),N=e(\"./crc32\"),O=e(\"./inffast\"),C=e(\"./inftrees\"),I=1,D=2,T=0,U=-2,F=1,n=852,a=592;function L(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function r(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new z.Buf16(320),this.work=new z.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function o(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg=\"\",t.wrap&&(e.adler=1&t.wrap),t.mode=F,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new z.Buf32(n),t.distcode=t.distdyn=new z.Buf32(a),t.sane=1,t.back=-1,T):U}function s(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,o(e)):U}function f(e,t){var i,n;return e&&e.state?(n=e.state,t<0?(i=0,t=-t):(i=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?U:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=i,n.wbits=t,s(e))):U}function l(e,t){var i,n;return e?(n=new r,(e.state=n).window=null,(i=f(e,t))!==T&&(e.state=null),i):U}var d,c,u=!0;function H(e){if(u){var t;for(d=new z.Buf32(512),c=new z.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(C(I,e.lens,0,288,d,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;C(D,e.lens,0,32,c,0,e.work,{bits:5}),u=!1}e.lencode=d,e.lenbits=9,e.distcode=c,e.distbits=5}function j(e,t,i,n){var a,r=e.state;return null===r.window&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new z.Buf8(r.wsize)),n>=r.wsize?(z.arraySet(r.window,t,i-r.wsize,r.wsize,0),r.wnext=0,r.whave=r.wsize):(n<(a=r.wsize-r.wnext)&&(a=n),z.arraySet(r.window,t,i-n,a,r.wnext),(n-=a)?(z.arraySet(r.window,t,i-n,n,0),r.wnext=n,r.whave=r.wsize):(r.wnext+=a,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=a))),0}i.inflateReset=s,i.inflateReset2=f,i.inflateResetKeep=o,i.inflateInit=function(e){return l(e,15)},i.inflateInit2=l,i.inflate=function(e,t){var i,n,a,r,o,s,f,l,d,c,u,h,b,m,w,k,_,g,v,p,x,y,S,E,Z=0,B=new z.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return U;12===(i=e.state).mode&&(i.mode=13),o=e.next_out,a=e.output,f=e.avail_out,r=e.next_in,n=e.input,s=e.avail_in,l=i.hold,d=i.bits,c=s,u=f,y=T;e:for(;;)switch(i.mode){case F:if(0===i.wrap){i.mode=13;break}for(;d<16;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if(2&i.wrap&&35615===l){B[i.check=0]=255&l,B[1]=l>>>8&255,i.check=N(i.check,B,2,0),d=l=0,i.mode=2;break}if(i.flags=0,i.head&&(i.head.done=!1),!(1&i.wrap)||(((255&l)<<8)+(l>>8))%31){e.msg=\"incorrect header check\",i.mode=30;break}if(8!=(15&l)){e.msg=\"unknown compression method\",i.mode=30;break}if(d-=4,x=8+(15&(l>>>=4)),0===i.wbits)i.wbits=x;else if(x>i.wbits){e.msg=\"invalid window size\",i.mode=30;break}i.dmax=1<<x,e.adler=i.check=1,i.mode=512&l?10:12,d=l=0;break;case 2:for(;d<16;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if(i.flags=l,8!=(255&i.flags)){e.msg=\"unknown compression method\",i.mode=30;break}if(57344&i.flags){e.msg=\"unknown header flags set\",i.mode=30;break}i.head&&(i.head.text=l>>8&1),512&i.flags&&(B[0]=255&l,B[1]=l>>>8&255,i.check=N(i.check,B,2,0)),d=l=0,i.mode=3;case 3:for(;d<32;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}i.head&&(i.head.time=l),512&i.flags&&(B[0]=255&l,B[1]=l>>>8&255,B[2]=l>>>16&255,B[3]=l>>>24&255,i.check=N(i.check,B,4,0)),d=l=0,i.mode=4;case 4:for(;d<16;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}i.head&&(i.head.xflags=255&l,i.head.os=l>>8),512&i.flags&&(B[0]=255&l,B[1]=l>>>8&255,i.check=N(i.check,B,2,0)),d=l=0,i.mode=5;case 5:if(1024&i.flags){for(;d<16;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}i.length=l,i.head&&(i.head.extra_len=l),512&i.flags&&(B[0]=255&l,B[1]=l>>>8&255,i.check=N(i.check,B,2,0)),d=l=0}else i.head&&(i.head.extra=null);i.mode=6;case 6:if(1024&i.flags&&(s<(h=i.length)&&(h=s),h&&(i.head&&(x=i.head.extra_len-i.length,i.head.extra||(i.head.extra=new Array(i.head.extra_len)),z.arraySet(i.head.extra,n,r,h,x)),512&i.flags&&(i.check=N(i.check,n,h,r)),s-=h,r+=h,i.length-=h),i.length))break e;i.length=0,i.mode=7;case 7:if(2048&i.flags){if(0===s)break e;for(h=0;x=n[r+h++],i.head&&x&&i.length<65536&&(i.head.name+=String.fromCharCode(x)),x&&h<s;);if(512&i.flags&&(i.check=N(i.check,n,h,r)),s-=h,r+=h,x)break e}else i.head&&(i.head.name=null);i.length=0,i.mode=8;case 8:if(4096&i.flags){if(0===s)break e;for(h=0;x=n[r+h++],i.head&&x&&i.length<65536&&(i.head.comment+=String.fromCharCode(x)),x&&h<s;);if(512&i.flags&&(i.check=N(i.check,n,h,r)),s-=h,r+=h,x)break e}else i.head&&(i.head.comment=null);i.mode=9;case 9:if(512&i.flags){for(;d<16;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if(l!==(65535&i.check)){e.msg=\"header crc mismatch\",i.mode=30;break}d=l=0}i.head&&(i.head.hcrc=i.flags>>9&1,i.head.done=!0),e.adler=i.check=0,i.mode=12;break;case 10:for(;d<32;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}e.adler=i.check=L(l),d=l=0,i.mode=11;case 11:if(0===i.havedict)return e.next_out=o,e.avail_out=f,e.next_in=r,e.avail_in=s,i.hold=l,i.bits=d,2;e.adler=i.check=1,i.mode=12;case 12:if(5===t||6===t)break e;case 13:if(i.last){l>>>=7&d,d-=7&d,i.mode=27;break}for(;d<3;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}switch(i.last=1&l,d-=1,3&(l>>>=1)){case 0:i.mode=14;break;case 1:if(H(i),i.mode=20,6!==t)break;l>>>=2,d-=2;break e;case 2:i.mode=17;break;case 3:e.msg=\"invalid block type\",i.mode=30}l>>>=2,d-=2;break;case 14:for(l>>>=7&d,d-=7&d;d<32;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if((65535&l)!=(l>>>16^65535)){e.msg=\"invalid stored block lengths\",i.mode=30;break}if(i.length=65535&l,d=l=0,i.mode=15,6===t)break e;case 15:i.mode=16;case 16:if(h=i.length){if(s<h&&(h=s),f<h&&(h=f),0===h)break e;z.arraySet(a,n,r,h,o),s-=h,r+=h,f-=h,o+=h,i.length-=h;break}i.mode=12;break;case 17:for(;d<14;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if(i.nlen=257+(31&l),l>>>=5,d-=5,i.ndist=1+(31&l),l>>>=5,d-=5,i.ncode=4+(15&l),l>>>=4,d-=4,286<i.nlen||30<i.ndist){e.msg=\"too many length or distance symbols\",i.mode=30;break}i.have=0,i.mode=18;case 18:for(;i.have<i.ncode;){for(;d<3;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}i.lens[A[i.have++]]=7&l,l>>>=3,d-=3}for(;i.have<19;)i.lens[A[i.have++]]=0;if(i.lencode=i.lendyn,i.lenbits=7,S={bits:i.lenbits},y=C(0,i.lens,0,19,i.lencode,0,i.work,S),i.lenbits=S.bits,y){e.msg=\"invalid code lengths set\",i.mode=30;break}i.have=0,i.mode=19;case 19:for(;i.have<i.nlen+i.ndist;){for(;k=(Z=i.lencode[l&(1<<i.lenbits)-1])>>>16&255,_=65535&Z,!((w=Z>>>24)<=d);){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if(_<16)l>>>=w,d-=w,i.lens[i.have++]=_;else{if(16===_){for(E=w+2;d<E;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if(l>>>=w,d-=w,0===i.have){e.msg=\"invalid bit length repeat\",i.mode=30;break}x=i.lens[i.have-1],h=3+(3&l),l>>>=2,d-=2}else if(17===_){for(E=w+3;d<E;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}d-=w,x=0,h=3+(7&(l>>>=w)),l>>>=3,d-=3}else{for(E=w+7;d<E;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}d-=w,x=0,h=11+(127&(l>>>=w)),l>>>=7,d-=7}if(i.have+h>i.nlen+i.ndist){e.msg=\"invalid bit length repeat\",i.mode=30;break}for(;h--;)i.lens[i.have++]=x}}if(30===i.mode)break;if(0===i.lens[256]){e.msg=\"invalid code -- missing end-of-block\",i.mode=30;break}if(i.lenbits=9,S={bits:i.lenbits},y=C(I,i.lens,0,i.nlen,i.lencode,0,i.work,S),i.lenbits=S.bits,y){e.msg=\"invalid literal/lengths set\",i.mode=30;break}if(i.distbits=6,i.distcode=i.distdyn,S={bits:i.distbits},y=C(D,i.lens,i.nlen,i.ndist,i.distcode,0,i.work,S),i.distbits=S.bits,y){e.msg=\"invalid distances set\",i.mode=30;break}if(i.mode=20,6===t)break e;case 20:i.mode=21;case 21:if(6<=s&&258<=f){e.next_out=o,e.avail_out=f,e.next_in=r,e.avail_in=s,i.hold=l,i.bits=d,O(e,u),o=e.next_out,a=e.output,f=e.avail_out,r=e.next_in,n=e.input,s=e.avail_in,l=i.hold,d=i.bits,12===i.mode&&(i.back=-1);break}for(i.back=0;k=(Z=i.lencode[l&(1<<i.lenbits)-1])>>>16&255,_=65535&Z,!((w=Z>>>24)<=d);){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if(k&&0==(240&k)){for(g=w,v=k,p=_;k=(Z=i.lencode[p+((l&(1<<g+v)-1)>>g)])>>>16&255,_=65535&Z,!(g+(w=Z>>>24)<=d);){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}l>>>=g,d-=g,i.back+=g}if(l>>>=w,d-=w,i.back+=w,i.length=_,0===k){i.mode=26;break}if(32&k){i.back=-1,i.mode=12;break}if(64&k){e.msg=\"invalid literal/length code\",i.mode=30;break}i.extra=15&k,i.mode=22;case 22:if(i.extra){for(E=i.extra;d<E;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}i.length+=l&(1<<i.extra)-1,l>>>=i.extra,d-=i.extra,i.back+=i.extra}i.was=i.length,i.mode=23;case 23:for(;k=(Z=i.distcode[l&(1<<i.distbits)-1])>>>16&255,_=65535&Z,!((w=Z>>>24)<=d);){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if(0==(240&k)){for(g=w,v=k,p=_;k=(Z=i.distcode[p+((l&(1<<g+v)-1)>>g)])>>>16&255,_=65535&Z,!(g+(w=Z>>>24)<=d);){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}l>>>=g,d-=g,i.back+=g}if(l>>>=w,d-=w,i.back+=w,64&k){e.msg=\"invalid distance code\",i.mode=30;break}i.offset=_,i.extra=15&k,i.mode=24;case 24:if(i.extra){for(E=i.extra;d<E;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}i.offset+=l&(1<<i.extra)-1,l>>>=i.extra,d-=i.extra,i.back+=i.extra}if(i.offset>i.dmax){e.msg=\"invalid distance too far back\",i.mode=30;break}i.mode=25;case 25:if(0===f)break e;if(h=u-f,i.offset>h){if((h=i.offset-h)>i.whave&&i.sane){e.msg=\"invalid distance too far back\",i.mode=30;break}h>i.wnext?(h-=i.wnext,b=i.wsize-h):b=i.wnext-h,h>i.length&&(h=i.length),m=i.window}else m=a,b=o-i.offset,h=i.length;for(f<h&&(h=f),f-=h,i.length-=h;a[o++]=m[b++],--h;);0===i.length&&(i.mode=21);break;case 26:if(0===f)break e;a[o++]=i.length,f--,i.mode=21;break;case 27:if(i.wrap){for(;d<32;){if(0===s)break e;s--,l|=n[r++]<<d,d+=8}if(u-=f,e.total_out+=u,i.total+=u,u&&(e.adler=i.check=i.flags?N(i.check,a,u,o-u):R(i.check,a,u,o-u)),u=f,(i.flags?l:L(l))!==i.check){e.msg=\"incorrect data check\",i.mode=30;break}d=l=0}i.mode=28;case 28:if(i.wrap&&i.flags){for(;d<32;){if(0===s)break e;s--,l+=n[r++]<<d,d+=8}if(l!==(4294967295&i.total)){e.msg=\"incorrect length check\",i.mode=30;break}d=l=0}i.mode=29;case 29:y=1;break e;case 30:y=-3;break e;case 31:return-4;case 32:default:return U}return e.next_out=o,e.avail_out=f,e.next_in=r,e.avail_in=s,i.hold=l,i.bits=d,(i.wsize||u!==e.avail_out&&i.mode<30&&(i.mode<27||4!==t))&&j(e,e.output,e.next_out,u-e.avail_out)?(i.mode=31,-4):(c-=e.avail_in,u-=e.avail_out,e.total_in+=c,e.total_out+=u,i.total+=u,i.wrap&&u&&(e.adler=i.check=i.flags?N(i.check,a,u,e.next_out-u):R(i.check,a,u,e.next_out-u)),e.data_type=i.bits+(i.last?64:0)+(12===i.mode?128:0)+(20===i.mode||15===i.mode?256:0),(0===c&&0===u||4===t)&&y===T&&(y=-5),y)},i.inflateEnd=function(e){if(!e||!e.state)return U;var t=e.state;return t.window&&(t.window=null),e.state=null,T},i.inflateGetHeader=function(e,t){var i;return e&&e.state?0==(2&(i=e.state).wrap)?U:((i.head=t).done=!1,T):U},i.inflateSetDictionary=function(e,t){var i,n=t.length;return e&&e.state?0!==(i=e.state).wrap&&11!==i.mode?U:11===i.mode&&R(1,t,n,0)!==i.check?-3:j(e,t,n,n)?(i.mode=31,-4):(i.havedict=1,T):U},i.inflateInfo=\"pako inflate (from Nodeca project)\"},{\"../utils/common\":1,\"./adler32\":3,\"./crc32\":5,\"./inffast\":7,\"./inftrees\":9}],9:[function(e,t,i){\"use strict\";var I=e(\"../utils/common\"),D=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],T=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],F=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,i,n,a,r,o,s){var f,l,d,c,u,h,b,m,w,k=s.bits,_=0,g=0,v=0,p=0,x=0,y=0,S=0,E=0,Z=0,B=0,A=null,z=0,R=new I.Buf16(16),N=new I.Buf16(16),O=null,C=0;for(_=0;_<=15;_++)R[_]=0;for(g=0;g<n;g++)R[t[i+g]]++;for(x=k,p=15;1<=p&&0===R[p];p--);if(p<x&&(x=p),0===p)return a[r++]=20971520,a[r++]=20971520,s.bits=1,0;for(v=1;v<p&&0===R[v];v++);for(x<v&&(x=v),_=E=1;_<=15;_++)if(E<<=1,(E-=R[_])<0)return-1;if(0<E&&(0===e||1!==p))return-1;for(N[1]=0,_=1;_<15;_++)N[_+1]=N[_]+R[_];for(g=0;g<n;g++)0!==t[i+g]&&(o[N[t[i+g]]++]=g);if(0===e?(A=O=o,h=19):1===e?(A=D,z-=257,O=T,C-=257,h=256):(A=U,O=F,h=-1),_=v,u=r,S=g=B=0,d=-1,c=(Z=1<<(y=x))-1,1===e&&852<Z||2===e&&592<Z)return 1;for(;;){for(b=_-S,o[g]<h?(m=0,w=o[g]):o[g]>h?(m=O[C+o[g]],w=A[z+o[g]]):(m=96,w=0),f=1<<_-S,v=l=1<<y;a[u+(B>>S)+(l-=f)]=b<<24|m<<16|w|0,0!==l;);for(f=1<<_-1;B&f;)f>>=1;if(0!==f?(B&=f-1,B+=f):B=0,g++,0==--R[_]){if(_===p)break;_=t[i+o[g]]}if(x<_&&(B&c)!==d){for(0===S&&(S=x),u+=v,E=1<<(y=_-S);y+S<p&&!((E-=R[y+S])<=0);)y++,E<<=1;if(Z+=1<<y,1===e&&852<Z||2===e&&592<Z)return 1;a[d=B&c]=x<<24|y<<16|u-r|0}}return 0!==B&&(a[u+B]=_-S<<24|64<<16|0),s.bits=x,0}},{\"../utils/common\":1}],10:[function(e,t,i){\"use strict\";t.exports={2:\"need dictionary\",1:\"stream end\",0:\"\",\"-1\":\"file error\",\"-2\":\"stream error\",\"-3\":\"data error\",\"-4\":\"insufficient memory\",\"-5\":\"buffer error\",\"-6\":\"incompatible version\"}},{}],11:[function(e,t,i){\"use strict\";t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg=\"\",this.state=null,this.data_type=2,this.adler=0}},{}],\"/lib/inflate.js\":[function(e,t,i){\"use strict\";var c=e(\"./zlib/inflate\"),u=e(\"./utils/common\"),h=e(\"./utils/strings\"),b=e(\"./zlib/constants\"),n=e(\"./zlib/messages\"),a=e(\"./zlib/zstream\"),r=e(\"./zlib/gzheader\"),m=Object.prototype.toString;function o(e){if(!(this instanceof o))return new o(e);this.options=u.assign({chunkSize:16384,windowBits:0,to:\"\"},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg=\"\",this.ended=!1,this.chunks=[],this.strm=new a,this.strm.avail_out=0;var i=c.inflateInit2(this.strm,t.windowBits);if(i!==b.Z_OK)throw new Error(n[i]);if(this.header=new r,c.inflateGetHeader(this.strm,this.header),t.dictionary&&(\"string\"==typeof t.dictionary?t.dictionary=h.string2buf(t.dictionary):\"[object ArrayBuffer]\"===m.call(t.dictionary)&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(i=c.inflateSetDictionary(this.strm,t.dictionary))!==b.Z_OK))throw new Error(n[i])}function s(e,t){var i=new o(t);if(i.push(e,!0),i.err)throw i.msg||n[i.err];return i.result}o.prototype.push=function(e,t){var i,n,a,r,o,s=this.strm,f=this.options.chunkSize,l=this.options.dictionary,d=!1;if(this.ended)return!1;n=t===~~t?t:!0===t?b.Z_FINISH:b.Z_NO_FLUSH,\"string\"==typeof e?s.input=h.binstring2buf(e):\"[object ArrayBuffer]\"===m.call(e)?s.input=new Uint8Array(e):s.input=e,s.next_in=0,s.avail_in=s.input.length;do{if(0===s.avail_out&&(s.output=new u.Buf8(f),s.next_out=0,s.avail_out=f),(i=c.inflate(s,b.Z_NO_FLUSH))===b.Z_NEED_DICT&&l&&(i=c.inflateSetDictionary(this.strm,l)),i===b.Z_BUF_ERROR&&!0===d&&(i=b.Z_OK,d=!1),i!==b.Z_STREAM_END&&i!==b.Z_OK)return this.onEnd(i),!(this.ended=!0);s.next_out&&(0!==s.avail_out&&i!==b.Z_STREAM_END&&(0!==s.avail_in||n!==b.Z_FINISH&&n!==b.Z_SYNC_FLUSH)||(\"string\"===this.options.to?(a=h.utf8border(s.output,s.next_out),r=s.next_out-a,o=h.buf2string(s.output,a),s.next_out=r,s.avail_out=f-r,r&&u.arraySet(s.output,s.output,a,r,0),this.onData(o)):this.onData(u.shrinkBuf(s.output,s.next_out)))),0===s.avail_in&&0===s.avail_out&&(d=!0)}while((0<s.avail_in||0===s.avail_out)&&i!==b.Z_STREAM_END);return i===b.Z_STREAM_END&&(n=b.Z_FINISH),n===b.Z_FINISH?(i=c.inflateEnd(this.strm),this.onEnd(i),this.ended=!0,i===b.Z_OK):n!==b.Z_SYNC_FLUSH||(this.onEnd(b.Z_OK),!(s.avail_out=0))},o.prototype.onData=function(e){this.chunks.push(e)},o.prototype.onEnd=function(e){e===b.Z_OK&&(\"string\"===this.options.to?this.result=this.chunks.join(\"\"):this.result=u.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},i.Inflate=o,i.inflate=s,i.inflateRaw=function(e,t){return(t=t||{}).raw=!0,s(e,t)},i.ungzip=s},{\"./utils/common\":1,\"./utils/strings\":2,\"./zlib/constants\":4,\"./zlib/gzheader\":6,\"./zlib/inflate\":8,\"./zlib/messages\":10,\"./zlib/zstream\":11}]},{},[])(\"/lib/inflate.js\")});\n";
        /**************************************************************************
         * 1. EMBEDDED STL MODELS (INCLUDED DIRECTLY IN HTML CODE)
         * ------------------------------------------------------------------------
         * You can paste your own ASCII STL strings or Base64-encoded binary STL
         * strings directly into this `EMBEDDED_STL_MODELS` array!
         *
         * Format options:
         * - `format: 'ascii'`  -> `stlData` contains `solid name ... endsolid`
         * - `format: 'base64'` -> `stlData` contains Base64-encoded binary/ASCII STL
         **************************************************************************/
// Reverse the storage encoding to recover the exact original STL byte stream.
// The reconstructed file is still parsed by the reference Three.js STLLoader.
async function decompressOriginalSTL(encoded, expectedSize, expectedHash) {
    const binary = atob(encoded.trim());
    const compressed = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) compressed[i] = binary.charCodeAt(i);
    let archive;
    if (typeof DecompressionStream === 'function') {
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
        archive = await new Response(stream).arrayBuffer();
    } else if (globalThis.pako) {
        const restored = globalThis.pako.ungzip(compressed);
        archive = restored.buffer.slice(restored.byteOffset, restored.byteOffset + restored.byteLength);
    } else {
        throw new Error('Model decompression could not start. Keep the vendor folder beside index.html.');
    }
    const data = new DataView(archive);
    if (archive.byteLength < 100 || data.getUint32(0, true) !== 0x315a4c53) throw new Error('Invalid model archive.');
    const dictionaryCount = data.getUint32(4, true), indexWidth = data.getUint32(8, true), triangles = data.getUint32(12, true);
    if (!dictionaryCount || !triangles || ![2,4].includes(indexWidth) || dictionaryCount > triangles * 3 ||
        expectedSize !== 84 + triangles * 50 || data.getUint32(96, true) !== triangles ||
        archive.byteLength !== 100 + dictionaryCount * 12 + triangles * (3 * indexWidth + 14)) {
        throw new Error('Model archive has invalid lengths.');
    }
    const bytes = new Uint8Array(archive), original = new Uint8Array(expectedSize);
    original.set(bytes.subarray(16, 100));
    const indexStart = 100 + dictionaryCount * 12;
    const normalStart = indexStart + triangles * 3 * indexWidth;
    const attributeStart = normalStart + triangles * 12;
    for (let face = 0; face < triangles; face++) {
        const target = 84 + face * 50;
        // Restore face normals exactly, without recomputation or averaging.
        for (let b = 0; b < 12; b++) original[target + b] = bytes[normalStart + b * triangles + face];
        for (let corner = 0; corner < 3; corner++) {
            const offset = indexStart + (face * 3 + corner) * indexWidth;
            const index = indexWidth === 2 ? data.getUint16(offset, true) : data.getUint32(offset, true);
            if (index >= dictionaryCount) throw new Error('Model archive contains an invalid dictionary reference.');
            original.set(bytes.subarray(100 + index * 12, 112 + index * 12), target + 12 + corner * 12);
        }
        original[target + 48] = bytes[attributeStart + face];
        original[target + 49] = bytes[attributeStart + triangles + face];
    }
    const buffer = original.buffer;
    if (globalThis.crypto && crypto.subtle && expectedHash) {
        const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer));
        const actual = Array.from(digest, value => value.toString(16).padStart(2, '0')).join('');
        if (actual !== expectedHash) throw new Error('The restored STL failed its integrity check.');
    }
    return buffer;
}

window.CAFE_MODEL_PAYLOADS = Object.create(null);
const encodedModelCache = new Map();
const pendingPayloadLoads = new Map();
function getEncodedModel(model) {
    // Portable HTML exports use inline payloads; the folder edition loads one JS file.
    const inline = document.getElementById(model.dataId);
    if (inline) return Promise.resolve(inline.textContent);
    if (encodedModelCache.has(model.id)) return Promise.resolve(encodedModelCache.get(model.id));
    if (pendingPayloadLoads.has(model.id)) return pendingPayloadLoads.get(model.id);
    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = model.dataFile;
        script.async = true;
        const cleanup = () => script.remove();
        script.onload = () => {
            const encoded = window.CAFE_MODEL_PAYLOADS[model.id];
            delete window.CAFE_MODEL_PAYLOADS[model.id];
            cleanup();
            if (typeof encoded !== 'string') return reject(new Error('The model data file is incomplete.'));
            encodedModelCache.set(model.id, encoded);
            while (encodedModelCache.size > 2) encodedModelCache.delete(encodedModelCache.keys().next().value);
            resolve(encoded);
        };
        script.onerror = () => { cleanup(); reject(new Error('Cannot open ' + model.dataFile + '. Extract the entire ZIP and keep the models folder beside index.html.')); };
        document.body.appendChild(script);
    }).finally(() => pendingPayloadLoads.delete(model.id));
    pendingPayloadLoads.set(model.id, promise);
    return promise;
}

function originalSTLTask(model) {
    let worker = null, url = null, cancelled = false, rejectPending;
    const cleanup = () => { if (worker) worker.terminate(); if (url) URL.revokeObjectURL(url); };
    const promise = new Promise((resolve, reject) => {
        rejectPending = reject;
        getEncodedModel(model).then(encoded => {
            if (cancelled) return;
            const fallback = () => decompressOriginalSTL(encoded, model.byteSize, model.sha256)
                .then(buffer => { if (!cancelled) resolve(buffer); }, reject);
            if (typeof Worker !== 'undefined') {
                try {
                    const source = VIEWER_INFLATE_SOURCE + '\nconst decompressOriginalSTL = ' + decompressOriginalSTL.toString() + `;
                        self.onmessage = async ({data}) => {
                            try {
                                const buffer = await decompressOriginalSTL(data.encoded, data.byteSize, data.sha256);
                                self.postMessage({buffer}, [buffer]);
                            } catch(error) { self.postMessage({error: error.message}); }
                        };`;
                    url = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
                    worker = new Worker(url);
                    worker.onmessage = ({data}) => { cleanup(); data.error ? reject(new Error(data.error)) : resolve(data.buffer); };
                    worker.onerror = () => { cleanup(); if (!cancelled) fallback(); };
                    worker.postMessage({encoded, byteSize:model.byteSize, sha256:model.sha256});
                    return;
                } catch(error) { cleanup(); }
            }
            fallback();
        }, reject);
    });
    return {promise, cancel() { cancelled = true; cleanup(); rejectPending(new DOMException('Selection changed.', 'AbortError')); }};
}


let pendingOriginalSTL = null;
async function downloadCurrentSTL() {
    const found = findModelById(activeModelId);
    if (!found) return;
    const model = found.model, button = document.getElementById('downloadStlBtn');
    button.disabled = true;
    try {
        let bytes;
        if (model.format === 'original-stl-lossless') bytes = await originalSTLTask(model).promise;
        else if (model.arrayBuffer) bytes = model.arrayBuffer;
        else bytes = model.format === 'base64' ? base64ToArrayBuffer(model.stlData) : model.stlData;
        saveBlob(new Blob([bytes], {type: 'application/octet-stream'}), model.filename || model.name + '.stl');
    } catch (error) { showToast('STL download failed: ' + error.message, true); }
    finally { button.disabled = false; }
}

let renderFrame = null;
function requestRender() {
    if (renderFrame === null && !document.hidden && !isViewerObscured()) renderFrame = requestAnimationFrame(animate);
}

        const EMBEDDED_STL_MODELS = JSON.parse(document.getElementById('embeddedStlModels').textContent);

        /**************************************************************************
         * 1B. INDEXEDDB PERSISTENT BROWSER STORAGE (`STLViewerDB` -> `saved_stls`)
         **************************************************************************/
        const IDB_CONFIG = {
            dbName: 'STLViewerDB',
            version: 1,
            storeName: 'saved_stls'
        };
        const STORAGE_PREFS_KEY = 'stl_studio_original_faces_v4';

        // In-memory cache of models stored in IndexedDB
        let savedBrowserModels = [];

        function openSTLDatabase() {
            return new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    reject(new Error('IndexedDB is not supported in this browser.'));
                    return;
                }
                const request = indexedDB.open(IDB_CONFIG.dbName, IDB_CONFIG.version);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(IDB_CONFIG.storeName)) {
                        db.createObjectStore(IDB_CONFIG.storeName, { keyPath: 'id' });
                    }
                };
                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => reject(event.target.error);
            });
        }

        async function loadAllModelsFromIndexedDB() {
            try {
                const db = await openSTLDatabase();
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(IDB_CONFIG.storeName, 'readonly');
                    const store = tx.objectStore(IDB_CONFIG.storeName);
                    const req = store.getAll();
                    req.onsuccess = () => {
                        const list = req.result || [];
                        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                        savedBrowserModels = list;
                        resolve(list);
                    };
                    req.onerror = () => reject(req.error);
                });
            } catch (err) {
                console.warn('IndexedDB load warning:', err);
                savedBrowserModels = [];
                return [];
            }
        }

        async function saveModelToIndexedDB(modelRecord) {
            const db = await openSTLDatabase();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(IDB_CONFIG.storeName, 'readwrite');
                const store = tx.objectStore(IDB_CONFIG.storeName);
                const req = store.put(modelRecord);
                req.onsuccess = async () => {
                    await loadAllModelsFromIndexedDB();
                    resolve(modelRecord);
                };
                req.onerror = () => reject(req.error);
            });
        }

        async function deleteModelFromIndexedDB(modelId) {
            const db = await openSTLDatabase();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(IDB_CONFIG.storeName, 'readwrite');
                const store = tx.objectStore(IDB_CONFIG.storeName);
                const req = store.delete(modelId);
                req.onsuccess = async () => {
                    await loadAllModelsFromIndexedDB();
                    resolve();
                };
                req.onerror = () => reject(req.error);
            });
        }

        async function clearAllModelsFromIndexedDB() {
            const db = await openSTLDatabase();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(IDB_CONFIG.storeName, 'readwrite');
                const store = tx.objectStore(IDB_CONFIG.storeName);
                const req = store.clear();
                req.onsuccess = async () => {
                    savedBrowserModels = [];
                    resolve();
                };
                req.onerror = () => reject(req.error);
            });
        }

        function formatByteSize(bytes) {
            if (!bytes || bytes <= 0) return '0 KB';
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }

        function calculateRecordByteSize(record) {
            if (record.byteSize) return record.byteSize;
            if (record.arrayBuffer && record.arrayBuffer.byteLength) {
                return record.arrayBuffer.byteLength;
            }
            if (typeof record.stlData === 'string') {
                return new Blob([record.stlData]).size;
            }
            return 0;
        }

        function saveViewerPreferences() {
            try {
                const prefs = {
                    activeModelId,
                    color: viewerState.color,
                    metalness: viewerState.metalness,
                    roughness: viewerState.roughness,
                    wireframe: viewerState.wireframe,
                    flatShading: viewerState.flatShading,
                    autoRotate: viewerState.autoRotate,
                    showHelpers: viewerState.showHelpers
                };
                localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
            } catch (e) {
                // Ignore storage quota errors
            }
        }

        function loadViewerPreferences() {
            try {
                const raw = localStorage.getItem(STORAGE_PREFS_KEY);
                if (!raw) return null;
                return JSON.parse(raw);
            } catch (e) {
                return null;
            }
        }

        /**************************************************************************
         * 2. THREE.JS SCENE, CAMERA, RENDERER & ORBIT CONTROLS SETUP
         **************************************************************************/
        let scene, camera, renderer, controls, stlLoader;
        let currentMesh = null;
        let gridHelper = null, axesHelper = null;
        let activeModelId = EMBEDDED_STL_MODELS[0].id;
        let selectionRequest = 0;

        // Viewer state
        const viewerState = {
            color: '#38bdf8',
            metalness: 0.25,
            roughness: 0.35,
            wireframe: false,
            flatShading: true,
            autoRotate: false,
            showHelpers: true
        };

// Responsive UI: keep off-screen controls out of the focus order and let the
// canvas own touch gestures without disabling page zoom in the controls.
const compactLayout = window.matchMedia('(max-width: 1023px)');
const touchDevice = window.matchMedia('(any-pointer: coarse)').matches || navigator.maxTouchPoints > 0;
let drawerOpen = false;
let drawerTrigger = null;
let activeDialog = null;
let dialogTrigger = null;
let downloadFile = null;
let downloadURL = null;

function isViewerObscured() {
    return Boolean(activeDialog || (compactLayout.matches && drawerOpen));
}

function setInert(element, inert) {
    element.toggleAttribute('inert', inert);
    element.inert = inert;
}

function syncInteractionLayers() {
    const sidebar = document.getElementById('sidebar');
    const drawerVisible = compactLayout.matches && drawerOpen;
    document.body.classList.toggle('drawer-open', drawerVisible);
    document.getElementById('sidebarBackdrop').hidden = !drawerVisible;
    sidebar.setAttribute('aria-hidden', String(compactLayout.matches && !drawerOpen));
    setInert(sidebar, Boolean(activeDialog || (compactLayout.matches && !drawerOpen)));
    if (drawerVisible) {
        sidebar.setAttribute('role', 'dialog');
        sidebar.setAttribute('aria-modal', 'true');
        sidebar.setAttribute('aria-labelledby', 'sidebarTitle');
    } else {
        sidebar.removeAttribute('role');
        sidebar.removeAttribute('aria-modal');
        sidebar.removeAttribute('aria-labelledby');
    }
    for (const id of ['mobileHeader', 'mobileDock', 'viewportMain']) {
        setInert(document.getElementById(id), Boolean(activeDialog || drawerVisible));
    }
    document.querySelectorAll('[aria-controls="sidebar"]').forEach(button => {
        button.setAttribute('aria-expanded', String(drawerVisible));
    });
    if (controls) controls.enabled = !isViewerObscured();
    if (!isViewerObscured()) requestRender();
}

function setMobilePanel(open, section = 'modelsSection', trigger = null) {
    if (open && !compactLayout.matches) return;
    if (open) drawerTrigger = trigger || document.activeElement;
    drawerOpen = Boolean(open && compactLayout.matches);
    syncInteractionLayers();
    if (drawerOpen) {
        document.getElementById('closeSidebarBtn').focus({preventScroll: true});
        requestAnimationFrame(() => {
            const scroll = document.getElementById('sidebarScroll');
            const target = document.getElementById(section);
            scroll.scrollTop += target.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 16;
        });
    } else if (drawerTrigger && drawerTrigger.isConnected && compactLayout.matches && !activeDialog) {
        drawerTrigger.focus({preventScroll: true});
    }
}

function openDialog(id) {
    const origin = activeDialog ? dialogTrigger : document.activeElement;
    if (activeDialog) closeDialog(activeDialog, false);
    dialogTrigger = origin;
    activeDialog = id;
    const dialog = document.getElementById(id);
    dialog.classList.remove('hidden');
    syncInteractionLayers();
    // Focus the dialog, not a text field: the keyboard should open only on tap.
    dialog.focus({preventScroll: true});
}

function closeDialog(id, restoreFocus = true) {
    document.getElementById(id).classList.add('hidden');
    if (id === activeDialog) activeDialog = null;
    if (id === 'actionModal') pendingModalAction = null;
    if (id === 'downloadModal') {
        const previousURL = downloadURL;
        downloadFile = null; downloadURL = null;
        document.getElementById('saveFileLink').removeAttribute('href');
        // Allow time for Safari's download process to finish reading the blob.
        if (previousURL) setTimeout(() => URL.revokeObjectURL(previousURL), 60000);
    }
    syncInteractionLayers();
    if (restoreFocus && dialogTrigger && dialogTrigger.isConnected && !dialogTrigger.closest('[inert], [hidden], .hidden')) {
        dialogTrigger.focus({preventScroll: true});
    }
}

function saveBlob(blob, filename) {
    if (touchDevice || compactLayout.matches) {
        openDialog('downloadModal');
        downloadFile = new File([blob], filename, {type: blob.type});
        downloadURL = URL.createObjectURL(blob);
        const link = document.getElementById('saveFileLink');
        link.href = downloadURL;
        link.download = filename;
        document.getElementById('downloadFilename').textContent = filename;
        let canShare = false;
        try { canShare = Boolean(navigator.share && navigator.canShare && navigator.canShare({files: [downloadFile]})); } catch (_) { /* Download remains available. */ }
        document.getElementById('shareFileBtn').hidden = !canShare;
        return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function updateVisibleViewport() {
    const viewport = window.visualViewport;
    // Leave the browser's accessibility zoom alone.
    if (viewport && Math.abs(viewport.scale - 1) > .01) return;
    document.documentElement.style.setProperty('--app-height', `${viewport ? viewport.height : window.innerHeight}px`);
    document.documentElement.style.setProperty('--app-top', `${viewport ? viewport.offsetTop : 0}px`);
}

function setupMobileUI() {
    updateVisibleViewport();
    window.addEventListener('resize', updateVisibleViewport);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateVisibleViewport);
        window.visualViewport.addEventListener('scroll', updateVisibleViewport);
    }
    document.getElementById('mobileMenuBtn').addEventListener('click', event => setMobilePanel(true, 'modelsSection', event.currentTarget));
    document.querySelectorAll('[data-panel]').forEach(button => {
        button.addEventListener('click', () => setMobilePanel(true, button.dataset.panel, button));
    });
    document.getElementById('closeSidebarBtn').addEventListener('click', () => setMobilePanel(false));
    document.getElementById('sidebarBackdrop').addEventListener('click', () => setMobilePanel(false));
    const handleLayoutChange = () => {
        const previouslyInside = document.getElementById('sidebar').contains(document.activeElement);
        drawerOpen = false;
        syncInteractionLayers();
        if (compactLayout.matches && previouslyInside && !activeDialog) document.getElementById('mobileMenuBtn').focus({preventScroll: true});
        onWindowResize();
    };
    if (compactLayout.addEventListener) compactLayout.addEventListener('change', handleLayoutChange);
    else compactLayout.addListener(handleLayoutChange);
    for (const id of ['stlModal', 'actionModal', 'downloadModal']) {
        const dialog = document.getElementById(id);
        dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(id); });
    }
    document.addEventListener('keydown', event => {
        const root = activeDialog ? document.getElementById(activeDialog) : drawerOpen ? document.getElementById('sidebar') : null;
        if (!root) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            if (activeDialog) closeDialog(activeDialog); else setMobilePanel(false);
        }
        if (event.key !== 'Tab') return;
        const focusable = [...root.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
            .filter(el => !el.closest('[hidden], .hidden, [inert]') && el.getClientRects().length > 0);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (!first) { event.preventDefault(); root.focus(); return; }
        if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) {
            event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !focusable.includes(document.activeElement))) {
            event.preventDefault(); first.focus();
        }
    });
    document.getElementById('closeDownloadBtn').addEventListener('click', () => closeDialog('downloadModal'));
    document.getElementById('shareFileBtn').addEventListener('click', async () => {
        if (!downloadFile || !navigator.share) return;
        try { await navigator.share({files: [downloadFile]}); }
        catch (error) { if (error.name !== 'AbortError') showToast('Sharing is unavailable. Use Download file instead.', true); }
    });
    // Some phone file pickers do not recognise the STL extension as a file type.
    // Allow selection there and retain the existing extension and geometry checks.
    if (touchDevice) ['stlFileInput', 'modalFileEncoder'].forEach(id => document.getElementById(id).removeAttribute('accept'));
    document.querySelectorAll('#colorSwatches button').forEach(button => {
        button.setAttribute('aria-label', `Set model color to ${button.dataset.color}`);
    });
    document.getElementById('customColorPicker').setAttribute('aria-label', 'Custom model color');
    document.getElementById('metalnessSlider').setAttribute('aria-label', 'Metalness');
    document.getElementById('roughnessSlider').setAttribute('aria-label', 'Roughness');
    syncInteractionLayers();
}

function selectModelFromMenu(id) {
    if (compactLayout.matches) setMobilePanel(false);
    selectModelById(id);
}

function fitCameraToModel(view = 'current') {
    if (!currentMesh || !camera || !controls) return;
    const bounds = new THREE.Box3().setFromObject(currentMesh);
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
    if (view === 'iso') direction.set(1, .65, 1).normalize();
    else if (view === 'front') direction.set(0, 0, 1);
    else if (view === 'top') direction.set(0, 1, .001).normalize();
    else if (view === 'side') direction.set(1, 0, 0);
    const vertical = THREE.MathUtils.degToRad(camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    const height = document.getElementById('canvas-container').clientHeight;
    const clearance = compactLayout.matches ? (camera.aspect > 1.5 ? 100 : 150) : 100;
    const usableHeight = Math.max(.35, 1 - clearance / Math.max(1, height));
    const visibleVertical = 2 * Math.atan(Math.tan(vertical / 2) * usableHeight);
    const distance = Math.max(1, sphere.radius) / Math.sin(Math.min(visibleVertical, horizontal) / 2) * 1.12;
    controls.target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(direction, distance);
    controls.maxDistance = Math.max(500, distance * 6);
    camera.far = Math.max(2000, distance * 10);
    camera.updateProjectionMatrix();
    controls.update();
    requestRender();
}

        async function initThreeViewer() {
            const container = document.getElementById('canvas-container');
            const width = container.clientWidth;
            const height = container.clientHeight;

            // Restore saved preferences from localStorage if available
            const savedPrefs = loadViewerPreferences();
            if (savedPrefs) {
                if (savedPrefs.color) viewerState.color = savedPrefs.color;
                if (typeof savedPrefs.metalness === 'number') viewerState.metalness = savedPrefs.metalness;
                if (typeof savedPrefs.roughness === 'number') viewerState.roughness = savedPrefs.roughness;
                if (typeof savedPrefs.wireframe === 'boolean') viewerState.wireframe = savedPrefs.wireframe;
                if (typeof savedPrefs.flatShading === 'boolean') viewerState.flatShading = savedPrefs.flatShading;
                if (typeof savedPrefs.autoRotate === 'boolean') viewerState.autoRotate = savedPrefs.autoRotate;
                if (typeof savedPrefs.showHelpers === 'boolean') viewerState.showHelpers = savedPrefs.showHelpers;
                if (savedPrefs.activeModelId) activeModelId = savedPrefs.activeModelId;
            }

            // Scene
            scene = new THREE.Scene();

            // Camera
            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
            camera.position.set(45, 35, 45);

            // WebGL Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touchDevice ? 1.5 : 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);
            renderer.domElement.setAttribute('tabindex', '0');
            renderer.domElement.setAttribute('aria-label', '3D model. Drag to rotate, pinch to zoom, and drag with two fingers to pan.');
            renderer.domElement.addEventListener('webglcontextlost', event => {
                event.preventDefault();
                showToast('The 3D view was paused by your device. It will resume when graphics are available.', true);
            });
            renderer.domElement.addEventListener('webglcontextrestored', requestRender);

            // OrbitControls for interactive rotation, zoom & pan
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.addEventListener('change', requestRender);
            controls.dampingFactor = 0.06;
            controls.autoRotate = viewerState.autoRotate;
            controls.autoRotateSpeed = 1.6;
            controls.maxDistance = 500;
            controls.minDistance = 5;
            controls.touches.ONE = THREE.TOUCH.ROTATE;
            controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
            controls.enablePan = true;
            controls.screenSpacePanning = true;
            if (controls.listenToKeyEvents) controls.listenToKeyEvents(renderer.domElement);

            // Studio 3-Point Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
            keyLight.position.set(60, 100, 70);
            keyLight.castShadow = true;
            scene.add(keyLight);

            const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
            fillLight.position.set(-60, 40, -50);
            scene.add(fillLight);

            const rimLight = new THREE.DirectionalLight(0x818cf8, 0.35);
            rimLight.position.set(0, -60, 40);
            scene.add(rimLight);

            // Ground Grid & Axes Helpers
            gridHelper = new THREE.GridHelper(100, 20, 0x38bdf8, 0x1e293b);
            gridHelper.position.y = 0;
            gridHelper.visible = viewerState.showHelpers;
            scene.add(gridHelper);

            axesHelper = new THREE.AxesHelper(25);
            axesHelper.position.set(-48, 0.05, -48);
            axesHelper.visible = viewerState.showHelpers;
            scene.add(axesHelper);

            // Initialize STLLoader
            stlLoader = new THREE.STLLoader();

            // Sync UI controls with restored viewerState
            syncControlButtonsWithState();

            // Load persisted models from IndexedDB
            await loadAllModelsFromIndexedDB();
            renderModelMenu();

            // Restore last viewed model (either in IndexedDB or Built-in)
            const existsInSaved = savedBrowserModels.some(m => m.id === activeModelId);
            const existsInBuiltIn = EMBEDDED_STL_MODELS.some(m => m.id === activeModelId);
            if (existsInSaved || existsInBuiltIn) {
                selectModelById(activeModelId, Boolean(savedPrefs && savedPrefs.color));
            } else {
                selectModelById(EMBEDDED_STL_MODELS[0].id, false);
            }

            // Responsive Resize Handler
            window.addEventListener('resize', onWindowResize);
            if (typeof ResizeObserver !== 'undefined') {
                const resizeObserver = new ResizeObserver(onWindowResize);
                resizeObserver.observe(container);
            }
            if (window.visualViewport) window.visualViewport.addEventListener('resize', onWindowResize);

            document.addEventListener('visibilitychange', () => {
                if (document.hidden && renderFrame !== null) {
                    cancelAnimationFrame(renderFrame); renderFrame = null;
                } else requestRender();
            });
            requestRender();
        }

        /**************************************************************************
         * 3. PARSING & DISPLAYING EMBEDDED OR UPLOADED STL GEOMETRY
         **************************************************************************/
        function base64ToArrayBuffer(base64) {
            const cleaned = base64.replace(/^data:.*;base64,/, '').trim();
            const binaryString = window.atob(cleaned);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }

        function arrayBufferToBase64(buffer) {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            const chunkSize = 0x8000;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
            }
            return window.btoa(binary);
        }

        function loadSTLGeometryIntoScene(geometry, meta) {
            // Remove existing mesh cleanly
            if (currentMesh) {
                scene.remove(currentMesh);
                currentMesh.geometry.dispose();
                currentMesh.material.dispose();
                currentMesh = null;
            }

            // Ensure vertex normals exist
            geometry.computeVertexNormals();

            // Record original STL axes before changing orientation for display only.
            geometry.computeBoundingBox();
            const originalSize = new THREE.Vector3();
            geometry.boundingBox.getSize(originalSize);

            // Rotate standard Z-up CAD STL orientation to Three.js Y-up coordinate space
            geometry.rotateX(-Math.PI / 2);

            // Compute bounding box & center geometry
            geometry.computeBoundingBox();
            const box = geometry.boundingBox;
            const size = new THREE.Vector3();
            box.getSize(size);

            // Center X and Z at 0, and place bottom of model right on top of the Y=0 ground grid
            const center = new THREE.Vector3();
            box.getCenter(center);
            geometry.translate(-center.x, -box.min.y, -center.z);

            // Normalize scale for viewing while preserving true dimensions for telemetry
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const targetSize = 32;
            const scaleFactor = targetSize / maxDim;

            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(viewerState.color),
                metalness: viewerState.metalness,
                roughness: viewerState.roughness,
                wireframe: viewerState.wireframe,
                flatShading: viewerState.flatShading,
                side: THREE.DoubleSide
            });

            currentMesh = new THREE.Mesh(geometry, material);
            currentMesh.scale.setScalar(scaleFactor);
            currentMesh.castShadow = true;
            currentMesh.receiveShadow = true;
            scene.add(currentMesh);

            // Focus camera smoothly on center of scaled model
            const scaledHeight = (size.y * scaleFactor) / 2;
            controls.target.set(0, scaledHeight, 0);
            fitCameraToModel('iso');

            // Update Telemetry UI
            const vertexCount = geometry.attributes.position ? geometry.attributes.position.count : 0;
            const triangleCount = Math.floor(vertexCount / 3);

            document.getElementById('statModelName').textContent = meta.name;
            document.getElementById('statTriangles').textContent = triangleCount.toLocaleString();
            document.getElementById('statVertices').textContent = vertexCount.toLocaleString();
            document.getElementById('statDimensions').textContent =
                `${originalSize.x.toFixed(1)} × ${originalSize.y.toFixed(1)} × ${originalSize.z.toFixed(1)} mm`;

            document.getElementById('hudModelTitle').textContent = meta.name;
            document.getElementById('hudModelDesc').textContent = meta.description || 'Interactive 3D STL Mesh';
        }

        function findModelById(modelId) {
            const saved = savedBrowserModels.find(m => m.id === modelId);
            if (saved) return { model: saved, isSaved: true };
            const builtin = EMBEDDED_STL_MODELS.find(m => m.id === modelId);
            if (builtin) return { model: builtin, isSaved: false };
            return null;
        }

        async function selectModelById(modelId, keepCurrentColor = false) {
            const found = findModelById(modelId);
            if (!found) return;
            if (pendingOriginalSTL) { pendingOriginalSTL.cancel(); pendingOriginalSTL = null; }
            const request = ++selectionRequest;
            if (modelId === activeModelId && currentMesh) {
                document.getElementById('modelLoadingStatus').classList.add('hidden'); return;
            }
            const {model: modelEntry, isSaved} = found;
            const status = document.getElementById('modelLoadingStatus');
            status.textContent = 'Loading ' + modelEntry.name + '…';
            status.classList.remove('hidden');
            try {
                await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
                if (request !== selectionRequest) return;
                let source;
                if (modelEntry.format === 'original-stl-lossless') {
                    const task = originalSTLTask(modelEntry);
                    pendingOriginalSTL = task;
                    source = await task.promise;
                    if (request !== selectionRequest) return;
                    pendingOriginalSTL = null;
                } else if (modelEntry.arrayBuffer) source = modelEntry.arrayBuffer;
                else if (modelEntry.format === 'base64') source = base64ToArrayBuffer(modelEntry.stlData);
                else source = modelEntry.stlData;
                // Use the same STLLoader and unindexed faces as the reference HTML.
                const geometry = stlLoader.parse(source);
                if (!geometry.attributes.position || !geometry.attributes.position.count) {
                    geometry.dispose(); throw new Error('This file contains no STL triangles.');
                }
                activeModelId = modelId;
                setMaterialColor(!keepCurrentColor && modelEntry.color ? modelEntry.color : viewerState.color);
                loadSTLGeometryIntoScene(geometry, {name: modelEntry.name, description: modelEntry.description});
                renderModelMenu();
                saveViewerPreferences();
                requestRender();
            } catch (error) {
                if (request === selectionRequest && error.name !== 'AbortError') showToast('Unable to load model: ' + error.message, true);
            } finally {
                if (request === selectionRequest) { pendingOriginalSTL = null; status.classList.add('hidden'); }
            }
        }

        /**************************************************************************
         * 4. UI RENDERING, MODEL MANAGEMENT & INTERACTIVE EVENT LISTENERS
         **************************************************************************/
        function escapeHTML(value) {
            return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        }

        function renderModelMenu() {
            // 1. Render Built-in Models
            const builtinContainer = document.getElementById('modelListContainer');
            const query = document.getElementById('modelSearch').value.trim().toLowerCase();
            const category = document.getElementById('modelCategory').value;
            const visibleModels = EMBEDDED_STL_MODELS.filter(model =>
                (!category || model.category === category) &&
                (!query || [model.name, model.filename, model.category].join(' ').toLowerCase().includes(query)));
            document.getElementById('modelCountBadge').textContent = `${visibleModels.length} / ${EMBEDDED_STL_MODELS.length}`;
            builtinContainer.innerHTML = '';

            visibleModels.forEach(model => {
                const isSelected = model.id === activeModelId;
                const btn = document.createElement('button');
                btn.dataset.modelId = model.id;
                btn.title = model.filename || model.name;
                btn.setAttribute('aria-pressed', String(isSelected));
                btn.className = `w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between group ${
                    isSelected
                        ? 'bg-sky-500/15 border-sky-500/60 text-white shadow-sm'
                        : 'bg-slate-800/40 hover:bg-slate-800/90 border-slate-800 text-slate-300'
                }`;
                btn.innerHTML = `
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                        }">
                            <i class="fa-solid ${model.icon || 'fa-cube'} text-sm"></i>
                        </div>
                        <div class="truncate">
                            <div class="text-xs font-semibold truncate">${escapeHTML(model.name)}</div>
                            <div class="text-[11px] text-slate-400 truncate">${escapeHTML(model.description || "")}</div>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right text-[10px] ${
                        isSelected ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-400'
                    }"></i>
                `;
                btn.addEventListener('click', () => selectModelFromMenu(model.id));
                builtinContainer.appendChild(btn);
            });

            if (!visibleModels.length) {
                const empty = document.createElement('p');
                empty.className = 'text-xs text-slate-400 py-4 text-center';
                empty.textContent = 'No models match. Try another name or category.';
                builtinContainer.appendChild(empty);
            }

            // 2. Render IndexedDB Saved Models
            const savedContainer = document.getElementById('savedModelListContainer');
            const statsBadge = document.getElementById('idbStatsBadge');
            const clearAllBtn = document.getElementById('clearAllSavedBtn');
            savedContainer.innerHTML = '';

            const totalBytes = savedBrowserModels.reduce((acc, item) => acc + calculateRecordByteSize(item), 0);
            statsBadge.textContent = `${savedBrowserModels.length} (${formatByteSize(totalBytes)})`;

            if (savedBrowserModels.length === 0) {
                clearAllBtn.classList.add('hidden');
                savedContainer.innerHTML = `
                    <div class="text-center py-3 px-2 rounded-lg border border-dashed border-slate-800 text-[11px] text-slate-400">
                        No custom STL files saved yet.<br>
                        <span class="text-slate-500">Upload or drag & drop <code class="mono">.stl</code> files to store them in your browser.</span>
                    </div>
                `;
                return;
            }

            clearAllBtn.classList.remove('hidden');

            savedBrowserModels.forEach(model => {
                const isSelected = model.id === activeModelId;
                const sizeLabel = formatByteSize(calculateRecordByteSize(model));
                const card = document.createElement('div');
                card.className = `w-full p-2 rounded-xl border transition flex items-center justify-between gap-1 group ${
                    isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800/90 text-slate-300'
                }`;

                const selectArea = document.createElement('button');
                selectArea.className = 'flex items-center gap-2.5 min-w-0 flex-1 text-left';
                selectArea.innerHTML = `
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-emerald-400'
                    }">
                        <i class="fa-solid fa-floppy-disk text-xs"></i>
                    </div>
                    <div class="truncate">
                        <div class="text-xs font-semibold truncate">${escapeHTML(model.name)}</div>
                        <div class="text-[10px] text-slate-400 truncate mono">${sizeLabel} • Saved in DB</div>
                    </div>
                `;
                selectArea.addEventListener('click', () => selectModelFromMenu(model.id));

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'flex items-center gap-1 shrink-0';

                // Rename Button
                const renameBtn = document.createElement('button');
                renameBtn.className = 'w-6 h-6 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-sky-300 flex items-center justify-center transition';
                renameBtn.title = 'Rename saved model';
                renameBtn.setAttribute('aria-label', 'Rename ' + model.name);
                renameBtn.innerHTML = '<i class="fa-solid fa-pen text-[10px]"></i>';
                renameBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openRenameModal(model);
                });

                // Delete Button
                const delBtn = document.createElement('button');
                delBtn.className = 'w-6 h-6 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition';
                delBtn.title = 'Delete from browser storage';
                delBtn.setAttribute('aria-label', 'Delete ' + model.name);
                delBtn.innerHTML = '<i class="fa-solid fa-trash-can text-[11px]"></i>';
                delBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await deleteModelFromIndexedDB(model.id);
                    if (activeModelId === model.id) {
                        const fallbackId = savedBrowserModels[0]?.id || EMBEDDED_STL_MODELS[0].id;
                        selectModelById(fallbackId);
                    } else {
                        renderModelMenu();
                    }
                    showToast(`Removed "${model.name}" from browser storage.`);
                });

                actionsDiv.appendChild(renameBtn);
                actionsDiv.appendChild(delBtn);
                card.appendChild(selectArea);
                card.appendChild(actionsDiv);
                savedContainer.appendChild(card);
            });
        }

        // Modal helper for Renaming or Confirming Clear All
        let pendingModalAction = null;
        function openRenameModal(model) {
            const modal = document.getElementById('actionModal');
            document.getElementById('actionModalTitle').textContent = 'Rename Saved STL Model';
            document.getElementById('actionModalMessage').textContent = 'Enter a new display name for this model:';
            const input = document.getElementById('actionModalInput');
            input.classList.remove('hidden');
            input.value = model.name;
            const confirmBtn = document.getElementById('confirmActionModalBtn');
            confirmBtn.textContent = 'Save Name';
            confirmBtn.className = 'px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition';

            pendingModalAction = async () => {
                const newName = input.value.trim();
                if (!newName) return;
                model.name = newName;
                await saveModelToIndexedDB(model);
                if (activeModelId === model.id) {
                    document.getElementById('statModelName').textContent = newName;
                    document.getElementById('hudModelTitle').textContent = newName;
                }
                renderModelMenu();
                showToast(`Renamed model to "${newName}"`);
            };
            openDialog('actionModal');
            if (!touchDevice) input.focus();
        }

        function openClearAllConfirmModal() {
            const modal = document.getElementById('actionModal');
            document.getElementById('actionModalTitle').textContent = 'Clear All Saved Models?';
            document.getElementById('actionModalMessage').textContent =
                `This will permanently remove all ${savedBrowserModels.length} custom STL model(s) stored in your browser's IndexedDB. Built-in models will remain.`;
            const input = document.getElementById('actionModalInput');
            input.classList.add('hidden');
            const confirmBtn = document.getElementById('confirmActionModalBtn');
            confirmBtn.textContent = 'Delete All Saved';
            confirmBtn.className = 'px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition';

            pendingModalAction = async () => {
                await clearAllModelsFromIndexedDB();
                selectModelById(EMBEDDED_STL_MODELS[0].id);
                renderModelMenu();
                showToast('Cleared all saved models from IndexedDB.');
            };
            openDialog('actionModal');
        }

        function syncControlButtonsWithState() {
            requestRender();
            document.getElementById('customColorPicker').value = viewerState.color;
            document.getElementById('colorHexLabel').textContent = viewerState.color.toUpperCase();
            document.getElementById('metalnessSlider').value = viewerState.metalness;
            document.getElementById('metalnessVal').textContent = viewerState.metalness.toFixed(2);
            document.getElementById('roughnessSlider').value = viewerState.roughness;
            document.getElementById('roughnessVal').textContent = viewerState.roughness.toFixed(2);

            const wireBtn = document.getElementById('toggleWireframeBtn');
            wireBtn.querySelector('span').textContent = `Wireframe: ${viewerState.wireframe ? 'On' : 'Off'}`;
            wireBtn.className = viewerState.wireframe
                ? 'py-2 px-3 rounded-xl bg-sky-500/15 border border-sky-500/40 text-xs font-medium text-sky-300 flex items-center justify-center gap-2 transition'
                : 'py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition';

            const shadeBtn = document.getElementById('toggleShadingBtn');
            shadeBtn.querySelector('span').textContent = viewerState.flatShading ? 'Flat Shading' : 'Smooth Shading';

            const rotBtn = document.getElementById('toggleAutoRotateBtn');
            const rotIcon = rotBtn.querySelector('i');
            if (viewerState.autoRotate) {
                rotIcon.classList.add('fa-spin');
                rotBtn.className = 'py-2 px-3 rounded-xl bg-sky-500/15 border border-sky-500/40 text-xs font-medium text-sky-300 flex items-center justify-center gap-2 transition';
            } else {
                rotIcon.classList.remove('fa-spin');
                rotBtn.className = 'py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition';
            }

            const gridBtn = document.getElementById('toggleGridBtn');
            gridBtn.className = viewerState.showHelpers
                ? 'py-2 px-3 rounded-xl bg-sky-500/15 border border-sky-500/40 text-xs font-medium text-sky-300 flex items-center justify-center gap-2 transition'
                : 'py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition';
        }

        function setMaterialColor(hexColor) {
            requestRender();
            viewerState.color = hexColor;
            document.getElementById('customColorPicker').value = hexColor;
            document.getElementById('colorHexLabel').textContent = hexColor.toUpperCase();
            if (currentMesh && currentMesh.material) {
                currentMesh.material.color.set(hexColor);
            }
            document.querySelectorAll('#colorSwatches button').forEach(btn => {
                if (btn.dataset.color.toLowerCase() === hexColor.toLowerCase()) {
                    btn.classList.add('ring-2', 'ring-offset-2', 'ring-offset-slate-900', 'ring-sky-400');
                } else {
                    btn.classList.remove('ring-2', 'ring-offset-2', 'ring-offset-slate-900', 'ring-sky-400');
                }
            });
            saveViewerPreferences();
        }

        let toastTimer;
        function showToast(msg, isError = false) {
            const toast = document.getElementById('toastBanner');
            const msgSpan = document.getElementById('toastMessage');
            msgSpan.textContent = msg;
            toast.className = `fixed bottom-6 right-6 z-50 bg-slate-900 border ${
                isError ? 'border-rose-500/60' : 'border-sky-500/50'
            } text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs`;
            toast.classList.remove('hidden');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.add('hidden'), isError ? 6500 : 3600);
        }

        // Process one or multiple uploaded STL files and save them into IndexedDB
        async function processAndSaveUploadedFiles(fileList) {
            const files = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.stl'));
            if (files.length === 0) {
                showToast('Please select valid .STL files.', true);
                return;
            }

            let lastSavedId = null;
            let successCount = 0;

            for (const file of files) {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    // Validate that Three.STLLoader can parse it before saving
                    const testGeom = stlLoader.parse(arrayBuffer.slice(0));
                    testGeom.dispose();

                    const customId = 'idb_stl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
                    const cleanName = file.name.replace(/\.stl$/i, '');

                    const record = {
                        id: customId,
                        name: cleanName,
                        description: 'Saved in Browser (IndexedDB)',
                        icon: 'fa-floppy-disk',
                        color: viewerState.color,
                        format: 'binary_buffer',
                        arrayBuffer: arrayBuffer,
                        byteSize: arrayBuffer.byteLength,
                        createdAt: Date.now()
                    };

                    await saveModelToIndexedDB(record);
                    lastSavedId = customId;
                    successCount++;
                } catch (err) {
                    showToast(`Failed to parse "${file.name}": ${err.message}`, true);
                }
            }

            if (lastSavedId) {
                if (compactLayout.matches) setMobilePanel(false);
                selectModelById(lastSavedId, true);
                showToast(
                    successCount === 1
                        ? `Saved STL model to browser IndexedDB!`
                        : `Saved ${successCount} STL models to browser IndexedDB!`
                );
            }
        }

        // Export Full Standalone HTML File with all Built-in + IndexedDB models baked into EMBEDDED_STL_MODELS
async function exportStandaloneHTMLWithAllModels() {
    const buttons = ['exportStandaloneHtmlBtn', 'quickExportHtmlBtn'].map(id => document.getElementById(id));
    buttons.forEach(button => button.disabled = true);
    try {
        showToast('Preparing portable HTML…');
        const merged = new Map(EMBEDDED_STL_MODELS.map(model => [model.id, model]));
        savedBrowserModels.forEach(model => {
            const {arrayBuffer, ...record} = model;
            if (arrayBuffer) { record.format = 'base64'; record.stlData = arrayBufferToBase64(arrayBuffer); }
            record.category = record.category || 'Imported';
            merged.set(record.id, record);
        });
        const clone = document.documentElement.cloneNode(true);
        clone.querySelector('#embeddedStlModels').textContent = JSON.stringify([...merged.values()]).replace(/</g, '\\u003c');
        // Inline the model data so the exported HTML does not depend on this folder.
        for (const model of merged.values()) {
            if (model.format !== 'original-stl-lossless') continue;
            let node = clone.querySelector('#' + model.dataId);
            if (!node) {
                node = document.createElement('script'); node.id = model.dataId;
                node.type = 'application/octet-stream'; clone.querySelector('body').appendChild(node);
            }
            node.textContent = await getEncodedModel(model);
        }
        const localStyle = clone.querySelector('#localViewerStyles');
        if (localStyle) {
            const style = document.createElement('style'); style.textContent = VIEWER_LOCAL_CSS;
            localStyle.replaceWith(style);
        }
        const inflater = clone.querySelector('#inflaterLibrary');
        if (inflater) { inflater.removeAttribute('src'); inflater.textContent = VIEWER_INFLATE_SOURCE; }
        clone.querySelectorAll('[inert]').forEach(element => element.removeAttribute('inert'));
        clone.querySelector('body').classList.remove('drawer-open');
        clone.querySelector('#sidebarBackdrop').setAttribute('hidden', '');
        clone.querySelectorAll('[aria-controls="sidebar"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
        clone.querySelector('#saveFileLink').removeAttribute('href');
        const previousBoot = clone.querySelector('#viewerBootstrap');
        if (previousBoot) previousBoot.remove();
        const boot = document.createElement('script'); boot.id = 'viewerBootstrap';
        boot.textContent = 'window.CAFE_VIEWER_BOOTSTRAP = ' + window.CAFE_VIEWER_BOOTSTRAP.toString() + ';window.CAFE_VIEWER_BOOTSTRAP();';
        clone.querySelector('body').appendChild(boot);
        clone.querySelector('#canvas-container').replaceChildren();
        ['stlModal','actionModal','downloadModal','dropOverlay','toastBanner','modelLoadingStatus','dependencyError'].forEach(id => clone.querySelector('#' + id).classList.add('hidden'));
        clone.querySelector('#customStlTextarea').textContent = '';
        clone.querySelector('#customStlTextarea').value = '';
        clone.querySelector('#modelSearch').setAttribute('value', '');
        ['exportStandaloneHtmlBtn','quickExportHtmlBtn'].forEach(id => clone.querySelector('#'+id).removeAttribute('disabled'));
        saveBlob(new Blob(['<!DOCTYPE html>\n'+clone.outerHTML], {type:'text/html;charset=utf-8'}), 'cafe_stl_viewer_' + merged.size + '_models.html');
        if (!touchDevice && !compactLayout.matches) showToast('Portable HTML exported with ' + merged.size + ' models.');
    } catch(error) { showToast('Export failed: ' + error.message, true); }
    finally { buttons.forEach(button => button.disabled = false); }
}


        function setupUIListeners() {
            document.getElementById('downloadStlBtn').addEventListener('click', downloadCurrentSTL);
            document.getElementById('modelSearch').addEventListener('input', renderModelMenu);
            document.getElementById('modelCategory').addEventListener('change', renderModelMenu);
            // Color Swatches
            document.querySelectorAll('#colorSwatches button').forEach(btn => {
                btn.addEventListener('click', () => setMaterialColor(btn.dataset.color));
            });

            // Custom Color Picker
            document.getElementById('customColorPicker').addEventListener('input', (e) => {
                setMaterialColor(e.target.value);
            });

            // Metalness & Roughness Sliders
            document.getElementById('metalnessSlider').addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                viewerState.metalness = val;
                document.getElementById('metalnessVal').textContent = val.toFixed(2);
                if (currentMesh) currentMesh.material.metalness = val;
                requestRender();
                saveViewerPreferences();
            });

            document.getElementById('roughnessSlider').addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                viewerState.roughness = val;
                document.getElementById('roughnessVal').textContent = val.toFixed(2);
                if (currentMesh) currentMesh.material.roughness = val;
                requestRender();
                saveViewerPreferences();
            });

            // Wireframe Toggle
            const wireBtn = document.getElementById('toggleWireframeBtn');
            wireBtn.addEventListener('click', () => {
                viewerState.wireframe = !viewerState.wireframe;
                if (currentMesh) currentMesh.material.wireframe = viewerState.wireframe;
                syncControlButtonsWithState();
                saveViewerPreferences();
            });

            // Flat vs Smooth Shading Toggle
            const shadeBtn = document.getElementById('toggleShadingBtn');
            shadeBtn.addEventListener('click', () => {
                viewerState.flatShading = !viewerState.flatShading;
                if (currentMesh) {
                    currentMesh.material.flatShading = viewerState.flatShading;
                    currentMesh.material.needsUpdate = true;
                }
                syncControlButtonsWithState();
                saveViewerPreferences();
            });

            // Auto-Rotate Toggle
            const rotBtn = document.getElementById('toggleAutoRotateBtn');
            rotBtn.addEventListener('click', () => {
                viewerState.autoRotate = !viewerState.autoRotate;
                controls.autoRotate = viewerState.autoRotate;
                syncControlButtonsWithState();
                saveViewerPreferences();
            });

            // Grid & Axes Toggle
            const gridBtn = document.getElementById('toggleGridBtn');
            gridBtn.addEventListener('click', () => {
                viewerState.showHelpers = !viewerState.showHelpers;
                gridHelper.visible = viewerState.showHelpers;
                axesHelper.visible = viewerState.showHelpers;
                syncControlButtonsWithState();
                saveViewerPreferences();
            });

            // Camera View Presets & Reset
            function setCameraPreset(view) { fitCameraToModel(view); }

            document.querySelectorAll('.cam-view-btn').forEach(btn => {
                btn.addEventListener('click', () => setCameraPreset(btn.dataset.view));
            });

            document.getElementById('resetCameraBtn').addEventListener('click', () => setCameraPreset('iso'));

            // Direct Local .STL File Upload (Supports Multiple Files -> IndexedDB)
            document.getElementById('stlFileInput').addEventListener('change', async (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    await processAndSaveUploadedFiles(e.target.files);
                }
                e.target.value = '';
            });

            // Drag & Drop .STL Files Anywhere on Viewport
            const dropOverlay = document.getElementById('dropOverlay');
            window.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropOverlay.classList.remove('hidden');
            });
            window.addEventListener('dragleave', (e) => {
                if (e.relatedTarget === null) {
                    dropOverlay.classList.add('hidden');
                }
            });
            window.addEventListener('drop', async (e) => {
                e.preventDefault();
                dropOverlay.classList.add('hidden');
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    await processAndSaveUploadedFiles(e.dataTransfer.files);
                }
            });

            // Clear All Saved IndexedDB Models Button
            document.getElementById('clearAllSavedBtn').addEventListener('click', () => {
                openClearAllConfirmModal();
            });

            // Action Modal Listeners (Rename / Clear All Confirmation)
            const actionModal = document.getElementById('actionModal');
            const closeActionModal = () => {
                closeDialog('actionModal');
            };
            document.getElementById('closeActionModalBtn').addEventListener('click', closeActionModal);
            document.getElementById('cancelActionModalBtn').addEventListener('click', closeActionModal);
            document.getElementById('confirmActionModalBtn').addEventListener('click', async () => {
                if (pendingModalAction) await pendingModalAction();
                closeActionModal();
            });

            // Standalone HTML Export Buttons
            document.getElementById('exportStandaloneHtmlBtn').addEventListener('click', exportStandaloneHTMLWithAllModels);
            document.getElementById('quickExportHtmlBtn').addEventListener('click', exportStandaloneHTMLWithAllModels);

            // Embed / Paste Modal Open/Close
            const modal = document.getElementById('stlModal');
            const openModal = () => {
                document.getElementById('customModelName').value = 'Custom STL';
                document.getElementById('customStlTextarea').value = '';
                openDialog('stlModal');
            };
            document.getElementById('openCodeModalBtn').addEventListener('click', openModal);
            document.getElementById('pasteStlBtn').addEventListener('click', openModal);
            document.getElementById('closeModalBtn').addEventListener('click', () => closeDialog('stlModal'));
            document.getElementById('cancelModalBtn').addEventListener('click', () => closeDialog('stlModal'));

            // Encode .STL file inside Modal to Base64 string for embedding
            document.getElementById('modalFileEncoder').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (!file.name.toLowerCase().endsWith('.stl')) { showToast('Please select an .STL file.', true); e.target.value = ''; return; }
                document.getElementById('customModelName').value = file.name.replace(/\.stl$/i, '');
                const reader = new FileReader();
                reader.onload = function (evt) {
                    document.getElementById('customStlTextarea').value = arrayBufferToBase64(evt.target.result);
                    showToast('Converted STL file to Base64 string ready for HTML embedding or saving!');
                };
                reader.readAsArrayBuffer(file);
            });

            // Copy Ready-to-Paste JS Object Snippet
            document.getElementById('copySnippetBtn').addEventListener('click', () => {
                const name = document.getElementById('customModelName').value.trim() || 'Custom Model';
                const rawData = document.getElementById('customStlTextarea').value.trim();
                const isAscii = rawData.toLowerCase().startsWith('solid');
                const snippet = `{\n  id: 'model_${Date.now()}',\n  name: '${name.replace(/'/g, "\\'")}',\n  description: 'Embedded STL Model',\n  icon: 'fa-cube',\n  color: '#38bdf8',\n  format: '${isAscii ? 'ascii' : 'base64'}',\n  stlData: \`${rawData}\`\n},`;

                const tempInput = document.createElement('textarea');
                tempInput.value = snippet;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                showToast('Copied JavaScript snippet! Paste it inside EMBEDDED_STL_MODELS.');
            });

            // Save Custom Pasted STL from Modal into IndexedDB & View
            document.getElementById('loadCustomStlBtn').addEventListener('click', async () => {
                const name = document.getElementById('customModelName').value.trim() || 'Custom STL';
                const rawData = document.getElementById('customStlTextarea').value.trim();
                if (!rawData) {
                    showToast('Please paste ASCII STL or Base64 STL data first.', true);
                    return;
                }
                const isAscii = rawData.toLowerCase().startsWith('solid');
                const newId = 'idb_stl_' + Date.now();
                const record = {
                    id: newId,
                    name: name,
                    description: isAscii ? 'Saved ASCII STL' : 'Saved Base64 STL',
                    icon: 'fa-floppy-disk',
                    color: viewerState.color,
                    format: isAscii ? 'ascii' : 'base64',
                    stlData: rawData,
                    byteSize: new Blob([rawData]).size,
                    createdAt: Date.now()
                };

                try {
                    await saveModelToIndexedDB(record);
                    closeDialog('stlModal');
                    if (compactLayout.matches) setMobilePanel(false);
                    selectModelById(newId, true);
                    showToast(`Saved "${name}" to IndexedDB and loaded in 3D viewer!`);
                } catch (err) {
                    showToast('Failed to save model: ' + err.message, true);
                }
            });
        }

        function onWindowResize() {
            const container = document.getElementById('canvas-container');
            if (!container || !renderer || !camera) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width <= 0 || height <= 0) return;
            const aspectChanged = Math.abs(camera.aspect - width / height) > 0.01;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            if (aspectChanged && currentMesh) fitCameraToModel();
            requestRender();
        }

        function animate() {
            renderFrame = null;
            if (document.hidden || isViewerObscured()) return;
            if (controls) controls.update();
            if (renderer && scene && camera) renderer.render(scene, camera);
            if (controls && controls.autoRotate) requestRender();
        }

        window.onload = async function () {
            setupMobileUI();
            if (!window.THREE || !THREE.OrbitControls || !THREE.STLLoader) {
                const error = document.getElementById('dependencyError');
                error.classList.remove('hidden');
                error.style.cssText = 'display:block;position:fixed;inset:24px;z-index:100;background:#0f172a;color:white;padding:24px;border:1px solid #f43f5e;border-radius:12px;font:16px sans-serif';
                return;
            }
            try {
                setupUIListeners();
                await initThreeViewer();
            } catch (err) {
                showToast('Unable to start 3D viewer: ' + err.message, true);
            }
        };

};
window.CAFE_VIEWER_BOOTSTRAP();
