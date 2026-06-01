// DPWH API - Project data fetching
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
 * Load projects from DPWH API
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

        // Try server-side proxy first, fall back to direct API call
        const proxyUrl = `/api/projects?limit=${API_CONFIG.LIMITS.PROJECTS}&search=${searchQuery}&province=${province}`;
        const directUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS}?limit=${API_CONFIG.LIMITS.PROJECTS}&search=${searchQuery}&province=${province}`;

        console.log('Fetching from API (via proxy):', proxyUrl);

        let response;
        try {
            response = await fetch(proxyUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            // If proxy returns 503 (Cloudflare blocked), try direct
            if (response.status === 503) {
                const proxyData = await response.json();
                if (proxyData.cloudflare_blocked) {
                    console.log('Proxy blocked by Cloudflare, trying direct API...');
                    throw new Error('Cloudflare blocked');
                }
            }
        } catch (proxyError) {
            // Fallback: try direct API call (works if user has solved Cloudflare challenge)
            console.log('Trying direct API call:', directUrl);
            response = await fetch(directUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
        }

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        console.log('API Response:', data);

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

            statusEl.textContent = `Found ${appState.filteredProjects.length} projects within ${appState.maxDistance}km of ${appState.currentCity}`;

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
                    Unable to load projects from the API.<br>
                    <small>Error: ${error.message}</small><br>
                    <small>The API may be protected by Cloudflare. Try accessing from a browser first.</small>
                </div>
            </div>
        `;
    } finally {
        appState.isLoading = false;
    }
}

// Made with Bob
