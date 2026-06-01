// UI rendering - projects list and summary cards
// CRITICAL: Never modify appState.projects directly - use appState.filteredProjects for display
// CRITICAL: Distance filter applies BEFORE status/type filters in rendering

import { DEFAULTS } from '../config/constants.js';
import { appState } from '../state/appState.js';
import { matchesProjectType } from '../services/filterService.js';
import { formatCurrency } from '../utils/formatters.js';

/**
 * Update summary cards with project statistics
 * CRITICAL: Apply same filters as renderProjects() to keep summary in sync
 */
export function updateSummary() {
    let projects = appState.filteredProjects;

    // Apply distance filter (same as renderProjects)
    if (appState.maxDistance < DEFAULTS.MAX_DISTANCE) {
        projects = projects.filter(p => p.distance !== undefined && p.distance <= appState.maxDistance);
    }

    // Apply status filter (same as renderProjects)
    if (appState.currentFilter !== 'all') {
        projects = projects.filter(p => p.status === appState.currentFilter);
    }

    // Apply type filter (same as renderProjects)
    if (appState.currentTypeFilter !== 'all') {
        projects = projects.filter(p => matchesProjectType(p.type, appState.currentTypeFilter));
    }

    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const ongoing = projects.filter(p => p.status === 'ongoing').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

    // Update summary cards with icons
    const totalEl = document.getElementById('totalProjects');
    const completedEl = document.getElementById('completedProjects');
    const ongoingEl = document.getElementById('ongoingProjects');
    const budgetEl = document.getElementById('totalBudget');

    if (totalEl) {
        totalEl.innerHTML = `<span class="material-icons">construction</span>${total}`;
    }
    if (completedEl) {
        completedEl.innerHTML = `<span class="material-icons">verified</span>${completed}`;
    }
    if (ongoingEl) {
        ongoingEl.innerHTML = `<span class="material-icons">pending_actions</span>${ongoing}`;
    }
    if (budgetEl) {
        budgetEl.innerHTML = `<span class="material-icons">payments</span>${formatCurrency(totalBudget)}`;
    }
}

/**
 * Render projects list
 * CRITICAL: Distance filter applies BEFORE status/type filters
 */
export function renderProjects() {
    // Render to both side panel and bottom sheet
    const sideContainer = document.getElementById('projectsList');
    const bottomContainer = document.getElementById('projectList');
    const countEl = document.getElementById('projectsCount');
    const bottomCountEl = document.querySelector('.project-count');

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

    const countText = `${projects.length}`;
    if (countEl) countEl.textContent = countText;
    if (bottomCountEl) bottomCountEl.textContent = countText;

    const emptyState = `
        <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="empty-state-text">No projects found in your area</div>
        </div>
    `;

    const projectCards = projects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            <div class="project-header">
                <h3 class="project-title">
                    <span class="material-icons">engineering</span>
                    ${project.title}
                </h3>
                <span class="project-status ${project.status}">
                    <span class="material-icons">${project.status === 'completed' ? 'verified' : project.status === 'ongoing' ? 'pending_actions' : 'bookmark'}</span>
                    ${project.status}
                </span>
            </div>
            <div class="project-info">
                <p class="project-info-item">
                    <span class="material-icons">payments</span>
                    <span class="project-budget">${formatCurrency(project.budget)}</span>
                </p>
                <p class="project-info-item">
                    <span class="material-icons">category</span>
                    <span>${project.type}</span>
                </p>
                ${project.distance !== undefined ? `
                    <p class="project-info-item">
                        <span class="material-icons">place</span>
                        <span class="project-distance">${project.distance.toFixed(1)} km away</span>
                    </p>
                ` : ''}
                ${project.progress !== undefined && project.progress > 0 ? `
                    <p class="project-info-item">
                        <span class="material-icons">trending_up</span>
                        <span>${project.progress}% complete</span>
                    </p>
                ` : ''}
            </div>
            <button class="card-report-btn" onclick="event.stopPropagation(); openReportModal('${project.contractId}')">
                <span class="material-icons">report</span> Report Issue
            </button>
        </div>
    `).join('');

    if (projects.length === 0) {
        if (sideContainer) sideContainer.innerHTML = emptyState;
        if (bottomContainer) bottomContainer.innerHTML = emptyState;
        return;
    }

    if (sideContainer) sideContainer.innerHTML = projectCards;
    if (bottomContainer) bottomContainer.innerHTML = projectCards;

    // Add click listeners to project cards in both containers
    [sideContainer, bottomContainer].forEach(container => {
        if (!container) return;
        container.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.dataset.projectId;
                showProjectDetails(projectId);
            });
        });
    });
}

// Made with Bob
