// API Configuration
const config = {
    // Use Vercel URL in production, localhost in development
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://careerconnect-server-7af1-j8v5fpucg-vedit-agrawals-projects.vercel.app',
    getHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json'
        };
    }
};

// Export configuration
window.appConfig = config; 