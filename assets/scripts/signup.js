/*    --------               Signup Script Frontend         ---------* 
* 
*                   Designed and implemented by Divin MATHEMWANA
*          copyright (c) 2025 AlphaCoders Smile Connector Group project                                
       
 */

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const fullName = urlParams.get('username') || 'User';
    const generatedUsername = urlParams.get('name');
    
    document.getElementById('username').textContent = fullName;
    
    if (generatedUsername) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'generatedUsername';
        hiddenInput.value = generatedUsername;
        document.getElementById('passwordForm').appendChild(hiddenInput);
    }
    
    // Get DOM elements
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const requirementsText = document.querySelector('.password-requirements small');
    
    // Real-time password validation
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let message = '';
        let isValid = true;
        
        if (password.length === 0) {
            message = 'Must be at least 8 characters with a number and uppercase letter';
        } else if (password.length < 8) {
            message = 'Password too short (min 8 characters)';
            isValid = false;
        } else if (!/[a-z]/i.test(password)) {
            message = 'Add at least one letter';
            isValid = false;
        } else if (!/[A-Z]/.test(password)) {
            message = 'Add at least one uppercase letter';
            isValid = false;
        } else if (!/[0-9]/.test(password)) {
            message = 'Add at least one number';
            isValid = false;
        } else {
            message = 'Password meets requirements';
        }
        
        requirementsText.textContent = message;
        requirementsText.style.color = isValid ? '#4CAF50' : '#F44336';
        
        // Validate confirmation when password changes
        if (confirmInput.value.length > 0) {
            validatePasswordMatch();
        }
    });
    
    // Password match validation
    confirmInput.addEventListener('input', validatePasswordMatch);
    
    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        const confirmBox = confirmInput.closest('.input-box');
        
        if (confirmPassword.length === 0) return;
        
        if (password !== confirmPassword) {
            confirmBox.classList.add('error');
            confirmBox.querySelector('label').style.color = '#F44336';
            confirmBox.querySelector('i').style.color = '#F44336';
        } else {
            confirmBox.classList.remove('error');
            confirmBox.querySelector('label').style.color = '#00796b';
            confirmBox.querySelector('i').style.color = '#757575';
        }
    }
    
    // Form submission handler
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitButton.disabled = true;
        
        fetch(this.action, {
            method: 'POST',
            body: new FormData(this)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Determine dashboard URL based on user type
                let dashboardUrl;
                switch(data.user_type) {
                    case 'superadmin':
                        dashboardUrl = '../dashboard/admin.html';
                        break;
                    case 'admin':
                        dashboardUrl = '../dashboard/secondAdmin.html';
                        break;
                    case 'patient':
                        dashboardUrl = '../dashboard/patient.html';
                        break;
                    default:
                        dashboardUrl = '../logins/login.html';
                }
                
                // Redirect with all user data
                const params = new URLSearchParams();
                params.append('username', data.full_name);
                params.append('email', data.email);
                params.append('user_type', data.user_type);
                if (data.username) params.append('name', data.username);
                
                window.location.href = `${dashboardUrl}?${params.toString()}`;
            } else {
                showNotification(data.message || 'Password setup failed', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('An error occurred. Please try again.', 'error');
        })
        .finally(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        });
    });
});
  // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10001;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        `;

        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };

        notification.style.background = colors[type] || colors.info;
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" 
                style="margin-right: 10px; font-size: 16px;"></i>
                <span>${message}</span>
            </div>
        `;

        // Add CSS animation if not already present
        if (!document.querySelector('style[data-notification-animation]')) {
            const style = document.createElement('style');
            style.setAttribute('data-notification-animation', 'true');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds or on click
        const removeNotification = () => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        };

        notification.addEventListener('click', removeNotification);
        setTimeout(removeNotification, 5000);
    }