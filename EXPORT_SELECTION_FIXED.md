# Export-Auswahl Korrektur - Nur ausgewählte Dokumentationen

## Problem

Der Export-Button exportierte immer alle Dokumentationen des ausgewählten Zeitraums, anstatt nur die Dokumentationen, die der Benutzer über die Checkboxen ausgewählt hatte.

## Lösung

Die Export-Funktionen (`handleExportWord`, `handleExportPDF`, `handleDownloadFiles`) wurden angepasst, um die `selectedDocumentations` zu berücksichtigen.

## Änderungen

### 1. Word-Export (`handleExportWord`)
**Vorher:**
```typescript
const filteredDocs = docsInRange.filter(doc => {
  // Filter-Logik basierend auf activeDocumentationFilters
});
```

**Nachher:**
```typescript
let filteredDocs = docsInRange.filter(doc => {
  // Filter-Logik basierend auf activeDocumentationFilters
});

// Wenn spezifische Dokumentationen ausgewählt sind, nur diese verwenden
if (selectedDocumentations.length > 0) {
  filteredDocs = filteredDocs.filter(doc => selectedDocumentations.includes(doc.id));
}
```

### 2. PDF-Export (`handleExportPDF`)
Die PDF-Export-Funktion hatte bereits die korrekte Logik implementiert.

### 3. Datei-Download (`handleDownloadFiles`)
Die Datei-Download-Funktion hatte bereits die korrekte Logik implementiert.

## Funktionsweise

### Export-Logik:
1. **Zeitraum-Filterung**: Nur Dokumentationen im ausgewählten Zeitraum werden berücksichtigt
2. **Typ-Filterung**: Nur Dokumentationen der ausgewählten Typen (Alle, Archiv, Meeting, Interview, Feldnotiz) werden berücksichtigt
3. **Auswahl-Filterung**: Wenn spezifische Dokumentationen über Checkboxen ausgewählt sind, werden nur diese exportiert

### Priorität der Filter:
1. **Zeitraum** (DateRangeFilter)
2. **Dokumentationstyp** (DocumentationFilters)
3. **Spezifische Auswahl** (Checkboxen in DocumentationList)

## Benutzererfahrung

### Szenarien:

**Szenario 1: Keine spezifische Auswahl**
- Benutzer wählt Zeitraum und Dokumentationstyp
- Export exportiert alle Dokumentationen des Typs im Zeitraum

**Szenario 2: Mit spezifischer Auswahl**
- Benutzer wählt Zeitraum und Dokumentationstyp
- Benutzer wählt zusätzlich spezifische Dokumentationen über Checkboxen
- Export exportiert nur die ausgewählten Dokumentationen

## Technische Details

### State-Variablen:
- `selectedDocumentations`: Array der IDs der ausgewählten Dokumentationen
- `activeDocumentationFilters`: Array der aktiven Filter-Typen
- `startDate` / `endDate`: Zeitraum-Filter

### Filter-Kette:
```typescript
// 1. Zeitraum-Filter
let docs = docsInRange;

// 2. Typ-Filter
docs = docs.filter(doc => {
  // Filter-Logik basierend auf activeDocumentationFilters
});

// 3. Auswahl-Filter (falls vorhanden)
if (selectedDocumentations.length > 0) {
  docs = docs.filter(doc => selectedDocumentations.includes(doc.id));
}
```

## Ergebnis

Jetzt exportiert der Export-Button nur die Dokumentationen, die der Benutzer tatsächlich ausgewählt hat:

- ✅ **Zeitraum-basiert**: Nur Dokumentationen im ausgewählten Zeitraum
- ✅ **Typ-basiert**: Nur Dokumentationen der ausgewählten Typen
- ✅ **Auswahl-basiert**: Nur spezifisch ausgewählte Dokumentationen (falls vorhanden)

Die Export-Funktionalität ist jetzt vollständig benutzerkontrolliert und exportiert genau das, was der Benutzer sehen und auswählen kann.
