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
        this.initializeAboutForm();
        this.initializeCloseButton();
        this.loadArtworksList();
        this.loadEventsList();
        this.loadAboutText();
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

                // Refresh gallery when closing admin panel to show any changes
                if (window.MainApp) {
                    MainApp.loadGallery();
                    MainApp.loadFeaturedWorks();
                }
            });
        }
    },

    /**
     * ARTWORK MANAGEMENT
     */
    initializeArtworkForm() {
        const form = document.getElementById('artwork-form');
        const cancelBtn = document.getElementById('cancel-artwork');
        const imageInput = document.getElementById('artwork-image-file');
        const imagePreview = document.getElementById('image-preview');

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

        // Handle image file upload
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file, imagePreview);
                }
            });
        }
    },

    handleImageUpload(file, previewElement) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
            alert(lang === 'en' ? 'Please select an image file' : 'Vennligst velg en bildefil');
            return;
        }

        // Validate file size (max 5MB for localStorage limits)
        if (file.size > 5 * 1024 * 1024) {
            const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
            alert(lang === 'en' ? 'Image is too large. Maximum size is 5MB.' : 'Bildet er for stort. Maks størrelse er 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Show preview
            if (previewElement) {
                previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
            }

            // Store the base64 data directly
            this.pendingImageData = e.target.result;

            // Set the image field to indicate an image is ready
            document.getElementById('artwork-image').value = 'base64-data-uploaded';

            // Show success message to user
            const instruction = document.getElementById('upload-instruction');
            if (instruction) {
                const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
                instruction.textContent = lang === 'en'
                    ? '✓ Image ready to save'
                    : '✓ Bilde klar til lagring';
                instruction.style.color = '#4CAF50';
                instruction.style.fontWeight = '600';
            }
        };
        reader.readAsDataURL(file);
    },

    saveArtwork() {
        const id = document.getElementById('artwork-id').value;
        const imageValue = document.getElementById('artwork-image').value;

        // Use pending image data if available, otherwise keep existing/manual image
        let imageData = imageValue;
        if (this.pendingImageData) {
            imageData = this.pendingImageData;
        } else if (id) {
            // If editing and no new image, keep the existing image
            const existingArtwork = DataManager.getArtworkById(id);
            if (existingArtwork) {
                imageData = existingArtwork.image;
            }
        } else {
            // New artwork requires an image
            const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
            alert(lang === 'en' ? 'Please upload an image' : 'Vennligst last opp et bilde');
            return;
        }

        const artwork = {
            title: document.getElementById('artwork-title').value,
            titleEn: document.getElementById('artwork-title-en').value,
            year: document.getElementById('artwork-year').value ? parseInt(document.getElementById('artwork-year').value) : null,
            description: document.getElementById('artwork-description').value,
            descriptionEn: document.getElementById('artwork-description-en').value,
            image: imageData,
            featured: document.getElementById('artwork-featured').checked
        };

        if (id) {
            // Update existing
            DataManager.updateArtwork(id, artwork);
        } else {
            // Add new
            DataManager.addArtwork(artwork);
        }

        // Clear pending image data
        this.pendingImageData = null;

        // Increment version and trigger git push
        const newVersion = DataManager.incrementVersion();
        this.updateVersionDisplay();
        this.gitCommitAndPush(`Update artwork - v${newVersion}`);

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

        container.innerHTML = artworks.map(artwork => {
            // Format image path for display - shorten base64 data
            let displayPath = artwork.image;
            if (artwork.image.startsWith('data:')) {
                displayPath = '[Opplastet bilde]';
            }

            return `
                <div class="admin-item-with-image">
                    <div class="admin-item-thumbnail">
                        <img src="${artwork.image}" alt="${artwork.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Crect fill=\'%23ddd\' width=\'100\' height=\'100\'/%3E%3Ctext fill=\'%23999\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3ENo Image%3C/text%3E%3C/svg%3E'">
                    </div>
                    <div class="admin-item-content">
                        <div class="admin-item-info">
                            <h5>${artwork.title} ${artwork.titleEn ? `<span class="subtitle">/ ${artwork.titleEn}</span>` : ''}</h5>
                            <p class="artwork-meta">
                                <span class="year">${artwork.year || 'Ingen år'}</span>
                                ${artwork.featured ? '<span class="featured-badge">★ Fremhevet</span>' : ''}
                            </p>
                            <p class="artwork-path">${displayPath}</p>
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
                </div>
            `;
        }).join('');
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
        document.getElementById('artwork-image').value = artwork.image.startsWith('data:') ? 'base64-data-uploaded' : artwork.image;
        document.getElementById('artwork-featured').checked = artwork.featured || false;

        // Show existing image preview if it's base64 data
        if (artwork.image.startsWith('data:')) {
            const preview = document.getElementById('image-preview');
            if (preview) {
                preview.innerHTML = `<img src="${artwork.image}" alt="Current image" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
            }
            const instruction = document.getElementById('upload-instruction');
            if (instruction) {
                const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
                instruction.textContent = lang === 'en'
                    ? 'Current image (upload new to replace)'
                    : 'Nåværende bilde (last opp nytt for å erstatte)';
                instruction.style.color = '#666';
                instruction.style.fontWeight = 'normal';
            }
        }

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

            // Increment version and trigger git push
            const newVersion = DataManager.incrementVersion();
            this.updateVersionDisplay();
            this.gitCommitAndPush(`Delete artwork - v${newVersion}`);

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

        // Clear image preview
        const preview = document.getElementById('image-preview');
        if (preview) preview.innerHTML = '';

        // Clear upload instruction
        const instruction = document.getElementById('upload-instruction');
        if (instruction) instruction.textContent = '';

        // Clear pending image data
        this.pendingImageData = null;
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

        // Increment version and trigger git push
        const newVersion = DataManager.incrementVersion();
        this.updateVersionDisplay();
        this.gitCommitAndPush(`Update event - v${newVersion}`);

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

            // Increment version and trigger git push
            const newVersion = DataManager.incrementVersion();
            this.updateVersionDisplay();
            this.gitCommitAndPush(`Delete event - v${newVersion}`);

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
     * ABOUT TEXT MANAGEMENT
     */
    initializeAboutForm() {
        const form = document.getElementById('about-form');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAboutText();
            });
        }
    },

    loadAboutText() {
        const aboutText = DataManager.getAboutText();

        // Load into form if elements exist
        const noInput = document.getElementById('about-text-no-input');
        const enInput = document.getElementById('about-text-en-input');

        if (noInput) noInput.value = aboutText.no;
        if (enInput) enInput.value = aboutText.en;

        // Load into main page
        this.updateAboutDisplay();
    },

    updateAboutDisplay() {
        const aboutText = DataManager.getAboutText();

        const noElement = document.getElementById('about-text-no');
        const enElement = document.getElementById('about-text-en');

        if (noElement) noElement.innerHTML = aboutText.no;
        if (enElement) enElement.innerHTML = aboutText.en;
    },

    saveAboutText() {
        const noText = document.getElementById('about-text-no-input').value;
        const enText = document.getElementById('about-text-en-input').value;

        DataManager.updateAboutText('no', noText);
        DataManager.updateAboutText('en', enText);

        // Increment version and trigger git push
        const newVersion = DataManager.incrementVersion();
        this.updateVersionDisplay();
        this.gitCommitAndPush(`Update about text - v${newVersion}`);

        // Update display on main page
        this.updateAboutDisplay();

        // Show success notification
        const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
        const notificationText = lang === 'en'
            ? 'About text updated successfully!'
            : 'Om-tekst oppdatert!';

        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #8b7355; color: white; padding: 1rem 1.5rem; border-radius: 4px; z-index: 10000; box-shadow: 0 2px 10px rgba(0,0,0,0.2);';
        notification.textContent = notificationText;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    /**
     * UTILITY METHODS
     */
    getTranslation(no, en) {
        const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
        return lang === 'en' ? en : no;
    },

    updateVersionDisplay() {
        const versionSpan = document.getElementById('site-version');
        if (versionSpan) {
            versionSpan.textContent = DataManager.getSiteVersion();
        }
    },

    gitCommitAndPush(commitMessage) {
        // This function attempts to trigger a git commit and push
        // Note: This requires a backend service or GitHub Actions to work properly
        // For now, we'll store the pending commit info in localStorage

        const pendingCommits = JSON.parse(localStorage.getItem('pendingCommits') || '[]');
        pendingCommits.push({
            message: commitMessage,
            timestamp: new Date().toISOString(),
            version: DataManager.getSiteVersion()
        });
        localStorage.setItem('pendingCommits', JSON.stringify(pendingCommits));

        // Log to console for debugging
        console.log(`Git commit queued: ${commitMessage}`);

        // Show notification
        const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
        const notificationText = lang === 'en'
            ? `Changes saved! Version ${DataManager.getSiteVersion()}`
            : `Endringer lagret! Versjon ${DataManager.getSiteVersion()}`;

        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #8b7355; color: white; padding: 1rem 1.5rem; border-radius: 4px; z-index: 10000; box-shadow: 0 2px 10px rgba(0,0,0,0.2);';
        notification.textContent = notificationText;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Make AdminPanel available globally
window.AdminPanel = AdminPanel;
