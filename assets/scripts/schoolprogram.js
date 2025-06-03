// Add to your existing JavaScript
function openAddEventModal() {
  const addModal = document.getElementById('addEventModal');
  if (addModal) {
    // Reset form and set default values
    const form = document.getElementById('addEventForm');
    if (form) {
      form.reset();
    }
    
    // Open using your existing modal function
    openModal(addModal);
  }
}

function initAddEventButton() {
  const addBtn = document.getElementById('add_event');
  if (addBtn) {
    addBtn.addEventListener('click', openAddEventModal);
  }

  let addForm = document.getElementById('addEventForm');
  // Form submission handler
// Form submission handler
addForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Clear previous errors
  document.querySelectorAll('.form-input.error').forEach(el => {
    el.classList.remove('error');
  });

  // Validate required fields
  const requiredFields = [
    { id: 'addEventSchool', name: 'School' },
    { id: 'addEventDateTime', name: 'Date & Time' },
    { id: 'addEventStudents', name: 'Students' }
  ];

  let isValid = true;
  requiredFields.forEach(field => {
    const input = document.getElementById(field.id);
    if (!input.value.trim()) {
      input.classList.add('error');
      isValid = false;
    }
  });

  if (!isValid) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  // Prepare form data
  const formData = new FormData();
  formData.append('school', document.getElementById('addEventSchool').value);
  formData.append('date_time', document.getElementById('addEventDateTime').value);
  formData.append('students', document.getElementById('addEventStudents').value);
  formData.append('gradeRange', document.getElementById('addEventGradeRange').value);
  formData.append('location', document.getElementById('addEventLocation').value);
  formData.append('contact', document.getElementById('addEventContact').value);
  formData.append('status', 'planned'); // Default status

  // Add AJAX request
  fetch('http://localhost:80/SmileConnector/backend/add_event.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.text().then(text => {
  console.log('RAW RESPONSE:', text);
  return JSON.parse(text);
}))
  .then(data => {
    if (data.success) {
      showNotification('Event added successfully!', 'success');
      closeModal(document.getElementById('addEventModal'));
      if (typeof initSchoolProgramsTab === 'function') {
        initSchoolProgramsTab();
      }
    } else {
      throw new Error(data.message || 'Failed to add event');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showNotification('Error: ' + error.message, 'error');

  });
});

  // Handle cancel button
  const cancelBtn = document.querySelector('#addEventModal .cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
      const modal = document.getElementById('addEventModal');
      if (modal) closeModal(modal);
    });
  }

  // Optional: also allow clicking the X button to close
  const closeBtn = document.querySelector('#addEventModal .close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      const modal = document.getElementById('addEventModal');
      if (modal) closeModal(modal);
    });
  }
}

function isTimePassed(dateTimeString) {
  // Replace space with 'T' to make it ISO-8601 compatible
  const isoFormatted = dateTimeString.replace(' ', 'T');
  const eventDate = new Date(isoFormatted);
  const now = new Date();
  
  // Validate the date was parsed correctly
  if (isNaN(eventDate.getTime())) {
    console.error("Invalid date format:", dateTimeString);
    return false;
  }
  
  return eventDate < now;
}

// Fetch planned visits
const plannedVisitsList = document.getElementById('planned-visits-list');
const completedVisitsList = document.getElementById('completed-visits-list');

fetch('http://localhost:80/SmileConnector/backend/readevent.php?type=upcoming_event')
    .then(res => res.json())
    .then(data => {

    data.forEach(coming_event => {
        // Usage example:
        const eventTime = coming_event.date; // From your form
        if (isTimePassed(eventTime)) {
            // To insert a new event:
            fetch('http://localhost:80/SmileConnector/backend/add_past_event.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                school: coming_event.school,
                date_time: coming_event.date,
                students: coming_event.students,
                gradeRange: coming_event.gradeRange,
                location: coming_event.location,
                contact: coming_event.contact,
                status: 'completed',
            })
            })
            .then(r => r.json())
            .then(console.log);

            // To delete an event with ID
            fetch('http://localhost:80/SmileConnector/backend/delete_upcoming_event.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: coming_event.id })
            })
            .then(r => r.json())
            .then(console.log);                
        } 
        else {
            // Render planned visits
            plannedVisitsList.innerHTML += `
            <div class="school-visit-card" data-id="${coming_event.id}">
                <div class="school-visit-header">
                <span class="school-name">${coming_event.school}</span>
                <span class="visit-date">${formatDate(coming_event.date)}</span>
                </div>
                <span class="status-badge status-${coming_event.date}">${capitalizeFirst(coming_event.status)}</span>

                <div class="school-details">
                <div class="detail-item">
                    <span class="detail-label">Students</span>
                    <span class="detail-value">${coming_event.students}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Grades</span>
                    <span class="detail-value">${coming_event.gradeRange}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${coming_event.location}</span>
                </div>
                </div>

                <div class="school-actions">
                <button
                    class="action-btn secondary-btn"
                    data-id="${coming_event.id}"
                    data-school="${coming_event.school}"
                    data-date="${coming_event.date}"
                    data-students="${coming_event.students}"
                    data-grade-range="${coming_event.gradeRange}"
                    data-location="${coming_event.location}"
                >
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn primary-btn delete-btn">
                <i class="fas fa-trash-alt"></i> Delete
                </button>
                </div>
            </div>
            `;
        }
    });
});

