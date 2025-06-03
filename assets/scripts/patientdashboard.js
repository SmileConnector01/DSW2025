document.addEventListener('DOMContentLoaded', function() {
  // Initialize all tabs and set dashboard as default
  initializeApplication();
  initializeDentalRecordsTabs();
  // Add this to your existing JavaScript
document.getElementById('communityFeedback').addEventListener('input', function() {
    const charCount = this.value.length;
    const counter = document.getElementById('feedbackCounter') || 
                   document.createElement('div');
    
    if (!document.getElementById('feedbackCounter')) {
        counter.id = 'feedbackCounter';
        counter.style.fontSize = '0.8em';
        counter.style.color = '#666';
        counter.style.textAlign = 'right';
        counter.style.marginTop = '5px';
        this.parentNode.appendChild(counter);
    }
    
    counter.textContent = `${charCount}/500 characters`;
    
    if (charCount > 500) {
        counter.style.color = '#EA4335';
    } else if (charCount > 400) {
        counter.style.color = '#FBBC05';
    } else {
        counter.style.color = '#666';
    }
});
  // Community feedback form submission handler with loading spinner
  document.getElementById('communityForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const form = this;
      const formData = new FormData(form);
      const submitButton = form.querySelector('button[type="submit"]');
      
      // Store original button text and show spinner
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitButton.disabled = true;
      
      // Add action identifier for the PHP backend
      formData.append('action', 'community_feedback');
      
      // Debugging: Log form data before submission
      console.log('Community feedback submission data:', Object.fromEntries(formData.entries()));
      
      fetch(form.action, {
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
              showNotification(data.message || 'Thank you for your feedback!', 'success');
              
              // Reset form on success
              form.reset();
              
              // Close modal if this form is in one (optional)
              const modal = form.closest('.modal');
              if (modal) {
                  modal.classList.remove('active');
              }
              
              // You could add specific refresh logic here if needed
              // For example, if you display feedback history somewhere:
              // if (typeof loadFeedbackHistory === 'function') {
              //     loadFeedbackHistory();
              // }
          } else {
              showNotification(data.message || 'Failed to send feedback. Please try again.', 'error');
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

  const logoutLink = document.getElementById('logoutLink');
  //Fetching username from the backend
    const username = document.querySelectorAll('.user-name');
    const email = document.querySelectorAll(".user-email");
    const urlParams = new URLSearchParams(window.location.search);
    const fullName = urlParams.get('username') || "User";
    const Email = urlParams.get('email');

    username.forEach((userName =>{
        userName.textContent = fullName;
    }))

    email.forEach((mail =>{
        mail.textContent = Email;
    }))
    document.getElementById('fullName').value = fullName;
    document.getElementById('email').value = Email;

    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
          e.preventDefault(); // Prevent link from navigating
      
          fetch("../backend/logout.php", { method: "GET" })
              .then(response => {
                  if (response.ok) {
                      sessionStorage.clear();
                      localStorage.clear();

                      window.location.href = '../logins/login.html';
                  } else {
                      throw new Error('Logout failed');
                  }
              })
              .catch(error => {
                  console.error('Logout error:', error);
                    showNotification('Failed to logout. Please try again.', 'error');
              });
      });
    }
    
  // Tab navigation
  const navLinks = document.querySelectorAll('.nav-item a');
  const contentSections = document.querySelectorAll('.content-section');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links and sections
      navLinks.forEach(navLink => navLink.classList.remove('active'));
      contentSections.forEach(section => section.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Show corresponding section
      const targetId = this.id.replace('Link', 'Content');
      document.getElementById(targetId).classList.add('active');
      
      // Update page title
      updatePageTitle(this.id);
      
      // Initialize specific tab content if needed
      if (this.id === 'appointmentsLink') {
        initializeAppointmentsTab();
      }
      
      // Update page title
      const pageTitle = document.getElementById('pageTitle');
      if (this.id === 'dashboardLink') {
        pageTitle.textContent = 'Patient Dashboard';
      } else if (this.id === 'appointmentsLink') {
        pageTitle.textContent = 'Appointments';
        initializeAppointmentsTab();
      } else if (this.id === 'recordsLink') {
        pageTitle.textContent = 'Dental Records';
      } else if (this.id === 'messagesLink') {
        pageTitle.textContent = 'Messages';
      } else if (this.id === 'teleDentistryLink') {
        pageTitle.textContent = 'Tele-Dentistry';
      } else if (this.id === 'billingLink') {
        pageTitle.textContent = 'Billing';
      } else if (this.id === 'settingsLink') {
        pageTitle.textContent = 'Settings';
      }
        // when you hide/remove the iframe
        if(document.getElementById('videoconferenceIframe')) {
            const iframeid = document.getElementById('videoconferenceIframe');
            iframeid.contentWindow.postMessage({ cmd: 'stop-camera' }, '*');
          }
    });
  });
   // Set dashboard as active by default
  document.getElementById('dashboardLink').classList.add('active');
  document.getElementById('dashboardContent').classList.add('active');

  // // Mobile menu toggle
  // const menuToggle = document.getElementById('menuToggle');
  // const sidebar = document.querySelector('.sidebar');
  
  // menuToggle.addEventListener('click', function() {
  //   sidebar.classList.toggle('expanded');
  // });
   const nextStepBtn = document.getElementById('nextStepBtn');
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', nextStep);
  }
  const prevStepBtn = document.getElementById('prevStepBtn');
  if (prevStepBtn) {
    prevStepBtn.addEventListener('click', prevStep);
  }
  const confirmBookingBtn = document.getElementById('confirmBookingBtn');
  if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener('click', confirmBooking);
  }
  // User dropdown toggle
  const userProfile = document.getElementById('userProfile');
  
  userProfile.addEventListener('click', function() {
    document.querySelector('.user-dropdown').classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!userProfile.contains(e.target)) {
      document.querySelector('.user-dropdown').classList.remove('show');
    }
  });
  
  // Initialize dashboard
  initializeDashboard();
});

