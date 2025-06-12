document.addEventListener('DOMContentLoaded', function() {

    // Initialize all patient management functionality
    initPatientManagement();
    loadPatientTable();

    // Add patient button
    const addPatientBtn = document.getElementById('addPatientBtn');
    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', () => {
            document.getElementById('patientModalTitle').textContent = 'Add New Patient';
            document.getElementById('patientFormModal').classList.add('active');
        });
    }

    // File preview for patient records (works for both add and edit modals)
    const patientRecordsInput = document.getElementById('patientRecords');
    const filesPreview = document.getElementById('uploadedFilesPreview');

    if (patientRecordsInput && filesPreview) {
        patientRecordsInput.addEventListener('change', function() {
            filesPreview.innerHTML = ''; // Clear previous preview

            if (this.files && this.files.length > 0) {
                Array.from(this.files).forEach(file => {
                    const fileDiv = document.createElement('div');
                    fileDiv.className = 'file-preview';
                    fileDiv.textContent = file.name;
                    filesPreview.appendChild(fileDiv);
                });
            } else {
                filesPreview.innerHTML = '<p class="file-info">No files selected</p>';
            }
        });
    }

    const birthdateInput = document.getElementById('patientBirthdate');
    const today = new Date();

    // Prevent future dates
    birthdateInput.max = today.toISOString().split('T')[0];

    let patientAge = null;

    function calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        }
        return age;
    }

    function validateBirthdate(input) {
        if (!input.value) {
        input.style.border = '';
        patientAge = null;
        return;
        }

        const selectedDate = new Date(input.value);
        const age = calculateAge(selectedDate);
        const isValid = age >= 0 && age <= 15;

        input.style.border = isValid ? '2px solid #4CAF50' : '2px solid #f44336';
        patientAge = isValid ? age : null;

        console.log('Patient age:', patientAge);
    }

    birthdateInput.addEventListener('input', function () {
        validateBirthdate(this);
    });

    birthdateInput.addEventListener('change', function () {
        validateBirthdate(this);
    });

    validateBirthdate(birthdateInput);


    // Unified form submission handler with loading spinner
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitButton = this.querySelector('.save-btn') || 
                            document.querySelector('.save-btn[form="' + this.id + '"]');
            
            // Store original button text and show spinner
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitButton.disabled = true;
            
            // Debugging: Log form data before submission
            console.log('Form submission data:', Object.fromEntries(formData.entries()));
            
            fetch(this.action, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                 // First get the raw text
                return response.text().then(text => {
                    try {
                        // Try to parse as JSON
                        return JSON.parse(text);
                    } catch (e) {
                        // If parsing fails, check if it's a valid JSON string inside the text
                        const jsonMatch = text.match(/\{.*\}/s);
                        if (jsonMatch) {
                            try {
                                return JSON.parse(jsonMatch[0]);
                            } catch (e) {
                                throw new Error('Invalid JSON: ' + text);
                            }
                        }
                        throw new Error('Invalid response: ' + text);
                    }
                });
            })
            .then(data => {
                if (data.success) {
                showNotification(data.message, 'success');
                this.reset();
                
                // Close modal on success
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }

                // Only refresh the specific table that was affected
                if (this.id === 'adminForm') {
                    loadAdminTable();
                } else if (this.id === 'patientForm') {
                    loadPatientTable();
                }
            } else {
                showNotification(data.message || 'Operation failed', 'error');
            }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred. Please try again.', 'error');
            })
            .finally(() => {
                // Restore button state
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            });
        });
    });
   
    // Settings tabs navigation - modified version
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsContents = document.querySelectorAll('.settings-content');
    const settingsPane = document.getElementById('settings');

    // Update your tab switching code to ensure active class is properly toggled
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
        // Remove active class from all tabs
        settingsTabs.forEach(t => {
            t.classList.remove('active');
            // Remove any existing indicator
            t.style.removeProperty('border-bottom');
        });
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        const tabId = this.getAttribute('data-tab');
        
        // Hide all settings contents
        settingsContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show corresponding content
        document.getElementById(`${tabId}-settings`).classList.add('active');
        });
    });
    
    // Password policy details
    const passwordPolicy = document.getElementById('passwordPolicy');
    const policyDetails = document.getElementById('policyDetails');
    
    if (passwordPolicy && policyDetails) {
        passwordPolicy.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            policyDetails.textContent = selectedOption.getAttribute('data-details');
        });
    }
    
    // Toggle 2FA settings
    const enable2FA = document.getElementById('enable2FA');
    const twoFASettings = document.getElementById('2faSettings');
    
    if (enable2FA && twoFASettings) {
        enable2FA.addEventListener('change', function() {
            twoFASettings.style.display = this.checked ? 'flex' : 'none';
        });
    }
    
    // Toggle SMS settings
    const enableSMS = document.getElementById('enableSMS');
    const smsSettings = document.getElementById('smsSettings');
    
    if (enableSMS && smsSettings) {
        enableSMS.addEventListener('change', function() {
            smsSettings.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    // Email provider change
    const emailProvider = document.getElementById('emailProvider');
    const smtpSettings = document.getElementById('smtpSettings');
    
    if (emailProvider && smtpSettings) {
        emailProvider.addEventListener('change', function() {
            smtpSettings.style.display = this.value === 'smtp' ? 'block' : 'none';
        });
    }
    
    // Logo preview
    const systemLogo = document.getElementById('systemLogo');
    const logoPreview = document.getElementById('logoPreview');
    const currentLogo = document.getElementById('currentLogo');
    
    if (systemLogo && logoPreview && currentLogo) {
        systemLogo.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentLogo.src = event.target.result;
                    currentLogo.style.display = 'block';
                    document.getElementById('logoPlaceholder').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Range input sync
    const sessionTimeoutRange = document.getElementById('sessionTimeoutRange');
    const sessionTimeout = document.getElementById('sessionTimeout');
    
    if (sessionTimeoutRange && sessionTimeout) {
        sessionTimeoutRange.addEventListener('input', function() {
            sessionTimeout.value = this.value;
        });
        
        sessionTimeout.addEventListener('input', function() {
            sessionTimeoutRange.value = this.value;
        });
    }
    
    // Save settings buttons
    document.querySelectorAll('[id^="save"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const settingsType = this.id.replace('save', '').replace('Settings', '').toLowerCase();
            saveSettings(settingsType);
        });
    });
    // Initialize timezone dropdown (in a real app, you would populate with all timezones)
    const timezoneSelect = document.getElementById('timezone');
    if (timezoneSelect) {
        // This is just a sample - in production you would use a proper timezone library
        const additionalTimezones = [
            'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
            'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'
        ];
        
        additionalTimezones.forEach(tz => {
            const option = document.createElement('option');
            option.value = tz;
            option.textContent = tz;
            timezoneSelect.appendChild(option);
        });
    }

    // Sample popup
    const samplePopup = {
        id: 1,
        type: 'popup',
        title: 'System Maintenance Scheduled',
        content: 'We will be performing system maintenance on Saturday from 2-4 AM. The system may be unavailable during this time.',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isPopup: true,
        requireAck: true,
        isActive: true
    };
    
    // Sample news
    const sampleNews = {
        id: 2,
        type: 'news',
        title: 'New Feature Released: Advanced Reporting',
        content: 'We are excited to announce our new advanced reporting feature that gives you more insights into your data.',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        category: 'updates',
        isActive: true
    };
    
    // Add to lists (in a real app, you would load from server)
    setTimeout(() => {
        addPopupToList(samplePopup);
        addNewsToList(sampleNews);
    }, 500);

    // Rest of your existing initialization code...
    // (Keep all your existing admin, settings, etc. code here)
});
// Add to the existing main.js

