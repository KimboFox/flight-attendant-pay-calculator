/**
 * app.js — Main Application Initialization
 * 
 * This is the main file that starts everything up! It's like the "brain" of the app
 * that coordinates all the other files and makes sure everything works together.
 * 
 * What's in here:
 * - Start the app when the page loads
 * - Load saved data from the browser
 * - Set up all event listeners
 * - Initialize the user interface
 * - Make sure everything is ready to use
 * 
 * This file runs first and makes sure the app is ready for you to use!
 */

// ============================================================================
// APPLICATION INITIALIZATION (Start everything up)
// ============================================================================

/**
 * Initialize the application
 * This is the main function that starts everything
 */
function initializeApp() {
    try {
        console.log('🚀 Starting Flight Attendant Pay Calculator...');
        
        // Wait for the page to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startApp);
        } else {
            startApp();
        }
        
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showErrorToast('Failed to start the application');
    }
}

/**
 * Start the application after the page is loaded
 */
function startApp() {
    try {
        console.log('📄 DOM loaded, starting app...');
        
        // Step 1: Load saved data
        loadSavedData();
        
        // Step 2: Initialize the user interface
        initializeUI();
        
        // Step 3: Set up all event listeners
        setupAllEventListeners();
        
        // Step 4: Show the initial view
        showInitialView();
        
        // Step 5: Final setup and checks
        finalizeAppStartup();
        
        console.log('✅ App started successfully!');
        
    } catch (error) {
        console.error('❌ Error starting app:', error);
        showErrorToast('Failed to start the application');
    }
}

/**
 * Load saved data from browser storage
 */
function loadSavedData() {
    try {
        console.log('📂 Loading saved data...');
        
        // Load app state (trips, settings, etc.)
        const dataLoaded = loadAppState();
        
        if (dataLoaded) {
            console.log('✅ Saved data loaded successfully');
        } else {
            console.log('ℹ️ No saved data found, starting fresh');
        }
        
        // Load form data if any
        const currentForm = getCurrentForm();
        if (currentForm && Object.values(currentForm).some(value => value)) {
            loadFormDataToUI(currentForm);
            console.log('📝 Form data restored');
        }
        
    } catch (error) {
        console.error('❌ Error loading saved data:', error);
        showErrorToast('Failed to load saved data');
    }
}

/**
 * Load form data back into the UI
 * @param {Object} formData - The form data to load
 */
function loadFormDataToUI(formData) {
    try {
        setFormFieldValue('trip-name', formData.tripName || '');
        setFormFieldValue('departure', formData.departure || '');
        setFormFieldValue('arrival', formData.arrival || '');
        setFormFieldValue('trip-date', formData.date || '');
        setFormFieldValue('duration', formData.duration || '');
        setFormFieldValue('pay-rate', formData.payRate || '');
        setFormFieldValue('notes', formData.notes || '');
        
        // Update earnings display
        const earnings = calculateTripEarnings(formData.duration, formData.payRate);
        updateEarningsDisplay(earnings);
        
    } catch (error) {
        console.error('Error loading form data to UI:', error);
    }
}

/**
 * Initialize the user interface
 */
function initializeUI() {
    try {
        console.log('🎨 Initializing user interface...');
        
        // Apply current theme
        const currentTheme = getSetting('theme') || 'light';
        applyTheme(currentTheme);
        
        // Handle responsive design
        handleResponsiveDesign();
        
        // Set up header
        updateHeader('form');
        
        // Initialize trip list
        refreshTripList();
        
        // Set up real-time calculations
        setupRealTimeCalculation();
        
        console.log('✅ User interface initialized');
        
    } catch (error) {
        console.error('❌ Error initializing UI:', error);
    }
}

/**
 * Set up all event listeners
 */
function setupAllEventListeners() {
    try {
        console.log('🎧 Setting up event listeners...');
        
        // Form events
        setupFormEventListeners();
        
        // Button events
        setupButtonEventListeners();
        
        // Keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Window events
        setupWindowEventListeners();
        
        // Mobile events
        setupMobileEventListeners();
        
        console.log('✅ Event listeners set up');
        
    } catch (error) {
        console.error('❌ Error setting up event listeners:', error);
    }
}

/**
 * Show the initial view
 */
function showInitialView() {
    try {
        console.log('👀 Showing initial view...');
        
        // Get the current view from state or default to form
        const currentView = getCurrentView() || 'form';
        
        // Show the appropriate view
        switchView(currentView);
        
        // Update header based on current view
        updateHeader(currentView);
        
        console.log(`✅ Showing ${currentView} view`);
        
    } catch (error) {
        console.error('❌ Error showing initial view:', error);
    }
}

/**
 * Finalize app startup
 */