function initializeApplication() {

  document.getElementById('addChildInModal')?.addEventListener('click', function() {
    openAddChildModal();
  });
  // Initialize dashboard
  initializeDashboard();
  
  // Pre-load appointments tab content
  initializeAppointmentsTab();
  
  // Initialize modals if they exist on page load
  if (document.getElementById('bookingModal')) {
    initializeBookingModal();
  }
  
  if (document.getElementById('addChildModal')) {
    initializeAddChildModal();
  }
}

function updatePageTitle(tabId) {
  const pageTitle = document.getElementById('pageTitle');
  const titles = {
    'dashboardLink': 'Patient Dashboard',
    'appointmentsLink': 'Appointments',
    'recordsLink': 'Dental Records',
    'messagesLink': 'Messages',
    'teleDentistryLink': 'Tele-Dentistry',
    'billingLink': 'Billing',
    'settingsLink': 'Settings'
  };
  
  pageTitle.textContent = titles[tabId] || 'Patient Portal';
}

// Update your initializeAppointmentsTab function
function initializeAppointmentsTab() {
  // Tab switching within appointments
  const appointmentTabs = document.querySelectorAll('.appointments-container .tab-btn');
  const appointmentTabContents = document.querySelectorAll('.appointments-container .tab-content');
  
  appointmentTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs and contents
      appointmentTabs.forEach(t => t.classList.remove('active'));
      appointmentTabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Show corresponding content
      const targetId = this.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
      
      // If viewing appointments, load them
      if (targetId === 'view-appointments') {
        loadAppointments();
      }
    });
  });
  
  // Set default active tab if none is active
  if (!document.querySelector('.appointments-container .tab-btn.active')) {
    document.querySelector('.appointments-container .tab-btn').classList.add('active');
    document.querySelector('.appointments-container .tab-content').classList.add('active');
    loadAppointments();
  }
  
  // Start booking process
  document.getElementById('startBookingBtn')?.addEventListener('click', function() {
    openBookingModal();
  });
  
  // Add new child button
  document.getElementById('addNewChildBtn')?.addEventListener('click', function() {
    openAddChildModal();
  });
  
  // Initialize filter events
  document.getElementById('statusFilter')?.addEventListener('change', function() {
    filterAppointments();
  });
  
  
}

fetch('http://localhost/SmileConnector/backend/fetch_appoitments.php?type=calendar_event')
  .then(response => response.json())
  .then(data => {
    let appointmentList = document.getElementById('childrenList');
    let appointmentsHeader = document.getElementById('appointmentslist');
    appointmentList.innerHTML = ''; // Clear previous entries if needed
    appointmentsHeader.innerHTML = ''; // Clear previous header if needed

    data.forEach(event => {
      // Parse and format start_datetime (YYYY-MM-DD HH:MM:SS)
      const [datePart, timePart] = event.start_datetime.split(' ');
      const [year, month, day] = datePart.split('-');
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const monthText = monthNames[parseInt(month, 10) - 1];
      const formattedTime = timePart.slice(0, 5); // e.g. "14:30"

      appointmentList.innerHTML += `
        <div class="appointment-card" id="${event.id}">
          <div class="appointment-date">
            <div class="appointment-day">${day}</div>
            <div class="appointment-month">${monthText}</div>
          </div>
          <div class="appointment-details">
            <h3>${event.title}</h3>
            <p class="appointment-time">${formattedTime}</p>
            <p class="appointment-child">${event.childFullName}</p>
          </div>
        </div>
      `;

      // Compare event date with current time
      const eventDateTime = new Date(event.start_datetime);
      const now = new Date();
      const appointmentTitle = eventDateTime < now ? "Past Appointment" : "Upcoming Appointment";

      appointmentsHeader.innerHTML += `
        <h3>${appointmentTitle}</h3>
        <div class="appointment-card" id="${event.id}">
          <div class="appointment-date">
            <div class="appointment-day">${day}</div>
            <div class="appointment-month">${monthText}</div>
          </div>
          <div class="appointment-details">
            <h3>${event.title}</h3>
            <p class="appointment-time">${formattedTime}</p>
            <p class="appointment-child">${event.childFullName}</p>
          </div>
        </div>
      `;
    });
  })
  .catch(error => console.error("Error fetching calendar events:", error));

