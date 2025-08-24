# Organisations- und Profilsystem für Ethnomethoden

## Übersicht

Das neue Organisations- und Profilsystem ermöglicht es Benutzern, Profile zu verwalten, Organisationen zu erstellen und Projekte innerhalb von Organisationen zu bearbeiten.

## Funktionen

### 1. Benutzerprofile
- **Profilbild-Upload**: Benutzer können ein Profilbild hochladen
- **Anzeigename**: Benutzer können einen benutzerdefinierten Anzeigenamen festlegen
- **Bio**: Kurze Beschreibung über sich selbst
- **Automatische Speicherung**: Alle Profildaten werden in den Benutzer-Metadaten gespeichert

### 2. Organisationen
- **Organisation erstellen**: Benutzer können neue Organisationen erstellen
- **Organisationsverwaltung**: Name, Beschreibung und Logo für Organisationen
- **Mitgliederverwaltung**: Benutzer zu Organisationen hinzufügen/entfernen
- **Rollen-System**: Owner, Admin, Member mit unterschiedlichen Berechtigungen

### 3. Projekt-Organisationszuordnung
- **Organisationsauswahl**: Bei der Projekterstellung kann eine Organisation ausgewählt werden
- **Automatische Berechtigung**: Alle Organisationsmitglieder können an den Projekten arbeiten
- **Private Projekte**: Projekte ohne Organisationszuordnung bleiben privat

## Datenbankstruktur

### Neue Tabellen

#### 1. `organizations`
```sql
CREATE TABLE organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `organization_members`
```sql
CREATE TABLE organization_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);
```

### Erweiterte Tabellen

#### 1. `auth.users` (erweitert)
```sql
ALTER TABLE auth.users ADD COLUMN profile_image_url TEXT;
ALTER TABLE auth.users ADD COLUMN display_name TEXT;
ALTER TABLE auth.users ADD COLUMN bio TEXT;
```

#### 2. `projekte` (erweitert)
```sql
ALTER TABLE projekte ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
```

## Sicherheit

### Row Level Security (RLS)
- **Organisationen**: Nur Mitglieder können lesen, Owner/Admin können bearbeiten
- **Organisationsmitglieder**: Nur Mitglieder können lesen, Owner/Admin können verwalten
- **Projekte**: Automatische Berechtigung für Organisationsmitglieder

### Rollen-System
- **Owner**: Kann Organisation löschen, alle Mitglieder verwalten
- **Admin**: Kann Mitglieder hinzufügen/entfernen, Projekte verwalten
- **Member**: Kann an Projekten arbeiten, Mitgliederliste einsehen

## Komponenten

### 1. ProfilePage (`/profile`)
- **Profilbild-Upload** mit Supabase Storage
- **Profil-Daten** (Anzeigename, Bio) bearbeiten
- **Organisationsverwaltung** mit Mitgliederliste
- **Neue Organisation erstellen**

### 2. OrganizationSelector
- **Dropdown** für Organisationsauswahl bei Projekterstellung
- **Hinweise** für Benutzer ohne Organisationen
- **Link** zur Profil-Seite für Organisationserstellung

### 3. Erweiterte NewProjectForm
- **Organisationsauswahl** integriert
- **Automatische Speicherung** der Organisations-ID

## API-Funktionen

### 1. `add_user_to_organization(org_id, user_email, member_role)`
- Fügt Benutzer anhand E-Mail zur Organisation hinzu
- Prüft Berechtigungen des aufrufenden Benutzers
- Unterstützt verschiedene Rollen

### 2. `remove_user_from_organization(org_id, user_id_to_remove)`
- Entfernt Benutzer aus Organisation
- Prüft Admin/Owner-Berechtigungen

## Benutzeroberfläche

### Profil-Seite (`/profile`)
```
┌─────────────────────────────────────┐
│ Profil & Organisationen             │
├─────────────────────────────────────┤
│ [Profilbild]  Anzeigename: [_____]  │
│ [Upload]      Über mich: [______]   │
│              [Profil speichern]     │
├─────────────────────────────────────┤
│ Organisationen                      │
│ [+ Neue Organisation]               │
│                                     │
│ ┌─ Organisation 1 ───────────────┐  │
│ │ Name: Test Org                 │  │
│ │ [Mitglieder verwalten]         │  │
│ │ ┌─ Mitglieder ───────────────┐ │  │
│ │ │ user@example.com (Owner)   │ │  │
│ │ │ [Entfernen]                │ │  │
│ │ └────────────────────────────┘ │  │
│ └─────────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Projekterstellung
```
┌─────────────────────────────────────┐
│ Neues Projekt                       │
├─────────────────────────────────────┤
│ Projektname: [______________]       │
│ Beschreibung: [________________]    │
│ Arbeitsweise: [Dropdown]            │
│ Organisation: [Dropdown]            │
│                                     │
│ [Anlegen] [Abbrechen]               │
└─────────────────────────────────────┘
```

