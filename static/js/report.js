// Rapid Reef Assessment - Report Generation & Visualization

// Extend ReefAssessmentApp with report-related methods
ReefAssessmentApp.prototype.generateTechnicalReport = function(results) {
    console.log('Generating technical report with results:', results);
    
    const reportCard = document.getElementById('report-card');
    const reportContent = document.getElementById('report-content');
    
    // Generate report HTML
    const reportHTML = this.createReportHTML(results);
    reportContent.innerHTML = reportHTML;
    
    // Show report card
    reportCard.style.display = 'block';
    
    // Generate plots
    setTimeout(() => {
        this.generateReportPlots(results);
    }, 500);
    
    reportCard.scrollIntoView({ behavior: 'smooth' });
};

ReefAssessmentApp.prototype.createReportHTML = function(results) {
    const fhiStatus = results.fish_health_index > 0.7 ? 'good' : 
                     results.fish_health_index > 0.5 ? 'moderate' : 'low';
    
    const algalStatus = results.algal_bloom_level === 'High' ? 'high' : 'low';
    
    return `
        <div class="report-section">
            <div class="report-header">
                <h3>Rapid Ecological Assessment – Gulf of California Site</h3>
                <p class="text-muted">Automated marine ecosystem analysis from diver video footage</p>
            </div>
            
            <div class="metadata-grid">
                <div class="metadata-item">
                    <div class="metadata-label">Location</div>
                    <div class="metadata-value">${results.location}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Assessment Date</div>
                    <div class="metadata-value">${results.date}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Diver</div>
                    <div class="metadata-value">${results.diver}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Depth Range</div>
                    <div class="metadata-value">${results.depth_range}</div>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <h4>Assessment Results</h4>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                        <th>Status</th>
                        <th>Reference Range</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Fish Health Index (FHI)</strong></td>
                        <td>${results.fish_health_index.toFixed(2)}</td>
                        <td><span class="status-${fhiStatus}">${fhiStatus.toUpperCase()}</span></td>
                        <td>0.60-1.00 (Healthy)</td>
                    </tr>
                    <tr>
                        <td>Fish Density</td>
                        <td>${results.fish_density} fish/ha</td>
                        <td><span class="status-${results.fish_density > 180 ? 'good' : 'moderate'}">${results.fish_density > 180 ? 'GOOD' : 'MODERATE'}</span></td>
                        <td>180-300 fish/ha</td>
                    </tr>
                    <tr>
                        <td>Invertebrate Cover</td>
                        <td>${results.invertebrate_cover}%</td>
                        <td><span class="status-${results.invertebrate_cover > 40 ? 'good' : 'moderate'}">${results.invertebrate_cover > 40 ? 'GOOD' : 'MODERATE'}</span></td>
                        <td>40-70% (Optimal)</td>
                    </tr>
                    <tr>
                        <td>Coral Bleaching</td>
                        <td>${results.coral_bleaching}%</td>
                        <td><span class="status-moderate">MODERATE</span></td>
                        <td>&lt;15% (Low Risk)</td>
                    </tr>
                    <tr>
                        <td>Invasive Species</td>
                        <td>${results.invasive_species} detected</td>
                        <td><span class="status-good">GOOD</span></td>
                        <td>0 (Optimal)</td>
                    </tr>
                    <tr>
                        <td>Algal Bloom Risk</td>
                        <td>${results.algal_bloom_score.toFixed(2)}</td>
                        <td><span class="status-${algalStatus}">${results.algal_bloom_level}</span></td>
                        <td>&lt;0.30 (Low Risk)</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <h5>Fish Health Indicators</h5>
                    <div id="fish-health-chart" style="height: 300px;"></div>
                </div>
                <div class="col-md-6">
                    <h5>Reef Threat Radar</h5>
                    <div id="radar-chart" style="height: 300px;"></div>
                </div>
            </div>
            
            <div class="mt-4">
                <h5>Ecological Assessment Conclusion</h5>
                <div class="p-3 border rounded bg-light">
                    ${this.generateReportConclusion(results)}
                </div>
            </div>
        </div>
    `;
};

