/**
 * events.js — Event Listeners and User Interactions
 * 
 * This file handles all the user interactions - like when you click buttons,
 * type in forms, or use keyboard shortcuts. It connects all the user actions
 * to the right functions in other files.
 * 
 * What's in here:
 * - Button click handlers (save, delete, export, etc.)
 * - Form input listeners (real-time calculations)
 * - Keyboard shortcuts
 * - Window resize handling
 * - Touch and mobile interactions
 * 
 * This is like the "nervous system" of the app - it responds to everything you do!
 */

// ============================================================================
// FORM EVENT LISTENERS (Handle form interactions)
// ============================================================================

/**
 * Set up all form-related event listeners
 * This connects form inputs to the right functions
 */
function setupFormEventListeners() {
    try {
        const form = document.getElementById('trip-form');
        if (!form) {
            console.error('Trip form not found');
            return;
        }
        
        // Form submission
        form.addEventListener('submit', handleFormSubmit);
        
        // Save button (in case form submission doesn't work)
        const saveBtn = document.getElementById('save-trip-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleFormSubmit(e);
            });
        }
        
        // Real-time calculations
        setupRealTimeCalculation();
        
        // Form field validation
        setupFormValidation();
        
        // Toggle switches
        setupToggleSwitches();
        
        // Form input listeners
        setupFormInputListeners();
        
        // Auto-save functionality
        setupAutoSave();
        
        console.log('Form event listeners set up successfully');
        
    } catch (error) {
        console.error('Error setting up form event listeners:', error);
    }
}

/**
 * Set up form validation listeners
 * This validates fields as the user types
 */
function setupFormValidation() {
    const requiredFields = [
        'trip-name', 'pay-year', 'trip-length', 
        'credited-hours-hours', 'credited-hours-minutes',
        'tafb-hours', 'tafb-minutes'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Clear errors when user starts typing
            field.addEventListener('input', () => {
                clearFieldError(fieldId);
            });
            
            // Validate on blur (when user leaves the field)
            field.addEventListener('blur', () => {
                validateField(fieldId);
            });
        }
    });
}

/**
 * Set up toggle switch event listeners
 */
function setupToggleSwitches() {
    const toggles = [
        'white-flag', 'purple-flag', 'purser-pay', 'galley-pay',
        'intl-pay-override', 'language-pay', 'holiday-pay', 'intl-override'
    ];
    
    toggles.forEach(toggleId => {
        const toggle = document.getElementById(toggleId);
        const label = document.getElementById(`${toggleId}-label`);
        
        if (toggle && label) {
            toggle.addEventListener('change', () => {
                // Update label text
                label.textContent = toggle.checked ? 'Yes' : 'No';
                
                // Update aria-checked on the toggle slider
                const slider = toggle.nextElementSibling;
                if (slider && slider.hasAttribute('aria-checked')) {
                    slider.setAttribute('aria-checked', toggle.checked ? 'true' : 'false');
                }
                
                // Show/hide conditional fields
                toggleConditionalFields(toggleId);
                
                // Trigger validation if needed
                if (typeof validateHours === 'function') {
                    validateHours();
                }
            });
        }
    });
}

/**
 * Toggle conditional form fields based on toggle state
 */
function toggleConditionalFields(changedToggleId) {
    // Purple flag premium dropdown
    const purpleFlagToggle = document.getElementById('purple-flag');
    const purpleFlagGroup = document.getElementById('purple-flag-dropdown-group');
    if (purpleFlagGroup) {
        purpleFlagGroup.style.display = purpleFlagToggle.checked ? 'block' : 'none';
    }
    
    // Galley hours group
    const galleyToggle = document.getElementById('galley-pay');
    const galleyGroup = document.getElementById('galley-hours-group');
    if (galleyGroup) {
        galleyGroup.style.display = galleyToggle.checked ? 'block' : 'none';
    }
    
    // Purser fields group
    const purserToggle = document.getElementById('purser-pay');
    const purserGroup = document.getElementById('purser-fields-group');
    if (purserGroup) {
        purserGroup.style.display = purserToggle.checked ? 'block' : 'none';
    }
    
    // Holiday hours group
    const holidayToggle = document.getElementById('holiday-pay');
    const holidayGroup = document.getElementById('holiday-hours-group');
    if (holidayGroup) {
        holidayGroup.style.display = holidayToggle.checked ? 'block' : 'none';
    }
}

