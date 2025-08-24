# Tag-System Setup

## Übersicht

Das erweiterte Tag-System ermöglicht es Benutzern, sowohl neue Tags zu erstellen als auch bereits vorhandene Tags aus einer Dropdown-Liste auszuwählen. Die vordefinierten Tags "formell", "informell" und "extern" werden automatisch zur Verfügung gestellt.

## Neue Funktionen

1. **Dropdown-Vorschläge**: Beim Tippen werden passende Tags aus der Datenbank vorgeschlagen
2. **Neue Tags erstellen**: Benutzer können neue Tags erstellen, die automatisch in der Datenbank gespeichert werden
3. **Vordefinierte Tags**: Die Tags "formell", "informell" und "extern" sind standardmäßig verfügbar
4. **Autocomplete**: Intelligente Vorschläge basierend auf der Eingabe

## Datenbank-Setup

### 1. Supabase SQL Editor öffnen

1. Gehen Sie zu Ihrer Supabase-Projekt-Dashboard
2. Navigieren Sie zu "SQL Editor"
3. Erstellen Sie eine neue Abfrage

### 2. SQL-Skript ausführen

Kopieren Sie den Inhalt der Datei `database_setup.sql` und führen Sie ihn im SQL Editor aus.

### 3. Überprüfung

Nach der Ausführung sollten Sie:
- Eine neue Tabelle `available_tags` haben
- Die vordefinierten Tags "formell", "informell" und "extern" in der Tabelle sehen
- Row Level Security (RLS) aktiviert haben

## Komponenten

### TagInput.tsx
Die neue Komponente `TagInput.tsx` ersetzt das einfache Tag-Eingabefeld und bietet:
- Dropdown mit Tag-Vorschlägen
- Möglichkeit, neue Tags zu erstellen
- Automatische Synchronisation mit der Datenbank
- Benutzerfreundliche Oberfläche

### Integration
Die `DocumentationForm.tsx` wurde aktualisiert, um die neue `TagInput`-Komponente zu verwenden.

## Verwendung

1. **Tags auswählen**: Tippen Sie in das Tag-Eingabefeld und wählen Sie aus den Vorschlägen
2. **Neue Tags erstellen**: Tippen Sie einen neuen Tag-Namen und drücken Sie Enter oder klicken Sie auf "Neuen Tag erstellen"
3. **Tags entfernen**: Klicken Sie auf das "×" Symbol neben einem Tag

## Technische Details

- **Datenbank**: PostgreSQL mit Supabase
- **Tabelle**: `available_tags` mit Spalten `id`, `name`, `created_at`, `updated_at`
- **Sicherheit**: Row Level Security (RLS) aktiviert
- **Performance**: Index auf der `name` Spalte für schnelle Suche

## Fehlerbehebung

### Tags werden nicht geladen
- Überprüfen Sie die Supabase-Verbindung
- Stellen Sie sicher, dass die `available_tags` Tabelle existiert
- Prüfen Sie die Browser-Konsole auf Fehler

### Neue Tags können nicht erstellt werden
- Überprüfen Sie die RLS-Policies
- Stellen Sie sicher, dass der Benutzer authentifiziert ist
- Prüfen Sie die Supabase-Logs

### Dropdown wird nicht angezeigt
- Überprüfen Sie die CSS-Styles
- Stellen Sie sicher, dass die Komponente korrekt importiert ist
- Prüfen Sie die Browser-Konsole auf JavaScript-Fehler
