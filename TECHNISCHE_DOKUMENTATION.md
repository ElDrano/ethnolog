# Technische Dokumentation: Ethno-Log

## 1. Einleitung

Diese Dokumentation beschreibt die technische Architektur, Implementierung und Funktionalität der Webanwendung "Ethno-Log", einer digitalen Plattform zur Verwaltung und Dokumentation ethnografischer Forschungsprojekte. Die Anwendung ermöglicht es Forschenden, Projekte zu erstellen, Dokumentationen zu verwalten, Projekte mit anderen Nutzern zu teilen und Daten zu exportieren.

## 2. Technologie-Stack

### 2.1 Frontend-Framework

Die Anwendung basiert auf **Next.js 15.3.5** mit dem App Router, einem React-basierten Framework für die Entwicklung von Server-Side-Rendered (SSR) und Client-Side-Rendered Webanwendungen. Die Verwendung von Next.js ermöglicht:

- **Server-Side Rendering**: Verbesserte Performance und SEO-Optimierung
- **App Router**: Moderne Routing-Struktur mit Dateisystem-basiertem Routing
- **React 19.0.0**: Aktuelle Version der React-Bibliothek für die UI-Entwicklung
- **TypeScript 5**: Typsichere Entwicklung zur Reduzierung von Laufzeitfehlern

### 2.2 Backend und Datenbank

**Supabase** wird als Backend-as-a-Service (BaaS) eingesetzt und bietet:

- **PostgreSQL-Datenbank**: Relationale Datenbank für strukturierte Datenspeicherung
- **Authentifizierung**: Integriertes User-Management mit JWT-basierter Authentifizierung
- **Row Level Security (RLS)**: Datenbankseitige Sicherheitsrichtlinien für Zugriffskontrolle
- **Storage**: Datei-Upload und -Verwaltung für Dokumentationen und Medien
- **Real-time Subscriptions**: Echtzeit-Updates für kollaborative Features

### 2.3 Weitere Dependencies

- **docx (8.5.0)**: Generierung von Word-Dokumenten für Export-Funktionen
- **jspdf (2.5.2)**: PDF-Generierung
- **html2canvas (1.4.1)**: Konvertierung von HTML-Inhalten zu Bildern für PDF-Export
- **jszip (3.10.1)**: Komprimierung von Dateien für Batch-Downloads
- **react-calendar (6.0.0)**: Kalender-Komponente für Datumsauswahl

## 3. Architektur

### 3.1 Anwendungsstruktur

Die Anwendung folgt einer modularen Komponentenarchitektur:

```
src/app/
├── layout.tsx                 # Root-Layout mit Navigation
├── page.tsx                   # Startseite
├── SidebarNav.tsx             # Hauptnavigation
├── DarkModeToggle.tsx         # Theme-Switcher
├── supabaseClient.ts          # Supabase-Client-Konfiguration
├── projekte/                  # Projekt-Verwaltung
│   ├── page.tsx               # Projektübersicht
│   ├── [id]/page.tsx          # Projekt-Detailansicht
│   └── components/            # Wiederverwendbare Komponenten
│       ├── ProjektDetail.tsx
│       ├── DocumentationForm.tsx
│       ├── ProjectMembers.tsx
│       ├── ProjectLinks.tsx
│       └── ...
├── dokumentationen/           # Dokumentations-Verwaltung
│   └── page.tsx
├── profile/                   # Benutzerprofil
│   └── page.tsx
└── styles/                    # CSS-Dateien
    ├── globals.css
    ├── variables.css
    ├── base.css
    └── ...
```

### 3.2 Datenmodell



### 3.3 Sicherheitsarchitektur

#### 3.3.1 Row Level Security (RLS)

Die Anwendung nutzt Supabase Row Level Security für datenbankseitige Zugriffskontrolle:

**Projekte:**
- Nutzer können nur eigene Projekte oder Projekte, in denen sie Mitglied sind, sehen
- Nur Projektbesitzer und Mitglieder mit `write`-Rolle können Projekte bearbeiten

**Dokumentationen:**
- Zugriff nur für Projektmitglieder oder Besitzer der Dokumentation
- Projektlose Dokumentationen sind nur für den Ersteller sichtbar

**Projekt-Mitglieder:**
- Nur Projektbesitzer und Mitglieder mit `write`-Rolle können Mitglieder hinzufügen/entfernen
- Alle Projektmitglieder können die Mitgliederliste einsehen

#### 3.3.2 Authentifizierung

- JWT-basierte Authentifizierung über Supabase Auth
- Session-Management durch Supabase Client
- Automatische Token-Erneuerung

