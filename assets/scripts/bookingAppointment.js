// document.addEventListener('DOMContentLoaded', function() {
//     // DOM Elements
//     const appointmentsContainer = document.getElementById('appointmentsContainer');
//     const tabButtons = document.querySelectorAll('.tab-btn');
//     const tabContents = document.querySelectorAll('.tab-content');
//     const statusFilter = document.getElementById('appointmentStatusFilter');
//     const appointmentsList = document.getElementById('appointmentsList');
//     const newAppointmentBtnTab = document.getElementById('newAppointmentBtnTab');
//     const viewAppointmentsTab = document.getElementById('view-appointments');
//     const bookAppointmentTab = document.getElementById('book-appointment');
    
//     // Booking system DOM elements
//     const bookingSteps = document.querySelectorAll('.booking-steps .step');
//     const bookingStepContents = document.querySelectorAll('.booking-step');
//     const nextButtons = document.querySelectorAll('[data-next]');
//     const prevButtons = document.querySelectorAll('[data-prev]');
//     const confirmBookingBtn = document.getElementById('confirmBooking');

//     // Step 0: Patient Selection
//     const patientTypeSelection = document.getElementById('patientTypeSelection');
//     const newPatientForm = document.getElementById('newPatientForm');
//     const existingChildSelection = document.getElementById('existingChildSelection');
//     const childOptions = document.getElementById('childOptions');
    
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
    
//     // Step 4: Confirmation
//     const confirmDentist = document.getElementById('confirmDentist');
//     const confirmDate = document.getElementById('confirmDate');
//     const confirmTime = document.getElementById('confirmTime');
//     const appointmentNotes = document.getElementById('appointmentNotes');
    
//     // Booking Data
//     let bookingData = {
//         patientType: null, // 'new' or 'existing'
//         patient: null, // Patient name or object
//         child: null, // Selected child (if applicable)
//         dentist: null,
//         date: null,
//         time: null,
//         type: 'checkup',
//         location: null,
//         duration: '30 minutes',
//         status: 'pending'
//     };
//     // Current date for calendar
//     let currentDate = new Date();
//     let selectedDate = null;

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
//         },
//         {
//             id: 2,
//             name: 'Dr. Michael Chen',
//             specialty: 'Orthodontics',
//             location: 'main',
//             rating: 4.9,
//             reviews: 98,
//             availableDays: ['Tuesday', 'Thursday'],
//             availableTimes: ['08:30', '10:30', '13:30', '15:30'],
//         },
//         {
//             id: 3,
//             name: 'Dr. Emily Rodriguez',
//             specialty: 'Pediatric Dentistry',
//             location: 'main',
//             rating: 4.7,
//             reviews: 87,
//             availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
//             availableTimes: ['09:30', '11:30', '14:30', '16:00'],
//         }
//     ];

//     // Sample child data
//     const children = [
//         { id: 1, name: 'Sarah Doe', age: 8, relation: 'Daughter' },
//         { id: 2, name: 'Michael Doe', age: 5, relation: 'Son' }
//     ];

//     // Initialize the system
//     function initSystem() {
//         // Load dentists
//         loadDentists();
        
//         // Load children options
//         loadChildrenOptions();

//         // Initialize calendar
//         renderCalendar();
        
//         // Set up event listeners
//         setupEventListeners();
        
//         // Set up modal event listeners
//         setupModalListeners();
//     }

//     // Set up modal event listeners
//     function setupModalListeners() {
//         // Close booking confirmation
//         document.getElementById('confirmOkBtn')?.addEventListener('click', function() {
//             const modal = document.getElementById('bookingConfirmationModal');
//             modal.style.display = 'none';
//             document.body.style.overflow = '';
//         });

//         // Close when clicking outside
//         document.getElementById('bookingConfirmationModal')?.addEventListener('click', function(e) {
//             if (e.target === this) {
//                 this.style.display = 'none';
//                 document.body.style.overflow = '';
//             }
//         });
//     }

//     // Show booking confirmation modal
//     function showBookingConfirmation(dentist, date, time, notes) {
//         const modal = document.getElementById('bookingConfirmationModal');
//         document.getElementById('confirmDentistName').textContent = dentist;
//         document.getElementById('confirmAppointmentDate').textContent = date;
//         document.getElementById('confirmAppointmentTime').textContent = time;
//         document.getElementById('confirmAppointmentNotes').textContent = notes || 'None';
        
//         modal.style.display = 'flex';
//         document.body.style.overflow = 'hidden';
//     }

//     // Set up event listeners
//     function setupEventListeners() {
//         // Tab navigation
//         tabButtons.forEach(btn => {
//             btn.addEventListener('click', function() {
//                 switchTab(this.dataset.tab);
//             });
//         });
        
