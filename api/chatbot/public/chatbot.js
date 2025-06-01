/**
 * SmileConnector Chat Application
 * 
 * Designed and implemented by Divin MATHEMWANA
 * 
 * Structured and organized version matching the HTML and Node.js backend
 * 
 * Copyright (c) 2025 AlphaCoders group Project
 */

// DOM Elements - Organized by section
const DOM = {
    // Chat Interface
    userInput: document.getElementById('user-input'),
    sendButton: document.getElementById('sendButton'),
    chatContent: document.querySelector('.chatContent .results'),
    startContent: document.querySelector('.startContent'),
    
    // Sidebar Elements
    toggleSidebar: document.getElementById('toggleSidebar'),
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    sidebar: document.querySelector('.sideNavigation'),
    newChatButton: document.getElementById('newChatButton'),
    recentChats: document.querySelector('.recentchat'),
    
    // User Interface
    usernameDisplays: document.querySelectorAll('#username'),
    suggestionCards: document.querySelectorAll('.suggestionCard'),
    
    // File Handling
    fileUploadButton: document.querySelector('#fileInput'),
    fileInput: document.createElement('input'),
    voiceInputBtn: document.getElementById('voiceInput'),
    
    // File Preview
    filePreviewContainer: document.querySelector('.file-preview-container'),
    fileNameElement: document.getElementById('file-name'),
    fileSizeElement: document.getElementById('file-size'),
    imagePreview: document.getElementById('image-preview'),
    removeFileButton: document.getElementById('remove-file')
};

// Application State
const AppState = {
    chatHistory: [],
    currentUsername: "Divin",
    currentChatId: generateChatId(),
    selectedFile: null,
    isTyping: false,
    API_ENDPOINT: '/api/chat'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApplication();
});

/**
 * Initialize the entire application
 */
function initApplication() {
    // Setup file input (hidden)
    DOM.fileInput.type = 'file';
    DOM.fileInput.id = 'actualFileInput';
    DOM.fileInput.style.display = 'none';
    document.body.appendChild(DOM.fileInput);

    // Initialize UI components
    initUIEventListeners();
    updateUsernameDisplay();
    loadRecentChats();
    
    // Clear chat content
    DOM.chatContent.innerHTML = '';
}

/**
 * Initialize all UI event listeners
 */
function initUIEventListeners() {
    // Sidebar interactions
    DOM.toggleSidebar?.addEventListener('click', toggleSidebar);
    DOM.mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
    DOM.newChatButton?.addEventListener('click', startNewChat);
    
    // Chat interactions
    DOM.sendButton?.addEventListener('click', sendMessage);
    DOM.userInput?.addEventListener('keydown', handleTextareaInput);
    
    // File handling
    DOM.fileUploadButton?.addEventListener('click', () => DOM.fileInput.click());
    DOM.fileInput.addEventListener('change', handleFileUpload);
    DOM.removeFileButton?.addEventListener('click', removeSelectedFile);
    
    // Voice input
    if (DOM.voiceInputBtn) {
        DOM.voiceInputBtn.addEventListener('click', handleVoiceInput);
    }
    
    // Suggestion cards
    DOM.suggestionCards.forEach(card => {
        card.addEventListener('click', () => handleSuggestionCardClick(card));
    });
    
    // Theme toggle
    const themeToggleBtn = document.querySelector('[title="Toggle Theme"]');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
    DOM.sidebar.classList.toggle('collapsed');
}

/**
 * Toggle mobile menu with overlay
 */