## 4. Kernfunktionalitäten

### 4.1 Projektverwaltung

#### 4.1.1 Projekt erstellen
- Formular zur Eingabe von Projektname, Beschreibung und Arbeitsweise
- Automatische Zuweisung des aktuellen Nutzers als Projektbesitzer
- Validierung der Eingabefelder

#### 4.1.2 Projekt bearbeiten
- Bearbeitung von Name und Beschreibung (nur für Besitzer und `write`-Mitglieder)
- Anzeige von Projektinformationen in einer Info-Karte

#### 4.1.3 Projekt teilen
- Hinzufügen von Mitgliedern per E-Mail-Adresse
- Rollenbasierte Zugriffskontrolle (read/write)
- Anzeige aller Projektmitglieder mit E-Mail-Adressen
- Projektbesitzer wird automatisch als "Besitzer" markiert und kann nicht entfernt werden

### 4.2 Dokumentationsverwaltung

#### 4.2.1 Dokumentationstypen

Die Anwendung unterstützt zwei Haupttypen von Dokumentationen:

1. **Archiv-Dokumentation** (`typ: 'archiv'`)
   - Für bereits vorhandene, archivierte Dokumente
   - Kein Untertyp erforderlich

2. **Live-Dokumentation** (`typ: 'live'`)
   - Für aktive Forschungsdokumentationen
   - Unterstützte Untertypen:
     - **Meeting**: Dokumentation von Besprechungen
     - **Interview**: Interview-Dokumentationen
     - **Feldnotiz**: Feldnotizen aus der Forschung

#### 4.2.2 Dokumentation erstellen

Das Dokumentationsformular ermöglicht:

- **Basisinformationen**: Name, Beschreibung, Datum, Zeitraum
- **Personenverwaltung**: Hinzufügen von Personen zur Dokumentation
- **Klienteninformationen**: Speicherung von Klientendaten
- **Dialoge**: Strukturierte Erfassung von Gesprächen
- **Kernfragen**: Frage-Antwort-Paare für Interviews
- **Tags**: Kategorisierung durch Tags
- **Datei-Upload**: Hochladen von Audio-Dateien und anderen Medien
- **Projektzuordnung**: Optionale Zuweisung zu einem Projekt

#### 4.2.3 Dokumentation filtern und durchsuchen

- **Typ-Filter**: Filterung nach Dokumentationstyp (Archiv, Meeting, Interview, Feldnotiz)
- **Tag-Filter**: Filterung nach Tags
- **Datumsfilter**: Filterung nach einzelnen Datum oder Datumsbereich
- **Kombinierte Filter**: Mehrere Filter können gleichzeitig aktiv sein

#### 4.2.4 Dokumentation bearbeiten und löschen

- Bearbeitung bestehender Dokumentationen
- Löschen mit Bestätigungsdialog
- Validierung bei Änderungen

### 4.3 Export-Funktionen

#### 4.3.1 Word-Export
- Generierung von Word-Dokumenten (.docx) aus Dokumentationen
- Strukturierte Darstellung aller Dokumentationsdaten
- Unterstützung für einzelne Dokumentationen und Batch-Export

#### 4.3.2 PDF-Export
- Konvertierung von Dokumentationen in PDF-Format
- Verwendung von html2canvas für Layout-Erhaltung
- Einzel- und Batch-Export möglich

#### 4.3.3 Datei-Download
- Download einzelner Dateien
- Batch-Download mehrerer Dateien als ZIP-Archiv
- Sichere Dateiübertragung über Supabase Storage

### 4.4 Benutzerverwaltung

#### 4.4.1 Profilverwaltung
- Anzeige und Bearbeitung von Anzeigename und Bio
- E-Mail-Anzeige (nur lesbar)
- Speicherung in Supabase `profiles`-Tabelle

#### 4.4.2 Authentifizierung
- Registrierung neuer Nutzer
- Login/Logout-Funktionalität
- Session-Management

### 4.5 Zusätzliche Features

#### 4.5.1 Interaktions- und Arbeitsräume
- Verwaltung von Links zu externen Ressourcen (z.B. GitHub, Miro)
- Hinzufügen, Bearbeiten und Löschen von Links
- Nur für Projektbesitzer und `write`-Mitglieder bearbeitbar

#### 4.5.2 Dark Mode
- Toggle zwischen Light und Dark Mode
- Persistierung der Theme-Präferenz
- CSS-Variablen-basierte Implementierung für konsistente Farbgebung

## 5. Implementierungsdetails

### 5.1 State Management

Die Anwendung nutzt React Hooks für State Management:

