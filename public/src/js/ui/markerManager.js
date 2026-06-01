// Map marker management
// CRITICAL: MUST skip projects with lat/lng === 0 (invalid coordinates from API)
// CRITICAL: Clear markers before adding: appState.markers.forEach(marker => marker.remove())
// CRITICAL: Active marker shows enlarged with action buttons (Direction, Detail)

import { STATUS_COLORS, PROJECT_ICONS, MARKER_CONFIG, DEFAULTS } from '../config/constants.js';
import { appState } from '../state/appState.js';
import { matchesProjectType } from '../services/filterService.js';
import { formatCurrency } from '../utils/formatters.js';
import { clearDirections } from '../services/routingService.js';

/**
 * Create marker HTML with optional expanded state
 * @param {string} markerColor - Color for the marker
 * @param {string} markerIcon - Icon to display
 * @param {boolean} isExpanded - Whether marker is in expanded state
 * @param {string} projectId - Project ID for action buttons
 * @returns {string} HTML string for marker
 */
function createMarkerHTML(markerColor, markerIcon, isExpanded = false, projectId = '') {
    // Keep marker size constant - no enlargement when expanded
    const size = MARKER_CONFIG.SIZE;
    const iconSize = MARKER_CONFIG.ICON_SIZE;
    
    const baseMarker = `
        <div style="position: absolute; top: 0; left: 0; right: 0; background: white; width: ${size}px; height: ${size}px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 3px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="background: ${markerColor}; opacity: 0.85; width: ${size - 6}px; height: ${size - 6}px; border-radius: 50% 50% 50% 0; display: flex; align-items: center; justify-content: center;">
                <span style="transform: rotate(45deg); font-size: ${iconSize}px; color: white; opacity: 1;">${markerIcon}</span>
            </div>
        </div>
    `;
    
    if (!isExpanded) {
        return `<div style="position: relative; width: ${size}px; height: ${size + 10}px;">${baseMarker}</div>`;
    }
    
    // Expanded state keeps the base marker unchanged and adds action buttons above it
    return `
        <div style="position: relative; width: ${size}px; height: ${size + 50}px;">
            ${baseMarker}
            <div class="marker-actions" style="position: absolute; top: 0; left: 50%; transform: translate(-50%, -100%); display: flex; gap: 8px; z-index: 1000;">
                <button onclick="window.handleMarkerDirection('${projectId}')" class="marker-action-btn marker-direction-btn" title="Get Directions">
                    <span class="material-icons">directions</span>
                </button>
                <button onclick="window.handleMarkerDetail('${projectId}')" class="marker-action-btn marker-detail-btn" title="View Details">
                    <span class="material-icons">info</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Update a marker's appearance based on expanded state
 * @param {L.Marker} marker - Leaflet marker to update
 * @param {Object} project - Project data
 * @param {boolean} isExpanded - Whether to show expanded state
 */
function updateMarkerState(marker, project, isExpanded) {
    const markerColor = STATUS_COLORS[project.status] || STATUS_COLORS.default;
    const projectType = (project.type || '').toLowerCase();
    let markerIcon = PROJECT_ICONS.default;

    if (projectType.includes('road') || projectType.includes('highway')) {
        markerIcon = PROJECT_ICONS.road;
    } else if (projectType.includes('bridge')) {
        markerIcon = PROJECT_ICONS.bridge;
    } else if (projectType.includes('building') || projectType.includes('school')) {
        markerIcon = PROJECT_ICONS.building;
    } else if (projectType.includes('flood') || projectType.includes('drainage')) {
        markerIcon = PROJECT_ICONS.flood;
    } else if (projectType.includes('water')) {
        markerIcon = PROJECT_ICONS.water;
    } else if (projectType.includes('port') || projectType.includes('seaport')) {
        markerIcon = PROJECT_ICONS.port;
    } else if (projectType.includes('airport')) {
        markerIcon = PROJECT_ICONS.airport;
    } else if (projectType.includes('hospital') || projectType.includes('health')) {
        markerIcon = PROJECT_ICONS.hospital;
    } else if (projectType.includes('park') || projectType.includes('plaza')) {
        markerIcon = PROJECT_ICONS.park;
    }

    // Keep marker size and anchor constant - no enlargement or position change
    const size = MARKER_CONFIG.SIZE;
    const html = createMarkerHTML(markerColor, markerIcon, isExpanded, project.id);
    
    marker.setIcon(L.divIcon({
        className: 'project-marker',
        html: html,
        iconSize: [size, isExpanded ? size + 50 : size + 10],
        iconAnchor: [size / 2, size + 10]
    }));
}

/**
 * Collapse the currently active marker
 */
export function collapseActiveMarker() {
    const activeMarkerId = appState.getActiveMarkerId();
    if (!activeMarkerId) return;
    
    const project = appState.findProjectById(activeMarkerId);
    if (!project) return;
    
    // Find the marker by its stored project ID
    const marker = appState.markers.find(m => m._projectId === activeMarkerId);
    if (marker) {
        updateMarkerState(marker, project, false);
    }
    
    appState.setActiveMarkerId(null);
}

/**
 * Add project markers to map
 * CRITICAL: Skip projects with lat/lng === 0 (invalid coordinates)
 * CRITICAL: Clear existing markers first
 */
export function addProjectMarkers() {
    // Clear existing markers
    appState.markers.forEach(marker => marker.remove());
    appState.markers = [];
    
    // Note: Don't clear directions here - let user explicitly clear them
    // clearDirections();

    let projects = appState.filteredProjects;

    // Apply distance filter
    if (appState.maxDistance < DEFAULTS.MAX_DISTANCE) {
        projects = projects.filter(p => p.distance !== undefined && p.distance <= appState.maxDistance);
    }

    // Apply status filter
    if (appState.currentFilter !== 'all') {
        projects = projects.filter(p => p.status === appState.currentFilter);
    }

    // Apply type filter
    if (appState.currentTypeFilter !== 'all') {
        projects = projects.filter(p => matchesProjectType(p.type, appState.currentTypeFilter));
    }

    projects.forEach((project, index) => {
        // Skip projects without valid coordinates
        if (!project.location || !project.location.lat || !project.location.lng ||
            project.location.lat === 0 || project.location.lng === 0) {
            return;
        }

        // Color based on status
        const markerColor = STATUS_COLORS[project.status] || STATUS_COLORS.default;

        // Icon based on project type
        const projectType = (project.type || '').toLowerCase();
        let markerIcon = PROJECT_ICONS.default;

        if (projectType.includes('road') || projectType.includes('highway')) {
            markerIcon = PROJECT_ICONS.road;
        } else if (projectType.includes('bridge')) {
            markerIcon = PROJECT_ICONS.bridge;
        } else if (projectType.includes('building') || projectType.includes('school')) {
            markerIcon = PROJECT_ICONS.building;
        } else if (projectType.includes('flood') || projectType.includes('drainage')) {
            markerIcon = PROJECT_ICONS.flood;
        } else if (projectType.includes('water')) {
            markerIcon = PROJECT_ICONS.water;
        } else if (projectType.includes('port') || projectType.includes('seaport')) {
            markerIcon = PROJECT_ICONS.port;
        } else if (projectType.includes('airport')) {
            markerIcon = PROJECT_ICONS.airport;
        } else if (projectType.includes('hospital') || projectType.includes('health')) {
            markerIcon = PROJECT_ICONS.hospital;
        } else if (projectType.includes('park') || projectType.includes('plaza')) {
            markerIcon = PROJECT_ICONS.park;
        }

        const marker = L.marker([project.location.lat, project.location.lng], {
            icon: L.divIcon({
                className: 'project-marker',
                html: createMarkerHTML(markerColor, markerIcon, false, project.id),
                iconSize: [MARKER_CONFIG.SIZE, MARKER_CONFIG.SIZE + 10],
                iconAnchor: [MARKER_CONFIG.SIZE / 2, MARKER_CONFIG.SIZE + 10]
            })
        }).addTo(appState.map);

        // Store project ID on marker for easy lookup
        marker._projectId = project.id;

        marker.on('click', (e) => {
            // Stop event propagation to prevent map click
            L.DomEvent.stopPropagation(e);
            
            const currentActiveId = appState.getActiveMarkerId();
            
            // If clicking the same marker, collapse it
            if (currentActiveId === project.id) {
                collapseActiveMarker();
                return;
            }
            
            // Collapse previously active marker if exists
            if (currentActiveId) {
                collapseActiveMarker();
            }
            
            // Expand this marker
            appState.setActiveMarkerId(project.id);
            updateMarkerState(marker, project, true);
            
            // Center map on marker
            const currentZoom = appState.map.getZoom();
            appState.map.setView([project.location.lat, project.location.lng], currentZoom, {
                animate: true
            });
        });

        appState.markers.push(marker);
    });
    
    // Add map click handler to collapse active marker when clicking elsewhere
    // Note: Don't clear directions on map click - let user explicitly clear them
    if (appState.map && !appState.map._markerCollapseHandler) {
        appState.map._markerCollapseHandler = () => {
            collapseActiveMarker();
            // clearDirections(); // Removed - directions should persist until user explicitly clears
        };
        appState.map.on('click', appState.map._markerCollapseHandler);
    }
}

// Made with Bob
