// API Configuration
const api = {
    // Use the current domain in production, localhost in development
    BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://careerconnect-server-7af1-4phdqp9m-vedit-agrawals-projects.vercel.app',
    
    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'Origin': window.location.origin
        };
    },

    async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            console.log('Making request to:', url);
            console.log('Request options:', {
                ...options,
                headers: this.getHeaders(),
                body: options.body ? JSON.parse(options.body) : undefined
            });

            const response = await fetch(url, {
                ...options,
                headers: this.getHeaders(),
                mode: 'cors',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                throw new Error('Invalid response format from server');
            }

            console.log('Response status:', response.status);
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            console.error('Request failed:', error);
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    },

    async register(userData) {
        console.log('Registering user:', { ...userData, password: '[REDACTED]' });
        try {
            const data = await this.makeRequest(`${this.BASE_URL}/api/auth/register`, {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            }
            
            return data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw new Error(error.message || 'Registration failed. Please try again.');
        }
    },

    async login(credentials) {
        console.log('Logging in user:', credentials.email);
        try {
            const data = await this.makeRequest(`${this.BASE_URL}/api/auth/login`, {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            }
            
            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    },

    async getProfile() {
        return this.makeRequest(`${this.BASE_URL}/api/profile`);
    },

    async updateProfile(profileData) {
        return this.makeRequest(`${this.BASE_URL}/api/profile`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    async addEducation(educationData) {
        return this.makeRequest(`${this.BASE_URL}/api/profile/education`, {
            method: 'POST',
            body: JSON.stringify(educationData)
        });
    },

    async addExperience(experienceData) {
        return this.makeRequest(`${this.BASE_URL}/api/profile/experience`, {
            method: 'POST',
            body: JSON.stringify(experienceData)
        });
    },

    async addSkill(skillData) {
        return this.makeRequest(`${this.BASE_URL}/api/profile/skills`, {
            method: 'POST',
            body: JSON.stringify(skillData)
        });
    },

    // Helper methods
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    },

    handleError(error) {
        console.error('API Error:', error);
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            this.logout();
            return;
        }
        throw error;
    }
};

// Export API object
window.api = api; 