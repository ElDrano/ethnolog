# Technische Dokumentation - Ethno-Log

## 📋 Projektübersicht

**Ethno-Log** ist eine moderne Web-Anwendung zur Verwaltung und Dokumentation ethnographischer Forschungsprojekte. Die Anwendung ermöglicht es Forschern, Projekte zu erstellen, zu dokumentieren, mit Teams zusammenzuarbeiten und umfassende Berichte zu erstellen.

### Hauptfunktionen
- 🔐 Benutzerauthentifizierung und Profilverwaltung
- 👥 Organisationsverwaltung mit Rollen-System (Owner, Admin, Member)
- 📁 Projektverwaltung mit Tags und Filteroptionen
- 📝 Dokumentationssystem mit Dateiupload
- 📊 Export-Funktionen (PDF, DOCX)
- 🌓 Dark/Light Mode
- 🗓️ Datumsbereich-Filter
- 🔍 Tag-basierte Projektkategorisierung

---

## 🛠️ Tech-Stack

### Frontend

#### Framework & Bibliotheken
| Technologie | Version | Verwendung |
|------------|---------|------------|
| **Next.js** | 15.3.5 | React-Framework mit App Router, SSR und Static Site Generation |
| **React** | 19.0.0 | UI-Bibliothek für komponentenbasierte Entwicklung |
| **React DOM** | 19.0.0 | React Rendering für Webbrowser |
| **TypeScript** | ^5 | Statische Typisierung für JavaScript |

#### UI & Styling
- **CSS Variables** - Dynamische Theming-Lösung
- **CSS Modules** - Modulare Stilorganisation mit separaten Dateien:
  - `base.css` - Grundlegende Stile
  - `components.css` - Komponentenspezifische Stile
  - `globals.css` - Globale Stile
  - `login.css` - Login-spezifische Stile
  - `sidebar.css` - Sidebar-Navigation
  - `utilities.css` - Utility-Klassen
  - `variables.css` - CSS-Variablen für Farben und Theming
- **Geist Font Family** - Moderne Schriftarten von Vercel (Sans & Mono)

#### Spezielle Bibliotheken
| Bibliothek | Version | Verwendung |
|-----------|---------|------------|
| **react-calendar** | ^6.0.0 | Kalender-Komponente für Datumseingaben |
| **html2canvas** | ^1.4.1 | Screenshot-Generierung für PDF-Export |
| **jsPDF** | ^2.5.2 | PDF-Generierung und Export |
| **docx** | ^8.5.0 | DOCX-Dokumentenerstellung |
| **jszip** | ^3.10.1 | ZIP-Archiv-Erstellung für Datei-Downloads |

### Backend & Datenbank

#### Backend-as-a-Service (BaaS)
| Technologie | Verwendung |
|------------|------------|
| **Supabase** | PostgreSQL-Datenbank, Authentifizierung, Row Level Security (RLS), Storage |
| **@supabase/supabase-js** | ^2.50.3 - JavaScript-Client für Supabase |

#### Datenbank
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)** für sichere Datenzugriffe
- **Stored Functions** für komplexe Datenbankoperationen
- **Triggers** für automatische Zeitstempel-Updates

### Entwicklungswerkzeuge

#### Linting & Code-Qualität
| Tool | Version | Verwendung |
|------|---------|------------|
| **ESLint** | ^9 | Code-Linting und Best Practices |
| **eslint-config-next** | 15.3.5 | Next.js-spezifische ESLint-Regeln |
| **@eslint/eslintrc** | ^3 | ESLint-Konfiguration |

#### Build & Entwicklung
- **Turbopack** - Schneller Bundler für Entwicklung (Next.js Dev)
- **Node.js** - Runtime-Umgebung
- **npm** - Package Manager

---

## 📁 Projektstruktur

