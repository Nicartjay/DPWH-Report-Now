// Routing service for map directions
// Handles creating and managing route directions between user location and project locations

import { appState } from '../state/appState.js';

function detachRoutingControl(routingControl) {
    if (!routingControl) {
        return;
    }

    try {
        // Remove event listeners
        routingControl.off();
    } catch (error) {
        console.warn('Unable to detach routing control events:', error);
    }

    try {
        // Clear waypoints to remove the route line from map
        const plan = routingControl.getPlan?.();
        if (plan) {
            plan.setWaypoints([]);
        }
    } catch (error) {
        console.warn('Unable to clear routing waypoints:', error);
    }

    try {
        // Remove the routing control from the map
        const map = appState.getMap?.() || appState.map;
        if (map && typeof routingControl.remove === 'function') {
            routingControl.remove();
        }
    } catch (error) {
        console.warn('Unable to remove routing control cleanly:', error);
    }
}

/**
 * Show directions from user location to project location
 * @param {number} projectLat - Project latitude
 * @param {number} projectLng - Project longitude
 */
export function showDirections(projectLat, projectLng) {
    // Check if user location is available
    if (!appState.userLocation) {
        console.error('User location not available');
        alert('Unable to get directions: Your location is not available. Please enable location services.');
        return;
    }

    // Check if map is initialized
    if (!appState.map) {
        console.error('Map not initialized');
        return;
    }

    // Remove existing routing control if present
    clearDirections();

    try {
        console.log('Creating route from', appState.userLocation, 'to', { lat: projectLat, lng: projectLng });
        
        // Create routing control with Leaflet Routing Machine
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(appState.userLocation.lat, appState.userLocation.lng),
                L.latLng(projectLat, projectLng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            lineOptions: {
                styles: [
                    {
                        color: '#59B292',
                        opacity: 0.8,
                        weight: 6,
                        dashArray: '20, 20',
                        className: 'route-line-animated'
                    }
                ]
            },
            createMarker: function() {
                // Don't create default markers (we already have our custom markers)
                return null;
            },
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1'
            })
        });

        // Store routing control in app state BEFORE adding to map
        appState.setRoutingControl(routingControl);

        // Add to map
        routingControl.addTo(appState.map);

        // Hide the routing control container (turn-by-turn directions panel)
        // We only want to show the route line on the map
        setTimeout(() => {
            const container = routingControl.getContainer();
            if (container) {
                container.style.display = 'none';
            }
        }, 100);

        // Handle routing success - ensure route line is visible
        routingControl.on('routesfound', function(e) {
            if (appState.getRoutingControl() !== routingControl) {
                return;
            }
            console.log('Route found and displayed:', e.routes[0]);
        });

        // Handle routing errors only for the currently active control
        routingControl.on('routingerror', function(e) {
            if (appState.getRoutingControl() !== routingControl) {
                return;
            }

            console.error('Routing error:', e);
            alert('Unable to calculate route. Please try again.');
            clearDirections(routingControl);
        });

        console.log('Routing control created and added to map');
    } catch (error) {
        console.error('Error creating routing control:', error);
        alert('Unable to show directions. Please try again.');
    }
}

/**
 * Clear/remove current directions from map
 */
export function clearDirections(controlToClear = null) {
    const activeRoutingControl = appState.getRoutingControl();
    const routingControl = controlToClear || activeRoutingControl;

    if (!routingControl) {
        return;
    }

    if (controlToClear && activeRoutingControl && activeRoutingControl !== controlToClear) {
        return;
    }

    if (activeRoutingControl === routingControl) {
        appState.setRoutingControl(null);
    }

    detachRoutingControl(routingControl);
    console.log('Directions cleared');
}