// Announcements functionality
const announcementModal = document.getElementById('announcementModal');
const createPopupBtn = document.getElementById('createPopupBtn');
const createNewsBtn = document.getElementById('createNewsBtn');
const saveAnnouncementBtn = document.getElementById('saveAnnouncement');
const modalCancelBtns = document.querySelectorAll('.modal-cancel, .modal-close');
const popupSettings = document.getElementById('popupSettings');
const newsSettings = document.getElementById('newsSettings');
let currentAnnouncementType = 'popup';

// Open modal for popup creation
if (createPopupBtn) {
    createPopupBtn.addEventListener('click', function() {
        currentAnnouncementType = 'popup';
        document.getElementById('modalTitle').textContent = 'Create Login Popup Message';
        popupSettings.style.display = 'block';
        newsSettings.style.display = 'none';
        resetAnnouncementForm();
        announcementModal.classList.add('show');
    });
}

// Open modal for news creation
if (createNewsBtn) {
    createNewsBtn.addEventListener('click', function() {
        currentAnnouncementType = 'news';
        document.getElementById('modalTitle').textContent = 'Create News Post';
        popupSettings.style.display = 'none';
        newsSettings.style.display = 'block';
        resetAnnouncementForm();
        announcementModal.classList.add('show');
    });
}

