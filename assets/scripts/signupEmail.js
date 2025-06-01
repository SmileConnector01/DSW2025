let currentScreen = 1;
let userEmail = '';

// Check URL parameters for navigation and messages
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const screen = urlParams.get('screen');
    const status = urlParams.get('status');
    const error = urlParams.get('error');
    const email = urlParams.get('email');

    if (email) {
        userEmail = decodeURIComponent(email);
        document.getElementById('email').value = userEmail;
        document.getElementById('email_hidden').value = userEmail;
        document.getElementById('email_final').value = userEmail;
    }

    // Navigate to appropriate screen
    if (screen === 'otp') {
        showScreen(2);
    } else if (screen === 'complete') {
        showScreen(3);
    }

    // Display messages
    if (status === 'otp_sent') {
        showNotification('Verification code sent to your email!', 'success');
    } else if (status === 'verified') {
        showNotification('Email verified successfully!', 'success');
    } else if (error === 'email_exists') {
        showNotification('Email already registered. Please use a different email.', 'error');
    } else if (error === 'mailer_error') {
        showNotification('Failed to send verification code. Please try again.', 'error');
    } else if (error === 'invalid_otp') {
        showNotification('Invalid verification code. Please try again.', 'error');
    } else if (error === 'expired_otp') {
        showNotification('Verification code has expired. Please request a new one.', 'error');
    } else if (error === 'nomatch') {
        showNotification('Passwords do not match', 'error');
    } else if (error === 'tooshort') {
        showNotification('Password must be at least 8 characters', 'error');
    } else if (error === 'nouppercase') {
        showNotification('Password must contain at least one uppercase letter', 'error');
    } else if (error === 'nonumber') {
        showNotification('Password must contain at least one number', 'error');
    } else if (status === 'success') {
        showNotification('Registration completed successfully! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '../dashboard/patient.html';
        }, 2000);
    }

    // Set up form submissions with loading states
    setupFormSubmissions();
    setupOTPInputs(); // Initialize OTP inputs
});

function showScreen(screenNumber) {
    // Hide all screens
    document.querySelectorAll('.form-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(`screen${screenNumber}`).classList.add('active');
    
    // Update progress indicator
    updateProgress(screenNumber);
    currentScreen = screenNumber;

    // Ensure hidden email is set on OTP screen
    if (screenNumber === 2) {
        setHiddenEmail();
        setupOTPInputs(); // Re-setup OTP inputs when showing screen
    }
}

function updateProgress(screenNumber) {
    for (let i = 1; i <= 3; i++) {
        const step = document.getElementById(`step${i}`);
        const connector = document.getElementById(`connector${i}`);
        
        if (i < screenNumber) {
            step.classList.add('completed');
            step.classList.remove('active');
            if (connector) connector.classList.add('active');
        } else if (i === screenNumber) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
            if (connector) connector.classList.remove('active');
        }
    }
}

function goBackToEmail() {
    showScreen(1);
}

function resendOTP() {
    if (!userEmail) {
        showNotification('Please enter your email first', 'error');
        showScreen(1);
        return;
    }
    
    setHiddenEmail();
    
    // Show loading state
    const emailBtn = document.getElementById('emailSubmitBtn');
    const emailLoader = document.getElementById('emailLoader');
    const buttonText = emailBtn.querySelector('.button-text');
    
    buttonText.style.visibility = 'hidden';
    emailLoader.classList.add('active');
    document.getElementById('formOverlay').classList.add('active');
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '../backend/send_otp.php'; //Resend OTP endpoint
    
    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = 'email';
    emailInput.value = userEmail;
    form.appendChild(emailInput);
    
    document.body.appendChild(form);
    form.submit();
}

// Setup OTP inputs function
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-container input');
    
    if (otpInputs.length === 0) return; // Exit if no OTP inputs found
    
    otpInputs.forEach((input, index) => {
        // Remove existing event listeners by cloning the element
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
    });
    
    // Get the fresh NodeList after cloning
    const freshOtpInputs = document.querySelectorAll('.otp-container input');
    
    freshOtpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Ensure email is set in hidden field
            setHiddenEmail();
            
            // Only allow numeric input
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // Update combined OTP value
            updateCombinedOTP();
            
            if (e.target.value.length === 1 && index < freshOtpInputs.length - 1) {
                freshOtpInputs[index + 1].focus();
            }
        });

        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && index > 0 && !e.target.value) {
                freshOtpInputs[index - 1].focus();
            }
            
            // Update combined OTP on any key press
            setTimeout(() => updateCombinedOTP(), 0);
        });
    });
}

