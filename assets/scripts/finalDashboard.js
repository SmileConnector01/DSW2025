// document.addEventListener('DOMContentLoaded', function() {

//     // Initialize all patient management functionality
//     initPatientManagement();
//     loadPatientTable();

//     // Add patient button
//     const addPatientBtn = document.getElementById('addPatientBtn');
//     if (addPatientBtn) {
//         addPatientBtn.addEventListener('click', () => {
//             document.getElementById('patientModalTitle').textContent = 'Add New Patient';
//             document.getElementById('patientFormModal').classList.add('active');
//         });
//     }

//     const birthdateInput = document.getElementById('patientBirthdate');
//     const today = new Date();

//     // Prevent future dates
//     birthdateInput.max = today.toISOString().split('T')[0];

//     let patientAge = null;

//     function calculateAge(birthDate) {
//         const today = new Date();
//         let age = today.getFullYear() - birthDate.getFullYear();
//         const m = today.getMonth() - birthDate.getMonth();
//         if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//         }
//         return age;
//     }

//     function validateBirthdate(input) {
//         if (!input.value) {
//         input.style.border = '';
//         patientAge = null;
//         return;
//         }

//         const selectedDate = new Date(input.value);
//         const age = calculateAge(selectedDate);
//         const isValid = age >= 0 && age <= 15;

//         input.style.border = isValid ? '2px solid #4CAF50' : '2px solid #f44336';
//         patientAge = isValid ? age : null;

//         console.log('Patient age:', patientAge);
//     }

//     birthdateInput.addEventListener('input', function () {
//         validateBirthdate(this);
//     });

//     birthdateInput.addEventListener('change', function () {
//         validateBirthdate(this);
//     });

//     validateBirthdate(birthdateInput);


//     // Unified form submission handler with loading spinner
//     document.querySelectorAll('form').forEach(form => {
//         form.addEventListener('submit', function(e) {
//             e.preventDefault();
            
//             const formData = new FormData(this);
//             const submitButton = this.querySelector('.save-btn') || 
//                             document.querySelector('.save-btn[form="' + this.id + '"]');
            
//             // Store original button text and show spinner
//             const originalText = submitButton.innerHTML;
//             submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
//             submitButton.disabled = true;
            
//             // Debugging: Log form data before submission
//             console.log('Form submission data:', Object.fromEntries(formData.entries()));
            
