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
            this.size = Math.random() * 3 + 0.5;
            this.speedX = (Math.random() - 0.5) * 1;
            this.speedY = (Math.random() - 0.5) * 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.pulseSpeed = 0.02;
            this.pulse = Math.random() * Math.PI;
            this.glowSize = this.size * 3;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around screen edges
            if (this.x < 0) this.x = bgCanvas.width;
            if (this.x > bgCanvas.width) this.x = 0;
            if (this.y < 0) this.y = bgCanvas.height;
            if (this.y > bgCanvas.height) this.y = 0;

            this.pulse += this.pulseSpeed;
            this.currentSize = this.size * (1 + 0.3 * Math.sin(this.pulse));
            this.currentOpacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulse));
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
            // Get brand container dimensions
            const brandRect = document.querySelector('.brand-name').getBoundingClientRect();
            const containerRect = document.querySelector('.brand-container').getBoundingClientRect();
            
            // Calculate relative position within the canvas
            const relativeLeft = (brandRect.left - containerRect.left) / containerRect.width * brandCanvas.width;
            const relativeWidth = brandRect.width / containerRect.width * brandCanvas.width;
            const relativeHeight = brandRect.height / containerRect.height * brandCanvas.height;
            
            // Position particles within and around the text area
            const padding = 60; // Increased padding around the text area
            this.x = relativeLeft - padding + Math.random() * (relativeWidth + padding * 2);
            this.y = (brandCanvas.height - relativeHeight) / 2 - padding + Math.random() * (relativeHeight + padding * 2);
            
            this.originX = this.x;
            this.originY = this.y;
            this.size = Math.random() * 2.5 + 1;
            this.baseSpeed = Math.random() * 0.8 + 0.3;
            this.angle = Math.random() * Math.PI * 2;
            this.radius = Math.random() * 30 + 15;
            this.opacity = Math.random() * 0.6 + 0.3;
            
            this.pulse = Math.random() * Math.PI;
            this.pulseSpeed = 0.04;
            this.glowSize = this.size * 4;
        }

        update() {
            // Circular motion around origin point
            this.angle += this.baseSpeed * 0.02;
            this.x = this.originX + Math.cos(this.angle) * this.radius;
            this.y = this.originY + Math.sin(this.angle) * this.radius;
            
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

    // Increased number of particles
    const bgParticles = Array(200).fill().map(() => new BgParticle());
    const brandParticles = Array(120).fill().map(() => new BrandParticle());

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

                if (distance < 180) {
                    const opacity = 0.15 * (1 - distance/180) * 
                        (0.8 + 0.2 * Math.sin(particle.pulse + particle2.pulse));
                    bgCtx.beginPath();
                    bgCtx.strokeStyle = `rgba(0, 247, 255, ${opacity})`;
                    bgCtx.lineWidth = 0.8;
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

                if (distance < 70) {
                    const opacity = 0.25 * (1 - distance/70) * 
                        (0.8 + 0.2 * Math.sin(particle.pulse + particle2.pulse));
                    const lineWidth = 0.5 + 0.5 * (1 - distance/70);
                    
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