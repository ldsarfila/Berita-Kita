// Admin Panel Main Script
document.addEventListener('DOMContentLoaded', function() {
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

    // Check authentication (demo)
    const isLoggedIn = localStorage.getItem('adminLoggedIn') || sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn && !window.location.pathname.includes('login.html')) {
        // Uncomment for real authentication
        // window.location.href = 'login.html';
    }

    // Logout functionality
    const logoutBtn = document.querySelector('.nav-item.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.removeItem('adminLoggedIn');
                sessionStorage.removeItem('adminLoggedIn');
                window.location.href = 'login.html';
            }
        });
    }

    // Notification dropdown (placeholder)
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.addEventListener('click', function() {
            alert('Anda memiliki 5 notifikasi baru');
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
                    alert('Searching for: ' + query);
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

// Confirm delete action
function confirmDelete(itemName) {
    return confirm(`Apakah Anda yakin ingin menghapus ${itemName}?`);
}

// Show success message
function showSuccessMessage(message) {
    alert('Success: ' + message);
}

// Show error message
function showErrorMessage(message) {
    alert('Error: ' + message);
}
