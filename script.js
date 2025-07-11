// Flight Trip Comparison Tool - Spec v2.1
// A tool to compare different flight trips and their compensation

// Centralized element ID configuration
const ELEMENT_IDS = {
    // Main containers
    TRIP_COMPARISON: 'trip-comparison',
    SIDE_PANEL: 'side-panel',
    TOAST_CONTAINER: 'toast-container',
    NO_TRIPS_MESSAGE: 'no-trips-message',
    
    // Form elements
    TRIP_FORM: 'trip-form',
    TRIP_ID: 'trip-id',
    TRIP_NAME: 'trip-name',
    PAY_YEAR: 'pay-year',
    TRIP_LENGTH: 'trip-length',
    
    // Hours inputs
    CREDITED_HOURS_HOURS: 'credited-hours-hours',
    CREDITED_HOURS_MINUTES: 'credited-hours-minutes',
    TAFB_HOURS: 'tafb-hours',
    TAFB_MINUTES: 'tafb-minutes',
    
    // Toggle elements
    WHITE_FLAG: 'white-flag',
    PURPLE_FLAG: 'purple-flag',
    GALLEY_PAY: 'galley-pay',
    PURSER_PAY: 'purser-pay',
    INTL_OVERRIDE: 'intl-override',
    INTL_PAY_OVERRIDE: 'intl-pay-override',
    LANGUAGE_PAY: 'language-pay',
    HOLIDAY_PAY: 'holiday-pay',
    
    // Toggle labels
    WHITE_FLAG_LABEL: 'white-flag-label',
    PURPLE_FLAG_LABEL: 'purple-flag-label',
    GALLEY_PAY_LABEL: 'galley-pay-label',
    PURSER_PAY_LABEL: 'purser-pay-label',
    INTL_OVERRIDE_LABEL: 'intl-override-label',
    INTL_PAY_OVERRIDE_LABEL: 'intl-pay-override-label',
    LANGUAGE_PAY_LABEL: 'language-pay-label',
    HOLIDAY_PAY_LABEL: 'holiday-pay-label',
    
    // Conditional groups
    PURPLE_FLAG_DROPDOWN_GROUP: 'purple-flag-dropdown-group',
    GALLEY_HOURS_GROUP: 'galley-hours-group',
    PURSER_FIELDS_GROUP: 'purser-fields-group',
    HOLIDAY_HOURS_GROUP: 'holiday-hours-group',
    
    // Select elements
    PURPLE_FLAG_PREMIUM: 'purple-flag-premium',
    AIRCRAFT_TYPE: 'aircraft-type',
    
    // Galley hours
    GALLEY_HOURS_HOURS: 'galley-hours-hours',
    GALLEY_HOURS_MINUTES: 'galley-hours-minutes',
    
    // Purser hours
    PURSER_US_HOURS: 'purser-us-hours',
    PURSER_NON_US_HOURS: 'purser-non-us-hours',
    
    // Holiday hours
    HOLIDAY_HOURS: 'holiday-hours',
    
    // Financial inputs
    RETIREMENT_PERCENTAGE: 'retirement-percentage',
    TAX_RATE: 'tax-rate',
    
    // Buttons
    ADD_TRIP_BTN: 'add-trip-btn',
    PANEL_CLOSE: 'panel-close',
    CANCEL_BTN: 'cancel-btn',
    SAVE_TRIP_BTN: 'save-trip-btn',
    FIRST_TRIP_BTN: 'first-trip-btn',
    EXPORT_BTN: 'export-btn',
    CLEAR_ALL_BTN: 'clear-all-btn',
    
    // Validation messages
    GALLEY_HOURS_VALIDATION: 'galley-hours-validation',
    PURSER_US_HOURS_VALIDATION: 'purser-us-hours-validation',
    PURSER_NON_US_HOURS_VALIDATION: 'purser-non-us-hours-validation',
    HOLIDAY_HOURS_VALIDATION: 'holiday-hours-validation'
};

