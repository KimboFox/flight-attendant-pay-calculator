/**
 * trips.js — Trip List Management
 * 
 * This file handles displaying all your saved trips in a nice list format.
 * It creates the trip cards you see, handles editing and deleting trips,
 * and makes sure everything looks good and organized.
 * 
 * What's in here:
 * - Show all your saved trips in a list
 * - Create nice-looking trip cards
 * - Handle editing trips (load them into the form)
 * - Handle deleting trips with confirmation
 * - Sort and filter trips
 * - Show trip statistics (total earnings, etc.)
 * 
 * This makes your trips look good and easy to manage!
 */

// ============================================================================
// TRIP LIST DISPLAY (Show all trips in a nice list)
// ============================================================================

/**
 * Refresh the trip list display
 * This updates the list when trips are added, edited, or deleted
 */
function refreshTripList() {
    try {
        const trips = getAllTrips();
        const tripListContainer = document.getElementById('trip-comparison');
        
        if (!tripListContainer) {
            console.error('Trip list container not found');
            return;
        }
        
        if (trips.length === 0) {
            showEmptyState(tripListContainer);
        } else {
            showTripList(tripListContainer, trips);
        }
        
        // Update statistics
        updateTripStatistics();
        
        console.log(`Refreshed trip list with ${trips.length} trips`);
        
    } catch (error) {
        console.error('Error refreshing trip list:', error);
        showErrorToast('Failed to refresh trip list');
    }
}

/**
 * Show the trip list with all trips
 * @param {HTMLElement} container - The container to show trips in
 * @param {Array} trips - Array of trips to display
 */
function showTripList(container, trips) {
    // Clear the container
    container.innerHTML = '';
    
    // Sort trips by date (newest first)
    const sortedTrips = trips.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Create trip cards
    sortedTrips.forEach(trip => {
        const tripCard = createTripCard(trip);
        container.appendChild(tripCard);
    });
}

/**
 * Show empty state when no trips exist
 * @param {HTMLElement} container - The container to show empty state in
 */
function showEmptyState(container) {
    container.innerHTML = `
        <div class="no-trips-message" id="no-trips-message">
            <h2>No trips to compare yet</h2>
            <p>Click the "+" button to add your first trip. You can add multiple trips to compare their value and find the best option.</p>
            <button class="btn btn-primary" id="first-trip-btn" aria-label="Add your first trip">Add Your First Trip</button>
        </div>
    `;
    // Set up the event listener for the button (restore old behavior)
    const firstTripBtn = document.getElementById('first-trip-btn');
    if (firstTripBtn) {
        firstTripBtn.addEventListener('click', function() {
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
        });
    }
}

// ============================================================================
// TRIP CARD CREATION (Create individual trip cards)
// ============================================================================

/**
 * Create a trip card element
 * @param {Object} trip - The trip data
 * @returns {HTMLElement} - The trip card element
 */
