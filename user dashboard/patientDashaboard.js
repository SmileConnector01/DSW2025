document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle and sidebar functionality
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.getElementById('mainContent');
    
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
    
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
    
    function toggleMobileSidebar() {
        sidebar.classList.toggle('active');
    }
    
    menuToggle.addEventListener('click', toggleSidebar);
    mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    
    // User dropdown functionality
    const userProfile = document.getElementById('userProfile');
    userProfile.addEventListener('click', function() {
        this.classList.toggle('active');
    });
    
    document.addEventListener('click', function(event) {
        if (!userProfile.contains(event.target)) {
            userProfile.classList.remove('active');
        }
    });
    
    // BOOK APPOINTMENT MODAL - SINGLE IMPLEMENTATION
    const bookAppointmentCard = document.getElementById('bookAppointmentCard');
    const appointmentModal = document.createElement('div');
    
    // Create modal HTML with all steps
    appointmentModal.innerHTML = `
        <div class="appointment-modal-overlay">
            <div class="appointment-modal-content">
                <span class="appointment-modal-close">&times;</span>
                <h2>Book an Appointment</h2>
                
                <div class="appointment-steps">
                    <div class="step" data-step="1">
                        <span>1</span>
                        <p>Child & Type</p>
                    </div>
                    <div class="step" data-step="2">
                        <span>2</span>
                        <p>Date & Time</p>
                    </div>
                    <div class="step" data-step="3">
                        <span>3</span>
                        <p>Confirm</p>
                    </div>
                    <div class="step" data-step="4">
                        <span>4</span>
                        <p>Complete</p>
                    </div>
                </div>
                
                <div class="appointment-form">
                    <!-- Step 1: Child & Type -->
                    <div class="step-content active" data-step="1">
                        <h3>Which child is this appointment for? <span class="required">*</span></h3>
                        <select class="child-select" required>
                            <option value="">Select a child</option>
                            <option value="1">Sofia Rodriguez</option>
                            <option value="2">Miguel Rodriguez</option>
                        </select>
                        <p class="error-message child-error" style="display:none;color:red;">Please select a child</p>
                        
                        <h3>Choose Appointment Type <span class="required">*</span></h3>
                        <div class="appointment-type-options">
                            <div class="type-option active" data-type="virtual">
                                <h4>Virtual Consultation</h4>
                                <p>Meet with our dentist online via video call</p>
                            </div>
                            <div class="type-option" data-type="clinic">
                                <h4>Outreach Clinic Visit</h4>
                                <p>In-person appointment at a mobile clinic location</p>
                            </div>
                        </div>
                        <p class="error-message type-error" style="display:none;color:red;">Please select an appointment type</p>
                        
                        <div class="step-buttons">
                            <button class="btn-next">Continue</button>
                        </div>
                    </div>
                    
                    <!-- Step 2: Date & Time -->
                    <div class="step-content" data-step="2">
                        <div class="appointment-info">
                            <h3>Schedule Your Appointment</h3>
                            <div class="patient-info">
                                <p><strong>Appointment for:</strong> <span class="selected-child">Sofia Rodriguez</span> (<span class="child-age">8 years</span>)</p>
                                <p class="selected-type">Virtual Consultation</p>
                            </div>
                        </div>
                        
                        <div class="calendar-navigation">
                            <button class="nav-btn prev-month"><i class="fas fa-chevron-left"></i></button>
                            <h4 class="current-month">May 2025</h4>
                            <button class="nav-btn next-month"><i class="fas fa-chevron-right"></i></button>
                        </div>
                        
                        <div class="calendar-grid">
                            <div class="calendar-header">
                                <div>Sun</div>
                                <div>Mon</div>
                                <div>Tue</div>
                                <div>Wed</div>
                                <div>Thu</div>
                                <div>Fri</div>
                                <div>Sat</div>
                            </div>
                            <div class="calendar-days">
                                <!-- Calendar days will be generated dynamically -->
                            </div>
                        </div>
                        
                        <div class="next-available">
                            <h4>Next available: <span class="next-available-text">Wednesday, May 7, 2025 at 9:00 AM</span></h4>
                        </div>
                        
                        <div class="time-slots">
                            <h4>Available time slots for <span class="selected-date-text">May 7</span>:</h4>
                            <div class="slot-grid">
                                <div class="time-slot">9:00 AM</div>
                                <div class="time-slot">10:30 AM</div>
                                <div class="time-slot">11:45 AM</div>
                                <div class="time-slot">1:15 PM</div>
                                <div class="time-slot">2:50 PM</div>
                                <div class="time-slot">3:45 PM</div>
                                <div class="time-slot">5:00 PM</div>
                            </div>
                        </div>
                        <p class="error-message time-error" style="display:none;color:red;">Please select a time slot</p>
                        
                        <div class="appointment-details">
                            <h4>Appointment Details</h4>
                            <ul>
                                <li><strong>Date:</strong> <span class="detail-date">Wednesday, May 7, 2025</span></li>
                                <li><strong>Time:</strong> <span class="detail-time">Not selected</span></li>
                                <li><strong>Provider:</strong> <span class="detail-provider">Dr. Sarah Wilson</span></li>
                                <li><strong>Format:</strong> <span class="detail-format">Virtual Consultation (Video Call)</span></li>
                            </ul>
                            <p class="note">Note: Virtual consultation requires a device with a camera and microphone. A link will be sent to your email before the appointment.</p>
                        </div>
                        
                        <div class="step-buttons">
                            <button class="btn-prev">Back</button>
                            <button class="btn-next">Continue</button>
                        </div>
                    </div>
                    
                    <!-- Step 3: Confirm -->
                    <div class="step-content" data-step="3">
                        <h3>Confirm Your Appointment</h3>
                        <p class="confirmation-subtitle">Please review and confirm your child's appointment details.</p>
                        
                        <div class="free-service-banner">
                            <i class="fas fa-gift"></i>
                            <p>This appointment is provided at no cost as part of our community dental program.</p>
                        </div>
                        
                        <div class="summary-section">
                            <h4>Appointment Summary</h4>
                            <div class="read-only-field">
                                <label>Service Type:</label>
                                <p class="summary-service">Regular Cleaning</p>
                            </div>
                            <div class="read-only-field">
                                <label>Date & Time:</label>
                                <p class="summary-datetime">May 15, 2025 at 2:30 PM</p>
                            </div>
                            <div class="read-only-field">
                                <label>Duration:</label>
                                <p class="summary-duration">45 minutes</p>
                            </div>
                            <div class="read-only-field">
                                <label>Assigned Dentist:</label>
                                <p class="summary-dentist">Dr. Sarah Johnson</p>
                            </div>
                        </div>
                        
                        <div class="parent-section">
                            <h4>Parent Information</h4>
                            <div class="read-only-field">
                                <label>Full Name:</label>
                                <p class="parent-name">Michael Williams</p>
                            </div>
                            <div class="read-only-field">
                                <label>Email Address:</label>
                                <p class="parent-email">michael.williams@example.com</p>
                            </div>
                            <div class="read-only-field">
                                <label>Phone Number:</label>
                                <p class="parent-phone">(555) 123-4567</p>
                            </div>
                        </div>
                        
                        <div class="child-section">
                            <h4>Child Information</h4>
                            <div class="read-only-field">
                                <label>Child Name:</label>
                                <p class="child-name">Emma Williams</p>
                            </div>
                            <div class="read-only-field">
                                <label>Date of Birth:</label>
                                <p class="child-dob">March 12, 2017 (8 years)</p>
                            </div>
                            <div class="read-only-field">
                                <label>Treatment Plan:</label>
                                <p class="child-plan">Regular cleaning every 6 months, fluoride treatment recommended</p>
                            </div>
                            <div class="read-only-field">
                                <label>Medical Notes:</label>
                                <p class="child-notes">No known allergies, mild dental anxiety</p>
                            </div>
                        </div>
                        
                        <div class="additional-notes">
                            <h4>Additional Information</h4>
                            <label>Additional Notes (Optional)</label>
                            <textarea placeholder="Any special requests or information we should know about your child?"></textarea>
                        </div>
                        
                        <div class="step-buttons">
                            <button class="btn-prev">Back</button>
                            <button class="btn-confirm">Confirm Appointment</button>
                        </div>
                    </div>
                    
                    <!-- Step 4: Complete -->
                    <div class="step-content" data-step="4">
                        <div class="confirmation-success">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h3>✅ Your Appointment Has Been Successfully Booked!</h3>
                            
                            <div class="confirmation-summary">
                                <h4>Appointment Summary</h4>
                                <div class="summary-item">
                                    <span class="summary-label">Child's Name:</span>
                                    <span class="summary-value">Emma Williams</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Service:</span>
                                    <span class="summary-value">Regular Cleaning</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Date & Time:</span>
                                    <span class="summary-value">May 15, 2025 at 2:30 PM</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Duration:</span>
                                    <span class="summary-value">45 minutes</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Dentist:</span>
                                    <span class="summary-value">Dr. Sarah Johnson</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Location:</span>
                                    <span class="summary-value">Virtual Consultation</span>
                                </div>
                            </div>
                            
                            <div class="confirmation-notification">
                                <h4>How would you like to receive confirmation?</h4>
                                <div class="notification-options">
                                    <label class="notification-option">
                                        <input type="checkbox" name="notification" value="email" checked>
                                        <span>Email (michael.williams@example.com)</span>
                                    </label>
                                    <label class="notification-option">
                                        <input type="checkbox" name="notification" value="sms" checked>
                                        <span>SMS (555) 123-4567</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="whats-next">
                                <h4>What Happens Next</h4>
                                <p>You'll receive a confirmation and a reminder 24 hours before the appointment.</p>
                                <p>This is part of Emma's ongoing treatment plan.</p>
                            </div>
                            
                            <div class="confirmation-actions">
                                <button class="action-btn view-appointment">
                                    <i class="fas fa-calendar-alt"></i> View Appointment
                                </button>
                                <button class="action-btn book-another">
                                    <i class="fas fa-plus"></i> Book Another Appointment
                                </button>
                                <button class="action-btn return-dashboard">
                                    <i class="fas fa-home"></i> Return to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(appointmentModal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .appointment-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .appointment-modal-content {
            background: white;
            border-radius: 10px;
            padding: 25px;
            width: 90%;
            max-width: 600px;
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .appointment-modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        /* ... (include all other CSS styles from the original) ... */
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
            .appointment-modal-content {
                width: 95%;
                padding: 15px;
            }
            
            .appointment-steps {
                flex-wrap: wrap;
            }
            
            .step {
                flex: 0 0 25%;
                margin-bottom: 10px;
            }
            
            .slot-grid {
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            }
            
            .confirmation-actions {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Calendar functionality
    let currentMonth = 4; // May (0-indexed)
    let currentYear = 2025;
    
    function generateCalendar(month, year) {
        const calendarDays = document.querySelector('.calendar-days');
        const currentMonthHeader = document.querySelector('.current-month');
        
        // Set month header
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthHeader.textContent = `${monthNames[month]} ${year}`;
        
        // Clear previous days
        calendarDays.innerHTML = '';
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInLastMonth = new Date(year, month, 0).getDate();
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day', 'other-month');
            dayElement.textContent = daysInLastMonth - i;
            calendarDays.appendChild(dayElement);
        }
        
        // Current month days
        const today = new Date();
        const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            
            // Mark today if it's the current month
            if (isCurrentMonth && i === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Mark available days (every 3rd day for demo)
            if (i % 3 === 0) {
                dayElement.classList.add('available');
            }
            
            dayElement.textContent = i;
            calendarDays.appendChild(dayElement);
        }
        
        // Next month days
        const totalCells = firstDay + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day', 'other-month');
            dayElement.textContent = i;
            calendarDays.appendChild(dayElement);
        }
        
        // Add event listeners to available days
        document.querySelectorAll('.day.available').forEach(day => {
            day.addEventListener('click', function() {
                document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
                this.classList.add('active');
                
                const selectedDate = new Date(year, month, parseInt(this.textContent));
                updateSelectedDate(selectedDate);
            });
        });
    }
    
    function updateSelectedDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        
        document.querySelector('.next-available-text').textContent = 
            `${formattedDate} at 9:00 AM`;
        document.querySelector('.selected-date-text').textContent = 
            date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            
        document.querySelector('.detail-date').textContent = formattedDate;
    }
    
    // Initialize calendar
    generateCalendar(currentMonth, currentYear);
    
    // Month navigation
    document.querySelector('.prev-month').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });
    
    document.querySelector('.next-month').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });
    
    // Time slot selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            document.querySelector('.detail-time').textContent = this.textContent;
        });
    });
    
    // Modal functionality
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    
    bookAppointmentCard.addEventListener('click', function() {
        document.querySelector('.appointment-modal-overlay').style.display = 'flex';
        goToStep(1);
    });
    
    document.querySelector('.appointment-modal-close').addEventListener('click', function() {
        document.querySelector('.appointment-modal-overlay').style.display = 'none';
    });
    
    document.querySelector('.appointment-modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
    
    function validateStep(stepNumber) {
        let isValid = true;
        
        if (stepNumber === 1) {
            const childSelected = document.querySelector('.child-select').value;
            if (!childSelected) {
                document.querySelector('.child-error').style.display = 'block';
                isValid = false;
            } else {
                document.querySelector('.child-error').style.display = 'none';
            }
            
            const typeSelected = document.querySelector('.type-option.active');
            if (!typeSelected) {
                document.querySelector('.type-error').style.display = 'block';
                isValid = false;
            } else {
                document.querySelector('.type-error').style.display = 'none';
            }
        }
        
        if (stepNumber === 2) {
            const timeSelected = document.querySelector('.time-slot.active');
            if (!timeSelected) {
                document.querySelector('.time-error').style.display = 'block';
                isValid = false;
            } else {
                document.querySelector('.time-error').style.display = 'none';
            }
        }
        
        return isValid;
    }
    
    function goToStep(stepNumber) {
        // Validate current step before proceeding
        const currentStep = document.querySelector('.step-content.active').dataset.step;
        if (stepNumber > currentStep && !validateStep(currentStep)) {
            return;
        }
        
        // Update step indicators
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
            }
        });
        
        // Show the correct step content
        stepContents.forEach(content => {
            content.classList.remove('active');
            if (content.dataset.step === stepNumber.toString()) {
                content.classList.add('active');
            }
        });
        
        // Update data when going to step 2
        if (stepNumber === 2) {
            const selectedChild = document.querySelector('.child-select').value;
            const selectedType = document.querySelector('.type-option.active').dataset.type;
            
            if (selectedChild === "1") {
                document.querySelector('.selected-child').textContent = "Sofia Rodriguez";
                document.querySelector('.child-age').textContent = "8 years";
            } else {
                document.querySelector('.selected-child').textContent = "Miguel Rodriguez";
                document.querySelector('.child-age').textContent = "5 years";
            }
            
            document.querySelector('.selected-type').textContent = 
                selectedType === "virtual" ? "Virtual Consultation" : "Outreach Clinic Visit";
        }
        
        // Update data when going to step 3
        if (stepNumber === 3) {
            const selectedDate = document.querySelector('.detail-date').textContent;
            const selectedTime = document.querySelector('.detail-time').textContent;
            const selectedProvider = document.querySelector('.detail-provider').textContent;
            const selectedFormat = document.querySelector('.detail-format').textContent;
            
            document.querySelector('.summary-datetime').textContent = `${selectedDate} at ${selectedTime}`;
            document.querySelector('.summary-dentist').textContent = selectedProvider;
            
            const selectedType = document.querySelector('.type-option.active').dataset.type;
            document.querySelector('.summary-service').textContent = 
                selectedType === "virtual" ? "Virtual Consultation" : "Dental Checkup";
            
            document.querySelector('.summary-duration').textContent = 
                selectedType === "virtual" ? "30 minutes" : "45 minutes";
        }
    }
    
    // Step navigation buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-next')) {
            const currentStep = parseInt(e.target.closest('.step-content').dataset.step);
            goToStep(currentStep + 1);
        }
        
        if (e.target.classList.contains('btn-prev')) {
            const currentStep = parseInt(e.target.closest('.step-content').dataset.step);
            goToStep(currentStep - 1);
        }
        
        if (e.target.classList.contains('btn-confirm')) {
            goToStep(4);
        }
    });
    
    // Appointment type selection
    document.querySelectorAll('.type-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Final confirmation actions
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-appointment')) {
            alert('Appointment details would be shown here');
        }
        
        if (e.target.classList.contains('book-another')) {
            goToStep(1);
        }
        
        if (e.target.classList.contains('return-dashboard')) {
            document.querySelector('.appointment-modal-overlay').style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Create modal element
    const appointmentModal = document.createElement('div');
    appointmentModal.id = 'appointmentModal';
    appointmentModal.className = 'appointment-modal-overlay';
    
    // Create modal content
    appointmentModal.innerHTML = `
        <div class="appointment-modal-content">
            <span class="appointment-modal-close">&times;</span>
            <h2>Book an Appointment</h2>
            
            <div class="appointment-steps">
                <div class="step" data-step="1">
                    <span>1</span>
                    <p>Child & Type</p>
                </div>
                <div class="step" data-step="2">
                    <span>2</span>
                    <p>Date & Time</p>
                </div>
                <div class="step" data-step="3">
                    <span>3</span>
                    <p>Confirm</p>
                </div>
                <div class="step" data-step="4">
                    <span>4</span>
                    <p>Complete</p>
                </div>
            </div>
            
            <div class="appointment-form">
                <!-- Step 1: Child & Type -->
                <div class="step-content active" data-step="1">
                    <h3>Which child is this appointment for? <span class="required">*</span></h3>
                    <select class="child-select" required>
                        <option value="">Select a child</option>
                        <option value="1">Emily Johnson</option>
                        <option value="2">Michael Johnson</option>
                    </select>
                    <p class="error-message child-error">Please select a child</p>
                    
                    <h3>Choose Appointment Type <span class="required">*</span></h3>
                    <div class="appointment-type-options">
                        <div class="type-option active" data-type="virtual">
                            <h4>Virtual Consultation</h4>
                            <p>Meet with our dentist online via video call</p>
                        </div>
                        <div class="type-option" data-type="clinic">
                            <h4>Outreach Clinic Visit</h4>
                            <p>In-person appointment at a mobile clinic location</p>
                        </div>
                    </div>
                    <p class="error-message type-error">Please select an appointment type</p>
                    
                    <div class="step-buttons">
                        <button class="btn-next">Continue</button>
                    </div>
                </div>
                
                <!-- Step 2: Date & Time -->
                <div class="step-content" data-step="2">
                    <div class="appointment-info">
                        <h3>Schedule Your Appointment</h3>
                        <div class="patient-info">
                            <p><strong>Appointment for:</strong> <span class="selected-child">Emily Johnson</span> (<span class="child-age">8 years</span>)</p>
                            <p class="selected-type">Virtual Consultation</p>
                        </div>
                    </div>
                    
                    <div class="calendar-navigation">
                        <button class="nav-btn prev-month"><i class="fas fa-chevron-left"></i></button>
                        <h4 class="current-month">May 2025</h4>
                        <button class="nav-btn next-month"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    
                    <div class="calendar-grid">
                        <div class="calendar-header">
                            <div>Sun</div>
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                        </div>
                        <div class="calendar-days"></div>
                    </div>
                    
                    <div class="next-available">
                        <h4>Next available: <span class="next-available-text">Wednesday, May 7, 2025 at 9:00 AM</span></h4>
                    </div>
                    
                    <div class="time-slots">
                        <h4>Available time slots for <span class="selected-date-text">May 7</span>:</h4>
                        <div class="slot-grid">
                            <div class="time-slot">9:00 AM</div>
                            <div class="time-slot">10:30 AM</div>
                            <div class="time-slot">11:45 AM</div>
                            <div class="time-slot">1:15 PM</div>
                            <div class="time-slot">2:50 PM</div>
                            <div class="time-slot">3:45 PM</div>
                            <div class="time-slot">5:00 PM</div>
                        </div>
                    </div>
                    <p class="error-message time-error">Please select a time slot</p>
                    
                    <div class="appointment-details">
                        <h4>Appointment Details</h4>
                        <ul>
                            <li><strong>Date:</strong> <span class="detail-date">Wednesday, May 7, 2025</span></li>
                            <li><strong>Time:</strong> <span class="detail-time">Not selected</span></li>
                            <li><strong>Provider:</strong> <span class="detail-provider">Dr. Sarah Wilson</span></li>
                            <li><strong>Format:</strong> <span class="detail-format">Virtual Consultation (Video Call)</span></li>
                        </ul>
                        <p class="note">Note: Virtual consultation requires a device with a camera and microphone. A link will be sent to your email before the appointment.</p>
                    </div>
                    
                    <div class="step-buttons">
                        <button class="btn-prev">Back</button>
                        <button class="btn-next">Continue</button>
                    </div>
                </div>
                
                <!-- Step 3: Confirm -->
                <div class="step-content" data-step="3">
                    <h3>Confirm Your Appointment</h3>
                    <p class="confirmation-subtitle">Please review and confirm your child's appointment details.</p>
                    
                    <div class="summary-section">
                        <h4>Appointment Summary</h4>
                        <div class="read-only-field">
                            <label>Service Type:</label>
                            <p class="summary-service">Virtual Consultation</p>
                        </div>
                        <div class="read-only-field">
                            <label>Date & Time:</label>
                            <p class="summary-datetime">May 7, 2025 at 9:00 AM</p>
                        </div>
                        <div class="read-only-field">
                            <label>Duration:</label>
                            <p class="summary-duration">30 minutes</p>
                        </div>
                        <div class="read-only-field">
                            <label>Assigned Dentist:</label>
                            <p class="summary-dentist">Dr. Sarah Wilson</p>
                        </div>
                    </div>
                    
                    <div class="parent-section">
                        <h4>Parent Information</h4>
                        <div class="read-only-field">
                            <label>Full Name:</label>
                            <p class="parent-name">John Johnson</p>
                        </div>
                        <div class="read-only-field">
                            <label>Email Address:</label>
                            <p class="parent-email">john.johnson@example.com</p>
                        </div>
                        <div class="read-only-field">
                            <label>Phone Number:</label>
                            <p class="parent-phone">(555) 123-4567</p>
                        </div>
                    </div>
                    
                    <div class="child-section">
                        <h4>Child Information</h4>
                        <div class="read-only-field">
                            <label>Child Name:</label>
                            <p class="child-name">Emily Johnson</p>
                        </div>
                        <div class="read-only-field">
                            <label>Date of Birth:</label>
                            <p class="child-dob">March 10, 2017 (8 years)</p>
                        </div>
                        <div class="read-only-field">
                            <label>Treatment Plan:</label>
                            <p class="child-plan">Regular checkups every 6 months</p>
                        </div>
                        <div class="read-only-field">
                            <label>Medical Notes:</label>
                            <p class="child-notes">No known allergies</p>
                        </div>
                    </div>
                    
                    <div class="additional-notes">
                        <h4>Additional Information</h4>
                        <label>Additional Notes (Optional)</label>
                        <textarea placeholder="Any special requests or information we should know about your child?"></textarea>
                    </div>
                    
                    <div class="step-buttons">
                        <button class="btn-prev">Back</button>
                        <button class="btn-confirm">Confirm Appointment</button>
                    </div>
                </div>
                
                <!-- Step 4: Complete -->
                <div class="step-content" data-step="4">
                    <div class="confirmation-success">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>✅ Your Appointment Has Been Successfully Booked!</h3>
                        
                        <div class="confirmation-summary">
                            <h4>Appointment Summary</h4>
                            <div class="summary-item">
                                <span class="summary-label">Service Type:</span>
                                <span class="summary-value">Virtual Consultation</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Date & Time:</span>
                                <span class="summary-value">Thursday, May 15, 2025 at 10:30 AM</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Duration:</span>
                                <span class="summary-value">30 minutes</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Assigned Dentist:</span>
                                <span class="summary-value">Dr. Sarah Wilson</span>
                            </div>
                        </div>
                        
                        <div class="parent-section">
                            <h4>Parent Information</h4>
                            <div class="read-only-field">
                                <label>Full Name:</label>
                                <p class="parent-name">Michael Williams</p>
                            </div>
                            <div class="read-only-field">
                                <label>Email Address:</label>
                                <p class="parent-email">michael.williams@example.com</p>
                            </div>
                            <div class="read-only-field">
                                <label>Phone Number:</label>
                                <p class="parent-phone">(555) 123-4567</p>
                            </div>
                        </div>
                        
                        <div class="child-section">
                            <h4>Child Information</h4>
                            <div class="read-only-field">
                                <label>Child Name:</label>
                                <p class="child-name">Emma Williams</p>
                            </div>
                            <div class="read-only-field">
                                <label>Date of Birth:</label>
                                <p class="child-dob">March 12, 2017 (8 years)</p>
                            </div>
                            <div class="read-only-field">
                                <label>Treatment Plan:</label>
                                <p class="child-plan">Regular cleaning every 6 months, fluoride treatment recommended</p>
                            </div>
                            <div class="read-only-field">
                                <label>Medical Notes:</label>
                                <p class="child-notes">No known allergies, mild dental anxiety</p>
                            </div>
                        </div>
                        
                        <div class="confirmation-notification">
                            <h4>How would you like to receive confirmation?</h4>
                            <div class="notification-options">
                                <label class="notification-option">
                                    <input type="checkbox" name="notification" value="email" checked>
                                    <span>Email (john.johnson@example.com)</span>
                                </label>
                                <label class="notification-option">
                                    <input type="checkbox" name="notification" value="sms" checked>
                                    <span>SMS (555) 123-4567</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="whats-next">
                            <h4>What Happens Next</h4>
                            <p>You'll receive a confirmation and a reminder 24 hours before the appointment.</p>
                            <p>This is part of Emily's ongoing treatment plan.</p>
                        </div>
                        
                        <div class="confirmation-actions">
                            <button class="action-btn view-appointment">
                                <i class="fas fa-calendar-alt"></i> View Appointment
                            </button>
                            <button class="action-btn book-another">
                                <i class="fas fa-plus"></i> Book Another Appointment
                            </button>
                            <button class="action-btn return-dashboard">
                                <i class="fas fa-home"></i> Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(appointmentModal);
    
    // Create and add CSS
    const style = document.createElement('style');
    style.textContent = `
        /* Main Modal Styles */
        .appointment-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .appointment-modal-content {
            background: white;
            border-radius: 10px;
            padding: 25px;
            width: 90%;
            max-width: 600px;
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .appointment-modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        /* Step Indicators */
        .appointment-steps {
            display: flex;
            justify-content: space-between;
            margin: 20px 0 30px;
            position: relative;
        }
        
        .step {
            text-align: center;
            flex: 1;
            position: relative;
        }
        
        .step::after {
            content: '';
            position: absolute;
            top: 15px;
            left: 50%;
            right: 0;
            height: 2px;
            background: #e0e0e0;
            z-index: -1;
        }
        
        .step:last-child::after {
            display: none;
        }
        
        .step span {
            display: inline-block;
            width: 30px;
            height: 30px;
            line-height: 30px;
            border-radius: 50%;
            background: #e0e0e0;
            margin-bottom: 5px;
            position: relative;
        }
        
        .step.active span {
            background: #3b82f6;
            color: white;
        }
        
        .step.completed span {
            background: #10b981;
            color: white;
        }
        
        .step p {
            font-size: 12px;
            color: #666;
            margin: 0;
        }
        
        .step.active p {
            color: #3b82f6;
            font-weight: bold;
        }
        
        /* Step Content */
        .step-content {
            display: none;
        }
        
        .step-content.active {
            display: block;
        }
        
        /* Step 1 Styles */
        .child-select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .appointment-type-options {
            margin-bottom: 20px;
        }
        
        .type-option {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 10px;
            cursor: pointer;
        }
        
        .type-option.active {
            border-color: #3b82f6;
            background-color: #eff6ff;
        }
        
        .required {
            color: red;
        }
        
        /* Step 2 Styles */
        .appointment-info {
            margin-bottom: 20px;
        }
        
        .patient-info {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        
        .calendar-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0;
        }
        
        .calendar-navigation h4 {
            margin: 0;
        }
        
        .nav-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #3b82f6;
        }
        
        .calendar-grid {
            margin-bottom: 20px;
        }
        
        .calendar-header {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .calendar-days {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
        }
        
        .day {
            padding: 10px;
            text-align: center;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .day.available {
            background: #e6f7ff;
            color: #3b82f6;
        }
        
        .day.available:hover {
            background: #d0ebff;
        }
        
        .day.active {
            background: #3b82f6;
            color: white;
        }
        
        .day.other-month {
            color: #ccc;
        }
        
        .next-available {
            background: #f0f9ff;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .time-slots {
            margin-bottom: 20px;
        }
        
        .slot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }
        
        .time-slot {
            padding: 10px;
            background: #e6f7ff;
            border-radius: 5px;
            text-align: center;
            cursor: pointer;
        }
        
        .time-slot:hover, .time-slot.active {
            background: #d0ebff;
        }
        
        .appointment-details {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .appointment-details ul {
            padding-left: 20px;
            margin: 10px 0;
        }
        
        .appointment-details li {
            margin-bottom: 5px;
        }
        
        .note {
            font-size: 12px;
            color: #666;
            font-style: italic;
        }
        
        /* Navigation Buttons */
        .step-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        
        .btn-prev {
            padding: 10px 20px;
            background: #f0f0f0;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .btn-next {
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .btn-confirm {
            padding: 10px 20px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        
        /* Error Messages */
        .error-message {
            color: red;
            font-size: 14px;
            margin-top: -15px;
            margin-bottom: 15px;
            display: none;
        }
        
        /* Success Step Styles */
        .confirmation-success {
            text-align: center;
            padding: 20px 0;
        }
        
        .success-icon {
            font-size: 60px;
            color: #10b981;
            margin-bottom: 20px;
        }
        
        .confirmation-summary {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        
        .summary-item {
            display: flex;
            margin-bottom: 10px;
        }
        
        .summary-label {
            font-weight: 600;
            width: 120px;
            color: #555;
        }
        
        .confirmation-actions {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 20px;
        }
        
        .action-btn {
            padding: 12px;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .view-appointment {
            background: #3b82f6;
            color: white;
        }
        
        .book-another {
            background: #f0f0f0;
            color: #333;
        }
        
        .return-dashboard {
            background: #10b981;
            color: white;
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
            .appointment-modal-content {
                width: 95%;
                padding: 15px;
            }
            
            .appointment-steps {
                flex-wrap: wrap;
            }
            
            .step {
                flex: 0 0 25%;
                margin-bottom: 10px;
            }
            
            .slot-grid {
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            }
        }
    `;
    document.head.appendChild(style);
    
    // Create and add Font Awesome (if not already loaded)
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(faLink);
    }
    
    // Create trigger button if it doesn't exist
    if (!document.getElementById('bookAppointmentBtn')) {
        const triggerBtn = document.createElement('button');
        triggerBtn.id = 'bookAppointmentBtn';
        triggerBtn.textContent = 'Book Appointment';
        document.body.appendChild(triggerBtn);
    }
    
    // Modal functionality
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');
    const modal = document.getElementById('appointmentModal');
    const closeModal = document.querySelector('.appointment-modal-close');
    
    // Open modal
    bookAppointmentBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        goToStep(1);
    });
    
    // Close modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
    
    // Step navigation
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    
    function goToStep(stepNumber) {
        // Validate current step before proceeding
        if (stepNumber > 1) {
            const currentStep = document.querySelector('.step-content.active').dataset.step;
            if (!validateStep(currentStep)) {
                return;
            }
        }
        
        // Update step indicators
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
            }
        });
        
        // Show the correct step content
        stepContents.forEach(content => {
            content.classList.remove('active');
            if (content.dataset.step === stepNumber.toString()) {
                content.classList.add('active');
            }
        });
        
        // Update data when going to step 2
        if (stepNumber === 2) {
            const selectedChild = document.querySelector('.child-select').value;
            const selectedType = document.querySelector('.type-option.active').dataset.type;
            
            if (selectedChild === "1") {
                document.querySelector('.selected-child').textContent = "Emily Johnson";
                document.querySelector('.child-age').textContent = "8 years";
            } else {
                document.querySelector('.selected-child').textContent = "Michael Johnson";
                document.querySelector('.child-age').textContent = "5 years";
            }
            
            document.querySelector('.selected-type').textContent = 
                selectedType === "virtual" ? "Virtual Consultation" : "Outreach Clinic Visit";
        }
        
        // Update data when going to step 3
        if (stepNumber === 3) {
            const selectedDate = document.querySelector('.detail-date').textContent;
            const selectedTime = document.querySelector('.detail-time').textContent;
            
            document.querySelector('.summary-datetime').textContent = `${selectedDate} at ${selectedTime}`;
        }
    }
    
    function validateStep(stepNumber) {
        let isValid = true;
        
        if (stepNumber === "1") {
            const childSelected = document.querySelector('.child-select').value;
            if (!childSelected) {
                document.querySelector('.child-error').style.display = 'block';
                isValid = false;
            } else {
                document.querySelector('.child-error').style.display = 'none';
            }
            
            const typeSelected = document.querySelector('.type-option.active');
            if (!typeSelected) {
                document.querySelector('.type-error').style.display = 'block';
                isValid = false;
            } else {
                document.querySelector('.type-error').style.display = 'none';
            }
            
            if (!isValid) {
                alert('Please complete all required fields before continuing.');
            }
        }
        
        if (stepNumber === "2") {
            const timeSelected = document.querySelector('.time-slot.active');
            if (!timeSelected) {
                document.querySelector('.time-error').style.display = 'block';
                isValid = false;
                alert('Please select a time slot before continuing.');
            } else {
                document.querySelector('.time-error').style.display = 'none';
            }
        }
        
        return isValid;
    }
    
    // Step navigation buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-next')) {
            const currentStep = parseInt(e.target.closest('.step-content').dataset.step);
            goToStep(currentStep + 1);
        }
        
        if (e.target.classList.contains('btn-prev')) {
            const currentStep = parseInt(e.target.closest('.step-content').dataset.step);
            goToStep(currentStep - 1);
        }
        
        if (e.target.classList.contains('btn-confirm')) {
            goToStep(4);
        }
    });
    
    // Appointment type selection
    document.querySelectorAll('.type-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Calendar functionality
    let currentMonth = 4; // May (0-indexed)
    let currentYear = 2025;
    
    function generateCalendar(month, year) {
        const calendarDays = document.querySelector('.calendar-days');
        const currentMonthHeader = document.querySelector('.current-month');
        
        // Set month header
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"];
        currentMonthHeader.textContent = `${monthNames[month]} ${year}`;
        
        // Clear previous days
        calendarDays.innerHTML = '';
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInLastMonth = new Date(year, month, 0).getDate();
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day', 'other-month');
            dayElement.textContent = daysInLastMonth - i;
            calendarDays.appendChild(dayElement);
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            
            // Mark available days (every 3rd day for demo)
            if (i % 3 === 0) {
                dayElement.classList.add('available');
            }
            
            dayElement.textContent = i;
            calendarDays.appendChild(dayElement);
        }
        
        // Next month days
        const totalCells = firstDay + daysInMonth;
        const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
        
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day', 'other-month');
            dayElement.textContent = i;
            calendarDays.appendChild(dayElement);
        }
        
        // Add event listeners to available days
        document.querySelectorAll('.day.available').forEach(day => {
            day.addEventListener('click', function() {
                document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
                this.classList.add('active');
                
                const selectedDate = new Date(year, month, parseInt(this.textContent));
                updateSelectedDate(selectedDate);
            });
        });
        
        // Select the 7th by default (as shown in your image)
        const defaultDay = document.querySelector('.day:not(.other-month)').textContent === "1" ? 
            document.querySelectorAll('.day:not(.other-month)')[6] : 
            document.querySelectorAll('.day:not(.other-month)')[6 - firstDay];
        
        if (defaultDay) {
            defaultDay.click();
        }
    }
    
    function updateSelectedDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        
        document.querySelector('.next-available-text').textContent = 
            `${formattedDate} at 9:00 AM`;
        document.querySelector('.selected-date-text').textContent = 
            date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            
        document.querySelector('.detail-date').textContent = formattedDate;
    }
    
    // Month navigation
    document.querySelector('.prev-month').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });
    
    document.querySelector('.next-month').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });
    
    // Time slot selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            document.querySelector('.detail-time').textContent = this.textContent;
        });
    });
    
    // Initialize calendar
    generateCalendar(currentMonth, currentYear);
    
    // Final confirmation actions
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-appointment')) {
            alert('Appointment details would be shown here');
        }
        
        if (e.target.classList.contains('book-another')) {
            goToStep(1);
        }
        
        if (e.target.classList.contains('return-dashboard')) {
            modal.style.display = 'none';
        }
    });
});