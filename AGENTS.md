# AGENTS.md

Guidance for AI agents and developers working with this repository. Documents non-obvious patterns, gotchas, and architectural decisions.

## Non-Obvious Project Patterns

### Module Loading Order Critical
- `public/src/js/config/provinces.js` MUST be imported before any code that calls `getProvinceFromCity()`
- This is enforced through ES6 module imports in `public/src/js/main.js`
- Breaking this causes runtime errors (not caught by linters)
- The function is exported to global scope for use across modules

### Window Object Exports Required
- Functions used in inline onclick handlers MUST be exported to window object
- Done in `public/src/js/events/globalHandlers.js` via `setupGlobalHandlers()`
- Affects: `showProjectDetails()`, `centerMapOnProject()`, `openReportModal()`, `handleMarkerDirection()`, `handleMarkerDetail()`
- Without this, onclick handlers fail silently (no console errors)
- CRITICAL: Marker action buttons use `window.handleMarkerDirection()` and `window.handleMarkerDetail()`

### Enhanced Marker Interaction Pattern
- Markers expand on click to show action buttons (Direction, Detail)
- Marker size remains CONSTANT - no enlargement when expanded
- Action buttons appear ABOVE the marker (not inside)
- Only ONE marker can be expanded at a time
- Clicking same marker collapses it
- Clicking elsewhere on map collapses active marker
- Active marker ID stored in `appState.activeMarkerId`
- Marker expansion uses `updateMarkerState()` in `public/src/js/ui/markerManager.js`
- Each marker stores `_projectId` property for lookup
- Square brutalist markers with pulse animation (not circular)
- Marker core uses thick borders and flat colors (no gradients)

### Routing Service Pattern
- Routes created from user location to project location
- Uses Leaflet Routing Machine with OSRM backend
- Route line is animated dashed pattern (teal color updated to match brutalist palette)
- Turn-by-turn panel is HIDDEN (only route line visible)
- Route persists until new route requested or explicitly cleared
- Routing control stored in `appState.routingControl`
- MUST check user location exists before creating route
- Route animation uses CSS class `route-line-animated`
- Implemented in `public/src/js/services/routingService.js`

### State Management Pattern
- `appState` is a singleton class instance (not plain object) - see `public/src/js/state/appState.js`
- NEVER modify `appState.projects` directly - always use `appState.filteredProjects` for display
- `maxDistance` defaults to 1km for better performance (changed from 999999)
- `maxDistance` of 999999 means "show all" (not null, undefined, or -1)
- This magic number is used throughout filtering logic
- Performance warning: Selecting "show all" (999999) with >1000 projects triggers confirmation dialog
- User can cancel to revert to previous distance or confirm to proceed
- CRITICAL: `appState.filteredProjects` MUST be updated when distance filter changes
- Initial load applies distance filter in `loadProjectsFromAPI()` after calculating distances
- Distance filter changes update `appState.filteredProjects` in event handler before rendering
- New state properties: `activeMarkerId`, `routingControl`

### API Data Structure Gotcha
- DPWH API returns triple-nested structure: `response.data.data.data` (not `data` or `data.data`)
- This is handled in `public/src/js/api/dpwhApi.js` line ~40
- Missing a `.data` level causes "cannot read property of undefined" errors

### Province Name Casing Critical
- Province names MUST be UPPERCASE in API queries (e.g., "METROPOLITAN MANILA")
- City names are lowercase with `+` separator
- City search: conditionally append "+city" only if "city" not already in name
- Prevents "quezon+city+city" bug in API queries
- Metro Manila cities map to "METROPOLITAN MANILA" (uppercase, not "Metro Manila")

### Geolocation API Quirk
- Nominatim API requires `accept-language=en` header to force English responses
- Without this, returns Tagalog which breaks province matching logic
- Implemented in `public/src/js/api/geocodingApi.js`
- Reverse geocoding priority: city || municipality || town || county (in that order)

### Map Marker Validation
- MUST skip projects with lat/lng === 0 (invalid coordinates from API)
- Check happens in `public/src/js/ui/markerManager.js` before creating markers
- Not checking causes map to center on null island (0,0)
- Clear markers before adding: `appState.markers.forEach(marker => marker.remove())`
- Markers store `_projectId` for easy lookup during interactions

### CSS Import Order Matters
- `public/src/css/main.css` imports must follow: variables → reset → typography → icons → layout → components → utilities → vendor
- Breaking this order causes CSS specificity issues
- Variables must be first for custom properties to work across all stylesheets

### Status Normalization Pattern
- API returns inconsistent status strings
- Normalized with substring matching in `public/src/js/services/projectService.js`:
  - "complet" → completed (catches "completed", "completion")
  - "terminat" → completed (terminated projects shown as completed)
  - "on-going"/"ongoing" → ongoing
  - "not started"/"procurement" → planned
- Uses substring matching instead of exact match to handle API inconsistencies

### Distance Filter Before Status
- Distance filter applies BEFORE status/type filters in rendering
- Order matters for performance (reduces items to filter)
- Implemented in `public/src/js/ui/renderManager.js`
- Changing order causes unnecessary processing of out-of-range projects

