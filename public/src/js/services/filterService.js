// Project filtering logic

/**
 * Check if project type matches filter
 * Uses substring matching to categorize projects
 * 
 * @param {string} projectType - Project type from API
 * @param {string} filterType - Filter type to match against
 * @returns {boolean} True if project matches filter
 */
export function matchesProjectType(projectType, filterType) {
    if (!projectType) return filterType === 'other';

    const type = projectType.toLowerCase();

    switch (filterType) {
        case 'road':
            return type.includes('road') || type.includes('highway');
        case 'bridge':
            return type.includes('bridge');
        case 'building':
            return type.includes('building') || type.includes('school');
        case 'flood':
            return type.includes('flood') || type.includes('drainage');
        case 'water':
            return type.includes('water');
        case 'port':
            return type.includes('port') || type.includes('seaport');
        case 'airport':
            return type.includes('airport');
        case 'hospital':
            return type.includes('hospital') || type.includes('health');
        case 'park':
            return type.includes('park') || type.includes('plaza');
        case 'other':
            return !type.includes('road') && !type.includes('highway') &&
                !type.includes('bridge') && !type.includes('building') &&
                !type.includes('school') && !type.includes('flood') &&
                !type.includes('drainage') && !type.includes('water') &&
                !type.includes('port') && !type.includes('seaport') &&
                !type.includes('airport') && !type.includes('hospital') &&
                !type.includes('health') && !type.includes('park') &&
                !type.includes('plaza');
        default:
            return true;
    }
}