function toggleMobileMenu() {
    const overlay = getOrCreateOverlay();
    DOM.sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

/**
 * Get or create overlay element
 */
function getOrCreateOverlay() {
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            DOM.sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    return overlay;
}

/**
 * Update username display throughout the UI
 */
function updateUsernameDisplay() {
    DOM.usernameDisplays.forEach(element => {
        element.textContent = AppState.currentUsername;
    });
}

/**
 * Handle textarea input and auto-resize
 */
function handleTextareaInput(e) {
    // Auto-resize
    this.style.height = 'auto';
    this.style.height = `${this.scrollHeight}px`;
    
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

/**
 * Start a new chat session
 */
function startNewChat() {
    AppState.currentChatId = generateChatId();
    AppState.chatHistory = [];
    AppState.selectedFile = null;
    
    DOM.chatContent.innerHTML = '';
    DOM.startContent.style.display = 'flex';
    
    // Clear file input and preview
    DOM.fileInput.value = '';
    if (DOM.filePreviewContainer) {
        DOM.filePreviewContainer.style.display = 'none';
    }
    
    // Clear active chats in sidebar
    clearActiveChats();
}

/**
 * Send message to the backend
 */
function sendMessage() {
    const message = DOM.userInput.value.trim();
    
    // Don't send empty messages without files
    if (message === '' && !AppState.selectedFile) return;
    
    // Don't send if AI is typing
    if (AppState.isTyping) return;
    
    // Hide start content if visible
    if (DOM.startContent.style.display !== 'none') {
        DOM.startContent.style.display = 'none';
    }
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Add to recent chats
    addToRecentChats(message);
    
    // Process file if selected
    if (AppState.selectedFile) {
        const fileType = AppState.selectedFile.type.startsWith('image/') ? 'image' : 'file';
        addMessageToChat('user', `I've uploaded a ${fileType}: ${AppState.selectedFile.name}`);
    }
    
    // Clear input and reset textarea
    DOM.userInput.value = '';
    DOM.userInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Prepare data for backend
    const requestData = {
        chatId: AppState.currentChatId,
        message: message,
        history: AppState.chatHistory
    };
    
    // If we have a file, prepare FormData
    let requestPromise;
    if (AppState.selectedFile && AppState.selectedFile.type.startsWith('image/')) {
        const formData = new FormData();
        formData.append('chatId', AppState.currentChatId);
        formData.append('image', AppState.selectedFile);
        formData.append('prompt', message || 'What can you tell me about this image?');
        
        requestPromise = fetch(`${AppState.API_ENDPOINT}/image`, {
            method: 'POST',
            body: formData
        });
    } else {
        requestPromise = fetch(AppState.API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
    }
    
    // Send request and handle response
    requestPromise
        .then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then(data => {
            removeTypingIndicator();
            addMessageToChat('assistant', data.response || "I couldn't generate a response.");
        })
        .catch(error => {
            console.error("Error:", error);
            removeTypingIndicator();
            addMessageToChat('assistant', "Sorry, there was an error processing your request.");
        })
        .finally(() => {
            AppState.selectedFile = null;
            if (DOM.filePreviewContainer) {
                DOM.filePreviewContainer.style.display = 'none';
            }
        });
}

/**
 * Add message to chat UI
 */
function addMessageToChat(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const timestamp = getFormattedTime(new Date());
    const avatarImg = sender === 'user' ? '/images/user-avatar.png' : '/images/assistant-avatar.png';
    const senderName = sender === 'user' ? AppState.currentUsername : 'SmileConnector Assistant';

    // Handle file uploads
    let filePreview = '';
    if (sender === 'user' && AppState.selectedFile && AppState.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgContainer = messageDiv.querySelector('.user-image-container');
            if (imgContainer) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'user-uploaded-image';
                imgContainer.appendChild(img);
            }
        };
        reader.readAsDataURL(AppState.selectedFile);
        filePreview = '<div class="user-image-container"></div>';
    }

    messageDiv.innerHTML = `
        <div class="avatar">
            <img src="${avatarImg}" alt="${senderName}">
        </div>
        <div class="messageContent">
            <div class="messageHeader">
                <h4>${senderName}</h4>
                <span>${timestamp}</span>
            </div>
            <div class="messageText">
                ${sender === 'user' ? `<p>${content}</p>${filePreview}` : ''}
            </div>
            ${sender === 'assistant' ? `
            <div class="messageActions">
                <button title="Copy"><i class="fa-regular fa-copy"></i></button>
                <button title="Like"><i class="fa-regular fa-thumbs-up"></i></button>
                <button title="Dislike"><i class="fa-regular fa-thumbs-down"></i></button>
            </div>
            ` : ''}
        </div>
    `;

    DOM.chatContent.appendChild(messageDiv);
    
    // For assistant messages, type out the response
    if (sender === 'assistant') {
        const messageTextDiv = messageDiv.querySelector('.messageText');
        typeResponse(messageTextDiv, content);
    }
    
    // Store in chat history
    AppState.chatHistory.push({
        role: sender,
        content: content,
        timestamp: new Date()
    });
    
    scrollToBottom();
}

/**
 * Type out response character by character
 */
function typeResponse(element, text) {
    AppState.isTyping = true;
    const formattedText = formatResponse(text);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formattedText;
    
    const textNodes = [];
    function extractTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            textNodes.push({
                node: node,
                text: node.textContent,
                parent: node.parentNode
            });
            node.textContent = '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (let i = 0; i < node.childNodes.length; i++) {
                extractTextNodes(node.childNodes[i]);
            }
        }
    }
    
    extractTextNodes(tempDiv);
    element.appendChild(tempDiv);
    
    let currentNodeIndex = 0;
    let currentCharIndex = 0;
    
    function typeNextChar() {
        if (currentNodeIndex >= textNodes.length) {
            AppState.isTyping = false;
            return;
        }
        
        const currentNode = textNodes[currentNodeIndex];
        
        if (currentCharIndex < currentNode.text.length) {
            currentNode.node.textContent += currentNode.text[currentCharIndex];
            currentCharIndex++;
            setTimeout(typeNextChar, 10);
            
            if (currentCharIndex % 10 === 0) {
                scrollToBottom();
            }
        } else {
            currentNodeIndex++;
            currentCharIndex = 0;
            setTimeout(typeNextChar, 50);
        }
    }
    
    typeNextChar();
}

