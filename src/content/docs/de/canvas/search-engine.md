---
title: Volltextsuche & Tastenkürzel
description: "Anleitung zur Suche mit zwei Modi in EpoCanvas Docs: die Suche innerhalb der Seite über die Kopfzeile und der sitewide-Suchdialog per Ctrl+K sowie der lokale statische Index-Mechanismus."
---

**EpoCanvas Docs** bietet eine Suche innerhalb der Seite und eine websiteweite Suche. Ab `64rem` Fensterbreite erscheint das Eingabefeld in der Kopfzeile; darunter bleibt nur die Schaltfläche für die websiteweite Suche. Diese nutzt einen statischen Pagefind-Index ohne Such-Backend.

---

## Wann verwendet man welche Suche?

| Situation | Welcher Modus | Bedienung |
| :--- | :--- | :--- |
| Der Text steht im **aktuellen Artikel** | Suche innerhalb der Seite | Eingabefeld ab `64rem`; auf schmalen Bildschirmen die Seitensuche des Browsers |
| Sie wissen nicht, **in welchem Artikel** der Text steht | Websiteweite Suche | Suchschaltfläche oder `Ctrl + K` (Mac: `Cmd + K`) |

---

## Suche innerhalb der Seite: das Suchfeld in der Kopfzeile

Diese Anleitung gilt ab `64rem` Fensterbreite. Geben Sie Suchbegriffe im oberen Feld ein. Darunter sind Eingabe, Zähler und Treffernavigation ausgeblendet; nur die Lupe für die websiteweite Suche bleibt. Nutzen Sie für den aktuellen Artikel die Seitensuche des Browsers.

![Beschriftete Darstellung der Suche innerhalb der Seite in der Kopfzeile: ① Eingabefeld ② Trefferzähler ③ vor/zurück-Navigation ④ Löschen ⑤ Hervorhebung auf der Seite](/images/canvas/ui-inpage-search.png)

*Abbildung: vorhandener Screenshot zur Orientierung. Zähler, Vor-/Zurück- und Löschen-Schaltflächen stehen heute unter dem Eingabefeld, nicht darin, und sind auf schmalen Bildschirmen ausgeblendet. Bei abweichender Position, Trefferzahl oder Anordnung gilt die tatsächliche Oberfläche.*

### Stichwort eingeben

Geben Sie Wörter oder Code wie `pnpm` und `astro.config.mjs` ein. Sichtbare Treffer im Haupttext werden markiert; die Seite springt zum ersten Treffer. Navigation und verborgene Inhalte sind ausgeschlossen.

### Zwischen Treffern navigieren

- Bei fokussiertem Feld <kbd>Enter</kbd> oder die Pfeil-nach-unten-Schaltfläche: nächster Treffer;
- Bei fokussiertem Feld <kbd>Shift + Enter</kbd> oder die Pfeil-nach-oben-Schaltfläche: vorheriger Treffer;
- Unter dem Feld zeigt `N/M` (etwa `3/9`) den aktuellen Treffer und die Gesamtzahl.

### Suche löschen und Seite wiederherstellen

Drücken Sie im Eingabefeld <kbd>Esc</kbd> oder klicken Sie auf `×`, um Suchtext und Markierungen zu entfernen.

---

## Suche über die gesamte Website: der Ctrl+K-Dialog

Öffnen Sie den Dialog mit <kbd>Ctrl</kbd> + <kbd>K</kbd> (Mac: <kbd>Cmd</kbd> + <kbd>K</kbd>) oder der Suchschaltfläche. Auf breiten Bildschirmen zeigt sie das Kürzel, unter `64rem` eine Lupe. Beides öffnet die websiteweite Suche, kein Seiten-Suchfeld.

![Beschriftete Darstellung des sitewide-Suchdialogs: ① Auslöser-Abzeichen ② Sucheingabefeld ③ Ergebnisliste ④ Leiste mit Tastenkürzeln](/images/canvas/ui-search-modal.png)

