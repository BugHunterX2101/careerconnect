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

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Initialize Profile Page
async function initializePage() {
    if (!checkAuth()) return;
    
    initializeElements();
    await fetchProfile();
    
    // Add event listeners
    document.getElementById('educationForm')?.addEventListener('submit', handleEducationSubmit);
    document.getElementById('experienceForm')?.addEventListener('submit', handleExperienceSubmit);
    document.getElementById('skillForm')?.addEventListener('submit', handleSkillSubmit);
    document.getElementById('updateLinksBtn')?.addEventListener('click', updateSocialLinks);
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
    if (!checkAuth()) return;
    
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
        
        // If unauthorized, redirect to login
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        }
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
                    <p>${formatDate(edu.startDate)} - ${edu.endDate ? formatDate(edu.endDate) : 'Present'}</p>
                </div>
            `).join('');
        }

        // Experience
        const experienceContainer = document.getElementById('experienceList');
        if (experienceContainer && profile.experience) {
            experienceContainer.innerHTML = profile.experience.map(exp => `
                <div class="experience-item">
                    <h3>${exp.company}</h3>
                    <p>${exp.position} ${exp.level ? `- ${exp.level}` : ''}</p>
                    <p>${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'}</p>
                    ${exp.description ? `<p>${exp.description}</p>` : ''}
                </div>
            `).join('');
        }

        // Skills
        const skillsContainer = document.getElementById('skillsList');
        if (skillsContainer && profile.skills) {
            skillsContainer.innerHTML = profile.skills.map(skill => `
                <div class="skill-item">
                    <span>${skill}</span>
                </div>
            `).join('');
        }

        // Social Links
        if (profile.social) {
            const linkedinInput = document.getElementById('linkedinUrl');
            const githubInput = document.getElementById('githubUrl');
            const portfolioInput = document.getElementById('portfolioUrl');

            if (linkedinInput) linkedinInput.value = profile.social.linkedin || '';
            if (githubInput) githubInput.value = profile.social.github || '';
            if (portfolioInput) portfolioInput.value = profile.social.portfolio || '';
        }
    } catch (error) {
        console.error('Error populating profile:', error);
        showMessage('Error displaying profile data', true);
    }
}

// Helper function to format dates
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
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
    
    try {
        const experienceData = {
            company: form.company.value.trim(),
            position: form.position.value.trim(),
            level: form.level.value.trim(),
            startDate: form.startDate.value,
            endDate: form.endDate.value || null,
            description: form.description.value.trim()
        };

        // Validate required fields
        if (!experienceData.company || !experienceData.position || !experienceData.startDate) {
            throw new Error('Please fill in all required fields');
        }

        showLoading();
        const response = await api.addExperience(experienceData);
        
        if (response.status === 'success') {
            closeModal('experienceModal');
            form.reset();
            await fetchProfile();
            showMessage('Experience added successfully');
        } else {
            throw new Error(response.message || 'Failed to add experience');
        }
    } catch (error) {
        console.error('Failed to add experience:', error);
        showMessage(error.message || 'Failed to add experience', true);
    } finally {
        hideLoading();
    }
}

async function handleSkillSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    try {
        const skillData = {
            name: form.skillName.value.trim()
        };

        // Validate required fields
        if (!skillData.name) {
            throw new Error('Please enter a skill name');
        }

        showLoading();
        const response = await api.addSkill(skillData);
        
        if (response.status === 'success') {
            closeModal('skillModal');
            form.reset();
            await fetchProfile();
            showMessage('Skill added successfully');
        } else {
            throw new Error(response.message || 'Failed to add skill');
        }
    } catch (error) {
        console.error('Failed to add skill:', error);
        showMessage(error.message || 'Failed to add skill', true);
    } finally {
        hideLoading();
    }
}

// Update Social Links
async function updateSocialLinks() {
    const linkedinUrl = document.getElementById('linkedinUrl').value.trim();
    const githubUrl = document.getElementById('githubUrl').value.trim();
    const portfolioUrl = document.getElementById('portfolioUrl').value.trim();

    try {
        showLoading();
        const response = await api.updateSocialLinks({
            linkedin: linkedinUrl,
            github: githubUrl,
            portfolio: portfolioUrl
        });

        if (response.status === 'success') {
            showMessage('Social links updated successfully');
            await fetchProfile();
        } else {
            throw new Error(response.message || 'Failed to update social links');
        }
    } catch (error) {
        console.error('Failed to update social links:', error);
        showMessage(error.message || 'Failed to update social links', true);
    } finally {
        hideLoading();
    }
}

// Call initialize when the page loads
document.addEventListener('DOMContentLoaded', initializePage);