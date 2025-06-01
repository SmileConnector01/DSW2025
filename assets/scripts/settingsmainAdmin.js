// ==================== AUDIT LOGS MODAL ====================
document.addEventListener('DOMContentLoaded', function() {
    // Sample audit log data
    const auditLogs = [
      {
        timestamp: 'Today, 10:15',
        action: 'Login',
        admin: 'Dr. Sarah Johnson',
        targetType: 'System',
        targetId: '-',
        details: 'Successful login',
        ipAddress: '196.201.32.45',
        status: 'completed'
      },
      {
        timestamp: 'Today, 09:45',
        action: 'Update',
        admin: 'Dr. Sarah Johnson',
        targetType: 'Patient',
        targetId: 'P102',
        details: 'Updated treatment status',
        ipAddress: '196.201.32.45',
        status: 'in-progress'
      },
      {
        timestamp: 'Today, 09:30',
        action: 'Create',
        admin: 'Dr. Sarah Johnson',
        targetType: 'Admin',
        targetId: 'FA003',
        details: 'Created new field admin',
        ipAddress: '196.201.32.45',
        status: 'pending'
      },
      {
        timestamp: 'Yesterday, 16:20',
        action: 'Update',
        admin: 'Dr. Michael Brown',
        targetType: 'Patient',
        targetId: 'P102',
        details: 'Modified treatment plan',
        ipAddress: '196.201.32.78',
        status: 'in-progress'
      },
      {
        timestamp: 'Yesterday, 14:15',
        action: 'Update',
        admin: 'Dr. Sarah Johnson',
        targetType: 'System',
        targetId: '-',
        details: 'Changed session timeout',
        ipAddress: '196.201.32.45',
        status: 'in-progress'
      },
      {
        timestamp: 'Yesterday, 11:05',
        action: 'Create',
        admin: 'Coordinator James Wilson',
        targetType: 'Patient',
        targetId: '25 records',
        details: 'Bulk imported patients',
        ipAddress: '154.120.88.32',
        status: 'pending'
      },
      {
        timestamp: '2 days ago, 09:30',
        action: 'Login',
        admin: 'Nurse Lerato Molefe',
        targetType: 'System',
        targetId: '-',
        details: 'Successful login',
        ipAddress: '41.76.123.89',
        status: 'completed'
      }
    ];
  
    // DOM elements
    const auditLogsModal = document.getElementById('auditLogsModal');
    const auditLogsTableBody = document.getElementById('auditLogsTableBody');
    const auditLogSearch = document.getElementById('auditLogSearch');
    const auditSearchBtn = document.getElementById('auditSearchBtn');
    const auditActionType = document.getElementById('auditActionType');
    const auditTimeRange = document.getElementById('auditTimeRange');
    const auditPrevPage = document.getElementById('auditPrevPage');
    const auditNextPage = document.getElementById('auditNextPage');
    const auditPageInfo = document.getElementById('auditPageInfo');
    const exportAuditLogs = document.getElementById('exportAuditLogs');
    const refreshAuditLogs = document.getElementById('refreshAuditLogs');
  
    // Pagination variables
    let currentPage = 1;
    const rowsPerPage = 10;
    let filteredLogs = [...auditLogs];
  
    // Open modal when clicking the logs button
    document.querySelectorAll('.action-card.Logsbtn').forEach(btn => {
      btn.addEventListener('click', function() {
        auditLogsModal.classList.add('show');
        document.body.classList.add('modal-open');
        renderAuditLogs();
      });
    });
  
    // Fixed modal close functionality
  const closeModal = () => {
    auditLogsModal.classList.remove('show');
    document.body.classList.remove('modal-open');
  };

  // Close modal when clicking close button
  document.querySelector('#closeAuditLog').addEventListener('click', closeModal);

  // Real-time search implementation
  let searchTimeout;
  auditLogSearch.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterLogs();
    }, 300); // 300ms delay after typing stops
  });
  
   // Enhanced filterLogs function with loading indicator
    function filterLogs() {
        // Show loading
        document.querySelector('.search-container').classList.add('loading');
        
        // Simulate API call delay (remove in production)
        setTimeout(() => {
        const searchTerm = auditLogSearch.value.toLowerCase();
        const actionType = auditActionType.value;
        
        filteredLogs = auditLogs.filter(log => {
            const matchesSearch = 
            log.admin.toLowerCase().includes(searchTerm) ||
            log.details.toLowerCase().includes(searchTerm) ||
            log.targetId.toLowerCase().includes(searchTerm) ||
            log.ipAddress.toLowerCase().includes(searchTerm);
            
            const matchesAction = actionType === 'all' || 
            log.action.toLowerCase() === actionType.toLowerCase();
            
            return matchesSearch && matchesAction;
        });
        
        currentPage = 1;
        renderAuditLogs();
        
        // Hide loading
        document.querySelector('.search-container').classList.remove('loading');
        }, 500); // Simulate network delay
    }
    
    // Render audit logs to the table
    function renderAuditLogs() {
      const start = (currentPage - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedLogs = filteredLogs.slice(start, end);
      const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  
      auditLogsTableBody.innerHTML = paginatedLogs.map(log => `
        <tr>
          <td>${log.timestamp}</td>
          <td><span class="status-badge ${log.status}">${log.action}</span></td>
          <td>${log.admin}</td>
          <td>${log.targetType}</td>
          <td>${log.targetId}</td>
          <td>${log.details}</td>
          <td>${log.ipAddress}</td>
        </tr>
      `).join('');
  
      // Update pagination controls
      auditPageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      auditPrevPage.disabled = currentPage === 1;
      auditNextPage.disabled = currentPage === totalPages || totalPages === 0;
    }
  
    // Event listeners
    auditSearchBtn.addEventListener('click', filterLogs);
    auditLogSearch.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') filterLogs();
    });
    auditActionType.addEventListener('change', filterLogs);
    auditTimeRange.addEventListener('change', function() {
      if (this.value === 'custom') {
        // Show date picker for custom range
        // Implement this in your real app
      }
      filterLogs();
    });
    auditPrevPage.addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        renderAuditLogs();
      }
    });
    auditNextPage.addEventListener('click', function() {
      const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderAuditLogs();
      }
    });
    refreshAuditLogs.addEventListener('click', function() {
      // In real app, this would fetch fresh data from server
      alert('Refreshing logs...');
      filterLogs();
    });
    exportAuditLogs.addEventListener('click', function() {
      // Implement CSV export functionality
      alert('Export to CSV functionality would be implemented here');
    });
  
    // Initial render
    renderAuditLogs();
  });