## Mobile-Specific Patterns

### Bottom Sheet Mobile UI
- Bottom sheet is mobile-only (≤767px viewport width)
- Collapsed height: 240px on mobile, 115px on desktop (updated from 120px)
- Expanded height: 60vh (60% of viewport height)
- Drag distance threshold: 5px (distinguishes clicks from drags, updated from 100px)
- Drag threshold prevents accidental expansion on click
- Z-index: 1000 (below filter panel overlay)
- Must call `window.bottomSheetInstance.expand()` or `.collapse()` from other modules
- Project list renders inside bottom sheet on mobile
- Bottom sheet instance stored globally: `window.bottomSheetInstance`
- Dragging uses CSS transform for performance (not top/height changes)
- Desktop centering: `translateX(-50%)` preserved during drag operations
- Smooth transitions: 300ms with brutalist easing
- Animation fill mode: `none` to allow drag functionality

### Mobile Filter Panel Overlay
- Filter panel shows as overlay on mobile (z-index: 1001, above bottom sheet)
- Slides in from right with 300ms animation
- Uses `visibility`, `opacity`, and `transform` for smooth transitions
- Backdrop fades in/out (rgba(0, 0, 0, 0.5))
- Adjusts height based on bottom sheet state
- Click backdrop to close
- Class `mobile-visible` controls visibility on mobile
- Class `sheet-expanded` adjusts height when bottom sheet is expanded
- Desktop uses normal side panel behavior (no overlay)

### Panel Manager Mobile Detection
- `panelManager` detects mobile with `window.innerWidth <= 767`
- On mobile: `openFilterPanel()` shows overlay, `openListPanel()` expands bottom sheet
- On desktop: Both functions show side panels
- Resize listener updates `isMobile` dynamically
- Must use `panelManager` functions, not direct DOM manipulation
- Mobile detection happens in constructor and on window resize
- Different behavior for same function based on viewport width

## UI/UX Patterns

### Brutalist Design System
- **Primary**: #DD614C (Coral Red) - Main brand color, buttons, interactive elements
- **Secondary**: #DAA144 (Golden Yellow) - Highlights, warnings, secondary actions
- **Accent**: #FA6781 (Pink) - Call-to-action elements, important notifications (kept for compatibility)
- **Background**: #FFFFFF (White) - Clean brutalist background
- **Border**: #111827 (Near Black) - Heavy borders for brutalist aesthetic
- **Text**: #111827 (Near Black) - High contrast text
- Defined in `public/src/css/base/variables.css` as CSS custom properties
- Use `var(--color-primary)` etc. in CSS, never hardcode colors
- Legacy variables (`--primary`, `--text`, etc.) map to new brutalist color system
- Status colors: success=#16A34A (green), warning=#D97706 (orange), danger=#DC2626 (red)

### Brutalist Typography
- **Display Font**: 'Darker Grotesque' (900 weight, uppercase, -0.02em letter-spacing)
- **Body Font**: 'Inter' (regular weights)
- **Mono Font**: 'JetBrains Mono' (for technical elements, uppercase, 0.05em letter-spacing)
- All headings use display font with uppercase transformation
- Defined in `public/src/css/base/variables.css` as `--font-display`, `--font-body`, `--font-mono`
- Google Fonts loaded in `public/index.html`

### Brutalist Visual Elements
- **Borders**: 2-4px thick borders (no rounded corners)
- **Shadows**: Hard offset shadows (3px-14px) using `box-shadow: Xpx Ypx 0px var(--color-border)`
- **Buttons**: Square with thick borders, offset shadow on hover
- **Markers**: Square cores with pulse animation (not circular)
- **Modals**: Square corners with thick borders and offset shadows
- **No gradients**: Flat colors only
- **No blur effects**: Sharp, defined edges

### Cover Page Pattern
- Full-screen landing page before interactive map
- Animated Philippines OSM map SVG background (floating animation)
- Session-based dismissal (uses `sessionStorage`)
- Dismissal triggers 1.2s slide-up animation with scale effect
- DPWH Report Now branding on cover page
- Entrance animations with staggered reveals (0.2s-0.6s delays)
- Cover page instance stored globally: `window.coverPageInstance`
- Implemented in `public/src/js/ui/coverPage.js`
- CSS in `public/src/css/components/cover-page.css`
- ESC key also dismisses cover page
- Dispatches `coverPageDismissed` event when dismissed
- Reset method available for testing: `window.coverPageInstance.reset()`

### Entrance Animation System
- Defined in `public/src/css/utilities/animations.css`
- Three main entrance animations:
  - `fadeInFromTop`: Elements slide down and fade in (headers, titles)
  - `fadeInFromRight`: Elements slide left and fade in (buttons, controls)
  - `slideUpFromBottom`: Elements slide up and fade in (bottom sheet, panels)
- Staggered animation delays for sequential reveals:
  - First element: 0.2s delay
  - Second element: 0.4s delay
  - Third element: 0.6s delay
- Animation duration: 0.6s with brutalist easing
- Used on cover page elements and initial map load
- Animations trigger once on page load, not on every state change

