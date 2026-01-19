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
                previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; width: auto; height: auto; border-radius: 4px; display: block;">`;
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

        // Get form values with defaults for empty fields
        const titleValue = document.getElementById('artwork-title').value.trim();
        const titleEnValue = document.getElementById('artwork-title-en').value.trim();
        const yearValue = document.getElementById('artwork-year').value;
        const descValue = document.getElementById('artwork-description').value.trim();
        const descEnValue = document.getElementById('artwork-description-en').value.trim();

        // Generate default title if empty
        const artworks = DataManager.getArtworks();
        const nextNumber = artworks.length + 1;
        const defaultTitle = `Kunstverk ${nextNumber}`;
        const defaultTitleEn = `Artwork ${nextNumber}`;

        const artwork = {
            title: titleValue || defaultTitle,
            titleEn: titleEnValue || defaultTitleEn,
            year: yearValue ? parseInt(yearValue) : new Date().getFullYear(),
            description: descValue || 'Nytt verk',
            descriptionEn: descEnValue || 'New artwork',
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

        // Show premium success modal
        this.showSuccessModal('artwork', artwork);
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

        // Get values with defaults
        const titleValue = document.getElementById('event-title').value.trim();
        const dateValue = document.getElementById('event-date').value;
        const locationValue = document.getElementById('event-location').value.trim();

        // Require at least a date for events
        if (!dateValue) {
            const lang = window.MainApp ? MainApp.currentLanguage() : 'no';
            alert(lang === 'en' ? 'Please select a date' : 'Vennligst velg en dato');
            return;
        }

        const event = {
            title: titleValue || 'Nytt arrangement',
            titleEn: document.getElementById('event-title-en').value.trim() || 'New event',
            date: dateValue,
            location: locationValue || 'Haugesund',
            description: document.getElementById('event-description').value.trim() || '',
            descriptionEn: document.getElementById('event-description-en').value.trim() || ''
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

        // Show premium success modal
        this.showSuccessModal('event', event);
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
    },

    showSuccessModal(type, data) {
        const lang = window.MainApp ? MainApp.currentLanguage() : 'no';

        // Remove any existing modal
        const existingModal = document.getElementById('success-modal');
        if (existingModal) existingModal.remove();

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'success-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Determine content based on type
        let title, subtitle, imageHtml;

        if (type === 'artwork') {
            title = lang === 'en' ? 'Artwork Added!' : 'Kunstverk lagt til!';
            subtitle = data.title + (data.titleEn && data.titleEn !== data.title ? ` / ${data.titleEn}` : '');
            imageHtml = data.image ? `<img src="${data.image}" alt="${data.title}" style="max-width: 200px; max-height: 200px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.4); margin-bottom: 1.5rem;">` : '';
        } else if (type === 'event') {
            title = lang === 'en' ? 'Event Added!' : 'Arrangement lagt til!';
            subtitle = data.title;
            imageHtml = '<div style="font-size: 4rem; margin-bottom: 1rem;">📅</div>';
        }

        modal.innerHTML = `
            <div class="success-modal-content" style="
                background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
                border-radius: 24px;
                padding: 3rem;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201, 169, 98, 0.3);
                transform: scale(0.8) translateY(20px);
                transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #c9a962, #8b7355, #c9a962);
                "></div>

                <div class="success-checkmark" style="
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 1.5rem;
                    background: linear-gradient(145deg, #4CAF50, #45a049);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
                    animation: checkmarkPulse 0.6s ease;
                ">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                <h2 style="
                    color: #c9a962;
                    font-size: 1.8rem;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                ">${title}</h2>

                <p style="
                    color: #aaa;
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                ">${subtitle}</p>

                ${imageHtml}

                <div style="
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    justify-content: center;
                    margin-bottom: 2rem;
                ">
                    ${data.year ? `<span style="background: rgba(201, 169, 98, 0.2); color: #c9a962; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem;">${data.year}</span>` : ''}
                    ${data.featured ? `<span style="background: rgba(76, 175, 80, 0.2); color: #4CAF50; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem;">★ ${lang === 'en' ? 'Featured' : 'Fremhevet'}</span>` : ''}
                </div>

                <button id="success-modal-close" style="
                    background: linear-gradient(145deg, #c9a962, #a08b6d);
                    color: #1a1a1a;
                    border: none;
                    padding: 1rem 2.5rem;
                    border-radius: 30px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(201, 169, 98, 0.3);
                ">${lang === 'en' ? 'Continue' : 'Fortsett'}</button>

                <p style="
                    color: #666;
                    font-size: 0.8rem;
                    margin-top: 1.5rem;
                ">v${DataManager.getSiteVersion()}</p>
            </div>

            <style>
                @keyframes checkmarkPulse {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
                #success-modal-close:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(201, 169, 98, 0.4);
                }
            </style>
        `;

        document.body.appendChild(modal);

        // Trigger animation
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.success-modal-content').style.transform = 'scale(1) translateY(0)';
        });

        // Close button
        const closeBtn = document.getElementById('success-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            modal.querySelector('.success-modal-content').style.transform = 'scale(0.8) translateY(20px)';
            setTimeout(() => modal.remove(), 300);
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.getElementById('success-modal')) {
                closeBtn.click();
            }
        }, 5000);
    }
};

// Make AdminPanel available globally
window.AdminPanel = AdminPanel;