// Add this new function to handle filtering
  function filterAppointments() {
  const statusFilter = document.getElementById('statusFilter').value;
  const searchValue = document.getElementById('searchChild').value.trim().toLowerCase();

  const appointmentItems = document.querySelectorAll('.appointment-item');

  appointmentItems.forEach(item => {
    const status = item.querySelector('.appointment-status').classList[1].replace('status-', '');
    const child = item.querySelector('.appointment-item-info p').textContent.split('•')[0].trim().toLowerCase();

    const statusMatch = statusFilter === 'all' || status === statusFilter;
    const searchMatch = !searchValue || child.includes(searchValue);

    if (statusMatch && searchMatch) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
  
  // Update counts
  const visibleAppointments = document.querySelectorAll('.appointment-item[style="display: flex;"]');
  document.querySelectorAll('.appointment-count').forEach(el => {
    if (el.closest('#upcomingAppointments')) {
      const count = document.querySelectorAll('#upcomingAppointments .appointment-item[style="display: flex;"]').length;
      el.textContent = `${count} appointment${count !== 1 ? 's' : ''}`;
    } else {
      const count = document.querySelectorAll('#pastAppointments .appointment-item[style="display: flex;"]').length;
      el.textContent = `${count} appointment${count !== 1 ? 's' : ''}`;
    }
  });
}

function initializeDashboard() {  
  // Quick action cards
  const bookAppointmentCard = document.getElementById('bookAppointmentCard');
  const viewRecordsCard = document.getElementById('viewRecordsCard');
  const startConsultationCard = document.getElementById('startConsultationCard');
  // const healthTipsCard = document.getElementById('healthTipsCard');

  const oralTipsModal = document.getElementById('oralTipsModal');
  const closeOralTipsModal = document.getElementById('closeOralTipsModal');
  const healthTipsCard = document.getElementById('healthTipsCard');

  if (healthTipsCard && oralTipsModal && closeOralTipsModal) {
    healthTipsCard.addEventListener('click', function() {
      oralTipsModal.style.display = 'flex';
    });
    closeOralTipsModal.addEventListener('click', function() {
      oralTipsModal.style.display = 'none';
    });
    // Optional: close modal when clicking outside the modal content
    oralTipsModal.addEventListener('click', function(e) {
      if (e.target === oralTipsModal) oralTipsModal.style.display = 'none';
    });
  }

  bookAppointmentCard.addEventListener('click', function() {
    // Switch to appointments tab and start booking process
    document.getElementById('appointmentsLink').click();
    document.querySelector('[data-tab="book-appointment"]').click();
    document.getElementById('startBookingBtn').click();
  });
  
  viewRecordsCard.addEventListener('click', function() {
    document.getElementById('recordsLink').click();
  });
  
  startConsultationCard.addEventListener('click', function() {
    document.getElementById('teleDentistryLink').click();
  });
  
  // View all appointments link
  document.getElementById('viewAllAppointments').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('appointmentsLink').click();
  });
  
  // View all records link
  document.getElementById('viewAllRecords').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('recordsLink').click();
  });
}

let button_tele_dentistry = document.getElementById("tele-dentistry-content");

button_tele_dentistry.addEventListener("click", function(event) {
  event.preventDefault();
  loadTeleDentistry();
})

// Tab switching functionality for TeleDentistry
    function loadTeleDentistry() {
    const container = document.getElementById('teleDentistryContent');
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create an iframe to load the video conference
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'videoconferenceIframe');
    iframe.src = 'https://frontend-g13j.onrender.com';
    iframe.setAttribute('allow', 'microphone; camera; display-capture');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '600px'; // Adjust as needed
    
    container.appendChild(iframe);
    
    // Activate the tab (same as your existing tab switching code)
    document.querySelectorAll('.sidebar li').forEach(l => l.classList.remove('active'));
    container.classList.add('active');
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === 'teledentistry') {
            pane.classList.add('active');
        }
    });
}

// appointments.js - Appointment specific logic
function initializeAppointmentsTab() {
  // Tab switching within appointments
  const appointmentTabs = document.querySelectorAll('.appointments-container .tab-btn');
  const appointmentTabContents = document.querySelectorAll('.appointments-container .tab-content');
  
  appointmentTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs and contents
      appointmentTabs.forEach(t => t.classList.remove('active'));
      appointmentTabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Show corresponding content
      const targetId = this.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
      
      // If viewing appointments, load them
      if (targetId === 'view-appointments') {
        loadAppointments();
      }
    });
  });
  
  // Start booking process
  document.getElementById('startBookingBtn').addEventListener('click', function() {
    openBookingModal();
  });
  
  // Add new child button
  document.getElementById('addNewChildBtn').addEventListener('click', function() {
    openAddChildModal();
  });
  
  // Load appointments if view-appointments is active
  if (document.getElementById('view-appointments').classList.contains('active')) {
    loadAppointments();
  }
  
  // Initialize booking modal if it exists
  if (document.getElementById('bookingModal')) {
    initializeBookingModal();
  }
}

