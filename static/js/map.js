// Rapid Reef Assessment - Interactive Gulf of California Map using Leaflet.js

// Extend ReefAssessmentApp with map-related methods
ReefAssessmentApp.prototype.initializeMap = function() {
    // Gulf of California assessment locations with coordinates
    this.gulfLocations = [
        {
            name: "La Paz",
            lat: 24.1426, 
            lng: -110.3128,
            description: "Capital city of Baja California Sur with diverse marine ecosystems",
            svgX: 200,  // SVG coordinates for simple map
            svgY: 280
        },
        {
            name: "Bahía de los Ángeles",
            lat: 28.9514, 
            lng: -113.5622,
            description: "UNESCO World Heritage site known for whale sharks and sea lions",
            svgX: 80,
            svgY: 90
        },
        {
            name: "Cabo Pulmo",
            lat: 23.4333, 
            lng: -109.4167,
            description: "Marine protected area with recovering coral reef ecosystems",
            svgX: 215,
            svgY: 320
        },
        {
            name: "Loreto",
            lat: 26.0115, 
            lng: -111.3486,
            description: "Site of Loreto Bay National Marine Park with high biodiversity",
            svgX: 150,
            svgY: 190
        }
    ];
    
    // Initialize Leaflet map
    this.initLeafletMap();
    
    // Add markers to the map
    this.addLeafletMarkers();
};

ReefAssessmentApp.prototype.initLeafletMap = function() {
    // Initialize the map centered on Gulf of California
    this.map = L.map('interactive-map').setView([26.0, -111.0], 6);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(this.map);
    
    // Store markers for later reference
    this.markers = {};
    
    // Add Gulf of California water body styles
    L.polygon([
        [31.6, -114.8], // North
        [31.0, -114.0], // Northeast
        [20.5, -105.6], // Southeast
        [22.8, -109.8]  // Southwest
    ], {
        color: '#2196f3',
        fillColor: '#e3f2fd',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(this.map).bindPopup('Gulf of California');
};

ReefAssessmentApp.prototype.addLeafletMarkers = function() {
    // Add markers for each location
    this.gulfLocations.forEach(location => {
        // Create marker with custom popup
        const marker = L.marker([location.lat, location.lng])
            .addTo(this.map)
            .bindPopup(`<b>${location.name}</b><br>${location.description}`);
            
        // Store marker by location name
        this.markers[location.name] = marker;
        
        // Add click handler
        marker.on('click', () => {
            // Update location info
            this.updateLocationInfo(location);
            
            // Simulate assessment for this location
            this.simulateLocationAssessment(location.name);
        });
    });
};

ReefAssessmentApp.prototype.createMapMarkers = function() {
    const markersGroup = document.getElementById('location-markers');
    
    // Clear existing markers
    markersGroup.innerHTML = '';
    
    // Add location markers to the map
    this.gulfLocations.forEach(location => {
        // Create marker circle
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('cx', location.svgX);
        marker.setAttribute('cy', location.svgY);
        marker.setAttribute('r', 5);
        marker.setAttribute('fill', '#ff5722');
        marker.setAttribute('class', 'location-pin');
        marker.setAttribute('data-location', location.name);
        
        // Create location label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', location.svgX + 8);
        label.setAttribute('y', location.svgY + 4);
        label.setAttribute('font-size', '10px');
        label.setAttribute('fill', '#263238');
        label.setAttribute('class', 'location-label');
        label.textContent = location.name;
        
        // Add to markers group
        markersGroup.appendChild(marker);
        markersGroup.appendChild(label);
    });
};

ReefAssessmentApp.prototype.addMapMarkerListeners = function() {
    const markers = document.querySelectorAll('.location-pin');
    const currentLocationDiv = document.getElementById('current-location');
    
    markers.forEach(marker => {
        marker.addEventListener('click', (e) => {
            const locationName = marker.getAttribute('data-location');
            const locationData = this.gulfLocations.find(loc => loc.name === locationName);
            
            if (locationData) {
                // Update location info display
                currentLocationDiv.innerHTML = `
                    <span class="badge bg-info">Selected Location</span>
                    <div class="fw-bold">${locationData.name}</div>
                    <div class="small text-muted">${locationData.description}</div>
                    <small>Coordinates: ${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}</small>
                `;
                
                // If the user clicks a location that's different from the current assessment,
                // offer to simulate assessment for that location
                if (this.currentResults && this.currentResults.location !== locationName) {
                    this.addChatMessage(`Would you like to run a simulated assessment for ${locationName}?`, 'bot');
                    
                    // Add buttons for location-specific assessment
                    const messagesDiv = document.getElementById('chat-messages');
                    const buttonDiv = document.createElement('div');
                    buttonDiv.className = 'text-center mt-2 mb-3';
                    buttonDiv.innerHTML = `
                        <button class="btn btn-sm btn-outline-primary mx-1 location-assessment-btn" 
                                data-location="${locationName}">
                            <i class="fas fa-play-circle"></i> Run Assessment
                        </button>
                        <button class="btn btn-sm btn-outline-secondary mx-1 cancel-btn">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    `;
                    messagesDiv.appendChild(buttonDiv);
                    
                    // Add event listeners to buttons
                    buttonDiv.querySelector('.location-assessment-btn').addEventListener('click', () => {
                        this.simulateLocationAssessment(locationName);
                        buttonDiv.remove();
                    });
                    
                    buttonDiv.querySelector('.cancel-btn').addEventListener('click', () => {
                        buttonDiv.remove();
                        this.addChatMessage("Let me know if you have any other questions about the assessment.", 'bot');
                    });
                }
            }
        });
        
        // Add hover tooltip
        marker.addEventListener('mouseenter', (e) => {
            const locationName = marker.getAttribute('data-location');
            const locationData = this.gulfLocations.find(loc => loc.name === locationName);
            
            if (locationData) {
                const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tooltip.setAttribute('x', locationData.svgX);
                tooltip.setAttribute('y', locationData.svgY - 10);
                tooltip.setAttribute('font-size', '12px');
                tooltip.setAttribute('fill', '#263238');
                tooltip.setAttribute('text-anchor', 'middle');
                tooltip.setAttribute('class', 'location-tooltip');
                tooltip.textContent = locationName;
                
                document.getElementById('location-markers').appendChild(tooltip);
            }
        });
        
        marker.addEventListener('mouseleave', () => {
            const tooltips = document.querySelectorAll('.location-tooltip');
            tooltips.forEach(tooltip => tooltip.remove());
        });
    });
};

ReefAssessmentApp.prototype.simulateLocationAssessment = function(locationName) {
    // Find the location data
    const locationData = this.gulfLocations.find(loc => loc.name === locationName);
    
    if (!locationData) return;
    
    // Show analysis console
    document.getElementById('analysis-card').style.display = 'block';
    this.clearConsole();
    this.addConsoleMessage(`Initializing assessment for ${locationName}...`, 'system');
    
    // Simulate analysis steps
    const analysisSteps = [
        "Loading regional parameters for " + locationName,
        "Processing video frames for marine life detection",
        "Analyzing fish density patterns",
        "Calculating invertebrate cover statistics",
        "Running coral health assessment protocols",
        "Checking for location-specific algal bloom patterns",
        "Compiling ecosystem health indices"
    ];
    
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
        if (stepIndex < analysisSteps.length) {
            this.addConsoleMessage(analysisSteps[stepIndex], 'info');
            stepIndex++;
        } else {
            clearInterval(stepInterval);
            this.completeLocationAssessment(locationName, locationData);
        }
    }, 1000);
};