### Animation Standards - Brutalist
- Duration: 300ms for most transitions (200ms for fast interactions)
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (brutalist easing) for dramatic effect
- Standard easing: `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material Design) for compatibility
- Hover effects: `translate(-2px, -2px)` or `translate(-3px, -3px)` with increased shadow
- Active state: `translate(0, 0)` with reduced shadow
- Cover page: 1.2s slide-up with scale effect
- Bottom sheet drag: Uses transform for performance (GPU-accelerated)
- Filter panel: Slides with translateX, fades with opacity
- Route line: Animated dashed pattern (teal color updated to match brutalist palette)
- All animations defined in CSS, not JavaScript
- Use `transition` for state changes, `animation` for keyframes
- Avoid animating layout properties (width, height, top, left)
- Prefer transform and opacity for smooth 60fps animations

### ES6 Module Pattern
- All JavaScript uses ES6 modules (import/export)
- `public/src/js/main.js` is the entry point
- Modules are loaded in specific order (see main.js)
- Bottom sheet instance stored globally: `window.bottomSheetInstance`
- Global handlers exported to window for inline onclick (see globalHandlers.js)
- No script concatenation or bundling - native ES6 modules
- Must use Next.js dev server (not file://) for module loading
- Import paths must include .js extension

## Performance Patterns

### Marker Management
- Clear all markers before adding new ones to prevent memory leaks
- Use `appState.markers.forEach(marker => marker.remove())`
- Store marker references in `appState.markers` array
- Skip projects with invalid coordinates (lat/lng === 0)
- Limit initial distance filter to 1km for better performance
- Show performance warning when selecting "show all" with >1000 projects

### DOM Manipulation
- Batch DOM updates when possible
- Use DocumentFragment for multiple insertions
- Minimize reflows by reading layout properties before writing
- Use CSS classes for state changes instead of inline styles
- Debounce expensive operations (resize, scroll)

### Filter Performance
- Apply distance filter FIRST (most restrictive)
- Then apply status and type filters
- This reduces the number of items to process
- Distance calculation uses Haversine formula (optimized)
- Filter results stored in `appState.filteredProjects`

## Common Gotchas

### Mobile vs Desktop Behavior
- Same function names have different behavior based on viewport width
- Always check `panelManager.isMobile` before assuming behavior
- Bottom sheet only exists on mobile
- Filter panel is overlay on mobile, side panel on desktop
- Test both mobile and desktop viewports

### State Updates
- NEVER modify `appState.projects` directly
- Always update `appState.filteredProjects` for display
- State changes should trigger UI updates
- Use getter/setter methods when available
- Console log state changes for debugging

### CSS Specificity
- Import order in main.css matters
- Variables must be imported first
- Utilities should be imported last (highest specificity)
- Avoid !important unless absolutely necessary
- Use BEM naming for components to avoid conflicts

### Event Handlers
- Global handlers (onclick) must be exported to window
- Regular event handlers use addEventListener
- Remove event listeners when destroying components
- Use event delegation for dynamic content
- Prevent default on touch events when needed

## Debugging Tips

### Check State
```javascript
console.log('Current state:', appState);
console.log('Filtered projects:', appState.filteredProjects.length);
console.log('All projects:', appState.projects.length);
console.log('Markers:', appState.markers.length);
```

### Check Mobile Detection
```javascript
console.log('Is mobile:', panelManager.isMobile);
console.log('Viewport width:', window.innerWidth);
```

### Check Bottom Sheet
```javascript
console.log('Bottom sheet instance:', window.bottomSheetInstance);
console.log('Is expanded:', window.bottomSheetInstance?.isExpanded);
```

### Check Filters
```javascript
console.log('Max distance:', appState.maxDistance);
console.log('Selected status:', appState.selectedStatus);
console.log('Selected type:', appState.selectedType);
```

## Architecture Notes

### Layered Architecture
- Entry Point → Events → UI → Services → API/State/Utils → Config
- Higher layers depend on lower layers
- Lower layers never depend on higher layers
- Config and utils have no dependencies

### Singleton Pattern
- `appState` is the only singleton
- Provides centralized state management
- All state changes go through appState
- Never create multiple instances

### Module Responsibilities
- **API Layer**: External API calls only
- **Services Layer**: Business logic and data processing
- **UI Layer**: DOM manipulation and rendering
- **Events Layer**: User interaction handling
- **State Layer**: Application state management
- **Utils Layer**: Pure functions with no side effects
- **Config Layer**: Constants and configuration data

## Testing Considerations

### Manual Testing Checklist
- Test on mobile viewport (≤767px)
- Test on desktop viewport (>767px)
- Test bottom sheet drag on mobile
- Test filter panel overlay on mobile
- Test all filter combinations
- Test with 0, 1, 100, 1000+ projects
- Test location detection
- Test marker clicks
- Test report submission

### Browser Testing
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (iOS 12+)
- Chrome Mobile (Android)

### Performance Testing
- Test with 5000 projects
- Monitor console for errors
- Check network requests
- Verify smooth animations (60fps)
- Test on slower devices