//         // New appointment button in tab
//         newAppointmentBtnTab.addEventListener('click', function() {
//             switchTab('book-appointment');
//             goToStep('1');
//         });
        
//         // Next/previous buttons for steps
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

//         // Dentist search and filters
//         dentistSearch.addEventListener('input', filterDentists);
//         specialtyFilter.addEventListener('change', filterDentists);
//         locationFilter.addEventListener('change', filterDentists);

//         // Calendar navigation
//         prevMonthBtn.addEventListener('click', goToPreviousMonth);
//         nextMonthBtn.addEventListener('click', goToNextMonth);

//         // Confirm booking button - updated to use modal
//         confirmBookingBtn.addEventListener('click', function() {
//             if (!bookingData.dentist || !bookingData.date || !bookingData.time) {
//                 alert('Please complete all booking details before confirming');
//                 return;
//             }
            
//             showBookingConfirmation(
//                 bookingData.dentist,
//                 bookingData.date,
//                 bookingData.time,
//                 appointmentNotes.value
//             );
            
//             // Reset form after showing confirmation
//             resetBookingForm();
//         });
//     }

//     // Switch between tabs
//     function switchTab(tabId) {
//         tabButtons.forEach(btn => {
//             btn.classList.toggle('active', btn.dataset.tab === tabId);
//         });
        
//         tabContents.forEach(content => {
//             content.classList.toggle('active', content.id === tabId);
//         });
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
//                 <div class="dentist-avatar">
//                     <i class="fas fa-user-md"></i>
//                 </div>
//                 <div class="dentist-info">
//                     <h4>${dentist.name}</h4>
//                     <p class="specialty">${dentist.specialty}</p>
//                     <p class="location">Main Clinic</p>
//                 </div>
//                 <button class="btn-secondary select-dentist">
//                     Select
//                 </button>
//             `;
            
//             dentistCard.querySelector('.select-dentist').addEventListener('click', function(e) {
//                 e.stopPropagation();
//                 selectDentist(dentist);
//             });
            
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
//                     <div class="dentist-avatar">
//                         <i class="fas fa-user-md"></i>
//                     </div>
//                     <div class="dentist-info">
//                         <h4>${dentist.name}</h4>
//                         <p class="specialty">${dentist.specialty}</p>
//                         <p class="location">Main Clinic</p>
//                     </div>
//                     <button class="btn-secondary select-dentist">
//                         Select
//                     </button>
//                 `;
                
//                 dentistCard.querySelector('.select-dentist').addEventListener('click', function(e) {
//                     e.stopPropagation();
//                     selectDentist(dentist);
//                 });
                
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
//         bookingData.location = 'Main Clinic';
        
//         // Re-render calendar to show availability for this dentist
//         renderCalendar();
//     }

//     // Load children into the selection options
//     function loadChildrenOptions() {
//         childOptions.innerHTML = '';
        
//         children.forEach(child => {
//             const childOption = document.createElement('div');
//             childOption.className = 'child-option';
//             childOption.innerHTML = `
//                 <input type="radio" id="child-${child.id}" name="child" value="${child.id}">
//                 <label for="child-${child.id}" class="option-content">
//                     <i class="fas fa-child"></i>
//                     ${child.name} (${child.age} years old) - ${child.relation}
//                 </label>
//             `;
            
//             childOption.querySelector('input').addEventListener('change', function() {
//                 if (this.checked) {
//                     selectChild(child);
//                 }
//             });
            
//             childOptions.appendChild(childOption);
//         });
//     }

    
//     // Select a child
//     function selectChild(child) {
//         bookingData.child = child;
//         bookingData.patient = child.name;
//         goToStep('1'); // Proceed to dentist selection
//     }

// // Handle patient type selection
// document.querySelectorAll('input[name="patientType"]').forEach(radio => {
//     radio.addEventListener('change', function() {
//         if (this.value === 'self') {
//             bookingData.patientType = 'self';
//             bookingData.patient = "John Doe"; // Or get from user profile
//             document.getElementById('existingChildSelection').style.display = 'none';
//             document.getElementById('newPatientForm').style.display = 'none';
//             goToStep('1');
//         } 
//         else if (this.value === 'child') {
//             document.getElementById('existingChildSelection').style.display = 'block';
//             document.getElementById('newPatientForm').style.display = 'none';
//         } 
//         else if (this.value === 'new') {
//             document.getElementById('existingChildSelection').style.display = 'none';
//             document.getElementById('newPatientForm').style.display = 'block';
//         }
//     });
// });

