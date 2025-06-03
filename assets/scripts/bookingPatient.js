// document.addEventListener('DOMContentLoaded', function() {
//     // DOM Elements
//     const appointmentsContainer = document.getElementById('appointmentsContainer');
//     const tabButtons = document.querySelectorAll('.tab-btn');
//     const tabContents = document.querySelectorAll('.tab-content');
//     const statusFilter = document.getElementById('appointmentStatusFilter');
//     const appointmentsList = document.getElementById('appointmentsList');
//     const newAppointmentBtn = document.getElementById('newAppointmentBtn');
//     const viewAppointmentsTab = document.getElementById('view-appointments');
//     const bookAppointmentTab = document.getElementById('book-appointment');
    
//     // Your existing booking system DOM elements
//     const bookingContainer = document.getElementById('bookingContainer');
//     const bookingSteps = document.querySelectorAll('.booking-steps .step');
//     const bookingStepContents = document.querySelectorAll('.booking-step');
//     const nextButtons = document.querySelectorAll('.btn-next');
//     const prevButtons = document.querySelectorAll('.btn-prev');
//     const confirmBookingBtn = document.getElementById('confirmBooking');
//     const bookingSuccessModal = document.getElementById('bookingSuccessModal');
//     const closeModalBtn = document.getElementById('closeSuccessModal');
//     const viewAppointmentBtn = document.getElementById('viewAppointment');
    
//     // Step 1: Dentist Selection
//     const dentistSearch = document.getElementById('dentistSearch');
//     const specialtyFilter = document.getElementById('specialtyFilter');
//     const locationFilter = document.getElementById('locationFilter');
//     const dentistGrid = document.getElementById('dentistGrid');
    
//     // Step 2: Date Selection
//     const prevMonthBtn = document.getElementById('prevMonth');
//     const nextMonthBtn = document.getElementById('nextMonth');
//     const currentMonthYear = document.getElementById('currentMonthYear');
//     const calendarDays = document.getElementById('calendarDays');
    
//     // Step 3: Time Selection
//     const selectedDateDisplay = document.getElementById('selectedDateDisplay');
//     const timeSlots = document.getElementById('timeSlots');
//     const appointmentTypeRadios = document.querySelectorAll('input[name="appointmentType"]');
    
//     // Step 4: Confirmation
//     const confirmDentist = document.getElementById('confirmDentist');
//     const confirmDate = document.getElementById('confirmDate');
//     const confirmTime = document.getElementById('confirmTime');
//     const confirmType = document.getElementById('confirmType');
//     const confirmLocation = document.getElementById('confirmLocation');
//     const confirmDuration = document.getElementById('confirmDuration');
//     const appointmentNotes = document.getElementById('appointmentNotes');
    
//     // Child Selection
//     const childSelection = document.createElement('div');
//     childSelection.className = 'child-selection';
//     childSelection.innerHTML = `
//         <h4>Select Patient</h4>
//         <div class="child-options" id="childOptions">
//             <!-- Children will be loaded here -->
//         </div>
//     `;
//     bookingStepContents[0].insertBefore(childSelection, bookingStepContents[0].firstChild);
//     const childOptions = document.getElementById('childOptions');
    
//     // Success Modal
//     const successDentist = document.getElementById('successDentist');
//     const successDateTime = document.getElementById('successDateTime');
//     const successType = document.getElementById('successType');

//     // Booking Data
//     let bookingData = {
//         patient: null, // Added patient field
//         dentist: null,
//         date: null,
//         time: null,
//         type: 'checkup',
//         location: null,
//         duration: '30 minutes',
//         status: 'pending' // Added status field
//     };

//     // Current date for calendar
//     let currentDate = new Date();
//     let selectedDate = null;

//     // Sample Patient Data (children)
//     const children = [
//         { id: 1, name: 'Emma Johnson', age: 8, relation: 'Daughter' },
//         { id: 2, name: 'Liam Johnson', age: 5, relation: 'Son' }
//     ];

