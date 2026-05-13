# iOS PWA for Audiobook App with Text-to-Speech

This is a Progressive Web App (PWA) designed for iOS devices that uses the Web Speech API to read text aloud. It allows users to paste text or load a text file and listen to it being read out loud.

## Features

- Text-to-Speech using the Web Speech API
- Load text from a .txt file or paste directly into the textarea
- Controls for play, pause, stop
- Adjustable volume, rate (speed), and pitch
- Dark/Light mode toggle
- Offline functionality via Service Worker
- Can be installed on iOS home screen
- Remembers user preferences (theme, volume, rate, pitch)
- Works best when the app is visible and active (see limitations below)

## Limitations

Due to iOS and web platform restrictions:

1. **Cannot access other apps**: This PWA cannot read text from the Kindle app or any other native app due to sandboxing.
2. **Background playback**: The Web Speech API on iOS may pause when the page is not visible or when the device is locked. For best results, keep the app visible and the device unlocked while listening.
3. **Requires user interaction**: Speech must be initiated by a user gesture (tap on the Play button).
4. **Text input only**: Currently supports plain text input (via paste or .txt file). For EPUB or PDF, you would need to extract the text first.

## Folder Structure

```
.
├── index.html
├── manifest.json
├── service-worker.js
├── assets/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── icon-1024x1024.png
│   ├── splash/
│   │   ├── splash-iphone-12.png
│   │   └── splash-iphone-13.png
│   └── favicon.ico
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── utils.js
├── docs/
│   └── deployment.md
└── .github/
    └── workflows/
        └── deploy.yml
```

## How to Use

1. **Install the PWA**:
   - Visit your deployed URL in Safari on iOS.
   - Tap the Share button and select "Add to Home Screen".

2. **Using the App**:
   - Paste text into the textarea or click "Load File" to select a .txt file.
   - Adjust volume, rate, and pitch sliders as desired.
   - Tap "Play" to start listening.
   - Use "Pause" and "Stop" to control playback.
   - Tap the sun/moon icon in the header to toggle between light and dark mode.

3. **Offline Use**:
   - Once loaded, the PWA works offline thanks to the service worker.
   - Make sure to visit the page online at least once to cache the assets.

## Deployment

See [docs/deployment.md](docs/deployment.md) for detailed instructions on deploying to GitHub Pages.

## Notes for iOS

- The app must be served over HTTPS (GitHub Pages provides this).
- For the best experience, keep the device unlocked and the app in the foreground while listening.
- If playback stops when the device locks, this is a limitation of iOS and the Web Speech API.

## Troubleshooting

- **No sound**: Check device volume and ensure mute is off.
- **Speech not starting**: Make sure you tapped the Play button after entering text.
- **File not loading**: Ensure the file is a plain text (.txt) file.
- **Voices not available**: The Web Speech API voices depend on the device and language settings.
- **Theme not saving**: Make sure you're using a modern browser that supports localStorage.

---
*This app is for personal use only. Do not use for copyrighted material without permission.*