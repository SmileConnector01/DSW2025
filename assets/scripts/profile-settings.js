 document.addEventListener('DOMContentLoaded', function() {
    console.log('main.js loaded and DOMContentLoaded fired');
    // Theme Management
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') || 'system';
    
    // Apply saved theme or system preference
    applyTheme(currentTheme, prefersDarkScheme);
    
    // Theme toggle functionality
    themeToggle?.addEventListener('click', () => toggleTheme(prefersDarkScheme));
    
    // Navigation between settings sections
    setupNavigation();
    
    // Form handling
    setupForms();
    
    // Toggle switches
    setupToggleSwitches();
    
    // Working hours setup
    setupWorkingHours();
    
    // Password visibility toggles
    setupPasswordToggles();
    
    // Theme selection
    setupThemeSelection();
    
    // Color scheme selection
    setupColorSelection();
    
    // Danger zone actions
    setupDangerZone();
});

// Theme Management Functions
function applyTheme(theme, prefersDarkScheme) {
    let themeToApply = theme;
    
    if (theme === 'system') {
        themeToApply = prefersDarkScheme.matches ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', themeToApply);
    localStorage.setItem('theme', theme);
    
    // Update UI to reflect current theme selection
    updateThemeSelectionUI(theme);
}

function toggleTheme(prefersDarkScheme) {
    const currentTheme = localStorage.getItem('theme') || 'system';
    let newTheme;
    
    if (currentTheme === 'light') {
        newTheme = 'dark';
    } else if (currentTheme === 'dark') {
        newTheme = 'system';
    } else {
        newTheme = 'light';
    }
    
    applyTheme(newTheme);
}

function updateThemeSelectionUI(theme) {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === theme) {
            option.classList.add('active');
        }
    });
}

// Navigation Functions
function setupNavigation() {
    const navItems = document.querySelectorAll('.settings-nav li');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            console.log('Navigation item clicked:', this, 'Section ID:', sectionId);
            
            // Remove active class from all nav items and sections
            navItems.forEach(navItem => navItem.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Add active class to clicked nav item and corresponding section
            this.classList.add('active');
            const targetSection = document.getElementById(sectionId);
            console.log('Target section found:', targetSection);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Activate the first section by default
    if (navItems.length > 0) {
        navItems[0].click();
    }
}

// Form Handling
function setupForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            if (!this.checkValidity()) {
                this.reportValidity();
                return;
            }
            
            // Simulate form submission
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Simulate API call
            setTimeout(() => {
                showToast('Settings saved successfully!', 'success');
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }, 1500);
        });
    });
}

// Toggle Switches
function setupToggleSwitches() {
    document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(toggle => {
        // Set initial state from localStorage if available
        const storedState = localStorage.getItem(`toggle_${toggle.id}`);
        if (storedState !== null) {
            toggle.checked = storedState === 'true';
        }
        
        toggle.addEventListener('change', function() {
            localStorage.setItem(`toggle_${this.id}`, this.checked);
            
            // Special handling for specific toggles
            if (this.id === 'twofactor-auth') {
                if (this.checked) {
                    showTwoFactorSetupModal();
                }
            }
        });
    });
}

// Working Hours Setup
function setupWorkingHours() {
    document.querySelectorAll('.day-schedule .toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const timeSlots = this.closest('.day-schedule').querySelector('.time-slots');
            const inputs = timeSlots.querySelectorAll('input');
            
            if (this.checked) {
                timeSlots.classList.remove('disabled');
                inputs.forEach(input => input.disabled = false);
            } else {
                timeSlots.classList.add('disabled');
                inputs.forEach(input => input.disabled = true);
            }
        });
    });
    
    // Save working hours
    const saveHoursBtn = document.querySelector('.save-hours-button');
    if (saveHoursBtn) {
        saveHoursBtn.addEventListener('click', function() {
            const workingHours = {};
            
            document.querySelectorAll('.day-schedule').forEach(day => {
                const dayName = day.querySelector('.day-header span').textContent;
                const isActive = day.querySelector('.toggle-switch input').checked;
                
                if (isActive) {
                    const fromTime = day.querySelector('.time-input:first-child input').value;
                    const toTime = day.querySelector('.time-input:last-child input').value;
                    workingHours[dayName] = { from: fromTime, to: toTime };
                } else {
                    workingHours[dayName] = null;
                }
            });
            
            localStorage.setItem('workingHours', JSON.stringify(workingHours));
            showToast('Working hours saved!', 'success');
        });
    }
}

// Password Visibility Toggles
function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.closest('.password-input').querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
}

// Theme Selection
function setupThemeSelection() {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            applyTheme(theme);
        });
    });
}

// Color Scheme Selection
function setupColorSelection() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            this.classList.add('active');
            const color = this.dataset.color;
            
            // Update CSS variables based on selected color
            updateColorScheme(color);
            localStorage.setItem('colorScheme', color);
        });
        
        // Set initial color scheme
        const savedColor = localStorage.getItem('colorScheme') || 'blue';
        if (option.dataset.color === savedColor) {
            option.click();
        }
    });
}

