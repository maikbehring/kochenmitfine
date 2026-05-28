# Kochen mit Fine

Eine gemütliche, minimalistische Rezeptplattform — zum Entdecken, Filtern und Teilen von Kochrezepten. Warme Farben, viel Weißraum und voll responsiv auf Desktop, Tablet und Smartphone.

**Live-Repo:** [github.com/maikbehring/kochenmitfine](https://github.com/maikbehring/kochenmitfine)

---

## Inhaltsverzeichnis

- [Funktionen](#funktionen)
- [Nutzerrollen](#nutzerrollen)
- [Tech-Stack](#tech-stack)
- [Schnellstart](#schnellstart)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Admin-Zugang](#admin-zugang)
- [Routen](#routen)
- [Projektstruktur](#projektstruktur)
- [NPM-Skripte](#npm-skripte)
- [Entwicklungshinweise](#entwicklungshinweise)

---

## Funktionen

### Öffentlicher Bereich
- Rezeptliste mit Kartenlayout
- **Suche** ausschließlich nach Rezeptnamen
- **Kategorie-Filter** (Mehrfachauswahl): Hauptspeise, Beilage, Suppe, Nachspeise, Snack
- **Menü-Filter** für Kombinationen (z. B. Drei-Gänge-Menü)
- Rezeptdetail mit Zutaten, Zubereitungsschritten, Nährwerten und optionalen Schritt-Bildern

### Authentifizierung
- Registrierung für Leser (E-Mail + Passwort)
- Login / Logout mit NextAuth (Credentials)
- Sichere Rollentrennung (Admin vs. Leser vs. Gast)

### Admin (Fine)
- Rezepte erstellen, bearbeiten und löschen
- Dynamische Zutatenliste (Menge, Einheit, Name)
- Dynamische Zubereitungsschritte mit optionalem Bild-Upload pro Schritt
- Nährwerte: Kalorien, Eiweiß, Kohlenhydrate, Fett, Zucker
- **Kommentar-Moderation**: ausstehende Kommentare freigeben oder ablehnen

### Kommentare
- Nur für angemeldete Leser
- Neue Kommentare starten im Status `PENDING` und sind öffentlich unsichtbar
- Nach Freigabe durch den Admin sichtbar mit Nutzername und Text

---

## Nutzerrollen

| Rolle | Rezepte lesen | Suchen & filtern | Kommentieren | Rezepte verwalten | Moderation |
|--------|:-------------:|:----------------:|:------------:|:-----------------:|:----------:|
| **Gast** | ✓ | ✓ | — | — | — |
| **Leser** | ✓ | ✓ | ✓ | — | — |
| **Admin (Fine)** | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS 4 |
| Datenbank | SQLite |
| ORM | Prisma 6 |
| Auth | NextAuth.js (JWT + Credentials) |
| Passwörter | bcrypt |

---

## Schnellstart

### Voraussetzungen

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/maikbehring/kochenmitfine.git
cd kochenmitfine
npm install
```

### Umgebung einrichten

Lege eine `.env` im Projektroot an (siehe [Umgebungsvariablen](#umgebungsvariablen)):

```bash
cp .env.example .env   # falls vorhanden, sonst manuell anlegen
```

### Datenbank initialisieren

```bash
npm run db:push
npm run db:seed
```

### Entwicklungsserver starten

```bash
npm run dev
```

Die App ist unter **[http://localhost:3000](http://localhost:3000)** erreichbar.

> **Hinweis:** Wenn Port 3000 bereits belegt ist, wählt Next.js automatisch den nächsten freien Port (z. B. 3001). In der Konsole steht die tatsächliche URL.

### Produktions-Build

```bash
npm run build
npm run start
```

---

## Umgebungsvariablen

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `DATABASE_URL` | SQLite-Verbindung | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Geheimer Schlüssel für Sessions | Zufälliger String |
| `NEXTAUTH_URL` | Basis-URL der App | `http://localhost:3000` |
| `ADMIN_EMAIL` | E-Mail des Admin-Accounts (Seed) | `fine@kochenmitfine.de` |
| `ADMIN_PASSWORD` | Passwort des Admin-Accounts (Seed) | *(sicheres Passwort)* |

**Beispiel `.env`:**

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dein-geheimer-schluessel"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="fine@kochenmitfine.de"
ADMIN_PASSWORD="FineAdmin123!"
```

`.env` wird nicht ins Repository committed (siehe `.gitignore`).

---

## Admin-Zugang

Nach `npm run db:seed` ist der Admin-Account angelegt (sofern nicht per `.env` überschrieben):

| Feld | Standard |
|------|----------|
| E-Mail | `fine@kochenmitfine.de` |
| Passwort | `FineAdmin123!` |

**Bitte in Produktion ein starkes Passwort setzen** (`ADMIN_PASSWORD` in `.env`).

Nach dem Login: Navigation → **Admin** bzw. **Moderation**.

---

## Routen

| Pfad | Beschreibung |
|------|--------------|
| `/` | Startseite — Rezeptliste, Suche & Filter |
| `/recipes/[id]` | Rezeptdetail inkl. Kommentare |
| `/login` | Anmeldung |
| `/register` | Registrierung (Leser) |
| `/admin` | Rezeptverwaltung (nur Admin) |
| `/admin/recipes/new` | Neues Rezept |
| `/admin/recipes/[id]/edit` | Rezept bearbeiten |
| `/admin/comments` | Kommentar-Moderation |

---

## Projektstruktur

```
kochenmitfine/
├── prisma/
│   ├── schema.prisma      # Datenmodell
│   └── seed.mjs           # Admin + Menü-Seed
├── public/
│   ├── uploads/           # Hochgeladene Schritt-Bilder
│   └── sw.js              # Service Worker (Browser-Kompatibilität)
└── src/
    ├── app/               # Next.js App Router (Seiten & API)
    ├── components/        # UI-Komponenten (Nav, Formulare)
    ├── lib/               # Auth, Prisma, Server Actions
    └── types/             # TypeScript-Erweiterungen (NextAuth)
```

### Datenmodell (Kurzüberblick)

- **User** — Leser und Admin
- **Recipe** — Stammdaten, Kategorie, Nährwerte
- **RecipeIngredient** — Zutatenzeilen mit Position
- **RecipeStep** — Zubereitungsschritte, optional mit Bild
- **Comment** — mit Moderationsstatus (`PENDING` | `APPROVED` | `REJECTED`)
- **MenuCombo** / **MenuComboItem** — Menü-Kombinationen für Spezialfilter

---

## NPM-Skripte

| Befehl | Beschreibung |
|--------|--------------|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Produktions-Build erstellen |
| `npm run start` | Produktionsserver starten |
| `npm run lint` | ESLint ausführen |
| `npm run db:push` | Prisma-Schema in SQLite übernehmen |
| `npm run db:seed` | Admin & Basisdaten seeden |

---

## Entwicklungshinweise

### Bild-Uploads
Hochgeladene Schritt-Bilder landen unter `public/uploads/`. Für Produktion empfiehlt sich später ein externer Storage (z. B. S3).

### Service Worker (`/sw.js`)
Ein minimaler Service Worker liegt unter `public/sw.js`, damit ältere Browser-Registrierungen keine `404`-Schleifen auf `localhost` auslösen. Bei Problemen im Browser: DevTools → **Application** → **Service Workers** → **Unregister**, dann Hard-Reload (`Cmd+Shift+R`).

### Rezept-Kategorien
| Enum | Anzeige |
|------|---------|
| `MAIN` | Hauptspeise |
| `SIDE` | Beilage |
| `SOUP` | Suppe |
| `DESSERT` | Nachspeise |
| `SNACK` | Snack |

---

## Lizenz

Privates Projekt — Nutzung nach Absprache mit dem Projektinhaber.

---

*Mit Liebe gekocht — Kochen mit Fine.*