//     // Sample Appointment Data
//     let appointments = [
//         {
//             id: 1,
//             patientId: 1,
//             patientName: 'Emma Johnson',
//             dentist: 'Dr. Sarah Johnson',
//             date: '2025-06-15',
//             time: '10:00 AM',
//             type: 'Regular Checkup',
//             location: 'Main Clinic',
//             duration: '30 minutes',
//             status: 'confirmed',
//             notes: ''
//         },
//         {
//             id: 2,
//             patientId: 2,
//             patientName: 'Liam Johnson',
//             dentist: 'Dr. Michael Chen',
//             date: '2025-06-22',
//             time: '2:00 PM',
//             type: 'Tooth Filling',
//             location: 'South Branch',
//             duration: '45 minutes',
//             status: 'confirmed',
//             notes: ''
//         },
//         {
//             id: 3,
//             patientId: 1,
//             patientName: 'Emma Johnson',
//             dentist: 'Dr. Emily Rodriguez',
//             date: '2025-07-05',
//             time: '11:30 AM',
//             type: 'Follow-up Consultation',
//             location: 'North Branch',
//             duration: '30 minutes',
//             status: 'pending',
//             notes: 'Need to check braces progress'
//         }
//     ];

//     // Sample Dentist Data
//     const dentists = [
//         {
//             id: 1,
//             name: 'Dr. Sarah Johnson',
//             specialty: 'General Dentistry',
//             location: 'main',
//             rating: 4.8,
//             reviews: 124,
//             availableDays: ['Monday', 'Wednesday', 'Friday'],
//             availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00'],
//             image: '../assets/images/dentist1.jpg'
//         },
//         {
//             id: 2,
//             name: 'Dr. Michael Chen',
//             specialty: 'Orthodontics',
//             location: 'south',
//             rating: 4.9,
//             reviews: 98,
//             availableDays: ['Tuesday', 'Thursday'],
//             availableTimes: ['08:30', '10:30', '13:30', '15:30'],
//             image: '../assets/images/dentist2.jpg'
//         },
//         {
//             id: 3,
//             name: 'Dr. Emily Rodriguez',
//             specialty: 'Pediatric Dentistry',
//             location: 'north',
//             rating: 4.7,
//             reviews: 87,
//             availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
//             availableTimes: ['09:30', '11:30', '14:30', '16:00'],
//             image: '../assets/images/dentist3.jpg'
//         },
//         {
//             id: 4,
//             name: 'Dr. James Wilson',
//             specialty: 'Periodontics',
//             location: 'main',
//             rating: 4.6,
//             reviews: 76,
//             availableDays: ['Wednesday', 'Thursday', 'Friday'],
//             availableTimes: ['08:00', '10:00', '12:00', '14:00'],
//             image: '../assets/images/dentist4.jpg'
//         }
//     ];

//     // Initialize the system
//     function initSystem() {
//         // Load children for selection
//         loadChildren();
        
//         // Load appointments
//         loadAppointments();
        
//         // Initialize booking system
//         initBookingSystem();
        
//         // Set up event listeners
//         setupEventListeners();
//     }

//     // Load children for selection
//     function loadChildren() {
//         childOptions.innerHTML = '';
        
//         children.forEach(child => {
//             const childOption = document.createElement('label');
//             childOption.className = 'child-option';
//             childOption.innerHTML = `
//                 <input type="radio" name="patient" value="${child.id}" ${child.id === 1 ? 'checked' : ''}>
//                 <div class="option-content">
//                     <i class="fas fa-child"></i>
//                     <span>${child.name} (${child.age} years, ${child.relation})</span>
//                 </div>
//             `;
            
//             childOption.addEventListener('change', function() {
//                 if (this.querySelector('input').checked) {
//                     const selectedChild = children.find(c => c.id == this.querySelector('input').value);
//                     bookingData.patient = selectedChild.name;
//                     bookingData.patientId = selectedChild.id;
//                 }
//             });
            
//             childOptions.appendChild(childOption);
//         });
        
