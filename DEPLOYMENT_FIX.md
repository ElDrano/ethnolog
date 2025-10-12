# Fix: Dynamic Routes auf Vercel/Production

## Problem
Die dynamischen Routen (`/projekte/[id]`) funktionieren lokal, aber nicht auf der deployed Domain.

## Lösung

### 1. Dateien wurden angepasst:

#### `vercel.json` (neu erstellt)
Routing-Regeln für Vercel, damit URLs wie `/projekte/abc123` richtig funktionieren.

#### `src/app/projekte/[id]/page.tsx`
- `export const dynamic = 'force-dynamic'` hinzugefügt
- Erzwingt dynamisches Rendering statt statischer Generierung

### 2. Deployment-Schritte:

#### **Option A: Automatisches Deployment (empfohlen)**
```bash
# 1. Änderungen committen
git add .
git commit -m "Fix: Add dynamic routing for production"

# 2. Pushen (löst automatisches Vercel Deployment aus)
git push
```

#### **Option B: Manuelles Deployment**
```bash
# 1. Vercel CLI installieren (falls noch nicht vorhanden)
npm install -g vercel

# 2. Deployen
vercel --prod
```

### 3. Nach dem Deployment testen:

1. **Gehen Sie zur Projektliste:**
   ```
   https://ihre-domain.com/projekte
   ```

2. **Klicken Sie auf ein Projekt**
   - URL sollte sich ändern zu: `https://ihre-domain.com/projekte/550e8400...`

3. **Drücken Sie F5 (Reload)**
   - ✅ Seite sollte jetzt laden (nicht 404)

4. **Kopieren Sie die URL und öffnen Sie in neuem Tab**
   - ✅ Sollte direkt zum Projekt gehen

### 4. Falls es immer noch nicht funktioniert:

#### **Cache-Problem:**
```bash
# Löschen Sie den Vercel Build Cache
vercel --prod --force
```

#### **Browser-Cache:**
- Öffnen Sie Developer Tools (F12)
- Rechtsklick auf Reload-Button
- "Empty Cache and Hard Reload"

#### **Vercel Dashboard prüfen:**
1. Gehen Sie zu [vercel.com/dashboard](https://vercel.com/dashboard)
2. Klicken Sie auf Ihr Projekt
3. Gehen Sie zu "Deployments"
4. Klicken Sie auf das neueste Deployment
5. Prüfen Sie die "Build Logs" auf Fehler

### 5. Debugging:

#### **Prüfen Sie die Build-Logs:**
```
Look for: "Creating an optimized production build"
Should see: "○ /projekte/[id]"  (○ = dynamisch)
```

#### **404 vs. 500 Fehler:**
- **404:** Routing-Problem → vercel.json sollte helfen
- **500:** Fehler im Code → Prüfen Sie Server-Logs

#### **Supabase Environment Variables:**
Stellen Sie sicher, dass in Vercel die Umgebungsvariablen gesetzt sind:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 6. Alternative Lösung (falls nichts funktioniert):

Falls die dynamischen Routen partout nicht funktionieren, können wir auf Query-Parameter umsteigen:

```
Statt: /projekte/abc123
Nutze: /projekte?id=abc123
```

Das würde immer funktionieren, ist aber weniger elegant.

## Technische Details

### Was macht `vercel.json`?
```json
{
  "rewrites": [
    {
      "source": "/projekte/:id",
      "destination": "/projekte/[id]"
    }
  ]
}
```
- Sagt Vercel: "URLs wie `/projekte/abc123` sollten an die `[id]` Route weitergeleitet werden"
- Ohne diese Regel denkt Vercel, `/projekte/abc123` ist eine statische Datei (404)

### Was macht `export const dynamic = 'force-dynamic'`?
- Verhindert statische Generierung zur Build-Zeit
- Erzwingt Server-Side Rendering (SSR) bei jedem Request
- Wichtig für Seiten mit User-spezifischen Daten

### Next.js Build Output:
```
Route (app)                                Size     Type
┌ ○ /projekte                             123 kB   Dynamic
└ ○ /projekte/[id]                        145 kB   Dynamic

○ (Dynamic)  server-rendered on demand
```

## Vercel Deployment Checklist:

- [x] `vercel.json` erstellt
- [x] `dynamic = 'force-dynamic'` hinzugefügt
- [ ] Code gepusht zu Git
- [ ] Deployment abgewartet
- [ ] Cache geleert
- [ ] Getestet

## Support

Falls es weiterhin nicht funktioniert:
1. Prüfen Sie die Vercel Build Logs
2. Prüfen Sie die Browser Console (F12) auf Fehler
3. Teilen Sie mir die spezifische Fehlermeldung mit

Die Änderungen sollten nach dem nächsten Deployment funktionieren! 🚀