```
ethnomethoden/
├── public/                          # Statische Assets
│   ├── iconLupe.png                # App-Icon
│   └── *.svg                       # SVG-Icons
│
├── src/
│   └── app/                        # Next.js App Router
│       ├── layout.tsx              # Root Layout mit Sidebar & Dark Mode
│       ├── page.tsx                # Startseite
│       ├── supabaseClient.ts       # Supabase Client-Konfiguration
│       │
│       ├── styles/                 # CSS-Dateien
│       │   ├── base.css
│       │   ├── components.css
│       │   ├── globals.css
│       │   ├── login.css
│       │   ├── sidebar.css
│       │   ├── utilities.css
│       │   └── variables.css       # CSS-Variablen für Theming
│       │
│       ├── DarkModeToggle.tsx      # Dark/Light Mode Toggle
│       ├── SidebarNav.tsx          # Hauptnavigation
│       ├── sidebarLogin.tsx        # Login-Komponente
│       │
│       ├── profile/                # Benutzerprofilseite
│       │   └── page.tsx
│       │
│       ├── methode1/               # Methodenseite
│       │   └── page.tsx
│       │
│       └── projekte/               # Projektverwaltung
│           ├── page.tsx
│           └── components/         # Projektkomponenten
│               ├── DateRangeFilter.tsx
│               ├── DeleteDialog.tsx
│               ├── DeleteOptionDialog.tsx
│               ├── DeleteProjectDialog.tsx
│               ├── DocumentationButtons.tsx
│               ├── DocumentationFilters.tsx
│               ├── DocumentationForm.tsx
│               ├── DocumentationList.tsx
│               ├── NewProjectForm.tsx
│               ├── OrganizationSelector.tsx
│               ├── ProjectInfoCard.tsx
│               ├── ProjektCard.tsx
│               ├── ProjektDetail.tsx
│               ├── ProjektePage.tsx
│               ├── ProjektList.tsx
│               ├── SecureFileDisplay.tsx
│               ├── TabNavigation.tsx
│               ├── TagFilter.tsx
│               ├── TagInput.tsx
│               └── TagSystemTest.tsx
│
├── *.sql                           # Datenbank-Setup-Skripte
├── *.md                            # Dokumentationsdateien
├── next.config.ts                  # Next.js-Konfiguration
├── tsconfig.json                   # TypeScript-Konfiguration
├── eslint.config.mjs               # ESLint-Konfiguration
├── package.json                    # Dependencies & Scripts
└── README.md                       # Projekt-README
```

---

## 🗄️ Datenbankarchitektur

### Datenbank-Tabellen

#### 1. **organizations**
Speichert Organisationsinformationen.

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. **organization_members**
Verwaltet Mitgliedschaften in Organisationen mit Rollen.

```sql
CREATE TABLE organization_members (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' 
        CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);
```

**Rollen:**
- `owner` - Vollständige Kontrolle über Organisation
- `admin` - Kann Mitglieder verwalten und Projekte bearbeiten
- `member` - Kann an Projekten mitarbeiten

#### 3. **projekte**
Speichert Projektinformationen.

```sql
CREATE TABLE projekte (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    arbeitsweise TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. **available_tags**
Vordefinierte Tags für Projektkategorisierung.

```sql
CREATE TABLE available_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Standard-Tags:**
- `formell` - Formelle Projekte
- `informell` - Informelle Projekte
- `extern` - Externe Projekte

#### 5. **dokumentation**
Speichert Dokumentationseinträge für Projekte.

```sql
CREATE TABLE dokumentation (
    id UUID PRIMARY KEY,
    projekt_id UUID REFERENCES projekte(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    file_url TEXT,
    tags TEXT[],
    date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Buckets

#### user-uploads
Speichert Benutzer-Uploads (Profilbilder, Dokumentationsdateien).

**Ordnerstruktur:**
- `profile-images/` - Profilbilder
  - Format: `{user_id}-{timestamp}.{extension}`
- `project-files/` - Projektdateien
  - Format: `{project_id}/{filename}`

---

## 🔐 Authentifizierung & Sicherheit

### Supabase Authentication
- **Email/Password Authentication**
- **Session Management** mit JWT-Tokens
- **User Metadata** für Profildaten:
  - `display_name` - Anzeigename
  - `bio` - Kurzbeschreibung
  - `profile_image_url` - Profilbild-URL

### Row Level Security (RLS)

#### organizations
```sql
-- Lesen: Nur Mitglieder
CREATE POLICY "Members can read organizations" 
ON organizations FOR SELECT 
USING (auth.uid() IN (
    SELECT user_id FROM organization_members 
    WHERE organization_id = id
));

