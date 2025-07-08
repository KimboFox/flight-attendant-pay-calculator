/**
 * forms.js — Form Handling
 * 
 * This file handles all the form stuff - like when you type in the trip form,
 * it validates what you entered, calculates pay, and makes sure everything
 * looks good before saving.
 * 
 * What's in here:
 * - Check if form fields are filled out correctly
 * - Calculate trip earnings automatically
 * - Show error messages if something's wrong
 * - Handle form submission (saving trips)
 * - Clear forms and reset everything
 * 
 * This makes sure your trip data is correct before saving it!
 */

// ============================================================================
// FORM VALIDATION (Check if form data is correct)
// ============================================================================

/**
 * Check if all required form fields are filled out
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateTripForm(formData) {
    const errors = [];
    
    // Check trip name
    if (!formData.name || formData.name.trim() === '') {
        errors.push('Trip name is required');
    }
    // Check pay year
    if (!formData.payYear || formData.payYear.trim() === '') {
        errors.push('Pay year is required');
    }
    // Check trip length
    if (!formData.tripLength || formData.tripLength.trim() === '') {
        errors.push('Trip length (days) is required');
    }
    // Check credited hours
    if (!formData.creditedHoursHours || formData.creditedHoursHours.trim() === '') {
        errors.push('Credited hours (hours) is required');
    }
    if (!formData.creditedHoursMinutes || formData.creditedHoursMinutes.trim() === '') {
        errors.push('Credited hours (minutes) is required');
    }
    // Check TAFB time
    if (!formData.tafbHours || formData.tafbHours.trim() === '') {
        errors.push('TAFB time (hours) is required');
    }
    if (!formData.tafbMinutes || formData.tafbMinutes.trim() === '') {
        errors.push('TAFB time (minutes) is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Calculate trip earnings based on duration and pay rate
 * @param {number} duration - Trip duration in hours
 * @param {number} payRate - Pay rate per hour
 * @returns {number} - Total earnings for the trip
 */
function calculateTripEarnings(duration, payRate) {
    const durationNum = parseFloat(duration) || 0;
    const payRateNum = parseFloat(payRate) || 0;
    
    return durationNum * payRateNum;
}

/**
 * Format earnings for display
 * @param {number} earnings - The earnings amount
 * @returns {string} - Formatted earnings string
 */
function formatEarnings(earnings) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(earnings);
}

// ============================================================================
// FORM DATA COLLECTION (Get data from form fields)
// ============================================================================

/**
 * Get all form data from the trip form
 * @returns {Object} - The form data object
 */
function getFormData() {
    const form = document.getElementById('trip-form');
    if (!form) {
        console.error('Trip form not found');
        return {};
    }
    
    const formData = {
        name: getFormFieldValue('trip-name'),
        payYear: getFormFieldValue('pay-year'),
        tripLength: getFormFieldValue('trip-length'),
        creditedHoursHours: getFormFieldValue('credited-hours-hours'),
        creditedHoursMinutes: getFormFieldValue('credited-hours-minutes'),
        tafbHours: getFormFieldValue('tafb-hours'),
        tafbMinutes: getFormFieldValue('tafb-minutes'),
        whiteFlag: document.getElementById('white-flag')?.checked || false,
        purpleFlag: document.getElementById('purple-flag')?.checked || false,
        purpleFlagPremium: getFormFieldValue('purple-flag-premium'),
        galleyPay: document.getElementById('galley-pay')?.checked || false,
        galleyHoursHours: getFormFieldValue('galley-hours-hours'),
        galleyHoursMinutes: getFormFieldValue('galley-hours-minutes'),
        purserPay: document.getElementById('purser-pay')?.checked || false,
        aircraftType: getFormFieldValue('aircraft-type'),
        purserUsHours: getFormFieldValue('purser-us-hours'),
        purserNonUsHours: getFormFieldValue('purser-non-us-hours'),
        intlPayOverride: document.getElementById('intl-pay-override')?.checked || false,
        languagePay: document.getElementById('language-pay')?.checked || false,
        holidayPay: document.getElementById('holiday-pay')?.checked || false,
        holidayHours: getFormFieldValue('holiday-hours'),
        intlOverride: document.getElementById('intl-override')?.checked || false,
        retirementPercentage: getFormFieldValue('retirement-percentage'),
        taxRate: getFormFieldValue('tax-rate')
    };
    
    return formData;
}