function calculateTripPay(trip) {
    // Import rates from config.js
    const payYear = trip.payYear || 'Year 1';
    const baseRate = (typeof PAY_RATES !== 'undefined' && PAY_RATES[payYear]) ? PAY_RATES[payYear].baseRate : 0;
    const flagRate = (typeof PAY_RATES !== 'undefined' && PAY_RATES[payYear]) ? PAY_RATES[payYear].flagRate : 0;
    const creditedHours = (parseInt(trip.creditedHoursHours, 10) || 0) + ((parseInt(trip.creditedHoursMinutes, 10) || 0) / 60);
    const tafbHours = (parseInt(trip.tafbHours, 10) || 0) + ((parseInt(trip.tafbMinutes, 10) || 0) / 60);
    const tripLength = parseInt(trip.tripLength, 10) || 1;

    // White Flag
    const whiteFlagPay = trip.whiteFlag ? creditedHours * baseRate * (FLAG_RATES.white - 1) : 0;

    // Purple Flag
    let purpleFlagPay = 0;
    if (trip.purpleFlag && trip.purpleFlagPremium && FLAG_RATES.purple[trip.purpleFlagPremium]) {
        purpleFlagPay = creditedHours * baseRate * (FLAG_RATES.purple[trip.purpleFlagPremium] - 1);
    }

    // Galley Pay
    const galleyHours = (parseInt(trip.galleyHoursHours, 10) || 0) + ((parseInt(trip.galleyHoursMinutes, 10) || 0) / 60);
    const galleyPay = trip.galleyPay ? galleyHours * GALLEY_RATE : 0;

    // Purser Pay
    let purserPay = 0;
    if (trip.purserPay && trip.aircraftType) {
        const usHours = parseFloat(trip.purserUsHours) || 0;
        const nonUsHours = parseFloat(trip.purserNonUsHours) || 0;
        const purserRates = PURSER_RATES[trip.aircraftType] || { usRate: 0, nonUsRate: 0 };
        purserPay = (usHours * purserRates.usRate) + (nonUsHours * purserRates.nonUsRate);
    }

    // Language Pay
    const languagePay = trip.languagePay ? creditedHours * LANGUAGE_RATE : 0;

    // Holiday Pay
    const holidayHours = parseFloat(trip.holidayHours) || 0;
    const holidayPay = trip.holidayPay ? holidayHours * baseRate * (HOLIDAY_RATE - 1) : 0;

    // International Override
    const intlOverridePay = trip.intlPayOverride ? creditedHours * (flagRate - baseRate) : 0;

    // Per Diem
    const perDiemRate = trip.intlOverride ? APP_CONFIG.INTERNATIONAL_PER_DIEM_RATE : APP_CONFIG.DOMESTIC_PER_DIEM_RATE;
    const perDiem = tafbHours * perDiemRate;

    // Base Pay
    const basePay = creditedHours * baseRate;

    // Gross Pay (sum of all pay types)
    const grossPay = basePay + perDiem + whiteFlagPay + purpleFlagPay + galleyPay + purserPay + languagePay + holidayPay + intlOverridePay;

    // Net Pay Estimate (subtract retirement and tax if provided)
    let netPayEstimate = grossPay;
    const retirementPct = parseFloat(trip.retirementPercentage) || 0;
    const taxPct = parseFloat(trip.taxRate) || 0;
    if (retirementPct > 0) {
        netPayEstimate -= grossPay * (retirementPct / 100);
    }
    if (taxPct > 0) {
        netPayEstimate -= grossPay * (taxPct / 100);
    }

    // Hourly and Daily Value
    const hourlyValue = creditedHours > 0 ? grossPay / creditedHours : 0;
    const dailyValue = tripLength > 0 ? grossPay / tripLength : 0;

    // Use formatCurrency from utils.js if available
    const format = (typeof formatCurrency === 'function') ? formatCurrency : (v) => `$${v.toFixed(2)}`;

    return {
        basePay: format(basePay),
        perDiem: format(perDiem),
        whiteFlagPay: trip.whiteFlag ? format(whiteFlagPay) : '--',
        purpleFlagPay: trip.purpleFlag ? format(purpleFlagPay) : '--',
        galleyPay: trip.galleyPay ? format(galleyPay) : '--',
        purserPay: trip.purserPay ? format(purserPay) : '--',
        languagePay: trip.languagePay ? format(languagePay) : '--',
        holidayPay: trip.holidayPay ? format(holidayPay) : '--',
        intlOverridePay: trip.intlPayOverride ? format(intlOverridePay) : '--',
        grossPay: format(grossPay),
        netPayEstimate: format(netPayEstimate),
        hourlyValue: `${format(hourlyValue)}/hr`,
        dailyValue: `${format(dailyValue)}/day`
    };
}

/**
 * Create a trip card element
 * @param {Object} trip - The trip data
 * @returns {HTMLElement} - The trip card element
 */