/**
 * Format response text with basic markdown
 */
function formatResponse(text) {
    // Convert lists
    text = text.replace(/^\s*[\*\-\+]\s(.*$)/gm, '<li>$1</li>');
    text = text.replace(/^\s*\d+\.\s(.*$)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');
    
    // Convert bold and italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Convert inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert URLs to links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Convert line breaks to paragraphs
    return text.split('\n\n').map(para => {
        if (para.startsWith('<ul>') || para.startsWith('<ol>') || 
            para.startsWith('<pre>') || para.trim() === '') {
            return para;
        }
        return `<p>${para}</p>`;
    }).join('');
}

/**
 * Handle file upload
 */
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    AppState.selectedFile = file;
    
    // Display file preview
    if (DOM.filePreviewContainer) {
        DOM.filePreviewContainer.style.display = 'block';
        DOM.fileNameElement.textContent = file.name;
        DOM.fileSizeElement.textContent = formatFileSize(file.size);
        
        // If it's an image, show preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                DOM.imagePreview.src = e.target.result;
                DOM.imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            DOM.imagePreview.style.display = 'none';
        }
    }
}

/**
 * Remove selected file
 */
function removeSelectedFile() {
    AppState.selectedFile = null;
    DOM.fileInput.value = '';
    if (DOM.filePreviewContainer) {
        DOM.filePreviewContainer.style.display = 'none';
    }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
}

/**
 * Handle voice input from API
 * Uses Web Speech API for speech recognition
 */
function handleVoiceInput() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        
        recognition.start();
        DOM.voiceInputBtn.innerHTML = '<i class="fas fa-circle"></i>';
        DOM.voiceInputBtn.classList.add('recording');
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            DOM.userInput.value = transcript;
            DOM.userInput.style.height = 'auto';
            DOM.userInput.style.height = (DOM.userInput.scrollHeight) + 'px';
        };
        
        recognition.onend = function() {
            DOM.voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            DOM.voiceInputBtn.classList.remove('recording');
        };
        
        recognition.onerror = function() {
            DOM.voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            DOM.voiceInputBtn.classList.remove('recording');
        };
    } else {
        alert('Your browser does not support voice input.');
    }
}

/**
 * Handle suggestion card click
 */
