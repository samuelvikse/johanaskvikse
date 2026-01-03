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
 * Parallax effect for hero image
 */
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image img');

    if (!hero || !heroImage) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;

        if (scrolled < heroHeight) {
            // Subtle parallax - image moves slower than scroll
            const parallaxValue = scrolled * 0.5;
            heroImage.style.transform = `translateY(${parallaxValue}px) scale(1.05)`;
        }
    }, { passive: true });
}

/**
 * Smooth scroll indicator (disabled)
 */
function initSmoothScrollIndicator() {
    // Disabled - scroll indicator removed per user request
    return;
}

/**
 * Mouse follow effect for gallery items (disabled for cleaner hover)
 */
function initMouseFollowEffect() {
    // Disabled - using simpler CSS hover effects instead
    return;
}

/**
 * Smooth reveal for images as they load
 */
function initImageReveal() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.6s ease';

        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        }
    });
}

/**
 * Navigation header animation on scroll
 */
function initHeaderAnimation() {
    const header = document.querySelector('.main-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.transform = 'translateY(0)';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }

        // Hide header on scroll down, show on scroll up
        if (currentScroll > lastScroll && currentScroll > 500) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // Add transition
    header.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
}

// Initialize header animation
document.addEventListener('DOMContentLoaded', initHeaderAnimation);

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