function updateColorScheme(color) {
    const root = document.documentElement;
    
    switch (color) {
        case 'teal':
            root.style.setProperty('--primary-color', '#4895ef');
            root.style.setProperty('--secondary-color', '#3f37c9');
            break;
        case 'purple':
            root.style.setProperty('--primary-color', '#7209b7');
            root.style.setProperty('--secondary-color', '#560bad');
            break;
        case 'green':
            root.style.setProperty('--primary-color', '#4cc9f0');
            root.style.setProperty('--secondary-color', '#4895ef');
            break;
        default: // blue
            root.style.setProperty('--primary-color', '#4361ee');
            root.style.setProperty('--secondary-color', '#3f37c9');
    }
}

// Danger Zone Actions
function setupDangerZone() {
    // Deactivate account
    const deactivateBtn = document.querySelector('.deactivate-account-button');
    if (deactivateBtn) {
        deactivateBtn.addEventListener('click', function() {
            showConfirmationModal(
                'Deactivate Account',
                'Are you sure you want to temporarily deactivate your account? You can reactivate it by logging in again.',
                'Deactivate',
                'warning',
                () => {
                    // Simulate deactivation
                    showToast('Account deactivated successfully', 'success');
                }
            );
        });
    }
    
    // Delete account
    const deleteBtn = document.querySelector('.delete-account-button');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            showConfirmationModal(
                'Delete Account',
                'This will permanently delete your account and all associated data. This action cannot be undone.',
                'Delete Forever',
                'danger',
                () => {
                    // Simulate account deletion
                    showToast('Account deleted successfully', 'success');
                    // In a real app, you would redirect to a confirmation page or log out
                }
            );
        });
    }
    
    // Export data
    const exportBtn = document.querySelector('.export-data-button');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            showToast('Preparing your data export...', 'info');
            
            // Simulate data export
            setTimeout(() => {
                showToast('Data export ready! Download will start shortly.', 'success');
                
                // In a real app, this would trigger a download
                const link = document.createElement('a');
                link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(
                    JSON.stringify({ message: "This would be your exported data" }, null, 2)
                );
                link.download = 'dentistry-app-data-export.json';
                link.click();
            }, 2000);
        });
    }
}

// UI Helper Functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    });
}

function showConfirmationModal(title, message, confirmText, type, confirmCallback) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="secondary-button modal-cancel">Cancel</button>
                <button class="${type}-button modal-confirm">${confirmText}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close handlers
    const closeModal = () => {
        modal.classList.add('fade-out');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
    
    // Confirm handler
    modal.querySelector('.modal-confirm').addEventListener('click', () => {
        confirmCallback();
        closeModal();
    });
}

function showTwoFactorSetupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Set Up Two-Factor Authentication</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="qrcode-container">
                    <div class="qrcode-placeholder"></div>
                    <p class="text-muted">Scan this QR code with your authenticator app</p>
                </div>
                <div class="verification-code">
                    <label for="2fa-code">Or enter this secret key manually:</label>
                    <div class="secret-key">JBSWY3DPEHPK3PXP</div>
                    <label for="2fa-code">Enter verification code:</label>
                    <input type="text" id="2fa-code" placeholder="6-digit code" maxlength="6">
                </div>
            </div>
            <div class="modal-footer">
                <button class="secondary-button modal-cancel">Cancel</button>
                <button class="primary-button modal-confirm">Verify & Enable</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close handlers
    const closeModal = () => {
        modal.classList.add('fade-out');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
            
            // If modal was closed without verification, turn off the toggle
            const twoFactorToggle = document.getElementById('twofactor-auth');
            if (twoFactorToggle && !twoFactorToggle.dataset.verified) {
                twoFactorToggle.checked = false;
                localStorage.setItem('toggle_twofactor-auth', 'false');
            }
        }, 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
    
    // Confirm handler
    modal.querySelector('.modal-confirm').addEventListener('click', () => {
        const codeInput = modal.querySelector('#2fa-code');
        const code = codeInput.value.trim();
        
        if (code.length !== 6 || !/^\d+$/.test(code)) {
            codeInput.classList.add('error');
            codeInput.focus();
            return;
        }
        
        // Simulate verification
        modal.querySelector('.modal-confirm').disabled = true;
        modal.querySelector('.modal-confirm').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        
        setTimeout(() => {
            document.getElementById('twofactor-auth').dataset.verified = 'true';
            showToast('Two-factor authentication enabled successfully!', 'success');
            closeModal();
        }, 1500);
    });
}