//         // Set default patient
//         bookingData.patient = children[0].name;
//         bookingData.patientId = children[0].id;
//     }

//     // Load appointments based on filter
//     function loadAppointments(filter = 'all') {
//         appointmentsList.innerHTML = '';
        
//         let filteredAppointments = appointments;
        
//         if (filter !== 'all') {
//             filteredAppointments = appointments.filter(app => app.status === filter);
//         }
        
//         if (filteredAppointments.length === 0) {
//             appointmentsList.innerHTML = `
//                 <div class="no-appointments" style="text-align: center; padding: 30px;">
//                     <i class="fas fa-calendar-times" style="font-size: 40px; color: var(--gray); margin-bottom: 15px;"></i>
//                     <h3>No appointments found</h3>
//                     <p>${filter === 'all' ? 'You have no appointments yet' : `No ${filter} appointments`}</p>
//                 </div>
//             `;
//             return;
//         }
        
//         filteredAppointments.forEach(appointment => {
//             const appointmentDate = new Date(appointment.date);
//             const month = appointmentDate.toLocaleDateString('en-US', { month: 'short' });
//             const day = appointmentDate.getDate();
//             const weekday = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
//             const fullDate = appointmentDate.toLocaleDateString('en-US', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//             });
            
//             const appointmentItem = document.createElement('div');
//             appointmentItem.className = `appointment-item ${appointment.status}`;
//             appointmentItem.innerHTML = `
//                 <div class="appointment-date">
//                     <div class="appointment-day">${day}</div>
//                     <div class="appointment-month">${month}</div>
//                 </div>
//                 <div class="appointment-details">
//                     <div class="appointment-patient">${appointment.patientName}</div>
//                     <div class="appointment-time">${weekday}, ${fullDate} at ${appointment.time}</div>
//                     <div class="appointment-type">${appointment.type} with ${appointment.dentist}</div>
//                 </div>
//                 <span class="appointment-status status-${appointment.status}">
//                     ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
//                 </span>
//                 <div class="appointment-actions">
//                     <button class="btn btn-sm btn-outline-primary view-btn" data-id="${appointment.id}">
//                         <i class="fas fa-eye"></i>
//                     </button>
//                     <button class="btn btn-sm btn-outline-secondary edit-btn" data-id="${appointment.id}" ${appointment.status !== 'pending' ? 'disabled' : ''}>
//                         <i class="fas fa-edit"></i>
//                     </button>
//                     <button class="btn btn-sm btn-outline-danger cancel-btn" data-id="${appointment.id}" ${['completed', 'cancelled'].includes(appointment.status) ? 'disabled' : ''}>
//                         <i class="fas fa-times"></i>
//                     </button>
//                 </div>
//             `;
            
//             appointmentsList.appendChild(appointmentItem);
//         });
        
//         // Add event listeners to action buttons
//         document.querySelectorAll('.view-btn').forEach(btn => {
//             btn.addEventListener('click', function() {
//                 viewAppointmentDetails(this.dataset.id);
//             });
//         });
        
//         document.querySelectorAll('.edit-btn').forEach(btn => {
//             btn.addEventListener('click', function() {
//                 editAppointment(this.dataset.id);
//             });
//         });
        
//         document.querySelectorAll('.cancel-btn').forEach(btn => {
//             btn.addEventListener('click', function() {
//                 cancelAppointment(this.dataset.id);
//             });
//         });
//     }

//     // View appointment details
//     function viewAppointmentDetails(appointmentId) {
//         const appointment = appointments.find(a => a.id == appointmentId);
//         if (appointment) {
//             alert(`Appointment Details:\n\nPatient: ${appointment.patientName}\nDentist: ${appointment.dentist}\nDate: ${appointment.date}\nTime: ${appointment.time}\nType: ${appointment.type}\nStatus: ${appointment.status}\nNotes: ${appointment.notes || 'None'}`);
//         }
//     }

