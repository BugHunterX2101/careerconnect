// API Configuration
const config = {
    API_BASE_URL: 'http://localhost:3000',
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