// Add some CSS for the dynamically created elements
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    /* Toast styles */
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 16px;
        background: var(--bg-primary);
        color: var(--text-primary);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 350px;
        z-index: 1000;
        transform: translateY(100px);
        opacity: 0;
        animation: slideIn 0.3s forwards;
        border-left: 4px solid var(--primary-color);
    }
    
    .toast.toast-success {
        border-left-color: var(--success-color);
    }
    
    .toast.toast-danger {
        border-left-color: var(--danger-color);
    }
    
    .toast.toast-warning {
        border-left-color: var(--warning-color);
    }
    
    .toast.toast-info {
        border-left-color: var(--info-color);
    }
    
    .toast.fade-out {
        animation: fadeOut 0.3s forwards;
    }
    
    .toast-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 10px;
    }
    
    @keyframes slideIn {
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        to {
            transform: translateY(100px);
            opacity: 0;
        }
    }
    
    /* Modal styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        animation: fadeIn 0.3s forwards;
    }
    
    .modal-overlay.fade-out {
        animation: fadeOut 0.3s forwards;
    }
    
    .modal {
        background: var(--bg-primary);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        transform: translateY(-50px);
        animation: slideDown 0.3s forwards;
    }
    
    .modal-header {
        padding: var(--spacing-md) var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .modal-header h3 {
        margin: 0;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-secondary);
    }
    
    .modal-body {
        padding: var(--spacing-lg);
    }
    
    .modal-footer {
        padding: var(--spacing-md) var(--spacing-lg);
        border-top: 1px solid var(--border-color);
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-md);
    }
    
    .danger-button {
        background-color: var(--danger-color) !important;
    }
    
    .warning-button {
        background-color: var(--warning-color) !important;
    }
    
    .qrcode-placeholder {
        width: 200px;
        height: 200px;
        margin: 0 auto;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-md);
    }
    
    .secret-key {
        font-family: monospace;
        background: var(--bg-accent);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--border-radius);
        margin: var(--spacing-sm) 0 var(--spacing-md);
        word-break: break-all;
    }
    
    input.error {
        border-color: var(--danger-color) !important;
    }
    
    @keyframes fadeIn {
        to {
            opacity: 1;
        }
    }
    
    @keyframes slideDown {
        to {
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(dynamicStyles);


// Sample data for school programs
let plannedVisitsData = [
  {
    id: 'SV001',
    school: 'Mamelodi Primary School',
    date: '2025-07-15',
    students: 120,
    gradeRange: 'R-7',
    location: 'Mamelodi, Pretoria',
    contact: 'Principal Ndlovu (072 123 4567)',
    status: 'planned'
  },
  {
    id: 'SV002',
    school: 'Diepsloot Combined School',
    date: '2025-07-22',
    students: 85,
    gradeRange: '1-9',
    location: 'Diepsloot, Johannesburg',
    contact: 'Principal Khumalo (083 456 7890)',
    status: 'planned'
  }
];

let completedVisitsData = [
  {
    id: 'SV003',
    school: 'Soweto Elementary',
    date: '2025-06-10',
    students: 150,
    gradeRange: 'R-5',
    location: 'Soweto, Johannesburg',
    contact: 'Principal Mbeki (071 234 5678)',
    status: 'completed',
    screened: 142,
    treatments: 65,
    followUps: 28
  },
  {
    id: 'SV004',
    school: 'Alexandra Primary',
    date: '2025-06-03',
    students: 95,
    gradeRange: 'R-7',
    location: 'Alexandra, Johannesburg',
    contact: 'Principal Dlamini (076 345 6789)',
    status: 'completed',
    screened: 92,
    treatments: 42,
    followUps: 18
  }
];

/**
 * Initializes the School Programs Tab with data
 */
function initSchoolProgramsTab() {
  const plannedVisitsList = document.getElementById('planned-visits-list');
  const completedVisitsList = document.getElementById('completed-visits-list');

  // Render planned visits
  if (plannedVisitsList) {
    plannedVisitsList.innerHTML = plannedVisitsData.map(visit => `
      <div class="school-visit-card" data-id="${visit.id}">
        <div class="school-visit-header">
          <span class="school-name">${visit.school}</span>
          <span class="visit-date">${formatDate(visit.date)}</span>
        </div>
        <span class="status-badge status-${visit.status}">${capitalizeFirst(visit.status)}</span>

        <div class="school-details">
          <div class="detail-item">
            <span class="detail-label">Students</span>
            <span class="detail-value">${visit.students}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Grades</span>
            <span class="detail-value">${visit.gradeRange}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Location</span>
            <span class="detail-value">${visit.location}</span>
          </div>
        </div>

        <div class="school-actions">
          <button class="action-btn secondary-btn">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="action-btn primary-btn">
            <i class="fas fa-calendar-alt"></i> Schedule
          </button>
        </div>
      </div>
    `).join('');
  }

  // Render completed visits
  if (completedVisitsList) {
    completedVisitsList.innerHTML = completedVisitsData.map(visit => `
      <div class="school-visit-card" data-id="${visit.id}">
        <div class="school-visit-header">
          <span class="school-name">${visit.school}</span>
          <span class="visit-date">${formatDate(visit.date)}</span>
        </div>
        <span class="status-badge status-${visit.status}">${capitalizeFirst(visit.status)}</span>

        <div class="school-details">
          <div class="detail-item">
            <span class="detail-label">Screened</span>
            <span class="detail-value">${visit.screened} (${Math.round((visit.screened/visit.students)*100)}%)</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Treatments</span>
            <span class="detail-value">${visit.treatments}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Follow-ups</span>
            <span class="detail-value">${visit.followUps}</span>
          </div>
        </div>

        <div class="school-actions">
          <button class="action-btn secondary-btn">
            <i class="fas fa-file-pdf"></i> Report
          </button>
          <button class="action-btn primary-btn">
            <i class="fas fa-chart-line"></i> Analytics
          </button>
        </div>
      </div>
    `).join('');
  }

  // Initialize demographic charts
  initDemographicsCharts();
}

