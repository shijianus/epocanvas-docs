---
title: Produktüberblick & Kernwerte
description: "Offizielles Produkthandbuch von EpoCanvas Docs – eine leistungsstarke statische Dokumentations-Site für Open-Source-Projekte: Produktpositionierung, Kernvorteile und die gelösten Probleme."
---

**EpoCanvas Docs** ist das offizielle technische Dokumentationssystem für das EpoCanvas-Open-Source-Ökosystem. Es basiert auf dem modernen Framework für statische Websites **Astro 5** und **Starlight** und soll Entwicklern eine Dokumentationsplattform bieten, die professionell gesetzt ist, schnell lädt, eine praktische Suche mitbringt und leicht zu pflegen ist.

Ob Benutzerhandbuch eines Produkts, API-Spezifikation oder Dokumentation einer Systemarchitektur – mit EpoCanvas Docs können sich Autorinnen und Autoren ganz auf das Schreiben von Markdown konzentrieren, während Leserinnen und Leser ein komfortables, natürliches Leseerlebnis erhalten.

---

## Welche Probleme tatsächlich gelöst werden

In der täglichen Entwicklung und im technischen Schreiben stoßen viele Teams bei der Pflege ihrer Dokumentation auf folgende Schwierigkeiten:

1. **Langsames Laden und hoher Speicherverbrauch**: Viele Dokumentationswerkzeuge liefern Seiten mit viel JavaScript-Laufzeitumgebung aus; auf dem Handy oder bei schwacher Verbindung öffnen sie langsam, und beim Scrollen langer Artikel ruckelt es leicht.
2. **Umständliche Navigation in langen Artikeln**: Übliche Dokumentations-Sites haben meist nur ein Menü links; bei mehrseitigen technischen Erklärungen mit tausenden Wörtern verliert man schnell den Überblick über die Gliederungsebenen innerhalb des Artikels.
3. **Suche mit Abhängigkeit von externen Diensten**: Übliche Cloud-Suchdienste wie Algolia erfordern eine separate Kontoanmeldung und die Konfiguration von Crawler-Schlüsseln; in Intranets ohne Zugriff auf externe Dienste fallen sie komplett aus.
4. **Mehrsprachigkeit nur zur Hälfte**: Manche Dokumentations-Sites werben mit Mehrsprachigkeit, in Wirklichkeit ist aber nur die Navigation übersetzt – im Artikeltext steht weiterhin der Originaltext; bei anderen fehlen Übersetzungen teils komplett und der Leser erhält direkt einen 404-Fehler und muss die URL selbst anpassen, um den Inhalt zu finden.

EpoCanvas Docs wurde genau entwickelt, um diese praktischen Probleme zu lösen.

---

## Kernfunktionen im Überblick

![Tatsächliches Rendering der Produkteinführungsseite von EpoCanvas Docs im Browser: Kategorienverzeichnis links, Haupttext in der Mitte, Inhaltsverzeichnis der Seite rechts](/images/canvas/ui-docs-reading.png)

*Abbildung: Tatsächliches Rendering der Produkteinführungsseite. Links das Dokumentations-Kategorienverzeichnis, in der Mitte der Haupttext, rechts die automatisch generierte Gliederung „Auf dieser Seite", die beim Scrollen den aktuellen Abschnitt hervorhebt.*

### 1. Klare dreispaltige Leseoberfläche

- **Navigationsleiste links**: Ordnet alle Dokumentkategorien nach Modulen, mit einklappbaren Ebenen; beim Seitenwechsel springt nichts.
- **Haupttext in der Mitte**: Maximale Breite des Haupttexts 60 rem, Zeilenabstand 1,68; Codeblöcke passen ihre Breite an – so ermüdet längeres Lesen weniger.
- **Gliederungsleiste rechts**: Erfasst automatisch die `h2`- und `h3`-Überschriften des Artikels und erzeugt daraus das Inhaltsverzeichnis „Auf dieser Seite"; die aktuelle Leseposition wird beim Scrollen hervorgehoben, ein Klick auf eine Überschrift springt sanft dorthin.

### 2. Zwei Suchmodi: Seite durchsuchen + Site-weite Suche

- **Aktuelle Seite durchsuchen**: Suchbegriff einfach ins Suchfeld oben eingeben – alle Treffer auf der Seite werden sofort hervorgehoben, mit einer Fortschrittsanzeige wie `3/9`; mit Enter springen Sie einzeln durch die Treffer.
- **Site-weites Suchfenster**: Mit `Strg + K` (auf dem Mac `Cmd + K`) öffnen Sie das globale Suchfenster, das auf dem statischen Pagefind-Index alle passenden Dokumente und Abschnittsvorschauen auflistet.
- Die gesamte Suchfunktion läuft lokal im Browser und hängt von keinem Backend-Dienst ab – sie funktioniert auch, wenn die Site in einem Intranet gehostet wird.