/**
 * Set up form input event listeners for real-time validation
 */
function setupFormInputListeners() {
    // Hours validation inputs
    const hoursInputs = [
        'credited-hours-hours', 'credited-hours-minutes',
        'galley-hours-hours', 'galley-hours-minutes',
        'purser-us-hours', 'purser-non-us-hours',
        'holiday-hours', 'tafb-hours', 'tafb-minutes'
    ];
    
    hoursInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                // Clear validation errors
                clearFieldError(inputId);
                
                // Trigger hours validation if function exists
                if (typeof validateHours === 'function') {
                    validateHours();
                }
            });
        }
    });
    
    // Percentage inputs
    const percentageInputs = ['retirement-percentage', 'tax-rate'];
    percentageInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                const value = parseFloat(input.value) || 0;
                if (value < 0) input.value = 0;
                if (value > 100) input.value = 100;
            });
        }
    });
    
    // Trip name input
    const tripNameInput = document.getElementById('trip-name');
    if (tripNameInput) {
        tripNameInput.addEventListener('input', () => {
            clearFieldError('trip-name');
        });
    }
    
    // Pay year select
    const payYearSelect = document.getElementById('pay-year');
    if (payYearSelect) {
        payYearSelect.addEventListener('change', () => {
            clearFieldError('pay-year');
        });
    }
    
    // Trip length select
    const tripLengthSelect = document.getElementById('trip-length');
    if (tripLengthSelect) {
        tripLengthSelect.addEventListener('change', () => {
            clearFieldError('trip-length');
        });
    }
    
    // Aircraft type select
    const aircraftTypeSelect = document.getElementById('aircraft-type');
    if (aircraftTypeSelect) {
        aircraftTypeSelect.addEventListener('change', () => {
            // Trigger validation if needed
            if (typeof validateHours === 'function') {
                validateHours();
            }
        });
    }
    
    // Purple flag premium select
    const purpleFlagPremiumSelect = document.getElementById('purple-flag-premium');
    if (purpleFlagPremiumSelect) {
        purpleFlagPremiumSelect.addEventListener('change', () => {
            // Could trigger recalculation if needed
        });
    }
}

/**
 * Validate a single form field
 * @param {string} fieldId - The ID of the field to validate
 */
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const value = field.value.trim();
    let error = null;
    
    switch (fieldId) {
        case 'trip-name':
            if (!value) error = 'Trip name is required';
            break;
        case 'departure':
            if (!value) error = 'Departure city is required';
            break;
        case 'arrival':
            if (!value) error = 'Arrival city is required';
            break;
        case 'trip-date':
            if (!value) {
                error = 'Trip date is required';
            } else {
                const tripDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (tripDate < today) {
                    error = 'Trip date cannot be in the past';
                }
            }
            break;
        case 'duration':
            if (!value) {
                error = 'Duration is required';
            } else {
                const duration = parseFloat(value);
                if (isNaN(duration) || duration <= 0) {
                    error = 'Duration must be a positive number';
                }
            }
            break;
        case 'pay-rate':
            if (!value) {
                error = 'Pay rate is required';
            } else {
                const payRate = parseFloat(value);
                if (isNaN(payRate) || payRate < 0) {
                    error = 'Pay rate must be a positive number';
                }
            }
            break;
    }
    
    if (error) {
        showFieldError(fieldId, error);
    } else {
        clearFieldError(fieldId);
    }
}

/**
 * Set up auto-save functionality
 * This saves form data as the user types
 */
