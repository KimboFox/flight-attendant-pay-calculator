/**
 * config.js — Configuration and Data
 * 
 * This file contains all the "settings" and "data" that the app uses.
 * Think of it like a recipe book - it has all the rates, pay scales, and rules.
 * 
 * What's in here:
 * - Pay rates for different years
 * - Per diem rates (daily meal allowance)
 * - App version and settings
 * 
 * If you want to change pay rates or add new years, this is where you'd do it!
 */

// ============================================================================
// APP CONSTANTS (Settings that don't change often)
// ============================================================================

const APP_CONFIG = {
    // Per diem rates (daily meal allowance - tax free!)
    DOMESTIC_PER_DIEM_RATE: 2.40,      // $2.40 per hour for domestic flights
    INTERNATIONAL_PER_DIEM_RATE: 2.90, // $2.90 per hour for international flights
    
    // Storage key for saving trips in browser
    STORAGE_KEY: 'flightTrips',
    
    // App version
    VERSION: '2.1'
};

// ============================================================================
// PAY RATES BY YEAR (The money you make!)
// ============================================================================

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

// ============================================================================
// PURSER PAY RATES (Extra money for being in charge!)
// ============================================================================

const PURSER_RATES = {
    "Narrow1": { usRate: 2.50, nonUsRate: 3.00 },  // A319/A320/B737-700
    "Narrow2": { usRate: 3.00, nonUsRate: 3.50 },  // B737-800/900/MAX/B-757/A321
    "Wide": { usRate: 4.00, nonUsRate: 4.50 }      // Widebody aircraft
};

// ============================================================================
// GALLEY PAY RATES (Extra money for working in the kitchen!)
// ============================================================================

const GALLEY_RATE = 2.50; // $2.50 per hour for galley work

// ============================================================================
// LANGUAGE PAY RATES (Extra money for speaking other languages!)
// ============================================================================

const LANGUAGE_RATE = 3.00; // $3.00 per hour for language pay

// ============================================================================
// HOLIDAY PAY RATES (Extra money for working on holidays!)
// ============================================================================

const HOLIDAY_RATE = 1.5; // 1.5x your normal rate for holiday hours

// ============================================================================
// FLAG PAY RATES (Extra money for flag trips!)
// ============================================================================

const FLAG_RATES = {
    "white": 1.25, // 1.25x your normal rate for white flag
    "purple": {    // Purple flag rates vary by premium
        "1.5": 1.5,
        "2": 2.0,
        "2.5": 2.5,
        "3": 3.0
    }
}; 