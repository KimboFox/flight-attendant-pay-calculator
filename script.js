// Flight Trip Comparison Tool - Spec v2.1
// A tool to compare different flight trips and their compensation

// Add keyboard navigation support for skip links
document.addEventListener('DOMContentLoaded', function() {
    // Ensure skip links work properly by making target elements focusable
    const makeElementsFocusable = function() {
        const elementsToMakeFocusable = [
            document.getElementById('trip-comparison'),
            document.getElementById('add-trip-btn'),
            document.getElementById('side-panel')
        ];
        
        elementsToMakeFocusable.forEach(el => {
            if (el && !el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '-1');
            }
        });
    };
    
    makeElementsFocusable();
});



const constants = {
    DOMESTIC_PER_DIEM_RATE: 2.40,      // Domestic per diem rate: $2.40/hr (tax-free)
    INTERNATIONAL_PER_DIEM_RATE: 2.90, // International per diem rate: $2.90/hr (tax-free)
    STORAGE_KEY: 'flightTrips',
    VERSION: '2.1'
};

const masterPayData = {
    "Year 1": { baseRate: 28.88, flagRate: 43.32 },
    "Year 2": { baseRate: 30.64, flagRate: 45.96 },
    "Year 3": { baseRate: 32.59, flagRate: 48.89 },
    "Year 4": { baseRate: 34.71, flagRate: 52.07 },
    "Year 5": { baseRate: 38.25, flagRate: 57.38 },
    "Year 6": { baseRate: 43.30, flagRate: 64.95 },
    "Year 7": { baseRate: 48.41, flagRate: 72.62 },
    "Year 8": { baseRate: 49.96, flagRate: 74.94 },
    "Year 9": { baseRate: 51.34, flagRate: 77.01 },
    "Year 10": { baseRate: 53.26, flagRate: 79.89 },
    "Year 11": { baseRate: 54.73, flagRate: 82.10 },
    "Year 12": { baseRate: 57.33, flagRate: 86.00 },
    "Year 13+": { baseRate: 67.11, flagRate: 100.67 }
};

const state = {
    trips: [],
    editingTripId: null
};

// History management - tracks undo operations
const history = {
    lastOperation: null,
    lastState: null,
    
    // Save current state before modification
    saveState: function(operation, tripId, currentTrips) {
        try {
            this.lastOperation = operation;
            this.lastState = JSON.parse(JSON.stringify(currentTrips));
            console.log(`Saved state before ${operation} operation on trip ${tripId}`);
        } catch (error) {
            console.error('Error saving history state:', error);
        }
    },
    
    // Restore last state if needed
    undoLastOperation: function(showToast, renderTrips, updateState) {
        if (!this.lastState || !this.lastOperation) {
            showToast('Nothing to undo', 'info');
            return false;
        }
        
        updateState(this.lastState);
        const operation = this.lastOperation;
        this.lastState = null;
        this.lastOperation = null;
        
        renderTrips();
        showToast(`Undid last ${operation}`, 'success');
        return true;
    }
};

const utils = {
    // Format currency safely
    formatCurrency: function(value) {
        try {
            const num = parseFloat(value);
            if (isNaN(num) || !isFinite(num)) {
                return '$0.00';
            }
            return '$' + num.toFixed(2);
        } catch (error) {
            console.error('Error formatting currency:', error);
            return '$0.00';
        }
    },
    
    // Parse hours:minutes format to decimal hours
    parseHM: function(hoursStr, minutesStr) {
        try {
            const hours = parseInt(hoursStr, 10) || 0;
            const minutes = parseInt(minutesStr, 10) || 0;
            return hours + (minutes / 60);
        } catch (error) {
            console.error('Error parsing hours/minutes:', error);
            return 0;
        }
    },
    
    // Generate a unique ID
    generateId: function() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    // Generate a random color for trip cards
    getRandomColor: function() {
        const colors = [
            '#3a36e0', // Primary
            '#ff9d00', // Secondary
            '#00c48c', // Success
            '#0084ff', // Info
            '#7C3AED', // Purple
            '#0EA5E9', // Sky
            '#F97316', // Orange
            '#10B981', // Emerald
            '#EC4899', // Pink
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
}



// Validation state - tracks current validation status
const validationState = {
    hasErrors: false,
    errorMessages: []
};

// Validation functions - isolated and reusable
function validateHours() {
    try {
        // Get DOM elements when function is called
        const elements = {
            creditedHoursHours: document.getElementById('credited-hours-hours'),
            creditedHoursMinutes: document.getElementById('credited-hours-minutes'),
            galleyPayToggle: document.getElementById('galley-pay'),
            galleyHoursHours: document.getElementById('galley-hours-hours'),
            galleyHoursMinutes: document.getElementById('galley-hours-minutes'),
            galleyHoursValidation: document.getElementById('galley-hours-validation'),
            purserPayToggle: document.getElementById('purser-pay'),
            purserUSHours: document.getElementById('purser-us-hours'),
            purserNonUSHours: document.getElementById('purser-non-us-hours'),
            purserUSHoursValidation: document.getElementById('purser-us-hours-validation'),
            purserNonUSHoursValidation: document.getElementById('purser-non-us-hours-validation'),
            tafbHours: document.getElementById('tafb-hours'),
            tafbMinutes: document.getElementById('tafb-minutes'),
            holidayPayToggle: document.getElementById('holiday-pay'),
            holidayHours: document.getElementById('holiday-hours'),
            holidayHoursValidation: document.getElementById('holiday-hours-validation')
        };

        // Check if all elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Element not found: ${key}`);
                return false;
            }
        }

        // Parse and validate all inputs
        const chH = Math.max(0, parseInt(elements.creditedHoursHours.value, 10) || 0);
        const chM = Math.max(0, Math.min(59, parseInt(elements.creditedHoursMinutes.value, 10) || 0));
        const creditedHours = chH + (chM / 60);
        
        // Calculate total special hours
        const galleyHoursH = elements.galleyPayToggle.checked ? 
            Math.max(0, parseInt(elements.galleyHoursHours.value, 10) || 0) : 0;
        const galleyHoursM = elements.galleyPayToggle.checked ? 
            Math.max(0, Math.min(59, parseInt(elements.galleyHoursMinutes.value, 10) || 0)) : 0;
        const galleyHours = galleyHoursH + (galleyHoursM / 60);
            
        const purserUSHours = elements.purserPayToggle.checked ? 
            Math.max(0, parseFloat(elements.purserUSHours.value) || 0) : 0;
            
        const purserNonUSHours = elements.purserPayToggle.checked ? 
            Math.max(0, parseFloat(elements.purserNonUSHours.value) || 0) : 0;
        
        const totalSpecialHours = galleyHours + purserUSHours + purserNonUSHours;
        
        // Check if total special hours exceed credited hours
        const isValid = totalSpecialHours <= creditedHours;

        // Update validation messages
        if (!isValid) {
            const message = `Special hours (${totalSpecialHours.toFixed(2)}) exceed credited hours (${creditedHours.toFixed(2)})`;
            
            if (elements.galleyPayToggle.checked) {
                elements.galleyHoursValidation.textContent = message;
                elements.galleyHoursValidation.style.display = 'block';
                elements.galleyHoursHours.setAttribute('aria-invalid', 'true');
                elements.galleyHoursMinutes.setAttribute('aria-invalid', 'true');
            } else {
                elements.galleyHoursValidation.style.display = 'none';
                elements.galleyHoursHours.removeAttribute('aria-invalid');
                elements.galleyHoursMinutes.removeAttribute('aria-invalid');
            }
            
            if (elements.purserPayToggle.checked) {
                elements.purserUSHoursValidation.textContent = message;
                elements.purserUSHoursValidation.style.display = 'block';
                elements.purserNonUSHoursValidation.textContent = message;
                elements.purserNonUSHoursValidation.style.display = 'block';
                elements.purserUSHours.setAttribute('aria-invalid', 'true');
                elements.purserNonUSHours.setAttribute('aria-invalid', 'true');
            } else {
                elements.purserUSHoursValidation.style.display = 'none';
                elements.purserNonUSHoursValidation.style.display = 'none';
                elements.purserUSHours.removeAttribute('aria-invalid');
                elements.purserNonUSHours.removeAttribute('aria-invalid');
            }
        } else {
            // Clear all error messages if valid
            elements.galleyHoursValidation.style.display = 'none';
            elements.purserUSHoursValidation.style.display = 'none';
            elements.purserNonUSHoursValidation.style.display = 'none';
            
            // Reset aria-invalid attributes
            elements.galleyHoursHours.removeAttribute('aria-invalid');
            elements.galleyHoursMinutes.removeAttribute('aria-invalid');
            elements.purserUSHours.removeAttribute('aria-invalid');
            elements.purserNonUSHours.removeAttribute('aria-invalid');
        }
        
        // Validate holiday hours against TAFB time
        const thH = parseInt(elements.tafbHours.value, 10) || 0;
        const thM = parseInt(elements.tafbMinutes.value, 10) || 0;
        const tafbHours = thH + (thM / 60);
        
        const holidayHours = elements.holidayPayToggle.checked ? 
            Math.max(0, parseFloat(elements.holidayHours.value) || 0) : 0;
        
        if (elements.holidayPayToggle.checked && holidayHours > tafbHours) {
            const message = `Holiday hours (${holidayHours.toFixed(2)}) cannot exceed TAFB time (${tafbHours.toFixed(2)})`;
            elements.holidayHoursValidation.textContent = message;
            elements.holidayHoursValidation.style.display = 'block';
            elements.holidayHours.setAttribute('aria-invalid', 'true');
            return false;
        } else {
            elements.holidayHoursValidation.style.display = 'none';
            elements.holidayHours.removeAttribute('aria-invalid');
        }
        
        return isValid;
    } catch (error) {
        console.error('Error validating hours:', error);
        return false;
    }
}

