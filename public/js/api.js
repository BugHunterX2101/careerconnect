// API Configuration
const api = {
    // Use the current domain in production, localhost in development
    BASE_URL: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://careerconnect-server-7af1.vercel.app/api',
    
    getHeaders() {
        const token = localStorage.getItem('token');
        if (!token && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
            window.location.href = '/login.html';
            return null;
        }

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
            console.log(`[${new Date().toISOString()}] Making request to:`, url);
            
            const headers = this.getHeaders();
            if (!headers) return; // User was redirected to login

            const fetchOptions = {
                ...options,
                headers,
                signal: controller.signal,
                mode: 'cors',
                credentials: 'include'
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

            // If token is invalid, redirect to login
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
                return;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    },

    // Profile endpoints
    async getProfile() {
        return this.makeRequest(`${this.BASE_URL}/profile`);
    },

    async addEducation(educationData) {
        return this.makeRequest(`${this.BASE_URL}/profile/education`, {
            method: 'POST',
            body: JSON.stringify(educationData)
        });
    },

    async addExperience(experienceData) {
        return this.makeRequest(`${this.BASE_URL}/profile/experience`, {
            method: 'POST',
            body: JSON.stringify(experienceData)
        });
    },

    async addSkill(skillData) {
        return this.makeRequest(`${this.BASE_URL}/profile/skills`, {
            method: 'POST',
            body: JSON.stringify(skillData)
        });
    },

    async updateSocialLinks(socialLinks) {
        return this.makeRequest(`${this.BASE_URL}/profile/social`, {
            method: 'PUT',
            body: JSON.stringify(socialLinks)
        });
    }
};

// Export API object
window.api = api; 