/**
 * Initialize demographic charts for school programs
 */
function initDemographicsCharts() {
  // Age Distribution Chart
  const ageCanvas = document.getElementById('ageChart');
  if (ageCanvas) {
    // Destroy existing chart if it exists
    const existingAgeChart = Chart.getChart(ageCanvas);
    if (existingAgeChart) {
      existingAgeChart.destroy();
    }
    const ageCtx = ageCanvas.getContext('2d');
    new Chart(ageCtx, {
      type: 'bar',
      data: {
        labels: ['5-7 years', '8-10 years', '11-13 years', '14+ years'],
        datasets: [{
          label: 'Students',
          data: [45, 68, 42, 15],
          backgroundColor: [
            'rgba(90, 128, 255, 0.7)',
            'rgba(49, 92, 188, 0.7)',
            'rgba(0, 119, 255, 0.7)',
            'rgba(255, 242, 53, 0.7)'
          ],
          borderColor: [
            'rgba(90, 128, 255, 1)',
            'rgba(49, 92, 188, 1)',
            'rgba(0, 119, 255, 1)',
            'rgba(255, 242, 53, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Treatment Types Chart
  const treatmentCanvas = document.getElementById('treatmentChart');
  if (treatmentCanvas) {
    // Destroy existing chart if it exists
    const existingTreatmentChart = Chart.getChart(treatmentCanvas);
    if (existingTreatmentChart) {
      existingTreatmentChart.destroy();
    }
    const treatmentCtx = treatmentCanvas.getContext('2d');
    new Chart(treatmentCtx, {
      type: 'doughnut',
      data: {
        labels: ['Preventive', 'Restorative', 'Emergency', 'Education'],
        datasets: [{
          data: [65, 25, 5, 5],
          backgroundColor: [
            'rgba(90, 128, 255, 0.7)',
            'rgba(49, 92, 188, 0.7)',
            'rgba(0, 119, 255, 0.7)',
            'rgba(255, 242, 53, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        cutout: '70%'
      }
    });
  }
}

// Helper function to format dates
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-ZA', options);
}

// Helper function to capitalize first letter
function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add event listeners for school program buttons
function setupSchoolProgramButtonListeners() {
  const plannedVisitsList = document.getElementById('planned-visits-list');
  const completedVisitsList = document.getElementById('completed-visits-list');

  if (plannedVisitsList) {
    plannedVisitsList.addEventListener('click', function(event) {
      const targetButton = event.target.closest('.action-btn');
      if (targetButton) {
        const visitCard = targetButton.closest('.school-visit-card');
        const schoolName = visitCard.querySelector('.school-name').textContent;
        const visitDate = visitCard.querySelector('.visit-date').textContent;

        if (targetButton.classList.contains('secondary-btn')) {
          // Edit button clicked
          const visitId = visitCard.getAttribute('data-id');
          editPlannedVisit(visitId);
        } else if (targetButton.classList.contains('primary-btn')) {
          // Schedule button clicked
          const visitId = visitCard.getAttribute('data-id');
          schedulePlannedVisit(visitId);
        }
      }
    });
  }

  if (completedVisitsList) {
    completedVisitsList.addEventListener('click', function(event) {
      const targetButton = event.target.closest('.action-btn');
      if (targetButton) {
        const visitCard = targetButton.closest('.school-visit-card');
        const schoolName = visitCard.querySelector('.school-name').textContent;
        const visitDate = visitCard.querySelector('.visit-date').textContent;

        if (targetButton.classList.contains('secondary-btn')) {
          // Report button clicked
          generateVisitReport(schoolName, visitDate);
        } else if (targetButton.classList.contains('primary-btn')) {
          // Analytics button clicked
          const visitId = visitCard.getAttribute('data-id');
          viewVisitAnalytics(visitId);
        }
      }
    });
  }
}

// Function to open the edit planned visit modal
function editPlannedVisit(visitId) {
  const visit = plannedVisitsData.find(v => v.id === visitId);
  const editModal = document.getElementById('editPlannedVisitModal');
  const editForm = document.getElementById('editPlannedVisitForm');

  if (visit && editModal && editForm) {
    // Populate the form fields
    document.getElementById('editVisitId').value = visit.id;
    document.getElementById('editVisitSchool').value = visit.school;
    document.getElementById('editVisitDate').value = visit.date; // Assuming date is in YYYY-MM-DD format
    document.getElementById('editVisitStudents').value = visit.students;
    document.getElementById('editVisitGradeRange').value = visit.gradeRange;
    document.getElementById('editVisitLocation').value = visit.location;

    // Open the modal
    openModal(editModal);
  } else {
    console.error(`Planned visit with ID ${visitId} not found or modal elements missing.`);
    alert('Error: Could not load visit details for editing.');
  }
}

// Function to save planned visit edits
function savePlannedVisitEdit(event) {
  event.preventDefault();
  console.log('savePlannedVisitEdit function called');

  const editForm = document.getElementById('editPlannedVisitForm');
  const visitId = editForm.elements['id'].value;
  console.log('Visit ID from form:', visitId);
  const visit = plannedVisitsData.find(v => v.id === visitId);

  if (visit) {
    console.log('Found visit:', visit);
    // Update visit data with form values
    visit.school = editForm.elements['school'].value;
    visit.date = editForm.elements['date'].value; // Assuming date is in YYYY-MM-DD format
    visit.students = parseInt(editForm.elements['students'].value);
    visit.gradeRange = editForm.elements['gradeRange'].value;
    visit.location = editForm.elements['location'].value;

    console.log('Updated visit data:', visit);

    // Re-render the planned visits list to show changes
    initSchoolProgramsTab(); // This will re-render both lists, which is fine for this example
    console.log('initSchoolProgramsTab called after save');

    // Close the modal
    const editModal = document.getElementById('editPlannedVisitModal');
    closeModal(editModal);

    console.log(`Saved changes for planned visit ID: ${visitId}`);
    alert('Planned visit updated successfully!');
  } else {
    console.error(`Planned visit with ID ${visitId} not found for saving.`);
    alert('Error: Could not save changes.');
  }
}


// Function to open the schedule planned visit modal
function schedulePlannedVisit(visitId) {
  const visit = plannedVisitsData.find(v => v.id === visitId);
  const scheduleModal = document.getElementById('schedulePlannedVisitModal');
  const scheduleForm = document.getElementById('schedulePlannedVisitForm');

  if (visit && scheduleModal && scheduleForm) {
    // Populate the form fields
    document.getElementById('scheduleVisitId').value = visit.id;
    document.getElementById('scheduleVisitSchool').value = visit.school;
    document.getElementById('scheduleVisitDate').value = visit.date; // Populate with current date

    // Open the modal
    openModal(scheduleModal);
  } else {
    console.error(`Planned visit with ID ${visitId} not found or schedule modal elements missing.`);
    alert('Error: Could not load visit details for scheduling.');
  }
}

// Function to save planned visit schedule
function savePlannedVisitSchedule(event) {
  event.preventDefault();
  console.log('savePlannedVisitSchedule function called');

  const scheduleForm = document.getElementById('schedulePlannedVisitForm');
  const visitId = scheduleForm.elements['id'].value;
  console.log('Visit ID from schedule form:', visitId);
  const visit = plannedVisitsData.find(v => v.id === visitId);

  if (visit) {
    console.log('Found visit for scheduling:', visit);
    // Update visit date with form value
    visit.date = scheduleForm.elements['date'].value; // Assuming date is in YYYY-MM-DD format

    console.log('Updated visit date:', visit.date);

    // Re-render the planned visits list to show changes
    initSchoolProgramsTab(); // This will re-render both lists

    // Close the modal
    const scheduleModal = document.getElementById('schedulePlannedVisitModal');
    closeModal(scheduleModal);

    console.log(`Scheduled visit for ID: ${visitId} to date: ${visit.date}`);
    alert(`Planned visit scheduled successfully for ${visit.date}!`);
  } else {
    console.error(`Planned visit with ID ${visitId} not found for scheduling.`);
    alert('Error: Could not schedule visit.');
  }
}


// Placeholder functions for other button actions
function generateVisitReport(schoolName, visitDate) {
  console.log(`Generating report for completed visit at ${schoolName} on ${visitDate}`);
  // Add actual report generation logic here
  alert(`Generating report for completed visit at ${schoolName} on ${visitDate}`);
}

// Function to open the completed visit analytics modal
function viewVisitAnalytics(visitId) {
  const visit = completedVisitsData.find(v => v.id === visitId);
  const analyticsModal = document.getElementById('completedVisitAnalyticsModal');

  if (visit && analyticsModal) {
    // Populate the modal fields
    document.getElementById('analyticsSchoolName').textContent = visit.school;
    document.getElementById('analyticsVisitDate').textContent = `Visit Date: ${formatDate(visit.date)}`;
    document.getElementById('analyticsScreened').textContent = `${visit.screened} (${Math.round((visit.screened/visit.students)*100)}%)`;
    document.getElementById('analyticsTreatments').textContent = visit.treatments;
    document.getElementById('analyticsFollowUps').textContent = visit.followUps;

    // Open the modal
    openModal(analyticsModal);
  } else {
    console.error(`Completed visit with ID ${visitId} not found or analytics modal elements missing.`);
    alert('Error: Could not load analytics for this visit.');
  }
}

// Setup event listeners for the edit planned visit modal
function setupEditPlannedVisitModalListeners() {
  console.log('Setting up listeners for edit planned visit modal using delegation');
  const editModal = document.getElementById('editPlannedVisitModal');
  const editForm = document.getElementById('editPlannedVisitForm');

  if (editModal) {
    // Use event delegation for close and cancel buttons
    editModal.addEventListener('click', function(event) {
      const target = event.target;
      if (target.classList.contains('close-modal') || target.classList.contains('cancel-btn')) {
        console.log('Delegated Close/Cancel button clicked');
        closeModal(editModal);
      }
    });
  }


  // Form submission listener
  if (editForm) {
    editForm.addEventListener('submit', savePlannedVisitEdit);
  }
}

// Setup event listeners for the schedule planned visit modal
function setupSchedulePlannedVisitModalListeners() {
  console.log('Setting up listeners for schedule planned visit modal using delegation');
  const scheduleModal = document.getElementById('schedulePlannedVisitModal');
  const scheduleForm = document.getElementById('schedulePlannedVisitForm');

  if (scheduleModal) {
    // Use event delegation for close and cancel buttons
    scheduleModal.addEventListener('click', function(event) {
      const target = event.target;
      if (target.classList.contains('close-modal') || target.classList.contains('cancel-btn')) {
        console.log('Delegated Schedule Modal Close/Cancel button clicked');
        closeModal(scheduleModal);
      }
    });
  }

  // Form submission listener
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', savePlannedVisitSchedule);
  }
}

// Setup event listeners for the completed visit analytics modal
function setupCompletedVisitAnalyticsModalListeners() {
  console.log('Setting up listeners for completed visit analytics modal');
  const analyticsModal = document.getElementById('completedVisitAnalyticsModal');
  const closeButtonFooter = analyticsModal ? analyticsModal.querySelector('.modal-footer .close-modal') : null;

  if (analyticsModal) {
    // Use event delegation for close button (covers the X button in header)
    analyticsModal.addEventListener('click', function(event) {
      const target = event.target;
      console.log('Delegated click event target in analytics modal:', target);
      if (target.classList.contains('close-modal')) {
        console.log('Delegated Analytics Modal Close button clicked');
        closeModal(analyticsModal);
      }
    });
  }

  // Add direct listener to the "Close" button in the footer
  if (closeButtonFooter) {
    console.log('Attaching direct listener to footer close button');
    closeButtonFooter.addEventListener('click', function(event) {
      console.log('Direct footer close button clicked');
      closeModal(analyticsModal);
    });
  }
}

// Helper functions for modals (assuming these exist elsewhere in your script)
function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
        // Optional: Add a class to body to prevent scrolling
        document.body.classList.add('modal-open');
        // Ensure display is not 'none' if it was set by closeModal
        modal.style.display = 'block';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        // Optional: Remove the class from body
        document.body.classList.remove('modal-open');
         // Optional: Set display to 'none' after transition for accessibility/screen readers
         // This might require a slight delay if you have CSS transitions
         setTimeout(() => {
             if (!modal.classList.contains('active')) { // Check if it's still not active
                 modal.style.display = 'none';
             }
         }, 300); // Adjust delay to match your CSS transition duration
    }
}

// Ensure these setup functions are called when the DOM is ready and the schools tab is initialized
// This part should be integrated into your main DOMContentLoaded listener or tab switching logic
// Example:

document.addEventListener('DOMContentLoaded', function() {
  // ... other initializations ...

  // Initialize school programs tab if it exists
  if (document.getElementById('schools')) {
      initSchoolProgramsTab();
      setupSchoolProgramButtonListeners();
      setupEditPlannedVisitModalListeners();
      setupSchedulePlannedVisitModalListeners();
      setupCompletedVisitAnalyticsModalListeners();
  }

  // ... other initializations ...
});

document.addEventListener('DOMContentLoaded', function() {
  // Initialize analytics tab if it exists
  if (document.getElementById('analytics')) {
      initAnalyticsTab();
  }
  // Setup listeners for the completed visit analytics modal
  setupCompletedVisitAnalyticsModalListeners();
});

/**
 * Initialize the Analytics Tab with modern activity log
 */
function initAnalyticsTab() {
  // Initialize charts
  initRecentActivitiesChart();

  // Initialize activity log
  initActivityLog();

  // Set up event listeners
  setupActivityLogControls();
}

/**
 * Initialize Recent Activities Chart
 */
function initRecentActivitiesChart() {
  const canvas = document.getElementById('recentActivitiesChart');
  if (!canvas) return; // Ensure canvas exists

  // Destroy existing chart if it exists
  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [
        {
          label: 'Patient Records',
          data: [12, 19, 8, 15, 12, 3],
          backgroundColor: 'rgba(90, 128, 255, 0.7)',
          borderRadius: 4
        },
        {
          label: 'School Visits',
          data: [8, 10, 5, 12, 8, 2],
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderRadius: 4
        },
        {
          label: 'Mobile Clinics',
          data: [5, 7, 4, 6, 10, 1],
          backgroundColor: 'rgba(255, 152, 0, 0.7)',
          borderRadius: 4
        },
        {
          label: 'Tele-Dentistry',
          data: [7, 11, 6, 9, 5, 0],
          backgroundColor: 'rgba(156, 39, 176, 0.7)',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#e1e5eb'
          }
        }
      }
    }
  });
}

/**
 * Initialize Activity Log with sample data
 */
function initActivityLog() {
  const activityLog = document.querySelector('.activity-timeline');
  if (!activityLog) return;

  // Sample activity data
  const activities = [
    {
      id: 1,
      type: 'patient',
      icon: 'fas fa-user-plus',
      time: '2025-06-15 10:05:23',
      message: 'New patient registered: Thabo Mokoena (ID: P001)',
      user: 'Dr. Ndlovu'
    },
    {
      id: 2,
      type: 'school',
      icon: 'fas fa-school',
      time: '2025-06-15 09:30:45',
      message: 'Completed dental screening at Mamelodi Primary School (142 students screened)',
      user: 'Nurse Khumalo'
    },
    {
      id: 3,
      type: 'tele',
      icon: 'fas fa-video',
      time: '2025-06-14 14:15:12',
      message: 'Tele-dentistry consultation completed with patient P003',
      user: 'Dr. Smith'
    },
    {
      id: 4,
      type: 'clinic',
      icon: 'fas fa-clinic-medical',
      time: '2025-06-14 11:45:33',
      message: 'Mobile clinic deployed to Alexandra Township (85 patients treated)',
      user: 'Clinic Team'
    },
    {
      id: 5,
      type: 'patient',
      icon: 'fas fa-file-medical',
      time: '2025-06-13 16:20:18',
      message: 'Updated treatment plan for patient P002 (Fluoride treatment scheduled)',
      user: 'Dr. Ndlovu'
    },
    {
      id: 6,
      type: 'school',
      icon: 'fas fa-chalkboard-teacher',
      time: '2025-06-13 10:00:00',
      message: 'Oral health education workshop at Diepsloot Primary School',
      user: 'Education Team'
    },
    {
      id: 7,
      type: 'patient',
      icon: 'fas fa-tooth',
      time: '2025-06-12 13:45:22',
      message: 'Completed dental treatment for patient P004 (2 fillings)',
      user: 'Dr. Smith'
    },
    {
      id: 8,
      type: 'tele',
      icon: 'fas fa-comment-medical',
      time: '2025-06-12 09:15:37',
      message: 'Follow-up tele-consultation with patient P001\'s guardian',
      user: 'Nurse Khumalo'
    },
    {
      id: 9,
      type: 'clinic',
      icon: 'fas fa-ambulance',
      time: '2025-06-11 15:30:10',
      message: 'Restocked mobile clinic supplies (dental materials and medications)',
      user: 'Logistics Team'
    },
    {
      id: 10,
      type: 'patient',
      icon: 'fas fa-file-pdf',
      time: '2025-06-11 08:45:05',
      message: 'Generated patient report for P005',
      user: 'Admin'
    }
  ];

  // Clear existing activities
  activityLog.innerHTML = '';

  // Add activities to the timeline
  activities.forEach((activity, index) => {
    const activityElement = document.createElement('div');
    activityElement.className = 'activity-item-modern';
    activityElement.dataset.type = activity.type;
    activityElement.style.animationDelay = `${index * 0.1}s`;

    const formattedTime = formatActivityTime(activity.time);

    activityElement.innerHTML = `
      <div class="activity-card">
        <div class="activity-icon-container">
          <i class="${activity.icon}"></i>
        </div>
        <div class="activity-details">
          <div class="activity-time">
            <i class="fas fa-clock"></i> ${formattedTime}
          </div>
          <p class="activity-message">${activity.message}</p>
          <div class="activity-user">
            <i class="fas fa-user-circle"></i> ${activity.user}
          </div>
        </div>
      </div>
    `;

    activityLog.appendChild(activityElement);
  });
}

/**
 * Format activity time for display
 */
function formatActivityTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  // If today, show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // If yesterday, show "Yesterday"
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Otherwise show full date
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Set up activity log controls and event listeners
 */
function setupActivityLogControls() {
  const filter = document.querySelector('.activity-log-filter');
  const refreshBtn = document.querySelector('.refresh-btn');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (filter) {
    filter.addEventListener('change', function() {
      const filterValue = this.value;
      filterActivities(filterValue);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      // In a real app, this would fetch fresh data
      console.log('Refreshing activity log...');
      initActivityLog();
    });
  }

  if (prevBtn && nextBtn) {
    let currentPage = 1;
    const totalPages = 5; // This would come from your data

    prevBtn.addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        updatePagination(currentPage, totalPages);
        // Here you would load the previous page's data
      }
    });

    nextBtn.addEventListener('click', function() {
      if (currentPage < totalPages) {
        currentPage++;
        updatePagination(currentPage, totalPages);
        // Here you would load the next page's data
      }
    });

    // Initialize pagination
    updatePagination(currentPage, totalPages);
  }
}

