document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('signUpModal');
    const signUpBtn = document.getElementById('signUpBtn');
    const closeModal = document.querySelector('.close-modal');

    signUpBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
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
        const rect = container.getBoundingClientRect();
        brandCanvas.width = rect.width * 1.5;
        brandCanvas.height = rect.height * 1.5;
        brandCanvas.style.left = `-${(brandCanvas.width - rect.width) / 2}px`;
        brandCanvas.style.top = `-${(brandCanvas.height - rect.height) / 2}px`;
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
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = (Math.random() - 0.5) * 0.8;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.pulseSpeed = 0.02;
            this.pulse = Math.random() * Math.PI;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > bgCanvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > bgCanvas.height) this.speedY *= -1;

            this.pulse += this.pulseSpeed;
            this.currentOpacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulse));
        }

        draw() {
            bgCtx.beginPath();
            bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
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
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 150;
            const centerX = brandCanvas.width / 2;
            const centerY = brandCanvas.height / 2;
            
            this.x = centerX + Math.cos(angle) * distance;
            this.y = centerY + Math.sin(angle) * distance;
            this.size = Math.random() * 3 + 1;
            this.baseSize = this.size;
            
            // Orbital motion
            this.orbit = angle;
            this.orbitSpeed = (Math.random() * 0.002 + 0.001) * (Math.random() < 0.5 ? 1 : -1);
            this.orbitRadius = distance;
            this.orbitRadiusVariation = Math.random() * 20;
            this.orbitRadiusSpeed = Math.random() * 0.02;
            
            // Opacity and pulse
            this.opacity = Math.random() * 0.5 + 0.3;
            this.pulse = Math.random() * Math.PI;
            this.pulseSpeed = 0.03;

            // Trail effect
            this.trail = [];
            this.trailLength = Math.floor(Math.random() * 5) + 3;
        }

        update() {
            // Update orbital position with radius variation
            this.orbit += this.orbitSpeed;
            const radiusVariation = Math.sin(this.orbit * this.orbitRadiusSpeed) * this.orbitRadiusVariation;
            const currentRadius = this.orbitRadius + radiusVariation;
            
            // Store previous position for trail
            this.trail.unshift({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.pop();
            }
            
            // Update current position
            this.x = brandCanvas.width / 2 + Math.cos(this.orbit) * currentRadius;
            this.y = brandCanvas.height / 2 + Math.sin(this.orbit) * currentRadius;
            
            // Update pulse and size
            this.pulse += this.pulseSpeed;
            this.size = this.baseSize * (1 + 0.3 * Math.sin(this.pulse));
            this.currentOpacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulse));
        }

        draw() {
            // Draw trail
            this.trail.forEach((pos, index) => {
                const trailOpacity = (this.currentOpacity * (this.trailLength - index) / this.trailLength) * 0.5;
                brandCtx.beginPath();
                brandCtx.arc(pos.x, pos.y, this.size * 0.8, 0, Math.PI * 2);
                brandCtx.fillStyle = `rgba(0, 247, 255, ${trailOpacity})`;
                brandCtx.fill();
            });

            // Draw main particle
            brandCtx.beginPath();
            brandCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            brandCtx.fillStyle = `rgba(0, 247, 255, ${this.currentOpacity})`;
            brandCtx.fill();

            // Draw glow effect
            const gradient = brandCtx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 3
            );
            gradient.addColorStop(0, `rgba(0, 247, 255, ${this.currentOpacity * 0.3})`);
            gradient.addColorStop(1, 'rgba(0, 247, 255, 0)');
            brandCtx.fillStyle = gradient;
            brandCtx.beginPath();
            brandCtx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            brandCtx.fill();
        }
    }

    // Create particles
    const bgParticles = Array(100).fill().map(() => new BgParticle());
    const brandParticles = Array(80).fill().map(() => new BrandParticle());

    // Animation functions
    function animateBg() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        bgParticles.forEach((particle, i) => {
            particle.update();
            particle.draw();

            // Draw connections
            bgParticles.slice(i + 1).forEach(particle2 => {
                const dx = particle.x - particle2.x;
                const dy = particle.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = 0.15 * (1 - distance/150);
                    bgCtx.beginPath();
                    bgCtx.strokeStyle = `rgba(0, 247, 255, ${opacity})`;
                    bgCtx.lineWidth = 0.5;
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
        
        // Draw connecting lines first
        brandParticles.forEach((particle, i) => {
            brandParticles.slice(i + 1).forEach(particle2 => {
                const dx = particle.x - particle2.x;
                const dy = particle.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const opacity = 0.2 * (1 - distance/100);
                    brandCtx.beginPath();
                    brandCtx.strokeStyle = `rgba(0, 247, 255, ${opacity})`;
                    brandCtx.lineWidth = 0.8;
                    brandCtx.moveTo(particle.x, particle.y);
                    brandCtx.lineTo(particle2.x, particle2.y);
                    brandCtx.stroke();
                }
            });
        });

        // Then draw particles
        brandParticles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animateBrand);
    }

    // Start animations
    animateBg();
    animateBrand();
}); 