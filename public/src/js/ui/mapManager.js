// Map initialization and management

import { MAP_CONFIG } from '../config/constants.js';
import { appState } from '../state/appState.js';

/**
 * Initialize Leaflet Map
 * Sets up the map with OpenStreetMap tiles and controls
 */
export function initMap() {
    // Default center (Metro Manila)
    const defaultCenter = MAP_CONFIG.DEFAULT_CENTER;

    // Ensure map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }

    try {
        appState.map = L.map('map', {
            zoomControl: true,
            attributionControl: true
        }).setView(defaultCenter, MAP_CONFIG.DEFAULT_ZOOM);

        // Add OpenStreetMap tiles
        L.tileLayer(MAP_CONFIG.TILE_LAYER, {
            attribution: MAP_CONFIG.ATTRIBUTION,
            maxZoom: MAP_CONFIG.MAX_ZOOM
        }).addTo(appState.map);

        // Add scale control
        L.control.scale({ imperial: MAP_CONFIG.SCALE_IMPERIAL }).addTo(appState.map);

        // Force map to recalculate size after a short delay
        setTimeout(() => {
            appState.map.invalidateSize();
        }, 100);

        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

/**
 * Center map on a specific project location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
export function centerMapOnProject(lat, lng) {
    appState.map.setView([lat, lng], 16);
    document.getElementById('projectModal').classList.remove('active');
}

// Made with Bob