- **useState**: Lokaler Komponenten-State
- **useEffect**: Side-Effects und Datenladung
- **Context API**: Für globale Zustände (optional, aktuell nicht verwendet)

### 5.2 Datenladung

Daten werden clientseitig über den Supabase Client geladen:

```typescript
// Beispiel: Projekte laden
const { data, error } = await supabase
  .from('projekte')
  .select('*')
  .eq('user_id', user.id);
```

### 5.3 Fehlerbehandlung

- Try-Catch-Blöcke für asynchrone Operationen
- Benutzerfreundliche Fehlermeldungen
- Validierung von Eingaben vor dem Speichern
- Fehler-Logging in der Konsole für Debugging

### 5.4 Styling

- **CSS Modules**: Komponentenspezifische Styles
- **CSS-Variablen**: Theme-basierte Farbverwaltung
- **Inline-Styles**: Für dynamische Styling-Anpassungen
- **Responsive Design**: Mobile-First-Ansatz

### 5.5 Datenbankfunktionen

Die Anwendung nutzt PostgreSQL-Funktionen für komplexe Operationen:

- **add_user_to_project_by_email**: Hinzufügen von Nutzern zu Projekten per E-Mail
- **get_user_emails**: Abruf von E-Mail-Adressen für mehrere Nutzer-IDs
- **SECURITY DEFINER**: Funktionen mit erweiterten Berechtigungen für sicheren Zugriff auf `auth.users`

## 6. Sicherheitsaspekte

### 6.1 Authentifizierung und Autorisierung

- JWT-basierte Authentifizierung
- Row Level Security auf Datenbankebene
- Clientseitige und serverseitige Validierung
- Rollenbasierte Zugriffskontrolle (Besitzer, write, read)

### 6.2 Datenschutz

- Nutzer können nur auf ihre eigenen Daten zugreifen
- Projektmitglieder haben nur Zugriff auf geteilte Projekte
- E-Mail-Adressen werden nur für Projektmitglieder angezeigt
- Sichere Dateiübertragung über Supabase Storage

### 6.3 Eingabevalidierung

- Validierung aller Benutzereingaben
- SQL-Injection-Schutz durch Supabase Client
- XSS-Schutz durch React's automatisches Escaping

## 7. Performance-Optimierungen

### 7.1 Datenladung

- Lazy Loading von Komponenten
- Selektive Datenabfragen (nur benötigte Felder)
- Caching von häufig genutzten Daten

### 7.2 Rendering

- Server-Side Rendering für initiale Seitenladung
- Client-Side Rendering für interaktive Komponenten
- Optimierte Re-Renders durch React Hooks

### 7.3 Dateiverwaltung

- Komprimierung von Dateien bei Batch-Downloads
- Streaming für große Dateien
- Optimierte Bildgrößen

## 8. Erweiterbarkeit

Die modulare Architektur ermöglicht einfache Erweiterungen:

- Neue Dokumentationstypen können durch Erweiterung des `typ`-Enums hinzugefügt werden
- Weitere Export-Formate können durch Integration zusätzlicher Bibliotheken implementiert werden
- Zusätzliche Projekt-Features können als neue Komponenten integriert werden
- Erweiterte Filteroptionen können durch Modifikation der Filter-Komponenten hinzugefügt werden

## 9. Deployment

### 9.1 Build-Prozess

```bash
npm run build  # Erstellt optimierte Produktionsversion
npm start      # Startet Produktionsserver
```

### 9.2 Umgebungsvariablen

Die Anwendung benötigt folgende Konfiguration:

- **Supabase URL**: URL der Supabase-Instanz
- **Supabase Anon Key**: Öffentlicher API-Schlüssel für Client-Zugriff

### 9.3 Hosting

Die Anwendung kann auf folgenden Plattformen gehostet werden:

- **Vercel**: Optimiert für Next.js-Anwendungen
- **Netlify**: Alternative Hosting-Plattform
- **Eigener Server**: Mit Node.js und Next.js

## 10. Fazit

Die Ethno-Log-Anwendung stellt eine moderne, skalierbare Lösung für die Verwaltung ethnografischer Forschungsprojekte dar. Durch die Verwendung von Next.js und Supabase wird eine performante, sichere und benutzerfreundliche Plattform bereitgestellt, die den Anforderungen wissenschaftlicher Forschung gerecht wird.

Die modulare Architektur ermöglicht einfache Wartung und Erweiterung, während die Implementierung von Row Level Security und rollenbasierter Zugriffskontrolle einen hohen Sicherheitsstandard gewährleistet.

