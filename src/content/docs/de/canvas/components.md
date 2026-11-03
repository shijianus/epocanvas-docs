---
title: UI-Komponenten & eigene Anpassungen
description: "Die Architektur der UI-Komponenten von EpoCanvas Docs: der Override-Mechanismus für Starlight-Komponenten, die Aufgaben und Datenflüsse der angepassten Komponenten sowie Hinweise zur Weiterentwicklung."
---

Die Oberfläche von **EpoCanvas Docs** erfindet das Rad nicht neu, sondern basiert auf den nativen Starlight-Komponenten und nimmt gezielte **Overrides** vor: Der Seitenrahmen und die Inhaltsverarbeitung von Starlight bleiben erhalten, während die Anzeigekomponenten für die obere Leiste, die Seitenleiste, das Inhaltsverzeichnis und die Suche ausgetauscht werden, um das gewünschte Dreispalten-Layout und die gewünschten Interaktionen zu erhalten. Diese Seite beschreibt den Aufbau dieses Komponentensystems und wie man es ändert.

---

## Der Komponenten-Override-Mechanismus

Registrieren Sie Overrides wie unten in `components` in `astro.config.mjs`; maßgeblich ist die aktuelle Konfiguration.

```javascript
// astro.config.mjs (Auszug)
components: {
  Header: './src/components/starlight/Header.astro',
  MobileMenuToggle: './src/components/starlight/MobileMenuToggle.astro',
  Sidebar: './src/components/starlight/Sidebar.astro',
  TableOfContents: './src/components/starlight/TableOfContents.astro',
  PageTitle: './src/components/starlight/PageTitle.astro',
  TwoColumnContent: './src/components/starlight/TwoColumnContent.astro',
  Search: './src/components/starlight/Search.astro',
  Pagination: './src/components/starlight/Pagination.astro',
  Footer: './src/components/starlight/Footer.astro',
  SkipLink: './src/components/starlight/SkipLink.astro',
},
```

Registrierte Overrides haben beim Build Vorrang. Nicht ersetzte Komponenten nutzen weiterhin die native Starlight-Implementierung.

---

## Aufgaben der benutzerdefinierten Overrides

Die Dateien liegen in `src/components/starlight/`; ihre Hauptaufgaben sind unten aufgeführt.

| Komponentendatei | Aufgabe |
| :--- | :--- |
| `Header.astro` | Der gesamte Inhalt der oberen Leiste: Logo, Suchfeld, Hauptnavigation, Versionsabzeichen, Sprachumschaltung, Design-Umschaltung, Zugänge zu GitHub und Telegram |
| `Search.astro` | Zweimodus-Suche: Suche innerhalb der Seite über die obere Leiste (Hervorhebung und Zähler) + `Ctrl+K`-Dialog für die Suche auf der gesamten Site (Pagefind UI) |
| `Pagination.astro` | Blätterkarten „Zurück / Weiter“ am Seitenende: schmaler Rand ohne Schatten, Titel in Themenfarbe, ↙/↘ diagonale Pfeile zeigen die Blätterrichtung an |
| `TwoColumnContent.astro` | Das Zweispalten-Gerüst aus Haupttext und Inhaltsverzeichnis rechts; steuert feste Breite und Scrollverhalten der rechten Spalte |
| `TableOfContents.astro` | Titel „Auf dieser Seite“, Symbol und Verzeichnisliste; filtert den Seitentitel selbst heraus |
| `PageTitle.astro` | Seitennavigation, große Seitenüberschrift (aus dem `title` im Frontmatter) und der Zeitstempel „Zuletzt aktualisiert“ |
| `Sidebar.astro` | Dünne Hüllkomponente: wiederverwendet die native `SidebarPersister`-Komponente von Starlight, damit die Scrollposition der Seitenleiste beim Seitenwechsel erhalten bleibt |
| `SkipLink.astro` | Zeigt bei Tastaturfokus einen Sprunglink und fokussiert den Inhaltstitel `_top` |
| `MobileMenuToggle.astro` | Schaltet die mobile Seitenleiste um, synchronisiert den Zustand und schließt per Esc mit Fokusrückgabe |
| `ThemeProvider.astro` | Inline-Skript, das vor dem Laden des CSS das gespeicherte oder System-Theme setzt und Themen-Flackern vermeidet |
| `Footer.astro` | Fußzeile: Seite bearbeiten, Problem melden, nach oben und vorherige/nächste Seite |

---