function updateToggleLabel (toggle, labelElement) {
    labelElement.textContent = toggle.checked ? 'Yes' : 'No';
    
    // Update aria-checked attribute on the toggle slider
    const toggleSlider = toggle.nextElementSibling;
    if (toggleSlider && toggleSlider.hasAttribute('aria-checked')) {
        toggleSlider.setAttribute('aria-checked', toggle.checked ? 'true' : 'false');
    }
}

function setupToggleListeners() {
    const setupToggle = function(toggleId) {
        const toggle = document.getElementById(toggleId);
        const toggleLabel = document.getElementById(`${toggleId}-label`);
        const toggleSlider = toggle.nextElementSibling;
        
        // Update initial state
        if (toggleSlider) {
            toggleSlider.setAttribute('aria-checked', toggle.checked ? 'true' : 'false');
        }
        
        // Click handler
        toggle.addEventListener('change', function() {
            updateToggleLabel(toggle, toggleLabel);
            
            // Call additional handlers if needed
            if (toggleId === 'purple-flag' || toggleId === 'galley-pay' || toggleId === 'purser-pay' || toggleId === 'holiday-pay') {
                toggleConditionalFields();
            }
        });
        
        // Keyboard handler for the toggle slider
        if (toggleSlider) {
            toggleSlider.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle.checked = !toggle.checked;
                    
                    // Trigger the change event
                    const event = new Event('change');
                    toggle.dispatchEvent(event);
                }
            });
        }
    };
    
    // Setup all toggles
    setupToggle('white-flag');
    setupToggle('purple-flag');
    setupToggle('galley-pay');
    setupToggle('purser-pay');
    setupToggle('intl-override');
    setupToggle('intl-pay-override');
    setupToggle('language-pay');
    setupToggle('holiday-pay');
}

function calculateTripPay(tripData) {
    try {
        // Input validation with defaults
        if (!tripData || typeof tripData !== 'object') {
            console.error('Invalid trip data provided to calculation function');
            return createDefaultCalculation();
        }

        const payYear = tripData.payYear || 'Year 1';
        
        // Get flag premium multiplier from the new white/purple flag system
        const whiteFlagEnabled = tripData.whiteFlag === true || tripData.whiteFlag === 'Yes';
        const purpleFlagEnabled = tripData.purpleFlag === true || tripData.purpleFlag === 'Yes';
        const purpleFlagPremium = parseFloat(tripData.purpleFlagPremium) || 1.5;
        
        let flagPremiumMultiplier = 1;
        if (whiteFlagEnabled) {
            flagPremiumMultiplier *= 1.5;
        }
        if (purpleFlagEnabled) {
            flagPremiumMultiplier *= purpleFlagPremium;
        }
        
        // Parse and validate numeric inputs
        const chH = parseInt(tripData.creditedHoursHours, 10) || 0;
        const chM = parseInt(tripData.creditedHoursMinutes, 10) || 0;
        const creditedHours = chH + (chM / 60);
        
        const thH = parseInt(tripData.tafbHours, 10) || 0;
        const thM = parseInt(tripData.tafbMinutes, 10) || 0;
        const dutyHours = thH + (thM / 60);
        
        const tripLength = parseInt(tripData.tripLength) || 1;
        
        // Feature flags
        const hasGalleyPay = tripData.galleyPay === 'Yes';
        const hasPurserPay = tripData.purserPay === 'Yes';
        const hasIntlOverride = tripData.intlOverride === 'Yes';
        const hasIntlPayOverride = tripData.intlPayOverride === 'Yes';
        const hasLanguagePay = tripData.languagePay === 'Yes';
        const hasHolidayPay = tripData.holidayPay === 'Yes';
        
        // Special hours
        const ghH = hasGalleyPay ? (parseInt(tripData.galleyHoursHours, 10) || 0) : 0;
        const ghM = hasGalleyPay ? (parseInt(tripData.galleyHoursMinutes, 10) || 0) : 0;
        const galleyHours = ghH + (ghM / 60);
        
        const purserUSHours = hasPurserPay ? (parseFloat(tripData.purserUSHours) || 0) : 0;
        const purserNonUSHours = hasPurserPay ? (parseFloat(tripData.purserNonUSHours) || 0) : 0;
        
        const holidayHours = hasHolidayPay ? (parseFloat(tripData.holidayHours) || 0) : 0;
        
        // Additional settings
        const aircraftType = tripData.aircraftType || 'Narrow1';
        const retirementPercentage = Math.max(0, Math.min(100, parseFloat(tripData.retirementPercentage) || 0));
        const taxRate = Math.max(0, Math.min(100, parseFloat(tripData.taxRate) || 0));

        // Verify pay rates exist for the selected year
        if (!masterPayData[payYear]) {
            console.error(`Pay year ${payYear} not found in master data`);
            return createDefaultCalculation();
        }

        // Get rates
        const baseRate = masterPayData[payYear].baseRate;
        const effectiveRate = baseRate * flagPremiumMultiplier;
        
        // Per diem rate based on international status
        const perDiemRate = hasIntlOverride ? constants.INTERNATIONAL_PER_DIEM_RATE : constants.DOMESTIC_PER_DIEM_RATE;

        // Calculate pay components
        const basePay = creditedHours * effectiveRate;
        const galleyPay = hasGalleyPay ? galleyHours * 1 : 0;

        // Calculate purser pay based on aircraft type
        let purserPay = 0;
        if (hasPurserPay) {
            switch (aircraftType) {
                case 'Narrow1':
                    purserPay = purserUSHours * 1 + purserNonUSHours * 2;
                    break;
                case 'Narrow2':
                    purserPay = purserUSHours * 2 + purserNonUSHours * 3;
                    break;
                case 'Wide':
                    purserPay = purserUSHours * 3 + purserNonUSHours * 4;
                    break;
                default:
                    console.warn(`Unknown aircraft type: ${aircraftType}, using Narrow1 rates`);
                    purserPay = purserUSHours * 1 + purserNonUSHours * 2;
            }
        }

        const intlOverridePay = hasIntlPayOverride ? creditedHours * 2 : 0;
        const languagePay = hasLanguagePay ? creditedHours * 2.50 : 0;
        const perDiem = dutyHours * perDiemRate;
        
        // Calculate holiday pay: (Hourly Rate × Credited Hours) ÷ TAFB × Holiday Hours
        let holidayPay = 0;
        if (hasHolidayPay && dutyHours > 0) {
            holidayPay = (effectiveRate * creditedHours / dutyHours) * holidayHours;
        }

        // Calculate totals
        const totalGrossPay = basePay + galleyPay + purserPay + intlOverridePay + languagePay + perDiem + holidayPay;
        const retirementDeduction = totalGrossPay * (retirementPercentage / 100);
        const netBeforeTax = totalGrossPay - retirementDeduction;
        const netPayEstimate = netBeforeTax * (1 - taxRate / 100);
        
        const hourlyValue = creditedHours > 0 ? totalGrossPay / creditedHours : 0;
        const perDayValue = tripLength > 0 ? totalGrossPay / tripLength : 0;

        const result = {
            baseRate,
            flagRate: 0,
            effectiveRate,
            basePay,
            galleyPay,
            purserPay,
            intlOverridePay,
            languagePay,
            perDiem,
            holidayPay,
            totalGrossPay,
            netPayEstimate,
            hourlyValue,
            perDayValue
        };

        console.log(`Trip calculation for ${tripData.name}:`, {
            payYear, creditedHours, dutyHours, tripLength,
            perDiemRate, basePay, galleyPay, purserPay, intlOverridePay, languagePay, perDiem, holidayPay,
            totalGrossPay, netPayEstimate, hourlyValue, perDayValue
        });

        return result;
    } catch (error) {
        console.error('Error calculating trip pay:', error);
        return createDefaultCalculation();
    }
}

function createDefaultCalculation() {
    return {
        baseRate: 0,
        flagRate: 0,
        effectiveRate: 0,
        basePay: 0,
        galleyPay: 0,
        purserPay: 0,
        intlOverridePay: 0,
        languagePay: 0,
        perDiem: 0,
        holidayPay: 0,
        totalGrossPay: 0,
        netPayEstimate: 0,
        hourlyValue: 0,
        perDayValue: 0
    };
}

