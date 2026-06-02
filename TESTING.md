# DPWH Report Now — Testing Guide

Comprehensive testing documentation for the modular frontend architecture.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Server Setup](#development-server-setup)
- [Manual Testing Checklist](#manual-testing-checklist)
- [Feature Testing Procedures](#feature-testing-procedures)
- [Console Error Checking](#console-error-checking)
- [Network Request Verification](#network-request-verification)
- [Performance Testing](#performance-testing)
- [Browser Compatibility](#browser-compatibility)
- [Mobile Responsiveness](#mobile-responsiveness)
- [Brutalist Design Visual Regression](#brutalist-design-visual-regression)
- [Accessibility Testing](#accessibility-testing)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js 18.18+** (for Next.js development server)
- **npm** (comes with Node.js)
- **Modern browser** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Internet connection** (for API calls and map tiles)

### Optional Tools

- Browser DevTools (F12)
- Network throttling
- Screen reader (for accessibility testing)

---

## Development Server Setup

### Starting the Server

```bash
# Navigate to project root
cd /path/to/DPWH-Report-Now

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Verify the server is running — look for:

```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

Open http://localhost:3000 in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Manual Testing Checklist

### Initial Load

- [ ] Cover page displays on first visit
- [ ] Philippines OSM map SVG animates (floating effect)
- [ ] Entrance animations play with staggered delays (0.2s–0.6s)
- [ ] Cover page dismisses with slide-up animation
- [ ] ESC key dismisses cover page
- [ ] Map container displays correctly after dismissal
- [ ] Leaflet map tiles load
- [ ] No console errors on initial load
- [ ] Location permission prompt appears
- [ ] Loading indicator shows during data fetch

### Brutalist Design Elements

- [ ] Thick borders (2–4px) on buttons and panels
- [ ] Hard offset shadows on interactive elements
- [ ] Square corners (no rounded borders anywhere)
- [ ] Coral Red (#DD614C) for primary actions
- [ ] Golden Yellow (#DAA144) for highlights
- [ ] Near Black (#111827) for borders and text
- [ ] Darker Grotesque font for headings (uppercase)
- [ ] Inter font for body text
- [ ] JetBrains Mono for technical elements
- [ ] No gradients (flat colors only)
- [ ] No blur effects (sharp edges)

### Core Features

- [ ] User location detection works
- [ ] Blue pulsing marker at user location
- [ ] Projects load from DPWH API
- [ ] Project markers appear on map
- [ ] Status banner shows current city/province
- [ ] Bottom sheet displays summary statistics

### UI Components

- [ ] Floating header displays correctly
- [ ] Control buttons (recenter, filter, list) work
- [ ] Filter panel opens/closes smoothly
- [ ] Project list panel opens/closes smoothly
- [ ] Modals open/close correctly
- [ ] All buttons are clickable and responsive

### Filtering

- [ ] Distance filter updates markers
- [ ] Status filter (All/Ongoing/Completed/Planned) works
- [ ] Type filter works
- [ ] Multiple filters work together
- [ ] Filter counts update correctly

### Map Interactions

- [ ] Zoom in/out works
- [ ] Pan/drag works
- [ ] Marker click expands with action buttons
- [ ] Direction button shows animated route
- [ ] Detail button opens project modal
- [ ] Marker collapses on second click
- [ ] Route line animates smoothly
- [ ] Recenter button returns to user location

---

## Feature Testing Procedures

### 1. Cover Page

**Steps:**
1. Clear session storage (DevTools → Application → Session Storage → Clear)
2. Refresh the page
3. Observe cover page display and entrance animations
4. Press ESC or click the enter button
5. Verify main map interface loads
6. Refresh again (cover page should NOT reappear)

**Expected:**
- Full-screen cover page with animated Philippines SVG
- Staggered entrance animations (0.2s, 0.4s, 0.6s delays)
- 1.2s slide-up dismissal animation with scale effect
- Session-based: only shown once per browser session

**Verification:**
```javascript
console.log('Cover page instance:', window.coverPageInstance);
console.log('Dismissed:', sessionStorage.getItem('coverPageDismissed'));
window.coverPageInstance.reset(); // Reset for re-testing
```

---

### 2. Location Detection

**Steps:**
1. Open application
2. Allow location access when prompted
3. Wait for detection to complete

**Expected:**
- Blue pulsing marker at user location
- Map centers on user (zoom level 16)
- Status banner shows detected city and province
- Province name in UPPERCASE

**Pass Criteria:**
- Location detected within 10 seconds
- City name in English (not Tagalog)
- Marker positioned correctly

---

### 3. API Data Loading

**Steps:**
1. Wait for location detection
2. Observe network requests in DevTools
3. Verify projects appear on map

**Expected:**
- API request to `https://api.transparency.dpwh.gov.ph/projects`
- Query includes city and UPPERCASE province
- Response contains `data.data.data` array (triple-nested)
- Projects with valid coordinates displayed as markers

**Verification:**
```javascript
console.log('Total projects:', appState.projects.length);
console.log('Filtered projects:', appState.filteredProjects.length);
```

---

### 4. Distance Filter

**Steps:**
1. Open filter panel
2. Select different distance options (500m, 1km, 5km, 10km, 50km, All)
3. Observe marker updates

**Expected:**
- Markers update immediately per distance selection
- Project count updates in summary
- "All" option uses `maxDistance = 999999`
- Performance warning triggers with >1000 projects on "All"

| Distance | Scope |
|----------|-------|
| 500m | Immediate vicinity |
| 1km | Local area (default) |
| 5km | City-wide |
| 10km | Extended area |
| 50km | Regional |
| All | Entire province |

---

### 5. Status Filter

**Steps:**
1. Click each status button (All, Ongoing, Completed, Planned)
2. Verify markers update

**Expected Status Normalization:**
- "complet*" / "terminat*" → completed
- "on-going" / "ongoing" → ongoing
- "not started" / "procurement" → planned

---

### 6. Type Filter

**Steps:**
1. Open filter panel
2. Select each project type from dropdown
3. Verify correct projects shown

**Available Types:**
- Roads & Highways
- Bridges
- Buildings & Schools
- Flood Control
- Water Projects
- Ports & Seaports
- Airports
- Hospitals & Health
- Parks & Plazas
- Other Infrastructure

---

### 7. Marker Interactions

**Steps:**
1. Click a project marker
2. Observe expansion with action buttons
3. Click Direction button (compass icon)
4. Click Detail button (info icon)
5. Click same marker again to collapse
6. Click elsewhere on map

**Expected:**
- Square brutalist markers with thick borders (not circular)
- Marker size remains CONSTANT when expanded
- Action buttons appear ABOVE the marker
- Pulse animation on active marker
- Only ONE marker expanded at a time
- Clicking map background collapses active marker

| Action | Result |
|--------|--------|
| Click marker | Expands with action buttons |
| Click Direction | Shows animated route from user location |
| Click Detail | Opens project detail modal |
| Click same marker | Collapses |
| Click different marker | Collapses previous, expands new |
| Click map | Collapses active marker |

---

### 8. Routing and Directions

**Steps:**
1. Ensure location permission is granted
2. Click a marker, then click Direction button
3. Observe route calculation and line appearance
4. Request direction to a different project

**Expected:**
- Animated dashed route line (teal color)
- Route follows actual roads (OSRM routing)
- Map fits to show entire route
- Route persists until new route requested
- No turn-by-turn panel visible (hidden)
- New direction replaces previous route

**Verification:**
```javascript
console.log('Routing control:', appState.getRoutingControl());
console.log('User location:', appState.userLocation);
```

---

### 9. Project Details Modal

**Steps:**
1. Open project details (via Detail button or list)
2. Verify all information displays
3. Test action buttons
4. Close modal

**Expected Fields:**
- Title and description
- Status with color badge
- Budget (formatted: K/M/B suffixes)
- Distance from user
- Project type with icon
- Contractor name
- Start/completion dates
- Progress percentage
- Location coordinates

---

### 10. Report System

**Steps:**
1. Click "Report Issue" button
2. Fill out form fields
3. Upload photo (optional)
4. Submit report

**Expected:**
- Report modal opens with form
- Form validation enforces required fields
- File upload accepts images
- Success/error message after submission

---

### 11. Responsive Design

**Test Viewports:**

| Device | Width | Height |
|--------|-------|--------|
| iPhone SE | 375px | 667px |
| iPhone 12 | 390px | 844px |
| iPad | 768px | 1024px |
| Desktop | 1920px | 1080px |

**Mobile-specific checks:**
- Bottom sheet visible and draggable
- Drag threshold: 5px (distinguishes clicks from drags)
- Filter panel appears as overlay
- Touch interactions work (pinch zoom, pan)
- No horizontal scrolling

**Desktop-specific checks:**
- Side panels instead of bottom sheet
- Filter panel slides in (not overlay)

---

## Console Error Checking

### Opening DevTools

- **Chrome/Edge:** F12 or Ctrl+Shift+I
- **Firefox:** F12 or Ctrl+Shift+K
- **Safari:** Cmd+Option+I

### Expected Console Messages

```
Initializing DPWH Transparency App...
Map initialized successfully
Location detected: [City], [PROVINCE]
Fetching projects for [City], [PROVINCE]
Loaded [N] projects
```

### No Errors Should Appear

- Module import errors
- Undefined variable errors
- CORS errors
- Map initialization errors

---

## Network Request Verification

Open DevTools → Network tab → Filter by Fetch/XHR.

### Expected Requests

**1. Nominatim Geocoding**
```
GET https://nominatim.openstreetmap.org/reverse
Headers: accept-language: en
Status: 200
```

**2. DPWH Projects API**
```
GET https://api.transparency.dpwh.gov.ph/projects?limit=5000&search=[city]&province=[PROVINCE]
Status: 200
Response: { data: { data: { data: [...] } } }
```

**3. Map Tiles**
```
GET https://tile.openstreetmap.org/{z}/{x}/{y}.png
Status: 200 (multiple requests)
```

**Verify:**
- [ ] All requests return 200
- [ ] Province name is UPPERCASE in query
- [ ] City search includes "+city" conditionally
- [ ] Response times < 5 seconds

---

## Performance Testing

### Target Metrics

| Metric | Target |
|--------|--------|
| Initial page load | < 2s |
| Map initialization | < 1s |
| API data fetch | < 5s |
| Time to interactive | < 8s |
| Marker rendering (5000) | < 3s |
| Filter application | < 500ms |
| Animation frame rate | 60 FPS |
| Memory (initial) | < 50 MB |
| Memory (5000 projects) | < 150 MB |

### Tools

- Chrome DevTools Performance tab
- Lighthouse audit (target: >90 in Performance, Accessibility, Best Practices)

---

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | Supported |
| Firefox | 88+ | Supported |
| Safari | 14+ | Supported |
| Edge | 90+ | Supported |
| Chrome Mobile | Latest | Supported |
| Safari iOS | 12+ | Supported |

**Required features:** ES6 modules, Geolocation API, Fetch API, CSS custom properties.

---

## Mobile Responsiveness

### Touch Interactions

- [ ] Tap markers to expand
- [ ] Pinch to zoom map
- [ ] Swipe to pan map
- [ ] Tap buttons (44x44px minimum)
- [ ] Scroll project list
- [ ] Drag bottom sheet

### Bottom Sheet

- [ ] Click (no drag) toggles expand/collapse
- [ ] Drag up >5px expands
- [ ] Drag down >5px collapses
- [ ] Drag <5px treated as click
- [ ] Collapsed: 240px (mobile), 115px (desktop)
- [ ] Expanded: 60vh
- [ ] Desktop centering preserved during drag
- [ ] 300ms transitions with brutalist easing

### Orientation

- [ ] Portrait mode works
- [ ] Landscape mode works
- [ ] Layout adapts on rotation
- [ ] Map resizes correctly

---

## Brutalist Design Visual Regression

### Color Palette

```javascript
// Run in console to verify CSS variables
const root = getComputedStyle(document.documentElement);
console.log('Primary:', root.getPropertyValue('--color-primary'));   // #DD614C
console.log('Border:', root.getPropertyValue('--color-border'));     // #111827
console.log('Display:', root.getPropertyValue('--font-display'));    // 'Darker Grotesque'
console.log('Easing:', root.getPropertyValue('--ease-brutalist'));   // cubic-bezier(0.16, 1, 0.3, 1)
```

### Component Checks

**Markers:**
- [ ] Square core (not circular)
- [ ] Thick borders visible
- [ ] Pulse animation on active
- [ ] Action buttons above marker
- [ ] No size change on expansion

**Buttons:**
- [ ] Square shape, thick borders
- [ ] Hard offset shadow on hover
- [ ] `translate(-2px, -2px)` hover effect
- [ ] `translate(0, 0)` active state

**Modals:**
- [ ] Square corners, 4px borders
- [ ] Hard offset shadows
- [ ] No blur on backdrop

**Typography:**
- [ ] Darker Grotesque headings (uppercase, 900 weight)
- [ ] Inter body text
- [ ] JetBrains Mono for code/technical elements

---

## Accessibility Testing

### Keyboard Navigation

- [ ] All interactive elements focusable via Tab
- [ ] Focus indicator visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/panels
- [ ] Logical tab order

### Screen Reader

- [ ] Page title announced
- [ ] Buttons have labels
- [ ] Form fields have labels
- [ ] Status messages announced

### Color Contrast

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

---

## Common Issues and Troubleshooting

### Location Not Detected

**Symptoms:** No blue marker, "Detecting location..." persists

**Solutions:**
1. Check browser location permissions
2. Ensure HTTPS (or localhost)
3. Check console for geolocation errors

```javascript
// Manual override
appState.setUserLocation({ lat: 14.5995, lng: 121.0644 });
```

---

### No Projects Loading

**Symptoms:** Map loads but no markers

**Solutions:**
1. Check network tab for API errors
2. Verify province name is UPPERCASE
3. Check for Cloudflare blocking

```javascript
console.log('Projects:', appState.projects.length);
console.log('City:', appState.currentCity);
console.log('Province:', appState.currentProvince);
```

---

### Markers Not Appearing

**Symptoms:** Projects loaded but no markers visible

**Solutions:**
1. Check for invalid coordinates (lat/lng === 0)
2. Verify distance filter isn't too restrictive
3. Clear and re-render markers

```javascript
console.log('Markers:', appState.markers.length);
console.log('Filtered:', appState.filteredProjects.length);
```

---

### Module Import Errors

**Symptoms:** "Failed to load module script", blank page

**Solutions:**
1. Use HTTP server (not `file://`)
2. Verify `type="module"` in script tags
3. Check import paths include `.js` extension

---

### Performance Lag

**Symptoms:** Slow rendering, laggy animations

**Solutions:**
1. Use distance filter to limit markers (default: 1km)
2. Avoid "show all" with >1000 projects
3. Close unused panels
4. Clear browser cache

---

---

## Testing Best Practices

1. **Clean environment** — Use incognito/private mode for fresh sessions
2. **Document issues** — Screenshot errors, copy console messages, note reproduction steps
3. **Test edge cases** — No location permission, slow network, no projects found, API timeout
4. **Test both viewports** — Mobile (≤767px) and desktop (>767px) for every feature
5. **Regular schedule** — Before each release, after major changes

