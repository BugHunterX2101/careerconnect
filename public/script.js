// Form submission handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store the token and user data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('username', data.username);
                    
                    if (rememberMe) {
                        // Set session expiry to 24 hours from now
                        const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
                        localStorage.setItem('sessionExpiry', expiryTime);
                    }
                    
                    // Redirect to dashboard
                    window.location.href = '/dashboard';
                } else {
                    alert(data.message || 'Login failed. Please try again.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login. Please try again.');
            }
        });
    }
    
    // Check for existing session
    const token = localStorage.getItem('token');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (token && sessionExpiry) {
        const currentTime = new Date().getTime();
        if (currentTime < parseInt(sessionExpiry)) {
            // Session is still valid, redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            // Session expired, clear storage
            localStorage.clear();
        }
    }
}); 