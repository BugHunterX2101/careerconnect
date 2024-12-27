// API Configuration
const api = {
    // Use the current domain in production, localhost in development
    BASE_URL: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:3000'
        : 'https://careerconnect-server-7af1.vercel.app',
    
    getHeaders() {
        const token = localStorage.getItem('token');
        if (!token && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
            window.location.href = '/login.html';
            return null;
        }

        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
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

            let data;
            const text = await response.text();
            console.log('Raw response:', text);

            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error('Failed to parse JSON response:', e);
                throw new Error(`Invalid response format from server: ${text}`);
            }

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Request failed:`, {
                url,
                error: error.message
            });

            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }

            if (!navigator.onLine) {
                throw new Error('No internet connection. Please check your network and try again.');
            }

            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    },

    async getProfile() {
        return this.makeRequest(`${this.BASE_URL}/api/profile`);
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

    async updateSocialLinks(socialLinks) {
        return this.makeRequest(`${this.BASE_URL}/api/profile/social`, {
            method: 'PUT',
            body: JSON.stringify(socialLinks)
        });
    }
};

// Export API object
window.api = api; 