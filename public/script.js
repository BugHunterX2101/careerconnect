// Particle animation for background
function initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Create particle
    function Particle(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    // Update particle position
    Particle.prototype.update = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    
    // Draw particle
    Particle.prototype.draw = function() {
        ctx.fillStyle = `rgba(0, 247, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    
    // Initialize particles
    function init() {
        particles = [];
        const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
        
        for (let i = 0; i < numberOfParticles; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            particles.push(new Particle(x, y));
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    // Event listeners
    window.addEventListener('resize', () => {
        resizeCanvas();
        init();
    });
    
    // Start animation
    resizeCanvas();
    init();
    animate();
}

// Initialize particles on load
window.addEventListener('load', () => {
    initParticles('backgroundParticles');
    initParticles('brandParticles');
});

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    // Load user data
    loadUserData();
    loadNotificationSettings();

    // Form submissions
    document.getElementById('profileForm')?.addEventListener('submit', handleProfileSubmit);
    document.getElementById('accountForm')?.addEventListener('submit', handlePasswordUpdate);
});

// Load user data from localStorage or API
function loadUserData() {
    // Simulate loading user data - replace with actual API call
    const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        role: 'Software Developer'
    };

    // Update profile fields
    document.getElementById('fullName').value = userData.name;
    document.getElementById('email').value = userData.email;
    document.getElementById('phone').value = userData.phone;
    
    // Update header user info
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userRole').textContent = userData.role;
}

// Load notification settings from localStorage
function loadNotificationSettings() {
    const settings = JSON.parse(localStorage.getItem('notificationSettings')) || {
        emailNotifications: true,
        jobAlerts: true,
        applicationUpdates: true
    };

    document.getElementById('emailNotifications').checked = settings.emailNotifications;
    document.getElementById('jobAlerts').checked = settings.jobAlerts;
    document.getElementById('applicationUpdates').checked = settings.applicationUpdates;
}

// Handle profile form submission
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        // Simulate API call - replace with actual API endpoint
        await updateProfile(formData);
        showNotification('Profile updated successfully!', 'success');
    } catch (error) {
        showNotification('Failed to update profile. Please try again.', 'error');
    }
}

// Handle password update
async function handlePasswordUpdate(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match!', 'error');
        return;
    }

    try {
        // Simulate API call - replace with actual API endpoint
        await updatePassword(currentPassword, newPassword);
        showNotification('Password updated successfully!', 'success');
        e.target.reset();
    } catch (error) {
        showNotification('Failed to update password. Please try again.', 'error');
    }
}

// Save notification settings
function saveNotificationSettings() {
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        jobAlerts: document.getElementById('jobAlerts').checked,
        applicationUpdates: document.getElementById('applicationUpdates').checked
    };

    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    showNotification('Notification preferences saved!', 'success');
}

// Handle account deletion
function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        try {
            // Simulate API call - replace with actual API endpoint
            // await deleteUserAccount();
            showNotification('Account deleted successfully.', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            showNotification('Failed to delete account. Please try again.', 'error');
        }
    }
}

// Utility function to show notifications
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification styles if not already in document
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 5px;
                color: white;
                z-index: 1000;
                animation: slideIn 0.5s ease-out;
            }
            .notification.success {
                background-color: rgba(0, 247, 255, 0.9);
            }
            .notification.error {
                background-color: rgba(255, 0, 0, 0.9);
            }
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to document and remove after delay
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Placeholder API functions - replace with actual API calls
async function updateProfile(data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Profile updated:', data);
}

async function updatePassword(currentPassword, newPassword) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password updated');
} 