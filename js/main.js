// Main JavaScript for Audiobook PWA with TTS, Dark Mode, and Transcript Management
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
    const voiceSelect = document.getElementById('voice-select');
    const femaleVoiceBtn = document.getElementById('female-voice-btn');
    const statusEl = document.getElementById('status');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const transcriptBtn = document.getElementById('transcript-btn');
    const kindleBtn = document.getElementById('kindle-btn');

    // View elements
    const mainView = document.getElementById('main-view');
    const transcriptView = document.getElementById('transcript-view');
    const kindleView = document.getElementById('kindle-view');

    // Transcript view elements
    const transcriptBackToMainBtn = document.getElementById('transcript-back-to-main');
    const transcriptTextDisplay = document.getElementById('transcript-text-display');
    const startPageInput = document.getElementById('start-page');
    const endPageInput = document.getElementById('end-page');
    const saveTranscriptBtn = document.getElementById('save-transcript-btn');
    const transcriptsList = document.getElementById('transcripts-list');

    const backToMainBtn = document.getElementById('back-to-main');

    // Speech synthesis
    let utterance = null;
    let isPlaying = false;
    let currentCharIndex = 0; // Track current position in text
    let isPaused = false; // Track if we're paused vs stopped
    let voices = []; // Available voices
    let selectedVoice = null; // Currently selected voice

    // Initialize speech synthesis
    const initSpeechSynthesis = () => {
        if ('speechSynthesis' in window) {
            // Load voices and handle async loading
            const loadVoices = () => {
                voices = speechSynthesis.getVoices();
                // Filter for English voices if needed, or show all
                const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
                const voicesToShow = englishVoices.length > 0 ? englishVoices : voices;

                // Populate voice select dropdown
                voiceSelect.innerHTML = '<option value="">Select voice (default)</option>';
                voicesToShow.forEach((voice, index) => {
                    const option = document.createElement('option');
                    option.value = index; // Store index in voicesToShow array
                    option.textContent = `${voice.name} ${voice.lang}${voice.default ? ' (default)' : ''}${voice.localService ? ' (local)' : ''}`;
                    voiceSelect.appendChild(option);
                });

                // Try to select a female voice by default if available
                const femaleVoiceIndex = voicesToShow.findIndex(voice =>
                    voice.name.toLowerCase().includes('female') ||
                    voice.name.toLowerCase().includes('woman') ||
                    voice.name.includes('Samantha') ||
                    voice.name.includes('Victoria') ||
                    voice.name.includes('Kate') ||
                    voice.gender === 'female'
                );

                if (femaleVoiceIndex !== -1) {
                    voiceSelect.selectedIndex = femaleVoiceIndex + 1; // +1 because of the placeholder option
                    selectedVoice = voicesToShow[femaleVoiceIndex];
                }
            };

            // Load voices initially
            loadVoices();

            // Listen for voices to be loaded
            speechSynthesis.onvoiceschanged = loadVoices;
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

        // If we're paused, ask user what they want to do
        if (isPaused) {
            const userChoice = window.confirm(
                'Speech is paused. Do you want to:\n\n' +
                'OK: Continue from where you left off\n' +
                'Cancel: Delete everything behind and start from current position'
            );

            if (userChoice) {
                // User chose to continue from where they left off
                // Just resume the speech synthesis
                speechSynthesis.resume();
                isPlaying = true;
                isPaused = false;
                setStatus('Speaking...');
                playBtn.disabled = true;
                pauseBtn.disabled = false;
                stopBtn.disabled = false;
                return;
            } else {
                // User chose to delete everything behind
                // Remove the text that has already been spoken
                const remainingText = text.substring(currentCharIndex);
                textInput.value = remainingText;
                currentCharIndex = 0; // Reset position since we removed the spoken part
                // Fall through to start speaking the remaining text
            }
        }

        // Cancel any ongoing utterance
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        utterance = new SpeechSynthesisUtterance(textInput.value.trim());
        utterance.volume = parseFloat(volumeSlider.value);
        utterance.rate = parseFloat(rateSlider.value);
        utterance.pitch = parseFloat(pitchSlider.value);

        // Use selected voice if available
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Track current position in text
        utterance.onboundary = (event) => {
            if (event.name === 'word' || event.name === 'sentence') {
                currentCharIndex = event.charIndex;
            }
        };

        // Optional: set voice (we can let the user choose later if needed)
        // utterance.voice = speechSynthesis.getVoices().find(v => v.lang === 'en-US');

        utterance.onstart = () => {
            isPlaying = true;
            isPaused = false;
            setStatus('Speaking...');
            playBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
        };

        utterance.onend = () => {
            isPlaying = false;
            isPaused = false;
            setStatus('Speech completed.');
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
        };

        utterance.onerror = (e) => {
            isPlaying = false;
            isPaused = false;
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
            isPaused = true; // Mark as paused (not stopped)
            setStatus('Speech paused.');
            playBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    };

    // Stop speaking
    const stopSpeaking = () => {
        speechSynthesis.cancel();
        isPlaying = false;
        isPaused = false; // Reset paused state when stopping
        currentCharIndex = 0; // Reset position when stopping
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
        transcriptView.style.display = 'none';
        kindleView.style.display = 'none';
    };

    const showTranscriptView = () => {
        mainView.style.display = 'none';
        transcriptView.style.display = 'flex';
        kindleView.style.display = 'none';
        // Update transcript text display when showing the view
        transcriptTextDisplay.value = textInput.value;
        // Refresh the transcripts list
        renderTranscriptsList();
    };

    const showKindleView = () => {
        mainView.style.display = 'none';
        transcriptView.style.display = 'none';
        kindleView.style.display = 'flex';
    };

    // Transcript management
    const loadTranscriptsFromStorage = () => {
        const transcripts = localStorage.getItem('transcripts');
        return transcripts ? JSON.parse(transcripts) : [];
    };

    const saveTranscriptsToStorage = (transcripts) => {
        localStorage.setItem('transcripts', JSON.stringify(transcripts));
    };

    const addTranscript = (text, startPage, endPage) => {
        const transcripts = loadTranscriptsFromStorage();
        const newTranscript = {
            id: Date.now(), // Simple ID based on timestamp
            text: text,
            startPage: parseInt(startPage) || 1,
            endPage: parseInt(endPage) || 1,
            timestamp: new Date().toISOString()
        };
        transcripts.push(newTranscript);
        saveTranscriptsToStorage(transcripts);
        return newTranscript;
    };

    const deleteTranscript = (id) => {
        let transcripts = loadTranscriptsFromStorage();
        transcripts = transcripts.filter(t => t.id !== id);
        saveTranscriptsToStorage(transcripts);
        renderTranscriptsList();
    };

    const loadTranscriptToEditor = (transcript) => {
        textInput.value = transcript.text;
        startPageInput.value = transcript.startPage;
        endPageInput.value = transcript.endPage;
        setStatus('Transcript loaded. Return to main view to play or edit.', false);
        showMainView();
    };

    const renderTranscriptsList = () => {
        const transcripts = loadTranscriptsFromStorage();
        transcriptsList.innerHTML = '';

        if (transcripts.length === 0) {
            transcriptsList.innerHTML = '<p>No transcripts saved yet.</p>';
            return;
        }

        transcripts.forEach(transcript => {
            const transcriptElement = document.createElement('div');
            transcriptElement.className = 'transcript-item';

            const date = new Date(transcript.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            transcriptElement.innerHTML = `
                <div class="transcript-item-header">
                    <div class="transcript-page-range">Pages ${transcript.startPage}-${transcript.endPage}</div>
                    <div class="transcript-date">${formattedDate}</div>
                </div>
                <div class="transcript-preview">${transcript.text.substring(0, 100)}${transcript.text.length > 100 ? '...' : ''}</div>
                <div class="transcript-actions">
                    <button class="load-transcript-btn" data-id="${transcript.id}">Load</button>
                    <button class="delete-transcript-btn" data-id="${transcript.id}">Delete</button>
                </div>
            `;

            transcriptsList.appendChild(transcriptElement);
        });

        // Add event listeners to the buttons in the list
        document.querySelectorAll('.load-transcript-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const transcripts = loadTranscriptsFromStorage();
                const transcript = transcripts.find(t => t.id === id);
                if (transcript) {
                    loadTranscriptToEditor(transcript);
                }
            });
        });

        document.querySelectorAll('.delete-transcript-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                deleteTranscript(id);
            });
        });
    };

    // Event listeners
    loadFileBtn.addEventListener('click', loadFile);
    playBtn.addEventListener('click', startSpeaking);
    pauseBtn.addEventListener('click', pauseSpeaking);
    stopBtn.addEventListener('click', stopSpeaking);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    transcriptBtn.addEventListener('click', showTranscriptView);
    kindleBtn.addEventListener('click', showKindleView);
    transcriptBackToMainBtn.addEventListener('click', showMainView);
    backToMainBtn.addEventListener('click', showMainView);
    voiceSelect.addEventListener('change', () => {
        const selectedIndex = parseInt(voiceSelect.value);
        // We need to get the actual voices array that matches the options
        // Since we populate the dropdown with filtered voices, we need to apply the same filtering
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        const voicesToShow = englishVoices.length > 0 ? englishVoices : voices;

        if (!isNaN(selectedIndex) && voicesToShow[selectedIndex]) {
            selectedVoice = voicesToShow[selectedIndex];
            setStatus(`Voice changed to: ${selectedVoice.name}`);
        } else {
            selectedVoice = null;
            setStatus('Voice changed to: default');
        }
    });

    // Female voice button
    femaleVoiceBtn.addEventListener('click', () => {
        if (voices.length === 0) {
            setStatus('No voices available yet. Please wait for voices to load.', true);
            return;
        }

        // Filter for English voices first
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        const voicesToSearch = englishVoices.length > 0 ? englishVoices : voices;

        // Look for a female voice
        const femaleVoice = voicesToSearch.find(voice =>
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Victoria') ||
            voice.name.includes('Kate') ||
            voice.gender === 'female'
        );

        if (femaleVoice) {
            // Find the index in the dropdown
            const englishVoicesForDropdown = voices.filter(voice => voice.lang.startsWith('en'));
            const voicesToShowForDropdown = englishVoicesForDropdown.length > 0 ? englishVoicesForDropdown : voices;
            const indexInDropdown = voicesToShowForDropdown.indexOf(femaleVoice);

            if (indexInDropdown !== -1) {
                voiceSelect.selectedIndex = indexInDropdown + 1; // +1 for placeholder
            } else {
                // Fallback: just set the voice directly
                voiceSelect.selectedIndex = 0; // Reset to default
            }

            selectedVoice = femaleVoice;
            setStatus(`Voice changed to female voice: ${femaleVoice.name}`);
        } else {
            setStatus('No female voice found in available voices.', true);
        }
    });

    saveTranscriptBtn.addEventListener('click', () => {
        const text = transcriptTextDisplay.value.trim();
        const startPage = startPageInput.value;
        const endPage = endPageInput.value;

        if (!text) {
            setStatus('Please enter some text to save.', true);
            return;
        }

        if (!startPage || !endPage) {
            setStatus('Please enter both start and end page numbers.', true);
            return;
        }

        if (isNaN(startPage) || isNaN(endPage) || parseInt(startPage) < 1 || parseInt(endPage) < 1) {
            setStatus('Please enter valid page numbers (positive integers).', true);
            return;
        }

        const transcript = addTranscript(text, startPage, endPage);
        setStatus(`Transcript saved for pages ${transcript.startPage}-${transcript.endPage}.`, false);

        // Clear the form
        startPageInput.value = '';
        endPageInput.value = '';

        // Refresh the list
        renderTranscriptsList();
    });

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