/**
 * Get the value of a specific form field
 * @param {string} fieldId - The ID of the form field
 * @returns {string} - The field value
 */
function getFormFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value.trim() : '';
}

/**
 * Set the value of a specific form field
 * @param {string} fieldId - The ID of the form field
 * @param {string} value - The value to set
 */
function setFormFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value;
    }
}

/**
 * Clear all form fields
 */
function clearForm() {
    const form = document.getElementById('trip-form');
    if (form) {
        form.reset();
    }
    
    // Clear any error messages
    clearFormErrors();
    
    // Reset earnings display
    updateEarningsDisplay(0);
    // Re-attach form button listeners
    if (typeof setupFormButtons === 'function') setupFormButtons();
}

// ============================================================================
// FORM ERROR HANDLING (Show and hide error messages)
// ============================================================================

/**
 * Show validation errors on the form
 * @param {Array} errors - Array of error messages
 */
function showFormErrors(errors) {
    if (!errors || errors.length === 0) return;
    
    // Clear existing errors first
    clearFormErrors();
    
    // Create error container if it doesn't exist
    let errorContainer = document.getElementById('form-errors');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'form-errors';
        errorContainer.className = 'form-errors';
        
        const form = document.getElementById('trip-form');
        if (form) {
            form.insertBefore(errorContainer, form.firstChild);
        }
    }
    
    // Add error messages
    errorContainer.innerHTML = `
        <div class="error-list">
            <h4>Please fix the following errors:</h4>
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Show the error container
    errorContainer.style.display = 'block';
}

/**
 * Clear all form error messages
 */
function clearFormErrors() {
    const errorContainer = document.getElementById('form-errors');
    if (errorContainer) {
        errorContainer.style.display = 'none';
        errorContainer.innerHTML = '';
    }
}

/**
 * Show a field-specific error
 * @param {string} fieldId - The ID of the field with the error
 * @param {string} message - The error message
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remove existing error
    clearFieldError(fieldId);
    
    // Add error class
    field.classList.add('error');
    
    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'field-error';
    errorMessage.textContent = message;
    errorMessage.id = `${fieldId}-error`;
    
    // Insert after the field
    field.parentNode.insertBefore(errorMessage, field.nextSibling);
}

/**
 * Clear a field-specific error
 * @param {string} fieldId - The ID of the field to clear
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('error');
    }
    
    const errorMessage = document.getElementById(`${fieldId}-error`);
    if (errorMessage) {
        errorMessage.remove();
    }
}

// ============================================================================
// FORM SUBMISSION (Handle saving trips)
// ============================================================================

/**
 * Handle form submission (save trip)
 * @param {Event} event - The form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Get form data
        const formData = getFormData();
        
        // Validate form data
        const validation = validateTripForm(formData);
        
        if (!validation.isValid) {
            showFormErrors(validation.errors);
            showFormErrorToast(validation.errors.join(', '));
            return false;
        }
        
        // Clear any existing errors
        clearFormErrors();
        
        // Get current UI state
        const uiState = getUIState();
        
        if (uiState.isEditing && uiState.selectedTripId) {
            // Update existing trip
            const updatedTrip = updateTrip(uiState.selectedTripId, formData);
            if (updatedTrip) {
                showTripSavedToast(updatedTrip.name);
                updateUIState({ isEditing: false, selectedTripId: null });
            }
        } else {
            // Add new trip
            const newTrip = addTrip(formData);
            if (newTrip) {
                showTripSavedToast(newTrip.name);
            }
        }
        
        // Clear form and refresh trip list
        clearForm();
        refreshTripList();
        
        return true;
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showErrorToast('Failed to save trip. Please try again.');
        return false;
    }
}

/**
 * Load a trip into the form for editing
 * @param {Object} trip - The trip to edit
 */
function loadTripForEditing(trip) {
    try {
        // Set form values
        setFormFieldValue('trip-name', trip.name || '');
        setFormFieldValue('pay-year', trip.payYear || '');
        setFormFieldValue('trip-length', trip.tripLength || '');
        setFormFieldValue('credited-hours-hours', trip.creditedHoursHours || '');
        setFormFieldValue('credited-hours-minutes', trip.creditedHoursMinutes || '');
        setFormFieldValue('tafb-hours', trip.tafbHours || '');
        setFormFieldValue('tafb-minutes', trip.tafbMinutes || '');
        
        // Toggles and dropdowns
        document.getElementById('white-flag').checked = !!trip.whiteFlag;
        document.getElementById('purple-flag').checked = !!trip.purpleFlag;
        setFormFieldValue('purple-flag-premium', trip.purpleFlagPremium || '1.5');
        document.getElementById('galley-pay').checked = !!trip.galleyPay;
        setFormFieldValue('galley-hours-hours', trip.galleyHoursHours || '');
        setFormFieldValue('galley-hours-minutes', trip.galleyHoursMinutes || '');
        document.getElementById('purser-pay').checked = !!trip.purserPay;
        setFormFieldValue('aircraft-type', trip.aircraftType || 'Narrow1');
        setFormFieldValue('purser-us-hours', trip.purserUsHours || '');
        setFormFieldValue('purser-non-us-hours', trip.purserNonUsHours || '');
        document.getElementById('intl-pay-override').checked = !!trip.intlPayOverride;
        document.getElementById('language-pay').checked = !!trip.languagePay;
        document.getElementById('holiday-pay').checked = !!trip.holidayPay;
        setFormFieldValue('holiday-hours', trip.holidayHours || '');
        document.getElementById('intl-override').checked = !!trip.intlOverride;
        setFormFieldValue('retirement-percentage', trip.retirementPercentage || '');
        setFormFieldValue('tax-rate', trip.taxRate || '');

        // Update UI state
        updateUIState({
            isEditing: true,
            selectedTripId: trip.id
        });

        // Update form button text
        updateFormButtonText('Update Trip');

        // Scroll to form
        const form = document.getElementById('trip-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth' });
        }

        console.log('Trip loaded for editing:', trip.name);
        // Re-attach form button listeners
        if (typeof setupFormButtons === 'function') setupFormButtons();
    } catch (error) {
        console.error('Error loading trip for editing:', error);
        showErrorToast('Failed to load trip for editing');
    }
}

/**
 * Cancel editing mode
 */
function cancelEditing() {
    clearForm();
    updateUIState({
        isEditing: false,
        selectedTripId: null
    });
    updateFormButtonText('Add Trip');
    clearFormErrors();
}

// ============================================================================
// FORM UI UPDATES (Update form display)
// ============================================================================

/**
 * Update the earnings display
 * @param {number} earnings - The earnings amount
 */
function updateEarningsDisplay(earnings) {
    const earningsDisplay = document.getElementById('earnings-display');
    if (earningsDisplay) {
        earningsDisplay.textContent = formatEarnings(earnings);
    }
}

/**
 * Update the form submit button text
 * @param {string} text - The button text
 */
function updateFormButtonText(text) {
    const submitButton = document.querySelector('#trip-form button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = text;
    }
}

/**
 * Enable or disable the form submit button
 * @param {boolean} enabled - Whether to enable the button
 */
function setFormSubmitEnabled(enabled) {
    const submitButton = document.querySelector('#trip-form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = !enabled;
    }
}

// ============================================================================
// REAL-TIME CALCULATIONS (Update earnings as user types)
// ============================================================================

/**
 * Handle real-time earnings calculation
 * This updates the earnings display as the user types
 */
function handleRealTimeCalculation() {
    const duration = getFormFieldValue('duration');
    const payRate = getFormFieldValue('pay-rate');
    
    if (duration && payRate) {
        const earnings = calculateTripEarnings(duration, payRate);
        updateEarningsDisplay(earnings);
    } else {
        updateEarningsDisplay(0);
    }
}

/**
 * Set up real-time calculation listeners
 */
function setupRealTimeCalculation() {
    const durationField = document.getElementById('duration');
    const payRateField = document.getElementById('pay-rate');
    
    if (durationField) {
        durationField.addEventListener('input', handleRealTimeCalculation);
    }
    
    if (payRateField) {
        payRateField.addEventListener('input', handleRealTimeCalculation);
    }
} 