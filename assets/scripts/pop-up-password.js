document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordModal = document.getElementById('passwordModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const currentPassword = document.getElementById('currentPassword');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');

    // Store callback function for successful password confirmation
    let passwordModalCallback = null;

    // Close modal functions
    function closePasswordModal() {
        passwordModal.classList.remove('active');
        currentPassword.value = '';
        errorMessage.style.display = 'none';
        passwordModalCallback = null; // Clear callback
    }

    closeModal.addEventListener('click', closePasswordModal);
    cancelBtn.addEventListener('click', closePasswordModal);

    // Global function to show password modal with custom callback
    window.showPasswordModal = function(title, message, callback) {
        console.log('showPasswordModal called with:', title);
        console.log('Callback type:', typeof callback);
        console.log('Callback function:', callback);
        
        // Update modal content
        const modalTitle = document.querySelector('.pop-up-password h2');
        const modalMessage = document.querySelector('.pop-up-password p');
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalMessage) modalMessage.innerHTML = message;
        
        // Store the callback function (using local variable instead of window)
        passwordModalCallback = callback;
        console.log('Callback stored locally:', typeof passwordModalCallback);
        
        // Show modal
        if (passwordModal) {
            passwordModal.classList.add('active');
            console.log('Password modal should be visible now');
            if (currentPassword) currentPassword.focus();
        } else {
            console.error('Password modal not found!');
        }
    };

    // Password validation and confirmation
    confirmBtn.addEventListener('click', async function() {
        console.log('Confirm button clicked');
        
        const password = currentPassword.value.trim();
        console.log('Password entered:', password ? 'Yes' : 'No');
        
        if (!password) {
            errorText.textContent = 'Please enter your current password';
            errorMessage.style.display = 'flex';
            currentPassword.focus();
            return;
        }
        
        // Show loading state
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        confirmBtn.disabled = true;
        
        try {
            console.log('Verifying password...');
            // Verify password
            const isPasswordValid = await verifyPassword(password);
            console.log('Password valid:', isPasswordValid);
            
            if (isPasswordValid) {
                console.log('Password correct, executing callback...');
                console.log('Callback type before execution:', typeof passwordModalCallback);
                console.log('Callback function before execution:', passwordModalCallback);
                
                // Store the callback before closing modal (since closePasswordModal sets it to null)
                const callbackToExecute = passwordModalCallback;
                
                // Success - close modal first
                closePasswordModal();
                
                // Then execute the stored callback
                if (callbackToExecute && typeof callbackToExecute === 'function') {
                    console.log('Executing callback function');
                    try {
                        callbackToExecute();
                        console.log('Callback executed successfully');
                    } catch (callbackError) {
                        console.error('Error executing callback:', callbackError);
                    }
                } else {
                    console.error('No callback function or invalid callback:', typeof callbackToExecute);
                    console.error('Callback value:', callbackToExecute);
                }
            } else {
                console.log('Password incorrect');
                // Error - wrong password
                errorText.textContent = 'Incorrect password. Please try again.';
                errorMessage.style.display = 'flex';
                currentPassword.focus();
            }
        } catch (error) {
            console.error('Password verification error:', error);
            errorText.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'flex';
        } finally {
            // Reset button state
            btnText.style.display = 'block';
            spinner.style.display = 'none';
            confirmBtn.disabled = false;
        }
    });

    // Handle Enter key press
    currentPassword.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmBtn.click();
        }
    });

    // Password verification function
    async function verifyPassword(password) {
        // Simple demo verification - replace with actual backend call later
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(password === "demo123");
            }, 800);
        });
    }
});