// Admin Login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const remember = document.querySelector('input[name="remember"]').checked;
            
            // Demo authentication (replace with real authentication)
            if (username && password) {
                // Store login state (demo only)
                if (remember) {
                    localStorage.setItem('adminLoggedIn', 'true');
                } else {
                    sessionStorage.setItem('adminLoggedIn', 'true');
                }
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Mohon isi username dan password');
            }
        });
    }
});
