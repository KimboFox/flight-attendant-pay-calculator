/**
 * ui.js — User Interface Updates
 * 
 * This file handles all the visual stuff - like making things look good,
 * showing/hiding different parts of the page, and adding smooth animations
 * when things change.
 * 
 * What's in here:
 * - Show and hide different sections of the page
 * - Add smooth animations and transitions
 * - Update the header and navigation
 * - Handle responsive design changes
 * - Make the interface feel polished and professional
 * 
 * This makes the app look great and feel smooth to use!
 */

// ============================================================================
// VIEW MANAGEMENT (Show and hide different parts of the page)
// ============================================================================

/**
 * Switch between different views (form, trips, etc.)
 * @param {string} viewName - The name of the view to show
 */
function switchView(viewName) {
    try {
        // Hide all views first
        hideAllViews();
        
        // Show the requested view
        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) {
            viewElement.style.display = 'block';
            viewElement.classList.add('active');
            
            // Update current view in state
            setCurrentView(viewName);
            
            // Update navigation
            updateNavigation(viewName);
            
            console.log(`Switched to ${viewName} view`);
        } else {
            console.error(`View not found: ${viewName}-view`);
        }
        
    } catch (error) {
        console.error('Error switching view:', error);
    }
}

/**
 * Hide all views
 */
function hideAllViews() {
    const views = ['form', 'trips', 'settings'];
    
    views.forEach(viewName => {
        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) {
            viewElement.style.display = 'none';
            viewElement.classList.remove('active');
        }
    });
}

/**
 * Update navigation to reflect current view
 * @param {string} currentView - The current view name
 */
function updateNavigation(currentView) {
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to current nav item
    const activeNavItem = document.querySelector(`[data-view="${currentView}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

function showTripsView() {
    document.getElementById('trips-view').style.display = '';
    document.getElementById('form-view').style.display = 'none';
    document.getElementById('add-trip-btn').style.display = '';
}

function showFormView() {
    document.getElementById('form-view').style.display = '';
    document.getElementById('trips-view').style.display = 'none';
    // Keep the add trip button visible even when form is open
    document.getElementById('add-trip-btn').style.display = '';
}

// On app load, show trips view if no trips, otherwise show trips view by default
window.addEventListener('DOMContentLoaded', function() {
    const trips = (typeof getAllTrips === 'function') ? getAllTrips() : [];
    if (!trips || trips.length === 0) {
        showTripsView();
    } else {
        showTripsView();
    }
});

// ============================================================================
// HEADER MANAGEMENT (Update header based on context)
// ============================================================================

/**
 * Update header title and actions based on current context
 * @param {string} context - The current context ('form', 'trips', 'editing')
 */
function updateHeader(context) {
    try {
        const headerTitle = document.getElementById('header-title');
        const headerActions = document.getElementById('header-actions');
        
        if (!headerTitle || !headerActions) {
            console.error('Header elements not found');
            return;
        }
        
        switch (context) {
            case 'form':
                headerTitle.textContent = 'Flight Attendant Pay Calculator';
                showFormActions(headerActions);
                break;
                
            case 'trips':
                headerTitle.textContent = 'My Trips';
                showTripActions(headerActions);
                break;
                
            case 'editing':
                headerTitle.textContent = 'Edit Trip';
                showEditingActions(headerActions);
                break;
                
            default:
                headerTitle.textContent = 'Flight Attendant Pay Calculator';
                showDefaultActions(headerActions);
        }
        
    } catch (error) {
        console.error('Error updating header:', error);
    }
}

/**
 * Show form-related actions in header
 * @param {HTMLElement} actionsContainer - The actions container
 */
function showFormActions(actionsContainer) {
    actionsContainer.innerHTML = `
        <button class="btn btn-outline" onclick="switchView('trips')">
            View Trips
        </button>
        <button class="btn btn-outline" onclick="showFeedbackModal()">
            Feedback
        </button>
    `;
}

/**
 * Show trip-related actions in header
 * @param {HTMLElement} actionsContainer - The actions container
 */
function showTripActions(actionsContainer) {
    actionsContainer.innerHTML = `
        <button class="btn btn-outline" onclick="switchView('form')">
            Add Trip
        </button>
        <button class="btn btn-outline" onclick="exportTrips()">
            Export
        </button>
        <button class="btn btn-outline" onclick="clearAllTrips()">
            Clear All
        </button>
    `;
}

/**
 * Show editing-related actions in header
 * @param {HTMLElement} actionsContainer - The actions container
 */
function showEditingActions(actionsContainer) {
    actionsContainer.innerHTML = `
        <button class="btn btn-outline" onclick="cancelEditing()">
            Cancel
        </button>
        <button class="btn btn-outline" onclick="switchView('trips')">
            Back to Trips
        </button>
    `;
}

/**
 * Show default actions in header
 * @param {HTMLElement} actionsContainer - The actions container
 */
function showDefaultActions(actionsContainer) {
    actionsContainer.innerHTML = `
        <button class="btn btn-outline" onclick="showFeedbackModal()">
            Feedback
        </button>
    `;
}

// ============================================================================
// ANIMATIONS AND TRANSITIONS (Smooth visual effects)
// ============================================================================

/**
 * Add fade-in animation to an element
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in milliseconds
 */
function fadeIn(element, duration = 300) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '1';
    }, 10);
}

/**
 * Add fade-out animation to an element
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in milliseconds
 */
function fadeOut(element, duration = 300) {
    if (!element) return;
    
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
}

/**
 * Add slide-in animation from the left
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in milliseconds
 */
function slideInLeft(element, duration = 300) {
    if (!element) return;
    
    element.style.transform = 'translateX(-100%)';
    element.style.opacity = '0';
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
    }, 10);
}

/**
 * Add slide-out animation to the left
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in milliseconds
 */
function slideOutLeft(element, duration = 300) {
    if (!element) return;
    
    element.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`;
    element.style.transform = 'translateX(-100%)';
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
}

/**
 * Add bounce animation to an element
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in milliseconds
 */
function bounce(element, duration = 600) {
    if (!element) return;
    
    element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
    element.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, duration / 2);
}

