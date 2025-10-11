# Audio-Upload Storage Setup

## Problem
Wenn Sie den Fehler "mime type audio/... is not supported" erhalten, liegt das an den MIME-Type-Einschränkungen im Supabase Storage Bucket.

## Lösung

### Option 1: Allowed MIME Types im Bucket konfigurieren (Empfohlen)

1. **Gehen Sie zu Ihrem Supabase Dashboard**
2. Navigieren Sie zu **Storage** → **Buckets**
3. Finden Sie den Bucket `documentation-files`
4. Klicken Sie auf das **Zahnrad-Icon** (Settings) neben dem Bucket
5. Scrollen Sie zu **"Allowed MIME types"**
6. Fügen Sie folgende MIME-Types hinzu:

```
image/*
video/*
audio/*
application/pdf
```

**Oder spezifischer für Audio:**
```
image/*
video/*
audio/mpeg
audio/mp4
audio/ogg
audio/wav
audio/webm
audio/x-m4a
application/pdf
```

7. Klicken Sie auf **Save**

### Option 2: Bucket neu erstellen (Falls Bucket nicht existiert)

Wenn der `documentation-files` Bucket noch nicht existiert, erstellen Sie ihn:

1. Gehen Sie zu **Storage** → **Buckets**
2. Klicken Sie auf **New Bucket**
3. Füllen Sie die Felder aus:
   - **Name**: `documentation-files`
   - **Public bucket**: ❌ **Deaktiviert** (verwenden Sie Signed URLs)
   - **File size limit**: 50MB (oder nach Bedarf)
   - **Allowed MIME types**: Siehe oben
4. Klicken Sie auf **Create bucket**

### Option 3: RLS Policies hinzufügen

Stellen Sie sicher, dass die richtigen RLS Policies vorhanden sind:

```sql
-- Erlaubt authentifizierten Benutzern, Dateien hochzuladen
CREATE POLICY "Authenticated users can upload documentation files" 
ON storage.objects
FOR INSERT 
WITH CHECK (
    bucket_id = 'documentation-files' AND 
    auth.uid() IS NOT NULL
);

-- Erlaubt authentifizierten Benutzern, ihre Dateien zu lesen
CREATE POLICY "Authenticated users can read documentation files" 
ON storage.objects
FOR SELECT 
USING (
    bucket_id = 'documentation-files' AND 
    auth.uid() IS NOT NULL
);

-- Erlaubt authentifizierten Benutzern, Dateien zu löschen
CREATE POLICY "Authenticated users can delete documentation files" 
ON storage.objects
FOR DELETE 
USING (
    bucket_id = 'documentation-files' AND 
    auth.uid() IS NOT NULL
);
```

### Option 4: Temporäre permissive Policy (nur für Debugging)

**⚠️ NUR FÜR TESTS VERWENDEN!**

```sql
-- Entferne alle bestehenden Policies
DROP POLICY IF EXISTS "Authenticated users can upload documentation files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read documentation files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documentation files" ON storage.objects;

-- Erstelle eine sehr permissive Policy (nur für Debugging!)
CREATE POLICY "Allow all documentation file operations" 
ON storage.objects
FOR ALL 
USING (bucket_id = 'documentation-files');
```

## Testing

Nach der Konfiguration:

1. **Laden Sie die Webseite neu** (Hard Refresh: Strg + F5)
2. **Erstellen Sie ein Interview**
3. **Starten Sie eine Audio-Aufnahme**
4. **Speichern Sie die Aufnahme**
5. **Prüfen Sie die Browser-Konsole** für Fehler

### Erwartete Console-Logs:

```
Using MIME type: audio/mpeg
Uploading audio file: audio-1234567890-interview-audio-1234567890.mp3 audio/mpeg 245678
Audio upload successful: audio-1234567890-interview-audio-1234567890.mp3
```

**Hinweis:** In den meisten Browsern wird jetzt MP3 (audio/mpeg) verwendet, da dies das bevorzugte Format ist.

## Häufige Probleme

### "Bucket not found"
- Erstellen Sie den Bucket `documentation-files`
- Prüfen Sie die Schreibweise

### "Permission denied"
- Fügen Sie die RLS Policies hinzu (siehe Option 3)
- Stellen Sie sicher, dass der Benutzer eingeloggt ist

### "File too large"
- Erhöhen Sie das File size limit im Bucket auf mindestens 50MB
- Oder reduzieren Sie die Aufnahmequalität

### "mime type ... is not supported"
- Fügen Sie `audio/*` zu den erlaubten MIME-Types hinzu (siehe Option 1)
- Oder entfernen Sie die MIME-Type-Einschränkung komplett (leer lassen)

## Sicherheitshinweise

- **Für Produktion:** Verwenden Sie spezifische RLS Policies (Option 3)
- **Dateigröße begrenzen:** Setzen Sie ein vernünftiges Limit (z.B. 50MB)
- **MIME-Types einschränken:** Erlauben Sie nur benötigte Typen
- **Signed URLs verwenden:** Halten Sie den Bucket privat und verwenden Sie Signed URLs

## Code-Änderungen

Der Code wurde bereits angepasst, um:
1. ✅ Verschiedene Audio-Formate zu unterstützen (mp4, mp3, ogg, webm)
2. ✅ Automatisch das beste unterstützte Format zu wählen
3. ✅ Ohne contentType-Parameter hochzuladen (wie normale Dateien)
4. ✅ Korrekte Dateiendungen zu generieren

## Browser-Support

| Browser | Bevorzugtes Audio-Format | Fallback |
|---------|-------------------------|----------|
| Chrome  | **audio/mpeg (MP3)** ✅ | audio/ogg, audio/mp4 |
| Firefox | **audio/mpeg (MP3)** ✅ | audio/ogg |
| Safari  | **audio/mpeg (MP3)** ✅ | audio/mp4 |
| Edge    | **audio/mpeg (MP3)** ✅ | audio/ogg, audio/mp4 |

**Alle modernen Browser unterstützen MP3**, sodass dieses Format in der Regel verwendet wird.

### Format-Priorität:
1. 🥇 **MP3** (audio/mpeg) - Universell, kleine Dateigröße, beste Kompatibilität
2. 🥈 **OGG** (audio/ogg) - Gute Qualität, Open Source
3. 🥉 **MP4** (audio/mp4) - Container-Format, gute Qualität
4. **WebM** - Gut für Web, aber weniger kompatibel außerhalb des Browsers
5. **WAV** - Unkomprimiert, sehr große Dateien

