// API Configuration
const config = {
    // Use Vercel URL in production, localhost in development
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://careerconnect-server-975zxi3gi-vedit-agrawals-projects.vercel.app',
    getHeaders: () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return null;
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        };
    }
};

// Export configuration
window.appConfig = config; 