/**
 * Add pulse animation to an element
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in milliseconds
 */
function pulse(element, duration = 1000) {
    if (!element) return;
    
    element.style.transition = `transform ${duration}ms ease-in-out`;
    element.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, duration);
}

// ============================================================================
// LOADING STATES (Show loading indicators)
// ============================================================================

/**
 * Show a loading spinner
 * @param {string} message - The loading message
 * @param {HTMLElement} container - The container to show spinner in
 */
function showLoadingSpinner(message = 'Loading...', container = document.body) {
    try {
        // Remove existing spinner
        hideLoadingSpinner();
        
        // Create spinner element
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-content">
                <div class="spinner"></div>
                <p class="spinner-message">${message}</p>
            </div>
        `;
        
        // Add to container
        container.appendChild(spinner);
        
        // Fade in
        fadeIn(spinner, 200);
        
    } catch (error) {
        console.error('Error showing loading spinner:', error);
    }
}

/**
 * Hide the loading spinner
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        fadeOut(spinner, 200);
        setTimeout(() => {
            if (spinner.parentNode) {
                spinner.parentNode.removeChild(spinner);
            }
        }, 200);
    }
}

/**
 * Show a loading state for a specific element
 * @param {HTMLElement} element - The element to show loading state for
 * @param {string} message - The loading message
 */
function showElementLoading(element, message = 'Loading...') {
    if (!element) return;
    
    // Store original content
    element.dataset.originalContent = element.innerHTML;
    
    // Show loading state
    element.innerHTML = `
        <div class="element-loading">
            <div class="mini-spinner"></div>
            <span>${message}</span>
        </div>
    `;
    
    element.classList.add('loading');
}

/**
 * Hide loading state for a specific element
 * @param {HTMLElement} element - The element to restore
 */
function hideElementLoading(element) {
    if (!element) return;
    
    // Restore original content
    if (element.dataset.originalContent) {
        element.innerHTML = element.dataset.originalContent;
        delete element.dataset.originalContent;
    }
    
    element.classList.remove('loading');
}

// ============================================================================
// RESPONSIVE DESIGN (Handle screen size changes)
// ============================================================================

/**
 * Handle responsive design changes
 * This updates the UI based on screen size
 */
function handleResponsiveDesign() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const isDesktop = window.innerWidth >= 1024;
    
    // Update body classes
    document.body.classList.toggle('mobile', isMobile);
    document.body.classList.toggle('tablet', isTablet);
    document.body.classList.toggle('desktop', isDesktop);
    
    // Update header layout
    updateHeaderLayout(isMobile);
    
    // Update main content layout
    updateMainContentLayout(isMobile);
    
    console.log(`Responsive design updated: ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`);
}

/**
 * Update header layout based on screen size
 * @param {boolean} isMobile - Whether we're on mobile
 */
function updateHeaderLayout(isMobile) {
    const header = document.querySelector('.header');
    if (!header) return;
    
    if (isMobile) {
        header.classList.add('mobile-layout');
        header.classList.remove('desktop-layout');
    } else {
        header.classList.add('desktop-layout');
        header.classList.remove('mobile-layout');
    }
}

/**
 * Update main content layout based on screen size
 * @param {boolean} isMobile - Whether we're on mobile
 */
function updateMainContentLayout(isMobile) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    if (isMobile) {
        mainContent.classList.add('mobile-layout');
        mainContent.classList.remove('desktop-layout');
    } else {
        mainContent.classList.add('desktop-layout');
        mainContent.classList.remove('mobile-layout');
    }
}

// ============================================================================
// SCROLL MANAGEMENT (Handle smooth scrolling and positioning)
// ============================================================================

/**
 * Smooth scroll to an element
 * @param {HTMLElement|string} target - The element or selector to scroll to
 * @param {number} offset - Additional offset from the top
 */
function smoothScrollTo(target, offset = 0) {
    try {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        
        if (element) {
            const elementPosition = element.offsetTop - offset;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
        
    } catch (error) {
        console.error('Error scrolling to element:', error);
    }
}

/**
 * Scroll to top of the page
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Check if an element is in viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - Whether the element is in viewport
 */
function isInViewport(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ============================================================================
// THEME MANAGEMENT (Handle light/dark mode)
// ============================================================================

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    try {
        const currentTheme = getSetting('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Update setting
        updateSettings({ theme: newTheme });
        
        // Apply theme
        applyTheme(newTheme);
        
        // Show feedback
        showInfoToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme enabled`);
        
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

/**
 * Apply a specific theme
 * @param {string} theme - The theme to apply ('light' or 'dark')
 */
function applyTheme(theme) {
    // Remove existing theme classes
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Add new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Update theme-specific elements
    updateThemeElements(theme);
}

/**
 * Update theme-specific elements
 * @param {string} theme - The current theme
 */
function updateThemeElements(theme) {
    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    }
    
    // Update other theme-specific elements as needed
    const themeElements = document.querySelectorAll('[data-theme]');
    themeElements.forEach(element => {
        element.dataset.theme = theme;
    });
}

// ============================================================================
// ACCESSIBILITY (Improve accessibility features)
// ============================================================================

/**
 * Focus management for better accessibility
 * @param {HTMLElement} element - The element to focus
 */
function focusElement(element) {
    if (element && typeof element.focus === 'function') {
        element.focus();
    }
}

/**
 * Add keyboard navigation support
 * @param {HTMLElement} container - The container to add keyboard support to
 */
function addKeyboardNavigation(container) {
    if (!container) return;
    
    const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    container.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Handle tab navigation
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

/**
 * Announce changes to screen readers
 * @param {string} message - The message to announce
 */
function announceToScreenReader(message) {
    // Create a temporary element for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 1000);
} 