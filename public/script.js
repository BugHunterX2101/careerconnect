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
        brandCanvas.width = rect.width * 3;
        brandCanvas.height = rect.height * 3;
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
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.3 + 0.1;
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
            const distance = 50 + Math.random() * 200;
            const centerX = brandCanvas.width / 2;
            const centerY = brandCanvas.height / 2;
            
            this.x = centerX + Math.cos(angle) * distance;
            this.y = centerY + Math.sin(angle) * distance;
            this.size = Math.random() * 2 + 0.8;
            this.baseSize = this.size;
            
            // Orbital motion
            this.orbit = angle;
            this.orbitSpeed = (Math.random() * 0.001 + 0.0005) * (Math.random() < 0.5 ? 1 : -1);
            this.orbitRadius = distance;
            this.orbitRadiusVariation = Math.random() * 20;
            this.orbitRadiusSpeed = Math.random() * 0.015;
            
            // Opacity and pulse
            this.opacity = Math.random() * 0.4 + 0.2;
            this.pulse = Math.random() * Math.PI;
            this.pulseSpeed = 0.02;

            // Trail effect
            this.trail = [];
            this.trailLength = Math.floor(Math.random() * 6) + 4;
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
            this.size = this.baseSize * (1 + 0.2 * Math.sin(this.pulse));
            this.currentOpacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulse));
        }

        draw() {
            // Draw trail with gradient
            this.trail.forEach((pos, index) => {
                const trailOpacity = (this.currentOpacity * (this.trailLength - index) / this.trailLength) * 0.3;
                const gradient = brandCtx.createRadialGradient(
                    pos.x, pos.y, 0,
                    pos.x, pos.y, this.size * 2
                );
                gradient.addColorStop(0, `rgba(0, 247, 255, ${trailOpacity})`);
                gradient.addColorStop(1, 'rgba(0, 247, 255, 0)');
                
                brandCtx.beginPath();
                brandCtx.fillStyle = gradient;
                brandCtx.arc(pos.x, pos.y, this.size * 2, 0, Math.PI * 2);
                brandCtx.fill();
            });

            // Draw main particle with enhanced glow
            const mainGradient = brandCtx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 4
            );
            mainGradient.addColorStop(0, `rgba(0, 247, 255, ${this.currentOpacity})`);
            mainGradient.addColorStop(0.5, `rgba(0, 247, 255, ${this.currentOpacity * 0.3})`);
            mainGradient.addColorStop(1, 'rgba(0, 247, 255, 0)');
            
            brandCtx.beginPath();
            brandCtx.fillStyle = mainGradient;
            brandCtx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
            brandCtx.fill();
        }
    }

    // Create particles
    const bgParticles = Array(200).fill().map(() => new BgParticle());
    const brandParticles = Array(150).fill().map(() => new BrandParticle());

    // Animation functions
    function animateBg() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        bgParticles.forEach((particle, i) => {
            particle.update();
            particle.draw();

            // Draw connections with gradient
            bgParticles.slice(i + 1).forEach(particle2 => {
                const dx = particle.x - particle2.x;
                const dy = particle.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const opacity = 0.08 * (1 - distance/100);
                    const gradient = bgCtx.createLinearGradient(
                        particle.x, particle.y,
                        particle2.x, particle2.y
                    );
                    gradient.addColorStop(0, `rgba(0, 247, 255, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(0, 247, 255, ${opacity * 1.5})`);
                    gradient.addColorStop(1, `rgba(0, 247, 255, ${opacity})`);
                    
                    bgCtx.beginPath();
                    bgCtx.strokeStyle = gradient;
                    bgCtx.lineWidth = 0.2;
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
        
        // Draw connecting lines with gradient
        brandParticles.forEach((particle, i) => {
            brandParticles.slice(i + 1).forEach(particle2 => {
                const dx = particle.x - particle2.x;
                const dy = particle.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const opacity = 0.12 * (1 - distance/100);
                    const gradient = brandCtx.createLinearGradient(
                        particle.x, particle.y,
                        particle2.x, particle2.y
                    );
                    gradient.addColorStop(0, `rgba(0, 247, 255, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(0, 247, 255, ${opacity * 1.5})`);
                    gradient.addColorStop(1, `rgba(0, 247, 255, ${opacity})`);
                    
                    brandCtx.beginPath();
                    brandCtx.strokeStyle = gradient;
                    brandCtx.lineWidth = 0.4;
                    brandCtx.moveTo(particle.x, particle.y);
                    brandCtx.lineTo(particle2.x, particle2.y);
                    brandCtx.stroke();
                }
            });
        });

        // Draw particles with enhanced effects
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