//     // Edit appointment
//     function editAppointment(appointmentId) {
//         const appointment = appointments.find(a => a.id == appointmentId);
//         if (appointment) {
//             // In a real app, this would load the booking form with the appointment data
//             alert(`Editing appointment for ${appointment.patientName}`);
//             // Switch to booking tab and load data
//             switchTab('book-appointment');
//             // Here you would populate the booking form with the appointment data
//         }
//     }

//     // Cancel appointment
//     function cancelAppointment(appointmentId) {
//         if (confirm('Are you sure you want to cancel this appointment?')) {
//             const appointmentIndex = appointments.findIndex(a => a.id == appointmentId);
//             if (appointmentIndex !== -1) {
//                 appointments[appointmentIndex].status = 'cancelled';
//                 loadAppointments(statusFilter.value);
//                 alert('Appointment has been cancelled.');
//             }
//         }
//     }

//     // Switch between tabs
//     function switchTab(tabId) {
//         tabButtons.forEach(btn => {
//             btn.classList.toggle('active', btn.dataset.tab === tabId);
//         });
        
//         tabContents.forEach(content => {
//             content.classList.toggle('active', content.id === tabId);
//         });
        
//         // Reset booking form if switching to booking tab
//         if (tabId === 'book-appointment') {
//             resetBookingForm();
//         }
//     }

//     // Reset booking form
//     function resetBookingForm() {
//         bookingData = {
//             patient: children[0].name,
//             patientId: children[0].id,
//             dentist: null,
//             date: null,
//             time: null,
//             type: 'checkup',
//             location: null,
//             duration: '30 minutes',
//             status: 'pending'
//         };
        
//         // Reset UI
//         document.querySelectorAll('.dentist-card').forEach(card => {
//             card.classList.remove('selected');
//         });
        
//         document.querySelectorAll('.calendar-day').forEach(day => {
//             day.classList.remove('selected');
//         });
        
//         document.querySelectorAll('.time-slot').forEach(slot => {
//             slot.classList.remove('selected');
//         });
        
//         document.querySelector('input[name="appointmentType"][value="checkup"]').checked = true;
        
//         // Reset step navigation
//         goToStep('1');
//     }

//     // Set up event listeners
//     function setupEventListeners() {
//         // Tab navigation
//         tabButtons.forEach(btn => {
//             btn.addEventListener('click', function() {
//                 switchTab(this.dataset.tab);
//             });
//         });
        
//         // Status filter
//         statusFilter.addEventListener('change', function() {
//             loadAppointments(this.value);
//         });
        
//         // New appointment button
//         newAppointmentBtn.addEventListener('click', function() {
//             switchTab('book-appointment');
//         });
        
//         // Your existing booking system event listeners
//         nextButtons.forEach(button => {
//             button.addEventListener('click', function() {
//                 const nextStep = this.getAttribute('data-next');
//                 goToStep(nextStep);
//             });
//         });

//         prevButtons.forEach(button => {
//             button.addEventListener('click', function() {
//                 const prevStep = this.getAttribute('data-prev');
//                 goToStep(prevStep);
//             });
//         });

//         dentistSearch.addEventListener('input', filterDentists);
//         specialtyFilter.addEventListener('change', filterDentists);
//         locationFilter.addEventListener('change', filterDentists);

//         prevMonthBtn.addEventListener('click', goToPreviousMonth);
//         nextMonthBtn.addEventListener('click', goToNextMonth);

//         appointmentTypeRadios.forEach(radio => {
//             radio.addEventListener('change', function() {
//                 bookingData.type = this.value;
                
//                 // Update duration based on type
//                 switch(this.value) {
//                     case 'checkup':
//                         bookingData.duration = '30 minutes';
//                         break;
//                     case 'cleaning':
//                         bookingData.duration = '45 minutes';
//                         break;
//                     case 'consultation':
//                         bookingData.duration = '30 minutes';
//                         break;
//                     case 'emergency':
//                         bookingData.duration = '60 minutes';
//                         break;
//                 }
//             });
//         });

//         confirmBookingBtn.addEventListener('click', confirmAppointment);

