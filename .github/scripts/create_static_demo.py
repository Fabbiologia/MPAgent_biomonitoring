#!/usr/bin/env python3
"""
Script to create a static demo version of the Gulf of California Marine Assessment web application.
This transforms the Flask templates into static HTML files for GitHub Pages deployment.
"""
import os
import json
import shutil
from datetime import datetime
from bs4 import BeautifulSoup

# Configure paths
DEMO_DIR = "demo"
TEMPLATES_DIR = "templates"
STATIC_DIR = "static"

# Ensure demo directory exists
os.makedirs(DEMO_DIR, exist_ok=True)

def create_static_index():
    """Convert Flask template to static HTML"""
    print("Creating static HTML files...")
    
    # Read the template
    with open(os.path.join(TEMPLATES_DIR, "index.html"), "r") as f:
        content = f.read()
    
    # Replace Flask template variables and expressions
    content = content.replace("{{ url_for('static', filename='", "")
    content = content.replace("') }}", "")
    
    # Parse with BeautifulSoup to make further modifications
    soup = BeautifulSoup(content, 'html.parser')
    
    # Add static demo notice
    demo_notice = soup.new_tag("div", **{"class": "alert alert-warning", "role": "alert", "style": "margin-top: 10px"})
    demo_notice.string = "⚠️ This is a static demo of the Gulf of California Marine Assessment tool. For full functionality, please deploy the application using the instructions in the project repository."
    soup.body.insert(1, demo_notice)
    
    # Update Socket.IO connection to use dummy implementation
    socket_script = soup.find("script", src="https://cdn.socket.io/4.7.2/socket.io.min.js")
    if socket_script:
        socket_script.extract()  # Remove the original Socket.IO script
    
    # Add dummy data for demonstration purposes
    dummy_data_script = soup.new_tag("script")
    dummy_data_script.string = """
    // Dummy data for static demo
    const DEMO_DATA = {
        locations: [
            {name: 'La Paz', description: 'Capital city of Baja California Sur with diverse marine ecosystems'},
            {name: 'Bahía de los Ángeles', description: 'UNESCO World Heritage site known for whale sharks and sea lions'},
            {name: 'Cabo Pulmo', description: 'Marine protected area with recovering coral reef ecosystems'},
            {name: 'Loreto', description: 'Site of Loreto Bay National Marine Park with high biodiversity'}
        ],
        report: {
            title: 'Marine Ecosystem Assessment Report',
            date: '2025-06-26',
            location: 'Cabo Pulmo',
            metrics: {
                'Fish Diversity Index': '74/100',
                'Coral Health': '82/100',
                'Algal Coverage': '12%',
                'Water Clarity': '87/100',
                'Average Temp': '24.6°C'
            }
        },
        analysisSteps: [
            '09:45:22 | Loading video file: reef_survey_cabo_pulmo_2025.mp4',
            '09:45:24 | Extracting video frames for analysis...',
            '09:45:30 | Detecting marine species using ML model v2.3...',
            '09:45:38 | Analyzing coral coverage: 32% detected',
            '09:45:42 | Measuring water turbidity and light penetration...',
            '09:45:48 | Identifying dominant fish species: Parrotfish, Angelfish, Snappers',
            '09:45:55 | Calculating biodiversity indices...',
            '09:46:03 | Assessing algal presence: Minimal coverage detected',
            '09:46:10 | Generating ecological health metrics...',
            '09:46:15 | Analysis complete! Generating report...'
        ]
    };

    // Function to simulate the application behavior for the static demo
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize the map
        if (typeof L !== 'undefined') {
            const map = L.map('interactive-map').setView([24.0, -110.0], 6);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(map);

            // Add Gulf of California water body
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
            }).addTo(map).bindPopup('Gulf of California');

            // Add markers for demo locations
            DEMO_DATA.locations.forEach(loc => {
                let lat, lng;
                switch(loc.name) {
                    case 'La Paz':
                        lat = 24.1426;
                        lng = -110.3128;
                        break;
                    case 'Bahía de los Ángeles':
                        lat = 28.9514;
                        lng = -113.5622;
                        break;
                    case 'Cabo Pulmo':
                        lat = 23.4333;
                        lng = -109.4167;
                        break;
                    case 'Loreto':
                        lat = 26.0115;
                        lng = -111.3486;
                        break;
                    default:
                        lat = 24.0;
                        lng = -110.0;
                }
                
                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(`<b>${loc.name}</b><br>${loc.description}`);
            });
        }

        // Set up demo interactions
        const uploadBtn = document.querySelector('.btn-primary');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', function() {
                simulateAnalysis();
            });
        }

        // Add demo button
        const uploadZone = document.getElementById('upload-zone');
        if (uploadZone) {
            const demoBtn = document.createElement('button');
            demoBtn.className = 'btn btn-success mt-3';
            demoBtn.innerHTML = '<i class="fas fa-play-circle"></i> Run Demo Analysis';
            demoBtn.addEventListener('click', simulateAnalysis);
            uploadZone.appendChild(demoBtn);
        }
    });

    function simulateAnalysis() {
        // Show analysis info
        document.getElementById('analysis-info').style.display = 'block';
        document.getElementById('video-filename').textContent = 'reef_survey_cabo_pulmo_2025.mp4';

        // Show analysis console
        document.getElementById('analysis-card').style.display = 'block';
        const consoleOutput = document.getElementById('console-output');
        consoleOutput.innerHTML = '';

        // Simulate analysis steps
        let stepIndex = 0;
        const interval = setInterval(function() {
            if (stepIndex < DEMO_DATA.analysisSteps.length) {
                const message = DEMO_DATA.analysisSteps[stepIndex];
                
                const msgDiv = document.createElement('div');
                msgDiv.className = 'console-message';
                msgDiv.innerHTML = message;
                
                consoleOutput.appendChild(msgDiv);
                consoleOutput.scrollTop = consoleOutput.scrollHeight;
                
                stepIndex++;
            } else {
                clearInterval(interval);
                simulateReportGeneration();
            }
        }, 1000);
    }

    function simulateReportGeneration() {
        // Show report card
        setTimeout(function() {
            document.getElementById('report-card').style.display = 'block';
            
            // Generate report content
            const reportContent = document.getElementById('report-content');
            reportContent.innerHTML = `
                <h3>${DEMO_DATA.report.title}</h3>
                <p class="text-muted">Generated on ${DEMO_DATA.report.date} for ${DEMO_DATA.report.location}</p>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5>Ecosystem Health Metrics</h5>
                            </div>
                            <div class="card-body">
                                <table class="table table-striped">
                                    <tbody>
                                        ${Object.entries(DEMO_DATA.report.metrics).map(([key, value]) => 
                                            `<tr><td>${key}</td><td>${value}</td></tr>`
                                        ).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5>Biodiversity Distribution</h5>
                            </div>
                            <div class="card-body">
                                <div id="biodiversity-chart" style="height: 250px;">
                                    <img src="static/plots/demo-biodiversity.png" class="img-fluid" alt="Biodiversity Chart">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header">
                        <h5>Assessment Summary</h5>
                    </div>
                    <div class="card-body">
                        <p>The marine ecosystem at ${DEMO_DATA.report.location} demonstrates a good overall health status with a Fish Diversity Index of ${DEMO_DATA.report.metrics['Fish Diversity Index']}. Coral health is excellent at ${DEMO_DATA.report.metrics['Coral Health']}, indicating minimal bleaching or disease.</p>
                        <p>Water quality measurements show high clarity (${DEMO_DATA.report.metrics['Water Clarity']}) and optimal temperature (${DEMO_DATA.report.metrics['Average Temp']}) for native species. Algal coverage remains low at ${DEMO_DATA.report.metrics['Algal Coverage']}.</p>
                        <p>Based on these metrics, this site maintains a healthy balance of species and habitat conditions. Continued monitoring is recommended to track seasonal variations and potential climate change impacts.</p>
                    </div>
                </div>
            `;
            
            // Enable chat functionality
            document.getElementById('chat-input').disabled = false;
            document.getElementById('send-chat').disabled = false;
            
            // Add a welcome message
            const chatMessages = document.getElementById('chat-messages');
            const botMsg = document.createElement('div');
            botMsg.className = 'bot-message';
            botMsg.innerHTML = `
                <i class="fas fa-robot"></i>
                <div class="message-content">
                    I've analyzed the marine ecosystem at ${DEMO_DATA.report.location}. The location shows healthy coral and fish populations. Would you like to know more about any specific aspect of the assessment?
                </div>
                <div class="message-time">Just now</div>
            `;
            chatMessages.appendChild(botMsg);
        }, 1500);
    }
    """
    
    # Add the dummy data script to the document
    soup.body.append(dummy_data_script)
    
    # Write the static HTML file
    with open(os.path.join(DEMO_DIR, "index.html"), "w") as f:
        f.write(str(soup))

def create_demo_plots():
    """Create placeholder plot images for the demo"""
    print("Creating demo plot images...")
    
    # Create plots directory if it doesn't exist
    plots_dir = os.path.join(DEMO_DIR, "static", "plots")
    os.makedirs(plots_dir, exist_ok=True)
    
    # If there's an example plot, use it, otherwise create a placeholder text file
    example_plot = os.path.join(STATIC_DIR, "plots", "demo-biodiversity.png")
    if os.path.exists(example_plot):
        shutil.copy(example_plot, os.path.join(plots_dir, "demo-biodiversity.png"))
    else:
        # Create a placeholder file
        with open(os.path.join(plots_dir, "demo-biodiversity.png"), "w") as f:
            f.write("This is a placeholder for a biodiversity chart image")

if __name__ == "__main__":
    create_static_index()
    create_demo_plots()
    print("Static demo created successfully in the 'demo' directory")