// UI state management - tracks panel visibility
const uiState = {
    isSidePanelOpen: false,
    isFocusTrapped: false
};

function toggleSidePanel(show = true) {
    // Get DOM elements when function is called
    const elements = {
        sidePanel: document.getElementById('side-panel'),
        addTripBtn: document.getElementById('add-trip-btn'),
        tripNameInput: document.getElementById('trip-name')
    };

    // Check if all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
            return;
        }
    }

    if (show) {
        elements.sidePanel.classList.remove('collapsed');
        elements.addTripBtn.style.display = 'none';
        uiState.isSidePanelOpen = true;
        
        // Focus the first input in the form
        setTimeout(() => {
            elements.tripNameInput.focus();
            
            // Setup focus trap for the side panel
            setupFocusTrap();
        }, 100);
        
        console.log('Side panel opened');
    } else {
        elements.sidePanel.classList.add('collapsed');
        elements.addTripBtn.style.display = 'flex';
        uiState.isSidePanelOpen = false;
        
        // Remove focus trap
        removeFocusTrap();
        
        console.log('Side panel closed');
    }
}

function setupFocusTrap() {
    // Remove any existing event listener first
    document.removeEventListener('keydown', handleFocusTrap);
    document.addEventListener('keydown', handleFocusTrap);
    
    // Add a return to content skip link when the panel is open
    const skipNavContainer = document.querySelector('.skip-nav-container');
    const existingReturnLink = document.getElementById('return-to-content');
    
    if (skipNavContainer && !existingReturnLink) {
        const returnLink = document.createElement('a');
        returnLink.href = "#trip-comparison";
        returnLink.className = "skip-link";
        returnLink.id = "return-to-content";
        returnLink.textContent = "Return to main content";
        skipNavContainer.appendChild(returnLink);
    }
    
    uiState.isFocusTrapped = true;
}

function handleFocusTrap(e) {
    document.removeEventListener('keydown', handleFocusTrap);
    
    // Remove the return to content link when the panel is closed
    const returnLink = document.getElementById('return-to-content');
    if (returnLink) {
        returnLink.remove();
    }
    
    uiState.isFocusTrapped = false;
}

function removeFocusTrap() {
    document.removeEventListener('keydown', handleFocusTrap);
    
    // Remove the return to content link when the panel is closed
    const returnLink = document.getElementById('return-to-content');
    if (returnLink) {
        returnLink.remove();
    }
    
    uiState.isFocusTrapped = false;
}

function resetForm() {
    // Get DOM elements when function is called
    const elements = {
        tripForm: document.getElementById('trip-form'),
        tripIdInput: document.getElementById('trip-id'),
        galleyHoursValidation: document.getElementById('galley-hours-validation'),
        purserUSHoursValidation: document.getElementById('purser-us-hours-validation'),
        purserNonUSHoursValidation: document.getElementById('purser-non-us-hours-validation'),
        holidayHoursValidation: document.getElementById('holiday-hours-validation'),
        whiteFlagToggle: document.getElementById('white-flag'),
        whiteFlagLabel: document.getElementById('white-flag-label'),
        purpleFlagToggle: document.getElementById('purple-flag'),
        purpleFlagLabel: document.getElementById('purple-flag-label'),
        galleyPayToggle: document.getElementById('galley-pay'),
        galleyPayLabel: document.getElementById('galley-pay-label'),
        purserPayToggle: document.getElementById('purser-pay'),
        purserPayLabel: document.getElementById('purser-pay-label'),
        intlOverrideToggle: document.getElementById('intl-override'),
        intlOverrideLabel: document.getElementById('intl-override-label'),
        intlPayOverrideToggle: document.getElementById('intl-pay-override'),
        intlPayOverrideLabel: document.getElementById('intl-pay-override-label'),
        languagePayToggle: document.getElementById('language-pay'),
        languagePayLabel: document.getElementById('language-pay-label'),
        holidayPayToggle: document.getElementById('holiday-pay'),
        holidayPayLabel: document.getElementById('holiday-pay-label')
    };

    // Check if all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
            return;
        }
    }

    elements.tripForm.reset();
    elements.tripIdInput.value = '';
    
    // Clear all validation states
    elements.galleyHoursValidation.style.display = 'none';
    elements.purserUSHoursValidation.style.display = 'none';
    elements.purserNonUSHoursValidation.style.display = 'none';
    elements.holidayHoursValidation.style.display = 'none';
    
    // Reset aria-invalid attributes
    const formInputs = elements.tripForm.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.style.borderColor = '';
        input.removeAttribute('aria-invalid');
    });
    
    // Hide all validation messages
    const validationMessages = elements.tripForm.querySelectorAll('.validation-message');
    validationMessages.forEach(msg => {
        msg.style.display = 'none';
    });
    
    // Update state
    state.editingTripId = null;
    
    // Reset toggle labels
    updateToggleLabel(elements.whiteFlagToggle, elements.whiteFlagLabel);
    updateToggleLabel(elements.purpleFlagToggle, elements.purpleFlagLabel);
    updateToggleLabel(elements.galleyPayToggle, elements.galleyPayLabel);
    updateToggleLabel(elements.purserPayToggle, elements.purserPayLabel);
    updateToggleLabel(elements.intlOverrideToggle, elements.intlOverrideLabel);
    updateToggleLabel(elements.intlPayOverrideToggle, elements.intlPayOverrideLabel);
    updateToggleLabel(elements.languagePayToggle, elements.languagePayLabel);
    updateToggleLabel(elements.holidayPayToggle, elements.holidayPayLabel);
    
    toggleConditionalFields();
    console.log('Form reset');
}

function toggleConditionalFields() {
    // Get DOM elements when function is called
    const elements = {
        purpleFlagToggle: document.getElementById('purple-flag'),
        purpleFlagDropdownGroup: document.getElementById('purple-flag-dropdown-group'),
        purpleFlagPremiumSelect: document.getElementById('purple-flag-premium'),
        galleyPayToggle: document.getElementById('galley-pay'),
        galleyHoursGroup: document.getElementById('galley-hours-group'),
        galleyHoursHoursInput: document.getElementById('galley-hours-hours'),
        galleyHoursMinutesInput: document.getElementById('galley-hours-minutes'),
        purserPayToggle: document.getElementById('purser-pay'),
        purserFieldsGroup: document.getElementById('purser-fields-group'),
        aircraftTypeSelect: document.getElementById('aircraft-type'),
        purserUSHoursInput: document.getElementById('purser-us-hours'),
        purserNonUSHoursInput: document.getElementById('purser-non-us-hours'),
        holidayPayToggle: document.getElementById('holiday-pay'),
        holidayHoursGroup: document.getElementById('holiday-hours-group'),
        holidayHoursInput: document.getElementById('holiday-hours')
    };

    // Check if all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
            return;
        }
    }

    // Purple Flag Dropdown
    const showPurpleFlagDropdown = elements.purpleFlagToggle.checked;
    elements.purpleFlagDropdownGroup.style.display = showPurpleFlagDropdown ? 'block' : 'none';
    elements.purpleFlagPremiumSelect.disabled = !showPurpleFlagDropdown;

    // Galley Hours
    const showGalleyHours = elements.galleyPayToggle.checked;
    elements.galleyHoursGroup.style.display = showGalleyHours ? 'block' : 'none';
    elements.galleyHoursHoursInput.disabled = !showGalleyHours;
    elements.galleyHoursMinutesInput.disabled = !showGalleyHours;

    // Purser Fields
    const showPurserFields = elements.purserPayToggle.checked;
    elements.purserFieldsGroup.style.display = showPurserFields ? 'block' : 'none';
    elements.aircraftTypeSelect.disabled = !showPurserFields;
    elements.purserUSHoursInput.disabled = !showPurserFields;
    elements.purserNonUSHoursInput.disabled = !showPurserFields;
    
    // Holiday Hours
    const showHolidayHours = elements.holidayPayToggle.checked;
    elements.holidayHoursGroup.style.display = showHolidayHours ? 'block' : 'none';
    elements.holidayHoursInput.disabled = !showHolidayHours;
    
    console.log('Conditional fields updated:', {
        purpleFlagDropdownVisible: showPurpleFlagDropdown,
        galleyHoursVisible: showGalleyHours,
        purserFieldsVisible: showPurserFields,
        holidayHoursVisible: showHolidayHours
    });
}

