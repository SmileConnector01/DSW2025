document.addEventListener('DOMContentLoaded', function() {
  // Initialize all tabs and set dashboard as default
  initializeApplication();
  
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
  // Set user name throughout the dashboard
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(el => {
    el.textContent = 'John Johnson'; // This would come from your user data
  });
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
  
  document.getElementById('childFilter')?.addEventListener('change', function() {
    filterAppointments();
  });
}

// Add this new function to handle filtering
function filterAppointments() {
  const statusFilter = document.getElementById('statusFilter').value;
  const childFilter = document.getElementById('childFilter').value;
  
  const appointmentItems = document.querySelectorAll('.appointment-item');
  
  appointmentItems.forEach(item => {
    const status = item.querySelector('.appointment-status').classList[1].replace('status-', '');
    const child = item.querySelector('.appointment-item-info p').textContent.split('•')[0].trim();
    
    const statusMatch = statusFilter === 'all' || status === statusFilter;
    const childMatch = childFilter === 'all' || child.includes(childFilter === 'child1' ? 'Emma' : 'Liam');
    
    if (statusMatch && childMatch) {
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
  // Set user name throughout the dashboard
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(el => {
    el.textContent = 'John Johnson'; // This would come from your user data
  });
  
  // Quick action cards
  const bookAppointmentCard = document.getElementById('bookAppointmentCard');
  const viewRecordsCard = document.getElementById('viewRecordsCard');
  const startConsultationCard = document.getElementById('startConsultationCard');
  const healthTipsCard = document.getElementById('healthTipsCard');
  
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
  
  healthTipsCard.addEventListener('click', function() {
    // This would open a health tips modal or page
    alert('Oral health tips will be displayed here');
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
  upcomingList.innerHTML = '';
  pastList.innerHTML = '';
  
  // Add upcoming appointments
  upcomingAppointments.forEach(appt => {
    const apptElement = createAppointmentElement(appt);
    upcomingList.appendChild(apptElement);
  });
  
  // Add past appointments
  pastAppointments.forEach(appt => {
    const apptElement = createAppointmentElement(appt);
    pastList.appendChild(apptElement);
  });
  
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
      alert('Appointment cancelled successfully');
      
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
      alert('Please select a child or add a new one');
      return false;
    }
  } else if (stepNumber === 2) {
    const selectedService = document.querySelector('.service-option.selected');
    if (!selectedService) {
      alert('Please select a service');
      return false;
    }
  } else if (stepNumber === 3) {
    const selectedDate = document.querySelector('.calendar-day.selected');
    const selectedTime = document.querySelector('.time-slot.selected');
    
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and time');
      return false;
    }
  }
  
  return true;
}

function updateConfirmationDetails() {
  const selectedChild = document.querySelector('.child-option.selected .child-info h6').textContent;
  const selectedService = document.querySelector('.service-option.selected .service-info h6').textContent;
  const selectedDate = document.querySelector('.calendar-day.selected').textContent;
  const currentMonth = document.getElementById('currentMonth').textContent;
  const selectedTime = document.querySelector('.time-slot.selected').textContent;
  
  document.getElementById('confirmChild').textContent = selectedChild;
  document.getElementById('confirmService').textContent = selectedService;
  document.getElementById('confirmDate').textContent = `${selectedDate} ${currentMonth}`;
  document.getElementById('confirmTime').textContent = selectedTime;
  
  // Set duration based on service
  let duration = '30 minutes';
  if (selectedService.includes('Cleaning')) {
    duration = '45 minutes';
  } else if (selectedService.includes('Filling') || selectedService.includes('Extraction')) {
    duration = '60 minutes';
  }
  document.getElementById('confirmDuration').textContent = duration;
}

function confirmBooking() {
  // In a real app, this would call an API to book the appointment
  const selectedChild = document.querySelector('.child-option.selected .child-info h6').textContent;
  const selectedService = document.querySelector('.service-option.selected .service-info h6').textContent;
  const selectedDate = document.querySelector('.calendar-day.selected').textContent;
  const currentMonth = document.getElementById('currentMonth').textContent;
  const selectedTime = document.querySelector('.time-slot.selected').textContent;
  const notes = document.getElementById('appointmentNotes').value;
  
  console.log('Booking appointment:', {
    child: selectedChild,
    service: selectedService,
    date: `${selectedDate} ${currentMonth}`,
    time: selectedTime,
    notes: notes
  });
  
  // Close booking modal
  closeBookingModal();
  
  // Show success modal
  document.getElementById('successModal').style.display = 'flex';
  
  // Close success modal
  document.getElementById('closeSuccessModal').addEventListener('click', function() {
    document.getElementById('successModal').style.display = 'none';
    
    // Refresh appointments list
    loadAppointments();
    updateDashboardAppointments();
  }, { once: true });
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
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';
  
  // Add day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day-header';
    dayElement.textContent = day;
    calendarGrid.appendChild(dayElement);
  });
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyElement = document.createElement('div');
    emptyElement.className = 'calendar-day disabled';
    calendarGrid.appendChild(emptyElement);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    // Disable past dates
    const currentDate = new Date();
    const cellDate = new Date(year, month, day);
    if (cellDate < currentDate && cellDate.getDate() !== currentDate.getDate()) {
      dayElement.classList.add('disabled');
    } else {
      dayElement.addEventListener('click', function() {
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        this.classList.add('selected');
      });
    }
    
    calendarGrid.appendChild(dayElement);
  }
}

function loadChildrenList() {
  // In a real app, this would come from an API
  const children = [
    { name: 'Emma Johnson', age: 8 },
    { name: 'Liam Johnson', age: 5 }
  ];
  
  const childrenList = document.querySelector('.children-list');
  const noChildrenMessage = document.querySelector('.no-children-message');
  
  if (children.length === 0) {
    childrenList.style.display = 'none';
    noChildrenMessage.style.display = 'flex';
  } else {
    childrenList.style.display = 'grid';
    noChildrenMessage.style.display = 'none';
    
    // Select first child by default
    if (document.querySelectorAll('.child-option').length > 0) {
      document.querySelectorAll('.child-option')[0].classList.add('selected');
    }
  }
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
    alert('Please fill in all fields');
    return;
  }
  
  // In a real app, this would call an API to save the child
  console.log('Saving child:', { firstName, lastName, dob, gender });
  
  // Close modal
  closeAddChildModal();
  
  // Show success message
  alert('Child added successfully');
  
  // Reload children list in booking modal
  if (document.getElementById('bookingModal').style.display === 'flex') {
    loadChildrenList();
  }
  
  // Update appointments tab if open
  if (document.getElementById('appointmentsContent').classList.contains('active')) {
    loadAppointments();
  }
}