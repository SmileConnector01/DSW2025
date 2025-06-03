document.addEventListener('DOMContentLoaded', function() {
    // Initialize PDF generation buttons
    const generateButtons = document.querySelectorAll('.generate-report-btn, #patientViewPdf, #exportAuditLogs');
    
    generateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showPdfPreview(this);
        });
    });
    
    // PDF action buttons
    document.getElementById('printPdfBtn')?.addEventListener('click', printPdf);
    document.getElementById('savePdfBtn')?.addEventListener('click', savePdf);
    document.getElementById('emailPdfBtn')?.addEventListener('click', emailPdf);
    
    // Modal close button
    document.querySelector('#pdfPreviewModal .close-modal')?.addEventListener('click', function() {
        document.getElementById('pdfPreviewModal').style.display = 'none';
    });
});

function showPdfPreview(triggerButton) {
    const modal = document.getElementById('pdfPreviewModal');
    const previewContent = document.getElementById('pdfContentPreview');
    
    if (!modal || !previewContent) {
        console.error('PDF preview elements not found');
        return;
    }
    
    // Clear previous content
    previewContent.innerHTML = '<div class="loading">Generating preview...</div>';
    
    // Determine which content to generate
    let title = '';
    let content = '';
    let isPatientDetails = false;
    
    if (triggerButton.id === 'adminReport') {
        title = 'Admin Management Report';
        content = generateAdminReportContent();
    } 
    else if (triggerButton.id === 'patientReport') {
        title = 'Patient Management Report';
        content = generatePatientReportContent();
    }
    else if (triggerButton.id === 'patientViewPdf') {
        title = 'Patient Details';
        content = generatePatientDetailsContent();
        isPatientDetails = true;
    }
    else if (triggerButton.id === 'exportAuditLogs') {
        title = 'Audit Logs Report';
        content = generateAuditLogsContent();
    }
    
    previewContent.innerHTML = createPdfTemplate(title, content, isPatientDetails);
    
    // Add PDF-specific styles to the preview
    addPdfPreviewStyles(isPatientDetails);
    
    // Show the modal
    modal.style.display = 'block';
}

