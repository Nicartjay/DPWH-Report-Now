// DPWH Transparency Mobile App - Main Entry Point
// Location-based project viewer with real API integration

import { initMap } from './ui/mapManager.js';
import { getUserLocation } from './services/locationService.js';
import { setupEventListeners, setupReportModalListeners } from './events/eventHandlers.js';
import { setupGlobalHandlers } from './events/globalHandlers.js';
import BottomSheet from './ui/bottomSheet.js';
import CoverPage from './ui/coverPage.js';

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing DPWH Transparency App...');

    // Initialize cover page (brutalist landing page)
    const coverPage = new CoverPage();
    window.coverPageInstance = coverPage;

    // Setup global handlers for inline onclick events
    setupGlobalHandlers();

    // Initialize map
    initMap();

    // Get user location
    getUserLocation();

    // Setup event listeners
    setupEventListeners();
    
    // Initialize bottom sheet and make it globally accessible
    const bottomSheet = new BottomSheet();
    window.bottomSheetInstance = bottomSheet;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        setupReportModalListeners();
    });
} else {
    initApp();
    setupReportModalListeners();
}