function createTripCard(trip) {
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.dataset.tripId = trip.id;

    // Best value badge (hidden by default)
    const bestValueBadge = document.createElement('div');
    bestValueBadge.className = 'best-value-badge';
    bestValueBadge.textContent = 'Best Value';
    card.appendChild(bestValueBadge);

    // Header
    const header = document.createElement('div');
    header.className = 'trip-card-header';
    header.style.backgroundColor = trip.color || 'var(--primary)';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'trip-title';
    titleDiv.textContent = trip.name || 'Unnamed Trip';
    header.appendChild(titleDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'trip-card-actions';

    const editAction = document.createElement('button');
    editAction.className = 'trip-card-action edit-trip';
    editAction.dataset.id = trip.id;
    editAction.textContent = '✏️';
    editAction.setAttribute('aria-label', `Edit trip ${trip.name}`);
    editAction.setAttribute('type', 'button');
    actionsDiv.appendChild(editAction);

    const deleteAction = document.createElement('button');
    deleteAction.className = 'trip-card-action delete-trip';
    deleteAction.dataset.id = trip.id;
    deleteAction.textContent = '🗑️';
    deleteAction.setAttribute('aria-label', `Delete trip ${trip.name}`);
    deleteAction.setAttribute('type', 'button');
    actionsDiv.appendChild(deleteAction);

    header.appendChild(actionsDiv);
    card.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'trip-card-body';

    // Details
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'trip-details';

    // Helper to add detail rows
    function addDetail(label, value) {
        const row = document.createElement('div');
        row.className = 'trip-detail';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'trip-detail-label';
        labelSpan.textContent = label;
        const valueSpan = document.createElement('span');
        valueSpan.className = 'trip-detail-value';
        valueSpan.textContent = value;
        row.appendChild(labelSpan);
        row.appendChild(valueSpan);
        detailsDiv.appendChild(row);
    }

    addDetail('Pay Year', trip.payYear || '');
    addDetail('Credited Hours', `${trip.creditedHoursHours || '0'}h ${trip.creditedHoursMinutes || '0'}m`);
    addDetail('TAFB time', `${trip.tafbHours || '0'}h ${trip.tafbMinutes || '0'}m`);
    addDetail('Trip Length', `${trip.tripLength || '1'} day${parseInt(trip.tripLength, 10) > 1 ? 's' : ''}`);

    body.appendChild(detailsDiv);

    // Summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'trip-summary';

    // Calculate pay breakdown
    const calc = calculateTripPay(trip);

    // Helper to add summary items
    function addSummary(label, value, highlight = false) {
        if (value === '--') return; // Only show if value is present
        const item = document.createElement('div');
        item.className = 'trip-summary-item';
        if (highlight) item.classList.add('highlight');
        const labelSpan = document.createElement('span');
        labelSpan.className = 'trip-summary-label';
        labelSpan.textContent = label;
        const valueSpan = document.createElement('span');
        valueSpan.className = 'trip-summary-value';
        valueSpan.textContent = value;
        item.appendChild(labelSpan);
        item.appendChild(valueSpan);
        summaryDiv.appendChild(item);
    }

    addSummary('Base Pay', calc.basePay);
    addSummary('Per Diem', calc.perDiem);
    addSummary('White Flag Pay', calc.whiteFlagPay);
    addSummary('Purple Flag Pay', calc.purpleFlagPay);
    addSummary('Galley Pay', calc.galleyPay);
    addSummary('Purser Pay', calc.purserPay);
    addSummary('Language Pay', calc.languagePay);
    addSummary('Holiday Pay', calc.holidayPay);
    addSummary('Intl Override Pay', calc.intlOverridePay);
    addSummary('Gross Pay', calc.grossPay, true);
    addSummary('Net Pay Est.', calc.netPayEstimate, true);
    addSummary('Hourly Value', calc.hourlyValue);
    addSummary('Daily Value', calc.dailyValue);

    body.appendChild(summaryDiv);
    card.appendChild(body);

    // Add event listeners for edit/delete
    function handleEditClick(e) {
        e.stopPropagation();
        loadTripForEditing(trip);
    }
    function handleDeleteClick(e) {
        e.stopPropagation();
        confirmDeleteTrip(trip);
    }
    editAction.removeEventListener('click', handleEditClick);
    editAction.addEventListener('click', handleEditClick);
    deleteAction.removeEventListener('click', handleDeleteClick);
    deleteAction.addEventListener('click', handleDeleteClick);

    return card;
}

/**
 * Add event listeners to a trip card
 * @param {HTMLElement} card - The trip card element
 * @param {Object} trip - The trip data
 */
function addTripCardEventListeners(card, trip) {
    // Edit button
    const editButton = card.querySelector('.edit-trip');
    if (editButton) {
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            loadTripForEditing(trip);
        });
    }
    
    // Delete button
    const deleteButton = card.querySelector('.delete-trip');
    if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteTrip(trip);
        });
    }
    
    // Card click (for future features)
    card.addEventListener('click', () => {
        // Could add trip details view here
        console.log('Trip card clicked:', trip.name);
    });
}

