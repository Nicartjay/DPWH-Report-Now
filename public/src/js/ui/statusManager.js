/**
 * Status Message Manager
 * Updates the status banner with current filter information
 */

import { appState } from '../state/appState.js';

/**
 * Update the status message based on current filters and location
 */
export function updateStatusMessage() {
  const statusBanner = document.querySelector('.status-banner');
  if (!statusBanner) return;
  
  const { currentCity, filteredProjects, maxDistance, currentFilter, currentTypeFilter } = appState;
  
  // Build status message parts
  const parts = [];
  
  // Location
  if (currentCity) {
    parts.push(`<span class="material-icons md-18 text-primary" style="vertical-align: text-bottom;">location_on</span> ${currentCity}`);
  }
  
  // Project count
  const count = filteredProjects.length;
  parts.push(`${count} project${count !== 1 ? 's' : ''}`);
  
  // Distance filter
  if (maxDistance < 999999) {
    parts.push(`within ${maxDistance}km`);
  } else {
    parts.push(`(all distances)`);
  }
  
  // Status filter
  if (currentFilter !== 'all') {
    const statusLabels = {
      'ongoing': 'ongoing',
      'completed': 'completed',
      'planned': 'planned'
    };
    parts.push(`• ${statusLabels[currentFilter]}`);
  }
  
  // Type filter
  if (currentTypeFilter !== 'all') {
    const typeLabels = {
      'road': 'Road',
      'bridge': 'Bridge',
      'building': 'Building',
      'flood': 'Flood Control',
      'water': 'Water',
      'school': 'School',
      'hospital': 'Hospital',
      'port': 'Port',
      'airport': 'Airport',
      'other': 'Other'
    };
    parts.push(`• ${typeLabels[currentTypeFilter]}`);
  }
  
  // Update the banner (use innerHTML for Material Icons)
  statusBanner.innerHTML = parts.join(' ');
}

