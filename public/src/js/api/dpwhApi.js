// DPWH API - Project data fetching
// Uses cached JSON data (fetched via browser tool) with live API fallback
// CRITICAL: API returns triple-nested structure: data.data.data array (not data or data.data)
// CRITICAL: Province names MUST be UPPERCASE in queries
// CRITICAL: City search: conditionally append "+city" only if "city" not already in name

import { API_CONFIG } from '../config/constants.js';
import { appState } from '../state/appState.js';
import { processProjectData } from '../services/projectService.js';
import { calculateDistance } from '../utils/helpers.js';
import { updateSummary } from '../ui/renderManager.js';
import { renderProjects } from '../ui/renderManager.js';
import { addProjectMarkers } from '../ui/markerManager.js';
import { updateStatusMessage } from '../ui/statusManager.js';

/**
 * Determine if running on localhost (dev mode)
 */
function isLocalDev() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Try to load projects directly from the DPWH API (works from localhost).
 * Returns the parsed response data or null on failure.
 */
async function loadFromDirectAPI(searchQuery, province) {
    try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}?limit=${API_CONFIG.LIMITS.PROJECTS}&search=${searchQuery}&province=${province}`;
        console.log('Fetching directly from DPWH API:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            console.log(`Direct API failed: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (e) {
        console.log('Direct API error:', e.message);
        return null;
    }
}

/**
 * Try to load projects from the cached JSON file for the current city.
 * Cache files are stored per city: /data/cache/{province}/{city}.json
 * Falls back to /data/projects-cache.json for legacy single-file cache.
 * Returns the parsed data or null if cache is unavailable/empty.
 */
async function loadFromCache(searchQuery, province) {
    try {
        // Try city-specific cache first
        const citySlug = searchQuery.replace(/\+/g, '-').toLowerCase();
        const provSlug = province.replace(/\+/g, '-').toLowerCase();
        const cityUrl = `/data/cache/${provSlug}/${citySlug}.json`;

        console.log('Trying city cache:', cityUrl);
        let response = await fetch(cityUrl);

        // Fall back to single cache file
        if (!response.ok) {
            console.log('City cache not found, trying main cache...');
            response = await fetch('/data/projects-cache.json');
        }

        if (!response.ok) return null;

        const cache = await response.json();

        // Validate cache structure
        if (!cache.data || !cache.data.data || !Array.isArray(cache.data.data.data)) {
            return null;
        }

        if (cache.data.data.data.length === 0) {
            return null;
        }

        console.log(`Loaded ${cache.data.data.data.length} projects from cache (fetched: ${cache._meta?.fetchedAt || 'unknown'})`);
        return cache.data;
    } catch (e) {
        console.log('Cache not available:', e.message);
        return null;
    }
}

/**
 * Load projects from DPWH API
 * Strategy: Try live API first, fall back to cached JSON data
 * CRITICAL: API returns triple-nested structure: data.data.data
 * CRITICAL: Province names MUST be UPPERCASE
 * CRITICAL: City search conditionally appends "+city" only if "city" not already in name
 */
export async function loadProjectsFromAPI() {
    const statusEl = document.getElementById('statusMessage');
    const projectsList = document.getElementById('projectsList');

    if (!appState.currentCity || !appState.currentProvince) {
        console.error('City or province not set');
        return;
    }

    appState.isLoading = true;
    projectsList.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading projects from ${appState.currentCity}...</p>
        </div>
    `;

    try {
        // Format search query - API expects uppercase province
        let searchQuery = appState.currentCity.toLowerCase().replace(/\s+/g, '+');

        // Add "+city" only if "city" is not already in the name
        if (!appState.currentCity.toLowerCase().includes('city')) {
            searchQuery += '+city';
        }

        const province = appState.currentProvince.replace(/\s+/g, '+').toUpperCase();

        // Strategy:
        // - On localhost: call DPWH API directly (no CORS issues from localhost)
        // - On production: use cached JSON data (Cloudflare blocks cross-origin)
        let data = null;
        let dataSource = '';

        if (isLocalDev()) {
            // Direct API call works from localhost
            data = await loadFromDirectAPI(searchQuery, province);
            dataSource = 'live';
        }

        if (!data) {
            // Fall back to cached data (production, or localhost if direct fails)
            data = await loadFromCache(searchQuery, province);
            dataSource = 'cache';
        }

        if (!data) {
            throw new Error('No data available. Use /tools/refresh-cache.html to fetch and cache DPWH project data.');
        }

        console.log(`Using ${dataSource} data`);

        // Process the projects data - API returns nested data structure
        if (data.data && data.data.data && Array.isArray(data.data.data)) {
            appState.projects = data.data.data.map(project => processProjectData(project));

            // Calculate distances
            if (appState.userLocation) {
                appState.projects.forEach(project => {
                    if (project.location && project.location.lat && project.location.lng) {
                        project.distance = calculateDistance(
                            appState.userLocation.lat,
                            appState.userLocation.lng,
                            project.location.lat,
                            project.location.lng
                        );
                    }
                });

                // Sort by distance
                appState.projects.sort((a, b) => (a.distance || 999) - (b.distance || 999));
            }

            // Apply initial distance filter (default is 1km)
            // CRITICAL: This ensures only projects within maxDistance are shown on initial load
            if (appState.maxDistance < 999999) {
                appState.filteredProjects = appState.projects.filter(p =>
                    p.distance !== undefined && p.distance <= appState.maxDistance
                );
            } else {
                appState.filteredProjects = appState.projects;
            }

            const sourceLabel = dataSource === 'cache' ? ' (cached data)' : '';
            statusEl.textContent = `Found ${appState.filteredProjects.length} projects within ${appState.maxDistance}km of ${appState.currentCity}${sourceLabel}`;

            updateStatusMessage();
            updateSummary();
            renderProjects();
            addProjectMarkers();
        } else {
            throw new Error('Invalid API response format');
        }

    } catch (error) {
        console.error('Error loading projects:', error);
        statusEl.textContent = `Error: ${error.message}`;

        projectsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-text">
                    Unable to load projects.<br>
                    <small>${error.message}</small><br><br>
                    <strong>To fix:</strong><br>
                    <small>1. Open <a href="/tools/refresh-cache.html" target="_blank">/tools/refresh-cache.html</a></small><br>
                    <small>2. Follow instructions to fetch and cache DPWH data</small><br>
                    <small>3. Save the JSON file and redeploy</small>
                </div>
            </div>
        `;
    } finally {
        appState.isLoading = false;
    }
}

// Made with Bob