plannedVisitsList.addEventListener('click', e => {
  const btn = e.target.closest('.secondary-btn');
  if (!btn) return;

  const { id, school, date, students, gradeRange, location } = btn.dataset;
  const editModal = document.getElementById('editPlannedVisitModal');
  const editForm  = document.getElementById('editPlannedVisitForm');
  
  // populate fields
  editForm.elements['id'].value         = id;
  editForm.elements['school'].value     = school;
  editForm.elements['date'].value       = date.split(' ')[0];
  editForm.elements['students'].value   = students;
  editForm.elements['gradeRange'].value = gradeRange;
  editForm.elements['location'].value   = location;

  // show modal
  openModal(editModal);

    // Save changes
    editForm.addEventListener('submit', e => {
    e.preventDefault();

    // Gather the form data
    const formData = {
        id:       editForm.elements['id'].value,
        school:   editForm.elements['school'].value,
        date:     editForm.elements['date'].value,       // YYYY-MM-DD
        students: editForm.elements['students'].value,
        gradeRange: editForm.elements['gradeRange'].value,
        location: editForm.elements['location'].value
    };

    fetch('http://localhost:80/SmileConnector/backend/update_upcoming_event.php', {
        method: 'POST',              // or PUT, if you prefer
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
        // 1) Update the card in the DOM to reflect changes:
        const card = plannedVisitsList.querySelector(`.school-visit-card[data-id="${formData.id}"]`);
        card.querySelector('.school-name').textContent = formData.school;
        card.querySelector('.visit-date').textContent = formatDate(formData.date);
        card.querySelector('.detail-item .detail-value:nth-child(2)').textContent = formData.students;
        card.querySelector('.detail-item .detail-value:nth-child(4)').textContent = formData.gradeRange;
        card.querySelector('.detail-item .detail-value:nth-child(6)').textContent = formData.location;
        
        // 2) Close the modal
        openModal(editModal, false);
        } else {
        showNotification('Failed to save changes.', 'error');
        console.error(result);
        }
    })
    .catch(err => {
        console.error('Error updating event:', err);
        showNotification('An error occurred while updating the event.', 'error');
    });
    });

});

// Helper function to capitalize first letter
function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

plannedVisitsList.addEventListener('click', e => {
  const deleteBtn = e.target.closest('.delete-btn');
  if (!deleteBtn) return;

  const card = deleteBtn.closest('.school-visit-card');
  const id = card.dataset.id;

  // Use pop-up password modal before deleting
  window.showPasswordModal(
    'Confirm Deletion',
    'You are about to delete this event. For security reasons, please confirm your password to proceed.',
    function() {
      // Only runs if password is correct
      fetch('http://localhost:80/SmileConnector/backend/delete_btn_coming_event.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      })
      .then(res => res.json())
      .then(result => {
        console.log(result);
        if (result.message && result.message.includes('success')) {
          card.remove(); // Remove the card from DOM
          showNotification('Event deleted successfully!', 'success');
        } else {
          showNotification('Failed to delete event.', 'error');
        }
      })
      .catch(err => {
        console.error('Delete failed:', err);
        showNotification('An error occurred.', 'error');
      });
    }
  );
});


let cancelEditBtn = document.querySelector('#editPlannedVisitModal .cancel-btn');
cancelEditBtn.addEventListener('click', function () {
    const modal = document.getElementById('editPlannedVisitModal');
    if (modal) closeModal(modal);
});

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

fetch('http://localhost:80/SmileConnector/backend/readevent.php?type=past_event')
    .then(res => res.json())
    .then(data => {
    
    data.forEach(past_event => {
            // Render planned visits
      completedVisitsList.innerHTML += `
        <div class="school-visit-card" data-id="${past_event.id}">
          <div class="school-visit-header">
            <span class="school-name">${past_event.school}</span>
            <span class="visit-date">${formatDate(past_event.date)}</span>
          </div>
          <span class="status-badge status-${past_event.status}">
            ${capitalizeFirst(past_event.status)}
          </span>

          <div class="school-details">
            <div class="detail-item">
              <span class="detail-label">Students</span>
              <span class="detail-value">
                ${past_event.students}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Treatments</span>
              <span class="detail-value">${past_event.treatments}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Follow-ups</span>
              <span class="detail-value">${past_event.followUps}</span>
            </div>
          </div>

          <div class="school-actions">
            <button
              class="action-btn secondary-btn edit-btn"
              data-id="${past_event.id}"
              data-cavities="${past_event.cavities}"
              data-gumdisease="${past_event.gumdisease}"
              data-toothloss="${past_event.toothloss}"
              data-other="${past_event.other}"
              data-treatment="${past_event.treatments}"
              data-followups="${past_event.followUps}"
              data-title="${past_event.video_title}"
              data-description="${past_event.video_description}"
              data-category="${past_event.video_category}"
              data-url="${past_event.video_url}"
            >
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-btn primary-btn analytics-btn">
              <i class="fas fa-chart-line"></i> Analytics
            </button>
          </div>
        </div>
      `;
    });
});

let editVisitModal = document.getElementById('editVisitModal');

completedVisitsList.addEventListener('click', e => {
    const analyticsBtn = e.target.closest('.primary-btn');

  if (analyticsBtn && analyticsBtn.textContent.includes('Analytics')) {
    const card = analyticsBtn.closest('.school-visit-card');
    const schoolName = card.querySelector('.school-name').textContent;
    const visitDate = card.querySelector('.visit-date').textContent;
    
    // Example static placeholders (replace with actual data if you have it)
    const students = card.querySelector('.detail-item:nth-child(1) .detail-value').textContent.trim();
    const treatments = card.querySelector('.detail-item:nth-child(2) .detail-value').textContent.trim();
    const followUps = card.querySelector('.detail-item:nth-child(3) .detail-value').textContent.trim();

    // Fill modal fields
    document.getElementById('analyticsSchoolName').textContent = schoolName;
    document.getElementById('analyticsVisitDate').textContent = `Visit Date: ${visitDate}`;
    document.getElementById('analyticsScreened').textContent = students;
    document.getElementById('analyticsTreatments').textContent = treatments;
    document.getElementById('analyticsFollowUps').textContent = followUps;

    // Open modal
    openModal(document.getElementById('completedVisitAnalyticsModal'));
  }
});

// Target the Analytics modal
const analyticsModal = document.getElementById('completedVisitAnalyticsModal');

// Attach event listeners to all elements with .close-modal inside the modal
analyticsModal.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    closeModal(analyticsModal);
  });
});

