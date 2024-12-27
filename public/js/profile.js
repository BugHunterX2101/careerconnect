// DOM Elements
let educationModal, experienceModal, skillModal, profileForm, loadingOverlay;

// Initialize DOM Elements
function initializeElements() {
    educationModal = document.getElementById('educationModal');
    experienceModal = document.getElementById('experienceModal');
    skillModal = document.getElementById('skillModal');
    profileForm = document.getElementById('profileForm');
    loadingOverlay = document.getElementById('loadingOverlay');
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Show/Hide Loading
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Show Message
function showMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error-message' : 'success-message'}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Fetch Profile Data
async function fetchProfile() {
    try {
        showLoading();
        const response = await api.getProfile();
        if (response.status === 'success' && response.data) {
            populateProfile(response.data);
        } else {
            throw new Error('Invalid profile data received');
        }
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        showMessage('Failed to load profile data. Please try again.', true);
    } finally {
        hideLoading();
    }
}

// Populate Profile Data
function populateProfile(profile) {
    if (!profile) {
        console.error('No profile data received');
        return;
    }

    try {
        // Education
        const educationContainer = document.getElementById('educationList');
        if (educationContainer && profile.education) {
            educationContainer.innerHTML = profile.education.map(edu => `
                <div class="education-item">
                    <h3>${edu.school}</h3>
                    <p>${edu.degree} - ${edu.field}</p>
                    <p>${new Date(edu.startDate).toLocaleDateString()} - ${edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}</p>
                </div>
            `).join('');
        }

        // Experience
        const experienceContainer = document.getElementById('experienceList');
        if (experienceContainer && profile.experience) {
            experienceContainer.innerHTML = profile.experience.map(exp => `
                <div class="experience-item">
                    <h3>${exp.company}</h3>
                    <p>${exp.position}</p>
                    <p>${new Date(exp.startDate).toLocaleDateString()} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}</p>
                    <p>${exp.description}</p>
                </div>
            `).join('');
        }

        // Skills
        const skillsContainer = document.getElementById('skillsList');
        if (skillsContainer && profile.skills) {
            skillsContainer.innerHTML = profile.skills.map(skill => `
                <div class="skill-item">
                    <span>${skill.name}</span>
                    <span class="skill-level">${skill.level}</span>
                </div>
            `).join('');
        }

        // Social Links
        if (profile.socialLinks) {
            const linkedinInput = document.getElementById('linkedinUrl');
            const githubInput = document.getElementById('githubUrl');
            const portfolioInput = document.getElementById('portfolioUrl');

            if (linkedinInput) linkedinInput.value = profile.socialLinks.linkedin || '';
            if (githubInput) githubInput.value = profile.socialLinks.github || '';
            if (portfolioInput) portfolioInput.value = profile.socialLinks.portfolio || '';
        }
    } catch (error) {
        console.error('Error populating profile:', error);
        showMessage('Error displaying profile data', true);
    }
}

// Form Submissions
async function handleEducationSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const educationData = {
        school: form.school.value,
        degree: form.degree.value,
        field: form.field.value,
        startDate: form.startDate.value,
        endDate: form.endDate.value || null
    };

    try {
        showLoading();
        await api.addEducation(educationData);
        closeModal('educationModal');
        form.reset();
        await fetchProfile();
        showMessage('Education added successfully');
    } catch (error) {
        console.error('Failed to add education:', error);
        showMessage('Failed to add education', true);
    } finally {
        hideLoading();
    }
}

async function handleExperienceSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const experienceData = {
        company: form.company.value,
        position: form.position.value,
        startDate: form.startDate.value,
        endDate: form.endDate.value || null,
        description: form.description.value
    };

    try {
        showLoading();
        await api.addExperience(experienceData);
        closeModal('experienceModal');
        form.reset();
        await fetchProfile();
        showMessage('Experience added successfully');
    } catch (error) {
        console.error('Failed to add experience:', error);
        showMessage('Failed to add experience', true);
    } finally {
        hideLoading();
    }
}

async function handleSkillSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const skillData = {
        name: form.skillName.value,
        level: form.skillLevel.value
    };

    try {
        showLoading();
        await api.addSkill(skillData);
        closeModal('skillModal');
        form.reset();
        await fetchProfile();
        showMessage('Skill added successfully');
    } catch (error) {
        console.error('Failed to add skill:', error);
        showMessage('Failed to add skill', true);
    } finally {
        hideLoading();
    }
}

// Update Social Links
async function updateSocialLinks() {
    const linkedinUrl = document.getElementById('linkedinUrl').value;
    const githubUrl = document.getElementById('githubUrl').value;
    const portfolioUrl = document.getElementById('portfolioUrl').value;

    try {
        showLoading();
        await api.updateProfile({
            socialLinks: {
                linkedin: linkedinUrl,
                github: githubUrl,
                portfolio: portfolioUrl
            }
        });
        showMessage('Social links updated successfully');
    } catch (error) {
        console.error('Failed to update social links:', error);
        showMessage('Failed to update social links', true);
    } finally {
        hideLoading();
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize DOM elements
        initializeElements();

        // Check authentication
        if (!api.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        // Fetch initial profile data
        fetchProfile();

        // Add form submit event listeners
        const educationForm = document.getElementById('educationForm');
        if (educationForm) {
            educationForm.addEventListener('submit', handleEducationSubmit);
        }

        const experienceForm = document.getElementById('experienceForm');
        if (experienceForm) {
            experienceForm.addEventListener('submit', handleExperienceSubmit);
        }

        const skillForm = document.getElementById('skillForm');
        if (skillForm) {
            skillForm.addEventListener('submit', handleSkillSubmit);
        }
    } catch (error) {
        console.error('Failed to initialize profile:', error);
        showMessage('Failed to initialize profile. Please refresh the page.', true);
    }
});