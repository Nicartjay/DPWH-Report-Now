// Geocoding API - Reverse geocoding using Nominatim (OpenStreetMap)
// CRITICAL: Nominatim API requires accept-language=en header to force English (prevents Tagalog responses)

import { GEOCODING_CONFIG, DEFAULTS } from '../config/constants.js';
import { appState } from '../state/appState.js';
import { getProvinceFromCity } from '../config/provinces.js';

/**
 * Get city name from coordinates using reverse geocoding
 * CRITICAL: Uses Nominatim with accept-language=en to force English responses
 * Reverse geocoding priority: city || municipality || town || county (in that order)
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
export async function getCityFromCoordinates(lat, lng) {
    const statusEl = document.getElementById('statusMessage');

    try {
        // Using Nominatim (OpenStreetMap) reverse geocoding
        // Force English language response with accept-language header
        const response = await fetch(
            `${GEOCODING_CONFIG.NOMINATIM_URL}?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=${GEOCODING_CONFIG.ACCEPT_LANGUAGE}`,
            {
                headers: {
                    'User-Agent': GEOCODING_CONFIG.USER_AGENT,
                    'Accept-Language': GEOCODING_CONFIG.ACCEPT_LANGUAGE
                }
            }
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();

        // Extract city information
        const address = data.address;
        appState.currentCity = address.city || address.municipality || address.town || address.county || 'Unknown';

        // Use region from OpenStreetMap if available, otherwise use province mapping
        const region = address.region || address.state;
        appState.currentProvince = getProvinceFromCity(appState.currentCity, region);

        statusEl.textContent = `${appState.currentCity}, ${appState.currentProvince}`;

        console.log('Detected location:', appState.currentCity, appState.currentProvince);
        console.log('OpenStreetMap region:', region);

    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to default
        appState.currentCity = DEFAULTS.CITY;
        appState.currentProvince = DEFAULTS.PROVINCE;
        statusEl.textContent = `Using default location: ${DEFAULTS.CITY}`;
    }
}

