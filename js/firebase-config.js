/**
 * FIREBASE-CONFIG.JS
 * Firebase configuration and initialization
 * 
 * OPPSETT-INSTRUKSJONER:
 * 1. Gå til https://console.firebase.google.com/
 * 2. Klikk "Create a project" eller "Opprett et prosjekt"
 * 3. Gi prosjektet et navn (f.eks. "johanaskvikse-galleri")
 * 4. Du kan slå av Google Analytics hvis du vil
 * 5. Når prosjektet er opprettet, klikk på web-ikonet (</>)
 * 6. Gi appen et navn (f.eks. "Johan Ask Vikse Nettside")
 * 7. Kopier firebaseConfig-verdiene og lim dem inn nedenfor
 * 8. Gå til "Build" -> "Firestore Database" i sidemenyen
 * 9. Klikk "Create database"
 * 10. Velg "Start in test mode" (du kan legge til sikkerhetsregler senere)
 * 11. Velg en lokasjon nær deg (f.eks. europe-west1)
 * 12. Gå til "Build" -> "Storage" for bildeopplasting
 * 13. Klikk "Get started" og velg "Start in test mode"
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBEb2fvxsImNdwEBCDZkLQrOGNnRbJDCpw",
    authDomain: "johanaskvikse-site.firebaseapp.com",
    projectId: "johanaskvikse-site",
    storageBucket: "johanaskvikse-site.firebasestorage.app",
    messagingSenderId: "879880799261",
    appId: "1:879880799261:web:1307864de7e5041b4532f4",
    measurementId: "G-SK8L9Y7409"
};

// Initialize Firebase (uten Storage - bruker base64 i Firestore)
let app, db;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized successfully (Firestore only)');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Firebase Data Manager - erstatter localStorage med Firebase
const FirebaseDataManager = {
    isInitialized: false,
    cachedArtworks: null,
    cachedEvents: null,
    cachedAboutText: null,
    listeners: [],

    // Initialize and set up real-time listeners
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Check if Firebase is configured
            if (firebaseConfig.apiKey === "DIN-API-KEY-HER") {
                console.warn('Firebase is not configured. Using localStorage as fallback.');
                this.isInitialized = false;
                return false;
            }

            // Set up real-time listener for artworks
            db.collection('artworks').orderBy('id', 'desc').onSnapshot((snapshot) => {
                this.cachedArtworks = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    firebaseId: doc.id
                }));
                this.notifyListeners('artworks');
            });

            // Set up real-time listener for events
            db.collection('events').onSnapshot((snapshot) => {
                this.cachedEvents = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    firebaseId: doc.id
                }));
                this.notifyListeners('events');
            });

            // Set up real-time listener for about text
            db.collection('settings').doc('aboutText').onSnapshot((doc) => {
                if (doc.exists) {
                    this.cachedAboutText = doc.data();
                    this.notifyListeners('aboutText');
                }
            });

            this.isInitialized = true;
            console.log('Firebase listeners set up successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            this.isInitialized = false;
            return false;
        }
    },

    // Add listener for data changes
    addListener(callback) {
        this.listeners.push(callback);
    },

    // Remove listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    },

    // Notify all listeners of data changes
    notifyListeners(type) {
        this.listeners.forEach(callback => callback(type));
    },

    // ==================== ARTWORKS ====================

    async getArtworks() {
        if (!this.isInitialized) {
            return DataManager.getArtworks();
        }

        if (this.cachedArtworks !== null) {
            return this.cachedArtworks;
        }

        try {
            const snapshot = await db.collection('artworks').orderBy('id', 'desc').get();
            this.cachedArtworks = snapshot.docs.map(doc => ({
                ...doc.data(),
                firebaseId: doc.id
            }));
            return this.cachedArtworks;
        } catch (error) {
            console.error('Error getting artworks:', error);
            return DataManager.getArtworks();
        }
    },

    async getFeaturedArtworks() {
        const artworks = await this.getArtworks();
        return artworks.filter(art => art.featured);
    },

    async getArtworkById(id) {
        const artworks = await this.getArtworks();
        return artworks.find(art => art.id === parseInt(id));
    },

    async addArtwork(artwork) {
        if (!this.isInitialized) {
            return DataManager.addArtwork(artwork);
        }

        try {
            // Get next ID
            const artworks = await this.getArtworks();
            const newId = artworks.length > 0 ? Math.max(...artworks.map(a => a.id)) + 1 : 1;
            artwork.id = newId;
            artwork.createdAt = firebase.firestore.FieldValue.serverTimestamp();

            // Bilder lagres som base64 direkte i Firestore
            await db.collection('artworks').add(artwork);
            return artwork;
        } catch (error) {
            console.error('Error adding artwork:', error);
            return DataManager.addArtwork(artwork);
        }
    },

    async updateArtwork(id, updatedArtwork) {
        if (!this.isInitialized) {
            return DataManager.updateArtwork(id, updatedArtwork);
        }

        try {
            const artworks = await this.getArtworks();
            const artwork = artworks.find(a => a.id === parseInt(id));
            
            if (!artwork || !artwork.firebaseId) {
                return DataManager.updateArtwork(id, updatedArtwork);
            }

            // Bilder lagres som base64 direkte i Firestore
            updatedArtwork.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await db.collection('artworks').doc(artwork.firebaseId).update({
                ...updatedArtwork,
                id: parseInt(id)
            });

            return { ...artwork, ...updatedArtwork };
        } catch (error) {
            console.error('Error updating artwork:', error);
            return DataManager.updateArtwork(id, updatedArtwork);
        }
    },

    async deleteArtwork(id) {
        if (!this.isInitialized) {
            return DataManager.deleteArtwork(id);
        }

        try {
            const artworks = await this.getArtworks();
            const artwork = artworks.find(a => a.id === parseInt(id));
            
            if (!artwork || !artwork.firebaseId) {
                return DataManager.deleteArtwork(id);
            }

            await db.collection('artworks').doc(artwork.firebaseId).delete();
            return artworks.filter(a => a.id !== parseInt(id));
        } catch (error) {
            console.error('Error deleting artwork:', error);
            return DataManager.deleteArtwork(id);
        }
    },

    // ==================== EVENTS ====================

    async getEvents() {
        if (!this.isInitialized) {
            return DataManager.getEvents();
        }

        if (this.cachedEvents !== null) {
            return this.cachedEvents;
        }

        try {
            const snapshot = await db.collection('events').get();
            this.cachedEvents = snapshot.docs.map(doc => ({
                ...doc.data(),
                firebaseId: doc.id
            }));
            return this.cachedEvents;
        } catch (error) {
            console.error('Error getting events:', error);
            return DataManager.getEvents();
        }
    },

    async getUpcomingEvents() {
        const events = await this.getEvents();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return events
            .filter(event => new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    async getPastEvents() {
        const events = await this.getEvents();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return events
            .filter(event => new Date(event.date) < today)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    async getEventById(id) {
        const events = await this.getEvents();
        return events.find(event => event.id === parseInt(id));
    },

    async addEvent(event) {
        if (!this.isInitialized) {
            return DataManager.addEvent(event);
        }

        try {
            const events = await this.getEvents();
            const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
            event.id = newId;
            event.createdAt = firebase.firestore.FieldValue.serverTimestamp();

            await db.collection('events').add(event);
            return event;
        } catch (error) {
            console.error('Error adding event:', error);
            return DataManager.addEvent(event);
        }
    },

    async updateEvent(id, updatedEvent) {
        if (!this.isInitialized) {
            return DataManager.updateEvent(id, updatedEvent);
        }

        try {
            const events = await this.getEvents();
            const event = events.find(e => e.id === parseInt(id));
            
            if (!event || !event.firebaseId) {
                return DataManager.updateEvent(id, updatedEvent);
            }

            await db.collection('events').doc(event.firebaseId).update({
                ...updatedEvent,
                id: parseInt(id)
            });

            return { ...event, ...updatedEvent };
        } catch (error) {
            console.error('Error updating event:', error);
            return DataManager.updateEvent(id, updatedEvent);
        }
    },

    async deleteEvent(id) {
        if (!this.isInitialized) {
            return DataManager.deleteEvent(id);
        }

        try {
            const events = await this.getEvents();
            const event = events.find(e => e.id === parseInt(id));
            
            if (!event || !event.firebaseId) {
                return DataManager.deleteEvent(id);
            }

            await db.collection('events').doc(event.firebaseId).delete();
            return events.filter(e => e.id !== parseInt(id));
        } catch (error) {
            console.error('Error deleting event:', error);
            return DataManager.deleteEvent(id);
        }
    },

    // ==================== ABOUT TEXT ====================

    async getAboutText() {
        if (!this.isInitialized) {
            return DataManager.getAboutText();
        }

        if (this.cachedAboutText !== null) {
            return this.cachedAboutText;
        }

        try {
            const doc = await db.collection('settings').doc('aboutText').get();
            if (doc.exists) {
                this.cachedAboutText = doc.data();
                return this.cachedAboutText;
            }
            return DataManager.getAboutText();
        } catch (error) {
            console.error('Error getting about text:', error);
            return DataManager.getAboutText();
        }
    },

    async updateAboutText(language, text) {
        if (!this.isInitialized) {
            return DataManager.updateAboutText(language, text);
        }

        try {
            const aboutText = await this.getAboutText();
            aboutText[language] = text;

            await db.collection('settings').doc('aboutText').set(aboutText, { merge: true });
            return aboutText;
        } catch (error) {
            console.error('Error updating about text:', error);
            return DataManager.updateAboutText(language, text);
        }
    },

    // ==================== MIGRATION ====================

    // Migrate existing localStorage data to Firebase
    async migrateFromLocalStorage() {
        if (!this.isInitialized) {
            console.warn('Firebase not initialized, cannot migrate');
            return false;
        }

        try {
            // Check if already migrated
            const migrationDoc = await db.collection('settings').doc('migration').get();
            if (migrationDoc.exists && migrationDoc.data().completed) {
                console.log('Migration already completed');
                return true;
            }

            console.log('Starting migration from localStorage to Firebase...');

            // Migrate artworks
            const localArtworks = DataManager.getArtworks();
            for (const artwork of localArtworks) {
                // Check if artwork already exists in Firebase
                const existing = await db.collection('artworks')
                    .where('id', '==', artwork.id)
                    .get();
                
                if (existing.empty) {
                    await db.collection('artworks').add({
                        ...artwork,
                        migratedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log(`Migrated artwork ${artwork.id}`);
                }
            }

            // Migrate events
            const localEvents = DataManager.getEvents();
            for (const event of localEvents) {
                const existing = await db.collection('events')
                    .where('id', '==', event.id)
                    .get();
                
                if (existing.empty) {
                    await db.collection('events').add({
                        ...event,
                        migratedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log(`Migrated event ${event.id}`);
                }
            }

            // Migrate about text
            const localAboutText = DataManager.getAboutText();
            await db.collection('settings').doc('aboutText').set({
                ...localAboutText,
                migratedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Mark migration as complete
            await db.collection('settings').doc('migration').set({
                completed: true,
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('Migration completed successfully!');
            return true;
        } catch (error) {
            console.error('Migration error:', error);
            return false;
        }
    },

    // Reset and reload all default artworks to Firebase
    async resetToDefaultArtworks() {
        if (!this.isInitialized) {
            console.warn('Firebase not initialized');
            return false;
        }

        try {
            console.log('Resetting to default artworks...');

            // Delete all existing artworks in Firebase
            const existingArtworks = await db.collection('artworks').get();
            const deletePromises = existingArtworks.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);
            console.log('Deleted existing artworks from Firebase');

            // Add all default artworks from data.js
            for (const artwork of defaultArtworks) {
                await db.collection('artworks').add({
                    ...artwork,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log(`Added artwork ${artwork.id}: ${artwork.title}`);
            }

            // Reset migration flag
            await db.collection('settings').doc('migration').set({
                completed: true,
                resetAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('All 16 default artworks restored!');
            return true;
        } catch (error) {
            console.error('Reset error:', error);
            return false;
        }
    },

    // ==================== UTILITY ====================

    checkPassword(password) {
        return DataManager.checkPassword(password);
    },

    getSiteVersion() {
        return DataManager.getSiteVersion();
    },

    setSiteVersion(version) {
        return DataManager.setSiteVersion(version);
    },

    incrementVersion() {
        return DataManager.incrementVersion();
    }
};

// Initialize Firebase when script loads
FirebaseDataManager.init();
