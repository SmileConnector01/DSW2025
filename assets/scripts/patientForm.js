// // Initialize Patient Form Management
// function initPatientManagement() {
//     const patientForm = document.getElementById('patientForm');
//     const patientFormModal = document.getElementById('patientFormModal');
//     const closeBtns = patientFormModal.querySelectorAll('.close-modal, .cancel-btn');

//     // Close modal buttons
//     closeBtns.forEach(btn => {
//         btn.addEventListener('click', () => {
//             patientFormModal.classList.remove('active');
//             clearFormErrors();
//         });
//     });

//     // Form submission handling
//     if (patientForm) {
//         patientForm.addEventListener('submit', function(e) {
//             // Prevent default submission if JavaScript validation fails
//             if (!validatePatientForm()) {
//                 e.preventDefault();
//             } else {
//                 // If validation passes, let the form submit normally
//                 // Show loading state
//                 const saveBtn = document.querySelector('.save-btn');
//                 if (saveBtn) {
//                     const originalText = saveBtn.textContent;
//                     saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
//                     saveBtn.disabled = true;
                    
//                     // Reset button after timeout (in case submission takes long)
//                     setTimeout(() => {
//                         saveBtn.innerHTML = originalText;
//                         saveBtn.disabled = false;
//                     }, 3000);
//                 }
//             }
//         });
//     }

//     // Add event listener for Edit Patient buttons
//     document.addEventListener('click', function(e) {
//         if (e.target && e.target.matches('.edit-patient-btn, .edit-patient-btn *')) {
//             const btn = e.target.closest('.edit-patient-btn');
//             const patientId = btn.dataset.id;
//             if (patientId) {
//                 openEditPatientForm(patientId);
//             }
//         }
//     });

//     // Initialize file upload handling
//     initFileUpload();
    
//     // Check for URL parameters that might indicate success/error
//     checkUrlForMessages();
// }

// // Validate the entire patient form
// function validatePatientForm() {
//     let isValid = true;
//     clearFormErrors();

//     // Validate required fields
//     const requiredFields = [
//         'patientName', 'patientBirthdate', 'patientLocation',
//         'patientSchool', 'guardianName', 'patientStatus'
//     ];

//     requiredFields.forEach(fieldId => {
//         const field = document.getElementById(fieldId);
//         if (!field.value.trim()) {
//             const label = field.closest('.form-group').querySelector('label');
//             showError(field, `${label.textContent} is required`);
//             isValid = false;
//         }
//     });

//     // Validate birthdate specifically
//     const birthdateInput = document.getElementById('patientBirthdate');
//     if (birthdateInput.value && !validateBirthdate(birthdateInput)) {
//         showError(birthdateInput, 'Patient must be between 0 to 15 years old');
//         isValid = false;
//     }

//     if (!isValid) {
//         showToast('Please fix the errors in the form', 'error');
//     }

//     return isValid;
// }

// // Function to validate birthdate
// function validateBirthdate(input) {
//     if (!input.value) return false;

//     const selectedDate = new Date(input.value);
//     const today = new Date();
//     let age = today.getFullYear() - selectedDate.getFullYear();
//     const m = today.getMonth() - selectedDate.getMonth();

//     if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
//         age--;
//     }

//     return age >= 0 && age <= 15;
// }

// // Function to open edit form
// function openEditPatientForm(patientId) {
//     // Set form title for edit mode
//     document.getElementById('patientModalTitle').textContent = 'Edit Patient';

//     // Create hidden input for patient ID if it doesn't exist
//     let patientIdInput = document.getElementById('patientId');
//     if (!patientIdInput) {
//         patientIdInput = document.createElement('input');
//         patientIdInput.type = 'hidden';
//         patientIdInput.name = 'patientId';
//         patientIdInput.id = 'patientId';
//         document.getElementById('patientForm').appendChild(patientIdInput);
//     }
//     patientIdInput.value = patientId;

//     // Fetch patient data and populate form
//     fetchPatientData(patientId);
    
//     // Show the modal
//     document.getElementById('patientFormModal').classList.add('active');
// }

// // Fetch patient data for editing
// function fetchPatientData(patientId) {
//     fetch(`../backend/getPatient.php?id=${patientId}`)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.status === 'success') {
//                 populateForm(data.data);
//             } else {
//                 showToast(data.message || 'Failed to load patient data', 'error');
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching patient data:', error);
//             showToast('Error loading patient data', 'error');
//         });
// }

