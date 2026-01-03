/**
 * DATA.JS
 * Handles all data storage and retrieval for artworks and events
 * Uses localStorage for persistence
 */

// Default admin password (can be changed)
const ADMIN_PASSWORD = 'vikse2024';

// Initialize default data
const defaultArtworks = [
    {
        id: 1,
        title: 'Kunstverk 1',
        titleEn: 'Artwork 1',
        year: 2024,
        description: 'Detaljert verk i tusj og blyant',
        descriptionEn: 'Detailed work in ink and pencil',
        image: 'images/1.png',
        featured: true
    },
    {
        id: 2,
        title: 'Kunstverk 2',
        titleEn: 'Artwork 2',
        year: 2024,
        description: 'Kunstnerisk uttrykk i tusj',
        descriptionEn: 'Artistic expression in ink',
        image: 'images/2.png',
        featured: true
    },
    {
        id: 3,
        title: 'Kunstverk 3',
        titleEn: 'Artwork 3',
        year: 2024,
        description: 'Visuelt verk',
        descriptionEn: 'Visual artwork',
        image: 'images/3.png',
        featured: true
    },
    {
        id: 4,
        title: 'Kunstverk 4',
        titleEn: 'Artwork 4',
        year: 2024,
        description: 'Detaljert illustrasjon',
        descriptionEn: 'Detailed illustration',
        image: 'images/4.png',
        featured: false
    },
    {
        id: 5,
        title: 'Kunstverk 5',
        titleEn: 'Artwork 5',
        year: 2024,
        description: 'Kunstnerisk komposisjon',
        descriptionEn: 'Artistic composition',
        image: 'images/5.png',
        featured: false
    },
    {
        id: 6,
        title: 'Kunstverk 6',
        titleEn: 'Artwork 6',
        year: 2023,
        description: 'Billedkunst i tusj',
        descriptionEn: 'Visual art in ink',
        image: 'images/6.png',
        featured: false
    },
    {
        id: 7,
        title: 'Kunstverk 7',
        titleEn: 'Artwork 7',
        year: 2023,
        description: 'Detaljert utførelse',
        descriptionEn: 'Detailed execution',
        image: 'images/7.png',
        featured: false
    },
    {
        id: 8,
        title: 'Kunstverk 8',
        titleEn: 'Artwork 8',
        year: 2023,
        description: 'Visuelt arbeid',
        descriptionEn: 'Visual work',
        image: 'images/8.png',
        featured: false
    },
    {
        id: 9,
        title: 'Kunstverk 9',
        titleEn: 'Artwork 9',
        year: 2023,
        description: 'Kunstnerisk verk',
        descriptionEn: 'Artistic piece',
        image: 'images/9.png',
        featured: false
    },
    {
        id: 10,
        title: 'Kunstverk 10',
        titleEn: 'Artwork 10',
        year: 2023,
        description: 'Billedkunst',
        descriptionEn: 'Visual art',
        image: 'images/10.png',
        featured: false
    },
    {
        id: 11,
        title: 'Kunstverk 11',
        titleEn: 'Artwork 11',
        year: 2023,
        description: 'Detaljert kunstarbeid',
        descriptionEn: 'Detailed artwork',
        image: 'images/11.png',
        featured: false
    },
    {
        id: 12,
        title: 'Kunstverk 12',
        titleEn: 'Artwork 12',
        year: 2024,
        description: 'Nytt verk',
        descriptionEn: 'New artwork',
        image: 'images/12.jpg',
        featured: false
    },
    {
        id: 13,
        title: 'Kunstverk 13',
        titleEn: 'Artwork 13',
        year: 2024,
        description: 'Nytt verk',
        descriptionEn: 'New artwork',
        image: 'images/13.jpg',
        featured: false
    },
    {
        id: 14,
        title: 'Kunstverk 14',
        titleEn: 'Artwork 14',
        year: 2024,
        description: 'Nytt verk',
        descriptionEn: 'New artwork',
        image: 'images/14.png',
        featured: false
    },
    {
        id: 15,
        title: 'Kunstverk 15',
        titleEn: 'Artwork 15',
        year: 2024,
        description: 'Nytt verk',
        descriptionEn: 'New artwork',
        image: 'images/15.png',
        featured: false
    },
    {
        id: 16,
        title: 'Kunstverk 16',
        titleEn: 'Artwork 16',
        year: 2024,
        description: 'Nytt verk',
        descriptionEn: 'New artwork',
        image: 'images/16.png',
        featured: false
    }
];

