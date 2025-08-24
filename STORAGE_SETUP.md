# Storage-Einrichtung für Profilbilder

## Problem
Der Fehler beim Hochladen von Profilbildern deutet darauf hin, dass der Storage Bucket oder die RLS-Policies nicht korrekt eingerichtet sind.

## Schritt-für-Schritt Einrichtung

### 1. Storage Bucket erstellen

1. Gehen Sie zu Ihrem **Supabase Dashboard**
2. Navigieren Sie zu **Storage** → **Buckets**
3. Klicken Sie auf **New Bucket**
4. Füllen Sie die Felder aus:
   - **Name**: `profile-images`
   - **Public bucket**: ✅ **Aktiviert** (wichtig!)
   - **File size limit**: 5MB (oder nach Bedarf)
   - **Allowed MIME types**: `image/*`
5. Klicken Sie auf **Create bucket**

### 2. RLS-Policies hinzufügen

Führen Sie das SQL-Skript `setup_storage_policies.sql` in Ihrem Supabase SQL Editor aus:

```sql
-- Erlaubt allen authentifizierten Benutzern, Profilbilder hochzuladen
CREATE POLICY "Users can upload profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-images' AND 
        auth.uid() IS NOT NULL
    );

-- Erlaubt allen, Profilbilder zu sehen (da public bucket)
CREATE POLICY "Profile images are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');

-- Erlaubt Benutzern, ihre eigenen Profilbilder zu löschen
CREATE POLICY "Users can delete their own profile images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-images' AND 
        auth.uid() IS NOT NULL
    );
```

### 3. Alternative: Sehr permissive Policy (nur für Debugging)

Falls die obigen Policies nicht funktionieren, können Sie temporär eine sehr permissive Policy verwenden:

```sql
-- Entferne alle bestehenden Policies für profile-images
DROP POLICY IF EXISTS "Users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- Erstelle eine sehr permissive Policy (nur für Debugging!)
CREATE POLICY "Allow all profile image operations" ON storage.objects
    FOR ALL USING (bucket_id = 'profile-images');
```

**⚠️ Wichtig**: Diese permissive Policy sollte nur für Debugging verwendet werden und später durch sicherere Policies ersetzt werden.

### 4. Testing

1. Gehen Sie zu `/profile`
2. Wählen Sie ein Bild aus
3. Klicken Sie auf "Hochladen"
4. Überprüfen Sie die Browser-Konsole für detaillierte Fehlermeldungen

### 5. Häufige Probleme

#### "Bucket not found"
- Stellen Sie sicher, dass der Bucket `profile-images` existiert
- Prüfen Sie die Schreibweise (Groß-/Kleinschreibung)

#### "Permission denied"
- Prüfen Sie, ob die RLS-Policies korrekt angewendet wurden
- Stellen Sie sicher, dass der Benutzer authentifiziert ist

#### "File too large"
- Erhöhen Sie das File size limit im Bucket
- Oder komprimieren Sie das Bild vor dem Upload

#### "Invalid MIME type"
- Stellen Sie sicher, dass `image/*` in den erlaubten MIME-Types steht
- Oder spezifizieren Sie konkrete Typen: `image/jpeg,image/png,image/gif`

### 6. Debugging

Die verbesserte ProfilePage-Komponente zeigt jetzt detaillierte Fehlermeldungen in der Browser-Konsole an. Überprüfen Sie:

1. **Upload error**: Zeigt den spezifischen Upload-Fehler
2. **Update user error**: Zeigt Fehler beim Aktualisieren der Benutzer-Metadaten
3. **Public URL**: Zeigt die generierte öffentliche URL

### 7. Sicherheitshinweise

- Verwenden Sie die permissive Policy nur temporär für Debugging
- Implementieren Sie später eine sicherere Policy, die Benutzer nur ihre eigenen Bilder verwalten lässt
- Überlegen Sie, ob Sie eine Bildkomprimierung vor dem Upload implementieren möchten
