/**
 * MAIN.JS
 * Main functionality for the website including:
 * - Language toggle
 * - Navigation
 * - Gallery and lightbox
 * - Contact form
 * - Dynamic content loading
 */

// Global state
let currentLanguage = 'no';
let currentLightboxIndex = 0;
let currentGalleryItems = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    initializeNavigation();
    initializeHamburgerMenu();
    initializeScrollHeader();
    loadFeaturedWorks();
    loadGallery();
    loadEvents();
    initializeLightbox();
    initializeContactForm();
    initializeAdminToggle();
    setCurrentYear();
});

// Reload featured works on window resize to handle mobile/desktop switch
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        loadFeaturedWorks();
    }, 250);
});

/**
 * LANGUAGE FUNCTIONALITY
 */
function initializeLanguage() {
    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Update all elements with language attributes
    document.querySelectorAll('[data-no], [data-en]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text && !element.hasAttribute('data-no-content') && !element.hasAttribute('data-en-content')) {
            element.textContent = text;
        }
    });

    // Toggle content blocks
    document.querySelectorAll('[data-no-content]').forEach(el => {
        el.style.display = lang === 'no' ? 'block' : 'none';
    });

    document.querySelectorAll('[data-en-content]').forEach(el => {
        el.style.display = lang === 'en' ? 'block' : 'none';
    });

    // Reload dynamic content with new language
    loadFeaturedWorks();
    loadGallery();
    loadEvents();
}

/**
 * NAVIGATION
 */
function initializeNavigation() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

}

/**
 * SCROLL HEADER EFFECT
 */
function initializeScrollHeader() {
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;

        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * HAMBURGER MENU
 */
function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.main-nav');
    const overlay = document.querySelector('.nav-overlay');
    const navLinks = document.querySelectorAll('.main-nav a');

    if (!hamburger || !nav || !overlay) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function() {
        toggleMenu();
    });

    // Close menu on overlay click
    overlay.addEventListener('click', function() {
        closeMenu();
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMenu();
        }
    });

    function toggleMenu() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        overlay.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (nav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * GALLERY FUNCTIONALITY
 */
function loadFeaturedWorks() {
    const container = document.getElementById('featured-works');
    if (!container) return;

    let featured = DataManager.getFeaturedArtworks();

    // On mobile (screen width <= 768px), show only 1 featured work
    const isMobile = window.innerWidth <= 768;
    if (isMobile && featured.length > 1) {
        featured = [featured[0]];
    }

    container.innerHTML = featured.map(artwork => {
        const title = currentLanguage === 'en' && artwork.titleEn ? artwork.titleEn : artwork.title;
        const description = currentLanguage === 'en' && artwork.descriptionEn ? artwork.descriptionEn : artwork.description;

        return `
            <div class="featured-item" data-artwork-id="${artwork.id}">
                <img src="${artwork.image}" alt="${title}">
                <div class="featured-info">
                    <h3>${title}</h3>
                    <p>${artwork.year || ''}</p>
                </div>
            </div>
        `;
    }).join('');

    // Add click listeners
    container.querySelectorAll('.featured-item').forEach(item => {
        item.addEventListener('click', function() {
            const artworkId = this.getAttribute('data-artwork-id');
            openLightbox(artworkId);
        });
    });
}

function loadGallery() {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    const artworks = DataManager.getArtworks();
    currentGalleryItems = artworks;

    container.innerHTML = artworks.map(artwork => {
        const title = currentLanguage === 'en' && artwork.titleEn ? artwork.titleEn : artwork.title;

        return `
            <div class="gallery-item" data-artwork-id="${artwork.id}">
                <img src="${artwork.image}" alt="${title}">
            </div>
        `;
    }).join('');

    // Add click listeners
    container.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', function() {
            const artworkId = this.getAttribute('data-artwork-id');
            openLightbox(artworkId);
        });
    });
}

/**
 * LIGHTBOX FUNCTIONALITY
 */
function initializeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-nav.prev');
    const nextBtn = document.querySelector('.lightbox-nav.next');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateLightbox(-1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateLightbox(1));
    }

    // Close on outside click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

function openLightbox(artworkId) {
    const artwork = DataManager.getArtworkById(artworkId);
    if (!artwork) return;

    const lightbox = document.getElementById('lightbox');
    const artworks = DataManager.getArtworks();
    currentLightboxIndex = artworks.findIndex(a => a.id === parseInt(artworkId));

    updateLightboxContent(artwork);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    const artworks = DataManager.getArtworks();
    currentLightboxIndex = (currentLightboxIndex + direction + artworks.length) % artworks.length;
    updateLightboxContent(artworks[currentLightboxIndex]);
}