function loadAppointments() {
  // This would normally come from an API
  const upcomingAppointments = [
    {
      id: 'appt1',
      child: 'Emma Johnson',
      service: 'Regular Checkup',
      date: '2025-06-15',
      time: '10:00 AM',
      duration: '30 minutes',
      status: 'confirmed',
      dentist: 'Dr. Smith'
    },
    {
      id: 'appt2',
      child: 'Liam Johnson',
      service: 'Teeth Cleaning',
      date: '2025-06-22',
      time: '2:00 PM',
      duration: '45 minutes',
      status: 'confirmed',
      dentist: 'Dr. Lee'
    },
    {
      id: 'appt3',
      child: 'Emma Johnson',
      service: 'Follow-up Consultation',
      date: '2025-07-05',
      time: '11:30 AM',
      duration: '30 minutes',
      status: 'pending',
      dentist: 'Dr. Smith'
    }
  ];
  
  const pastAppointments = [
    {
      id: 'appt4',
      child: 'Emma Johnson',
      service: 'Dental Examination',
      date: '2025-05-10',
      time: '9:00 AM',
      duration: '30 minutes',
      status: 'completed',
      dentist: 'Dr. Johnson'
    },
    {
      id: 'appt5',
      child: 'Liam Johnson',
      service: 'Fluoride Treatment',
      date: '2025-04-18',
      time: '10:30 AM',
      duration: '20 minutes',
      status: 'completed',
      dentist: 'Dr. Lee'
    }
  ];
  
  const upcomingList = document.getElementById('upcomingAppointments');
  const pastList = document.getElementById('pastAppointments');
  
  // Clear existing appointments
  // upcomingList.innerHTML = '';
  // pastList.innerHTML = '';
  
  // Add upcoming appointments
  // upcomingAppointments.forEach(appt => {
  //   const apptElement = createAppointmentElement(appt);
  //   upcomingList.appendChild(apptElement);
  // });
  
  // // Add past appointments
  // pastAppointments.forEach(appt => {
  //   const apptElement = createAppointmentElement(appt);
  //   pastList.appendChild(apptElement);
  // });
  
  // Update appointment counts
  document.querySelectorAll('.appointment-count').forEach(el => {
    if (el.closest('#upcomingAppointments')) {
      el.textContent = `${upcomingAppointments.length} appointment${upcomingAppointments.length !== 1 ? 's' : ''}`;
    } else {
      el.textContent = `${pastAppointments.length} appointment${pastAppointments.length !== 1 ? 's' : ''}`;
    }
  });
  
  // Add event listeners to cancel buttons
  document.querySelectorAll('.cancel-appointment').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const appointmentId = this.getAttribute('data-appointment-id');
      cancelAppointment(appointmentId);
    });
  });
}

function createAppointmentElement(appointment) {
  const apptDate = new Date(appointment.date);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isPast = apptDate < today;
  const isToday = apptDate.toDateString() === today.toDateString();
  
  const apptElement = document.createElement('div');
  apptElement.className = 'appointment-item';
  apptElement.id = appointment.id;
  
  // Set border color based on status
  let borderColor = 'transparent';
  if (appointment.status === 'confirmed') borderColor = 'var(--success)';
  if (appointment.status === 'pending') borderColor = 'var(--warning)';
  if (appointment.status === 'cancelled') borderColor = 'var(--danger)';
  
  apptElement.style.borderLeftColor = borderColor;
  
  apptElement.innerHTML = `
    <div class="appointment-item-avatar">
      <i class="fas fa-child"></i>
    </div>
    <div class="appointment-item-info">
      <h4>${appointment.service}</h4>
      <p>For: ${appointment.child} • ${appointment.dentist}</p>
      <div class="appointment-item-meta">
        <span><i class="far fa-calendar-alt"></i> ${apptDate.getDate()} ${monthNames[apptDate.getMonth()]} ${apptDate.getFullYear()}</span>
        <span><i class="far fa-clock"></i> ${appointment.time} (${appointment.duration})</span>
        ${isToday ? '<span><i class="fas fa-bell"></i> Today</span>' : ''}
        ${isPast ? '<span><i class="fas fa-check-circle"></i> Completed</span>' : ''}
      </div>
    </div>
    <span class="appointment-status status-${appointment.status}">
      ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
    </span>
    <div class="appointment-item-actions">
      ${!isPast && appointment.status !== 'cancelled' && appointment.status !== 'completed' ? `
        <button class="btn-icon cancel-appointment" data-appointment-id="${appointment.id}" title="Cancel Appointment">
          <i class="fas fa-times"></i>
        </button>
        <button class="btn-icon reschedule-appointment" data-appointment-id="${appointment.id}" title="Reschedule">
          <i class="fas fa-calendar-alt"></i>
        </button>
      ` : ''}
      ${isPast ? `
        <button class="btn-icon view-details" data-appointment-id="${appointment.id}" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
      ` : ''}
    </div>
  `;
  
  return apptElement;
}

function cancelAppointment(appointmentId) {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    // In a real app, this would call an API
    console.log(`Canceling appointment ${appointmentId}`);
    
    // Update the UI
    const appointmentElement = document.getElementById(appointmentId);
    if (appointmentElement) {
      const statusElement = appointmentElement.querySelector('.appointment-status');
      statusElement.classList.remove('status-confirmed', 'status-pending');
      statusElement.classList.add('status-cancelled');
      statusElement.textContent = 'Cancelled';
      
      // Remove cancel button
      const cancelBtn = appointmentElement.querySelector('.cancel-appointment');
      if (cancelBtn) {
        cancelBtn.remove();
      }
      
      // Show success message
      showNotification('Appointment cancelled successfully', 'success');
      
      // Update dashboard appointments
      updateDashboardAppointments();
    }
  }
}