### 3. Vollständige Übersetzungen in 10 Sprachen

- Unterstützt werden 10 Sprachen: vereinfachtes Chinesisch, traditionelles Chinesisch, Englisch, Japanisch, Koreanisch, Spanisch, Französisch, Deutsch, Russisch und Portugiesisch. Navigation, Seitenleiste und der gesamte Dokumenttext liegen in jeder Sprache vollständig übersetzt vor.
- Über den Sprachknopf oben rechts gelangen Sie zur Sprachversion desselben Artikels; die URL trägt ein Sprachpräfix (z. B. `/en/canvas/`) und lässt sich direkt als Lesezeichen speichern oder an Kolleginnen und Kollegen in anderen Sprachen weitergeben.
- Fehlt für eine einzelne Seite die Übersetzung in einer Sprache, zeigt diese Seite automatisch den Standardinhalt auf Chinesisch an – es tritt kein 404-Fehler auf.

### 4. Professionelle Markdown- und Code-Formatierung

- Code-Highlighting auf Basis von Expressive Code, mit Dateinamen-Titeln für Codeblöcke, Hervorhebung bestimmter Zeilen und diff-Ansichten.
- Native Unterstützung für 4 farbige Hinweisboxen (Note, Tip, Caution, Danger) inklusive frei wählbaren Titeln.
- Unterstützung für gängige Markdown-Erweiterungen wie GFM-Tabellen, Aufgabenlisten und Durchstreichungen; die vollständigen Regeln finden Sie unter [Renderregeln im Detail](/canvas/rendering/).

### 5. Schneller Build, kostenloses Hosting

- Statische Kompilierung auf Basis von Astro 5; das Build-Ergebnis besteht aus reinem HTML, CSS und nur wenig bedarfsgeladenem JavaScript. Der vollständige Build aller rund 180 Seiten in 10 Sprachen dauert etwa 25 Sekunden.
- Bereitstellungsbefehl für Cloudflare Pages ist vorbereitet: Mit einem einzigen Befehl veröffentlichen Sie die Dokumentation online und erhalten automatisch ein HTTPS-Zertifikat.

---

## Gesamtarchitektur des Projekts

Damit die Dokumentation leichtgewichtig und pflegeleicht bleibt, ist das System nach Verantwortlichkeiten in vier Teile gegliedert:

![Systemarchitektur von EpoCanvas Docs: Die Markdown-Inhaltsquellen werden von Astro kompiliert, mit angepassten Oberflächenkomponenten versehen und schließlich als statische Seiten erzeugt und auf Cloudflare Pages gehostet](/images/canvas/docs-architecture.svg)

*Abbildung: Systemarchitektur. Autorinnen und Autoren pflegen nur die Markdown-Inhaltsquellen; alle weiteren Schritte laufen automatisch ab.*

- **Fundament und Styles**: Basiert auf dem statischen Kern von Astro 5; die Design-Variablen werden in `src/styles/custom.css` definiert, helles und dunkles Design teilen sich dieselben Variablennamen.
- **Verwaltung der Inhaltsquellen**: Alle Dokumente liegen im Verzeichnis `src/content/docs/` und werden in reinem Markdown (`.md`) oder in MDX (`.mdx`) mit einbettbaren Komponenten geschrieben.
- **Oberflächenkomponenten**: Durch Überschreiben der Starlight-Standardkomponenten sind Kopfleiste, Seitenleiste, Inhaltsverzeichnis der Seite und das Suchfenster angepasst.
- **Auslieferung und Zugriff**: Das Build-Ergebnis liegt im Verzeichnis `dist/` und wird auf Cloudflare Pages gehostet; globale CDN-Knoten antworten aus der Nähe.

---

## Für wen geeignet

EpoCanvas Docs eignet sich für folgende Szenarien:

- **Offizielle Dokumentations-Site für Open-Source-Projekte**: Produkthandbücher, API-Referenz und Architekturbeschreibungen – alles in einem Repository;
- **Teaminternes Wissensrepository**: Rein statisch und ohne Abhängigkeit von externen Diensten, die Suche funktioniert auch im Intranet vollständig;
- **Dokumentation im Stil eines persönlichen Technik-Blogs**: Nur Markdown schreiben, sich nicht um Frontend-Engineering kümmern, mit einem Befehl veröffentlichen.

**Nicht geeignet** ist es für Szenarien mit Login-Authentifizierung, Kommentar-Interaktion oder Echtzeitdatenanzeigen – eine rein statische Site hat kein Backend; solche Anforderungen erfordern zusätzlich andere Dienste.

