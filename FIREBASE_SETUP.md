# Firebase Oppsett for Johan Ask Vikse Nettside

Denne guiden forklarer hvordan du setter opp Firebase for å lagre galleri-data i skyen slik at alle besøkende ser de samme bildene.

## Trinn 1: Opprett Firebase-prosjekt

1. Gå til [Firebase Console](https://console.firebase.google.com/)
2. Logg inn med Google-kontoen din
3. Klikk **"Create a project"** eller **"Opprett et prosjekt"**
4. Gi prosjektet et navn, f.eks. `johanaskvikse-galleri`
5. Du kan slå av Google Analytics (valgfritt)
6. Klikk **"Create project"**

## Trinn 2: Legg til web-app

1. Når prosjektet er opprettet, klikk på **web-ikonet** `</>` på prosjekt-dashboardet
2. Gi appen et navn, f.eks. `Johan Ask Vikse Nettside`
3. **IKKE** kryss av for Firebase Hosting (vi bruker GitHub Pages)
4. Klikk **"Register app"**
5. Du vil se en konfigurasjon som dette:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "johanaskvikse-galleri.firebaseapp.com",
    projectId: "johanaskvikse-galleri",
    storageBucket: "johanaskvikse-galleri.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

6. **KOPIER DISSE VERDIENE** - du trenger dem i neste steg

## Trinn 3: Oppdater konfigurasjonen

1. Åpne filen `js/firebase-config.js` i prosjektet
2. Finn denne seksjonen nær toppen av filen:

```javascript
const firebaseConfig = {
    apiKey: "DIN-API-KEY-HER",
    authDomain: "ditt-prosjekt.firebaseapp.com",
    projectId: "ditt-prosjekt-id",
    storageBucket: "ditt-prosjekt.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

3. **Erstatt verdiene** med de du kopierte fra Firebase Console
4. Lagre filen

## Trinn 4: Sett opp Firestore Database

1. Gå tilbake til Firebase Console
2. I venstremenyen, klikk **"Build"** → **"Firestore Database"**
3. Klikk **"Create database"**
4. Velg **"Start in test mode"** (vi legger til sikkerhetsregler senere)
5. Velg en lokasjon nær deg:
   - For Norge: `europe-west1` (Belgia) eller `europe-west3` (Frankfurt)
6. Klikk **"Enable"**

## Trinn 5: Sett opp Firebase Storage (for bilder)

1. I venstremenyen, klikk **"Build"** → **"Storage"**
2. Klikk **"Get started"**
3. Velg **"Start in test mode"**
4. Klikk **"Next"** og deretter **"Done"**

## Trinn 6: Konfigurer sikkerhetsregler

### Firestore regler

1. Gå til **"Firestore Database"** → **"Rules"** fanen
2. Erstatt innholdet med:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Alle kan lese
    match /{document=**} {
      allow read: if true;
    }
    
    // Kun autentiserte brukere kan skrive (foreløpig åpent for testing)
    // VIKTIG: Endre dette til strengere regler i produksjon!
    match /artworks/{document} {
      allow write: if true;
    }
    match /events/{document} {
      allow write: if true;
    }
    match /settings/{document} {
      allow write: if true;
    }
  }
}
```

3. Klikk **"Publish"**

### Storage regler

1. Gå til **"Storage"** → **"Rules"** fanen
2. Erstatt innholdet med:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Alle kan lese bilder
      allow read: if true;
      // Foreløpig åpent for opplasting (endre i produksjon)
      allow write: if true;
    }
  }
}
```

3. Klikk **"Publish"**

## Trinn 7: Migrer eksisterende data

Første gang noen logger inn som admin etter at Firebase er satt opp, vil systemet automatisk prøve å migrere eksisterende data fra localStorage til Firebase.

Du kan også kjøre migreringen manuelt ved å åpne nettleserens konsoll (F12 → Console) og skrive:

```javascript
FirebaseDataManager.migrateFromLocalStorage()
```

## Trinn 8: Test at det fungerer

1. Åpne nettsiden lokalt eller på GitHub Pages
2. Åpne nettleserens konsoll (F12 → Console)
3. Du skal se: `Firebase initialized successfully`
4. Logg inn som admin og prøv å legge til et bilde
5. Åpne nettsiden i et annet vindu/nettleser - bildet skal vises der også!

## Feilsøking

### "Firebase not configured" feilmelding
- Sjekk at du har fylt inn riktige verdier i `firebase-config.js`
- Sjekk at alle feltene er fylt ut

### Bilder vises ikke
- Sjekk at Firebase Storage er aktivert
- Sjekk Storage-reglene tillater lesing

### Data lagres ikke
- Sjekk at Firestore er aktivert
- Sjekk Firestore-reglene tillater skriving
- Sjekk nettleserens konsoll for feilmeldinger

### CORS-feil
Hvis du får CORS-feil, må du kanskje legge til domenet ditt i Firebase:
1. Gå til **"Project settings"** → **"General"**
2. Under "Your apps", finn web-appen din
3. Legg til domenet ditt under "Authorized domains"

## Sikkerhetsanbefalinger for produksjon

Når nettsiden er live, bør du:

1. **Legge til autentisering** for admin-panelet
2. **Stramme inn sikkerhetsreglene** slik at kun admin kan skrive
3. **Sette opp backup** av Firestore-databasen
4. **Overvåke bruk** i Firebase Console for å unngå uventet fakturering

## Kostnader

Firebase har en generøs gratisplan (Spark Plan) som inkluderer:
- 1 GB lagring i Firestore
- 5 GB lagring i Firebase Storage
- 50,000 lesinger per dag
- 20,000 skrivinger per dag

For en liten kunstnerside er dette mer enn nok!

## Støtte

Hvis du trenger hjelp, sjekk:
- [Firebase dokumentasjon](https://firebase.google.com/docs)
- [Firebase YouTube-kanal](https://www.youtube.com/firebase)
