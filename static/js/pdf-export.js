// Rapid Reef Assessment - PDF Export Functionality

// Extend ReefAssessmentApp with PDF export methods
ReefAssessmentApp.prototype.initPDFExport = function() {
    // Set up event listener for PDF download button
    document.getElementById('download-pdf').addEventListener('click', () => {
        // Check if we have report data
        if (!this.currentResults || !this.currentSessionId) {
            alert('Please complete an analysis before downloading a PDF report.');
            return;
        }
        
        this.generateAndDownloadPDF();
    });
};

ReefAssessmentApp.prototype.generateAndDownloadPDF = function() {
    // Show loading indicator
    const downloadBtn = document.getElementById('download-pdf');
    const originalBtnText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    downloadBtn.disabled = true;
    
    // Prepare data for PDF generation
    const reportData = {
        session_id: this.currentSessionId,
        results: this.currentResults,
        timestamp: new Date().toISOString()
    };
    
    // Send request to server to generate PDF
    fetch('/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return response.blob();
    })
    .then(blob => {
        // Create a download link for the PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `reef_assessment_${this.currentResults.location.replace(/\s+/g, '_').toLowerCase()}_${this.formatDate(new Date())}.pdf`;
        
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        
        // Trigger download
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Reset button
        downloadBtn.innerHTML = originalBtnText;
        downloadBtn.disabled = false;
        
        // Notify console and chatbot
        this.addConsoleMessage(`PDF report generated and downloaded as "${filename}"`, 'success');
        this.addChatMessage(`I've generated a PDF report of the assessment results. The file "${filename}" has been downloaded to your device.`, 'bot');
    })
    .catch(error => {
        console.error('Error generating PDF:', error);
        
        // Reset button
        downloadBtn.innerHTML = originalBtnText;
        downloadBtn.disabled = false;
        
        // Notify about error
        this.addConsoleMessage('Error generating PDF report: ' + error.message, 'error');
        this.addChatMessage('Sorry, there was an error generating the PDF report. Please try again later.', 'bot');
    });
};

// Helper function to format date for filename
ReefAssessmentApp.prototype.formatDate = function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

// Initialize PDF export functionality when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for app to be initialized before setting up PDF export
    setTimeout(() => {
        if (window.reefApp) {
            window.reefApp.initPDFExport();
        }
    }, 500);
});
