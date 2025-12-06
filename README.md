# 🇩🇪 DeutschHero – Multilingual German Learning Platform

**DeutschHero** ist eine moderne, vollständig mehrsprachige Lernplattform für Deutsch als Fremdsprache.  
Das Projekt wurde entwickelt, um Deutschlernen einfach, visuell klar und schnell zugänglich zu machen – ohne Installation, ohne Login, komplett im Browser.

Die Plattform unterstützt mehrere Sprachen (Arabisch, Englisch, Ukrainisch, Russisch, Türkisch, Persisch, Afghanisch) und basiert auf einer modularen JSON-Struktur, damit Inhalte leicht erweiterbar bleiben.

---

## 🌍 Hauptfunktionen

### 🔹 Mehrsprachige Benutzeroberfläche  
- Dynamische Sprachauswahl  
- Oberfläche, Lektionen, Grammatik und Vokabeln passen sich der gewählten Sprache an  
- Alle Texte werden aus externen JSON-Dateien geladen

### 🔹 Lerninhalte mit klarem Aufbau  
Jede Lektion enthält:
- Kurze Erklärungen  
- Beispiele  
- Tipps (echte Hinweise, keine generischen Sätze)  
- Mini-Zusammenfassungen  
- Übungsteile  

### 🔹 JSON-basiertes Content-System  
- Alle Sprachdateien liegen in `data/*.json`  
- Inhalte können ohne Änderung am JavaScript erweitert werden  
- Strukturierte und skalierbare Architektur

### 🔹 Responsives, mobiles Design  
- Perfekt für Handy, Tablet und Laptop  
- Keine Frameworks → schnelle Performance  
- Klare Typografie und angenehme UI

### 🔹 Reines Frontend (HTML, CSS, JS)  
- Kein Backend notwendig  
- Kein Framework (React/Vue) – bewusst leicht und performant  
- Funktioniert sofort über GitHub Pages + Custom Domain

---

## 🛠 Verwendete Technologien

| Technologie | Zweck |
|------------|-------|
| **HTML5** | Struktur der Seiten |
| **CSS3** | Layout, Farben, Animationen |
| **JavaScript (ES6)** | Logik, Datenhandling, dynamische Sprache |
| **JSON** | Sprachdateien + Lektionen |
| **GitHub Pages** | Deployment / Hosting |
| **Custom Domain** | https://deutschhero.com |

---

## 📁 Projektstruktur

```
deutsch-hero-frontend/
├── index.html
├── style.css
├── main.js
├── assets/
│   └── flags, icons, images
└── data/
    ├── lessons-ar.json
    ├── lessons-en.json
    ├── lessons-ru.json
    ├── lessons-uk.json
    ├── lessons-fa.json
    ├── lessons-af.json
    ├── lessons-tr.json
    └── ...
```

---

## 🔧 Installation & Lokale Ausführung

```bash
git clone https://github.com/abbas-cyber999/deutsch-hero-frontend
```

Danach:
- Öffne einfach **index.html** im Browser  
→ Die Seite lädt sofort, keine Installation notwendig.

---

## 🌐 Live-Version

Die Produktionsversion läuft unter der eigenen Domain:

👉 **https://deutschhero.com**

Hosting über GitHub Pages mit korrekt eingerichteten A-Records und CNAME.

---

## 🚀 geplante Verbesserungen  
- Neue Übungen (Matching, Multiple Choice, Drag & Drop)  
- Fortschrittsanzeige für jedes Level  
- Audio-Lernmodule  
- Offline-Modus (Service Worker)  
- Neue Lektionen für A1 bis C1  
- System für Tipps/Fehlererkennung  
- Dashboard für Lernfortschritt  

---

## 👤 Autor

**Abbas Alhasan**  
Angehender Fachinformatiker AE (Umschulung seit 01.06.2025)  
Fokus: Frontend, Backend-Grundlagen, AI/ML, Python, JavaScript

GitHub: https://github.com/abbas-cyber999  
Domain: https://deutschhero.com

