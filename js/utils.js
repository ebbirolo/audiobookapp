// Utility functions for Audiobook PWA

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if running in standalone mode (PWA)
 * @returns {boolean} True if running as standalone PWA
 */
function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches;
}

/**
 * Request audio focus (for iOS)
 */
function requestAudioFocus() {
    // This would be implemented with actual audio APIs in a real app
    console.log('Audio focus requested');
}

// Export utilities for use in other modules
window.AudiobookUtils = {
    formatTime,
    formatFileSize,
    isStandalone,
    requestAudioFocus
};