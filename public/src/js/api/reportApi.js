// Report API - Submit citizen reports about projects

import { API_CONFIG } from '../config/constants.js';

/**
 * Submit a report about a project
 * @param {Event} event - Form submit event
 */
export async function submitReport(event) {
    event.preventDefault();

    const form = event.target;
    const statusDiv = document.getElementById('reportStatus');
    const submitBtn = form.querySelector('.submit-btn');

    // Show loading state
    statusDiv.className = 'report-status loading';
    statusDiv.textContent = 'Submitting report...';
    submitBtn.disabled = true;

    try {
        // Create FormData from form
        const formData = new FormData(form);

        // Submit to API
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Show success message
        statusDiv.className = 'report-status success';
        statusDiv.textContent = 'Report submitted successfully! Thank you for your feedback.';

        // Reset form after 2 seconds and close modal
        setTimeout(() => {
            closeReportModal();
        }, 2000);

    } catch (error) {
        console.error('Error submitting report:', error);

        // Show error message
        statusDiv.className = 'report-status error';
        statusDiv.textContent = 'Failed to submit report. Please try again later.';

        submitBtn.disabled = false;
    }
}

/**
 * Close the report modal
 * Note: This is a helper function used by submitReport
 */
function closeReportModal() {
    const modal = document.getElementById('reportModal');
    modal.classList.remove('active');
}

// Made with Bob
