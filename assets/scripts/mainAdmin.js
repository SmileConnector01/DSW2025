document.addEventListener('DOMContentLoaded', function() {

    // 1. Fetch the events JSON
  fetch('http://localhost:80/SmileConnector/backend/readevent.php?type=upcoming_event')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not OK');
      return response.json();
    })
    .then(events => {
      events.forEach(evt => {
        let upcoming_activity = document.getElementById('upcoming-activity');
        const minute = new Date(evt.date).getMinutes();
        const hour = new Date(evt.date).getHours();
        const date = new Date(evt.date);
        const day = date.getDate(); 
        const month = date.getMonth()+1;
        // Get padded month number
        const paddedMonth = String(month).padStart(2, '0'); // "07"

        // Abbreviated month name (e.g., 'Jul')
        const shortMonth = date.toLocaleString('default', { month: 'short' }); // "Jul"

        if (dashboard) {
            upcoming_activity.innerHTML += `
                <div class="event-item">
                    <div class="event-date">
                    <span class="event-day">${day}</span>
                    <span class="event-month">${shortMonth}</span>
                    </div>
                    <div class="event-details">
                    <h3>${evt.school}</h3>
                    <p>${evt.location}</p>
                    <span class="event-time">${hour}:${minute}</span>
                    </div>
                </div>
            `;
        }
      });
    })
    .catch(err => {
      console.error('Failed loading events:', err);
      // optionally show a user‐friendly message
    });

    //Fetching username from the backend
    const username = document.querySelectorAll('.user-name');
    const email = document.querySelectorAll(".user-email");
    const urlParams = new URLSearchParams(window.location.search);
    const fullName = urlParams.get('username') || "Admin";
    const Email = urlParams.get('email');

    username.forEach((userName =>{
        userName.textContent = fullName;
    }))

    email.forEach((mail =>{
        mail.textContent = Email;
    }))

    logoutLink = document.querySelector('#logoutLink');
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
    
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
                // alert('Failed to logout. Please try again.');
                showNotification('Logout failed. Please try again.', 'error');
            });
    });
    
    // // Attach event listeners to all existing admin rows
    // document.querySelectorAll('#admins .patient-table tbody tr').forEach(row => {
    //     attachAdminRowEventListeners(row);
    // });
    
    const superAdminBox = document.getElementById('permSuperAdmin');
    const superAdminGroup = superAdminBox.closest('.super-admin-permission');
    function updateSuperAdminStyle() {
        if (superAdminBox.checked) {
        superAdminGroup.classList.add('checked');
        } else {
        superAdminGroup.classList.remove('checked');
        }
    }
    superAdminBox.addEventListener('change', updateSuperAdminStyle);
    updateSuperAdminStyle();

    // Attach event listeners to all existing admin rows
    document.querySelectorAll('#admins .patient-table tbody tr').forEach(row => {
        attachAdminRowEventListeners(row);
    });

    const adminSearchInput = document.querySelector('#admins .search-input');
    const adminSearchBtn = document.querySelector('#admins .search-btn');

    if (adminSearchInput && adminSearchBtn) {
        // Search when button is clicked
        adminSearchBtn.addEventListener('click', () => searchAdmins());
        
        // Search as user types (with debounce to improve performance)
        let searchTimeout;
        adminSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => searchAdmins(), 300);
        });
        
        // Also search when Enter key is pressed
        adminSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchAdmins();
            }
        });
    }
  // User profile dropdown toggle
  const userProfileBtn = document.getElementById('userProfileBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userProfileBtn && userDropdown) {
      userProfileBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          document.querySelector('.user-profile').classList.toggle('active');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
          if (!userProfileBtn.contains(e.target) && !userDropdown.contains(e.target)) {
              document.querySelector('.user-profile').classList.remove('active');
          }
      });
  }
  
  // Dark mode toggle
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  
  if (darkModeToggle) {
      darkModeToggle.addEventListener('click', function() {
          document.body.classList.toggle('dark-mode');
          darkModeToggle.classList.toggle('active');
          
          // Save preference to localStorage
          const isDarkMode = document.body.classList.contains('dark-mode');
          localStorage.setItem('darkMode', isDarkMode);
      });
      
      // Check for saved preference
      if (localStorage.getItem('darkMode') === 'true') {
          document.body.classList.add('dark-mode');
          darkModeToggle.classList.add('active');
      }
  }
  
    // Mobile menu toggle
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

    if (mobileMenuToggle && sidebar && sidebarOverlay) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            if (sidebar.classList.contains('active')) {
                sidebarOverlay.style.display = 'block';
                setTimeout(() => sidebarOverlay.style.opacity = '1', 10);
            } else {
                sidebarOverlay.style.opacity = '0';
                setTimeout(() => sidebarOverlay.style.display = 'none', 300);
            }
        });

        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            sidebarOverlay.style.opacity = '0';
            setTimeout(() => sidebarOverlay.style.display = 'none', 300);
        });
    }
  
  // Close mobile menu when clicking on a link
  const sidebarLinks = document.querySelectorAll('.sidebar a');
  sidebarLinks.forEach(link => {
      link.addEventListener('click', function() {
          if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                sidebarOverlay.style.opacity = '0';
                setTimeout(() => sidebarOverlay.style.display = 'none', 300);
                // mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
      });
  });
  
  // Responsive adjustments for sidebar
  function handleResponsive() {
      if (window.innerWidth > 768) {
          sidebar.classList.remove('active');
          if (mobileMenuToggle) {
              mobileMenuToggle.classList.remove('active');
              mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
          }
      }
  }
  
  window.addEventListener('resize', handleResponsive);
  handleResponsive(); // Initialize
  
  // Initialize charts
  initDashboardCharts();
  
  // Tab switching functionality
  const tabLinks = document.querySelectorAll('.sidebar li');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabLinks.forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          const tabId = this.getAttribute('data-tab');
          
          // Update active tab
          tabLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
          
          // Update active pane
          tabPanes.forEach(pane => {
              pane.classList.remove('active');
              if (pane.id === tabId) {
                  pane.classList.add('active');
              }
          });
            if (tabId === 'admins') {
                loadAdminTable();
            } else if (tabId === 'patients') {
                loadPatientTable();
            }
            // Initialize school programs tab if it's the active tab
            if (tabId === 'schools') {
              initAddEventButton();
            }
                // when you hide/remove the iframe
            if(document.getElementById('videoconferenceIframe')) {
                const iframeid = document.getElementById('videoconferenceIframe');
                iframeid.contentWindow.postMessage({ cmd: 'stop-camera' }, '*');
            }
      
      });
  });