-- Bearbeiten: Nur Owner/Admin
CREATE POLICY "Owners and admins can update organizations" 
ON organizations FOR UPDATE 
USING (auth.uid() IN (
    SELECT user_id FROM organization_members 
    WHERE organization_id = id 
    AND role IN ('owner', 'admin')
));
```

#### projekte
```sql
-- Lesen: Eigene oder Organisationsprojekte
CREATE POLICY "Users can read own or organization projects" 
ON projekte FOR SELECT 
USING (
    user_id = auth.uid() OR 
    organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    )
);
```

#### available_tags
```sql
-- Lesen: Alle authentifizierten Benutzer
CREATE POLICY "Allow authenticated users to read available_tags" 
ON available_tags FOR SELECT 
USING (auth.role() = 'authenticated');
```

### Stored Functions

#### add_user_to_organization
Fügt Benutzer zu Organisation hinzu (nur für Owner/Admin).

```sql
CREATE FUNCTION add_user_to_organization(
    org_id UUID, 
    user_email TEXT, 
    member_role TEXT
)
RETURNS UUID;
```

#### remove_user_from_organization
Entfernt Benutzer aus Organisation (nur für Owner/Admin).

```sql
CREATE FUNCTION remove_user_from_organization(
    org_id UUID, 
    user_id_to_remove UUID
)
RETURNS VOID;
```

---

## 🎨 Design & Styling

### Theming-System

#### CSS-Variablen
Die Anwendung verwendet ein umfassendes CSS-Variablen-System für dynamisches Theming:

**Light Mode:**
```css
:root {
  --primary-blue: #2563eb;
  --primary-blue-dark: #1d4ed8;
  --background: #ffffff;
  --text-primary: #000000;
  /* ... weitere Variablen */
}
```

**Dark Mode:**
```css
body:not(.light-mode) {
  --primary-blue: #3b82f6;
  --background: #0f172a;
  --text-primary: #ffffff;
  /* ... weitere Variablen */
}
```

#### Farbpalette

**Primärfarben:**
- Blue: `#2563eb` (Light) / `#3b82f6` (Dark)
- Orange: `#f97316`
- Green: `#10b981`
- Purple: `#8b5cf6`

**Funktionale Farben:**
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`

### Dark Mode Toggle
- Client-seitiges Toggle mit `localStorage`
- Automatische Persistierung der Präferenz
- Smooth Transitions zwischen Modi

---

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js (v18 oder höher)
- npm oder yarn
- Supabase-Account

### Installation

1. **Repository klonen:**
```bash
git clone <repository-url>
cd ethnomethoden
```

2. **Dependencies installieren:**
```bash
npm install
```

3. **Umgebungsvariablen einrichten:**
Erstellen Sie eine `.env.local`-Datei:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Datenbank einrichten:**
Führen Sie die SQL-Skripte in Ihrem Supabase-Projekt aus:
```bash
# In Supabase SQL Editor:
database_setup.sql
database_organizations.sql
create_organization_members_view.sql
setup_storage_policies.sql
```

5. **Storage Bucket erstellen:**
- Gehen Sie zu Supabase Dashboard → Storage
- Erstellen Sie einen Bucket namens `user-uploads`
- Aktivieren Sie RLS für den Bucket

6. **Entwicklungsserver starten:**
```bash
npm run dev
```

Die Anwendung läuft nun auf `http://localhost:3000`

---

## 💻 Entwicklung

### Verfügbare Scripts

```json
{
  "dev": "next dev --turbopack",     // Entwicklungsserver mit Turbopack
  "build": "next build",              // Production Build erstellen
  "start": "next start",              // Production Server starten
  "lint": "next lint"                 // ESLint ausführen
}
```