// Function to combine OTP inputs into a single value
function updateCombinedOTP() {
    const otpInputs = document.querySelectorAll('.otp-container input');
    let combinedOTP = '';
    
    otpInputs.forEach(input => {
        combinedOTP += input.value || '';
    });
    
    // Update the hidden OTP field (you need to add this to your HTML)
    const otpHidden = document.getElementById('otp_combined');
    if (otpHidden) {
        otpHidden.value = combinedOTP;
    }
}

// Helper function to set hidden email field
function setHiddenEmail() {
    const emailHidden = document.getElementById('email_hidden');
    if (emailHidden && !emailHidden.value) {
        const emailInput = document.getElementById('email');
        if (emailInput && emailInput.value) {
            emailHidden.value = emailInput.value;
            userEmail = emailInput.value;
        } else if (userEmail) {
            emailHidden.value = userEmail;
        }
    }
}

// Real-time password validation
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const requirementsText = document.querySelector('.password-requirements');

if (passwordInput) {
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
        requirementsText.style.color = isValid ? '#00B4B4' : '#FF5252';

        // Validate confirmation when password changes
        if (confirmInput && confirmInput.value.length > 0) {
            validatePasswordMatch();
        }
    });
}

// Password match validation
if (confirmInput) {
    confirmInput.addEventListener('input', validatePasswordMatch);
}

function validatePasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    const confirmBox = confirmInput.closest('.input-box');

    if (confirmPassword.length === 0) return;

    if (password !== confirmPassword) {
        confirmBox.classList.add('error');
    } else {
        confirmBox.classList.remove('error');
    }
}

// Store email when moving between screens
document.getElementById('emailForm').addEventListener('submit', function(e) {
    userEmail = document.getElementById('email').value;
});

// Enhanced notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.classList.remove('show');
        setTimeout(() => existing.remove(), 300);
    }

    // Determine icon based on type
    let icon;
    switch(type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            icon = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
        default:
            icon = 'fas fa-info-circle';
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="${icon} icon"></i>
        <span>${message}</span>
        <span class="close">&times;</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger reflow to enable animation
    void notification.offsetWidth;
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-remove after 5 seconds
    const timer = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Click to dismiss
    notification.querySelector('.close').addEventListener('click', () => {
        clearTimeout(timer);
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Set up form submissions with loading states
function setupFormSubmissions() {
    // Email form submission
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            const button = document.getElementById('emailSubmitBtn');
            const loader = document.getElementById('emailLoader');
            const buttonText = button.querySelector('.button-text');
            
            // Show loading state
            buttonText.style.visibility = 'hidden';
            loader.classList.add('active');
            document.getElementById('formOverlay').classList.add('active');
            
            // Store email
            userEmail = document.getElementById('email').value;
        });
    }
    
    // OTP form submission
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', function(e) {
            // Update combined OTP before validation
            updateCombinedOTP();
            
            // Validate all OTP fields are filled
            const otpInputs = document.querySelectorAll('.otp-container input');
            const otpValues = Array.from(otpInputs).map(input => input.value);
            const emptyFields = otpValues.some(value => value === '');
            
            if (emptyFields || otpValues.join('').length !== 6) {
                e.preventDefault();
                showNotification('Please fill in all OTP digits', 'error');
                return false;
            }
            
            // Ensure hidden email field is set
            setHiddenEmail();
            
            const button = document.getElementById('otpSubmitBtn');
            const loader = document.getElementById('otpLoader');
            const buttonText = button.querySelector('.button-text');
            
            // Show loading state
            buttonText.style.visibility = 'hidden';
            loader.classList.add('active');
            document.getElementById('formOverlay').classList.add('active');
        });
    }
    
    // Registration form submission
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            // Validate password match
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                e.preventDefault();
                showNotification('Passwords do not match', 'error');
                return false;
            }
            
            const button = document.getElementById('registerSubmitBtn');
            const loader = document.getElementById('registerLoader');
            const buttonText = button.querySelector('.button-text');
            
            // Show loading state
            buttonText.style.visibility = 'hidden';
            loader.classList.add('active');
            document.getElementById('formOverlay').classList.add('active');
        });
    }
}