// Export and clear operations
const exportTrips = async () => {
    if (state.trips.length === 0) {
        showToast('No trips to export', 'warning');
        return;
    }
    try {
        showToast('Generating PDF...', 'info');

        // Create a temporary container for the PDF with grid layout
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '1200px'; // Wide enough for 3 cards
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20px';
        tempContainer.style.fontFamily = 'Arial, sans-serif';

        // Add header
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '30px';
        header.style.borderBottom = '2px solid #3a36e0';
        header.style.paddingBottom = '20px';
        header.innerHTML = `
            <h1 style="color: #3a36e0; margin: 0; font-size: 24px;">Flight Trip Comparison</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        `;
        tempContainer.appendChild(header);

        // Grid for trip cards
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        grid.style.gap = '24px';
        grid.style.marginTop = '30px';
        grid.style.marginBottom = '30px';

        // Clone trip cards for PDF
        const tripContainer = $(ELEMENT_IDS.TRIP_COMPARISON);
        const tripCards = tripContainer.querySelectorAll('.trip-card');
        tripCards.forEach((card) => {
            const cardClone = card.cloneNode(true);
            // Remove action buttons for PDF
            const actions = cardClone.querySelector('.trip-card-actions');
            if (actions) actions.remove();
            // Hide best value badge if not the best trip
            const badge = cardClone.querySelector('.best-value-badge');
            if (badge && !card.classList.contains('best-trip')) {
                badge.style.display = 'none';
            }
            cardClone.style.margin = '0';
            cardClone.style.pageBreakInside = 'avoid';
            grid.appendChild(cardClone);
        });
        tempContainer.appendChild(grid);

        // Add to document temporarily
        document.body.appendChild(tempContainer);

        // Generate PDF
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        document.body.removeChild(tempContainer);

        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10; // 10mm top margin
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);
        }
        const fileName = `flight_trip_comparison_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        showToast('PDF exported successfully!', 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Error generating PDF. Please try again.', 'error');
    }
};

const clearAllTrips = () => {
    if (state.trips.length > 0 && confirm('Clear all trips?')) {
        state.trips = [];
        renderTrips();
        showToast('All trips cleared', 'info');
    }
};

// Button configuration
const BUTTONS = {
    [ELEMENT_IDS.ADD_TRIP_BTN]: () => { resetForm(); toggleSidePanel(true); },
    [ELEMENT_IDS.PANEL_CLOSE]: () => toggleSidePanel(false),
    [ELEMENT_IDS.CANCEL_BTN]: () => toggleSidePanel(false),
    [ELEMENT_IDS.EXPORT_BTN]: exportTrips,
    [ELEMENT_IDS.CLEAR_ALL_BTN]: clearAllTrips
};

// Data-driven form field configuration
const FORM_FIELDS = {
    // Simple text inputs
    text: [
        { id: ELEMENT_IDS.TRIP_NAME, key: 'name', required: true },
        { id: ELEMENT_IDS.PAY_YEAR, key: 'payYear', required: true },
        { id: ELEMENT_IDS.TRIP_LENGTH, key: 'tripLength', required: true },
        { id: ELEMENT_IDS.PURPLE_FLAG_PREMIUM, key: 'purpleFlagPremium', default: '1.5' },
        { id: ELEMENT_IDS.AIRCRAFT_TYPE, key: 'aircraftType', default: 'Narrow1' },
        { id: ELEMENT_IDS.HOLIDAY_HOURS, key: 'holidayHours' },
        { id: ELEMENT_IDS.RETIREMENT_PERCENTAGE, key: 'retirementPercentage' },
        { id: ELEMENT_IDS.TAX_RATE, key: 'taxRate' }
    ],
    
    // Hour/minute pairs
    hours: [
        { hours: ELEMENT_IDS.CREDITED_HOURS_HOURS, minutes: ELEMENT_IDS.CREDITED_HOURS_MINUTES, key: 'creditedHours', required: true },
        { hours: ELEMENT_IDS.TAFB_HOURS, minutes: ELEMENT_IDS.TAFB_MINUTES, key: 'tafbHours', required: true },
        { hours: ELEMENT_IDS.GALLEY_HOURS_HOURS, minutes: ELEMENT_IDS.GALLEY_HOURS_MINUTES, key: 'galleyHours' }
    ],
    
    // Toggle switches
    toggles: [
        { id: ELEMENT_IDS.WHITE_FLAG, key: 'whiteFlag', label: ELEMENT_IDS.WHITE_FLAG_LABEL },
        { id: ELEMENT_IDS.PURPLE_FLAG, key: 'purpleFlag', label: ELEMENT_IDS.PURPLE_FLAG_LABEL },
        { id: ELEMENT_IDS.GALLEY_PAY, key: 'galleyPay', label: ELEMENT_IDS.GALLEY_PAY_LABEL, group: ELEMENT_IDS.GALLEY_HOURS_GROUP },
        { id: ELEMENT_IDS.PURSER_PAY, key: 'purserPay', label: ELEMENT_IDS.PURSER_PAY_LABEL, group: ELEMENT_IDS.PURSER_FIELDS_GROUP },
        { id: ELEMENT_IDS.INTL_OVERRIDE, key: 'intlOverride', label: ELEMENT_IDS.INTL_OVERRIDE_LABEL },
        { id: ELEMENT_IDS.INTL_PAY_OVERRIDE, key: 'intlPayOverride', label: ELEMENT_IDS.INTL_PAY_OVERRIDE_LABEL },
        { id: ELEMENT_IDS.LANGUAGE_PAY, key: 'languagePay', label: ELEMENT_IDS.LANGUAGE_PAY_LABEL },
        { id: ELEMENT_IDS.HOLIDAY_PAY, key: 'holidayPay', label: ELEMENT_IDS.HOLIDAY_PAY_LABEL, group: ELEMENT_IDS.HOLIDAY_HOURS_GROUP }
    ],
    
    // Number inputs
    numbers: [
        { id: ELEMENT_IDS.PURSER_US_HOURS, key: 'purserUSHours' },
        { id: ELEMENT_IDS.PURSER_NON_US_HOURS, key: 'purserNonUSHours' }
    ]
};

// Simple DOM helper
const $ = id => document.getElementById(id);

// Constants
const CONSTANTS = {
    DOMESTIC_PER_DIEM: 2.40,
    INTERNATIONAL_PER_DIEM: 2.90,
    STORAGE_KEY: 'flightTrips',
    VERSION: '2.1'
};

// Pay rates by year
const PAY_RATES = {
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

// App state
const state = {
    trips: [],
    editingTripId: null
};

// History for undo functionality
const history = {
    lastOperation: null,
    lastState: null,
    
    saveState: function(operation, tripId) {
        try {
            this.lastOperation = operation;
            this.lastState = JSON.parse(JSON.stringify(state.trips));
            console.log(`Saved state before ${operation} operation on trip ${tripId}`);
        } catch (error) {
            console.error('Error saving history state:', error);
        }
    },
    
    undoLastOperation: function() {
        if (!this.lastState || !this.lastOperation) {
            showToast('Nothing to undo', 'info');
            return false;
        }
        
        state.trips = this.lastState;
        const operation = this.lastOperation;
        this.lastState = null;
        this.lastOperation = null;
        
        renderTrips();
        showToast(`Undid last ${operation}`, 'success');
        return true;
    }
};

// Utility functions
const utils = {
    formatCurrency: value => {
            const num = parseFloat(value);
        return isNaN(num) ? '$0.00' : '$' + num.toFixed(2);
    },
    
    parseHM: (hours, minutes) => {
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        return h + (m / 60);
    },
    
    generateId: () => Math.random().toString(36).substr(2, 9),
    
    getRandomColor: () => {
        const colors = ['#3a36e0', '#ff9d00', '#00c48c', '#0084ff', '#7C3AED', '#0EA5E9', '#F97316', '#10B981', '#EC4899'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};

// Hour validation function
function validateHours() {
    try {
        // Parse all hour inputs
        const creditedHours = utils.parseHM($(ELEMENT_IDS.CREDITED_HOURS_HOURS).value, $(ELEMENT_IDS.CREDITED_HOURS_MINUTES).value);
        const tafbHours = utils.parseHM($(ELEMENT_IDS.TAFB_HOURS).value, $(ELEMENT_IDS.TAFB_MINUTES).value);
        
        // Calculate special hours
        const galleyHours = $(ELEMENT_IDS.GALLEY_PAY).checked ? 
            utils.parseHM($(ELEMENT_IDS.GALLEY_HOURS_HOURS).value, $(ELEMENT_IDS.GALLEY_HOURS_MINUTES).value) : 0;
        const purserUSHours = $(ELEMENT_IDS.PURSER_PAY).checked ? parseFloat($(ELEMENT_IDS.PURSER_US_HOURS).value) || 0 : 0;
        const purserNonUSHours = $(ELEMENT_IDS.PURSER_PAY).checked ? parseFloat($(ELEMENT_IDS.PURSER_NON_US_HOURS).value) || 0 : 0;
        
        const totalSpecialHours = galleyHours + purserUSHours + purserNonUSHours;
        
        // Check if special hours exceed credited hours
        const isValid = totalSpecialHours <= creditedHours;

        // Update validation messages
            const message = `Special hours (${totalSpecialHours.toFixed(2)}) exceed credited hours (${creditedHours.toFixed(2)})`;
            
        if ($(ELEMENT_IDS.GALLEY_PAY).checked) {
            const validation = $(ELEMENT_IDS.GALLEY_HOURS_VALIDATION);
            if (validation) {
                validation.textContent = isValid ? '' : message;
                validation.style.display = isValid ? 'none' : 'block';
            }
        }
        
        if ($(ELEMENT_IDS.PURSER_PAY).checked) {
            const usValidation = $(ELEMENT_IDS.PURSER_US_HOURS_VALIDATION);
            const nonUSValidation = $(ELEMENT_IDS.PURSER_NON_US_HOURS_VALIDATION);
            if (usValidation && nonUSValidation) {
                usValidation.textContent = isValid ? '' : message;
                nonUSValidation.textContent = isValid ? '' : message;
                usValidation.style.display = isValid ? 'none' : 'block';
                nonUSValidation.style.display = isValid ? 'none' : 'block';
            }
        }
        
        // Validate holiday hours against TAFB time
        const holidayHours = $(ELEMENT_IDS.HOLIDAY_PAY).checked ? parseFloat($(ELEMENT_IDS.HOLIDAY_HOURS).value) || 0 : 0;
        if ($(ELEMENT_IDS.HOLIDAY_PAY).checked && holidayHours > tafbHours) {
            const message = `Holiday hours (${holidayHours.toFixed(2)}) cannot exceed TAFB time (${tafbHours.toFixed(2)})`;
            const validation = $(ELEMENT_IDS.HOLIDAY_HOURS_VALIDATION);
            if (validation) {
                validation.textContent = message;
                validation.style.display = 'block';
            }
            return false;
        } else {
            const validation = $(ELEMENT_IDS.HOLIDAY_HOURS_VALIDATION);
            if (validation) {
                validation.style.display = 'none';
            }
        }
        
        return isValid;
    } catch (error) {
        console.error('Error validating hours:', error);
        return false;
    }
}

// Data-driven form operations
function getFormData() {
    const data = {};
    
    // Process text fields
    FORM_FIELDS.text.forEach(field => {
        const element = $(field.id);
        if (element) {
            data[field.key] = element.value;
        }
    });
    
    // Process hour fields
    FORM_FIELDS.hours.forEach(field => {
        const hoursElement = $(field.hours);
        const minutesElement = $(field.minutes);
        if (hoursElement && minutesElement) {
            data[field.key + 'Hours'] = hoursElement.value;
            data[field.key + 'Minutes'] = minutesElement.value;
        }
    });
    
    // Process toggles
    FORM_FIELDS.toggles.forEach(field => {
        const element = $(field.id);
        if (element) {
            data[field.key] = element.checked ? 'Yes' : 'No';
        }
    });
    
    // Process number fields
    FORM_FIELDS.numbers.forEach(field => {
        const element = $(field.id);
        if (element) {
            data[field.key] = element.value;
        }
    });
    
    return data;
}

function setFormData(data) {
    if (!data) return;
    
    // Process text fields
    FORM_FIELDS.text.forEach(field => {
        const element = $(field.id);
        if (element) {
            element.value = data[field.key] || field.default || '';
        }
    });
    
    // Process hour fields
    FORM_FIELDS.hours.forEach(field => {
        const hoursElement = $(field.hours);
        const minutesElement = $(field.minutes);
        if (hoursElement && minutesElement) {
            hoursElement.value = data[field.key + 'Hours'] || '';
            minutesElement.value = data[field.key + 'Minutes'] || '';
        }
    });
    
    // Process toggles
    FORM_FIELDS.toggles.forEach(field => {
        const element = $(field.id);
        const labelElement = $(field.label);
        if (element) {
            element.checked = data[field.key] === 'Yes';
            if (labelElement) {
                labelElement.textContent = element.checked ? 'Yes' : 'No';
            }
        }
    });
    
    // Process number fields
    FORM_FIELDS.numbers.forEach(field => {
        const element = $(field.id);
        if (element) {
            element.value = data[field.key] || '';
        }
    });
    
    updateToggleLabels();
    toggleConditionalFields();
}

// Simple form reset
function resetForm() {
    $(ELEMENT_IDS.TRIP_FORM).reset();
    $(ELEMENT_IDS.TRIP_ID).value = '';
    state.editingTripId = null;
    
    // Clear validation messages
    const validations = [
        ELEMENT_IDS.GALLEY_HOURS_VALIDATION, 
        ELEMENT_IDS.PURSER_US_HOURS_VALIDATION, 
        ELEMENT_IDS.PURSER_NON_US_HOURS_VALIDATION, 
        ELEMENT_IDS.HOLIDAY_HOURS_VALIDATION
    ];
    validations.forEach(id => {
        const validation = $(id);
        if (validation) validation.style.display = 'none';
    });
    
    updateToggleLabels();
    toggleConditionalFields();
}

// Update toggle labels
function updateToggleLabels() {
    FORM_FIELDS.toggles.forEach(field => {
        const toggleElement = $(field.id);
        const labelElement = $(field.label);
        if (toggleElement && labelElement) {
            labelElement.textContent = toggleElement.checked ? 'Yes' : 'No';
        }
    });
}

// Toggle conditional fields
function toggleConditionalFields() {
    FORM_FIELDS.toggles.forEach(field => {
        if (field.group) {
            const group = $(field.group);
            const toggle = $(field.id);
            if (group && toggle) {
                const isVisible = toggle.checked;
                group.style.display = isVisible ? 'block' : 'none';
            }
        }
    });
}

// Calculate trip pay
function calculateTripPay(tripData) {
    try {
        const payYear = tripData.payYear || 'Year 1';
        const payData = PAY_RATES[payYear] || PAY_RATES["Year 1"];
        
        // Parse basic data
        const creditedHours = utils.parseHM(tripData.creditedHoursHours, tripData.creditedHoursMinutes);
        const dutyHours = utils.parseHM(tripData.tafbHours, tripData.tafbMinutes);
        const tripLength = parseInt(tripData.tripLength) || 1;
        
        // Calculate rates and multipliers
        const baseRate = payData.baseRate;
        const flagMultiplier = (tripData.whiteFlag ? 1.5 : 1) * (tripData.purpleFlag ? parseFloat(tripData.purpleFlagPremium) || 1.5 : 1);
        const effectiveRate = baseRate * flagMultiplier;

        // Calculate pay components
        const payComponents = {
            basePay: creditedHours * effectiveRate,
            galleyPay: tripData.galleyPay === 'Yes' ? utils.parseHM(tripData.galleyHoursHours, tripData.galleyHoursMinutes) : 0,
            purserPay: 0,
            perDiem: dutyHours * (tripData.intlOverride === 'Yes' ? CONSTANTS.INTERNATIONAL_PER_DIEM : CONSTANTS.DOMESTIC_PER_DIEM),
            languagePay: tripData.languagePay === 'Yes' ? creditedHours * 2.50 : 0,
            intlOverridePay: tripData.intlPayOverride === 'Yes' ? creditedHours * 2 : 0,
            holidayPay: 0
        };
        
        // Calculate purser pay
        if (tripData.purserPay === 'Yes') {
            const purserUS = parseFloat(tripData.purserUSHours) || 0;
            const purserNonUS = parseFloat(tripData.purserNonUSHours) || 0;
            const rates = { 'Narrow1': [1, 2], 'Narrow2': [2, 3], 'Wide': [3, 4] };
            const [usRate, nonUSRate] = rates[tripData.aircraftType] || rates['Narrow1'];
            payComponents.purserPay = purserUS * usRate + purserNonUS * nonUSRate;
        }
        
        // Calculate holiday pay
        if (tripData.holidayPay === 'Yes' && dutyHours > 0) {
            const holidayHours = parseFloat(tripData.holidayHours) || 0;
            payComponents.holidayPay = (effectiveRate * creditedHours / dutyHours) * holidayHours;
        }

        // Calculate totals
        const totalGrossPay = Object.values(payComponents).reduce((sum, val) => sum + val, 0);
        const retirementDeduction = totalGrossPay * (parseFloat(tripData.retirementPercentage) / 100);
        const netPayEstimate = (totalGrossPay - retirementDeduction) * (1 - parseFloat(tripData.taxRate) / 100);
        
        return {
            ...payComponents,
            baseRate, effectiveRate, totalGrossPay, netPayEstimate,
            hourlyValue: creditedHours > 0 ? totalGrossPay / creditedHours : 0,
            perDayValue: tripLength > 0 ? totalGrossPay / tripLength : 0
        };
    } catch (error) {
        console.error('Error calculating trip pay:', error);
        return { baseRate: 0, effectiveRate: 0, basePay: 0, galleyPay: 0, purserPay: 0, intlOverridePay: 0, languagePay: 0, perDiem: 0, holidayPay: 0, totalGrossPay: 0, netPayEstimate: 0, hourlyValue: 0, perDayValue: 0 };
    }
}

// Show toast notification with undo support
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    if (message.includes('Undo')) {
        const parts = message.split(/(<a.*?Undo<\/a>)/);
        const textNode = document.createTextNode(parts[0]);
        toast.appendChild(textNode);
        
        const undoLink = document.createElement('a');
        undoLink.href = "#";
        undoLink.id = "undo-delete";
        undoLink.textContent = "Undo";
        toast.appendChild(undoLink);
    } else {
        toast.textContent = message;
    }
    
    $(ELEMENT_IDS.TOAST_CONTAINER).appendChild(toast);
    
        setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Toggle side panel with focus trap
function toggleSidePanel(show = true) {
    const panel = $(ELEMENT_IDS.SIDE_PANEL);
    const addBtn = $(ELEMENT_IDS.ADD_TRIP_BTN);
    
    if (show) {
        panel.classList.remove('collapsed');
        addBtn.style.display = 'none';
        setTimeout(() => $(ELEMENT_IDS.TRIP_NAME).focus(), 100);
        setupFocusTrap();
    } else {
        panel.classList.add('collapsed');
        addBtn.style.display = 'flex';
        removeFocusTrap();
    }
}

// Focus trap functions
function setupFocusTrap() {
    document.removeEventListener('keydown', handleFocusTrap);
    document.addEventListener('keydown', handleFocusTrap);
    
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
}

function handleFocusTrap(e) {
    document.removeEventListener('keydown', handleFocusTrap);
    
    const returnLink = document.getElementById('return-to-content');
    if (returnLink) {
        returnLink.remove();
    }
}

function removeFocusTrap() {
    document.removeEventListener('keydown', handleFocusTrap);
    
    const returnLink = document.getElementById('return-to-content');
    if (returnLink) {
        returnLink.remove();
    }
}

// Render trip card
function renderTripCard(trip) {
    const calculation = calculateTripPay(trip);
    
    // Card structure
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.dataset.id = trip.id;
    
    // Badge
    const badge = document.createElement('div');
    badge.className = 'best-value-badge';
    badge.textContent = 'Best Value';
    card.appendChild(badge);
    
    // Header
        const header = document.createElement('div');
        header.className = 'trip-card-header';
    header.style.backgroundColor = trip.color || '#3a36e0';
    
    const title = document.createElement('div');
    title.className = 'trip-title';
    title.textContent = trip.name || 'Unnamed Trip';
    header.appendChild(title);
    
    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'trip-card-actions';
    
    const actionButtons = [
        { text: '✏️', className: 'edit-trip', action: () => editTrip(trip.id), label: `Edit trip ${trip.name}` },
        { text: '🗑️', className: 'delete-trip', action: () => deleteTrip(trip.id), label: `Delete trip ${trip.name}` }
    ];
    
    actionButtons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `trip-card-action ${btn.className}`;
        button.dataset.id = trip.id;
        button.textContent = btn.text;
        button.setAttribute('aria-label', btn.label);
        button.addEventListener('click', btn.action);
        actions.appendChild(button);
    });
    
    header.appendChild(actions);
    card.appendChild(header);
    
    // Body
        const body = document.createElement('div');
        body.className = 'trip-card-body';
        
    // Details section
    const details = document.createElement('div');
    details.className = 'trip-details';
    
    const detailData = [
        { label: 'Pay Year', value: trip.payYear || 'Year 1' },
        { label: 'Credited Hours', value: `${trip.creditedHoursHours || 0}h ${trip.creditedHoursMinutes || 0}m` },
        { label: 'TAFB time', value: `${trip.tafbHours || 0}h ${trip.tafbMinutes || 0}m` },
        { label: 'Trip Length', value: `${trip.tripLength || 1} day${parseInt(trip.tripLength) > 1 ? 's' : ''}` },
        { label: 'Galley Hours', value: `${trip.galleyHoursHours || 0}h ${trip.galleyHoursMinutes || 0}m`, condition: trip.galleyPay === 'Yes' }
    ];
    
    detailData.forEach(item => {
        if (!item.condition || item.condition) {
            const row = document.createElement('div');
            row.className = 'trip-detail';
            row.innerHTML = `<span class="trip-detail-label">${item.label}</span><span class="trip-detail-value">${item.value}</span>`;
            details.appendChild(row);
        }
    });
    
    body.appendChild(details);
    
    // Summary section
    const summary = document.createElement('div');
    summary.className = 'trip-summary';
    
    const summaryData = [
        { label: 'Base Pay', value: utils.formatCurrency(calculation.basePay) },
        { label: 'Galley Pay', value: utils.formatCurrency(calculation.galleyPay), condition: calculation.galleyPay > 0 },
        { label: 'Purser Pay', value: utils.formatCurrency(calculation.purserPay), condition: calculation.purserPay > 0 },
        { label: 'Intl Override', value: utils.formatCurrency(calculation.intlOverridePay), condition: calculation.intlOverridePay > 0 },
        { label: 'Language Pay', value: utils.formatCurrency(calculation.languagePay), condition: calculation.languagePay > 0 },
        { label: 'Per Diem', value: utils.formatCurrency(calculation.perDiem) },
        { label: 'Holiday Pay', value: utils.formatCurrency(calculation.holidayPay), condition: calculation.holidayPay > 0 },
        { label: 'Gross Pay', value: utils.formatCurrency(calculation.totalGrossPay), highlight: true },
        { 
            label: 'Net Pay Est.', 
            value: parseFloat(trip.retirementPercentage) > 0 || parseFloat(trip.taxRate) > 0 ? 
                utils.formatCurrency(calculation.netPayEstimate) : '--', 
            highlight: true 
        },
        { label: 'Hourly Value', value: `${utils.formatCurrency(calculation.hourlyValue)}/hr` },
        { label: 'Daily Value', value: `${utils.formatCurrency(calculation.perDayValue)}/day` }
    ];
    
    summaryData.forEach(item => {
        if (!item.condition || item.condition) {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'trip-summary-item';
            if (item.highlight) summaryItem.classList.add('highlight');
            summaryItem.innerHTML = `<span class="trip-summary-label">${item.label}</span><span class="trip-summary-value">${item.value}</span>`;
            summary.appendChild(summaryItem);
        }
    });
    
    body.appendChild(summary);
    card.appendChild(body);
    
    return card;
}

// Render all trips
function renderTrips() {
    const container = $(ELEMENT_IDS.TRIP_COMPARISON);
    container.innerHTML = '';
    
    if (!state.trips || state.trips.length === 0) {
        container.innerHTML = `
            <div class="no-trips-message" id="no-trips-message">
                <h2>No trips to compare yet</h2>
                <p>Click the "+" button to add your first trip. You can add multiple trips to compare their value and find the best option.</p>
                <button class="btn btn-primary" id="first-trip-btn">Add Your First Trip</button>
            </div>
        `;
        $(ELEMENT_IDS.FIRST_TRIP_BTN).addEventListener('click', () => {
            resetForm();
            toggleSidePanel(true);
        });
            return;
        }
        
    // Find best value trip
        let bestValueTripId = null;
        let bestMetric = -Infinity;
        
    state.trips.forEach(trip => {
        const calc = calculateTripPay(trip);
                if (calc.perDayValue > bestMetric) {
                    bestMetric = calc.perDayValue;
                    bestValueTripId = trip.id;
        }
    });
    
    // Render each trip
    state.trips.forEach(trip => {
        const card = renderTripCard(trip);
        if (trip.id === bestValueTripId && state.trips.length > 1) {
                    card.classList.add('best-trip');
                    card.querySelector('.best-value-badge').style.display = 'block';
                }
        container.appendChild(card);
    });
    
    saveTripsToLocalStorage();
}

// Save trips to localStorage
function saveTripsToLocalStorage() {
    try {
        const data = { version: CONSTANTS.VERSION, trips: state.trips };
        localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving trips:', error);
    }
}

// Load trips from localStorage
function loadTripsFromLocalStorage() {
    try {
        const saved = localStorage.getItem(CONSTANTS.STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            state.trips = Array.isArray(data) ? data : (data.trips || []);
        }
    } catch (error) {
        console.error('Error loading trips:', error);
        state.trips = [];
    }
}

// Trip operations
const tripOperations = {
    add: (tripData) => {
        history.saveState('add', 'new');
        const newTrip = { id: utils.generateId(), color: utils.getRandomColor(), ...tripData };
        state.trips.push(newTrip);
        renderTrips();
        showToast(`Trip "${newTrip.name}" added successfully`, 'success');
    },
    
    update: (tripId, tripData) => {
        history.saveState('update', tripId);
        const index = state.trips.findIndex(t => t.id === tripId);
        if (index !== -1) {
            const oldColor = state.trips[index].color;
            state.trips[index] = { ...tripData, id: tripId, color: oldColor };
            renderTrips();
            showToast(`Trip "${tripData.name}" updated successfully`, 'success');
        }
    },
    
    delete: (tripId) => {
        const index = state.trips.findIndex(t => t.id === tripId);
        if (index !== -1) {
            const tripName = state.trips[index].name;
            if (confirm(`Delete trip "${tripName}"?`)) {
                history.saveState('delete', tripId);
                state.trips.splice(index, 1);
                renderTrips();
                showToast(`Trip "${tripName}" deleted. <a href="#" id="undo-delete">Undo</a>`, 'info');
                
        setTimeout(() => {
            const undoLink = document.getElementById('undo-delete');
            if (undoLink) {
                        undoLink.addEventListener('click', (e) => {
                    e.preventDefault();
                            history.undoLastOperation();
                });
            }
        }, 10);
            }
        }
    },
    
    edit: (tripId) => {
        const trip = state.trips.find(t => t.id === tripId);
        if (trip) {
            state.editingTripId = tripId;
            setFormData(trip);
            toggleSidePanel(true);
        }
    }
};

// Convenience functions
const addTrip = tripOperations.add;
const updateTrip = tripOperations.update;
const deleteTrip = tripOperations.delete;
const editTrip = tripOperations.edit;

// Form submission with validation
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }
    
    const tripData = getFormData();
    
    if (state.editingTripId) {
        updateTrip(state.editingTripId, tripData);
    } else {
        addTrip(tripData);
    }
    
    resetForm();
    toggleSidePanel(false);
}

// Form validation
function validateForm() {
        let isValid = true;
        let firstInvalidField = null;
        
    // Check required fields
    FORM_FIELDS.text.forEach(field => {
        const element = $(field.id);
        if (element && field.required && !element.value.trim()) {
            element.style.borderColor = 'var(--danger)';
            element.setAttribute('aria-invalid', 'true');
            if (!firstInvalidField) firstInvalidField = element;
                isValid = false;
        } else if (element) {
            element.style.borderColor = '';
            element.removeAttribute('aria-invalid');
            }
        });
        
        // Check hour validations
    if (!validateHours()) {
            isValid = false;
    }
    
    // Focus first invalid field
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
        
        return isValid;
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    $(ELEMENT_IDS.TRIP_FORM).addEventListener('submit', handleFormSubmit);
    
    // Button handlers
    Object.entries(BUTTONS).forEach(([id, handler]) => {
        const button = $(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    });
    
    // Toggle listeners
    FORM_FIELDS.toggles.forEach(field => {
        const toggle = $(field.id);
        if (toggle) {
            toggle.addEventListener('change', () => {
                updateToggleLabels();
                toggleConditionalFields();
                validateHours(); // Validate hours when toggles change
            });
        }
    });
    
    // Input validation patterns
    const validationPatterns = {
        numeric: { regex: /^\d*\.?\d*$/, min: 0, max: Infinity },
        minutes: { regex: /^\d*$/, min: 0, max: 59 },
        percentage: { regex: /^\d*\.?\d*$/, min: 0, max: 100 },
        holidayHours: { regex: /^\d*\.?\d*$/, min: 0, max: 24 }
    };
    
    // Apply validation to all inputs
    const allInputs = [
        ...FORM_FIELDS.text.filter(f => f.id === ELEMENT_IDS.RETIREMENT_PERCENTAGE || f.id === ELEMENT_IDS.TAX_RATE),
        ...FORM_FIELDS.numbers,
        ...FORM_FIELDS.hours.map(f => ({ id: f.minutes, type: 'minutes' }))
    ];
    
    allInputs.forEach(field => {
        const input = $(field.id);
        if (!input) return;
        
        const pattern = validationPatterns[field.type || 'numeric'];
        
        input.addEventListener('input', function() {
            if (this.value && !pattern.regex.test(this.value)) {
                this.value = this.value.replace(/[^\d.]/g, '');
            }
        });
        
        input.addEventListener('change', function() {
            if (this.value === '') this.value = '0';
            const val = parseFloat(this.value);
            if (isNaN(val) || val < pattern.min) this.value = pattern.min.toString();
            if (val > pattern.max) this.value = pattern.max.toString();
            validateHours();
        });
    });
    
    // Special validation for holiday hours
    const holidayInput = $(ELEMENT_IDS.HOLIDAY_HOURS);
    if (holidayInput) {
        holidayInput.addEventListener('change', function() {
            const val = parseFloat(this.value);
            if (isNaN(val) || val < 0) this.value = '0';
            if (val > 24) this.value = '24';
            validateHours();
        });
    }
    
    // Keyboard shortcuts
    const shortcuts = {
        'Alt+1': () => $(ELEMENT_IDS.TRIP_COMPARISON).focus(),
        'Alt+2': () => $(ELEMENT_IDS.ADD_TRIP_BTN).focus(),
        'Ctrl+n': () => { resetForm(); toggleSidePanel(true); },
        'Escape': () => toggleSidePanel(false),
        'Ctrl+z': () => history.undoLastOperation(),
        'Ctrl+s': () => {
            const sidePanel = $(ELEMENT_IDS.SIDE_PANEL);
            if (sidePanel && !sidePanel.classList.contains('collapsed')) {
                $(ELEMENT_IDS.SAVE_TRIP_BTN).click();
            }
        }
    };
    
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        const key = e.key.toLowerCase();
        const modifier = e.altKey ? 'Alt+' : e.ctrlKey || e.metaKey ? 'Ctrl+' : '';
        const shortcut = modifier + key;
        
        if (shortcuts[shortcut]) {
            e.preventDefault();
            shortcuts[shortcut]();
        }
    });
}

// Initialize app
function init() {
    loadTripsFromLocalStorage();
    setupEventListeners();
    updateToggleLabels();
    toggleConditionalFields();
    renderTrips();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);