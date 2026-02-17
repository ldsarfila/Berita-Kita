// Admin Panel Main Script
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = window.BERITAKITA_API_BASE_URL || 'http://localhost:3000/api/v1';

    function getAuthData() {
        const raw = localStorage.getItem('bkAuth') || sessionStorage.getItem('bkAuth');
        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            localStorage.removeItem('bkAuth');
            sessionStorage.removeItem('bkAuth');
            return null;
        }
    }

    async function validateAuth() {
        const auth = getAuthData();
        const isLoginPage = window.location.pathname.includes('login.html');

        if (isLoginPage) {
            return;
        }

        if (!auth || !auth.token) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Sesi login tidak valid');
            }

            const result = await response.json();
            const userNameEl = document.querySelector('.user-profile span');
            if (userNameEl && result.user && result.user.username) {
                userNameEl.textContent = result.user.username;
            }
        } catch (error) {
            localStorage.removeItem('bkAuth');
            sessionStorage.removeItem('bkAuth');
            window.location.href = 'login.html';
        }
    }

    validateAuth();

    // Sidebar toggle for mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.querySelector('.nav-item.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const isConfirmed = await showConfirmModal('Apakah Anda yakin ingin logout?', {
                confirmText: 'Logout',
                cancelText: 'Batal',
                danger: true
            });
            if (isConfirmed) {
                localStorage.removeItem('bkAuth');
                sessionStorage.removeItem('bkAuth');
                window.location.href = 'login.html';
            }
        });
    }

    // Notification dropdown (placeholder)
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.addEventListener('click', function() {
            showToast('Anda memiliki 5 notifikasi baru', 'info');
        });
    }

    // User profile dropdown (placeholder)
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', function() {
            // Toggle profile dropdown menu
            console.log('Profile clicked');
        });
    }

    // Animate stats on load
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const value = parseInt(stat.textContent.replace(/,/g, ''));
        if (!isNaN(value)) {
            animateValue(stat, 0, value, 1000);
        }
    });

    // Search functionality
    const searchBox = document.querySelector('.topbar-right .search-box input');
    if (searchBox) {
        searchBox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    showToast('Searching for: ' + query, 'info');
                }
            }
        });
    }
});

// Animate number counter
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(function() {
        current += increment;
        if (current >= end) {
            element.textContent = formatNumber(end);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showConfirmModal(message, options = {}) {
    return new Promise((resolve) => {
        const confirmText = options.confirmText || 'Ya';
        const cancelText = options.cancelText || 'Batal';
        const danger = Boolean(options.danger);

        const overlay = document.createElement('div');
        overlay.className = 'admin-confirm-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'admin-confirm-dialog';
        dialog.innerHTML = `
            <h3>Konfirmasi</h3>
            <p>${String(message || '')}</p>
            <div class="admin-confirm-actions">
                <button type="button" class="btn-secondary confirm-cancel">${cancelText}</button>
                <button type="button" class="${danger ? 'btn-danger' : 'btn-primary'} confirm-ok">${confirmText}</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const cancelButton = dialog.querySelector('.confirm-cancel');
        const okButton = dialog.querySelector('.confirm-ok');

        const cleanup = () => {
            if (overlay.parentElement) {
                overlay.parentElement.removeChild(overlay);
            }
            document.removeEventListener('keydown', onKeyDown);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        cancelButton.addEventListener('click', onCancel);
        okButton.addEventListener('click', onConfirm);
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                onCancel();
            }
        });

        document.addEventListener('keydown', onKeyDown);
        okButton.focus();
    });
}

window.showConfirmModal = showConfirmModal;

function getToastContainer() {
    let container = document.getElementById('admin-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'admin-toast-container';
        container.className = 'admin-toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = 'info', durationMs = 2600) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.textContent = String(message || '');

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    const hide = () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement === container) {
                container.removeChild(toast);
            }
        }, 220);
    };

    const timeoutId = setTimeout(hide, durationMs);
    toast.addEventListener('click', () => {
        clearTimeout(timeoutId);
        hide();
    });
}

// Show success message
function showSuccessMessage(message) {
    showToast(message, 'success');
}

// Show error message
function showErrorMessage(message) {
    showToast(message, 'error', 3200);
}