## Datenfluss: Drei Konfigurationsdateien steuern die gesamte Oberfläche

Die angepassten Komponenten enthalten selbst keine Fachdaten; der Inhalt der Oberfläche wird von drei Konfigurationsdateien gesteuert:

```text
astro.config.mjs ──→ locales + sidebar-Array ──→ Sidebar.astro rendert das linke Verzeichnis (je Sprache der passende übersetzte Eintrag)
src/config/navigation.ts ──→ navigationConfig ──→ Header.astro rendert die Hauptnavigation und die Hervorhebung (Links erhalten automatisch das Sprachpräfix)
src/utils/i18n.ts ──→ UI_TRANSLATIONS-Wörterbuch ──→ alle Komponenten lesen die Einträge zur Build-Zeit in der jeweils aktuellen Sprache
```

- **Das linke Verzeichnis** erkennt ausschließlich die `sidebar`-Deklaration in `astro.config.mjs`; neue Dokumente müssen dort registriert werden; das `translations`-Feld jedes Eintrags liefert die Menütexte in 10 Sprachen;
- **Die Hauptnavigation** holt den Anzeigetext jedes Eintrags über `labelKey` aus dem Wörterbuch in `i18n.ts`; die `match`-Funktion entscheidet, welche Schaltfläche auf der aktuellen Seite hervorgehoben wird (vor dem Abgleich wird das Sprachpräfix entfernt);
- **Die Oberflächentexte** (Platzhalter des Suchfelds, Titel „Auf dieser Seite“, Hinweise der Design-Umschaltung usw.) geben die einzelnen Komponenten zur Build-Zeit direkt über `getTranslation(key, lang)` in der jeweiligen Sprache aus; es gibt kein Laufzeit-Ersetzungsskript auf der Seite.

Das heißt: Wer den Inhalt der Oberfläche ändern will, sucht zunächst die passende Konfigurationsdatei; nur wer das Erscheinungsbild (Abstände, Farben, Symbole) ändert, muss den Quellcode der Komponenten anfassen.

---

## Zentrale Implementierungsdetails der einzelnen Komponenten

### PageTitle: Seitentitel und tatsächliches Aktualisierungsdatum

Die Seitenüberschrift stammt aus dem Frontmatter-`title`; schreiben Sie daher **keine zusätzliche Überschrift erster Ordnung mit `#` in den Haupttext**. Mit `lastUpdated: true` in `astro.config.mjs` und ohne überschreibendes Frontmatter-Datum liest der Build den Zeitpunkt des letzten Git-Commits, der diese Datei geändert hat. Es ist weder der Zeitpunkt jedes Repository-Commits noch jedes Builds; Änderungen an anderen Dateien ändern dieses Seitendatum nicht.

:::caution
Ein neues, noch nicht committetes Dokument hat keine lesbare Git-Historie und zeigt kein Datum an. Nicht committete Änderungen an einer vorhandenen Datei ändern deren Commit-Datum ebenfalls nicht. Ein Shallow-Clone (etwa `fetch-depth: 1`) kann das Datum des Grenz-Commits der abgeschnittenen Historie oder gar kein Datum liefern und ist keine vollständige Historie. Verwenden Sie für genaue Daten die vollständige Git-Historie (`fetch-depth: 0` in CI). Ein Fehler beim Lesen des Datums lässt den Build nicht fehlschlagen.
:::

### Sidebar: Wie die Merkfunktion für die Scrollposition implementiert ist

`Sidebar.astro` nutzt Starlights `SidebarPersister`, um die Scrollposition nach Seitenwechseln wiederherzustellen. `MobileMenuToggle.astro` verwaltet Zustand und Fokus des mobilen Menüs.

### TableOfContents: Erzeugung des Verzeichnisses „Auf dieser Seite“

Die Verzeichnisdaten erzeugt Starlight zur Build-Zeit aus den Überschriften im Haupttext (`##` und `###`); die Komponente filtert nur den Seitentitel selbst heraus und rendert die Liste. Die hervorhebende Scrollverfolgung übernimmt das benutzerdefinierte Element `starlight-toc` im Browser, ganz ohne Framework.

### TwoColumnContent: Die einzige Quelle für die Breite der rechten Spalte

Die Breite der Verzeichnisspalte rechts ist unter `@media (min-width: 72rem)` auf `20rem` festgelegt (auf sehr breiten Bildschirmen ab `90rem` auf `21rem`); die maximale Breite des Haupttextbereichs verringert sich entsprechend um die Breite der rechten Spalte. Wer diese Breite anpassen möchte, ändert nur diese eine Datei und überschreibt die Werte nicht verstreut in anderen Stylesheets.

