/*    --------       Logins and Password Reset Script Frontend       ---------
*                                
*
* 
*            This script handles the login and password reset functionality
*       including keeping proper CSS transitions between screens made in CSS file
* 
* 
*                   Designed and implemented by Divin MATHEMWANA
*          copyright (c) 2025 AlphaCoders Smile Connector Group project                                
       
 */


document.addEventListener('DOMContentLoaded', function() {
    initializeLayout(); 
    showLoginScreen();

    // Check for login error parameters
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'invalid') {
        showNotification('Invalid username/email or password', 'error');
    }
    
});

const wrapper = document.querySelector('.wrapper');

// Form elements identification
const loginForm = document.querySelector('.form-box.login');
const forgotPasswordForm = document.querySelector('.form-box.forgot-password');
const otpVerifyForm = document.querySelector('.form-box.otp-verify');
const resetPasswordForm = document.querySelector('.form-box.reset-password');

// Info sections identification
const loginInfo = document.querySelector('.info-text.login-info');
const forgotInfo = document.querySelector('.info-text.forgot-info');

// Links identification for going back to previous screens
const showForgot = document.querySelector('.show-forgot');
const showLoginLinks = document.querySelectorAll('.show-login');
const showForgotLinks = document.querySelectorAll('.show-forgot');