ReefAssessmentApp.prototype.generateReportConclusion = function(results) {
    const fhi = results.fish_health_index;
    const algalBloom = results.algal_bloom_level;
    
    let conclusionText = '';
    
    if (fhi > 0.7) {
        conclusionText = `The reef site shows robust fish density and relatively good ecosystem health indicators. `;
    } else if (fhi > 0.5) {
        conclusionText = `The reef site shows moderate fish density and ecosystem health. `;
    } else {
        conclusionText = `The reef site shows concerning levels of fish density and potential ecosystem stress. `;
    }
    
    if (algalBloom === 'High') {
        conclusionText += `<strong>The high algal bloom levels detected are concerning</strong> and may indicate nutrient loading or other environmental stressors. `;
        conclusionText += `Recommend immediate follow-up monitoring and potential intervention strategies to mitigate algal impacts on the reef ecosystem.`;
    } else {
        conclusionText += `The coral bleaching level of 20% suggests moderate thermal stress that should be monitored, but is not yet at crisis levels. `;
        conclusionText += `Continued monitoring recommended, especially during summer temperature peaks.`;
    }
    
    return conclusionText;
};

ReefAssessmentApp.prototype.generateReportPlots = function(results) {
    // Fish Health Bar Chart
    const fishData = [
        {
            x: ['Fish Density', 'Invertebrate Cover', 'Fish Health Index'],
            y: [
                results.fish_density / 3, // Scale to make comparable
                results.invertebrate_cover, 
                results.fish_health_index * 100
            ],
            type: 'bar',
            marker: {
                color: ['rgba(25, 118, 210, 0.7)', 'rgba(56, 142, 60, 0.7)', 'rgba(255, 87, 34, 0.7)']
            }
        }
    ];
    
    const fishLayout = {
        margin: { t: 30, b: 40, l: 60, r: 30 },
        yaxis: { title: 'Score', range: [0, 100] },
        plot_bgcolor: '#f8f9fa',
        paper_bgcolor: '#f8f9fa',
        font: { family: 'Segoe UI' }
    };
    
    Plotly.newPlot('fish-health-chart', fishData, fishLayout);
    
    // Radar Chart
    const radarData = [{
        type: 'scatterpolar',
        r: [
            100 - (results.coral_bleaching * 4), // Invert bleaching (higher is better)
            results.fish_density / 3,
            results.invertebrate_cover,
            results.algal_bloom_level === 'Low' ? 80 : 20, // Invert algal bloom (higher is better)
            results.fish_health_index * 100
        ],
        theta: ['Coral Health', 'Fish Density', 'Invertebrates', 'Algal Health', 'Fish Health Index'],
        fill: 'toself',
        fillcolor: 'rgba(25, 118, 210, 0.2)',
        line: {
            color: 'rgba(25, 118, 210, 0.8)'
        },
        name: 'Current Site'
    }, {
        type: 'scatterpolar',
        r: [80, 90, 65, 90, 85],
        theta: ['Coral Health', 'Fish Density', 'Invertebrates', 'Algal Health', 'Fish Health Index'],
        fill: 'toself',
        fillcolor: 'rgba(56, 142, 60, 0.1)',
        line: {
            color: 'rgba(56, 142, 60, 0.5)',
            dash: 'dot'
        },
        name: 'Cabo Pulmo Baseline'
    }];
    
    const radarLayout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 100]
            }
        },
        margin: { t: 30, b: 30, l: 30, r: 30 },
        legend: {
            orientation: 'h',
            y: -0.2
        },
        plot_bgcolor: '#f8f9fa',
        paper_bgcolor: '#f8f9fa',
        font: { family: 'Segoe UI' }
    };
    
    Plotly.newPlot('radar-chart', radarData, radarLayout);
};

ReefAssessmentApp.prototype.downloadReportPDF = function() {
    // In a real app, this would generate a PDF on the server
    // For this demo, we'll just show a message
    alert('PDF download functionality would be implemented here.');
    console.log('PDF download requested');
    
    // In a real implementation, we would:
    // 1. Call a server endpoint to generate the PDF
    // 2. Download the PDF when ready
};

// Location map functionality
ReefAssessmentApp.prototype.updateLocationMap = function(results) {
    // Clear existing highlights
    document.querySelectorAll('.location-pin').forEach(pin => {
        pin.classList.remove('active');
    });
    
    // Find and highlight the pin for this location
    const locationPin = document.querySelector(`.location-pin[data-location="${results.location}"]`);
    if (locationPin) {
        locationPin.classList.add('active');
    }
    
    // Update location text
    const locationText = document.getElementById('current-location');
    locationText.innerHTML = `
        <span class="badge bg-primary">Current Assessment Location</span>
        <div class="fw-bold">${results.location}</div>
        <small>Coordinates: ${results.coordinates.lat.toFixed(4)}, ${results.coordinates.lng.toFixed(4)}</small>
    `;
};