//         closeModalBtn.addEventListener('click', closeSuccessModal);
//         viewAppointmentBtn.addEventListener('click', viewAppointment);
//         bookingSuccessModal.addEventListener('click', function(e) {
//             if (e.target === bookingSuccessModal) {
//                 closeSuccessModal();
//             }
//         });
//     }

//     // Initialize the booking system
//     function initBookingSystem() {
//         // Load dentists
//         loadDentists();
        
//         // Initialize calendar
//         renderCalendar();
//     }

//     // Navigate between steps
//     function goToStep(stepNumber) {
//         // Validate before proceeding to next step
//         if (stepNumber === '2' && !bookingData.dentist) {
//             alert('Please select a dentist before proceeding');
//             return;
//         }
        
//         if (stepNumber === '3' && !bookingData.date) {
//             alert('Please select a date before proceeding');
//             return;
//         }
        
//         if (stepNumber === '4' && !bookingData.time) {
//             alert('Please select a time slot before proceeding');
//             return;
//         }

//         // Update active step in navigation
//         bookingSteps.forEach(step => {
//             if (step.getAttribute('data-step') === stepNumber) {
//                 step.classList.add('active');
//             } else {
//                 step.classList.remove('active');
//             }
//         });

//         // Show the corresponding content
//         bookingStepContents.forEach(content => {
//             if (content.getAttribute('data-step') === stepNumber) {
//                 content.classList.add('active');
                
//                 // If going to step 4, update confirmation details
//                 if (stepNumber === '4') {
//                     updateConfirmationDetails();
//                 }
//             } else {
//                 content.classList.remove('active');
//             }
//         });
//     }

//     // Load dentists into the grid
//     function loadDentists() {
//         dentistGrid.innerHTML = '';
        
//         dentists.forEach(dentist => {
//             const dentistCard = document.createElement('div');
//             dentistCard.className = 'dentist-card';
//             dentistCard.dataset.id = dentist.id;
//             dentistCard.innerHTML = `
//                 <div class="dentist-header">
//                     <div class="dentist-avatar">
//                         <img src="${dentist.image}" alt="${dentist.name}">
//                     </div>
//                     <div class="dentist-info">
//                         <h3>${dentist.name}</h3>
//                         <p>${dentist.specialty}</p>
//                         <span class="dentist-specialty">${dentist.location === 'main' ? 'Main Clinic' : 
//                             dentist.location === 'south' ? 'South Branch' : 'North Branch'}</span>
//                     </div>
//                 </div>
//                 <div class="dentist-details">
//                     <div class="detail-item">
//                         <span>Availability:</span>
//                         <p>${dentist.availableDays.join(', ')}</p>
//                     </div>
//                     <div class="detail-item">
//                         <span>Rating:</span>
//                         <div class="dentist-rating">
//                             <div class="stars">
//                                 ${'<i class="fas fa-star"></i>'.repeat(Math.floor(dentist.rating))}
//                                 ${dentist.rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}
//                             </div>
//                             <span class="reviews">(${dentist.reviews} reviews)</span>
//                         </div>
//                     </div>
//                 </div>
//             `;
            
//             dentistCard.addEventListener('click', function() {
//                 selectDentist(dentist);
//             });
            
//             dentistGrid.appendChild(dentistCard);
//         });
//     }

//     // Filter dentists based on search and filters
//     function filterDentists() {
//         const searchTerm = dentistSearch.value.toLowerCase();
//         const specialty = specialtyFilter.value;
//         const location = locationFilter.value;
        
//         const filteredDentists = dentists.filter(dentist => {
//             const matchesSearch = dentist.name.toLowerCase().includes(searchTerm) || 
//                                  dentist.specialty.toLowerCase().includes(searchTerm);
//             const matchesSpecialty = !specialty || dentist.specialty.toLowerCase().includes(specialty);
//             const matchesLocation = !location || dentist.location === location;
            
//             return matchesSearch && matchesSpecialty && matchesLocation;
//         });
        