// Capturing layout based on initial CSS styles for matching layouts view
function initializeLayout() {
    // For login info text
    setupInfoTextStyles(loginInfo, {
        display: 'flex',
        right: '0',
        left: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    // For forgot password info text
    setupInfoTextStyles(forgotInfo, {
        display: 'flex',
        left: '-50%',
        right: 'auto',
        opacity: '0',
        pointerEvents: 'none'
    });
    
    // Set initial form box styles
    setupFormBoxStyles(loginForm, {
        left: '0',
        right: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    // Set initial styles for other form boxes
    [forgotPasswordForm, otpVerifyForm, resetPasswordForm].forEach(form => {
        if (form) {
            setupFormBoxStyles(form, {
                right: '-50%',
                left: 'auto',
                opacity: '0',
                pointerEvents: 'none'
            });
        }
    });
}

// Function to set up styles for info text elements for its position and visibility
function setupInfoTextStyles(element, styles) {
    if (!element) return;
    
    element.style.position = 'absolute';
    element.style.width = '50%';
    element.style.height = '100%';
    element.style.padding = '40px';
    element.style.display = styles.display || 'flex';
    element.style.flexDirection = 'column';
    element.style.justifyContent = 'center';
    element.style.transition = 'all 0.6s ease-in-out';
    
    // Apply specific positioning
    if (styles.right) element.style.right = styles.right;
    if (styles.left) element.style.left = styles.left;
    element.style.opacity = styles.opacity;
    element.style.pointerEvents = styles.pointerEvents;
}

// Function to set up styles for form boxes for its position and visibility
function setupFormBoxStyles(element, styles) {
    if (!element) return;
    
    element.style.position = 'absolute';
    element.style.transition = 'all 0.6s ease-in-out';
    
    // Apply specific positioning
    if (styles.right) element.style.right = styles.right;
    if (styles.left) element.style.left = styles.left;
    element.style.opacity = styles.opacity;
    element.style.pointerEvents = styles.pointerEvents;
}

// Function to hide all forms content
function hideAllForms() {
    loginForm.classList.remove('active');
    forgotPasswordForm.classList.remove('active');
    otpVerifyForm.classList.remove('active');
    resetPasswordForm.classList.remove('active');
}

// Function to manage the login screen visibility and styles
function showLoginScreen() {
    hideAllForms();
    loginForm.classList.add('active');
    
    // Set login info styles
    setupInfoTextStyles(loginInfo, {
        display: 'flex',
        right: '0',
        left: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    // Hide forgot info
    setupInfoTextStyles(forgotInfo, {
        display: 'flex',
        left: '-50%',
        right: 'auto',
        opacity: '0',
        pointerEvents: 'none'
    });
    
    // Position login form
    setupFormBoxStyles(loginForm, {
        left: '0',
        right: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    // Position other forms off-screen
    [forgotPasswordForm, otpVerifyForm, resetPasswordForm].forEach(form => {
        if (form) {
            setupFormBoxStyles(form, {
                right: '-50%',
                left: 'auto',
                opacity: '0',
                pointerEvents: 'none'
            });
        }
    });
    
    // Reset all wrapper classes
    wrapper.classList.remove('active', 'verify', 'reset');
}

// Function to manage the forgot password screen visibility and styles
function showForgotPasswordScreen() {
    hideAllForms();
    forgotPasswordForm.classList.add('active');
    
    // Move login info out
    setupInfoTextStyles(loginInfo, {
        display: 'flex',
        right: '-50%',
        left: 'auto',
        opacity: '0',
        pointerEvents: 'none'
    });
    
    // Move forgot info in
    setupInfoTextStyles(forgotInfo, {
        display: 'flex',
        left: '0',
        right: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    // Move login form out
    setupFormBoxStyles(loginForm, {
        left: '-50%',
        right: 'auto',
        opacity: '0',
        pointerEvents: 'none'
    });
    
    // Move forgot password form in
    setupFormBoxStyles(forgotPasswordForm, {
        right: '0',
        left: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    // Keep other forms hidden
    [otpVerifyForm, resetPasswordForm].forEach(form => {
        if (form) {
            setupFormBoxStyles(form, {
                right: '-50%',
                left: 'auto',
                opacity: '0',
                pointerEvents: 'none'
            });
        }
    });
    
    wrapper.classList.add('active');
    wrapper.classList.remove('verify', 'reset');
}

// Function to manage the OTP verification screen visibility and styles
function showOTPScreen() {
    hideAllForms();
    
    otpVerifyForm.classList.add('active');
    
    // Keep forgot info visible for OTP screen
    setupInfoTextStyles(forgotInfo, {
        display: 'flex',
        left: '0',
        right: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    // Keep login info hidden
    setupInfoTextStyles(loginInfo, {
        display: 'flex',
        right: '-50%',
        left: 'auto',
        opacity: '0',
        pointerEvents: 'none'
    });
    
    // Hide login and forgot forms
    setupFormBoxStyles(loginForm, {
        left: '-50%',
        right: 'auto',
        opacity: '0',
        pointerEvents: 'none'
    });
    
    setupFormBoxStyles(forgotPasswordForm, {
        right: '-50%',
        left: 'auto',
        opacity: '0',
        pointerEvents: 'none'
    });
    
    // Show OTP form
    setupFormBoxStyles(otpVerifyForm, {
        right: '0',
        left: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    // Keep reset form hidden
    if (resetPasswordForm) {
        setupFormBoxStyles(resetPasswordForm, {
            right: '-50%',
            left: 'auto',
            opacity: '0',
            pointerEvents: 'none'
        });
    }
    
    wrapper.classList.remove('active');
    wrapper.classList.add('verify');
    wrapper.classList.remove('reset');
}

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
// Function to manage the reset password screen visibility and styles
function showResetPasswordScreen() {
    hideAllForms();
    resetPasswordForm.classList.add('active');
    
    // Keep forgot info visible for reset password screen
    setupInfoTextStyles(forgotInfo, {
        display: 'flex',
        left: '0', 
        right: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    // Keep login info hidden
    setupInfoTextStyles(loginInfo, {
        display: 'flex',
        right: '-50%',
        left: 'auto',
        opacity: '0',
        pointerEvents: 'none'
    });
    
    // Hide login, forgot, and OTP forms
    [loginForm, forgotPasswordForm, otpVerifyForm].forEach(form => {
        if (form) {
            setupFormBoxStyles(form, {
                right: '-50%',
                left: 'auto',
                opacity: '0',
                pointerEvents: 'none'
            });
        }
    });
    
    // Show reset password form
    setupFormBoxStyles(resetPasswordForm, {
        right: '0',
        left: 'auto',
        opacity: '1',
        pointerEvents: 'auto'
    });
    
    wrapper.classList.remove('active', 'verify');
    wrapper.classList.add('reset');
}

//                     ||
//                     ||

//  ------     Event Listeners part    ---------

//                     ||
//                     ||

// Show Forgot Password Screen when clicking "Forgot password?"
showForgotLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // If we're in the OTP screen, we want to go back to forgot password
        const parentForm = link.closest('.form-box');
        
        if (parentForm && parentForm.classList.contains('otp-verify')) {
            showForgotPasswordScreen(); // Go back to forgot password screen
        } else {
            showForgotPasswordScreen(); // Regular forgot password navigation
        }
    });
});

// Show Login Screen from any other screen
showLoginLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginScreen();
    });
});

// Form Submissions
const forgotForm = document.querySelector('.form-box.forgot-password form');
const otpForm = document.querySelector('.form-box.otp-verify form');
const resetForm = document.querySelector('.form-box.reset-password form');

// Forgot Password Form Submit
if(forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
        // No need to prevent default - we want to submit to backend
        // The form will submit to forgot-password.php
        
        // Check if form has an action attribute, if not, set it
        if (!forgotForm.getAttribute('action')) {
            forgotForm.setAttribute('action', '../backend/forgot-password.php');
            forgotForm.setAttribute('method', 'post');
        }
        
        // Can add a loading indicator here if desired
        const submitBtn = forgotForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;
        }
        
        // Form will naturally submit to the backend
    });
}

// OTP Form Submit
if(otpForm) {
    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get all OTP inputs and combine them
        const otpInputs = otpForm.querySelectorAll('.otp-container input');
        let otpValue = '';
        
        otpInputs.forEach(input => {
            otpValue += input.value;
        });
        
        // Check if OTP is complete (4 digits)
        if (otpValue.length !== 4) {
            showNotification('Please enter the complete 4-digit code', 'error');
            return;
        }
        
        // Create a hidden input for the full OTP value
        const hiddenOtp = document.createElement('input');
        hiddenOtp.type = 'hidden';
        hiddenOtp.name = 'otp';
        hiddenOtp.value = otpValue;
        otpForm.appendChild(hiddenOtp);
        
        // Set form attributes if not already set
        if (!otpForm.getAttribute('action')) {
            otpForm.setAttribute('action', '../backend/verify-otp.php');
            otpForm.setAttribute('method', 'post');
        }
        
        // Submit the form
        otpForm.submit();
    });
}

// Reset Password Form Submit
if(resetForm) {
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get password inputs
        const newPassword = resetForm.querySelector('input[name="new_password"]');
        const confirmPassword = resetForm.querySelector('input[name="confirm_password"]');
        
        // Validate passwords
        if (!newPassword || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (newPassword.value.length < 8) {
            showNotification('Password must be at least 8 characters', 'error');
            return;
        }
        
        if (newPassword.value !== confirmPassword.value) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Set form attributes if not already set
        if (!resetForm.getAttribute('action')) {
            resetForm.setAttribute('action', '../backend/reset-password.php');
            resetForm.setAttribute('method', 'post');
        }
        
        // Submit the form
        resetForm.submit();
    });
}

// Check URL parameters for screen navigation and messages
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const screen = urlParams.get('screen');
    const status = urlParams.get('status');
    const error = urlParams.get('error');
    
    // Navigate to the appropriate screen based on URL parameter
    if (screen === 'forgot') {
        showForgotPasswordScreen();
    } else if (screen === 'otp') {
        showOTPScreen();
    } else if (screen === 'reset') {
        showResetPasswordScreen();
    }
    
    // Display error messages
    if (error === 'not_found') {
        showNotification('Email not found in our records', 'error');
    } else if (error === 'invalid_otp') {
        showNotification('Invalid verification code', 'error');
    } else if (error === 'expired') {
        showNotification('Verification code has expired', 'error');
    }
    else if (error === 'nomatch') {
        showNotification('Passwords do not match', 'error');
    } else if (error === 'tooshort') {
        showNotification('Password must be at least 8 characters', 'error');
    } else if (error === 'expired_token') {
        showNotification('Reset link has expired. Please start the process again.', 'error');
    } else if (status === 'reset_success') {
        showNotification('Password reset successfully! You can now log in.', 'success');
    } else if (error === 'mailer') {
        showNotification('Failed to send email. Please try again later.', 'error');
    }
    else if (error === 'admin_google_auth'){
        showNotification('Please Use your OTP first to Login for security reasons as an Admin', 'error');
    }
    else if (error === 'inactive_admin') {
        showNotification('Your account is inactive. Please contact the system administrator.', 'error');
    }
});

// Auto-focus next OTP input
const otpInputs = document.querySelectorAll('.otp-container input');
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if(e.target.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });
    
    // Handle backspace
    input.addEventListener('keydown', (e) => {
        if(e.key === 'Backspace' && index > 0 && !e.target.value) {
            otpInputs[index - 1].focus();
        }
    });
});

/* Here is the JavaScript code for the login and password reset functionality in the above code. 
It includes event listeners for form submissions, navigation between different 
screens, and handling OTP input focus. The code is structured to ensure a smooth 
user experience while managing the login and password reset processes. 

The script uses DOM manipulation to show and hide forms and info sections based on user interactions. 
Additionally, it includes basic validation for OTP inputs and handles backspace functionality for better usability.*/
/////
/////                            ||
/////                            ||

////       -------  Login with GOOGLE and APPLE part  -------

////                             ||
/////                            ||

// Update the Google login handler
document.getElementById('google-login').addEventListener('click', function(e) {
    e.preventDefault();
    showNotification('Redirecting to Google login...', 'info');
    window.location.href = window.location.origin + "./backend/googleSignup.php";
});
document.getElementById('apple-login').addEventListener('click', function(e) {
    e.preventDefault();
    showNotification('Redirecting to Email Signup...', 'info');
    
    // Add loading animation class to button
    const button = e.target;
    button.classList.add('loading');
    button.disabled = true;
    
    // Wait 3 seconds before redirecting
    setTimeout(() => {
        window.location.href = window.location.origin + "./logins/EmailRegister.html";
    }, 1800);
});

