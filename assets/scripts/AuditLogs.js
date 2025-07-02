// ==================== AUDIT LOGS MODAL ====================
document.addEventListener('DOMContentLoaded', function() {

  function loadAuditLogs() {
  return fetch('http://localhost/SmileConnector/backend/read_audit_logs.php')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      return data.map(item => ({
        timestamp: item.timestamp, 
        action: item.action,
        admin: item.admin,
        targetType: item.target_type,
        targetId: item.target_ID,
        details: item.details,
        ipAddress: item.ip_address
      }));
    })
    .catch(err => {
      console.error('Failed to load audit logs:', err);
      return [];
    });
}
  
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
    let filteredLogs = [];
    loadAuditLogs()
    .then(logs => {
      filteredLogs = [...logs]; // Spread the resolved array
      
      const deleteLogs = filteredLogs.filter(log => log.action === 'delete');
    });
  
    // Open modal when clicking the logs button
    document.querySelectorAll('.action-card.Logsbtn').forEach(btn => {
      btn.addEventListener('click', function() {
        auditLogsModal.classList.add('show');
        document.body.classList.add('modal-open');
        renderAuditLogs();
      });
    });
  
    // Modal close functionality
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
    }, 300);
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
        // Show date picker for custom range (Later to be updated)
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
      
      filterLogs();
    });
    exportAuditLogs.addEventListener('click', function() {
      
    });
  
    // Initial render
    renderAuditLogs();
  });