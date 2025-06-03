
document.addEventListener('DOMContentLoaded', function() {
    // Billing Tabs Functionality
    function setupBillingTabs() {
        const billingContainer = document.querySelector('.billing-details');
        if (!billingContainer) return;

        billingContainer.addEventListener('click', function(e) {
            const tabBtn = e.target.closest('.billing-tab-btn');
            if (!tabBtn) return;

            e.preventDefault();
            
            // Get tab ID from data attribute
            const tabId = tabBtn.dataset.tab;
            if (!tabId) return;

            // Update active tab
            const tabs = billingContainer.querySelectorAll('.billing-tab-btn');
            tabs.forEach(tab => tab.classList.remove('active'));
            tabBtn.classList.add('active');

            // Update active content
            const contents = billingContainer.querySelectorAll('.billing-tab-content');
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    }
    // Initialize billing tabs
    setupBillingTabs();

    // Invoice Download Functionality
    document.querySelectorAll('.btn-download-invoice').forEach(btn => {
        btn.addEventListener('click', function() {
            // Create a PDF download (mock implementation)
            const invoiceId = this.closest('.invoice-item').querySelector('h4').textContent;
            downloadPDF(invoiceId);
        });
    });

    // Receipt Download Functionality
    document.querySelectorAll('.btn-download-receipt').forEach(btn => {
        btn.addEventListener('click', function() {
            // Create a PDF download (mock implementation)
            const invoiceId = this.closest('.payment-item').querySelector('h4').textContent;
            downloadPDF(invoiceId);
        });
    });

    // EOB Download Functionality
    document.querySelectorAll('.btn-download-eob').forEach(btn => {
        btn.addEventListener('click', function() {
            // Create a PDF download (mock implementation)
            const invoiceId = this.closest('.claim-item').querySelector('h4').textContent;
            downloadPDF(invoiceId);
        });
    });

    function downloadPDF(invoiceId) {
        // In a real app, this would fetch the PDF from your backend
        console.log(`Downloading ${invoiceId}...`);
        
        // Create a mock PDF download
        const pdfUrl = URL.createObjectURL(new Blob([`SmileConnector Invoice: ${invoiceId}`], {type: 'application/pdf'}));
        
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `${invoiceId.replace('#', '')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pdfUrl);
        
        // Show download confirmation
        showNotification(`Invoice ${invoiceId} downloaded successfully`, 'success');
    }

    // Open payment modal
        document.getElementById('makePaymentBtn')?.addEventListener('click', function() {
            document.getElementById('paymentModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Set payment amount (you can get this dynamically)
            const amount = '0.00';
            document.getElementById('paymentAmount').textContent = amount;
            
            // Disable payment buttons if amount is zero
            const confirmPayment = document.getElementById('confirmPayment');
            const confirmBankPayment = document.getElementById('confirmBankPayment');
            // const isZero = parseFloat(amount) === 0;
            
            // if (confirmPayment) confirmPayment.disabled = isZero;
            // if (confirmBankPayment) confirmBankPayment.disabled = isZero;
        });

    // Close payment modal
    document.getElementById('closePaymentModal')?.addEventListener('click', closePaymentModal);
    document.getElementById('cancelPayment')?.addEventListener('click', closePaymentModal);
    document.getElementById('cancelBankPayment')?.addEventListener('click', closePaymentModal);

    function closePaymentModal() {
        document.getElementById('paymentModal').style.display = 'none';
        document.body.style.overflow = '';
    }

    // Payment option selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show corresponding form
            const formId = this.dataset.option + 'Form';
            document.querySelectorAll('.payment-form').forEach(form => {
                form.style.display = 'none';
            });
            document.getElementById(formId).style.display = 'block';
        });
    });

    // // Bank selection code 
    // document.querySelectorAll('.bank-option').forEach(option => {
    //     option.addEventListener('click', function() {
    //         // Remove selection from all options
    //         document.querySelectorAll('.bank-option').forEach(opt => {
    //             opt.classList.remove('selected');
    //         });
            
    //         // Add selection to clicked option
    //         this.classList.add('selected');
    //         selectedBank = this.querySelector('span').textContent.trim();
    //     });
    // });

    let selectedBank = null;

    document.querySelectorAll('.bank-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove selection from all options
            document.querySelectorAll('.bank-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            // Add selection to clicked option
            this.classList.add('selected');
            selectedBank = this.querySelector('span').textContent.trim();
        });
    });
    document.getElementById('confirmBankPayment')?.addEventListener('click', function() {
        if (!selectedBank) {
            showNotification('Please select a bank to continue', 'error');
            return;
        }

        // Simulate redirection to bank (replace with actual API call)
        const bankUrls = {
            'Standard Bank': 'https://standardbank.co.za',
            'Nedbank': 'https://secured.nedbank.co.za/#/login',
            'FNB': 'https://www.fnb.co.za/?srsltid=AfmBOopGS40-W7htnRXhifDCP4TbhXnbt_nmJnjtH6NFMNtP_6lXpsP6',
            'Absa': 'https://www.absa.co.za'
        };

        const redirectUrl = bankUrls[selectedBank];
        window.open(redirectUrl, '_blank'); // Open in new tab (for demo)
        
        // In production, you might submit a form to the bank's endpoint:
        // document.getElementById('bankPaymentForm').submit();
    });

    // Card number formatting
    document.getElementById('cardNumber')?.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formatted = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = formatted.substring(0, 19);
        
        // Detect card type and update icon
        const cardIcon = document.querySelector('.card-input i');
        if (/^4/.test(value)) {
            cardIcon.className = 'fab fa-cc-visa';
        } else if (/^5[1-5]/.test(value)) {
            cardIcon.className = 'fab fa-cc-mastercard';
        } else if (/^3[47]/.test(value)) {
            cardIcon.className = 'fab fa-cc-amex';
        } else if (/^6(?:011|5)/.test(value)) {
            cardIcon.className = 'fab fa-cc-discover';
        } else {
            cardIcon.className = 'far fa-credit-card';
        }
    });

    // CVV input formatting
    document.getElementById('cvvInput')?.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
    });

    // Expiry date validation
    document.getElementById('expiryDate')?.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < currentDate) {
            this.setCustomValidity('Expiry date must be in the future');
        } else {
            this.setCustomValidity('');
        }
    });

    // Confirm payment
    document.getElementById('confirmPayment')?.addEventListener('click', function() {
        // Add your payment processing logic here
        showNotification('Payment processed successfully!', 'success');
        closePaymentModal();
    });

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
});