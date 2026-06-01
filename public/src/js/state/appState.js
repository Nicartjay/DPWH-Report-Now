// Application State Management
// CRITICAL: Never modify appState.projects directly - always use appState.filteredProjects for display
// CRITICAL: maxDistance of 999999 means "show all" (not infinity, null, or -1)

import { DEFAULTS } from '../config/constants.js';

class AppState {
    constructor() {
        this.userLocation = null;
        this.map = null;
        this.markers = [];
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = DEFAULTS.FILTER;
        this.currentTypeFilter = DEFAULTS.TYPE_FILTER;
        this.currentCity = null;
        this.currentProvince = null;
        this.isLoading = false;
        this.maxDistance = DEFAULTS.MAX_DISTANCE; // Default to show all distances
        this.activeMarkerId = null; // Track which marker is currently expanded
        this.routingControl = null; // Track active routing control for directions
    }

    // Getters
    getUserLocation() {
        return this.userLocation;
    }

    getMap() {
        return this.map;
    }

    getMarkers() {
        return this.markers;
    }

    getProjects() {
        return this.projects;
    }

    getFilteredProjects() {
        return this.filteredProjects;
    }

    getCurrentFilter() {
        return this.currentFilter;
    }

    getCurrentTypeFilter() {
        return this.currentTypeFilter;
    }

    getCurrentCity() {
        return this.currentCity;
    }

    getCurrentProvince() {
        return this.currentProvince;
    }

    getIsLoading() {
        return this.isLoading;
    }

    getMaxDistance() {
        return this.maxDistance;
    }

    getActiveMarkerId() {
        return this.activeMarkerId;
    }

    getRoutingControl() {
        return this.routingControl;
    }

    // Setters
    setUserLocation(location) {
        this.userLocation = location;
    }

    setMap(map) {
        this.map = map;
    }

    setMarkers(markers) {
        this.markers = markers;
    }

    addMarker(marker) {
        this.markers.push(marker);
    }

    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }

    setProjects(projects) {
        this.projects = projects;
    }

    setFilteredProjects(projects) {
        this.filteredProjects = projects;
    }

    setCurrentFilter(filter) {
        this.currentFilter = filter;
    }

    setCurrentTypeFilter(typeFilter) {
        this.currentTypeFilter = typeFilter;
    }

    setCurrentCity(city) {
        this.currentCity = city;
    }

    setCurrentProvince(province) {
        this.currentProvince = province;
    }

    setIsLoading(loading) {
        this.isLoading = loading;
    }

    setMaxDistance(distance) {
        this.maxDistance = distance;
    }

    setActiveMarkerId(markerId) {
        this.activeMarkerId = markerId;
    }

    setRoutingControl(control) {
        this.routingControl = control;
    }

    // Utility methods
    findProjectById(projectId) {
        return this.projects.find(p => p.id === projectId);
    }

    reset() {
        this.userLocation = null;
        this.map = null;
        this.clearMarkers();
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = DEFAULTS.FILTER;
        this.currentTypeFilter = DEFAULTS.TYPE_FILTER;
        this.currentCity = null;
        this.currentProvince = null;
        this.isLoading = false;
        this.maxDistance = DEFAULTS.MAX_DISTANCE;
        this.activeMarkerId = null;
        this.routingControl = null;
    }
}

// Create and export singleton instance
export const appState = new AppState();

// Made with Bob