function finalizeAppStartup() {
    try {
        console.log('🔧 Finalizing app startup...');
        
        // Add loading class to body for CSS animations
        document.body.classList.add('app-loaded');
        
        // Show welcome message if first time
        checkFirstTimeUser();
        
        // Set up periodic auto-save
        setupPeriodicAutoSave();
        
        // Add app version to console
        console.log(`📱 Flight Attendant Pay Calculator v${APP_CONFIG.VERSION}`);
        console.log('🎉 App is ready to use!');
        
        // Show success toast
        showSuccessToast('App loaded successfully!', 2000);
        
    } catch (error) {
        console.error('❌ Error finalizing app startup:', error);
    }
}

// ============================================================================
// FIRST-TIME USER EXPERIENCE (Welcome new users)
// ============================================================================

/**
 * Check if this is the first time using the app
 */
function checkFirstTimeUser() {
    try {
        const hasUsedBefore = localStorage.getItem('hasUsedBefore');
        
        if (!hasUsedBefore) {
            // First time user
            showWelcomeMessage();
            localStorage.setItem('hasUsedBefore', 'true');
        }
        
    } catch (error) {
        console.error('Error checking first-time user:', error);
    }
}

/**
 * Show welcome message for first-time users
 */
function showWelcomeMessage() {
    try {
        const welcomeMessage = `
Welcome to Flight Attendant Pay Calculator! ✈️

Here's how to get started:
1. Fill out the trip form above
2. Your earnings will calculate automatically
3. Click "Add Trip" to save your trip
4. View all your trips in the trip list

Your data is saved automatically in your browser.
        `;
        
        // Show welcome toast
        showInfoToast('Welcome! Check the console for tips.', 5000);
        
        // Log welcome message
        console.log('%c' + welcomeMessage, 'color: #007bff; font-size: 14px; line-height: 1.5;');
        
    } catch (error) {
        console.error('Error showing welcome message:', error);
    }
}

// ============================================================================
// PERIODIC TASKS (Background maintenance)
// ============================================================================

/**
 * Set up periodic auto-save
 */
function setupPeriodicAutoSave() {
    try {
        // Auto-save every 30 seconds
        setInterval(() => {
            saveFormData();
        }, 30000);
        
        console.log('✅ Periodic auto-save set up');
        
    } catch (error) {
        console.error('Error setting up periodic auto-save:', error);
    }
}

/**
 * Set up periodic data cleanup
 */
function setupPeriodicCleanup() {
    try {
        // Clean up old data every hour
        setInterval(() => {
            cleanupOldData();
        }, 3600000); // 1 hour
        
        console.log('✅ Periodic cleanup set up');
        
    } catch (error) {
        console.error('Error setting up periodic cleanup:', error);
    }
}

/**
 * Clean up old or invalid data
 */
function cleanupOldData() {
    try {
        const trips = getAllTrips();
        let cleanedCount = 0;
        
        // Remove trips older than 1 year (optional)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        trips.forEach(trip => {
            if (new Date(trip.createdAt) < oneYearAgo) {
                deleteTrip(trip.id);
                cleanedCount++;
            }
        });
        
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} old trips`);
            refreshTripList();
        }
        
    } catch (error) {
        console.error('Error cleaning up old data:', error);
    }
}

// ============================================================================
// ERROR HANDLING (Handle app errors gracefully)
// ============================================================================

/**
 * Set up global error handling
 */
function setupErrorHandling() {
    try {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            showErrorToast('Something went wrong. Please try again.');
        });
        
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            showErrorToast('An error occurred. Please refresh the page.');
        });
        
        console.log('✅ Error handling set up');
        
    } catch (error) {
        console.error('Error setting up error handling:', error);
    }
}

// ============================================================================
// APP SHUTDOWN (Clean up when leaving)
// ============================================================================

/**
 * Clean up when the app is shutting down
 */
function cleanupOnShutdown() {
    try {
        // Save any unsaved data
        saveFormData();
        
        // Save app state
        saveAppState();
        
        console.log('🧹 App cleanup completed');
        
    } catch (error) {
        console.error('Error during app cleanup:', error);
    }
}

// ============================================================================
// UTILITY FUNCTIONS (Helper functions)
// ============================================================================

/**
 * Check if the app is ready
 * @returns {boolean} - Whether the app is ready to use
 */
function isAppReady() {
    return document.body.classList.contains('app-loaded');
}

/**
 * Get app status information
 * @returns {Object} - App status information
 */
function getAppStatus() {
    return {
        version: APP_CONFIG.VERSION,
        ready: isAppReady(),
        tripCount: getTripCount(),
        totalEarnings: getTotalEarnings(),
        currentView: getCurrentView(),
        theme: getSetting('theme'),
        lastSaved: new Date().toISOString()
    };
}

/**
 * Log app status to console
 */
function logAppStatus() {
    const status = getAppStatus();
    console.log('📊 App Status:', status);
}

// ============================================================================
// START THE APP (This is where it all begins!)
// ============================================================================

// Start the app when this file loads
initializeApp(); 