// Rapid Reef Assessment - Upload History & Session Management

// Extend ReefAssessmentApp with history-related methods
ReefAssessmentApp.prototype.loadUploadHistory = function() {
    // Get upload history from server
    fetch('/history')
        .then(response => response.json())
        .then(data => {
            this.uploadHistory = data;
            this.renderUploadHistory();
        })
        .catch(error => {
            console.error('Error loading history:', error);
        });
};

ReefAssessmentApp.prototype.renderUploadHistory = function() {
    const historyContainer = document.getElementById('upload-history');
    
    if (this.uploadHistory.length === 0) {
        historyContainer.innerHTML = '<p class="text-muted">No previous uploads found.</p>';
        return;
    }
    
    let historyHTML = '';
    
    this.uploadHistory.forEach(item => {
        const isAlgalBloom = item.filename.toLowerCase().includes('algal_bloom');
        
        historyHTML += `
            <div class="history-item" data-session-id="${item.session_id}">
                <div class="history-filename">
                    <i class="fas fa-video me-2"></i> ${item.filename}
                    ${isAlgalBloom ? '<span class="badge bg-warning text-dark ms-2">Algal Alert</span>' : ''}
                </div>
                <div class="history-date">
                    <i class="fas fa-clock me-1"></i> ${item.upload_time}
                </div>
                <div class="mt-2">
                    <small class="text-primary">
                        <i class="fas fa-file-alt me-1"></i> Click to view assessment report
                    </small>
                </div>
            </div>
        `;
    });
    
    historyContainer.innerHTML = historyHTML;
};

ReefAssessmentApp.prototype.loadSessionResults = function(sessionId) {
    // Show loading state
    document.getElementById('report-card').style.display = 'none';
    document.getElementById('analysis-card').style.display = 'block';
    this.clearConsole();
    this.addConsoleMessage('Loading previous analysis session...', 'system');
    
    // Get session results from server
    fetch(`/results/${sessionId}`)
        .then(response => response.json())
        .then(data => {
            this.currentSessionId = sessionId;
            this.currentResults = data;
            
            // Show simulated console messages
            this.addConsoleMessage('Analysis session loaded from history', 'system');
            this.addConsoleMessage('Retrieving ecological assessment data...', 'info');
            
            setTimeout(() => {
                this.addConsoleMessage('Analysis data retrieved successfully', 'success');
                this.generateTechnicalReport(data);
                this.updateLocationMap(data);
                this.enableChatbot();
                
                // Update video name display
                document.getElementById('video-filename').textContent = `File: ${data.video_filename} (retrieved from history)`;
                
                // Check for algal bloom special handling
                if (data.video_filename.toLowerCase().includes('algal_bloom')) {
                    document.getElementById('algal-bloom-alert').style.display = 'block';
                } else {
                    document.getElementById('algal-bloom-alert').style.display = 'none';
                }
                
                // Show video preview section
                document.getElementById('video-preview').style.display = 'block';
            }, 1500);
        })
        .catch(error => {
            console.error('Error loading session:', error);
            this.addConsoleMessage(`Error loading session: ${error.message}`, 'error');
        });
};
