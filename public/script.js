// Global variable to prevent multiple instances
let fileUploadApp = null;

class FileUploadApp {
    constructor() {
        console.log('FileUploadApp constructor called');
        
        // Prevent multiple instances
        if (fileUploadApp) {
            console.log('FileUploadApp already exists, returning existing instance');
            return fileUploadApp;
        }
        
        this.currentFile = null;
        this.isUploading = false;
        
        this.initElements();
        this.bindEvents();
        this.setupDragDrop();
        
        fileUploadApp = this;
        console.log('FileUploadApp initialized successfully');
    }

    initElements() {
        console.log('Initializing elements...');
        
        // Form elements
        this.form = document.getElementById('uploadForm');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.dropZone = document.getElementById('dropZone');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.ttlSelect = document.getElementById('ttl');
        this.customFilename = document.getElementById('customFilename');
        
        // File info elements
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.removeBtn = document.getElementById('removeFileBtn');
        
        // Sections
        this.uploadSection = document.getElementById('uploadSection');
        this.resultSection = document.getElementById('resultSection');
        this.errorSection = document.getElementById('errorSection');
        
        // Result elements
        this.resultFileName = document.getElementById('resultFileName');
        this.resultFileSize = document.getElementById('resultFileSize');
        this.resultExpiresAt = document.getElementById('resultExpiresAt');
        this.shareLink = document.getElementById('shareLink');
        this.downloadLink = document.getElementById('downloadLink');
        this.copyBtn = document.getElementById('copyBtn');
        this.copyDownloadBtn = document.getElementById('copyDownloadLink');
        this.testBtn = document.getElementById('testLinkBtn');
        this.uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.shareBtn = document.getElementById('shareBtn');
        
        // Error elements
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Toast elements
        this.toast = document.getElementById('toast');
        this.toastMessage = this.toast?.querySelector('.toast-message');
        this.toastClose = document.getElementById('toastClose');
        
        // Button elements
        this.btnText = this.uploadBtn?.querySelector('.btn-text');
        this.btnLoader = this.uploadBtn?.querySelector('.btn-loader');
        
        // Check for missing elements
        const requiredElements = {
            form: this.form,
            fileInput: this.fileInput,
            browseBtn: this.browseBtn,
            dropZone: this.dropZone,
            uploadBtn: this.uploadBtn,
            fileName: this.fileName,
            fileSize: this.fileSize,
            toast: this.toast
        };
        
        for (const [name, element] of Object.entries(requiredElements)) {
            if (!element) {
                console.error(`Missing required element: ${name}`);
            }
        }
        
        console.log('Elements initialized');
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Browse button - ONLY this should trigger file picker
        this.browseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Browse button clicked - opening file picker');
            this.fileInput.click();
        });
        
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            console.log('File input changed');
            this.handleFileSelection(e.target.files[0]);
        });
        
        // Remove file button
        this.removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.clearFile();
        });
        
        // Form submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted');
            this.handleUpload();
        });
        
        // Result section buttons
        this.copyBtn?.addEventListener('click', () => this.copyLink('share'));
        this.copyDownloadBtn?.addEventListener('click', () => this.copyLink('download'));
        this.testBtn?.addEventListener('click', () => this.testLink());
        this.downloadBtn?.addEventListener('click', () => this.downloadFile());
        this.shareBtn?.addEventListener('click', () => this.shareFile());
        this.uploadAnotherBtn?.addEventListener('click', () => this.resetToUpload());
        this.retryBtn?.addEventListener('click', () => this.resetToUpload());
        
        // Toast close
        this.toastClose.addEventListener('click', () => this.hideToast());
        
        console.log('Events bound successfully');
    }

    setupDragDrop() {
        console.log('Setting up drag and drop...');
        
        // Prevent default behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        // Visual feedback
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.remove('drag-over');
            });
        });
        
        // Handle drop
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('File dropped');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                console.log('Processing dropped file:', files[0].name);
                this.handleFileSelection(files[0]);
            } else {
                console.log('No files in drop event');
            }
        });
        
        console.log('Drag and drop setup complete');
    }

    handleFileSelection(file) {
        console.log('Handling file selection:', file?.name);
        
        if (!file) {
            console.log('No file provided');
            this.clearFile();
            return;
        }
        
        // Prevent duplicate processing
        if (this.currentFile === file) {
            console.log('Same file already selected');
            return;
        }
        
        // Validate file type
        const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif', '.docx', '.xlsx', '.csv', '.zip', '.rar'];
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        if (!allowedTypes.includes(extension)) {
            this.showToast('File type not allowed. Please select a supported file type.', 'error');
            this.clearFile();
            return;
        }
        
        // Validate file size (1GB)
        const maxSize = 1024 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showToast('File too large. Maximum size is 1GB.', 'error');
            this.clearFile();
            return;
        }
        
        // Set current file
        this.currentFile = file;
        
        // Try to update file input to prevent validation issues
        try {
            // Create a DataTransfer object to simulate file input selection
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            this.fileInput.files = dataTransfer.files;
            console.log('File input updated successfully');
        } catch (error) {
            console.log('Could not update file input (older browser):', error);
            // Remove required attribute as fallback
            this.fileInput.removeAttribute('required');
        }
        
        // Update UI
        if (this.fileName) {
            this.fileName.textContent = file.name;
        }
        if (this.fileSize) {
            this.fileSize.textContent = this.formatFileSize(file.size);
        }
        
        // Show file info, hide drop zone
        if (this.fileInfo) {
            this.fileInfo.style.display = 'block';
        }
        if (this.dropZone) {
            this.dropZone.style.display = 'none';
        }
        
        // Enable upload button
        if (this.uploadBtn) {
            this.uploadBtn.disabled = false;
        }
        
        console.log('File selected successfully:', file.name);
    }

    clearFile() {
        console.log('Clearing file selection');
        
        this.currentFile = null;
        this.fileInput.value = '';
        
        // Update UI
        this.fileInfo.style.display = 'none';
        this.dropZone.style.display = 'block';
        this.uploadBtn.disabled = true;
        
        console.log('File cleared');
    }

    async handleUpload() {
        if (this.isUploading) {
            console.log('Upload already in progress');
            return;
        }
        
        if (!this.currentFile) {
            this.showToast('Please select a file first.', 'error');
            return;
        }
        
        console.log('Starting upload...');
        this.isUploading = true;
        this.setLoadingState(true);
        
        try {
            const formData = new FormData();
            formData.append('file', this.currentFile);
            formData.append('ttl', this.ttlSelect.value);
            
            if (this.customFilename.value.trim()) {
                formData.append('fileName', this.customFilename.value.trim());
            }
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            let result;
            
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                // If not JSON, probably an error page
                const text = await response.text();
                console.error('Server returned non-JSON response:', text);
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            
            console.log('Server response:', result);
            
            if (result.success) {
                console.log('Upload successful, data:', result.data);
                this.showSuccess(result.data);
                this.showToast('File uploaded successfully!', 'success');
            } else {
                throw new Error(result.message || 'Upload failed');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showError(error.message);
            this.showToast('Upload failed: ' + error.message, 'error');
        } finally {
            this.isUploading = false;
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        this.uploadBtn.disabled = loading;
        
        if (loading) {
            this.btnText.style.display = 'none';
            this.btnLoader.style.display = 'flex';
        } else {
            this.btnText.style.display = 'flex';
            this.btnLoader.style.display = 'none';
        }
    }

    showSuccess(data) {
        console.log('showSuccess called with data:', data);
        console.log('Available data properties:', Object.keys(data));
        console.log('data.fileSize:', data.fileSize, typeof data.fileSize);
        
        // Store the data for later use
        this.uploadData = data;
        console.log('Stored uploadData:', this.uploadData);
        
        // Update result section
        if (this.resultFileName) {
            this.resultFileName.textContent = data.fileName || 'Unknown';
        }
        if (this.resultFileSize) {
            this.resultFileSize.textContent = this.formatFileSize(data.fileSize || 0);
        }
        if (this.resultExpiresAt) {
            this.resultExpiresAt.textContent = data.expiresAt ? 
                new Date(data.expiresAt).toLocaleString() : 'Unknown';
        }
        
        // Set the links correctly
        if (this.downloadLink) {
            this.downloadLink.value = data.downloadUrl || '';
        }
        if (this.shareLink) {
            // For now, use downloadUrl as share link since there's no separate share page
            this.shareLink.value = data.downloadUrl || '';
        }
        
        // Show result section
        if (this.uploadSection) {
            this.uploadSection.style.display = 'none';
        }
        if (this.errorSection) {
            this.errorSection.style.display = 'none';
        }
        if (this.resultSection) {
            this.resultSection.style.display = 'block';
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        
        // Show error section
        this.uploadSection.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.errorSection.style.display = 'block';
    }

    resetToUpload() {
        // Clear everything
        this.clearFile();
        this.customFilename.value = '';
        this.ttlSelect.value = '24h';
        
        // Show upload section
        this.resultSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.uploadSection.style.display = 'block';
    }

    copyLink(type = 'share') {
        const input = type === 'download' ? this.downloadLink : this.shareLink;
        if (input && input.value) {
            input.select();
            input.setSelectionRange(0, 99999);
            document.execCommand('copy');
            this.showToast(`${type === 'download' ? 'Download' : 'Share'} link copied to clipboard!`, 'success');
        }
    }

    testLink() {
        if (this.shareLink && this.shareLink.value) {
            window.open(this.shareLink.value, '_blank');
        }
    }

    downloadFile() {
        if (this.downloadLink && this.downloadLink.value) {
            window.open(this.downloadLink.value, '_blank');
        }
    }

    shareFile() {
        if (navigator.share && this.shareLink && this.shareLink.value) {
            // Use Web Share API if available
            navigator.share({
                title: this.uploadData?.fileName || 'Shared File',
                text: 'Check out this file I shared',
                url: this.shareLink.value
            }).catch(err => {
                console.log('Error sharing:', err);
                this.copyLink('share');
            });
        } else {
            // Fallback to copying link
            this.copyLink('share');
        }
    }

    showToast(message, type = 'success') {
        if (!this.toastMessage || !this.toast) return;
        
        this.toastMessage.textContent = message;
        this.toast.className = `toast ${type} show`;
        this.toast.style.display = 'block';
        
        // Update toast icon based on type
        const toastIcon = this.toast.querySelector('.toast-icon');
        if (toastIcon) {
            if (type === 'success') {
                this.updateToastIcon(toastIcon, 'success', '✅');
            } else if (type === 'error') {
                this.updateToastIcon(toastIcon, 'error', '❌');
            }
        }
        
        // Auto hide after 5 seconds
        setTimeout(() => this.hideToast(), 5000);
    }

    updateToastIcon(element, iconName, fallbackEmoji) {
        const img = document.createElement('img');
        img.src = `/icons/${iconName}.png`;
        img.alt = fallbackEmoji;
        img.style.width = '18px';
        img.style.height = '18px';
        img.style.display = 'inline-block';
        
        img.onload = () => {
            element.innerHTML = '';
            element.appendChild(img);
        };
        
        img.onerror = () => {
            element.textContent = fallbackEmoji;
        };
    }

    hideToast() {
        this.toast.classList.remove('show');
        setTimeout(() => {
            this.toast.style.display = 'none';
        }, 300);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing FileUploadApp');
    new FileUploadApp();
});