function addPdfPreviewStyles(isPatientDetails) {
    // Remove existing PDF styles
    const existingStyle = document.getElementById('pdfPreviewStyles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Create new style element
    const style = document.createElement('style');
    style.id = 'pdfPreviewStyles';
    
    const orientation = isPatientDetails ? 'portrait' : 'landscape';
    const width = isPatientDetails ? '210mm' : '297mm';
    const height = isPatientDetails ? '297mm' : '210mm';
    
    style.innerHTML = `
        #pdfContentPreview {
            width: ${width};
            height: ${height};
            margin: 0 auto;
            background: white;
            padding: 25.4mm;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            font-size: ${isPatientDetails ? '14px' : '12px'};
            line-height: 1.4;
            overflow: hidden;
            position: relative;
        }
        
        .pdf-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #0077ff;
        }
        
        .pdf-header-info {
            display: flex;
            align-items: center;
        }
        
        .pdf-logo {
            margin-right: 20px;
        }
        
        .pdf-header-text h1 {
            margin: 0 0 5px 0;
            font-size: ${isPatientDetails ? '20px' : '18px'};
            color: #0077ff;
        }
        
        .pdf-header-text p {
            margin: 2px 0;
            font-size: ${isPatientDetails ? '11px' : '9px'};
            color: #666;
        }
        
        .pdf-date {
            font-size: ${isPatientDetails ? '12px' : '10px'};
            color: #666;
            text-align: right;
        }
        
        .pdf-title {
            text-align: center;
            font-size: ${isPatientDetails ? '18px' : '16px'};
            font-weight: bold;
            margin: 30px 0;
            color: #333;
        }
        
        .pdf-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: ${isPatientDetails ? '11px' : '9px'};
        }
        
        .pdf-table th,
        .pdf-table td {
            border: 1px solid #ddd;
            padding: ${isPatientDetails ? '8px' : '6px'};
            text-align: left;
            vertical-align: top;
        }
        
        .pdf-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        
        .pdf-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .pdf-footer {
            position: absolute;
            bottom: 20mm;
            left: 25.4mm;
            right: 25.4mm;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        
        .pdf-footer p {
            margin: 2px 0;
        }
        
        .pdf-footer-note {
            margin-top: 20px;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #0077ff;
            font-weight: bold;
            font-size: ${isPatientDetails ? '12px' : '10px'};
        }
        
        /* Patient Details Specific Styles */
        .patient-details {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.5;
        }
        
        .patient-profile {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .patient-icon {
            font-size: 28px;
            margin-right: 20px;
            color: #0077ff;
        }
        
        .info-section {
            margin-bottom: 30px;
        }
        
        .info-section h3 {
            color: #0077ff;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
            font-size: 11px;
            margin-bottom: 3px;
        }
        
        .info-value {
            color: #333;
            font-size: 12px;
        }
        
        .visit-timeline {
            border-left: 3px solid #0077ff;
            padding-left: 20px;
            margin-top: 20px;
        }
        
        .visit-item {
            margin-bottom: 25px;
            position: relative;
            padding-left: 25px;
        }
        
        .visit-item:before {
            content: '';
            position: absolute;
            left: -8px;
            top: 8px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #0077ff;
            border: 2px solid white;
        }
        
        .visit-date {
            font-weight: bold;
            color: #0077ff;
            margin-bottom: 8px;
            font-size: 13px;
        }
        
        .visit-type {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        
        .medical-notes {
            background: #f9f9f9;
            padding: 12px;
            border-radius: 6px;
            border-left: 3px solid #0077ff;
            margin-top: 8px;
            font-size: 11px;
            line-height: 1.4;
        }
        
        .error {
            color: #dc3545;
            text-align: center;
            padding: 40px;
            font-size: 14px;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            font-size: 14px;
            color: #666;
        }
    `;
    
    document.head.appendChild(style);
}

function generatePatientDetailsContent() {
    const modal = document.getElementById('patientDetailsModal');
    
    if (!modal || !modal.classList.contains('active')) {
        return '<div class="error">Please open the patient details first</div>';
    }

    // Get all data from the modal
    const patientName = document.getElementById('detailPatientName').textContent || 'N/A';
    const patientId = document.getElementById('detailPatientId').textContent || 'N/A';
    const patientSchool = document.getElementById('detailPatientSchool').textContent || 'N/A';
    const patientStatus = document.getElementById('detailPatientStatusText').textContent || 'N/A';
    const patientAge = document.getElementById('detailPatientAge').textContent || 'N/A';
    const birthdate = document.getElementById('detailPatientBirthdate').textContent || 'N/A';
    const location = document.getElementById('detailPatientLocation').textContent || 'N/A';
    const guardian = document.getElementById('detailGuardianName').textContent || 'N/A';
    const lastUpdated = document.getElementById('detailLastUpdated').textContent || 'N/A';
    const medicalNotes = document.getElementById('detailMedicalNotes').textContent || 'None';
    
    // Get patient records
    const recordsContainer = document.getElementById('detailPatientRecords');
    let recordsList = 'None';
    if (recordsContainer.querySelector('.record-item')) {
        recordsList = Array.from(recordsContainer.querySelectorAll('.record-item'))
            .map(item => item.textContent.trim())
            .join(', ');
    }

    // Build PDF content
    let content = `
        <style>
            .pdf-header {
                border-bottom: 2px solid #0077ff;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .patient-name {
                color: #0077ff;
                font-size: 22px;
                margin: 0;
            }
            .patient-id {
                color: #666;
                font-size: 14px;
                margin: 5px 0 0 0;
            }
            .section-title {
                color: #0077ff;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
                margin: 20px 0 10px 0;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            .info-item {
                margin-bottom: 8px;
            }
            .info-label {
                font-weight: bold;
                color: #555;
            }
            .medical-notes {
                background-color: #f9f9f9;
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
            }
            .records-list {
                margin-top: 5px;
                font-size: 14px;
            }
        </style>
        
        <div class="pdf-header">
            <h1 class="patient-name">${patientName}</h1>
            <p class="patient-id">${patientId}</p>
        </div>
        
        <div class="info-section">
            <h3 class="section-title">Basic Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Age:</span> ${patientAge}
                </div>
                <div class="info-item">
                    <span class="info-label">Birthdate:</span> ${birthdate}
                </div>
                <div class="info-item">
                    <span class="info-label">Location:</span> ${location}
                </div>
                <div class="info-item">
                    <span class="info-label">School:</span> ${patientSchool}
                </div>
                <div class="info-item">
                    <span class="info-label">Guardian:</span> ${guardian}
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span> ${patientStatus}
                </div>
                <div class="info-item">
                    <span class="info-label">Last Updated:</span> ${lastUpdated}
                </div>
            </div>
        </div>
        
        <div class="info-section">
            <h3 class="section-title">Medical Information</h3>
            <div class="info-item">
                <span class="info-label">Medical Notes:</span>
                <div class="medical-notes">${medicalNotes}</div>
            </div>
        </div>
        
        <div class="info-section">
            <h3 class="section-title">Patient Records</h3>
            <div class="records-list">${recordsList}</div>
        </div>
    `;

    return content;
}

function generateAdminReportContent() {
    const table = document.querySelector('.admin-list-card table');
    if (!table) return '<div class="error">No admin data found</div>';

    // Get all visible rows respecting current sorting/filtering
    const rows = Array.from(table.querySelectorAll('tbody tr')).filter(row => 
        row.style.display !== 'none' && !row.classList.contains('hidden')
    );

    if (rows.length === 0) {
        return '<div class="error">No admin records match current filters</div>';
    }

    let content = `
        <table class="pdf-table">
            <thead>
                <tr>
                    <th>Admin ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Last Login</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
            content += `
                <tr>
                    <td>${cells[0].textContent.trim()}</td>
                    <td>${cells[1].textContent.trim()}</td>
                    <td>${cells[2].textContent.trim()}</td>
                    <td>${cells[3].textContent.trim()}</td>
                    <td>${cells[4].textContent.replace(/<[^>]*>/g, '').trim()}</td>
                </tr>
            `;
        }
    });
    
    content += `
            </tbody>
        </table>
        <div class="pdf-footer-note">
            Total Admins: ${rows.length} | Generated on ${new Date().toLocaleDateString()}
        </div>
    `;
    
    return content;
}

function generatePatientReportContent() {
    const table = document.querySelector('.patient-list-card table');
    if (!table) return '<div class="error">No patient data found</div>';

    // Get all visible rows respecting current sorting/filtering
    const rows = Array.from(table.querySelectorAll('tbody tr')).filter(row => 
        row.style.display !== 'none' && !row.classList.contains('hidden')
    );

    if (rows.length === 0) {
        return '<div class="error">No patient records match current filters</div>';
    }

    let content = `
        <table class="pdf-table">
            <thead>
                <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Location</th>
                    <th>School</th>
                    <th>Last Visit</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
            content += `
                <tr>
                    <td>${cells[0].textContent.trim()}</td>
                    <td>${cells[1].textContent.trim()}</td>
                    <td>${cells[2].textContent.trim()}</td>
                    <td>${cells[3].textContent.trim()}</td>
                    <td>${cells[4].textContent.trim()}</td>
                    <td>${cells[5].textContent.trim()}</td>
                    <td>${cells[6].textContent.replace(/<[^>]*>/g, '').trim()}</td>
                </tr>
            `;
        }
    });
    
    content += `
            </tbody>
        </table>
        <div class="pdf-footer-note">
            Total Patients: ${rows.length} | Generated on ${new Date().toLocaleDateString()}
        </div>
    `;
    
    return content;
}

