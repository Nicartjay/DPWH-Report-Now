/**
 * Cover Page Manager
 * Handles the brutalist landing page with dismissal animation
 * Dynamically displays user's current location
 */

import { appState } from '../state/appState.js';

class CoverPage {
  constructor() {
    this.coverPage = document.getElementById('coverPage');
    this.enterBtn = document.getElementById('enterMapBtn');
    this.coverMeta = document.querySelector('.cover-meta');
    this.isDismissed = false;
    this.locationUpdateInterval = null;
    this.backgroundMap = null;
    
    this.init();
  }

  init() {
    if (!this.coverPage || !this.enterBtn) {
      console.warn('Cover page elements not found');
      return;
    }

    document.body.classList.add('cover-page-active');

    // Check if user has previously dismissed the cover page
    const dismissed = sessionStorage.getItem('coverPageDismissed');
    if (dismissed === 'true') {
      this.dismissImmediately();
      return;
    }

    // Initialize background map
    this.initBackgroundMap();

    // Initialize location display
    this.updateLocationDisplay();

    // Poll for location updates every 500ms until location is available
    this.locationUpdateInterval = setInterval(() => {
      this.updateLocationDisplay();
    }, 500);

    // Add event listener to enter button
    this.enterBtn.addEventListener('click', () => this.dismiss());

    // Optional: Allow ESC key to dismiss
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isDismissed) {
        this.dismiss();
      }
    });
  }

  /**
   * Initialize non-interactive OpenStreetMap background
   * Centered on the Philippines with grayscale filter
   */
  initBackgroundMap() {
    const mapContainer = document.getElementById('coverMapBg');
    if (!mapContainer) {
      console.warn('Cover map background container not found');
      return;
    }

    try {
      // Create Leaflet map with all interactions disabled
      this.backgroundMap = L.map(mapContainer, {
        center: [12.8797, 121.7740], // Philippines center coordinates
        zoom: 6, // Show entire Philippines
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomControl: false,
        attributionControl: false,
        tap: false
      });

      // Add OSM tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        opacity: 1
      }).addTo(this.backgroundMap);

      console.log('Cover page background map initialized');
    } catch (error) {
      console.error('Error initializing background map:', error);
    }
  }

  /**
   * Update the cover page meta element with current location
   * Shows "Detecting Location..." if location not yet available
   * Formats coordinates to 4 decimal places
   */
  updateLocationDisplay() {
    if (!this.coverMeta) return;

    const userLocation = appState.getUserLocation();
    const currentCity = appState.getCurrentCity();
    const currentProvince = appState.getCurrentProvince();

    // If we have location data, update the display
    if (userLocation && currentCity && currentProvince) {
      const lat = userLocation.lat.toFixed(4);
      const lng = userLocation.lng.toFixed(4);
      const latDir = userLocation.lat >= 0 ? 'N' : 'S';
      const lngDir = userLocation.lng >= 0 ? 'E' : 'W';
      
      // Format: CITY, PROVINCE<br>LAT° N, LNG° E
      const locationText = `${currentCity.toUpperCase()}, ${currentProvince.toUpperCase()}`;
      const coordsText = `${Math.abs(parseFloat(lat))}° ${latDir}, ${Math.abs(parseFloat(lng))}° ${lngDir}`;
      
      this.coverMeta.innerHTML = `${locationText}<br>${coordsText}`;
      
      // Stop polling once we have location data
      if (this.locationUpdateInterval) {
        clearInterval(this.locationUpdateInterval);
        this.locationUpdateInterval = null;
      }
    } else {
      // Show loading state
      this.coverMeta.innerHTML = 'DETECTING LOCATION...<br>PLEASE WAIT';
    }
  }

  dismiss() {
    if (this.isDismissed) return;

    this.isDismissed = true;
    
    // Clear location update interval
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
    
    // Clean up background map
    this.cleanupBackgroundMap();
    
    // Add dismissed class to trigger animation
    this.coverPage.classList.add('dismissed');
    
    // Store dismissal state in session
    sessionStorage.setItem('coverPageDismissed', 'true');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      this.coverPage.style.display = 'none';
      document.body.classList.remove('cover-page-active');
      
      // Add app-loaded class to trigger entrance animations
      document.body.classList.add('app-loaded');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('coverPageDismissed'));
    }, 1200); // Match the CSS transition duration
  }

  dismissImmediately() {
    this.isDismissed = true;
    
    // Clear location update interval
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
    
    // Clean up background map
    this.cleanupBackgroundMap();
    
    this.coverPage.classList.add('dismissed');
    this.coverPage.style.display = 'none';
    document.body.classList.remove('cover-page-active');
    
    // Add app-loaded class to trigger entrance animations
    document.body.classList.add('app-loaded');
    
    // Dispatch event immediately
    window.dispatchEvent(new CustomEvent('coverPageDismissed'));
  }

  /**
   * Clean up background map instance
   */
  cleanupBackgroundMap() {
    if (this.backgroundMap) {
      try {
        this.backgroundMap.remove();
        this.backgroundMap = null;
        console.log('Cover page background map cleaned up');
      } catch (error) {
        console.error('Error cleaning up background map:', error);
      }
    }
  }

  reset() {
    // Method to reset cover page (useful for testing)
    this.isDismissed = false;
    this.coverPage.classList.remove('dismissed');
    this.coverPage.style.display = 'flex';
    document.body.classList.add('cover-page-active');
    sessionStorage.removeItem('coverPageDismissed');
  }
}

// Export for use in main.js
export default CoverPage;

