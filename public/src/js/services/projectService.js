// Project data processing and status management
// CRITICAL: Status normalization uses substring matching for API inconsistencies

import { appState } from '../state/appState.js';

/**
 * Map project status from API to our status types
 * CRITICAL: API returns inconsistent status strings - normalize with substring matching:
 * - "complet" → completed (catches "completed", "completion")
 * - "terminat" → completed (terminated projects shown as completed)
 * - "on-going"/"ongoing" → ongoing
 * - "not started"/"procurement" → planned
 * 
 * @param {string} apiStatus - Status string from API
 * @returns {string} Normalized status: 'completed', 'ongoing', or 'planned'
 */
export function mapProjectStatus(apiStatus) {
    if (!apiStatus) return 'ongoing';

    const status = apiStatus.toLowerCase();

    if (status.includes('complet')) {
        return 'completed';
    } else if (status.includes('on-going') || status.includes('ongoing')) {
        return 'ongoing';
    } else if (status.includes('not started') || status.includes('procurement')) {
        return 'planned';
    } else if (status.includes('terminat')) {
        return 'completed'; // Show terminated as completed but with different indicator
    }

    return 'ongoing'; // Default
}

/**
 * Process project data from API response
 * Maps API fields to our app structure
 * 
 * @param {Object} apiProject - Raw project data from API
 * @returns {Object} Processed project object
 */
export function processProjectData(apiProject) {
    // Map API fields to our app structure based on actual API response
    return {
        id: apiProject.contractId,
        contractId: apiProject.contractId, // Store contractId explicitly for reporting
        title: apiProject.description || 'Untitled Project',
        description: apiProject.description || 'No description available',
        status: mapProjectStatus(apiProject.status),
        budget: parseFloat(apiProject.budget || 0),
        location: {
            lat: parseFloat(apiProject.latitude || 0),
            lng: parseFloat(apiProject.longitude || 0)
        },
        contractor: apiProject.contractor || 'TBD',
        startDate: apiProject.startDate || null,
        targetCompletion: apiProject.completionDate || null,
        completionDate: apiProject.completionDate || null,
        progress: parseFloat(apiProject.progress || 0),
        type: apiProject.category || apiProject.componentCategories || 'Infrastructure',
        municipality: appState.currentCity,
        province: apiProject.location?.province || appState.currentProvince,
        region: apiProject.location?.region || 'National Capital Region',
        infraYear: apiProject.infraYear,
        programName: apiProject.programName,
        sourceOfFunds: apiProject.sourceOfFunds,
        amountPaid: apiProject.amountPaid || 0,
        hasSatelliteImage: apiProject.hasSatelliteImage || false
    };
}

