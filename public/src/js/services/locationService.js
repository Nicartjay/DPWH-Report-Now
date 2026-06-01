// Location services - geolocation and user location management

import { MAP_CONFIG, GEOLOCATION_CONFIG, USER_MARKER_CONFIG, DEFAULTS } from '../config/constants.js';
import { appState } from '../state/appState.js';
import { getCityFromCoordinates } from '../api/geocodingApi.js';
import { loadProjectsFromAPI } from '../api/dpwhApi.js';

/**
 * Get user's current location using browser geolocation API
 * Falls back to Manila if geolocation fails or is denied
 * CRITICAL: After getting location, fetches city name and loads projects
 */
export async function getUserLocation() {
    const statusEl = document.getElementById('statusMessage');
    const statusBanner = document.getElementById('statusBanner');

    if (!navigator.geolocation) {
        statusEl.textContent = 'Geolocation not supported';
        return;
    }

    statusEl.textContent = 'Getting your location...';
    statusBanner.style.display = 'block';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            appState.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            statusEl.textContent = 'Getting city information...';

            // Center map on user location
            appState.map.setView([appState.userLocation.lat, appState.userLocation.lng], MAP_CONFIG.DEFAULT_ZOOM);

            // Add user location marker with pulsing animation
            L.marker([appState.userLocation.lat, appState.userLocation.lng], {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: `
                        <div class="user-location-pulse">
                            <div class="user-location-dot"></div>
                        </div>
                    `,
                    iconSize: [USER_MARKER_CONFIG.SIZE, USER_MARKER_CONFIG.SIZE],
                    iconAnchor: USER_MARKER_CONFIG.ANCHOR
                })
            }).addTo(appState.map).bindPopup('Your Location');

            // Get city name from coordinates
            await getCityFromCoordinates(appState.userLocation.lat, appState.userLocation.lng);

            // Load projects from API
            await loadProjectsFromAPI();
        },
        async (error) => {
            console.error('Geolocation error:', error);

            // Fallback to Manila, Philippines as default location
            console.log('Using default location: Manila, Philippines');
            appState.userLocation = {
                lat: 14.5995,
                lng: 120.9842
            };

            statusEl.textContent = 'Using default location: Manila';

            // Center map on default location
            appState.map.setView([appState.userLocation.lat, appState.userLocation.lng], MAP_CONFIG.DEFAULT_ZOOM);

            // Add marker for default location with pulsing animation
            L.marker([appState.userLocation.lat, appState.userLocation.lng], {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: `
                        <div class="user-location-pulse">
                            <div class="user-location-dot"></div>
                        </div>
                    `,
                    iconSize: [USER_MARKER_CONFIG.SIZE, USER_MARKER_CONFIG.SIZE],
                    iconAnchor: USER_MARKER_CONFIG.ANCHOR
                })
            }).addTo(appState.map).bindPopup('Default Location (Manila)');

            // Get city name and load projects
            await getCityFromCoordinates(appState.userLocation.lat, appState.userLocation.lng);
            await loadProjectsFromAPI();
        },
        {
            enableHighAccuracy: GEOLOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
            timeout: GEOLOCATION_CONFIG.TIMEOUT,
            maximumAge: GEOLOCATION_CONFIG.MAXIMUM_AGE
        }
    );
}

// Made with Bob
