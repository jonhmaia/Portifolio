// Custom Admin JavaScript

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeCustomAdmin();
    });
    
    function initializeCustomAdmin() {
        // Initialize all custom features
        initializeTooltips();
        initializeConfirmations();
        initializeFormEnhancements();
        initializeTableEnhancements();
        initializeFileUpload();
        initializeSearchEnhancements();
        initializeNotifications();
        initializeKeyboardShortcuts();
        initializeThemeToggle();
        initializeAutoSave();
    }
    
    // Initialize Bootstrap tooltips
    function initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Enhanced confirmations for delete actions
    function initializeConfirmations() {
        const deleteButtons = document.querySelectorAll('.btn-danger, [name="_delete"], .delete-link');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const itemName = this.dataset.itemName || 'este item';
                const confirmMessage = `Tem certeza de que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`;
                
                if (!confirm(confirmMessage)) {
                    e.preventDefault();
                    return false;
                }
                
                // Add loading state
                if (this.tagName === 'BUTTON') {
                    this.innerHTML = '<span class="spinner me-2"></span>Excluindo...';
                    this.disabled = true;
                }
            });
        });
    }
    
    // Form enhancements
    function initializeFormEnhancements() {
        // Auto-resize textareas
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            autoResizeTextarea(textarea);
            textarea.addEventListener('input', () => autoResizeTextarea(textarea));
        });
        
        // Character counter for text fields with maxlength
        const textInputs = document.querySelectorAll('input[type="text"][maxlength], textarea[maxlength]');
        textInputs.forEach(input => {
            addCharacterCounter(input);
        });
        
        // Form validation feedback
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                if (!validateForm(this)) {
                    e.preventDefault();
                    showNotification('Por favor, corrija os erros no formulário.', 'error');
                }
            });
        });
        
        // Auto-save for long forms
        const longForms = document.querySelectorAll('form[data-auto-save]');
        longForms.forEach(form => {
            setupAutoSave(form);
        });
    }
    
    // Table enhancements
    function initializeTableEnhancements() {
        // Sortable tables
        const sortableTables = document.querySelectorAll('.table[data-sortable]');
        sortableTables.forEach(table => {
            makeSortable(table);
        });
        
        // Row selection
        const selectAllCheckbox = document.querySelector('#action-toggle');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.action-select');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
                updateSelectedCount();
            });
        }
        
        // Individual row selection
        const rowCheckboxes = document.querySelectorAll('.action-select');
        rowCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedCount);
        });
        
        // Highlight selected rows
        rowCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const row = this.closest('tr');
                if (this.checked) {
                    row.classList.add('table-active');
                } else {
                    row.classList.remove('table-active');
                }
            });
        });
    }
    
    // Enhanced file upload
    function initializeFileUpload() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            const wrapper = createFileUploadWrapper(input);
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            
            // Drag and drop functionality
            wrapper.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });
            
            wrapper.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
            });
            
            wrapper.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    input.files = files;
                    updateFileUploadDisplay(wrapper, files[0]);
                }
            });
            
            input.addEventListener('change', function() {
                if (this.files.length > 0) {
                    updateFileUploadDisplay(wrapper, this.files[0]);
                }
            });
        });
    }
    
    // Search enhancements
    function initializeSearchEnhancements() {
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            // Add search icon
            const wrapper = document.createElement('div');
            wrapper.className = 'search-wrapper';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-search search-icon';
            wrapper.appendChild(icon);
            
            // Clear button
            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'search-clear';
            clearBtn.innerHTML = '<i class="fas fa-times"></i>';
            clearBtn.style.display = 'none';
            wrapper.appendChild(clearBtn);
            
            input.addEventListener('input', function() {
                clearBtn.style.display = this.value ? 'block' : 'none';
            });
            
            clearBtn.addEventListener('click', function() {
                input.value = '';
                input.focus();
                this.style.display = 'none';
                input.dispatchEvent(new Event('input'));
            });
        });
    }
    
    // Notification system
    function initializeNotifications() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }
    
    // Keyboard shortcuts
    function initializeKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const saveButton = document.querySelector('[name="_save"], .btn-primary[type="submit"]');
                if (saveButton) {
                    saveButton.click();
                }
            }
            
            // Ctrl+Enter to save and continue
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                const saveAndContinueButton = document.querySelector('[name="_continue"]');
                if (saveAndContinueButton) {
                    saveAndContinueButton.click();
                }
            }
            
            // Escape to cancel/close
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    const closeButton = modal.querySelector('.btn-close, [data-bs-dismiss="modal"]');
                    if (closeButton) {
                        closeButton.click();
                    }
                }
            }
        });
    }
    
    // Theme toggle
    function initializeThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                document.body.classList.toggle('dark-theme');
                const isDark = document.body.classList.contains('dark-theme');
                localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');
                
                // Update icon
                const icon = this.querySelector('i');
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            });
            
            // Load saved theme
            const savedTheme = localStorage.getItem('admin-theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                const icon = themeToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-sun';
            }
        }
    }
    
    // Auto-save functionality
    function initializeAutoSave() {
        const autoSaveForms = document.querySelectorAll('[data-auto-save]');
        
        autoSaveForms.forEach(form => {
            let autoSaveTimer;
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    clearTimeout(autoSaveTimer);
                    autoSaveTimer = setTimeout(() => {
                        saveFormData(form);
                    }, 2000); // Auto-save after 2 seconds of inactivity
                });
            });
        });
    }
    
    // Utility functions
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    function addCharacterCounter(input) {
        const maxLength = parseInt(input.getAttribute('maxlength'));
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        input.parentNode.appendChild(counter);
        
        function updateCounter() {
            const remaining = maxLength - input.value.length;
            counter.textContent = `${input.value.length}/${maxLength}`;
            counter.className = 'character-counter ' + (remaining < 10 ? 'text-warning' : '');
        }
        
        input.addEventListener('input', updateCounter);
        updateCounter();
    }
    
    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        return isValid;
    }
    
    function makeSortable(table) {
        const headers = table.querySelectorAll('th[data-sortable]');
        
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function() {
                const column = this.dataset.sortable;
                const currentOrder = this.dataset.order || 'asc';
                const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
                
                // Update header
                headers.forEach(h => h.dataset.order = '');
                this.dataset.order = newOrder;
                
                // Sort table
                sortTable(table, column, newOrder);
            });
        });
    }
    
    function sortTable(table, column, order) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aVal = a.querySelector(`[data-sort="${column}"]`)?.textContent || '';
            const bVal = b.querySelector(`[data-sort="${column}"]`)?.textContent || '';
            
            if (order === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });
        
        rows.forEach(row => tbody.appendChild(row));
    }
    
    function updateSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.action-select:checked');
        const count = selectedCheckboxes.length;
        const counter = document.querySelector('.selected-count');
        
        if (counter) {
            counter.textContent = count;
            counter.style.display = count > 0 ? 'inline' : 'none';
        }
        
        // Update action buttons
        const actionButtons = document.querySelectorAll('.bulk-action');
        actionButtons.forEach(button => {
            button.disabled = count === 0;
        });
    }
    
    function createFileUploadWrapper(input) {
        const wrapper = document.createElement('div');
        wrapper.className = 'file-upload-wrapper';
        wrapper.innerHTML = `
            <div class="file-upload-area">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Arraste arquivos aqui ou clique para selecionar</p>
                <div class="file-info" style="display: none;"></div>
            </div>
        `;
        
        const area = wrapper.querySelector('.file-upload-area');
        area.addEventListener('click', () => input.click());
        
        return wrapper;
    }
    
    function updateFileUploadDisplay(wrapper, file) {
        const fileInfo = wrapper.querySelector('.file-info');
        const area = wrapper.querySelector('.file-upload-area');
        
        fileInfo.innerHTML = `
            <i class="fas fa-file"></i>
            <span>${file.name}</span>
            <small>(${formatFileSize(file.size)})</small>
        `;
        
        fileInfo.style.display = 'block';
        area.classList.add('has-file');
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function showNotification(message, type = 'info', duration = 5000) {
        const container = document.querySelector('.notification-container');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} animate-slideInDown`;
        
        const icon = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';
        
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
            <button type="button" class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove
        setTimeout(() => {
            notification.classList.add('animate-fadeOut');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('animate-fadeOut');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    function saveFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        localStorage.setItem(`form-autosave-${form.id || 'default'}`, JSON.stringify(data));
        showNotification('Rascunho salvo automaticamente', 'info', 2000);
    }
    
    function loadFormData(form) {
        const savedData = localStorage.getItem(`form-autosave-${form.id || 'default'}`);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field && !field.value) {
                    field.value = data[key];
                }
            });
        }
    }
    
    // Export functions for global use
    window.AdminUtils = {
        showNotification,
        validateForm,
        autoResizeTextarea,
        formatFileSize
    };
    
})();