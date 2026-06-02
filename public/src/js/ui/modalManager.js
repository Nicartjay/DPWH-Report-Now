// Modal management - project details and report modals

import { PROJECT_ICONS } from '../config/constants.js';
import { appState } from '../state/appState.js';
import { formatCurrency } from '../utils/formatters.js';

/**
 * Show project details in modal
 * @param {string} projectId - Project ID to display
 */
export function showProjectDetails(projectId) {
    const project = appState.projects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');

    const projectType = (project.type || '').toLowerCase();
    const projectIcon = projectType.includes('road') || projectType.includes('highway')
        ? PROJECT_ICONS.road
        : projectType.includes('bridge')
            ? PROJECT_ICONS.bridge
            : projectType.includes('building') || projectType.includes('school')
                ? PROJECT_ICONS.building
                : projectType.includes('flood') || projectType.includes('drainage')
                    ? PROJECT_ICONS.flood
                    : projectType.includes('water')
                        ? PROJECT_ICONS.water
                        : projectType.includes('port') || projectType.includes('seaport')
                            ? PROJECT_ICONS.port
                            : projectType.includes('airport')
                                ? PROJECT_ICONS.airport
                                : projectType.includes('hospital') || projectType.includes('health')
                                    ? PROJECT_ICONS.hospital
                                    : projectType.includes('park') || projectType.includes('plaza')
                                        ? PROJECT_ICONS.park
                                        : PROJECT_ICONS.default;

    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-title">${projectIcon} ${project.title}</div>
            <span class="project-status ${project.status}">${project.status}</span>
        </div>

        <div class="modal-section">
            <div class="modal-section-title">Description</div>
            <div class="modal-section-content">${project.description}</div>
        </div>

        <div class="modal-section">
            <div class="modal-section-title">Project Details</div>
            <div class="modal-section-content">
                <div style="display: grid; gap: 0.75rem;">
                    <div class="modal-detail-item"><span class="material-icons modal-icon">category</span><strong>Type:&nbsp;</strong>${project.type}</div>
                    <div class="modal-detail-item"><span class="material-icons modal-icon">payments</span><strong>Budget:&nbsp;</strong>${formatCurrency(project.budget)}</div>
                    <div class="modal-detail-item"><span class="material-icons modal-icon">business</span><strong>Contractor:&nbsp;</strong>${project.contractor}</div>
                    ${project.municipality ? `<div class="modal-detail-item"><span class="material-icons modal-icon">location_city</span><strong>Municipality:&nbsp;</strong>${project.municipality}</div>` : ''}
                    ${project.province ? `<div class="modal-detail-item"><span class="material-icons modal-icon">map</span><strong>Province:&nbsp;</strong>${project.province}</div>` : ''}
                    ${project.startDate ? `<div class="modal-detail-item"><span class="material-icons modal-icon">event</span><strong>Start Date:&nbsp;</strong>${new Date(project.startDate).toLocaleDateString()}</div>` : ''}
                    ${project.targetCompletion ? `<div class="modal-detail-item"><span class="material-icons modal-icon">flag</span><strong>Target Completion:&nbsp;</strong>${new Date(project.targetCompletion).toLocaleDateString()}</div>` : ''}
                    ${project.completionDate ? `<div class="modal-detail-item"><span class="material-icons modal-icon">check_circle</span><strong>Completed:&nbsp;</strong>${new Date(project.completionDate).toLocaleDateString()}</div>` : ''}
                    ${project.progress !== undefined && project.progress > 0 ? `<div class="modal-detail-item"><span class="material-icons modal-icon">show_chart</span><strong>Progress:&nbsp;</strong>${project.progress}%</div>` : ''}
                    ${project.distance !== undefined ? `<div class="modal-detail-item"><span class="material-icons modal-icon">near_me</span><strong>Distance:&nbsp;</strong>${project.distance.toFixed(2)} km from your location</div>` : ''}
                </div>
            </div>
        </div>

        ${project.location && project.location.lat && project.location.lng && project.location.lat !== 0 && project.location.lng !== 0 ? `
        <div class="modal-section">
            <div class="modal-section-content">
                <button onclick="centerMapOnProject(${project.location.lat}, ${project.location.lng})" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; width: 100%;">
                    <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 4px;">my_location</span>Show on Map
                </button>
            </div>
        </div>
        ` : ''}

        <div class="modal-section">
            <button onclick="openReportModal('${project.contractId}')" style="padding: 0.75rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.375rem; cursor: pointer; width: 100%; font-weight: 600; font-size: 0.9375rem;">
                <span class="material-icons" style="font-size: 18px; vertical-align: middle; margin-right: 4px;">report_problem</span>Report an Issue
            </button>
        </div>
    `;

    modal.classList.add('active');
}

/**
 * Open report modal for a specific project
 * @param {string} contractId - Contract ID of the project
 */
export function openReportModal(contractId) {
    const modal = document.getElementById('reportModal');
    const form = document.getElementById('reportForm');
    const statusDiv = document.getElementById('reportStatus');

    // Reset form and status
    form.reset();
    statusDiv.className = 'report-status';
    statusDiv.textContent = '';

    // Set contract ID
    document.getElementById('reportContractId').value = contractId;

    // Show modal
    modal.classList.add('active');
}

/**
 * Close report modal
 */
export function closeReportModal() {
    const modal = document.getElementById('reportModal');
    modal.classList.remove('active');
}