// 1) Open modal & populate fields when Edit is clicked
completedVisitsList.addEventListener('click', e => {
  const btn = e.target.closest('.edit-btn');
  if (!btn) return;

  const id        = btn.dataset.id;
  const form      = document.getElementById('editVisitForm');
  // map data-* → form fields
  form.id.value                  = id;
  form.cavities.value            = btn.dataset.cavities;
  form.gumdisease.value          = btn.dataset.gumdisease;
  form.toothloss.value           = btn.dataset.toothloss;
  form.other.value               = btn.dataset.other;
  form.treatments.value          = btn.dataset.treatment;
  form.followUps.value           = btn.dataset.followups;
  form.video_title.value         = btn.dataset.title;
  form.video_description.value   = btn.dataset.description;
  form.video_category.value      = btn.dataset.category;
  // clear previous file & duration
  document.getElementById('editVideoFile').value = '';
  document.querySelector('#editVisitForm .duration-display').textContent = '';

  openModal(editVisitModal);
});

// 2) Close modal
document.querySelector('#editVisitModal .close-modal')
  .addEventListener('click', function(e){
    closeModal(editVisitModal)
  });
document.querySelector('#editVisitModal .cancel-btn')
  .addEventListener('click', function(e){
    closeModal(editVisitModal)
  });

// 3) Capture video duration
document.getElementById('editVideoFile')
  .addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const secs = video.duration;
      document.querySelector('#editVisitForm .duration-display')
              .textContent = `Duration: ${secs.toFixed(2)}s`;
      // stash on form for submission
      document.getElementById('editVisitForm').dataset.duration = secs;
    };
    video.src = URL.createObjectURL(file);
  });

// 4) Handle Save (form submit) via AJAX
document.getElementById('editVisitForm')
  .addEventListener('submit', e => {
    e.preventDefault();
    const form     = e.target;
    const formData = new FormData(form);
    closeModal(editVisitModal);
    if (form.dataset.duration) {
      formData.append('video_duration', form.dataset.duration);
    }

    fetch('http://localhost:80/SmileConnector/backend/update_past_event.php', {
  method: 'POST',
  body: formData
})
.then(res => res.text())      // ← get raw text first
.then(text => {
  return JSON.parse(text);   // now parse manually
})
.then(json => {
  if (json.success) {
    showNotification('Updated successfully!', 'success');
    closeModal(editVisitModal);
  } else {
    console.error('Server error:', json.message || json.error);
  }
})
.catch(err => console.error('Network error:', err));

  });

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

    // Add CSS animation
    const style = document.createElement('style');
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

    document.body.appendChild(notification);

    // Auto remove after 5 seconds or on click
    const removeNotification = () => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    };

    notification.addEventListener('click', removeNotification);
    setTimeout(removeNotification, 5000);
}