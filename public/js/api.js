// API Configuration
const api = {
    BASE_URL: 'https://careerconnect-server-7af1-jonwailh3-vedit-agrawals-projects.vercel.app',
    
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin
        };
    },

    async register(userData) {
        try {
            console.log('Registering user:', userData);
            const response = await fetch(`${this.BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async login(credentials) {
        try {
            console.log('Logging in user:', credentials);
            const response = await fetch(`${this.BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
};

// Export API object
window.api = api; 