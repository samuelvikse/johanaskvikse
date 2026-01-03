/**
 * ADMIN.JS
 * Admin panel functionality for managing artworks and events
 */

const AdminPanel = {
    currentEditingArtwork: null,
    currentEditingEvent: null,

    init() {
        this.initializeTabs();
        this.initializeArtworkForm();
        this.initializeEventForm();
        this.initializeCloseButton();
        this.loadArtworksList();
        this.loadEventsList();
    },

    /**
     * TAB FUNCTIONALITY
     */
    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');

                // Remove active class from all tabs
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked tab
                this.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    },

    /**
     * CLOSE BUTTON
     */
    initializeCloseButton() {
        const closeBtn = document.getElementById('admin-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('admin-panel').style.display = 'none';
                document.body.style.overflow = '';
            });
        }
    },

    /**
     * ARTWORK MANAGEMENT
     */
    initializeArtworkForm() {
        const form = document.getElementById('artwork-form');
        const cancelBtn = document.getElementById('cancel-artwork');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveArtwork();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetArtworkForm();
            });
        }
    },

    saveArtwork() {
        const id = document.getElementById('artwork-id').value;
        const artwork = {
            title: document.getElementById('artwork-title').value,
            titleEn: document.getElementById('artwork-title-en').value,
            year: document.getElementById('artwork-year').value ? parseInt(document.getElementById('artwork-year').value) : null,
            description: document.getElementById('artwork-description').value,
            descriptionEn: document.getElementById('artwork-description-en').value,
            image: document.getElementById('artwork-image').value,
            featured: document.getElementById('artwork-featured').checked
        };

        if (id) {
            // Update existing
            DataManager.updateArtwork(id, artwork);
        } else {
            // Add new
            DataManager.addArtwork(artwork);
        }

        this.resetArtworkForm();
        this.loadArtworksList();

        // Reload gallery on main page
        if (window.MainApp) {
            MainApp.loadGallery();
            MainApp.loadFeaturedWorks();
        }
    },

    loadArtworksList() {
        const container = document.getElementById('artworks-list');
        if (!container) return;

        const artworks = DataManager.getArtworks();

        if (artworks.length === 0) {
            container.innerHTML = '<p style="padding: 1rem; color: #666;">Ingen kunstverk ennå.</p>';
            return;
        }

        container.innerHTML = artworks.map(artwork => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <h5>${artwork.title} ${artwork.titleEn ? `/ ${artwork.titleEn}` : ''}</h5>
                    <p>${artwork.year || 'Ingen år'} ${artwork.featured ? '★ Fremhevet' : ''}</p>
                </div>
                <div class="admin-item-actions">
                    <button class="edit-btn" onclick="AdminPanel.editArtwork(${artwork.id})">
                        ${this.getTranslation('Rediger', 'Edit')}
                    </button>
                    <button class="delete-btn" onclick="AdminPanel.deleteArtwork(${artwork.id})">
                        ${this.getTranslation('Slett', 'Delete')}
                    </button>
                </div>
            </div>
        `).join('');
    },

    editArtwork(id) {
        const artwork = DataManager.getArtworkById(id);
        if (!artwork) return;

        document.getElementById('artwork-id').value = artwork.id;
        document.getElementById('artwork-title').value = artwork.title;
        document.getElementById('artwork-title-en').value = artwork.titleEn || '';
        document.getElementById('artwork-year').value = artwork.year || '';
        document.getElementById('artwork-description').value = artwork.description || '';
        document.getElementById('artwork-description-en').value = artwork.descriptionEn || '';
        document.getElementById('artwork-image').value = artwork.image;
        document.getElementById('artwork-featured').checked = artwork.featured || false;

        // Scroll to form
        document.getElementById('artwork-form').scrollIntoView({ behavior: 'smooth' });
    },

    deleteArtwork(id) {
        const confirmText = this.getTranslation(
            'Er du sikker på at du vil slette dette kunstverket?',
            'Are you sure you want to delete this artwork?'
        );

        if (confirm(confirmText)) {
            DataManager.deleteArtwork(id);
            this.loadArtworksList();

            // Reload gallery on main page
            if (window.MainApp) {
                MainApp.loadGallery();
                MainApp.loadFeaturedWorks();
            }
        }
    },

    resetArtworkForm() {
        document.getElementById('artwork-form').reset();
        document.getElementById('artwork-id').value = '';
    },

    /**
     * EVENT MANAGEMENT
     */
    initializeEventForm() {
        const form = document.getElementById('event-form');
        const cancelBtn = document.getElementById('cancel-event');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEvent();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetEventForm();
            });
        }
    },

    saveEvent() {
        const id = document.getElementById('event-id').value;
        const event = {
            title: document.getElementById('event-title').value,
            titleEn: document.getElementById('event-title-en').value,
            date: document.getElementById('event-date').value,
            location: document.getElementById('event-location').value,
            description: document.getElementById('event-description').value,
            descriptionEn: document.getElementById('event-description-en').value
        };

        if (id) {
            // Update existing
            DataManager.updateEvent(id, event);
        } else {
            // Add new
            DataManager.addEvent(event);
        }

        this.resetEventForm();
        this.loadEventsList();

        // Reload events on main page
        if (window.MainApp) {
            MainApp.loadEvents();
        }
    },

    loadEventsList() {
        const container = document.getElementById('events-list');
        if (!container) return;

        const events = DataManager.getUpcomingEvents();

        if (events.length === 0) {
            container.innerHTML = '<p style="padding: 1rem; color: #666;">Ingen kommende events.</p>';
            return;
        }

        container.innerHTML = events.map(event => {
            const formattedDate = new Date(event.date).toLocaleDateString('nb-NO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return `
                <div class="admin-item">
                    <div class="admin-item-info">
                        <h5>${event.title} ${event.titleEn ? `/ ${event.titleEn}` : ''}</h5>
                        <p>${formattedDate} - ${event.location}</p>
                    </div>
                    <div class="admin-item-actions">
                        <button class="edit-btn" onclick="AdminPanel.editEvent(${event.id})">
                            ${this.getTranslation('Rediger', 'Edit')}
                        </button>
                        <button class="delete-btn" onclick="AdminPanel.deleteEvent(${event.id})">
                            ${this.getTranslation('Slett', 'Delete')}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    editEvent(id) {
        const event = DataManager.getEventById(id);
        if (!event) return;

        document.getElementById('event-id').value = event.id;
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-title-en').value = event.titleEn || '';
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-location').value = event.location;
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-description-en').value = event.descriptionEn || '';

        // Scroll to form
        document.getElementById('event-form').scrollIntoView({ behavior: 'smooth' });
    },

    deleteEvent(id) {
        const confirmText = this.getTranslation(
            'Er du sikker på at du vil slette dette eventet?',
            'Are you sure you want to delete this event?'
        );

        if (confirm(confirmText)) {
            DataManager.deleteEvent(id);
            this.loadEventsList();

            // Reload events on main page
            if (window.MainApp) {
                MainApp.loadEvents();
            }
        }
    },

    resetEventForm() {
        document.getElementById('event-form').reset();
        document.getElementById('event-id').value = '';
    },

    /**
     * UTILITY METHODS
     */
    getTranslation(no, en) {
        const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
        return lang === 'en' ? en : no;
    }
};

// Make AdminPanel available globally
window.AdminPanel = AdminPanel;