## Workflow

### 1. Organisation erstellen
1. Benutzer geht zu `/profile`
2. Klickt auf "+ Neue Organisation"
3. Füllt Name und Beschreibung aus
4. Organisation wird erstellt, Benutzer wird automatisch Owner

### 2. Mitglieder hinzufügen
1. Owner/Admin klickt auf "Mitglieder verwalten"
2. Gibt E-Mail-Adresse und Rolle ein
3. Benutzer wird zur Organisation hinzugefügt

### 3. Projekt mit Organisation erstellen
1. Benutzer erstellt neues Projekt
2. Wählt Organisation aus Dropdown
3. Alle Organisationsmitglieder können am Projekt arbeiten

## Technische Details

### Storage Bucket
- **Bucket**: `user-uploads`
- **Ordner**: `profile-images/`
- **Dateiname**: `{user_id}-{timestamp}.{extension}`

### Metadaten-Speicherung
- Profildaten werden in `auth.users.user_metadata` gespeichert
- Automatische Synchronisation mit Supabase Auth

### Berechtigungsprüfung
- Alle Datenbankabfragen verwenden RLS
- Automatische Filterung basierend auf Organisationsmitgliedschaft

## Migration

### 1. Datenbank-Setup
```bash
# SQL-Skript ausführen
psql -d your_database -f database_organizations.sql
```

### 2. Storage Bucket erstellen
```bash
# In Supabase Dashboard
# Storage > Create bucket: user-uploads
# RLS aktivieren
```

### 3. RLS-Policies aktivieren
- Alle Tabellen haben bereits RLS aktiviert
- Policies sind im SQL-Skript definiert

## Zukünftige Erweiterungen

### Mögliche Features
- **Organisations-Logos** hochladen
- **Einladungslinks** für Organisationen
- **Organisations-Einstellungen** (Privatsphäre, etc.)
- **Projekt-Templates** für Organisationen
- **Organisations-Statistiken** und Berichte

### Performance-Optimierungen
- **Caching** von Organisationsdaten
- **Lazy Loading** für große Mitgliederlisten
- **Pagination** für Projekte

## Troubleshooting

### Häufige Probleme

#### 1. "Keine Organisationen gefunden"
- Prüfen Sie, ob der Benutzer Mitglied einer Organisation ist
- Prüfen Sie die RLS-Policies

#### 2. "Fehler beim Hochladen des Profilbilds"
- Prüfen Sie Storage Bucket-Berechtigungen
- Prüfen Sie Dateigröße und -format

#### 3. "Benutzer kann nicht hinzugefügt werden"
- Prüfen Sie E-Mail-Adresse
- Prüfen Sie, ob Benutzer bereits existiert
- Prüfen Sie Admin/Owner-Berechtigungen

### Debugging
```javascript
// Organisationsmitgliedschaft prüfen
const { data, error } = await supabase
  .from('organization_members')
  .select('*')
  .eq('user_id', user.id);

console.log('Organisationsmitgliedschaften:', data);
```

## Fazit

Das Organisations- und Profilsystem bietet eine solide Grundlage für kollaborative Arbeit an ethnographischen Projekten. Es ermöglicht flexible Teamstrukturen und erweitert die bestehende Projektverwaltung um wichtige soziale Funktionen.