/**
 * Filter activities by type
 */
function filterActivities(type) {
  const activities = document.querySelectorAll('.activity-item-modern');

  activities.forEach(activity => {
    if (type === 'all' || activity.dataset.type === type) {
      activity.style.display = 'block';
    } else {
      activity.style.display = 'none';
    }
  });
}

/**
 * Update pagination controls
 */
function updatePagination(currentPage, totalPages) {
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const pageIndicator = document.querySelector('.page-indicator');

  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  if (pageIndicator) pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Function to open a modal dialog (copied from dashboard.js)
function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

// Function to close a modal dialog (copied from dashboard.js)
function closeModal(modal) {
    console.log('closeModal function called for modal:', modal ? modal.id : 'null');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    // Explicitly set display to none to ensure it hides
    modal.style.display = 'none';
}

// Sample data for completed visits (needed for viewVisitAnalytics)
letcompletedVisitsData = [
  {
    id: 'SV003',
    school: 'Soweto Elementary',
    date: '2025-06-10',
    students: 150,
    gradeRange: 'R-5',
    location: 'Soweto, Johannesburg',
    contact: 'Principal Mbeki (071 234 5678)',
    status: 'completed',
    screened: 142,
    treatments: 65,
    followUps: 28
  },
  {
    id: 'SV004',
    school: 'Alexandra Primary',
    date: '2025-06-03',
    students: 95,
    gradeRange: 'R-7',
    location: 'Alexandra, Johannesburg',
    contact: 'Principal Dlamini (076 345 6789)',
    status: 'completed',
    screened: 92,
    treatments: 42,
    followUps: 18
  }
];

// Helper function to format dates (copied from dashboard.js)
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-ZA', options);
}

