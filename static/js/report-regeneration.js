// Rapid Reef Assessment - Report Regeneration via Chatbot

// Extend ReefAssessmentApp with report regeneration methods
ReefAssessmentApp.prototype.regenerateReport = function(adjustments = {}) {
    // Clone the current results to modify
    const modifiedResults = JSON.parse(JSON.stringify(this.currentResults));
    
    // Apply adjustments based on chatbot interaction
    if (Object.keys(adjustments).length > 0) {
        console.log('Applying the following adjustments to report:', adjustments);
        
        // Apply specific adjustments
        Object.keys(adjustments).forEach(key => {
            if (key in modifiedResults) {
                modifiedResults[key] = adjustments[key];
                
                // If we're changing fish density or invertebrate cover, recalculate FHI
                if (key === 'fish_density' || key === 'invertebrate_cover') {
                    modifiedResults.fish_health_index = 
                        (modifiedResults.fish_density / 300) * 0.6 + 
                        (modifiedResults.invertebrate_cover / 100) * 0.4;
                }
            }
        });
        
        // Add a regeneration flag
        modifiedResults.isRegenerated = true;
    }
    
    // Show regeneration in console
    this.addConsoleMessage('Regenerating technical report with updated parameters...', 'system');
    
    // Update the report with new values
    setTimeout(() => {
        this.generateTechnicalReport(modifiedResults);
        
        // Add chatbot message about regeneration
        this.addChatMessage('I\'ve regenerated the report with the requested adjustments. You can review the updated assessment above.', 'bot');
    }, 1000);
};

// Extend the chatbot sendChatMessage method to detect regeneration requests
const originalSendChatMethod = ReefAssessmentApp.prototype.sendChatMessage;
ReefAssessmentApp.prototype.sendChatMessage = function(promptText = null) {
    const chatInput = document.getElementById('chat-input');
    const messageText = promptText || chatInput.value;
    
    // Process potential regeneration requests
    if (this.shouldRegenerateReport(messageText)) {
        // Extract parameters for regeneration
        const adjustments = this.extractReportAdjustments(messageText);
        
        // Add user message to chat
        this.addChatMessage(messageText, 'user');
        
        // Clear input if it was typed (not from quick prompt)
        if (!promptText) chatInput.value = '';
        
        // Show thinking indicator
        this.addChatMessage('<div class="spinner"></div> Analyzing request and adjusting parameters...', 'bot', true);
        
        // Simulate processing time
        setTimeout(() => {
            // Remove thinking message
            this.removeLastChatMessage();
            
            // Regenerate report with extracted adjustments
            this.regenerateReport(adjustments);
        }, 1500);
        
        return;
    }
    
    // If not a regeneration request, use the original method
    originalSendChatMethod.call(this, promptText);
};

// Method to detect if a message is requesting report regeneration
ReefAssessmentApp.prototype.shouldRegenerateReport = function(message) {
    const regenerationKeywords = [
        'regenerate report', 'update report', 'recreate report', 'adjust report',
        'change parameters', 'modify values', 'update values', 'update assessment',
        'what if', 'simulate different', 'adjust parameters', 'new scenario',
        'recalculate with'
    ];
    
    const lowerMessage = message.toLowerCase();
    return regenerationKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Method to extract parameters for report regeneration
ReefAssessmentApp.prototype.extractReportAdjustments = function(message) {
    const lowerMessage = message.toLowerCase();
    const adjustments = {};
    
    // Extract fish density adjustments
    const fishDensityMatch = lowerMessage.match(/fish density (?:of|to|at) (\d+)/i) || 
                           lowerMessage.match(/(\d+) fish(?:es)?(?: per hectare| per ha)/i);
    if (fishDensityMatch) {
        const value = parseInt(fishDensityMatch[1]);
        if (value >= 0 && value <= 500) { // Sanity check
            adjustments.fish_density = value;
        }
    }
    
    // Extract invertebrate cover adjustments
    const invertMatch = lowerMessage.match(/invertebrate cover (?:of|to|at) (\d+)%/i) || 
                       lowerMessage.match(/(\d+)% invertebrate cover/i);
    if (invertMatch) {
        const value = parseInt(invertMatch[1]);
        if (value >= 0 && value <= 100) { // Sanity check
            adjustments.invertebrate_cover = value;
        }
    }
    
    // Extract coral bleaching adjustments
    const bleachingMatch = lowerMessage.match(/coral bleaching (?:of|to|at) (\d+)%/i) || 
                          lowerMessage.match(/(\d+)% coral bleaching/i);
    if (bleachingMatch) {
        const value = parseInt(bleachingMatch[1]);
        if (value >= 0 && value <= 100) { // Sanity check
            adjustments.coral_bleaching = value;
        }
    }
    
    // Extract algal bloom adjustments
    if (lowerMessage.includes('high algal bloom') || lowerMessage.includes('increase algal bloom')) {
        adjustments.algal_bloom_score = 0.85;
        adjustments.algal_bloom_level = 'High';
    } else if (lowerMessage.includes('low algal bloom') || lowerMessage.includes('reduce algal bloom')) {
        adjustments.algal_bloom_score = 0.15;
        adjustments.algal_bloom_level = 'Low';
    }
    
    // If no specific parameters are found but regeneration is requested,
    // make some reasonable random adjustments
    if (Object.keys(adjustments).length === 0) {
        // Random change to fish density within +/- 20% of current
        if (this.currentResults && this.currentResults.fish_density) {
            const currentDensity = this.currentResults.fish_density;
            const maxChange = Math.floor(currentDensity * 0.2);
            const newDensity = currentDensity + Math.floor(Math.random() * maxChange * 2) - maxChange;
            adjustments.fish_density = Math.max(50, Math.min(300, newDensity));
        }
        
        // Random change to invertebrate cover
        if (this.currentResults && this.currentResults.invertebrate_cover) {
            const currentCover = this.currentResults.invertebrate_cover;
            const maxChange = Math.floor(currentCover * 0.2);
            const newCover = currentCover + Math.floor(Math.random() * maxChange * 2) - maxChange;
            adjustments.invertebrate_cover = Math.max(10, Math.min(70, newCover));
        }
    }
    
    return adjustments;
};
