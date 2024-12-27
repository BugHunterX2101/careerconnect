// Loading Functions
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        document.body.style.cursor = 'wait';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
        document.body.style.cursor = 'default';
    }
}

// DOM Elements
let educationModal, experienceModal, skillModal, profileForm;

// Initialize DOM Elements
function initializeElements() {
    educationModal = document.getElementById('educationModal');
    experienceModal = document.getElementById('experienceModal');
    skillModal = document.getElementById('skillModal');
    profileForm = document.getElementById('profileForm');
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

// Show Message
function showMessage(message, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error-message' : 'success-message'}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => {
        if (msg !== messageDiv) {
            msg.remove();
        }
    });

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Fetch Profile Data
async function fetchProfile() {
    try {
        showLoading();
        console.log('Fetching profile data...');
        const response = await api.getProfile();
        
        if (response.status === 'success' && response.data) {
            console.log('Profile data received:', response.data);
            populateProfile(response.data);
        } else {
            console.error('Invalid profile response:', response);
            throw new Error('Invalid profile data received');
        }
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        showMessage(error.message || 'Failed to load profile data. Please try again.', true);
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
    
    try {
        const educationData = {
            school: form.school.value.trim(),
            degree: form.degree.value.trim(),
            field: form.field.value.trim(),
            startDate: form.startDate.value,
            endDate: form.endDate.value || null
        };

        // Validate required fields
        if (!educationData.school || !educationData.degree || !educationData.field || !educationData.startDate) {
            throw new Error('Please fill in all required fields');
        }

        showLoading();
        console.log('Submitting education data:', educationData);
        
        const response = await api.addEducation(educationData);
        
        if (response.status === 'success') {
            closeModal('educationModal');
            form.reset();
            await fetchProfile();
            showMessage('Education added successfully');
        } else {
            throw new Error(response.message || 'Failed to add education');
        }
    } catch (error) {
        console.error('Failed to add education:', error);
        showMessage(error.message || 'Failed to add education', true);
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
        const response = await api.updateSocialLinks({
            linkedin: linkedinUrl,
            github: githubUrl,
            portfolio: portfolioUrl
        });

        if (response.status === 'success') {
            showMessage('Social links updated successfully');
            await fetchProfile(); // Refresh the profile data
        } else {
            throw new Error('Failed to update social links');
        }
    } catch (error) {
        console.error('Failed to update social links:', error);
        showMessage(error.message || 'Failed to update social links', true);
    } finally {
        hideLoading();
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing profile page');
        
        // Initialize DOM elements
        initializeElements();

        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, redirecting to login');
            window.location.href = '/login.html';
            return;
        }

        // Add form submit event listeners
        const educationForm = document.getElementById('educationForm');
        if (educationForm) {
            educationForm.addEventListener('submit', handleEducationSubmit);
        } else {
            console.warn('Education form not found');
        }

        const experienceForm = document.getElementById('experienceForm');
        if (experienceForm) {
            experienceForm.addEventListener('submit', handleExperienceSubmit);
        } else {
            console.warn('Experience form not found');
        }

        const skillForm = document.getElementById('skillForm');
        if (skillForm) {
            skillForm.addEventListener('submit', handleSkillSubmit);
        } else {
            console.warn('Skill form not found');
        }

        // Fetch initial profile data
        await fetchProfile();
        
    } catch (error) {
        console.error('Failed to initialize profile:', error);
        showMessage('Failed to initialize profile. Please refresh the page.', true);
    }
});