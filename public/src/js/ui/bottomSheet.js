/**
 * Bottom Sheet Manager
 * Handles draggable bottom sheet functionality
 */

class BottomSheet {
  constructor() {
    this.sheet = document.getElementById('summarySheet');
    this.handle = this.sheet.querySelector('.bottom-sheet-handle');
    this.isDragging = false;
    this.startY = 0;
    this.startX = 0;
    this.currentY = 0;
    this.isExpanded = false;
    this.dragDistance = 0;
    
    this.threshold = 100; // Drag threshold to trigger expand/collapse
    
    // Check if desktop mode (viewport width > 767px)
    this.isDesktop = window.innerWidth > 767;
    
    // Set collapsed height based on viewport
    this.collapsedHeight = this.isDesktop ? 150 : 240;
    
    this.init();
  }
  
  init() {
    // Set initial state
    this.sheet.classList.add('collapsed');
    
    // Mouse events
    this.handle.addEventListener('mousedown', this.onDragStart.bind(this));
    document.addEventListener('mousemove', this.onDragMove.bind(this));
    document.addEventListener('mouseup', this.onDragEnd.bind(this));
    
    // Touch events
    this.handle.addEventListener('touchstart', this.onDragStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onDragMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onDragEnd.bind(this));
    
    // Update desktop mode on resize
    window.addEventListener('resize', () => {
      this.isDesktop = window.innerWidth > 767;
      this.collapsedHeight = this.isDesktop ? 150 : 240;
    });
  }
  
  onDragStart(e) {
    this.isDragging = false; // Don't set to true yet - wait for actual movement
    this.startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    this.dragDistance = 0;
  }
  
  onDragMove(e) {
    this.currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    
    // Calculate total drag distance (Pythagorean theorem for accurate distance)
    const deltaX = currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    this.dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Only start dragging if movement exceeds 5px threshold
    if (this.dragDistance < 5) return;
    
    // Now we're actually dragging
    if (!this.isDragging) {
      this.isDragging = true;
      this.sheet.classList.add('dragging');
    }
    
    e.preventDefault();
    
    // Calculate new position
    const sheetHeight = this.sheet.offsetHeight;
    const maxTranslate = sheetHeight - this.collapsedHeight;
    
    let newTranslate;
    if (this.isExpanded) {
      newTranslate = Math.max(0, Math.min(maxTranslate, deltaY));
    } else {
      newTranslate = Math.max(0, Math.min(maxTranslate, maxTranslate + deltaY));
    }
    
    // On desktop, preserve translateX(-50%) for centering
    if (this.isDesktop) {
      this.sheet.style.transform = `translateX(-50%) translateY(${newTranslate}px)`;
    } else {
      this.sheet.style.transform = `translateY(${newTranslate}px)`;
    }
  }
  
  onDragEnd() {
    // If drag distance is less than 5px, treat as a click and toggle
    if (this.dragDistance < 5) {
      this.toggle();
      this.isDragging = false;
      this.dragDistance = 0;
      return;
    }
    
    // Only process as drag if we actually started dragging
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.sheet.classList.remove('dragging');
    
    const deltaY = this.currentY - this.startY;
    
    // Determine if should expand or collapse based on drag distance
    if (this.isExpanded) {
      if (deltaY > this.threshold) {
        this.collapse();
      } else {
        this.expand();
      }
    } else {
      if (deltaY < -this.threshold) {
        this.expand();
      } else {
        this.collapse();
      }
    }
    
    // Reset transform and drag distance
    this.sheet.style.transform = '';
    this.dragDistance = 0;
  }
  
  expand() {
    this.isExpanded = true;
    // Remove dragging class to re-enable transitions
    this.sheet.classList.remove('dragging');
    // Clear any inline transform to allow CSS transitions
    this.sheet.style.transform = '';
    this.sheet.classList.remove('collapsed');
    this.sheet.classList.add('expanded');
    this.updateProjectCount();
    
    // Notify filter panel if visible on mobile
    const filterPanel = document.getElementById('filterPanel');
    if (filterPanel?.classList.contains('mobile-visible')) {
      filterPanel.classList.add('sheet-expanded');
    }
  }
  
  collapse() {
    this.isExpanded = false;
    // Remove dragging class to re-enable transitions
    this.sheet.classList.remove('dragging');
    // Clear any inline transform to allow CSS transitions
    this.sheet.style.transform = '';
    this.sheet.classList.remove('expanded');
    this.sheet.classList.add('collapsed');
    
    // Notify filter panel if visible on mobile
    const filterPanel = document.getElementById('filterPanel');
    if (filterPanel?.classList.contains('mobile-visible')) {
      filterPanel.classList.remove('sheet-expanded');
    }
  }
  
  toggle() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  
  updateProjectCount() {
    const projectList = document.getElementById('projectList');
    const count = projectList.children.length;
    const countElement = document.querySelector('.project-count');
    if (countElement) {
      countElement.textContent = count;
    }
  }
}

// Export for use in main.js
export default BottomSheet;

