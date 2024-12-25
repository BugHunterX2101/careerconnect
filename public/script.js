document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('signUpModal');
    const signUpBtn = document.getElementById('signUpBtn');
    const closeModal = document.querySelector('.close-modal');

    signUpBtn?.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeModal?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Add particle animation around CareerConnect
document.addEventListener('DOMContentLoaded', function() {
    // Background Particles
    const bgCanvas = document.getElementById('backgroundParticles');
    const bgCtx = bgCanvas.getContext('2d');
    
    // Brand Particles
    const brandCanvas = document.getElementById('brandParticles');
    const brandCtx = brandCanvas.getContext('2d');

    // Resize functions
    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    function resizeBrandCanvas() {
        const container = document.querySelector('.brand-container');
        brandCanvas.width = container.offsetWidth;
        brandCanvas.height = container.offsetHeight;
    }

    resizeBgCanvas();
    resizeBrandCanvas();
    window.addEventListener('resize', () => {
        resizeBgCanvas();
        resizeBrandCanvas();
    });

    // Background Particle class
    class BgParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * bgCanvas.width;
            this.y = Math.random() * bgCanvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = (Math.random() - 0.5) * 0.8;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.pulseSpeed = 0.02;
            this.pulse = Math.random() * Math.PI;
            this.glowSize = this.size * 3;
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = (Math.random() - 0.5) * 0.02;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            // Add slight circular motion to create more natural movement
            this.angle += this.angleSpeed;
            this.x += this.speedX + Math.cos(this.angle) * this.radius * 0.1;
            this.y += this.speedY + Math.sin(this.angle) * this.radius * 0.1;

            // Wrap around screen edges with smooth transition
            if (this.x < -50) this.x = bgCanvas.width + 50;
            if (this.x > bgCanvas.width + 50) this.x = -50;
            if (this.y < -50) this.y = bgCanvas.height + 50;
            if (this.y > bgCanvas.height + 50) this.y = -50;

            // Pulse effect
            this.pulse += this.pulseSpeed;
            this.currentSize = this.size * (1 + 0.3 * Math.sin(this.pulse));
            this.currentOpacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulse));

            // Randomly change direction slightly
            if (Math.random() < 0.01) {
                this.speedX += (Math.random() - 0.5) * 0.1;
                this.speedY += (Math.random() - 0.5) * 0.1;
                
                // Limit maximum speed
                const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
                if (speed > 1) {
                    this.speedX = (this.speedX / speed) * 1;
                    this.speedY = (this.speedY / speed) * 1;
                }
            }
        }

        draw() {
            // Draw glow effect
            bgCtx.beginPath();
            const gradient = bgCtx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.glowSize
            );
            gradient.addColorStop(0, `rgba(0, 247, 255, ${this.currentOpacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(0, 247, 255, 0)');
            bgCtx.fillStyle = gradient;
            bgCtx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
            bgCtx.fill();

            // Draw particle
            bgCtx.beginPath();
            bgCtx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
            bgCtx.fillStyle = `rgba(0, 247, 255, ${this.currentOpacity})`;
            bgCtx.fill();
        }
    }

    // Brand Particle class with enhanced effects
    class BrandParticle {
        constructor() {
            this.reset();
        }

        reset() {
            // Get brand container dimensions for reference
            const brandRect = document.querySelector('.brand-name').getBoundingClientRect();
            const containerRect = document.querySelector('.brand-container').getBoundingClientRect();
            
            // Calculate the center point
            const centerX = brandCanvas.width / 2;
            const centerY = brandCanvas.height / 2;
            
            // Position particles in a circular area around the center
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (brandCanvas.width * 0.4); // Adjust spread
            
            this.x = centerX + Math.cos(angle) * radius;
            this.y = centerY + Math.sin(angle) * radius;
            
            this.originX = this.x;
            this.originY = this.y;
            this.size = Math.random() * 2.5 + 1;
            this.baseSpeed = Math.random() * 0.8 + 0.3;
            this.angle = Math.random() * Math.PI * 2;
            this.orbitRadius = Math.random() * 40 + 20; // Orbit radius
            this.orbitSpeed = (Math.random() * 0.5 + 0.5) * (Math.random() < 0.5 ? 1 : -1); // Random direction
            this.opacity = Math.random() * 0.6 + 0.3;
            
            this.pulse = Math.random() * Math.PI;
            this.pulseSpeed = 0.04;
            this.glowSize = this.size * 4;
        }

        update() {
            // Orbital motion
            this.angle += this.orbitSpeed * 0.02;
            this.x = this.originX + Math.cos(this.angle) * this.orbitRadius;
            this.y = this.originY + Math.sin(this.angle) * this.orbitRadius;
            
            // Gradually move origin point
            const centerX = brandCanvas.width / 2;
            const centerY = brandCanvas.height / 2;
            const dx = centerX - this.originX;
            const dy = centerY - this.originY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > brandCanvas.width * 0.4) {
                // If too far from center, gradually move back
                this.originX += dx * 0.01;
                this.originY += dy * 0.01;
            } else {
                // Random drift
                this.originX += (Math.random() - 0.5) * 0.5;
                this.originY += (Math.random() - 0.5) * 0.5;
            }
            
            // Pulse effect
            this.pulse += this.pulseSpeed;
            this.currentSize = this.size * (1 + 0.4 * Math.sin(this.pulse));
            this.currentOpacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulse));
        }

        draw() {
            // Draw glow effect
            brandCtx.beginPath();
            const gradient = brandCtx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.glowSize
            );
            gradient.addColorStop(0, `rgba(0, 247, 255, ${this.currentOpacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(0, 247, 255, 0)');
            brandCtx.fillStyle = gradient;
            brandCtx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
            brandCtx.fill();

            // Draw particle
            brandCtx.beginPath();
            brandCtx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
            brandCtx.fillStyle = `rgba(0, 247, 255, ${this.currentOpacity})`;
            brandCtx.fill();
        }
    }

    // Increased number of particles for better coverage
    const bgParticles = Array(150).fill().map(() => new BgParticle());
    const brandParticles = Array(80).fill().map(() => new BrandParticle());

    function animateBg() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        bgParticles.forEach((particle, i) => {
            particle.update();
            particle.draw();

            // Enhanced connections with dynamic opacity
            bgParticles.slice(i + 1).forEach(particle2 => {
                const dx = particle.x - particle2.x;
                const dy = particle.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) { // Reduced connection distance
                    const opacity = 0.12 * (1 - distance/150) * 
                        (0.8 + 0.2 * Math.sin(particle.pulse + particle2.pulse));
                    bgCtx.beginPath();
                    bgCtx.strokeStyle = `rgba(0, 247, 255, ${opacity})`;
                    bgCtx.lineWidth = 0.6;
                    bgCtx.moveTo(particle.x, particle.y);
                    bgCtx.lineTo(particle2.x, particle2.y);
                    bgCtx.stroke();
                }
            });
        });

        requestAnimationFrame(animateBg);
    }

    function animateBrand() {
        brandCtx.clearRect(0, 0, brandCanvas.width, brandCanvas.height);
        
        brandParticles.forEach((particle, i) => {
            particle.update();
            particle.draw();

            // Enhanced connections with dynamic width and opacity
            for (let j = i + 1; j < brandParticles.length; j++) {
                const particle2 = brandParticles[j];
                const dx = particle2.x - particle.x;
                const dy = particle2.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) { // Increased connection distance for brand particles
                    const opacity = 0.2 * (1 - distance/100) * 
                        (0.8 + 0.2 * Math.sin(particle.pulse + particle2.pulse));
                    const lineWidth = 0.4 + 0.4 * (1 - distance/100);
                    
                    brandCtx.beginPath();
                    brandCtx.strokeStyle = `rgba(0, 247, 255, ${opacity})`;
                    brandCtx.lineWidth = lineWidth;
                    brandCtx.moveTo(particle.x, particle.y);
                    brandCtx.lineTo(particle2.x, particle2.y);
                    brandCtx.stroke();
                }
            }
        });

        requestAnimationFrame(animateBrand);
    }

    animateBg();
    animateBrand();
}); 