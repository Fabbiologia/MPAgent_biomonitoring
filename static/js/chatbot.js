// Rapid Reef Assessment - Chatbot Functionality

// Extend ReefAssessmentApp with chatbot-related methods
ReefAssessmentApp.prototype.enableChatbot = function() {
    // Enable chatbot after analysis is complete
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-chat');
    
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.placeholder = 'Ask about the marine assessment results...';
    
    this.addChatMessage('Analysis complete! You can now ask me questions about the assessment results.', 'bot');
};

ReefAssessmentApp.prototype.sendChatMessage = function(promptText = null) {
    const chatInput = document.getElementById('chat-input');
    const messageText = promptText || chatInput.value;
    
    if (!messageText.trim()) return;
    
    // Add user message to chat
    this.addChatMessage(messageText, 'user');
    
    // Clear input if it was typed (not from quick prompt)
    if (!promptText) chatInput.value = '';
    
    // Show thinking indicator
    this.addChatMessage('<div class="spinner"></div> Analyzing data...', 'bot', true);
    
    // Send to server
    fetch('/chatbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: messageText,
            session_id: this.currentSessionId
        })
    })
    .then(response => response.json())
    .then(data => {
        // Remove thinking message
        this.removeLastChatMessage();
        
        // Add response
        this.addChatMessage(data.response, 'bot');
    })
    .catch(error => {
        console.error('Chatbot error:', error);
        
        // Remove thinking message
        this.removeLastChatMessage();
        
        // Add error message
        this.addChatMessage('Sorry, I encountered an error processing your question. Please try again.', 'bot');
    });
};

ReefAssessmentApp.prototype.addChatMessage = function(message, sender, isTemporary = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    if (isTemporary) messageDiv.classList.add('temporary');
    
    messageDiv.innerHTML = `
        <i class="${sender === 'user' ? 'fas fa-user' : 'fas fa-robot'}"></i>
        <div class="message-content">${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
};

ReefAssessmentApp.prototype.removeLastChatMessage = function() {
    const chatMessages = document.getElementById('chat-messages');
    const tempMessages = chatMessages.querySelectorAll('.temporary');
    
    if (tempMessages.length > 0) {
        chatMessages.removeChild(tempMessages[tempMessages.length - 1]);
    }
};