document.querySelector('.tele-dentistry-content')?.addEventListener('click', function(e) {
    e.preventDefault();
    loadTeleDentistry();
});

// Tab switching functionality for TeleDentistry
    function loadTeleDentistry() {
    const container = document.getElementById('teleDentistryContainer');
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create an iframe to load the video conference
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'videoconferenceIframe');
    iframe.src = 'video_conf/public/index.html';
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

// Tab switching functionality for messages_chat
document.querySelector('[data-tab="chat"]').addEventListener('click', function(e) {
    e.preventDefault();
    //loadChatInterface();
});

  
  // Modal handling
  const addAdminBtn = document.getElementById('addAdminBtn');
  const addPatientBtn = document.getElementById('addPatientBtn');
  const adminFormModal = document.getElementById('adminFormModal');
  const patientFormModal = document.getElementById('patientFormModal');
  const adminDetailsModal = document.getElementById('adminDetailsModal');
  const closeModalButtons = document.querySelectorAll('.close-modal, .cancel-btn');
  
// Open modals with password confirmation for Add Admin
if (addAdminBtn) {
    addAdminBtn.addEventListener('click', () => {
        console.log('Add admin button clicked');
        
        const openAdminModalCallback = function() {
            console.log('Password confirmed, opening admin modal...');
            
            // Reset the form completely
            resetAdminForm();
            
            // Set modal title
            document.getElementById('adminModalTitle').textContent = 'Add New Admin';
            
            // Set status to pending (readonly)
            const statusSelect = document.getElementById('adminStatus');
            statusSelect.value = 'pending';
            statusSelect.disabled = true;
            
            // Show modal
            const adminModal = document.getElementById('adminFormModal');
            if (adminModal) {
                adminModal.classList.add('active');
                console.log('Admin modal opened successfully');
            } else {
                console.error('Admin modal not found');
            }
        };
        
        showPasswordModal(
            'Admin Access Required',
            'You are about to add a new admin user. For security reasons, please confirm your password to proceed.',
            openAdminModalCallback
        );
    });
}
  
  if (addPatientBtn) {
        addPatientBtn.addEventListener('click', () => {
            resetPatientForm();
            document.getElementById('patientModalTitle').textContent = 'Add New Patient';
            patientFormModal.classList.add('active');
        });
    }
  
