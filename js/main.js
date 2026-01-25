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
document.addEventListener('DOMContentLoaded', async function() {
    initializeLanguage();
    initializeNavigation();
    initializeHamburgerMenu();
    initializeScrollHeader();
    
    // Initialize Firebase and load data
    await initializeFirebaseAndLoadData();
    
    initializeLightbox();
    initializeContactForm();
    initializeAdminToggle();
    setCurrentYear();
    setSiteVersion();
});

// Initialize Firebase and set up real-time listeners
async function initializeFirebaseAndLoadData() {
    // Wait for Firebase to initialize
    if (typeof FirebaseDataManager !== 'undefined') {
        await FirebaseDataManager.init();
        
        // Set up listener for real-time updates
        FirebaseDataManager.addListener((type) => {
            console.log('Data updated:', type);
            if (type === 'artworks') {
                loadFeaturedWorks();
                loadGallery();
            } else if (type === 'events') {
                loadEvents();
            } else if (type === 'aboutText') {
                loadAboutText();
            }
        });
    }
    
    // Load initial data
    await loadFeaturedWorks();
    await loadGallery();
    await loadEvents();
    await loadAboutText();
}

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
async function loadFeaturedWorks() {
    const container = document.getElementById('featured-works');
    if (!container) return;

    // Use Firebase if available, otherwise fall back to DataManager
    let featured;
    if (typeof FirebaseDataManager !== 'undefined' && FirebaseDataManager.isInitialized) {
        featured = await FirebaseDataManager.getFeaturedArtworks();
    } else {
        featured = DataManager.getFeaturedArtworks();
    }

    // On mobile (screen width <= 768px), show only 1 featured work
    const isMobile = window.innerWidth <= 768;
    if (isMobile && featured.length > 1) {
        featured = [featured[0]];
    }

    container.innerHTML = featured.map(artwork => {
        const title = currentLanguage === 'en' && artwork.titleEn ? artwork.titleEn : artwork.title;

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

async function loadGallery() {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    // Use Firebase if available, otherwise fall back to DataManager
    let artworks;
    if (typeof FirebaseDataManager !== 'undefined' && FirebaseDataManager.isInitialized) {
        artworks = await FirebaseDataManager.getArtworks();
    } else {
        artworks = DataManager.getArtworks();
    }
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

async function openLightbox(artworkId) {
    // Use Firebase if available, otherwise fall back to DataManager
    let artwork, artworks;
    if (typeof FirebaseDataManager !== 'undefined' && FirebaseDataManager.isInitialized) {
        artwork = await FirebaseDataManager.getArtworkById(artworkId);
        artworks = await FirebaseDataManager.getArtworks();
    } else {
        artwork = DataManager.getArtworkById(artworkId);
        artworks = DataManager.getArtworks();
    }
    if (!artwork) return;

    const lightbox = document.getElementById('lightbox');
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

async function navigateLightbox(direction) {
    // Use Firebase if available, otherwise fall back to DataManager
    let artworks;
    if (typeof FirebaseDataManager !== 'undefined' && FirebaseDataManager.isInitialized) {
        artworks = await FirebaseDataManager.getArtworks();
    } else {
        artworks = DataManager.getArtworks();
    }
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
async function loadEvents() {
    const upcomingContainer = document.getElementById('upcoming-events');
    if (!upcomingContainer) return;

    // Use Firebase if available, otherwise fall back to DataManager
    let upcomingEvents;
    if (typeof FirebaseDataManager !== 'undefined' && FirebaseDataManager.isInitialized) {
        upcomingEvents = await FirebaseDataManager.getUpcomingEvents();
    } else {
        upcomingEvents = DataManager.getUpcomingEvents();
    }

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
 * ABOUT TEXT LOADING
 */
async function loadAboutText() {
    // Use Firebase if available, otherwise fall back to DataManager
    let aboutText;
    if (typeof FirebaseDataManager !== 'undefined' && FirebaseDataManager.isInitialized) {
        aboutText = await FirebaseDataManager.getAboutText();
    } else {
        aboutText = DataManager.getAboutText();
    }

    const noElement = document.getElementById('about-text-no');
    const enElement = document.getElementById('about-text-en');

    if (noElement) noElement.innerHTML = aboutText.no;
    if (enElement) enElement.innerHTML = aboutText.en;
}

/**
 * CONTACT FORM
 */
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    const messageDiv = document.getElementById('form-message');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');

        // Disable button and show loading state
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.textContent = currentLanguage === 'en' ? 'Sending...' : 'Sender...';

        try {
            // Send email using Formspree
            const response = await fetch('https://formspree.io/f/meeolryz', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success message
                const successText = currentLanguage === 'en'
                    ? 'Thank you for your message! We will get back to you soon.'
                    : 'Takk for din henvendelse! Vi tar kontakt snart.';

                messageDiv.textContent = successText;
                messageDiv.className = 'form-message success';

                // Reset form
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Show error message
            const errorText = currentLanguage === 'en'
                ? 'Something went wrong. Please try again or contact us directly at johanaskvikse@hotmail.com'
                : 'Noe gikk galt. Vennligst prøv igjen eller kontakt oss direkte på johanaskvikse@hotmail.com';

            messageDiv.textContent = errorText;
            messageDiv.className = 'form-message error';
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = originalText;

            // Hide message after 8 seconds
            setTimeout(() => {
                messageDiv.className = 'form-message';
                messageDiv.textContent = '';
            }, 8000);
        }
    });
}

/**
 * ADMIN TOGGLE
 */
function initializeAdminToggle() {
    const adminToggle = document.getElementById('admin-toggle');
    const adminModal = document.getElementById('admin-login-modal');
    const closeBtn = adminModal.querySelector('.close');
    const logoutBtn = document.getElementById('admin-logout');

    // Set up auth state listener for session persistence
    if (typeof FirebaseAuth !== 'undefined') {
        FirebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                // User is logged in - show admin panel directly
                console.log('User already logged in:', user.email);
            }
        });
    }

    if (adminToggle) {
        adminToggle.addEventListener('click', function() {
            // Check if already logged in via Firebase
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isLoggedIn()) {
                // Already logged in, go directly to admin panel
                showAdminPanel();
            } else {
                adminModal.style.display = 'flex';
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            adminModal.style.display = 'none';
        });
    }

    // Handle logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            if (typeof FirebaseAuth !== 'undefined') {
                const result = await FirebaseAuth.signOut();
                if (result.success) {
                    document.getElementById('admin-panel').style.display = 'none';
                    document.body.style.overflow = '';
                    console.log('User logged out successfully');
                }
            }
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
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const errorDiv = document.getElementById('login-error');
            const submitButton = loginForm.querySelector('button[type="submit"]');

            // Disable button during login
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.textContent = currentLanguage === 'en' ? 'Logging in...' : 'Logger inn...';

            // Use Firebase Auth
            if (typeof FirebaseAuth !== 'undefined') {
                const result = await FirebaseAuth.signIn(email, password);

                if (result.success) {
                    adminModal.style.display = 'none';
                    showAdminPanel();
                    loginForm.reset();
                } else {
                    const errorText = currentLanguage === 'en' ? result.message.en : result.message.no;
                    errorDiv.textContent = errorText;
                    errorDiv.classList.add('show');

                    setTimeout(() => {
                        errorDiv.classList.remove('show');
                    }, 3000);
                }
            } else {
                // Fallback error if Firebase Auth not loaded
                errorDiv.textContent = currentLanguage === 'en' ? 'Authentication service unavailable' : 'Autentiseringstjeneste utilgjengelig';
                errorDiv.classList.add('show');
                setTimeout(() => {
                    errorDiv.classList.remove('show');
                }, 3000);
            }

            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
    }
}

// Helper function to show admin panel
function showAdminPanel() {
    document.getElementById('admin-panel').style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Refresh gallery to show any new artworks
    loadGallery();
    loadFeaturedWorks();

    // Initialize admin panel
    if (window.AdminPanel) {
        AdminPanel.init();
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

function setSiteVersion() {
    const versionSpan = document.getElementById('site-version');
    if (versionSpan) {
        versionSpan.textContent = DataManager.getSiteVersion();
    }
}

// Export for use in other scripts
window.MainApp = {
    loadGallery,
    loadFeaturedWorks,
    loadEvents,
    loadAboutText,
    currentLanguage: () => currentLanguage
};
