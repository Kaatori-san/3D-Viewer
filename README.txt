CAFE STL STUDIO — ANDROID, iPHONE, iPAD & DESKTOP
29 original STL models

OPEN ON ANDROID OR iOS
1. Extract this ZIP. Keep index.html, viewer.js, styles.css, models/ and
   vendor/ together.
2. Place the extracted Cafe_STL_Viewer folder on a static web host, or serve
   it from a computer on your local network.
3. Open the viewer's web address in Safari on iPhone/iPad or Chrome on
   Android. Use a current browser with WebGL enabled.

A downloaded ZIP or an HTML preview in the iPhone Files app is not a hosted
viewer. Open a web address in a browser to run the viewer reliably on phones.
This is a responsive browser app; no Android APK or iOS installation is needed.
Internet is still required for Three.js, Tailwind styling, fonts and icons.

OPTIONAL LOCAL NETWORK PREVIEW
If Python 3 is installed on a computer, open a terminal inside the extracted
Cafe_STL_Viewer folder and run:

    python3 -m http.server 8000 --bind 0.0.0.0

On Windows, the command may be: py -m http.server 8000 --bind 0.0.0.0
Connect the phone and computer to the same Wi-Fi network, then open
http://YOUR-COMPUTER-LAN-IP:8000 on the phone. Stop the server with Ctrl+C.
Built-in models work over local HTTP; native file sharing may require HTTPS.

ON A PHONE OR TABLET
- Tap Models to search, filter, upload, or choose a model. Selecting one
  closes the controls panel and returns to the 3D view.
- Drag one finger to rotate. Pinch with two fingers to zoom. Move both
  fingers together to pan.
- Tap Material to change color, shading, wireframe, metalness or roughness.
- Tap View for camera presets, auto-rotation, grid and model measurements.
- Tap Reset View to fit the model to the current screen.
- Download STL prepares the original file. Tap Download file to save it.
  A Share / Save to Files option also appears when supported by the browser
  for that file type. Otherwise use the browser's Downloads.
- Export HTML creates one portable HTML file containing all 29 built-in
  models plus any custom models saved in this browser. It still needs an
  internet connection for the external viewer libraries and styling.
- Use the close button or tap outside the controls panel to return to the
  model. Portrait and landscape layouts are supported.

DESKTOP
Extract the complete ZIP and open index.html in a current Chrome, Edge,
Firefox or Safari browser. If local file access is restricted, use the local
server above. Left-drag rotates, scroll zooms and right-drag pans. Keyboard
users can use Tab and Escape to navigate the controls and dialogs.

WHAT CHANGED
- Full-height mobile viewer with a collapsible controls panel.
- Larger touch targets, readable text fields and touch gesture instructions.
- Safe-area spacing and resizing for browser chrome and the on-screen keyboard.
- Camera framing for different screen shapes; capped mobile rendering density.
- Downloads that can be confirmed with a direct tap, with native sharing
  offered where available.
- Local gzip fallback for browsers without native DecompressionStream support.
- Portable HTML exports include the new mobile styles, controls and fallback.

MODEL DATA & STORAGE
All 29 model payload files are unchanged. Download STL restores the exact
original STL bytes, including face normals, triangle order and attributes.
The viewer checks SHA-256 where the browser makes Web Crypto available.
Viewing normalization and display settings do not change downloaded geometry.
Models still load only when selected.

Custom uploads are stored in this browser on this device. Browser storage
can be cleared or become unavailable; export important files to keep a copy.

CONTENTS
index.html                 Viewer page and model catalogue
styles.css                 Desktop and mobile layout
viewer.js                  Loading, controls, storage and export code
models/*.js                29 losslessly compressed original STL payloads
vendor/pako_inflate.min.js  Local gzip fallback
vendor/PAKO-LICENSE.txt     Third-party license

VALIDATION
JavaScript and archive/model integrity were checked. Automated interaction
checks use a simulated DOM; real Android/iOS browser rendering, physical
touch gestures, and native file sharing still need device verification.