### Header: Navigation, Design und Sprache

- Die Navigationsschaltflächen werden durch Iteration über `navigationConfig` gerendert; der aktive Zustand ergibt sich aus dem Rückgabewert der `match`-Funktion, und die Links erhalten über `localizedHref()` automatisch das Präfix der aktuellen Sprache;
- Die Design-Umschaltung schreibt den Schlüssel `starlight-theme` in den LocalStorage; beim Laden der Seite wird das Startdesign in der Reihenfolge „lokale Auswahl → Systemeinstellung“ bestimmt;
- Jeder Eintrag im Sprach-Dropdown ist ein echter Link zur entsprechenden Sprachversion der aktuellen Seite; ein Klick genügt, es gibt keine zusätzliche Zustandsspeicherung;
- Beide Symbole rechts in der oberen Leiste – GitHub und Telegram – stehen fest in `src/components/starlight/Header.astro`; eine Adresse ändert man also in dieser Datei. Telegram zeigt auf die Kontoseite `@epocanvas`, der Tooltip ist der Eintrag `social.telegram`. Der Eintrag `social` in `astro.config.mjs` steuert die eigene Symbolgruppe am Ende der Seitenleiste; beide beeinträchtigen sich nicht.

### Search: Zweimodus-Suche

Eine Komponente enthält zwei Suchvarianten (Details siehe [Volltextsuche und Tastenkürzel](/canvas/search-engine/)):

1. **Suche innerhalb der Seite**: das Eingabefeld in der oberen Leiste; mit der Eingabetaste springen Sie zwischen den Treffern der aktuellen Seite, die Hervorhebung wird per Skript mit Markierungen versehen;
2. **Suche auf der gesamten Site**: `<dialog>`-Fenster mit der Standard-UI von Pagefind; der Index entsteht in der Phase `pnpm run build`.

Das Seiten-Suchfeld erscheint erst ab `64rem`; darunter bleibt nur die websiteweite Suchschaltfläche. Für den aktuellen Artikel steht die Seitensuche des Browsers bereit. Bei abweichenden Screenshots gilt die aktuelle Oberfläche.

### Pagination: Blätterkarten

Die Daten für Zurück/Weiter berechnet Starlight zur Build-Zeit anhand der `sidebar`-Reihenfolge (`Astro.locals.starlightRoute.pagination`); die Komponente rendert nur: zwei gleich breite Karten, schmaler Rand ohne Schatten, Titel in Themenfarbe; die diagonalen Pfeile ↙ / ↘ verschieben sich beim Hovern in Blättrichtung. Die Pfeile sind inline SVG-Pfade; wird die Site für RTL-Sprachen eingesetzt, spiegeln sich die Richtungen automatisch.

---

## Hinweise zur Weiterentwicklung

:::caution
Wer Komponenten überschreibt, verzichtet auf die späteren Updates der nativen Starlight-Komponenten. Beim Upgrade der Starlight-Version können sich die Props und die Struktur von `Astro.locals.starlightRoute` ändern; führen Sie nach dem Upgrade für alle überschriebenen Komponenten Regressionstests durch.
:::

- **Stile zuerst über CSS-Variablen ändern**: Farben, Schriften und Layoutmaße sind zentral in den `:root`-Variablen von `src/styles/custom.css` gebündelt, siehe [Site-Konfiguration & Stil-Anpassung](/canvas/configuration/); die meisten Anpassungen erfordern keine Änderung an den Komponenten;
- **Komponenten nur bei geänderten Interaktionen anfassen**: Wenn Sie Schaltflächen ergänzen oder die Struktur ändern, holen Sie die Oberflächentexte über `getTranslation(key, lang)` und ergänzen die Einträge in `i18n.ts` für alle 10 Sprachen; für fehlende Sprachen wird Chinesisch als Fallback angezeigt;
- **Nach Änderungen unbedingt lokal prüfen**: mit `pnpm run dev` die Interaktionen kontrollieren und mit `pnpm run verify` bestätigen, dass Typen und Build durchlaufen (lokale Befehle siehe [FAQ & Fehlerbehebung](/canvas/troubleshooting/)).

Konkrete, häufige Anpassungen finden Sie direkt unter [Häufige Anpassungsrezepte](/canvas/recipes/).