function showToast(message, type = 'info') {
    // Get DOM element when function is called
    const toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Replace innerHTML with safer DOM manipulation
    if (message.includes('Undo')) {
        // Split the message at "Undo" to separate text and link
        const parts = message.split(/(<a.*?Undo<\/a>)/);
        
        // Add the text part
        const textNode = document.createTextNode(parts[0]);
        toast.appendChild(textNode);
        
        // Create and add the undo link
        const undoLink = document.createElement('a');
        undoLink.href = "#";
        undoLink.id = "undo-delete";
        undoLink.textContent = "Undo";
        toast.appendChild(undoLink);
    } else {
        // Simple text message
        toast.textContent = message;
    }
    
    toastContainer.appendChild(toast);
    console.log(`Toast notification: ${message} (${type})`);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function renderTripCard(trip) {
    try {
        if (!trip || !trip.id) {
            console.error('Invalid trip data provided to renderTripCard');
            return document.createElement('div'); // Return empty div to avoid errors
        }

        const calculation = calculateTripPay(trip);
        
        const tripCardEl = document.createElement('div');
        tripCardEl.className = 'trip-card';
        tripCardEl.dataset.id = trip.id;
        
        // Add best value badge (hidden by default)
        const bestValueBadge = document.createElement('div');
        bestValueBadge.className = 'best-value-badge';
        bestValueBadge.textContent = 'Best Value';
        tripCardEl.appendChild(bestValueBadge);

        // Format trip details with fallbacks for missing data
        const safeValues = {
            name: trip.name || 'Unnamed Trip',
            payYear: trip.payYear || 'Year 1',
            whiteFlag: trip.whiteFlag === true || trip.whiteFlag === 'Yes',
            purpleFlag: trip.purpleFlag === true || trip.purpleFlag === 'Yes',
            purpleFlagPremium: trip.purpleFlagPremium || '1.5',
            creditedHoursHours: trip.creditedHoursHours || '0',
            creditedHoursMinutes: trip.creditedHoursMinutes || '0',
            tafbHours: trip.tafbHours || '0',
            tafbMinutes: trip.tafbMinutes || '0',
            tripLength: trip.tripLength || '1',
            galleyPay: trip.galleyPay || 'No',
            galleyHoursHours: trip.galleyHoursHours || '0',
            galleyHoursMinutes: trip.galleyHoursMinutes || '0',
            languagePay: trip.languagePay || 'No',
            color: trip.color || '#3a36e0'
        };

        // Create header
        const header = document.createElement('div');
        header.className = 'trip-card-header';
        header.style.backgroundColor = safeValues.color;
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'trip-title';
        titleDiv.textContent = safeValues.name;
        header.appendChild(titleDiv);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'trip-card-actions';
        
        const editAction = document.createElement('button');
        editAction.className = 'trip-card-action edit-trip';
        editAction.dataset.id = trip.id;
        editAction.textContent = '✏️';
        editAction.setAttribute('aria-label', `Edit trip ${safeValues.name}`);
        editAction.setAttribute('type', 'button');
        actionsDiv.appendChild(editAction);
        
        const deleteAction = document.createElement('button');
        deleteAction.className = 'trip-card-action delete-trip';
        deleteAction.dataset.id = trip.id;
        deleteAction.textContent = '🗑️';
        deleteAction.setAttribute('aria-label', `Delete trip ${safeValues.name}`);
        deleteAction.setAttribute('type', 'button');
        actionsDiv.appendChild(deleteAction);
        
        header.appendChild(actionsDiv);
        tripCardEl.appendChild(header);
        
        // Create body
        const body = document.createElement('div');
        body.className = 'trip-card-body';
        
        // Trip details section
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'trip-details';
        
        // Helper function to create detail rows
        const createDetailRow = (label, value) => {
            const detailRow = document.createElement('div');
            detailRow.className = 'trip-detail';
            
            const labelSpan = document.createElement('span');
            labelSpan.className = 'trip-detail-label';
            labelSpan.textContent = label;
            detailRow.appendChild(labelSpan);
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'trip-detail-value';
            valueSpan.textContent = value;
            detailRow.appendChild(valueSpan);
            
            return detailRow;
        };
        
        // Add standard details
        detailsDiv.appendChild(createDetailRow('Pay Year', safeValues.payYear));
        
        // Display flag information
        let flagText = 'None';
        if (safeValues.whiteFlag && safeValues.purpleFlag) {
            flagText = `White + Purple (${parseFloat(safeValues.purpleFlagPremium) * 100}%)`;
        } else if (safeValues.whiteFlag) {
            flagText = 'White Flag (150%)';
        } else if (safeValues.purpleFlag) {
            flagText = `Purple Flag (${parseFloat(safeValues.purpleFlagPremium) * 100}%)`;
        }
        detailsDiv.appendChild(createDetailRow('Flags', flagText));
        
        detailsDiv.appendChild(createDetailRow('Credited Hours', 
            `${safeValues.creditedHoursHours}h ${safeValues.creditedHoursMinutes}m`));
        detailsDiv.appendChild(createDetailRow('TAFB time', 
            `${safeValues.tafbHours}h ${safeValues.tafbMinutes}m`));
        
        // Conditional galley hours
        if (safeValues.galleyPay === 'Yes') {
            detailsDiv.appendChild(createDetailRow('Galley Hours', 
                `${safeValues.galleyHoursHours}h ${safeValues.galleyHoursMinutes}m`));
        }
        
        // Trip length with plural handling
        const tripLengthText = `${safeValues.tripLength} day${parseInt(safeValues.tripLength, 10) > 1 ? 's' : ''}`;
        detailsDiv.appendChild(createDetailRow('Trip Length', tripLengthText));
        
        body.appendChild(detailsDiv);
        
        // Trip summary section
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'trip-summary';
        
        // Helper function to create summary items
        const createSummaryItem = (label, value, isHighlight = false) => {
            const item = document.createElement('div');
            item.className = 'trip-summary-item';
            if (isHighlight) item.classList.add('highlight');
            
            const labelSpan = document.createElement('span');
            labelSpan.className = 'trip-summary-label';
            labelSpan.textContent = label;
            item.appendChild(labelSpan);
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'trip-summary-value';
            valueSpan.textContent = value;
            item.appendChild(valueSpan);
            
            return item;
        };
        
        // Add summary items
        summaryDiv.appendChild(createSummaryItem('Base Pay', utils.formatCurrency(calculation.basePay)));
        
        if (calculation.galleyPay > 0) {
            summaryDiv.appendChild(createSummaryItem('Galley Pay', utils.formatCurrency(calculation.galleyPay)));
        }
        
        if (calculation.purserPay > 0) {
            summaryDiv.appendChild(createSummaryItem('Purser Pay', utils.formatCurrency(calculation.purserPay)));
        }
        
        if (calculation.intlOverridePay > 0) {
            summaryDiv.appendChild(createSummaryItem('Intl Override', utils.formatCurrency(calculation.intlOverridePay)));
        }
        
        if (calculation.languagePay > 0) {
            summaryDiv.appendChild(createSummaryItem('Language Pay', utils.formatCurrency(calculation.languagePay)));
        }
        
        summaryDiv.appendChild(createSummaryItem('Per Diem', utils.formatCurrency(calculation.perDiem)));
        
        if (calculation.holidayPay > 0) {
            summaryDiv.appendChild(createSummaryItem('Holiday Pay', utils.formatCurrency(calculation.holidayPay)));
        }
        
        summaryDiv.appendChild(createSummaryItem('Gross Pay', utils.formatCurrency(calculation.totalGrossPay), true));
        
        // Net pay estimate (conditional)
        if (parseFloat(trip.retirementPercentage) > 0 || parseFloat(trip.taxRate) > 0) {
            summaryDiv.appendChild(createSummaryItem('Net Pay Est.', 
                utils.formatCurrency(calculation.netPayEstimate), true));
        } else {
            summaryDiv.appendChild(createSummaryItem('Net Pay Est.', '--', true));
        }
        
        summaryDiv.appendChild(createSummaryItem('Hourly Value', 
            `${utils.formatCurrency(calculation.hourlyValue)}/hr`));
        summaryDiv.appendChild(createSummaryItem('Daily Value', 
            `${utils.formatCurrency(calculation.perDayValue)}/day`));
        
        body.appendChild(summaryDiv);
        tripCardEl.appendChild(body);
        
        return tripCardEl;
    } catch (error) {
        console.error('Error rendering trip card:', error);
        // Return a minimal error card
        const errorCard = document.createElement('div');
        errorCard.className = 'trip-card';
        
        const errorHeader = document.createElement('div');
        errorHeader.className = 'trip-card-header';
        errorHeader.style.backgroundColor = 'var(--danger)';
        
        const errorTitle = document.createElement('div');
        errorTitle.className = 'trip-title';
        errorTitle.textContent = trip?.name || 'Error';
        errorHeader.appendChild(errorTitle);
        
        const errorActions = document.createElement('div');
        errorActions.className = 'trip-card-actions';
        
        const deleteAction = document.createElement('button');
        deleteAction.className = 'trip-card-action delete-trip';
        deleteAction.dataset.id = trip?.id || '';
        deleteAction.textContent = '🗑️';
        deleteAction.setAttribute('aria-label', `Delete error trip ${trip?.name || 'Error'}`);
        deleteAction.setAttribute('type', 'button');
        errorActions.appendChild(deleteAction);
        
        errorHeader.appendChild(errorActions);
        errorCard.appendChild(errorHeader);
        
        const errorBody = document.createElement('div');
        errorBody.className = 'trip-card-body';
        
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'There was an error rendering this trip. You may need to delete and recreate it.';
        errorBody.appendChild(errorMessage);
        
        errorCard.appendChild(errorBody);
        return errorCard;
    }
}

function renderTrips() {
    try {
        // Get DOM elements when function is called
        const elements = {
            tripComparison: document.getElementById('trip-comparison'),
            noTripsMessage: document.getElementById('no-trips-message')
        };

        // Check if required elements exist
        if (!elements.tripComparison) {
            console.error('Element not found: tripComparison');
            return;
        }

        // Clear trip comparison area safely, but preserve the no-trips-message
        const noTripsMessage = elements.tripComparison.querySelector('#no-trips-message');
        while (elements.tripComparison.firstChild) {
            elements.tripComparison.removeChild(elements.tripComparison.firstChild);
        }
        
        // Handle no trips state
        if (!state.trips || state.trips.length === 0) {
            // Try to find or create the no-trips-message
            let messageToShow = noTripsMessage || elements.noTripsMessage;
            
            if (!messageToShow) {
                // Create a new no-trips-message if it doesn't exist
                messageToShow = document.createElement('div');
                messageToShow.className = 'no-trips-message';
                messageToShow.id = 'no-trips-message';
                messageToShow.innerHTML = `
                    <h2>No trips to compare yet</h2>
                    <p>Click the "+" button to add your first trip. You can add multiple trips to compare their value and find the best option.</p>
                    <button class="btn btn-primary" id="first-trip-btn" aria-label="Add your first trip">Add Your First Trip</button>
                `;
            }
            
            elements.tripComparison.appendChild(messageToShow);
            messageToShow.style.display = 'flex';
            
            // Add event listener to the first trip button if it exists
            const firstTripBtn = messageToShow.querySelector('#first-trip-btn');
            if (firstTripBtn) {
                firstTripBtn.addEventListener('click', firstTripBtnHandler);
            }
            
            saveTripsToLocalStorage();
            return;
        }
        
        // Hide the no-trips-message if it exists
        if (elements.noTripsMessage) {
            elements.noTripsMessage.style.display = 'none';
        }

        // Find the best value trip
        let bestValueTripId = null;
        let bestMetric = -Infinity;
        
        state.trips.forEach(trip => {
            try {
                const calc = calculateTripPay(trip);
                if (calc.perDayValue > bestMetric) {
                    bestMetric = calc.perDayValue;
                    bestValueTripId = trip.id;
                }
            } catch (error) {
                console.error(`Error calculating best value for trip ${trip.name}:`, error);
            }
        });

        console.log(`Best value trip identified: ${bestValueTripId} with value ${utils.formatCurrency(bestMetric)}/day`);

        // Render each card
        state.trips.forEach(trip => {
            try {
                const card = renderTripCard(trip);
                
                // Apply best trip styling if applicable
                if (trip.id === bestValueTripId && state.trips.length > 1) {
                    card.classList.add('best-trip');
                    card.querySelector('.best-value-badge').style.display = 'block';
                }
                
                elements.tripComparison.appendChild(card);

                // Add event listeners for edit/delete
                const editButton = card.querySelector(`.edit-trip[data-id="${trip.id}"]`);
                const deleteButton = card.querySelector(`.delete-trip[data-id="${trip.id}"]`);
                
                if (editButton) {
                    editButton.addEventListener('click', () => editTrip(trip.id));
                }
                
                if (deleteButton) {
                    deleteButton.addEventListener('click', () => deleteTrip(trip.id));
                }
            } catch (error) {
                console.error(`Error rendering trip ${trip.name}:`, error);
            }
        });

        saveTripsToLocalStorage();
    } catch (error) {
        console.error('Error rendering trips:', error);
        showToast('Error displaying trips. Please refresh the page.', 'error');
    }
}

function saveTripsToLocalStorage() {
    try {
        if (!state.trips) {
            console.warn('No trips to save to localStorage');
            return;
        }
        
        // Create data structure with version information
        const storageData = {
            version: constants.VERSION,
            lastUpdated: new Date().toISOString(),
            tripCount: state.trips.length,
            trips: state.trips
        };
        
        localStorage.setItem(constants.STORAGE_KEY, JSON.stringify(storageData));
        console.log(`Saved ${state.trips.length} trips to local storage`);
    } catch (error) {
        console.error('Error saving trips to localStorage:', error);
        showToast('Error saving your trips. Some data may be lost if you refresh.', 'error');
    }
}

function loadTripsFromLocalStorage() {
    try {
        const saved = localStorage.getItem(constants.STORAGE_KEY);
        if (!saved) {
            console.log('No saved trips found in localStorage');
            state.trips = [];
            return;
        }
        
        const parsedData = JSON.parse(saved);
        
        // Handle both new format (with version) and old format (just array)
        if (Array.isArray(parsedData)) {
            // Old format - direct array
            state.trips = parsedData;
            console.log(`Loaded ${state.trips.length} trips from localStorage (legacy format)`);
        } else if (parsedData && parsedData.trips && Array.isArray(parsedData.trips)) {
            // New format - object with trips array
            state.trips = parsedData.trips;
            console.log(`Loaded ${state.trips.length} trips from localStorage (v${parsedData.version || 'unknown'})`);
        } else {
            console.error('Invalid data format in localStorage');
            state.trips = [];
            showToast('Could not load saved trips due to data format issues', 'error');
            return;
        }
        
        // Validate loaded trips
        state.trips = state.trips.filter(trip => {
            return trip && typeof trip === 'object' && trip.id && trip.name;
        });
        
        renderTrips();
    } catch (error) {
        console.error('Error loading trips from localStorage:', error);
        showToast('Error loading your saved trips', 'error');
        state.trips = [];
    }
}

function addTrip(tripData) {
    try {
        // Save state for potential undo
        history.saveState('add', 'new', state.trips);
        
        const newTrip = {
            id: utils.generateId(),
            color: utils.getRandomColor(),
            ...tripData
        };
        
        state.trips.push(newTrip);
        renderTrips();
        console.log(`Added new trip: ${newTrip.name}`);
        showToast(`Trip "${newTrip.name}" added successfully`, 'success');
        return true;
    } catch (error) {
        console.error('Error adding trip:', error);
        showToast('Error adding trip', 'error');
        return false;
    }
}

function updateTrip(tripId, tripData) {
    try {
        const index = state.trips.findIndex(t => t.id === tripId);
        if (index === -1) {
            showToast('Trip not found', 'error');
            return false;
        }
        
        // Save state for potential undo
        history.saveState('update', tripId, state.trips);
        
        const oldColor = state.trips[index].color;
        state.trips[index] = {
            ...tripData,
            id: tripId,
            color: oldColor
        };
        
        renderTrips();
        console.log(`Updated trip: ${tripData.name}`);
        showToast(`Trip "${tripData.name}" updated successfully`, 'success');
        return true;
    } catch (error) {
        console.error('Error updating trip:', error);
        showToast('Error updating trip', 'error');
        return false;
    }
}

function deleteTrip(tripId) {
    try {
        const index = state.trips.findIndex(t => t.id === tripId);
        if (index === -1) {
            showToast('Trip not found', 'error');
            return false;
        }
        
        const tripName = state.trips[index].name;
        
        // Confirm before deleting
        if (!confirm(`Are you sure you want to delete the trip "${tripName}"?`)) {
            return false;
        }
        
        // Save state for potential undo
        history.saveState('delete', tripId, state.trips);
        
        state.trips.splice(index, 1);
        renderTrips();
        console.log(`Deleted trip: ${tripName}`);
        showToast(`Trip "${tripName}" deleted. <a href="#" id="undo-delete">Undo</a>`, 'info');
        
        // Setup undo link
        setTimeout(() => {
            const undoLink = document.getElementById('undo-delete');
            if (undoLink) {
                undoLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    history.undoLastOperation(showToast, renderTrips, (newTrips) => {
                        state.trips = newTrips;
                    });
                });
            }
        }, 10);
        
        return true;
    } catch (error) {
        console.error('Error deleting trip:', error);
        showToast('Error deleting trip', 'error');
        return false;
    }
}

