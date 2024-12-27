// API Configuration
const config = {
    // Use Vercel URL in production, localhost in development
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://careerconnect-server-7af1-vedit-agrawals-projects.vercel.app',
    getHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json',
            'Origin': window.location.origin
        };
    },
    handleApiCall: async (url, options = {}) => {
        try {
            const headers = config.getHeaders();
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers
                },
                mode: 'cors'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `API call failed: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    },
    auth: {
        async register(userData) {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                localStorage.setItem('token', data.token);
                return data;
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
        async login(credentials) {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                localStorage.setItem('token', data.token);
                return data;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        }
    }
};

// Export configuration
window.appConfig = config; 