function updateLightboxContent(artwork) {
    const title = currentLanguage === 'en' && artwork.titleEn ? artwork.titleEn : artwork.title;
    const description = currentLanguage === 'en' && artwork.descriptionEn ? artwork.descriptionEn : artwork.description;

    document.getElementById('lightbox-image').src = artwork.image;
    document.getElementById('lightbox-image').alt = title;
    document.getElementById('lightbox-title').textContent = title;
    document.getElementById('lightbox-year').textContent = artwork.year || '';
    document.getElementById('lightbox-description').textContent = description || '';
}

/**
 * EVENTS FUNCTIONALITY
 */
function loadEvents() {
    const upcomingContainer = document.getElementById('upcoming-events');
    if (!upcomingContainer) return;

    const upcomingEvents = DataManager.getUpcomingEvents();

    if (upcomingEvents.length === 0) {
        const noEventsText = currentLanguage === 'en' ? 'No upcoming events at the moment.' : 'Ingen kommende events for øyeblikket.';
        upcomingContainer.innerHTML = `<p style="padding: 2rem; text-align: center; color: #666;">${noEventsText}</p>`;
    } else {
        upcomingContainer.innerHTML = upcomingEvents.map(event => {
            const title = currentLanguage === 'en' && event.titleEn ? event.titleEn : event.title;
            const description = currentLanguage === 'en' && event.descriptionEn ? event.descriptionEn : event.description;

            return `
                <div class="event-item">
                    <div class="event-date">${formatEventDate(event.date)}</div>
                    <div class="event-details">
                        <h4>${title}</h4>
                        <p class="event-location">${event.location}</p>
                        ${description ? `<p class="event-description">${description}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
}

function formatEventDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    if (currentLanguage === 'en') {
        return date.toLocaleDateString('en-US', options);
    } else {
        return date.toLocaleDateString('nb-NO', options);
    }
}

/**
 * CONTACT FORM
 */
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    const messageDiv = document.getElementById('form-message');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');

        // Disable button and show loading state
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.textContent = currentLanguage === 'en' ? 'Sending...' : 'Sender...';

        // Show success message (form submission temporarily disabled)
        setTimeout(() => {
            const successText = currentLanguage === 'en'
                ? 'Thank you for your message! Please contact us directly at johanaskvikse@hotmail.com'
                : 'Takk for din henvendelse! Vennligst kontakt oss direkte på johanaskvikse@hotmail.com';

            messageDiv.textContent = successText;
            messageDiv.className = 'form-message success';

            // Reset form
            form.reset();

            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = originalText;

            // Hide message after 8 seconds
            setTimeout(() => {
                messageDiv.className = 'form-message';
                messageDiv.textContent = '';
            }, 8000);
        }, 500);
    });
}

/**
 * ADMIN TOGGLE
 */
function initializeAdminToggle() {
    const adminToggle = document.getElementById('admin-toggle');
    const adminModal = document.getElementById('admin-login-modal');
    const closeBtn = adminModal.querySelector('.close');

    if (adminToggle) {
        adminToggle.addEventListener('click', function() {
            adminModal.style.display = 'flex';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            adminModal.style.display = 'none';
        });
    }

    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && adminModal.style.display === 'flex') {
            adminModal.style.display = 'none';
        }
    });

    // Handle admin login
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('admin-password').value;

            if (DataManager.checkPassword(password)) {
                adminModal.style.display = 'none';
                document.getElementById('admin-panel').style.display = 'block';
                document.body.style.overflow = 'hidden';

                // Initialize admin panel
                if (window.AdminPanel) {
                    AdminPanel.init();
                }
            } else {
                const errorDiv = document.getElementById('login-error');
                const errorText = currentLanguage === 'en' ? 'Incorrect password' : 'Feil passord';
                errorDiv.textContent = errorText;
                errorDiv.classList.add('show');

                setTimeout(() => {
                    errorDiv.classList.remove('show');
                }, 3000);
            }

            loginForm.reset();
        });
    }
}

/**
 * UTILITY FUNCTIONS
 */
function setCurrentYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Export for use in other scripts
window.MainApp = {
    loadGallery,
    loadFeaturedWorks,
    loadEvents,
    currentLanguage: () => currentLanguage
};