//   // View admin details
//   viewAdminButtons.forEach(button => {
//       button.addEventListener('click', function() {
//           const adminRow = this.closest('tr');
//           const adminId = adminRow.getAttribute('data-id');
          
//           // Get data from table row
//           const adminName = adminRow.cells[1].textContent;
//           const adminEmail = adminRow.cells[2].textContent;
//           const adminType = adminRow.cells[3].querySelector('span').textContent;
//           const adminStatus = adminRow.cells[5].querySelector('span').textContent;
//           const lastLogin = adminRow.cells[4].textContent;
          
//           // Update modal with admin details
//           document.getElementById('detailAdminName').textContent = adminName;
//           document.getElementById('detailAdminId').textContent = `Admin ID: ${adminId}`;
//           document.getElementById('detailAdminEmail').textContent = adminEmail;
//           document.getElementById('detailAdminType').textContent = adminType;
//           document.getElementById('detailAdminStatus').textContent = adminStatus;
//           document.getElementById('detailLastLogin').textContent = lastLogin;
          
//           // Show the modal
//           adminDetailsModal.classList.add('active');
//       });
//   });
  
  // Close modals
  closeModalButtons.forEach(button => {
      button.addEventListener('click', (e) => {
          e.preventDefault();
          adminFormModal.classList.remove('active');
          patientFormModal.classList.remove('active');
          adminDetailsModal.classList.remove('active');
      });
  });
  
  // Edit admin from details modal
//   const editFromDetailsBtn = document.querySelector('.edit-from-details');
//   if (editFromDetailsBtn) {
//       editFromDetailsBtn.addEventListener('click', function(e) {
//           e.preventDefault();
//           adminDetailsModal.classList.remove('active');
          
//           // Populate the edit form with the admin's details
//           document.getElementById('adminModalTitle').textContent = 'Edit Admin';
//           document.getElementById('adminName').value = document.getElementById('detailAdminName').textContent;
//           document.getElementById('adminEmail').value = document.getElementById('detailAdminEmail').textContent;
          
//           // Set the role based on the admin type
//           const adminType = document.getElementById('detailAdminType').textContent;
//           let roleValue = '';
//           if (adminType.includes('Super')) roleValue = 'super';
//           else if (adminType.includes('Clinic')) roleValue = 'clinic';
//           else if (adminType.includes('Field')) roleValue = 'field';
//           else if (adminType.includes('School')) roleValue = 'school';
//           document.getElementById('adminRole').value = roleValue;
          
//           // Set the status
//           const adminStatus = document.getElementById('detailAdminStatus').textContent;
//           let statusValue = 'active';
//           if (adminStatus.includes('Pending')) statusValue = 'pending';
//           else if (adminStatus.includes('Inactive')) statusValue = 'inactive';
//           document.getElementById('adminStatus').value = statusValue;
          
