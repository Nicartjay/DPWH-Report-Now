/**
 * Performance Warning Modal Manager
 * Displays a custom modal for performance warnings
 */

/**
 * Show performance warning modal
 * @param {number} projectCount - Number of projects that will be shown
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export function showPerformanceWarning(projectCount) {
  return new Promise((resolve) => {
    const modal = document.getElementById('performanceWarningModal');
    const countElement = document.getElementById('warningProjectCount');
    const cancelBtn = document.getElementById('warningCancel');
    const confirmBtn = document.getElementById('warningConfirm');
    
    // Update project count
    countElement.textContent = projectCount.toLocaleString();
    
    // Show modal
    modal.style.display = 'flex';
    
    // Handle cancel
    const handleCancel = () => {
      modal.style.display = 'none';
      cleanup();
      resolve(false);
    };
    
    // Handle confirm
    const handleConfirm = () => {
      modal.style.display = 'none';
      cleanup();
      resolve(true);
    };
    
    // Handle click outside
    const handleOutsideClick = (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    };
    
    // Cleanup function
    const cleanup = () => {
      cancelBtn.removeEventListener('click', handleCancel);
      confirmBtn.removeEventListener('click', handleConfirm);
      modal.removeEventListener('click', handleOutsideClick);
    };
    
    // Add event listeners
    cancelBtn.addEventListener('click', handleCancel);
    confirmBtn.addEventListener('click', handleConfirm);
    modal.addEventListener('click', handleOutsideClick);
  });
}

// Made with Bob