---

## Vergleich gängiger Dokumentationswerkzeuge

| Funktion | EpoCanvas Docs | Docusaurus | VitePress | GitBook Business |
| :--- | :--- | :--- | :--- | :--- |
| **Grundtechnologie** | Astro 5 + Starlight | React 18 | Vue 3 + Vite | Closed-Source-SaaS-Plattform |
| **Suchmechanismus** | Lokaler statischer Pagefind-Index | Abhängig vom Cloud-Dienst Algolia | Minisearch-In-Memory-Suche | Integrierte Backend-Suche |
| **Layout** | Drei Spalten (Menü links + Haupttext Mitte + Inhaltsverzeichnis rechts) | Umrüstung über Plugins erforderlich | Standardmäßig zwei/drei Spalten | Feste zwei Spalten |
| **Bereitstellung** | Direktupload zu Cloudflare Pages | S3 / Vercel / GitHub | GitHub Pages | Plattform-eigenes Hosting |
| **Eigenständigkeit** | 100 % Open Source, Quellcode vollständig in eigener Hand | 100 % Open Source | 100 % Open Source | Closed Source, viele kostenpflichtige Funktionen |

---

## Technologie-Stack und Versionen

Der tatsächlich verwendete Technologie-Stack der aktuellen Version (maßgeblich ist das Build-Ergebnis):

| Komponente | Version | Aufgabe |
| :--- | :--- | :--- |
| **Astro** | v5.18.2 | Statischer Site-Kern, zuständig für Build und Routing |
| **Starlight** | v0.32.6 | Dokumentations-Framework, liefert Layoutgerüst und Inhaltsverarbeitung |
| **Expressive Code** | mit Starlight integriert | Code-Highlighting, Titelleisten, Zeilenhervorhebung |
| **Pagefind** | integriert über `@pagefind/default-ui` 1.5.2 | Erzeugt bei der Erstellung den statischen Suchindex |
| **Wrangler** | v4.131.0 | Offizielle Cloudflare-CLI für die Bereitstellung |
| **Laufzeitumgebung** | Node.js >= 18.14.1 + pnpm >= 9 | Umgebung für lokale Entwicklung und Build |

Lesen Sie beim Aktualisieren von Abhängigkeiten bitte auch die Hinweise zu Regressionstests unter [Oberflächenkomponenten und Weiterentwicklung](/canvas/components/).

---

## Projektverzeichnisstruktur

Der Code dieses Projekts ist wie folgt organisiert; jede Aufgabe hat ein klar zugeordnetes Verzeichnis:

```text
epocanvas-docs/
├── public/                    # Verzeichnis für statische Ressourcen (Bilder, Vektor-Icons direkt hier ablegen)
│   └── images/canvas/         # Oberflächen-Screenshots und Systemarchitektur als Vektorgrafik
├── src/
│   ├── components/starlight/  # Angepasste Seitenkomponenten (Kopfleiste, Seitenleiste, Inhaltsverzeichnis, Suchfenster usw.)
│   ├── config/navigation.ts   # Konfiguration der oberen Navigationsleiste (Menüpunkte hinzufügen/entfernen: hier ändern)
│   ├── content/docs/          # Ablageort der Markdown-Dokumentdateien
│   │   ├── index.mdx          # Startseite der Dokumentations-Site
│   │   ├── canvas/            # Dokumente der einzelnen Kapitel (vereinfachtes Chinesisch, Standardsprache)
│   │   └── en/ ja/ ...        # Verzeichnisse der vollständigen Übersetzungen in den anderen 9 Sprachen
│   ├── styles/custom.css      # Globale Styles und Designfarben-Variablen
│   └── utils/i18n.ts          # Wörterbuch der Oberflächentexte und Sprachliste
├── astro.config.mjs           # Hauptkonfigurationsdatei der Site (Titel, Sprachliste, Seitenleistenverzeichnis werden hier konfiguriert)
└── package.json               # Projektabhängigkeiten und Laufzeitbefehle
```

---

## Nächste Schritte

- Möchten Sie das Projekt lokal zum Laufen bringen? Lesen Sie **[Schnellstart (in 3 Minuten starten)](/canvas/deployment/)**.
- Möchten Sie Aufbau und Nutzung der Oberfläche im Detail kennen? Lesen Sie **[Seitenlayout und Leseerlebnis](/canvas/layout/)**.
- Möchten Sie ein neues Dokument schreiben? Lesen Sie **[Markdown-Leitfaden für Text und Formatierung](/canvas/markdown/)** und **[Renderregeln im Detail](/canvas/rendering/)**.
