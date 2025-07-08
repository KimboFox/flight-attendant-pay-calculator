/**
 * state.js — Data Management
 * 
 * This file manages all the data in the app - like a big storage box for everything.
 * It keeps track of all the trips you've saved, your current settings, and makes sure
 * everything is saved to your browser so you don't lose your data.
 * 
 * What's in here:
 * - Store all your saved trips
 * - Save trips to your browser's storage
 * - Load trips when you open the app
 * - Keep track of current settings
 * - Make sure data doesn't get lost
 * 
 * Think of this as the "memory" of the app - it remembers everything!
 */

// ============================================================================
// APPLICATION STATE (All the data the app needs to remember)
// ============================================================================

/**
 * The main state object - holds all the app's data
 */
const appState = {
    // All the trips you've saved
    trips: [],
    
    // Current settings and preferences
    settings: {
        theme: 'light', // 'light' or 'dark'
        currency: 'USD',
        defaultPayRate: 0,
        autoSave: true
    },
    
    // Current form data (what you're typing)
    currentForm: {
        tripName: '',
        departure: '',
        arrival: '',
        date: '',
        duration: '',
        payRate: '',
        notes: ''
    },
    
    // UI state (what's currently visible/selected)
    ui: {
        currentView: 'form', // 'form' or 'trips'
        selectedTripId: null,
        isEditing: false,
        showDeleteConfirm: false
    }
};

// ============================================================================
// STORAGE MANAGEMENT (Save and load data from browser)
// ============================================================================

/**
 * Save all app data to the browser's local storage
 * This makes sure your data doesn't disappear when you close the browser
 */
function saveAppState() {
    try {
        const dataToSave = {
            trips: appState.trips,
            settings: appState.settings,
            lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem('flightAttendantPayCalculator', JSON.stringify(dataToSave));
        console.log('App state saved successfully');
        
    } catch (error) {
        console.error('Error saving app state:', error);
        showErrorToast('Failed to save data to browser storage');
    }
}

/**
 * Load all app data from the browser's local storage
 * This restores your data when you open the app again
 */
function loadAppState() {
    try {
        const savedData = localStorage.getItem('flightAttendantPayCalculator');
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // Load trips
            if (parsedData.trips && Array.isArray(parsedData.trips)) {
                appState.trips = parsedData.trips;
            }
            
            // Load settings
            if (parsedData.settings) {
                appState.settings = { ...appState.settings, ...parsedData.settings };
            }
            
            console.log(`Loaded ${appState.trips.length} trips from storage`);
            return true;
            
        } else {
            console.log('No saved data found, starting with empty state');
            return false;
        }
        
    } catch (error) {
        console.error('Error loading app state:', error);
        showErrorToast('Failed to load saved data');
        return false;
    }
}

/**
 * Clear all saved data from the browser
 * This is like a "factory reset" for the app
 */
function clearAppState() {
    try {
        localStorage.removeItem('flightAttendantPayCalculator');
        appState.trips = [];
        appState.settings = {
            theme: 'light',
            currency: 'USD',
            defaultPayRate: 0,
            autoSave: true
        };
        console.log('App state cleared successfully');
        return true;
        
    } catch (error) {
        console.error('Error clearing app state:', error);
        return false;
    }
}

// ============================================================================
// TRIP MANAGEMENT (Add, update, delete trips)
// ============================================================================

/**
 * Add a new trip to the app
 * @param {Object} tripData - The trip information
 * @returns {Object} - The created trip with ID and timestamps
 */
function addTrip(tripData) {
    try {
        const newTrip = {
            id: generateId(),
            ...tripData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        appState.trips.push(newTrip);
        saveAppState();
        
        console.log('Trip added:', newTrip.name);
        return newTrip;
        
    } catch (error) {
        console.error('Error adding trip:', error);
        throw error;
    }
}

/**
 * Update an existing trip
 * @param {string} tripId - The ID of the trip to update
 * @param {Object} tripData - The new trip data
 * @returns {Object|null} - The updated trip or null if not found
 */
function updateTrip(tripId, tripData) {
    try {
        const tripIndex = appState.trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex === -1) {
            console.error('Trip not found:', tripId);
            return null;
        }
        
        const updatedTrip = {
            ...appState.trips[tripIndex],
            ...tripData,
            updatedAt: new Date().toISOString()
        };
        
        appState.trips[tripIndex] = updatedTrip;
        saveAppState();
        
        console.log('Trip updated:', updatedTrip.name);
        return updatedTrip;
        
    } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
    }
}

