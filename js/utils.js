/**
 * utils.js — Helper Functions
 * 
 * This file contains "helper" functions that do small, useful tasks.
 * Think of it like a toolbox - it has tools for formatting money, 
 * creating IDs, converting time, etc.
 * 
 * What's in here:
 * - Format money as currency ($1,234.56)
 * - Convert hours and minutes to decimal (2:30 → 2.5)
 * - Generate random IDs for trips
 * - Pick random colors for trip cards
 * - Validate numbers and data
 * 
 * These functions are used by other parts of the app to do common tasks.
 */

// ============================================================================
// MONEY FORMATTING (Make numbers look like money!)
// ============================================================================

/**
 * Format a number as currency (e.g., 1234.56 → "$1,234.56")
 * @param {number} value - The number to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
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
}

// ============================================================================
// TIME CONVERSION (Convert between different time formats)
// ============================================================================

/**
 * Convert hours and minutes to decimal hours (e.g., 2 hours 30 minutes → 2.5)
 * @param {string} hoursStr - Hours as a string
 * @param {string} minutesStr - Minutes as a string
 * @returns {number} - Decimal hours
 */
function parseHoursMinutes(hoursStr, minutesStr) {
    try {
        const hours = parseInt(hoursStr, 10) || 0;
        const minutes = parseInt(minutesStr, 10) || 0;
        return hours + (minutes / 60);
    } catch (error) {
        console.error('Error parsing hours/minutes:', error);
        return 0;
    }
}

/**
 * Convert time string to decimal hours (e.g., "2:30" → 2.5)
 * @param {string} timeString - Time in "HH:MM" format
 * @returns {number} - Decimal hours
 */
function parseTimeString(timeString) {
    const [h, m] = (timeString || '00:00').split(':').map(Number);
    return h + m / 60;
}

// ============================================================================
// ID GENERATION (Create unique IDs for trips)
// ============================================================================

/**
 * Generate a unique ID for trips
 * @returns {string} - A random 9-character ID
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// ============================================================================
// COLOR GENERATION (Pick random colors for trip cards)
// ============================================================================

/**
 * Get a random color for trip cards
 * @returns {string} - A hex color code
 */
function getRandomColor() {
    const colors = [
        '#3a36e0', // Primary blue
        '#ff9d00', // Secondary orange
        '#00c48c', // Success green
        '#0084ff', // Info blue
        '#7C3AED', // Purple
        '#0EA5E9', // Sky blue
        '#F97316', // Orange
        '#10B981', // Emerald
        '#EC4899', // Pink
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// ============================================================================
// VALIDATION HELPERS (Check if data is valid)
// ============================================================================

/**
 * Check if a value is a valid number
 * @param {any} value - The value to check
 * @returns {boolean} - True if it's a valid number
 */
function isValidNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}

/**
 * Check if a value is a valid percentage (0-100)
 * @param {any} value - The value to check
 * @returns {boolean} - True if it's a valid percentage
 */
function isValidPercentage(value) {
    const num = parseFloat(value);
    return isValidNumber(num) && num >= 0 && num <= 100;
}

/**
 * Check if a value is a valid time (HH:MM format)
 * @param {string} timeString - The time string to check
 * @returns {boolean} - True if it's a valid time
 */
function isValidTime(timeString) {
    if (!timeString || typeof timeString !== 'string') return false;
    
    const parts = timeString.split(':');
    if (parts.length !== 2) return false;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    return !isNaN(hours) && !isNaN(minutes) && 
           hours >= 0 && hours <= 23 && 
           minutes >= 0 && minutes <= 59;
}

// ============================================================================
// MATH HELPERS (Do common math operations)
// ============================================================================

/**
 * Round a number to 2 decimal places
 * @param {number} value - The number to round
 * @returns {number} - Rounded number
 */
function roundToTwoDecimals(value) {
    return Math.round(value * 100) / 100;
}

/**
 * Calculate percentage of a number
 * @param {number} value - The base number
 * @param {number} percentage - The percentage (0-100)
 * @returns {number} - The result
 */
function calculatePercentage(value, percentage) {
    return (value * percentage) / 100;
}

// ============================================================================
// STRING HELPERS (Work with text)
// ============================================================================

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string if it's too long
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
function truncateString(str, maxLength) {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
} 