// Event handlers setup

import { appState } from '../state/appState.js';
import { renderProjects, updateSummary } from '../ui/renderManager.js';
import { addProjectMarkers } from '../ui/markerManager.js';
import { openFilterPanel, closeFilterPanel, openListPanel, closeListPanel, closeAllPanels } from '../ui/panelManager.js';
import { closeReportModal } from '../ui/modalManager.js';
import { submitReport } from '../api/reportApi.js';
import { SHOW_ALL_DISTANCE, PERFORMANCE_WARNING_THRESHOLD } from '../config/constants.js';
import { showPerformanceWarning } from '../ui/warningModal.js';
import { updateStatusMessage } from '../ui/statusManager.js';

/**
 * Setup all event listeners for the application
 */
export function setupEventListeners() {
    // Distance filter dropdown
    document.getElementById('distanceFilter').addEventListener('change', async (e) => {
        const distanceFilter = e.target;
        const newDistance = parseFloat(distanceFilter.value);
        
        // Check if user is selecting "Show All" with large dataset
        if (newDistance === SHOW_ALL_DISTANCE) {
            const projectCount = appState.projects.length;
            
            if (projectCount > PERFORMANCE_WARNING_THRESHOLD) {
                const confirmed = await showPerformanceWarning(projectCount);
                
                if (!confirmed) {
                    // Revert to previous value
                    distanceFilter.value = appState.maxDistance;
                    return; // Don't update
                }
            }
        }
        
        appState.maxDistance = newDistance;
        
        // Update filteredProjects based on new distance
        if (newDistance < SHOW_ALL_DISTANCE) {
            appState.filteredProjects = appState.projects.filter(p =>
                p.distance !== undefined && p.distance <= newDistance
            );
        } else {
            appState.filteredProjects = appState.projects;
        }
        
        updateStatusMessage();
        updateSummary();
        renderProjects();
        addProjectMarkers();
    });

    // Type filter dropdown
    document.getElementById('typeFilter').addEventListener('change', (e) => {
        appState.currentTypeFilter = e.target.value;
        updateStatusMessage();
        renderProjects();
        addProjectMarkers();
        updateSummary();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.currentFilter = btn.dataset.filter;
            updateStatusMessage();
            renderProjects();
            addProjectMarkers();
        });
    });

    // Recenter button
    document.getElementById('recenterBtn').addEventListener('click', () => {
        if (appState.userLocation) {
            appState.map.setView([appState.userLocation.lat, appState.userLocation.lng], 16);
            updateStatusMessage();
        }
    });

    // Filter panel toggle
    document.getElementById('filterBtn').addEventListener('click', () => {
        openFilterPanel();
    });

    document.getElementById('filterClose').addEventListener('click', () => {
        closeFilterPanel();
    });

    // List panel toggle
    document.getElementById('listBtn').addEventListener('click', () => {
        openListPanel();
    });

    document.getElementById('listClose').addEventListener('click', () => {
        closeListPanel();
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('projectModal').classList.remove('active');
    });

    // Close modal on background click
    document.getElementById('projectModal').addEventListener('click', (e) => {
        if (e.target.id === 'projectModal') {
            document.getElementById('projectModal').classList.remove('active');
        }
    });

    // Close panels when clicking on map
    document.getElementById('map').addEventListener('click', () => {
        closeAllPanels();
    });
}

/**
 * Setup report modal event listeners
 */
export function setupReportModalListeners() {
    // Close report modal button
    const closeReportBtn = document.getElementById('reportModalClose');
    if (closeReportBtn) {
        closeReportBtn.addEventListener('click', closeReportModal);
    }

    // Report form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', submitReport);
    }

    // File input change listener for preview
    const fileInput = document.getElementById('reportFiles');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            const preview = document.getElementById('filePreview');
            if (files.length > 0) {
                preview.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} selected`;
            } else {
                preview.textContent = '';
            }
        });
    }

    // Close modal when clicking outside
    const reportModal = document.getElementById('reportModal');
    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target === reportModal) {
                closeReportModal();
            }
        });
    }
}
