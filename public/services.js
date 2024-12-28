document.addEventListener('DOMContentLoaded', () => {
    initializeModal();
    initializePricingCards();
});

function initializeModal() {
    // Close modal when clicking outside of it
    const modal = document.getElementById('comparisonModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function initializePricingCards() {
    const pricingButtons = document.querySelectorAll('.pricing-button');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent modal from opening when clicking the button
            const tier = button.closest('.pricing-card').querySelector('.pricing-tier').textContent;
            handlePricingSelection(tier);
        });
    });
}

function handlePricingSelection(tier) {
    // Add your pricing selection logic here
    console.log(`Selected tier: ${tier}`);
    // Example: Redirect to signup page with selected tier
    // window.location.href = `/signup?plan=${encodeURIComponent(tier)}`;
}

function closeModal() {
    document.getElementById('comparisonModal').classList.remove('active');
} 