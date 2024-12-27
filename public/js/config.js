// API Configuration
const config = {
    // Use Vercel URL in production, localhost in development
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://careerconnect-server-8yctqthh9-vedit-agrawals-projects.vercel.app',
    getHeaders: () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return null;
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Origin': window.location.origin
        };
    },
    handleApiCall: async (url, options = {}) => {
        try {
            const headers = config.getHeaders();
            if (!headers) return null;

            const response = await fetch(url, {
                ...options,
                headers,
                mode: 'cors',
                credentials: 'include'
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return null;
            }

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }
};

// Export configuration
window.appConfig = config; 