const defaultEvents = [
    {
        id: 1,
        title: 'Sommerutstilling 2024',
        titleEn: 'Summer Exhibition 2024',
        date: '2024-06-15',
        location: 'Haugesund Kunstforening',
        description: 'Nye verk i tusj og akryl',
        descriptionEn: 'New works in ink and acrylic'
    }
];

// Data Manager Object
const DataManager = {
    // Initialize data from localStorage or use defaults
    init() {
        if (!localStorage.getItem('artworks')) {
            this.saveArtworks(defaultArtworks);
        }
        if (!localStorage.getItem('events')) {
            this.saveEvents(defaultEvents);
        }
    },

    // Artworks methods
    getArtworks() {
        const data = localStorage.getItem('artworks');
        return data ? JSON.parse(data) : defaultArtworks;
    },

    getFeaturedArtworks() {
        return this.getArtworks().filter(art => art.featured);
    },

    getArtworkById(id) {
        return this.getArtworks().find(art => art.id === parseInt(id));
    },

    saveArtworks(artworks) {
        localStorage.setItem('artworks', JSON.stringify(artworks));
    },

    addArtwork(artwork) {
        const artworks = this.getArtworks();
        const newId = artworks.length > 0 ? Math.max(...artworks.map(a => a.id)) + 1 : 1;
        artwork.id = newId;
        artworks.push(artwork);
        this.saveArtworks(artworks);
        return artwork;
    },

    updateArtwork(id, updatedArtwork) {
        const artworks = this.getArtworks();
        const index = artworks.findIndex(art => art.id === parseInt(id));
        if (index !== -1) {
            artworks[index] = { ...artworks[index], ...updatedArtwork, id: parseInt(id) };
            this.saveArtworks(artworks);
            return artworks[index];
        }
        return null;
    },

    deleteArtwork(id) {
        const artworks = this.getArtworks();
        const filtered = artworks.filter(art => art.id !== parseInt(id));
        this.saveArtworks(filtered);
        return filtered;
    },

    // Events methods
    getEvents() {
        const data = localStorage.getItem('events');
        return data ? JSON.parse(data) : defaultEvents;
    },

    getUpcomingEvents() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.getEvents()
            .filter(event => new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    getPastEvents() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.getEvents()
            .filter(event => new Date(event.date) < today)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getEventById(id) {
        return this.getEvents().find(event => event.id === parseInt(id));
    },

    saveEvents(events) {
        localStorage.setItem('events', JSON.stringify(events));
    },

    addEvent(event) {
        const events = this.getEvents();
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        event.id = newId;
        events.push(event);
        this.saveEvents(events);
        return event;
    },

    updateEvent(id, updatedEvent) {
        const events = this.getEvents();
        const index = events.findIndex(event => event.id === parseInt(id));
        if (index !== -1) {
            events[index] = { ...events[index], ...updatedEvent, id: parseInt(id) };
            this.saveEvents(events);
            return events[index];
        }
        return null;
    },

    deleteEvent(id) {
        const events = this.getEvents();
        const filtered = events.filter(event => event.id !== parseInt(id));
        this.saveEvents(filtered);
        return filtered;
    },

    // Admin authentication
    checkPassword(password) {
        return password === ADMIN_PASSWORD;
    }
};

// Initialize data on load
DataManager.init();
