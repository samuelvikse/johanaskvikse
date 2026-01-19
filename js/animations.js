/**
 * ANIMATIONS.JS
 * Scroll animations and interactive effects
 */

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('stagger-item')) {
                const delay = index * 100;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            } else {
                entry.target.classList.add('visible');
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize animations on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initParallaxEffect();
});

/**
 * Initialize scroll-based animations
 */
function initScrollAnimations() {
    // Section titles
    document.querySelectorAll('.section-title').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // About text blocks
    document.querySelectorAll('.about-text').forEach(el => {
        el.classList.add('slide-in-left');
        observer.observe(el);
    });

    // Memberships
    document.querySelectorAll('.memberships').forEach(el => {
        el.classList.add('slide-in-right');
        observer.observe(el);
    });

    // Event items
    document.querySelectorAll('.event-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Contact sections
    document.querySelectorAll('.contact-info, .contact-form-wrapper').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Featured grid items with stagger
    document.querySelectorAll('.featured-item').forEach((el, index) => {
        el.classList.add('stagger-item');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    // Gallery grid items with stagger
    document.querySelectorAll('.gallery-item').forEach((el, index) => {
        el.classList.add('stagger-item');
        el.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(el);
    });
}

/**
 * Parallax effect for hero background
 */
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;

        if (scrolled < heroHeight) {
            const parallaxValue = scrolled * 0.3;
            hero.style.backgroundPositionY = `${parallaxValue}px`;
        }
    }, { passive: true });
}

// Export for use in other scripts
window.AnimationUtils = {
    observer,
    initScrollAnimations
};