function updateDashboardAppointments() {
  // This would update the dashboard appointments section
  // In a real app, you would fetch the latest appointments
  console.log('Updating dashboard appointments');
}

// Update your modal opening function
function openBookingModal() {
  const bookingModal = document.getElementById('bookingModal');
  bookingModal.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent body scrolling
  
  // Reset modal to first step
  const bookingSteps = document.querySelectorAll('.booking-step');
  bookingSteps.forEach(step => step.classList.remove('active'));
  document.querySelector('.booking-step[data-step="1"]').classList.add('active');
  
  // Reset progress steps
  const progressSteps = document.querySelectorAll('.progress-step');
  progressSteps.forEach(step => {
    step.classList.remove('active', 'completed');
    if (step.getAttribute('data-step') === '1') {
      step.classList.add('active');
    }
  });
  
  // Reset buttons
  document.getElementById('prevStepBtn').disabled = true;
  document.getElementById('nextStepBtn').style.display = 'block';
  document.getElementById('confirmBookingBtn').style.display = 'none';
  
  // Load children list
  loadChildrenList();
  
  // Scroll to top of modal when opening
  bookingModal.querySelector('.modal-body').scrollTop = 0;
}

function enableBookingSelections() {
  // Child selection
  document.querySelectorAll('.child-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.child-option').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // Service selection
  document.querySelectorAll('.service-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // Time slot selection
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', function() {
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
}

// Update your modal closing function
function closeBookingModal() {
  document.getElementById('bookingModal').style.display = 'none';
  document.body.style.overflow = ''; // Re-enable body scrolling
}

// Add this to your initialization
function initializeBookingModal() {
  // Previous initialization code...
  
  // Close modal when clicking the close button
  document.getElementById('closeBookingModal').addEventListener('click', closeBookingModal);

  initializeCalendar();

  // Handle Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('bookingModal').style.display === 'flex') {
      closeBookingModal();
    }
  });
}

function nextStep() {
  const currentStep = document.querySelector('.booking-step.active');
  const currentStepNumber = parseInt(currentStep.getAttribute('data-step'));
  const nextStepNumber = currentStepNumber + 1;
  
  // Validate current step before proceeding
  if (!validateStep(currentStepNumber)) {
    return;
  }
  
  // Hide current step
  currentStep.classList.remove('active');
  
  // Show next step
  document.querySelector(`.booking-step[data-step="${nextStepNumber}"]`).classList.add('active');
  
  // Update progress steps
  document.querySelector(`.progress-step[data-step="${currentStepNumber}"]`).classList.remove('active');
  document.querySelector(`.progress-step[data-step="${currentStepNumber}"]`).classList.add('completed');
  document.querySelector(`.progress-step[data-step="${nextStepNumber}"]`).classList.add('active');
  
  // Update buttons
  document.getElementById('prevStepBtn').disabled = false;
  
  if (nextStepNumber === 4) {
    document.getElementById('nextStepBtn').style.display = 'none';
    document.getElementById('confirmBookingBtn').style.display = 'block';
    
    // Update confirmation details
    updateConfirmationDetails();
  }
}

function prevStep() {
  const currentStep = document.querySelector('.booking-step.active');
  const currentStepNumber = parseInt(currentStep.getAttribute('data-step'));
  const prevStepNumber = currentStepNumber - 1;
  
  // Hide current step
  currentStep.classList.remove('active');
  
  // Show previous step
  document.querySelector(`.booking-step[data-step="${prevStepNumber}"]`).classList.add('active');
  
  // Update progress steps
  document.querySelector(`.progress-step[data-step="${currentStepNumber}"]`).classList.remove('active');
  document.querySelector(`.progress-step[data-step="${prevStepNumber}"]`).classList.add('active');
  document.querySelector(`.progress-step[data-step="${prevStepNumber}"]`).classList.remove('completed');
  
  // Update buttons
  document.getElementById('nextStepBtn').style.display = 'block';
  document.getElementById('confirmBookingBtn').style.display = 'none';
  
  if (prevStepNumber === 1) {
    document.getElementById('prevStepBtn').disabled = true;
  }
}

function validateStep(stepNumber) {
  if (stepNumber === 1) {
    const selectedChild = document.querySelector('.child-option.selected');
    if (!selectedChild) {
      showNotification('Please select a child or add a new one', 'warning');
      return false;
    }
  } else if (stepNumber === 2) {
    const selectedService = document.querySelector('.service-option.selected');
    if (!selectedService) {
      showNotification('Please select a service', 'warning');
      return false;
    }
  } else if (stepNumber === 3) {
    const selectedDate = document.querySelector('.calendar-day.selected');
    const selectedTime = document.querySelector('.time-slot.selected');
    
    if (!selectedDate || !selectedTime) {
      showNotification('Please select both a date and time', 'warning');
      return false;
    }
  }
  
  return true;
}