//             fetch(this.action, {
//                 method: 'POST',
//                 body: formData
//             })
//             .then(response => {
//                 // First check if the response is JSON
//                 const contentType = response.headers.get('content-type');
//                 if (!contentType || !contentType.includes('application/json')) {
//                     return response.text().then(text => {
//                         throw new Error('Invalid response: ' + text);
//                     });
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 if (data.success) {

//                     loadAdminTable();
//                     loadPatientTable();
//                     showNotification(data.message, 'success');
//                     this.reset();
                    
//                     // Close modal on success
//                     const modal = this.closest('.modal');
//                     if (modal) {
//                         modal.classList.remove('active');
//                     }
//                 } else {
//                     showNotification(data.message || 'Operation failed', 'error');
//                 }
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 showNotification('An error occurred. Please try again.', 'error');
//             })
//             .finally(() => {
//                 // Restore button state
//                 submitButton.innerHTML = originalText;
//                 submitButton.disabled = false;
//             });
//         });
//     });
   
//     // Settings tabs navigation - modified version
//     const settingsTabs = document.querySelectorAll('.settings-tab');
//     const settingsContents = document.querySelectorAll('.settings-content');
//     const settingsPane = document.getElementById('settings');

//     // Update your tab switching code to ensure active class is properly toggled
//     settingsTabs.forEach(tab => {
//         tab.addEventListener('click', function() {
//         // Remove active class from all tabs
//         settingsTabs.forEach(t => {
//             t.classList.remove('active');
//             // Remove any existing indicator
//             t.style.removeProperty('border-bottom');
//         });
        
//         // Add active class to clicked tab
//         this.classList.add('active');
        
//         const tabId = this.getAttribute('data-tab');
        
//         // Hide all settings contents
//         settingsContents.forEach(content => {
//             content.classList.remove('active');
//         });
        
//         // Show corresponding content
//         document.getElementById(`${tabId}-settings`).classList.add('active');
//         });
//     });
    
//     // Password policy details
//     const passwordPolicy = document.getElementById('passwordPolicy');
//     const policyDetails = document.getElementById('policyDetails');
    
//     if (passwordPolicy && policyDetails) {
//         passwordPolicy.addEventListener('change', function() {
//             const selectedOption = this.options[this.selectedIndex];
//             policyDetails.textContent = selectedOption.getAttribute('data-details');
//         });
//     }
    
//     // Toggle 2FA settings
//     const enable2FA = document.getElementById('enable2FA');
//     const twoFASettings = document.getElementById('2faSettings');
    
//     if (enable2FA && twoFASettings) {
//         enable2FA.addEventListener('change', function() {
//             twoFASettings.style.display = this.checked ? 'flex' : 'none';
//         });
//     }
    
//     // Toggle SMS settings
//     const enableSMS = document.getElementById('enableSMS');
//     const smsSettings = document.getElementById('smsSettings');
    
//     if (enableSMS && smsSettings) {
//         enableSMS.addEventListener('change', function() {
//             smsSettings.style.display = this.checked ? 'block' : 'none';
//         });
//     }
    
//     // Email provider change
//     const emailProvider = document.getElementById('emailProvider');
//     const smtpSettings = document.getElementById('smtpSettings');
    
//     if (emailProvider && smtpSettings) {
//         emailProvider.addEventListener('change', function() {
//             smtpSettings.style.display = this.value === 'smtp' ? 'block' : 'none';
//         });
//     }
    
//     // Logo preview
//     const systemLogo = document.getElementById('systemLogo');
//     const logoPreview = document.getElementById('logoPreview');
//     const currentLogo = document.getElementById('currentLogo');
    
//     if (systemLogo && logoPreview && currentLogo) {
//         systemLogo.addEventListener('change', function(e) {
//             const file = e.target.files[0];
//             if (file) {
//                 const reader = new FileReader();
//                 reader.onload = function(event) {
//                     currentLogo.src = event.target.result;
//                     currentLogo.style.display = 'block';
//                     document.getElementById('logoPlaceholder').style.display = 'none';
//                 };
//                 reader.readAsDataURL(file);
//             }
//         });
//     }
    
//     // Range input sync
//     const sessionTimeoutRange = document.getElementById('sessionTimeoutRange');
//     const sessionTimeout = document.getElementById('sessionTimeout');
    
//     if (sessionTimeoutRange && sessionTimeout) {
//         sessionTimeoutRange.addEventListener('input', function() {
//             sessionTimeout.value = this.value;
//         });
        
//         sessionTimeout.addEventListener('input', function() {
//             sessionTimeoutRange.value = this.value;
//         });
//     }
    
//     // Save settings buttons
//     document.querySelectorAll('[id^="save"]').forEach(btn => {
//         btn.addEventListener('click', function() {
//             const settingsType = this.id.replace('save', '').replace('Settings', '').toLowerCase();
//             saveSettings(settingsType);
//         });
//     });
//     // Initialize timezone dropdown (in a real app, you would populate with all timezones)
//     const timezoneSelect = document.getElementById('timezone');
//     if (timezoneSelect) {
//         // This is just a sample - in production you would use a proper timezone library
//         const additionalTimezones = [
//             'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
//             'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'
//         ];
        
//         additionalTimezones.forEach(tz => {
//             const option = document.createElement('option');
//             option.value = tz;
//             option.textContent = tz;
//             timezoneSelect.appendChild(option);
//         });
//     }

//     // Sample popup
//     const samplePopup = {
//         id: 1,
//         type: 'popup',
//         title: 'System Maintenance Scheduled',
//         content: 'We will be performing system maintenance on Saturday from 2-4 AM. The system may be unavailable during this time.',
//         startDate: new Date().toISOString(),
//         endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
//         createdAt: new Date(Date.now() - 3600000).toISOString(),
//         isPopup: true,
//         requireAck: true,
//         isActive: true
//     };
    
//     // Sample news
//     const sampleNews = {
//         id: 2,
//         type: 'news',
//         title: 'New Feature Released: Advanced Reporting',
//         content: 'We are excited to announce our new advanced reporting feature that gives you more insights into your data.',
//         startDate: new Date().toISOString(),
//         endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
//         createdAt: new Date(Date.now() - 86400000).toISOString(),
//         category: 'updates',
//         isActive: true
//     };
    
//     // Add to lists (in a real app, you would load from server)
//     setTimeout(() => {
//         addPopupToList(samplePopup);
//         addNewsToList(sampleNews);
//     }, 500);

//     // Rest of your existing initialization code...
//     // (Keep all your existing admin, settings, etc. code here)
// });
// // Add to the existing main.js

// // Announcements functionality
// const announcementModal = document.getElementById('announcementModal');
// const createPopupBtn = document.getElementById('createPopupBtn');
// const createNewsBtn = document.getElementById('createNewsBtn');
// const saveAnnouncementBtn = document.getElementById('saveAnnouncement');
// const modalCancelBtns = document.querySelectorAll('.modal-cancel, .modal-close');
// const popupSettings = document.getElementById('popupSettings');
// const newsSettings = document.getElementById('newsSettings');
// let currentAnnouncementType = 'popup';

// // Open modal for popup creation
// if (createPopupBtn) {
//     createPopupBtn.addEventListener('click', function() {
//         currentAnnouncementType = 'popup';
//         document.getElementById('modalTitle').textContent = 'Create Login Popup Message';
//         popupSettings.style.display = 'block';
//         newsSettings.style.display = 'none';
//         resetAnnouncementForm();
//         announcementModal.classList.add('show');
//     });
// }

// // Open modal for news creation
// if (createNewsBtn) {
//     createNewsBtn.addEventListener('click', function() {
//         currentAnnouncementType = 'news';
//         document.getElementById('modalTitle').textContent = 'Create News Post';
//         popupSettings.style.display = 'none';
//         newsSettings.style.display = 'block';
//         resetAnnouncementForm();
//         announcementModal.classList.add('show');
//     });
// }

// // Close modal
// modalCancelBtns.forEach(btn => {
//     btn.addEventListener('click', function() {
//         announcementModal.classList.remove('show');
//     });
// });

// // Save announcement
// if (saveAnnouncementBtn) {
//     saveAnnouncementBtn.addEventListener('click', function() {
//         const title = document.getElementById('announcementTitle').value;
//         const content = document.getElementById('announcementContent').value;
//         const startDate = document.getElementById('announcementStart').value;
//         const endDate = document.getElementById('announcementEnd').value;
        
//         if (!title || !content) {
//             showNotification('Title and content are required', 'error');
//             return;
//         }
        
//         const announcement = {
//             id: Date.now(),
//             type: currentAnnouncementType,
//             title,
//             content,
//             startDate,
//             endDate,
//             createdAt: new Date().toISOString(),
//             isActive: true
//         };
        
//         if (currentAnnouncementType === 'popup') {
//             announcement.isPopup = document.getElementById('isPopup').checked;
//             announcement.requireAck = document.getElementById('requireAck').checked;
//             addPopupToList(announcement);
//         } else {
//             announcement.category = document.getElementById('newsCategory').value;
//             addNewsToList(announcement);
//         }
        
//         // In a real app, you would save to server here
//         console.log('Saving announcement:', announcement);
//         showNotification('Announcement saved successfully', 'success');
//         announcementModal.classList.remove('show');
//     });
// }
// function saveSettings(type) {
//     // In a real app, you would collect the form data and send to server
//     console.log(`Saving ${type} settings...`);
//     showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} settings saved successfully`, 'success');
// }

// // Add popup to list
// function addPopupToList(announcement) {
//     const popupList = document.getElementById('popupList');
    
//     // Remove empty state if it exists
//     const emptyState = popupList.querySelector('.empty-state');
//     if (emptyState) emptyState.remove();
    
//     const popupItem = document.createElement('div');
//     popupItem.className = 'announcement-item';
//     popupItem.innerHTML = `
//         <div class="announcement-info">
//             <div class="announcement-title">
//                 <span>${announcement.title}</span>
//                 <span class="announcement-badge popup">Popup</span>
//                 ${announcement.requireAck ? '<span class="announcement-badge">Ack Required</span>' : ''}
//             </div>
//             <div class="announcement-meta">
//                 <span><i class="far fa-calendar-alt"></i> ${formatDate(announcement.startDate)} to ${formatDate(announcement.endDate)}</span>
//                 <span><i class="far fa-clock"></i> ${formatTimeAgo(announcement.createdAt)}</span>
//             </div>
//         </div>
//         <div class="announcement-actions">
//             <button class="action-btn small edit-announcement" data-id="${announcement.id}">
//                 <i class="fas fa-edit"></i>
//             </button>
//             <button class="action-btn small danger delete-announcement" data-id="${announcement.id}">
//                 <i class="fas fa-trash"></i>
//             </button>
//         </div>
//     `;
    
//     popupList.appendChild(popupItem);
// }

//     // function processPatientForm(data) {
//     //     const patientId = 'P' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
//     //     // Determine status badge
//     //     let statusBadgeClass, statusText;
//     //     switch(data.patientStatus) {
//     //         case 'pending': 
//     //             statusBadgeClass = 'pending'; 
//     //             statusText = 'Pending'; 
//     //             break;
//     //         case 'in-progress': 
//     //             statusBadgeClass = 'in-progress'; 
//     //             statusText = 'In Progress'; 
//     //             break;
//     //         case 'completed': 
//     //             statusBadgeClass = 'completed'; 
//     //             statusText = 'Completed'; 
//     //             break;
//     //         default: 
//     //             statusBadgeClass = 'pending'; 
//     //             statusText = 'Pending';
//     //     }
        
//     //     // Create new row
//     //     const newRow = document.createElement('tr');
//     //     newRow.setAttribute('data-id', patientId);
//     //     newRow.innerHTML = `
//     //         <td>${patientId}</td>
//     //         <td>${data.patientName}</td>
//     //         <td>${data.patientAge}</td>
//     //         <td>${data.patientLocation}</td>
//     //         <td>${data.patientSchool}</td>
//     //         <td>${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
//     //         <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
//     //         <td class="action-cell">
//     //             <button class="icon-btn view-btn" title="View Details"><i class="fas fa-eye"></i></button>
//     //             <button class="icon-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
//     //             <button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
//     //         </td>
//     //     `;
        
//     //     document.querySelector('#patients .patient-table tbody').prepend(newRow);
//     //     attachPatientRowEventListeners(newRow);
//     //     showNotification(`Patient ${data.patientName} added successfully!`, 'success');
//     // }

//     // Add news to list
//     function addNewsToList(announcement) {
//         const newsList = document.getElementById('newsList');
        
//         // Remove empty state if it exists
//         const emptyState = newsList.querySelector('.empty-state');
//         if (emptyState) emptyState.remove();
        
//         const newsItem = document.createElement('div');
//         newsItem.className = 'announcement-item';
//         newsItem.innerHTML = `
//             <div class="announcement-info">
//                 <div class="announcement-title">
//                     <span>${announcement.title}</span>
//                     <span class="announcement-badge news">${announcement.category}</span>
//                 </div>
//                 <div class="announcement-meta">
//                     <span><i class="far fa-calendar-alt"></i> ${formatDate(announcement.startDate)} to ${formatDate(announcement.endDate)}</span>
//                     <span><i class="far fa-clock"></i> ${formatTimeAgo(announcement.createdAt)}</span>
//                 </div>
//             </div>
//             <div class="announcement-actions">
//                 <button class="action-btn small edit-announcement" data-id="${announcement.id}">
//                     <i class="fas fa-edit"></i>
//                 </button>
//                 <button class="action-btn small danger delete-announcement" data-id="${announcement.id}">
//                     <i class="fas fa-trash"></i>
//                 </button>
//             </div>
//         `;
        
//         newsList.appendChild(newsItem);
//     }

//     // Helper functions
//     function resetAnnouncementForm() {
//         document.getElementById('announcementTitle').value = '';
//         document.getElementById('announcementContent').value = '';
        
//         // Set default dates (now and 7 days from now)
//         const now = new Date();
//         const future = new Date();
//         future.setDate(now.getDate() + 7);
        
//         document.getElementById('announcementStart').value = formatDateTimeLocal(now);
//         document.getElementById('announcementEnd').value = formatDateTimeLocal(future);
        
//         // Reset toggles
//         document.getElementById('isPopup').checked = true;
//         document.getElementById('requireAck').checked = false;
//         document.getElementById('newsCategory').value = 'general';
//     }

//     function formatDateTimeLocal(date) {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         const hours = String(date.getHours()).padStart(2, '0');
//         const minutes = String(date.getMinutes()).padStart(2, '0');
        
//         return `${year}-${month}-${day}T${hours}:${minutes}`;
//     }

//     function formatDate(dateString) {
//         if (!dateString) return 'N/A';
//         const date = new Date(dateString);
//         return date.toLocaleDateString();
//     }

//     function formatTimeAgo(dateString) {
//         const date = new Date(dateString);
//         const now = new Date();
//         const diffInSeconds = Math.floor((now - date) / 1000);
        
//         if (diffInSeconds < 60) return 'Just now';
//         if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
//         if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
//         return `${Math.floor(diffInSeconds / 86400)} days ago`;
//     }

//     // // Close modal when clicking outside
//     // window.addEventListener('click', function(event) {
//     //     if (event.target === announcementModal) {
//     //         announcementModal.classList.remove('show');
//     //     }
//     // });


//     // Implementing the database functionality
//     let metric_value = document.querySelectorAll('.metric-value');
//     // Fetch metric data from the server
//     fetch('http://localhost:80/SmileConnector/backend/metric.php?type=patient_served')
//         .then(res => res.json())
//         .then(data => {
//         metric_value[0].innerHTML = '';
//         metric_value[0].innerHTML = data.served_count;
//     });
//     // Fetch metric data from the server
//     fetch('http://localhost:80/SmileConnector/backend/metric.php?type=school')
//         .then(res => res.json())
//         .then(data => {
//         metric_value[1].innerHTML = '';
//         metric_value[1].innerHTML = data.school;
//     });
//     // Fetch metric data from the server
//     fetch('http://localhost:80/SmileConnector/backend/metric.php?type=treatmentStatus')
//         .then(res => res.json())
//         .then(data => {
//         metric_value[2].innerHTML = '';
//         metric_value[2].innerHTML = data.treatment;
//     });
//     // Fetch metric data from the server
//     fetch('http://localhost:80/SmileConnector/backend/metric.php?type=patient_served')
//         .then(res => res.json())
//         .then(data => {
//         metric_value[3].innerHTML = '';
//         metric_value[3].innerHTML = data.served_count;
//     });


//     // // admin dash
//     // let adminTableBody = document.getElementById('adminTableBody');
//     // fetch('http://localhost:80/SmileConnector/backend/superadmindash.php?type=admin')
//     //     .then(res => res.json())
//     //     .then(data => {
        
//     //     data.forEach(admin => {
//     //         let tr = document.createElement('tr');
//     //         tr.setAttribute('data-id', admin.AdminID);
//     //         // Check if admin.Status === "Inactive" to determine visibility of delete button
//     //         tr.innerHTML = `
//     //             <td>A${admin.adminID}</td>
//     //             <td>${admin.adminFullname}</td>
//     //             <td>${admin.adminEmail}</td>
//     //             <td>${admin.last_login}</td>
//     //             <td><span class="status-badge ${admin.Status}">${admin.Status}</span></td>
//     //             <td class="action-cell">
//     //                 <button class="icon-btn view-btn" title="View Details"><i class="fas fa-eye"></i></button>
//     //                 <button class="icon-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
//     //                 <button class="icon-btn deactivate-btn" title="Deactivate"><i class="fas fa-user-slash"></i></button>
//     //                 ${admin.Status === "Inactive" ? 
//     //                     `<button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>` 
//     //                     : ''}
//     //             </td>`;

//     //         adminTableBody.appendChild(tr);
//     //         attachAdminRowEventListeners(tr);
//     //     });
//     // });

//     // Fetch patient
//     function loadPatientTable() {
//         let patientTableBody = document.getElementById('patientTableBody');
//         fetch('http://localhost:80/SmileConnector/backend/superadmindash.php?type=children')
//             .then(res => res.json())
//             .then(data => {
            
//             data.forEach(child => {
//                 let tr = document.createElement('tr');
//                 tr.setAttribute('data-id', child.child_ID);
//                 let statusClass = child.treatmentStatus.toLowerCase().replace(' ', '-');

//                 // calculate age
//                 function calculateAge(birthDate) {
//                     if (!birthDate) return null;

//                     const date = new Date(birthDate); // convert string to Date
//                     if (isNaN(date)) return null; // invalid date check

//                     const today = new Date();
//                     let age = today.getFullYear() - date.getFullYear();
//                     const m = today.getMonth() - date.getMonth();
//                     if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
//                         age--;
//                     }
//                     return age;
//                 }

//                 tr.innerHTML = `
//                     <td>P${child.child_ID}</td>
//                     <td>${child.childFullName}</td>
//                     <td id='patientAge'>${calculateAge(child.birthday)}</td>
//                     <td>${child.location}</td>
//                     <td>${child.school}</td>
//                     <td>${child.created_at}</td>
//                     <td><span class="status-badge ${statusClass}">${child.treatmentStatus}</span></td>
//                     <td class="action-cell">
//                         <button class="icon-btn view-btn" title="View Details"><i class="fas fa-eye"></i></button>
//                         <button class="icon-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
//                         <button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
//                     </td>`;

//                 patientTableBody.appendChild(tr);
//                 attachPatientRowEventListeners(tr);
//             });
//         });
//     }
//     // Attach event listeners to patient row
//     function attachPatientRowEventListeners(row) {
//         // View button
//         row.querySelector('.icon-btn.view-btn').addEventListener('click', function() {
//             showPatientDetails(this.closest('tr'));
//         });
        
//         // Edit button
//         row.querySelector('.icon-btn.edit-btn').addEventListener('click', function() {
//             const patientRow = this.closest('tr');
//             document.getElementById('patientModalTitle').textContent = 'Edit Patient';
            
//             // Populate form
//             document.getElementById('patientName').value = patientRow.cells[1].textContent;
//             document.getElementById('patientAge').value = patientRow.cells[2].textContent;
//             document.getElementById('patientLocation').value = patientRow.cells[3].textContent.toLowerCase();
//             document.getElementById('patientSchool').value = patientRow.cells[4].textContent;
            
//             const statusText = patientRow.cells[6].querySelector('span').textContent.toLowerCase();
//             document.getElementById('patientStatus').value = statusText.includes('progress') ? 
//                 'in-progress' : statusText.includes('complete') ? 'completed' : 'pending';
            
//             document.getElementById('patientFormModal').classList.add('active');
//         });

//         // Delete button with password confirmation
//         row.querySelector('.icon-btn.delete-btn').addEventListener('click', function() {
//             const patientName = this.closest('tr').cells[1].textContent;
//             const patientId = this.closest('tr').dataset.id; // Assuming you have data-id on the row
            
//             // Store reference to the clicked button for later use
//             const deleteBtn = this;
            
//             // Update modal content for this specific action
//             document.querySelector('.pop-up-password h2').textContent = 'Confirm Deletion';
//             document.querySelector('.pop-up-password p').innerHTML = 
//                 `You are about to delete <strong style="font-size: 1.1em">${patientName}</strong>'s permanent record.For security reasons, please confirm your password to proceed.`;
            
//             // Show the modal
//             document.getElementById('passwordModal').classList.add('active');
//             document.getElementById('currentPassword').focus();
            
//             // Set up the confirmation handler
//             const confirmBtn = document.getElementById('confirmBtn');
            
//             // Remove any previous click handlers to avoid duplicates
//             confirmBtn.replaceWith(confirmBtn.cloneNode(true));
//             const newConfirmBtn = document.getElementById('confirmBtn');
            
//             newConfirmBtn.addEventListener('click', async function() {
//                 const password = document.getElementById('currentPassword').value.trim();
//                 const errorMessage = document.getElementById('errorMessage');
//                 const errorText = document.getElementById('errorText');
//                 const btnText = document.getElementById('btnText');
//                 const spinner = document.getElementById('spinner');
                
//                 if (!password) {
//                     errorText.textContent = 'Please enter your current password';
//                     errorMessage.style.display = 'flex';
//                     return;
//                 }
                
//                 // Show loading state
//                 btnText.style.display = 'none';
//                 spinner.style.display = 'block';
//                 newConfirmBtn.disabled = true;
                
//                 try {
//                     // Replace this with your actual API call to verify password and delete
//                     const isPasswordValid = await verifyPassword(password);
                    
//                     if (isPasswordValid) {
//                         // Password is correct - proceed with deletion
//                         await deletePatientRecord(patientId);
                        
//                         // Close modal and remove row
//                         document.getElementById('passwordModal').classList.remove('active');
//                         deleteBtn.closest('tr').remove();
                        
//                         showNotification(`Patient record for ${patientName} deleted successfully`, 'success');
//                     } else {
//                         // Password is incorrect
//                         errorText.textContent = 'Incorrect password. Please try again.';
//                         errorMessage.style.display = 'flex';
//                         document.getElementById('currentPassword').focus();
//                     }
//                 } catch (error) {
//                     console.error('Error:', error);
//                     errorText.textContent = 'An error occurred. Please try again.';
//                     errorMessage.style.display = 'flex';
//                 } finally {
//                     // Reset button state
//                     btnText.style.display = 'block';
//                     spinner.style.display = 'none';
//                     newConfirmBtn.disabled = false;
//                     document.getElementById('currentPassword').value = '';
//                 }
//             });
            
//             // Close modal handlers (unchanged from original)
//             document.getElementById('closeModal').addEventListener('click', closeModal);
//             document.getElementById('cancelBtn').addEventListener('click', closeModal);
            
//             function closeModal() {
//                 document.getElementById('passwordModal').classList.remove('active');
//                 document.getElementById('currentPassword').value = '';
//                 document.getElementById('errorMessage').style.display = 'none';
//             }
//         });

//         // Example API functions (replace with your actual implementations)
//         // async function verifyPassword(password) {
//         //     // In a real app, this would call your backend to verify the password
//         //     // This is just a mock implementation
//         //     return new Promise(resolve => {
//         //         setTimeout(() => {
//         //             resolve(password === "demo123"); // Replace with actual verification
//         //         }, 800);
//         //     });
//         // }

//         // async function deletePatientRecord(patientId) {
//         //     // In a real app, this would call your backend to delete the record
//         //     // This is just a mock implementation
//         //     return new Promise(resolve => {
//         //         setTimeout(() => {
//         //             console.log(`Deleting patient with ID: ${patientId}`);
//         //             resolve(true);
//         //         }, 500);
//         //     });
//         // }
//     }

// // Attach event listeners to admin row
// function attachAdminRowEventListeners(row) {
//     const adminEmail = row.cells[2].textContent;
//     const adminName = row.cells[1].textContent;
//     const statusBadge = row.cells[4].querySelector('span');
//     const currentStatus = statusBadge.textContent;

//     // View button (unchanged)
//     row.querySelector('.icon-btn.view-btn').addEventListener('click', function() {
//         // ... existing view button code ...
//     });

//     // Edit button (unchanged)
//     row.querySelector('.icon-btn.edit-btn').addEventListener('click', function() {
//         // ... existing edit button code ...
//     });

//     // Status toggle button
//     const statusBtn = row.querySelector('.deactivate-btn, .activate-btn');
//     if (statusBtn) {
//         statusBtn.addEventListener('click', function() {
//             const isActivate = this.classList.contains('activate-btn');
//             const newStatus = isActivate ? 'Active' : 'Inactive';
//             const action = isActivate ? 'activate' : 'deactivate';
            
//             showPasswordModal(
//                 `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
//                 `You are about to ${action} <strong>${adminName}</strong>'s admin account.`,
//                 async function() {
//                     try {
//                         const response = await fetch('http://localhost:80/SmileConnector/backend/adminOperations.php', {
//                             method: 'POST',
//                             headers: { 'Content-Type': 'application/json' },
//                             body: JSON.stringify({
//                                 action: 'update_status',
//                                 adminEmail: adminEmail,
//                                 status: newStatus
//                             })
//                         });
                        
//                         const result = await response.json();
//                         if (result.success) {
//                             showNotification(`Admin ${action}d successfully`, 'success');
//                             // Update UI directly
//                             statusBadge.textContent = newStatus;
//                             statusBadge.className = `status-badge ${newStatus.toLowerCase()}`;
                            
//                             // Toggle buttons
//                             if (newStatus === 'Active') {
//                                 statusBtn.className = 'icon-btn deactivate-btn';
//                                 statusBtn.innerHTML = '<i class="fas fa-user-slash"></i>';
//                                 statusBtn.title = 'Deactivate';
//                                 // Remove delete button if exists
//                                 const deleteBtn = row.querySelector('.delete-btn');
//                                 if (deleteBtn) deleteBtn.remove();
//                             } else if (newStatus === 'Inactive') {
//                                 statusBtn.className = 'icon-btn activate-btn';
//                                 statusBtn.innerHTML = '<i class="fas fa-user-check"></i>';
//                                 statusBtn.title = 'Activate';
//                                 // Add delete button
//                                 const deleteBtn = document.createElement('button');
//                                 deleteBtn.className = 'icon-btn delete-btn';
//                                 deleteBtn.title = 'Delete';
//                                 deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
//                                 statusBtn.after(deleteBtn);
//                                 attachDeleteListener(deleteBtn, adminEmail, adminName, row);
//                             }
//                         } else {
//                             throw new Error(result.error || 'Failed to update status');
//                         }
//                     } catch (error) {
//                         showNotification(error.message, 'error');
//                     }
//                 }
//             );
//         });
//     }

//     // Delete button (if exists)
//     const deleteBtn = row.querySelector('.delete-btn');
//     if (deleteBtn) {
//         attachDeleteListener(deleteBtn, adminEmail, adminName, row);
//     }

//     // Helper function for delete button
//     function attachDeleteListener(btn, email, name, row) {
//         btn.addEventListener('click', function() {
//             showPasswordModal(
//                 'Confirm Deletion',
//                 `You are about to permanently delete <strong>${name}</strong>'s admin account.`,
//                 async function() {
//                     try {
//                         const response = await fetch('http://localhost:80/SmileConnector/backend/adminOperations.php', {
//                             method: 'POST',
//                             headers: { 'Content-Type': 'application/json' },
//                             body: JSON.stringify({
//                                 action: 'delete',
//                                 adminEmail: email
//                             })
//                         });
                        
//                         const result = await response.json();
//                         if (result.success) {
//                             showNotification('Admin deleted successfully', 'success');
//                             row.remove();
//                         } else {
//                             throw new Error(result.error || 'Failed to delete admin');
//                         }
//                     } catch (error) {
//                         showNotification(error.message, 'error');
//                     }
//                 }
//             );
//         });
//     }
// }

// // Initialize admin table (unchanged)
// function loadAdminTable() {
//     const adminTableBody = document.getElementById('adminTableBody');
//     adminTableBody.innerHTML = '';
    
//     fetch('http://localhost:80/SmileConnector/backend/superadmindash.php?type=admin')
//         .then(res => res.json())
//         .then(data => {
//             data.forEach(admin => {
//                 let tr = document.createElement('tr');
//                 tr.setAttribute('data-id', admin.AdminID); // Keep ID for reference if needed
                
//                 // Determine buttons based on status
//                 let actionButtons = `
//                     <button class="icon-btn view-btn" title="View Details"><i class="fas fa-eye"></i></button>
//                     <button class="icon-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>`;
                
//                 if (admin.Status === 'Active') {
//                     actionButtons += `<button class="icon-btn deactivate-btn" title="Deactivate"><i class="fas fa-user-slash"></i></button>`;
//                 } else if (admin.Status === 'Inactive') {
//                     actionButtons += `
//                         <button class="icon-btn activate-btn" title="Activate"><i class="fas fa-user-check"></i></button>
//                         <button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>`;
//                 } else if (admin.Status === 'Pending') {
//                     actionButtons += `
//                         <button class="icon-btn deactivate-btn" title="Reject" disabled><i class="fas fa-user-slash"></i></button>
//                         <button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>`;
//                 }
                
//                 tr.innerHTML = `
//                     <td>A${admin.adminID}</td>
//                     <td>${admin.adminFullname}</td>
//                     <td>${admin.adminEmail}</td>
//                     <td>${admin.last_login}</td>
//                     <td><span class="status-badge ${admin.Status.toLowerCase()}">${admin.Status}</span></td>
//                     <td class="action-cell">${actionButtons}</td>`;
                
//                 adminTableBody.appendChild(tr);
//                 attachAdminRowEventListeners(tr);
//             });
//         })
//         .catch(error => {
//             console.error('Error loading admin data:', error);
//             showNotification('Failed to load admin data', 'error');
//         });
// }

// // Initial load
// document.addEventListener('DOMContentLoaded', loadAdminTable);

// // // Initialize admin table
// // function loadAdminTable() {
// //     const adminTableBody = document.getElementById('adminTableBody');
// //     adminTableBody.innerHTML = '';
    
// //     fetch('http://localhost:80/SmileConnector/backend/superadmindash.php?type=admin')
// //         .then(res => res.json())
// //         .then(data => {
// //             data.forEach(admin => {
// //                 let tr = document.createElement('tr');
// //                 tr.setAttribute('data-id', admin.AdminID);
                
// //                 // Determine buttons based on status
// //                 let actionButtons = `
// //                     <button class="icon-btn view-btn" title="View Details"><i class="fas fa-eye"></i></button>
// //                     <button class="icon-btn edit-btn" title="Edit"><i class="fas fa-edit"></i></button>`;
                
// //                 if (admin.Status === 'Active') {
// //                     actionButtons += `<button class="icon-btn deactivate-btn" title="Deactivate"><i class="fas fa-user-slash"></i></button>`;
// //                 } else if (admin.Status === 'Inactive') {
// //                     actionButtons += `
// //                         <button class="icon-btn activate-btn" title="Activate"><i class="fas fa-user-check"></i></button>
// //                         <button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>`;
// //                 } else if (admin.Status === 'Pending') {
// //                     actionButtons += `
// //                         <button class="icon-btn deactivate-btn" title="Reject" disabled><i class="fas fa-user-slash"></i></button>
// //                         <button class="icon-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>`;
// //                 }
                
// //                 tr.innerHTML = `
// //                     <td>A${admin.adminID}</td>
// //                     <td>${admin.adminFullname}</td>
// //                     <td>${admin.adminEmail}</td>
// //                     <td>${admin.last_login}</td>
// //                     <td><span class="status-badge ${admin.Status.toLowerCase()}">${admin.Status}</span></td>
// //                     <td class="action-cell">${actionButtons}</td>`;
                
// //                 adminTableBody.appendChild(tr);
// //                 attachAdminRowEventListeners(tr);
// //             });
// //         })
// //         .catch(error => {
// //             console.error('Error loading admin data:', error);
// //             showNotification('Failed to load admin data', 'error');
// //         });
// // }

// // // Initial load
// // document.addEventListener('DOMContentLoaded', loadAdminTable);

//     // Add modal close handlers
//     document.querySelectorAll('.modal .close-modal, .modal .cancel-btn').forEach(btn => {
//         btn.addEventListener('click', function() {
//             this.closest('.modal').classList.remove('active');
//         });
//     });

//     // Handle edit button in details modal
//     document.querySelector('.edit-from-details')?.addEventListener('click', function() {
//         document.getElementById('adminDetailsModal').classList.remove('active');
        
//         // Get data from details view and populate edit form
//         document.getElementById('adminModalTitle').textContent = 'Edit Admin';
//         document.getElementById('adminName').value = document.getElementById('detailAdminName').textContent;
//         document.getElementById('adminEmail').value = document.getElementById('detailAdminEmail').textContent;
        
//         // Set status based on details view
//         const statusText = document.getElementById('detailAdminStatus').textContent.toLowerCase();
//         document.getElementById('adminStatus').value = statusText.includes('active') ? 'active' : 
//                                                     statusText.includes('inactive') ? 'inactive' : 'pending';
        
//         document.getElementById('adminFormModal').classList.add('active');
//     });

//     function resetAdminForm() {
//         const form = document.getElementById('adminForm');
//         form.reset();
        
//         // Reset readonly/disabled states and clear values
//         const adminName = document.getElementById('adminName');
//         adminName.readOnly = false;
//         adminName.value = '';
        
//         const adminEmail = document.getElementById('adminEmail'); 
//         adminEmail.readOnly = false;
//         adminEmail.value = '';
        
//         const adminStatus = document.getElementById('adminStatus');
//         adminStatus.disabled = false;
//         adminStatus.value = 'Pending';
        
//         // Reset any other specific fields to their default state
//         document.getElementById('permSuperAdmin').checked = false;
        
//         // Clear any validation errors if present
//         const errorElements = form.querySelectorAll('.error-message');
//         errorElements.forEach(el => el.remove());
//     }

//     // Notification system
//     function showNotification(message, type = 'info') {
//         // Remove existing notifications
//         const existing = document.querySelector('.notification');
//         if (existing) {
//             existing.remove();
//         }

//         const notification = document.createElement('div');
//         notification.className = 'notification';
//         notification.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             padding: 15px 20px;
//             border-radius: 5px;
//             color: white;
//             font-weight: bold;
//             z-index: 10001;
//             max-width: 400px;
//             animation: slideIn 0.3s ease-out;
//             cursor: pointer;
//         `;

//         const colors = {
//             success: '#4caf50',
//             error: '#f44336',
//             warning: '#ff9800',
//             info: '#2196f3'
//         };

//         notification.style.background = colors[type] || colors.info;
//         notification.innerHTML = `
//             <div style="display: flex; align-items: center;">
//                 <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" 
//                 style="margin-right: 10px; font-size: 16px;"></i>
//                 <span>${message}</span>
//             </div>
//         `;

//         // Add CSS animation if not already present
//         if (!document.querySelector('style[data-notification-animation]')) {
//             const style = document.createElement('style');
//             style.setAttribute('data-notification-animation', 'true');
//             style.textContent = `
//                 @keyframes slideIn {
//                     from {
//                         transform: translateX(100%);
//                         opacity: 0;
//                     }
//                     to {
//                         transform: translateX(0);
//                         opacity: 1;
//                     }
//                 }
//             `;
//             document.head.appendChild(style);
//         }

//         document.body.appendChild(notification);

//         // Auto remove after 5 seconds or on click
//         const removeNotification = () => {
//             notification.style.animation = 'slideIn 0.3s ease-out reverse';
//             setTimeout(() => notification.remove(), 300);
//         };

//         notification.addEventListener('click', removeNotification);
//         setTimeout(removeNotification, 5000);
//     }