function setupAutoSave() {
    const autoSaveEnabled = getSetting('autoSave') !== false;
    if (!autoSaveEnabled) return;
    
    // Only include fields that exist in the current form
    const formFields = [
        'trip-name', 'pay-year', 'trip-length', 'credited-hours-hours', 'credited-hours-minutes',
        'tafb-hours', 'tafb-minutes', 'white-flag', 'purple-flag', 'purple-flag-premium',
        'galley-pay', 'galley-hours-hours', 'galley-hours-minutes', 'purser-pay', 'aircraft-type',
        'purser-us-hours', 'purser-non-us-hours', 'intl-pay-override', 'language-pay', 'holiday-pay',
        'holiday-hours', 'intl-override', 'retirement-percentage', 'tax-rate'
    ];
    let autoSaveTimeout;
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    saveFormData();
                }, 2000);
            });
        }
    });
}

/**
 * Save current form data to local storage
 */
function saveFormData() {
    try {
        const formData = getFormData();
        updateCurrentForm(formData);
        console.log('Form data auto-saved');
    } catch (error) {
        console.error('Error auto-saving form data:', error);
    }
}

// ============================================================================
// BUTTON EVENT LISTENERS (Handle button clicks)
// ============================================================================

/**
 * Set up all button event listeners
 * This connects buttons to their actions
 */
function setupButtonEventListeners() {
    try {
        // Header buttons
        setupHeaderButtons();
        
        // Form buttons
        setupFormButtons();
        
        // Trip action buttons
        setupTripActionButtons();
        
        // Export buttons
        setupExportButtons();
        
        // Utility buttons
        setupUtilityButtons();
        
        // Add this line to ensure Add Trip buttons are set up:
        setupAddTripButtons();
        
        console.log('Button event listeners set up successfully');
        
    } catch (error) {
        console.error('Error setting up button event listeners:', error);
    }
}

/**
 * Set up header button listeners
 */
function setupHeaderButtons() {
    // Clear All button
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', handleClearAll);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Feedback button
    const feedbackBtn = document.getElementById('feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', handleFeedback);
    }
}

/**
 * Set up form button listeners
 */
function setupFormButtons() {
    // Clear form button
    const clearFormBtn = document.getElementById('clear-form-btn');
    if (clearFormBtn) {
        clearFormBtn.removeEventListener('click', handleClearForm);
        clearFormBtn.addEventListener('click', handleClearForm);
    }
    
    // Cancel editing button
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.removeEventListener('click', handleCancelEdit);
        cancelEditBtn.addEventListener('click', handleCancelEdit);
    }
    
    // Panel close button (✕ in header)
    const panelCloseBtn = document.getElementById('panel-close');
    if (panelCloseBtn) {
        panelCloseBtn.removeEventListener('click', handlePanelClose);
        panelCloseBtn.addEventListener('click', handlePanelClose);
    }
    
    // Cancel button (at bottom of form)
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.removeEventListener('click', handlePanelClose);
        cancelBtn.addEventListener('click', handlePanelClose);
    }
}

function handlePanelClose() {
    closeSidePanel();
    // Focus the Add Trip button for accessibility
    const addTripBtn = document.getElementById('add-trip-btn');
    if (addTripBtn) addTripBtn.focus();
}

/**
 * Close the side panel
 */
function closeSidePanel() {
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel) {
        sidePanel.classList.add('collapsed');
        // Reset form if needed
        if (typeof clearForm === 'function') {
            clearForm();
        }
    }
    if (typeof showTripsView === 'function') showTripsView();
}

/**
 * Set up trip action button listeners
 */
function setupTripActionButtons() {
    // These are set up dynamically when trip cards are created
    // See addTripCardEventListeners() in trips.js
}

/**
 * Set up export button listeners
 */
function setupExportButtons() {
    // CSV export
    const csvExportBtn = document.getElementById('export-csv-btn');
    if (csvExportBtn) {
        csvExportBtn.addEventListener('click', handleCSVExport);
    }
    
    // JSON export
    const jsonExportBtn = document.getElementById('export-json-btn');
    if (jsonExportBtn) {
        jsonExportBtn.addEventListener('click', handleJSONExport);
    }
}