function handleSuggestionCardClick(card) {
    const question = card.querySelector('h3').textContent;
    
    DOM.startContent.style.display = 'none';
    addMessageToChat('user', question);
    showTypingIndicator();
    
    setTimeout(() => {
        generateResponse(question);
    }, 3000);
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message';
    typingDiv.innerHTML = `
        <div class="avatar">
            <img src="/images/assistant-avatar.png" alt="SmileConnector Assistant">
        </div>
        <div class="messageContent">
            <div class="typingIndicator">
                <div class="typingDot"></div>
                <div class="typingDot"></div>
                <div class="typingDot"></div>
            </div>
        </div>
    `;
    DOM.chatContent.appendChild(typingDiv);
    scrollToBottom();
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typingIndicator');
    if (typingIndicator) {
        typingIndicator.parentElement.parentElement.remove();
    }
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    document.body.classList.add('dark-theme-transition');
    
    const themeIcon = this.querySelector('i');
    if (document.body.classList.contains('dark-theme')) {
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
    
    setTimeout(() => {
        document.body.classList.remove('dark-theme-transition');
    }, 500);
}

/**
 * Add chat to recent chats sidebar
 */
function addToRecentChats(message) {
    const displayText = message.length > 30 ? `${message.substring(0, 30)}...` : message;
    const newChatItem = document.createElement('li');
    
    newChatItem.innerHTML = `
        <i class="fa-regular fa-message"></i>
        <span class="collapseText">${displayText}</span>
    `;
    newChatItem.addEventListener('click', () => loadChatHistory(displayText, AppState.currentChatId));
    DOM.recentChats.insertBefore(newChatItem, DOM.recentChats.firstChild);
    
    // Limit to 10 recent chats
    if (DOM.recentChats.children.length > 10) {
        DOM.recentChats.removeChild(DOM.recentChats.lastChild);
    }
    
    saveRecentChats();
}

/**
 * Load recent chats from localStorage
 */
function loadRecentChats() {
    const recentChats = JSON.parse(localStorage.getItem('recentChats')) || [];
    
    // Clear existing items
    while (DOM.recentChats.firstChild) {
        DOM.recentChats.removeChild(DOM.recentChats.firstChild);
    }
    
    // Add items from localStorage
    recentChats.forEach(chat => {
        const chatItem = document.createElement('li');
        chatItem.innerHTML = `
            <i class="fa-regular fa-message"></i>
            <span class="collapseText">${chat.message}</span>
        `;
        chatItem.addEventListener('click', () => loadChatHistory(chat.message, chat.id));
        DOM.recentChats.appendChild(chatItem);
    });
}

/**
 * Save recent chats to localStorage
 */
function saveRecentChats() {
    const chatItems = Array.from(DOM.recentChats.querySelectorAll('li'));
    const recentChats = chatItems.map(li => ({
        message: li.querySelector('.collapseText').textContent,
        id: li === chatItems[0] ? AppState.currentChatId : generateChatId()
    }));
    localStorage.setItem('recentChats', JSON.stringify(recentChats));
}

/**
 * Load chat history
 */
function loadChatHistory(message, chatId) {
    clearActiveChats();
    const clickedItem = Array.from(DOM.recentChats.querySelectorAll('li')).find(li => 
        li.querySelector('.collapseText').textContent === message
    );
    
    if (clickedItem) clickedItem.classList.add('active');
    
    DOM.startContent.style.display = 'none';
    DOM.chatContent.innerHTML = '';
    AppState.currentChatId = chatId;
    
    fetch(`/api/chat/history/${chatId}`)
        .then(response => response.json())
        .then(data => {
            if (data.history?.length > 0) {
                AppState.chatHistory = data.history;
                data.history.forEach(msg => addMessageToChat(msg.role, msg.content));
            } else {
                addMessageToChat('user', message);
                showTypingIndicator();
                
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessageToChat('assistant', `This would show the actual conversation about "${message}"`);
                }, 3000);
            }
        })
        .catch(error => {
            console.error('Error loading chat history:', error);
            addMessageToChat('user', message);
            addMessageToChat('assistant', `I couldn't load the conversation history. Let's start a new conversation about "${message}".`);
        });
}

/**
 * Clear active class from all chat list items
 */
function clearActiveChats() {
    DOM.recentChats.querySelectorAll('li').forEach(item => {
        item.classList.remove('active');
    });
}

/**
 * Show toast notification
 */
function showToast(message) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 10);
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    DOM.chatContent.scrollTop = DOM.chatContent.scrollHeight;
}

/**
 * Generate unique chat ID
 */
function generateChatId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Get formatted time string
 */
function getFormattedTime(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = today - messageDate;
    const oneDay = 24 * 60 * 60 * 1000;

    let dateLabel;
    if (diffTime < oneDay) {
        dateLabel = 'Today';
    } else if (diffTime < oneDay * 2) {
        dateLabel = 'Yesterday';
    } else {
        dateLabel = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
    }

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${dateLabel} at ${hours}:${formattedMinutes} ${ampm}`;
}