// // Populate form with patient data
// function populateForm(patientData) {
//     document.getElementById('patientName').value = patientData.childFullName || '';
//     document.getElementById('patientBirthdate').value = patientData.birthday || '';
//     document.getElementById('patientLocation').value = patientData.location || '';
//     document.getElementById('patientSchool').value = patientData.school || '';
//     document.getElementById('guardianName').value = patientData.guardianName || '';
//     document.getElementById('patientStatus').value = patientData.treatmentStatus || 'pending';
//     document.getElementById('medicalNotes').value = patientData.medicalNotes || '';
    
//     // Update file list if files exist
//     if (patientData.patientRecords) {
//         updateFileList(patientData.patientRecords.split(','));
//     }
// }

// // Function to initialize file upload UI
// function initFileUpload() {
//     const fileInput = document.getElementById('patientRecords');
//     const fileInfo = document.querySelector('.uploaded-files .file-info');

//     if (fileInput && fileInfo) {
//         fileInput.addEventListener('change', function() {
//             if (this.files.length === 0) {
//                 fileInfo.textContent = 'No files uploaded';
//                 return;
//             }
            
//             fileInfo.innerHTML = '';
//             Array.from(this.files).forEach(file => {
//                 const fileItem = document.createElement('div');
//                 fileItem.className = 'file-item';
//                 fileItem.innerHTML = `
//                     <i class="fas fa-file"></i>
//                     <span>${file.name}</span>
//                     <small>(${formatFileSize(file.size)})</small>
//                 `;
//                 fileInfo.appendChild(fileItem);
//             });
//         });
//     }
// }

// // Update file list with existing files
// function updateFileList(files) {
//     const fileInfo = document.querySelector('.uploaded-files .file-info');

//     if (fileInfo && files.length > 0) {
//         fileInfo.innerHTML = '';
//         files.forEach(fileName => {
//             const fileItem = document.createElement('div');
//             fileItem.className = 'file-item existing';
//             fileItem.innerHTML = `
//                 <i class="fas fa-file"></i>
//                 <span>${fileName}</span>
//             `;
//             fileInfo.appendChild(fileItem);
//         });
//     }
// }

// // Format file size
// function formatFileSize(bytes) {
//     if (bytes === 0) return '0 Bytes';

//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));

//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// }

// // Show error on a specific field
// function showError(field, message) {
//     const formGroup = field.closest('.form-group');
//     if (!formGroup) return;
    
//     // Add error class
//     formGroup.classList.add('error');
    
//     // Create or update error message
//     let errorElement = formGroup.querySelector('.error-message');
//     if (!errorElement) {
//         errorElement = document.createElement('div');
//         errorElement.className = 'error-message';
//         formGroup.appendChild(errorElement);
//     }
//     errorElement.textContent = message;
    
//     // Scroll to the first error
//     if (!window.firstErrorShown) {
//         field.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         window.firstErrorShown = true;
//     }
// }

// // Clear all error highlights
// function clearFormErrors() {
//     document.querySelectorAll('.form-group.error').forEach(group => {
//         group.classList.remove('error');
//         const errorElement = group.querySelector('.error-message');
//         if (errorElement) {
//             errorElement.remove();
//         }
//     });
//     window.firstErrorShown = false;
// }

// // Check URL for success/error messages
// function checkUrlForMessages() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const status = urlParams.get('status');
//     const message = urlParams.get('message');
    
//     if (status && message) {
//         showToast(message, status);
        
//         // Clean URL
//         const cleanUrl = window.location.pathname;
//         window.history.replaceState({}, document.title, cleanUrl);
//     }
// }

// // Toast notification function
// function showToast(message, type = 'success') {
//     // Remove any existing toasts
//     document.querySelectorAll('.toast-notification').forEach(toast => {
//         toast.remove();
//     });
    
//     // Create new toast
//     const toast = document.createElement('div');
//     toast.className = `toast-notification ${type}`;
//     toast.innerHTML = `
//         <div class="toast-icon">
//             ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>'}
//         </div>
//         <div class="toast-message">${message}</div>
//     `;
//     document.body.appendChild(toast);

//     // Show toast
//     setTimeout(() => {
//         toast.classList.add('show');
//     }, 100);

//     // Hide after delay
//     setTimeout(() => {
//         toast.classList.remove('show');
//         setTimeout(() => {
//             toast.remove();
//         }, 300);
//     }, 5000);
// }

// // Initialize when DOM is loaded
// document.addEventListener('DOMContentLoaded', initPatientManagement);