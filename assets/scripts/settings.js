
document.addEventListener('DOMContentLoaded', function() {
    // Settings Tabs Functionality with logging
    const settingsContainer = document.querySelector('.settings-container');
    if (settingsContainer) {
        settingsContainer.addEventListener('click', function(e) {
            const tabBtn = e.target.closest('.settings-tab-btn');
            if (!tabBtn) return;

            e.preventDefault();

            // Get tab and content IDs
            const tabId = tabBtn.dataset.tab;
            console.log('Settings Tab Clicked:', tabId); // Log tab click
            if (!tabId) return;

            // Update active tab
            const tabs = settingsContainer.querySelectorAll('.settings-tab-btn');
            tabs.forEach(tab => tab.classList.remove('active'));
            tabBtn.classList.add('active');
            console.log('Active tab updated to:', tabId); // Log active tab change

            // Update active content
            const contents = settingsContainer.querySelectorAll('.settings-tab-content');
            console.log('Found settings content sections:', contents.length); // Log number of content sections
            contents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none'; // Explicitly hide all content sections

                if (content.id === tabId) {
                    content.classList.add('active');
                    content.style.display = 'block'; // Explicitly show the active content section
                    console.log('Activated content section:', content.id, 'Display:', content.style.display); // Log activated content and display style
                } else {
                     console.log('Deactivated content section:', content.id, 'Display:', content.style.display); // Log deactivated content and display style
                }
            });
        });
    }

    // Password strength indicator
    document.getElementById('newPassword')?.addEventListener('input', function() {
      const password = this.value;
      const strengthBar = document.querySelector('.strength-bar');
      const strengthText = document.querySelector('.strength-text');
      
      // Reset
      strengthBar.style.width = '0%';
      strengthBar.style.backgroundColor = '#dc3545';
      strengthText.textContent = 'Password strength';
      
      if (password.length === 0) return;
      
      // Calculate strength
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/\d/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      
      // Update UI
      strengthBar.style.width = strength + '%';
      
      if (strength < 50) {
        strengthBar.style.backgroundColor = '#dc3545';
        strengthText.textContent = 'Weak password';
      } else if (strength < 75) {
        strengthBar.style.backgroundColor = '#ffc107';
        strengthText.textContent = 'Moderate password';
      } else {
        strengthBar.style.backgroundColor = '#28a745';
        strengthText.textContent = 'Strong password';
      }
    });

    // Password match checker
    document.getElementById('confirmPassword')?.addEventListener('input', function() {
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = this.value;
      const matchElement = document.getElementById('passwordMatch');
      
      if (confirmPassword.length === 0) {
        matchElement.style.display = 'none';
        return;
      }
      
      matchElement.style.display = 'block';
      
      if (newPassword === confirmPassword) {
        matchElement.textContent = 'Passwords match';
        matchElement.style.color = '#28a745';
      } else {
        matchElement.textContent = 'Passwords do not match';
        matchElement.style.color = '#dc3545';
      }
    });

    // Form submission handlers
    document.getElementById('profileForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      showSuccessAlert('Profile updated successfully!');
    });

    document.getElementById('oralHealthForm')?.addEventListener('submit', function(e) {
      e.preventDefault();

      // Collect data from Oral Health form
      const lastDentalVisit = document.getElementById('lastDentalVisit').value;
      const oralHealthConcerns = Array.from(document.querySelectorAll('#oralHealthForm input[name="oralHealthConcerns"]:checked')).map(cb => cb.value);
      const brushingFrequency = document.getElementById('brushingFrequency').value;
      const flossingFrequency = document.getElementById('flossingFrequency').value;
      const dentalHistory = document.getElementById('dentalHistory').value;

      const oralHealthData = {
        lastDentalVisit,
        oralHealthConcerns,
        brushingFrequency,
        flossingFrequency,
        dentalHistory
      };

      console.log('Oral Health Settings Saved:', oralHealthData);
      // In a real application, this data would be sent to a backend API

      showSuccessAlert('Oral health information saved!');
    });

    document.getElementById('securityForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const twoFactorAuth = document.getElementById('twoFactorAuth').checked;

      if (newPassword !== confirmPassword) {
        showErrorAlert('Passwords do not match!');
        return;
      }

      // Simulate password validation (basic check)
      if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
          showErrorAlert('New password does not meet complexity requirements.');
          return;
      }

      const securityData = {
          currentPassword,
          newPassword,
          twoFactorAuth
      };

      console.log('Security Settings Updated:', securityData);
      // In a real application, this data would be sent to a backend API for password change and 2FA setting

      showSuccessAlert('Security settings updated successfully!');
      this.reset();
    });

    document.getElementById('notificationsForm')?.addEventListener('submit', function(e) {
      e.preventDefault();

      // Collect data from Notifications form
      const emailApptReminders = document.getElementById('emailApptReminders').checked;
      const smsApptReminders = document.getElementById('smsApptReminders').checked;
      const weeklyTips = document.getElementById('weeklyTips').checked;
      const seasonalTips = document.getElementById('seasonalTips').checked;
      const schoolPrograms = document.getElementById('schoolPrograms').checked;
      const communityEvents = document.getElementById('communityEvents').checked;

      const notificationData = {
        emailApptReminders,
        smsApptReminders,
        weeklyTips,
        seasonalTips,
        schoolPrograms,
        communityEvents
      };

      console.log('Notification Preferences Saved:', notificationData);
      // In a real application, this data would be sent to a backend API

      showSuccessAlert('Notification preferences saved!');
    });

    document.getElementById('communityForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      showSuccessAlert('Community settings updated!');
    });

    // Cancel buttons
    document.getElementById('cancelProfileChanges')?.addEventListener('click', function() {
      document.getElementById('profileForm').reset();
    });

    document.getElementById('cancelOralHealthChanges')?.addEventListener('click', function() {
      document.getElementById('oralHealthForm').reset();
    });

    document.getElementById('cancelSecurityChanges')?.addEventListener('click', function() {
      document.getElementById('securityForm').reset();
    });

    document.getElementById('cancelNotificationChanges')?.addEventListener('click', function() {
      document.getElementById('notificationsForm').reset();
    });

    document.getElementById('cancelCommunityChanges')?.addEventListener('click', function() {
      document.getElementById('communityForm').reset();
    });

    // Helper functions
    function showSuccessAlert(message) {
      const alert = document.createElement('div');
      alert.className = 'sc-alert success';
      alert.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
      `;
      document.body.appendChild(alert);
      
      setTimeout(() => {
        alert.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
          alert.remove();
        }, 300);
      }, 3000);
    }

    function showErrorAlert(message) {
      const alert = document.createElement('div');
      alert.className = 'sc-alert error';
      alert.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
      `;
      document.body.appendChild(alert);
      
      setTimeout(() => {
        alert.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
          alert.remove();
        }, 300);
      }, 3000);
    }
});