window.CAFE_VIEWER_BOOTSTRAP = function startCafeViewer() {
"use strict";
const VIEWER_LOCAL_CSS = "body {\n            font-family: 'Inter', sans-serif;\n            overflow: hidden;\n            user-select: none;\n            background-color: #0f172a;\n            color: #f8fafc;\n        }\n        .mono {\n            font-family: 'JetBrains Mono', monospace;\n        }\n        /* Custom Scrollbar */\n        ::-webkit-scrollbar {\n            width: 6px;\n            height: 6px;\n        }\n        ::-webkit-scrollbar-track {\n            background: #1e293b;\n        }\n        ::-webkit-scrollbar-thumb {\n            background: #475569;\n            border-radius: 9999px;\n        }\n        ::-webkit-scrollbar-thumb:hover {\n            background: #64748b;\n        }\n        /* Range Input Styling */\n        input[type=range] {\n            -webkit-appearance: none;\n            background: transparent;\n        }\n        input[type=range]::-webkit-slider-runnable-track {\n            height: 6px;\n            border-radius: 3px;\n            background: #334155;\n        }\n        input[type=range]::-webkit-slider-thumb {\n            -webkit-appearance: none;\n            height: 16px;\n            width: 16px;\n            border-radius: 50%;\n            background: #38bdf8;\n            margin-top: -5px;\n            cursor: pointer;\n            box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);\n            transition: transform 0.15s ease;\n        }\n        input[type=range]::-webkit-slider-thumb:hover {\n            transform: scale(1.15);\n        }\n        #canvas-container canvas {\n            display: block;\n            width: 100% !important;\n            height: 100% !important;\n            outline: none;\n        }\n";
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
    if (typeof DecompressionStream === 'undefined') throw new Error('Please use a current Chrome, Edge, Firefox, or Opera browser.');
    const binary = atob(encoded.trim());
    const compressed = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) compressed[i] = binary.charCodeAt(i);
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    const archive = await new Response(stream).arrayBuffer();
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
                    const source = 'const decompressOriginalSTL = ' + decompressOriginalSTL.toString() + `;
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
        const url = URL.createObjectURL(new Blob([bytes], {type: 'application/octet-stream'}));
        const link = document.createElement('a');
        link.href = url;
        link.download = model.filename || model.name + '.stl';
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) { showToast('STL download failed: ' + error.message, true); }
    finally { button.disabled = false; }
}

let renderFrame = null;
function requestRender() {
    if (renderFrame === null && !document.hidden) renderFrame = requestAnimationFrame(animate);
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
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);

            // OrbitControls for interactive rotation, zoom & pan
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.addEventListener('change', requestRender);
            controls.dampingFactor = 0.06;
            controls.autoRotate = viewerState.autoRotate;
            controls.autoRotateSpeed = 1.6;
            controls.maxDistance = 500;
            controls.minDistance = 5;

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
            controls.update();

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
                btn.addEventListener('click', () => selectModelById(model.id));
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
                selectArea.addEventListener('click', () => selectModelById(model.id));

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'flex items-center gap-1 shrink-0';

                // Rename Button
                const renameBtn = document.createElement('button');
                renameBtn.className = 'w-6 h-6 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-sky-300 flex items-center justify-center transition';
                renameBtn.title = 'Rename saved model';
                renameBtn.innerHTML = '<i class="fa-solid fa-pen text-[10px]"></i>';
                renameBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openRenameModal(model);
                });

                // Delete Button
                const delBtn = document.createElement('button');
                delBtn.className = 'w-6 h-6 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition';
                delBtn.title = 'Delete from browser storage';
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
            modal.classList.remove('hidden');
            input.focus();
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
            modal.classList.remove('hidden');
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

        function showToast(msg, isError = false) {
            const toast = document.getElementById('toastBanner');
            const msgSpan = document.getElementById('toastMessage');
            msgSpan.textContent = msg;
            toast.className = `fixed bottom-6 right-6 z-50 bg-slate-900 border ${
                isError ? 'border-rose-500/60' : 'border-sky-500/50'
            } text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs`;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3600);
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
        const previousBoot = clone.querySelector('#viewerBootstrap');
        if (previousBoot) previousBoot.remove();
        const boot = document.createElement('script'); boot.id = 'viewerBootstrap';
        boot.textContent = 'window.CAFE_VIEWER_BOOTSTRAP = ' + window.CAFE_VIEWER_BOOTSTRAP.toString() + ';window.CAFE_VIEWER_BOOTSTRAP();';
        clone.querySelector('body').appendChild(boot);
        clone.querySelector('#canvas-container').replaceChildren();
        ['stlModal','actionModal','dropOverlay','toastBanner','modelLoadingStatus','dependencyError'].forEach(id => clone.querySelector('#' + id).classList.add('hidden'));
        clone.querySelector('#customStlTextarea').textContent = '';
        clone.querySelector('#customStlTextarea').value = '';
        clone.querySelector('#modelSearch').setAttribute('value', '');
        ['exportStandaloneHtmlBtn','quickExportHtmlBtn'].forEach(id => clone.querySelector('#'+id).removeAttribute('disabled'));
        const url = URL.createObjectURL(new Blob(['<!DOCTYPE html>\n'+clone.outerHTML], {type:'text/html;charset=utf-8'}));
        const link = document.createElement('a'); link.href = url;
        link.download = 'cafe_stl_viewer_' + merged.size + '_models.html';
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        showToast('Portable HTML exported with ' + merged.size + ' models.');
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
            function setCameraPreset(view) {
                const targetY = controls.target.y || 12;
                switch (view) {
                    case 'front':
                        camera.position.set(0, targetY, 65);
                        break;
                    case 'top':
                        camera.position.set(0, 85, 0.01);
                        break;
                    case 'side':
                        camera.position.set(65, targetY, 0);
                        break;
                    case 'iso':
                    default:
                        camera.position.set(45, 35, 45);
                        break;
                }
                controls.update();
            }

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
                actionModal.classList.add('hidden');
                pendingModalAction = null;
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
                modal.classList.remove('hidden');
            };
            document.getElementById('openCodeModalBtn').addEventListener('click', openModal);
            document.getElementById('pasteStlBtn').addEventListener('click', openModal);
            document.getElementById('closeModalBtn').addEventListener('click', () => modal.classList.add('hidden'));
            document.getElementById('cancelModalBtn').addEventListener('click', () => modal.classList.add('hidden'));

            // Encode .STL file inside Modal to Base64 string for embedding
            document.getElementById('modalFileEncoder').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
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
                    modal.classList.add('hidden');
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
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            requestRender();
        }

        function animate() {
            renderFrame = null;
            if (document.hidden) return;
            if (controls) controls.update();
            if (renderer && scene && camera) renderer.render(scene, camera);
            if (controls && controls.autoRotate) requestRender();
        }

        window.onload = async function () {
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