function editTrip(tripId) {
    // Get DOM elements when function is called
    const elements = {
        panelTitle: document.getElementById('panel-title'),
        tripIdInput: document.getElementById('trip-id'),
        tripNameInput: document.getElementById('trip-name'),
        payYearSelect: document.getElementById('pay-year'),
        whiteFlagToggle: document.getElementById('white-flag'),
        whiteFlagLabel: document.getElementById('white-flag-label'),
        purpleFlagToggle: document.getElementById('purple-flag'),
        purpleFlagLabel: document.getElementById('purple-flag-label'),
        purpleFlagPremiumSelect: document.getElementById('purple-flag-premium'),
        creditedHoursHoursInput: document.getElementById('credited-hours-hours'),
        creditedHoursMinutesInput: document.getElementById('credited-hours-minutes'),
        tafbHoursInput: document.getElementById('tafb-hours'),
        tafbMinutesInput: document.getElementById('tafb-minutes'),
        tripLengthSelect: document.getElementById('trip-length'),
        galleyPayToggle: document.getElementById('galley-pay'),
        galleyPayLabel: document.getElementById('galley-pay-label'),
        galleyHoursHoursInput: document.getElementById('galley-hours-hours'),
        galleyHoursMinutesInput: document.getElementById('galley-hours-minutes'),
        purserPayToggle: document.getElementById('purser-pay'),
        purserPayLabel: document.getElementById('purser-pay-label'),
        aircraftTypeSelect: document.getElementById('aircraft-type'),
        purserUSHoursInput: document.getElementById('purser-us-hours'),
        purserNonUSHoursInput: document.getElementById('purser-non-us-hours'),
        intlOverrideToggle: document.getElementById('intl-override'),
        intlOverrideLabel: document.getElementById('intl-override-label'),
        intlPayOverrideToggle: document.getElementById('intl-pay-override'),
        intlPayOverrideLabel: document.getElementById('intl-pay-override-label'),
        languagePayToggle: document.getElementById('language-pay'),
        languagePayLabel: document.getElementById('language-pay-label'),
        holidayPayToggle: document.getElementById('holiday-pay'),
        holidayPayLabel: document.getElementById('holiday-pay-label'),
        holidayHoursInput: document.getElementById('holiday-hours'),
        retirementPercentageInput: document.getElementById('retirement-percentage'),
        taxRateInput: document.getElementById('tax-rate')
    };

    // Check if all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
            return;
        }
    }

    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Set form to edit mode
    elements.panelTitle.textContent = 'Edit Trip';
    elements.tripIdInput.value = trip.id;
    state.editingTripId = trip.id;
    
    // Fill form with trip data
    elements.tripNameInput.value = trip.name;
    elements.payYearSelect.value = trip.payYear;
    
    // Handle new white/purple flag structure or legacy flagRate
    if (trip.whiteFlag !== undefined) {
        elements.whiteFlagToggle.checked = trip.whiteFlag === true || trip.whiteFlag === 'Yes';
        elements.purpleFlagToggle.checked = trip.purpleFlag === true || trip.purpleFlag === 'Yes';
        elements.purpleFlagPremiumSelect.value = trip.purpleFlagPremium || '1.5';
    } else if (trip.flagRate !== undefined) {
        // Legacy support for old flagRate
        elements.whiteFlagToggle.checked = trip.flagRate === 'Yes';
        elements.purpleFlagToggle.checked = false;
        elements.purpleFlagPremiumSelect.value = '1.5';
    } else {
        // Default values
        elements.whiteFlagToggle.checked = false;
        elements.purpleFlagToggle.checked = false;
        elements.purpleFlagPremiumSelect.value = '1.5';
    }
    elements.creditedHoursHoursInput.value = trip.creditedHoursHours;
    elements.creditedHoursMinutesInput.value = trip.creditedHoursMinutes;
    elements.tafbHoursInput.value = trip.tafbHours;
    elements.tafbMinutesInput.value = trip.tafbMinutes;
    elements.tripLengthSelect.value = trip.tripLength;
    elements.galleyPayToggle.checked = trip.galleyPay === 'Yes';
    
    // Handle both old (single field) and new (hours/minutes) formats for galley hours
    if (trip.galleyHoursHours !== undefined) {
        elements.galleyHoursHoursInput.value = trip.galleyHoursHours || 0;
        elements.galleyHoursMinutesInput.value = trip.galleyHoursMinutes || 0;
    } else if (trip.galleyHours !== undefined) {
        // Convert old decimal format to hours/minutes
        const galleyHoursDecimal = parseFloat(trip.galleyHours) || 0;
        const galleyHoursWhole = Math.floor(galleyHoursDecimal);
        const galleyMinutes = Math.round((galleyHoursDecimal - galleyHoursWhole) * 60);
        
        elements.galleyHoursHoursInput.value = galleyHoursWhole;
        elements.galleyHoursMinutesInput.value = galleyMinutes;
    } else {
        // Default values
        elements.galleyHoursHoursInput.value = 0;
        elements.galleyHoursMinutesInput.value = 0;
    }
    
    elements.purserPayToggle.checked = trip.purserPay === 'Yes';
    elements.aircraftTypeSelect.value = trip.aircraftType;
    elements.purserUSHoursInput.value = trip.purserUSHours || 0;
    elements.purserNonUSHoursInput.value = trip.purserNonUSHours || 0;
    elements.intlOverrideToggle.checked = trip.intlOverride === 'Yes';
    elements.intlPayOverrideToggle.checked = trip.intlPayOverride === 'Yes';
    elements.languagePayToggle.checked = trip.languagePay === 'Yes';
    elements.holidayPayToggle.checked = trip.holidayPay === 'Yes';
    elements.holidayHoursInput.value = trip.holidayHours || 0;
    elements.retirementPercentageInput.value = trip.retirementPercentage;
    elements.taxRateInput.value = trip.taxRate;
    
    // Update toggle labels
    updateToggleLabel(elements.whiteFlagToggle, elements.whiteFlagLabel);
    updateToggleLabel(elements.purpleFlagToggle, elements.purpleFlagLabel);
    updateToggleLabel(elements.galleyPayToggle, elements.galleyPayLabel);
    updateToggleLabel(elements.purserPayToggle, elements.purserPayLabel);
    updateToggleLabel(elements.intlOverrideToggle, elements.intlOverrideLabel);
    updateToggleLabel(elements.intlPayOverrideToggle, elements.intlPayOverrideLabel);
    updateToggleLabel(elements.languagePayToggle, elements.languagePayLabel);
    updateToggleLabel(elements.holidayPayToggle, elements.holidayPayLabel);
    
    // Show conditional fields
    toggleConditionalFields();
    
    // Show panel
    toggleSidePanel(true);
    
    console.log(`Editing trip: ${trip.name}`);
}

