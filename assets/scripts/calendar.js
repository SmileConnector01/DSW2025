document.addEventListener('DOMContentLoaded', function() {
    let calendar;
    
    // Tab switching for calendar/appointments
    const calendarTabs = document.querySelectorAll('.calendar-tab');
    const calendarTabPanes = document.querySelectorAll('.calendar-tab-pane');
    
    calendarTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            calendarTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active pane
            calendarTabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `${tabId}-view`) {
                    pane.classList.add('active');
                }
            });
            
            // Refresh data when switching tabs
            if (tabId === 'my-appointments') {
                loadMyAppointments();
                initializeCalendar();
            } else if (tabId === 'patient-appointments') {
                loadPatientAppointments();
                initializeCalendar();
            }
        });
    });
    
    // Initialize FullCalendar
    function initializeCalendar() {
        if (window.innerWidth <= 767) {
            document.getElementById('calendar').addEventListener('touchstart', function(e) {
                this.scrollLeft += e.touches[0].pageX > this.clientWidth / 2 ? 100 : -100;
            }, { passive: true });
        }
        const calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridWeek', // Changed to timeGridWeek view
            headerToolbar: false,
            height: 'auto',
            nowIndicator: true,
            editable: true,
            contentHeight: 'auto',
            aspectRatio: 1.5, 
            handleWindowResize: true,
            selectable: true,
            dayMaxEvents: true,
            events: loadCalendarEvents,
            eventClick: handleEventClick,
            dateClick: handleDateClick,
            eventDrop: handleEventDrop,
            eventResize: handleEventResize,
            eventContent: renderEventContent,
            eventClassNames: function(arg) {
            return ['fc-event-' + arg.event.extendedProps.type];
            },
            slotMinTime: '08:00:00',
            slotMaxTime: '18:00:00',
            businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: '08:00',
            endTime: '17:00'
            },
            eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
            }
        });
        
        calendar.render();
        updateDateRangeDisplay(calendar);
        
        setTimeout(() => {
            calendar.updateSize();
        }, 100);
        // Calendar navigation
        document.getElementById('prev-week').addEventListener('click', function() {
            calendar.prev();
            updateDateRangeDisplay(calendar);
        });
        
        document.getElementById('next-week').addEventListener('click', function() {
            calendar.next();
            updateDateRangeDisplay(calendar);
        });
        
        document.getElementById('today').addEventListener('click', function() {
            calendar.today();
            updateDateRangeDisplay(calendar);
        });
        
        // Calendar view switching
        document.getElementById('day-view').addEventListener('click', function() {
            calendar.changeView('timeGridDay');
            updateActiveViewButton('day');
            updateDateRangeDisplay(calendar);
        });
        
        document.getElementById('week-view').addEventListener('click', function() {
            calendar.changeView('timeGridWeek');
            updateActiveViewButton('week');
            updateDateRangeDisplay(calendar);
        });
        
        document.getElementById('month-view').addEventListener('click', function() {
            calendar.changeView('dayGridMonth');
            updateActiveViewButton('month');
            updateDateRangeDisplay(calendar);
        });
        
        // New event button
        document.getElementById('new-event-btn').addEventListener('click', function() {
            showEventModal(null);
        });
    }
    
    // Initialize the calendar
    initializeCalendar();
    
    // Load initial data
    loadMyAppointments();
    loadPatientAppointments();
    
    // Filter events
    document.getElementById('my-appointments-filter').addEventListener('change', function() {
        loadMyAppointments();
    });
    
    document.getElementById('patient-appointments-filter').addEventListener('change', function() {
        loadPatientAppointments();
    });
    
    // Refresh buttons
    document.getElementById('refresh-my-appointments').addEventListener('click', function() {
        loadMyAppointments();
    });
    
    document.getElementById('refresh-patient-appointments').addEventListener('click', function() {
        loadPatientAppointments();
    });
    
    // Search functionality
    document.getElementById('patient-appointments-search').addEventListener('input', function() {
        filterPatientAppointments(this.value);
    });
    
    // Update the date range display
    function updateDateRangeDisplay(calendar) {
        const view = calendar.view;
        const start = view.activeStart;
        const end = view.activeEnd;
        const rangeEl = document.getElementById('date-range-display');
        
        if (view.type === 'dayGridMonth') {
            const current = calendar.getDate();
            rangeEl.textContent = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else {
            const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: view.type === 'timeGridWeek' ? undefined : 'numeric' });
            rangeEl.textContent = `${startStr} - ${endStr}`;
        }
    }
    
    // Update active view button
    function updateActiveViewButton(activeView) {
        document.getElementById('day-view').classList.remove('active');
        document.getElementById('week-view').classList.remove('active');
        document.getElementById('month-view').classList.remove('active');
        
        document.getElementById(`${activeView}-view`).classList.add('active');
    }
    
    // Load calendar events from server
    async function loadCalendarEvents(fetchInfo, successCallback, failureCallback) {

        const events = [];
        await fetch('http://localhost/SmileConnector/backend/read_calendar_event.php')
        .then(r => {
            if (!r.ok) throw new Error('Network response was not OK');
            return r.json();
        })
        .then(data => {
            data.forEach(event => {
                events.push({
                id: event.id, // assuming each event has a unique ID
                title: event.title,
                start: event.start,
                end: event.end,
                type: event.type,
                extendedProps: {
                    description: event.extendedProps.description,
                    location: event.extendedProps.location,
                    patientId: event.extendedProps.patient_id,
                    treatment: event.extendedProps.treatment,
                    status: event.extendedProps.status,
                    attendees: event.attendees ? JSON.parse(event.attendees) : [] // assuming JSON string or comma-separated
                }
            });
            });
        })
        .catch(console.error);

        successCallback(events);
    }
    
    // Handle event click
    function handleEventClick(info) {
        info.jsEvent.preventDefault();
        showEventModal(info.event);
    }
    
    // Handle date click
    function handleDateClick(info) {
        if(info.date < new Date()) {
            showNotification('Cannot create event in the past', 'error');
        }
        else if (info.date < calendar.view.activeStart || info.date > calendar.view.activeEnd) {
            showNotification('Cannot create event outside the current view', 'error');
        }
        else if (info.date.getDay() === 0 || info.date.getDay() === 6) {
            showNotification('Cannot create event on weekends', 'error');
        }
        else{
                showEventModal(null, info.date);
        }
    }
    
    // Handle event drop (reschedule)
    function handleEventDrop(info) {
        
        console.log('Event rescheduled:', info.event.title, 'to', info.event.start);
        
        // Show notification
        showNotification('Event rescheduled successfully', 'success');
    }
    
    // Handle event resize
    function handleEventResize(info) {
        console.log('Event duration changed:', info.event.title, 'new duration:', info.event.end - info.event.start);
        
        // Show notification
        showNotification('Event duration updated successfully', 'success');
    }
    
    // Custom event rendering
    function renderEventContent(info) {
        const { event } = info;
        const event_id = event.id;
        const timeHtml = `<div class="fc-event-time">${info.timeText}</div>`;
        const titleHtml = `<div class="fc-event-title">${event.title}</div>`;
        
        const html = [timeHtml, titleHtml];
        
        if (event.extendedProps.type === 'appointment') {
            html.push(`<div class="fc-event-patient">${event.extendedProps.patientName}</div>`);
        }
        
        return { html };
    }
    
    // Show event modal
    function showEventModal(event, defaultDate = null) {
        // Close any existing modal first
        const existingModal = document.querySelector('.event-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal event-modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" id="diff-modal">
                <div class="modal-header">
                    <h3 id="${event ? 'edit-mode' : 'create-mode'}">${event ? 'Edit Event' : 'Create New Event'}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="event-form">
                        <input type="hidden" id="event-id" value="${event ? event.id : ''}">
                        <div class="event-type-options">
                            <div class="event-type-option">
                                <input type="radio" id="type-availability" name="event-type" value="availability" ${!event || event.extendedProps.type === 'availability' ? 'checked' : ''}>
                                <label for="type-availability">
                                    <i class="fas fa-user-clock"></i>
                                    <span>Availability</span>
                                </label>
                            </div>
                            <div class="event-type-option">
                                <input type="radio" id="type-appointment" name="event-type" value="appointment" ${event && event.extendedProps.type === 'appointment' ? 'checked' : ''}>
                                <label for="type-appointment">
                                    <i class="fas fa-calendar-check"></i>
                                    <span>Appointment</span>
                                </label>
                            </div>
                            <div class="event-type-option">
                                <input type="radio" id="type-task" name="event-type" value="task" ${event && event.extendedProps.type === 'task' ? 'checked' : ''}>
                                <label for="type-task">
                                    <i class="fas fa-tasks"></i>
                                    <span>Task</span>
                                </label>
                            </div>
                            <div class="event-type-option">
                                <input type="radio" id="type-meeting" name="event-type" value="meeting" ${event && event.extendedProps.type === 'meeting' ? 'checked' : ''}>
                                <label for="type-meeting">
                                    <i class="fas fa-users"></i>
                                    <span>Meeting</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="event-title">Title</label>
                                <input type="text" id="event-title" value="${event ? event.title : ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="event-start">Start</label>
                                <input type="datetime-local" id="event-start" required>
                            </div>
                            <div class="form-group">
                                <label for="event-end">End</label>
                                <input type="datetime-local" id="event-end" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="event-description">Description</label>
                            <textarea id="event-description">${event ? event.extendedProps.description || '' : ''}</textarea>
                        </div>
                        
                        <div id="appointment-fields" style="${!event || event.extendedProps.type !== 'appointment' ? 'display: none;' : ''}">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="appointment-patient">Patient</label>
                                    <select id="appointment-patient">
                                        <option value="">Select Patient</option>
                                        <option value="P001" ${event && event.extendedProps.patientId === 'P001' ? 'selected' : ''}>Thabo Mokoena</option>
                                        <option value="P002" ${event && event.extendedProps.patientId === 'P002' ? 'selected' : ''}>Lerato Ndlovu</option>
                                        <option value="P003" ${event && event.extendedProps.patientId === 'P003' ? 'selected' : ''}>Nomsa Dlamini</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="appointment-status">Status</label>
                                    <select id="appointment-status">
                                        <option value="scheduled" ${event && event.extendedProps.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                                        <option value="confirmed" ${event && event.extendedProps.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                        <option value="cancelled" ${event && event.extendedProps.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                        <option value="completed" ${event && event.extendedProps.status === 'completed' ? 'selected' : ''}>Completed</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="appointment-treatment">Treatment</label>
                                <input type="text" id="appointment-treatment" value="${event && event.extendedProps.treatment ? event.extendedProps.treatment : ''}">
                            </div>
                        </div>
                        
                        <div id="meeting-fields" style="${!event || event.extendedProps.type !== 'meeting' ? 'display: none;' : ''}">
                            <div class="form-group">
                                <label for="meeting-attendees">Attendees</label>
                                <input type="text" id="meeting-attendees" value="${event && event.extendedProps.attendees ? event.extendedProps.attendees.join(', ') : ''}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="event-location">Location</label>
                            <input type="text" id="event-location" value="${event ? event.extendedProps.location || '' : ''}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="secondary-btn cancel-event">Cancel</button>
                    ${event ? '<button class="delete-btn delete-event">Delete</button>' : ''}
                    <button class="primary-btn save-event">Save</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set initial dates
        const startInput = modal.querySelector('#event-start');
        const endInput = modal.querySelector('#event-end');
        
        const startDate = event ? new Date(event.start) : (defaultDate || new Date());
        const endDate = event ? new Date(event.end) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration
        
        startInput.value = formatDateTimeForInput(startDate);
        endInput.value = formatDateTimeForInput(endDate);
        
        // Show/hide fields based on event type
        modal.querySelectorAll('input[name="event-type"]').forEach(radio => {
            radio.addEventListener('change', function() {
                modal.querySelector('#appointment-fields').style.display = this.value === 'appointment' ? 'block' : 'none';
                modal.querySelector('#meeting-fields').style.display = this.value === 'meeting' ? 'block' : 'none';
            });
        });
        
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-event').addEventListener('click', () => modal.remove());
        
        // Save event
        modal.querySelector('.save-event').addEventListener('click', function() {
            // Get the selected event type
            const eventType = document.querySelector('input[name="event-type"]:checked').value;
            const modeHeader = document.querySelector('#diff-modal h3');

            // Get common fields
            const event_id = document.getElementById('event-id').value; // Generate a unique ID if creating new
            const title = document.getElementById('event-title').value;
            const start = document.getElementById('event-start').value;
            const end = document.getElementById('event-end').value;
            const description = document.getElementById('event-description').value;
            const location = document.getElementById('event-location').value;

            // Prepare data object
            const eventData = {
                id: event_id,
                type: eventType,
                title: title,
                start: start,
                end: end,
                description: description,
                location: location
            };

            // If appointment, get additional fields
            if (eventType === 'appointment') {
                eventData.patientId = document.getElementById('appointment-patient').value;
                eventData.status = document.getElementById('appointment-status').value;
                eventData.treatment = document.getElementById('appointment-treatment').value;
            }

            // If meeting, get attendees as raw string
            if (eventType === 'meeting') {
                const attendees = document.getElementById('meeting-attendees').value;
                eventData.attendees = attendees;
            }

            if(modeHeader.id==="create-mode") 
                {
                    // Send the data via fetch
                    fetch('http://localhost:80/SmileConnector/backend/calendar_event.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(eventData)
                    })
                    .then(response => response.json())
                    .then(result => {
                        console.log('Success:', result);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                }
            else if(modeHeader.id==="edit-mode"){
                // Send the data via fetch
                fetch('http://localhost:80/SmileConnector/backend/edit_calendar.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(eventData)
                })
                .then(response => response.json())
                .then(result => {
                    console.log('Success:', result);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
            
            modal.remove();
            showNotification('Event saved successfully', 'success');
            
            // Refresh calendar
            calendar.refetchEvents();
        });
        
        // Delete event
        if (event) {
            modal.querySelector('.delete-event').addEventListener('click', function() {
                modal.remove();

                window.showPasswordModal(
                    'Confirm Deletion',
                    `You are about to delete the event <strong>${event.title}</strong>. For security reasons, please confirm your password to proceed.`,
                    async function() {
                        // Proceed with deletion after password confirmation
                        try {
                            const response = await fetch('http://localhost:80/SmileConnector/backend/delete_calendar_event.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({id: event.id})
                            });
                            const result = await response.json();
                            if (result.success) {
                                showNotification('Event deleted successfully', 'success');
                                calendar.refetchEvents();
                            } else {
                                showNotification(result.message || 'Failed to delete event', 'error');
                            }
                        } catch (error) {
                            showNotification('Error deleting event', 'error');
                            console.error('Error:', error);
                        }
                    }
                );
            });
        }
    }
    
    // Format date for datetime-local input
    function formatDateTimeForInput(date) {
        const pad = num => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
    
    // Load my appointments
    async function loadMyAppointments() {
        const filter = document.getElementById('my-appointments-filter').value;
        const container = document.getElementById('my-appointments-list');
        
        const appointments = [];

        // Fetch data and push into the same array
        await fetch('http://localhost/SmileConnector/backend/read_calendar_event.php')
            .then(r => {
                if (!r.ok) throw new Error('Network response was not OK');
                return r.json();
            })
            .then(data => {
                data.forEach(event => {
                    const startDate = new Date(event.start);
                    const endDate   = new Date(event.end);

                    const opts = { hour: 'numeric', minute: 'numeric', hour12: true };
                    const timeStr = startDate.toLocaleTimeString(undefined, opts)
                                    + ' - '
                                    + endDate.toLocaleTimeString(undefined, opts);

                    appointments.push({
                        id:        event.id,
                        title:     event.title,
                        date:      startDate,
                        time:      timeStr,
                        patient: {
                            id:    event.patient_id || '',
                            name:  '',       // optional: populate from another lookup table
                            age:   null,
                            school:''
                        },
                        status:    event.extendedProps.status,
                        treatment: event.extendedProps.treatment,
                        notes:     event.extendedProps.description || ''
                    });
                });
            })
            .catch(console.error);
        
        // Filter appointments based on selected filter
        const now = new Date();
        let filteredAppointments = appointments;
        
        if (filter === 'upcoming') {
            filteredAppointments = appointments.filter(a => a.date > now);
        } else if (filter === 'past') {
            filteredAppointments = appointments.filter(a => a.date <= now);
        } else if (filter === 'today') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            filteredAppointments = appointments.filter(a => a.date >= todayStart && a.date <= todayEnd);
        } else if (filter === 'week') {
            const weekStart = new Date();
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() + 7);
            weekEnd.setHours(23, 59, 59, 999);
            filteredAppointments = appointments.filter(a => a.date >= weekStart && a.date <= weekEnd);
        } else if (filter === 'month') {
            const monthStart = new Date();
            monthStart.setHours(0, 0, 0, 0);
            const monthEnd = new Date();
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setHours(23, 59, 59, 999);
            filteredAppointments = appointments.filter(a => a.date >= monthStart && a.date <= monthEnd);
        }
        
        // Render appointments
        if (filteredAppointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <p>No appointments found</p>
                </div>
            `;
        } else {
            container.innerHTML = filteredAppointments.map(appointment => `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <div class="appointment-title">${appointment.title}</div>
                        <div class="appointment-time">${formatDate(appointment.date)} • ${appointment.time}</div>
                    </div>
                    <div class="appointment-body">
                        <div class="appointment-patient">
                            <div class="patient-avatar">
                                <i class="fas fa-user-injured"></i>
                            </div>
                            <div class="patient-info">
                                <h4>${appointment.patient.name}</h4>
                                <p>${appointment.patient.age} years • ${appointment.patient.school}</p>
                            </div>
                        </div>
                        <div class="appointment-details">
                            <p><span class="detail-label">Treatment:</span> ${appointment.treatment}</p>
                            <p><span class="detail-label">Notes:</span> ${appointment.notes}</p>
                        </div>
                        <div class="appointment-actions">
                            <button class="appointment-action-btn view-details" data-id="${appointment.id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="appointment-action-btn edit-appointment" data-id="${appointment.id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="appointment-action-btn cancel-appointment" data-id="${appointment.id}" title="Cancel">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners to action buttons
            container.querySelectorAll('.view-details').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appointmentId = this.getAttribute('data-id');
                    viewAppointmentDetails(appointmentId);
                });
            });
            
            container.querySelectorAll('.edit-appointment').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appointmentId = this.getAttribute('data-id');
                    editAppointment(appointmentId);
                });
            });
            
            container.querySelectorAll('.cancel-appointment').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appointmentId = this.getAttribute('data-id');
                    cancelAppointment(appointmentId);
                });
            });
        }
    }
    
    // Load patient appointments
    async function loadPatientAppointments(filterValue = null) {
        const filter = filterValue || document.getElementById('patient-appointments-filter').value;
        const container = document.getElementById('patient-appointments-list');
        
        const appointments = [];

        await fetch('http://localhost/SmileConnector/backend/read_calendar_event.php')
        .then(r => {
            if (!r.ok) throw new Error('Network response was not OK');
            return r.json();
        })
        .then(data => {
            data.forEach(event => {
            const startDate = new Date(event.start);
            const endDate   = new Date(event.end);

            // Build the “time” string: e.g. “10:00 AM – 11:00 AM”
            const opts = { hour: 'numeric', minute: 'numeric', hour12: true };
            const timeStr = startDate.toLocaleTimeString(undefined, opts)
                            + ' - '
                            + endDate.toLocaleTimeString(undefined, opts);

            const patient = {
                id:    event.extendedProps.patientId || null,
                name:  '',     
                age:   null,
                school:''
            };

            const notes = event.extendedProps.description || '';

            // Push into appointments in the same shape as your mock data
            appointments.push({
                id:        event.id,               
                title:     event.title,            
                date:      startDate,              
                time:      timeStr,                
                patient,                           
                status:    event.extendedProps.status,
                treatment: event.extendedProps.treatment,
                notes
            });
            });
            
        })
        .catch(console.error);
        
        // Filter appointments based on selected filter
        const now = new Date();
        let filteredAppointments = appointments;
        
        if (filter === 'upcoming') {
            filteredAppointments = appointments.filter(a => a.date > now);
        } else if (filter === 'past') {
            filteredAppointments = appointments.filter(a => a.date <= now);
        } else if (filter === 'today') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            filteredAppointments = appointments.filter(a => a.date >= todayStart && a.date <= todayEnd);
        } else if (filter === 'week') {
            const weekStart = new Date();
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() + 7);
            weekEnd.setHours(23, 59, 59, 999);
            filteredAppointments = appointments.filter(a => a.date >= weekStart && a.date <= weekEnd);
        } else if (filter === 'month') {
            const monthStart = new Date();
            monthStart.setHours(0, 0, 0, 0);
            const monthEnd = new Date();
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setHours(23, 59, 59, 999);
            filteredAppointments = appointments.filter(a => a.date >= monthStart && a.date <= monthEnd);
        }

        // Render appointments
        if (filteredAppointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <p>No patient appointments found</p>
                </div>
            `;
        } else {
            container.innerHTML = filteredAppointments.map(appointment => `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <div class="appointment-title">${appointment.title}</div>
                        <div class="appointment-time">${formatDate(appointment.date)} • ${appointment.time}</div>
                    </div>
                    <div class="appointment-body">
                        <div class="appointment-patient">
                            <div class="patient-avatar">
                                <i class="fas fa-user-injured"></i>
                            </div>
                            <div class="patient-info">
                                <h4>${appointment.patient.name}</h4>
                                <p>${appointment.patient.age} years • ${appointment.patient.school} • ${appointment.patient.location}</p>
                            </div>
                        </div>
                        <div class="appointment-details">
                            <p><span class="detail-label">Dentist:</span> ${appointment.dentist}</p>
                            <p><span class="detail-label">Treatment:</span> ${appointment.treatment}</p>
                            <p><span class="detail-label">Notes:</span> ${appointment.notes}</p>
                        </div>
                        <div class="appointment-actions">
                            <button class="appointment-action-btn view-details" data-id="${appointment.id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="appointment-action-btn reschedule-appointment" data-id="${appointment.id}" title="Reschedule">
                                <i class="fas fa-calendar-alt"></i>
                            </button>
                            <button class="appointment-action-btn cancel-appointment" data-id="${appointment.id}" title="Cancel">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            // Add event listeners to action buttons
            container.querySelectorAll('.view-details').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appointmentId = this.getAttribute('data-id');
                    viewAppointmentDetails(appointmentId);
                });
            });
            
            container.querySelectorAll('.reschedule-appointment').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appointmentId = this.getAttribute('data-id');
                    rescheduleAppointment(appointmentId);
                });
            });
            
            container.querySelectorAll('.cancel-appointment').forEach(btn => {
                btn.addEventListener('click', function() {
                    const appointmentId = this.getAttribute('data-id');
                    cancelAppointment(appointmentId);
                });
            });
        }
    }
    
    // View appointment details
    function viewAppointmentDetails(appointmentId) {
        console.log('Viewing details for appointment:', appointmentId);
        showNotification(`Viewing details for appointment ${appointmentId}`, 'info');
    }
    
    // Edit appointment
    function editAppointment(appointmentId) {
        console.log('Editing appointment:', appointmentId);
        showNotification(`Editing appointment ${appointmentId}`, 'info');
    }
    
    // Reschedule appointment
    function rescheduleAppointment(appointmentId) {
        console.log('Rescheduling appointment:', appointmentId);
        showNotification(`Rescheduling appointment ${appointmentId}`, 'info');
    }
    
    // Cancel appointment
    function cancelAppointment(appointmentId) {
        if (confirm('Are you sure you want to cancel this appointment?')) {

            console.log('Cancelled appointment:', appointmentId);
            showNotification(`Appointment ${appointmentId} cancelled`, 'success');
            
            // Refresh the appointments list
            const activeTab = document.querySelector('.calendar-tab.active').getAttribute('data-tab');
            if (activeTab === 'my-appointments') {
                loadMyAppointments();
            } else if (activeTab === 'patient-appointments') {
                loadPatientAppointments();
            }
        }
    }
    
    // Filter patient appointments by search term
    function filterPatientAppointments(searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const appointments = document.querySelectorAll('#patient-appointments-list .appointment-card');
        
        appointments.forEach(appointment => {
            const text = appointment.textContent.toLowerCase();
            appointment.style.display = text.includes(lowerSearchTerm) ? 'block' : 'none';
        });
    }
    
    // Format date for display
    function formatDate(date) {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
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
});
window.refreshCalendarTab = function() {
    if (window.calendar && typeof window.calendar.refetchEvents === 'function') {
        window.calendar.refetchEvents();
    }
    if (typeof loadMyAppointments === 'function') loadMyAppointments();
    if (typeof loadPatientAppointments === 'function') loadPatientAppointments();
};
function refreshTabData(tabId) {
    switch (tabId) {
        case 'calendar-appointments':
            if (typeof window.refreshCalendarTab === 'function') {
                window.refreshCalendarTab();
            }
            break;
    }
}