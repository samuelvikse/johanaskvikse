# Oppsett av Kontaktskjema med Formspree

Kontaktskjemaet er nå konfigurert til å sende e-post via Formspree. Følg disse stegene for å aktivere det:

## Steg 1: Opprett Formspree-konto

1. Gå til [https://formspree.io/](https://formspree.io/)
2. Klikk på "Get Started" eller "Sign Up"
3. Opprett en gratis konto med e-postadressen: **johanaskvikse@hotmail.com**

## Steg 2: Opprett et nytt skjema

1. Når du er logget inn, klikk på "+ New Form"
2. Gi skjemaet et navn, f.eks. "Johan Ask Vikse Kontaktskjema"
3. Formspree vil generere en unik Form ID (ser ut som: `xyzabc123`)

## Steg 3: Kopier Form ID

1. Når skjemaet er opprettet, finn Form ID (vises øverst på siden)
2. Det ser ut som: `https://formspree.io/f/xyzabc123`
3. Kopier ID-en (alt etter `/f/`)

## Steg 4: Oppdater koden

Åpne filen `js/main.js` og finn denne linjen (linje 382):

```javascript
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
```

Bytt ut `YOUR_FORM_ID` med din faktiske Form ID fra Formspree:

```javascript
const response = await fetch('https://formspree.io/f/xyzabc123', {
```

## Steg 5: Test skjemaet

1. Åpne nettsiden i en nettleser
2. Fyll ut kontaktskjemaet
3. Send en testmelding
4. Sjekk e-posten **johanaskvikse@hotmail.com** for å bekrefte at meldingen kom fram

## Alternativ løsning (uten Formspree)

Hvis du ikke vil bruke Formspree, kan du bruke en enkel mailto-link i stedet. Dette åpner brukerens e-postklient:

I `index.html`, endre skjemaet til:

```html
<form id="contact-form" class="contact-form" action="mailto:johanaskvikse@hotmail.com" method="get" enctype="text/plain">
```

**Merk:** Mailto-metoden er mindre pålitelig da den krever at brukeren har en e-postklient installert.

## Funksjonalitet

Når kontaktskjemaet er satt opp, vil det:

- ✅ Sende meldinger til **johanaskvikse@hotmail.com**
- ✅ Vise "Sender..." mens meldingen sendes
- ✅ Vise suksessmelding når meldingen er sendt
- ✅ Vise feilmelding hvis noe går galt
- ✅ Inkludere e-postadressen i feilmeldingen slik at brukeren kan kontakte direkte
- ✅ Automatisk tømme skjemaet etter vellykket innsending
- ✅ Fungere på både norsk og engelsk

## Formspree fordeler

- ✅ Gratis for opptil 50 innsendinger per måned
- ✅ Spam-beskyttelse
- ✅ E-postvarsler
- ✅ Ingen server nødvendig
- ✅ Fungerer med statiske nettsider