// ============================================================================
// TRIP ACTIONS (Edit, delete, etc.)
// ============================================================================

/**
 * Confirm deletion of a trip
 * @param {Object} trip - The trip to delete
 */
function confirmDeleteTrip(trip) {
    try {
        // Create confirmation dialog
        const dialog = document.createElement('div');
        dialog.className = 'delete-confirm-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Delete Trip</h3>
                <p>Are you sure you want to delete "${trip.name}"?</p>
                <p class="warning">This action cannot be undone.</p>
                <div class="dialog-actions">
                    <button class="btn btn-secondary cancel-delete">Cancel</button>
                    <button class="btn btn-danger confirm-delete">Delete Trip</button>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(dialog);
        
        // Add event listeners
        const cancelButton = dialog.querySelector('.cancel-delete');
        const confirmButton = dialog.querySelector('.confirm-delete');
        
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        confirmButton.addEventListener('click', () => {
            deleteTripConfirmed(trip);
            document.body.removeChild(dialog);
        });
        
        // Close on outside click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
        
    } catch (error) {
        console.error('Error showing delete confirmation:', error);
        showErrorToast('Failed to show delete confirmation');
    }
}

/**
 * Handle confirmed trip deletion
 * @param {Object} trip - The trip to delete
 */
function deleteTripConfirmed(trip) {
    try {
        // Store trip data for potential undo
        const deletedTrip = { ...trip };
        
        // Delete the trip
        const success = deleteTrip(trip.id);
        
        if (success) {
            // Show success message with undo option
            showTripDeletedToast(trip.name, () => {
                // Undo function - restore the trip
                addTrip(deletedTrip);
                refreshTripList();
            });
            
            // Refresh the list
            refreshTripList();
            
        } else {
            showErrorToast('Failed to delete trip');
        }
        
    } catch (error) {
        console.error('Error deleting trip:', error);
        showErrorToast('Failed to delete trip');
    }
}

// ============================================================================
// TRIP STATISTICS (Show totals and summaries)
// ============================================================================

/**
 * Update trip statistics display
 * This shows total earnings, trip count, etc.
 */