/**
 * Set up utility button listeners
 */
function setupUtilityButtons() {
    // Theme toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', handleThemeToggle);
    }
    
    // Scroll to top
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', handleScrollToTop);
    }
}

/**
 * Set up event listeners for Add Trip buttons ("+" and "Add Your First Trip")
 */
function setupAddTripButtons() {
    const addTripBtn = document.getElementById('add-trip-btn');
    const firstTripBtn = document.getElementById('first-trip-btn');
    
    function openTripFormPanel() {
        if (typeof clearForm === 'function') clearForm();
        if (typeof updateFormButtonText === 'function') updateFormButtonText('Add Trip');
        const sidePanel = document.getElementById('side-panel');
        if (sidePanel) {
            sidePanel.classList.remove('collapsed');
            // Focus the first input for accessibility
            const firstInput = sidePanel.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }
        if (typeof showFormView === 'function') showFormView();
    }
    
    if (addTripBtn) {
        addTripBtn.addEventListener('click', openTripFormPanel);
    }
    if (firstTripBtn) {
        firstTripBtn.addEventListener('click', openTripFormPanel);
    }
}

// ============================================================================
// BUTTON HANDLERS (What happens when buttons are clicked)
// ============================================================================

/**
 * Handle Clear All button click
 */
function handleClearAll() {
    try {
        const trips = getAllTrips();
        
        if (trips.length === 0) {
            showWarningToast('No trips to clear');
            return;
        }
        
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to delete all ${trips.length} trips? This action cannot be undone.`);
        
        if (confirmed) {
            // Store trips for potential undo
            const deletedTrips = [...trips];
            
            // Clear all trips
            clearAppState();
            refreshTripList();
            
            // Show success message with undo option
            showClearAllToast();
            
            // Store deleted trips for undo (for a limited time)
            setTimeout(() => {
                // Clear undo data after 30 seconds
            }, 30000);
        }
        
    } catch (error) {
        console.error('Error clearing all trips:', error);
        showErrorToast('Failed to clear trips');
    }
}

/**
 * Handle Export button click
 */
function handleExport() {
    try {
        const trips = getAllTrips();
        
        if (trips.length === 0) {
            showNoTripsToast();
            return;
        }
        
        // Show export options
        showExportOptions();
        
    } catch (error) {
        console.error('Error handling export:', error);
        showErrorToast('Failed to show export options');
    }
}

/**
 * Show export options dialog
 */
function showExportOptions() {
    const dialog = document.createElement('div');
    dialog.className = 'export-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>Export Trips</h3>
            <p>Choose export format:</p>
            <div class="export-options">
                <button class="btn btn-primary" onclick="handleCSVExport()">
                    Export as CSV
                </button>
                <button class="btn btn-secondary" onclick="handleJSONExport()">
                    Export as JSON
                </button>
            </div>
            <button class="btn btn-outline" onclick="closeExportDialog()">
                Cancel
            </button>
        </div>
    `;
    
    document.body.appendChild(dialog);
    fadeIn(dialog, 200);
}

/**
 * Close export dialog
 */
function closeExportDialog() {
    const dialog = document.querySelector('.export-dialog');
    if (dialog) {
        fadeOut(dialog, 200);
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        }, 200);
    }
}

/**
 * Handle CSV export
 */
function handleCSVExport() {
    try {
        const csvData = exportTripsToCSV();
        if (csvData) {
            const filename = `flight-trips-${new Date().toISOString().split('T')[0]}.csv`;
            downloadExport(csvData, filename, 'text/csv');
        }
        closeExportDialog();
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showErrorToast('Failed to export CSV');
    }
}

/**
 * Handle JSON export
 */
function handleJSONExport() {
    try {
        const jsonData = exportTripsToJSON();
        if (jsonData) {
            const filename = `flight-trips-${new Date().toISOString().split('T')[0]}.json`;
            downloadExport(jsonData, filename, 'application/json');
        }
        closeExportDialog();
    } catch (error) {
        console.error('Error exporting JSON:', error);
        showErrorToast('Failed to export JSON');
    }
}