function updateConfirmationDetails() {
  // 1) Find the selected child element’s <h6>
  const selectedChildHeading = document.querySelector('.child-option.selected .child-info h6');
  if (!selectedChildHeading) {
    console.error("⚠️ No child-option.selected found in DOM.");
    return;
  }
  const selectedChild = selectedChildHeading.textContent;

  // 2) Find service, date, time… (make sure those also exist)
  const selectedServiceHeading = document.querySelector('.service-option.selected .service-info h6');
  if (!selectedServiceHeading) {
    console.error("⚠️ No service-option.selected found in DOM.");
    return;
  }
  const selectedService = selectedServiceHeading.textContent;

  const selectedDateElem = document.querySelector('.calendar-day.selected');
  if (!selectedDateElem) {
    console.error("⚠️ No calendar-day.selected found in DOM.");
    return;
  }
  const selectedDate = selectedDateElem.textContent;

  const currentMonthElem = document.getElementById('currentMonth');
  if (!currentMonthElem) {
    console.error("⚠️ #currentMonth not found in DOM.");
    return;
  }
  const currentMonth = currentMonthElem.textContent;

  const selectedTimeElem = document.querySelector('.time-slot.selected');
  if (!selectedTimeElem) {
    console.error("⚠️ No time-slot.selected found in DOM.");
    return;
  }
  const selectedTime = selectedTimeElem.textContent;

  // 3) Populate the confirmation fields
  document.getElementById('confirmChild').textContent = selectedChild;
  document.getElementById('confirmService').textContent = selectedService;
  document.getElementById('confirmDate').textContent = `${selectedDate} ${currentMonth}`;
  document.getElementById('confirmTime').textContent = selectedTime;

  // 4) Set duration logic
  let duration = '60 minutes';
  if (selectedService.includes('Cleaning')) {
    duration = '60 minutes';
  } else if (selectedService.includes('Filling') || selectedService.includes('Extraction')) {
    duration = '60 minutes';
  }
  document.getElementById('confirmDuration').textContent = duration;
}


function confirmBooking() {
  // In a real app, this would call an API to book the appointment
  const selectedChild = document.querySelector('.child-option.selected .child-info h6').textContent; //this is the childFullName
  const selectedService = document.querySelector('.service-option.selected .service-info h6').textContent; //this is title
  const selectedDate = document.querySelector('.calendar-day.selected').textContent; 
  const currentMonth = document.getElementById('currentMonth').textContent;
  const selectedTime = document.querySelector('.time-slot.selected').textContent;  
  const notes = document.getElementById('appointmentNotes').value;// this is description
  PatientID;// this is the Patient_ID

  // 2. Combine into one string
  const rawDateStr = `${currentMonth} ${selectedDate} ${selectedTime}`; // e.g. "June 2025 4 08:00"
  const dateObj = new Date(rawDateStr);

  // 3. Format start_datetime
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const start_datetime = `${yyyy}-${mm}-${dd} ${hh}:${min}:00`;

  // 4. Calculate end_datetime (+1 hour)
  const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000); // Add 1 hour
  const end_hh = String(endDateObj.getHours()).padStart(2, '0');
  const end_min = String(endDateObj.getMinutes()).padStart(2, '0');
  const end_datetime = `${yyyy}-${mm}-${dd} ${end_hh}:${end_min}:00`;

  // 5. Prepare data to send
  const appointmentData = {
    childFullName: selectedChild,
    title: selectedService,
    description: notes,
    start_datetime: start_datetime,
    end_datetime: end_datetime,
    Patient_ID: PatientID
  };

  console.log('Appointment data to send:', appointmentData);

  // 6. Send to PHP using fetch()
  fetch('http://localhost/SmileConnector/backend/createAppointment.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    })
    .then(response => response.json())
    .then(result => {
      if (result.status === 'success') {
        showNotification('Appointment successfully created!', 'success');
        // Only close booking modal and show success modal if successful
        closeBookingModal();
        document.getElementById('successModal').style.display = 'flex';

        // Close success modal
        document.getElementById('closeSuccessModal').addEventListener('click', function() {
          document.getElementById('successModal').style.display = 'none';
          // Refresh appointments list
          loadAppointments();
          updateDashboardAppointments();
        }, { once: true });
      } else {
        showNotification('Failed to create appointment: ' + result.message, 'error');
        // Do NOT close the booking modal or show the success modal
      }
    })
    .catch(error => {
      console.error('❌ Fetch error:', error);
      showNotification('Could not connect to server.', 'error');
    });
}

function initializeCalendar() {
  const currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  
  renderCalendar(currentMonth, currentYear);
  
  // Navigation buttons
  document.getElementById('prevMonth').addEventListener('click', function() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
  });
  
  document.getElementById('nextMonth').addEventListener('click', function() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
  });
}

