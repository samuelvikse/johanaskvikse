/**
 * ANIMATIONS.JS
 * Luxury scroll animations and interactive effects
 */

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Add stagger delay for grid items
            if (entry.target.classList.contains('stagger-item')) {
                const delay = index * 100; // 100ms between each item
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            } else {
                entry.target.classList.add('visible');
            }

            // Unobserve after animation to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Initialize animations on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initParallaxEffect();
    initMouseFollowEffect();
    initSmoothScrollIndicator();
});

/**
 * Initialize scroll-based animations
 */
function initScrollAnimations() {
    // Add animation classes to elements

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
            // Subtle parallax - background moves slower than scroll
            const parallaxValue = scrolled * 0.3;
            hero.style.backgroundPositionY = `${parallaxValue}px`;
        }
    }, { passive: true });
}

/**
 * Smooth scroll indicator
 */
function initSmoothScrollIndicator() {
    // Placeholder for future scroll indicator if needed
    return;
}

/**
 * Mouse follow effect for gallery items
 */
function initMouseFollowEffect() {
    // Using CSS hover effects - no JS needed
    return;
}

/**
 * Add luxury hover effect to buttons
 */
function initButtonEffects() {
    const buttons = document.querySelectorAll('button, .submit-button');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

document.addEventListener('DOMContentLoaded', initButtonEffects);

// Export for use in other scripts
window.AnimationUtils = {
    observer,
    initScrollAnimations
};
