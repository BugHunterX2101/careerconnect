// API Configuration
const api = {
    BASE_URL: 'https://careerconnect-server-7af1-jonwailh3-vedit-agrawals-projects.vercel.app',
    
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
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            const response = await fetch(url, {
                ...options,
                headers: this.getHeaders(),
                mode: 'cors',
                credentials: 'include',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error('Invalid response format');
            }

            console.log(`API Response (${url}):`, data);

            if (!response.ok) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            console.error('API Request Error:', error);
            throw error;
        }
    },

    async register(userData) {
        console.log('Registering user:', { ...userData, password: '[REDACTED]' });
        return this.makeRequest(`${this.BASE_URL}/api/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async login(credentials) {
        console.log('Logging in user:', credentials.email);
        return this.makeRequest(`${this.BASE_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
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