function renderCalendar(month, year) {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';
  
  // Day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day-header';
    dayElement.textContent = day;
    calendarGrid.appendChild(dayElement);
  });

  // Empty cells before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyElement = document.createElement('div');
    emptyElement.className = 'calendar-day disabled';
    calendarGrid.appendChild(emptyElement);
  }

  // Generate each day cell
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    const cellDate = new Date(year, month, day);
    const today = new Date();
    
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;

    const isPast = cellDate < today.setHours(0, 0, 0, 0); // ignore time
    const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6; // 0 = Sunday, 6 = Saturday

    if (isPast || isWeekend) {
      dayElement.classList.add('disabled');
    } else {
      dayElement.addEventListener('click', function () {
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        this.classList.add('selected');

        // ✅ Save the clicked date to use later
        let selectedDate = new Date(year, month, day);
        renderTimeSlots();
      });
    }

    calendarGrid.appendChild(dayElement);
  }
}

function renderTimeSlots() {
  const container = document.getElementById('timeSlotsContainer');
  container.innerHTML = ''; // Clear previous content

  // 1) Determine which calendar date is currently selected
  const selectedDayElem = document.querySelector('.calendar-day.selected');
  if (!selectedDayElem) {
    console.error("⚠️ No date selected in calendar. Cannot filter time slots.");
    return;
  }

  // Get day number (e.g. "3", "14", etc.)
  const dayNum = parseInt(selectedDayElem.textContent, 10);

  // Get "Month Year" from your header, e.g. "June 2025"
  const [monthName, yearStr] = document.getElementById('currentMonth')
                                  .textContent
                                  .split(' ');
  const year = parseInt(yearStr, 10);
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const monthIndex = monthNames.indexOf(monthName);
  if (monthIndex < 0) {
    console.error(`⚠️ Could not parse month "${monthName}"`);
    return;
  }

  // Build a Date object and extract "YYYY-MM-DD"
  const selDateObj = new Date(year, monthIndex, dayNum);
  const yyyy = selDateObj.getFullYear();
  const mm  = String(selDateObj.getMonth() + 1).padStart(2, '0'); // monthIndex + 1
  const dd  = String(selDateObj.getDate()).padStart(2, '0');
  const selectedDateString = `${yyyy}-${mm}-${dd}`; 
  // e.g. "2025-06-03"

  // 2) Create the heading and wrapper
  const heading = document.createElement('h5');
  heading.textContent = 'Available Time Slots';
  container.appendChild(heading);

  const slotsWrapper = document.createElement('div');
  slotsWrapper.id = 'timeSlots';
  slotsWrapper.className = 'time-slots';
  container.appendChild(slotsWrapper);

  // 3) Define our static list of time slots (“HH:MM”)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00'
  ];

  // 4) Fetch all booked events, then filter by the selected date
  fetch('http://localhost/SmileConnector/backend/timeSlots.php', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(json => {
    if (json.status !== 'success') {
      console.error("❌ PHP error:", json.message);
      renderSlotsWithoutBookings(timeSlots, slotsWrapper);
      return;
    }

    // Build a Set of booked “HH:MM” for exactly the selected date
    const bookedTimes = new Set();
    json.events.forEach(evt => {
      // evt.start_datetime is "YYYY-MM-DD hh:mm:ss"
      const [datePart, timePartFull] = evt.start_datetime.split(' ');
      if (datePart === selectedDateString) {
        // timePartFull might be "09:00:00" → take first 5 chars “09:00”
        bookedTimes.add(timePartFull.slice(0, 5));
      }
    });

    let firstAvailableAssigned = false;

    // 5) Render each slot, disabling only those booked on this date
    timeSlots.forEach(time => {
      const slotDiv = document.createElement('div');

      if (bookedTimes.has(time)) {
        // This slot is booked on the selected date
        slotDiv.className = 'time-slot booked';
        slotDiv.textContent = `${time} — Booked`;
        // No click listener → cannot select
      } else {
        // This slot is available on the selected date
        slotDiv.className = 'time-slot available';
        slotDiv.textContent = time;

        // Auto‐select the first available slot
        if (!firstAvailableAssigned) {
          slotDiv.classList.add('selected');
          firstAvailableAssigned = true;
        }

        slotDiv.addEventListener('click', function() {
          document.querySelectorAll('.time-slot.available').forEach(s => {
            s.classList.remove('selected');
          });
          this.classList.add('selected');
        });
      }

      slotsWrapper.appendChild(slotDiv);
    });
  })
  .catch(error => {
    console.error("❌ Fetch error:", error);
    renderSlotsWithoutBookings(timeSlots, slotsWrapper);
  });
}


// Helper to render all slots as available (no filtering by booking date)
function renderSlotsWithoutBookings(timeSlots, slotsWrapper) {
  slotsWrapper.innerHTML = '';
  let firstAssigned = false;

  timeSlots.forEach(time => {
    const slotDiv = document.createElement('div');
    slotDiv.classList.add('time-slot', 'available');
    slotDiv.textContent = time;

    if (!firstAssigned) {
      slotDiv.classList.add('selected');
      firstAssigned = true;
    }

    slotDiv.addEventListener('click', function() {
      document.querySelectorAll('.time-slot.available').forEach(s => {
        s.classList.remove('selected');
      });
      this.classList.add('selected');
    });

    slotsWrapper.appendChild(slotDiv);
  });
}

// Get PatientID from URL parameter
const urlParams = new URLSearchParams(window.location.search);
let PatientID = urlParams.get('patient_id');