function updateTripStatistics() {
    try {
        const trips = getAllTrips();
        const totalEarnings = getTotalEarnings();
        const tripCount = trips.length;
        
        // Update statistics display
        updateStatisticDisplay('total-trips', tripCount);
        updateStatisticDisplay('total-earnings', formatEarnings(totalEarnings));
        updateStatisticDisplay('average-earnings', formatEarnings(tripCount > 0 ? totalEarnings / tripCount : 0));
        
        // Show/hide statistics section
        const statsSection = document.getElementById('trip-statistics');
        if (statsSection) {
            statsSection.style.display = tripCount > 0 ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Error updating trip statistics:', error);
    }
}

/**
 * Update a specific statistic display
 * @param {string} statId - The ID of the statistic element
 * @param {string|number} value - The value to display
 */
function updateStatisticDisplay(statId, value) {
    const element = document.getElementById(statId);
    if (element) {
        element.textContent = value;
    }
}

// ============================================================================
// TRIP FILTERING AND SORTING (Organize trips)
// ============================================================================

/**
 * Filter trips by search term
 * @param {string} searchTerm - The term to search for
 */
function filterTrips(searchTerm) {
    try {
        const trips = getAllTrips();
        const filteredTrips = trips.filter(trip => {
            const searchLower = searchTerm.toLowerCase();
            return (
                trip.name.toLowerCase().includes(searchLower) ||
                trip.departure.toLowerCase().includes(searchLower) ||
                trip.arrival.toLowerCase().includes(searchLower) ||
                trip.notes.toLowerCase().includes(searchLower)
            );
        });
        
        const tripListContainer = document.getElementById('trip-comparison');
        if (tripListContainer) {
            if (filteredTrips.length === 0) {
                showNoResultsState(tripListContainer, searchTerm);
            } else {
                showTripList(tripListContainer, filteredTrips);
            }
        }
        
    } catch (error) {
        console.error('Error filtering trips:', error);
    }
}

/**
 * Show no results state when search returns nothing
 * @param {HTMLElement} container - The container to show state in
 * @param {string} searchTerm - The search term that returned no results
 */
function showNoResultsState(container, searchTerm) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No trips found</h3>
            <p>No trips match "${searchTerm}". Try a different search term.</p>
        </div>
    `;
}

/**
 * Sort trips by different criteria
 * @param {string} sortBy - The field to sort by ('date', 'name', 'earnings')
 * @param {string} sortOrder - The sort order ('asc' or 'desc')
 */
function sortTrips(sortBy, sortOrder = 'desc') {
    try {
        const trips = getAllTrips();
        const sortedTrips = [...trips].sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
                    break;
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'earnings':
                    aValue = parseFloat(a.earnings) || 0;
                    bValue = parseFloat(b.earnings) || 0;
                    break;
                default:
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        const tripListContainer = document.getElementById('trip-comparison');
        if (tripListContainer) {
            showTripList(tripListContainer, sortedTrips);
        }
        
    } catch (error) {
        console.error('Error sorting trips:', error);
    }
}

// ============================================================================
// UTILITY FUNCTIONS (Helper functions for formatting)
// ============================================================================

/**
 * Format a trip date for display
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
function formatTripDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

/**
 * Format a relative date (e.g., "2 days ago")
 * @param {string} dateString - The date string to format
 * @returns {string} - Relative date string
 */
function formatRelativeDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    } catch (error) {
        return dateString;
    }
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// EXPORT FUNCTIONALITY (Export trips to different formats)
// ============================================================================

/**
 * Export trips to CSV format
 * @returns {string} - CSV data
 */
function exportTripsToCSV() {
    try {
        const trips = getAllTrips();
        
        if (trips.length === 0) {
            showNoTripsToast();
            return null;
        }
        
        // CSV headers
        const headers = ['Name', 'Departure', 'Arrival', 'Date', 'Duration', 'Pay Rate', 'Earnings', 'Notes'];
        
        // CSV rows
        const rows = trips.map(trip => [
            trip.name,
            trip.departure,
            trip.arrival,
            trip.date,
            trip.duration,
            trip.payRate,
            trip.earnings,
            trip.notes || ''
        ]);
        
        // Combine headers and rows
        const csvData = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        return csvData;
        
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        showErrorToast('Failed to export trips');
        return null;
    }
}

/**
 * Export trips to JSON format
 * @returns {string} - JSON data
 */
function exportTripsToJSON() {
    try {
        const trips = getAllTrips();
        
        if (trips.length === 0) {
            showNoTripsToast();
            return null;
        }
        
        const exportData = {
            exportDate: new Date().toISOString(),
            tripCount: trips.length,
            totalEarnings: getTotalEarnings(),
            trips: trips
        };
        
        return JSON.stringify(exportData, null, 2);
        
    } catch (error) {
        console.error('Error exporting to JSON:', error);
        showErrorToast('Failed to export trips');
        return null;
    }
}

/**
 * Download exported data as a file
 * @param {string} data - The data to download
 * @param {string} filename - The filename
 * @param {string} mimeType - The MIME type
 */
function downloadExport(data, filename, mimeType) {
    try {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        showExportSuccessToast();
        
    } catch (error) {
        console.error('Error downloading export:', error);
        showErrorToast('Failed to download export');
    }
} 