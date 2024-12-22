// Dashboard functionality for both job seekers and employers
class Dashboard {
    constructor() {
        this.token = localStorage.getItem('token');
        this.userRole = localStorage.getItem('userRole');
        this.init();
    }

    async init() {
        if (this.userRole === 'employer') {
            await this.loadEmployerDashboard();
        } else {
            await this.loadJobSeekerDashboard();
        }
    }

    async loadEmployerDashboard() {
        try {
            const response = await fetch('http://localhost:3000/employer/dashboard', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            const data = await response.json();
            this.renderEmployerDashboard(data);
        } catch (error) {
            console.error('Error loading employer dashboard:', error);
        }
    }

    async loadJobSeekerDashboard() {
        try {
            const response = await fetch('http://localhost:3000/jobs/recommendations', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            const jobs = await response.json();
            this.renderJobRecommendations(jobs);
        } catch (error) {
            console.error('Error loading job recommendations:', error);
        }
    }

    renderEmployerDashboard(data) {
        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = `
            <div class="stats-container">
                <h2>Dashboard Statistics</h2>
                <p>Total Jobs Posted: ${data.statistics.totalJobs}</p>
                <p>Average Salary: $${Math.round(data.statistics.averageSalary)}</p>
            </div>
            <div class="jobs-list">
                <h3>Your Job Postings</h3>
                ${data.jobs.map(job => this.createJobCard(job)).join('')}
            </div>
        `;
    }

    renderJobRecommendations(jobs) {
        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = `
            <div class="recommendations">
                <h2>Recommended Jobs</h2>
                ${jobs.map(job => this.createJobCard(job)).join('')}
            </div>
        `;
    }

    createJobCard(job) {
        return `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p>Location: ${job.location}</p>
                <p>Salary: $${job.salary}</p>
                <div class="skills">
                    ${job.requiredSkills.map(skill => 
                        `<span class="skill-tag">${skill}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
} 