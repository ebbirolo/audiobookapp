// Main JavaScript for Audiobook PWA with TTS, Dark Mode, and View Management
document.addEventListener('DOMContentLoaded', () => {
    console.log('Audiobook PWA with TTS loaded');

    // Elements
    const textInput = document.getElementById('text-input');
    const fileInput = document.getElementById('file-input');
    const loadFileBtn = document.getElementById('load-file');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const volumeSlider = document.getElementById('volume');
    const rateSlider = document.getElementById('rate');
    const pitchSlider = document.getElementById('pitch');
    const statusEl = document.getElementById('status');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const kindleBtn = document.getElementById('kindle-btn');
    const backToMainBtn = document.getElementById('back-to-main');
    const mainView = document.getElementById('main-view');
    const kindleView = document.getElementById('kindle-view');

    // Speech synthesis
    let utterance = null;
    let isPlaying = false;

    // Initialize speech synthesis
    const initSpeechSynthesis = () => {
        if ('speechSynthesis' in window) {
            // Voices may not be loaded immediately, so we wait a bit
            setTimeout(() => {
                const voices = speechSynthesis.getVoices();
                if (voices.length > 0) {
                    console.log('Voices loaded:', voices.length);
                } else {
                    console.warn('No voices available yet');
                }
            }, 100);
        } else {
            statusEl.textContent = 'Speech Synthesis not supported in this browser.';
            statusEl.style.color = 'red';
            disableControls();
        }
    };

    // Disable controls if speech synthesis not supported
    const disableControls = () => {
        playBtn.disabled = true;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
        volumeSlider.disabled = true;
        rateSlider.disabled = true;
        pitchSlider.disabled = true;
    };

    // Update status
    const setStatus = (message, isError = false) => {
        statusEl.textContent = message;
        statusEl.style.color = isError ? 'red' : 'green';
    };

    // Load file
    const loadFile = () => {
        const file = fileInput.files[0];
        if (!file) {
            setStatus('Please select a file first.', true);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            textInput.value = e.target.result;
            setStatus('File loaded successfully.');
        };
        reader.onerror = () => {
            setStatus('Error reading file.', true);
        };
        reader.readAsText(file);
    };

    // Start speaking
    const startSpeaking = () => {
        const text = textInput.value.trim();
        if (!text) {
            setStatus('Please enter some text to speak.', true);
            return;
        }

        // Cancel any ongoing utterance
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = parseFloat(volumeSlider.value);
        utterance.rate = parseFloat(rateSlider.value);
        utterance.pitch = parseFloat(pitchSlider.value);

        // Optional: set voice (we can let the user choose later if needed)
        // utterance.voice = speechSynthesis.getVoices().find(v => v.lang === 'en-US');

        utterance.onstart = () => {
            isPlaying = true;
            setStatus('Speaking...');
            playBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
        };

        utterance.onend = () => {
            isPlaying = false;
            setStatus('Speech completed.');
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
        };

        utterance.onerror = (e) => {
            isPlaying = false;
            setStatus('Error in speech synthesis: ' + e.error, true);
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
        };

        speechSynthesis.speak(utterance);
    };

    // Pause speaking
    const pauseSpeaking = () => {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            isPlaying = false;
            setStatus('Speech paused.');
            playBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    };

    // Stop speaking
    const stopSpeaking = () => {
        speechSynthesis.cancel();
        isPlaying = false;
        setStatus('Speech stopped.');
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    };

    // Dark mode functionality
    const initDarkMode = () => {
        // Check for saved user preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateDarkModeIcon(savedTheme === 'dark');
        } else if (systemPrefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateDarkModeIcon(true);
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            updateDarkModeIcon(false);
        }
    };

    const toggleDarkMode = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateDarkModeIcon(newTheme === 'dark');
    };

    const updateDarkModeIcon = (isDark) => {
        // Using simple black/white characters that will inherit text color
        if (isDark) {
            darkModeToggle.textContent = '○'; // White circle for sun (when in dark mode, show option to go to light)
        } else {
            darkModeToggle.textContent = '◐'; // Circle with left half black for moon (when in light mode, show option to go to dark)
        }
    };

    // View management
    const showMainView = () => {
        mainView.style.display = 'flex';
        kindleView.style.display = 'none';
    };

    const showKindleView = () => {
        mainView.style.display = 'none';
        kindleView.style.display = 'flex';
    };

    // Event listeners
    loadFileBtn.addEventListener('click', loadFile);
    playBtn.addEventListener('click', startSpeaking);
    pauseBtn.addEventListener('click', pauseSpeaking);
    stopBtn.addEventListener('click', stopSpeaking);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    kindleBtn.addEventListener('click', showKindleView);
    backToMainBtn.addEventListener('click', showMainView);

    // Update utterance properties when sliders change (if an utterance is active)
    volumeSlider.addEventListener('input', () => {
        if (utterance) {
            utterance.volume = parseFloat(volumeSlider.value);
        }
    });
    rateSlider.addEventListener('input', () => {
        if (utterance) {
            utterance.rate = parseFloat(rateSlider.value);
        }
    });
    pitchSlider.addEventListener('input', () => {
        if (utterance) {
            utterance.pitch = parseFloat(pitchSlider.value);
        }
    });

    // Initialize
    initSpeechSynthesis();
    initDarkMode();
    showMainView(); // Start with main view visible
});

// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch((error) => {
            console.log('ServiceWorker registration failed: ', error);
        });
}