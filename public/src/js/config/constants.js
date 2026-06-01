// DPWH Transparency App - Configuration Constants
// All constant values used throughout the application

// API Configuration
export const API_CONFIG = {
    BASE_URL: 'https://api.transparency.dpwh.gov.ph',
    ENDPOINTS: {
        PROJECTS: '/projects',
        REPORTS: '/reports'
    },
    LIMITS: {
        PROJECTS: 5000
    }
};

// Geocoding Configuration
export const GEOCODING_CONFIG = {
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org/reverse',
    USER_AGENT: 'DPWH-Transparency-App',
    ACCEPT_LANGUAGE: 'en'
};

// Map Configuration
export const MAP_CONFIG = {
    DEFAULT_CENTER: [14.5995, 121.0644], // Metro Manila
    DEFAULT_ZOOM: 16,
    MAX_ZOOM: 19,
    TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ATTRIBUTION: '© OpenStreetMap contributors',
    SCALE_IMPERIAL: false
};

// Default Values
export const DEFAULTS = {
    CITY: 'Manila',
    PROVINCE: 'METROPOLITAN MANILA',
    MAX_DISTANCE: 1, // Default to 1km for better performance
    FILTER: 'all',
    TYPE_FILTER: 'all'
};

// Distance Filter Constants
export const SHOW_ALL_DISTANCE = 999999; // Magic number for "show all" - triggers warning if >1000 projects
export const PERFORMANCE_WARNING_THRESHOLD = 1000; // Show warning when displaying more than this many projects

// Geolocation Configuration
export const GEOLOCATION_CONFIG = {
    ENABLE_HIGH_ACCURACY: true,
    TIMEOUT: 10000,
    MAXIMUM_AGE: 0
};

// Status Colors for Map Markers
export const STATUS_COLORS = {
    ongoing: '#FFC94D',      // Yellow - Ongoing projects
    completed: '#59B292',    // Teal - Completed projects
    planned: '#b06000',
    default: '#5f6368'
};

// Project Type Icons
export const PROJECT_ICONS = {
    road: '🚧',
    highway: '🚧',
    bridge: '🌉',
    building: '🏢',
    school: '🏫',
    flood: '🌊',
    drainage: '🌊',
    water: '💧',
    port: '🚢',
    seaport: '🚢',
    airport: '🛫',
    hospital: '🏥',
    health: '🏥',
    park: '🌲',
    plaza: '🌲',
    default: '🏗️'
};

// Marker Configuration
export const MARKER_CONFIG = {
    SIZE: 36,
    BORDER_WIDTH: 3,
    BORDER_COLOR: 'white',
    ICON_SIZE: 18,
    POPUP_OFFSET: [0, -10],
    POPUP_MAX_WIDTH: 320
};

// User Location Marker Configuration
export const USER_MARKER_CONFIG = {
    SIZE: 40,
    ANCHOR: [20, 20]
};

// Earth's radius in kilometers (for distance calculations)
export const EARTH_RADIUS_KM = 6371;

// Made with Bob
