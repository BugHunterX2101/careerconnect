// API Configuration
const api = {
    // Use the current domain in production, localhost in development
    BASE_URL: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://careerconnect-server-7af1-vedit-agrawals-projects.vercel.app/api',
    
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

    async makeRequest(url, options = {}, retries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            try {
                console.log(`[${new Date().toISOString()}] Making request to: ${url} (Attempt ${attempt}/${retries})`);
                
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

                // Handle CORS errors specifically
                if (response.status === 0 || !response.ok) {
                    const error = new Error(response.statusText || 'Network error');
                    error.status = response.status;
                    throw error;
                }

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Request failed');
                }

                console.log(`[${new Date().toISOString()}] Request successful on attempt ${attempt}`);
                return data;

            } catch (error) {
                console.error(`API request failed (Attempt ${attempt}/${retries}):`, error);
                
                // If this was the last attempt, throw the error
                if (attempt === retries) {
                    throw error;
                }
                
                // If there are more attempts left, wait before retrying
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Increase delay for next attempt (exponential backoff)
                delay *= 2;
            } finally {
                clearTimeout(timeoutId);
            }
        }
    },

    // Profile endpoints
    async getProfile() {
        try {
            console.log('Fetching profile data...');
            const data = await this.makeRequest(`${this.BASE_URL}/profile`);
            console.log('Profile data received:', data);
            return data;
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            throw error;
        }
    },

    async addEducation(educationData) {
        try {
            console.log('Adding education data:', educationData);
            const data = await this.makeRequest(`${this.BASE_URL}/profile/education`, {
                method: 'POST',
                body: JSON.stringify(educationData)
            });
            console.log('Education data added:', data);
            return data;
        } catch (error) {
            console.error('Failed to add education:', error);
            throw error;
        }
    },

    async addExperience(experienceData) {
        try {
            console.log('Adding experience data:', experienceData);
            const data = await this.makeRequest(`${this.BASE_URL}/profile/experience`, {
                method: 'POST',
                body: JSON.stringify(experienceData)
            });
            console.log('Experience data added:', data);
            return data;
        } catch (error) {
            console.error('Failed to add experience:', error);
            throw error;
        }
    },

    async addSkill(skillData) {
        try {
            console.log('Adding skill data:', skillData);
            const data = await this.makeRequest(`${this.BASE_URL}/profile/skills`, {
                method: 'POST',
                body: JSON.stringify(skillData)
            });
            console.log('Skill data added:', data);
            return data;
        } catch (error) {
            console.error('Failed to add skill:', error);
            throw error;
        }
    },

    async updateSocialLinks(socialLinks) {
        try {
            console.log('Updating social links:', socialLinks);
            const data = await this.makeRequest(`${this.BASE_URL}/profile/social`, {
                method: 'PUT',
                body: JSON.stringify(socialLinks)
            });
            console.log('Social links updated:', data);
            return data;
        } catch (error) {
            console.error('Failed to update social links:', error);
            throw error;
        }
    }
};

// Export API object
window.api = api; 