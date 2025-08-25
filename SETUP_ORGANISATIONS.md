# Setup-Anleitung: Organisations- und Profilsystem

## Übersicht
Dieses System ermöglicht es Benutzern, Profile zu verwalten und Organisationen zu erstellen, um gemeinsam an Projekten zu arbeiten.

## Wichtige Änderungen
- **Profilinformationen** werden in `auth.users.user_metadata` gespeichert (nicht in direkten Tabellenspalten)
- **Organisationen** werden in separaten Tabellen verwaltet
- **Projekte** können Organisationen zugeordnet werden

## 1. Datenbank-Setup

### SQL-Skript ausführen
Führen Sie das SQL-Skript `database_organizations.sql` in Ihrem Supabase SQL Editor aus:

```sql
-- Das Skript erstellt:
-- - organizations Tabelle
-- - organization_members Tabelle  
-- - Erweitert projekte um organization_id
-- - RLS Policies für Sicherheit
-- - Hilfsfunktionen für Mitgliederverwaltung
```

**Hinweis:** Das Skript verwendet `user_metadata` für Profilinformationen, daher sind keine `ALTER TABLE auth.users` Befehle erforderlich.

## 2. Storage Bucket erstellen

### Profilbilder-Bucket
Erstellen Sie einen neuen Storage Bucket in Ihrem Supabase Dashboard:

1. Gehen Sie zu **Storage** → **Buckets**
2. Klicken Sie auf **New Bucket**
3. Name: `profile-images`
4. Public bucket: ✅ **Aktiviert**
5. Klicken Sie auf **Create bucket**

### RLS Policy für Storage
Fügen Sie diese RLS Policy für den `profile-images` Bucket hinzu:

```sql
-- Erlaubt Benutzern, ihre eigenen Profilbilder hochzuladen
CREATE POLICY "Users can upload their own profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Erlaubt allen, Profilbilder zu sehen (da public bucket)
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');

-- Erlaubt Benutzern, ihre eigenen Profilbilder zu löschen
CREATE POLICY "Users can delete their own profile images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
```

## 3. Frontend-Komponenten

### Neue Dateien
- `src/app/profile/page.tsx` - Profil- und Organisationsverwaltung
- `src/app/projekte/components/OrganizationSelector.tsx` - Organisationsauswahl beim Projekterstellen

### Geänderte Dateien
- `src/app/SidebarNav.tsx` - Link zu Profilseite hinzugefügt
- `src/app/projekte/components/NewProjectForm.tsx` - Organisationsauswahl integriert
- `src/app/projekte/components/ProjektePage.tsx` - Organisationsprojekte werden angezeigt

## 4. Funktionalitäten

### Benutzerprofile
- **Profilbild hochladen** - Bilder werden in `profile-images` Bucket gespeichert
- **Anzeigename bearbeiten** - Wird in `user_metadata.display_name` gespeichert
- **Bio bearbeiten** - Wird in `user_metadata.bio` gespeichert

### Organisationen
- **Organisation erstellen** - Benutzer werden automatisch als Owner hinzugefügt
- **Mitglieder hinzufügen** - Über E-Mail-Adresse, verschiedene Rollen möglich
- **Mitglieder entfernen** - Nur Owner/Admin können Mitglieder entfernen

### Projektzuordnung
- **Projekte Organisationen zuweisen** - Beim Erstellen oder Bearbeiten
- **Organisationsprojekte anzeigen** - Alle Mitglieder sehen Projekte ihrer Organisationen

## 5. Sicherheit

### Row Level Security (RLS)
- **Organisationen**: Nur Mitglieder können lesen, Owner/Admin können bearbeiten
- **Organisationsmitglieder**: Nur Mitglieder können sehen, Owner/Admin können verwalten
- **Projekte**: Erweitert um Organisationszugriff
- **Storage**: Benutzer können nur ihre eigenen Profilbilder verwalten

### Rollen
- **Owner**: Kann alles in der Organisation verwalten
- **Admin**: Kann Mitglieder verwalten und Projekte bearbeiten
- **Member**: Kann Projekte der Organisation sehen und bearbeiten

## 6. Testing

### Profilfunktionen testen
1. Gehen Sie zu `/profile`
2. Laden Sie ein Profilbild hoch
3. Bearbeiten Sie Anzeigename und Bio
4. Speichern Sie die Änderungen

### Organisationsfunktionen testen
1. Erstellen Sie eine neue Organisation
2. Fügen Sie einen anderen Benutzer hinzu (E-Mail-Adresse)
3. Testen Sie verschiedene Rollen
4. Entfernen Sie ein Mitglied

### Projektzuordnung testen
1. Erstellen Sie ein neues Projekt
2. Weisen Sie es einer Organisation zu
3. Prüfen Sie, ob andere Organisationsmitglieder es sehen können

## 7. Troubleshooting

### Häufige Probleme

**"Bucket nicht gefunden"**
- Stellen Sie sicher, dass der `profile-images` Bucket existiert
- Prüfen Sie, ob der Bucket öffentlich ist

**"Keine Berechtigung"**
- Prüfen Sie die RLS Policies
- Stellen Sie sicher, dass der Benutzer Mitglied der Organisation ist

**"Profilbild wird nicht angezeigt"**
- Prüfen Sie die Storage RLS Policies
- Stellen Sie sicher, dass die URL korrekt ist

### Debugging
- Überprüfen Sie die Browser-Konsole für Fehler
- Prüfen Sie die Supabase Logs
- Testen Sie die RLS Policies direkt in der SQL-Konsole

## 8. Erweiterte Konfiguration

### Benutzerdefinierte Rollen
Sie können weitere Rollen hinzufügen, indem Sie die CHECK-Constraint in der `organization_members` Tabelle erweitern.

### Zusätzliche Profilfelder
Fügen Sie neue Felder zu `user_metadata` hinzu und erweitern Sie die ProfilePage-Komponente entsprechend.

### Organisationslogos
Erweitern Sie das System um Organisationslogos, ähnlich wie Profilbilder.