ReefAssessmentApp.prototype.completeLocationAssessment = function(locationName, locationData) {
    this.addConsoleMessage(`Assessment for ${locationName} complete!`, 'success');
    
    // Generate simulated results for this location
    const results = {
        location: locationName,
        coordinates: {
            lat: locationData.lat,
            lng: locationData.lng
        },
        fish_density: Math.floor(Math.random() * 250 + 50), // 50-300
        invertebrate_cover: Math.floor(Math.random() * 60 + 10), // 10-70%
        coral_bleaching: 20, // fixed at 20%
        invasive_species: 0, // fixed at 0
        algal_bloom_score: locationName === 'Bahía de los Ángeles' ? 0.75 : 0.15, // Higher for Bahía
        algal_bloom_level: locationName === 'Bahía de los Ángeles' ? 'High' : 'Low',
        date: new Date().toISOString().split('T')[0],
        diver: 'Simulated Divemaster',
        depth_range: `${Math.floor(Math.random() * 8 + 5)}-${Math.floor(Math.random() * 6 + 13)} m`,
        video_filename: `simulated_${locationName.toLowerCase().replace(/\s+/g, '_')}.mp4`,
        session_id: this.generateRandomSessionId()
    };
    
    // Calculate FHI
    results.fish_health_index = (results.fish_density / 300) * 0.6 + (results.invertebrate_cover / 100) * 0.4;
    
    // Update current results and regenerate report
    this.currentResults = results;
    this.currentSessionId = results.session_id;
    
    // Generate report
    this.generateTechnicalReport(results);
    this.updateLocationMap(results);
    
    // Update chatbot
    this.addChatMessage(`I've generated a simulated assessment for ${locationName}. You can now ask questions about this location's marine ecosystem health.`, 'bot');
};

ReefAssessmentApp.prototype.generateRandomSessionId = function() {
    return Math.random().toString(36).substring(2, 10);
};

// Initialize map when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for app to be initialized before setting up map
    setTimeout(() => {
        if (window.reefApp) {
            window.reefApp.initializeMap();
            
            // Log that map is initialized
            console.log('Interactive Leaflet map initialized');
        }
    }, 500);
});