// Close modal
modalCancelBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        announcementModal.classList.remove('show');
    });
});

// Save announcement
if (saveAnnouncementBtn) {
    saveAnnouncementBtn.addEventListener('click', function() {
        const title = document.getElementById('announcementTitle').value;
        const content = document.getElementById('announcementContent').value;
        const startDate = document.getElementById('announcementStart').value;
        const endDate = document.getElementById('announcementEnd').value;
        
        if (!title || !content) {
            showNotification('Title and content are required', 'error');
            return;
        }
        
        const announcement = {
            id: Date.now(),
            type: currentAnnouncementType,
            title,
            content,
            startDate,
            endDate,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        if (currentAnnouncementType === 'popup') {
            announcement.isPopup = document.getElementById('isPopup').checked;
            announcement.requireAck = document.getElementById('requireAck').checked;
            addPopupToList(announcement);
        } else {
            announcement.category = document.getElementById('newsCategory').value;
            addNewsToList(announcement);
        }
        
        // In a real app, you would save to server here
        console.log('Saving announcement:', announcement);
        showNotification('Announcement saved successfully', 'success');
        announcementModal.classList.remove('show');
    });
}
function saveSettings(type) {
    // In a real app, you would collect the form data and send to server
    console.log(`Saving ${type} settings...`);
    showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} settings saved successfully`, 'success');
}

// Add popup to list
function addPopupToList(announcement) {
    const popupList = document.getElementById('popupList');
    
    // Remove empty state if it exists
    const emptyState = popupList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    const popupItem = document.createElement('div');
    popupItem.className = 'announcement-item';
    popupItem.innerHTML = `
        <div class="announcement-info">
            <div class="announcement-title">
                <span>${announcement.title}</span>
                <span class="announcement-badge popup">Popup</span>
                ${announcement.requireAck ? '<span class="announcement-badge">Ack Required</span>' : ''}
            </div>
            <div class="announcement-meta">
                <span><i class="far fa-calendar-alt"></i> ${formatDate(announcement.startDate)} to ${formatDate(announcement.endDate)}</span>
                <span><i class="far fa-clock"></i> ${formatTimeAgo(announcement.createdAt)}</span>
            </div>
        </div>
        <div class="announcement-actions">
            <button class="action-btn small edit-announcement" data-id="${announcement.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn small danger delete-announcement" data-id="${announcement.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    popupList.appendChild(popupItem);
}

    // Add news to list
    function addNewsToList(announcement) {
        const newsList = document.getElementById('newsList');
        
        // Remove empty state if it exists
        const emptyState = newsList.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
        
        const newsItem = document.createElement('div');
        newsItem.className = 'announcement-item';
        newsItem.innerHTML = `
            <div class="announcement-info">
                <div class="announcement-title">
                    <span>${announcement.title}</span>
                    <span class="announcement-badge news">${announcement.category}</span>
                </div>
                <div class="announcement-meta">
                    <span><i class="far fa-calendar-alt"></i> ${formatDate(announcement.startDate)} to ${formatDate(announcement.endDate)}</span>
                    <span><i class="far fa-clock"></i> ${formatTimeAgo(announcement.createdAt)}</span>
                </div>
            </div>
            <div class="announcement-actions">
                <button class="action-btn small edit-announcement" data-id="${announcement.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn small danger delete-announcement" data-id="${announcement.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        newsList.appendChild(newsItem);
    }

    // Helper functions
    function resetAnnouncementForm() {
        document.getElementById('announcementTitle').value = '';
        document.getElementById('announcementContent').value = '';
        
        // Set default dates (now and 7 days from now)
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + 7);
        
        document.getElementById('announcementStart').value = formatDateTimeLocal(now);
        document.getElementById('announcementEnd').value = formatDateTimeLocal(future);
        
        // Reset toggles
        document.getElementById('isPopup').checked = true;
        document.getElementById('requireAck').checked = false;
        document.getElementById('newsCategory').value = 'general';
    }

    function formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    // Implementing the database functionality
    let metric_value = document.querySelectorAll('.metric-value');
    // Fetch metric data from the server
    fetch('http://localhost:80/SmileConnector/backend/metric.php?type=patient_served')
        .then(res => res.json())
        .then(data => {
        metric_value[0].innerHTML = '';
        metric_value[0].innerHTML = data.served_count;
    });
    // Fetch metric data from the server
    fetch('http://localhost:80/SmileConnector/backend/metric.php?type=school')
        .then(res => res.json())
        .then(data => {
        metric_value[1].innerHTML = '';
        metric_value[1].innerHTML = data.school;
    });
    // Fetch metric data from the server
    fetch('http://localhost:80/SmileConnector/backend/metric.php?type=treatments')
        .then(res => res.json())
        .then(data => {
        metric_value[2].innerHTML = '';
        metric_value[2].innerHTML = data.treatment;
    });
    // Fetch metric data from the server
    fetch('http://localhost:80/SmileConnector/backend/metric.php?type=teledentistry')
        .then(res => res.json())
        .then(data => {
        metric_value[3].innerHTML = '';
        metric_value[3].innerHTML = data.teledentistrycount;
    });

    // Attach event listeners to patient row
    function attachPatientRowEventListeners(row) {
        const childId = row.dataset.id;
        const rowCells = row.cells;
        
        // View button - shows patient details in the details modal
        row.querySelector('.view-btn').addEventListener('click', function() {
            // Get all data from the row and its dataset
            const childData = {
                id: rowCells[0].textContent.replace('P', ''),
                fullName: rowCells[1].textContent,
                age: rowCells[2].textContent,
                location: rowCells[3].textContent,
                school: rowCells[4].textContent,
                createdAt: rowCells[5].textContent,
                status: rowCells[6].querySelector('span').textContent,
                statusClass: rowCells[6].querySelector('span').className,
                // These come from the joined patient data
                guardianUsername: row.dataset.guardianUsername,
                guardianEmail: row.dataset.guardianEmail,
                guardianPhone: row.dataset.guardianPhone,
                guardianAddress: row.dataset.guardianAddress,
                medicalNotes: row.dataset.medicalNotes,
                patientRecords: row.dataset.patientRecords ? JSON.parse(row.dataset.patientRecords) : []
            };

            // Populate details modal
            document.getElementById('detailPatientName').textContent = childData.fullName;
            document.getElementById('detailPatientId').textContent = `Patient ID: P${childData.id}`;
            document.getElementById('detailPatientSchool').textContent = childData.school;
            
            // Status
            const statusBadge = document.getElementById('detailPatientStatus');
            statusBadge.textContent = childData.status;
            statusBadge.className = `status-badge ${childData.statusClass.includes('completed') ? 'completed' : 
                                childData.statusClass.includes('in-progress') ? 'in-progress' : 'pending'}`;
            
            // Basic Info
            document.getElementById('detailPatientAge').textContent = childData.age + ' years';
            document.getElementById('detailPatientBirthdate').textContent = new Date(row.dataset.birthdate).toLocaleDateString();
            document.getElementById('detailPatientLocation').textContent = childData.location;
            document.getElementById('detailGuardianName').textContent = childData.guardianUsername;
            
            // Medical Info
            document.getElementById('detailPatientStatusText').textContent = childData.status;
            document.getElementById('detailLastUpdated').textContent = childData.createdAt;
            document.getElementById('detailMedicalNotes').textContent = childData.medicalNotes || 'No medical notes available';
            
            // Patient Records
            const recordsContainer = document.getElementById('detailPatientRecords');
            recordsContainer.innerHTML = '';
            
            if (childData.patientRecords && childData.patientRecords.length > 0) {
                childData.patientRecords.forEach(record => {
                    const recordElement = document.createElement('div');
                    recordElement.className = 'record-item';
                    recordElement.innerHTML = `
                        <a href="${record}" target="_blank" class="record-link">
                            <i class="fas fa-file-alt"></i> ${record.split('/').pop()}
                        </a>`;
                    recordsContainer.appendChild(recordElement);
                });
            } else {
                recordsContainer.innerHTML = '<p>No records uploaded</p>';
            }

            // Show details modal
            document.getElementById('patientDetailsModal').classList.add('active');
        });

        // Edit button - populates the edit form modal
        row.querySelector('.edit-btn').addEventListener('click', function () {
            // Check if the button is disabled
            //if (this.disabled) return;

            // Check if patient is archived (use live data)
            const statusElement = rowCells[6].querySelector('span');
            const statusText = statusElement ? statusElement.textContent.trim().toLowerCase() : '';
            if (statusText === 'archived') {
                showNotification('Archived patients cannot be edited.', 'warning');
                return;
            }

            const editModal = document.getElementById('patientFormModal');
            const filesPreview = document.getElementById('uploadedFilesPreview');

            // Ensure modal is not reused with previous states
            document.querySelectorAll('.modal.active').forEach(modal => modal.classList.remove('active'));

            // Set modal title
            document.getElementById('patientModalTitle').textContent = 'Edit Patient';

            // Populate form fields with current data (readonly/disabled but filled)
            const patientNameEl = document.getElementById('patientName');
            patientNameEl.value = rowCells[1].textContent.trim();
            patientNameEl.readOnly = true;

            const patientBirthdateEl = document.getElementById('patientBirthdate');
            patientBirthdateEl.value = row.dataset.birthdate || '';
            patientBirthdateEl.readOnly = true;

            const patientLocationEl = document.getElementById('patientLocation');
            patientLocationEl.value = rowCells[3].textContent.trim().toLowerCase();
            patientLocationEl.disabled = true;

            const patientSchoolEl = document.getElementById('patientSchool');
            patientSchoolEl.value = rowCells[4].textContent.trim();
            patientSchoolEl.readOnly = true;

            const guardianNameEl = document.getElementById('guardianName');
            guardianNameEl.value = row.dataset.guardianUsername || '';
            guardianNameEl.readOnly = true;

            // Editable fields
            const patientStatusEl = document.getElementById('patientStatus');
            patientStatusEl.value = statusText;

            const medicalNotesEl = document.getElementById('medicalNotes');
            medicalNotesEl.value = row.dataset.medicalNotes || '';

            // Show uploaded files preview
            if (row.dataset.patientRecords) {
                try {
                    const files = JSON.parse(row.dataset.patientRecords);
                    if (Array.isArray(files) && files.length > 0) {
                        filesPreview.innerHTML = files.map(file =>
                            `<div class="file-preview">${file.split('/').pop()}</div>`
                        ).join('');
                    } else {
                        filesPreview.innerHTML = '<p class="file-info">No files uploaded</p>';
                    }
                } catch (e) {
                    console.error('Invalid JSON in patientRecords:', e);
                    filesPreview.innerHTML = '<p class="file-info">Error loading files</p>';
                }
            } else {
                filesPreview.innerHTML = '<p class="file-info">No files uploaded</p>';
            }

            // Open modal
            editModal.classList.add('active');
        });


        // Delete button - changed to "Archive" functionality
        row.querySelector('.delete-btn').addEventListener('click', function() {
            const childName = rowCells[1].textContent;
            
            showPasswordModal(
                'Confirm Archive',
                `You are about to archive <strong>${childName}</strong>'s record. This will remove them from active lists but preserve all data.`,
                async function() {
                    try {
                        // In a real app, you would update status to "archived" instead of deleting
                        const response = await fetch('http://localhost:80/SmileConnector/backend/patientOperations.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: 'archive',
                                childId: childId
                            })
                        });
                        
                        const result = await response.json();
                        if (result.success) {
                            showNotification('Patient record archived successfully', 'success');
                            //row.remove();
                        } else {
                            throw new Error(result.error || 'Failed to archive record');
                        }
                    } catch (error) {
                        showNotification(error.message, 'error');
                    }
                }
            );
        });
    }

    // Update the loadPatientTable function to include dataset attributes
    function loadPatientTable() {
        let patientTableBody = document.getElementById('patientTableBody');
        patientTableBody.innerHTML = '';

        fetch('http://localhost:80/SmileConnector/backend/superadmindash.php?type=children')
            .then(res => res.json())
            .then(data => {
                data.forEach(child => {
                    let tr = document.createElement('tr');
                    tr.setAttribute('data-id', child.child_ID);
                    
                    // Store additional data in dataset
                    tr.dataset.birthdate = child.birthday;
                    tr.dataset.guardianUsername = child.guardian_username;
                    tr.dataset.guardianEmail = child.guardian_email;
                    tr.dataset.guardianPhone = child.guardian_phone;
                    tr.dataset.guardianAddress = child.guardian_address;
                    tr.dataset.medicalNotes = child.medicalNotes;
                    tr.dataset.patientRecords = child.patientRecords ? JSON.stringify(child.patientRecords.split(',')) : '';
                    
                    let statusClass = child.treatmentStatus.toLowerCase().replace(' ', '-');
                    const age = calculateAge(child.birthday);

                     // Check if archived
                    const isArchived = child.treatmentStatus.toLowerCase() === 'archived';
                    tr.innerHTML = `
                    <td>P${child.child_ID}</td>
                    <td>${child.childFullName}</td>
                    <td>${age}</td>
                    <td>${child.location.toUpperCase()}</td>
                    <td>${child.school}</td>
                    <td>${new Date(child.created_at).toLocaleDateString()}</td>
                    <td style="text-align: center"><span class="status-badge ${statusClass}">${child.treatmentStatus.toUpperCase()}</span></td>
                    <td class="action-cell">
                        <button class="icon-btn view-btn" title="View Details"><i class="fas fa-eye"></i></button>
                        <button class="icon-btn edit-btn" title="Edit" ${isArchived ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fas fa-edit"></i></button>
                        <button class="icon-btn delete-btn" title="Archive" ${isArchived ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fas fa-archive"></i></button>
                    </td>`;

                patientTableBody.appendChild(tr);
                attachPatientRowEventListeners(tr);
                });
                makeTablesResponsive();
            });
    }

    function calculateAge(birthDate) {
        if (!birthDate) return 'N/A';
        const date = new Date(birthDate);
        if (isNaN(date)) return 'N/A';
        
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
            age--;
        }
        return age;
    }

    // Attach event listeners to admin row
    function attachAdminRowEventListeners(row) {
        const adminEmail = row.cells[2].textContent;
        const adminName = row.cells[1].textContent;
        const statusBadge = row.cells[4].querySelector('span');
        const currentStatus = statusBadge.textContent;

        // View button - shows admin details in the details modal
        row.querySelector('.icon-btn.view-btn').addEventListener('click', function() {
            const adminRow = this.closest('tr');
            
            // Populate details modal
            document.getElementById('detailAdminName').textContent = adminRow.cells[1].textContent;
            document.getElementById('detailAdminId').textContent = `Admin ID: ${adminRow.cells[0].textContent}`;
            document.getElementById('detailAdminEmail').textContent = adminRow.cells[2].textContent;
            document.getElementById('detailLastLogin').textContent = adminRow.cells[3].textContent || 'Never logged in';
            
            // Set admin type and status
            const statusBadge = adminRow.cells[4].querySelector('span');
            document.getElementById('detailAdminStatus').textContent = statusBadge.textContent;
            document.getElementById('detailAdminStatus').className = `status-badge ${statusBadge.className.includes('active') ? 'completed' : 'inactive'}`;
            
            // Show details modal
            document.getElementById('adminDetailsModal').classList.add('active');
        });
        
        // Edit button - populates the edit form modal
        row.querySelector('.icon-btn.edit-btn').addEventListener('click', function() {
            const adminRow = this.closest('tr');
            
            showPasswordModal(
                'Admin Access Required',
                `You are about to edit admin <strong>${adminRow.cells[1].textContent}</strong>. For security reasons, please confirm your password to proceed.`,
                function() {
                    // Reset form first (in case it was in add mode)
                   // resetAdminForm();
                    
                    // Set to edit mode
                    document.getElementById('adminModalTitle').textContent = 'Edit Admin';
                    
                    // Populate form with admin data (readonly for name and email)
                    const nameInput = document.getElementById('adminName');
                    nameInput.value = adminRow.cells[1].textContent;
                    nameInput.readOnly = true;
                    
                    const emailInput = document.getElementById('adminEmail');
                    emailInput.value = adminRow.cells[2].textContent;
                    emailInput.readOnly = true;
                    
                    // Set status (readonly)
                    const statusText = adminRow.cells[4].querySelector('span').textContent.toLowerCase();
                    const statusSelect = document.getElementById('adminStatus');
                    statusSelect.value = statusText.includes('active') ? 'active' : 
                                        statusText.includes('inactive') ? 'inactive' : 'pending';
                    statusSelect.disabled = true;
                    
                    // Show edit modal
                    document.getElementById('adminFormModal').classList.add('active');
                }
            );
        });

        // Status toggle button
        const statusBtn = row.querySelector('.deactivate-btn, .activate-btn');
        if (statusBtn) {
            statusBtn.addEventListener('click', function() {
                const isActivate = this.classList.contains('activate-btn');
                const newStatus = isActivate ? 'Active' : 'Inactive';
                const action = isActivate ? 'activate' : 'deactivate';
                
                showPasswordModal(
                    `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
                    `You are about to ${action} <strong>${adminName}</strong>'s admin account.`,
                    async function() {
                        try {
                            const response = await fetch('http://localhost:80/SmileConnector/backend/adminOperations.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'update_status',
                                    adminEmail: adminEmail,
                                    status: newStatus
                                })
                            });
                            
                            const result = await response.json();
                            if (result.success) {
                                showNotification(`Admin ${action}d successfully`, 'success');
                                // Update UI directly
                                statusBadge.textContent = newStatus;
                                statusBadge.className = `status-badge ${newStatus.toLowerCase()}`;
                                
                                // Toggle buttons
                                if (newStatus === 'Active') {
                                    statusBtn.className = 'icon-btn deactivate-btn';
                                    statusBtn.innerHTML = '<i class="fas fa-user-slash"></i>';
                                    statusBtn.title = 'Deactivate';
                                    // Remove delete button if exists
                                    const deleteBtn = row.querySelector('.delete-btn');
                                    if (deleteBtn) deleteBtn.remove();
                                } else if (newStatus === 'Inactive') {
                                    statusBtn.className = 'icon-btn activate-btn';
                                    statusBtn.innerHTML = '<i class="fas fa-user-check"></i>';
                                    statusBtn.title = 'Activate';
                                    // Add delete button
                                    const deleteBtn = document.createElement('button');
                                    deleteBtn.className = 'icon-btn delete-btn';
                                    deleteBtn.title = 'Delete';
                                    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                                    statusBtn.after(deleteBtn);
                                    attachDeleteListener(deleteBtn, adminEmail, adminName, row);
                                }
                            } else {
                                throw new Error(result.error || 'Failed to update status');
                            }
                        } catch (error) {
                            showNotification(error.message, 'error');
                        }
                    }
                );
            });
        }

        // Delete button (if exists)
        const deleteBtn = row.querySelector('.delete-btn');
        if (deleteBtn) {
            attachDeleteListener(deleteBtn, adminEmail, adminName, row);
        }

        // Helper function for delete button
        function attachDeleteListener(btn, email, name, row) {
            btn.addEventListener('click', function() {
                showPasswordModal(
                    'Confirm Deletion',
                    `You are about to permanently delete <strong>${name}</strong>'s admin account.`,
                    async function() {
                        try {
                            const response = await fetch('http://localhost:80/SmileConnector/backend/adminOperations.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'delete',
                                    adminEmail: email
                                })
                            });
                            
                            const result = await response.json();
                            if (result.success) {
                                showNotification('Admin deleted successfully', 'success');
                                row.remove();
                            } else {
                                throw new Error(result.error || 'Failed to delete admin');
                            }
                        } catch (error) {
                            showNotification(error.message, 'error');
                        }
                    }
                );
            });
        }
    }

    // Initialize admin table
    function loadAdminTable() {
        const adminTableBody = document.getElementById('adminTableBody');
        adminTableBody.innerHTML = '';
        
        fetch('http://localhost:80/SmileConnector/backend/superadmindash.php?type=admin')
            .then(res => res.json())
            .then(data => {
                data.forEach(admin => {
                    let tr = document.createElement('tr');
                    tr.setAttribute('data-id', admin.AdminID);
                    
                    // Determine buttons based on status
                    let actionButtons = `
                        <button class="icon-btn view-btn" title="View Details"><i class="fas fa-eye"></i></button>
                        <button class="icon-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>`;
                    
                    if (admin.Status === 'Active') {
                        actionButtons += `<button class="icon-btn deactivate-btn" title="Deactivate"><i class="fas fa-user-slash"></i></button>`;
                    } else if (admin.Status === 'Inactive') {
                        actionButtons += `
                            <button class="icon-btn activate-btn" title="Activate"><i class="fas fa-user-check"></i></button>
                            <button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>`;
                    } else if (admin.Status === 'Pending') {
                        actionButtons += `
                            <button class="icon-btn deactivate-btn" title="Reject" disabled style="opacity:0.5;cursor:not-allowed;"><i class="fas fa-user-slash"></i></button>
                            <button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>`;
                    }
                    
                    tr.innerHTML = `
                        <td>A${admin.adminID}</td>
                        <td>${admin.adminFullname}</td>
                        <td>${admin.adminEmail}</td>
                        <td>${admin.last_login}</td>
                        <td><span class="status-badge ${admin.Status.toLowerCase()}">${admin.Status.toUpperCase()}</span></td>
                        <td class="action-cell">${actionButtons}</td>`;
                    
                    adminTableBody.appendChild(tr);
                    attachAdminRowEventListeners(tr);
                });
                makeTablesResponsive(); // Ensure tables are responsive after loading
            })
            .catch(error => {
                console.error('Error loading admin data:', error);
                showNotification('Failed to load admin data', 'error');
            });
    }

    document.addEventListener('DOMContentLoaded', loadAdminTable);

    // Get DOM elements
    const adminSearchInput = document.querySelector('#admins .search-input');
    const adminStatusFilter = document.getElementById('adminStatusFilter');
    const adminSort = document.getElementById('adminSort');

    // Add event listeners
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', filterAdmins);
    }

    if (adminStatusFilter) {
        adminStatusFilter.addEventListener('change', filterAdmins);
    }

    if (adminSort) {
        adminSort.addEventListener('change', sortAdmins);
    }

    // Filter function
    function filterAdmins() {
        const statusFilter = adminStatusFilter.value;
        const searchTerm = adminSearchInput ? adminSearchInput.value.trim().toLowerCase() : '';
        
        document.querySelectorAll('#adminTableBody tr').forEach(row => {
            const rowStatus = row.cells[4].querySelector('span').textContent.toLowerCase();
            
            // Get all text content from the row for search
            const rowText = Array.from(row.cells)
                .slice(0, -1) // Exclude the actions cell
                .map(cell => cell.textContent.toLowerCase())
                .join(' ');
            
            // Check filter conditions
            const statusMatch = statusFilter === 'all' || rowStatus.includes(statusFilter);
            const searchMatch = searchTerm === '' || rowText.includes(searchTerm);
            
            row.style.display = statusMatch && searchMatch ? '' : 'none';
        });
    }

    // Sort function
    function sortAdmins() {
        const sortBy = adminSort.value;
        const tbody = document.querySelector('#adminTableBody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            if (sortBy === 'name') {
                return a.cells[1].textContent.localeCompare(b.cells[1].textContent);
            } else if (sortBy === 'last-login') {
                const dateA = new Date(a.cells[3].textContent || 0);
                const dateB = new Date(b.cells[3].textContent || 0);
                return dateB - dateA; // Newest first
            }
            // Default: recent (by ID)
            return b.getAttribute('data-id') - a.getAttribute('data-id');
        });
        
        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
    }

