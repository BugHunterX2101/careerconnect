const api = {
    BASE_URL: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://careerconnect-server-7af1-vedit-agrawals-projects.vercel.app/api',

    getHeaders() {
        const token = localStorage.getItem('token');
        if (!token && !['/login.html', '/signup.html'].some(path => window.location.pathname.includes(path))) {
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
                const headers = this.getHeaders();
                if (!headers) return;

                const fetchOptions = {
                    ...options,
                    headers,
                    signal: controller.signal,
                    mode: 'cors',
                    credentials: 'include',
                };

                const response = await fetch(url, fetchOptions);

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login.html';
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.message || response.statusText || 'Network error';
                    throw new Error(`${response.status}: ${errorMessage}`);
                }

                return await response.json();

            } catch (error) {
                console.error(`Attempt ${attempt} failed: ${error.message}`);
                if (attempt === retries) {
                    throw new Error(`API request failed after ${retries} attempts: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } finally {
                clearTimeout(timeoutId);
            }
        }
    },

    async getProfile() {
        return await this.makeRequest(`${this.BASE_URL}/profile`);
    },

    async addEducation(educationData) {
        return await this.makeRequest(`${this.BASE_URL}/profile/education`, {
            method: 'POST',
            body: JSON.stringify(educationData)
        });
    },

    async addExperience(experienceData) {
        return await this.makeRequest(`${this.BASE_URL}/profile/experience`, {
            method: 'POST',
            body: JSON.stringify(experienceData)
        });
    },

    async addSkill(skillData) {
        return await this.makeRequest(`${this.BASE_URL}/profile/skills`, {
            method: 'POST',
            body: JSON.stringify(skillData)
        });
    },

    async updateSocialLinks(socialLinks) {
        return await this.makeRequest(`${this.BASE_URL}/profile/social`, {
            method: 'PUT',
            body: JSON.stringify(socialLinks)
        });
    }
};

window.api = api;
