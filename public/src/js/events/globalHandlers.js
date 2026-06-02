// Global handlers for inline onclick events
// CRITICAL: All functions for inline onclick handlers MUST be on window object

import { showProjectDetails } from '../ui/modalManager.js';
import { centerMapOnProject } from '../ui/mapManager.js';
import { openReportModal } from '../ui/modalManager.js';
import { collapseActiveMarker } from '../ui/markerManager.js';
import { showDirections } from '../services/routingService.js';
import { appState } from '../state/appState.js';

/**
 * Handle marker direction button click
 * @param {string} projectId - Project ID
 */
function handleMarkerDirection(projectId) {
    console.log('Direction requested for project:', projectId);
    
    // Find the project
    const project = appState.findProjectById(projectId);
    
    if (!project) {
        console.error('Project not found:', projectId);
        return;
    }
    
    // Check if project has valid location
    if (!project.location || !project.location.lat || !project.location.lng ||
        project.location.lat === 0 || project.location.lng === 0) {
        alert('Unable to show directions: Project location is not available.');
        return;
    }
    
    // Show directions from user location to project location
    showDirections(project.location.lat, project.location.lng);
    
    // Collapse the active marker after showing directions
    collapseActiveMarker();
}

/**
 * Handle marker detail button click
 * @param {string} projectId - Project ID
 */
function handleMarkerDetail(projectId) {
    // Collapse the active marker first
    collapseActiveMarker();
    // Show project details modal
    showProjectDetails(projectId);
}

/**
 * Make functions globally accessible for inline onclick handlers
 * CRITICAL: These MUST be on window object for HTML onclick attributes to work
 */
export function setupGlobalHandlers() {
    window.showProjectDetails = showProjectDetails;
    window.centerMapOnProject = centerMapOnProject;
    window.openReportModal = openReportModal;
    window.handleMarkerDirection = handleMarkerDirection;
    window.handleMarkerDetail = handleMarkerDetail;
}