/**
 * Handle Feedback button click
 */
function handleFeedback() {
    try {
        // Open external feedback form
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSc8ATwj4UAgkAzudfzTqZFK3Bc2fe-6bJb31ojZ1Ml8okeraA/viewform?usp=header', '_blank');
    } catch (error) {
        console.error('Error handling feedback:', error);
        showErrorToast('Failed to open feedback form');
    }
}

/**
 * Show feedback modal
 */
function showFeedbackModal() {
    const modal = document.createElement('div');
    modal.className = 'feedback-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Send Feedback</h3>
            <p>We'd love to hear your thoughts about the app!</p>
            <form id="feedback-form">
                <div class="form-group">
                    <label for="feedback-type">Type:</label>
                    <select id="feedback-type" required>
                        <option value="">Select type...</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="improvement">Improvement</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="feedback-message">Message:</label>
                    <textarea id="feedback-message" rows="4" required 
                              placeholder="Tell us what you think..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Send Feedback</button>
                    <button type="button" class="btn btn-outline" onclick="closeFeedbackModal()">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    fadeIn(modal, 200);
    
    // Add form submission handler
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
}

/**
 * Handle feedback form submission
 */
function handleFeedbackSubmit(event) {
    event.preventDefault();
    
    try {
        const type = document.getElementById('feedback-type').value;
        const message = document.getElementById('feedback-message').value;
        
        // Here you would typically send the feedback to a server
        // For now, we'll just show a success message
        console.log('Feedback submitted:', { type, message });
        
        showSuccessToast('Thank you for your feedback!');
        closeFeedbackModal();
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showErrorToast('Failed to send feedback');
    }
}

/**
 * Close feedback modal
 */
function closeFeedbackModal() {
    const modal = document.querySelector('.feedback-modal');
    if (modal) {
        fadeOut(modal, 200);
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 200);
    }
}

/**
 * Handle Clear Form button click
 */
function handleClearForm() {
    try {
        const confirmed = confirm('Are you sure you want to clear the form?');
        
        if (confirmed) {
            clearForm();
            showInfoToast('Form cleared');
        }
        
    } catch (error) {
        console.error('Error clearing form:', error);
        showErrorToast('Failed to clear form');
    }
}

/**
 * Handle Cancel Edit button click
 */
function handleCancelEdit() {
    try {
        cancelEditing();
        showInfoToast('Editing cancelled');
    } catch (error) {
        console.error('Error cancelling edit:', error);
        showErrorToast('Failed to cancel editing');
    }
}

/**
 * Handle theme toggle
 */
function handleThemeToggle() {
    try {
        toggleTheme();
    } catch (error) {
        console.error('Error toggling theme:', error);
        showErrorToast('Failed to toggle theme');
    }
}

/**
 * Handle scroll to top
 */
function handleScrollToTop() {
    try {
        scrollToTop();
    } catch (error) {
        console.error('Error scrolling to top:', error);
    }
}

// ============================================================================
// KEYBOARD SHORTCUTS (Handle keyboard interactions)
// ============================================================================

/**
 * Set up keyboard shortcuts
 * This adds keyboard support for common actions
 */
function setupKeyboardShortcuts() {
    try {
        document.addEventListener('keydown', handleKeyboardShortcut);
        console.log('Keyboard shortcuts set up successfully');
    } catch (error) {
        console.error('Error setting up keyboard shortcuts:', error);
    }
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardShortcut(event) {
    // Don't trigger shortcuts when typing in form fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Ctrl/Cmd + S: Save trip
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const form = document.getElementById('trip-form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Ctrl/Cmd + N: New trip (clear form)
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        clearForm();
    }
    
    // Ctrl/Cmd + E: Export
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        handleExport();
    }
    
    // Escape: Cancel editing or close modals
    if (event.key === 'Escape') {
        const uiState = getUIState();
        if (uiState.isEditing) {
            cancelEditing();
        }
        
        // Close any open modals
        closeExportDialog();
        closeFeedbackModal();
    }
    
    // F1: Show help
    if (event.key === 'F1') {
        event.preventDefault();
        showHelp();
    }
}