function exportTrips() {
    if (state.trips.length === 0) {
        showToast('No trips to export', 'warning');
        return;
    }
    
    const exportData = {
        trips: state.trips,
        exportDate: new Date().toISOString(),
        version: constants.VERSION
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'flight_trips_export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log('Trips exported');
    showToast('Trips exported successfully', 'success');
}

function clearAllTrips() {
    if (state.trips.length === 0) return;
    
    if (confirm('Are you sure you want to clear all trips? This cannot be undone.')) {
        state.trips = [];
        renderTrips();
        console.log('All trips cleared');
        showToast('All trips cleared', 'info');
    }
}

function validateForm() {
    try {
        // Get DOM elements when function is called
        const elements = {
            tripNameInput: document.getElementById('trip-name'),
            payYearSelect: document.getElementById('pay-year'),
            creditedHoursHoursInput: document.getElementById('credited-hours-hours'),
            creditedHoursMinutesInput: document.getElementById('credited-hours-minutes'),
            tafbHoursInput: document.getElementById('tafb-hours'),
            tafbMinutesInput: document.getElementById('tafb-minutes'),
            tripLengthSelect: document.getElementById('trip-length'),
            galleyHoursValidation: document.getElementById('galley-hours-validation'),
            galleyHoursHoursInput: document.getElementById('galley-hours-hours'),
            purserUSHoursValidation: document.getElementById('purser-us-hours-validation'),
            purserUSHoursInput: document.getElementById('purser-us-hours')
        };

        // Check if all elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Element not found: ${key}`);
                return false;
            }
        }

        const requiredFields = [
            { element: elements.tripNameInput, message: "Trip name is required" },
            { element: elements.payYearSelect, message: "Pay year is required" },
            { element: elements.creditedHoursHoursInput, message: "Credited hours is required" },
            { element: elements.creditedHoursMinutesInput, message: "Credited minutes is required" },
            { element: elements.tafbHoursInput, message: "TAFB hours is required" },
            { element: elements.tafbMinutesInput, message: "TAFB minutes is required" },
            { element: elements.tripLengthSelect, message: "Trip length is required" }
        ];
        
        let isValid = true;
        let firstInvalidField = null;
        
        // Check each required field
        requiredFields.forEach(field => {
            // Get or create error message element
            let errorMsgId = `${field.element.id}-error`;
            let errorMsgElement = document.getElementById(errorMsgId);
            
            if (!errorMsgElement) {
                errorMsgElement = document.createElement('div');
                errorMsgElement.id = errorMsgId;
                errorMsgElement.className = 'validation-message';
                errorMsgElement.setAttribute('role', 'alert');
                errorMsgElement.setAttribute('aria-live', 'assertive');
                field.element.parentNode.appendChild(errorMsgElement);
                
                // Set aria-describedby on the input
                field.element.setAttribute('aria-describedby', errorMsgId);
            }
            
            if (!field.element.value.trim()) {
                field.element.style.borderColor = 'var(--danger)';
                field.element.setAttribute('aria-invalid', 'true');
                
                // Update error message
                errorMsgElement.textContent = field.message;
                errorMsgElement.style.display = 'block';
                
                if (!firstInvalidField) firstInvalidField = field.element;
                isValid = false;
            } else {
                field.element.style.borderColor = '';
                field.element.removeAttribute('aria-invalid');
                errorMsgElement.style.display = 'none';
            }
        });
        
        // Check hour validations
        if (!validateHours()) {
            isValid = false;
            
            // If there's no first invalid field yet, set it to the first visible validation message
            if (!firstInvalidField) {
                if (elements.galleyHoursValidation.style.display === 'block') {
                    firstInvalidField = elements.galleyHoursHoursInput;
                } else if (elements.purserUSHoursValidation.style.display === 'block') {
                    firstInvalidField = elements.purserUSHoursInput;
                }
            }
        }
        
        // Focus the first invalid field
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
        
        return isValid;
    } catch (error) {
        console.error('Error validating form:', error);
        return false;
    }
}


