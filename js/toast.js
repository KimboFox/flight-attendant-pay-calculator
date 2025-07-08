/**
 * toast.js — Popup Message System
 * 
 * This file handles those little popup messages that appear at the bottom of the screen.
 * Think of it like a notification system - when you save a trip, it shows "Trip saved successfully!"
 * 
 * What's in here:
 * - Show success messages (green popups)
 * - Show error messages (red popups)
 * - Show warning messages (yellow popups)
 * - Show info messages (blue popups)
 * - Make messages disappear automatically
 * 
 * These are the little messages that tell you if something worked or went wrong!
 */

// ============================================================================
// TOAST NOTIFICATION SYSTEM (Popup messages)
// ============================================================================

/**
 * Show a popup message at the bottom of the screen
 * @param {string} message - The message to show
 * @param {string} type - The type of message ('success', 'error', 'warning', 'info')
 * @param {number} duration - How long to show the message (in milliseconds)
 */
function showToast(message, type = 'info', duration = 4000) {
    try {
        // Get the toast container (where messages appear)
        const container = document.getElementById('toast-container');
        if (!container) {
            console.error('Toast container not found');
            return;
        }

        // Create the toast element (the popup message)
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        // Add the toast to the container
        container.appendChild(toast);

        // Make the toast slide in from the left
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);

        // Remove the toast after the specified duration
        setTimeout(() => {
            hideToast(toast);
        }, duration);

        // Allow clicking to dismiss the toast
        toast.addEventListener('click', () => {
            hideToast(toast);
        });

    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

/**
 * Hide a toast message (make it disappear)
 * @param {HTMLElement} toast - The toast element to hide
 */
function hideToast(toast) {
    if (!toast) return;

    // Slide the toast out to the left
    toast.style.transform = 'translateX(-100%)';
    toast.style.opacity = '0';

    // Remove the toast from the page after the animation
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * Get the appropriate icon for the toast type
 * @param {string} type - The type of toast
 * @returns {string} - The icon HTML
 */
function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

/**
 * Show a success message (green popup)
 * @param {string} message - The success message
 * @param {number} duration - How long to show it
 */
function showSuccessToast(message, duration = 4000) {
    showToast(message, 'success', duration);
}

/**
 * Show an error message (red popup)
 * @param {string} message - The error message
 * @param {number} duration - How long to show it
 */
function showErrorToast(message, duration = 6000) {
    showToast(message, 'error', duration);
}

/**
 * Show a warning message (yellow popup)
 * @param {string} message - The warning message
 * @param {number} duration - How long to show it
 */
function showWarningToast(message, duration = 5000) {
    showToast(message, 'warning', duration);
}

/**
 * Show an info message (blue popup)
 * @param {string} message - The info message
 * @param {number} duration - How long to show it
 */
function showInfoToast(message, duration = 4000) {
    showToast(message, 'info', duration);
}

/**
 * Clear all toast messages from the screen
 */
function clearAllToasts() {
    const container = document.getElementById('toast-container');
    if (container) {
        container.innerHTML = '';
    }
}

// ============================================================================
// TOAST HELPER FUNCTIONS (Common messages)
// ============================================================================

/**
 * Show a "trip saved" success message
 * @param {string} tripName - The name of the trip
 */
function showTripSavedToast(tripName) {
    showSuccessToast(`Trip "${tripName}" saved successfully!`);
}

/**
 * Show a "trip deleted" message with undo option
 * @param {string} tripName - The name of the trip
 * @param {Function} undoFunction - Function to call if user clicks undo
 */
function showTripDeletedToast(tripName, undoFunction) {
    const message = `Trip "${tripName}" deleted. <a href="#" id="undo-delete">Undo</a>`;
    showInfoToast(message, 8000);
    
    // Add undo functionality
    setTimeout(() => {
        const undoLink = document.getElementById('undo-delete');
        if (undoLink && undoFunction) {
            undoLink.addEventListener('click', (e) => {
                e.preventDefault();
                undoFunction();
                clearAllToasts();
            });
        }
    }, 100);
}

/**
 * Show a "form error" message
 * @param {string} message - The error message
 */
function showFormErrorToast(message) {
    showErrorToast(`Please fix the errors in the form: ${message}`);
}

/**
 * Show a "no trips" warning message
 */
function showNoTripsToast() {
    showWarningToast('No trips to export');
}

/**
 * Show a "export success" message
 */
function showExportSuccessToast() {
    showSuccessToast('Trips exported successfully');
}

/**
 * Show a "clear all" message
 */
function showClearAllToast() {
    showInfoToast('All trips cleared');
} 