### Entwicklungs-Workflow

1. **Feature entwickeln:**
```bash
npm run dev
```

2. **Code überprüfen:**
```bash
npm run lint
```

3. **Production Build testen:**
```bash
npm run build
npm run start
```

### Code-Konventionen

- **TypeScript** für alle Dateien verwenden
- **Funktionale Komponenten** mit React Hooks
- **CSS Modules** für komponentenspezifische Stile
- **ESLint-Regeln** befolgen
- **Kommentare** für komplexe Logik

---

## 📦 Deployment

### Vercel (Empfohlen)

1. **Vercel-Account erstellen** auf [vercel.com](https://vercel.com)

2. **Projekt verbinden:**
   - Neues Projekt erstellen
   - Repository auswählen
   - Automatische Next.js-Erkennung

3. **Umgebungsvariablen hinzufügen:**
   - Settings → Environment Variables
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Automatisches Deployment bei Git Push
   - Preview Deployments für Pull Requests

### Andere Plattformen

Die Anwendung kann auch auf anderen Plattformen deployed werden:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Eigener Server mit PM2

---

## 🔧 Konfiguration

### Next.js Config (`next.config.ts`)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLint Config (`eslint.config.mjs`)

```javascript
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

---

## 📊 Hauptfunktionen im Detail

### 1. Projektverwaltung

#### Projekt erstellen
- Name, Beschreibung, Arbeitsweise eingeben
- Organisation auswählen (optional)
- Automatische Zuordnung zum Benutzer
- Tags hinzufügen

#### Projekt bearbeiten
- Alle Felder editierbar
- Organisationswechsel möglich
- Tag-Verwaltung

#### Projekt löschen
- Bestätigungsdialog
- Löscht alle zugehörigen Dokumentationen
- Entfernt Dateien aus Storage

### 2. Dokumentationssystem

#### Dokumentation erstellen
- Titel und Inhalt
- Datei-Upload (Bilder, PDFs, etc.)
- Tags zuweisen
- Datum setzen

#### Dokumentation filtern
- Nach Tags filtern
- Datumsbereich eingrenzen
- Volltext-Suche

#### Export-Funktionen
- **PDF-Export:**
  - Einzelne Dokumentation
  - Gesamtprojekt
  - Mit html2canvas für Screenshots
  - Mit jsPDF für PDF-Generierung
  
- **DOCX-Export:**
  - Strukturiertes Word-Dokument
  - Mit docx-Bibliothek
  - Inklusive Metadaten

- **ZIP-Export:**
  - Alle Dateien eines Projekts
  - Mit jszip komprimiert

### 3. Organisationsverwaltung

#### Organisation erstellen
- Name und Beschreibung
- Logo hochladen (optional)
- Automatisch Owner-Rolle

#### Mitglieder verwalten
- Per E-Mail einladen
- Rollen zuweisen (Owner, Admin, Member)
- Mitglieder entfernen
- Rollenwechsel

#### Berechtigungen
- **Owner:** Vollzugriff, kann löschen
- **Admin:** Kann Mitglieder und Projekte verwalten
- **Member:** Kann an Projekten mitarbeiten

### 4. Profilverwaltung

#### Profilbild
- Upload über Supabase Storage
- Automatische Komprimierung
- Anzeige in Navigation

#### Profildaten
- Anzeigename
- Bio/Beschreibung
- Speicherung in Supabase User Metadata

---

## 🔍 Besondere Features

### Client-seitige Features
- **Optimistic UI Updates** für bessere UX
- **Debounced Search** für Performance
- **Lazy Loading** für große Listen
- **Error Boundaries** für Fehlerbehandlung
- **Loading States** für alle Async-Operationen

### Performance-Optimierungen
- **Next.js App Router** mit automatischem Code Splitting
- **Turbopack** für schnellere Entwicklung
- **Image Optimization** mit next/image (potentiell erweiterbar)
- **CSS Variables** für effizientes Theming
- **RLS** für sichere und performante Datenbankabfragen

### Sicherheitsfeatures
- **Row Level Security (RLS)** auf Datenbankebene
- **JWT-basierte Authentifizierung**
- **CSRF-Schutz** durch Supabase
- **Input Validation** auf Client und Server
- **File Upload Restrictions** für Sicherheit

---

## 📚 Weiterführende Dokumentation

### Projekt-spezifische Dokumentation
- `ORGANISATIONS_SYSTEM.md` - Detaillierte Infos zum Organisationssystem
- `TAG_SYSTEM_SETUP.md` - Tag-System Implementierung
- `STORAGE_SETUP.md` - Storage-Konfiguration
- `COLOR_PALETTE.md` - Farbpaletten-Definition
- `IMPLEMENTATION_SUMMARY.md` - Implementierungs-Übersicht

### Externe Dokumentation
- [Next.js Dokumentation](https://nextjs.org/docs)
- [React Dokumentation](https://react.dev)
- [Supabase Dokumentation](https://supabase.com/docs)
- [TypeScript Dokumentation](https://www.typescriptlang.org/docs)

---

## 🐛 Troubleshooting

### Häufige Probleme

#### "Keine Verbindung zu Supabase"
- Überprüfen Sie die Umgebungsvariablen
- Prüfen Sie die Supabase-URL und den Anon Key
- Stellen Sie sicher, dass das Supabase-Projekt aktiv ist

#### "Authentifizierung schlägt fehl"
- Prüfen Sie die Supabase Auth-Einstellungen
- Überprüfen Sie RLS-Policies
- Löschen Sie Browser-Cache und Cookies

#### "Datei-Upload funktioniert nicht"
- Prüfen Sie Storage Bucket-Berechtigungen
- Überprüfen Sie Dateigröße (<50MB)
- Prüfen Sie unterstützte Dateitypen

#### "Dark Mode funktioniert nicht"
- Löschen Sie localStorage
- Prüfen Sie CSS-Variablen in `variables.css`
- Browser-Cache leeren

---

## 🎯 Zukünftige Erweiterungen

### Geplante Features
- [ ] **Real-time Collaboration** mit Supabase Realtime
- [ ] **Benachrichtigungssystem** für Organisationsupdates
- [ ] **Erweiterte Such- und Filteroptionen**
- [ ] **Projekt-Templates** für schnellere Projekterstellung
- [ ] **Organisations-Statistiken** und Dashboards
- [ ] **API-Endpunkte** für externe Integrationen
- [ ] **Mobile App** (React Native)
- [ ] **Offline-Support** mit Service Workers
- [ ] **Audit Logs** für Compliance
- [ ] **Erweiterte Rollen und Berechtigungen**

### Performance-Verbesserungen
- [ ] **Redis-Caching** für häufig abgefragte Daten
- [ ] **CDN-Integration** für statische Assets
- [ ] **Database Indexing** Optimierung
- [ ] **Pagination** für große Datenlisten
- [ ] **Virtual Scrolling** für lange Listen

---

## 📝 Lizenz & Kontakt

### Projekt-Informationen
- **Projektname:** Ethno-Log
- **Version:** 0.1.0
- **Typ:** Private Application

### Support & Fragen
Für Fragen und Support wenden Sie sich an das Entwicklungsteam.

---

**Letzte Aktualisierung:** Oktober 2025

---

## 🏗️ Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js UI  │  │  React State │  │  Dark Mode   │      │
│  │   Components │  │  Management  │  │   Toggle     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │      Supabase Client (@supabase)      │
         └───────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                         │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │  Supabase    │  │   Storage    │      │
│  │   Database   │  │    Auth      │  │   Buckets    │      │
│  │              │  │              │  │              │      │
│  │ - projekte   │  │ - JWT Tokens │  │ - user-      │      │
│  │ - orgs       │  │ - Sessions   │  │   uploads    │      │
│  │ - tags       │  │ - RLS        │  │ - profile-   │      │
│  │ - docs       │  │              │  │   images     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

*Diese Dokumentation wird kontinuierlich aktualisiert und erweitert.*