*Abbildung: vorhandener Screenshot von Eingabe und Ergebnissen. Weichen Schaltflächen oder Tastaturhinweise vom aktuellen Layout ab, gelten die tatsächliche Oberfläche und die Anleitung unten. Aktuell fokussiert Tab die Links; auf schmalen Bildschirmen können die Hinweise unten fehlen.*

### Stichwort eingeben

Geben Sie Wörter in der Seitensprache oder Code wie `pnpm` und `astro.config.mjs` ein. Pagefind sortiert nach Relevanz; ein Titeltreffer steht nicht garantiert an erster Stelle.

### Ergebnisliste durchsehen

Ergebnisse sind nach Dokumenten mit Titel, Textauszug und verfügbaren Abschnittstreffern angeordnet. Titel und Abschnittstreffer sind Links: Der Titel öffnet das Dokument, ein Abschnittslink folgt seinem Anker. Der Titel dient nicht zum Auf- oder Zuklappen.

### Den gesamten Ablauf per Tastatur erledigen

- <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd>: Fokus zwischen Eingaben, Schaltflächen und Ergebnislinks verschieben;
- Auf einem fokussierten Ergebnislink <kbd>Enter</kbd>: Link öffnen; Abschnittslinks folgen ihrem Anker;
- <kbd>Esc</kbd>: Dialog schließen.

Die aktuelle Pagefind-Oberfläche wählt Ergebnisse nicht mit <kbd>↑</kbd> / <kbd>↓</kbd> aus und klappt beim Klick auf einen Dokumenttitel keine Trefferpassagen auf.

---

## Warum ist die Suche so schnell?

![Vergleichsdiagramm der Suchmechanismen von EpoCanvas Docs: links die Suche innerhalb der Seite in der Kopfzeile (DOM-Durchlauf mit Hervorhebung, Live-Zähler und weiches Scrollen), rechts der sitewide-Suchdialog (per Ctrl+K aufgerufen, sekundenschnelles Matching über einen von Pagefind WASM im Speicher gehaltenen invertierten Index)](/images/canvas/docs-search-flow.svg)

*Abbildung: Vergleich der Funktionsweise beider Suchmodi. Links die schnelle Stichwortlokalisierung innerhalb der Seite über die Kopfzeile, rechts die sitewide Suche auf Basis des statischen Pagefind-WASM-Index; beide laufen vollständig lokal im Browser.*

Bei vielen Websites muss die Dokumentensuche Anfragen an eine Datenbank auf einem entfernten Server schicken; bei schlechter Netzverbindung dreht sich dann nur der Ladeindikator.

EpoCanvas Docs setzt auf eine lokale statische Suchlösung mit **Pagefind**:

1. **Index beim Build extrahieren**: Beim Ausführen von `pnpm run build` erfasst das System automatisch den Inhalt jedes Dokuments und erzeugt eine Reihe komprimierter statischer Index-Shard-Dateien.
2. **Download nach Bedarf**: Der Browser lädt Suchcode und benötigte Indexteile von dieser Website. Beim ersten Laden oder ohne Cache entstehen weiterhin Netzwerkanfragen.
3. **Suche im Browser**: Nach dem Laden des Index erfolgen Abgleich und Sortierung lokal. Auch im Intranet müssen die Suchdateien ausgeliefert werden; der erste Besuch funktioniert nicht automatisch ohne Netzwerk.

---

## Praktische Tipps für die Suche

- **Begriffe aufteilen**: Für präzisere Ergebnisse können Sie mehrere Wörter durch Leerzeichen getrennt eingeben (z. B. `Cloudflare Domain`).
- **Konkrete Begriffe verwenden**: Titel und Abschnittsnamen grenzen die Suche ein; die Reihenfolge bestimmt Pagefind anhand der Relevanz.
- **Einschränkung im Entwicklungsmodus**: Der sitewide-Index wird nur beim Build erzeugt; im Entwicklungsserver (`pnpm run dev`) lädt der `Ctrl+K`-Dialog den Index nicht, die sitewide Suche ist dort nicht benutzbar. Um die Suche zu testen, führen Sie `pnpm run build` und danach `pnpm run preview` aus. Die Suche innerhalb der Seite ist davon nicht betroffen.
