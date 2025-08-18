# 🎨 Professionelle Farbpalette - Ethnomethoden

## 🌟 **Übersicht**
Neue professionelle Farbpalette mit Blautönen als Hauptfarbe, die sich durch beide Themes (Light/Dark) zieht.

## 🔵 **Primärfarben (Blau)**

### **Light Mode**
- **Primary Blue**: `#2563eb` - Hauptfarbe für Buttons, Links, Akzente
- **Primary Blue Light**: `#3b82f6` - Hover-Zustände
- **Primary Blue Dark**: `#1d4ed8` - Active-Zustände
- **Secondary Blue**: `#dbeafe` - Hintergründe, Subtle-Akzente
- **Accent Blue**: `#60a5fa` - Zusätzliche Akzente

### **Dark Mode**
- **Primary Blue**: `#3b82f6` - Hauptfarbe (heller für besseren Kontrast)
- **Primary Blue Light**: `#60a5fa` - Hover-Zustände
- **Primary Blue Dark**: `#2563eb` - Active-Zustände
- **Secondary Blue**: `#1e3a8a` - Hintergründe
- **Accent Blue**: `#93c5fd` - Zusätzliche Akzente

## 🎯 **UI-Farben**

### **Light Mode**
- **Background**: `#ffffff` - Haupthintergrund
- **Surface**: `#f8fafc` - Karten, Container
- **Surface Hover**: `#f1f5f9` - Hover-Zustände
- **Border**: `#e2e8f0` - Rahmen, Trennlinien
- **Border Focus**: `#3b82f6` - Fokus-Zustände

### **Dark Mode**
- **Background**: `#0f172a` - Haupthintergrund (dunkel)
- **Surface**: `#1e293b` - Karten, Container
- **Surface Hover**: `#334155` - Hover-Zustände
- **Border**: `#334155` - Rahmen, Trennlinien
- **Border Focus**: `#60a5fa` - Fokus-Zustände

## 📝 **Text-Farben**

### **Light Mode**
- **Text Primary**: `#1e293b` - Haupttext
- **Text Secondary**: `#64748b` - Sekundärer Text
- **Text Muted**: `#94a3b8` - Abgeschwächter Text

### **Dark Mode**
- **Text Primary**: `#f8fafc` - Haupttext (weiß)
- **Text Secondary**: `#cbd5e1` - Sekundärer Text
- **Text Muted**: `#94a3b8` - Abgeschwächter Text

## 🎨 **Status-Farben**
- **Success**: `#10b981` - Erfolg, Bestätigung
- **Warning**: `#f59e0b` - Warnung, Hinweis
- **Error**: `#ef4444` - Fehler, Löschen

## 🌫️ **Schatten**
- **Shadow**: Subtile Schatten für Karten und Buttons
- **Shadow LG**: Stärkere Schatten für Hover-Effekte

## 🔧 **CSS-Variablen**

```css
:root {
  /* Light Mode */
  --primary-blue: #2563eb;
  --primary-blue-light: #3b82f6;
  --primary-blue-dark: #1d4ed8;
  --secondary-blue: #dbeafe;
  --accent-blue: #60a5fa;
  
  --background: #ffffff;
  --surface: #f8fafc;
  --surface-hover: #f1f5f9;
  --border: #e2e8f0;
  --border-focus: #3b82f6;
  
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
}

body:not(.light-mode) {
  /* Dark Mode */
  --primary-blue: #3b82f6;
  --primary-blue-light: #60a5fa;
  --primary-blue-dark: #2563eb;
  --secondary-blue: #1e3a8a;
  --accent-blue: #93c5fd;
  
  --background: #0f172a;
  --surface: #1e293b;
  --surface-hover: #334155;
  --border: #334155;
  --border-focus: #60a5fa;
  
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
}
```

## 🎯 **Verwendung**

### **Buttons**
- **Primary**: `var(--primary-blue)` mit weißem Text
- **Secondary**: `var(--surface)` mit `var(--text-primary)`
- **Hover**: `var(--primary-blue-dark)` oder `var(--surface-hover)`

### **Karten & Container**
- **Background**: `var(--surface)`
- **Border**: `var(--border)`
- **Hover**: `var(--surface-hover)` + `var(--primary-blue)` Border

### **Formulare**
- **Input Background**: `var(--surface)`
- **Input Border**: `var(--border)`
- **Focus Border**: `var(--border-focus)`

### **Sidebar**
- **Background**: `var(--surface)`
- **Links**: `var(--text-secondary)` → `var(--primary-blue)` (Hover)
- **Active**: `var(--primary-blue)` mit weißem Text

## ✨ **Vorteile**

1. **Professionell**: Weniger bunt, eleganter Look
2. **Konsistent**: Blautöne ziehen sich durch beide Themes
3. **Zugänglich**: Gute Kontraste für Barrierefreiheit
4. **Skalierbar**: CSS-Variablen für einfache Anpassungen
5. **Modern**: Zeitgemäße Farbpalette mit Subtle-Effekten

## 🔄 **Theme-Switch**
- **Smooth Transitions**: 0.2s ease-in-out für alle Farbwechsel
- **Icons**: ☀️ für Light Mode, 🌙 für Dark Mode
- **Hover-Effekte**: Subtle Transformations und Schatten