//         // Update UI
//         dentistGrid.innerHTML = '';
        
//         if (filteredDentists.length === 0) {
//             dentistGrid.innerHTML = `
//                 <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 30px;">
//                     <i class="fas fa-user-md" style="font-size: 40px; color: var(--gray); margin-bottom: 15px;"></i>
//                     <h3>No dentists found</h3>
//                     <p>Try adjusting your search or filters</p>
//                 </div>
//             `;
//         } else {
//             filteredDentists.forEach(dentist => {
//                 const dentistCard = document.createElement('div');
//                 dentistCard.className = 'dentist-card';
//                 dentistCard.dataset.id = dentist.id;
//                 dentistCard.innerHTML = `
//                     <div class="dentist-header">
//                         <div class="dentist-avatar">
//                             <img src="${dentist.image}" alt="${dentist.name}">
//                         </div>
//                         <div class="dentist-info">
//                             <h3>${dentist.name}</h3>
//                             <p>${dentist.specialty}</p>
//                             <span class="dentist-specialty">${dentist.location === 'main' ? 'Main Clinic' : 
//                                 dentist.location === 'south' ? 'South Branch' : 'North Branch'}</span>
//                         </div>
//                     </div>
//                     <div class="dentist-details">
//                         <div class="detail-item">
//                             <span>Availability:</span>
//                             <p>${dentist.availableDays.join(', ')}</p>
//                         </div>
//                         <div class="detail-item">
//                             <span>Rating:</span>
//                             <div class="dentist-rating">
//                                 <div class="stars">
//                                     ${'<i class="fas fa-star"></i>'.repeat(Math.floor(dentist.rating))}
//                                     ${dentist.rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}
//                                 </div>
//                                 <span class="reviews">(${dentist.reviews} reviews)</span>
//                             </div>
//                         </div>
//                     </div>
//                 `;
                
//                 dentistCard.addEventListener('click', function() {
//                     selectDentist(dentist);
//                 });
                
//                 dentistGrid.appendChild(dentistCard);
//             });
//         }
//     }

//     // Select a dentist
//     function selectDentist(dentist) {
//         // Remove selected class from all cards
//         document.querySelectorAll('.dentist-card').forEach(card => {
//             card.classList.remove('selected');
//         });
        
//         // Add selected class to clicked card
//         const selectedCard = document.querySelector(`.dentist-card[data-id="${dentist.id}"]`);
//         selectedCard.classList.add('selected');
        
//         // Update booking data
//         bookingData.dentist = dentist.name;
//         bookingData.location = dentist.location === 'main' ? 'Main Clinic' : 
//                               dentist.location === 'south' ? 'South Branch' : 'North Branch';
        
//         // Enable next button
//         document.querySelector('.btn-next[data-next="2"]').disabled = false;
        
//         // Re-render calendar with dentist availability
//         renderCalendar();
//     }

//     // Render the calendar
//     function renderCalendar() {
//         const year = currentDate.getFullYear();
//         const month = currentDate.getMonth();
        
//         // Update month/year display
//         currentMonthYear.textContent = new Date(year, month).toLocaleDateString('en-US', {
//             month: 'long',
//             year: 'numeric'
//         });
        
//         // Get first day of month and total days in month
//         const firstDay = new Date(year, month, 1).getDay();
//         const daysInMonth = new Date(year, month + 1, 0).getDate();
        
//         // Get days from previous month
//         const prevMonthDays = new Date(year, month, 0).getDate();
        
//         // Clear calendar
//         calendarDays.innerHTML = '';
        
//         // Add days from previous month
//         for (let i = firstDay - 1; i >= 0; i--) {
//             const dayElement = document.createElement('div');
//             dayElement.className = 'calendar-day disabled';
//             dayElement.textContent = prevMonthDays - i;
//             calendarDays.appendChild(dayElement);
//         }
        
//         // Add days from current month
//         for (let i = 1; i <= daysInMonth; i++) {
//             const dayElement = document.createElement('div');
//             dayElement.className = 'calendar-day';
//             dayElement.textContent = i;
            