/**
 * Delete a trip from the app
 * @param {string} tripId - The ID of the trip to delete
 * @returns {boolean} - True if deleted, false if not found
 */
function deleteTrip(tripId) {
    try {
        const tripIndex = appState.trips.findIndex(trip => trip.id === tripId);
        
        if (tripIndex === -1) {
            console.error('Trip not found:', tripId);
            return false;
        }
        
        const deletedTrip = appState.trips.splice(tripIndex, 1)[0];
        saveAppState();
        
        console.log('Trip deleted:', deletedTrip.name);
        return true;
        
    } catch (error) {
        console.error('Error deleting trip:', error);
        return false;
    }
}

/**
 * Get a specific trip by ID
 * @param {string} tripId - The ID of the trip to get
 * @returns {Object|null} - The trip or null if not found
 */
function getTrip(tripId) {
    return appState.trips.find(trip => trip.id === tripId) || null;
}

/**
 * Get all trips
 * @returns {Array} - Array of all trips
 */
function getAllTrips() {
    return [...appState.trips]; // Return a copy to prevent direct modification
}

/**
 * Get trips sorted by date (newest first)
 * @returns {Array} - Array of trips sorted by date
 */
function getTripsSortedByDate() {
    return [...appState.trips].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
}

// ============================================================================
// FORM STATE MANAGEMENT (Current form data)
// ============================================================================

/**
 * Update the current form data
 * @param {Object} formData - The new form data
 */
function updateCurrentForm(formData) {
    appState.currentForm = { ...appState.currentForm, ...formData };
}

/**
 * Get the current form data
 * @returns {Object} - The current form data
 */
function getCurrentForm() {
    return { ...appState.currentForm }; // Return a copy
}

/**
 * Clear the current form data
 */
function clearCurrentForm() {
    appState.currentForm = {
        tripName: '',
        departure: '',
        arrival: '',
        date: '',
        duration: '',
        payRate: '',
        notes: ''
    };
}

/**
 * Set the current form data from a trip (for editing)
 * @param {Object} trip - The trip to load into the form
 */
function loadTripIntoForm(trip) {
    appState.currentForm = {
        tripName: trip.name || '',
        departure: trip.departure || '',
        arrival: trip.arrival || '',
        date: trip.date || '',
        duration: trip.duration || '',
        payRate: trip.payRate || '',
        notes: trip.notes || ''
    };
}

// ============================================================================
// SETTINGS MANAGEMENT (User preferences)
// ============================================================================

/**
 * Update app settings
 * @param {Object} newSettings - The new settings
 */
function updateSettings(newSettings) {
    appState.settings = { ...appState.settings, ...newSettings };
    saveAppState();
}

/**
 * Get current settings
 * @returns {Object} - The current settings
 */
function getSettings() {
    return { ...appState.settings }; // Return a copy
}

/**
 * Get a specific setting
 * @param {string} settingName - The name of the setting
 * @returns {*} - The setting value
 */
function getSetting(settingName) {
    return appState.settings[settingName];
}

// ============================================================================
// UI STATE MANAGEMENT (What's currently visible)
// ============================================================================

/**
 * Update UI state
 * @param {Object} newUiState - The new UI state
 */
function updateUIState(newUiState) {
    appState.ui = { ...appState.ui, ...newUiState };
}

/**
 * Get current UI state
 * @returns {Object} - The current UI state
 */
function getUIState() {
    return { ...appState.ui }; // Return a copy
}

/**
 * Set the current view
 * @param {string} view - The view to show ('form' or 'trips')
 */
function setCurrentView(view) {
    appState.ui.currentView = view;
}

/**
 * Get the current view
 * @returns {string} - The current view
 */
function getCurrentView() {
    return appState.ui.currentView;
}

// ============================================================================
// UTILITY FUNCTIONS (Helper functions)
// ============================================================================

/**
 * Generate a unique ID for trips
 * @returns {string} - A unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get the total number of trips
 * @returns {number} - The number of trips
 */
function getTripCount() {
    return appState.trips.length;
}

/**
 * Check if there are any trips
 * @returns {boolean} - True if there are trips, false otherwise
 */
function hasTrips() {
    return appState.trips.length > 0;
}

/**
 * Get the total earnings from all trips
 * @returns {number} - The total earnings
 */
function getTotalEarnings() {
    return appState.trips.reduce((total, trip) => {
        const earnings = parseFloat(trip.earnings) || 0;
        return total + earnings;
    }, 0);
} 