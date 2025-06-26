// Rapid Reef Assessment - Analysis Console Functionality

// Extend ReefAssessmentApp with console-related methods
ReefAssessmentApp.prototype.showAnalysisConsole = function() {
    const analysisCard = document.getElementById('analysis-card');
    analysisCard.style.display = 'block';
    analysisCard.scrollIntoView({ behavior: 'smooth' });
    
    this.addConsoleMessage('Initializing Gulf of California Marine Assessment System...', 'system');
};

ReefAssessmentApp.prototype.addConsoleMessage = function(message, type = 'info', timestamp = null) {
    const consoleOutput = document.getElementById('console-output');
    const now = timestamp || new Date().toLocaleTimeString();
    
    console.log(`Adding console message: ${message}, type: ${type}, timestamp: ${now}`);
    
    const consoleLine = document.createElement('div');
    consoleLine.className = `console-line ${type}`;
    
    consoleLine.innerHTML = `
        <span class="console-timestamp">[${now}]</span>
        <span class="console-message">${message}</span>
    `;
    
    consoleOutput.appendChild(consoleLine);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    
    // If this is a log message about algal bloom detection, highlight it
    if (message.toLowerCase().includes('algal bloom')) {
        consoleLine.classList.add('warning');
    }
    
    // Force browser to reflow/repaint the console output
    void consoleOutput.offsetHeight;
};

// Method to clear console
ReefAssessmentApp.prototype.clearConsole = function() {
    const consoleOutput = document.getElementById('console-output');
    consoleOutput.innerHTML = '';
    this.addConsoleMessage('Console cleared. Ready for new analysis.', 'system');
};
