// API Configuration
const api = {
    // Use the current domain in production, localhost in development
    BASE_URL: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:3000'
        : 'https://careerconnect-server-7af1.vercel.app',
    
    getHeaders() {
        const token = localStorage.getItem('token');
        if (!token && window.location.pathname !== '/login.html' && window.location.pathname !== '/signup.html') {
            window.location.href = '/login.html';
            return null;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };

        console.log('Request headers:', {
            ...headers,
            Authorization: headers.Authorization ? '[PRESENT]' : '[MISSING]'
        });
        return headers;
    },

    async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            console.log(`[${new Date().toISOString()}] Making request to:`, url);
            
            const headers = this.getHeaders();
            if (!headers) return; // User was redirected to login

            const fetchOptions = {
                ...options,
                headers,
                signal: controller.signal,
                mode: 'cors'
            };

            console.log('Request options:', {
                ...fetchOptions,
                headers: {
                    ...fetchOptions.headers,
                    Authorization: fetchOptions.headers.Authorization ? '[PRESENT]' : '[MISSING]'
                }
            });

            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            let data;
            const text = await response.text();
            console.log('Raw response:', text);

            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                throw new Error(`Invalid response format from server: ${text}`);
            }

            console.log('Parsed response data:', data);

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login.html';
                    return;
                }
                const error = new Error(data.message || `Request failed with status ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Request failed:`, {
                url,
                error: error.message,
                stack: error.stack
            });

            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }

            if (!navigator.onLine) {
                throw new Error('No internet connection. Please check your network and try again.');
            }

            if (error.message.includes('Failed to fetch')) {
                throw new Error('Unable to connect to the server. Please try again later.');
            }

            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    },

    async register(userData) {
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
            throw new Error(error.message || 'Registration failed. Please try again.');
        }
    },

    async login(credentials) {
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
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            this.logout();
            return;
        }
        throw error;
    }
};

// Export API object
window.api = api; 