// // Initial load
// document.addEventListener('DOMContentLoaded', loadAdminTable);

    // Add modal close handlers
    document.querySelectorAll('.modal .close-modal, .modal .cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Handle edit button in details modal
    document.querySelector('.edit-from-details')?.addEventListener('click', function() {
        document.getElementById('adminDetailsModal').classList.remove('active');
        
        // Get data from details view and populate edit form
        document.getElementById('adminModalTitle').textContent = 'Edit Admin';
        document.getElementById('adminName').value = document.getElementById('detailAdminName').textContent;
        document.getElementById('adminEmail').value = document.getElementById('detailAdminEmail').textContent;
        
        // Set status based on details view
        const statusText = document.getElementById('detailAdminStatus').textContent.toLowerCase();
        document.getElementById('adminStatus').value = statusText.includes('active') ? 'active' : 
                                                    statusText.includes('inactive') ? 'inactive' : 'pending';
        
        document.getElementById('adminFormModal').classList.add('active');
    });

    function resetAdminForm() {
        const form = document.getElementById('adminForm');
        form.reset();
        
        // Reset readonly/disabled states and clear values
        const adminName = document.getElementById('adminName');
        adminName.readOnly = false;
        adminName.value = '';
        
        const adminEmail = document.getElementById('adminEmail'); 
        adminEmail.readOnly = false;
        adminEmail.value = '';
        
        const adminStatus = document.getElementById('adminStatus');
        adminStatus.disabled = false;
        adminStatus.value = 'Pending';
        
        // Reset any other specific fields to their default state
        document.getElementById('permSuperAdmin').checked = false;
        
        // Clear any validation errors if present
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(el => el.remove());
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

    // Function to make tables responsive
    function makeTablesResponsive() {
        document.querySelectorAll('.patient-table').forEach(table => {
            // Skip if already processed
            if (table.classList.contains('responsive-enabled')) return;
            
            const headers = [];
            // Get headers from thead
            table.querySelectorAll('thead th').forEach(th => {
                headers.push(th.textContent.trim());
            });
            
            // Apply data-labels to each cell
            table.querySelectorAll('tbody tr').forEach(tr => {
                tr.querySelectorAll('td').forEach((td, index) => {
                    if (headers[index]) {
                        td.setAttribute('data-label', headers[index]);
                    }
                });
            });
            
            table.classList.add('responsive-enabled');
        });
    }