//             const date = new Date(year, month, i);
//             const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            
//             // Check if this dentist is available on this day
//             if (bookingData.dentist) {
//                 const dentist = dentists.find(d => d.name === bookingData.dentist);
//                 if (dentist && dentist.availableDays.includes(dayName)) {
//                     dayElement.classList.add('available');
//                 } else {
//                     dayElement.classList.add('unavailable');
//                 }
//             }
            
//             // Highlight today
//             const today = new Date();
//             if (date.getDate() === today.getDate() && 
//                 date.getMonth() === today.getMonth() && 
//                 date.getFullYear() === today.getFullYear()) {
//                 dayElement.classList.add('today');
//             }
            
//             // Add click event
//             dayElement.addEventListener('click', function() {
//                 if (!this.classList.contains('disabled') && 
//                     !this.classList.contains('unavailable')) {
//                     selectDate(new Date(year, month, i));
//                 }
//             });
            
//             calendarDays.appendChild(dayElement);
//         }
        
//         // Calculate total cells (7 days per week)
//         const totalCells = 42; // 6 weeks
//         const daysSoFar = firstDay + daysInMonth;
//         const daysNextMonth = totalCells - daysSoFar;
        
//         // Add days from next month
//         for (let i = 1; i <= daysNextMonth; i++) {
//             const dayElement = document.createElement('div');
//             dayElement.className = 'calendar-day disabled';
//             dayElement.textContent = i;
//             calendarDays.appendChild(dayElement);
//         }
//     }

//     // Go to previous month
//     function goToPreviousMonth() {
//         currentDate.setMonth(currentDate.getMonth() - 1);
//         renderCalendar();
//     }

//     // Go to next month
//     function goToNextMonth() {
//         currentDate.setMonth(currentDate.getMonth() + 1);
//         renderCalendar();
//     }

//     // Select a date
//     function selectDate(date) {
//         // Remove selected class from all days
//         document.querySelectorAll('.calendar-day').forEach(day => {
//             day.classList.remove('selected');
//         });
        
//         // Add selected class to clicked day
//         const dayElements = document.querySelectorAll('.calendar-day');
//         const dayIndex = date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
//         dayElements[dayIndex].classList.add('selected');
        
//         // Update booking data
//         selectedDate = date;
//         bookingData.date = date.toLocaleDateString('en-US', {
//             weekday: 'long',
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
        
//         // Update selected date display for time selection
//         selectedDateDisplay.textContent = bookingData.date;
        
//         // Load available time slots
//         loadTimeSlots();
        
//         // Enable next button
//         document.querySelector('.btn-next[data-next="3"]').disabled = false;
//     }

//     // Load available time slots
//     function loadTimeSlots() {
//         timeSlots.innerHTML = '';
        
//         // Show loading spinner
//         timeSlots.innerHTML = `
//             <div class="loading-spinner">
//                 <div class="spinner"></div>
//                 <p>Loading available time slots...</p>
//             </div>
//         `;
        
//         // Simulate API call with setTimeout
//         setTimeout(() => {
//             timeSlots.innerHTML = '';
            
//             if (bookingData.dentist) {
//                 const dentist = dentists.find(d => d.name === bookingData.dentist);
//                 const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
                
//                 if (dentist && dentist.availableDays.includes(dayName)) {
//                     // Generate time slots
//                     dentist.availableTimes.forEach(time => {
//                         const timeSlot = document.createElement('div');
//                         timeSlot.className = 'time-slot';
//                         timeSlot.textContent = formatTime(time);
                        
//                         // Randomly mark some slots as booked (for demo)
//                         if (Math.random() < 0.3) {
//                             timeSlot.classList.add('booked');
//                         } else {
//                             timeSlot.addEventListener('click', function() {
//                                 selectTimeSlot(time, this);
//                             });
//                         }
                        
