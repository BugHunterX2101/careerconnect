// Employer functionality for posting and managing jobs
class EmployerPortal {
    constructor() {
        this.token = localStorage.getItem('token');
        this.init();
    }

    async init() {
        this.attachEventListeners();
    }

    async postJob(jobData) {
        try {
            const response = await fetch('http://localhost:3000/jobs/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(jobData)
            });
            const result = await response.json();
            if (response.ok) {
                this.showNotification('Job posted successfully!');
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
            return false;
        }
    }

    async searchCandidates(criteria) {
        try {
            const queryString = new URLSearchParams(criteria).toString();
            const response = await fetch(`http://localhost:3000/employer/search-candidates?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            const candidates = await response.json();
            this.renderCandidates(candidates);
        } catch (error) {
            console.error('Error searching candidates:', error);
        }
    }

    renderCandidates(candidates) {
        const container = document.getElementById('candidates-container');
        container.innerHTML = candidates.map(candidate => `
            <div class="candidate-card">
                <h3>${candidate.username}</h3>
                <p>Location: ${candidate.location}</p>
                <div class="skills">
                    ${candidate.skills.map(skill => 
                        `<span class="skill-tag">${skill}</span>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    attachEventListeners() {
        const jobForm = document.getElementById('job-post-form');
        if (jobForm) {
            jobForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(jobForm);
                const jobData = Object.fromEntries(formData.entries());
                await this.postJob(jobData);
            });
        }

        const searchForm = document.getElementById('candidate-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(searchForm);
                const criteria = Object.fromEntries(formData.entries());
                await this.searchCandidates(criteria);
            });
        }
    }
} 