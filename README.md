# Johan Ask Vikse - Kunstnernettside

En moderne, premium nettside for billedkunstner Johan Ask Vikse fra Haugesund.

## 🎨 Funksjoner

- **Flerspråklig**: Norsk og engelsk (NO/EN toggle)
- **Galleri**: Dynamisk bildegalleri med lightbox-visning
- **Fremhevede verk**: Spesialvisning av utvalgte kunstverk
- **Arrangementer**: Oversikt over kommende og tidligere utstillinger
- **Kontaktskjema**: Enkel kontaktmulighet
- **Admin-panel**: Skjult administrasjonspanel for å legge til/redigere innhold
- **Responsiv design**: Fungerer perfekt på alle enheter

## 📁 Filstruktur

```
johanaskvikse-site/
├── index.html          # Hovedfil
├── css/
│   └── style.css       # All styling
├── js/
│   ├── data.js         # Datalagring og administrasjon
│   ├── main.js         # Hovedfunksjonalitet
│   └── admin.js        # Admin-panel
├── assets/
│   └── logo1.svg       # Logo
├── images/
│   └── JAV_bilde.jpg   # Hero-bilde
└── README.md           # Denne filen
```

## 🚀 Kom i gang

1. **Åpne nettsiden**
   - Dobbeltklikk på `index.html` eller
   - Bruk en lokal webserver (anbefalt)

2. **Lokalt med en webserver**
   ```bash
   # Med Python 3:
   python3 -m http.server 8000

   # Åpne deretter: http://localhost:8000
   ```

## 🔐 Admin-tilgang

1. **Åpne admin-panelet**:
   - Scroll til bunnen av siden
   - Klikk på det diskrete tannhjul-ikonet (⚙️) i footeren

2. **Logg inn**:
   - Standard passord: `vikse2024`
   - Passordet kan endres i `js/data.js` (linje 8)

3. **Administrer innhold**:
   - **Kunstverk**: Legg til, rediger eller slett kunstverket ditt
   - **Arrangementer**: Administrer kommende og tidligere utstillinger

## 💾 Datalagring

- All data lagres i **localStorage** i nettleseren
- Data bevares mellom besøk
- For å tilbakestille til standarddata: Tøm localStorage eller slett nettleserdata

## 🎨 Tilpasning

### Endre farger
Rediger CSS-variabler i `css/style.css` (linje 18-27):
```css
--color-primary: #1a1a1a;
--color-accent: #8b7355;
/* osv. */
```

### Legg til flere bilder
Legg bildene i `images/`-mappen og bruk admin-panelet for å legge dem til i galleriet.

### Endre admin-passord
Rediger `js/data.js`, linje 8:
```javascript
const ADMIN_PASSWORD = 'dittnyepassord';
```

## 🌐 Språk

Nettsiden støtter:
- **Norsk (NO)** - standard
- **Engelsk (EN)**

Språkbytting skjer automatisk for all dynamisk innhold. Statisk innhold bruker `data-no` og `data-en` attributter.

## 📱 Responsive breakpoints

- Desktop: 1024px+
- Tablet: 768px - 1024px
- Mobil: < 768px

## 🛠️ Teknologi

- **HTML5**: Semantisk markup
- **CSS3**: Modern styling med CSS Grid og Flexbox
- **Vanilla JavaScript**: Ingen eksterne avhengigheter
- **localStorage**: Lokal datalagring
- **Google Fonts**: Cormorant Garamond & Montserrat

## 📧 Kontaktskjema

Kontaktskjemaet er satt opp for frontend-validering. For å aktivere faktisk e-postutsending, integrer med:
- En backend-tjeneste (Node.js, PHP, etc.)
- En tredjepartstjeneste (FormSpree, EmailJS, etc.)

## 🎯 Neste steg for produksjon

1. **Hosting**: Last opp til en webhotell eller GitHub Pages
2. **Domene**: Knytt til www.johanvikse.com
3. **Backend**: Vurder å legge til en backend for:
   - Database i stedet for localStorage
   - Faktisk e-postutsending
   - Bildeopplasting
4. **SEO**: Optimaliser metadata og bildetekster
5. **Analytics**: Legg til Google Analytics eller tilsvarende

## 📄 Lisens

Laget spesielt for Johan Ask Vikse. Alle rettigheter til design og innhold tilhører kunstneren.

---

**Laget med Claude Code** 🤖
