document.addEventListener('DOMContentLoaded', function() {
    // Chatbot container elements
    const chatContainer = document.querySelector('.chat-bot.container');
    const chatScreen = document.querySelector('.chatScreen');
    const startContent = document.querySelector('.startContent');
    const chatContent = document.querySelector('.chatContent');
    const resultsContainer = document.querySelector('.results');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('sendButton');
    const fileInputBtn = document.getElementById('fileInput');
    const voiceInputBtn = document.getElementById('voiceInput');
    const newChatButton = document.getElementById('newChatButton');
    const recentChatList = document.querySelector('.recentchat');
    const inputArea = document.querySelector('.inputArea');

    const filePreviewContainer = document.createElement('div');
    filePreviewContainer.className = 'file-preview-container';
    filePreviewContainer.innerHTML = `
        <div class="preview-header">
            <span>Selected File</span>
            <button id="remove-file">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="preview-content">
            <img id="image-preview" src="" alt="Preview" style="display: none;">
            <div class="file-info">
                <span id="file-name"></span>
                <span id="file-size"></span>
            </div>
        </div>
    `;
    inputArea.insertBefore(filePreviewContainer, inputArea.firstChild);
    
    const removeFileBtn = document.getElementById('remove-file');
    const imagePreview = document.getElementById('image-preview');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sideNavigation = document.querySelector('.sideNavigation');
    
    // State variables
    let currentConversationId = null;
    let isRecording = false;
    let recognition = null;
    let selectedFile = null;
    let conversations = [];
    let isGenerating = false;
    let currentSpeech = null;
    let currentTypingTimeout = null;
    let isTyping = false;
    let realtimeTranscript = '';
    
    // Initialize the chatbot
    initChatbot();

    function initChatbot() {
        // Make chat container fixed
        chatContainer.style.position = 'fixed';
        chatContainer.style.top = '0';
        chatContainer.style.bottom = '0';
        chatContainer.style.left = '0';
        chatContainer.style.right = '0';
        chatContainer.style.overflow = 'hidden';
        
        // Set up chat content scrolling
        chatContent.style.overflowY = 'auto';
        chatContent.style.flexGrow = '1';
        
        // Hide file preview initially
        filePreviewContainer.style.display = 'none';
        
        // Load any saved conversations (if needed)
        loadConversations();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Send message on button click
        sendButton.addEventListener('click', () => {
            if (isGenerating) {
                stopGeneration();
            } else {
                sendMessage();
            }
        });
        
        // Send message on Enter key (but allow Shift+Enter for new lines)
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isGenerating) {
                    sendMessage();
                }
            }
        });
        
        // Auto-resize textarea
        userInput.addEventListener('input', autoResizeTextarea);
        
        // File input handling
        fileInputBtn.addEventListener('click', function() {
            // Create a hidden file input element
            const actualFileInput = document.createElement('input');
            actualFileInput.type = 'file';
            actualFileInput.style.display = 'none';
            actualFileInput.accept = '*/*';
            
            actualFileInput.addEventListener('change', function(e) {
                if (e.target.files.length > 0) {
                    handleFileSelection(e.target.files[0]);
                }
            });
            
            document.body.appendChild(actualFileInput);
            actualFileInput.click();
            document.body.removeChild(actualFileInput);
        });
        
        // Remove file button
        removeFileBtn.addEventListener('click', function() {
            selectedFile = null;
            filePreviewContainer.style.display = 'none';
        });
        
        // Voice input handling
        voiceInputBtn.addEventListener('click', toggleVoiceRecognition);
        
        // New conversation button
        newChatButton.addEventListener('click', startNewConversation);
        
        // Mobile menu toggle
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', function() {
                sideNavigation.classList.toggle('mobile-visible');
            });
        }
        
        // Sidebar toggle
        if (toggleSidebar) {
            toggleSidebar.addEventListener('click', function() {
                sideNavigation.classList.toggle('collapsed');
            });
        }
        
        // Click on suggestion cards
        document.querySelectorAll('.suggestionCard').forEach(card => {
            card.addEventListener('click', function() {
                const question = this.querySelector('h3').textContent;
                userInput.value = question;
                sendMessage();
            });
        });
    }
    
    function autoResizeTextarea() {
        // Reset height to get correct scrollHeight
        userInput.style.height = 'auto';
        
        // Set height based on content, up to 7 lines max
        const maxHeight = parseInt(getComputedStyle(userInput).lineHeight) * 7;
        userInput.style.height = Math.min(userInput.scrollHeight, maxHeight) + 'px';
        
        // Enable scrolling if content exceeds max height
        userInput.style.overflowY = userInput.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
    
    function handleFileSelection(file) {
        selectedFile = file;
        
        // Show file preview
        filePreviewContainer.style.display = 'block';
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        // Show image preview if it's an image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // Real-time feedback in textarea
                const currentText = realtimeTranscript + finalTranscript + interimTranscript;
                userInput.value = currentText;
                autoResizeTextarea();
                
                // Update the base transcript when we get final results
                if (finalTranscript) {
                    realtimeTranscript += finalTranscript;
                }
            };

            recognition.onend = () => {
                if (isRecording) {
                    // Style the final text after speech ends
                    styleTranscriptText();
                    recognition.start(); // Continue listening if still recording
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                stopVoiceRecognition();
            };
        }
    }
    
    function styleTranscriptText() {
        const finalText = userInput.value.trim();
        if (finalText) {
            userInput.value = finalText;
            autoResizeTextarea();
        }
    }
    
    function toggleVoiceRecognition() {
        if (!recognition) {
            setupSpeechRecognition();
        }
        
        if (!recognition) {
            showError('Speech recognition not supported in your browser');
            return;
        }
        
        if (isRecording) {
            stopVoiceRecognition();
        } else {
            startVoiceRecognition();
        }
    }
    
    function startVoiceRecognition() {
        isRecording = true;
        realtimeTranscript = userInput.value; // Preserve existing text
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        voiceInputBtn.style.color = 'red';
        recognition.start();
    }
    
    function stopVoiceRecognition() {
        isRecording = false;
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceInputBtn.style.color = '';
        
        if (recognition) {
            recognition.stop();
        }
        
        // Final styling when speech stops
        styleTranscriptText();
        realtimeTranscript = '';
    }
    
    function stopGeneration() {
        isGenerating = false;
        isTyping = false;
        sendButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
        sendButton.style.color = '';
        userInput.disabled = false;
        
        // Clear any ongoing typing animation
        if (currentTypingTimeout) {
            clearTimeout(currentTypingTimeout);
            currentTypingTimeout = null;
        }
        
        // Stop speech if active
        if (currentSpeech) {
            window.speechSynthesis.cancel();
            currentSpeech = null;
        }
    }
    
    async function sendMessage() {
        const message = userInput.value.trim();
        
        if (!message && !selectedFile) {
            showError('Please enter a message or attach a file');
            return;
        }
        
        // Hide start content and show chat content if this is the first message
        if (startContent.style.display !== 'none') {
            startContent.style.display = 'none';
            chatContent.style.display = 'block';
        }
        
        // Create a new conversation if none exists
        if (!currentConversationId) {
            currentConversationId = generateConversationId();
            const conversationTitle = message.substring(0, 30) || (selectedFile ? selectedFile.name.substring(0, 30) : 'New Chat');
            addConversationToList(currentConversationId, conversationTitle);
        }
        
        // Add user message to chat
        addMessageToChat(message, selectedFile, 'user');
        
        // Clear input and file
        const fileToSend = selectedFile;
        userInput.value = '';
        selectedFile = null;
        filePreviewContainer.style.display = 'none';
        autoResizeTextarea();
        
        // Show generating state with spinner
        isGenerating = true;
        isTyping = false;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        sendButton.style.color = '#007bff';
        userInput.disabled = true;
        
        // Add AI message container with loading indicator
        const aiMessageElement = addAIMessageWithLoading();
        
        try {
            // Send message to backend
            const response = await sendToBackend(message, fileToSend);
            
            // Remove loading indicator and start typing
            removeLoadingIndicator(aiMessageElement);
            
            // Type the response
            await typeResponse(response, aiMessageElement);
            
        } catch (error) {
            console.log('Error sending message:', error);
            removeLoadingIndicator(aiMessageElement);
            updateAIMessage(aiMessageElement, 'Sorry, I encountered an error. Please try again.');
        } finally {
            // Only add action buttons after typing is completely done
            if (!isTyping) {
                const content = aiMessageElement.querySelector('.ai-content').textContent || 
                              aiMessageElement.querySelector('.ai-content').innerText || '';
                addActionButtons(aiMessageElement, content);
                stopGeneration();
            }
        }
    }
    
    function addMessageToChat(message, file, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        if (sender === 'user') {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">
                        ${file ? `<div class="file-message">
                            <i class="fas fa-file-alt file-icon"></i>
                            <span class="file-name">${file.name}</span>
                        </div>` : ''}
                        ${message ? `<p>${message}</p>` : ''}
                    </div>
                    <div class="message-actions">
                        <button class="action-btn copy-btn" title="Copy">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Add copy button event listener
            const copyBtn = messageElement.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(message)
                    .then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                        }, 2000);
                    })
                    .catch(err => console.error('Failed to copy:', err));
            });
        }
        
        resultsContainer.appendChild(messageElement);
        scrollToBottom();
        
        return messageElement;
    }
    
    function addAIMessageWithLoading() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai-message';
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-bubble loading">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(messageElement);
        scrollToBottom();
        
        return messageElement;
    }
    
    function removeLoadingIndicator(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        messageContent.innerHTML = `
            <div class="message-bubble">
                <div class="ai-content"></div>
            </div>
        `;
    }
    
    function updateAIMessage(messageElement, content) {
        const contentDiv = messageElement.querySelector('.ai-content');
        if (contentDiv) {
            contentDiv.innerHTML = formatMessage(content);
        }
    }
    
    async function typeResponse(markdown, messageElement) {
        const contentDiv = messageElement.querySelector('.ai-content');
        if (!contentDiv) return;

        isTyping = true;
        const parsedHTML = marked.parse(markdown);
        const temp = document.createElement('div');
        temp.innerHTML = parsedHTML;
        const htmlString = temp.innerHTML;

        function getDelay(char) {
            if (char === '.' || char === ',' || char === '?' || char === '!') return 200;
            if (char === ' ') return 20;
            return 10;
        }

        let i = 0;
        
        return new Promise((resolve) => {
            function typing() {
                if (!isGenerating || !isTyping) {
                    // If generation was stopped, show full content and resolve
                    contentDiv.innerHTML = htmlString;
                    isTyping = false;
                    resolve();
                    return;
                }
                
                if (i <= htmlString.length) {
                    contentDiv.innerHTML = htmlString.substring(0, i);
                    scrollToBottom();
                    const delay = getDelay(htmlString.charAt(i));
                    i++;
                    currentTypingTimeout = setTimeout(typing, delay);
                } else {
                    // Typing complete
                    isTyping = false;
                    const content = contentDiv.textContent || contentDiv.innerText || '';
                    addActionButtons(messageElement, content);
                    stopGeneration();
                    resolve();
                }
            }
            
            typing();
        });
    }
    
    function addActionButtons(messageElement, content) {
        // Check if action buttons already exist
        if (messageElement.querySelector('.message-actions')) {
            return;
        }
        
        const messageContent = messageElement.querySelector('.message-content');
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const copyBtn = createActionButton('copy', () => {
            copyToClipboard(content, copyBtn);
        });
        const speakBtn = createActionButton('volume-up', () => {
            speakMessage(content, speakBtn);
        });
        
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(speakBtn);
        
        messageContent.appendChild(actionsDiv);
    }
    
    function createActionButton(icon, onClick) {
        const button = document.createElement('button');
        button.className = 'action-btn';
        button.innerHTML = `<i class="fas fa-${icon}"></i>`;
        button.addEventListener('click', onClick);
        return button;
    }
    
    function copyToClipboard(text, button) {
        // Remove HTML tags for copying
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const cleanText = tempDiv.textContent || tempDiv.innerText || '';
        
        navigator.clipboard.writeText(cleanText).then(() => {
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(err => {
            console.log('Failed to copy:', err);
        });
    }
    
    function speakMessage(text, button) {
        if (currentSpeech) {
            // Stop current speech
            window.speechSynthesis.cancel();
            currentSpeech = null;
            button.innerHTML = '<i class="fas fa-volume-up"></i>';
            return;
        }

        // Remove HTML tags for speech
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const cleanText = tempDiv.textContent || tempDiv.innerText || '';

        currentSpeech = new SpeechSynthesisUtterance(cleanText);
        currentSpeech.rate = 0.9;
        currentSpeech.pitch = 1;
        currentSpeech.volume = 1;

        button.innerHTML = '<i class="fas fa-stop"></i>';

        currentSpeech.onend = () => {
            currentSpeech = null;
            button.innerHTML = '<i class="fas fa-volume-up"></i>';
        };

        currentSpeech.onerror = () => {
            currentSpeech = null;
            button.innerHTML = '<i class="fas fa-volume-up"></i>';
        };

        window.speechSynthesis.speak(currentSpeech);
    }
    
    function formatMessage(text) {
        if (!text) return '';
        return marked.parse(text);  // Convert markdown to styled HTML
    }
    
    async function sendToBackend(message, file) {
        const formData = new FormData();
        formData.append('message', message);
        
        if (file) {
            formData.append('file', file);
        }
        
        // Add conversation context
        formData.append('conversation_id', currentConversationId || '');
        formData.append('history', JSON.stringify(conversations));

        const response = await fetch('http://127.0.0.1:5000/api/test-chatbot', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    }
    
    function updateConversationHistory(userMessage, aiResponse) {
        // Implementation for saving conversation history
    }
    
    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        // Insert at the top of the chat content
        chatContent.insertBefore(errorElement, chatContent.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
    
    function generateConversationId() {
        return 'conv-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    
    function loadConversations() {
        conversations = [];
    }
    
    function addConversationToList(id, title) {
        const conversation = { id, title };
        conversations.push(conversation);
        
        const listItem = document.createElement('li');
        listItem.dataset.conversationId = id;
        listItem.innerHTML = `
            <i class="fas fa-comment"></i>
            <span class="conversation-title">${title}</span>
        `;
        
        listItem.addEventListener('click', () => {
            loadConversation(id);
        });
        
        recentChatList.insertBefore(listItem, recentChatList.firstChild);
    }
    
    function loadConversation(id) {
        currentConversationId = id;
        resultsContainer.innerHTML = '';
        startContent.style.display = 'none';
        chatContent.style.display = 'block';
        
        // Highlight the selected conversation in the list
        document.querySelectorAll('.recentchat li').forEach(item => {
            item.classList.toggle('active', item.dataset.conversationId === id);
        });
    }
    
    function startNewConversation() {
        // Clear current conversation
        currentConversationId = null;
        resultsContainer.innerHTML = '';
        userInput.value = '';
        selectedFile = null;
        filePreviewContainer.style.display = 'none';
        
        // Show start content
        startContent.style.display = 'block';
        chatContent.style.display = 'none';
        
        // Remove active class from all conversation items
        document.querySelectorAll('.recentchat li').forEach(item => {
            item.classList.remove('active');
        });
    }
    
    function scrollToBottom() {
        chatContent.scrollTop = chatContent.scrollHeight;
    }
});