function tripFormSubmitHandler(e) {
    e.preventDefault();

    // 1) If invalid, bail out immediately
    if (!validateForm()) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }

    // Get DOM elements when function is called
    const elements = {
        tripNameInput: document.getElementById('trip-name'),
        payYearSelect: document.getElementById('pay-year'),
        whiteFlagToggle: document.getElementById('white-flag'),
        purpleFlagToggle: document.getElementById('purple-flag'),
        purpleFlagPremiumSelect: document.getElementById('purple-flag-premium'),
        creditedHoursHoursInput: document.getElementById('credited-hours-hours'),
        creditedHoursMinutesInput: document.getElementById('credited-hours-minutes'),
        tafbHoursInput: document.getElementById('tafb-hours'),
        tafbMinutesInput: document.getElementById('tafb-minutes'),
        tripLengthSelect: document.getElementById('trip-length'),
        galleyPayToggle: document.getElementById('galley-pay'),
        galleyHoursHoursInput: document.getElementById('galley-hours-hours'),
        galleyHoursMinutesInput: document.getElementById('galley-hours-minutes'),
        purserPayToggle: document.getElementById('purser-pay'),
        aircraftTypeSelect: document.getElementById('aircraft-type'),
        purserUSHoursInput: document.getElementById('purser-us-hours'),
        purserNonUSHoursInput: document.getElementById('purser-non-us-hours'),
        intlOverrideToggle: document.getElementById('intl-override'),
        intlPayOverrideToggle: document.getElementById('intl-pay-override'),
        languagePayToggle: document.getElementById('language-pay'),
        holidayPayToggle: document.getElementById('holiday-pay'),
        holidayHoursInput: document.getElementById('holiday-hours'),
        retirementPercentageInput: document.getElementById('retirement-percentage'),
        taxRateInput: document.getElementById('tax-rate')
    };

    // Check if all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
            return;
        }
    }

    // 2) Build your tripData object
    const tripData = {
        name: elements.tripNameInput.value,
        payYear: elements.payYearSelect.value,
        whiteFlag: elements.whiteFlagToggle.checked,
        purpleFlag: elements.purpleFlagToggle.checked,
        purpleFlagPremium: elements.purpleFlagPremiumSelect.value,
        creditedHoursHours: elements.creditedHoursHoursInput.value,
        creditedHoursMinutes: elements.creditedHoursMinutesInput.value,
        tafbHours: elements.tafbHoursInput.value,
        tafbMinutes: elements.tafbMinutesInput.value,
        tripLength: elements.tripLengthSelect.value,
        galleyPay: elements.galleyPayToggle.checked ? 'Yes' : 'No',
        galleyHoursHours: elements.galleyHoursHoursInput.value,
        galleyHoursMinutes: elements.galleyHoursMinutesInput.value,
        purserPay: elements.purserPayToggle.checked ? 'Yes' : 'No',
        aircraftType: elements.aircraftTypeSelect.value,
        purserUSHours: elements.purserUSHoursInput.value,
        purserNonUSHours: elements.purserNonUSHoursInput.value,
        intlOverride: elements.intlOverrideToggle.checked ? 'Yes' : 'No',
        intlPayOverride: elements.intlPayOverrideToggle.checked ? 'Yes' : 'No',
        languagePay: elements.languagePayToggle.checked ? 'Yes' : 'No',
        holidayPay: elements.holidayPayToggle.checked ? 'Yes' : 'No',
        holidayHours: elements.holidayHoursInput.value,
        retirementPercentage: elements.retirementPercentageInput.value,
        taxRate: elements.taxRateInput.value
    };

    // 3) Add or update
    if (state.editingTripId) {
        updateTrip(state.editingTripId, tripData);
    } else {
        addTrip(tripData);
    }

    // 4) Clear the form & close the panel
    resetForm();
    toggleSidePanel(false);
}

function addTripBtnHandler() {
    resetForm();
    const panelTitle = document.getElementById('panel-title');
    if (panelTitle) {
        panelTitle.textContent = 'Add New Trip';
    }
    toggleSidePanel(true);
}

function firstTripBtnHandler() {
    resetForm();
    const panelTitle = document.getElementById('panel-title');
    if (panelTitle) {
        panelTitle.textContent = 'Add New Trip';
    }
    toggleSidePanel(true);    
}

function panelCloseBtnHandler() {
    toggleSidePanel(false);
}

function cancelBtnHandler() {
    toggleSidePanel(false);
}

function clearAllBtnHandler() {
    clearAllTrips();
}

function exportBtnHandler() {
    exportTrips();
}

function numericInputValidations() {
    // Get DOM elements when function is called
    const elements = {
        creditedHoursHoursInput: document.getElementById('credited-hours-hours'),
        creditedHoursMinutesInput: document.getElementById('credited-hours-minutes'),
        tafbHoursInput: document.getElementById('tafb-hours'),
        tafbMinutesInput: document.getElementById('tafb-minutes'),
        galleyHoursHoursInput: document.getElementById('galley-hours-hours'),
        galleyHoursMinutesInput: document.getElementById('galley-hours-minutes'),
        purserUSHoursInput: document.getElementById('purser-us-hours'),
        purserNonUSHoursInput: document.getElementById('purser-non-us-hours'),
        holidayHoursInput: document.getElementById('holiday-hours'),
        retirementPercentageInput: document.getElementById('retirement-percentage'),
        taxRateInput: document.getElementById('tax-rate')
    };

    // Check if all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
            return;
        }
    }

    const numericInputs = [
        elements.creditedHoursHoursInput, 
        elements.creditedHoursMinutesInput,
        elements.tafbHoursInput,
        elements.tafbMinutesInput,
        elements.galleyHoursHoursInput,
        elements.galleyHoursMinutesInput,
        elements.purserUSHoursInput,
        elements.purserNonUSHoursInput,
        elements.holidayHoursInput,
        elements.retirementPercentageInput,
        elements.taxRateInput
    ];
    
    // Ensure minutes are within 0-59 range
    const minuteInputs = [
        elements.creditedHoursMinutesInput, 
        elements.tafbMinutesInput,
        elements.galleyHoursMinutesInput
    ];
    
    minuteInputs.forEach(input => {
        input.addEventListener('change', function() {
            const val = parseInt(this.value, 10);
            if (isNaN(val)) {
                this.value = '0';
            } else if (val < 0) {
                this.value = '0';
            } else if (val > 59) {
                this.value = '59';
            }
        });
    });
    
    // Ensure all numeric inputs are non-negative
    numericInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Allow empty or valid positive numbers only
            if (this.value && !/^\d*\.?\d*$/.test(this.value)) {
                this.value = this.value.replace(/[^\d.]/g, '');
            }
        });
        
        input.addEventListener('change', function() {
            if (this.value === '') {
                this.value = '0';
            }
            const val = parseFloat(this.value);
            if (isNaN(val) || val < 0) {
                this.value = '0';
            }
        });
    });
    
    // Specific validation for retirement and tax percentage (0-100)
    const percentageInputs = [elements.retirementPercentageInput, elements.taxRateInput];
    percentageInputs.forEach(input => {
        input.addEventListener('change', function() {
            const val = parseFloat(this.value);
            if (isNaN(val)) {
                this.value = '0';
            } else if (val < 0) {
                this.value = '0';
            } else if (val > 100) {
                this.value = '100';
            }
        });
    });
}

function keyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Only handle if not in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Alt+1: Jump to main content
        if (e.altKey && e.key === '1') {
            e.preventDefault();
            const mainContent = document.getElementById('trip-comparison');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        // Alt+2: Jump to add trip button
        if (e.altKey && e.key === '2') {
            e.preventDefault();
            const addTripBtn = document.getElementById('add-trip-btn');
            if (addTripBtn) {
                addTripBtn.focus();
            }
        }
        
        // Ctrl+N or Command+N: New Trip
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const sidePanel = document.getElementById('side-panel');
            if (sidePanel && sidePanel.classList.contains('collapsed')) {
                resetForm();
                const panelTitle = document.getElementById('panel-title');
                if (panelTitle) {
                    panelTitle.textContent = 'Add New Trip';
                }
                toggleSidePanel(true);
            }
        }
        
        // Escape: Close panel
        if (e.key === 'Escape') {
            const sidePanel = document.getElementById('side-panel');
            if (sidePanel && !sidePanel.classList.contains('collapsed')) {
                toggleSidePanel(false);
            }
        }
        
        // Ctrl+Z or Command+Z: Undo last operation
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            history.undoLastOperation(showToast, renderTrips, (newTrips) => {
                state.trips = newTrips;
            });
        }
        
        // Ctrl+S or Command+S: Save current trip
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            const sidePanel = document.getElementById('side-panel');
            if (sidePanel && !sidePanel.classList.contains('collapsed')) {
                e.preventDefault();
                const saveTripBtn = document.getElementById('save-trip-btn');
                if (saveTripBtn) {
                    saveTripBtn.click();
                }
            }
        }
    });
}

function init() {
    setupDOMElements();
    setupEventListeners();
    setupToggleListeners();
    loadTripsFromLocalStorage();
    toggleConditionalFields();
    numericInputValidations();
    keyboardShortcuts();
    adjustAddTripPanel(); // Adjust panel on page load
}

function setupDOMElements() {
    // This function is no longer needed since we're getting DOM elements when needed
    // Keeping it for backward compatibility but it's essentially a no-op now
    console.log('DOM elements will be retrieved when needed');
}

function setupEventListeners() {
    // Get DOM elements when function is called
    const elements = {
        addTripBtn: document.getElementById('add-trip-btn'),
        firstTripBtn: document.getElementById('first-trip-btn'),
        panelClose: document.getElementById('panel-close'),
        cancelBtn: document.getElementById('cancel-btn'),
        tripForm: document.getElementById('trip-form'),
        exportBtn: document.getElementById('export-btn'),
        clearAllBtn: document.getElementById('clear-all-btn')
    };

    // Check if all elements exist and add event listeners
    if (elements.addTripBtn) {
        elements.addTripBtn.addEventListener('click', addTripBtnHandler);
    }
    
    if (elements.firstTripBtn) {
        elements.firstTripBtn.addEventListener('click', firstTripBtnHandler);
    }
    
    if (elements.panelClose) {
        elements.panelClose.addEventListener('click', panelCloseBtnHandler);
    }
    
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', cancelBtnHandler);
    }
    
    if (elements.tripForm) {
        elements.tripForm.addEventListener('submit', tripFormSubmitHandler);
    }
    
    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', exportBtnHandler);
    }
    
    if (elements.clearAllBtn) {
        elements.clearAllBtn.addEventListener('click', clearAllBtnHandler);
    }
    
    // Resize event listener for panel adjustment
    window.addEventListener('resize', adjustAddTripPanel);
    
    console.log('Event listeners initialized');
}

function adjustAddTripPanel() {
    try {
        // Only apply adjustments on mobile/small screens or touch devices
        const isMobile = window.innerWidth <= 1024 || 
                       (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches);
        
        if (!isMobile) {
            return; // Don't adjust on desktop
        }
        
        // Select the header and side panel
        const header = document.querySelector('.header');
        const sidePanel = document.querySelector('.side-panel');
        
        if (!header || !sidePanel) {
            console.warn('Header or side panel not found for adjustment');
            return;
        }
        
        // Measure header height and viewport height
        const headerHeight = header.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // Set panel position and height with !important to override CSS
        sidePanel.style.setProperty('top', headerHeight + 'px', 'important');
        sidePanel.style.setProperty('height', (viewportHeight - headerHeight) + 'px', 'important');
        sidePanel.style.setProperty('overflow-y', 'auto', 'important');
        
        // Ensure position is fixed for mobile and proper z-index
        sidePanel.style.setProperty('position', 'fixed', 'important');
        sidePanel.style.setProperty('z-index', '999', 'important');
        
        // Ensure header has proper z-index
        header.style.setProperty('z-index', '1000', 'important');
        
        console.log(`Adjusted side panel: top=${headerHeight}px, height=${viewportHeight - headerHeight}px, z-index=999`);
    } catch (error) {
        console.error('Error adjusting Add Trip panel:', error);
    }
}

// Create main application namespace
const FlightApp = {
    // Constants
    constants: constants,
    
    // Master Pay Data - pay rates by year
    masterPayData: masterPayData,
    
    // Application state
    state: state,
    
    // Trip operations history for potential undo
    history: history,

    // Utility methods
    utils: utils,

    // All functions are now standalone and don't need to be referenced here
    // They can be called directly by name
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    init();
    
    // Validation for "Hours on Holiday" field
    const holidayHoursInput = document.getElementById('holiday-hours');
    const holidayHoursValidation = document.getElementById('holiday-hours-validation');
    
    if (holidayHoursInput && holidayHoursValidation) {
        function validateHolidayHoursInput() {
            let value = parseFloat(holidayHoursInput.value);
            if (isNaN(value)) value = 0;
            if (value > 24) {
                holidayHoursInput.value = 24;
                holidayHoursValidation.textContent = "Maximum is 24 hours";
                holidayHoursValidation.style.display = "block";
                holidayHoursInput.setAttribute('aria-invalid', 'true');
            } else {
                holidayHoursValidation.style.display = "none";
                holidayHoursInput.removeAttribute('aria-invalid');
            }
        }
        
        // Validate on input and blur
        holidayHoursInput.addEventListener('input', validateHolidayHoursInput);
        holidayHoursInput.addEventListener('blur', validateHolidayHoursInput);
    }
});

// Also validate on form submission (inside your validateForm or tripFormSubmitHandler)
// Add this call in your validateForm function:
// validateHolidayHoursInput();

// --- White/Purple Flag UI Logic ---


// --- Calculation Logic for Premiums ---
function getFlagPremiumMultiplier() {
  // Get DOM elements when function is called
  const whiteFlagToggle = document.getElementById('white-flag');
  const purpleFlagToggle = document.getElementById('purple-flag');
  const purpleFlagPremiumSelect = document.getElementById('purple-flag-premium');
  
  let premiumMultiplier = 1;
  if (whiteFlagToggle && whiteFlagToggle.checked) {
    premiumMultiplier *= 1.5;
  }
  if (purpleFlagToggle && purpleFlagToggle.checked) {
    const purplePremium = parseFloat(purpleFlagPremiumSelect?.value) || 1;
    premiumMultiplier *= purplePremium;
  }
  return premiumMultiplier;
}
// Usage: let payWithPremium = basePay * getFlagPremiumMultiplier();

// Dynamically adjust main-content margin-top for desktop fixed header
function adjustDesktopMainContentMargin() {
    const header = document.querySelector('.header');
    const mainContent = document.querySelector('.main-content');
    if (!header || !mainContent) return;
    if (window.innerWidth >= 1024) {
        const headerHeight = header.offsetHeight;
        mainContent.style.marginTop = headerHeight + 'px';
    } else {
        mainContent.style.marginTop = '';
    }
}
window.addEventListener('DOMContentLoaded', adjustDesktopMainContentMargin);
window.addEventListener('resize', adjustDesktopMainContentMargin);

// Log header height and CSS variable at runtime (mobile only)
function logHeaderHeightAndVar() {
    if (window.innerWidth > 1024) return;
    const header = document.querySelector('.header');
    if (!header) return;
    const computed = getComputedStyle(header);
    const cssVar = computed.getPropertyValue('--header-height');
    console.log('[Header Height Debug] offsetHeight:', header.offsetHeight, 'CSS var --header-height:', cssVar);
}
window.addEventListener('DOMContentLoaded', logHeaderHeightAndVar);
window.addEventListener('resize', logHeaderHeightAndVar);

function adjustMobileHeaderSpacing() {
  const header = document.querySelector('.header');
  const sidePanel = document.querySelector('.side-panel');
  const mainContent = document.querySelector('.main-content');
  if (!header) return;

  if (
    window.innerWidth <= 1024 ||
    (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches)
  ) {
    const headerHeight = header.offsetHeight;
    if (sidePanel) {
      sidePanel.style.top = headerHeight + 'px';
      sidePanel.style.height = `calc(100vh - ${headerHeight}px)`;
    }
    if (mainContent) {
      mainContent.style.marginTop = headerHeight + 'px';
    }

    // Debug log
    const computed = getComputedStyle(header);
    const cssVar = computed.getPropertyValue('--header-height');
    console.log('[Header Height Debug] offsetHeight:', headerHeight, 'CSS var --header-height:', cssVar);
  } else {
    if (sidePanel) {
      sidePanel.style.top = '';
      sidePanel.style.height = '';
    }
    if (mainContent) {
      mainContent.style.marginTop = '';
    }
  }
}
window.addEventListener('DOMContentLoaded', adjustMobileHeaderSpacing);
window.addEventListener('resize', adjustMobileHeaderSpacing);