// Function to open the completed visit analytics modal (copied from dashboard.js)
function viewVisitAnalytics(visitId) {
  const visit = completedVisitsData.find(v => v.id === visitId);
  const analyticsModal = document.getElementById('completedVisitAnalyticsModal');

  if (visit && analyticsModal) {
    // Populate the modal fields
    document.getElementById('analyticsSchoolName').textContent = visit.school;
    document.getElementById('analyticsVisitDate').textContent = `Visit Date: ${formatDate(visit.date)}`;
    document.getElementById('analyticsScreened').textContent = `${visit.screened} (${Math.round((visit.screened/visit.students)*100)}%)`;
    document.getElementById('analyticsTreatments').textContent = visit.treatments;
    document.getElementById('analyticsFollowUps').textContent = visit.followUps;

    // Open the modal
    openModal(analyticsModal);
  } else {
    console.error(`Completed visit with ID ${visitId} not found or analytics modal elements missing.`);
    alert('Error: Could not load analytics for this visit.');
  }
}

// Setup event listeners for the completed visit analytics modal (copied from dashboard.js)
function setupCompletedVisitAnalyticsModalListeners() {
  console.log('Setting up listeners for completed visit analytics modal');
  const analyticsModal = document.getElementById('completedVisitAnalyticsModal');
  const closeButtonFooter = analyticsModal ? analyticsModal.querySelector('.modal-footer .close-modal') : null;

  if (analyticsModal) {
    // Use event delegation for close button (covers the X button in header)
    analyticsModal.addEventListener('click', function(event) {
      const target = event.target;
      console.log('Delegated click event target in analytics modal:', target);
      if (target.classList.contains('close-modal')) {
        console.log('Delegated Analytics Modal Close button clicked');
        closeModal(analyticsModal);
      }
    });
  }

  // Add direct listener to the "Close" button in the footer
  if (closeButtonFooter) {
    console.log('Attaching direct listener to footer close button');
    closeButtonFooter.addEventListener('click', function(event) {
      console.log('Direct footer close button clicked');
      closeModal(analyticsModal);
    });
  }
  // Toggle dark mode
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        // Save preference to localStorage if needed
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    // Check for saved preference on load
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