//           // Show the edit modal
//           adminFormModal.classList.add('active');
//       });
//   }
  
//   // Filter/sort functionality
//   const adminTypeFilter = document.getElementById('adminTypeFilter');
//   const adminStatusFilter = document.getElementById('adminStatusFilter');
//   const adminSort = document.getElementById('adminSort');
  
//   const patientLocationFilter = document.getElementById('patientLocationFilter');
//   const patientStatusFilter = document.getElementById('patientStatusFilter');
//   const patientSort = document.getElementById('patientSort');
  
//   const auditActionType = document.getElementById('auditActionType');
//   const auditTimeRange = document.getElementById('auditTimeRange');
  
//   // Admin filters
//     if (adminTypeFilter) {
//         adminTypeFilter.addEventListener('change', filterAdmins);
//     }

//     if (adminStatusFilter) {
//         adminStatusFilter.addEventListener('change', filterAdmins);
//     }

//     if (adminSort) {
//         adminSort.addEventListener('change', sortAdmins);
//     }
    
  // Patient filters
  if (patientLocationFilter) {
      patientLocationFilter.addEventListener('change', function() {
          filterPatients();
      });
  }
  
  if (patientStatusFilter) {
      patientStatusFilter.addEventListener('change', function() {
          filterPatients();
      });
  }
  
  if (patientSort) {
      patientSort.addEventListener('change', function() {
          sortPatients();
      });
  }
  
  // Audit filters
  if (auditActionType) {
      auditActionType.addEventListener('change', function() {
          filterAuditLogs();
      });
  }
  
  if (auditTimeRange) {
      auditTimeRange.addEventListener('change', function() {
          filterAuditLogs();
      });
  }
  // System maintenance buttons
  const maintenanceButtons = ['backupBtn', 'clearCacheBtn', 'optimizeDbBtn', 'purgeDataBtn'];
  maintenanceButtons.forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
          btn.addEventListener('click', function(e) {
              e.preventDefault();
              const action = btnId.replace('Btn', '');
              console.log(`Initiating ${action}...`);
            //   alert(`${action.charAt(0).toUpperCase() + action.slice(1)} process initiated.`);
              showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} process initiated.`, 'success');
          });
      }
  });
  


  // Search function
function searchAdmins() {
    const searchTerm = adminSearchInput.value.trim().toLowerCase();
    const rows = document.querySelectorAll('#admins .patient-table tbody tr');
    
    if (searchTerm === '') {
        // If search is empty, show all rows
        rows.forEach(row => row.style.display = '');
        return;
    }
    
    rows.forEach(row => {
        // Get all text content from the row (excluding action buttons)
        const rowText = Array.from(row.cells)
            .slice(0, -1) // Exclude the actions cell
            .map(cell => cell.textContent.toLowerCase())
            .join(' ');
        
        // Also include the admin type and status badge text
        //const typeText = row.cells[3].querySelector('span').textContent.toLowerCase();
        const statusText = row.cells[5].querySelector('span').textContent.toLowerCase();
        const fullText = rowText + ' ' + typeText + ' ' + statusText;
        
        // Show/hide based on match
        row.style.display = fullText.includes(searchTerm) ? '' : 'none';
    });
}


  
//   function filterPatients() {
//       const locationFilter = patientLocationFilter.value;
//       const statusFilter = patientStatusFilter.value;
      
//       document.querySelectorAll('#patients .patient-table tbody tr').forEach(row => {
//           const rowLocation = row.cells[3].textContent.toLowerCase();
//           const rowStatus = row.cells[6].querySelector('span').textContent.toLowerCase();
          
//           const locationMatch = locationFilter === 'all' || rowLocation.includes(locationFilter);
//           const statusMatch = statusFilter === 'all' || rowStatus.includes(statusFilter.replace('-', ' '));
          
//           row.style.display = locationMatch && statusMatch ? '' : 'none';
//       });
//   }
  
//   function sortPatients() {
//       const sortBy = patientSort.value;
//       const tbody = document.querySelector('#patients .patient-table tbody');
//       const rows = Array.from(tbody.querySelectorAll('tr'));
      
//       rows.sort((a, b) => {
//           if (sortBy === 'name') {
//               return a.cells[1].textContent.localeCompare(b.cells[1].textContent);
//           } else if (sortBy === 'age') {
//               return parseInt(a.cells[2].textContent) - parseInt(b.cells[2].textContent);
//           } else if (sortBy === 'last-visit') {
//               return new Date(b.cells[5].textContent) - new Date(a.cells[5].textContent);
//           }
//           // Default: recent
//           return a.getAttribute('data-id').localeCompare(b.getAttribute('data-id'));
//       });
      
//       // Re-append sorted rows
//       rows.forEach(row => tbody.appendChild(row));
//   }
  
  function filterAuditLogs() {
      const actionFilter = auditActionType.value;
      const timeFilter = auditTimeRange.value;
      
      document.querySelectorAll('#audit .patient-table tbody tr').forEach(row => {
          const rowAction = row.cells[1].querySelector('span').textContent.toLowerCase();
          const rowTimestamp = row.cells[0].textContent.toLowerCase();
          
          const actionMatch = actionFilter === 'all' || rowAction.includes(actionFilter);
          // Basic time filtering - in a real app you'd use actual dates
          const timeMatch = timeFilter === 'all' ||  
                          (timeFilter === 'today' && rowTimestamp.includes('today')) || 
                          (timeFilter === 'week' && (rowTimestamp.includes('today') || rowTimestamp.includes('yesterday') || rowTimestamp.includes('days ago')));
          
          row.style.display = actionMatch && timeMatch ? '' : 'none';
      });
  }
});



// Dashboard Charts Initialization
async function initDashboardCharts() {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
  }

  // Create the outreach chart
  const outreachCtx = document.getElementById('outreachChart');
  if (outreachCtx) {
        const ctx = document.getElementById('outreachChart').getContext('2d');
        const now = new Date();
        const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        let currentMonthName;
        let currentMonthName_1;
        let currentMonthName_2;   
        let currentMonthName_3;
        let currentMonthName_4;
        let currentMonthName_5;

        let current_year_1 = now.getFullYear();
        let current_year_2 = now.getFullYear();
        let current_year_3 = now.getFullYear();
        let current_year_4 = now.getFullYear();
        let current_year_5 = now.getFullYear();
        for(let i=0; i<6; i++){
            if(i == 0){
                currentMonthName = monthNames[now.getMonth()];
            }
            else if(i == 1){
                let index_month = now.getMonth() - i;
                let less_than_zero;
                if(index_month < 0){
                    less_than_zero = 11 + index_month + 1;
                    currentMonthName_1 = monthNames[less_than_zero];
                    current_year_1 = now.getFullYear()-1;
                }
                else{
                    currentMonthName_1 = monthNames[index_month];
                }
            }
            else if(i == 2){
                let index_month = now.getMonth() - i;
                let less_than_zero;
                if(index_month < 0){
                    less_than_zero = 11 + index_month + 1;
                    currentMonthName_2 = monthNames[less_than_zero];
                    current_year_2 = now.getFullYear()-1;
                }
                else{
                    currentMonthName_2 = monthNames[index_month];
                }
            }
            else if(i == 3){
                let index_month = now.getMonth() - i;
                let less_than_zero;
                if(index_month < 0){
                    less_than_zero = 11 + index_month + 1;
                    currentMonthName_3 = monthNames[less_than_zero];
                    current_year_3 = now.getFullYear()-1;
                }
                else{
                    currentMonthName_3 = monthNames[index_month];
                }
            }
            else if(i == 4){
                let index_month = now.getMonth() - i;
                let less_than_zero;
                if(index_month < 0){
                    less_than_zero = 11 + index_month + 1;
                    currentMonthName_4 = monthNames[less_than_zero];
                    current_year_4 = now.getFullYear()-1;
                }
                else{
                    currentMonthName_4 = monthNames[index_month];
                }
            }
            else if(i == 5){
                let index_month = now.getMonth() - i;
                let less_than_zero;
                if(index_month < 0){
                    less_than_zero = 11 + index_month + 1;
                    currentMonthName_5 = monthNames[less_than_zero];
                    current_year_5 = now.getFullYear()-1;
                }
                else{
                    currentMonthName_5 = monthNames[index_month];
                }
            }
        }

        let count_currentMonthName = 0;
        let count_currentMonthName_1 = 0;
        let count_currentMonthName_2 = 0;
        let count_currentMonthName_3 = 0;
        let count_currentMonthName_4 = 0;
        let count_currentMonthName_5 = 0;

        let count_schoolPrograms = 0;
        let count_schoolPrograms1 = 0;
        let count_schoolPrograms2 = 0;
        let count_schoolPrograms3 = 0;
        let count_schoolPrograms4 = 0;
        let count_schoolPrograms5 = 0;

        let count_mobileClinics = 0;
        let count_mobileClinics1 = 0;
        let count_mobileClinics2 = 0;
        let count_mobileClinics3 = 0;
        let count_mobileClinics4 = 0;
        let count_mobileClinics5 = 0;

        await fetch('http://localhost:80/SmileConnector/backend/firstgraph.php?type=firstgraph2')
    .then(res => res.text()) // Always read as text first
    .then(text => {
        try {
            const data = JSON.parse(text); // Try parsing JSON
            if (data.error) {
                console.error('Server responded with error:', data);
                return;
            }

            data.forEach(event => {
                const dateString = event.call_time;
                const date = new Date(dateString);
                const year = date.getFullYear();

                const monthNumber = date.getMonth(); 
                const monthName = monthNames[monthNumber];

                if (monthName === currentMonthName) {
                    count_mobileClinics += 1;
                } else if (monthName === currentMonthName_1 && year === current_year_1) {
                    count_mobileClinics1 += 1;
                } else if (monthName === currentMonthName_2 && year === current_year_2) {
                    count_mobileClinics2 += 1;
                } else if (monthName === count_currentMonthName_3 && year === current_year_3) {
                    count_mobileClinics3 += 1;
                } else if (monthName === currentMonthName_4 && year === current_year_4) {
                    count_mobileClinics4 += 1;
                } else if (monthName === currentMonthName_5 && year === current_Year) {
                    count_mobileClinics5 += 1;
                }
            });
        } catch (e) {
            console.error('Invalid JSON from server. Raw response:', text);
        }
    })
    .catch(error => {
        console.error('Network or fetch error:', error);
    });

        await fetch('http://localhost:80/SmileConnector/backend/firstgraph.php?type=firstgraph1')
        .then(res => res.json())
        .then(data => {
            data.forEach(event => {
                const dateString = event.date;
                const date = new Date(dateString);
                const year = date.getFullYear();

                // Get month (0–11, so add 1 if you want 1–12)
                const monthNumber = date.getMonth(); 

                const monthName = monthNames[date.getMonth()];

                if(monthName == currentMonthName){
                    count_currentMonthName += event.students;
                    count_schoolPrograms += 1;
                }
                else if(monthName == currentMonthName_1 && year == current_year_1){
                    count_currentMonthName_1 += event.students;
                    count_schoolPrograms1 += 1;
                }
                else if(monthName == currentMonthName_2 && year == current_year_2){
                    count_currentMonthName_2 += event.students;
                    count_schoolPrograms2 += 1;
                }
                else if(monthName == count_currentMonthName_3 && year == current_year_3){
                    count_currentMonthName_3 += event.students;
                    count_schoolPrograms3 += 1;
                }
                else if(monthName == currentMonthName_4 && year == current_year_4){
                    count_currentMonthName_4 += event.students;
                    count_schoolPrograms4 += 1;
                }
                else if(monthName == currentMonthName_5 && year == current_Year){
                    count_currentMonthName_5 += event.students;
                    count_schoolPrograms5 += 1;
                }
            });
        });
    const outreachChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [currentMonthName_5, currentMonthName_4, currentMonthName_3, currentMonthName_2, currentMonthName_1, currentMonthName],
            datasets: [
                {
                    label: 'student Outreach',
                    data: [count_currentMonthName_5, count_currentMonthName_4, count_currentMonthName_3, count_currentMonthName_2, count_currentMonthName_1, count_currentMonthName],
                    backgroundColor: '#5A80FF',
                    borderRadius: 5
                },
                {
                    label: 'School Programs',
                    data: [count_schoolPrograms5, count_schoolPrograms4, count_schoolPrograms3, count_schoolPrograms2, count_schoolPrograms1, count_schoolPrograms],
                    backgroundColor: '#315CBC',
                    borderRadius: 5
                },
                {
                    label: 'Mobile Clinics',
                    data: [count_mobileClinics5, count_mobileClinics4, count_mobileClinics3, count_mobileClinics2, count_mobileClinics1, count_mobileClinics],
                    backgroundColor: '#0077FF',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e1e5eb'
                    }
                }
            }
        }
    });
  }

    let totalCavities = 0;
    let totalGumDisease = 0;
    let totalToothLoss = 0;
    let totalOther = 0;

    await fetch('http://localhost:80/SmileConnector/backend/firstgraph.php?type=secondgraph')
    .then(res => res.text())
    .then(text => {
        try {
            const data = JSON.parse(text); // Try to parse JSON from PHP

            data.forEach(row => {
                totalCavities    += parseInt(row.Cavities)    || 0;
                totalGumDisease  += parseInt(row.GumDisease)  || 0;
                totalToothLoss   += parseInt(row.ToothLoss)   || 0;
                totalOther       += parseInt(row.Other)       || 0;
            });

            // You can now pass these totals into a chart or UI
        } catch (e) {
            console.error('Invalid JSON from server. Raw response:', text);
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });

  // Create the conditions chart
   const ctx = document.getElementById('conditionsChart').getContext('2d');
    const conditionsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cavities', 'Gum Disease', 'Tooth Loss', 'Other'],
            datasets: [{
                data: [totalCavities, totalGumDisease, totalToothLoss, totalOther],
                backgroundColor: [
                    '#5A80FF',
                    '#315CBC',
                    '#0077FF',
                    '#FFF235'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// ==================== PATIENT MANAGEMENT ====================

// Initialize patient functionality
function initPatientManagement() {
    // Attach event listeners to existing patient rows
    document.querySelectorAll('#patients .patient-table tbody tr').forEach(row => {
        attachPatientRowEventListeners(row);
    });

    // Patient search functionality
    const patientSearchInput = document.querySelector('#patients .search-input');
    const patientSearchBtn = document.querySelector('#patients .search-btn');

    if (patientSearchInput && patientSearchBtn) {
        // Search when button is clicked
        patientSearchBtn.addEventListener('click', searchPatients);
        
        // Search as user types (with debounce)
        let searchTimeout;
        patientSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(searchPatients, 300);
        });
        
        // Search when Enter key is pressed
        patientSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchPatients();
        });
    }

    // Filter/Sort listeners
    const patientLocationFilter = document.getElementById('patientLocationFilter');
    const patientStatusFilter = document.getElementById('patientStatusFilter');
    const patientSort = document.getElementById('patientSort');

    if (patientLocationFilter) patientLocationFilter.addEventListener('change', filterPatients);
    if (patientStatusFilter) patientStatusFilter.addEventListener('change', filterPatients);
    if (patientSort) patientSort.addEventListener('change', sortPatients);

    // // Edit from details modal
    // document.querySelector('#patientDetailsModal .edit-from-details')?.addEventListener('click', function() {
    //     document.getElementById('patientDetailsModal').classList.remove('active');
    //     document.getElementById('patientModalTitle').textContent = 'Edit Patient';
    //     document.getElementById('patientFormModal').classList.add('active');
    // });
}

// Search patients
function searchPatients() {
    const searchTerm = document.querySelector('#patients .search-input').value.trim().toLowerCase();
    const rows = document.querySelectorAll('#patients .patient-table tbody tr');
    
    rows.forEach(row => {
        const rowText = Array.from(row.cells)
            .slice(0, -1) // Exclude actions cell
            .map(cell => cell.textContent.toLowerCase())
            .join(' ');
        const statusText = row.cells[6].querySelector('span').textContent.toLowerCase();
        const fullText = rowText + ' ' + statusText;
        
        row.style.display = searchTerm === '' || fullText.includes(searchTerm) ? '' : 'none';
    });
}

// Filter patients
function filterPatients() {
    const locationFilter = document.getElementById('patientLocationFilter').value;
    const statusFilter = document.getElementById('patientStatusFilter').value;
    const searchTerm = document.querySelector('#patients .search-input')?.value.trim().toLowerCase() || '';
    
    document.querySelectorAll('#patients .patient-table tbody tr').forEach(row => {
        const rowLocation = row.cells[3].textContent.toLowerCase();
        const rowStatus = row.cells[6].querySelector('span').textContent.toLowerCase();
        
        const rowText = Array.from(row.cells)
            .slice(0, -1)
            .map(cell => cell.textContent.toLowerCase())
            .join(' ');
        const fullText = rowText + ' ' + rowStatus;
        
        const locationMatch = locationFilter === 'all' || rowLocation.includes(locationFilter);
        const statusMatch = statusFilter === 'all' || rowStatus.includes(statusFilter.replace('-', ' '));
        const searchMatch = searchTerm === '' || fullText.includes(searchTerm);
        
        row.style.display = locationMatch && statusMatch && searchMatch ? '' : 'none';
    });
}

// Sort patients
function sortPatients() {
    const sortBy = document.getElementById('patientSort').value;
    const tbody = document.querySelector('#patients .patient-table tbody');
    const rows = Array.from(tbody.querySelectorAll('tr:not([style*="display: none"])'));
    
    rows.sort((a, b) => {
        if (sortBy === 'name') {
            return a.cells[1].textContent.localeCompare(b.cells[1].textContent);
        } else if (sortBy === 'age') {
            return parseInt(a.cells[2].textContent) - parseInt(b.cells[2].textContent);
        } else if (sortBy === 'last-visit') {
            return new Date(b.cells[5].textContent) - new Date(a.cells[5].textContent);
        }
        return b.getAttribute('data-id').localeCompare(a.getAttribute('data-id'));
    });
    
    // Re-append while maintaining hidden rows
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const hiddenRows = allRows.filter(row => row.style.display === 'none');
    
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
    hiddenRows.forEach(row => tbody.appendChild(row));
}

function resetPatientForm() {
    const form = document.getElementById('patientForm');
    form.reset();
    
    // Reset readonly/disabled states
    document.getElementById('patientName').readOnly = false;
    document.getElementById('patientBirthdate').readOnly = false;
    document.getElementById('patientLocation').disabled = false;
    document.getElementById('patientSchool').readOnly = false;
    document.getElementById('guardianName').readOnly = false;
    
    // Clear file preview
    document.getElementById('uploadedFilesPreview').innerHTML = 
        '<p class="file-info">No files selected</p>';
    
    // Reset modal title
    document.getElementById('patientModalTitle').textContent = 'Add New Patient';
}

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