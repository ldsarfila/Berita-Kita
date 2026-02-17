// Admin Login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const API_BASE_URL = window.BERITAKITA_API_BASE_URL || 'http://localhost:3000/api/v1';

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
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const remember = document.querySelector('input[name="remember"]').checked;
            
            if (!username || !password) {
                showToast('Mohon isi username dan password', 'error', 3200);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Login gagal');
                }

                localStorage.removeItem('bkAuth');
                sessionStorage.removeItem('bkAuth');

                const storage = remember ? localStorage : sessionStorage;
                storage.setItem('bkAuth', JSON.stringify({
                    token: result.accessToken,
                    user: result.user
                }));

                window.location.href = 'dashboard.html';
            } catch (error) {
                showToast(error.message || 'Terjadi kesalahan saat login', 'error', 3200);
            }
        });
    }
});