// // Cancel new patient form
// document.getElementById('cancelNewPatient')?.addEventListener('click', function() {
//     document.getElementById('newPatientForm').style.display = 'none';
//     document.querySelector('input[name="patientType"]:checked').checked = false;
// });
//     // Handle new patient form submission
// document.getElementById('newPatientForm')?.addEventListener('submit', function(e) {
//         e.preventDefault();
        
//         const firstName = document.getElementById('newPatientFirstName').value;
//         const lastName = document.getElementById('newPatientLastName').value;
//         const dob = document.getElementById('newPatientDOB').value;
//         const relation = document.getElementById('newPatientRelation').value;
        
//         bookingData.patientType = 'new';
//         bookingData.patient = `${firstName} ${lastName}`;
//         bookingData.patientDetails = {
//             firstName,
//             lastName,
//             dob,
//             relation
//         };
        
//         goToStep('1'); // Proceed to dentist selection
//     });


//       // Update navigation between steps
//     function goToStep(stepNumber) {
//         // Validate before proceeding to next step
//         if (stepNumber === '1' && !bookingData.patient) {
//             alert('Loading');
//             return;
//         }
        
        
//         // Update UI to show current step
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
//             } else {
//                 content.classList.remove('active');
//             }
//         });
//     }
// // show the confirmation modal
// function showPatientAddedConfirmation(patientName) {
//     const modal = document.getElementById('patientAddedModal');
//     document.getElementById('confirmedPatientName').textContent = patientName;
    
//     modal.style.display = 'flex';
//     document.body.style.overflow = 'hidden';
    
//     // Close modal when clicking OK
//     document.getElementById('patientAddedOkBtn').addEventListener('click', function() {
//         modal.style.display = 'none';
//         document.body.style.overflow = '';
//         goToStep('1'); // Proceed to dentist selection
//     });
    
//     // Close when clicking outside modal
//     modal.addEventListener('click', function(e) {
//         if (e.target === modal) {
//             modal.style.display = 'none';
//             document.body.style.overflow = '';
//             goToStep('1'); // Proceed to dentist selection
//         }
//     });
// }

// // Update the new patient form submission
// document.getElementById('newPatientForm')?.addEventListener('submit', function(e) {
//     e.preventDefault();
    
//     const firstName = document.getElementById('newPatientFirstName').value;
//     const lastName = document.getElementById('newPatientLastName').value;
//     const patientName = `${firstName} ${lastName}`;
    
//     bookingData.patientType = 'new';
//     bookingData.patient = patientName;
//     bookingData.patientDetails = {
//         firstName,
//         lastName,
//         dob: document.getElementById('newPatientDOB').value,
//         relation: document.getElementById('newPatientRelation').value
//     };
    
//     // Show confirmation modal
//     showPatientAddedConfirmation(patientName);
    
//     // Reset form
//     this.reset();
// });
    

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
//     }

//     // Load available time slots
//     function loadTimeSlots() {
//         timeSlots.innerHTML = '';
        
//         if (bookingData.dentist) {
//             const dentist = dentists.find(d => d.name === bookingData.dentist);
//             const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
            
//             if (dentist && dentist.availableDays.includes(dayName)) {
//                 // Generate time slots
//                 dentist.availableTimes.forEach(time => {
//                     const timeSlot = document.createElement('button');
//                     timeSlot.className = 'time-slot';
//                     timeSlot.textContent = formatTime(time);
                    
//                     // Randomly mark some slots as booked (for demo)
//                     if (Math.random() < 0.3) {
//                         timeSlot.classList.add('booked');
//                         timeSlot.disabled = true;
//                     } else {
//                         timeSlot.addEventListener('click', function() {
//                             selectTimeSlot(time, this);
//                         });
//                     }
                    
//                     timeSlots.appendChild(timeSlot);
//                 });
//             } else {
//                 timeSlots.innerHTML = `
//                     <div class="no-slots" style="grid-column: 1 / -1; text-align: center; padding: 30px;">
//                         <i class="fas fa-calendar-times" style="font-size: 40px; color: var(--danger); margin-bottom: 15px;"></i>
//                         <h3>No available slots</h3>
//                         <p>This dentist is not available on the selected day</p>
//                     </div>
//                 `;
//             }
//         }
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
//     }

//     // Update confirmation details
//     function updateConfirmationDetails() {
//         confirmDentist.textContent = bookingData.dentist;
//         confirmDate.textContent = bookingData.date;
//         confirmTime.textContent = bookingData.time;
//     }

//     // Reset booking form
//     function resetBookingForm() {
//         bookingData = {
//             patient: "John Doe",
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
        
//         appointmentNotes.value = '';
        
//         // Reset step navigation
//         goToStep('1');
//     }

//     // Initialize the system
//     initSystem();
// });