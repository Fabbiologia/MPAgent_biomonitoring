// Rapid Reef Assessment - Frontend JavaScript
// Part 1: Core Application & Initialization

document.addEventListener('DOMContentLoaded', () => {
    // Initialize app when DOM is ready
    window.reefApp = new ReefAssessmentApp();
});

class ReefAssessmentApp {
    constructor() {
        this.socket = null;
        this.currentSessionId = null;
        this.currentResults = null;
        this.uploadHistory = [];
        
        this.initializeSocketIO();
        this.initializeEventListeners();
        this.loadUploadHistory();
        
        console.log('Rapid Reef Assessment App initialized');
    }
    
    initializeSocketIO() {
        // Initialize WebSocket connection for real-time updates
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to assessment system');
            this.addChatMessage('System connected. Ready for marine assessment.', 'bot');
        });
        
        this.socket.on('analysis_step', (data) => {
            console.log('Received analysis_step event:', data);
            if (data.session_id === this.currentSessionId) {
                this.addConsoleMessage(data.message, 'info', data.timestamp);
            } else {
                console.log('Session ID mismatch:', data.session_id, this.currentSessionId);
            }
        });
        
        this.socket.on('analysis_complete', (data) => {
            console.log('Received analysis_complete event:', data);
            if (data.session_id === this.currentSessionId) {
                this.currentResults = data.results;
                this.addConsoleMessage('Analysis complete! Generating report...', 'success');
                this.generateTechnicalReport(data.results);
                this.updateLocationMap(data.results);
                this.enableChatbot();
            }
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from assessment system');
            this.addConsoleMessage('Connection to assessment system lost. Please refresh the page.', 'error');
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.addConsoleMessage('Connection error. Please check your network.', 'error');
        });
    }
    
    initializeEventListeners() {
        // Video upload functionality
        const videoInput = document.getElementById('video-input');
        const uploadZone = document.getElementById('upload-zone');
        
        videoInput.addEventListener('change', (e) => this.handleVideoUpload(e));
        uploadZone.addEventListener('click', () => videoInput.click());
        
        // Drag and drop functionality
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processVideoFile(files[0]);
            }
        });
        
        // Chatbot functionality
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-chat');
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !chatInput.disabled) {
                this.sendChatMessage();
            }
        });
        
        sendButton.addEventListener('click', () => this.sendChatMessage());
        
        // Quick prompt buttons
        document.querySelectorAll('.quick-prompt').forEach(button => {
            button.addEventListener('click', (e) => {
                const prompt = e.target.dataset.prompt;
                this.sendChatMessage(prompt);
            });
        });
        
        // PDF download handled by static/js/pdf-export.js
        
        // Upload history functionality
        document.getElementById('upload-history').addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const sessionId = historyItem.dataset.sessionId;
                this.loadSessionResults(sessionId);
            }
        });
    }
    
    // Video upload methods
    handleVideoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processVideoFile(file);
        }
    }
    
    processVideoFile(file) {
        // Validate file type
        const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
        const fileExt = file.name.split('.').pop().toLowerCase();
        const validExtensions = ['mp4', 'mov', 'avi', 'mkv'];
        
        if (!allowedTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
            alert('Please upload a valid video file (MP4, MOV, AVI, MKV)');
            return;
        }
        
        // Check file size (500MB limit)
        if (file.size > 500 * 1024 * 1024) {
            alert('File size too large. Please upload a video smaller than 500MB.');
            return;
        }
        
        // Display video filename
        const filenameElement = document.getElementById('video-filename');
        if (filenameElement) {
            filenameElement.textContent = file.name;
        }
        
        // Check for algal bloom in filename
        if (file.name.toLowerCase().includes('algal_bloom')) {
            const algalAlert = document.getElementById('algal-bloom-alert');
            if (algalAlert) {
                algalAlert.style.display = 'block';
                console.log('Algal bloom detected in filename');
            }
        }
        
        // Show analysis info section (without video preview)
        const analysisInfo = document.getElementById('analysis-info');
        if (analysisInfo) {
            analysisInfo.style.display = 'block';
        }
        
        // Upload file
        this.uploadVideo(file);
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    uploadVideo(file) {
        const formData = new FormData();
        formData.append('video', file);
        
        const progressBar = document.querySelector('.progress-bar');
        const progressContainer = document.getElementById('upload-progress');
        const statusText = document.getElementById('upload-status');
        
        progressContainer.style.display = 'block';
        
        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 95) progress = 95;
            progressBar.style.width = progress + '%';
        }, 200);
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            
            if (data.success) {
                this.currentSessionId = data.session_id;
                statusText.textContent = 'Upload complete! Starting analysis...';
                
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    this.showAnalysisConsole();
                }, 1000);
                
                console.log(`Video uploaded successfully. Session ID: ${data.session_id}`);
            } else {
                statusText.textContent = `Upload failed: ${data.error}`;
                statusText.className = 'text-danger';
            }
        })
        .catch(error => {
            clearInterval(progressInterval);
            console.error('Upload error:', error);
            statusText.textContent = `Upload error: ${error.message}`;
            statusText.className = 'text-danger';
        });
    }
}