/**
 * Show help information
 */
function showHelp() {
    const helpText = `
Keyboard Shortcuts:
• Ctrl/Cmd + S: Save trip
• Ctrl/Cmd + N: New trip
• Ctrl/Cmd + E: Export trips
• Escape: Cancel editing
• F1: Show this help
    `;
    
    alert(helpText);
}

// ============================================================================
// WINDOW AND RESIZE EVENTS (Handle window changes)
// ============================================================================

/**
 * Set up window event listeners
 * This handles window resize, focus, etc.
 */
function setupWindowEventListeners() {
    try {
        // Window resize
        window.addEventListener('resize', handleWindowResize);
        
        // Window focus/blur
        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('blur', handleWindowBlur);
        
        // Page visibility
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Before unload (save data before leaving)
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        console.log('Window event listeners set up successfully');
        
    } catch (error) {
        console.error('Error setting up window event listeners:', error);
    }
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    try {
        // Debounce resize events
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            handleResponsiveDesign();
        }, 250);
        
    } catch (error) {
        console.error('Error handling window resize:', error);
    }
}

/**
 * Handle window focus
 */
function handleWindowFocus() {
    try {
        // Refresh data when window gains focus
        refreshTripList();
        console.log('Window focused - data refreshed');
        
    } catch (error) {
        console.error('Error handling window focus:', error);
    }
}

/**
 * Handle window blur
 */
function handleWindowBlur() {
    try {
        // Save form data when window loses focus
        saveFormData();
        console.log('Window blurred - form data saved');
        
    } catch (error) {
        console.error('Error handling window blur:', error);
    }
}

/**
 * Handle page visibility change
 */
function handleVisibilityChange() {
    try {
        if (document.hidden) {
            // Page is hidden - save data
            saveFormData();
            console.log('Page hidden - data saved');
        } else {
            // Page is visible - refresh data
            refreshTripList();
            console.log('Page visible - data refreshed');
        }
        
    } catch (error) {
        console.error('Error handling visibility change:', error);
    }
}

/**
 * Handle before unload (save data before leaving)
 */
function handleBeforeUnload(event) {
    try {
        // Save form data
        saveFormData();
        
        // Show confirmation if there are unsaved changes
        const uiState = getUIState();
        if (uiState.isEditing) {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return event.returnValue;
        }
        
    } catch (error) {
        console.error('Error handling before unload:', error);
    }
}

// ============================================================================
// TOUCH AND MOBILE EVENTS (Handle mobile interactions)
// ============================================================================

/**
 * Set up touch and mobile event listeners
 * This improves the mobile experience
 */
function setupMobileEventListeners() {
    try {
        // Touch events for better mobile interaction
        setupTouchEvents();
        
        // Swipe gestures
        setupSwipeGestures();
        
        // Mobile-specific interactions
        setupMobileInteractions();
        
        console.log('Mobile event listeners set up successfully');
        
    } catch (error) {
        console.error('Error setting up mobile event listeners:', error);
    }
}

/**
 * Set up touch events
 */
function setupTouchEvents() {
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.classList.add('touch-active');
        });
        
        button.addEventListener('touchend', () => {
            button.classList.remove('touch-active');
        });
    });
}

/**
 * Set up swipe gestures
 */
function setupSwipeGestures() {
    let startX, startY;
    
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Minimum swipe distance
        const minSwipeDistance = 50;
        
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
            // Horizontal swipe
            if (diffX > 0) {
                // Swipe left - could be used for navigation
                console.log('Swipe left detected');
            } else {
                // Swipe right - could be used for navigation
                console.log('Swipe right detected');
            }
        }
        
        startX = startY = null;
    });
}

/**
 * Set up mobile-specific interactions
 */
function setupMobileInteractions() {
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Handle mobile keyboard appearance
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            // Scroll to input when keyboard appears
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
} 