function generateAuditLogsContent() {
    // Check if audit logs table exists
    const auditTable = document.querySelector('.audit-logs-table');
    
    if (auditTable) {
        const rows = Array.from(auditTable.querySelectorAll('tbody tr')).filter(row => 
            row.style.display !== 'none' && !row.classList.contains('hidden')
        );

        if (rows.length === 0) {
            return '<div class="error">No audit log records match current filters</div>';
        }

        let content = `
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Admin</th>
                        <th>Action</th>
                        <th>Target</th>
                        <th>IP Address</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 5) {
                content += `
                    <tr>
                        <td>${cells[0].textContent.trim()}</td>
                        <td>${cells[1].textContent.trim()}</td>
                        <td>${cells[2].textContent.trim()}</td>
                        <td>${cells[3].textContent.trim()}</td>
                        <td>${cells[4].textContent.trim()}</td>
                    </tr>
                `;
            }
        });
        
        content += `
                </tbody>
            </table>
            <div class="pdf-footer-note">
                Total Audit Entries: ${rows.length} | Generated on ${new Date().toLocaleDateString()}
            </div>
        `;
        
        return content;
    }
    
    // If no table or content found
    return `
        <div class="audit-logs-section">
            <h3>Audit Logs Summary</h3>
            <p><strong>Report Period:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Filters Applied:</strong> Current dashboard filters</p>
            <br>
            <p><strong>Activities Tracked:</strong></p>
            <ul style="margin-left: 20px; line-height: 1.6;">
                <li>User login/logout events</li>
                <li>Patient record modifications</li>
                <li>Admin account changes</li>
                <li>System configuration updates</li>
                <li>Report generation activities</li>
            </ul>
            <br>
            <p><em>Note: Detailed audit logs would appear here based on current system data and applied filters.</em></p>
        </div>
    `;
}

function createPdfTemplate(title, content, isPatientDetails = false) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="pdf-header">
            <div class="pdf-header-info">
                <div class="pdf-logo">
                    <i class="fas fa-tooth"></i>
                </div>
                <div class="pdf-header-text">
                    <h1>SmileConnector Dental Initiative</h1>
                    <p>123 Health Avenue, Johannesburg, South Africa</p>
                    <p>Phone: +27 11 123 4567 | Email: info@smileconnector.org</p>
                </div>
            </div>
            <div class="pdf-date">
                ${dateStr}
            </div>
        </div>
        
        <div class="pdf-title">${title}</div>
        
        <div class="pdf-content">
            ${content}
        </div>
        
        <div class="pdf-footer">
            <p>Confidential - For internal use only</p>
            <p>Generated by SmileConnector Admin Dashboard</p>
        </div>
    `;
}

function printPdf() {
    // Use the browser's print functionality which respects the preview styling
    const printWindow = window.open('', '_blank');
    const previewContent = document.getElementById('pdfContentPreview');
    const styles = document.getElementById('pdfPreviewStyles');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SmileConnector Report</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            ${styles ? styles.outerHTML : ''}
            <style>
                @media print {
                    body { margin: 0; padding: 0; }
                    #pdfContentPreview { 
                        box-shadow: none !important; 
                        margin: 0 !important;
                        transform: none !important;
                    }
                }
            </style>
        </head>
        <body>
            ${previewContent.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    //setTimeout(() => {
        printWindow.print();
        printWindow.close();
   // }, 500);
}

function getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function savePdf() {
    const { jsPDF } = window.jspdf;
    const previewContent = document.getElementById('pdfContentPreview');
    const isPatientDetails = previewContent.querySelector('.patient-details') !== null;
    
    // Determine the report type based on content
    let reportType = 'Report';
    const titleElement = previewContent.querySelector('.pdf-title');
    if (titleElement) {
        const titleText = titleElement.textContent || '';
        if (titleText.includes('Admin')) {
            reportType = 'AdminReport';
        } else if (titleText.includes('Patient') && !isPatientDetails) {
            reportType = 'PatientReport';
        } else if (titleText.includes('Patient') && isPatientDetails) {
            reportType = 'PatientDetails';
        } else if (titleText.includes('Audit')) {
            reportType = 'AuditLogs';
        }
    }
    
    // Create PDF with appropriate settings
    const doc = new jsPDF({
        orientation: isPatientDetails ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    // Configure html2canvas for better quality
    const canvasOptions = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: previewContent.offsetWidth,
        height: previewContent.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: previewContent.offsetWidth,
        windowHeight: previewContent.offsetHeight
    };

    html2canvas(previewContent, canvasOptions).then(canvas => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Calculate dimensions to fit exactly one page
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        
        // Add the image to fit exactly one page
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Generate filename based on report type and date
        const currentDate = getCurrentDateString();
        let fileName = '';
        
        switch(reportType) {
            case 'AdminReport':
                fileName = `AdminReport-${currentDate}.pdf`;
                break;
            case 'PatientReport':
                fileName = `PatientReport-${currentDate}.pdf`;
                break;
            case 'PatientDetails':
                // For patient details, try to get the patient name if available
                const patientName = previewContent.querySelector('.patient-profile h2')?.textContent || 'PatientDetails';
                const cleanName = patientName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                fileName = `${cleanName}-${currentDate}.pdf`;
                break;
            case 'AuditLogs':
                fileName = `AuditLogs-${currentDate}.pdf`;
                break;
            default:
                fileName = `Report-${currentDate}.pdf`;
        }
        
        // Save the PDF
        doc.save(fileName);
    }).catch(error => {
        console.error('PDF generation failed:', error);
        showNotification('Failed to generate PDF. Please try again.', 'error');

    });
}

async function emailPdf() {
    const { jsPDF } = window.jspdf;
    const previewContent = document.getElementById('pdfContentPreview');
    const isPatientDetails = previewContent.querySelector('.patient-details') !== null;
    
    try {
        // Determine the report type based on content
        let reportType = 'Report';
        const titleElement = previewContent.querySelector('.pdf-title');
        if (titleElement) {
            const titleText = titleElement.textContent || '';
            if (titleText.includes('Admin')) {
                reportType = 'AdminReport';
            } else if (titleText.includes('Patient') && !isPatientDetails) {
                reportType = 'PatientReport';
            } else if (titleText.includes('Patient') && isPatientDetails) {
                reportType = 'PatientDetails';
            } else if (titleText.includes('Audit')) {
                reportType = 'AuditLogs';
            }
        }
        
        // Create PDF with same settings as save
        const doc = new jsPDF({
            orientation: isPatientDetails ? 'portrait' : 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const canvasOptions = {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            width: previewContent.offsetWidth,
            height: previewContent.offsetHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: previewContent.offsetWidth,
            windowHeight: previewContent.offsetHeight
        };

        const canvas = await html2canvas(previewContent, canvasOptions);
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // Generate filename based on report type and date
        const currentDate = getCurrentDateString();
        let fileName = '';
        
        switch(reportType) {
            case 'AdminReport':
                fileName = `AdminReport-${currentDate}.pdf`;
                break;
            case 'PatientReport':
                fileName = `PatientReport-${currentDate}.pdf`;
                break;
            case 'PatientDetails':
                // For patient details, try to get the patient name if available
                const patientName = previewContent.querySelector('.patient-profile h2')?.textContent || 'PatientDetails';
                const cleanName = patientName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                fileName = `${cleanName}-${currentDate}.pdf`;
                break;
            case 'AuditLogs':
                fileName = `AuditLogs-${currentDate}.pdf`;
                break;
            default:
                fileName = `Report-${currentDate}.pdf`;
        }

        // Get PDF as blob for email attachment
        const pdfBlob = doc.output('blob');

        // Show email form
        showEmailForm(pdfBlob, fileName);
        
    } catch (error) {
        console.error('PDF generation failed:', error);
        showNotification('Failed to generate PDF for email. Please try again.', 'error');
    }
}

function showEmailForm(pdfBlob, fileName) {
    // Get current user's name from the page
    const currentUserName = document.querySelector('.user-name')?.textContent || "an Admin";
    
    // Extract the base name without .pdf for the subject
    const baseName = fileName.replace('.pdf', '');
    
    const emailModal = `
        <div class="modal active" id="emailModal" style="z-index: 10000;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Email Report</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="emailForm">
                        <div class="form-group">
                            <label for="recipientEmail">Recipient Email</label>
                            <input type="email" id="recipientEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="emailSubject">Subject</label>
                            <input type="text" id="emailSubject" value="${baseName} - SmileConnector" required>
                        </div>
                        <div class="form-group">
                            <label for="emailMessage">Message</label>
                            <textarea id="emailMessage" rows="4">Please find attached the ${baseName} report as requested from ${currentUserName}.</textarea>
                        </div>
                        <div class="attachment-info" style="background: linear-gradient(135deg, #f8f9fa, #e3f2fd); padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #e1f5fe;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <i class="fas fa-file-pdf" style="color: #d32f2f; margin-right: 10px; font-size: 20px;"></i>
                                    <div>
                                        <strong style="color: #333;">${fileName}</strong>
                                        <div style="font-size: 12px; color: #666; margin-top: 2px;">
                                            ${(pdfBlob.size / 1024).toFixed(1)} KB • PDF Document
                                        </div>
                                    </div>
                                </div>
                                <i class="fas fa-check-circle" style="color: #4caf50; font-size: 18px;"></i>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="secondary-btn" id="cancelEmail">Cancel</button>
                    <button class="primary-btn" id="sendEmailBtn">
                        <i class="fas fa-paper-plane"></i> Send Email
                    </button>
                </div>
            </div>
        </div>
    `;

    // Inject modal into DOM
    document.body.insertAdjacentHTML('beforeend', emailModal);
    
    // Set up event listeners
    document.querySelector('#emailModal .close-modal').addEventListener('click', closeEmailModal);
    document.getElementById('cancelEmail').addEventListener('click', closeEmailModal);
    document.getElementById('sendEmailBtn').addEventListener('click', sendEmail);

    function closeEmailModal() {
        document.getElementById('emailModal').remove();
    }

    async function sendEmail() {
        const email = document.getElementById('recipientEmail').value.trim();
        const subject = document.getElementById('emailSubject').value.trim();
        const message = document.getElementById('emailMessage').value.trim();
        
        if (!email) {
            showNotification('Please enter a valid email address', 'error');
            document.getElementById('recipientEmail').focus();
            return;
        }

        const btn = document.getElementById('sendEmailBtn');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            // Convert blob to file for FormData
            const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
            
            // Create FormData for the request
            const formData = new FormData();
            formData.append('name', 'SmileConnector Recipient');
            formData.append('email', email);
            formData.append('subject', subject);
            formData.append('body', message);
            formData.append('file', pdfFile);

            // Send to your PHP endpoint
            const response = await fetch('../backend/send_pdf_email.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                showNotification(`Email sent successfully to ${email}!`, 'success');
                closeEmailModal();
            } else {
                throw new Error(result.error || 'Email sending failed');
            }
        } catch (error) {
            console.log('Email failed:', error);
            showNotification('Failed to send email: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    }
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