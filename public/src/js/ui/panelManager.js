/**
 * Panel Manager
 * Handles side panel visibility and interactions
 * Detects mobile and uses bottom sheet instead of side panel
 */

class PanelManager {
  constructor() {
    this.filterPanel = document.getElementById('filterPanel');
    this.listPanel = document.getElementById('listPanel');
    this.bottomSheet = document.getElementById('summarySheet');
    this.isMobile = window.innerWidth <= 767;
    
    // Listen for resize events to update mobile detection
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 767;
    });
    
    // Setup close button handlers for mobile
    this.setupMobileHandlers();
  }
  
  /**
   * Setup mobile-specific event handlers
   */
  setupMobileHandlers() {
    // Close filter panel when clicking backdrop on mobile
    if (this.filterPanel) {
      this.filterPanel.addEventListener('click', (e) => {
        if (e.target === this.filterPanel && this.isMobile) {
          this.closeFilterPanel();
        }
      });
    }
  }
  
  /**
   * Open filter panel (desktop) or show filter panel overlay (mobile)
   */
  openFilterPanel() {
    if (this.isMobile) {
      // On mobile, show filter panel as overlay above bottom sheet
      this.filterPanel?.classList.add('mobile-visible');
      
      // Check if bottom sheet is expanded and add class
      if (this.bottomSheet?.classList.contains('expanded')) {
        this.filterPanel?.classList.add('sheet-expanded');
      }
    } else {
      // On desktop, normal behavior
      this.filterPanel.classList.add('active');
      this.listPanel.classList.remove('active');
    }
  }
  
  /**
   * Close filter panel (desktop and mobile)
   */
  closeFilterPanel() {
    if (this.isMobile) {
      // On mobile, hide filter panel overlay
      this.filterPanel?.classList.remove('mobile-visible');
      this.filterPanel?.classList.remove('sheet-expanded');
    } else {
      // On desktop, normal behavior
      this.filterPanel.classList.remove('active');
    }
  }
  
  /**
   * Open list panel (desktop) or expand bottom sheet (mobile)
   */
  openListPanel() {
    if (this.isMobile) {
      this.expandBottomSheet();
    } else {
      this.listPanel.classList.add('active');
      this.filterPanel.classList.remove('active');
    }
  }
  
  /**
   * Close list panel (desktop) or collapse bottom sheet (mobile)
   */
  closeListPanel() {
    if (this.isMobile) {
      this.collapseBottomSheet();
    } else {
      this.listPanel.classList.remove('active');
    }
  }
  
  /**
   * Close all panels (desktop and mobile)
   */
  closeAllPanels() {
    if (this.isMobile) {
      // On mobile, hide filter panel and collapse bottom sheet
      this.filterPanel?.classList.remove('mobile-visible');
      this.filterPanel?.classList.remove('sheet-expanded');
      this.collapseBottomSheet();
    } else {
      // On desktop, normal behavior
      this.filterPanel.classList.remove('active');
      this.listPanel.classList.remove('active');
    }
  }
  
  /**
   * Expand bottom sheet (mobile only)
   */
  expandBottomSheet() {
    if (this.bottomSheet && window.bottomSheetInstance) {
      window.bottomSheetInstance.expand();
    }
  }
  
  /**
   * Collapse bottom sheet (mobile only)
   */
  collapseBottomSheet() {
    if (this.bottomSheet && window.bottomSheetInstance) {
      window.bottomSheetInstance.collapse();
    }
  }
}

// Create singleton instance
const panelManager = new PanelManager();

// Export individual functions for backward compatibility
export function openFilterPanel() {
  panelManager.openFilterPanel();
}

export function closeFilterPanel() {
  panelManager.closeFilterPanel();
}

export function openListPanel() {
  panelManager.openListPanel();
}

export function closeListPanel() {
  panelManager.closeListPanel();
}

export function closeAllPanels() {
  panelManager.closeAllPanels();
}

// Export the instance as default
export default panelManager;

// Made with Bob