// --- Function 1: Send PatientID to PHP and store it in session ---
function sendPatientID(patientID) {
  fetch('http://localhost:80/SmileConnector/backend/Getchildrenbook.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'PatientID=' + encodeURIComponent(patientID)
  })
  .then(response => response.json())
  .then(result => {
    if (result.status === "PatientID stored") {
      console.log("Response from PHP:", result); // {status: "...", patientID: 3}
      console.log("Returned PatientID:", result.patientID); // 3
    } else {
      console.error("❌ Failed to store PatientID:", result.message);
    }
  })
  .catch(error => {
    console.error("❌ Error sending PatientID:", error);
  });
}

sendPatientID(PatientID); // Call the function to send PatientID

function loadChildrenList() {
  fetch('http://localhost/SmileConnector/backend/Displaychildrenbook.php', {
    method: 'GET',
    credentials: 'include',   // ensure PHPSESSID is sent
    headers: { 'Accept': 'application/json' }
  })
  .then(resp => resp.json())
  .then(data => {
    const childrenList = document.querySelector('.children-list');
    const noChildrenMessage = document.querySelector('.no-children-message');

    if (data.status === "error") {
      console.error("❌ Session error:", data.message);
      childrenList.style.display = 'none';
      noChildrenMessage.style.display = 'flex';
      return;
    }

    // Transform server response to an array of { name: … }
    const children = data.map(child => ({
      name: child.childFullName
    }));

    if (children.length === 0) {
      childrenList.style.display = 'none';
      noChildrenMessage.style.display = 'flex';
      return;
    }

    // We have at least one child; show the grid
    childrenList.innerHTML = '';
    childrenList.style.display = 'grid';
    noChildrenMessage.style.display = 'none';

    children.forEach((child, index) => {
      // Create the wrapper <div class="child-option">
      const childDiv = document.createElement('div');
      childDiv.classList.add('child-option');
      if (index === 0) {
        // Select the first one by default
        childDiv.classList.add('selected');
      }

      // Create the inner <div class="child-info"><h6>…</h6></div>
      const infoDiv = document.createElement('div');
      infoDiv.classList.add('child-info');

      const nameHeading = document.createElement('h6');
      nameHeading.textContent = child.name;

      infoDiv.appendChild(nameHeading);
      childDiv.appendChild(infoDiv);
      childrenList.appendChild(childDiv);

      // Add a click‐listener to toggle “.selected”
      childDiv.addEventListener('click', () => {
        // Remove “selected” from any other
        document.querySelectorAll('.child-option.selected').forEach(el => {
          el.classList.remove('selected');
        });
        // Mark this one
        childDiv.classList.add('selected');
      });
    });
    
    enableBookingSelections();

    console.log("✅ Children loaded:", children);
  })
  .catch(err => {
    console.error("❌ Fetch error:", err);
  });
}

function openAddChildModal() {
  document.getElementById('addChildModal').style.display = 'flex';
  
  // Set today's date as max for date of birth
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('childDob').setAttribute('max', today);
  
  // Initialize modal events if not already done
  if (!document.getElementById('addChildModal').hasAttribute('data-initialized')) {
    initializeAddChildModal();
    document.getElementById('addChildModal').setAttribute('data-initialized', 'true');
  }
  bookingModal.querySelector('.modal-body').scrollTop = 0;
  enableBookingSelections();
}

function closeAddChildModal() {
  document.getElementById('addChildModal').style.display = 'none';
  document.getElementById('addChildForm').reset();
}

function initializeAddChildModal() {
  // Close modal button
  document.getElementById('closeAddChildModal').addEventListener('click', closeAddChildModal);
  document.getElementById('cancelAddChild').addEventListener('click', closeAddChildModal);
  
  // Save child button
  document.getElementById('saveChildBtn').addEventListener('click', saveChild);
}

function saveChild() {
  const firstName = document.getElementById('childFirstName').value.trim();
  const lastName = document.getElementById('childLastName').value.trim();
  const dob = document.getElementById('childDob').value;
  const gender = document.getElementById('childGender').value;
  
  if (!firstName || !lastName || !dob || !gender) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  // In a real app, this would call an API to save the child
  console.log('Saving child:', { firstName, lastName, dob, gender });
  
  // Close modal
  closeAddChildModal();
  
  // Show success message
  showNotification('Child added successfully', 'success');
  
  // Reload children list in booking modal
  if (document.getElementById('bookingModal').style.display === 'flex') {
    loadChildrenList();
  }
  
  // Update appointments tab if open
  if (document.getElementById('appointmentsContent').classList.contains('active')) {
    loadAppointments();
  }
}

function initializeDentalRecordsTabs() {
  const recordsTabs = document.querySelectorAll('#recordsContent .tabs .tab-btn');
  const recordsTabContents = document.querySelectorAll('#recordsContent .tab-content');

  recordsTabs.forEach(btn => {
    btn.addEventListener('click', function () {
      // Remove active from all buttons and contents
      recordsTabs.forEach(b => b.classList.remove('active'));
      recordsTabContents.forEach(tc => tc.classList.remove('active'));

      // Activate clicked button and corresponding content
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

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