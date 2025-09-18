// API Documentation JavaScript

// Tab functionality
function showTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Copy code functionality
function copyCode(button) {
    const codeBlock = button.closest('.code-block').querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = '#00d4aa';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Visual feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = '#00d4aa';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    });
}

// Navigation scroll spy
function updateActiveNavItem() {
    const sections = document.querySelectorAll('.api-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section.id;
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${currentSection}`) {
            item.classList.add('active');
        }
    });
}

// Smooth scroll for navigation
function setupSmoothScroll() {
    document.querySelectorAll('.nav-item[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Test form functionality
function setupTestForm() {
    const form = document.getElementById('testUploadForm');
    const resultDiv = document.getElementById('testResult');
    const resultCode = document.getElementById('testResultCode');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('testFile');
        const ttlSelect = document.getElementById('testTtl');
        const fileNameInput = document.getElementById('testFileName');
        const submitBtn = form.querySelector('.test-btn');
        
        if (!fileInput.files[0]) {
            alert('Please select a file to upload');
            return;
        }
        
        // Show loading state
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('ttl', ttlSelect.value);
            
            // Add custom filename if provided
            if (fileNameInput.value.trim()) {
                formData.append('fileName', fileNameInput.value.trim());
            }
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            // Display result
            resultCode.textContent = JSON.stringify(result, null, 2);
            resultDiv.style.display = 'block';
            
            // Scroll to result
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
        } catch (error) {
            resultCode.textContent = JSON.stringify({
                success: false,
                message: 'Network error: ' + error.message
            }, null, 2);
            resultDiv.style.display = 'block';
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
        }
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                border-left: 4px solid #667eea;
            }
            
            .toast-success {
                border-left-color: #00d4aa;
                color: #00d4aa;
            }
            
            .toast-error {
                border-left-color: #ff4757;
                color: #ff4757;
            }
            
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
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// Mobile navigation toggle
function setupMobileNav() {
    // Add mobile menu button
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-nav-btn';
    mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileBtn.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 101;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        display: none;
        font-size: 16px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    `;
    
    // Show mobile button on small screens
    const checkMobile = () => {
        if (window.innerWidth <= 768) {
            mobileBtn.style.display = 'block';
        } else {
            mobileBtn.style.display = 'none';
            document.querySelector('.api-nav').classList.remove('mobile-open');
        }
    };
    
    mobileBtn.addEventListener('click', () => {
        document.querySelector('.api-nav').classList.toggle('mobile-open');
    });
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        const nav = document.querySelector('.api-nav');
        if (!nav.contains(e.target) && !mobileBtn.contains(e.target)) {
            nav.classList.remove('mobile-open');
        }
    });
    
    window.addEventListener('resize', checkMobile);
    checkMobile();
    
    document.body.appendChild(mobileBtn);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScroll();
    setupTestForm();
    setupMobileNav();
    
    // Set up scroll spy
    window.addEventListener('scroll', updateActiveNavItem);
    updateActiveNavItem(); // Initial call
    
    // Initialize Prism.js for syntax highlighting
    if (window.Prism) {
        Prism.highlightAll();
    }
    
    console.log('API Documentation loaded successfully');
});