//                         timeSlots.appendChild(timeSlot);
//                     });
//                 } else {
//                     timeSlots.innerHTML = `
//                         <div class="no-slots" style="grid-column: 1 / -1; text-align: center; padding: 30px;">
//                             <i class="fas fa-calendar-times" style="font-size: 40px; color: var(--danger); margin-bottom: 15px;"></i>
//                             <h3>No available slots</h3>
//                             <p>This dentist is not available on the selected day</p>
//                         </div>
//                     `;
//                 }
//             }
//         }, 1000);
//     }

//     // Format time (from "09:00" to "9:00 AM")
//     function formatTime(timeString) {
//         const [hours, minutes] = timeString.split(':');
//         const hour = parseInt(hours);
//         const ampm = hour >= 12 ? 'PM' : 'AM';
//         const hour12 = hour % 12 || 12;
//         return `${hour12}:${minutes} ${ampm}`;
//     }

//     // Select a time slot
//     function selectTimeSlot(time, element) {
//         // Remove selected class from all slots
//         document.querySelectorAll('.time-slot').forEach(slot => {
//             slot.classList.remove('selected');
//         });
        
//         // Add selected class to clicked slot
//         element.classList.add('selected');
        
//         // Update booking data
//         bookingData.time = formatTime(time);
        
//         // Enable next button
//         document.querySelector('.btn-next[data-next="4"]').disabled = false;
//     }

//     // Update confirmation details
//     function updateConfirmationDetails() {
//         confirmDentist.textContent = bookingData.dentist;
//         confirmDate.textContent = bookingData.date;
//         confirmTime.textContent = bookingData.time;
        
//         // Set appointment type
//         let typeDisplay = 'Regular Checkup';
//         switch(bookingData.type) {
//             case 'cleaning':
//                 typeDisplay = 'Cleaning';
//                 bookingData.duration = '45 minutes';
//                 break;
//             case 'consultation':
//                 typeDisplay = 'Consultation';
//                 bookingData.duration = '30 minutes';
//                 break;
//             case 'emergency':
//                 typeDisplay = 'Emergency';
//                 bookingData.duration = '60 minutes';
//                 break;
//         }
//         confirmType.textContent = typeDisplay;
        
//         confirmLocation.textContent = bookingData.location;
//         confirmDuration.textContent = bookingData.duration;
//     }

//     // Confirm appointment
//     function confirmAppointment() {
//         // Create new appointment
//         const newAppointment = {
//             id: appointments.length + 1,
//             patientId: bookingData.patientId,
//             patientName: bookingData.patient,
//             dentist: bookingData.dentist,
//             date: selectedDate.toISOString().split('T')[0],
//             time: bookingData.time,
//             type: bookingData.type,
//             location: bookingData.location,
//             duration: bookingData.duration,
//             status: 'pending',
//             notes: appointmentNotes.value
//         };
        
//         // Add to appointments array
//         appointments.unshift(newAppointment);
        
//         // Update success modal
//         successDentist.textContent = bookingData.dentist;
//         successDateTime.textContent = `${bookingData.date} at ${bookingData.time}`;
        
//         let typeDisplay = 'Regular Checkup';
//         switch(bookingData.type) {
//             case 'cleaning':
//                 typeDisplay = 'Cleaning';
//                 break;
//             case 'consultation':
//                 typeDisplay = 'Consultation';
//                 break;
//             case 'emergency':
//                 typeDisplay = 'Emergency';
//                 break;
//         }
//         successType.textContent = typeDisplay;
        
//         // Show success modal
//         bookingSuccessModal.classList.add('active');
        
//         // Reset form
//         resetBookingForm();
//     }

//     // Close success modal
//     function closeSuccessModal() {
//         bookingSuccessModal.classList.remove('active');
//         // Switch back to appointments tab and reload
//         switchTab('view-appointments');
//         loadAppointments(statusFilter.value);
//     }

//     // View appointment
//     function viewAppointment() {
//         closeSuccessModal();
//         // In a real app, this would scroll to the new appointment
//         alert('Viewing your new appointment...');
//     }

//     // Initialize the system
//     initSystem();
// });